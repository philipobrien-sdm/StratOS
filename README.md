# StratOS — Adaptive Strategic Planning & Risk Engine

StratOS is an intelligent strategic planning tool designed to help organizations model projects, anticipate risks, and engineer successful outcomes using the power of Generative AI. It moves beyond static spreadsheets by providing a dynamic, recalibrating model of your project's ecosystem.

## 🚀 Purpose

StratOS captures your project's goals, stakeholders, deliverables, and known risks, then uses the **Google Gemini API** to:
1.  **Expand Risk Horizons**: Identify hidden risks and contagion effects (domino effects) that humans might miss.
2.  **Generate Scenarios**: Forecast Best, Probable, and Worst-case futures with detailed narratives and fragility markers.
3.  **Engineer Mitigations**: Propose specific, actionable steps to reduce risk exposure and calculate residual risk.
4.  **Strategize Engagement**: Analyze stakeholder positions and suggest leverage points to build support.
5.  **Target Outcomes**: Generate step-by-step action plans to achieve specific strategic targets (e.g., "Avoid Worst Case").

## ✨ Key Features

### 1. Project Definition
- **Structured Inputs**: Define Primary/Secondary Goals, Stakeholders (influence/interest), Deliverables (dependencies), and Known Risks.
- **Smart Add**: Paste unstructured text (emails, meeting notes, briefs) and let AI parse it into structured data automatically.
- **Test Case Loader**: Instantly load a comprehensive "Rivertown Bridge" scenario to explore the tool's capabilities without manual data entry.

### 2. AI-Powered Analysis
- **Risk Landscape**: Visualizes risks on a dynamic scatter plot (Impact vs. Probability). Hover to see deep insights.
- **Scenario Modeling**: Visualizes the probability and effort required for different future states.
- **Stakeholder Intelligence**: Predicts behavior and suggests communication cadences.
- **Decision Gates**: Auto-generates governance gates with strict entry/exit criteria.

### 3. Adaptive Feedback Loop
- **Adoption & Recalibration**: Users can "Adopt" AI-suggested mitigations and strategies directly into their project plan.
- **Version Control**: Tracks the evolution of your strategy with immutable snapshots of project states.
- **Outcome Targeting**: Select a desired outcome and receive a generated critical path of actions to achieve it.

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI Model**: Google Gemini 2.5 Flash (via `@google/genai` SDK)
- **Visualization**: Recharts (Risk Scatter Plots, Scenario Bars)
- **Icons**: Lucide React

## 🚦 Getting Started

### Prerequisites
- A Google Gemini API Key (get one at [Google AI Studio](https://aistudio.google.com/)).

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/stratos.git
    cd stratos
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up Environment**:
    Create a `.env` file in the root directory and add your API key. *Note: Ensure this key is handled securely and not exposed in client-side builds for production.*
    ```env
    API_KEY=your_gemini_api_key_here
    ```

4.  **Run the application**:
    ```bash
    npm start
    ```

## 📖 Usage Guide

1.  **Define Context**: Enter your Organization name to ground the AI's understanding.
2.  **Input Data**: Fill out Goals, Stakeholders, Deliverables, and known Risks. Use the "Smart Add" feature to speed this up or "Load Example" to start quickly.
3.  **Run Analysis**: Click the "Analyze" button. StratOS will process your inputs and generate a strategic dashboard.
4.  **Explore & Refine**:
    - **Overview**: See executive summaries and the risk landscape.
    - **Scenarios**: Read through narrative futures.
    - **Risks**: View AI-detected risks and **Adopt** specific mitigations to update your plan.
    - **Stakeholders**: Adopt engagement strategies to manage relationships.
5.  **Plan**: Use "Target Best Case" to generate a specific execution sequence.

---

*Built with precision for strategic thinkers.*
