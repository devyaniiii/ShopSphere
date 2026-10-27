
# ADR 002: MongoDB Atlas

- Status: Accepted
- Date: 2026-10-27

## Context
ShopSphere needs persistent storage for users, products, carts, orders, and payment records.

## Decision
Use MongoDB Atlas as the managed database service.

## Consequences
The project can use MongoDB collections and a managed database deployment. Credentials must remain in environment variables and must never be committed.
