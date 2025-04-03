# Project Plan: Collector Business Plan Analyzer

This plan outlines the steps to build the interactive web application based on the requirements in `restructured_tasks.md`.

## Phase 1: Project Setup & Core Architecture (Task 1)

1.  **Initialize Project:**
    *   Use Vite to create a new React project with the TypeScript template (`npm create vite@latest collector-bp-app -- --template react-ts`).
    *   Navigate into the project directory (`cd collector-bp-app`).
    *   Initialize Git repository (`git init`).
2.  **Install Core Dependencies:**
    *   Install Redux Toolkit, React-Redux, Redux Persist (`npm install @reduxjs/toolkit react-redux redux-persist`).
    *   Install Material-UI (MUI) core and icons (`npm install @mui/material @emotion/react @emotion/styled @mui/icons-material`).
    *   Install React Router (`npm install react-router-dom`).
    *   Install Recharts (`npm install recharts`).
    *   Install Formik and Yup (`npm install formik yup`).
3.  **Configure Redux & Persistence:**
    *   Set up Redux store (`src/store/store.ts`) using `configureStore`.
    *   Configure `redux-persist` to save the entire state to `localStorage`.
    *   Define initial empty state structure with slices placeholders (e.g., `staffSlice`, `stagesSlice`, etc.).
4.  **Setup MUI Theme:**
    *   Create a basic MUI theme (`src/theme.ts`).
    *   Wrap the application in `ThemeProvider` in `src/main.tsx`.
5.  **Establish Project Structure:**
    *   Create main directories: `src/components`, `src/pages` (or `src/modules`), `src/store`, `src/hooks`, `src/utils`, `src/types`, `src/assets`.
    *   Create subdirectories within `src/pages` (or `src/modules`) for major features: `StaffManagement`, `CollectionStages`, `Costs`, `FinancialModeling`, `Dashboard`.
6.  **Implement Routing:**
    *   Set up basic routing in `src/App.tsx` using `react-router-dom` to link to placeholder pages for each module.
7.  **Create Base UI Components:**
    *   Create a main `Layout` component (`src/components/Layout/Layout.tsx`) including a persistent Header/AppBar and potentially a Sidebar/Navigation drawer using MUI components.
    *   Integrate the `Layout` into `src/App.tsx`.
8.  **Setup Linting/Formatting:**
    *   Configure ESLint and Prettier with appropriate plugins for React/TypeScript.

## Phase 2: Feature Implementation (Tasks 2-7)

*(These phases can have some overlap, but generally follow this order)*

### 2.1. Staff Management Module (Task 2)

1.  **Redux:** Create `staffSlice.ts` with state structure (array of staff types) and reducers (add, edit, delete). Include initial default staff data.
2.  **Types:** Define `StaffType` interface in `src/types/staff.ts`.
3.  **Components:**
    *   `StaffTable.tsx`: Display staff using MUI `Table`. Include sorting/filtering.
    *   `StaffForm.tsx`: Form (using Formik/Yup) for adding/editing staff types (Position, Salary, Hours, Efficiency).
    *   `StaffManagementPage.tsx`: Main page for this module, integrating table and form/modal.
4.  **Validation:** Implement Yup validation schema for the staff form.

### 2.2. Collection Stages Module (Task 3)

1.  **Redux:** Create `stagesSlice.ts` with state (stages, sub-stages, dependencies) and reducers. Include initial default stage data.
2.  **Types:** Define `Stage`, `SubStage` interfaces in `src/types/stages.ts`.
3.  **Components:**
    *   `StagesConfigurator.tsx`: Interface for adding/editing/deleting stages and sub-stages, assigning staff, setting times/repetitions.
    *   `WorkflowVisualizer.tsx`: (Potentially complex) Component to display the stage workflow (maybe using a library or custom SVG).
    *   `CollectionStagesPage.tsx`: Main page integrating configurator and visualizer.
4.  **Validation:** Implement Yup validation for stage configuration.
5.  **Logic:** Implement logic for handling stage dependencies.

### 2.3. Labor Cost Calculation Module (Task 4)

1.  **Logic:**
    *   Develop calculation functions/selectors (likely in `src/utils` or Redux selectors) to compute labor costs per stage and overall, based on staff salaries/hours/efficiency and stage assignments/times.
    *   Implement caseload distribution logic.
