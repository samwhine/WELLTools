"use client";

import { openDB, DBSchema, IDBPDatabase } from "idb";
import { TemplateSettings, CanvasFormat } from "@/lib/motion/registry";

export type Project = {
  id: string;
  name: string;
  template: string;
  canvas: CanvasFormat;
  settings: TemplateSettings;
  updatedAt: number;
};

interface WellToolsDB extends DBSchema {
  projects: {
    key: string;
    value: Project;
    indexes: { "by-updated": number };
  };
}

let dbPromise: Promise<IDBPDatabase<WellToolsDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<WellToolsDB>("welltools", 1, {
      upgrade(db) {
        const store = db.createObjectStore("projects", { keyPath: "id" });
        store.createIndex("by-updated", "updatedAt");
      },
    });
  }
  return dbPromise;
}

export async function saveProject(project: Omit<Project, "updatedAt">): Promise<void> {
  const db = await getDB();
  await db.put("projects", { ...project, updatedAt: Date.now() });
}

export async function listProjects(): Promise<Project[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex("projects", "by-updated");
  return all.reverse();
}

export async function getProject(id: string): Promise<Project | undefined> {
  const db = await getDB();
  return db.get("projects", id);
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("projects", id);
}

export async function duplicateProject(id: string): Promise<Project | undefined> {
  const existing = await getProject(id);
  if (!existing) return undefined;
  const copy: Project = {
    ...existing,
    id: crypto.randomUUID(),
    name: `${existing.name} copy`,
    updatedAt: Date.now(),
  };
  const db = await getDB();
  await db.put("projects", copy);
  return copy;
}

/** Project Import/Export (spec §65) — makes projects portable without an account. */
export function exportProjectFile(project: Project) {
  const data = {
    name: project.name,
    template: project.template,
    canvas: project.canvas,
    settings: project.settings,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.name.replace(/\s+/g, "-").toLowerCase()}.motion.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importProjectFile(file: File): Promise<Project> {
  const text = await file.text();
  const data = JSON.parse(text);
  const project: Project = {
    id: crypto.randomUUID(),
    name: data.name ?? "Imported project",
    template: data.template,
    canvas: data.canvas ?? "9:16",
    settings: data.settings ?? {},
    updatedAt: Date.now(),
  };
  const db = await getDB();
  await db.put("projects", project);
  return project;
}
