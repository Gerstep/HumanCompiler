#!/usr/bin/env bun
/**
 * CLI wrapper for the profile manager.
 * Used by the compile-human skill to manage profiles via Bash commands.
 *
 * Usage:
 *   bun run scripts/profile-manager-cli.ts init "Person Name"
 *   bun run scripts/profile-manager-cli.ts load "Person Name"
 *   bun run scripts/profile-manager-cli.ts status "Person Name"
 *   bun run scripts/profile-manager-cli.ts list
 *   bun run scripts/profile-manager-cli.ts update-phase "Person Name" 1 data.json
 *   bun run scripts/profile-manager-cli.ts mark-complete "Person Name" 1
 *   bun run scripts/profile-manager-cli.ts save-transcript "Person Name" 1 transcript.md
 *   bun run scripts/profile-manager-cli.ts save-summary "Person Name" 1 summary.md
 *   bun run scripts/profile-manager-cli.ts save-artifact "Person Name" artifact.json
 *   bun run scripts/profile-manager-cli.ts finalize "Person Name"
 */

import { readFile } from "node:fs/promises";
import { stringify } from "yaml";
import * as pm from "./profile-manager.ts";

const [command, ...args] = process.argv.slice(2);

async function main() {
  switch (command) {
    case "init": {
      const name = args[0];
      if (!name) {
        console.error("Usage: init <name>");
        process.exit(1);
      }
      const profile = await pm.init(name);
      console.log(`Profile initialized for "${name}"`);
      console.log(`Directory: ${pm.getProfileDir(name)}`);
      console.log(stringify(profile.meta));
      break;
    }

    case "load": {
      const name = args[0];
      if (!name) {
        console.error("Usage: load <name>");
        process.exit(1);
      }
      const profile = await pm.load(name);
      console.log(stringify(profile));
      break;
    }

    case "status": {
      const name = args[0];
      if (!name) {
        console.error("Usage: status <name>");
        process.exit(1);
      }
      const status = await pm.getStatus(name);
      if (!status.exists) {
        console.log(`Profile "${name}" not found.`);
      } else {
        const meta = status.profile!.meta;
        console.log(`Name: ${meta.name}`);
        console.log(`Status: ${meta.status}`);
        console.log(`Current Phase: ${meta.current_phase}`);
        console.log(`Completed Phases: ${meta.phases_completed.join(", ") || "none"}`);
        console.log(`Started: ${meta.started}`);
        console.log(`Last Updated: ${meta.last_updated}`);
      }
      break;
    }

    case "list": {
      const profiles = await pm.listProfiles();
      if (profiles.length === 0) {
        console.log("No profiles found.");
      } else {
        console.log("Available profiles:");
        for (const slug of profiles) {
          const profile = await pm.loadBySlug(slug);
          const phases = profile.meta.phases_completed.length;
          console.log(
            `  - ${profile.meta.name} [${profile.meta.status}] (${phases}/8 phases) — ${slug}`
          );
        }
      }
      break;
    }

    case "update-phase": {
      const name = args[0];
      const phase = parseInt(args[1], 10);
      const dataPath = args[2];
      if (!name || isNaN(phase) || !dataPath) {
        console.error("Usage: update-phase <name> <phase> <data.json>");
        process.exit(1);
      }
      const dataContent = await readFile(dataPath, "utf-8");
      const data = JSON.parse(dataContent);
      const profile = await pm.updatePhase(name, phase, data);
      console.log(`Phase ${phase} data updated for "${name}"`);
      console.log(`Current phase: ${profile.meta.current_phase}`);
      break;
    }

    case "mark-complete": {
      const name = args[0];
      const phase = parseInt(args[1], 10);
      if (!name || isNaN(phase)) {
        console.error("Usage: mark-complete <name> <phase>");
        process.exit(1);
      }
      const profile = await pm.markPhaseComplete(name, phase);
      console.log(`Phase ${phase} marked complete for "${name}"`);
      console.log(`Completed: ${profile.meta.phases_completed.join(", ")}`);
      console.log(`Next phase: ${profile.meta.current_phase}`);
      break;
    }

    case "save-transcript": {
      const name = args[0];
      const phase = parseInt(args[1], 10);
      const filePath = args[2];
      if (!name || isNaN(phase) || !filePath) {
        console.error("Usage: save-transcript <name> <phase> <file.md>");
        process.exit(1);
      }
      const content = await readFile(filePath, "utf-8");
      const saved = await pm.saveTranscript(name, phase, content);
      console.log(`Transcript saved: ${saved}`);
      break;
    }

    case "save-summary": {
      const name = args[0];
      const phase = parseInt(args[1], 10);
      const filePath = args[2];
      if (!name || isNaN(phase) || !filePath) {
        console.error("Usage: save-summary <name> <phase> <file.md>");
        process.exit(1);
      }
      const content = await readFile(filePath, "utf-8");
      const saved = await pm.saveSummary(name, phase, content);
      console.log(`Summary saved: ${saved}`);
      break;
    }

    case "save-artifact": {
      const name = args[0];
      const artifactPath = args[1];
      if (!name || !artifactPath) {
        console.error("Usage: save-artifact <name> <artifact.json>");
        process.exit(1);
      }
      const artifactContent = await readFile(artifactPath, "utf-8");
      const artifact = JSON.parse(artifactContent);
      const saved = await pm.saveArtifact(name, artifact);
      console.log(`Artifact saved: ${saved}`);
      break;
    }

    case "finalize": {
      const name = args[0];
      if (!name) {
        console.error("Usage: finalize <name>");
        process.exit(1);
      }
      const profile = await pm.finalize(name);
      console.log(`Profile "${name}" finalized.`);
      console.log(`Status: ${profile.meta.status}`);
      console.log(`Confidence: ${profile.calibration?.confidence_score ?? "N/A"}`);
      break;
    }

    default:
      console.error(
        `Unknown command: ${command}\n\nAvailable commands: init, load, status, list, update-phase, mark-complete, save-transcript, save-summary, save-artifact, finalize`
      );
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
