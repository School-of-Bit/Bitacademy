const { clearSessionCookie } = require("../../lib/_auth");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  clearSessionCookie(res);
  return res.status(200).json({ ok: true });
};
