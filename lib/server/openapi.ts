/** OpenAPI 3.1 specification for the QRix public REST API (v1).
    Served at /api/v1/openapi.json and rendered by the /developers portal. */
import { SITE_URL } from "@/lib/seo";

const bearer = [{ apiKey: [] }];
const pageParams = [
  { name: "page", in: "query", schema: { type: "integer", default: 1 } },
  { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
  { name: "q", in: "query", schema: { type: "string" }, description: "Filter query" },
];
const okResp = (desc: string) => ({ 200: { description: desc } , 401: { description: "Invalid or missing API key" }, 429: { description: "Rate limit exceeded" } });

export function openApiSpec() {
  return {
    openapi: "3.1.0",
    info: {
      title: "QRix API",
      version: "1.0.0",
      description: "REST API for QRix — jobs, uploads, user data, credits, webhooks and workspaces. Authenticate with an API key (`Authorization: Bearer qrix_live_…`) created in your dashboard or via the dev portal.",
    },
    servers: [{ url: `${SITE_URL}/api/v1` }],
    security: bearer,
    components: {
      securitySchemes: { apiKey: { type: "http", scheme: "bearer", bearerFormat: "qrix_live_…" } },
      schemas: {
        Job: { type: "object", properties: { id: { type: "string" }, kind: { type: "string", enum: ["IMAGE", "VIDEO", "AI", "PDF", "QR"] }, tool: { type: "string" }, status: { type: "string", enum: ["QUEUED", "PROCESSING", "DONE", "FAILED", "CANCELED"] }, progress: { type: "integer" }, output: {} } },
        Error: { type: "object", properties: { ok: { type: "boolean" }, error: { type: "string" }, message: { type: "string" } } },
      },
    },
    paths: {
      "/auth/session": { get: { summary: "Current identity", tags: ["Auth"], responses: okResp("Session user (key owner) + enabled providers") } },
      "/me": { get: { summary: "Dashboard payload", tags: ["Account"], responses: okResp("Profile, subscription, limits, usage, activity") } },
      "/me/credits": { get: { summary: "Credit balance + ledger", tags: ["Account"], responses: okResp("Account, costs, history") } },
      "/me/{collection}": {
        get: { summary: "List user data", tags: ["Account"], parameters: [{ name: "collection", in: "path", required: true, schema: { type: "string", enum: ["favorites", "history", "recents", "downloads", "projects", "templates", "bookmarks", "notifications"] } }, ...pageParams], responses: okResp("Paginated items") },
        post: { summary: "Add an item", tags: ["Account"], responses: okResp("Created item") },
        delete: { summary: "Remove one (?id=) or clear", tags: ["Account"], responses: okResp("Removal result") },
      },
      "/jobs": {
        get: { summary: "List jobs", tags: ["Jobs"], parameters: pageParams, responses: okResp("Paginated jobs") },
        post: { summary: "Enqueue a background job", tags: ["Jobs"], requestBody: { content: { "application/json": { schema: { type: "object", required: ["kind", "tool"], properties: { kind: { type: "string" }, tool: { type: "string" }, input: {} } } } } }, responses: okResp("Queued job") },
      },
      "/jobs/{id}": {
        get: { summary: "Job status", tags: ["Jobs"], responses: okResp("Job with progress/output") },
        put: { summary: "Retry failed job", tags: ["Jobs"], responses: okResp("Retry result") },
        delete: { summary: "Cancel job", tags: ["Jobs"], responses: okResp("Cancel result") },
      },
      "/uploads": {
        get: { summary: "List uploads + usage", tags: ["Storage"], responses: okResp("Files + quota") },
        post: { summary: "Upload a file (multipart)", tags: ["Storage"], responses: okResp("Stored object") },
        delete: { summary: "Delete upload (?id=)", tags: ["Storage"], responses: okResp("Removal result") },
      },
      "/keys": {
        get: { summary: "List API keys", tags: ["Keys"], responses: okResp("Keys (hashes never exposed)") },
        post: { summary: "Create API key", tags: ["Keys"], responses: okResp("Plaintext key — shown once") },
      },
      "/keys/{id}": {
        put: { summary: "Rotate key", tags: ["Keys"], responses: okResp("Fresh plaintext key") },
        patch: { summary: "Revoke key", tags: ["Keys"], responses: okResp("Revoked") },
        delete: { summary: "Delete key", tags: ["Keys"], responses: okResp("Deleted") },
      },
      "/webhooks": {
        get: { summary: "List webhooks + deliveries", tags: ["Webhooks"], responses: okResp("Endpoints, history, event catalog") },
        post: { summary: "Register endpoint", tags: ["Webhooks"], requestBody: { content: { "application/json": { schema: { type: "object", required: ["url"], properties: { url: { type: "string" }, events: { type: "string", description: "comma-separated" } } } } } }, responses: okResp("Endpoint + signing secret (once)") },
      },
      "/webhooks/{id}": {
        post: { summary: "Test or toggle endpoint", tags: ["Webhooks"], responses: okResp("Result") },
        delete: { summary: "Delete endpoint", tags: ["Webhooks"], responses: okResp("Deleted") },
      },
      "/workspaces": {
        get: { summary: "List workspaces + invites", tags: ["Workspaces"], responses: okResp("Memberships") },
        post: { summary: "Create workspace / respond to invite", tags: ["Workspaces"], responses: okResp("Workspace or membership") },
      },
      "/workspaces/{id}": { get: { summary: "Workspace dashboard", tags: ["Workspaces"], responses: okResp("Analytics, usage, activity") } },
      "/billing/plans": { get: { summary: "Plans + limits", tags: ["Billing"], security: [], responses: okResp("Plan catalog") } },
      "/track": { post: { summary: "Record product event", tags: ["Analytics"], security: [], responses: okResp("Tracked") } },
    },
    "x-rate-limits": { default: "60 req/min per key", jobs: "30 req/min", uploads: "20 req/min" },
    "x-error-codes": {
      bad_request: 400, unauthorized: 401, insufficient_credits: 402, forbidden: 403,
      not_found: 404, rate_limited: 429, server_error: 500,
    },
  };
}
