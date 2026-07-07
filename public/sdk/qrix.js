/*! QRix JavaScript SDK v1.0.0 — https://qrix.app/developers
 *  Zero-dependency client for the QRix REST API. Works in Node 18+, Deno,
 *  Bun and browsers. `const qrix = new QRix("qrix_live_…")`.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QRix = factory();
})(typeof self !== "undefined" ? self : this, function () {
  class QRixError extends Error {
    constructor(status, code, message) { super(message || code); this.status = status; this.code = code; }
  }

  class QRix {
    constructor(apiKey, opts = {}) {
      if (!apiKey) throw new Error("QRix: apiKey is required");
      this.apiKey = apiKey;
      this.baseUrl = (opts.baseUrl || "https://qrix.app/api/v1").replace(/\/$/, "");
      this.workspaceId = opts.workspaceId || null;
    }

    async request(method, path, body, isForm) {
      const headers = { Authorization: "Bearer " + this.apiKey };
      if (this.workspaceId) headers["X-Workspace-Id"] = this.workspaceId;
      if (body && !isForm) headers["Content-Type"] = "application/json";
      const res = await fetch(this.baseUrl + path, {
        method, headers, body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.ok === false) throw new QRixError(res.status, json.error || "request_failed", json.message);
      return json.data !== undefined ? json.data : json;
    }

    // Identity + account
    me() { return this.request("GET", "/me"); }
    credits() { return this.request("GET", "/me/credits"); }

    // Jobs
    createJob(kind, tool, input) { return this.request("POST", "/jobs", { kind, tool, input }); }
    getJob(id) { return this.request("GET", "/jobs/" + id); }
    cancelJob(id) { return this.request("DELETE", "/jobs/" + id); }
    retryJob(id) { return this.request("PUT", "/jobs/" + id); }
    /** Poll a job until it finishes (or `timeoutMs` elapses). */
    async waitForJob(id, { intervalMs = 1000, timeoutMs = 120000 } = {}) {
      const t0 = Date.now();
      for (;;) {
        const job = await this.getJob(id);
        if (["DONE", "FAILED", "CANCELED"].includes(job.status)) return job;
        if (Date.now() - t0 > timeoutMs) throw new QRixError(408, "timeout", "job did not finish in time");
        await new Promise((r) => setTimeout(r, intervalMs));
      }
    }

    // Storage
    listUploads() { return this.request("GET", "/uploads"); }
    async upload(file, { temporary = true } = {}) {
      const form = new FormData();
      form.set("file", file);
      form.set("temporary", String(temporary));
      return this.request("POST", "/uploads", form, true);
    }

    // User data collections
    list(collection, params = {}) {
      const q = new URLSearchParams(params).toString();
      return this.request("GET", "/me/" + collection + (q ? "?" + q : ""));
    }
    add(collection, item) { return this.request("POST", "/me/" + collection, item); }

    // Webhooks
    listWebhooks() { return this.request("GET", "/webhooks"); }
    createWebhook(url, events) { return this.request("POST", "/webhooks", { url, events: Array.isArray(events) ? events.join(",") : events }); }
    testWebhook(id) { return this.request("POST", "/webhooks/" + id, { test: true }); }

    // Workspaces
    listWorkspaces() { return this.request("GET", "/workspaces"); }
    workspaceDashboard(id) { return this.request("GET", "/workspaces/" + id); }
  }

  QRix.QRixError = QRixError;
  return QRix;
});
