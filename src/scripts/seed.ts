// src/scripts/seed.ts
// Idempotent development seeder. Upserts reference rows (users, categories,
// stacks) by unique key and only inserts projects/solutions/stacks-links that
// don't already exist (matched by project name). Safe to re-run.

import { db } from "@/database";
import {
  users,
  categories,
  stacks,
  projects,
  projectStacks,
  solutions,
} from "@/database/schemas";
import { ProjectLevel } from "@/constants/enums";
import { hashPassword } from "@/lib/auth/password";
import { eq } from "drizzle-orm";

const SEED_USERS = [
  {
    name: "Jane Doe",
    email: "jane.doe@example.com",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  },
  {
    name: "John Smith",
    email: "john.smith@example.com",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  },
  { name: "Priya Sharma", email: "priya.sharma@example.com" },
  { name: "Omar Farouk", email: "omar.farouk@example.com" },
];

const SEED_CATEGORIES = [
  { name: "Fullstack Application" },
  { name: "Frontend Component" },
  { name: "Backend API & Services" },
];

const SEED_STACKS = [
  "Next.js",
  "TypeScript",
  "PostgreSQL",
  "Drizzle ORM",
  "Tailwind CSS",
  "Docker",
  "React",
  "Redis",
  "Node.js",
  "GraphQL",
].map((name) => ({ name }));

type SeedProject = {
  name: string;
  ownerEmail: string;
  category: string;
  description: string;
  level: ProjectLevel;
  requirements: string[];
  optRequirements: string[];
  instructions: string[];
  stackNames: string[];
  totalLikes: number;
};

