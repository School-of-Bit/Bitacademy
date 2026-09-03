const { sql } = require("./db");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const result = await sql`SELECT NOW() AS server_time`;
    return res.status(200).json({
      ok: true,
      database: "connected",
      serverTime: result[0].server_time
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    return res.status(500).json({
      ok: false,
      error: "Não foi possível conectar ao banco de dados."
    });
  }
};
