"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { hashFile } from "@/lib/hash";

const MAX_MB = 20;
const ALLOWED = ["application/pdf", "image/jpeg", "image/png"];

export default function UploadForm() {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const file = f.get("file") as File;
    if (!file?.size) return setMsg("Choose a file.");
    if (!ALLOWED.includes(file.type)) return setMsg("Only PDF, JPG or PNG files.");
    if (file.size > MAX_MB * 1024 * 1024) return setMsg(`File must be under ${MAX_MB} MB.`);

    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setMsg("Log in to upload.");

      const hash = await hashFile(file);
      const { data: exists } = await supabase.rpc("hash_exists", { h: hash });
      if (exists) return setMsg("This document is already on StudyBank. Thanks for checking!");

      const path = `${hash}/${file.name.replace(/[^\w.-]/g, "_")}`;
      const up = await supabase.storage.from("documents").upload(path, file, { upsert: false });
      if (up.error && !/exists/i.test(up.error.message)) throw up.error;

      const { error } = await supabase.from("documents").insert({
        content_hash: hash,
        title: f.get("title"),
        course_code: String(f.get("course_code")).toUpperCase().trim(),
        kind: f.get("kind"),
        session: f.get("session") || null,
        storage_path: path,
        file_size: file.size,
        uploaded_by: user.id,
      });
      if (error?.code === "23505") return setMsg("Someone just uploaded this same document.");
      if (error) throw error;
      setMsg("Uploaded. A moderator will review it before it goes live.");
      form.reset();
    } catch (err: any) {
      setMsg(err.message ?? "Upload failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto space-y-3 p-6">
      <input name="title" required placeholder="Title" className="w-full border rounded px-3 py-2" />
      <input name="course_code" required placeholder="Course code (e.g. CSC101)" className="w-full border rounded px-3 py-2" />
      <select name="kind" className="w-full border rounded px-3 py-2">
        <option value="past_question">Past question</option>
        <option value="material">Course material</option>
      </select>
      <input name="session" placeholder="Session (e.g. 2023/2024)" className="w-full border rounded px-3 py-2" />
      <input name="file" type="file" accept=".pdf,image/jpeg,image/png" required />
      <button disabled={busy} className="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-50">
        {busy ? "Checking and uploading…" : "Upload document"}
      </button>
      {msg && <p role="status" className="text-sm text-gray-700">{msg}</p>}
    </form>
  );
}
