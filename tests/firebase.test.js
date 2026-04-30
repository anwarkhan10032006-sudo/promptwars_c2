/**
 * @file firebase.test.js
 * @description Tests for firebase fallback logic.
 */
import { initFirebase, fetchAppData } from '../js/firebase.js';

// Mock global firebaseModules to simulate failure
beforeEach(() => {
    delete window.firebaseModules;
    // Mock fetch for fallback
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ phases: [], timeline: {}, faqs: [] }),
        })
    );
    // Mock sessionStorage
    Storage.prototype.getItem = jest.fn(() => null);
    Storage.prototype.setItem = jest.fn();
});

describe('Firebase Fallback Logic', () => {
    test('Firebase failure triggers error boundary and sets fallback mode', async () => {
        const result = await initFirebase();
        expect(result.fallback).toBe(true);
        expect(result.source).toBe('firebase');
    });

    test('fetchAppData uses local fallback if initialization failed', async () => {
        await initFirebase(); // will fail and set useFallback
        const data = await fetchAppData();
        expect(global.fetch).toHaveBeenCalledWith('./data/fallback.json');
        expect(data).toHaveProperty('phases');
    });
});