2.  **Redux:** Potentially add state to `financialsSlice` for caseload distribution percentages.
3.  **Components:**
    *   `LaborCostDisplay.tsx`: Show calculated costs.
    *   `CaseloadDistributionConfig.tsx`: Interface to set distribution percentages per stage.
    *   `DistributionVisualizer.tsx`: Chart (Recharts) showing caseload distribution.
    *   Integrate these into relevant pages (e.g., Dashboard or a dedicated analysis page).

### 2.4. Cost Management Module (Task 5)

1.  **Redux:** Create `costsSlice.ts` for capital, operational, and variable costs, including tags and periodicity.
2.  **Types:** Define `CostItem` interface in `src/types/costs.ts`.
3.  **Components:**
    *   `CostInputForm.tsx`: Formik/Yup form for adding/editing costs.
    *   `CostTable.tsx`: Display costs with filtering/sorting by tags/periodicity.
    *   `CostManagementPage.tsx`: Main page for this module.

### 2.5. Financial Modeling Module (Task 6)

1.  **Redux:** Create/Expand `financialsSlice.ts` for parameters (debt portfolio, recovery rates, taxes, discount rate, scenarios).
2.  **Types:** Define interfaces for financial parameters, debt portfolio settings.
3.  **Logic:** Implement core financial calculation functions (`src/utils/financialCalculations.ts`):
    *   Cash Flow (CF) generation (12 months).
    *   Profit & Loss (P&L) generation.
    *   Break-even point calculation.
    *   IRR, NPV, EBITDA calculations.
    *   Collection timeline calculation (considering stage durations).
    *   Recovery rate calculation.
    *   Cost per collection calculation.
    *   Staff capacity check based on caseload and hours.
4.  **Components:**
    *   `DebtPortfolioConfig.tsx`: Form to set up caseload, avg. debt, recovery assumptions, stage distribution.
    *   `FinancialParamsConfig.tsx`: Form for taxes, discount rate etc.
    *   `FinancialReport.tsx`: Display CF, P&L reports.
    *   `ScenarioComparison.tsx`: UI to manage and compare different scenarios (requires state design for scenarios).
    *   `TimelineVisualizer.tsx`: Chart showing case progression over time.
    *   `FinancialModelingPage.tsx`: Main page integrating configuration and reports.

### 2.6. Dashboard & Visualization Module (Task 7)

1.  **Components:**
    *   `DashboardPage.tsx`: Main dashboard layout.
    *   Individual `MetricCard.tsx` components for key numbers (e.g., Total Cost, Projected Profit, Break-Even Point).
    *   Integrate various charts (using Recharts) from other modules (e.g., CF projection, P&L summary, cost breakdown, labor cost per stage, cost per case).
    *   `ReportExporter.tsx`: Component/utility for exporting data (e.g., to CSV or PDF - might require additional libraries).
    *   Integrate scenario analysis view.

## Phase 3: Quality Assurance & Documentation (Tasks 8-9)

1.  **Unit & Integration Testing (Task 8):**
    *   Write Jest/RTL tests for utility functions (especially calculations), Redux reducers/selectors, and critical components.
    *   Aim for good test coverage of core logic.
2.  **E2E Testing (Task 8):**
    *   Define key user flows.
    *   (Optional/Manual initially) Perform manual E2E tests. Implement automated E2E tests later if required (Cypress/Playwright).
3.  **CI/CD Setup (Task 8):**
    *   Configure GitHub Actions (or similar) to run linting, tests, and build on pushes/PRs.
4.  **Documentation (Task 9):**
    *   Write `USER_GUIDE.md`.
    *   Write `TECHNICAL_DOCUMENTATION.md` covering architecture, state, key algorithms.
    *   Add JSDoc/TSDoc comments to code.

## Phase 4: Deployment & Support (Task 10)

1.  **Build Optimization:** Configure Vite for production build (`npm run build`).
2.  **Environment Variables:** Set up handling for any necessary environment variables.
3.  **Deployment:** Deploy the static frontend build to Netlify/Vercel/GitHub Pages.
4.  **Persistence Check:** Verify Redux Persist functionality in the deployed environment.
5.  **(Optional) Backend:** If backend is implemented, deploy it and configure frontend-backend communication.
6.  **Monitoring:** Set up basic uptime/performance monitoring (if required).

## Adherence to Constraints

*   **100-Line Limit:** Components and utility files will be kept concise. Complex logic will be broken down into smaller, reusable functions. State logic resides in Redux slices. Pages/Modules will primarily orchestrate components.
*   **Russian Comments:** Comments explaining new logic or complex sections will be added in Russian as development progresses.

This plan provides a structured approach. Specific implementation details within each step will be refined during development.
