---
description: Multi-step implementation workflow - analyzes requirements, creates detailed plan, waits for confirmation, executes implementation, and reviews the code
argument-hint: [feature or task description]
---

# APEX Implementation Workflow

You are executing a structured implementation workflow. Follow these phases in order:

---

## Phase 0: Git Setup

Before starting implementation, set up the Git workflow:

1. **Check current git status:**

   ```bash
   git status
   ```

2. **Switch to develop branch and pull latest changes:**

   ```bash
   git checkout develop && git pull origin develop
   ```

3. **Create a feature branch** based on the feature name from $ARGUMENTS:
   - Generate a kebab-case branch name from the feature description
   - Example: "Authentication system" → `feature/authentication-system`
   - Example: "Organization switcher" → `feature/organization-switcher`

   ```bash
   git checkout -b feature/[branch-name]
   ```

4. **Confirm branch creation:**
   Show the current branch and confirm we're ready to start development.

**IMPORTANT:** If there are uncommitted changes on the current branch, warn the user and ask what to do (stash, commit, or abort).

---

## Phase 1: Requirements Analysis

First, thoroughly analyze what needs to be implemented based on: **$ARGUMENTS**

1. **Read relevant documentation:**
   - Check DEVELOPMENT.md to see which epic this relates to
   - Review CLAUDE.md for architecture and patterns
   - Read docs/BRD.md for requirements context

2. **Explore existing code:**
   - Use Glob and Grep to find related files
   - Understand current implementation patterns
   - Identify dependencies and integration points

3. **Ask clarifying questions** if anything is unclear:
   - What is the exact scope of this feature?
   - Are there specific requirements I should follow?
   - Which files or components should be involved?
   - Are there any constraints or preferences?

**Output a clear summary** of what you understand needs to be built.

---

## Phase 2: Create Implementation Plan

Based on your analysis, create a **detailed implementation plan** with:

### 2.1 Files to Create/Modify

List exact file paths and what changes are needed in each file.

### 2.2 Architecture Decisions

- Components, services, or modules to build
- Data models or database changes
- API endpoints or routes
- State management approach

### 2.3 Implementation Steps

Number each step in execution order:

1. Step one...
2. Step two...
3. etc.

### 2.4 Testing Strategy

- What tests need to be written?
- How will you verify it works?

### 2.5 Dependencies

- New packages to install
- Services to configure
- Environment variables needed

**Present the complete plan clearly formatted.**

---

## Phase 3: Wait for Confirmation

After presenting the plan, **STOP and ask:**

```
📋 Implementation Plan Ready

I've analyzed the requirements and created the plan above.

Ready to proceed with implementation? (yes/no)

If you'd like any changes to the plan, let me know!
```

**DO NOT PROCEED until the user explicitly confirms "yes" or similar affirmative response.**

If the user requests changes, revise the plan and ask for confirmation again.

---

## Phase 4: Execute the Plan

Once confirmed, implement the plan step-by-step:

1. **Use TodoWrite tool** to track all implementation steps from your plan
2. **Execute each step** in the order you planned
3. **Mark todos as in_progress** when you start a step
4. **Mark todos as completed** immediately after finishing each step
5. **Provide clear progress updates** as you work

**Key execution principles:**

- Follow the plan exactly (don't add unplanned features)
- Write clean, well-structured code following project conventions
- Add comments only where logic isn't self-evident
- Follow the patterns established in CLAUDE.md
- Don't over-engineer - keep it simple
- Test as you go when possible

**Show your work:**

- Explain what you're doing at each step
- Show important code snippets
- Report any issues or adjustments needed

---

## Phase 5: Code Examination & Review

After implementation is complete:

### 5.1 Review What Was Built

- List all files created or modified
- Summarize key functions/components added
- Show how it integrates with existing code

### 5.2 Quality Check

- Does the code follow project conventions?
- Are there any security concerns?
- Is error handling appropriate?
- Are types properly defined?

### 5.3 Testing

- Run relevant tests if applicable
- Verify the feature works as expected
- Note any manual testing steps needed

### 5.4 Next Steps

Suggest what should happen next:

- Tests to write
- Documentation to update
- Related features to implement
- Integration with other epics

### 5.5 Update DEVELOPMENT.md

- Check off completed tasks in DEVELOPMENT.md
- Add notes if anything was modified from the original plan

**Provide a clear summary** of what was accomplished and what remains.

---

## Phase 6: Git Completion & Pull Request

After the code is reviewed and complete, finalize the Git workflow:

### 6.1 Stage and Commit Changes

1. **Check what files changed:**

   ```bash
   git status
   ```

2. **Stage all changes:**

   ```bash
   git add .
   ```

3. **Create a commit** with a clear, descriptive message:
   - Generate commit title from the feature (max 72 chars)
   - Follow conventional commits format: `feat:`, `fix:`, `refactor:`, etc.
   - Add the required footer from CLAUDE.md

   Example commit message format:

   ```
   feat: implement authentication system with Better Auth

   - Add email/password authentication
   - Configure Better Auth with session management
   - Create login and signup endpoints
   - Add session validation middleware

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
   ```

   Execute the commit:

   ```bash
   git commit -m "$(cat <<'EOF'
   [commit message here]
   EOF
   )"
   ```

### 6.2 Push Branch

Push the feature branch to remote:

```bash
git push -u origin [branch-name]
```

### 6.3 Create Pull Request

Use GitHub CLI to create a pull request:

1. **Generate PR title** from the feature (concise, clear)
2. **Generate PR description** with:
   - Summary section (2-3 bullet points of what was implemented)
   - Test plan section (how to verify the changes)
   - Related epic/tasks from DEVELOPMENT.md
   - Footer with Claude Code attribution

Example PR format:

```markdown
## Summary

- Implemented authentication system with Better Auth
- Added email/password login and signup flows
- Configured session management with HttpOnly cookies

## Test Plan

- [ ] Verify signup creates user and session
- [ ] Verify login authenticates and returns session cookie
- [ ] Verify logout clears session
- [ ] Run auth E2E tests

## Related Tasks

Epic 2: Authentication (DEVELOPMENT.md)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Execute PR creation:

```bash
gh pr create --base develop --title "[PR title]" --body "$(cat <<'EOF'
[PR description]
EOF
)"
```

### 6.4 Provide PR URL

Show the user the PR URL so they can review and merge when ready.

---

## Important Reminders

- **Always use TodoWrite** to track progress during execution
- **Update DEVELOPMENT.md** when completing epic tasks
- **Follow the architecture** defined in CLAUDE.md
- **Respect the tech stack** defined in docs/BRD.md
- **Don't skip the confirmation step** - always wait for user approval
- **Keep it simple** - don't add features beyond requirements
- **Test thoroughly** before marking complete

---

## Example Usage

```bash
/apex Authentication system with Better Auth
/apex Organization switcher component
/apex Stripe webhook handlers
/apex Email verification flow
```

The workflow will automatically guide you through all 7 phases:

- **Phase 0:** Git setup (checkout develop, pull, create feature branch)
- **Phase 1:** Requirements analysis
- **Phase 2:** Create implementation plan
- **Phase 3:** Wait for your confirmation
- **Phase 4:** Execute the plan
- **Phase 5:** Code examination & review
- **Phase 6:** Git completion (commit, push, create PR)
