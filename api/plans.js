import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// Auto-create tables if they don't exist
async function ensureTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS creators (
      id        SERIAL PRIMARY KEY,
      platform  TEXT NOT NULL,
      name      TEXT NOT NULL,
      handle    TEXT NOT NULL,
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
}

export default async function handler(req) {
  try {
    await ensureTables();

    // ── GET /api/plans ─────────────────────────────────────────────────────
    // Returns { plans: [...], creators: { yt: [...], bili: [...] } }
    if (req.method === "GET") {
      const plans    = await sql`SELECT * FROM plans    ORDER BY created_at DESC LIMIT 12`;
      const creators = await sql`SELECT * FROM creators ORDER BY created_at ASC`;

      const yt   = creators.filter(c => c.platform === "yt")  .map(c => ({ raw: c.handle, d: c.name }));
      const bili = creators.filter(c => c.platform === "bili").map(c => ({ raw: c.handle, d: c.name }));

      return Response.json({ plans, creators: { yt, bili } });
    }

    const body = await req.json();

    // ── POST /api/plans { action: "save_plan", text, meals } ───────────────
    if (req.method === "POST" && body.action === "save_plan") {
      const { text, meals } = body;
      const [plan] = await sql`
        INSERT INTO plans (text, meals)
        VALUES (${text}, ${JSON.stringify(meals)})
        RETURNING *
      `;
      return Response.json({ plan });
    }

    // ── POST /api/plans { action: "save_creators", yt, bili } ─────────────
    if (req.method === "POST" && body.action === "save_creators") {
      const { yt, bili } = body;
      // Replace all creators atomically
      await sql`DELETE FROM creators`;
      for (const c of yt)   await sql`INSERT INTO creators (platform, name, handle) VALUES ('yt',   ${c.d}, ${c.raw})`;
      for (const c of bili) await sql`INSERT INTO creators (platform, name, handle) VALUES ('bili', ${c.d}, ${c.raw})`;
      return Response.json({ ok: true });
    }

    // ── PATCH /api/plans { planId, mealIndex, status } ────────────────────
    if (req.method === "PATCH") {
      const { planId, mealIndex, status } = body;
      const [plan] = await sql`SELECT meals FROM plans WHERE id = ${planId}`;
      if (!plan) return Response.json({ error: "Plan not found" }, { status: 404 });

      const meals = plan.meals;
      meals[mealIndex].status = status;

      await sql`UPDATE plans SET meals = ${JSON.stringify(meals)} WHERE id = ${planId}`;
      return Response.json({ ok: true, meals });
    }

    // ── DELETE /api/plans { action: "clear_history" } ──────────────────────
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

export const config = { runtime: "edge" };
