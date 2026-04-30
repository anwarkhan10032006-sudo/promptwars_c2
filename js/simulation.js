/**
 * @file simulation.js
 * @description Manual phase override logic and Demo Mode.
 */
import { FALLBACK_DATE } from './constants.js';

let forcedPhase = 'none';

/**
 * Gets the simulated current date or forced phase date.
 * @param {Object} timeline 
 * @returns {string} ISO Date string
 */
export function getSimulatedDate(timeline) {
    if (forcedPhase !== 'none' && timeline[forcedPhase]) {
        // If a phase is forced, return a date right in the middle of that phase
        const start = new Date(timeline[forcedPhase].start).getTime();
        const end = new Date(timeline[forcedPhase].end).getTime();
        const middle = new Date(start + (end - start) / 2);
        return middle.toISOString();
    }
    // Default to a specific date for consistent demo behavior if not forced
    // You can switch this to new Date().toISOString() for real-time
    return FALLBACK_DATE; 
}

/**
 * Initializes the demo section listener.
 * @param {Function} onPhaseChange - Callback when phase is manually changed.
 */
export function initDemoMode(onPhaseChange) {
    const select = document.getElementById('demo-phase-select');
    if (!select) return;
    
    select.addEventListener('change', (e) => {
        forcedPhase = e.target.value;
        onPhaseChange();
    });
}
