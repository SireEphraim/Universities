"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(f.get("email")),
      password: String(f.get("password")),
    });
    if (error) setMsg(error.message);
    else {
      const next = new URLSearchParams(window.location.search).get("next") ?? "";
      window.location.href = next.startsWith("/") && !next.startsWith("//") ? next : "/materials";
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto space-y-3 p-6">
      <h1 className="text-2xl font-bold">Log in</h1>
      <input name="email" type="email" required placeholder="Email" className="w-full border rounded px-3 py-2" />
      <input name="password" type="password" required placeholder="Password" className="w-full border rounded px-3 py-2" />
      <button className="w-full bg-blue-600 text-white rounded py-2">Log in</button>
          {msg && <p role="status" className="text-sm text-red-600">{msg}</p>}
      <p className="text-sm">No account? <Link href="/register" className="text-blue-600 underline">Register free</Link></p>
    </form>
  );
}
