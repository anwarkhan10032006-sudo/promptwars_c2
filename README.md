# ElectraGuide - Smart Election & Voting Navigation System

## 📌 Vertical Chosen
**Civic Tech & E-Governance (Smart Election Platform)**
The platform tackles the challenge of voter awareness, eligibility verification, and polling station navigation to improve democratic participation.

## 🚀 Approach and Logic
ElectraGuide was designed with a single-page architecture that prioritizes an accessible, mobile-first experience. Our approach focused on:
1. **Unified Interface**: Integrating four distinct flows (Overview Timeline, Eligibility Wizard, Polling Map, and FAQ) into a fluid, responsive grid.
2. **Offline-First Resilience**: All core functionalities run natively in the browser without relying on external databases.
3. **Interactive Verification**: The 4-step eligibility wizard utilizes an intuitive progress-tracking mechanic to quickly inform users of their voting rights.
4. **AI-Driven Assistance**: The "ElectraBot" side panel serves as an always-accessible digital guide, offering automated guidance on common election procedures.

## ⚙️ How the Solution Works
1. **Interactive Navigation Map**: 
   - Uses the Google Maps JavaScript API with the **Geometry library** and HTML5 Geolocation API.
   - Dynamically calculates real-time precise distance from the voter to the polling station using Haversine formulas.
   - Users can search for their EPIC number or select a polling station to drop a pin on the map.
   - Clicking "Get Directions" automatically triggers a route from the user's current GPS location to the polling booth.
2. **Dual-Layer Database System (Firebase + Fallback)**: 
   - Resolves EPIC IDs (e.g., `KAR0012345678`) by aggressively fetching real-time data from **Firebase Realtime Database**.
   - Features a seamless offline-first fallback: If Firebase times out (2.5s) or fails, the system instantly rolls back to a local robust JSON database without freezing the UI.
   - Caches successful lookups via `sessionStorage` for ultra-fast subsequent renders.
3. **Responsive Timeline & FAQ**: A dynamic stepper guides users through the election phases (Registration, Campaigning, Voting, Counting, Results), while a live-filtering FAQ databank instantly resolves common queries.
4. **Adaptive UI**: The entire layout responds dynamically using flex-wrap and media queries. On mobile screens (<768px), the UI elegantly collapses into a stack, revealing a convenient hamburger menu for navigation.

## 📝 Assumptions Made
- **Firebase Database**: Assumed the provided configuration acts as a placeholder to demonstrate cloud readiness, defaulting elegantly to the mocked dataset.
- **Google Maps API**: Assumed a standard integration without requiring a fully unrestricted production API key (runs smoothly using the default development configuration).
- **Geolocation Permissons**: Assumed users will grant location access. If denied, a fallback routes them to a destination-only map URL, and distance defaults to a static estimated value.

## 🛡️ Security & Performance Enhancements
- **Analytics Tracking:** Fully integrated **Firebase Analytics** logging crucial civic events (Eligibility Completed, EPIC Lookups, Navigations).
- **Security:** Strict Content Security Policy (CSP) applied, input sanitization routines designed to prevent XSS payloads, and complete ARIA labeling for accessibility compliance.
- **Performance:** Debounced input listeners on the AI chatbot and lazy-loaded Google Maps scripts (executing only when the Maps view is actively triggered).
