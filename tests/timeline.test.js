/**
 * @file timeline.test.js
 * @description Tests for timeline phase calculation.
 */
import { getCurrentPhase } from '../js/timeline.js';

const mockTimeline = {
    "registration": { "start": "2026-01-01", "end": "2026-09-30" },
    "campaigning": { "start": "2026-10-01", "end": "2026-11-02" },
    "voting": { "start": "2026-11-03", "end": "2026-11-03" },
    "counting": { "start": "2026-11-04", "end": "2026-11-10" },
    "results": { "start": "2026-11-11", "end": "2026-12-31" }
};

describe('Timeline Logic', () => {
    test('Date in registration phase', () => {
        expect(getCurrentPhase(mockTimeline, "2026-05-15T12:00:00Z")).toBe('registration');
    });

    test('Date in voting phase', () => {
        expect(getCurrentPhase(mockTimeline, "2026-11-03T14:00:00Z")).toBe('voting');
    });

    test('Date in results phase', () => {
        expect(getCurrentPhase(mockTimeline, "2026-11-15T09:00:00Z")).toBe('results');
    });

    test('Date before all phases', () => {
        expect(getCurrentPhase(mockTimeline, "2025-12-31T23:59:59Z")).toBe('none');
    });

    test('Date after all phases', () => {
        expect(getCurrentPhase(mockTimeline, "2027-01-01T00:00:00Z")).toBe('none');
    });
});
