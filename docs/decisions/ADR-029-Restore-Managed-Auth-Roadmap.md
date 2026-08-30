# ADR-029: Restore Managed Authentication to Low Priority Roadmap

## Context
Managed authentication was temporarily omitted from the active state tracking matrix to focus on core audio AST parsing. Leaving it untracked creates a risk of omission during future beta multi-user rollouts.

## Decision
Restored Managed Authentication to `STATE.md` with an explicit **Low** priority ranking, categorizing it as post-alpha infrastructure.

## Consequences
- Maintains visibility for future multi-tenant authentication requirements.
- Keeps current sprint focused strictly on inline audio AST bounding and sub-second TTFB optimization.