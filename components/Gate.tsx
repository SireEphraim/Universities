"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Shows its children only to visitors (guest) or only to logged-in students (member).
export default function Gate({ show, children }: { show: "guest" | "member"; children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
  }, []);
  if (authed === null) return null;
  return (show === "member") === authed ? <>{children}</> : null;
}
