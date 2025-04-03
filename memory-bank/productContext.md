# Product Context: Collector Business Plan Analyzer

## 1. Problem Solved

Collection agencies need a robust tool to:
*   Accurately model the complex interplay between staffing, collection processes, costs, and financial outcomes.
*   Forecast financial performance based on various operational parameters and debt portfolio characteristics.
*   Analyze the efficiency and cost-effectiveness of different collection strategies and staffing models.
*   Make data-driven decisions regarding resource allocation, process optimization, and business planning.
*   Understand key financial metrics like Cash Flow, P&L, break-even point, IRR, NPV, and EBITDA in the context of their specific operations.

Existing tools might be too generic (like spreadsheets) or lack the specific focus on collection agency workflows and metrics.

## 2. How It Should Work (User Experience)

*   **Intuitive Interface:** Users should be able to easily navigate between different modules (Staff, Stages, Costs, Finance, Dashboard).
*   **Configurable:** Allow detailed customization of staff roles, salaries, working hours, efficiency, collection stages, stage timings, task durations, costs (capital, operational, variable), and debt portfolio parameters (volume, average debt, recovery rates, distribution).
*   **Interactive:** Changes in one module (e.g., adding staff) should immediately reflect in relevant calculations (e.g., labor costs, financial projections).
*   **Visual:** Provide clear visualizations (charts, graphs, workflows) for complex data like financial projections, cost breakdowns, stage dependencies, and key metrics.
*   **Scenario Analysis:** Enable users to create, compare, and save different business plan scenarios.
*   **Persistence:** User configurations and plans should be saved (initially via localStorage, potentially via backend later) so they can resume work later.
*   **Reporting:** Allow exporting key reports and visualizations.

## 3. Core Functionality Areas

*   **Setup & Configuration:** Defining staff, collection stages, costs, and debt portfolio parameters.
*   **Calculation Engine:** Calculating labor costs, total costs, financial projections (CF, P&L), break-even, IRR, NPV, EBITDA, recovery rates, collection timelines based on inputs.
*   **Visualization & Analysis:** Displaying results through dashboards, charts, and reports.
*   **Scenario Management:** Saving, loading, and comparing different business plan models.
