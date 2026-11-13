import { adminDb, adminAuth, FieldValue } from "../lib/admin.js";
import {
  initiateMobileMoney, checkStatus, classify,
  normalizeTanzaniaPhone, newReference, SplashPayConfigError
} from "../lib/splashpay.js";

const PLANS = {
  basic:   { amount: 40000, period: "m", durationMonths: 1 },
  premium: { amount: 60000, period: "m", durationMonths: 1 },
  ultra:   { amount: 600000, period: "y", durationMonths: 12 }
};
const NOT_FOUND_GRACE_MS = 120000;

function addMonths(timestamp, months) {
  const date = new Date(timestamp);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return date.getTime();
}

async function verifiedUser(req, res) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) {
    res.status(401).json({ success: false, message: "Please sign in again." });
    return null;
  }
  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    res.status(401).json({ success: false, message: "Your session has expired. Please sign in again." });
    return null;
  }
}

async function activateSubscription(reference, providerData) {
  const orderRef = adminDb.doc("subscriptionOrders/" + reference);
  let activeSub = null;

  await adminDb.runTransaction(async tx => {
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists) throw new Error("ORDER_NOT_FOUND");
    const order = orderSnap.data();

    const subRef = adminDb.doc("subscriptions/" + order.uid);
    const subSnap = await tx.get(subRef);

    if (order.status === "COMPLETED") {
      activeSub = subSnap.exists ? subSnap.data() : null;
      return;
    }

    const plan = PLANS[order.plan];
    if (!plan || Number(order.amount) !== plan.amount || order.period !== plan.period) {
      throw new Error("ORDER_PLAN_MISMATCH");
    }

    const now = Date.now();
    const previous = subSnap.exists ? subSnap.data() : {};
    const base = Number(previous.expiresAtMs) > now ? Number(previous.expiresAtMs) : now;
    const expiresAtMs = addMonths(base, plan.durationMonths);

    activeSub = {
      plan: order.plan,
      status: "active",
      startedAtMs: now,
      expiresAtMs,
      expiresAt: new Date(expiresAtMs),
      trialEndsAtMs: 0,
      lastPaymentReference: reference,
      lastPaymentAmount: order.amount,
      currency: "TZS",
      updatedAt: FieldValue.serverTimestamp()
    };

    tx.set(subRef, activeSub, { merge: true });
    tx.update(orderRef, {
      status: "COMPLETED",
      completedAt: FieldValue.serverTimestamp(),
      providerReference: providerData.provider_reference || null,
      channel: providerData.channel || null,
      verifiedStatus: providerData.status || "success",
      verifiedAt: FieldValue.serverTimestamp()
    });
  });

  const latest = await adminDb.doc("subscriptions/" + (await orderRef.get()).data().uid).get();
  return latest.exists ? latest.data() : activeSub;
}

