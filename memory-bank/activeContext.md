# Active Context: Collector Business Plan Analyzer

## Current Focus

*   **Phase 2 Implementation:** Building out the core functionality and UI for the main modules (Staff, Stages, Costs, Financials, Dashboard). Focus is currently on refining the placeholder components and starting to implement core logic (calculations, state updates).

## Recent Changes (Since Initial Planning)

*   **Completed Phase 1 (Project Setup & Core Architecture):**
    *   Initialized Vite project (`collector-bp-app`) and Git repository.
    *   Installed all core dependencies (React, Redux, MUI, Router, Formik, Yup, Recharts, etc.).
    *   Configured Redux store (`store.ts`) with Redux Persist (`localStorage`).
    *   Set up basic MUI theme (`theme.ts`).
    *   Established project directory structure (`src/components`, `src/pages`, `src/store`, etc.).
    *   Implemented basic routing (`App.tsx`) using `react-router-dom`.
    *   Created base `Layout.tsx` component with AppBar navigation.
    *   Configured ESLint and Prettier.
*   **Started Phase 2 (Feature Implementation - Initial Setup):**
    *   **Staff Module:** Created `StaffType`, `staffSlice` (with initial data & reducers), `StaffTable`, `StaffForm` (using Box layout workaround), integrated into `StaffManagementPage` with modal logic. Added Yup validation to form.
    *   **Stages Module:** Created `Stage`/`SubStage` types, `stagesSlice` (with initial data & placeholder reducers), `StagesConfigurator` (display only), `WorkflowVisualizer` (placeholder), integrated into `CollectionStagesPage`.
    *   **Costs Module:** Created `CostItem` type, `costsSlice` (with reducers), `CostInputForm` (using Box layout), `CostTable`, integrated into `CostsPage` with modal logic. Added Yup validation to form.
    *   **Labor Cost Module:** Created `calculations.ts` with basic cost functions, created placeholder components `LaborCostDisplay`, `CaseloadDistributionConfig`, `DistributionVisualizer`.
    *   **Financials Module:** Created `DebtPortfolio`/`FinancialParams`/`Scenario` types, `financialsSlice` (with initial data & reducers), created placeholder/config components `DebtPortfolioConfig`, `FinancialParamsConfig`, `FinancialReport`, `ScenarioComparison`, `TimelineVisualizer`, integrated into `FinancialModelingPage`. Added Yup validation to config forms.
    *   **Dashboard Module:** Updated `DashboardPage` layout (using Box workaround) to include placeholders for key metrics and charts, integrated `LaborCostDisplay`.

## Immediate Next Steps

1.  **Refine UI Components:** Improve the display and interactivity of the created components (e.g., implement actual edit/delete logic in tables, enhance form usability).
2.  **Implement Core Calculations:** Flesh out the placeholder calculation functions in `utils/calculations.ts` (especially financial metrics like CF, P&L, NPV, IRR, BreakEven).
3.  **Connect Calculations to UI:** Display calculated values in the `FinancialReport`, `FinancialMetricsDisplay` (to be created), and `DashboardPage` components.
4.  **Implement Stage Dependencies:** Add logic for handling dependencies between collection stages.
5.  **Implement Caseload Logic:** Develop the caseload distribution configuration and integrate it into labor cost and financial calculations.

## Active Decisions & Considerations

*   **MUI Grid Issue:** Continue using the `Box` with flexbox workaround for layout instead of `Grid` due to persistent type errors. Monitor MUI/TypeScript updates for potential fixes.
*   **Formik Integration:** Continue using manual connection for Formik and standard MUI components.
*   **Calculation Complexity:** Financial calculations (NPV, IRR, detailed CF/P&L) will require careful implementation and potentially external libraries (e.g., for IRR).
*   **Visualization Implementation:** Placeholders for `WorkflowVisualizer`, `DistributionVisualizer`, `TimelineVisualizer`, and charts need actual implementation using Recharts or another library.
*   **State Management for Scenarios:** The current `Scenario` type in `financialsSlice` only saves portfolio/params. A more robust solution might involve saving snapshots of the entire relevant state (staff, stages, costs) per scenario, which adds complexity. Decide on the best approach.
