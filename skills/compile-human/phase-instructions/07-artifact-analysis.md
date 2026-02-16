# Phase 7: Artifact Analysis

## Objective
Deep-read 5-10 actual work products to extract behavioral patterns, communication signatures, and decision traces that the interview alone might miss.

## MCP Deep Dive
This phase is primarily MCP-driven. The interviewer should:

### Step 1: Gather Artifacts
Search across all available MCP sources:

**Notion:**
- Search for pages authored by the person
- Fetch their most recent meeting notes (last 2 weeks)
- Find strategy docs, PRDs, proposals they wrote
- Look for status updates or project summaries

**Asana:**
- Get their recent tasks and task descriptions
- Find project status updates they wrote
- Look at task comments for communication patterns

**Browser/Local:**
- If the person points to specific docs, read them
- Look at any local files they mention

### Step 2: Select 5-10 Artifacts
Choose a diverse set:
- 1-2 long-form documents (strategy, PRD, proposal)
- 1-2 status updates or summaries
- 1-2 meeting notes they authored
- 1-2 task descriptions or comments
- 1-2 communications (emails, messages if accessible)

### Step 3: Analyze Each Artifact
For each artifact, extract:
- **Structure**: How they organize information (headers, lists, paragraphs)
- **Tone**: Formal/casual, confident/hedged, detailed/concise
- **Vocabulary**: Characteristic words, phrases, jargon usage
- **Decision traces**: Evidence of how they think/prioritize
- **Collaboration cues**: How they reference others, delegate, request

### Step 4: Cross-reference with Interview
Present findings to the person:

## Questions During Artifact Review

1. "I found [document]. Can you give me context on when and why you wrote this?"
2. "I noticed [pattern] across several of your documents. Is this intentional?"
3. "This document has a very [formal/casual/structured] tone compared to [other document]. What drove that difference?"
4. "In [document], you made [decision/recommendation]. Walk me through your reasoning."
5. "Are there any documents here that you'd say are NOT representative of your typical work?"

## Follow-up Probes
- "What would a different version of this look like if you had more time?"
- "Who was the audience for this? How did that affect how you wrote it?"
- "Which of these artifacts are you most proud of?"

## What to Record
```yaml
artifacts:
  analyzed_documents:
    - source: [Notion/Asana/Email/etc]
      title: [document title]
      patterns_found:
        - [pattern 1 observed]
        - [pattern 2 observed]
    - source: [source]
      title: [title]
      patterns_found:
        - [patterns]
  synthesized_patterns:
    - [cross-artifact pattern 1 — e.g., "Consistently uses 3-part structure: context, analysis, recommendation"]
    - [cross-artifact pattern 2]
    - [pattern that validates/contradicts interview answers]
```

Also save each analyzed artifact:
```
saveArtifact(name, { title, content: [anonymized excerpt with analysis], index })
```

## Transition
"This artifact analysis has been incredibly revealing. I found several patterns that complement what you told me in the interview... [key findings]. We're now in the final phase — I'll present your complete profile and we'll calibrate it together."
