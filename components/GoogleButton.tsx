"use client";
import { supabase } from "@/lib/supabase";

export default function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  async function go() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/materials` },
    });
  }
  return (
    <>
      <p className="text-center text-sm text-gray-500">or</p>
      <button type="button" onClick={go}
        className="w-full border rounded py-2 flex items-center justify-center gap-2 hover:bg-gray-50">
        <span aria-hidden className="font-bold text-blue-600">G</span> {label}
      </button>
    </>
  );
}
