import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { rm, readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import {
  init,
  load,
  updatePhase,
  markPhaseComplete,
  saveTranscript,
  saveSummary,
  saveArtifact,
  finalize,
  getStatus,
  getProfileDir,
  type Profile,
} from "../scripts/profile-manager.ts";
import { generatePlugin } from "../scripts/generate-plugin.ts";

const TEST_NAME = "__e2e-test-sarah-chen__";

function testDir(): string {
  return getProfileDir(TEST_NAME);
}

describe("End-to-End Interview Flow", () => {
  beforeEach(async () => {
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

  it("simulates a complete interview from init through generation", async () => {
    // ========== Phase 0: Initialize ==========
    const profile = await init(TEST_NAME);
    expect(profile.meta.status).toBe("in_progress");
    expect(profile.meta.current_phase).toBe(1);

    // ========== Phase 1: Identity ==========
    await updatePhase(TEST_NAME, 1, {
      identity: {
        role: "Senior Product Manager",
        organization: "Acme Corp",
        team: "Platform",
        responsibilities: [
          "Own the platform product roadmap",
          "Lead cross-functional planning",
          "Define and track KPIs",
        ],
        goals: ["Increase platform adoption by 40%"],
        reporting_structure: "Reports to VP of Product",
        tenure: "3 years at Acme",
      },
    });
    await saveTranscript(TEST_NAME, 1, "# Phase 1 Transcript\n\nQ: What's your role?\nA: I'm a Senior PM at Acme...");
    await saveSummary(TEST_NAME, 1, "## Identity Summary\n- Senior PM, Platform team, Acme Corp");
    await markPhaseComplete(TEST_NAME, 1);

    // ========== Phase 2: Communication ==========
    await updatePhase(TEST_NAME, 2, {
      communication: {
        writing_style: "Concise and structured, heavy bullet points",
        tone_spectrum: {
          formal: "Exec reviews, external partners",
          casual: "Team Slack, 1:1s",
        },
        patterns: [
          "Opens with context before the ask",
          "Uses numbered lists for action items",
        ],
        vocabulary: ["blast radius", "net-net", "time-boxed"],
      },
    });
    await saveTranscript(TEST_NAME, 2, "# Phase 2 Transcript\n\nQ: Describe your writing style...");
    await markPhaseComplete(TEST_NAME, 2);

    // ========== Phase 3: Decision-Making ==========
    await updatePhase(TEST_NAME, 3, {
      decision_making: {
        framework: "Data-informed, not data-paralyzed",
        prioritization: "Impact x confidence / effort",
        under_uncertainty: "Time-box information gathering, then decide",
        tradeoff_patterns: ["Ships small and learns", "Quality over speed for user-facing work"],
        examples: ["Delayed launch 2 weeks for UX fix"],
      },
    });
    await markPhaseComplete(TEST_NAME, 3);

    // ========== Phase 4: Domain Expertise ==========
    await updatePhase(TEST_NAME, 4, {
      expertise: {
        domains: [
          {
            name: "Product analytics",
            depth: "expert" as const,
            details: "Deep funnel analysis, A/B testing, SQL",
          },
          {
            name: "Platform API design",
            depth: "advanced" as const,
            details: "API design principles, DX",
          },
        ],
        technical_skills: ["SQL", "Python (basic)", "Amplitude"],
        industry_knowledge: ["Developer platforms", "B2B SaaS growth"],
      },
    });
    await markPhaseComplete(TEST_NAME, 4);

    // ========== Phase 5: Work Patterns ==========
    await updatePhase(TEST_NAME, 5, {
      work_patterns: {
        daily_routine: "8:30am start, mornings for deep work, afternoons for meetings",
        tools: ["Notion", "Asana", "Slack", "Amplitude"],
        collaboration_style: "Async-first, writes detailed docs before meetings",
        meeting_behavior: "Always has agenda, shares notes within 1 hour",
        task_management: "Asana weekly sprints, P0-P3 priorities, reviews Monday morning",
      },
    });
    await markPhaseComplete(TEST_NAME, 5);

    // ========== Phase 6: Edge Cases ==========
    await updatePhase(TEST_NAME, 6, {
      edge_cases: {
        conflict_resolution: "Direct but private, starts with curiosity",
        ambiguity_handling: "Tolerates 48 hours, then writes a one-pager to frame it",
        failure_response: "Takes ownership immediately, does personal retro within 24h",
        scenarios: [
          {
            situation: "Critical bug 2h before launch",
            response: "Triages with eng lead, assesses severity, communicates within 30min",
          },
        ],
      },
    });
    await markPhaseComplete(TEST_NAME, 6);

    // ========== Phase 7: Artifact Analysis ==========
    await updatePhase(TEST_NAME, 7, {
      artifacts: {
        analyzed_documents: [
          {
            source: "Notion",
            title: "Platform Q4 Strategy",
            patterns_found: [
              "Context → Problem → Options → Recommendation structure",
              "Quantifies impact in every option",
            ],
          },
        ],
        synthesized_patterns: [
          "Consistently uses structured frameworks",
          "Always quantifies impact",
          "Documents decisions and reasoning",
        ],
      },
    });
    await saveArtifact(TEST_NAME, {
      title: "Platform Q4 Strategy",
      content: "# Q4 Strategy\n\n[Analyzed content...]",
      index: 1,
    });
    await markPhaseComplete(TEST_NAME, 7);

    // ========== Phase 8: Calibration ==========
    await updatePhase(TEST_NAME, 8, {
      calibration: {
        corrections: [
          "More risk-tolerant than initially captured",
          "Uses emojis in Slack more than indicated",
        ],
        additions: [
          "Pet peeve: meetings without agendas",
          "Non-negotiable: protects team focus time",
        ],
        confidence_score: 0.88,
      },
    });
    await markPhaseComplete(TEST_NAME, 8);

    // ========== Finalize ==========
    const finalProfile = await finalize(TEST_NAME);
    expect(finalProfile.meta.status).toBe("complete");
    expect(finalProfile.meta.phases_completed).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);

    // ========== Verify Profile Integrity ==========
    const loaded = await load(TEST_NAME);
    expect(loaded.identity?.role).toBe("Senior Product Manager");
    expect(loaded.communication?.vocabulary).toContain("blast radius");
    expect(loaded.decision_making?.framework).toContain("Data-informed");
    expect(loaded.expertise?.domains).toHaveLength(2);
    expect(loaded.work_patterns?.tools).toContain("Notion");
    expect(loaded.edge_cases?.conflict_resolution).toContain("curiosity");
    expect(loaded.artifacts?.synthesized_patterns).toHaveLength(3);
    expect(loaded.calibration?.confidence_score).toBe(0.88);

    // ========== Verify Files on Disk ==========
    const dir = testDir();
    expect(existsSync(join(dir, "phases", "phase-01-raw.md"))).toBe(true);
    expect(existsSync(join(dir, "phases", "phase-01-summary.md"))).toBe(true);
    expect(existsSync(join(dir, "phases", "phase-02-raw.md"))).toBe(true);
    expect(existsSync(join(dir, "artifacts", "artifact-1-platform-q4-strategy.md"))).toBe(true);

    // ========== Generate Plugin ==========
    const profilePath = join(dir, "profile.yaml");
    const outputDir = join(dir, "output-plugin", "e2e-test-agent");
    const outDir = await generatePlugin(profilePath, outputDir);

    // Verify generated plugin structure
    expect(existsSync(join(outDir, ".claude-plugin", "plugin.json"))).toBe(true);
    expect(existsSync(join(outDir, "agents"))).toBe(true);
    expect(existsSync(join(outDir, "skills"))).toBe(true);
    expect(existsSync(join(outDir, "CLAUDE.md"))).toBe(true);

    // Verify plugin.json is valid
    const pluginJson = JSON.parse(
      await readFile(join(outDir, ".claude-plugin", "plugin.json"), "utf-8")
    );
    expect(pluginJson.name).toContain("agent");
    expect(pluginJson.version).toBe("1.0.0");

    // Verify agent files exist and have correct permission modes
    const agentFiles = await readdir(join(outDir, "agents"));
    expect(agentFiles.some((f: string) => f.includes("autonomous"))).toBe(true);
    expect(agentFiles.some((f: string) => f.includes("advisory"))).toBe(true);

    const autonomousContent = await readFile(
      join(outDir, "agents", agentFiles.find((f: string) => f.includes("autonomous"))!),
      "utf-8"
    );
    expect(autonomousContent).toContain("permissionMode: acceptEdits");
    expect(autonomousContent).toContain("Senior Product Manager");

    const advisoryContent = await readFile(
      join(outDir, "agents", agentFiles.find((f: string) => f.includes("advisory"))!),
      "utf-8"
    );
    expect(advisoryContent).toContain("permissionMode: plan");
    expect(advisoryContent).toContain("NEVER take actions directly");

    // Verify CLAUDE.md contains agent references
    const claudeMd = await readFile(join(outDir, "CLAUDE.md"), "utf-8");
    expect(claudeMd).toContain("autonomous");
    expect(claudeMd).toContain("advisory");
    expect(claudeMd).toContain("0.88");
  });

  it("can resume from a mid-interview state", async () => {
    // Simulate interrupted interview at phase 3
    await init(TEST_NAME);
    await updatePhase(TEST_NAME, 1, {
      identity: { role: "Engineer", organization: "TestCo" },
    });
    await markPhaseComplete(TEST_NAME, 1);

    await updatePhase(TEST_NAME, 2, {
      communication: { writing_style: "Terse and technical" },
    });
    await markPhaseComplete(TEST_NAME, 2);

    // "Crash" — interview interrupted

    // Resume
    const status = await getStatus(TEST_NAME);
    expect(status.exists).toBe(true);
    expect(status.profile!.meta.current_phase).toBe(3);
    expect(status.profile!.meta.phases_completed).toEqual([1, 2]);
    expect(status.profile!.meta.status).toBe("in_progress");

    // Previous data intact
    expect(status.profile!.identity?.role).toBe("Engineer");
    expect(status.profile!.communication?.writing_style).toBe("Terse and technical");

    // Continue from phase 3
    await updatePhase(TEST_NAME, 3, {
      decision_making: { framework: "Gut feeling" },
    });
    await markPhaseComplete(TEST_NAME, 3);

    const updated = await load(TEST_NAME);
    expect(updated.meta.phases_completed).toEqual([1, 2, 3]);
    expect(updated.meta.current_phase).toBe(4);
    expect(updated.identity?.role).toBe("Engineer");
    expect(updated.decision_making?.framework).toBe("Gut feeling");
  });

  it("generates a valid plugin even from a partial profile", async () => {
    // Only complete first 3 phases
    await init(TEST_NAME);
    await updatePhase(TEST_NAME, 1, {
      identity: { role: "Designer", organization: "DesignCo", team: "UX" },
    });
    await markPhaseComplete(TEST_NAME, 1);

    await updatePhase(TEST_NAME, 2, {
      communication: { writing_style: "Visual and concise" },
    });
    await markPhaseComplete(TEST_NAME, 2);

    // Generate without all phases
    const dir = testDir();
    const profilePath = join(dir, "profile.yaml");
    const outputDir = join(dir, "output-plugin", "partial-agent");
    const outDir = await generatePlugin(profilePath, outputDir);

    // Should still produce valid structure
    expect(existsSync(join(outDir, ".claude-plugin", "plugin.json"))).toBe(true);
    expect(existsSync(join(outDir, "agents"))).toBe(true);
    expect(existsSync(join(outDir, "CLAUDE.md"))).toBe(true);

    // Agent should contain what we have
    const agentFiles = await readdir(join(outDir, "agents"));
    const autonomousFile = agentFiles.find((f: string) => f.includes("autonomous"))!;
    const content = await readFile(join(outDir, "agents", autonomousFile), "utf-8");
    expect(content).toContain("Designer");
    expect(content).toContain("Visual and concise");
  });
});
