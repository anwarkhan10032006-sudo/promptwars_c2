/**
 * @file main.js
 * @description Entry point for ElectraGuide. Orchestrates module initialization and global state.
 */

import { initFirebase, fetchAppData, logSession, logAnalyticsEvent } from './firebase.js';
import { getCurrentPhase, getCountdownText } from './timeline.js';
import { addChatMessage, renderTimeline, showAlert, initThemeToggle, updateCountdown, sanitizeHTML } from './ui.js';
import { processInput, updateContextFromEligibility, resetContext } from './assistant.js';
import { initEligibilityChecker, handleNextStep } from './eligibility.js';
import { initMap, showMapSection } from './maps.js';
import { initDemoMode, getSimulatedDate } from './simulation.js';
import { DEBOUNCE_DELAYS } from './constants.js';

// Global App State
let appData = {
    phases: [],
    timeline: {},
    faqs: []
};
let currentPhaseId = 'none';

/**
 * Initializes the application.
 */
async function initApp() {
    initThemeToggle();
    addChatMessage("Hello! I'm ElectraGuide, your AI-powered election assistant. I'm loading some information, please wait...", "assistant");
    
    // 1. Init Firebase
    await initFirebase();
    logAnalyticsEvent('app_open');
    
    // 2. Fetch Data
    const data = await fetchAppData();
    if (data.fallback) {
        showAlert("Running in offline demo mode (Firebase unavailable).", "error");
    } else {
        appData = data;
    }
    
    // 3. Lazy load Maps
    import('./maps.js').then(module => {
        module.initMap();
    }).catch(err => console.error("Failed to load maps", err));

    // 4. Set Initial State
    updateSimulationState();
    
    // 5. Setup Listeners
    setupChatListeners();
    setupFAQSearch();
    setupMapListeners();
    setupEpicListeners();
    initDemoMode(updateSimulationState);
    
    // Initial welcome based on phase
    const welcomeMsgs = {
        'registration': "We are currently in the Registration phase! Are you registered to vote?",
        'campaigning': "We are in the Campaigning phase! Candidates are making their cases. Do you know who is running?",
        'voting': "It is Voting Day! Do you know where your polling station is?",
        'counting': "Votes are currently being counted. Would you like to know how the process works?",
        'results': "The Results phase is here. Preliminary results are being announced.",
        'none': "Welcome! How can I help you prepare for the upcoming elections?"
    };
    
    setTimeout(() => {
        addChatMessage(welcomeMsgs[currentPhaseId] || welcomeMsgs['none'], "assistant");
    }, 1000);
}

/**
 * Updates UI based on the simulated or real date.
 */
function updateSimulationState() {
    const simDate = getSimulatedDate(appData.timeline);
    currentPhaseId = getCurrentPhase(appData.timeline, simDate);
    
    renderTimeline(appData.phases, currentPhaseId);
    
    const countdownTxt = getCountdownText(appData.timeline, currentPhaseId, simDate);
    updateCountdown(countdownTxt);
    
    logAnalyticsEvent('phase_viewed', { phase: currentPhaseId });
    
    // Phase specific alerts
    if (currentPhaseId === 'registration') {
        showAlert("Registration deadline is approaching. Ensure you are registered!", "info");
    } else if (currentPhaseId === 'voting') {
        showAlert("Voting is open today! Make sure you bring ID.", "info");
    }
}

/**
 * Sets up the chat input and send button listeners.
 */
function setupChatListeners() {
    const sendBtn = document.getElementById('send-btn');
    const chatInput = document.getElementById('chat-input');
    
    const handleSend = () => {
        const text = sanitizeHTML(chatInput.value.trim());
        if (!text) return;
        
        addChatMessage(text, 'user');
        chatInput.value = '';
        
        // Hide eligibility if it was open
        document.getElementById('eligibility-form').classList.add('hidden');
        
        // Process
        setTimeout(() => {
            const response = processInput(text, appData.faqs);
            addChatMessage(response.message, 'assistant');
            
            if (response.action === 'show_eligibility') {
                startEligibilityFlow();
            }
            
            renderSuggestions(response.suggestions);
            logAnalyticsEvent('assistant_flow_started', { topic: text });
            
        }, 500);
    };
    
    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });
}

