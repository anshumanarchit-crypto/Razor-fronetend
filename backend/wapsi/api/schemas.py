"""
Pydantic Schemas for WAPSI REST API Request/Response payloads.
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field


class PaymentFailureEventRequest(BaseModel):
    event_id: Optional[str] = Field(default=None, description="Unique failure event ID")
    payment_id: str = Field(..., description="Razorpay payment ID e.g. pay_998124")
    order_id: Optional[str] = Field(default=None, description="Order ID e.g. order_783141")
    merchant_id: str = Field(default="merch_default", description="Merchant account ID")
    merchant_category: Optional[str] = Field(default="ecommerce", description="Merchant industry vertical")
    amount_in_inr: float = Field(..., gt=0, description="Payment transaction amount in INR")
    currency: str = Field(default="INR", description="Currency code")
    payment_method: str = Field(default="upi", description="Payment method: upi, card_credit, card_debit, netbanking, bnpl")
    error_code: str = Field(..., description="Gateway/bank error code e.g. UPI_APP_TIMEOUT")
    error_description: Optional[str] = Field(default="", description="Human-readable error description")
    user_id: str = Field(default="usr_anonymous", description="End customer user identifier")
    user_device_os: Optional[str] = Field(default="Android", description="Device OS: Android, iOS, Web_Desktop")
    user_network_type: Optional[str] = Field(default="4G", description="Network rail: 5G, 4G, 3G, WiFi")
    historical_orders_count: Optional[int] = Field(default=3, ge=0)
    historical_recovery_rate: Optional[float] = Field(default=0.35, ge=0.0, le=1.0)
    retry_attempt_number: Optional[int] = Field(default=1, ge=1)
    hour_of_day: Optional[int] = Field(default=14, ge=0, le=23)
    merchant_margin: Optional[float] = Field(default=0.20, ge=0.01, le=1.0)
    disallowed_actions: Optional[List[str]] = Field(default_factory=list)


class ActionRankingItem(BaseModel):
    action: str
    action_name: str
    channel: str
    predicted_recovery_probability: float
    causal_uplift_tau: float
    conformal_interval: List[float]
    confidence_tier: str
    dispatch_cost_inr: float
    friction_cost_inr: float
    net_expected_utility_inr: float


class PolicyEvaluationResult(BaseModel):
    is_allowed: bool
    proposed_action: str
    authorized_action: str
    override_applied: bool
    violations: List[str]
    dnd_active: bool
    frequency_cap_remaining: int
    rule_evaluation_summary: str


class CausalMetricsResult(BaseModel):
    baseline_organic_recovery_prob: float
    expected_action_recovery_prob: float
    individual_treatment_effect_uplift: float
    conformal_uplift_interval: List[float]
    confidence_tier: str
    net_expected_utility_inr: float
    total_action_cost_inr: float
    action_rankings: List[ActionRankingItem]


class CausalDecisionResponse(BaseModel):
    decision_id: str
    payment_id: str
    recommended_action: str
    recommended_action_name: str
    authorized_action: str
    channel: str
    execution_status: str
    root_cause: Dict[str, Any]
    policy_evaluation: PolicyEvaluationResult
    causal_metrics: CausalMetricsResult
    timing: Dict[str, Any]
    precedent_evidence: Dict[str, Any]
    shap_explanations: Dict[str, Any]
    plain_english_rationale: str
    localized_copy: Dict[str, Any]
    audit_hash: str
    timestamp: str


class ActionExecuteRequest(BaseModel):
    payment_id: str
    authorized_action: str
    event_data: Optional[Dict[str, Any]] = None
    message_copy: Optional[Dict[str, Any]] = None
    idempotency_key: Optional[str] = None


class ActionExecuteResponse(BaseModel):
    dispatch_id: str
    payment_id: str
    idempotency_key: str
    action_executed: str
    status: str
    channel: str
    dispatch_cost_inr: float
    timestamp: str
    channel_details: Dict[str, Any]
    is_idempotent_replay: bool
    audit_hash: str


class WebhookCallbackRequest(BaseModel):
    event_name: str = Field(..., description="e.g. payment.recovered, payment.failed, link.opened")
    payment_id: str
    status: str
    amount_in_inr: Optional[float] = 1000.0
    signature: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class HealthCheckResponse(BaseModel):
    status: str
    service: str
    version: str
    models_ready: bool
    tee_boundary: Dict[str, Any]
    audit_ledger_status: Dict[str, Any]
