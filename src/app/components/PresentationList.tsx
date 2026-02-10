"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface PresentationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  slideCount: number;
}

export default function PresentationList() {
  const [presentations, setPresentations] = useState<PresentationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPresentations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/presentations");
      if (res.ok) {
        const data = await res.json();
        setPresentations(data);
      }
    } catch (err) {
      console.error("Failed to fetch presentations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPresentations();
  }, [fetchPresentations]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/presentations/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPresentations();
      }
    } catch (err) {
      console.error("Failed to delete presentation:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg text-white/60">Loading presentations…</p>
      </div>
    );
  }

  if (presentations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-lg text-white/60">No presentations yet</p>
        <Link
          href="/presentation/new"
          className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          + New Presentation
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/60">
          {presentations.length} presentation{presentations.length !== 1 ? "s" : ""}
        </p>
        <Link
          href="/presentation/new"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          + New Presentation
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {presentations.map((p) => (
          <div
            key={p.id}
            className="group relative flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/10"
          >
            <Link
              href={`/presentation/${p.id}`}
              className="absolute inset-0 z-0 rounded-xl"
              aria-label={`Open ${p.title}`}
            />
            <h2 className="text-lg font-semibold text-white">{p.title}</h2>
            <div className="flex items-center gap-3 text-sm text-white/50">
              <span>{p.slideCount} slide{p.slideCount !== 1 ? "s" : ""}</span>
              <span>·</span>
              <span>{new Date(p.createdAt).toLocaleDateString()}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(p.id, p.title);
              }}
              className="relative z-10 mt-auto self-end rounded-md px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
