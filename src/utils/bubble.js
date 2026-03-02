/**
 * Bubble Bridge Utility
 * Centralizes communication with Bubble's "Javascript to Bubble" elements.
 * Uses Toolbox Multiple Outputs.
 *
 * Output mapping:
 *   output1 = action (text) — Bubble routes workflows with "Only when output1 is …"
 *   output2 = JSON payload (text) — all extra data as a single JSON string
 *
 * Usage: sendToBubble('bubble_fn_feature', 'action_name')
 *        sendToBubble('bubble_fn_feature', 'action_name', { questionId: 'abc', index: 1 })
 *
 * Bubble side: parse output2 with JSON.parse() in a "Run JavaScript" step,
 * or use :extract with Regex for individual fields.
 */
export const sendToBubble = (fnName, action, data = {}) => {
    const payload = { output1: String(action) };
    if (Object.keys(data).length > 0) {
        payload.output2 = JSON.stringify(data);
    }

    if (window.BubbleBridge) {
        console.log(`📡 [${fnName}]`, { action, ...data });
        window.BubbleBridge.send(fnName, payload);
    } else {
        console.warn(`⚠️ BubbleBridge not found [${fnName}]`, { action, ...data });
    }
};
