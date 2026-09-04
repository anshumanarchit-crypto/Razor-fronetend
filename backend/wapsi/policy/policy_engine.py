"""
Policy & Governance Engine for WAPSI Recovery Router.
Enforces TRAI DND regulations, frequency caps, merchant margin gates, and safety overrides.

PRINCIPLE: The ML engine recommends; the Policy Engine decides whether execution is authorized.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime, time
from wapsi.core.taxonomy import RecoveryAction, ACTION_METADATA


class PolicyEngine:
    """
    Deterministic rule-based policy validation and governance guardrail.
    """

    def __init__(
        self,
        max_daily_user_nudges: int = 2,
        dnd_start_hour: int = 21,  # 9 PM IST
        dnd_end_hour: int = 9,     # 9 AM IST
        min_order_amount_for_ivr: float = 1500.0,
        min_net_utility_threshold: float = 0.0
    ):
        self.max_daily_user_nudges = max_daily_user_nudges
        self.dnd_start_hour = dnd_start_hour
        self.dnd_end_hour = dnd_end_hour
        self.min_order_amount_for_ivr = min_order_amount_for_ivr
        self.min_net_utility_threshold = min_net_utility_threshold
        
        # User frequency tracker (in-memory mock store for demo)
        self.user_nudge_history: Dict[str, List[datetime]] = {}

    def evaluate(
        self,
        event_dict: Dict[str, Any],
        proposed_action: str,
        causal_net_utility: float,
        merchant_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Evaluates proposed action against all compliance and merchant rules.
        
        Returns:
            Dict with is_allowed (bool), authorized_action (str), violations (List[str]),
            dnd_active (bool), frequency_cap_remaining (int), and policy_override_applied (bool)
        """
        merchant_config = merchant_config or {}
        user_id = event_dict.get("user_id", "anonymous")
        amount = float(event_dict.get("amount_in_inr", 1000.0))
        hour = int(event_dict.get("hour_of_day", datetime.now().hour))
        
        action_meta = ACTION_METADATA.get(RecoveryAction(proposed_action), {})
        requires_contact = action_meta.get("requires_user_contact", False)
        
        violations: List[str] = []
        is_dnd_active = self._check_dnd(hour)
        authorized_action = proposed_action
        override_applied = False

        # Rule 1: TRAI DND Window Check (21:00 - 09:00 IST)
        if requires_contact and is_dnd_active:
            violations.append(
                f"TRAI DND Compliance: Customer communication restricted between 21:00 and 09:00 IST (Current hour: {hour}:00)."
            )
            # Safe Fallback: Switch to Instant Gateway Reroute or No Action
            if proposed_action != RecoveryAction.INSTANT_SMART_RETRY.value:
                authorized_action = RecoveryAction.INSTANT_SMART_RETRY.value
                override_applied = True

        # Rule 2: Frequency Capping (Max N nudges per 24 hours)
        user_nudges = self.user_nudge_history.get(user_id, [])
        # Count nudges in last 24h (mocked by array length for demo)
        if requires_contact and len(user_nudges) >= self.max_daily_user_nudges:
            violations.append(
                f"Frequency Cap Exceeded: User '{user_id}' has already received {len(user_nudges)} nudges in 24h (Limit: {self.max_daily_user_nudges})."
            )
            authorized_action = RecoveryAction.NO_ACTION.value
            override_applied = True

        # Rule 3: IVR Voice Call Ticket Size Gate
        if proposed_action == RecoveryAction.CALL_ASSIST_IVR.value and amount < self.min_order_amount_for_ivr:
            violations.append(
                f"IVR Threshold Gate: Order amount ₹{amount:.2f} is below minimum IVR threshold ₹{self.min_order_amount_for_ivr:.2f}."
            )
            authorized_action = RecoveryAction.WHATSAPP_ONE_CLICK_LINK.value
            override_applied = True

        # Rule 4: Merchant-Specific Channel Exclusions
        disallowed = merchant_config.get("disallowed_actions", [])
        if proposed_action in disallowed:
            violations.append(f"Merchant Policy: Action '{proposed_action}' is disabled by merchant configuration.")
            authorized_action = RecoveryAction.NO_ACTION.value
            override_applied = True

        # Rule 5: Net Utility Non-Negativity Gate
        if causal_net_utility < self.min_net_utility_threshold and proposed_action != RecoveryAction.NO_ACTION.value:
            violations.append(f"Negative Utility Gate: Expected net return ₹{causal_net_utility:.2f} does not cover direct execution costs.")
            authorized_action = RecoveryAction.NO_ACTION.value
            override_applied = True

        is_allowed = (len(violations) == 0) or (authorized_action == proposed_action)
        remaining_nudges = max(0, self.max_daily_user_nudges - len(user_nudges))

        return {
            "is_allowed": is_allowed,
            "proposed_action": proposed_action,
            "authorized_action": authorized_action,
            "override_applied": override_applied,
            "violations": violations,
            "dnd_active": is_dnd_active,
            "frequency_cap_remaining": remaining_nudges,
            "rule_evaluation_summary": "Authorized without violations" if not violations else "Policy override applied: " + "; ".join(violations)
        }

    def record_execution(self, user_id: str, action: str):
        """
        Records an executed recovery action against the user's frequency quota.
        """
        action_meta = ACTION_METADATA.get(RecoveryAction(action), {})
        if action_meta.get("requires_user_contact", False):
            if user_id not in self.user_nudge_history:
                self.user_nudge_history[user_id] = []
            self.user_nudge_history[user_id].append(datetime.now())

    def _check_dnd(self, hour: int) -> bool:
        return (hour >= self.dnd_start_hour) or (hour < self.dnd_end_hour)
