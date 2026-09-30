// Receives Paystack events and activates premium.
// Deploy with:  supabase functions deploy paystack-webhook --no-verify-jwt
import { createClient } from "npm:@supabase/supabase-js@2";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

async function sign(body: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  const raw = await req.text();   // must verify against the raw body
  const expected = await sign(raw, Deno.env.get("PAYSTACK_SECRET_KEY")!);
  if (expected !== req.headers.get("x-paystack-signature")) return new Response("bad signature", { status: 401 });

  const event = JSON.parse(raw);
  if (event.event !== "charge.success") return new Response("ignored");

  const { reference, amount, metadata } = event.data;
  const { user_id, plan_id } = metadata ?? {};
  if (!user_id || !plan_id) return new Response("no metadata");

  const { data: plan } = await admin.from("plans").select("*").eq("id", plan_id).single();
  if (!plan || plan.price_kobo !== amount) return new Response("amount mismatch", { status: 400 });

  // Unique reference = idempotent. A replayed event hits the conflict and stops here.
  const { error: dup } = await admin.from("payments")
    .insert({ reference, user_id, plan_id, amount_kobo: amount });
  if (dup) return new Response("already processed");

  // Renewals stack: extend from the current expiry if the user is still premium.
  const { data: p } = await admin.from("profiles").select("premium_until").eq("id", user_id).single();
  const start = Math.max(Date.now(), p?.premium_until ? new Date(p.premium_until).getTime() : 0);
  const until = new Date(start + plan.duration_days * 86_400_000).toISOString();

  await admin.from("profiles").update({ tier: "premium", premium_until: until }).eq("id", user_id);
  return new Response("ok");
});
