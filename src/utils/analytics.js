import mixpanel from 'mixpanel-browser';
import { APP_VERSION } from '../config';
import { setFirebaseUser } from './firebase';

let initialized = false;
let eventQueue = [];

function detectPlatform() {
    const n = window.natively;
    if (n?.isIOSApp) return 'ios';
    if (n?.isAndroidApp) return 'android';
    return 'web';
}

function getBaseSuperProperties() {
    return {
        app_version: APP_VERSION,
        platform: detectPlatform(),
        user_type: 'anonymous',
    };
}

export function initAnalytics() {
    const token = window.APP_CONFIG?.MIXPANEL_TOKEN;
    if (!token) {
        console.warn('[Analytics] No Mixpanel token found. Analytics disabled.');
        return;
    }

    mixpanel.init(token, {
        debug: /\/version-/.test(location.pathname),
        track_pageview: false,
        persistence: 'localStorage',
    });

    mixpanel.register(getBaseSuperProperties());

    initialized = true;
    console.log('[Analytics] Initialized');

    // Flush any events that were queued before init
    if (eventQueue.length) {
        eventQueue.forEach(([event, props]) => mixpanel.track(event, props));
        eventQueue = [];
    }
}

export function identifyUser(userId, traits = {}) {
    if (!initialized) return;

    if (mixpanel.get_distinct_id() !== userId) {
        mixpanel.alias(userId);
    }
    mixpanel.identify(userId);

    mixpanel.register({ user_type: 'authenticated' });

    const peopleProps = {};
    if (traits.name) peopleProps.$name = traits.name;
    if (traits.email) peopleProps.$email = traits.email;
    if (traits.coins != null) peopleProps.coins = traits.coins;
    if (traits.partner != null) peopleProps.partner_connected = !!traits.partner;
    if (traits.onboarding_complete != null) peopleProps.onboarding_complete = traits.onboarding_complete;

    mixpanel.people.set(peopleProps);
    mixpanel.people.set_once({ signup_date: new Date().toISOString() });

    // Set Firebase user independently of Mixpanel state
    setFirebaseUser(userId);
    console.log('[Analytics] Identified user:', userId);
}

export function resetIdentity() {
    if (!initialized) return;

    mixpanel.reset();
    mixpanel.register(getBaseSuperProperties());

    console.log('[Analytics] Identity reset');
}

export function track(event, props) {
    if (!initialized) {
        eventQueue.push([event, props]);
        return;
    }
    mixpanel.track(event, props);
}

export function screen(name) {
    track('Screen Viewed', { screen: name });
}

export function setUserProperties(props) {
    if (!initialized) return;
    mixpanel.people.set(props);
}

export function setSuperProperties(props) {
    if (!initialized) return;
    mixpanel.register(props);
}
