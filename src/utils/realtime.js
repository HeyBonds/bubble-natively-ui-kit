/**
 * Azure OpenAI Realtime API - React Integration
 * Complete state machine implementation for couples coaching flow
 *
 * Ported from bubble-realtime.js:
 * - window.RT replaced with module-scoped RT object
 * - Bubble bridge emit replaced with listener-based event system
 * - WaveformComponent references removed (React handles waveform state)
 * - ES module exports instead of window globals
 *
 * PUSH-TO-TALK MODE:
 * - VAD (Voice Activity Detection) is disabled via session.update after connection
 *   (turn_detection.type: "none" is sent when data channel opens)
 * - User must press/hold button to speak (controlled by React UI)
 * - Call RT.startPushToTalk() when button pressed
 * - Call RT.stopPushToTalk() when button released
 * - Mic is only enabled during push-to-talk activation
 *
 * Stages:
 * - Stage 1: Intake (Coach voice "echo")
 * - Stage 2: Simulation (Partner voice "marin")
 * - Stage 3: Evaluation (Silent JSON) -> ends session after evaluation JSON
 */

const RT = {};

// ============================================================================
// CONSTANTS
// ============================================================================

const EVENT_TYPES = {
  OUTPUT_AUDIO_STARTED: "output_audio_buffer.started",
  OUTPUT_AUDIO_STOPPED: "output_audio_buffer.stopped",
  RESPONSE_DONE: "response.done",
  RESPONSE_CANCEL: "response.cancel",
  OUTPUT_AUDIO_TRANSCRIPT_DELTA: "response.output_audio_transcript.delta",
  OUTPUT_AUDIO_TRANSCRIPT_DONE: "response.output_audio_transcript.done",
  OUTPUT_TEXT_DELTA: "response.output_text.delta",
  OUTPUT_TEXT_DONE: "response.output_text.done",
  INPUT_AUDIO_TRANSCRIPTION_COMPLETED:
    "conversation.item.input_audio_transcription.completed",
  CONVERSATION_ITEM_ADDED: "conversation.item.added",
  SESSION_UPDATED: "session.updated",
  SESSION_UPDATE_DONE: "session.update.done",
};

const JSON_TYPES = {
  ISSUE: "issue",
  EVALUATION: "evaluation",
};

const VALID_STAGES = [1, 2];

// ============================================================================
// CONFIGURATION
// ============================================================================

RT.config = {
  AZURE_RESOURCE: "daphn-m8o8ki4f-eastus2",
  WEBRTC_URL: null,
  API_KEY: null,
  CLIENT_SECRETS_URL: null,
  TRANSCRIPTION_MODEL: "whisper-1",

  // Voice settings
  VOICE_STAGE1: "echo",
  VOICE_STAGE2: "marin",

  // VAD settings
  VAD_THRESHOLD: 0.5,
  VAD_PREFIX_PADDING_MS: 300,
  VAD_SILENCE_DURATION_MS: 1200,
  VAD_CREATE_RESPONSE: true,

  // Trigger phrase
  TRIGGER_PHRASE: "ok, beginning simulation",

  // Timeouts
  TIMEOUT_FIRST_RESPONSE: 1000,
  STAGE4_CLOSE_TIMEOUT: 2000,

  // User name
  USER_NAME: "User",

  // Instruction templates (set before session starts)
  // Placeholders: [USERNAME], [ISSUE], [CONVERSATION_HISTORY]
  ISSUE_JSON_INSTRUCTIONS_TEMPLATE: null,
  EVALUATION_JSON_INSTRUCTIONS_TEMPLATE: null,
};

// ============================================================================
// STATE VARIABLES
// ============================================================================

RT.state = {
  // Connection
  connection: {
    pc: null,
    dc: null,
    micStream: null,
    micTracks: [],
    audioEl: null,
    connNum: 1,
  },

  // Conversation
  conversation: {
    messages: [],
    assistantLines: [],
    currentAssistantLine: "",
    userLines: [],
  },

  // Stages
  stages: {
    current: null,
    simulation: {
      mode: false,
      triggered: false,
      partnerTurnCount: 0,
      userTurnCount: 0,
      startIndex: -1,
    },
  },

  // JSON requests
  json: {
    waiting: false,
    buffer: "",
    type: null,
    evaluationData: null,
  },

  // Other
  assistantSpeaking: false,
  evaluationRequested: false,
  currentIssue: "",
  currentIssueData: null, // Store full issue JSON data for retry

  // Push-to-talk
  pushToTalk: {
    isActive: false,
    canActivate: false,
  },

  // Cleanup guard
  cleaningUp: false,
};

// ============================================================================
// EVENT EMITTER (listener-based, replaces Bubble bridge)
// ============================================================================

const _listeners = new Set();

RT.emit = function (type, data) {
  const evt = { type, ts: Date.now(), data: data || {} };
  _listeners.forEach(fn => {
    try { fn(evt); } catch (e) { console.error('[RT] Listener error:', e); }
  });
};

export function onRTEvent(callback) {
  _listeners.add(callback);
}

export function offRTEvent(callback) {
  _listeners.delete(callback);
}

