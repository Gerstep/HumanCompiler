# Phase 8: Calibration & Final Corrections

## Objective
Present the complete synthesized profile back to the person, get corrections, fill gaps, and establish a confidence score for each section.

## Pre-work
- Load the full profile.yaml
- Prepare a section-by-section summary for review
- Note any areas with low confidence or thin data

## Opening
"We've reached the final phase. I've built a comprehensive profile based on everything we've discussed and the artifacts I've analyzed. I'm going to walk through each section, and I need you to tell me: Is this accurate? What's missing? What's wrong?"

## Section-by-Section Review

### Identity Review
Present the identity section and ask:
1. "Is this an accurate description of your role and responsibilities?"
2. "Anything missing or overstated?"

### Communication Review
Present the communication section and ask:
3. "Does this capture how you communicate? Anything feel off?"
4. "Are there contexts I'm missing where your style is very different?"
5. "Read these patterns I listed — do they ring true?"

### Decision-Making Review
Present the decision-making section and ask:
6. "Is this how you'd describe your decision-making approach?"
7. "Are there important nuances I'm missing?"
8. "Any tradeoff patterns I got wrong?"

### Expertise Review
Present the expertise section and ask:
9. "Did I capture your expertise accurately?"
10. "Are there areas I overestimated or underestimated?"
11. "Any critical knowledge areas I missed?"

### Work Patterns Review
Present the work patterns section and ask:
12. "Does this reflect your actual day-to-day?"
13. "Any tools or habits I missed?"

### Edge Cases Review
Present the edge cases section and ask:
14. "Are these scenarios and responses authentic to how you'd react?"
15. "Any edge cases we didn't cover that are important?"
16. "Would you respond differently in any of these scenarios?"

### Artifact Patterns Review
Present the synthesized patterns and ask:
17. "Do these patterns feel accurate?"
18. "Are there patterns I identified that are coincidental rather than intentional?"

## Gap-Filling Questions

Based on the review, ask targeted follow-ups:
19. "Is there anything about how you work that we haven't covered at all?"
20. "If someone was pretending to be you, what would they get wrong?"
21. "What's the most important thing for an AI agent acting as you to understand?"
22. "Are there any 'rules' you follow that we haven't discussed?"
23. "Any pet peeves or non-negotiables?"

## Confidence Scoring
For each section, ask:
"On a scale of 1-10, how accurately does this section capture you?"

Average into an overall confidence score.

## What to Record
```yaml
calibration:
  corrections:
    - [correction 1 — what was wrong and what's right]
    - [correction 2]
  additions:
    - [new information that fills a gap]
    - [nuance that was missing]
  confidence_score: [0.0-1.0 based on averaged section scores]
```

Apply corrections back to the relevant profile sections as well.

## Closing
"Your profile is complete. I'm going to generate your AI agent plugin now. This agent will be able to act and communicate as you would, with the level of autonomy the installer chooses. Ready to compile?"

Then:
1. Apply all corrections to profile sections
2. Call `finalize(name)` to mark profile as complete
3. Trigger the plugin generation