const SEED_PROJECTS: SeedProject[] = [
  {
    name: "Fullstack E-Commerce Platform",
    ownerEmail: "jane.doe@example.com",
    category: "Fullstack Application",
    description:
      "An advanced online store with secure checkout, cart state, and product filtering.",
    level: "INTERMEDIATE",
    requirements: ["Node.js v20+", "TypeScript Knowledge", "PostgreSQL database"],
    optRequirements: ["Docker setup", "Redis caching"],
    instructions: [
      "Clone the repository and configure your .env database URL.",
      "Run database migrations using Drizzle Kit.",
      "Execute npm run dev to start the development server.",
    ],
    stackNames: ["Next.js", "TypeScript", "PostgreSQL", "Drizzle ORM"],
    totalLikes: 12,
  },
  {
    name: "Real-Time Chat Application",
    ownerEmail: "john.smith@example.com",
    category: "Fullstack Application",
    description: "Multi-room chat with typing indicators, presence, and message history.",
    level: "ADVANCED",
    requirements: ["WebSockets", "Redis", "PostgreSQL"],
    optRequirements: ["End-to-end encryption", "Docker setup"],
    instructions: [
      "Set up a Redis pub/sub layer for rooms.",
      "Persist messages to PostgreSQL with a retry queue.",
      "Add presence via heartbeat events.",
    ],
    stackNames: ["Next.js", "TypeScript", "PostgreSQL", "Redis"],
    totalLikes: 8,
  },
  {
    name: "Task Management SaaS",
    ownerEmail: "priya.sharma@example.com",
    category: "Fullstack Application",
    description: "Kanban-style task manager with subscriptions, billing, and team workspaces.",
    level: "INTERMEDIATE",
    requirements: ["Stripe payments", "PostgreSQL", "TypeScript"],
    optRequirements: ["Redis caching", "Docker setup"],
    instructions: [
      "Model workspaces, boards, and memberships.",
      "Integrate Stripe billing for paid tiers.",
      "Add realtime column updates via server-sent events.",
    ],
    stackNames: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
    totalLikes: 15,
  },
  {
    name: "Social Bookmarking Platform",
    ownerEmail: "omar.farouk@example.com",
    category: "Fullstack Application",
    description: "Curate and share bookmarks with tags, collections, and a public profile.",
    level: "BEGINNER",
    requirements: ["Next.js", "Tailwind CSS"],
    optRequirements: ["TypeScript"],
    instructions: [
      "Build the bookmark CRUD flows first.",
      "Add tagging and public profile pages.",
      "Validate all forms with Zod.",
    ],
    stackNames: ["Next.js", "TypeScript", "Tailwind CSS"],
    totalLikes: 3,
  },
  {
    name: "Community Q&A Forum",
    ownerEmail: "jane.doe@example.com",
    category: "Fullstack Application",
    description: "Question-and-answer board with voting, accepted answers, and reputation.",
    level: "INTERMEDIATE",
    requirements: ["PostgreSQL", "Drizzle ORM"],
    optRequirements: ["Redis caching", "Docker setup"],
    instructions: [
      "Design the normalized post/answer schema.",
      "Implement voting with a unique constraint per user.",
      "Add full-text search on questions.",
    ],
    stackNames: ["Next.js", "PostgreSQL", "Drizzle ORM"],
    totalLikes: 7,
  },
  {
    name: "Interactive Kanban Board",
    ownerEmail: "john.smith@example.com",
    category: "Frontend Component",
    description:
      "A drag-and-drop task management dashboard supporting multiple columns and priority tags.",
    level: "BEGINNER",
    requirements: ["React or Next.js familiarity", "Basic CSS/Tailwind"],
    optRequirements: ["Drag and drop library implementation"],
    instructions: [
      "Set up a clean project workspace.",
      "Implement state management for columns and tasks.",
      "Add full keyboard accessibility support.",
    ],
    stackNames: ["Next.js", "Tailwind CSS"],
    totalLikes: 5,
  },
  {
    name: "Data Visualization Dashboard",
    ownerEmail: "priya.sharma@example.com",
    category: "Frontend Component",
    description: "Configurable charts and KPIs for time-series data.",
    level: "INTERMEDIATE",
    requirements: ["TypeScript", "React"],
    optRequirements: ["GraphQL"],
    instructions: [
      "Pick a charting library and define a shared data model.",
      "Build reusable widgets for KPIs and trends.",
      "Expose a GraphQL aggregation endpoint.",
    ],
    stackNames: ["React", "TypeScript", "Tailwind CSS"],
    totalLikes: 9,
  },
  {
    name: "Accessible Form Builder",
    ownerEmail: "omar.farouk@example.com",
    category: "Frontend Component",
    description: "Drag-to-build forms with WCAG-compliant output.",
    level: "BEGINNER",
    requirements: ["React", "Tailwind CSS"],
    optRequirements: ["TypeScript"],
    instructions: [
      "Support a small set of field types first.",
      "Generate a preview with proper labels and focus states.",
      "Add export to JSON schema.",
    ],
    stackNames: ["React", "Tailwind CSS"],
    totalLikes: 2,
  },
  {
    name: "Drag-and-Drop Photo Gallery",
    ownerEmail: "jane.doe@example.com",
    category: "Frontend Component",
    description: "Responsive gallery with inline reordering and a lightbox.",
    level: "BEGINNER",
    requirements: ["TypeScript"],
    optRequirements: ["Docker setup"],
    instructions: [
      "Implement drag reordering with optimistic updates.",
      "Add a keyboard-accessible lightbox.",
      "Persist order to the backend.",
    ],
    stackNames: ["React", "TypeScript", "Tailwind CSS"],
    totalLikes: 1,
  },
  {
    name: "Realtime Collaboration Whiteboard",
    ownerEmail: "priya.sharma@example.com",
    category: "Frontend Component",
    description: "Multi-user canvas with live cursors, shapes, and undo history.",
    level: "ADVANCED",
    requirements: ["GraphQL", "Redis", "TypeScript"],
    optRequirements: ["WebSockets"],
    instructions: [
      "Design the command log and snapshot model.",
      "Synchronize strokes through Redis pub/sub.",
      "Implement operational transform for undo.",
    ],
    stackNames: ["React", "GraphQL", "Redis"],
    totalLikes: 11,
  },
  {
    name: "REST API Boilerplate",
    ownerEmail: "omar.farouk@example.com",
    category: "Backend API & Services",
    description: "Layered Node.js REST starter with auth, validation, and migrations.",
    level: "INTERMEDIATE",
    requirements: ["Node.js v20+", "PostgreSQL"],
    optRequirements: ["Redis caching", "Docker setup"],
    instructions: [
      "Structure routes, services, and repositories.",
      "Add Zod validation at the route boundary.",
      "Ship Docker Compose with Postgres and Redis.",
    ],
    stackNames: ["Node.js", "TypeScript", "PostgreSQL", "Drizzle ORM"],
    totalLikes: 6,
  },
  {
    name: "GraphQL Gateway Service",
    ownerEmail: "priya.sharma@example.com",
    category: "Backend API & Services",
    description: "Federated GraphQL gateway aggregating multiple backend services.",
    level: "ADVANCED",
    requirements: ["GraphQL", "Redis"],
    optRequirements: ["Docker setup"],
    instructions: [
      "Compose subgraph schemas into a single gateway.",
      "Add query complexity limits and caching.",
      "Trace cross-service errors.",
    ],
    stackNames: ["GraphQL", "Node.js", "Redis"],
    totalLikes: 4,
  },
  {
    name: "URL Shortener API",
    ownerEmail: "john.smith@example.com",
    category: "Backend API & Services",
    description: "High-throughput link shortener with analytics and custom aliases.",
    level: "BEGINNER",
    requirements: ["PostgreSQL", "Redis"],
    optRequirements: ["Docker setup"],
    instructions: [
      "Generate collision-resistant short codes.",
      "Cache redirects in Redis.",
      "Track click analytics per alias.",
    ],
    stackNames: ["Node.js", "PostgreSQL", "Redis"],
    totalLikes: 10,
  },
  {
    name: "Background Job Scheduler",
    ownerEmail: "jane.doe@example.com",
    category: "Backend API & Services",
    description: "Priority queue worker with retries, scheduling, and observability.",
    level: "ADVANCED",
    requirements: ["Redis", "Docker"],
    optRequirements: ["PostgreSQL"],
    instructions: [
      "Model jobs with priority and max retries.",
      "Implement a polling worker with backoff.",
      "Record run history for observability.",
    ],
    stackNames: ["Node.js", "Redis", "Docker"],
    totalLikes: 3,
  },
  {
    name: "Webhook Delivery Service",
    ownerEmail: "omar.farouk@example.com",
    category: "Backend API & Services",
    description: "Retrying webhook dispatcher with signatures and delivery logs.",
    level: "INTERMEDIATE",
    requirements: ["PostgreSQL"],
    optRequirements: ["Redis caching", "Docker setup"],
    instructions: [
      "Sign payloads with HMAC per endpoint.",
      "Retry with exponential backoff on failures.",
      "Expose delivery attempt logs.",
    ],
    stackNames: ["Node.js", "PostgreSQL"],
    totalLikes: 5,
  },
  {
    name: "OpenAPI Mock Server",
    ownerEmail: "john.smith@example.com",
    category: "Backend API & Services",
    description: "Serve realistic mocks from an OpenAPI spec for faster client work.",
    level: "BEGINNER",
    requirements: ["Node.js", "TypeScript"],
    optRequirements: ["Docker setup"],
    instructions: [
      "Parse an OpenAPI specification.",
      "Generate typed responses from schemas.",
      "Add validation mode against the spec.",
    ],
    stackNames: ["Node.js", "TypeScript"],
    totalLikes: 2,
  },
];

