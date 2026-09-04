"""
FastAPI REST Application for WAPSI — Razorpay's Recovery Router.
Provides real-time causal decisioning, policy validation, execution dispatch,
uplift analytics, and tamper-evident audit ledger endpoints.
"""

from contextlib import asynccontextmanager
from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime, timezone
import numpy as np
import pandas as pd

from fastapi import FastAPI, HTTPException, Header, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from wapsi.core.taxonomy import RecoveryAction, ACTION_METADATA
from wapsi.core.root_cause import RootCauseClassifier
from wapsi.data.generator import SyntheticRecoveryDataGenerator
from wapsi.causal.engine import CausalDecisionEngine
from wapsi.causal.precedent import PrecedentEngine
from wapsi.causal.evaluation import UpliftEvaluator
from wapsi.explain.shap_engine import CausalShapExplainer
from wapsi.explain.llm_explainer import LLMDecisionExplainer
from wapsi.bandit.bandit_engine import ContextualBanditEngine
from wapsi.policy.policy_engine import PolicyEngine
from wapsi.execution.executor import RecoveryExecutor
from wapsi.execution.tracker import RecoveryOutcomeTracker
from wapsi.security.audit_ledger import AuditLedger
from wapsi.security.tee_boundary import TEEEnclaveBoundary
from wapsi.security.validation import WebhookValidator, InMemoryRateLimiter

from wapsi.api.schemas import (
    PaymentFailureEventRequest,
    CausalDecisionResponse,
    ActionExecuteRequest,
    ActionExecuteResponse,
    WebhookCallbackRequest,
    HealthCheckResponse
)


# Global System State Singletons
generator = SyntheticRecoveryDataGenerator(random_seed=42)
causal_engine = CausalDecisionEngine(merchant_default_margin=0.20, random_seed=42)
precedent_engine = PrecedentEngine(n_neighbors=40, random_seed=42)
shap_explainer: Optional[CausalShapExplainer] = None
bandit_engine = ContextualBanditEngine(alpha=0.8, exploration_prob=0.05, random_seed=42)
policy_engine = PolicyEngine()
executor = RecoveryExecutor()
tracker = RecoveryOutcomeTracker()
audit_ledger = AuditLedger()
tee_boundary = TEEEnclaveBoundary()
rate_limiter = InMemoryRateLimiter(max_requests_per_minute=200)

