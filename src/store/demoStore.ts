import { create } from 'zustand';
import { 
  RecoveryCase, 
  DecisionOutput, 
  OverviewMetrics, 
  AuditEvent, 
  CaseStatus, 
  ActionType, 
  MerchantSettings,
  PolicyControlRow 
} from '../types';
import { 
  mockRecoveryCases, 
  mockCaseDetailMap, 
  initialOverviewMetrics, 
  mockAuditTrail, 
  initialMerchantSettings,
  mockPolicyControls
} from '../mock/mockData';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar: string;
  merchantId: string;
  mfaEnabled: boolean;
  apiKey: string;
  lastLogin: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Recovery Ops' | 'Risk Officer' | 'Auditor';
  status: 'Active' | 'Invited';
  lastActive: string;
}

interface DemoStoreState {
  // Global Layout & Modals
  isSidebarCollapsed: boolean;
  isCaseDrawerOpen: boolean;
  isCopilotOpen: boolean;
  isMerchantModalOpen: boolean;
  isUserProfileModalOpen: boolean;
  isHelpModalOpen: boolean;
  isUserManagementModalOpen: boolean;
  isDateRangeModalOpen: boolean;
  isFiltersModalOpen: boolean;

  // Global Header Filter & Date Range State
  selectedDateRange: string;
  activeFilterCount: number;
  filtersState: {
    domains: string[];
    minUplift: number;
    minConfidence: number;
    evidenceSources: string[];
    statuses: string[];
    onlyHighImpact: boolean;
    regulatoryBoundsVerified: boolean;
  };

  // Core Data
  overviewMetrics: OverviewMetrics;
  cases: RecoveryCase[];
  selectedCaseId: string | null;
  caseDetails: Record<string, DecisionOutput>;
  auditTrail: AuditEvent[];
  merchantSettings: MerchantSettings;
  policyControls: PolicyControlRow[];
  userProfile: UserProfile;
  teamMembers: TeamMember[];
  
  // Interactive Simulator State
  simulatorContacts: number;
  simulatorRetryBudget: number;
  
  // Workflow states
  isPolicyCheckRunning: boolean;
  policyCheckProgress: number;
  lastRecoveredCaseId: string | null;
  activeNotification: string | null;

  // Layout & Modal Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  selectCase: (caseId: string | null) => void;
  openCaseDrawer: (caseId: string) => void;
  closeCaseDrawer: () => void;
  toggleCopilot: () => void;
  setCopilotOpen: (open: boolean) => void;
  setMerchantModalOpen: (open: boolean) => void;
  setUserProfileModalOpen: (open: boolean) => void;
  setHelpModalOpen: (open: boolean) => void;
  setUserManagementModalOpen: (open: boolean) => void;
  setDateRangeModalOpen: (open: boolean) => void;
  setFiltersModalOpen: (open: boolean) => void;
  setSelectedDateRange: (range: string) => void;
  updateFiltersState: (filters: Partial<DemoStoreState['filtersState']>) => void;
  resetFilters: () => void;
  
  // Theme state
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;

  // Workflow Actions
  approveCase: (caseId: string) => Promise<void>;
  reviewCase: (caseId: string) => void;
  rejectCase: (caseId: string) => void;
  simulateRecovery: (caseId: string) => void;
  
  // Update Actions
  updateSettings: (settings: Partial<MerchantSettings>) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  removeTeamMember: (id: string) => void;
  setSimulatorContacts: (val: number) => void;
  setSimulatorRetryBudget: (val: number) => void;
  resetSimulator: () => void;
  clearNotification: () => void;
}

