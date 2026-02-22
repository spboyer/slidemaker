# Session: 2026-02-10-security-directive

**Requested by:** Shayne Boyer

## Events

- Shayne issued a directive: never put secrets (tokens, API keys, credentials, passwords) in GitHub issues, PRs, commit messages, comments, or any repo content.
- A leaked `gho_` OAuth token in issue #12 triggered a GitHub secret scanning alert.
- The token was redacted from the issue body.
- Decision merged into `.ai-team/decisions.md` and propagated to all agents.
