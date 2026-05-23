import express from "express";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 4173;
const dataDir = process.env.DATA_DIR || path.join(__dirname, "data");
const storePath = path.join(dataDir, "store.json");
const adminPassword = process.env.ADMIN_PASSWORD || "";

const initialStore = {
  foundersApplications: [],
  alignmentCallRequests: [],
  foundersAvailability: null,
  foundersAvailabilityVersion: 2,
  foundersDateOverrides: {}
};

app.use(express.json({ limit: "1mb" }));

app.get(["/admin-availability", "/admin-availability.html"], requireAdmin, (_request, response) => {
  response.sendFile(path.join(__dirname, "admin-availability.html"));
});

app.use(express.static(__dirname, {
  extensions: ["html"]
}));

app.get("/api/state", async (_request, response) => {
  response.json(await readStore());
});

app.post("/api/applications", async (request, response) => {
  const store = await readStore();
  const application = {
    id: crypto.randomUUID(),
    firstName: request.body.firstName || "",
    lastName: request.body.lastName || "",
    email: request.body.email || "",
    submittedAt: new Date().toISOString()
  };

  store.foundersApplications.push(application);
  await writeStore(store);
  response.status(201).json(application);
});

app.patch("/api/applications/:id", async (request, response) => {
  const store = await readStore();
  const index = store.foundersApplications.findIndex((application) => application.id === request.params.id);

  if (index === -1) {
    response.status(404).json({ error: "Application not found" });
    return;
  }

  store.foundersApplications[index] = {
    ...store.foundersApplications[index],
    ...request.body,
    detailsSubmittedAt: request.body.details ? new Date().toISOString() : store.foundersApplications[index].detailsSubmittedAt
  };
  await writeStore(store);
  response.json(store.foundersApplications[index]);
});

app.put("/api/availability", requireAdmin, async (request, response) => {
  const store = await readStore();
  store.foundersAvailability = request.body.availability || {};
  store.foundersAvailabilityVersion = 2;
  await writeStore(store);
  response.json({ ok: true });
});

app.put("/api/date-overrides/:date", requireAdmin, async (request, response) => {
  const store = await readStore();
  store.foundersDateOverrides[request.params.date] = request.body;
  await writeStore(store);
  response.json({ ok: true });
});

app.delete("/api/date-overrides/:date", requireAdmin, async (request, response) => {
  const store = await readStore();
  delete store.foundersDateOverrides[request.params.date];
  await writeStore(store);
  response.json({ ok: true });
});

app.post("/api/bookings", async (request, response) => {
  const store = await readStore();
  const booking = {
    id: crypto.randomUUID(),
    ...request.body,
    requestedAt: new Date().toISOString()
  };

  store.alignmentCallRequests.push(booking);
  await writeStore(store);
  response.status(201).json(booking);
});

app.listen(port, () => {
  console.log(`Founders' Circle running on port ${port}`);
});

async function readStore() {
  await ensureStore();
  return JSON.parse(await readFile(storePath, "utf8"));
}

async function writeStore(store) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(storePath, JSON.stringify({ ...initialStore, ...store }, null, 2));
}

async function ensureStore() {
  await mkdir(dataDir, { recursive: true });
  if (!existsSync(storePath)) {
    await writeStore(initialStore);
  }
}

function requireAdmin(request, response, next) {
  if (!adminPassword) {
    next();
    return;
  }

  const header = request.headers.authorization || "";
  const [scheme, encoded] = header.split(" ");
  const credentials = encoded ? Buffer.from(encoded, "base64").toString("utf8") : "";
  const [, password] = credentials.split(":");

  if (scheme === "Basic" && password === adminPassword) {
    next();
    return;
  }

  response.setHeader("WWW-Authenticate", 'Basic realm="Founders Circle Admin"');
  response.status(401).send("Authentication required");
}