type SeedSolution = {
  projectName: string;
  ownerEmail: string;
  title: string;
  description: string;
  repoUrl: string;
  demoUrl: string;
  likes: number;
  implFeat: string[];
};

const SEED_SOLUTIONS: SeedSolution[] = [
  {
    projectName: "Fullstack E-Commerce Platform",
    ownerEmail: "john.smith@example.com",
    title: "Storefront with Stripe checkout",
    description: "Fully typed storefront using Drizzle transactions and Zod form validation.",
    repoUrl: "https://github.com/example/ecommerce-solution",
    demoUrl: "https://ecommerce-demo.example.com",
    likes: 8,
    implFeat: ["Atomic database transactions", "Stripe webhooks", "Responsive Tailwind UI"],
  },
  {
    projectName: "Real-Time Chat Application",
    ownerEmail: "jane.doe@example.com",
    title: "Redis-powered chat backend",
    description: "Presence and typing indicators built on Redis pub/sub with Postgres history.",
    repoUrl: "https://github.com/example/chat-solution",
    demoUrl: "https://chat-demo.example.com",
    likes: 5,
    implFeat: ["Presence via Redis", "Socket auth", "Message replay"],
  },
  {
    projectName: "Task Management SaaS",
    ownerEmail: "omar.farouk@example.com",
    title: "Stripe billing and team workspaces",
    description: "Subscription portal with role-based access across workspaces.",
    repoUrl: "https://github.com/example/saas-solution",
    demoUrl: "https://saas-demo.example.com",
    likes: 7,
    implFeat: ["Subscription portal", "Role-based access", "Usage quotas"],
  },
  {
    projectName: "Community Q&A Forum",
    ownerEmail: "priya.sharma@example.com",
    title: "Moderation-ready Q&A engine",
    description: "Reputation scoring with a content moderation queue.",
    repoUrl: "https://github.com/example/qa-solution",
    demoUrl: "https://qa-demo.example.com",
    likes: 4,
    implFeat: ["Reputation scoring", "Content moderation queue", "Accepted answer flow"],
  },
  {
    projectName: "Interactive Kanban Board",
    ownerEmail: "jane.doe@example.com",
    title: "Accessible Kanban prototype",
    description: "Fully keyboard-operable board with ARIA live regions.",
    repoUrl: "https://github.com/example/kanban-solution",
    demoUrl: "https://kanban-demo.example.com",
    likes: 3,
    implFeat: ["Keyboard-only drag", "ARIA live regions", "Local persistence"],
  },
  {
    projectName: "REST API Boilerplate",
    ownerEmail: "priya.sharma@example.com",
    title: "Clean-architecture REST API",
    description: "Layered Node.js API with strict DTO validation and request logging.",
    repoUrl: "https://github.com/example/rest-solution",
    demoUrl: "https://rest-demo.example.com",
    likes: 6,
    implFeat: ["DTO validation", "Request logging", "Migration seeding"],
  },
  {
    projectName: "GraphQL Gateway Service",
    ownerEmail: "john.smith@example.com",
    title: "Apollo federation gateway",
    description: "Federated gateway with subgraph introspection caching.",
    repoUrl: "https://github.com/example/graphql-solution",
    demoUrl: "https://graphql-demo.example.com",
    likes: 5,
    implFeat: ["Subgraph introspection cache", "Query complexity limits", "Error tracing"],
  },
  {
    projectName: "URL Shortener API",
    ownerEmail: "omar.farouk@example.com",
    title: "High-throughput shortener",
    description: "Batch alias insertion with Redis caching and click analytics.",
    repoUrl: "https://github.com/example/shortener-solution",
    demoUrl: "https://shortener-demo.example.com",
    likes: 4,
    implFeat: ["Batch alias insertion", "Click analytics", "Redis redirect cache"],
  },
];

