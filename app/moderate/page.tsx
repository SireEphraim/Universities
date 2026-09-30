"use client";
import { useEffect, useState } from "react";
import AuthNav from "@/components/AuthNav";
import { supabase } from "@/lib/supabase";

type Doc = { id: string; title: string; course_code: string; kind: string; session: string | null;
             storage_path: string; file_size: number | null; is_premium: boolean };

export default function Moderate() {
  const [state, setState] = useState<"loading" | "denied" | "ok">("loading");
  const [docs, setDocs] = useState<Doc[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const { data } = await supabase.from("documents").select("*")
      .eq("status", "pending").order("created_at");
    setDocs(data ?? []);
  }

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/login?next=/moderate"; return; }
      const { data: me } = await supabase.from("profiles").select("is_moderator")
        .eq("id", session.user.id).single();
      if (!me?.is_moderator) return setState("denied");
      setState("ok");
      load();
    })();
  }, []);

  async function preview(path: string) {
    const { data } = await supabase.storage.from("documents").createSignedUrl(path, 120);
    if (data) window.open(data.signedUrl, "_blank");
    else setMsg("Could not open the file.");
  }

  async function decide(d: Doc, status: "approved" | "rejected") {
    setMsg("");
    const { error } = await supabase.from("documents")
      .update({ status, is_premium: d.is_premium }).eq("id", d.id);
    if (error) return setMsg(error.message);
    setDocs((cur) => cur.filter((x) => x.id !== d.id));
  }

  const togglePremium = (id: string) =>
    setDocs((cur) => cur.map((x) => (x.id === id ? { ...x, is_premium: !x.is_premium } : x)));

  if (state === "loading") return <p className="p-6">Loading…</p>;
  if (state === "denied") return <p className="p-6">You don't have moderator access.</p>;

  return (
    <main className="min-h-screen bg-gray-50">
      <AuthNav />
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h1 className="text-3xl font-bold mt-6 mb-6">Pending uploads ({docs.length})</h1>
        {msg && <p role="alert" className="text-red-600 mb-4">{msg}</p>}
        {docs.length === 0 && <p className="text-gray-600">Nothing waiting for review.</p>}
        <ul className="space-y-3">
          {docs.map((d) => (
            <li key={d.id} className="bg-white rounded-lg shadow p-4 space-y-3">
              <div>
                <p className="font-semibold">{d.title}</p>
                <p className="text-sm text-gray-500">
                  {d.course_code} · {d.kind === "past_question" ? "Past question" : "Material"}
                  {d.session ? ` · ${d.session}` : ""}
                  {d.file_size ? ` · ${(d.file_size / 1048576).toFixed(1)} MB` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={() => preview(d.storage_path)} className="px-3 py-2 border rounded-lg hover:bg-gray-50">Preview file</button>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={d.is_premium} onChange={() => togglePremium(d.id)} />
                  Premium only
                </label>
                <div className="ml-auto flex gap-2">
                  <button onClick={() => decide(d, "rejected")} className="px-4 py-2 border border-red-600 text-red-700 rounded-lg hover:bg-red-50">Reject</button>
                  <button onClick={() => decide(d, "approved")} className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800">Approve</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
