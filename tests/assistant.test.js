/**
 * @file assistant.test.js
 * @description Tests for assistant decision flow and memory.
 */
import { processInput, resetContext, updateContextFromEligibility, __test_getContext, __test_setContext } from '../js/assistant.js';

describe('Assistant Logic', () => {
    beforeEach(() => {
        resetContext();
    });

    test('Returns correct branch for "not registered"', () => {
        const response = processInput("I am not registered to vote");
        expect(response.action).toBe('show_eligibility');
        expect(__test_getContext().isRegistered).toBe(false);
    });

    test('Returns correct branch for "already registered"', () => {
        const response = processInput("I am already registered");
        expect(response.suggestions).toContain("Find polling station");
        expect(__test_getContext().isRegistered).toBe(true);
    });

    test('Context memory: remembers not registered when asking to vote', () => {
        __test_setContext({ age: null, isRegistered: false, topic: null });
        const response = processInput("I want to vote");
        expect(response.message).toContain("you'll need to do that before you can vote");
    });

    test('Unrecognized input fallback to FAQs or default', () => {
        const faqs = [{ id: 'f1', question: 'How are votes counted?', answer: 'Securely.' }];
        const response = processInput("How are votes counted?", faqs);
        expect(response.message).toBe("Securely.");
    });

    test('Smart suggestion triggered post-eligibility context update', () => {
        updateContextFromEligibility({ eligible: true });
        expect(__test_getContext().age).toBe('18+');
    });
});
