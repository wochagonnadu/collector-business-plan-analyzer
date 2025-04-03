# Project Brief: Collector Business Plan Analyzer

## 1. Overview

Develop an interactive web application designed for creating and analyzing business plans specifically for collection agencies. The application will enable users to:

*   Configure staffing levels and roles.
*   Define and customize debt collection stages.
*   Calculate labor costs based on configured staff and stages.
*   Model financial projections (Cash Flow, P&L, Break-even).
*   Visualize key business metrics through an interactive dashboard.

## 2. Core Goal

Provide a tool for collection agencies to model, analyze, and optimize their business operations and financial performance through configurable parameters and scenario analysis.

## 3. Target Audience

Management and analysts within collection agencies.

## 4. Key Features (High-Level)

*   Staff Management Module
*   Collection Stages Configuration Module
*   Labor Cost Calculation Module
*   Financial Modeling Module (CF, P&L, Break-even, IRR, NPV, EBITDA)
*   Cost Management Module
*   Debt Portfolio Configuration (Volume, Amounts, Recovery Rates)
*   Interactive Dashboard & Visualization
*   Scenario Comparison
*   Reporting & Exporting
*   State Persistence (Save/Load plans)

## 5. Technology Stack

*   **Frontend:** React.js with TypeScript, Redux (with Redux Persist), Material-UI, Recharts, Formik + Yup
*   **Backend (Optional):** Node.js with Express (primarily for saving/loading state to a file if localStorage persistence is insufficient).
*   **Development Tools:** Vite, Jest, React Testing Library, ESLint, Prettier, Git.
