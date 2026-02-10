import PresentationList from "@/app/components/PresentationList";
import UserMenu from "@/app/components/UserMenu";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-6">
        <div>
          <h1 className="text-2xl font-bold text-white">SlideMaker</h1>
          <p className="mt-1 text-sm text-white/50">
            AI-powered presentation builder
          </p>
        </div>
        <UserMenu />
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <PresentationList />
      </main>
    </div>
  );
}