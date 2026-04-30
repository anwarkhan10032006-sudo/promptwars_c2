/**
 * @file ui.js
 * @description Handles DOM manipulation, rendering chat messages, timelines, and alerts.
 */

/**
 * Escapes HTML characters in a string to prevent XSS.
 * Since we primarily use textContent for dynamic strings, this is an extra precaution or used when we must insert structured HTML safely.
 * @param {string} str 
 * @returns {string} sanitized string
 */
export function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * Adds a message to the chat window.
 * @param {string} text - The message text.
 * @param {string} sender - 'assistant' or 'user'
 */
export function addChatMessage(text, sender) {
    const chatWindow = document.getElementById('chat-window');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    // Using textContent to prevent XSS
    msgDiv.textContent = text;
    
    // Batch DOM update is simple here, but using appendChild
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

/**
 * Renders the timeline UI based on phases and current phase.
 * @param {Array} phases - Array of phase objects.
 * @param {string} currentPhaseId - The ID of the currently active phase.
 */
export function renderTimeline(phases, currentPhaseId) {
    const timelineContainer = document.getElementById('timeline');
    timelineContainer.innerHTML = ''; // Clear existing
    
    const fragment = document.createDocumentFragment();
    
    phases.forEach(phase => {
        const step = document.createElement('div');
        step.className = 'timeline-step';
        if (phase.id === currentPhaseId) {
            step.classList.add('active');
        }
        step.textContent = phase.name;
        step.title = phase.description;
        
        // click event to explain phase
        step.addEventListener('click', () => {
            addChatMessage(`The ${phase.name} phase: ${phase.description}`, 'assistant');
        });
        
        fragment.appendChild(step);
    });
    
    timelineContainer.appendChild(fragment);
}

/**
 * Shows an alert banner.
 * @param {string} message - Alert text.
 * @param {string} type - 'error' or 'info'
 */
export function showAlert(message, type = 'info') {
    const alertsContainer = document.getElementById('alerts');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${type}`;
    
    const textSpan = document.createElement('span');
    textSpan.textContent = message;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'alert-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Close alert');
    closeBtn.onclick = () => alertDiv.remove();
    
    alertDiv.appendChild(textSpan);
    alertDiv.appendChild(closeBtn);
    
    alertsContainer.appendChild(alertDiv);
    
    // Auto remove after 5 seconds if info
    if (type === 'info') {
        setTimeout(() => {
            if (document.body.contains(alertDiv)) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

/**
 * Toggles dark mode based on user preference or button click.
 */
export function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    // Check local storage or prefers-color-scheme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        toggleBtn.textContent = '☀️';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        toggleBtn.textContent = '🌙';
    }
    
    toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            toggleBtn.textContent = '🌙';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            toggleBtn.textContent = '☀️';
        }
    });
}

/**
 * Updates the countdown display.
 * @param {string} text - The countdown text.
 */
export function updateCountdown(text) {
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minsEl = document.getElementById('cd-mins');
    const secsEl = document.getElementById('cd-secs');

    if (daysEl && hoursEl) {
        const daysMatch = text.match(/(\d+)\s*days/);
        const hoursMatch = text.match(/(\d+)\s*hours/);
        
        daysEl.textContent = daysMatch ? daysMatch[1].padStart(2, '0') : '00';
        hoursEl.textContent = hoursMatch ? hoursMatch[1].padStart(2, '0') : '00';
        if (minsEl) minsEl.textContent = '00';
        if (secsEl) secsEl.textContent = '00';
    } else {
        const countdownEl = document.getElementById('countdown');
        if (countdownEl) countdownEl.textContent = text;
    }
}
