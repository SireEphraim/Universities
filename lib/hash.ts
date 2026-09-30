// SHA-256 of the file's bytes, as hex. Runs in the browser, so duplicates
// are caught before any data is uploaded (saves students' bandwidth).
export async function hashFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
