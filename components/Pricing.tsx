"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Plan = { id: string; label: string; price_kobo: number; duration_days: number };
const naira = (k: number) => "₦" + (k / 100).toLocaleString("en-NG");

export default function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    supabase.from("plans").select("*").order("duration_days").then(({ data }) => setPlans(data ?? []));
  }, []);

  async function subscribe(planId: string) {
    setErr("");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return (window.location.href = "/register");
    setBusy(planId);
    const { data, error } = await supabase.functions.invoke("paystack-init", { body: { plan_id: planId } });
    if (error || !data?.url) { setBusy(""); return setErr("Could not start payment. Try again."); }
    window.location.href = data.url;
  }

  return (
    <section id="pricing" className="px-6 py-20 bg-white">
      <h2 className="text-3xl font-bold text-center mb-3">Pick your plan</h2>
      <p className="text-center text-gray-600 mb-12">Start free. Upgrade when you need more.</p>
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6">
        <div className="p-6 border rounded-xl flex flex-col">
          <h3 className="text-xl font-semibold">Free</h3>
          <p className="text-3xl font-bold my-3">₦0</p>
          <ul className="text-gray-600 space-y-2 flex-1">
            <li>Limited past questions and materials</li>
            <li>Upload documents to share</li>
          </ul>
          <a href="/register" className="mt-6 text-center px-4 py-2 border rounded-lg hover:bg-gray-50">Create free account</a>
        </div>
        {plans.map((p) => (
          <div key={p.id} className={`p-6 border rounded-xl flex flex-col ${p.id === "semester" ? "border-blue-600 border-2" : ""}`}>
            <h3 className="text-xl font-semibold">{p.label}</h3>
            <p className="text-3xl font-bold my-3">{naira(p.price_kobo)}</p>
            <ul className="text-gray-600 space-y-2 flex-1">
              <li>All materials and past questions</li>
              <li>{p.duration_days} days of access</li>
            </ul>
            <button onClick={() => subscribe(p.id)} disabled={!!busy}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {busy === p.id ? "Opening Paystack…" : `Get ${p.label}`}
            </button>
          </div>
        ))}
      </div>
      {err && <p role="alert" className="text-center text-red-600 mt-6">{err}</p>}
    </section>
  );
}
