# Tech Context: Collector Business Plan Analyzer

## 1. Frontend Framework & Language

*   **Framework:** React.js (v18 or latest stable)
*   **Language:** TypeScript (for type safety and improved developer experience)

## 2. State Management

*   **Library:** Redux Toolkit (recommended modern approach for Redux)
*   **Persistence:** Redux Persist (to save state to `localStorage`)

## 3. UI Library

*   **Library:** Material-UI (MUI) (for pre-built components and theming)

## 4. Data Visualization

*   **Library:** Recharts (for creating charts and graphs)

## 5. Forms & Validation

*   **Form Management:** Formik
*   **Validation:** Yup

## 6. Routing

*   **Library:** React Router (v6 or latest stable)

## 6a. Financial Calculations
*   **IRR Calculation:** `irr` (small library for Internal Rate of Return)

## 7. Development & Build Tools

*   **Build Tool / Dev Server:** Vite (for fast development and optimized builds)
*   **Package Manager:** npm or yarn (will confirm during setup, likely npm)

## 8. Testing

*   **Unit/Integration Testing:** Jest (test runner) + React Testing Library (for testing components)
*   **End-to-End (E2E) Testing:** (Tool to be decided, potentially Cypress or Playwright if needed later)

## 9. Linting & Formatting

*   **Linter:** ESLint (with relevant plugins for React and TypeScript)
*   **Formatter:** Prettier (for consistent code style)

## 10. Version Control

*   **System:** Git
*   **Hosting:** (To be decided, e.g., GitHub, GitLab)

## 11. Backend (Optional - Future Consideration)

*   **Platform:** Node.js
*   **Framework:** Express.js
*   **Purpose:** Primarily for file-based state persistence if `localStorage` proves insufficient. No database is planned initially.

## 12. Deployment (Future Consideration)

*   **Frontend Hosting:** Static hosting platforms like Netlify, Vercel, GitHub Pages, or a custom server setup.
*   **Backend Hosting (if implemented):** Platform-as-a-Service (PaaS) like Heroku, or server-based deployment.
