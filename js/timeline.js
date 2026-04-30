/**
 * @file timeline.js
 * @description Phase calculation and countdown logic.
 */

/**
 * Determines the current phase based on a given date.
 * @param {Object} timeline - Object mapping phase IDs to start/end dates.
 * @param {string} dateString - ISO date string to evaluate.
 * @returns {string} The ID of the current phase, or 'none'.
 */
export function getCurrentPhase(timeline, dateString) {
    const currentDate = new Date(dateString).getTime();
    
    for (const [phaseId, dates] of Object.entries(timeline)) {
        const start = new Date(dates.start).getTime();
        const end = new Date(dates.end).getTime() + (24 * 60 * 60 * 1000) - 1; // End of the day
        
        if (currentDate >= start && currentDate <= end) {
            return phaseId;
        }
    }
    
    return 'none';
}

/**
 * Calculates time remaining until the next phase or end of current phase.
 * @param {Object} timeline - Object mapping phase IDs to start/end dates.
 * @param {string} currentPhaseId - The current phase ID.
 * @param {string} dateString - ISO date string to evaluate.
 * @returns {string} Human readable countdown string.
 */
export function getCountdownText(timeline, currentPhaseId, dateString) {
    if (currentPhaseId === 'none' || !timeline[currentPhaseId]) return 'Timeline not active.';
    
    const currentDate = new Date(dateString).getTime();
    const end = new Date(timeline[currentPhaseId].end).getTime() + (24 * 60 * 60 * 1000) - 1;
    
    const diff = end - currentDate;
    
    if (diff <= 0) return 'Phase ended.';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
        return `${days} days ${hours} hours remaining in this phase.`;
    } else {
        return `${hours} hours remaining in this phase.`;
    }
}
