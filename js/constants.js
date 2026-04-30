/**
 * @file constants.js
 * @description Centralized constants for ElectraGuide including phase definitions, magic strings, and UI delays.
 */

export const DEBOUNCE_DELAYS = {
    SEARCH: 300,
    SESSION_WRITE: 2000
};

export const FIREBASE_PATHS = {
    SESSIONS: '/sessions',
    FAQS: '/faqs',
    TIMELINE: '/timeline',
    PHASES: '/phases'
};

export const CACHE_KEYS = {
    FAQS: 'electraguide_faqs',
    TIMELINE: 'electraguide_timeline'
};

export const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export const PHASES = {
    REGISTRATION: 'registration',
    CAMPAIGNING: 'campaigning',
    VOTING: 'voting',
    COUNTING: 'counting',
    RESULTS: 'results'
};

export const FALLBACK_DATE = new Date().toISOString(); // Default date for simulation

// Map default settings
export const MAP_CONFIG = {
    DEFAULT_CENTER: { lat: 38.9072, lng: -77.0369 }, // Washington DC
    DEFAULT_ZOOM: 12
};