async function upsertUsers(): Promise<Map<string, string>> {
  const existing = await db().select().from(users);
  const byEmail = new Map(existing.map((u) => [u.email, u.id] as const));
  const missing = SEED_USERS.filter((u) => !byEmail.has(u.email));
  if (missing.length > 0) {
    const inserted = await db().insert(users).values(missing).returning();
    for (const u of inserted) byEmail.set(u.email, u.id);
  }

  // Seed admin user from env (idempotent: re-run keeps admin role + password current)
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const passwordHash = await hashPassword(adminPassword);
    const existingAdminId = byEmail.get(adminEmail);

    if (existingAdminId) {
      // Refresh role + password so re-runs stay current
      await db()
        .update(users)
        .set({ name: "femiznet", role: "admin", passwordHash })
        .where(eq(users.id, existingAdminId));
      console.log(`  Admin user updated: ${adminEmail}`);
    } else {
      const [adminUser] = await db()
        .insert(users)
        .values({
          name: "femiznet",
          email: adminEmail,
          passwordHash,
          role: "admin",
        })
        .returning();
      if (adminUser) {
        byEmail.set(adminEmail, adminUser.id);
        console.log(`  Admin user created: ${adminEmail}`);
      }
    }
  }

  return byEmail;
}

async function upsertCategories(): Promise<Map<string, string>> {
  const existing = await db()
    .select({ id: categories.id, name: categories.name })
    .from(categories);
  const byName = new Map(existing.map((c) => [c.name, c.id] as const));
  const missing = SEED_CATEGORIES.filter((c) => !byName.has(c.name));
  if (missing.length > 0) {
    const inserted = await db()
      .insert(categories)
      .values(missing)
      .returning({ id: categories.id, name: categories.name });
    for (const c of inserted) byName.set(c.name, c.id);
  }
  return byName;
}
async function upsertStacks(): Promise<Map<string, string>> {
  const existing = await db().select({ id: stacks.id, name: stacks.name }).from(stacks);
  const byName = new Map(existing.map((s) => [s.name, s.id] as const));
  const missing = SEED_STACKS.filter((s) => !byName.has(s.name));
  if (missing.length > 0) {
    const inserted = await db()
      .insert(stacks)
      .values(missing)
      .returning({ id: stacks.id, name: stacks.name });
    for (const s of inserted) byName.set(s.name, s.id);
  }
  return byName;
}

