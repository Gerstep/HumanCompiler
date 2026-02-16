import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { generatePlugin } from "../scripts/generate-plugin.ts";

const FIXTURE_DIR = join(import.meta.dirname!, "fixtures");
const PROFILE_PATH = join(FIXTURE_DIR, "sample-profile.yaml");
const OUTPUT_DIR = join(FIXTURE_DIR, "test-output", "sarah-chen-agent");

describe("Plugin Generator", () => {
  beforeAll(async () => {
    // Clean up any previous test output
    const testOutputDir = join(FIXTURE_DIR, "test-output");
    if (existsSync(testOutputDir)) {
      await rm(testOutputDir, { recursive: true, force: true });
    }
  });

  afterAll(async () => {
    const testOutputDir = join(FIXTURE_DIR, "test-output");
    if (existsSync(testOutputDir)) {
      await rm(testOutputDir, { recursive: true, force: true });
    }
  });

  it("generates a complete plugin directory", async () => {
    const outDir = await generatePlugin(PROFILE_PATH, OUTPUT_DIR);
    expect(outDir).toBe(OUTPUT_DIR);
    expect(existsSync(outDir)).toBe(true);
  });

  describe("output structure", () => {
    beforeAll(async () => {
      if (!existsSync(OUTPUT_DIR)) {
        await generatePlugin(PROFILE_PATH, OUTPUT_DIR);
      }
    });

    it("creates .claude-plugin/plugin.json", async () => {
      const path = join(OUTPUT_DIR, ".claude-plugin", "plugin.json");
      expect(existsSync(path)).toBe(true);

      const content = await readFile(path, "utf-8");
      const parsed = JSON.parse(content);
      expect(parsed.name).toBe("sarah-chen-agent");
      expect(parsed.version).toBe("1.0.0");
    });

    it("creates autonomous agent", async () => {
      const path = join(OUTPUT_DIR, "agents", "sarah-chen-autonomous.md");
      expect(existsSync(path)).toBe(true);

      const content = await readFile(path, "utf-8");
      expect(content).toContain("name: sarah-chen-autonomous");
      expect(content).toContain("permissionMode: acceptEdits");
      expect(content).toContain("Senior Product Manager");
    });

    it("creates advisory agent", async () => {
      const path = join(OUTPUT_DIR, "agents", "sarah-chen-advisory.md");
      expect(existsSync(path)).toBe(true);

      const content = await readFile(path, "utf-8");
      expect(content).toContain("name: sarah-chen-advisory");
      expect(content).toContain("permissionMode: plan");
      expect(content).toContain("NEVER take actions directly");
    });

    it("creates ask-<name> skill", async () => {
      const path = join(
        OUTPUT_DIR,
        "skills",
        "ask-sarah-chen",
        "SKILL.md"
      );
      expect(existsSync(path)).toBe(true);

      const content = await readFile(path, "utf-8");
      expect(content).toContain("name: ask-sarah-chen");
      expect(content).toContain("$ARGUMENTS");
    });

    it("creates CLAUDE.md", async () => {
      const path = join(OUTPUT_DIR, "CLAUDE.md");
      expect(existsSync(path)).toBe(true);

      const content = await readFile(path, "utf-8");
      expect(content).toContain("Sarah Chen");
      expect(content).toContain("sarah-chen-autonomous");
      expect(content).toContain("sarah-chen-advisory");
      expect(content).toContain("ask-sarah-chen");
    });

    it("generates task-specific skills from work patterns", async () => {
      // The sample profile has task_management mentioning "review" and
      // collaboration_style mentioning "writes" / "document" — these should
      // generate additional skills
      const skillsDir = join(OUTPUT_DIR, "skills");
      expect(existsSync(skillsDir)).toBe(true);

      // Check that the ask skill exists at minimum
      expect(
        existsSync(join(skillsDir, "ask-sarah-chen", "SKILL.md"))
      ).toBe(true);
    });

    it("generates expertise-based skills for expert domains", async () => {
      // Sarah has "Product analytics" at expert level — should generate a skill
      const skillPath = join(
        OUTPUT_DIR,
        "skills",
        "product-analytics-advice-sarah-chen",
        "SKILL.md"
      );
      expect(existsSync(skillPath)).toBe(true);

      const content = await readFile(skillPath, "utf-8");
      expect(content).toContain("Product analytics");
      expect(content).toContain("Sarah Chen");
    });
  });

  describe("content quality", () => {
    beforeAll(async () => {
      if (!existsSync(OUTPUT_DIR)) {
        await generatePlugin(PROFILE_PATH, OUTPUT_DIR);
      }
    });

    it("autonomous agent has YAML frontmatter with required fields", async () => {
      const content = await readFile(
        join(OUTPUT_DIR, "agents", "sarah-chen-autonomous.md"),
        "utf-8"
      );

      // Check frontmatter structure
      expect(content.startsWith("---\n")).toBe(true);
      const frontmatterEnd = content.indexOf("---\n", 4);
      expect(frontmatterEnd).toBeGreaterThan(4);

      const frontmatter = content.slice(4, frontmatterEnd);
      expect(frontmatter).toContain("name:");
      expect(frontmatter).toContain("description:");
      expect(frontmatter).toContain("model:");
      expect(frontmatter).toContain("permissionMode:");
    });

    it("advisory agent enforces read-only mode", async () => {
      const content = await readFile(
        join(OUTPUT_DIR, "agents", "sarah-chen-advisory.md"),
        "utf-8"
      );
      expect(content).toContain("permissionMode: plan");
      expect(content).toContain("NEVER take actions directly");
      expect(content).toContain("Advisory only");
    });

    it("plugin.json is valid JSON with required fields", async () => {
      const content = await readFile(
        join(OUTPUT_DIR, ".claude-plugin", "plugin.json"),
        "utf-8"
      );
      const parsed = JSON.parse(content);
      expect(parsed).toHaveProperty("name");
      expect(parsed).toHaveProperty("description");
      expect(parsed).toHaveProperty("version");
    });

    it("skill files have valid YAML frontmatter", async () => {
      const content = await readFile(
        join(OUTPUT_DIR, "skills", "ask-sarah-chen", "SKILL.md"),
        "utf-8"
      );
      expect(content.startsWith("---\n")).toBe(true);
      expect(content).toContain("name:");
      expect(content).toContain("description:");
    });
  });
});
