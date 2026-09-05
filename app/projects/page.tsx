"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Copy, Trash2, Upload, FolderOpen } from "lucide-react";
import {
  Project,
  listProjects,
  deleteProject,
  duplicateProject,
  exportProjectFile,
  importProjectFile,
} from "@/lib/storage/indexeddb";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { GlassButton } from "@/components/glass/GlassButton";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    setProjects(await listProjects());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Your projects</h1>
          <p className="text-ink-muted">Saved on this device. No account required.</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.motion.json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                await importProjectFile(file);
                refresh();
              }
            }}
          />
          <GlassButton variant="glass" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-3.5 w-3.5" />
            Import project
          </GlassButton>
        </div>
      </div>

      {loading ? (
        <p className="text-ink-faint">Loading…</p>
      ) : projects.length === 0 ? (
        <LiquidGlass level="subtle" className="p-10 text-center text-ink-muted">
          No saved projects yet. Open a template and hit &ldquo;Save locally&rdquo;.
        </LiquidGlass>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <LiquidGlass key={p.id} level="subtle" className="flex flex-col gap-3 p-5">
              <div className="text-[15px] font-medium text-ink">{p.name}</div>
              <div className="text-xs text-ink-faint">
                {p.template} · {p.canvas} · {new Date(p.updatedAt).toLocaleDateString()}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Link href={`/motion/${p.template}?project=${p.id}`}>
                  <GlassButton variant="glass" size="sm">
                    <FolderOpen className="h-3.5 w-3.5" />
                    Open
                  </GlassButton>
                </Link>
                <GlassButton variant="ghost" size="sm" onClick={async () => { await duplicateProject(p.id); refresh(); }}>
                  <Copy className="h-3.5 w-3.5" />
                </GlassButton>
                <GlassButton variant="ghost" size="sm" onClick={() => exportProjectFile(p)}>
                  <Upload className="h-3.5 w-3.5 rotate-180" />
                </GlassButton>
                <GlassButton variant="ghost" size="sm" onClick={async () => { await deleteProject(p.id); refresh(); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </GlassButton>
              </div>
            </LiquidGlass>
          ))}
        </div>
      )}
    </div>
  );
}
