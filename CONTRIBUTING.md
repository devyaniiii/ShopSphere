# Contributing to ShopSphere

## Branch Naming Convention

Use the following format:

`day-XX/task-XX-short-description`

Example:

`day-01/task-01-project-architecture-and-repository-setup`

Create task branches from the latest `main` branch.

## Commit Message Convention

Use the format:

`type(scope): short description`

Examples:

- `feat(day-01): project architecture & repository setup`
- `fix(day-01): correct server configuration`
- `docs(day-01): update setup instructions`

Use `feat` for new functionality, `fix` for bug fixes, and `docs` for documentation-only changes.

## Development Guidelines

- Keep changes focused on the assigned task.
- Follow the existing project structure.
- Test changes before committing.
- Never commit `.env` files containing secrets.
- Keep `.env.example` files free of real credentials.
- Do not commit `node_modules` or generated build output.

## Pull Request Guidelines

- Use a descriptive title.
- Summarize the changes.
- Include verification steps.
- Mention any known issues or incomplete work.