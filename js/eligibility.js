/**
 * @file eligibility.js
 * @description Logic for the step-by-step eligibility checker.
 */

const questions = [
    { id: 'age', type: 'select', text: 'Are you 18 years or older?', options: ['Yes', 'No'] },
    { id: 'citizen', type: 'select', text: 'Are you a citizen of this country?', options: ['Yes', 'No'] },
    { id: 'residency', type: 'select', text: 'Do you have a fixed address in your state/district?', options: ['Yes', 'No'] }
];

let currentIndex = 0;
let answers = {};

/**
 * Initializes the eligibility checker form.
 * @param {HTMLElement} container - The DOM element to render questions into.
 * @param {Function} onComplete - Callback when form is finished.
 */
export function initEligibilityChecker(container, onComplete) {
    currentIndex = 0;
    answers = {};
    renderQuestion(container, onComplete);
}

/**
 * Renders the current question.
 * @param {HTMLElement} container 
 * @param {Function} onComplete 
 */
function renderQuestion(container, onComplete) {
    container.innerHTML = '';
    
    if (currentIndex >= questions.length) {
        evaluateEligibility(container, onComplete);
        return;
    }

    const q = questions[currentIndex];
    
    const fg = document.createElement('div');
    fg.className = 'form-group';
    
    const label = document.createElement('label');
    label.setAttribute('for', `eligibility-${q.id}`);
    label.textContent = q.text;
    
    const select = document.createElement('select');
    select.id = `eligibility-${q.id}`;
    select.name = q.id;
    
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = '-- Select an option --';
    defaultOpt.disabled = true;
    defaultOpt.selected = true;
    select.appendChild(defaultOpt);
    
    q.options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.toLowerCase();
        option.textContent = opt;
        select.appendChild(option);
    });
    
    fg.appendChild(label);
    fg.appendChild(select);
    container.appendChild(fg);
}

/**
 * Handles the submit action of the current step.
 * @param {HTMLElement} container 
 * @param {Function} onComplete 
 * @returns {boolean} True if advanced to next, false if validation failed.
 */
export function handleNextStep(container, onComplete) {
    if (currentIndex >= questions.length) return false;
    
    const q = questions[currentIndex];
    const select = document.getElementById(`eligibility-${q.id}`);
    
    if (!select || !select.value) {
        return false; // Validation failed
    }
    
    answers[q.id] = select.value;
    
    // Show brief inline confirmation
    const conf = document.createElement('div');
    conf.className = 'alert info';
    conf.style.marginTop = '0';
    conf.style.marginBottom = '1rem';
    conf.textContent = `✓ ${q.id} requirement recorded.`;
    container.parentElement.insertBefore(conf, container);
    setTimeout(() => { if(conf.parentNode) conf.remove() }, 2000);
    
    currentIndex++;
    renderQuestion(container, onComplete);
    return true;
}

/**
 * Evaluates the final answers and calls onComplete.
 * @param {HTMLElement} container 
 * @param {Function} onComplete 
 */
function evaluateEligibility(container, onComplete) {
    let isEligible = true;
    let reason = '';
    
    if (answers.age === 'no') {
        isEligible = false;
        reason = 'You must be 18 years or older.';
    } else if (answers.citizen === 'no') {
        isEligible = false;
        reason = 'You must be a citizen.';
    } else if (answers.residency === 'no') {
        isEligible = false;
        reason = 'You need a fixed address to determine your polling location.';
    }
    
    container.innerHTML = `
        <div class="alert ${isEligible ? 'info' : 'error'}">
            <strong>${isEligible ? 'Eligible' : 'Not Yet Eligible'}</strong><br>
            ${isEligible ? 'You meet all the basic requirements to vote!' : reason}
        </div>
    `;
    
    // Hide the next button
    const submitBtn = document.getElementById('eligibility-submit');
    if (submitBtn) submitBtn.style.display = 'none';
    
    onComplete({ eligible: isEligible, reason });
}

/**
 * Expose for testing
 */
export function __test_evaluate(testAnswers) {
    answers = testAnswers;
    let isEligible = true;
    if (answers.age === 'no') isEligible = false;
    else if (answers.citizen === 'no') isEligible = false;
    else if (answers.residency === 'no') isEligible = false;
    return isEligible;
}
