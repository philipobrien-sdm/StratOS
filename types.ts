// Enums for standardizing inputs and outputs
export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export enum StakeholderInterest {
  Low = 'Low',
  High = 'High',
}

export enum StakeholderInfluence {
  Low = 'Low',
  High = 'High',
}

export enum ScenarioType {
  BestCase = 'Best Reasonable Case',
  ProbableCase = 'Probable Case',
  WorstCase = 'Reasonable Worst Case',
}

// 2.1 User Inputs
export interface Goal {
  id: string;
  description: string;
  type: 'Primary' | 'Secondary';
  successCriteria: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  influence: StakeholderInfluence;
  interest: StakeholderInterest;
  baseSupport: 'Supporter' | 'Neutral' | 'Detractor';
  engagementStrategy?: string; // Field for adopted AI strategies
}

export interface Deliverable {
  id: string;
  name: string;
  dueDate: string;
  dependencies: string; // Comma separated IDs or names
}

export interface KnownRisk {
  id: string;
  description: string;
  likelihood: number; // 0-1
  impact: number; // 1-10
  category: string;
  currentMitigations?: string; // Field for adopted AI mitigations
}

export interface UserInputs {
  organization: string;
  goals: Goal[];
  stakeholders: Stakeholder[];
  deliverables: Deliverable[];
  knownRisks: KnownRisk[];
}

// 2.2 AI Analysis Types

export interface AIScenario {
  title: string;
  type: ScenarioType;
  narrative: string;
  probability: number; // 0-100
  impactLevel: number; // 1-10
  effortToAchieve: number; // 1-10
  fragilityMarkers: string[];
}

export interface AIMitigation {
  riskId: string;
  action: string;
  effortCost: number; // 1-10
  effectiveness: number; // 1-10
  residualRisk: number; // 0-1 (likelihood)
}

export interface AIStakeholderStrategy {
  stakeholderId: string;
  predictedBehaviour: string;
  leveragePoints: string[];
  communicationCadence: string;
}

export interface ExpandedRisk extends KnownRisk {
  isAIGenerated: boolean;
  contagionEffects?: string[];
  cluster?: string;
  mitigations?: AIMitigation[];
}

export interface DecisionGate {
  name: string;
  purpose: string;
  entryCriteria: string[];
  exitCriteria: string[];
  failureConditions: string[];
}

export interface AnalysisResult {
  scenarios: AIScenario[];
  expandedRisks: ExpandedRisk[];
  stakeholderStrategies: AIStakeholderStrategy[];
  decisionGates: DecisionGate[];
  deltas: string[]; // List of explicit changes from previous version
  executiveSummary: string;
}

// Outcome Targeting (Module 6)
export interface ActionPlan {
  targetOutcome: string;
  steps: { order: number; action: string; owner: string }[];
  cumulativeCost: number;
  residualProbabilityOfFailure: number;
  newRisks: string[];
}

// Root State Object
export interface ProjectVersion {
  version: number;
  timestamp: string;
  schemaVersion: string;
  inputs: UserInputs;
  analysis: AnalysisResult | null;
  actionPlan?: ActionPlan | null;
}

export const INITIAL_INPUTS: UserInputs = {
  organization: '',
  goals: [],
  stakeholders: [],
  deliverables: [],
  knownRisks: [],
};
