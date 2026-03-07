import { neon } from "@neondatabase/serverless";

export const runtime = "edge";

export default async function handler(req) {
  try {
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!dbUrl) {
      return Response.json({ error: "DATABASE_URL not set" }, { status: 500 });
    }

    const sql = neon(dbUrl);

    // Auto-create tables — inside try so any failure returns a clean error
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

    // GET — load all data
    if (req.method === "GET") {
      const plans    = await sql`SELECT * FROM plans    ORDER BY created_at DESC LIMIT 12`;
      const creators = await sql`SELECT * FROM creators ORDER BY created_at ASC`;
      const yt   = creators.filter(c => c.platform === "yt")  .map(c => ({ raw: c.handle, d: c.name }));
      const bili = creators.filter(c => c.platform === "bili").map(c => ({ raw: c.handle, d: c.name }));
      return Response.json({ plans, creators: { yt, bili } });
    }

    const body = await req.json();

    // POST save_plan
    if (req.method === "POST" && body.action === "save_plan") {
      const [plan] = await sql`
        INSERT INTO plans (text, meals)
        VALUES (${body.text}, ${JSON.stringify(body.meals)})
        RETURNING *
      `;
      return Response.json({ plan });
    }

    // POST save_creators
    if (req.method === "POST" && body.action === "save_creators") {
      await sql`DELETE FROM creators`;
      const ytRows   = (body.yt   || []).map(c => sql`INSERT INTO creators (platform, name, handle) VALUES ('yt',   ${c.d}, ${c.raw})`);
      const biliRows = (body.bili || []).map(c => sql`INSERT INTO creators (platform, name, handle) VALUES ('bili', ${c.d}, ${c.raw})`);
      await Promise.all([...ytRows, ...biliRows]);
      return Response.json({ ok: true });
    }

    // PATCH meal status
    if (req.method === "PATCH") {
      const { planId, mealIndex, status } = body;
      const rows = await sql`SELECT meals FROM plans WHERE id = ${planId}`;
      if (!rows.length) return Response.json({ error: "Plan not found" }, { status: 404 });
      const meals = rows[0].meals;
      meals[mealIndex].status = status;
      await sql`UPDATE plans SET meals = ${JSON.stringify(meals)} WHERE id = ${planId}`;
      return Response.json({ ok: true, meals });
    }

    // DELETE clear history
    if (req.method === "DELETE") {
      await sql`DELETE FROM plans`;
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 });

  } catch (err) {
    console.error("DB error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
