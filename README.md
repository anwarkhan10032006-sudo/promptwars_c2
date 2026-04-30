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
   - Uses the Google Maps JavaScript API combined with the HTML5 Geolocation API. 
   - Users can search for their EPIC number or select a polling station to dynamically drop a pin on the map.
   - Clicking "Get Directions" automatically triggers a route from the user's current GPS location to the polling booth on Google Maps.
2. **EPIC Database Lookup**: A mocked database successfully resolves EPIC IDs (e.g., `KAR0012345678`), delivering customized polling station details including distance, constituency, and address.
3. **Responsive Timeline & FAQ**: A dynamic stepper guides users through the election phases (Registration, Campaigning, Voting, Counting, Results), while a live-filtering FAQ databank instantly resolves common queries.
4. **Adaptive UI**: The entire layout responds dynamically using flex-wrap and media queries. On mobile screens (<768px), the UI elegantly collapses into a stack, revealing a convenient hamburger menu for navigation.

## 📝 Assumptions Made
- **EPIC Database**: Assumed a mock static JSON object (`EPIC_DB`) represents an external backend service for retrieving voter details.
- **Google Maps API**: Assumed a standard integration without requiring a fully unrestricted production API key (runs smoothly using the default development configuration).
- **Geolocation Permissons**: Assumed users will grant location access to their browser when clicking "Get Directions." If denied, a fallback routes them to a destination-only map URL.
- **Data Completeness**: Assumed the 6 documents listed in the Eligibility Check comprehensively cover the standard voter identification requirements in India.
