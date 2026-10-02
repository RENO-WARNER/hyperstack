# CLAUDE.md

## Build & Test Commands
- **Check:** `pnpm check`
- **Test:** `pnpm test`
- **Build:** `pnpm build`
- *Rule:* Always run test and lint commands after editing before completing a task.

## Scope & Access Controls
- **Edit Scope:** Only modify files explicitly requested or directly required.
- **Search & Read:** Allowed across workspace for context (ripgrep, file reading).
- **Dependencies:** DO NOT install or update packages without explicit confirmation.

## Git & Workflow
- **ALWAYS**: Run `pnpm run format` before git commits, always be in a non-main branch before commits.
- Never commit to `main`. Use Conventional Commits (`feat(scope): ...`, `fix(scope): ...`).
- **Branch naming:** `type/module/function`, e.g. `fix/kicad/pcb-net-join`, `feat/solver/descent-fallback`, `docs/claude/directory-map`.
- Keep commits single-line messages only. No multi-line bodies.
- Commit by functionality/progress, not atomicity: commit throughout coding as each piece of functionality lands, rather than batching everything into one commit at the end. Always commit after finishing a task, even a small one.
- A commit is allowed to be work-in-progress: but the message still names the real change being made (`feat(kicad): add sheet uuid field`), never the literal word "WIP" or a placeholder.
- Pushes must be functional: only push when the pushed state builds and passes all tests. Commits in between can be work-in-progress.

## Code Style Rules
- **Comments:** Comments must not exist. Write no comments of any kind, anywhere.
- **Colocated Types:** Place types directly in the module they belong to. No global `types.d.ts`.
- **Naming:** Prefer concise single-word identifiers (`Data`, `State`, `Config`). Use single word function and variable names if possible.
- **No Units in Names:** Use `delay`, `force` instead of `delay_ms`, `force_n`. Encode units in types or AST wrappers.
- **Functional Style:** Prefer iterator methods (`map`, `filter`, `reduce`, `find`, `and_then`) over explicit loops (`for`/`while`).
- **Generics Over Duplication:** Parameterize generic types to handle variations.
- **Minimal Structs:** Keep structs focused; extract distinct field groups into child structs.
- **No Magic Numbers:** Extract constants to `SCREAMING_SNAKE_CASE` module-level constants.
- **Avoid match:** Use methods like (`map`, `and_then`, `ok`) instead of using match for Result and Option unwrapping.
- **Avoid mutating arguments:** Prefer never using &mut argument in code as it makes it impossible to understand if a value is truly modified. Always return an Owned value if possible instead.
- **No shared `error.rs`:** Never add or use a module-level `error.rs`. Define error types in the module/file of the component or functionality they belong to.
- **Minimal impls, shared traits:** Keep one-off `impl Type { fn ... }` blocks to an absolute minimum. When behavior repeats across types, define a trait once and implement it for each type instead of hand-rolling the same free function or ad hoc method repeatedly — see `expression::Arithmetic` for the pattern.
- **No strings or IDs as identity:** Don't represent a value's identity or category with a bare `String`/numeric ID (a reference designator, a UUID, an error kind). Use a real type — an enum, a newtype, a path of typed segments (`uuid::UUID`, `uuid::Path`) — so identity is checked by the compiler, not by string comparison.
- **File structure over in-file grouping:** Organize code primarily through the file tree, not by piling multiple structs into one file. When a module's types grow distinct enough to separate, give each its own file under a directory named for the parent concept, aggregated by a `mod.rs`/`mod <name>;` — e.g. `quantity/unit/(base.rs, mod.rs)` rather than one `unit.rs` holding both. `kicad::schematic::pin/(mod.rs, library.rs, sheet.rs, symbol.rs)` is an existing example of this shape.