import { ApiReference } from "@scalar/nextjs-api-reference";

export const GET = ApiReference({
  url: "/openapi.json",
  pageTitle: "Solvit API Reference",
  theme: "purple",
  cdn: "https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.67.0",
  layout: "classic",
});
