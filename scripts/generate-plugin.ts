#!/usr/bin/env bun
/**
 * Plugin Generator
 *
 * Takes a completed profile.yaml and generates a full Claude Code plugin
 * that embodies the person as an AI agent.
 *
 * Usage:
 *   bun run scripts/generate-plugin.ts <path-to-profile.yaml>
 *   bun run scripts/generate-plugin.ts ~/.human-compiler/jane-doe/profile.yaml
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { parse } from "yaml";
import Handlebars from "handlebars";
import type { Profile } from "./profile-manager.ts";

// Register Handlebars helpers
// Note: "slug" is passed as a pre-computed context variable, not a helper.
// Only register helpers that won't conflict with context properties.
Handlebars.registerHelper("json", (obj: unknown) =>
  JSON.stringify(obj, null, 2)
);
Handlebars.registerHelper("slugify", (name: string) => slugify(name));

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface TaskSkill {
  slug: string;
  name: string;
  description: string;
  context: string;
}

function deriveTaskSkills(profile: Profile): TaskSkill[] {
  const skills: TaskSkill[] = [];
  const slug = slugify(profile.meta.name);

  // Derive skills from work patterns
  if (profile.work_patterns) {
    const patterns = profile.work_patterns;

    if (
      patterns.task_management &&
      patterns.task_management.toLowerCase().includes("review")
    ) {
      skills.push({
        slug: `review-like-${slug}`,
        name: `Review Like ${profile.meta.name}`,
        description: `Review work the way ${profile.meta.name} would — applying their standards and feedback style`,
        context: `${profile.meta.name} reviews work with this approach: ${patterns.task_management}`,
      });
    }

    if (
      patterns.collaboration_style &&
      (patterns.collaboration_style.toLowerCase().includes("write") ||
        patterns.collaboration_style.toLowerCase().includes("document"))
    ) {
      skills.push({
        slug: `write-like-${slug}`,
        name: `Write Like ${profile.meta.name}`,
        description: `Draft content in ${profile.meta.name}'s writing style`,
        context: `${profile.meta.name}'s writing and collaboration approach: ${patterns.collaboration_style}`,
      });
    }
  }

  // Derive skills from expertise domains
  if (profile.expertise?.domains) {
    for (const domain of profile.expertise.domains) {
      if (domain.depth === "expert" || domain.depth === "advanced") {
        const domainSlug = slugify(domain.name);
        skills.push({
          slug: `${domainSlug}-advice-${slug}`,
          name: `${domain.name} Advice (${profile.meta.name})`,
          description: `Get ${profile.meta.name}'s expert perspective on ${domain.name}`,
          context: `${profile.meta.name} is ${domain.depth} in ${domain.name}: ${domain.details}`,
        });
      }
    }
  }

  return skills;
}

async function loadTemplate(name: string): Promise<HandlebarsTemplateDelegate> {
  const templateDir = join(dirname(new URL(import.meta.url).pathname), "templates");
  const content = await readFile(join(templateDir, `${name}.hbs`), "utf-8");
  return Handlebars.compile(content);
}

export async function generatePlugin(
  profilePath: string,
  outputDir?: string
): Promise<string> {
  // Load profile
  const profileContent = await readFile(profilePath, "utf-8");
  const profile = parse(profileContent) as Profile;

  const name = profile.meta.name;
  const slug = slugify(name);

  // Determine output directory
  const outDir = outputDir ?? join(dirname(profilePath), "output-plugin", `${slug}-agent`);

  // Create output directories
  await mkdir(join(outDir, ".claude-plugin"), { recursive: true });
  await mkdir(join(outDir, "agents"), { recursive: true });
  await mkdir(join(outDir, "skills", `ask-${slug}`), { recursive: true });

  // Derive task skills
  const taskSkills = deriveTaskSkills(profile);

  // Create skill directories
  for (const skill of taskSkills) {
    await mkdir(join(outDir, "skills", skill.slug), { recursive: true });
  }

  // Build template context
  const context = {
    ...profile,
    name,
    slug,
    taskSkills,
    compiledDate: new Date().toISOString().split("T")[0],
  };

  // Load and render all templates
  const [
    pluginJsonTpl,
    autonomousTpl,
    advisoryTpl,
    askSkillTpl,
    taskSkillTpl,
    claudeMdTpl,
  ] = await Promise.all([
    loadTemplate("plugin.json"),
    loadTemplate("agent-autonomous"),
    loadTemplate("agent-advisory"),
    loadTemplate("skill-ask"),
    loadTemplate("skill-task"),
    loadTemplate("claude-md"),
  ]);

  // Write plugin.json
  await writeFile(
    join(outDir, ".claude-plugin", "plugin.json"),
    pluginJsonTpl(context),
    "utf-8"
  );

  // Write agent files
  await writeFile(
    join(outDir, "agents", `${slug}-autonomous.md`),
    autonomousTpl(context),
    "utf-8"
  );

  await writeFile(
    join(outDir, "agents", `${slug}-advisory.md`),
    advisoryTpl(context),
    "utf-8"
  );

  // Write ask skill
  await writeFile(
    join(outDir, "skills", `ask-${slug}`, "SKILL.md"),
    askSkillTpl(context),
    "utf-8"
  );

  // Write task-specific skills
  for (const skill of taskSkills) {
    const skillContext = {
      ...context,
      taskSlug: skill.slug,
      taskName: skill.name,
      taskDescription: skill.description,
      context: skill.context,
    };
    await writeFile(
      join(outDir, "skills", skill.slug, "SKILL.md"),
      taskSkillTpl(skillContext),
      "utf-8"
    );
  }

  // Write CLAUDE.md
  await writeFile(join(outDir, "CLAUDE.md"), claudeMdTpl(context), "utf-8");

  return outDir;
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("generate-plugin.ts")) {
  const profilePath = process.argv[2];
  if (!profilePath) {
    console.error("Usage: bun run scripts/generate-plugin.ts <path-to-profile.yaml>");
    process.exit(1);
  }

  generatePlugin(profilePath)
    .then((outDir) => {
      console.log(`Plugin generated successfully!`);
      console.log(`Output: ${outDir}`);
      console.log(``);
      console.log(`To test locally:`);
      console.log(`  claude --plugin-dir ${outDir}`);
      console.log(``);
      console.log(`To install:`);
      console.log(`  claude /plugin install --from ${outDir}`);
    })
    .catch((err) => {
      console.error(`Generation failed: ${err.message}`);
      process.exit(1);
    });
}