RT.emitWarning = function (message, code) {
  RT.emit("warning", {
    message: message,
    code: code || "WARNING",
  });
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function ts() {
  return new Date().toLocaleTimeString();
}

function safeSend(message) {
  const state = RT.state;
  if (!state.connection.dc) {
    RT.emit("error", {
      message: "Data channel is null",
      code: "DATA_CHANNEL_NULL",
    });
    return false;
  }
  if (state.connection.dc.readyState !== "open") {
    RT.emit("error", {
      message: `Data channel state is '${state.connection.dc.readyState}' (expected 'open')`,
      code: "DATA_CHANNEL_NOT_READY",
    });
    // Data channel error is fatal - stop the session
    stopSession("error");
    return false;
  }
  try {
    const messageStr =
      typeof message === "string" ? message : JSON.stringify(message);
    state.connection.dc.send(messageStr);
    return true;
  } catch (e) {
    RT.emit("error", {
      message: e.message,
      code: "DATA_CHANNEL_SEND_ERROR",
    });
    // Send error is fatal - stop the session
    stopSession("error");
    return false;
  }
}

function getState() {
  return RT.state;
}

function getConfig() {
  return RT.config;
}

/**
 * Compute display turn counts for events
 * Returns counts that indicate "whose turn it is NOW" (current/upcoming turn)
 *
 * NOTE: There's a timing dependency - when PARTNER_SPEAKING fires, userTurnCount
 * may not be incremented yet if user transcription hasn't arrived. This is acceptable
 * as it's a brief window, and the next event (PUSH_TO_TALK_READY) will have correct counts.
 *
 * @param {string} eventType - "PARTNER_SPEAKING" or "PUSH_TO_TALK_READY"
 * @returns {Object} {partnerTurnCount: number, userTurnCount: number}
 */
function getDisplayTurnCounts(eventType) {
  const state = getState();
  const sim = state.stages.simulation;

  if (eventType === "PARTNER_SPEAKING") {
    // Partner is starting to speak
    // Show: partner's current turn (partnerTurnCount + 1), user's completed turns
    return {
      partnerTurnCount: sim.partnerTurnCount + 1, // Partner's current turn
      userTurnCount: sim.userTurnCount, // User's completed turns (may lag by 1 if transcription delayed)
    };
  } else if (eventType === "PUSH_TO_TALK_READY") {
    // User is about to speak (partner just finished)
    // Show: partner's completed turns, user's upcoming turn
    return {
      partnerTurnCount: sim.partnerTurnCount, // Partner's completed turns
      userTurnCount: sim.userTurnCount + 1, // User's upcoming turn
    };
  }

  // Fallback
  return {
    partnerTurnCount: sim.partnerTurnCount,
    userTurnCount: sim.userTurnCount,
  };
}

// Helper: robust detection of "OK, beginning simulation" variants
// We avoid brittle exact string matches and instead look for:
// - some form of "ok"/"okay"
// - some form of "begin"/"beginning"/"begining"
// - the word "simulation"
function isSimulationTriggerPhrase(text) {
  if (!text) return false;
  const norm = text.toLowerCase();

  // Must mention simulation
  if (!norm.includes("simulation")) return false;

  // Some flavor of "ok" / "okay"
  const hasOk =
    norm.includes("ok,") || norm.includes("ok ") || norm.includes("okay");

  if (!hasOk) return false;

  // Any "begin"/"beginning"/"begining" fragment
  if (!norm.includes("begin")) return false;

  return true;
}

// ============================================================================
// CONFIGURATION SETTERS
// ============================================================================

RT.setApiKey = function (apiKey) {
  if (!apiKey) {
    RT.emit("error", {
      message: "API key cannot be empty",
    });
    return;
  }
  RT.config.API_KEY = apiKey;
};

RT.setClientSecretsUrl = function (url) {
  if (!url) {
    RT.emit("error", {
      message: "Client secrets URL cannot be empty",
    });
    return;
  }
  RT.config.CLIENT_SECRETS_URL = url;
};

RT.setUserName = function (name) {
  RT.config.USER_NAME = name || "User";
};

RT.setTriggerPhrase = function (phrase) {
  RT.config.TRIGGER_PHRASE = phrase || "ok, beginning simulation";
};

RT.setVoice = function (stage, voice) {
  if (!VALID_STAGES.includes(stage)) {
    RT.emit("error", {
      message: `Invalid stage: ${stage}. Valid stages: ${VALID_STAGES.join(
        ", "
      )}`,
    });
    return;
  }
  if (!voice) {
    RT.emit("error", {
      message: "Voice cannot be empty",
    });
    return;
  }
  if (stage === 1) RT.config.VOICE_STAGE1 = voice;
  else if (stage === 2) RT.config.VOICE_STAGE2 = voice;
};

RT.setVadConfig = function (config) {
  if (config.threshold !== undefined) {
    if (config.threshold < 0 || config.threshold > 1) {
      RT.emit("error", {
        message: "VAD threshold must be between 0 and 1",
      });
      return;
    }
    RT.config.VAD_THRESHOLD = config.threshold;
  }
  if (config.prefixPaddingMs !== undefined)
    RT.config.VAD_PREFIX_PADDING_MS = config.prefixPaddingMs;
  if (config.silenceDurationMs !== undefined)
    RT.config.VAD_SILENCE_DURATION_MS = config.silenceDurationMs;
  if (config.createResponse !== undefined)
    RT.config.VAD_CREATE_RESPONSE = config.createResponse;
};

// ============================================================================
// INSTRUCTIONS
// ============================================================================

function getInstructionsFromBubble(type, context) {
  // Templates provided before session starts, replace placeholders at runtime
  const config = getConfig();

  if (type === "issue_json") {
    // Template, replace [USERNAME] with config.USER_NAME
    if (config.ISSUE_JSON_INSTRUCTIONS_TEMPLATE) {
      return config.ISSUE_JSON_INSTRUCTIONS_TEMPLATE.replace(
        /\[USERNAME\]/g,
        config.USER_NAME
      );
    }
    RT.emit("error", {
      message: "ISSUE_JSON_INSTRUCTIONS_TEMPLATE not set",
    });
    return null;
  }

  if (type === "evaluation_json") {
    // Template, replace [ISSUE], append conversation history
    if (config.EVALUATION_JSON_INSTRUCTIONS_TEMPLATE) {
      let instructions = config.EVALUATION_JSON_INSTRUCTIONS_TEMPLATE.replace(
        /\[ISSUE\]/g,
        context.issue || "the main conflict in the relationship"
      );
      instructions += "\n\n" + (context.conversationHistory || "");
      return instructions;
    }
    RT.emit("error", {
      message: "EVALUATION_JSON_INSTRUCTIONS_TEMPLATE not set",
    });
    return null;
  }

  RT.emit("error", {
    message: `Unknown instruction type: ${type}`,
  });
  return null;
}

// ============================================================================
// CONVERSATION FORMATTING
// ============================================================================

function formatStage2Conversation() {
  const state = getState();
  const startIdx =
    state.stages.simulation.startIndex >= 0
      ? state.stages.simulation.startIndex
      : 0;
  const stage2Messages = state.conversation.messages.slice(startIdx);

  return stage2Messages
    .map((msg) => {
      const role = msg.type === "user" ? "User" : "Assistant";
      return `${role}: ${msg.text}`;
    })
    .join("\n");
}

// ============================================================================
// VAD MANAGEMENT
// ============================================================================

function handleSessionUpdated(_evt) {
  // Session update confirmation (VAD is disabled from start, no need to verify)
  // This handler is kept for potential future use or debugging
}

// ============================================================================
// ASSISTANT CONTROL
// ============================================================================

function setMicEnabled(on) {
  const state = getState();
  if (!state.connection.micTracks) {
    return;
  }
  state.connection.micTracks.forEach((t) => {
    t.enabled = on;
  });
}

// ============================================================================
// PUSH-TO-TALK FUNCTIONS
// ============================================================================

RT.startPushToTalk = function () {
  const state = getState();

  // Prevent starting if already active
  if (state.pushToTalk.isActive) {
    return false;
  }

  // Check if push-to-talk can be activated
  if (!state.pushToTalk.canActivate) {
    RT.emitWarning(
      "Push-to-talk is not available at this time",
      "PUSH_TO_TALK_NOT_AVAILABLE"
    );
    return false;
  }

  // Check if assistant is speaking
  if (state.assistantSpeaking) {
    RT.emitWarning(
      "Cannot start push-to-talk while assistant is speaking",
      "ASSISTANT_SPEAKING"
    );
    return false;
  }

  // Check if data channel is ready
  if (!state.connection.dc || state.connection.dc.readyState !== "open") {
    RT.emit("error", {
      message: "Data channel is not ready",
      code: "DATA_CHANNEL_NOT_READY",
    });
    // Data channel error is fatal - stop the session
    stopSession("error");
    return false;
  }

  // Enable mic
  setMicEnabled(true);
  state.pushToTalk.isActive = true;

  RT.emit("state", { state: "PUSH_TO_TALK_ACTIVE" });

  // Show "..." placeholder in transcript (matches original WaveformComponent.updateText("user", "...", false))
  RT.emit("user_speaking", { text: "..." });

  return true;
};

RT.stopPushToTalk = function () {
  const state = getState();

  if (!state.pushToTalk.isActive) {
    return false;
  }

  // Set inactive FIRST to prevent race conditions
  state.pushToTalk.isActive = false;

  // Disable mic
  setMicEnabled(false);

  // With turn_detection: null, we must manually commit the audio buffer
  // and then trigger response creation
  if (state.connection.dc && state.connection.dc.readyState === "open") {
    // First, commit the audio buffer to process the recorded audio
    safeSend({ type: "input_audio_buffer.commit" });

    // In Stage 2, increment userTurnCount when user finishes speaking
    if (state.stages.simulation.mode && !state.evaluationRequested) {
      state.stages.simulation.userTurnCount++;

      // After user's 2nd turn, don't allow partner to respond
      if (state.stages.simulation.userTurnCount === 2) {
        state.evaluationRequested = true;
        if (state.connection.audioEl && !state.connection.audioEl.muted) {
          state.connection.audioEl.muted = true;
        }
        RT.emit("state", { state: "PUSH_TO_TALK_STOPPED" });
        // Don't send response.create - evaluation will be requested when transcript arrives
        setTimeout(() => {
          requestEvaluationJson();
        }, 100);
      } else {
        // Then, trigger response creation
        safeSend({ type: "response.create" });
        RT.emit("state", { state: "PUSH_TO_TALK_STOPPED" });
      }
    } else {
      // Then, trigger response creation
      safeSend({ type: "response.create" });
      RT.emit("state", { state: "PUSH_TO_TALK_STOPPED" });
    }
  } else {
    RT.emit("error", {
      message: "Cannot send audio commit/response: data channel not ready",
      code: "DATA_CHANNEL_NOT_READY",
    });
    // Data channel error is fatal - stop the session
    stopSession("error");
  }

  return true;
};

function interruptAssistant() {
  const state = getState();
  if (state.assistantSpeaking) {
    safeSend({ type: EVENT_TYPES.RESPONSE_CANCEL });
    safeSend({ type: "output_audio_buffer.clear" });
  }
  if (state.connection.audioEl && !state.connection.audioEl.paused) {
    state.connection.audioEl.pause();
    state.connection.audioEl.currentTime = 0;
  }
}

// ============================================================================
// STAGE TRANSITIONS
// ============================================================================

function requestSilentSimulationJson() {
  const state = getState();

  if (!state.connection.dc || state.connection.dc.readyState !== "open") {
    RT.emit("error", {
      message: "Cannot request issue JSON: data channel not ready",
      code: "DATA_CHANNEL_NOT_READY",
    });
    // Data channel error is fatal - stop the session
    stopSession("error");
    return;
  }

  state.json.waiting = true;
  state.json.buffer = "";
  state.json.type = JSON_TYPES.ISSUE;

  // Emit loading state
  RT.emit("state", { state: "LOADING_SIMULATION" });

  setTimeout(() => {
    if (state.connection.audioEl) {
      state.connection.audioEl.muted = true;
    }
  }, 100);

  // Get instructions: template, replace [USERNAME] with config.USER_NAME
  const instructions = getInstructionsFromBubble("issue_json", {});

  if (!instructions) {
    RT.emit("error", {
      message: "Failed to get issue JSON instructions",
    });
    state.json.waiting = false;
    state.json.type = null;
    return;
  }

  safeSend({
    type: "response.create",
    response: {
      conversation: "none",
      output_modalities: ["text"],
      instructions: instructions,
    },
  });
}

function requestEvaluationJson() {
  const state = getState();

  if (!state.connection.dc || state.connection.dc.readyState !== "open") {
    RT.emit("error", {
      message: "Cannot request evaluation JSON: data channel not ready",
      code: "DATA_CHANNEL_NOT_READY",
    });
    // Data channel error is fatal - stop the session
    stopSession("error");
    return;
  }

  if (state.connection.audioEl && !state.connection.audioEl.muted) {
    state.connection.audioEl.muted = true;
  }

  state.json.waiting = true;
  state.json.buffer = "";
  state.json.type = JSON_TYPES.EVALUATION;

  // Get instructions (synchronous call to pre-defined function)
  const stage2Conversation = formatStage2Conversation();
  const instructions = getInstructionsFromBubble("evaluation_json", {
    issue: state.currentIssue,
    conversationHistory: stage2Conversation,
  });

  if (!instructions) {
    RT.emit("error", {
      message: "Failed to get evaluation JSON instructions",
    });
    state.json.waiting = false;
    state.json.type = null;
    return;
  }

  safeSend({
    type: "response.create",
    response: {
      conversation: "none",
      output_modalities: ["text"],
      instructions: instructions,
    },
  });
}

async function startPartnerSimulation(data) {
  const state = getState();
  const config = getConfig();

  state.currentIssue = data.issue || state.currentIssue;
  state.stages.simulation.mode = true;
  state.stages.simulation.partnerTurnCount = 0;
  state.stages.simulation.userTurnCount = 0;
  state.stages.simulation.startIndex = state.conversation.messages.length;
  await stopSession("transition");

  const userName = config.USER_NAME;
  // Format JSON context as string
  const jsonContext = JSON.stringify(data, null, 2);

  RT.emit("stage2_token_needed", {
    voice: config.VOICE_STAGE2,
    userName: userName,
    issue: state.currentIssue,
    jsonContext: jsonContext, // Formatted JSON string for [JSON_CONTEXT] replacement
  });
}

/**
 * Retry simulation from Stage 2 after SESSION_COMPLETED
 * This restarts the simulation phase using the same issue data from the previous run
 */
async function retrySimulation() {
  const state = getState();
  const config = getConfig();

  // Check if we have issue data to retry with
  if (!state.currentIssueData && !state.currentIssue) {
    RT.emit("error", {
      message:
        "Cannot retry simulation: no issue data available. Start from Stage 1 first.",
    });
    return false;
  }

  // Clear evaluation data and JSON states
  state.json.evaluationData = null;
  state.json.waiting = false;
  state.json.buffer = "";
  state.json.type = null;
  state.evaluationRequested = false;

  // Reset simulation state
  state.stages.simulation.mode = true;
  state.stages.simulation.triggered = false;
  state.stages.simulation.partnerTurnCount = 0;
  state.stages.simulation.userTurnCount = 0;
  state.stages.simulation.startIndex = 0; // Start fresh, conversation will be cleared

  // Clear conversation history for fresh simulation
  state.conversation.messages = [];
  state.conversation.assistantLines = [];
  state.conversation.currentAssistantLine = "";
  state.conversation.userLines = [];

  // Reset assistant and push-to-talk states
  state.assistantSpeaking = false;
  state.pushToTalk.isActive = false;
  state.pushToTalk.canActivate = false;

  // Stop current session if running
  await stopSession("transition");

  // Reconstruct issue data - use stored full data if available, otherwise create minimal object
  const issueData = state.currentIssueData || { issue: state.currentIssue };
  const userName = config.USER_NAME;
  const jsonContext = JSON.stringify(issueData, null, 2);

  RT.emit("stage2_token_needed", {
    voice: config.VOICE_STAGE2,
    userName: userName,
    issue: state.currentIssue,
    jsonContext: jsonContext, // Formatted JSON string for [JSON_CONTEXT] replacement
  });

  return true;
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function handleStreamingDelta(evt) {
  const state = getState();
  const chunk = evt.delta || evt.transcript || "";

  // If waiting for JSON, only process text deltas (not audio transcript deltas)
  if (state.json.waiting) {
    if (
      evt.type === EVENT_TYPES.OUTPUT_TEXT_DELTA ||
      evt.type === "response.text.delta" ||
      evt.type === "response.output_text.delta"
    ) {
      state.json.buffer += chunk;
    }
    // Ignore audio transcript deltas when waiting for JSON
    return;
  }

  state.conversation.currentAssistantLine += chunk;

  // Emit streaming delta so UI can show text as it arrives
  const deltaType = state.stages.simulation.mode ? "partner_text_delta" : "coach_text_delta";
  RT.emit(deltaType, { text: state.conversation.currentAssistantLine, isFinal: false, durationMs: evt.duration_ms });

  if (
    !state.json.waiting &&
    !state.stages.simulation.triggered &&
    isSimulationTriggerPhrase(state.conversation.currentAssistantLine)
  ) {
    state.stages.simulation.triggered = true;
  }
}

function handleFinalText(evt) {
  const state = getState();

  // If waiting for JSON, only process TEXT done events (not audio transcript done)
  // CRITICAL: If we're in Stage 4, NEVER parse as JSON (even if json.waiting is true)
  // This prevents Stage 4 coach feedback from being parsed as JSON
  if (state.json.waiting) {
    if (
      evt.type === EVENT_TYPES.OUTPUT_TEXT_DONE ||
      evt.type === "response.text.done" ||
      evt.type === "response.output_text.done"
    ) {
      const finalText = evt.text || state.json.buffer || "";
      state.json.waiting = false;
      state.json.buffer = "";

      if (state.connection.audioEl) {
        state.connection.audioEl.muted = false;
      }

      try {
        // Extract JSON from markdown code blocks if present
        let jsonText = finalText.trim();
        const jsonMatch =
          jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
          jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[1] || jsonMatch[0];
        }

        const data = JSON.parse(jsonText);

        if (state.json.type === JSON_TYPES.ISSUE) {
          state.currentIssue = data.issue || state.currentIssue;
          state.currentIssueData = data; // Store full issue data for retry
          startPartnerSimulation(data);
        } else if (state.json.type === JSON_TYPES.EVALUATION) {
          state.json.evaluationData = data;
          RT.emit("evaluation_json_received", {
            evaluationJson: data,
          });
          setTimeout(() => {
            RT.emit("state", { state: "SESSION_COMPLETED" });
            stopSession("completed");
          }, 500);
        }
      } catch {
        // Ignore JSON parse errors here to avoid noisy console
      }

      state.json.type = null;
      state.conversation.currentAssistantLine = "";
      return;
    }
    // Ignore audio transcript done events when waiting for JSON
    return;
  }

  const finalText =
    evt.text || evt.transcript || state.conversation.currentAssistantLine || "";
  if (!finalText) return;

  if (
    !state.json.waiting &&
    !state.stages.simulation.triggered &&
    isSimulationTriggerPhrase(finalText)
  ) {
    state.stages.simulation.triggered = true;
    return;
  }

  if (state.stages.simulation.mode && !state.evaluationRequested) {
    if (state.stages.simulation.userTurnCount >= 2) {
      RT.emit("state", {
        state: "PARTNER_RESPONSE_BLOCKED",
        reason: "user_has_2_turns",
      });
      interruptAssistant();
      state.conversation.currentAssistantLine = "";
      return;
    }

    state.stages.simulation.partnerTurnCount++;

    // When partner finishes turn 2, user must have completed turn 1
    if (
      state.stages.simulation.partnerTurnCount === 2 &&
      state.stages.simulation.userTurnCount === 0
    ) {
      state.stages.simulation.userTurnCount = 1;
    }
  }

  state.conversation.assistantLines.push(
    "[" + ts() + "] Assistant: " + finalText
  );
  state.conversation.currentAssistantLine = "";

  state.conversation.messages.push({
    type: "assistant",
    text: finalText,
    timestamp: ts(),
  });

  // Emit partner_text in Stage 2 (simulation mode), coach_text otherwise
  if (state.stages.simulation.mode) {
    RT.emit("partner_text", { text: finalText });
  } else {
    RT.emit("coach_text", { text: finalText });
  }
}

function handleUserTranscription(evt) {
  const state = getState();
  const text = evt.transcript || "";
  if (!text) return;

  // Whisper Hallucination Filter: Ignore low-value/repetitive noise-based transcripts
  const lowerText = text.toLowerCase().trim();
  const hallucinations = ["you.", "you", "you you", "you you you", "thank you.", "thank you"];
  if (hallucinations.includes(lowerText)) {
    console.warn("[RT] Filtered potential STT hallucination:", text);
    return;
  }

  state.conversation.userLines.push("[" + ts() + "] User: " + text);

  state.conversation.messages.push({
    type: "user",
    text: text,
    timestamp: ts(),
  });

  RT.emit("user_transcript", { text });

  // Transcription is just for getting the text - turn counting happens in stopPushToTalk
  // Note: Don't emit intermediate state here because handleUserTranscription
  // can fire AFTER partner has already started speaking, creating confusing event order.
  // The correct counts will be emitted in handleAudioStopped when partner finishes.
}

function handleAudioStarted(_evt) {
  const state = getState();

  if (
    state.stages.simulation.mode &&
    !state.evaluationRequested &&
    (state.stages.simulation.userTurnCount >= 2 ||
      state.stages.simulation.partnerTurnCount >= 2) // Partner has completed 2 turns, no more partner responses allowed
  ) {
    if (state.connection.audioEl && !state.connection.audioEl.muted) {
      state.connection.audioEl.muted = true;
    }
    interruptAssistant();
    return;
  }

  state.assistantSpeaking = true;

  // Mic should already be disabled (user released push-to-talk button which called stopPushToTalk())
  // No need to call stopPushToTalk() here - it was already called when user released the button
  setMicEnabled(false);

  if (state.stages.simulation.mode) {
    // Only emit PARTNER_SPEAKING if partner is actually allowed to speak
    // Don't show preview count if evaluation is already requested
    if (!state.evaluationRequested) {
      const counts = getDisplayTurnCounts("PARTNER_SPEAKING");
      RT.emit("state", {
        state: "PARTNER_SPEAKING",
        partnerTurnCount: counts.partnerTurnCount,
        userTurnCount: counts.userTurnCount,
      });
    }
  } else {
    RT.emit("state", { state: "COACH_SPEAKING" });
  }
}

function handleAudioStopped(evt) {
  const state = getState();

  state.assistantSpeaking = false;

  if (
    state.stages.simulation.mode &&
    !state.evaluationRequested &&
    state.stages.simulation.partnerTurnCount === 2 &&
    state.stages.simulation.userTurnCount === 1 &&
    evt.type === EVENT_TYPES.RESPONSE_DONE
  ) {
    setTimeout(() => {
      if (state.connection.audioEl && !state.connection.audioEl.muted) {
        state.connection.audioEl.muted = true;
      }
    }, 500);
  }

  // CRITICAL: Once user has completed 2 turns in Stage 2, push-to-talk should NEVER be enabled again
  // This covers: Stage 3 (evaluation JSON), Stage 4 (coach feedback), and any transition periods
  const userCompleted2Turns = state.stages.simulation.userTurnCount >= 2;

  // Determine if push-to-talk should be available (not auto-enabled, just available)
  if (
    (state.json.waiting && state.json.type === JSON_TYPES.EVALUATION) ||
    (state.stages.simulation.mode && userCompleted2Turns) ||
    userCompleted2Turns || // Keep push-to-talk disabled if user completed 2 turns, regardless of mode
    // Also block between Stage 1 -> 2 transition once trigger phrase fired;
    // we immediately go into LOADING_SIMULATION and don't want another user turn.
    (state.stages.simulation.triggered && !state.stages.simulation.mode)
  ) {
    // Push-to-talk not available
    state.pushToTalk.canActivate = false;
  } else if (!state.json.waiting || state.json.type !== JSON_TYPES.EVALUATION) {
    // Push-to-talk is available (but not automatically enabled)
    state.pushToTalk.canActivate = true;

    // In simulation mode, include turn counts in PUSH_TO_TALK_READY event
    if (state.stages.simulation.mode && !state.evaluationRequested) {
      const counts = getDisplayTurnCounts("PUSH_TO_TALK_READY");
      RT.emit("state", {
        state: "PUSH_TO_TALK_READY",
        partnerTurnCount: counts.partnerTurnCount,
        userTurnCount: counts.userTurnCount,
      });
    } else {
      RT.emit("state", { state: "PUSH_TO_TALK_READY" });
    }
  }

  if (
    state.stages.simulation.triggered &&
    !state.json.waiting &&
    !state.stages.simulation.mode
  ) {
    requestSilentSimulationJson();
    // After calling requestSilentSimulationJson(), state.json.waiting is now true
    // Don't emit PUSH_TO_TALK_READY - we're waiting for silent JSON
    return;
  }

  if (state.stages.simulation.mode) {
    // USER_SPEAKING is emitted when transcription completes
  } else if (state.json.waiting) {
    // Waiting for silent JSON - LOADING_SIMULATION already emitted
  }
  // Note: PUSH_TO_TALK_READY is emitted above when push-to-talk becomes available
  // No need for WAITING_USER_INPUT - PUSH_TO_TALK_READY is the actionable event
}

function handleError(evt) {
  RT.emit("error", {
    message: "SERVER_ERROR",
    code: "SERVER_ERROR",
    raw: evt,
  });
  // Server error during active session is fatal - stop the session
  stopSession("error");
}

// Event dispatcher
const EVENT_HANDLERS = {
  [EVENT_TYPES.OUTPUT_AUDIO_STARTED]: handleAudioStarted,
  [EVENT_TYPES.OUTPUT_AUDIO_STOPPED]: handleAudioStopped,
  [EVENT_TYPES.RESPONSE_DONE]: handleAudioStopped,
  [EVENT_TYPES.OUTPUT_AUDIO_TRANSCRIPT_DELTA]: handleStreamingDelta,
  ["response.audio_transcript.delta"]: handleStreamingDelta,
  [EVENT_TYPES.OUTPUT_TEXT_DELTA]: handleStreamingDelta,
  ["response.text.delta"]: handleStreamingDelta,
  ["response.output_text.delta"]: handleStreamingDelta,
  [EVENT_TYPES.OUTPUT_AUDIO_TRANSCRIPT_DONE]: handleFinalText,
  ["response.audio_transcript.done"]: handleFinalText,
  [EVENT_TYPES.OUTPUT_TEXT_DONE]: handleFinalText,
  ["response.text.done"]: handleFinalText,
  ["response.output_text.done"]: handleFinalText,
  [EVENT_TYPES.INPUT_AUDIO_TRANSCRIPTION_COMPLETED]: handleUserTranscription,
  [EVENT_TYPES.SESSION_UPDATED]: handleSessionUpdated,
  [EVENT_TYPES.SESSION_UPDATE_DONE]: handleSessionUpdated,
  error: handleError,
  "error.occurred": handleError,
};

function handleDataChannelMessage(e) {
  const state = getState();
  if (!state.connection.dc || state.connection.dc.readyState !== "open") {
    return;
  }

  try {
    const evt = JSON.parse(e.data);

    const handler = EVENT_HANDLERS[evt.type];
    if (handler) {
      handler(evt);
    }
  } catch (err) {
    if (err instanceof SyntaxError) {
      RT.emit("error", {
        message: `JSON parse error: ${err.message}`,
        code: "JSON_PARSE_ERROR",
      });
    } else {
      RT.emit("error", {
        message: `Error parsing event: ${err.message}`,
        code: "EVENT_PARSE_ERROR",
      });
    }
    // Parse errors during active session indicate communication breakdown - stop the session
    stopSession("error");
  }
}

// ============================================================================
// WEBRTC SESSION MANAGEMENT
// ============================================================================

function createAudioElement() {
  // Always remove any existing audio element first to ensure clean state (Android WebView decoder persistence issue)
  const existingEl = document.getElementById("rtAudio");
  if (existingEl) {
    try {
      if (existingEl.srcObject) {
        const stream = existingEl.srcObject;
        if (stream && typeof stream.getTracks === "function") {
          stream.getTracks().forEach((track) => {
            try {
              track.stop();
            } catch {
              // Ignore errors
            }
          });
        }
        existingEl.srcObject = null;
      }
      existingEl.pause();
      existingEl.load();
      if (existingEl.parentNode) {
        existingEl.remove();
      }
    } catch {
      // Ignore errors
    }
  }

  // Always create a fresh audio element
  const audioEl = document.createElement("audio");
  audioEl.id = "rtAudio";
  audioEl.autoplay = true;
  // CRITICAL for mobile: playsinline and muted=false helps with volume routing and autoplay
  audioEl.setAttribute("playsinline", "true");
  audioEl.setAttribute("webkit-playsinline", "true");
  // Ensure audio element starts in clean state
  audioEl.muted = false;
  audioEl.volume = 1.0;
  audioEl.currentTime = 0;
  document.body.appendChild(audioEl);

  return audioEl;
}



/**
 * Setup microphone stream with validation and monitoring
 * - Always creates fresh microphone stream for each session
 * - This avoids Android WebView issue where tracks from previous session
 *   aren't fully released by OS, causing subsequent sessions to fail
 * - Sets up event listeners to detect permission revocation mid-session
 */
async function setupMicrophone() {
  const state = getState();

  // HARD CLEANUP: Explicitly stop all tracks and nullify stream from any previous instance
  if (state.connection.micStream || (state.connection.micTracks && state.connection.micTracks.length > 0)) {
    try {
      const tracksToStop = state.connection.micTracks || (state.connection.micStream ? state.connection.micStream.getTracks() : []);
      tracksToStop.forEach((track) => {
        try {
          track.onended = null;
          track.onmute = null;
          track.onunmute = null;
          track.stop();
        } catch {
          // Ignore
        }
      });
    } catch {
      // Ignore
    }
    state.connection.micStream = null;
    state.connection.micTracks = [];
  }

  // Proactive Permission Check (where supported)
  if (navigator.permissions && navigator.permissions.query) {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
      if (permissionStatus.state === 'denied') {
        const error = new Error("Microphone permission denied");
        error.name = "NotAllowedError";
        throw error;
      }
    } catch {
      // Ignore errors from Permissions API and fall through to getUserMedia
    }
  }

  // Create new microphone stream
  try {
    state.connection.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });


    state.connection.micTracks = state.connection.micStream.getTracks();

    // Validate we got tracks
    if (
      !state.connection.micTracks ||
      state.connection.micTracks.length === 0
    ) {
      throw new Error("No audio tracks returned from getUserMedia");
    }

    // Set up track event handlers (permission revocation detection)
    state.connection.micTracks.forEach((track) => {
      // Handle track ending (permission revoked, device disconnected, etc.)
      track.onended = () => {
        const currentState = getState();
        if (currentState.cleaningUp) {
          return;
        }
        if (currentState.assistantSpeaking) {
          interruptAssistant();
        }
        RT.emit("error", {
          message: "MICROPHONE_TRACK_ENDED",
          code: "TRACK_ENDED",
          userMessage: "Microphone access was revoked or disconnected. Please check your microphone permissions.",
        });
        stopSession("error");
      };
    });

    return state.connection.micStream;
  } catch (err) {
    // Clean up on error
    if (state.connection.micStream) {
      state.connection.micStream.getTracks().forEach(t => t.stop());
    }
    state.connection.micStream = null;
    state.connection.micTracks = [];
    throw err;
  }
}

