/**
 * @file eligibility.test.js
 * @description Tests for the eligibility logic module.
 */
import { __test_evaluate } from '../js/eligibility.js';

describe('Eligibility Logic', () => {
    test('Returns false if under 18', () => {
        expect(__test_evaluate({ age: 'no', citizen: 'yes', residency: 'yes' })).toBe(false);
    });

    test('Returns false if non-citizen', () => {
        expect(__test_evaluate({ age: 'yes', citizen: 'no', residency: 'yes' })).toBe(false);
    });

    test('Returns false if no fixed address', () => {
        expect(__test_evaluate({ age: 'yes', citizen: 'yes', residency: 'no' })).toBe(false);
    });

    test('Returns true if all criteria met (exactly 18+)', () => {
        expect(__test_evaluate({ age: 'yes', citizen: 'yes', residency: 'yes' })).toBe(true);
    });

    test('Returns false if multiple criteria fail', () => {
        expect(__test_evaluate({ age: 'no', citizen: 'no', residency: 'yes' })).toBe(false);
    });
});
