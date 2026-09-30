import AuthNav from "@/components/AuthNav";
import UploadForm from "@/components/UploadForm";

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <AuthNav />
      <h1 className="text-2xl font-bold text-center mt-8">Share a past question or material</h1>
      <p className="text-center text-gray-600 mt-2">Duplicates are detected automatically. New uploads are reviewed before they go live.</p>
      <UploadForm />
    </main>
  );
}
