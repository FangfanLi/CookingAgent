import { neon } from "@neondatabase/serverless";

async function ensureTables(sql) {
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
}

export default async function handler(req) {
  // Initialize inside handler so env vars are guaranteed available
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!dbUrl) {
    return Response.json({ error: "DATABASE_URL not set" }, { status: 500 });
  }

  let sql;
  try {
    sql = neon(dbUrl);
  } catch (err) {
    return Response.json({ error: `neon init failed: ${err.message}` }, { status: 500 });
  }

  try {
    await ensureTables(sql);

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
      for (const c of (body.yt   || [])) await sql`INSERT INTO creators (platform, name, handle) VALUES ('yt',   ${c.d}, ${c.raw})`;
      for (const c of (body.bili || [])) await sql`INSERT INTO creators (platform, name, handle) VALUES ('bili', ${c.d}, ${c.raw})`;
      return Response.json({ ok: true });
    }

    // PATCH meal status
    if (req.method === "PATCH") {
      const { planId, mealIndex, status } = body;
      const [plan] = await sql`SELECT meals FROM plans WHERE id = ${planId}`;
      if (!plan) return Response.json({ error: "Plan not found" }, { status: 404 });
      const meals = plan.meals;
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

export const config = { runtime: "edge" };    if (req.method === "DELETE") {
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
