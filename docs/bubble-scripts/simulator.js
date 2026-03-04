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
