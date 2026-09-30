// Starts a Paystack checkout. Deploy WITH JWT verification (default).
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
};
const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  const { data: { user } } = await admin.auth.getUser(token);
  if (!user?.email) return json({ error: "Log in first" }, 401);

  const { plan_id } = await req.json();
  const { data: plan } = await admin.from("plans").select("*").eq("id", plan_id).single();
  if (!plan) return json({ error: "Unknown plan" }, 400);

  // The price comes from the database, never from the browser.
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: user.email,
      amount: plan.price_kobo,
      callback_url: `${Deno.env.get("SITE_URL")}/?payment=done`,
      metadata: { user_id: user.id, plan_id: plan.id },
    }),
  });
  const out = await res.json();
  if (!out.status) return json({ error: out.message ?? "Paystack error" }, 502);
  return json({ url: out.data.authorization_url });
});
