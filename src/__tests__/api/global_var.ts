// Standardized v4 UUIDs for realistic database/API mocking
export const VALID_UUID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
export const VALID_PROJECT_ID = "b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380b22";
export const VALID_SOLUTION_ID = "c2ffbc99-9c0b-4ef8-bb6d-6bb9bd380c33";
export const VALID_USER_ID = "d3ffbc99-9c0b-4ef8-bb6d-6bb9bd380d44";
export const VALID_CATEGORY_ID = "e4ffbc99-9c0b-4ef8-bb6d-6bb9bd380e55";
export const VALID_PROGRESS_ID = "f5ffbc99-9c0b-4ef8-bb6d-6bb9bd380f66";

export const INVALID_UUID = "not-a-valid-uuid";

// Reusable standard headers
export const JSON_HEADERS = {
  "Content-Type": "application/json",
};

export const SOLUTION_LIKE_HEADERS = {
  "Content-Type": "application/json",
  "x-like-type": "solution",
};