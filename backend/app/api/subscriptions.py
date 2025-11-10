"""Subscription API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.api.dependencies import get_current_user
from app.db.database import get_database
from app.api.schemas import SubscriptionResponse, UsageResponse, CreateCheckoutSessionRequest
from app.models.user import UserInDB
from app.models.couple import CoupleInDB, CoupleStatus
from app.services.subscription_service import subscription_service
from app.services.usage_service import usage_service
from app.models.usage import UsageType
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
import stripe
from app.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/subscriptions", tags=["Subscriptions"])

# Initialize Stripe
if settings.STRIPE_SECRET_KEY:
    stripe.api_key = settings.STRIPE_SECRET_KEY


@router.get("/me", response_model=SubscriptionResponse)
async def get_my_subscription(
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get current user's subscription."""
    
    # Get user's couple
    couple_doc = await db.couples.find_one({
        "$or": [
            {"user1_id": ObjectId(current_user.id)},
            {"user2_id": ObjectId(current_user.id)}
        ],
        "status": CoupleStatus.ACTIVE.value
    })
    
    if not couple_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active couple profile found"
        )
    
    couple = CoupleInDB.from_mongo(couple_doc)
    
    subscription = await subscription_service.get_or_create_subscription(couple.id, db)
    
    return SubscriptionResponse(
        id=subscription.id,
        couple_id=subscription.couple_id,
        tier=subscription.tier.value,
        status=subscription.status.value,
        trial_start=subscription.trial_start,
        trial_end=subscription.trial_end,
        current_period_start=subscription.current_period_start,
        current_period_end=subscription.current_period_end,
        cancelled_at=subscription.cancelled_at,
        cancel_at_period_end=subscription.cancel_at_period_end
    )


@router.get("/usage", response_model=UsageResponse)
async def get_usage(
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get current usage statistics."""
    
    # Get user's couple
    couple_doc = await db.couples.find_one({
        "$or": [
            {"user1_id": ObjectId(current_user.id)},
            {"user2_id": ObjectId(current_user.id)}
        ],
        "status": CoupleStatus.ACTIVE.value
    })
    
    if not couple_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active couple profile found"
        )
    
    couple = CoupleInDB.from_mongo(couple_doc)
    
    subscription = await subscription_service.get_or_create_subscription(couple.id, db)
    usage_count = await usage_service.get_usage_count(
        couple.id, UsageType.ARGUMENT_RESOLUTION, subscription, db
    )
    limit = subscription_service.get_argument_limit(subscription)
    
    period_start, period_end = usage_service.get_period_dates(subscription)
    
    return UsageResponse(
        usage_count=usage_count,
        limit=limit,
        is_unlimited=limit == -1,
        period_start=period_start.isoformat(),
        period_end=period_end.isoformat()
    )


@router.post("/create-checkout-session")
async def create_checkout_session(
    checkout_data: CreateCheckoutSessionRequest,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create Stripe checkout session for subscription upgrade."""
    
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment processing not configured"
        )
    
    # Get user's couple
    couple_doc = await db.couples.find_one({
        "$or": [
            {"user1_id": ObjectId(current_user.id)},
            {"user2_id": ObjectId(current_user.id)}
        ],
        "status": CoupleStatus.ACTIVE.value
    })
    
    if not couple_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active couple profile found"
        )
    
    couple = CoupleInDB.from_mongo(couple_doc)
    subscription = await subscription_service.get_or_create_subscription(couple.id, db)
    
    # Define prices (in AUD cents)
    prices = {
        "basic": {
            "monthly": "price_basic_monthly",  # Replace with actual Stripe Price ID
            "amount": 999  # $9.99 AUD
        },
        "premium": {
            "monthly": "price_premium_monthly",  # Replace with actual Stripe Price ID
            "amount": 1999  # $19.99 AUD
        }
    }
    
    if checkout_data.tier not in prices:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid tier. Must be 'basic' or 'premium'"
        )
    
    tier_prices = prices[checkout_data.tier]
    
    try:
        # Create or get Stripe customer
        customer_id = subscription.stripe_customer_id
        if not customer_id:
            customer = stripe.Customer.create(
                email=current_user.email,
                metadata={"couple_id": couple.id, "user_id": current_user.id}
            )
            customer_id = customer.id
            
            # Update subscription with customer ID
            await subscription_service.update_subscription(
                subscription.id,
                {"stripe_customer_id": customer_id},
                db
            )
        
        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "aud",
                    "product_data": {
                        "name": f"Heka {checkout_data.tier.capitalize()} Subscription",
                        "description": f"Monthly subscription for {checkout_data.tier} tier"
                    },
                    "recurring": {
                        "interval": "month"
                    },
                    "unit_amount": tier_prices["amount"]
                },
                "quantity": 1
            }],
            mode="subscription",
            success_url=checkout_data.success_url,
            cancel_url=checkout_data.cancel_url,
            metadata={
                "couple_id": couple.id,
                "user_id": current_user.id,
                "tier": checkout_data.tier
            }
        )
        
        return {
            "checkout_url": checkout_session.url,
            "session_id": checkout_session.id
        }
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment processing error: {str(e)}"
        )