function setupDataChannel(pc) {
  const state = getState();
  const config = getConfig();
  const dc = pc.createDataChannel("oai-events");
  state.connection.dc = dc;

  dc.onopen = () => {
    // VAD settings are configured when creating the ephemeral token
    // No need to send session.update here - session is already configured

    if (!state.stages.simulation.mode) {
      safeSend({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: "Hi!" }],
        },
      });
      safeSend({ type: "response.create" });
    } else if (state.stages.simulation.mode) {
      // Instructions are configured in session
      setTimeout(() => {
        safeSend({ type: "response.create" });
      }, config.TIMEOUT_FIRST_RESPONSE);
    }
  };

  dc.onclose = () => {
  };

  dc.onerror = () => {
  };

  dc.onmessage = handleDataChannelMessage;
  return dc;
}

function setupConnectionHandlers(pc) {
  const state = getState();

  pc.onconnectionstatechange = function () {
    const connState = pc.connectionState;

    if (connState === "failed" || connState === "disconnected") {
      RT.emit("error", {
        message: `Connection ${connState}`,
        code: "CONNECTION_FAILED",
      });
      if (state.connection.pc === pc) {
        stopSession("error");
      }
    }
  };

  pc.oniceconnectionstatechange = function () {
    const iceState = pc.iceConnectionState;

    if (
      iceState === "failed" ||
      iceState === "disconnected" ||
      iceState === "closed"
    ) {
      RT.emit("error", {
        message: `ICE ${iceState}`,
        code:
          iceState === "failed"
            ? "ICE_CONNECTION_FAILED"
            : "ICE_CONNECTION_STATE_CHANGE",
      });
      if (state.connection.pc === pc && iceState === "failed") {
        stopSession("error");
      }
    }
  };

  pc.onicegatheringstatechange = function () {
  };

  pc.onsignalingstatechange = function () {
  };
}

