/**
 * Bubble Bridge Utility
 * Centralizes communication with Bubble's "Javascript to Bubble" elements.
 * Uses Toolbox Multiple Outputs — all values sent as text so output types
 * stay consistent regardless of which action is firing.
 *
 * Output mapping:
 *   output1 = action (text) — Bubble routes workflows with "Only when output1 is …"
 *   output2+ = extra data values (all text, positional from data object)
 *
 * Usage: sendToBubble('bubble_fn_feature', 'action_name')
 *        sendToBubble('bubble_fn_feature', 'action_name', { answer: 'Yes', index: 1 })
 */
export const sendToBubble = (fnName, action, data = {}) => {
    // Wire format — all values coerced to text for consistent Bubble output types
    const payload = { output1: String(action) };
    Object.values(data).forEach((val, i) => {
        payload[`output${i + 2}`] = String(val);
    });

    if (window.BubbleBridge) {
        console.log(`📡 [${fnName}]`, { action, ...data });
        window.BubbleBridge.send(fnName, payload);
    } else {
        console.warn(`⚠️ BubbleBridge not found [${fnName}]`, { action, ...data });
    }
};
