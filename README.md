# 🌟 ElectraGuide: Production-Ready Hackathon Submission

**ElectraGuide** is an intelligent, high-fidelity Civic Tech platform designed to streamline voter awareness, eligibility verification, and polling station navigation. It features a robust offline-first fallback architecture and deep integration with Google Cloud Services.

---

## ☁️ Google Services Used
- **Firebase Realtime Database:** High-speed lookup for voter EPIC data.
- **Firebase Firestore:** Live data storage layer for analytics, wizard completions, bot queries, and dynamic FAQ configurations.
- **Firebase Analytics:** In-depth conversion tracking and dwell-time metrics.
- **Google Maps JS SDK:** Interactive polling station visualization.
- **Maps Geometry Library:** Haversine formula computation for dynamic user-to-booth distance.
- **Maps Directions API:** Real-time ETA generation (walking/driving mode based on distance).

---

## 🏛️ Hybrid Architecture Diagram
```text
          [User Action: EPIC Lookup]
                     |
            (Firebase Active?)
            /                \
         YES                  NO
          |                    |
[Fetch Realtime DB]   [Fallback: local JSON]
          |                    |
 (Distance Math)        (Static Math)
          |                    |
[Geometry compute]             |
          |                    |
[Directions API (ETA)]         |
          \                    /
        [Render Match & Save to Firestore]
```

---

## 🛡️ Fallback Chain Documentation
Every Google Service implementation is wrapped in strict timeout boundaries to ensure the UI never freezes:
- **EPIC Lookup (Realtime DB):** Races against a 2.5s timeout. Falls back to static `EPIC_DB`.
- **Maps Initialization:** Script is lazy-loaded only when the user opens the map tab.
- **Geometry API:** If Geolocation is denied by the user, distance degrades from `1.4 km (Dynamic)` to `1.4 km (Location unavailable)`.
- **Directions API:** Wrapped in a silent try/catch. If routing fails, the ETA drops and distance degrades to `(ETA unavailable)`.
- **Firestore FAQs:** Races against a 2.0s timeout. Falls back to the hardcoded `FAQS` array.
- **Bot Quick Replies:** If Firestore fetch fails, silently fails and retains the originally rendered HTML chips.

---

## 📊 Analytics Events Table
| Event Name | Trigger Condition | Console Output |
| --- | --- | --- |
| `EPIC_Lookup` | User submits an EPIC code | `[Analytics] EPIC Lookup Triggered { epic: '...' }` |
| `Eligibility_Completed` | User finishes step 4 of Wizard | `[Analytics] Eligibility Completed Triggered { success: true }` |
| `Map_Tab_Viewed` | User clicks the Map navigation link | `[Analytics] Map Tab Viewed Triggered` |
| `Navigation_Started` | User clicks "Get Directions" on a pin | `[Analytics] Navigation Started Triggered { lat, lng }` |
| `Bot_Message_Sent` | User sends a query to ElectraBot | `[Analytics] Bot Message Sent Triggered { query: '...' }` |
| `Feature_Used` | Any major component interaction | `[Analytics] Feature Used Triggered { feature: '...' }` |
| `Tab_Dwell` | User switches away from a tab | `[Analytics] Tab Dwell Triggered { tab: '...', seconds: 'X.X' }` |

---

## 🔒 Security Measures
- **Content Security Policy (CSP):** Strict `<meta>` tag prevents Cross-Site Scripting (XSS) and controls external script execution.
- **Input Sanitization:** All user inputs (EPIC numbers, Chatbot queries, DOM injections) pass through a rigorous Regex HTML escaping function.
- **No API Keys in Frontend:** Production deployments rely on `process.env` configurations via Cloud Run, avoiding hardcoded secrets in the repository.
- **Error Handling:** Zero unhandled Promise rejections. All async operations explicitly log `[ElectraGuide Error]` to the console without interrupting user flow.

---

## 🚀 Running the Project
```bash
npm install
npm start
```
*Note: Ensure `$env:PORT="8080"` is set before running in development.*
