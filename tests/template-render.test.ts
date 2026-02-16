import { describe, it, expect, beforeAll } from "vitest";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import Handlebars from "handlebars";
import { parse } from "yaml";
import type { Profile } from "../scripts/profile-manager.ts";

// Register helpers same as generator
// Note: "slug" is a pre-computed context variable, not a helper
Handlebars.registerHelper("json", (obj: unknown) =>
  JSON.stringify(obj, null, 2)
);
Handlebars.registerHelper("slugify", (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
);

const TEMPLATE_DIR = join(import.meta.dirname!, "..", "scripts", "templates");
const FIXTURE_DIR = join(import.meta.dirname!, "fixtures");

let profile: Profile;
let context: Record<string, unknown>;

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

beforeAll(async () => {
  const content = await readFile(
    join(FIXTURE_DIR, "sample-profile.yaml"),
    "utf-8"
  );
  profile = parse(content) as Profile;
  context = {
    ...profile,
    name: profile.meta.name,
    slug: slugify(profile.meta.name),
    taskSkills: [],
    compiledDate: "2026-02-16",
  };
});

async function renderTemplate(name: string, ctx?: Record<string, unknown>) {
  const templateContent = await readFile(
    join(TEMPLATE_DIR, `${name}.hbs`),
    "utf-8"
  );
  const template = Handlebars.compile(templateContent);
  return template(ctx ?? context);
}

describe("Template Rendering", () => {
  describe("plugin.json template", () => {
    it("renders valid JSON", async () => {
      const output = await renderTemplate("plugin.json");
      const parsed = JSON.parse(output);
      expect(parsed.name).toBe("sarah-chen-agent");
      expect(parsed.description).toContain("Sarah Chen");
      expect(parsed.version).toBe("1.0.0");
    });
  });

  describe("agent-autonomous template", () => {
    it("renders with correct frontmatter", async () => {
      const output = await renderTemplate("agent-autonomous");
      expect(output).toContain("name: sarah-chen-autonomous");
      expect(output).toContain("permissionMode: acceptEdits");
      expect(output).toContain("model: opus");
    });

    it("includes identity information", async () => {
      const output = await renderTemplate("agent-autonomous");
      expect(output).toContain("Senior Product Manager");
      expect(output).toContain("Acme Corp");
      expect(output).toContain("Platform");
    });

    it("includes communication patterns", async () => {
      const output = await renderTemplate("agent-autonomous");
      expect(output).toContain("Concise and structured");
      expect(output).toContain("bullet points");
    });

    it("includes decision-making framework", async () => {
      const output = await renderTemplate("agent-autonomous");
      expect(output).toContain("Data-informed");
      expect(output).toContain("reversible decisions quickly");
    });

    it("includes expertise domains", async () => {
      const output = await renderTemplate("agent-autonomous");
      expect(output).toContain("Product analytics");
      expect(output).toContain("expert");
    });

    it("includes edge case handling", async () => {
      const output = await renderTemplate("agent-autonomous");
      expect(output).toContain("conflict");
      expect(output).toContain("ambiguity");
    });

    it("includes autonomous operating rules", async () => {
      const output = await renderTemplate("agent-autonomous");
      expect(output).toContain("Take action");
      expect(output).toContain("autonomous mode");
    });

    it("includes vocabulary", async () => {
      const output = await renderTemplate("agent-autonomous");
      expect(output).toContain("blast radius");
      expect(output).toContain("Net-net");
    });

    it("includes calibration corrections", async () => {
      const output = await renderTemplate("agent-autonomous");
      expect(output).toContain("more risk-tolerant");
    });
  });

  describe("agent-advisory template", () => {
    it("renders with plan permission mode", async () => {
      const output = await renderTemplate("agent-advisory");
      expect(output).toContain("name: sarah-chen-advisory");
      expect(output).toContain("permissionMode: plan");
    });

    it("includes advisory-only operating rules", async () => {
      const output = await renderTemplate("agent-advisory");
      expect(output).toContain("NEVER take actions directly");
      expect(output).toContain("Advisory only");
    });

    it("includes identity information", async () => {
      const output = await renderTemplate("agent-advisory");
      expect(output).toContain("Senior Product Manager");
    });
  });

  describe("skill-ask template", () => {
    it("renders with correct skill name", async () => {
      const output = await renderTemplate("skill-ask");
      expect(output).toContain("name: ask-sarah-chen");
      expect(output).toContain("$ARGUMENTS");
    });

    it("includes person's context", async () => {
      const output = await renderTemplate("skill-ask");
      expect(output).toContain("Sarah Chen");
      expect(output).toContain("Senior Product Manager");
    });
  });

  describe("skill-task template", () => {
    it("renders with task-specific context", async () => {
      const taskContext = {
        ...context,
        taskSlug: "review-like-sarah-chen",
        taskName: "Review Like Sarah Chen",
        taskDescription: "Review work the way Sarah Chen would",
        context: "Sarah reviews with high standards",
      };
      const output = await renderTemplate("skill-task", taskContext);
      expect(output).toContain("name: review-like-sarah-chen");
      expect(output).toContain("Review Like Sarah Chen");
      expect(output).toContain("$ARGUMENTS");
    });
  });

  describe("claude-md template", () => {
    it("renders with agent names and skills", async () => {
      const output = await renderTemplate("claude-md");
      expect(output).toContain("sarah-chen-autonomous");
      expect(output).toContain("sarah-chen-advisory");
      expect(output).toContain("ask-sarah-chen");
    });

    it("includes confidence score", async () => {
      const output = await renderTemplate("claude-md");
      expect(output).toContain("0.88");
    });

    it("includes compiled date", async () => {
      const output = await renderTemplate("claude-md");
      expect(output).toContain("2026-02-16");
    });
  });

  describe("handles minimal profile", () => {
    it("renders without errors for profile with only meta", async () => {
      const minimalContext = {
        meta: {
          name: "Test User",
          started: "2026-01-01",
          last_updated: "2026-01-01",
          current_phase: 1,
          phases_completed: [],
          status: "in_progress",
        },
        name: "Test User",
        slug: "test-user",
        taskSkills: [],
        compiledDate: "2026-01-01",
      };

      // All templates should render without throwing
      await expect(
        renderTemplate("plugin.json", minimalContext)
      ).resolves.toBeTruthy();
      await expect(
        renderTemplate("agent-autonomous", minimalContext)
      ).resolves.toBeTruthy();
      await expect(
        renderTemplate("agent-advisory", minimalContext)
      ).resolves.toBeTruthy();
      await expect(
        renderTemplate("skill-ask", minimalContext)
      ).resolves.toBeTruthy();
      await expect(
        renderTemplate("claude-md", minimalContext)
      ).resolves.toBeTruthy();
    });
  });
});
