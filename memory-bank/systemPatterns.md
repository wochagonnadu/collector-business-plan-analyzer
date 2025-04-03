# System Patterns: Collector Business Plan Analyzer

## 1. Overall Architecture

*   **Single Page Application (SPA):** The application will be a frontend-centric SPA built with React.
*   **Client-Side Logic:** Most business logic, calculations, and state management will reside on the client-side.
*   **Optional Backend:** A simple backend (Node.js/Express) might be added later *only if needed* for more robust state persistence (saving/loading plans to files) beyond the capabilities or limitations of `localStorage`. Initially, persistence will rely solely on `localStorage` via Redux Persist.

## 2. Modular Design

The application will be structured into distinct feature modules, likely corresponding to the main sections outlined in the tasks:

*   `StaffManagement`: Handles employee types, roles, salaries, hours, efficiency.
*   `CollectionStages`: Manages the definition, configuration, and dependencies of collection stages and sub-stages.
*   `LaborCost`: Calculates labor costs based on staff and stage configurations.
*   `CostManagement`: Handles capital, operational, and variable costs.
*   `FinancialModeling`: Contains logic for CF, P&L, break-even, IRR, NPV, EBITDA calculations, debt portfolio configuration, and scenario analysis.
*   `Dashboard`: Visualizes key metrics and provides an overview.
*   `Core` / `Shared`: Contains shared components (Layout, UI elements), utilities, routing setup, and Redux store configuration.

## 3. State Management

*   **Redux:** Centralized state management using Redux Toolkit for predictability and maintainability.
*   **Redux Persist:** Used to automatically save the Redux state to `localStorage`, allowing users to close and reopen the application without losing their work. The entire application state (staff, stages, costs, financial parameters, etc.) will be persisted.
*   **Slices:** State will be organized into slices corresponding to the major modules (e.g., `staffSlice`, `stagesSlice`, `costsSlice`, `financialsSlice`).

## 4. UI Components & Layout

*   **Material-UI (MUI):** Used as the primary component library for UI elements (buttons, forms, tables, layout components).
*   **Layout Workaround:** Due to persistent TypeScript errors with MUI `Grid` (v7) in this project setup (React 19, TS 5.7), layout within forms (`StaffForm`, `CostInputForm`, `DebtPortfolioConfig`) and the Dashboard page is implemented using MUI `Box` components with flexbox (`display: 'flex', flexWrap: 'wrap', gap: ...`) instead of `Grid container` and `Grid item`. This pattern should be followed for consistency unless the underlying type issue is resolved.
*   **Custom Components:** Specific components will be built for complex UI elements like the workflow visualization.

## 5. Routing

*   **React Router:** Used for client-side navigation between the different modules/pages of the application.

## 6. Data Visualization

*   **Recharts:** Employed for creating interactive charts and graphs for the dashboard and financial reports.

## 7. Forms and Validation

*   **Formik:** Used for managing form state and submission logic.
*   **Yup:** Used for defining validation schemas, integrated with Formik.
*   **MUI Integration:** Standard MUI components (e.g., `TextField`, `Select`) are used. Due to type issues with `formik-mui` bindings (alpha version) and MUI v7, fields are connected manually using Formik's render props (`values`, `handleChange`, `handleBlur`, `touched`, `errors`). This pattern should be followed.

## 8. Persistence Strategy

*   **Initial:** `localStorage` via `Redux Persist`. Suitable for single-user, single-browser sessions.
*   **Potential Future:** File-based saving/loading via an optional simple backend API if sharing plans or more robust persistence is required.
