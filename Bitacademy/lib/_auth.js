const jwt = require("jsonwebtoken");
const { sql } = require("./db");

const COOKIE_NAME = "bitacademy_session";
const MAX_AGE = 60 * 60 * 24 * 7;

function getSessionSecret() {
  const secret = [process.env.JWT_SECRET, process.env.JWT_SECRET_KEY]
    .find((value) => typeof value === "string" && value.trim());
  if (!secret) {
    throw new Error("JWT_SECRET (ou JWT_SECRET_KEY) não está configurado para esta função.");
  }
  return secret;
}

function serializeCookie(value, maxAge) {
  const parts = [`${COOKIE_NAME}=${value}`, "Path=/", "HttpOnly", "SameSite=Lax", `Max-Age=${maxAge}`];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

function setSessionCookie(res, user) {
  const token = jwt.sign({ sub: user.id, type: user.account_type, ver: user.auth_version || 0 }, getSessionSecret(), { expiresIn: MAX_AGE });
  res.setHeader("Set-Cookie", serializeCookie(token, MAX_AGE));
}

function clearSessionCookie(res) { res.setHeader("Set-Cookie", serializeCookie("", 0)); }

function getTokenFromRequest(req) {
  const header = req.headers?.cookie || "";
  const cookies = header.split(";").map((item) => item.trim());
  const session = cookies.find((item) => item.startsWith(`${COOKIE_NAME}=`));
  return session ? decodeURIComponent(session.slice(COOKIE_NAME.length + 1)) : null;
}

async function getSessionUserId(req) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return null;
    const claims = jwt.verify(token, getSessionSecret());
    if (!claims.sub) return null;
    const users = await sql`SELECT auth_version FROM users WHERE id = ${claims.sub} LIMIT 1`;
    if (!users.length || Number(users[0].auth_version) !== Number(claims.ver || 0)) return null;
    return claims.sub;
  } catch (error) {
    if (error?.message?.includes("JWT_SECRET")) {
      console.error("Session auth configuration error:", error.message);
    } else if (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError") {
      console.warn("Session token rejected:", error.name);
    }
    return null;
  }
}

module.exports = { setSessionCookie, clearSessionCookie, getSessionUserId, getSessionSecret };