async function performSdpExchange(ephemeralToken, offer) {
  const config = getConfig();
  const WEBRTC_URL = `https://${config.AZURE_RESOURCE}.openai.azure.com/openai/v1/realtime/calls?webrtcfilter=on`;

  const sdpRes = await fetch(WEBRTC_URL, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + ephemeralToken,
      "Content-Type": "application/sdp",
    },
    body: offer.sdp,
  });

  if (!sdpRes.ok) {
    const errorText = await sdpRes.text().catch(() => "Unknown error");
    throw new Error(`SDP exchange failed: ${sdpRes.status} - ${errorText}`);
  }

  const answerSdp = await sdpRes.text();

  return answerSdp;
}




function resetSessionState() {
  const state = getState();

  if (!state.stages.simulation.mode) {
    state.conversation.messages = [];
  }
  state.conversation.assistantLines = [];
  state.conversation.currentAssistantLine = "";
  state.conversation.userLines = [];
  state.json.buffer = "";
  state.assistantSpeaking = false;
  state.stages.simulation.triggered = false;
  state.json.waiting = false;
  state.json.type = null;
  if (!state.stages.simulation.mode) {
    state.evaluationRequested = false;
  }
  if (!state.stages.simulation.mode) {
    state.currentIssue = "";
    state.currentIssueData = null;
    state.stages.simulation.partnerTurnCount = 0;
    state.stages.simulation.userTurnCount = 0;
    state.stages.simulation.startIndex = -1;
  }

  // Reset push-to-talk state
  state.pushToTalk.isActive = false;
  state.pushToTalk.canActivate = false;
  state.pushToTalk.startTime = null;

  // Reset cleanup flag
  state.cleaningUp = false;
}

