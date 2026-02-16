import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { stringify, parse } from "yaml";

const BASE_DIR = join(
  process.env.HOME ?? process.env.USERPROFILE ?? "~",
  ".human-compiler"
);

export interface ProfileMeta {
  name: string;
  started: string;
  last_updated: string;
  current_phase: number;
  phases_completed: number[];
  status: "in_progress" | "complete" | "generating";
}

export interface Domain {
  name: string;
  depth: "beginner" | "intermediate" | "advanced" | "expert";
  details: string;
}

export interface Scenario {
  situation: string;
  response: string;
}

export interface AnalyzedDocument {
  source: string;
  title: string;
  patterns_found: string[];
}

export interface Profile {
  meta: ProfileMeta;
  identity?: {
    role?: string;
    organization?: string;
    team?: string;
    responsibilities?: string[];
    goals?: string[];
    reporting_structure?: string;
    tenure?: string;
  };
  communication?: {
    writing_style?: string;
    tone_spectrum?: {
      formal?: string;
      casual?: string;
    };
    patterns?: string[];
    email_examples?: string[];
    vocabulary?: string[];
  };
  decision_making?: {
    framework?: string;
    prioritization?: string;
    under_uncertainty?: string;
    tradeoff_patterns?: string[];
    examples?: string[];
  };
  expertise?: {
    domains?: Domain[];
    technical_skills?: string[];
    industry_knowledge?: string[];
  };
  work_patterns?: {
    daily_routine?: string;
    tools?: string[];
    collaboration_style?: string;
    meeting_behavior?: string;
    task_management?: string;
  };
  edge_cases?: {
    conflict_resolution?: string;
    ambiguity_handling?: string;
    failure_response?: string;
    scenarios?: Scenario[];
  };
  artifacts?: {
    analyzed_documents?: AnalyzedDocument[];
    synthesized_patterns?: string[];
  };
  calibration?: {
    corrections?: string[];
    additions?: string[];
    confidence_score?: number;
  };
}

function profileDir(name: string): string {
  return join(BASE_DIR, slugify(name));
}

function profilePath(name: string): string {
  return join(profileDir(name), "profile.yaml");
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getBaseDir(): string {
  return BASE_DIR;
}

export function getProfileDir(name: string): string {
  return profileDir(name);
}

export async function init(name: string): Promise<Profile> {
  const dir = profileDir(name);
  await mkdir(dir, { recursive: true });
  await mkdir(join(dir, "phases"), { recursive: true });
  await mkdir(join(dir, "artifacts"), { recursive: true });

  const profile: Profile = {
    meta: {
      name,
      started: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      current_phase: 1,
      phases_completed: [],
      status: "in_progress",
    },
  };

  await writeFile(profilePath(name), stringify(profile), "utf-8");
  return profile;
}

export async function load(name: string): Promise<Profile> {
  const path = profilePath(name);
  if (!existsSync(path)) {
    throw new Error(`Profile not found: ${name} (looked at ${path})`);
  }
  const content = await readFile(path, "utf-8");
  return parse(content) as Profile;
}

export async function save(name: string, profile: Profile): Promise<void> {
  profile.meta.last_updated = new Date().toISOString();
  await writeFile(profilePath(name), stringify(profile), "utf-8");
}

export async function updatePhase(
  name: string,
  phase: number,
  data: Partial<Profile>
): Promise<Profile> {
  const profile = await load(name);

  // Deep merge the phase data into the profile
  for (const [key, value] of Object.entries(data)) {
    if (key === "meta") continue; // Don't overwrite meta via phase update
    (profile as Record<string, unknown>)[key] = value;
  }

  profile.meta.current_phase = phase;
  profile.meta.last_updated = new Date().toISOString();

  await save(name, profile);
  return profile;
}

export async function markPhaseComplete(
  name: string,
  phase: number
): Promise<Profile> {
  const profile = await load(name);

  if (!profile.meta.phases_completed.includes(phase)) {
    profile.meta.phases_completed.push(phase);
    profile.meta.phases_completed.sort((a, b) => a - b);
  }

  // Advance current phase to next incomplete
  profile.meta.current_phase = phase + 1;
  profile.meta.last_updated = new Date().toISOString();

  await save(name, profile);
  return profile;
}

export async function getStatus(
  name: string
): Promise<{ exists: boolean; profile?: Profile }> {
  const path = profilePath(name);
  if (!existsSync(path)) {
    return { exists: false };
  }
  const profile = await load(name);
  return { exists: true, profile };
}

export async function saveTranscript(
  name: string,
  phase: number,
  content: string
): Promise<string> {
  const dir = profileDir(name);
  const phasePadded = String(phase).padStart(2, "0");
  const filePath = join(dir, "phases", `phase-${phasePadded}-raw.md`);
  await writeFile(filePath, content, "utf-8");
  return filePath;
}

export async function saveSummary(
  name: string,
  phase: number,
  content: string
): Promise<string> {
  const dir = profileDir(name);
  const phasePadded = String(phase).padStart(2, "0");
  const filePath = join(dir, "phases", `phase-${phasePadded}-summary.md`);
  await writeFile(filePath, content, "utf-8");
  return filePath;
}

export async function saveArtifact(
  name: string,
  artifact: { title: string; content: string; index?: number }
): Promise<string> {
  const dir = profileDir(name);
  const idx = artifact.index ?? Date.now();
  const slug = slugify(artifact.title).slice(0, 50);
  const filePath = join(dir, "artifacts", `artifact-${idx}-${slug}.md`);
  await writeFile(filePath, artifact.content, "utf-8");
  return filePath;
}

export async function finalize(name: string): Promise<Profile> {
  const profile = await load(name);
  profile.meta.status = "complete";
  profile.meta.last_updated = new Date().toISOString();
  await save(name, profile);
  return profile;
}

export async function listProfiles(): Promise<string[]> {
  if (!existsSync(BASE_DIR)) return [];
  const entries = await readdir(BASE_DIR, { withFileTypes: true });
  const profiles: string[] = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const yamlPath = join(BASE_DIR, entry.name, "profile.yaml");
      if (existsSync(yamlPath)) {
        profiles.push(entry.name);
      }
    }
  }
  return profiles;
}

export async function loadBySlug(slug: string): Promise<Profile> {
  const path = join(BASE_DIR, slug, "profile.yaml");
  if (!existsSync(path)) {
    throw new Error(`Profile not found for slug: ${slug}`);
  }
  const content = await readFile(path, "utf-8");
  return parse(content) as Profile;
}
