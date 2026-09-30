"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthNav from "@/components/AuthNav";
import { supabase } from "@/lib/supabase";

type Doc = { id: string; title: string; course_code: string; kind: string;
             session: string | null; is_premium: boolean; locked: boolean };

export default function Materials() {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  async function search(term = q, k = kind) {
    setLoading(true); setMsg("");
    const { data, error } = await supabase.rpc("browse_documents", { q: term.trim(), k: k || null });
    if (error) setMsg("Could not load materials. Try again.");
    setDocs(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/login?next=/materials"; return; }
      const { data: me } = await supabase.from("profiles").select("university").eq("id", session.user.id).single();
      if (me && !me.university) { window.location.href = "/profile"; return; }
      const initial = new URLSearchParams(window.location.search).get("q") ?? "";
      setQ(initial);
      search(initial, "");
    })();
  }, []);

  async function download(id: string) {
    setMsg("");
    const { data: row } = await supabase.from("documents").select("storage_path").eq("id", id).single();
    if (!row) return setMsg("You don't have access to this file.");
    const { data, error } = await supabase.storage
      .from("documents").createSignedUrl(row.storage_path, 60, { download: true });
    if (error || !data) return setMsg("Could not create the download link. Try again.");
    window.location.href = data.signedUrl;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <AuthNav />
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h1 className="text-3xl font-bold mt-6 mb-6">Past questions and materials</h1>

        <form onSubmit={(e) => { e.preventDefault(); search(); }} className="flex flex-col sm:flex-row gap-3 mb-6">
          <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search"
            placeholder="Course code or title (e.g., CSC101)"
            className="flex-1 border rounded-lg px-4 py-2 bg-white" />
          <select value={kind} onChange={(e) => { setKind(e.target.value); search(q, e.target.value); }}
            aria-label="Type" className="border rounded-lg px-3 py-2 bg-white">
            <option value="">All types</option>
            <option value="past_question">Past questions</option>
            <option value="material">Course materials</option>
          </select>
          <button className="bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700">Search</button>
        </form>

        {msg && <p role="alert" className="text-red-600 mb-4">{msg}</p>}
        {loading ? <p className="text-gray-500">Loading…</p>
          : docs.length === 0 ? (
            <p className="text-gray-600">Nothing found. Try another course code, or{" "}
              <Link href="/upload" className="text-blue-600 underline">upload one</Link> to help others.</p>
          ) : (
            <ul className="space-y-3">
              {docs.map((d) => (
                <li key={d.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{d.title}</p>
                    <p className="text-sm text-gray-500">
                      {d.course_code} · {d.kind === "past_question" ? "Past question" : "Material"}
                      {d.session ? ` · ${d.session}` : ""}
                      {d.is_premium && <span className="ml-2 text-amber-700 font-medium">Premium</span>}
                    </p>
                  </div>
                  {d.locked ? (
                    <Link href="/#pricing" className="shrink-0 px-4 py-2 border border-amber-600 text-amber-700 rounded-lg hover:bg-amber-50">
                      Upgrade to unlock
                    </Link>
                  ) : (
                    <button onClick={() => download(d.id)} className="shrink-0 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                      Download
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
      </div>
    </main>
  );
}