function emitInitialState() {
  const state = getState();
  if (!state.stages.simulation.mode) {
    RT.emit("state", { state: "SESSION_STARTED" });
  } else if (state.stages.simulation.mode) {
    RT.emit("state", { state: "BEGIN_SIMULATION" });
  }
}


async function setupWebRTCConnection(ephemeralToken) {
  const state = getState();

  // Note: AudioContext reset is handled in RT.start() before this function is called
  // to avoid duplicate resets and ensure proper sequencing

  const pc = new RTCPeerConnection();
  state.connection.pc = pc;
  state.connection.connNum = state.stages.simulation.mode ? 2 : 1;

  const audioEl = createAudioElement();
  state.connection.audioEl = audioEl;

  pc.ontrack = (e) => {

    if (e.streams?.[0]) {
      try {
        const stream = e.streams[0];
        const audioTracks = stream.getAudioTracks();

        // Validate stream has audio tracks
        if (audioTracks.length === 0) {
          RT.emitWarning(
            "Received stream has no audio tracks",
            "NO_AUDIO_TRACKS_IN_STREAM"
          );
          return;
        }

        // Validate tracks are live
        const inactiveTracks = audioTracks.filter(
          (t) => t.readyState !== "live"
        );
        if (inactiveTracks.length > 0) {
          RT.emitWarning(
            `Some audio tracks are not live (states: ${inactiveTracks
              .map((t) => t.readyState)
              .join(", ")})`,
            "INACTIVE_AUDIO_TRACKS"
          );
        }

        // Set up track event handlers
        audioTracks.forEach((track) => {
          track.onended = () => {
            // Track ended - handle if needed
          };
        });


        audioEl.srcObject = stream;

        // CRITICAL: Explicitly force play() on Android WebView - autoplay may not work if MediaCodec is corrupted
        // This gives our audio priority and forces the decoder to activate
        try {
          const playPromise = audioEl.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                // Audio element playing successfully
              })
              .catch(() => {
                // Ignore play errors
              });
          }
        } catch {
          // Ignore errors
        }
      } catch (err) {
        RT.emit("error", {
          message: `Failed to set audio stream: ${err.message}`,
          code: "AUDIO_STREAM_SETUP_ERROR",
          rawError: err.message || String(err),
        });
      }
    }
  };

  const micStream = await setupMicrophone();

  // Validate tracks exist before adding to WebRTC
  if (!state.connection.micTracks || state.connection.micTracks.length === 0) {
    throw new Error(
      "No microphone tracks available to add to WebRTC connection"
    );
  }

  // Validate all tracks before adding any to WebRTC
  const invalidTracks = state.connection.micTracks.filter(
    (t) => t.readyState !== "live"
  );
  if (invalidTracks.length > 0) {
    const states = invalidTracks.map((t) => t.readyState).join(", ");
    throw new Error(
      `Microphone tracks are not in 'live' state (states: ${states})`
    );
  }

  // Add all tracks to WebRTC connection (all validated as live)
  state.connection.micTracks.forEach((t) => {
    pc.addTrack(t, micStream);
  });

  // Keep mic muted until agent finishes first message
  // This prevents picking up audio if user is speaking before the session starts
  // For Stage 1: disable initially, enable after coach finishes
  // For Stage 2: disable initially so partner can speak first (mic enabled when partner finishes)
  setMicEnabled(false);

  setupDataChannel(pc);
  setupConnectionHandlers(pc);

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  const answerSdp = await performSdpExchange(ephemeralToken, offer);
  await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

}

