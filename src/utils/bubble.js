/**
 * Bubble Bridge Utility
 * Centralizes communication with Bubble's "Javascript to Bubble" elements.
 * Automatically injects the Device ID (from window.APP_CONFIG) into every request.
 */
export const sendToBubble = (fnName, data = {}) => {
    // Get Device ID from global config (populated by App.jsx)
    const deviceId = window.APP_CONFIG?.DEVICE_ID;

    if (window.BubbleBridge) {
        const payload = { ...data, device_id: deviceId };
        console.log(`📡 Sending to Bubble [${fnName}]:`, payload);
        window.BubbleBridge.send(fnName, payload);
    } else {
        console.warn(`⚠️ BubbleBridge not found. Canceled sending [${fnName}]. Data:`, data);
    }
};
