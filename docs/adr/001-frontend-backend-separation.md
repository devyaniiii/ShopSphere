
# ADR 001: Frontend and Backend Separation

- Status: Accepted
- Date: 2026-10-27

## Context
ShopSphere needs a maintainable structure for its user interface and business logic.

## Decision
Use React with TypeScript for the frontend and Node.js with Express for the REST API.

## Consequences
The frontend and backend can be developed and tested independently. They communicate through HTTP requests and JSON responses.
