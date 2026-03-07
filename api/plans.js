import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return res.status(500).json({ error: "DATABASE_URL not set" });
  }

  const sql = neon(dbUrl);

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS creators (
        id         SERIAL PRIMARY KEY,
        platform   TEXT NOT NULL,
        name       TEXT NOT NULL,
        handle     TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS plans (
        id         SERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        text       TEXT NOT NULL,
        meals      JSONB NOT NULL DEFAULT '[]'
      )
    `;

    if (req.method === "GET") {
      const plans    = await sql`SELECT * FROM plans    ORDER BY created_at DESC LIMIT 12`;
      const creators = await sql`SELECT * FROM creators ORDER BY created_at ASC`;
      const yt   = creators.filter(c => c.platform === "yt")  .map(c => ({ raw: c.handle, d: c.name }));
      const bili = creators.filter(c => c.platform === "bili").map(c => ({ raw: c.handle, d: c.name }));
      return res.status(200).json({ plans, creators: { yt, bili } });
    }

    if (req.method === "POST") {
      const body = req.body;

      if (body.action === "save_plan") {
        const [plan] = await sql`
          INSERT INTO plans (text, meals)
          VALUES (${body.text}, ${JSON.stringify(body.meals)})
          RETURNING *
        `;
        return res.status(200).json({ plan });
      }

      if (body.action === "save_creators") {
        await sql`DELETE FROM creators`;
        const ytRows   = (body.yt   || []).map(c => sql`INSERT INTO creators (platform, name, handle) VALUES ('yt',   ${c.d}, ${c.raw})`);
        const biliRows = (body.bili || []).map(c => sql`INSERT INTO creators (platform, name, handle) VALUES ('bili', ${c.d}, ${c.raw})`);
        await Promise.all([...ytRows, ...biliRows]);
        return res.status(200).json({ ok: true });
      }
    }

    if (req.method === "PATCH") {
      const { planId, mealIndex, status } = req.body;
      const rows = await sql`SELECT meals FROM plans WHERE id = ${planId}`;
      if (!rows.length) return res.status(404).json({ error: "Plan not found" });
      const meals = rows[0].meals;
      meals[mealIndex].status = status;
      await sql`UPDATE plans SET meals = ${JSON.stringify(meals)} WHERE id = ${planId}`;
      return res.status(200).json({ ok: true, meals });
    }

    if (req.method === "DELETE") {
      await sql`DELETE FROM plans`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    console.error("DB error:", err);
    return res.status(500).json({ error: err.message });
  }
}
