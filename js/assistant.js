/**
 * @file assistant.js
 * @description Decision tree logic, context-aware response generation, and smart recommendations.
 */

// Memory store for the session context
let context = {
    age: null,
    isRegistered: null,
    topic: null
};

/**
 * Resets assistant context.
 */
export function resetContext() {
    context = { age: null, isRegistered: null, topic: null };
}

/**
 * Updates context from eligibility checker.
 * @param {Object} eligibilityResults 
 */
export function updateContextFromEligibility(eligibilityResults) {
    if (eligibilityResults.eligible) {
        context.age = '18+';
    }
}

/**
 * Processes user input and returns the assistant's response.
 * @param {string} input - User's chat message
 * @param {Array} faqs - Array of FAQ objects for fallback searching
 * @returns {Object} { message, suggestions, action }
 */
export function processInput(input, faqs = []) {
    const text = input.toLowerCase().trim();
    let response = { message: '', suggestions: [], action: null };

    // Simple context check
    if (context.isRegistered === false && text.includes('vote')) {
        response.message = "Since you mentioned you're not registered yet, you'll need to do that before you can vote. Should we start the registration process?";
        response.suggestions = ["Start registration", "Check deadlines"];
        return response;
    }

    // Exact status matching first
    if (text.includes('not registered')) {
        context.isRegistered = false;
        response.message = "No problem! Let's get you registered. First, let's make sure you meet the basic requirements.";
        response.action = 'show_eligibility';
    } else if (text.includes('already registered')) {
        context.isRegistered = true;
        response.message = "Great! Since you're already registered, you are ready for Election Day. Do you need to find your polling station?";
        response.suggestions = ["Find polling station", "Early voting options"];
    } 
    // Keyword matching decision tree
    else if (text.includes('register') || text.includes('registration')) {
        context.topic = 'registration';
        if (context.isRegistered === true) {
            response.message = "You've already told me you're registered! Your next step is preparing for Election Day. Do you know where your polling station is?";
            response.suggestions = ["Find polling station", "What to bring"];
        } else {
            response.message = "Registering is the first step! You'll need a valid ID and proof of residence. Would you like to check if you are eligible first?";
            response.suggestions = ["Check eligibility", "Registration deadlines"];
            response.action = 'show_eligibility'; // Triggers UI to show eligibility form
        }
    } else if (text.includes('eligible') || text.includes('eligibility')) {
        context.topic = 'eligibility';
        response.message = "Let's find out if you're eligible to vote. I'll ask you a few simple questions.";
        response.action = 'show_eligibility';
    } else if (text.includes('step') || text.includes('day') || text.includes('procedure')) {
        context.topic = 'voting_day';
        response.message = "On Election Day, you should bring your required ID to your assigned polling station. Would you like a checklist of what to bring or help finding your station?";
        response.suggestions = ["What to bring", "Find polling station"];
    } else if ((text.includes('result') || text.includes('count')) && !text.includes('how are votes counted')) {
        context.topic = 'results';
        response.message = "Votes are counted using secure machines and audited by officials. Preliminary results are usually announced on election night.";
        response.suggestions = ["How are votes counted?", "When is it official?"];
    } else {
        // Fallback: search FAQs
        const match = faqs.find(f => f.question.toLowerCase().includes(text) || text.includes(f.question.toLowerCase().split(' ')[0]));
        if (match) {
            response.message = match.answer;
            response.suggestions = generateSuggestions(faqs, 2, match.id);
        } else {
            response.message = "I'm best at helping with election questions — like registering, finding a polling station, or understanding the process. What would you like to start with?";
            response.suggestions = ["How to register", "Am I eligible?", "Election timeline"];
        }
    }

    return response;
}

/**
 * Generates random suggestions from FAQ bank.
 * @param {Array} faqs 
 * @param {number} count 
 * @param {string} excludeId 
 * @returns {Array<string>} Array of suggested questions
 */
export function generateSuggestions(faqs, count = 2, excludeId = null) {
    if (!faqs || faqs.length === 0) return [];
    
    const available = faqs.filter(f => f.id !== excludeId);
    // Shuffle array
    for (let i = available.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [available[i], available[j]] = [available[j], available[i]];
    }
    
    return available.slice(0, count).map(f => f.question);
}

/**
 * Expose context for testing
 */
export function __test_getContext() {
    return context;
}
export function __test_setContext(newContext) {
    context = newContext;
}
