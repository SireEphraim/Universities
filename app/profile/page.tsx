"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Google sign-ups arrive without university/department/level, so we ask here.
export default function ProfilePage() {
  const [p, setP] = useState({ full_name: "", university: "", department: "", level: "100" });
  const [uid, setUid] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/login"; return; }
      setUid(session.user.id);
      const { data } = await supabase.from("profiles").select("full_name, university, department, level")
        .eq("id", session.user.id).single();
      if (data) setP({ full_name: data.full_name ?? "", university: data.university ?? "",
                       department: data.department ?? "", level: String(data.level ?? 100) });
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("profiles")
      .update({ ...p, level: Number(p.level) }).eq("id", uid);
    if (error) setMsg(error.message); else window.location.href = "/materials";
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setP({ ...p, [k]: e.target.value });

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto space-y-3 p-6">
      <h1 className="text-2xl font-bold">Complete your profile</h1>
      <p className="text-gray-600 text-sm">We use this to show you the right courses.</p>
      <input value={p.full_name} onChange={set("full_name")} required placeholder="Full name" className="w-full border rounded px-3 py-2" />
      <input value={p.university} onChange={set("university")} required placeholder="University" className="w-full border rounded px-3 py-2" />
      <input value={p.department} onChange={set("department")} required placeholder="Department" className="w-full border rounded px-3 py-2" />
      <select value={p.level} onChange={set("level")} className="w-full border rounded px-3 py-2">
        {[100, 200, 300, 400, 500].map((l) => <option key={l}>{l}</option>)}
      </select>
      <button className="w-full bg-blue-600 text-white rounded py-2">Save and continue</button>
      {msg && <p role="alert" className="text-sm text-red-600">{msg}</p>}
    </form>
  );
}