export const useDemoStore = create<DemoStoreState>((set, get) => ({
  isSidebarCollapsed: false,
  isCaseDrawerOpen: false,
  isCopilotOpen: false,
  isMerchantModalOpen: false,
  isUserProfileModalOpen: false,
  isHelpModalOpen: false,
  isUserManagementModalOpen: false,
  isDateRangeModalOpen: false,
  isFiltersModalOpen: false,

  selectedDateRange: 'Aug 22 – Aug 28, 2025',
  activeFilterCount: 7,
  filtersState: {
    domains: ['Subscriptions', 'Checkout', 'B2B'],
    minUplift: 10,
    minConfidence: 75,
    evidenceSources: ['Network Data', 'Merchant Prior', 'Enclave Attested'],
    statuses: ['READY', 'REVIEW', 'APPROVED'],
    onlyHighImpact: false,
    regulatoryBoundsVerified: true,
  },

  overviewMetrics: initialOverviewMetrics,
  cases: mockRecoveryCases,
  selectedCaseId: 'RX-48291',
  caseDetails: mockCaseDetailMap,
  auditTrail: mockAuditTrail,
  merchantSettings: initialMerchantSettings,
  policyControls: mockPolicyControls,
  
  userProfile: {
    name: 'Arpit',
    email: 'arpit@acmecorp.com',
    role: 'Principal Merchant Architect',
    avatar: 'A',
    merchantId: 'MRC_928374',
    mfaEnabled: true,
    apiKey: 'rzp_live_wapsi_982348921839218',
    lastLogin: 'Today at 10:14 PM IST',
  },

  teamMembers: [
    { id: 'tm-1', name: 'Arpit', email: 'arpit@acmecorp.com', role: 'Admin', status: 'Active', lastActive: 'Now' },
    { id: 'tm-2', name: 'Priya Sharma', email: 'priya@acmecorp.com', role: 'Recovery Ops', status: 'Active', lastActive: '12m ago' },
    { id: 'tm-3', name: 'Rohan Mehta', email: 'rohan@acmecorp.com', role: 'Risk Officer', status: 'Active', lastActive: '2h ago' },
    { id: 'tm-4', name: 'Neha Gupta', email: 'neha@acmecorp.com', role: 'Auditor', status: 'Invited', lastActive: 'Pending invite' },
  ],
  
  simulatorContacts: 742,
  simulatorRetryBudget: 1842,
  
  isPolicyCheckRunning: false,
  policyCheckProgress: 0,
  lastRecoveredCaseId: null,
  activeNotification: null,

  toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  selectCase: (caseId) => set({ selectedCaseId: caseId }),
  openCaseDrawer: (caseId) => set({ selectedCaseId: caseId, isCaseDrawerOpen: true }),
  closeCaseDrawer: () => set({ isCaseDrawerOpen: false }),
  toggleCopilot: () => set((s) => ({ isCopilotOpen: !s.isCopilotOpen })),
  setCopilotOpen: (open) => set({ isCopilotOpen: open }),
  setMerchantModalOpen: (open) => set({ isMerchantModalOpen: open }),
  setUserProfileModalOpen: (open) => set({ isUserProfileModalOpen: open }),
  setHelpModalOpen: (open) => set({ isHelpModalOpen: open }),
  setUserManagementModalOpen: (open) => set({ isUserManagementModalOpen: open }),
  setDateRangeModalOpen: (open) => set({ isDateRangeModalOpen: open }),
  setFiltersModalOpen: (open) => set({ isFiltersModalOpen: open }),
  setSelectedDateRange: (range) => {
    let metrics = initialOverviewMetrics;
    if (range.includes('Today')) {
      metrics = {
        revenueAtRisk: 284000,
        revenueAtRiskDelta: 5.2,
        recoverable: 218000,
        recoverableDelta: 8.4,
        incrementalRecovery: 32000,
        incrementalRecoveryDelta: 12.1,
        recovered: 118000,
        recoveredDelta: 14.5,
        recoveryRate: 41.5,
        recoveryRateDeltaPp: 3.2,
      };
    } else if (range.includes('Month') || range.includes('30 Days') || range.includes('Aug 1 – Aug 28')) {
      metrics = {
        revenueAtRisk: 7850000,
        revenueAtRiskDelta: 12.4,
        recoverable: 6120000,
        recoverableDelta: 16.8,
        incrementalRecovery: 860000,
        incrementalRecoveryDelta: 24.5,
        recovered: 3140000,
        recoveredDelta: 28.2,
        recoveryRate: 40.0,
        recoveryRateDeltaPp: 4.8,
      };
    } else if (range.includes('90 Days') || range.includes('Quarter') || range.includes('Jun 1 – Aug 28')) {
      metrics = {
        revenueAtRisk: 23500000,
        revenueAtRiskDelta: 18.2,
        recoverable: 18400000,
        recoverableDelta: 21.4,
        incrementalRecovery: 2580000,
        incrementalRecoveryDelta: 31.0,
        recovered: 9420000,
        recoveredDelta: 35.8,
        recoveryRate: 40.1,
        recoveryRateDeltaPp: 5.4,
      };
    } else if (range.includes('Year') || range.includes('Jan 1 – Aug 28')) {
      metrics = {
        revenueAtRisk: 94000000,
        revenueAtRiskDelta: 22.5,
        recoverable: 73500000,
        recoverableDelta: 26.2,
        incrementalRecovery: 10300000,
        incrementalRecoveryDelta: 37.6,
        recovered: 37600000,
        recoveredDelta: 41.2,
        recoveryRate: 40.0,
        recoveryRateDeltaPp: 6.1,
      };
    }

    set({ 
      selectedDateRange: range, 
      overviewMetrics: metrics,
      activeNotification: `Analysis timeframe set to ${range}` 
    });
  },
  updateFiltersState: (newFilters) => {
    set((state) => {
      const updated = { ...state.filtersState, ...newFilters };
      // Count total active criteria
      let count = 0;
      count += updated.domains.length;
      if (updated.minUplift > 0) count++;
      if (updated.minConfidence > 0) count++;
      count += updated.evidenceSources.length;
      count += updated.statuses.length;
      if (updated.onlyHighImpact) count++;
      if (updated.regulatoryBoundsVerified) count++;

      return {
        filtersState: updated,
        activeFilterCount: Math.max(1, count),
        activeNotification: `Filters updated (${Math.max(1, count)} criteria active)`,
      };
    });
  },
  resetFilters: () => {
    set({
      filtersState: {
        domains: ['Subscriptions', 'Checkout', 'B2B'],
        minUplift: 10,
        minConfidence: 75,
        evidenceSources: ['Network Data', 'Merchant Prior', 'Enclave Attested'],
        statuses: ['READY', 'REVIEW', 'APPROVED'],
        onlyHighImpact: false,
        regulatoryBoundsVerified: true,
      },
      activeFilterCount: 7,
      activeNotification: 'Filters reset to default configuration.',
    });
  },

  approveCase: async (caseId: string) => {
    set({ isPolicyCheckRunning: true, policyCheckProgress: 20 });
    
    await new Promise((r) => setTimeout(r, 400));
    set({ policyCheckProgress: 50 });
    await new Promise((r) => setTimeout(r, 400));
    set({ policyCheckProgress: 80 });
    await new Promise((r) => setTimeout(r, 400));
    set({ policyCheckProgress: 100, isPolicyCheckRunning: false });

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    set((state) => {
      const updatedCases = state.cases.map((c) =>
        c.caseId === caseId ? { ...c, status: 'APPROVED' as CaseStatus, updatedAt: now.toISOString() } : c
      );

      const targetCase = state.cases.find((c) => c.caseId === caseId);

      const newAuditEvent: AuditEvent = {
        id: `AUD-${Math.floor(10000 + Math.random() * 90000)}`,
        caseId,
        timestamp: timeStr,
        stage: 'VALIDATED',
        title: 'Action Approved & Scheduled',
        description: `Smart action approved for ${targetCase?.customerName || caseId}. Regulatory check verified (5/5).`,
        statusBadge: 'VALIDATED',
        actor: `${state.userProfile.name} (${state.merchantSettings.merchantName})`,
        enclaveAttested: true,
      };

      return {
        cases: updatedCases,
        auditTrail: [newAuditEvent, ...state.auditTrail],
        activeNotification: `Case ${caseId} approved and scheduled for optimal execution.`,
      };
    });
  },

  reviewCase: (caseId: string) => {
    set((state) => ({
      cases: state.cases.map((c) =>
        c.caseId === caseId ? { ...c, status: 'REVIEW' as CaseStatus } : c
      ),
      activeNotification: `Case ${caseId} flagged for human review.`,
    }));
  },

  rejectCase: (caseId: string) => {
    set((state) => ({
      cases: state.cases.map((c) =>
        c.caseId === caseId ? { ...c, status: 'FAILED' as CaseStatus } : c
      ),
      isCaseDrawerOpen: false,
      activeNotification: `Case ${caseId} action rejected.`,
    }));
  },

  simulateRecovery: (caseId: string) => {
    const state = get();
    const targetCase = state.cases.find((c) => c.caseId === caseId);
    if (!targetCase) return;

    const recoveryAmount = targetCase.amount;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const newAuditEvent: AuditEvent = {
      id: `AUD-${Math.floor(10000 + Math.random() * 90000)}`,
      caseId,
      timestamp: timeStr,
      stage: 'EXECUTED',
      title: 'Payment Successfully Recovered',
      description: `Recovered ₹${recoveryAmount.toLocaleString('en-IN')} via ${targetCase.recommendedActionLabel} at peak recovery window.`,
      statusBadge: 'EXECUTED',
      actor: 'WAPSI Recovery Engine',
      enclaveAttested: true,
    };

    set({
      cases: state.cases.map((c) =>
        c.caseId === caseId ? { ...c, status: 'RECOVERED' as CaseStatus } : c
      ),
      overviewMetrics: {
        ...state.overviewMetrics,
        recovered: state.overviewMetrics.recovered + recoveryAmount,
        incrementalRecovery: state.overviewMetrics.incrementalRecovery + Math.round(recoveryAmount * targetCase.incrementalUplift),
        recoverable: Math.max(0, state.overviewMetrics.recoverable - recoveryAmount),
      },
      auditTrail: [newAuditEvent, ...state.auditTrail],
      lastRecoveredCaseId: caseId,
      activeNotification: `🎉 Success! Case ${caseId} was recovered for ₹${recoveryAmount.toLocaleString('en-IN')}`,
    });
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      merchantSettings: { ...state.merchantSettings, ...newSettings },
      activeNotification: 'Merchant settings updated successfully.',
    }));
  },

  updateUserProfile: (profile) => {
    set((state) => ({
      userProfile: { ...state.userProfile, ...profile },
      activeNotification: 'User profile updated.',
    }));
  },

  addTeamMember: (member) => {
    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      ...member,
    };
    set((state) => ({
      teamMembers: [...state.teamMembers, newMember],
      activeNotification: `Invited ${member.name} (${member.role}).`,
    }));
  },

  removeTeamMember: (id) => {
    set((state) => ({
      teamMembers: state.teamMembers.filter((m) => m.id !== id),
      activeNotification: 'Team member removed.',
    }));
  },

  theme: 'dark',
  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    if (typeof document !== 'undefined') {
      if (nextTheme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }
    set({ theme: nextTheme, activeNotification: `Switched to ${nextTheme === 'light' ? 'Light' : 'Dark'} theme` });
  },
  setTheme: (theme) => {
    if (typeof document !== 'undefined') {
      if (theme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }
    set({ theme, activeNotification: `Switched to ${theme === 'light' ? 'Light' : 'Dark'} theme` });
  },

  setSimulatorContacts: (val) => set({ simulatorContacts: val }),
  setSimulatorRetryBudget: (val) => set({ simulatorRetryBudget: val }),
  resetSimulator: () => set({ simulatorContacts: 742, simulatorRetryBudget: 1842 }),
  clearNotification: () => set({ activeNotification: null }),
}));
