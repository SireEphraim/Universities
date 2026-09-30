import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StudyBank – Past questions and course materials",
  description: "Past exam questions and course materials for Nigerian university students.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
