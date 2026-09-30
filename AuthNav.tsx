"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AuthNav() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [mod, setMod] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setAuthed(!!session);
      if (session) {
        const { data } = await supabase.from("profiles").select("is_moderator").eq("id", session.user.id).single();
        setMod(!!data?.is_moderator);
      }
    })();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <nav className="px-6 py-4 max-w-6xl mx-auto flex items-center justify-between">
      <Link href="/" className="font-bold text-xl">StudyBank</Link>
      <div className="flex items-center gap-4 text-sm">
        <Link href="/#pricing" className="hover:underline">Pricing</Link>
        {authed ? (
          <>
            <Link href="/materials" className="hover:underline">Materials</Link>
            <Link href="/upload" className="hover:underline">Upload</Link>
            {mod && <Link href="/moderate" className="hover:underline font-medium">Moderate</Link>}
            <button onClick={logout} className="hover:underline">Log out</button>
          </>
        ) : authed === false ? (
          <>
            <Link href="/login" className="hover:underline">Log in</Link>
            <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Sign up free</Link>
          </>
        ) : null}
      </div>
    </nav>
  );
}
