// Synchronizes public/openapi.json to match the admin-only changes made to openapi.yaml.
// Run: node scripts/update-openapi.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const jsonPath = join(root, "public", "openapi.json");

const spec = JSON.parse(readFileSync(jsonPath, "utf8"));

// 1. Remove POST /api/users (now only signup creates users)
delete spec.paths["/api/users"].post;

// 2. Add PUT /api/users/{id} (set role, admin-only)
spec.paths["/api/users/{id}"].put = {
  tags: ["Users"],
  summary: "Set a user's role (admin only)",
  description:
    "Admin-only. Updates the role of the user identified by {id}. The acting user must be an admin. Returns 401 if unauthenticated, 403 if not an admin. Prevents removing the last admin.",
  operationId: "setUserRole",
  security: [{ cookieAuth: [] }, { bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["role"],
          properties: {
            role: { type: "string", enum: ["user", "admin"] },
          },
        },
      },
    },
  },
  responses: {
    "200": {
      description: "Role updated",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/User" },
        },
      },
    },
    "400": {
      description: "Validation error, or attempt to remove the last admin",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
        },
      },
    },
    "401": {
      description: "Authentication required",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
        },
      },
    },
    "403": {
      description: "Caller is not an admin",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
        },
      },
    },
    "404": {
      description: "User not found",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
        },
      },
    },
  },
};

// 3. Add role to User schema
spec.components.schemas.User.properties.role = {
  type: "string",
  enum: ["user", "admin"],
};

// 4. Update categories POST/PUT/DELETE to admin-only + add 403
const catPaths = spec.paths["/api/categories"];
catPaths.post.summary = "Create a category (admin only)";
catPaths.post.description =
  "Admin-only. Adds a new category to the global reference list. Returns 401 if unauthenticated, 403 if not an admin.";
catPaths.post.responses["403"] = {
  description: "Caller is not an admin",
  content: {
    "application/json": { schema: { $ref: "#/components/schemas/Error" } },
  },
};
catPaths.post.responses["401"].description = "Authentication required";

const catIdPaths = spec.paths["/api/categories/{id}"];
catIdPaths.put.summary = "Update a category (admin only)";
catIdPaths.put.description =
  "Admin-only. Renames the category identified by {id}. Returns 401 if unauthenticated, 403 if not an admin.";
catIdPaths.put.responses["403"] = {
  description: "Caller is not an admin",
  content: {
    "application/json": { schema: { $ref: "#/components/schemas/Error" } },
  },
};
catIdPaths.put.responses["401"].description = "Authentication required";
catIdPaths.delete.summary = "Delete a category (admin only)";
catIdPaths.delete.description =
  "Admin-only. Deletes the category identified by {id}. Returns 401 if unauthenticated, 403 if not an admin.";
catIdPaths.delete.responses["403"] = {
  description: "Caller is not an admin",
  content: {
    "application/json": { schema: { $ref: "#/components/schemas/Error" } },
  },
};
catIdPaths.delete.responses["401"].description = "Authentication required";

// 5. Add stack CRUD endpoints
spec.paths["/api/stacks"].post = {
  tags: ["Stacks"],
  summary: "Create a stack (admin only)",
  description:
    "Admin-only. Adds a new technology stack. Returns 401 if unauthenticated, 403 if not an admin.",
  operationId: "createStack",
  security: [{ cookieAuth: [] }, { bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", minLength: 1, maxLength: 100 },
          },
        },
      },
    },
  },
  responses: {
    "201": {
      description: "Stack created",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Stack" },
        },
      },
    },
    "400": {
      description: "Validation error or name already exists",
      content: {
        "application/json": { schema: { $ref: "#/components/schemas/Error" } },
      },
    },
    "401": {
      description: "Authentication required",
      content: {
        "application/json": { schema: { $ref: "#/components/schemas/Error" } },
      },
    },
    "403": {
      description: "Caller is not an admin",
      content: {
        "application/json": { schema: { $ref: "#/components/schemas/Error" } },
      },
    },
  },
};

spec.paths["/api/stacks/{id}"] = {
  parameters: [{ $ref: "#/components/parameters/IdParam" }],
  get: {
    tags: ["Stacks"],
    summary: "Get a stack",
    description: "Public. Returns a single stack by id.",
    operationId: "getStack",
    responses: {
      "200": {
        description: "Stack",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: { $ref: "#/components/schemas/Stack" },
              },
            },
          },
        },
      },
      "404": {
        description: "Stack not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
  },
  put: {
    tags: ["Stacks"],
    summary: "Update a stack (admin only)",
    description:
      "Admin-only. Renames the stack identified by {id}. Returns 401 if unauthenticated, 403 if not an admin.",
    operationId: "updateStack",
    security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["name"],
            properties: {
              name: { type: "string", minLength: 1, maxLength: 100 },
            },
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Stack updated",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Stack" },
          },
        },
      },
      "400": {
        description: "Validation error or name already exists",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      "401": {
        description: "Authentication required",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      "403": {
        description: "Caller is not an admin",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      "404": {
        description: "Stack not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
  },
  delete: {
    tags: ["Stacks"],
    summary: "Delete a stack (admin only)",
    description:
      "Admin-only. Deletes the stack identified by {id}. Returns 401 if unauthenticated, 403 if not an admin.",
    operationId: "deleteStack",
    security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    responses: {
      "200": {
        description: "Stack deleted",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: { $ref: "#/components/schemas/Stack" },
              },
            },
          },
        },
      },
      "401": {
        description: "Authentication required",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      "403": {
        description: "Caller is not an admin",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      "404": {
        description: "Stack not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
  },
};

writeFileSync(jsonPath, JSON.stringify(spec, null, 2));
console.log("✅ public/openapi.json updated.");
