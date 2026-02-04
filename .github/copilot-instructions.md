# 🔍 Configuration Resolution (Local + strictify)

This project may use strictify for shared configuration. Before generating code:

1. Check local project configuration files first.
2. Check strictify configuration next.
3. Local files override strictify unless the user explicitly says otherwise.

When uncertain, the assistant must ask instead of guessing.

---

# ⚙️ Automatic Safe Script Generation

If a requested change can be safely executed using a script  
(e.g., bulk transformations, deterministic operations):

- Prefer generating a script over manual edits.
- The script must be **100% deterministic, safe, and idempotent**.
- Allowed languages: **Node.js (JavaScript)** is preferred, **bash** is allowed, **PowerShell** is discouraged by default and should be used only when strictly necessary (cross‑platform concerns). Other tools available in the workspace may be used when appropriate.
- Scripts may **NOT** perform forbidden actions (see Refactoring Rules).
- After generating a script, explain:
  - what it does
  - why it's safe
  - how idempotency is guaranteed

---

## 🚫 Python Usage Prohibition

Python is strictly forbidden in all cases.

The assistant must NEVER generate, suggest, or attempt to run Python scripts.

Node.js (JavaScript) is always allowed and preferred.

Reason:

- Python is not installed on the user’s machine.
- Node.js is the only supported scripting environment.

---

# ✅ ESLint / Formatting Behavior (Strict Prohibition)

The assistant must NOT run ESLint, Prettier, or any formatter.

The assistant must NOT apply ESLint fixes or formatting changes inline.

“Fix issues properly” means explaining or suggesting the fix, not applying it.

ESLint fixes or formatting are performed only by the user, unless the user explicitly instructs the assistant to do so.

---

# 🚫 ESLint Disable Rules (Strict Prohibition)

The assistant must NEVER add, insert, rewrite, or generate any ESLint suppression directives, including (but not limited to):

- `// eslint-disable-next-line`
- `// eslint-disable`
- `/* eslint-disable */`
- `/* eslint-disable-next-line */`

When suggesting fixes, follow the ESLint / formatting behavior above.

If the assistant believes suppression is necessary, the assistant must ask for confirmation before adding anything.

---

## 🚫 TypeScript Ignore Rules (Conditional — TS Projects Only)

If the project includes TypeScript files (`.ts` or `.tsx`), the assistant must NEVER add or generate any TypeScript suppression directives:

- `// @ts-ignore`
- `// @ts-expect-error`
- `// @ts-nocheck`
- Any variant of TS suppression

The assistant must resolve issues correctly based on the active TS configuration.

If suppression seems required due to external or legacy code, the assistant must ask first.

If the project does not include TypeScript at all, this rule is ignored.

---

## 🧩 Rule Reuse Priority & Custom Rule Creation

When enforcing linting, validation, or static analysis rules:

The assistant must ALWAYS check whether an existing rule already satisfies the requirement **before** creating a new custom rule.

The priority order is strictly:

1. **Core ESLint rules**, if they cover the requirement fully.
2. **Plugins or libraries already used by the project**, if they cover the requirement fully.
3. **A new external plugin or library**, if it provides full coverage and no existing rule does.

Only if **no existing rule fully satisfies the requirement**, the assistant is **explicitly allowed and encouraged** to create a **new custom rule**.

This project intentionally contains many custom rules.  
The assistant must not avoid creating new rules when they are genuinely required.

However, the assistant must ensure that:

- no equivalent rule already exists according to the priority above
- the new rule is justified and non-duplicative

---

# 🔒 Refactoring Rules (Strict)

The assistant must NOT:

- rename files
- rename symbols or identifiers
- update import paths
- move files or folders
- reorganize folder structures

If such a change would be beneficial, the assistant may **suggest** it,  
but **I** perform actual renames/moves using IDE tools.

---

## 🧰 Script Refactor Mode (Exception)

By default, refactoring rules prohibit renames, moves, and import updates.

Exception:
When changes are performed via a deterministic script, the assistant may include:

- file renames
- symbol renames
- import/path updates

Only if all of the following are true:

- The script is fully deterministic and idempotent.
- A clear preview / dry-run explanation is provided.
- The script applies all related changes atomically (no partial refactors).

Outside of Script Refactor Mode, the original refactoring prohibitions remain fully in effect.

---

## 🪶 YAGNI Principle (Strict Default)

The assistant must ALWAYS follow the YAGNI principle (“You Aren’t Gonna Need It”).

This means:

- Do NOT add future-proofing
- Do NOT add extensibility “just in case”
- Do NOT add abstractions without immediate use
- Do NOT add optional flags, parameters, or layers unless required now

Only implement what is explicitly required for the current task.

If future use is mentioned but not required now, the assistant must ask before implementing anything extra.

---

# 📝 Preservation of User Comments (Critical)

The assistant must NEVER modify, rewrite, remove, reorder, merge, or refactor any user-authored comments that contain the exact prefix:

**`To do:`**

Rules:

- Comments beginning with `To do:` must remain **exactly as written**, character-for-character.
- The assistant must not capitalize, reformat, shorten, or alter these comments.
- The assistant must not convert them into `TODO:`, `todo:`, `ToDo:`, or any variant.
- The assistant must not move these comments to different parts of the code.
- If a transformation, refactor, or script generation might affect these comments, the assistant must explicitly ask for confirmation first.

These comments represent high-priority user-intent markers and must be preserved as-is.

---

# 🧭 Enum-Like Objects

- When defining an enum-like object, include **only values currently required**.
- Do NOT add speculative values “for the future”.

---

## 🏷️ Naming Precision Rules (Specific & Scope-Aware)

The assistant must prefer **explicit and specific names** over generic ones, **within the correct scope**.

Examples:

- Use `countryCode` instead of `country`
- Use `cityName` instead of `city`

However, naming must always respect **object scope**:

- Do NOT create redundant names like `user.userId`
- In object scope, use:
  - `user.id` (not `user.userId`)
- Use names like `userId` **only when the variable exists outside the object context**, or when multiple identifiers are present and clarity requires it.

Names must be:

- specific
- unambiguous
- appropriate to their scope

Avoid both overly-generic names **and** redundant scoped names.

---

# 🎨 UI — z-index Rules (Conditional — Frontend/UI Projects Only)

If the project includes UI or frontend code (React, Next.js, Vite, JS, TS, CSS, etc.), the assistant must:

1. Determine the **minimum effective z-index** needed for correct behavior.
2. Apply only the smallest working value.
3. Avoid arbitrary or inflated values (e.g., 9999, 1000, 5000).
4. Avoid modifying global stacking contexts unnecessarily.
5. Ask for clarification if unsure.

If the project has no UI or CSS, this rule does not apply.

---

## 🔄 Multi-Question Handling and Completion Guarantee

When the user message contains multiple questions, topics, tasks, or sub-points:

1. The assistant must identify **every** individual request in the message.
2. The assistant must address **each item explicitly**, without skipping or merging unrelated points.
3. At the end of the response, the assistant must include a **Summary / Completion Checklist** listing every item from the user's message and confirming how it was answered.

If any point is unclear or ambiguous, the assistant must ask for clarification before proceeding.

The assistant must never answer partially or assume that some items are optional.

---

# 🗑️ Cleanup & Temporary Files

Any temporary file created for:

- testing
- generation
- examples
- scripts
- logs

must be deleted immediately after use.

The final codebase must contain only necessary project files.

Remove unused CSS properties, redundant styles, and obsolete assets.

---

# 🎯 Rule Priority

1. Explicit user instructions in the current request
2. Rules in this document
3. Assistant defaults (lowest priority)

---
