import PresentationList from "@/app/components/PresentationList";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-white/10 px-6 py-6">
        <h1 className="text-2xl font-bold text-white">SlideMaker</h1>
        <p className="mt-1 text-sm text-white/50">
          AI-powered presentation builder
        </p>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <PresentationList />
      </main>
    </div>
  );
}