// reason:
// - "stopped"   -> explicit user stop (RT.stop), safe to restart
// - "transition"-> internal stage transition (Stage 1->2, 2->4), no terminal state
// - "completed" -> normal Stage 4 completion (SESSION_COMPLETED already emitted)
// - "error"     -> teardown due to error, emit SESSION_ERROR
async function stopSession(reason) {
  const state = getState();
  const stopReason = reason || "stopped";

  // Prevent duplicate cleanup calls
  if (state.cleaningUp) {
    return;
  }

  // Check if session is already stopped
  if (
    !state.connection.pc &&
    !state.connection.dc &&
    !state.connection.micStream
  ) {
    return;
  }

  // Set cleanup flag to prevent duplicate calls
  state.cleaningUp = true;

  try {
    if (state.connection.dc) {
      try {
        // Remove all event handlers first
        state.connection.dc.onopen = null;
        state.connection.dc.onclose = null;
        state.connection.dc.onmessage = null;
        state.connection.dc.onerror = null;

        state.connection.dc.close();
      } catch {
        // Ignore errors while closing data channel during cleanup
      }
      state.connection.dc = null;
    }

    if (state.connection.pc) {
      try {
        // Remove all event handlers first to prevent callbacks during cleanup
        state.connection.pc.onconnectionstatechange = null;
        state.connection.pc.oniceconnectionstatechange = null;
        state.connection.pc.onicegatheringstatechange = null;
        state.connection.pc.onsignalingstatechange = null;
        state.connection.pc.ontrack = null;
        state.connection.pc.onnegotiationneeded = null;
        state.connection.pc.ondatachannel = null;

        // Stop tracks on senders before closing
        const senders = state.connection.pc.getSenders();
        senders.forEach((sender) => {
          try {
            if (sender.track) {
              sender.track.stop();
            }
          } catch {
            // Ignore errors while stopping tracks
          }
        });

        // Also stop tracks on receivers to ensure decoder is fully cleaned up (Android WebView persistence issue)
        try {
          const receivers = state.connection.pc.getReceivers ? state.connection.pc.getReceivers() : [];
          receivers.forEach((receiver) => {
            try {
              if (receiver.track) {
                receiver.track.stop();
              }
            } catch {
              // Ignore errors while stopping receiver tracks
            }
          });
        } catch {
          // Ignore errors if getReceivers is not available
        }

        // Close peer connection (this automatically cleans up all tracks and receivers)
        state.connection.pc.close();
      } catch {
        // Ignore errors while closing peer connection during cleanup
      }
      state.connection.pc = null;
    }

    if (state.connection.micTracks) {
      state.connection.micTracks.forEach((t) => {
        try {
          t.stop();
        } catch {
          // Ignore errors while stopping mic tracks during cleanup
        }
      });
      state.connection.micTracks = [];
    }
    state.connection.micStream = null;

    if (state.connection.audioEl) {
      try {
        // Fully reset audio element to ensure clean state
        const audioElToClean = state.connection.audioEl;
        if (audioElToClean.srcObject) {
          const stream = audioElToClean.srcObject;
          if (stream && typeof stream.getTracks === "function") {
            stream.getTracks().forEach((track) => {
              try {
                track.stop();
              } catch {
                // Ignore errors while stopping tracks
              }
            });
          }
        }
        audioElToClean.srcObject = null;
        audioElToClean.pause();
        audioElToClean.load(); // Reset audio element state
        audioElToClean.currentTime = 0; // Reset playback position

        // Remove audio element from DOM completely for clean slate
        if (audioElToClean.parentNode) {
          audioElToClean.remove();
        }

        // Also remove by ID in case it still exists (Android WebView persistence issue)
        const existingById = document.getElementById("rtAudio");
        if (existingById && existingById !== audioElToClean) {
          try {
            if (existingById.srcObject) {
              existingById.srcObject = null;
            }
            existingById.pause();
            existingById.load();
            if (existingById.parentNode) {
              existingById.remove();
            }
          } catch {
            // Ignore errors
          }
        }
      } catch {
        // Ignore errors while clearing audio element source
      }
      state.connection.audioEl = null;
    }


    // Reset push-to-talk state to ensure clean stop
    state.pushToTalk.isActive = false;
    state.pushToTalk.canActivate = false;
    state.pushToTalk.startTime = null;

    // For internal transitions we don't emit a terminal state or reset session state;
    // a new session will start immediately and resetSessionState() will be called.
    if (stopReason === "transition") {
      return;
    }

    // For explicit stops (RT.stop), reset session state to ensure clean slate
    // This ensures all state is cleared when user explicitly stops the session
    if (stopReason === "stopped") {
      resetSessionState();

      // Complete clean slate: reset ALL connection state
      state.connection.pc = null;
      state.connection.dc = null;
      state.connection.micStream = null;
      state.connection.micTracks = [];
      state.connection.audioEl = null;
      state.connection.connNum = 1;
    }

    // Terminal modes that mean "safe to restart" from caller's point of view.
    if (stopReason === "error") {
      RT.emit("state", { state: "SESSION_ERROR" });
    } else if (stopReason === "stopped") {
      RT.emit("state", { state: "SESSION_STOPPED" });
    } else if (stopReason === "completed") {
      // SESSION_COMPLETED is emitted by the caller (e.g., after evaluation JSON)
    }
  } catch (e) {
    // Only emit error if we're not already in cleanup (prevents recursion)
    if (!state.cleaningUp) {
      RT.emit("error", {
        message: e.message || String(e),
        code: "CLEANUP_ERROR",
      });
    }
  } finally {
    // Reset cleanup flag after cleanup completes (or fails)
    state.cleaningUp = false;
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

// Optional: Add a small delay before first session to allow decoder to initialize
// This can help with Android cold start issues
RT.preWarmDelay = async function(delayMs = 2000) {
  // Add delay for first session to allow decoder initialization
  const isFirstSession = !RT._firstSessionCompleted;

  if (isFirstSession) {
    RT._firstSessionCompleted = true;
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
};

RT.start = async function (ephemeralToken) {
  if (!ephemeralToken || ephemeralToken === "__TOKEN__") {
    RT.emit("error", {
      message: "Ephemeral token is required. Provide a valid token.",
      code: "INVALID_TOKEN",
    });
    return;
  }

  // Wait for DOM to be ready (if not already)
  // This ensures WebView is initialized before starting WebRTC
  if (document.readyState !== "complete") {
    await new Promise((resolve) => {
      if (document.readyState === "complete") {
        resolve();
      } else {
        window.addEventListener("load", resolve, { once: true });
      }
    });
  }

  try {
    emitInitialState();
    resetSessionState();

    await setupWebRTCConnection(ephemeralToken);
  } catch (err) {
    // Handle specific microphone permission errors
    let errorCode = "UNKNOWN_ERROR";
    let userMessage = err.message || String(err);

    // Precise mapping for mobile browsers
    if (
      err.name === "NotAllowedError" ||
      err.name === "PermissionDeniedError" ||
      err.name === "NotReadableError" ||
      err.name === "TrackStartError" ||
      err.name === "AbortError" ||
      (err.message && err.message.toLowerCase().includes("permission denied"))
    ) {
      errorCode = "PERMISSION_DENIED";
      userMessage =
        "Microphone access denied. Please allow microphone access in your browser and system settings.";
    } else if (
      err.name === "NotFoundError" ||
      err.name === "DevicesNotFoundError"
    ) {
      errorCode = "NO_MICROPHONE";
      userMessage =
        "No microphone found. Please connect a microphone and try again.";
    } else if (err.message && err.message.includes("readyState")) {
      errorCode = "MICROPHONE_INVALID";
      userMessage = "Microphone is not ready. Please try again.";
    }

    RT.emit("error", {
      message: userMessage,
      code: errorCode,
      rawError: err.name + ": " + (err.message || String(err)),
    });
  }
};

RT.stop = stopSession;

RT.retrySimulation = retrySimulation;

/**
 * Get the microphone stream for waveform visualization
 * Returns a clone of the stream so it can be used independently
 * @returns {MediaStream|null} Cloned microphone stream or null if not available
 */
RT.getMicStream = function () {
  const state = getState();
  if (!state.connection.micStream) {
    return null;
  }

  // Clone the stream so waveform can use it without interfering with WebRTC
  const clonedStream = new MediaStream();
  state.connection.micTracks.forEach((track) => {
    clonedStream.addTrack(track.clone());
  });
  return clonedStream;
};

export default RT;
