"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import GoogleButton from "@/components/GoogleButton";

export default function Register() {
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const { data, error } = await supabase.auth.signUp({
      email: String(f.get("email")),
      password: String(f.get("password")),
      options: {
        data: {
          full_name: f.get("full_name"),
          university: f.get("university"),
          department: f.get("department"),
          level: f.get("level"),
        },
      },
    });
    if (error) return setMsg(error.message);
    // With email confirmation off, signUp returns a session: go straight in.
    if (data.session) window.location.href = "/materials";
    else setMsg("Check your email to confirm your account.");
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto space-y-3 p-6">
      <h1 className="text-2xl font-bold">Create your free account</h1>
      <input name="full_name" required placeholder="Full name" className="w-full border rounded px-3 py-2" />
      <input name="email" type="email" required placeholder="Email" className="w-full border rounded px-3 py-2" />
      <input name="password" type="password" minLength={8} required placeholder="Password (8+ characters)" className="w-full border rounded px-3 py-2" />
      <input name="university" required placeholder="University" className="w-full border rounded px-3 py-2" />
      <input name="department" required placeholder="Department" className="w-full border rounded px-3 py-2" />
      <select name="level" className="w-full border rounded px-3 py-2">
        {[100, 200, 300, 400, 500].map((l) => <option key={l}>{l}</option>)}
      </select>
      <button className="w-full bg-blue-600 text-white rounded py-2">Register</button>
      <GoogleButton />
      {msg && <p role="status" className="text-sm">{msg}</p>}
    </form>
  );
}
