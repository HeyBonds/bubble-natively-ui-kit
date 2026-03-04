// ============================================================
// FETCH INSTRUCTIONS
// Trigger: bubble_fn_simulator output1 = 'fetch_instructions'
// Pre-steps: None (search inline or use cached view state)
// ============================================================

// --- Bubble fields ---
var simulationJsonInstructions = `Do a search for SimulatorConfig's simulation_json_instructions`;
var scoreInstructions = `Do a search for SimulatorConfig's score_instructions`;
var ttsApiKey = `Do a search for SimulatorConfig's tts_api_key`;

// --- JS ---
window.appUI.setSimulatorTemplates({
    simulationJsonInstructions: simulationJsonInstructions,
    scoreInstructions: scoreInstructions,
    ttsApiKey: ttsApiKey
});


// ============================================================
// REFUND COINS
// Trigger: bubble_fn_simulator output1 = 'refund_coins'
// Pre-steps: None
// Bubble workflow: "Only when output1 is 'refund_coins'" → add 4 coins back
// ============================================================
// No JS needed — Bubble workflow adds 4 coins to current user's balance.
// This fires when a simulator session errors out after coins were deducted.


// ============================================================
// START SESSION
// Trigger: bubble_fn_simulator output1 = 'start_session'
// output2: (empty)
// ============================================================
// User tapped "Start" on the simulator landing page.
// Bubble workflow: Generate an OpenAI Realtime session token and call
// window.appUI.onSimulatorToken(token) to start the WebRTC connection.


// ============================================================
// DEDUCT COINS
// Trigger: bubble_fn_simulator output1 = 'deduct_coins'
// output2: (empty)
// ============================================================
// Stage 2 of the simulation is starting (partner conversation).
// Bubble workflow: Subtract 4 coins from the current user's balance.


// ============================================================
// STAGE 2 TOKEN NEEDED
// Trigger: bubble_fn_simulator output1 = 'stage2_token_needed'
// output2: { "issue": "...", "jsonContext": "...", "isRetry": true }
//   - issue: text — the relationship issue for the simulation
//   - jsonContext: text — full JSON context for the simulation prompt
//   - isRetry: boolean (only present on retry, absent on first attempt)
// ============================================================
// Coach phase completed; need a new Realtime session token for the
// partner conversation. Bubble workflow: Generate token with the issue
// context and call window.appUI.onSimulatorStage2Token(token).
// If isRetry is true, skip coin deduction (already charged).


// ============================================================
// SESSION EVENT
// Trigger: bubble_fn_simulator output1 = 'session_event'
// output2: { "role": "coach|partner|user|prompt", "payload": "..." }
//   - role: text — who spoke (coach, partner, user) or "prompt" for simulation config
//   - payload: text — transcript text, or JSON string for prompt role
// ============================================================
// Fired after each final transcript (not deltas/partials).
// Bubble workflow: Create a CoachSessionEvent with role, payload,
// eventTime = now, coachSession = current session.
// Note: "prompt" event fires right before stage2_token_needed (Queue
// on JS2B ensures both are processed in order).


// ============================================================
// SESSION COMPLETE
// Trigger: bubble_fn_simulator output1 = 'session_complete'
// output2: {
//   "score": 3,
//   "skillLevel": "Finding Your Groove",
//   "nextTimeTip": "Next time try...",
//   "whatYouDidWell": ["bullet 1", "bullet 2"],
//   "whatCouldBeBetter": ["bullet 1", "bullet 2"],
//   "dimensions": "[{\"name\":\"Empathy\",\"direction\":\"up\"},...]"
// }
//   - score: number (1–5)
//   - skillLevel: text
//   - nextTimeTip: text (summary/advice)
//   - whatYouDidWell: list of text (strengths)
//   - whatCouldBeBetter: list of text (improvements)
//   - dimensions: text (JSON-stringified array of {name, direction} objects)
// ============================================================
// Simulation evaluation received. Bubble workflow:
// 1. Make changes to CoachSession (set status = completed, score, skillLevel)
// 2. Create CoachSummary with all evaluation fields
// Use JSONReader - Simulation Summary to parse the fields.


// ============================================================
// SESSION ERROR
// Trigger: bubble_fn_simulator output1 = 'session_error'
// output2: { "errorCode": "TRACK_ENDED", "errorMessage": "Microphone was..." }
//   - errorCode: text — one of: PERMISSION_DENIED, NO_MICROPHONE,
//     CONNECTION_FAILED, ICE_CONNECTION_FAILED, TRACK_ENDED, UNKNOWN
//   - errorMessage: text — user-friendly error description
// ============================================================
// Session crashed. Bubble workflow: Update CoachSession status to "error",
// store errorCode/errorMessage. If refund_coins follows (queued), it will
// fire next and add coins back.


// ============================================================
// SESSION CLOSED
// Trigger: bubble_fn_simulator output1 = 'session_closed'
// output2: (empty)
// ============================================================
// User deliberately aborted the session via the "End Session" dialog.
// Bubble workflow: Update CoachSession status to "aborted".