async function checkSubscriptionOrder(reference, uid) {
  const orderRef = adminDb.doc("subscriptionOrders/" + reference);
  const snap = await orderRef.get();
  if (!snap.exists || snap.data().uid !== uid) return { found: false };

  const order = snap.data();
  if (order.status === "COMPLETED") {
    const sub = await adminDb.doc("subscriptions/" + uid).get();
    return { found: true, payment_status: "COMPLETED", sub: sub.exists ? sub.data() : null };
  }
  if (order.status === "FAILED") {
    return { found: true, payment_status: "FAILED", detail: order.failureStatus || "failed" };
  }
  if (order.status === "FLAGGED") {
    return { found: true, payment_status: "PENDING", detail: "under_review" };
  }
  if (order.lastCheckedAtMs && Date.now() - order.lastCheckedAtMs < 3000) {
    return { found: true, payment_status: "PENDING" };
  }

  const result = await checkStatus(reference);
  const body = result.data || {};
  const payment = body.data || {};

  if (body.code === "PAYMENT_NOT_FOUND") {
    if (!order.providerReference && Date.now() - (order.createdAtMs || 0) > NOT_FOUND_GRACE_MS) {
      await orderRef.update({ status: "FAILED", failureStatus: "failed", lastCheckedAtMs: Date.now() });
      return { found: true, payment_status: "FAILED", detail: "not_found" };
    }
    return { found: true, payment_status: "PENDING" };
  }

  if (!result.ok || body.status !== "success" || !payment.status) {
    const error = new Error("Payment status is temporarily unavailable.");
    error.code = "STATUS_UNAVAILABLE";
    throw error;
  }

  const mismatch =
    payment.reference !== reference ||
    String(payment.currency || "").toUpperCase() !== "TZS" ||
    Number(payment.amount) !== Number(order.amount);

  const mapped = classify(payment.status);
  if (mapped === "COMPLETED" && mismatch) {
    await orderRef.update({
      status: "FLAGGED",
      flagReason: "amount/currency/reference mismatch",
      lastCheckedAtMs: Date.now()
    });
    return { found: true, payment_status: "PENDING", detail: "under_review" };
  }

  if (mapped === "COMPLETED") {
    const sub = await activateSubscription(reference, payment);
    return { found: true, payment_status: "COMPLETED", sub };
  }

  await orderRef.update({
    lastCheckedAtMs: Date.now(),
    lastProviderStatus: payment.status,
    ...(payment.provider_reference ? { providerReference: payment.provider_reference } : {}),
    ...(mapped === "FAILED" ? { status: "FAILED", failureStatus: payment.status } : {})
  });

  return { found: true, payment_status: mapped, detail: payment.status };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }

  try {
    const user = await verifiedUser(req, res);
    if (!user) return;

    const body = req.body || {};
    const action = body.action;

    if (action === "me") {
      const subRef = adminDb.doc("subscriptions/" + user.uid);
      let snap = await subRef.get();
      if (!snap.exists) {
        const initialSub = {
          plan: "bure",
          status: "free",
          startedAtMs: Date.now(),
          trialEndsAtMs: 0,
          expiresAtMs: 0,
          currency: "TZS",
          updatedAt: FieldValue.serverTimestamp()
        };
        await subRef.create(initialSub).catch(async error => {
          if (error.code !== 6 && error.code !== "already-exists") throw error;
        });
        snap = await subRef.get();
      }

      // Retire legacy trial records: only a verified paid subscription unlocks the app.
      if (
        snap.exists &&
        !(Number(snap.data().expiresAtMs) > Date.now()) &&
        (snap.data().status === "trial" || Number(snap.data().trialEndsAtMs) > 0)
      ) {
        await subRef.set({
          plan: "bure",
          status: "free",
          trialEndsAtMs: 0,
          expiresAtMs: 0,
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });
        snap = await subRef.get();
      } else if (
        snap.exists &&
        Number(snap.data().expiresAtMs) > Date.now() &&
        !snap.data().expiresAt
      ) {
        // Add a Firestore Timestamp for rules to compare safely with request.time.
        await subRef.set({
          expiresAt: new Date(Number(snap.data().expiresAtMs)),
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });
        snap = await subRef.get();
      }
      return res.json({ success: true, sub: snap.exists ? snap.data() : null });
    }

    if (action === "init") {
      const plan = PLANS[body.plan];
      if (!plan || body.period !== plan.period) {
        return res.status(400).json({ success: false, message: "Choose a valid plan and billing period." });
      }

      const phone = normalizeTanzaniaPhone(body.phone);
      if (!phone) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number. Use 07XXXXXXXX, 06XXXXXXXX or +255XXXXXXXXX."
        });
      }

      const email = String(user.email || "").trim();
      if (!email) {
        return res.status(400).json({ success: false, message: "Your account does not have a billing email address." });
      }

      // Reuse a recent pending request for the same account, plan and phone
      // instead of sending duplicate mobile-money prompts.
      const recentOrders = await adminDb.collection("subscriptionOrders")
        .where("uid", "==", user.uid).get();
      const now = Date.now();
      for (const pending of recentOrders.docs) {
        const old = pending.data();
        if (
          old.status === "PENDING" &&
          old.plan === body.plan &&
          old.phone === phone &&
          now - (old.createdAtMs || 0) < 120000
        ) {
          return res.json({ success: true, reference: pending.id, reused: true });
        }
      }

      const reference = newReference();
      const amount = plan.amount;
      const displayName = String(body.name || user.name || "Mteja Mauzobora").trim().slice(0, 100);

      await adminDb.doc("subscriptionOrders/" + reference).set({
        uid: user.uid,
        plan: body.plan,
        period: plan.period,
        amount,
        currency: "TZS",
        phone,
        provider: "splashpay",
        status: "PENDING",
        createdAt: FieldValue.serverTimestamp(),
        createdAtMs: Date.now()
      });

      let result;
      try {
        result = await initiateMobileMoney({
          amount, reference, phone,
          customerName: displayName,
          customerEmail: email
        });
      } catch (error) {
        if (error instanceof SplashPayConfigError) {
          await adminDb.doc("subscriptionOrders/" + reference).update({ status: "FAILED", failureStatus: "configuration" });
          return res.status(503).json({ success: false, message: "Payments are not configured yet. Please contact the administrator." });
        }
        return res.status(202).json({
          success: true, reference,
          message: "Ombi limetumwa; tunasubiri uthibitisho wa mtoa huduma."
        });
      }

      const response = result.data || {};
      const accepted = result.ok && response.status === "success" && response.data?.reference === reference;
      if (!accepted) {
        await adminDb.doc("subscriptionOrders/" + reference).update({
          status: "FAILED", failureStatus: "initiation_rejected"
        });
        return res.status(result.httpStatus >= 500 ? 502 : 400).json({
          success: false,
          message: response.message || "Could not start the payment. Check the phone number and try again."
        });
      }

      await adminDb.doc("subscriptionOrders/" + reference).update({
        providerReference: response.data.provider_reference || null,
        channel: response.data.channel || null
      });

      return res.json({ success: true, reference });
    }

    if (action === "status") {
      const reference = String(body.reference || "");
      if (!reference || reference.includes("/")) {
        return res.status(400).json({ success: false, message: "A payment reference is required." });
      }
      const result = await checkSubscriptionOrder(reference, user.uid);
      if (!result.found) return res.status(404).json({ success: false, message: "Payment was not found." });
      return res.json({
        success: true,
        payment_status: result.payment_status,
        detail: result.detail || null,
        sub: result.sub || null
      });
    }

    return res.status(400).json({ success: false, message: "Unknown action." });
  } catch (error) {
    if (error instanceof SplashPayConfigError) {
      return res.status(503).json({ success: false, message: "Payments are currently unavailable. Please contact the administrator." });
    }
    if (error.code === "STATUS_UNAVAILABLE") {
      return res.status(200).json({ success: true, payment_status: "PENDING", message: "We are still verifying your payment." });
    }
    console.error("MauzoBora subscription API error:", error);
    return res.status(500).json({ success: false, message: "A server error occurred. Please try again later." });
  }
}
