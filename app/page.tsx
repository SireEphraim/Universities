import Link from "next/link";
import Pricing from "@/components/Pricing";
import AuthNav from "@/components/AuthNav";

const courses = [
  "CSC101 – Introduction to Computing", "MTH102 – Calculus II", "GST103 – Use of English",
  "CSC203 – Programming Fundamentals", "PHY101 – General Physics", "CSC205 – Data Structures",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* NAV */}
      <AuthNav />

      {/* HERO */}
      <section className="px-6 py-20 max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Access Past Questions & Course Materials — <span className="text-blue-600">Fast.</span>
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Past exam questions, handouts and course materials for Nigerian university students, organised by course.
        </p>
        <form action="/materials" method="get" className="mt-10 flex justify-center">
          <div className="flex w-full max-w-xl bg-white shadow-lg rounded-xl overflow-hidden">
            <input type="text" name="q" placeholder="Search by course code or title (e.g., CHM101)"
              className="flex-1 px-4 py-3 outline-none text-gray-700" aria-label="Search courses" />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6">Search</button>
          </div>
        </form>
        <p className="mt-3 text-sm text-gray-500">Free account required to browse.</p>
        <Link href="/register" className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Create free account
        </Link>
      </section>

      {/* VALUE PROPOSITION */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center">
          <div><h3 className="text-xl font-semibold mb-2">📘 Past Exam Questions</h3>
            <p className="text-gray-600">Organised by university, department, level and session.</p></div>
          <div><h3 className="text-xl font-semibold mb-2">📚 Course Materials</h3>
            <p className="text-gray-600">Handouts, lecture notes and summaries.</p></div>
          <div><h3 className="text-xl font-semibold mb-2">⚡ Fast & Reliable</h3>
            <p className="text-gray-600">No ads, no clutter. Just what you need for your next exam.</p></div>
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Popular in Computer Science</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <Link key={c} href={`/materials?q=${c.split(" ")[0]}`} className="p-5 bg-white rounded-lg shadow hover:shadow-md transition">{c}</Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/materials" className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
            View all materials
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-20 bg-gray-100">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10 text-center">
          {[["Register", "Create a free account with your university, department and level."],
            ["Find your course", "Search by course code or browse your department."],
            ["Study smarter", "Download materials. Upgrade for full access. Upload your own to help others."]].map(([t, d], i) => (
            <div key={t}>
              <div className="text-4xl font-bold text-blue-600">{i + 1}</div>
              <h3 className="mt-4 text-xl font-semibold">{t}</h3>
              <p className="mt-2 text-gray-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <Pricing />

      {/* FINAL CTA */}
      <section className="px-6 py-20 bg-blue-600 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Start preparing better today</h2>
        <p className="mb-8 text-lg text-blue-100">Sign up free in under a minute.</p>
        <Link href="/register" className="inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition">
          Create free account
        </Link>
      </section>

      <footer className="px-6 py-8 bg-gray-900 text-gray-400 text-center">
        <p>© {new Date().getFullYear()} StudyBank. All rights reserved.</p>
        <p className="mt-2">Made for Nigerian university students 💙</p>
      </footer>
    </main>
  );
}
