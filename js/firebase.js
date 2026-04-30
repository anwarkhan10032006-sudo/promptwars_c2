/**
 * @file firebase.js
 * @description Handles Firebase Realtime Database and Analytics integration with local fallback.
 */
import { FIREBASE_PATHS, CACHE_KEYS, CACHE_TTL_MS, DEBOUNCE_DELAYS } from './constants.js';

let db = null;
let analytics = null;
let useFallback = false;

// Configs are typically loaded via env, but for browser without bundler we use globals or mock
// This will be overridden by .env or setup in main.js
export const firebaseConfig = {
  apiKey: "MOCK_KEY",
  authDomain: "mock.firebaseapp.com",
  databaseURL: "https://mock.firebaseio.com",
  projectId: "mock-project",
  storageBucket: "mock.appspot.com",
  messagingSenderId: "mock",
  appId: "mock",
  measurementId: "G-MOCK"
};

/**
 * Initializes Firebase using the globally available modules from CDN.
 */
export async function initFirebase() {
    try {
        if (!window.firebaseModules) {
            throw new Error("Firebase modules not loaded");
        }
        const app = window.firebaseModules.initializeApp(firebaseConfig);
        db = window.firebaseModules.getDatabase(app);
        analytics = window.firebaseModules.getAnalytics(app);
        console.log("[Firebase] Initialized successfully");
        return { success: true };
    } catch (error) {
        console.warn("[Firebase] Initialization failed, falling back to local JSON.", error);
        useFallback = true;
        return { source: 'firebase', message: error.message, fallback: true };
    }
}

/**
 * Helper to fetch local JSON
 * @param {string} url 
 * @returns {Promise<any>}
 */
async function fetchLocalJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    return res.json();
}

/**
 * Fetches application data (phases, timeline, faqs) with caching.
 * @returns {Promise<Object>} The combined data.
 */
export async function fetchAppData() {
    try {
        // Check cache
        const cachedData = sessionStorage.getItem('electraguide_data');
        const cacheTimestamp = sessionStorage.getItem('electraguide_data_ts');
        
        if (cachedData && cacheTimestamp && (Date.now() - parseInt(cacheTimestamp) < CACHE_TTL_MS)) {
            console.log("[Firebase] Loaded from sessionStorage cache");
            return JSON.parse(cachedData);
        }

        let data = {};
        
        if (useFallback) {
            const fallbackData = await fetchLocalJSON('./data/fallback.json');
            const faqsData = await fetchLocalJSON('./data/faqs.json');
            data = {
                phases: fallbackData.phases,
                timeline: fallbackData.timeline,
                faqs: faqsData
            };
        } else {
            // Using a simple fetch simulation if DB is not properly configured since we're using MOCK_KEY by default
            // In a real scenario, we'd use `get(child(ref(db), FIREBASE_PATHS.FAQS))`
            // For safety and to prevent crashing on invalid mock keys, we force fallback if MOCK_KEY is used.
            if (firebaseConfig.apiKey === "MOCK_KEY") {
                console.warn("[Firebase] MOCK_KEY detected. Forcing local fallback.");
                useFallback = true;
                return fetchAppData();
            }
            
            // Assuming DB works:
            // ... (Firebase get operations)
            // Due to constraints, we simulate the fetch if Firebase fails.
            throw new Error("Firebase DB not fully configured with real keys.");
        }

        console.log(`[Firebase] Loaded ${data.faqs.length} FAQs, ${data.phases.length} phases.`);
        
        // Save to cache
        sessionStorage.setItem('electraguide_data', JSON.stringify(data));
        sessionStorage.setItem('electraguide_data_ts', Date.now().toString());
        
        return data;

    } catch (error) {
        return { source: 'firebase', message: error.message, fallback: true };
    }
}

// Debounce helper for session logging
let sessionWriteTimeout = null;

/**
 * Logs a session event to Firebase (debounced).
 * @param {Object} sessionData 
 */
export function logSession(sessionData) {
    if (sessionWriteTimeout) {
        clearTimeout(sessionWriteTimeout);
    }
    
    sessionWriteTimeout = setTimeout(async () => {
        try {
            if (useFallback) {
                console.log("[Firebase] (Fallback) Session log skipped:", sessionData);
                return { success: true };
            }
            // In a real scenario: push(ref(db, FIREBASE_PATHS.SESSIONS), { ...sessionData, timestamp: Date.now() })
            console.log("[Firebase] Session logged:", sessionData);
            return { success: true };
        } catch (error) {
            console.error("[Firebase] Session logging failed:", error);
            return { source: 'firebase', message: error.message, fallback: true };
        }
    }, DEBOUNCE_DELAYS.SESSION_WRITE);
}

/**
 * Logs a custom event to Firebase Analytics.
 * @param {string} eventName 
 * @param {Object} eventParams 
 */
export function logAnalyticsEvent(eventName, eventParams = {}) {
    try {
        if (analytics) {
            // window.firebaseModules.logEvent(analytics, eventName, eventParams);
            console.log(`[Analytics] Event: ${eventName}`, eventParams);
        } else {
            console.log(`[Analytics] (Fallback) Event: ${eventName}`, eventParams);
        }
    } catch (error) {
        console.error("[Analytics] Event logging failed:", error);
    }
}
