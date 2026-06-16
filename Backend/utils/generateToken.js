import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.JWT_SECRET || "please-change-this-secret-in-production";
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload) {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function generateToken(user) {
  const id = user._id?.toString() || user.id;
  const email = user.email;

  if (!id || !email) {
    throw new Error("Cannot generate session token without valid user id and email");
  }

  const payload = {
    id,
    email,
    issuedAt: Date.now()
  };

  const payloadString = JSON.stringify(payload);
  const signature = sign(payloadString);
  return `${base64UrlEncode(payloadString)}.${signature}`;
}

export function verifyToken(token) {
  const parts = String(token).split(".");
  if (parts.length !== 2) {
    throw new Error("Invalid session token format");
  }

  const [encodedPayload, signature] = parts;
  const payloadString = base64UrlDecode(encodedPayload);
  const expectedSignature = sign(payloadString);

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    throw new Error("Invalid session token signature");
  }

  const payload = JSON.parse(payloadString);
  if (!payload.issuedAt || typeof payload.issuedAt !== "number") {
    throw new Error("Invalid session token payload");
  }

  if (Date.now() - payload.issuedAt > TOKEN_EXPIRY_MS) {
    throw new Error("Session token expired");
  }

  return payload;
}
