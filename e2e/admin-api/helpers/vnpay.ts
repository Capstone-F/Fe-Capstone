import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Signs a VNPay IPN callback so the suite can drive an order to PAID without a human
 * clicking through the VNPay sandbox page.
 *
 * `GET /payments/vnpay/return` only redirects — it does NOT finalize. Only the IPN path
 * (`GET /payments/vnpay/ipn`) settles the payment, deducts stock and creates the GHN
 * order, so that is what a fixture has to call.
 *
 * The hash reproduces exactly what the `vnpay` package does on the BE side
 * (`verifyReturnUrl` -> `buildPaymentUrlSearchParams` -> `verifySecureHash`):
 * drop vnp_SecureHash/vnp_SecureHashType, coerce vnp_Amount to a number, sort keys,
 * serialize with URLSearchParams, then HMAC-SHA512 hex with the shared secret.
 */

const BE_ENV_PATH =
  process.env.BE_ENV_PATH ??
  resolve(process.cwd(), "..", "Be-Capstone", ".env");

/** Reads a single key out of the BE `.env` file (read-only; the file is never written). */
export function readBackendEnv(key: string): string | null {
  let contents: string;
  try {
    contents = readFileSync(BE_ENV_PATH, "utf8");
  } catch {
    return null;
  }
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) {
      continue;
    }
    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }
    if (trimmed.slice(0, separator).trim() === key) {
      return trimmed.slice(separator + 1).trim();
    }
  }
  return null;
}

export function getVnpHashSecret(): string {
  const secret =
    process.env.VNP_HASH_SECRET ?? readBackendEnv("VNP_HASH_SECRET");
  if (!secret) {
    throw new Error(
      `VNP_HASH_SECRET not found. Set it in the environment or make sure ${BE_ENV_PATH} is readable.`,
    );
  }
  return secret;
}

function signQuery(params: Record<string, string>, secret: string): string {
  const search = new URLSearchParams();
  for (const key of Object.keys(params).sort()) {
    const value = params[key];
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, value);
    }
  }
  return createHmac("sha512", secret)
    .update(Buffer.from(search.toString(), "utf-8"))
    .digest("hex");
}

/** `YYYYMMDDHHmmss` in GMT+7, the format VNPay stamps on vnp_PayDate. */
function vnpPayDate(now: Date): string {
  const gmt7 = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const pad = (value: number): string => String(value).padStart(2, "0");
  return (
    `${gmt7.getUTCFullYear()}${pad(gmt7.getUTCMonth() + 1)}${pad(gmt7.getUTCDate())}` +
    `${pad(gmt7.getUTCHours())}${pad(gmt7.getUTCMinutes())}${pad(gmt7.getUTCSeconds())}`
  );
}

/**
 * Turns the checkout `paymentUrl` into a signed successful-IPN query string.
 *
 * The echoed parameters are taken from the payment URL itself, so the txnRef and amount
 * always match the attempt the BE created.
 */
export function buildSuccessIpnQuery(paymentUrl: string, now: Date): string {
  const source = new URL(paymentUrl).searchParams;
  const params: Record<string, string> = {};
  for (const [key, value] of source.entries()) {
    if (key === "vnp_SecureHash" || key === "vnp_SecureHashType") {
      continue;
    }
    // VNPay does not echo these back on the IPN call.
    if (key === "vnp_ReturnUrl" || key === "vnp_ExpireDate") {
      continue;
    }
    params[key] = value;
  }

  const txnRef = params.vnp_TxnRef;
  if (!txnRef) {
    throw new Error(`paymentUrl has no vnp_TxnRef: ${paymentUrl}`);
  }

  params.vnp_ResponseCode = "00";
  params.vnp_TransactionStatus = "00";
  params.vnp_TransactionNo = `${Date.now()}`.slice(-8);
  params.vnp_BankCode = "NCB";
  params.vnp_BankTranNo = `VNP${params.vnp_TransactionNo}`;
  params.vnp_CardType = "ATM";
  params.vnp_PayDate = vnpPayDate(now);

  const signed = new URLSearchParams();
  for (const key of Object.keys(params).sort()) {
    signed.append(key, params[key]);
  }
  signed.append("vnp_SecureHash", signQuery(params, getVnpHashSecret()));
  return signed.toString();
}
