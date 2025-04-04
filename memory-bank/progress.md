# Progress: Collector Business Plan Analyzer

## Current Status (As of: 2025-04-04 @ 14:20)

*   **Phase:** Phase 2 Implementation (Core Logic & UI Refinement)
*   **Overall Progress:** ~40% (Capacity constraint modeling added to monthly simulation)

## What Works

*   Project setup (Vite, TS, Git).
*   Core dependencies installed.
*   Redux store configured with persistence (`staff`, `stages`, `costs`, `financials` slices).
*   Basic MUI theme applied.
*   Routing between pages for all main modules.
*   Base Layout component with navigation.
*   ESLint/Prettier configured.
*   Type definitions created for Staff, Stages, Costs, Financials (including Stage dependencies).
*   **Staff Module:** Display table with sorting, Add/Edit/Delete staff via modal form with validation. **Staff form includes efficiency and max caseload inputs.** `StaffType` and `staffSlice` updated accordingly.
*   **Stages Module:** Display stages/sub-stages in accordion, Add/Edit/Delete stages via modal form (including dependency selection UI) with validation, Add/Edit/Delete sub-stages via modal form with validation. **`WorkflowVisualizer` updated to show next stage dependencies.** `nextStageIds` added to `Stage` type.
*   **Costs Module:** Display table with **sorting and filtering (name, tag, periodicity)**, Add/Edit/Delete costs via modal form with validation. `setCostList` action added to slice.
*   **Labor Cost Module:** Calculation functions (`calculateHourlyRate`, `calculateSubStageExecutionCost`, `calculateAnnualCaseloadLaborCost`, `distributeCases`). **Sub-stage cost calculation now incorporates staff efficiency.** Caseload distribution configuration UI (`CaseloadDistributionConfig`) implemented and integrated. **Renamed `calculateTotalAnnualWorkHours` to `calculateAvailableMonthlyWorkHours` and adjusted to calculate monthly capacity.** **Added `calculateSubStageEffectiveHours` for efficiency-adjusted time.** **Added `calculateRequiredAnnualWorkloadHours` considering efficiency.** **`LaborCostDisplay` component updated to show fixed/variable costs, total cost, required workload, available capacity, and utilization percentage.** `DistributionVisualizer` implemented with Recharts PieChart.
*   **Financials Module:** Configuration forms (`DebtPortfolioConfig`, `FinancialParamsConfig`) with validation implemented. Scenario management UI (`ScenarioComparison`) with Save/Load/Delete/Reset functionality. **Scenario save/load logic refined to handle full state (staff, stages, costs, financials, caseload) using a thunk action (`loadScenarioAndDependencies`).** Calculation functions updated with initial logic for `generateCashFlow`, `generatePnL`, `calculateBreakEven`, `calculateNPV`, `calculateEBITDA`, `calculateAverageCollectionTime`, `calculateOverallRecoveryRate`, `calculateCostPerCase`. **`calculateOverallRecoveryRate` uses a simulation based on stage dependencies, recovery, and write-off probabilities.** **`generateCashFlow` uses a time-based simulation (`simulateMonthlyCaseFlow`) to distribute income and variable labor costs (variable cost distribution refined to be proportional to monthly work completion).** **`simulateMonthlyCaseFlow` now models staff capacity constraints, slowing progression if workload exceeds monthly capacity.** **`calculateAverageCollectionTime` implemented using BFS simulation considering dependencies, durations, and probabilities.** `FinancialReport` component displays basic CF table and P&L summary. `TimelineVisualizer` implemented with basic Recharts LineChart for cumulative CF.
*   **Dashboard Module:** Basic layout using Box workaround. Includes `LaborCostDisplay`, `FinancialMetricsDisplay` (displaying calculated metrics), and `KeyCharts` (displaying basic CF/P&L charts).
*   Application is runnable in dev mode (`npm run dev`).

## What's Left to Build (High-Level based on `restructured_tasks.md`)

1.  **Task 1:** ~~Project Setup & Architecture~~ (Completed)
2.  **Task 2:** ~~Staff Management Module (Refine UI - filtering)~~ (Completed)
3.  **Task 3:** ~~Collection Stages Module (Implement dependency logic in calculations/visualizations)~~ (Completed - Core logic implemented)
4.  **Task 4:** ~~Labor Cost Calculation Module (Refine caseload logic - efficiency, capacity; connect calculations fully to UI)~~ (Completed)
5.  **Task 5:** ~~Cost Management Module (Refine UI - sorting/filtering)~~ (Completed)
6.  **Task 6:** Financial Modeling Module (Implement IRR calculation, refine other calculations - cost dates, dependencies, efficiency, capacity; refine Scenario logic) - **(Partially Completed: Scenario logic refined; Capacity impact modeled in simulation; Scenario UI pending)**
7.  **Task 7:** Dashboard & Visualization Module (Refine charts, add more visualizations - e.g., monthly utilization)
8.  **Task 8:** Testing (Unit, Integration, E2E - **Need tests for capacity constraint**)
9.  **Task 9:** Documentation (User & Technical)
10. **Task 10:** Deployment & Support

## Known Issues / Blockers

*   **MUI Grid Type Errors:** Persistent TypeScript errors related to MUI `Grid` component props required using a workaround with `Box` and flexbox for layout in several components.
*   **Calculation Simplifications:** **Staff efficiency is now included in labor cost and workload calculations.** Stage dependencies are considered in recovery rate, average time, and monthly CF simulations. Simulations use simplified equal distribution for branches and max stage duration for monthly flow. IRR calculation implemented and annualized. **Capacity calculation uses total available monthly hours; the impact of utilization > 100% on throughput/cost is now modeled in `simulateMonthlyCaseFlow` by slowing progression.**
*   **Placeholder Components:** Some visualization components (`TimelineVisualizer`) show basic data but need refinement. `WorkflowVisualizer` shows next stages. `LaborCostDisplay` shows key metrics including utilization. Scenario comparison UI needs implementation.