# Cached validation dataset for Qini/AUUC dashboard
val_dataset_cache: Optional[pd.DataFrame] = None
val_potential_outcomes_cache: Optional[Dict[str, Any]] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Bootstrap models, train meta-learners, initialize SHAP, and index precedents on startup.
    """
    global shap_explainer, val_dataset_cache, val_potential_outcomes_cache
    
    # 1. Generate synthetic benchmark training & validation datasets with known ground truth
    train_df, _ = generator.generate_dataset(n_samples=4000, observational_bias=True)
    val_df, val_pot = generator.generate_dataset(n_samples=1500, observational_bias=True)
    val_dataset_cache = val_df
    val_potential_outcomes_cache = val_pot

    # 2. Train Causal Decisioning Core
    causal_engine.train_pipeline(train_df=train_df, val_df=val_df)

    # 3. Fit Precedent Engine & Historical Failure Index
    precedent_engine.fit(train_df)

    # 4. Initialize SHAP Explainer
    shap_explainer = CausalShapExplainer(causal_engine.t_learner)
    shap_explainer.initialize()

    # 5. Initialize Contextual Bandit LinUCB Matrices
    bandit_engine.initialize(causal_engine.t_learner.feature_pipeline)

    # 6. Append System Bootstrap block to Audit Ledger
    audit_ledger.append("SYSTEM_BOOTSTRAP", {
        "training_samples": len(train_df),
        "validation_samples": len(val_df),
        "models_initialized": ["T-Learner", "X-Learner", "Precedent_kNN", "TreeSHAP", "LinUCB_Bandit", "Policy_Engine"],
        "tee_measurement": tee_boundary.enclave_measurement
    })

    yield


app = FastAPI(
    title="WAPSI — Razorpay's Recovery Router API",
    description="Causal Decision Engine for AI Revenue Recovery (Razorpay AI Buildathon 2026)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware for React / Next.js / Vite Frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health", response_model=HealthCheckResponse)
@app.get("/health", response_model=HealthCheckResponse)
def health_check():
    """Returns service health, model readiness, TEE enclave status, and audit ledger integrity."""
    integrity = audit_ledger.verify_integrity()
    attestation = tee_boundary.generate_attestation_report()
    
    return {
        "status": "healthy",
        "service": "wapsi-causal-recovery-router",
        "version": "1.0.0",
        "models_ready": causal_engine.is_trained,
        "tee_boundary": attestation,
        "audit_ledger_status": integrity
    }


@app.post("/api/v1/decide", response_model=CausalDecisionResponse)
def decide_recovery(
    request: PaymentFailureEventRequest,
    use_x_learner: bool = Query(default=False, description="Use X-Learner meta-learner instead of T-Learner")
):
    """
    Ingests a failed payment signal, classifies root-cause, estimates multi-action causal uplift,
    optimizes net expected utility, checks policy guardrails, and produces local SHAP explanations.
    """
    event_dict = request.model_dump()
    
    # 1. TEE Enclave Boundary: Shield and sanitize PII
    shielded_internal, sanitized_external = tee_boundary.sanitize_and_shield_pii(event_dict)

    # 2. Root-Cause Classification
    root_cause = RootCauseClassifier.classify(
        error_code=event_dict["error_code"],
        error_description=event_dict.get("error_description", ""),
        metadata=event_dict
    )
    event_dict["error_category"] = root_cause["error_category"]

    # 3. Causal Decisioning Core: Compute ITE uplift & Net Utility
    causal_res = causal_engine.decide(
        event_dict=event_dict,
        merchant_margin=event_dict.get("merchant_margin", 0.20),
        use_x_learner=use_x_learner
    )
    recommended_action = causal_res["recommended_action"]
    net_utility = causal_res["net_expected_utility_inr"]

    # 4. Contextual Bandit Exploration-Exploitation Check
    bandit_res = bandit_engine.select_action(
        event_dict=event_dict,
        causal_recommended_action=recommended_action
    )
    proposed_action = bandit_res["bandit_action"]

    # 5. Policy Engine: Enforce TRAI DND, frequency caps, margin gates, merchant restrictions
    merchant_cfg = {"disallowed_actions": event_dict.get("disallowed_actions", [])}
    policy_res = policy_engine.evaluate(
        event_dict=event_dict,
        proposed_action=proposed_action,
        causal_net_utility=net_utility,
        merchant_config=merchant_cfg
    )
    authorized_action = policy_res["authorized_action"]

    # 6. Precedent Engine: Query k-NN nearest historical cases
    precedent_res = precedent_engine.query_precedents(
        event_dict=event_dict,
        candidate_action=authorized_action
    )

    # 7. SHAP Local Explainability
    if shap_explainer:
        shap_res = shap_explainer.explain_instance(
            event_dict=event_dict,
            selected_action=authorized_action,
            top_k=5
        )
    else:
        shap_res = {"top_features": [], "positive_drivers": [], "negative_drivers": []}

    # 8. LLM Explainer: Generate plain-English audit rationale & safe localized copy
    rationale = LLMDecisionExplainer.generate_plain_english_rationale(
        decision_result=causal_res,
        shap_result=shap_res,
        precedent_result=precedent_res
    )
    localized_copy = LLMDecisionExplainer.generate_customer_copy(
        event_dict=event_dict,
        selected_action=authorized_action,
        payment_link=f"https://rzp.io/r/{event_dict['payment_id']}"
    )

    # 9. Audit Ledger Logging
    decision_id = f"dec_{uuid.uuid4().hex[:12]}"
    now_iso = datetime.now(timezone.utc).isoformat()
    
    audit_block = audit_ledger.append("CAUSAL_DECISION_GENERATED", {
        "decision_id": decision_id,
        "payment_id": sanitized_external["payment_id"],
        "merchant_id": event_dict["merchant_id"],
        "recommended_action": recommended_action,
        "authorized_action": authorized_action,
        "uplift_tau": causal_res["individual_treatment_effect_uplift"],
        "net_utility": net_utility,
        "policy_override": policy_res["override_applied"],
        "is_bandit_exploration": bandit_res["is_exploration"]
    })

    chosen_eval = next(
        (item for item in causal_res["all_action_rankings"] if item["action"] == authorized_action),
        causal_res["all_action_rankings"][0]
    )

    return {
        "decision_id": decision_id,
        "payment_id": event_dict["payment_id"],
        "recommended_action": recommended_action,
        "recommended_action_name": chosen_eval["action_name"],
        "authorized_action": authorized_action,
        "channel": chosen_eval["channel"],
        "execution_status": "AUTHORIZED" if policy_res["is_allowed"] else "POLICY_OVERRIDDEN",
        "root_cause": root_cause,
        "policy_evaluation": policy_res,
        "causal_metrics": {
            "baseline_organic_recovery_prob": causal_res["baseline_organic_recovery_prob"],
            "expected_action_recovery_prob": chosen_eval["predicted_recovery_probability"],
            "individual_treatment_effect_uplift": chosen_eval["causal_uplift_tau"],
            "conformal_uplift_interval": chosen_eval["conformal_interval"],
            "confidence_tier": chosen_eval["confidence_tier"],
            "net_expected_utility_inr": chosen_eval["net_expected_utility_inr"],
            "total_action_cost_inr": causal_res["total_action_cost_inr"],
            "action_rankings": causal_res["all_action_rankings"]
        },
        "timing": causal_res["timing"],
        "precedent_evidence": precedent_res,
        "shap_explanations": shap_res,
        "plain_english_rationale": rationale,
        "localized_copy": localized_copy,
        "audit_hash": audit_block.block_hash,
        "timestamp": now_iso
    }


@app.post("/api/v1/execute", response_model=ActionExecuteResponse)
def execute_recovery(request: ActionExecuteRequest):
    """
    Dispatches the authorized recovery action (simulated WhatsApp, SMS, Smart Retry, IVR, BNPL)
    with strict idempotency protection and issues a verifiable execution receipt.
    """
    req_dict = request.model_dump()
    event_data = req_dict.get("event_data") or {"payment_id": req_dict["payment_id"], "amount_in_inr": 1000.0}
    message_copy = req_dict.get("message_copy") or {}
    
    # Execute dispatch via simulator
    receipt = executor.execute(
        event_dict=event_data,
        authorized_action=req_dict["authorized_action"],
        message_copy=message_copy,
        idempotency_key=req_dict.get("idempotency_key")
    )

    # Initialize Promise-to-Pay state machine
    tracker.initialize_record(
        payment_id=receipt["payment_id"],
        decision_id=f"dec_{receipt['dispatch_id'][:8]}",
        dispatch_id=receipt["dispatch_id"],
        action=receipt["action_executed"],
        amount_in_inr=float(event_data.get("amount_in_inr", 1000.0)),
        merchant_id=receipt["merchant_id"]
    )

    # Record user frequency quota
    user_id = event_data.get("user_id", "usr_anonymous")
    policy_engine.record_execution(user_id=user_id, action=receipt["action_executed"])

    # Append to Audit Ledger
    audit_block = audit_ledger.append("RECOVERY_ACTION_DISPATCHED", {
        "dispatch_id": receipt["dispatch_id"],
        "payment_id": receipt["payment_id"],
        "action": receipt["action_executed"],
        "channel": receipt["channel"],
        "idempotency_key": receipt["idempotency_key"]
    })

    receipt["audit_hash"] = audit_block.block_hash
    return receipt


@app.post("/api/v1/callback")
def handle_payment_callback(
    request: WebhookCallbackRequest,
    x_razorpay_signature: Optional[str] = Header(default=None)
):
    """
    Ingests payment outcome webhooks (RECOVERED, EXPIRED, FAILED) to close the learning loop.
    Updates online contextual bandit weights and tracking state machines.
    """
    payload = request.model_dump()
    payment_id = payload["payment_id"]
    status = payload["status"].upper()

    # 1. Update Promise-to-Pay State Machine
    record = tracker.update_status(
        payment_id=payment_id,
        new_status=status,
        metadata=payload.get("metadata")
    )

    # 2. Update Contextual Bandit Online Learning Loop
    is_recovered = (status == "RECOVERED")
    reward = 1.0 if is_recovered else 0.0
    action = record.get("action", RecoveryAction.NO_ACTION.value)
    
    event_stub = {
        "payment_id": payment_id,
        "amount_in_inr": payload.get("amount_in_inr", 1000.0),
        "payment_method": "upi",
        "error_code": "UPI_APP_TIMEOUT",
        "error_category": "FRICTION_OTP_UX",
        "user_device_os": "Android",
        "user_network_type": "4G",
        "historical_orders_count": 3,
        "historical_recovery_rate": 0.4,
        "retry_attempt_number": 1,
        "hour_of_day": 14,
        "is_dnd_window": 0
    }
    bandit_engine.update(event_dict=event_stub, action=action, reward=reward)

    # 3. Log to Audit Ledger
    audit_block = audit_ledger.append("PAYMENT_OUTCOME_CALLBACK", {
        "payment_id": payment_id,
        "event_name": payload["event_name"],
        "status": status,
        "reward": reward
    })

    return {
        "status": "acknowledged",
        "payment_id": payment_id,
        "updated_recovery_status": status,
        "bandit_online_updated": True,
        "audit_hash": audit_block.block_hash
    }


@app.get("/api/v1/metrics/uplift")
def get_uplift_metrics(action: Optional[str] = Query(default=RecoveryAction.WHATSAPP_ONE_CLICK_LINK.value)):
    """
    Computes Qini curves, AUUC metrics, and uplift decile tables over validation dataset.
    """
    global val_dataset_cache, val_potential_outcomes_cache
    if val_dataset_cache is None or not causal_engine.is_trained:
        raise HTTPException(status_code=503, detail="Models or validation dataset not ready.")

    val_df = val_dataset_cache
    uplifts = causal_engine.t_learner.predict_uplift(val_df)
    
    y_true = val_df["recovered"].values
    t_assigned = (val_df["assigned_action"] == action).astype(int).values
    act_uplift = uplifts.get(action, np.zeros(len(val_df)))
    amounts = val_df["amount_in_inr"].values

    qini_data = UpliftEvaluator.compute_qini_curve(
        y_true=y_true,
        treatment=t_assigned,
        uplift_score=act_uplift,
        n_bins=50
    )

    deciles = UpliftEvaluator.compute_uplift_deciles(
        y_true=y_true,
        treatment=t_assigned,
        uplift_score=act_uplift,
        amount_in_inr=amounts,
        n_deciles=10
    )

    gt_metrics = {}
    if val_potential_outcomes_cache:
        gt_metrics = UpliftEvaluator.evaluate_ground_truth(
            predicted_uplifts=uplifts,
            ground_truth_tau=val_potential_outcomes_cache["tau_ground_truth"],
            action_names=val_potential_outcomes_cache["action_names"]
        )

    return {
        "action_evaluated": action,
        "validation_samples_count": len(val_df),
        "qini_curve": qini_data,
        "uplift_deciles": deciles,
        "ground_truth_benchmarks": gt_metrics
    }


@app.get("/api/v1/audit/ledger")
def get_audit_ledger(limit: int = Query(default=50, ge=1, le=200)):
    """
    Returns verifiable append-only cryptographic audit ledger entries.
    """
    entries = audit_ledger.get_entries(limit=limit)
    integrity = audit_ledger.verify_integrity()
    return {
        "integrity": integrity,
        "total_entries_returned": len(entries),
        "entries": entries
    }


@app.post("/api/v1/simulation/generate")
def generate_simulation_batch(
    n_samples: int = Query(default=10, ge=1, le=100)
):
    """
    Generates a batch of synthetic payment failure events for frontend demonstration.
    """
    sim_df, _ = generator.generate_dataset(n_samples=n_samples, observational_bias=True)
    events = sim_df.to_dict(orient="records")
    return {
        "batch_count": len(events),
        "events": events
    }


# Include frontend compatibility adapter endpoints
from wapsi.api.frontend_adapter import router as frontend_router
app.include_router(frontend_router, prefix="/api/v1")

