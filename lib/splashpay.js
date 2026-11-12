import crypto from "node:crypto";

const BASE_URL = process.env.SPLASHPAY_BASE_URL || "https://api.splashpay.co.tz/api/v1";
const TIMEOUT_MS = 25000;

export class SplashPayConfigError extends Error {}

function credentials() {
  const key = process.env.SPLASHPAY_KEY;
  const secret = process.env.SPLASHPAY_SECRET;
  if (!key || !secret) throw new SplashPayConfigError("SplashPay credentials are not configured.");
  return { key, secret };
}

async function call(path, body, idempotencyKey) {
  const { key, secret } = credentials();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "X-API-KEY": key,
      "X-API-SECRET": secret
    };
    if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
    const response = await fetch(BASE_URL + path, {
      method: "POST", headers, body: JSON.stringify(body), signal: controller.signal
    });
    const raw = await response.text();
    let data;
    try { data = JSON.parse(raw); } catch { data = { raw_response: raw }; }
    return { ok: response.ok, httpStatus: response.status, data };
  } finally {
    clearTimeout(timer);
  }
}

export function initiateMobileMoney({ amount, reference, phone, customerName, customerEmail }) {
  return call("/payments/mobile-money", {
    amount, currency: "TZS", reference, phone,
    customer_name: customerName, customer_email: customerEmail
  }, reference);
}

export function checkStatus(reference) {
  return call("/payments/check-status", { reference });
}

export function classify(status) {
  const value = String(status || "").trim().toLowerCase();
  if (value === "success") return "COMPLETED";
  if (["failed", "cancelled", "expired"].includes(value)) return "FAILED";
  return "PENDING";
}

export function normalizeTanzaniaPhone(value) {
  let phone = String(value || "").trim().replace(/[\s-]+/g, "");
  if (phone.startsWith("+255")) phone = phone.slice(1);
  if (phone.startsWith("0")) phone = "255" + phone.slice(1);
  return /^255\d{9}$/.test(phone) ? phone : null;
}

export function newReference() {
  return "MBZ-" + crypto.randomBytes(10).toString("hex").toUpperCase();
}