async function insertProjects(
  userIds: Map<string, string>,
  categoryIds: Map<string, string>,
  stackIds: Map<string, string>
) {
  const existing = await db().select({ name: projects.name }).from(projects);
  const existingNames = new Set(existing.map((p) => p.name));

  const rows = SEED_PROJECTS
    .filter((p) => !existingNames.has(p.name))
    .map((p) => ({
      userId: userIds.get(p.ownerEmail)!,
      categoryId: categoryIds.get(p.category)!,
      name: p.name,
      description: p.description,
      level: p.level,
      requirements: p.requirements,
      optRequirements: p.optRequirements,
      instructions: p.instructions,
      totalLikes: p.totalLikes,
    }));

  if (rows.length === 0) return [];

  const inserted = await db().insert(projects).values(rows).returning();
  const insertedByName = new Map(inserted.map((p) => [p.name, p] as const));

  // Link stacks to newly inserted projects (projectId, stackId pairs).
  const stackLinks: { projectId: string; stackId: string }[] = [];
  for (const project of inserted) {
    const seed = SEED_PROJECTS.find((p) => p.name === project.name)!;
    for (const stackName of seed.stackNames) {
      const stackId = stackIds.get(stackName);
      if (stackId) stackLinks.push({ projectId: project.id, stackId });
    }
  }
  if (stackLinks.length > 0) await db().insert(projectStacks).values(stackLinks);

  // Seed solutions only for projects inserted on this run.
  const solutionRows = SEED_SOLUTIONS
    .filter((s) => insertedByName.has(s.projectName))
    .map((s) => ({
      projectId: insertedByName.get(s.projectName)!.id,
      userId: userIds.get(s.ownerEmail)!,
      title: s.title,
      description: s.description,
      repoUrl: s.repoUrl,
      demoUrl: s.demoUrl,
      likes: s.likes,
      implFeat: s.implFeat,
    }));
  if (solutionRows.length > 0) await db().insert(solutions).values(solutionRows);

  return inserted;
}

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    const userIds = await upsertUsers();
    console.log(`  Users ready: ${userIds.size}`);

    const categoryIds = await upsertCategories();
    const stackIds = await upsertStacks();
    console.log(`  Categories ready: ${categoryIds.size}`);
    console.log(`  Stacks ready: ${stackIds.size}`);

    const insertedProjects = await insertProjects(userIds, categoryIds, stackIds);
    const totalProjects = (await db().select().from(projects)).length;
    const totalSolutions = (await db().select().from(solutions)).length;

    if (insertedProjects.length > 0) {
      console.log(`  Projects inserted: ${insertedProjects.length}`);
    } else {
      console.log("  Projects: up to date (nothing to insert)");
    }
    console.log(`  Total in DB -> projects: ${totalProjects}, solutions: ${totalSolutions}`);
    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.log("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();