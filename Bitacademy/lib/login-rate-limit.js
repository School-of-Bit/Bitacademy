const { createHash } = require("node:crypto");
const { sql } = require("./db");
const { isIP } = require("node:net");

function loginBuckets(req, email) {
  const hash = (kind, value) => `${kind}:${createHash("sha256").update(value).digest("hex")}`;
  const buckets = [{ key: hash("email", email), limit: 10 }];
  // Só confia no cabeçalho de IP gerenciado pela Vercel quando implantado nela.
  const forwarded = process.env.VERCEL === "1" ? req.headers?.["x-vercel-forwarded-for"] : null;
  const ip = typeof forwarded === "string" && isIP(forwarded.trim())
    ? forwarded.trim() : (process.env.VERCEL === "1" ? null : req.socket?.remoteAddress);
  if (ip && isIP(ip)) buckets.push({ key: hash("ip", ip), limit: 60 });
  return buckets;
}

async function checkLoginRateLimit(req, email) {
  // UPSERT atômico: não depende da memória de uma função serverless.
  const buckets = loginBuckets(req, email);
  let retryAfter = 0;
  for (const { key, limit } of buckets) {
    const [row] = await sql`
      INSERT INTO login_rate_limits (bucket, attempts, expires_at)
      VALUES (${key}, 1, NOW() + INTERVAL '15 minutes')
      ON CONFLICT (bucket) DO UPDATE SET
        attempts = CASE WHEN login_rate_limits.expires_at <= NOW() THEN 1
                        ELSE LEAST(login_rate_limits.attempts + 1, ${limit + 1}) END,
        expires_at = CASE WHEN login_rate_limits.expires_at <= NOW()
                          THEN NOW() + INTERVAL '15 minutes' ELSE login_rate_limits.expires_at END
      RETURNING attempts, GREATEST(1, CEIL(EXTRACT(EPOCH FROM (expires_at - NOW())))) AS retry_after
    `;
    if (Number(row.attempts) > limit) retryAfter = Math.max(retryAfter, Number(row.retry_after));
  }
  return retryAfter;
}
module.exports = { checkLoginRateLimit, loginBuckets };
