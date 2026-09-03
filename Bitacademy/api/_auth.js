const jwt = require("jsonwebtoken");

const COOKIE_NAME = "bitacademy_session";
const MAX_AGE = 60 * 60 * 24 * 7;

function getSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não está configurado.");
  }
  return process.env.JWT_SECRET;
}

function serializeCookie(value, maxAge) {
  const parts = [
    `${COOKIE_NAME}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`
  ];

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function setSessionCookie(res, user) {
  const token = jwt.sign(
    { sub: user.id, type: user.account_type },
    getSecret(),
    { expiresIn: MAX_AGE }
  );

  res.setHeader("Set-Cookie", serializeCookie(token, MAX_AGE));
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", serializeCookie("", 0));
}

function getTokenFromRequest(req) {
  const header = req.headers?.cookie || "";
  const cookies = header.split(";").map((item) => item.trim());
  const session = cookies.find((item) => item.startsWith(`${COOKIE_NAME}=`));

  return session ? decodeURIComponent(session.slice(COOKIE_NAME.length + 1)) : null;
}

function getSessionUserId(req) {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  try {
    const payload = jwt.verify(token, getSecret());
    return payload.sub || null;
  } catch {
    return null;
  }
}

module.exports = {
  setSessionCookie,
  clearSessionCookie,
  getSessionUserId
};
