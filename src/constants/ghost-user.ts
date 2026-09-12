// Ghost user identity — shared constant so seed, services, and tests all agree.
// The ghost user holds projects after their owner deletes the account.
// See src/scripts/seed.ts (upsertGhostUser) for how it's created.
export const GHOST_USER_ID = "00000000-0000-0000-0000-000000000000";
export const GHOST_USER_EMAIL = "deleted@localhost";
