# Credential-aware automation

- Complete authorized tasks using the project's existing authenticated CLI, SDK credential chain, secret references, or runtime injection. Do not refuse routine work merely because authentication is involved.
- Keep credential values out of model-visible commands, tool results, logs, diffs, and agent handoffs. Do not copy secrets from files or previous output into command arguments. Prefer status checks, narrow queries, and non-secret fields over printing entire environments, credential files, or authenticated URLs.
- Let the authorized program resolve and use credentials at execution time. For new projects, prefer supported secret stores, managed identity, or short-lived credentials; follow existing conventions and do not force migrations.
- If authentication is not configured, use the supported setup flow and involve the user only for genuine authorization steps. Honor actual tool permissions, and do not assume any separate security plugin or guaranteed output filter.