@router.get("/webhook")
async def stripe_webhook_get():
    """Webhook endpoint verification (GET request from Stripe)."""
    return {"status": "ok", "message": "Webhook endpoint is active"}


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events."""
    
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Webhook secret not configured"
        )
    
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    event_type = event["type"]
    event_data = event["data"]["object"]
    
    logger.info(f"Received Stripe webhook event: {event_type} (ID: {event.get('id', 'unknown')})")
    
    if event_type == "checkout.session.completed":
        await handle_checkout_session_completed(event_data)
    elif event_type == "checkout.session.async_payment_failed":
        await handle_checkout_payment_failed(event_data)
    elif event_type == "customer.subscription.updated":
        await handle_subscription_updated(event_data)
    elif event_type == "customer.subscription.deleted":
        await handle_subscription_deleted(event_data)
    elif event_type == "invoice.payment_succeeded":
        await handle_invoice_payment_succeeded(event_data)
    elif event_type == "invoice.payment_failed":
        await handle_invoice_payment_failed(event_data)
    else:
        logger.info(f"Unhandled webhook event type: {event_type} (ID: {event.get('id', 'unknown')})")
    
    return {"status": "success"}


async def handle_checkout_session_completed(session: dict):
    """Handle successful checkout session."""
    db = get_database()
    couple_id = session["metadata"]["couple_id"]
    tier = session["metadata"]["tier"]
    
    subscription = await subscription_service.get_subscription(couple_id, db)
    if subscription:
        from app.models.subscription import SubscriptionTier, SubscriptionStatus
        await subscription_service.update_subscription(
            subscription.id,
            {
                "tier": SubscriptionTier(tier),
                "status": SubscriptionStatus.ACTIVE,
                "stripe_subscription_id": session.get("subscription"),
                "stripe_customer_id": session.get("customer"),
                "current_period_start": datetime.fromtimestamp(session.get("created", 0)),
                "current_period_end": datetime.fromtimestamp(session.get("expires_at", 0)) if session.get("expires_at") else None
            },
            db
        )


async def handle_subscription_updated(subscription: dict):
    """Handle subscription update."""
    db = get_database()
    stripe_sub_id = subscription.get("id")
    
    # Find subscription by Stripe subscription ID
    sub_doc = await db.subscriptions.find_one({"stripe_subscription_id": stripe_sub_id})
    if sub_doc:
        from app.models.subscription import SubscriptionStatus
        status_map = {
            "active": SubscriptionStatus.ACTIVE,
            "canceled": SubscriptionStatus.CANCELLED,
            "past_due": SubscriptionStatus.EXPIRED
        }
        
        await subscription_service.update_subscription(
            str(sub_doc["_id"]),
            {
                "status": status_map.get(subscription.get("status"), SubscriptionStatus.ACTIVE),
                "current_period_start": datetime.fromtimestamp(subscription.get("current_period_start", 0)),
                "current_period_end": datetime.fromtimestamp(subscription.get("current_period_end", 0)),
                "cancel_at_period_end": subscription.get("cancel_at_period_end", False)
            },
            db
        )


async def handle_subscription_deleted(subscription: dict):
    """Handle subscription cancellation."""
    db = get_database()
    stripe_sub_id = subscription.get("id")
    
    # Find subscription by Stripe subscription ID
    sub_doc = await db.subscriptions.find_one({"stripe_subscription_id": stripe_sub_id})
    if sub_doc:
        from app.models.subscription import SubscriptionStatus
        await subscription_service.update_subscription(
            str(sub_doc["_id"]),
            {
                "status": SubscriptionStatus.CANCELLED,
                "cancelled_at": datetime.utcnow()
            },
            db
        )
        logger.info(f"Subscription cancelled: {stripe_sub_id}")


async def handle_invoice_payment_succeeded(invoice: dict):
    """Handle successful invoice payment."""
    db = get_database()
    subscription_id = invoice.get("subscription")
    customer_id = invoice.get("customer")
    amount_paid = invoice.get("amount_paid", 0) / 100  # Convert from cents to dollars
    
    logger.info(f"Invoice payment succeeded - Subscription: {subscription_id}, Customer: {customer_id}, Amount: ${amount_paid:.2f}")
    
    # Find subscription by Stripe subscription ID
    if subscription_id:
        sub_doc = await db.subscriptions.find_one({"stripe_subscription_id": subscription_id})
        if sub_doc:
            from app.models.subscription import SubscriptionStatus
            await subscription_service.update_subscription(
                str(sub_doc["_id"]),
                {
                    "status": SubscriptionStatus.ACTIVE,
                    "current_period_start": datetime.fromtimestamp(invoice.get("period_start", 0)),
                    "current_period_end": datetime.fromtimestamp(invoice.get("period_end", 0))
                },
                db
            )
            logger.info(f"Subscription activated/renewed: {subscription_id}")


async def handle_invoice_payment_failed(invoice: dict):
    """Handle failed invoice payment."""
    db = get_database()
    subscription_id = invoice.get("subscription")
    customer_id = invoice.get("customer")
    amount_due = invoice.get("amount_due", 0) / 100  # Convert from cents to dollars
    attempt_count = invoice.get("attempt_count", 0)
    
    logger.warning(
        f"Invoice payment FAILED - Subscription: {subscription_id}, "
        f"Customer: {customer_id}, Amount: ${amount_due:.2f}, "
        f"Attempt: {attempt_count}"
    )
    
    # Find subscription by Stripe subscription ID
    if subscription_id:
        sub_doc = await db.subscriptions.find_one({"stripe_subscription_id": subscription_id})
        if sub_doc:
            from app.models.subscription import SubscriptionStatus
            # Update status to past_due or expired based on attempt count
            new_status = SubscriptionStatus.EXPIRED if attempt_count >= 3 else SubscriptionStatus.EXPIRED
            
            await subscription_service.update_subscription(
                str(sub_doc["_id"]),
                {
                    "status": new_status
                },
                db
            )
            logger.warning(f"Subscription marked as expired due to payment failure: {subscription_id}")

