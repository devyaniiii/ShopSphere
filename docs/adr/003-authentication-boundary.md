
# ADR 003: Authentication Boundary

- Status: Proposed
- Date: 2026-10-27

## Context
ShopSphere needs secure customer and administrator access.

## Decision
Keep authentication behind a dedicated provider boundary. The Express API will enforce authorization for protected operations.

## Consequences
The authentication provider can be integrated separately from catalog, cart, and order business logic. The provider choice and implementation will be confirmed in a later task.
