# VenueFlow - Project Progress

## Project Overview
**VenueFlow** is a web application designed to improve the physical event experience for attendees at large-scale sporting venues. It addresses challenges such as crowd movement, waiting times, and real-time coordination to ensure a seamless and enjoyable experience.

## Technology Stack
* **Frontend:** React 19, Vite, TypeScript
* **Styling:** Tailwind CSS, shadcn/ui
* **Animations & Interactions:** `motion` (Framer Motion), `react-zoom-pan-pinch`
* **Backend & Real-time:** Firebase (Firestore, Authentication)
* **Testing:** Vitest, React Testing Library, jsdom
* **Icons:** `lucide-react`

## Features Implemented

### 1. Attendee Experience
* **Ticket Entry:** 
  * Landing screen for users to input seat information.
  * Supports manual entry with format validation (`Standname_Row_Column_Seat`, e.g., `North_A_1_12`).
  * Simulated QR code scanning UI.
* **Interactive Stadium Map:**
  * Custom SVG representation of the stadium (Pitch, Gates N/S/E/W, Stands).
  * Pinch-to-zoom and drag-to-pan functionality.
  * Dynamic highlighting of the user's target stand and recommended entry gate.
  * Animated routing path from the gate to the stand.
* **Routing & Navigation:**
  * **Recommended Path Panel:** Displays seat details, recommended gate, live wait times (synced from Firebase), and step-by-step indoor instructions.
  * **Outdoor Navigation:** Integration with Google Maps to route users to their specific stadium gate.
  * **Indoor Navigation:** A full-screen, 2.5D animated map experience guiding users step-by-step to their seats.
* **Personalized Recommendations:**
  * Horizontally scrolling carousel of nearby amenities (restrooms, food, merchandise) tailored to the user's specific stand.
* **Live Alerts:**
  * Real-time banner at the top of the app displaying global alerts (Info, Warning, Critical) broadcasted by venue staff.

### 2. Staff Command Center (Dashboard)
* **Authentication:** Secured via Google Sign-In (Firebase Auth).
* **Gate Management:** 
  * Sliders to update live wait times for each gate.
  * Real-time synchronization with the attendee app via Firestore.
* **Global Broadcast System:** 
  * Form to compose and send alerts with varying severity levels.
  * Real-time delivery to all active attendee screens.
  * Alert history and management (ability to clear active alerts).
* **Zone Density:** Mock display of current capacity percentages across different stands.

### 3. Quality & Infrastructure
* **Accessibility (a11y):** Implemented ARIA labels across interactive elements (buttons, inputs) for screen reader support.
* **Testing:** Configured Vitest and React Testing Library. Added initial integration tests for the main App component.
* **Database Security:** Configured Firestore Security Rules to ensure only authenticated staff can write data, while attendees have read-only access.

## Next Steps / Future Considerations
* Implement the Gemini AI Assistant ("Smart Venue Guide") for natural language queries.
* Replace mock Zone Density data with real sensor/ticket scan data.
* Expand unit and integration test coverage.
* Conduct a comprehensive accessibility audit.
