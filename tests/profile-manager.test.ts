import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { rm, readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import {
  init,
  load,
  save,
  updatePhase,
  markPhaseComplete,
  getStatus,
  saveTranscript,
  saveSummary,
  saveArtifact,
  finalize,
  getProfileDir,
  type Profile,
} from "../scripts/profile-manager.ts";

const TEST_NAME = "__test-human-compiler-profile__";

function testDir(): string {
  return getProfileDir(TEST_NAME);
}

describe("ProfileManager", () => {
  beforeEach(async () => {
    // Clean up any leftover test data
    const dir = testDir();
    if (existsSync(dir)) {
      await rm(dir, { recursive: true, force: true });
    }
  });

  afterEach(async () => {
    const dir = testDir();
    if (existsSync(dir)) {
      await rm(dir, { recursive: true, force: true });
    }
  });

  describe("init()", () => {
    it("creates the profile directory structure", async () => {
      await init(TEST_NAME);
      const dir = testDir();
      expect(existsSync(dir)).toBe(true);
      expect(existsSync(join(dir, "phases"))).toBe(true);
      expect(existsSync(join(dir, "artifacts"))).toBe(true);
      expect(existsSync(join(dir, "profile.yaml"))).toBe(true);
    });

    it("creates a valid profile.yaml with correct defaults", async () => {
      const profile = await init(TEST_NAME);
      expect(profile.meta.name).toBe(TEST_NAME);
      expect(profile.meta.current_phase).toBe(1);
      expect(profile.meta.phases_completed).toEqual([]);
      expect(profile.meta.status).toBe("in_progress");
      expect(profile.meta.started).toBeTruthy();
      expect(profile.meta.last_updated).toBeTruthy();
    });

    it("writes valid YAML to disk", async () => {
      await init(TEST_NAME);
      const content = await readFile(
        join(testDir(), "profile.yaml"),
        "utf-8"
      );
      const parsed = parse(content) as Profile;
      expect(parsed.meta.name).toBe(TEST_NAME);
    });
  });

  describe("load()", () => {
    it("loads an existing profile", async () => {
      await init(TEST_NAME);
      const loaded = await load(TEST_NAME);
      expect(loaded.meta.name).toBe(TEST_NAME);
      expect(loaded.meta.status).toBe("in_progress");
    });

    it("throws for non-existent profile", async () => {
      await expect(load("nonexistent-profile-xyz")).rejects.toThrow(
        "Profile not found"
      );
    });
  });

  describe("updatePhase()", () => {
    it("merges phase data into profile", async () => {
      await init(TEST_NAME);

      const updated = await updatePhase(TEST_NAME, 1, {
        identity: {
          role: "Senior PM",
          organization: "Acme Corp",
          team: "Platform",
          responsibilities: ["roadmap", "stakeholder management"],
        },
      });

      expect(updated.identity?.role).toBe("Senior PM");
      expect(updated.identity?.organization).toBe("Acme Corp");
      expect(updated.identity?.responsibilities).toHaveLength(2);
      expect(updated.meta.current_phase).toBe(1);
    });

    it("does not clobber existing sections when updating a different one", async () => {
      await init(TEST_NAME);

      await updatePhase(TEST_NAME, 1, {
        identity: { role: "PM", organization: "Acme" },
      });

      const updated = await updatePhase(TEST_NAME, 2, {
        communication: {
          writing_style: "Concise and direct",
          patterns: ["Uses bullet points"],
        },
      });

      expect(updated.identity?.role).toBe("PM");
      expect(updated.communication?.writing_style).toBe("Concise and direct");
    });

    it("does not overwrite meta via phase data", async () => {
      await init(TEST_NAME);
      const original = await load(TEST_NAME);

      await updatePhase(TEST_NAME, 2, {
        meta: {
          name: "HACKED",
          started: "fake",
          last_updated: "fake",
          current_phase: 99,
          phases_completed: [1, 2, 3, 4, 5, 6, 7, 8],
          status: "complete",
        } as any,
        identity: { role: "Tester" },
      });

      const loaded = await load(TEST_NAME);
      expect(loaded.meta.name).toBe(TEST_NAME);
      expect(loaded.meta.current_phase).toBe(2);
      expect(loaded.identity?.role).toBe("Tester");
    });
  });

  describe("markPhaseComplete()", () => {
    it("adds phase to completed list and advances current", async () => {
      await init(TEST_NAME);

      let profile = await markPhaseComplete(TEST_NAME, 1);
      expect(profile.meta.phases_completed).toEqual([1]);
      expect(profile.meta.current_phase).toBe(2);

      profile = await markPhaseComplete(TEST_NAME, 2);
      expect(profile.meta.phases_completed).toEqual([1, 2]);
      expect(profile.meta.current_phase).toBe(3);
    });

    it("does not duplicate phases", async () => {
      await init(TEST_NAME);

      await markPhaseComplete(TEST_NAME, 1);
      const profile = await markPhaseComplete(TEST_NAME, 1);
      expect(profile.meta.phases_completed).toEqual([1]);
    });

    it("keeps phases sorted", async () => {
      await init(TEST_NAME);

      await markPhaseComplete(TEST_NAME, 3);
      const profile = await markPhaseComplete(TEST_NAME, 1);
      expect(profile.meta.phases_completed).toEqual([1, 3]);
    });
  });

  describe("getStatus()", () => {
    it("returns exists: false for non-existent profile", async () => {
      const status = await getStatus("nonexistent-xyz-abc");
      expect(status.exists).toBe(false);
      expect(status.profile).toBeUndefined();
    });

    it("returns profile data for existing profile", async () => {
      await init(TEST_NAME);
      const status = await getStatus(TEST_NAME);
      expect(status.exists).toBe(true);
      expect(status.profile?.meta.name).toBe(TEST_NAME);
    });
  });

  describe("saveTranscript()", () => {
    it("saves transcript file with padded phase number", async () => {
      await init(TEST_NAME);
      const path = await saveTranscript(
        TEST_NAME,
        1,
        "# Phase 1 Transcript\n\nQ: What is your role?\nA: I'm a PM."
      );
      expect(path).toContain("phase-01-raw.md");
      expect(existsSync(path)).toBe(true);

      const content = await readFile(path, "utf-8");
      expect(content).toContain("What is your role?");
    });
  });

  describe("saveSummary()", () => {
    it("saves summary file", async () => {
      await init(TEST_NAME);
      const path = await saveSummary(
        TEST_NAME,
        1,
        "## Identity Summary\n- Role: PM"
      );
      expect(path).toContain("phase-01-summary.md");
      expect(existsSync(path)).toBe(true);
    });
  });

  describe("saveArtifact()", () => {
    it("saves artifact file with slugified title", async () => {
      await init(TEST_NAME);
      const path = await saveArtifact(TEST_NAME, {
        title: "Product Strategy Doc 2026",
        content: "# Product Strategy\n\nOur strategy is...",
        index: 1,
      });
      expect(path).toContain("artifact-1-product-strategy-doc-2026.md");
      expect(existsSync(path)).toBe(true);

      const content = await readFile(path, "utf-8");
      expect(content).toContain("Product Strategy");
    });
  });

  describe("finalize()", () => {
    it("marks profile as complete", async () => {
      await init(TEST_NAME);
      const profile = await finalize(TEST_NAME);
      expect(profile.meta.status).toBe("complete");
    });

    it("persists completion status to disk", async () => {
      await init(TEST_NAME);
      await finalize(TEST_NAME);

      const loaded = await load(TEST_NAME);
      expect(loaded.meta.status).toBe("complete");
    });
  });

  describe("resume flow", () => {
    it("can resume from a partially completed interview", async () => {
      // Simulate phases 1-3 completed, then "crash"
      await init(TEST_NAME);
      await updatePhase(TEST_NAME, 1, {
        identity: { role: "PM", organization: "Acme" },
      });
      await markPhaseComplete(TEST_NAME, 1);

      await updatePhase(TEST_NAME, 2, {
        communication: { writing_style: "Direct" },
      });
      await markPhaseComplete(TEST_NAME, 2);

      await updatePhase(TEST_NAME, 3, {
        decision_making: { framework: "Data-driven" },
      });
      await markPhaseComplete(TEST_NAME, 3);

      // "Resume" - load and check state
      const status = await getStatus(TEST_NAME);
      expect(status.exists).toBe(true);
      expect(status.profile?.meta.phases_completed).toEqual([1, 2, 3]);
      expect(status.profile?.meta.current_phase).toBe(4);
      expect(status.profile?.meta.status).toBe("in_progress");

      // All previous data intact
      expect(status.profile?.identity?.role).toBe("PM");
      expect(status.profile?.communication?.writing_style).toBe("Direct");
      expect(status.profile?.decision_making?.framework).toBe("Data-driven");
    });
  });
});