/**
 * Starts the eligibility checker flow.
 */
function startEligibilityFlow() {
    const form = document.getElementById('eligibility-form');
    const container = document.getElementById('eligibility-question-container');
    const submitBtn = document.getElementById('eligibility-submit');
    
    form.classList.remove('hidden');
    submitBtn.style.display = 'block';
    
    initEligibilityChecker(container, (results) => {
        updateContextFromEligibility(results);
        logAnalyticsEvent('eligibility_check_completed', { result: results.eligible ? 'eligible' : 'ineligible' });
        logSession({ flow: 'eligibility', result: results.eligible ? 'eligible' : 'ineligible' });
        
        if (results.eligible) {
            setTimeout(() => {
                addChatMessage("Great! Since you're eligible, let's find your nearest polling station.", "assistant");
                showMapSection();
            }, 1000);
        }
    });
    
    form.onsubmit = (e) => {
        e.preventDefault();
        handleNextStep(container, () => {});
    };
}

/**
 * Renders smart suggestion chips.
 */
function renderSuggestions(suggestions) {
    const container = document.getElementById('smart-suggestions');
    container.innerHTML = '';
    
    if (!suggestions || suggestions.length === 0) return;
    
    const p = document.createElement('p');
    p.style.fontSize = 'var(--font-sm)';
    p.style.marginBottom = 'var(--space-xs)';
    p.textContent = "You might also want to know:";
    container.appendChild(p);
    
    const fragment = document.createDocumentFragment();
    suggestions.forEach(text => {
        const chip = document.createElement('button');
        chip.className = 'suggestion-chip';
        chip.textContent = text;
        chip.onclick = () => {
            document.getElementById('chat-input').value = text;
            document.getElementById('send-btn').click();
            container.innerHTML = ''; // Clear suggestions after click
        };
        fragment.appendChild(chip);
    });
    container.appendChild(fragment);
}

/**
 * Sets up FAQ live search with debounce.
 */
function setupFAQSearch() {
    const searchInput = document.getElementById('faq-search');
    const resultsContainer = document.getElementById('faq-results');
    let timeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        const query = e.target.value.toLowerCase().trim();
        
        if (!query) {
            resultsContainer.innerHTML = '';
            return;
        }
        
        timeout = setTimeout(() => {
            const matches = appData.faqs.filter(f => f.question.toLowerCase().includes(query));
            resultsContainer.innerHTML = '';
            
            if (matches.length > 0) {
                const fragment = document.createDocumentFragment();
                matches.slice(0, 3).forEach(match => {
                    const div = document.createElement('div');
                    div.style.padding = 'var(--space-sm)';
                    div.style.borderBottom = '1px solid var(--border-color)';
                    div.style.fontSize = 'var(--font-sm)';
                    div.innerHTML = `<strong>${sanitizeHTML(match.question)}</strong><br>${sanitizeHTML(match.answer)}`;
                    fragment.appendChild(div);
                });
                resultsContainer.appendChild(fragment);
            } else {
                resultsContainer.innerHTML = '<div style="padding: 10px; font-size: var(--font-sm);">No matching FAQs found.</div>';
            }
        }, DEBOUNCE_DELAYS.SEARCH);
    });
}

function setupMapListeners() {
    const closeBtn = document.getElementById('close-map-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('map-section').classList.add('hidden');
        });
    }
}

function setupEpicListeners() {
    const mainBtn = document.getElementById('main-epic-btn');
    const sidebarBtn = document.getElementById('sidebar-epic-btn');
    
    const handleEpicSearch = () => {
        addChatMessage("Searching for your polling station based on your EPIC number...", "assistant");
        setTimeout(() => {
            showMapSection();
            document.getElementById('map-section').scrollIntoView({behavior: 'smooth'});
        }, 1000);
    };

    if (mainBtn) mainBtn.addEventListener('click', handleEpicSearch);
    if (sidebarBtn) sidebarBtn.addEventListener('click', handleEpicSearch);
}

// Boot
window.addEventListener('DOMContentLoaded', initApp);
