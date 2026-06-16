import { verifyToken as verifySessionToken } from "../utils/generateToken.js";

export function verifyToken(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    const error = new Error("Login required");
    error.status = 401;
    next(error);
    return;
  }

  try {
    req.user = verifySessionToken(token);
    next();
  } catch (error) {
    const authError = new Error(error.message || "Invalid session token");
    authError.status = 401;
    next(authError);
  }
}
