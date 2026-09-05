"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { registerAllTemplates } from "@/templates";
import { listTemplates, searchTemplates, filterTemplates, TemplateCategory } from "@/lib/motion/registry";
import { TemplateCard } from "@/components/motion/TemplateCard";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassTabs, GlassTabsList, GlassTabsTrigger } from "@/components/glass/GlassTabs";

registerAllTemplates();

const CATEGORIES: (TemplateCategory | "All")[] = [
  "All",
  "text",
  "editorial",
  "social",
  "icons",
  "callouts",
  "shapes",
  "transitions",
  "effects",
  "backgrounds",
  "data",
  "audio",
  "logo",
];

const CATEGORY_LABEL: Record<string, string> = {
  All: "All",
  text: "Text",
  editorial: "Editorial",
  social: "Social",
  icons: "UI / Icons",
  callouts: "Callouts",
  shapes: "Shapes",
  transitions: "Transitions",
  effects: "Effects",
  backgrounds: "Backgrounds",
  data: "Data / UI",
  audio: "Audio",
  logo: "Logo",
};

export default function MotionBrowserPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<TemplateCategory | "All">("All");

  const results = useMemo(() => {
    const base = query ? searchTemplates(query) : listTemplates();
    return filterTemplates(base, { category });
  }, [query, category]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Motion templates</h1>
          <Link href="/projects" className="text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline">
            Your projects
          </Link>
        </div>
        <p className="text-ink-muted">
          {listTemplates().length} templates today — the architecture supports hundreds more.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <GlassInput
            placeholder="Search templates…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <GlassTabs value={category} onValueChange={(v) => setCategory(v as TemplateCategory | "All")}>
          <GlassTabsList className="flex-wrap">
            {CATEGORIES.map((c) => (
              <GlassTabsTrigger key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </GlassTabsTrigger>
            ))}
          </GlassTabsList>
        </GlassTabs>
      </div>

      {results.length === 0 ? (
        <div className="rounded-glass border border-line bg-white/[0.03] p-10 text-center text-ink-muted">
          No templates match &ldquo;{query}&rdquo;. Try a different search or category.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      )}
    </div>
  );
}
