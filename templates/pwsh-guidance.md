# PowerShell execution guidance (conditional)

Scope and version:
- Apply only when invoking an available tool that actually executes PowerShell. If Bash or another shell is chosen, use that shell's syntax. Respect the tool's real parameters, permissions, and results; do not assume state persists across calls.
- If the runtime version is unknown, use PowerShell 5.1-compatible syntax. `&&`, `||`, `??`, and ternary `? :` require PowerShell 7. `;` separates statements but does not check success.

Quoting and paths:
- Single-quoted strings preserve literal text; double-quoted strings interpolate variables and evaluate `$(...)`. Never accidentally execute a literal code example or untrusted text by enclosing it in expandable quotes. Backslash is not the PowerShell quote escape. For multiline literal text, use correctly delimited single-quoted here-strings, not Bash `<<EOF`.
- Delimit ambiguous variables such as `${name}:` inside expandable strings. Use `Join-Path` for variable-based paths; quote path arguments and prefer `-LiteralPath` for exact names (especially names containing `[` or `]`), versus `-Path` for deliberate wildcards. Verify required paths and objects before indexing or modifying them.
- Pass native executables their own supported arguments. `& $exe @args` is valid for a known executable and argument array; avoid opaque, dynamically assembled whole-command strings when a direct invocation suffices.

Commands and failures:
- Use PowerShell cmdlets such as `Select-Object -First 20` rather than assuming Bash utilities such as `head` exist. Do not paste Bash here-documents, quoting, or command flags into PowerShell.
- Cmdlet non-terminating errors do not necessarily stop later statements. For critical cmdlet steps, use local `-ErrorAction Stop` and `try/catch` when warranted. After a native executable such as `git` or `node`, check `$LASTEXITCODE` before another native process overwrites it. An expected nonzero probe is not automatically a task failure.
- Before a deletion, replacement, reset, or migration, verify its exact target and the observed success of prerequisite copy/move/build steps. Run high-impact steps separately; `;` is not a success gate. Respect actual tool or runtime denials without changing syntax to evade them. No optional security plugin is assumed.
- Prefer available native file tools for semantic edits. For one-off file rewrites, use scripts only for specified, bounded, verifiable mechanical transformations; this does not restrict purpose-built tools or software the user requested. On failure, distinguish parser, binding, missing-command, native-exit, and tool-infrastructure errors; do not blindly retry.

Output and encoding:
- Neither stderr alone nor empty stdout proves success. Separate structured data from diagnostics. Diagnose garbling at the file, process, or transport boundary; Windows PowerShell 5.1 and PowerShell 7 have different encoding defaults. For non-ASCII `.ps1` targeting 5.1, check whether UTF-8 BOM is needed. Do not make global encoding or error-preference changes by default.

Examples:
- Literal: `'Example: $(Get-Date)'` preserves text; `"Example: $(Get-Date)"` evaluates the subexpression.
- Path: `Join-Path $env:TEMP 'result.txt'`, not `$env:TEMP\result.txt`.
- Native exit: `git status --short; if ($LASTEXITCODE -ne 0) { throw 'git failed' }`.
