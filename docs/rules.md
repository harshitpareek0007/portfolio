# AI Development Rules

These rules must be strictly adhered to by all AI agents during development:

1. **Inspect Before Modifying**: Always read and understand existing code/files before making changes.
2. **No Blind Rewrites**: Never rewrite existing code without a clear understanding of its purpose.
3. **Approval for Deletion**: Never delete working functionality without explicit user approval.
4. **Focused Changes**: Never modify unrelated files while working on a specific task.
5. **Security First**: Never expose secrets, API keys, or passwords.
6. **Git Hygiene**: Never commit `.env` or other sensitive/generated files.
7. **Database Safety**: Never perform destructive database operations (Drop, Delete DB) automatically. Keep the `portfolio` database intact.
8. **No Force Pushing**: Never use `git push -f`. Maintain clean commit history.
9. **Respect User Code**: Never reset or overwrite user-made changes without confirmation.
10. **Test Before Complete**: Run relevant tests after implementation if a test suite exists.
11. **Build Before Release**: Ensure the project builds successfully before marking a release/deploy task complete.
12. **Ask If Uncertain**: If there is ambiguity in the task or potential for breaking changes, stop and ask the user for clarification.
