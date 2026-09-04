export type ActionType = 
  | 'NO_ACTION' 
  | 'RETRY' 
  | 'WHATSAPP' 
  | 'VOICE' 
  | 'EMAIL' 
  | 'INCENTIVE';

export type CaseStatus = 
  | 'DETECTED' 
  | 'SCORED' 
  | 'READY' 
  | 'REVIEW' 
  | 'APPROVED' 
  | 'ACTIONED' 
  | 'RECOVERED' 
  | 'FAILED' 
  | 'ESCALATED' 
  | 'MONITORING';

export type DomainType = 
  | 'SUBSCRIPTIONS' 
  | 'CHECKOUT' 
  | 'RECEIVABLES_B2B';

export type DecisionSource = 
  | 'NETWORK' 
  | 'MERCHANT' 
  | 'NETWORK_MERCHANT';

export interface RecoveryCase {
  caseId: string;
  customerId: string;
  customerName: string;
  customerHandle: string;
  merchantId: string;
  domain: DomainType;
  amount: number;
  failureReason: string;
  failureCode?: string;
  attempts: number;
  maxAttempts: number;
  contactsMade: number;
  maxContacts: number;
  issuer?: string;
  status: CaseStatus;
  
  // Causal ML probabilities
  naturalRecoveryProbability: number; // e.g. 0.48 (48%)
  treatmentProbability: number;      // e.g. 0.72 (72%)
  incrementalUplift: number;         // e.g. 0.24 (+24%)
  
  recommendedAction: ActionType;
  recommendedActionLabel: string;
  recommendedTime: string;
  optimalWindow: string;
  
  decisionConfidence: number; // e.g. 0.96 (96%)
  decisionSource: DecisionSource;
  isOOD: boolean; // Out of distribution / limited evidence
  
  createdAt: string;
  updatedAt: string;
}

export interface ActionScore {
  action: ActionType;
  label: string;
  recoveryProbability: number;
  incrementalUplift: number;
  estimatedValue?: number;
  eligible: boolean;
  ineligibilityReason?: string;
}

export interface SHAPAttribution {
  featureName: string;
  label: string;
  contribution: number; // e.g. +0.18 (+18%) or -0.06 (-6%)
  displayValue: string;
}

export interface HistoricalPrecedent {
  caseId: string;
  customerType: string;
  similarity: number;
  actionTaken: ActionType;
  outcome: 'RECOVERED' | 'FAILED';
  amount: number;
  daysAgo: number;
}

export interface NetworkPrior {
  networkWeight: number;      // e.g. 0.70 (70%)
  merchantWeight: number;     // e.g. 0.30 (30%)
  networkSampleSize: number;   // e.g. 12842931
  merchantSampleSize: number;  // e.g. 200
  coldStartBenefit: string;
}

export interface PolicyCheckItem {
  rule: string;
  description: string;
  passed: boolean;
  currentValue: string;
  limitValue: string;
}

export interface PolicyResult {
  passed: boolean;
  checksTotal: number;
  checksPassed: number;
  checks: PolicyCheckItem[];
}

export interface DecisionOutput {
  caseId: string;
  naturalRecoveryProbability: number;
  bestAction: ActionType;
  bestActionLabel: string;
  actionScores: ActionScore[];
  incrementalUplift: number;
  confidence: number;
  timing: {
    recommendedHour: number;
    recommendedTimeText: string;
    optimalWindowText: string;
    curvePoints: { hour: number; probability: number }[];
  };
  explanation: SHAPAttribution[];
  precedents: HistoricalPrecedent[];
  networkPrior: NetworkPrior;
  policy: PolicyResult;
  uncertainty: {
    conformalInterval: [number, number];
    isOOD: boolean;
    coverageLevel: number;
  };
}

export interface ModelHealth {
  overallScore: number;
  upliftModelStatus: 'HEALTHY' | 'WARNING' | 'DEGRADED';
  hazardModelStatus: 'HEALTHY' | 'WARNING' | 'DEGRADED';
  policyEngineStatus: 'HEALTHY' | 'WARNING' | 'DEGRADED';
  dataPipelineStatus: 'HEALTHY' | 'WARNING' | 'DEGRADED';
  featureQualityStatus: 'GOOD' | 'FAIR' | 'POOR';
  auuc: number;
  qini: number;
  medianConfidence: number;
  conformalCoverage: number;
  oodCasesCount: number;
}

export interface FairnessMetrics {
  disparateImpact: number;
  equalOpportunity: number;
  calibrationError: number;
  segments: {
    segmentName: string;
    sampleSize: number;
    avgUplift: number;
    parityGap: number;
    status: 'FAIR' | 'INVESTIGATING' | 'DISPARITY_DETECTED';
  }[];
}

export interface AuditEvent {
  id: string;
  caseId: string;
  timestamp: string;
  stage: 'DETECTED' | 'CLASSIFIED' | 'DECIDED' | 'VALIDATED' | 'EXECUTED';
  title: string;
  description: string;
  statusBadge: string;
  actor: string;
  enclaveAttested?: boolean;
  action?: string;
  hash?: string;
  prevHash?: string;
  block_hash?: string;
  previous_hash?: string;
}
