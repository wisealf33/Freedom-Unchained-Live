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
const sessionSecret = process.env.SESSION_SECRET || "dev-founders-circle-session-secret";
const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL || "";
const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD || "";
const appBaseUrl = process.env.APP_BASE_URL || "";
const resendApiKey = process.env.RESEND_API_KEY || "";
const resendEmailFrom = process.env.RESEND_EMAIL_FROM || process.env.EMAIL_FROM || "";
const resendEmailReplyTo = process.env.RESEND_EMAIL_REPLY_TO || process.env.EMAIL_REPLY_TO || "";
const sendFoxToken = process.env.SENDFOX_TOKEN || "";
const sendFoxAppliedListId = process.env.SENDFOX_APPLIED_LIST_ID || process.env.SENDFOX_LIST_ID || "";
const sendFoxStageListIds = {
  applied: sendFoxAppliedListId,
  "details-completed": process.env.SENDFOX_DETAILS_LIST_ID || "",
  "call-booked": process.env.SENDFOX_CALL_BOOKED_LIST_ID || "",
  approved: process.env.SENDFOX_APPROVED_LIST_ID || "",
  "pma-sent": process.env.SENDFOX_PMA_SENT_LIST_ID || "",
  payment: process.env.SENDFOX_PAYMENT_LIST_ID || "",
  member: process.env.SENDFOX_MEMBER_LIST_ID || "",
  declined: process.env.SENDFOX_DECLINED_LIST_ID || ""
};
const membershipFeeUsd = Number.parseFloat(process.env.MEMBERSHIP_FEE_USD || "33");
const defaultAllowedOrigins = [
  "https://freedomunchained.life",
  "https://www.freedomunchained.life",
  "https://founderscircle.freedomunchained.life",
  "http://localhost:4173",
  "http://localhost:5173",
  "http://localhost:5183",
  "http://localhost:5184",
  "http://localhost:5185",
  "http://localhost:5186",
  "http://localhost:5187",
  "http://localhost:5190",
  "http://localhost:5191"
];
const allowedOrigins = new Set(parseCsv(process.env.ALLOWED_ORIGINS || defaultAllowedOrigins.join(",")));

const paymentProjects = {
  "founders-circle": {
    name: "Founders' Circle",
    defaultPurpose: "Yearly membership",
    defaultAmountUsd: membershipFeeUsd,
    bridgeBucksUrl: "https://www.bridgebucksbank.com/participate?a_aid=Freedom_Unchained"
  },
  "foundation-freedom": {
    name: "Foundation Freedom",
    defaultPurpose: "Contribution",
    defaultAmountUsd: 33,
    bridgeBucksUrl: "https://www.bridgebucksbank.com/participate?a_aid=Freedom_Unchained"
  },
  "freedom-unchained": {
    name: "Freedom Unchained",
    defaultPurpose: "Support",
    defaultAmountUsd: 33,
    bridgeBucksUrl: "https://www.bridgebucksbank.com/participate?a_aid=Freedom_Unchained"
  }
};

const cryptoAssets = {
  btc: { label: "Bitcoin (BTC)", symbol: "BTC", coingeckoId: "bitcoin", addressEnv: "CRYPTO_ADDRESS_BTC", confirmations: 3 },
  eth: { label: "Ethereum (ETH)", symbol: "ETH", coingeckoId: "ethereum", addressEnv: "CRYPTO_ADDRESS_ETH", confirmations: 12 },
  usdt: { label: "Tether (USDT / TRC20)", symbol: "USDT", coingeckoId: "tether", addressEnv: "CRYPTO_ADDRESS_USDT", confirmations: 20 },
  bnb: { label: "BNB (BNB Smart Chain)", symbol: "BNB", coingeckoId: "binancecoin", addressEnv: "CRYPTO_ADDRESS_BNB", confirmations: 15 },
  xrp: { label: "XRP", symbol: "XRP", coingeckoId: "ripple", addressEnv: "CRYPTO_ADDRESS_XRP", confirmations: 1 },
  usdc: { label: "USD Coin (USDC / Ethereum)", symbol: "USDC", coingeckoId: "usd-coin", addressEnv: "CRYPTO_ADDRESS_USDC", confirmations: 12 },
  trx: { label: "TRON (TRX)", symbol: "TRX", coingeckoId: "tron", addressEnv: "CRYPTO_ADDRESS_TRX", confirmations: 20 },
  doge: { label: "Dogecoin (DOGE)", symbol: "DOGE", coingeckoId: "dogecoin", addressEnv: "CRYPTO_ADDRESS_DOGE", confirmations: 20 },
  hype: { label: "Hyperliquid (HYPE)", symbol: "HYPE", coingeckoId: "hyperliquid", addressEnv: "CRYPTO_ADDRESS_HYPE", confirmations: 20 },
  zec: { label: "Zcash (ZEC)", symbol: "ZEC", coingeckoId: "zcash", addressEnv: "CRYPTO_ADDRESS_ZEC", confirmations: 10 },
  ada: { label: "Cardano (ADA)", symbol: "ADA", coingeckoId: "cardano", addressEnv: "CRYPTO_ADDRESS_ADA", confirmations: 15 },
  bch: { label: "Bitcoin Cash (BCH)", symbol: "BCH", coingeckoId: "bitcoin-cash", addressEnv: "CRYPTO_ADDRESS_BCH", confirmations: 6 },
  xmr: { label: "Monero (XMR)", symbol: "XMR", coingeckoId: "monero", addressEnv: "CRYPTO_ADDRESS_XMR", confirmations: 10 },
  link: { label: "Chainlink (LINK / Ethereum)", symbol: "LINK", coingeckoId: "chainlink", addressEnv: "CRYPTO_ADDRESS_LINK", confirmations: 12 },
  ltc: { label: "Litecoin (LTC)", symbol: "LTC", coingeckoId: "litecoin", addressEnv: "CRYPTO_ADDRESS_LTC", confirmations: 6 },
  icp: { label: "Internet Computer (ICP)", symbol: "ICP", coingeckoId: "internet-computer", addressEnv: "CRYPTO_ADDRESS_ICP", confirmations: 12 },
  dash: { label: "Dash (DASH)", symbol: "DASH", coingeckoId: "dash", addressEnv: "CRYPTO_ADDRESS_DASH", confirmations: 6 }
};

const initialStore = {
  foundersApplications: [],
  alignmentCallRequests: [],
  foundersAvailability: null,
  foundersAvailabilityVersion: 2,
  foundersDateOverrides: {},
  paymentSessions: [],
  authUsers: [],
  authSessions: [],
  passwordResets: []
};

app.use(express.json({ limit: "1mb" }));
app.use((request, response, next) => {
  const origin = request.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  }

  if (request.method === "OPTIONS") {
    response.sendStatus(204);
    return;
  }

  next();
});

app.get("/healthz", (_request, response) => {
  response.json({
    ok: true,
    service: "founders-circle",
    timestamp: new Date().toISOString()
  });
});

await ensureInitialAdminUser();

app.get(["/admin-availability", "/admin-availability.html"], requireAdmin, async (_request, response) => {
  response.send(await renderPageWithState("admin-availability.html"));
});

app.get(["/admin-applications", "/admin-applications.html"], requireAdmin, async (_request, response) => {
  response.send(await renderPageWithState("admin-applications.html"));
});

app.get(["/admin-payments", "/admin-payments.html"], requireAdmin, async (_request, response) => {
  response.send(await renderPageWithState("admin-payments.html"));
});

app.get(["/member-dashboard", "/member-dashboard.html"], requireMember, async (request, response) => {
  response.send(await renderPageWithState("member-dashboard.html", { authUser: publicUser(request.authUser) }, false));
});

app.get(["/pma-agreement", "/pma-agreement.html", "/payment", "/payment.html", "/crypto-payment", "/crypto-payment.html", "/bridge-bucks-payment", "/bridge-bucks-payment.html"], async (request, response, next) => {
  const fileName = paymentFlowFileName(request.path);
  if (!existsSync(path.join(__dirname, fileName))) {
    next();
    return;
  }
  response.send(await renderPageWithState(fileName, {}, false));
});

app.use(express.static(__dirname, {
  extensions: ["html"]
}));

app.get(["/api/state", "/founders-state"], requireAdmin, async (_request, response) => {
  response.json(await readStore());
});

app.get(["/api/export", "/founders-export"], requireAdmin, async (_request, response) => {
  const store = await readStore();
  const exportData = migrationExportState(store);
  response.setHeader("Content-Type", "application/json");
  response.setHeader("Content-Disposition", `attachment; filename="founders-circle-export-${new Date().toISOString().slice(0, 10)}.json"`);
  response.json(exportData);
});

app.get(["/api/public-state", "/founders-public-state"], async (_request, response) => {
  const store = await readStore();
  response.json(publicStoreState(store));
});

app.get(["/api/me", "/founders-me"], async (request, response) => {
  const user = await getRequestUser(request);
  response.json({ user: publicUser(user) });
});

app.post(["/api/login", "/founders-login"], async (request, response) => {
  const email = normalizeEmail(request.body.email);
  const password = String(request.body.password || "");

  if (!email || !password) {
    response.status(400).json({ error: "Email and password are required" });
    return;
  }

  const store = await readStore();
  const user = store.authUsers.find((item) => normalizeEmail(item.email) === email);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    response.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const session = createSession(user.id);
  store.authSessions = pruneSessions(store.authSessions).concat(session.record);
  user.lastLoginAt = new Date().toISOString();
  await writeStore(store);

  response.cookie?.("founders_session", session.token, cookieOptions());
  if (!response.cookie) {
    response.setHeader("Set-Cookie", serializeCookie("founders_session", session.token, cookieOptions()));
  }
  response.json({ token: session.token, user: publicUser(user) });
});

app.post(["/api/logout", "/founders-logout"], async (request, response) => {
  const token = getSessionToken(request);
  if (token) {
    const store = await readStore();
    store.authSessions = store.authSessions.filter((session) => session.tokenHash !== hashToken(token));
    await writeStore(store);
  }
  response.setHeader("Set-Cookie", serializeCookie("founders_session", "", { ...cookieOptions(), maxAge: 0 }));
  response.json({ ok: true });
});

app.post(["/api/password-reset/request", "/founders-password-reset"], async (request, response) => {
  const email = normalizeEmail(request.body.email);
  if (!email) {
    response.status(400).json({ error: "Email is required" });
    return;
  }

  const store = await readStore();
  store.passwordResets = prunePasswordResets(store.passwordResets);
  const user = store.authUsers.find((item) => normalizeEmail(item.email) === email);
  let resetUrl = "";

  if (user) {
    const reset = createPasswordReset(user.id);
    store.passwordResets.push(reset.record);
    resetUrl = `${requestBaseUrl(request)}/reset-password.html?token=${encodeURIComponent(reset.token)}`;
    reset.record.emailDelivery = await sendPasswordResetEmail({
      to: user.email,
      resetUrl,
      resetId: reset.record.id
    });
  }

  await writeStore(store);
  response.json({
    ok: true,
    message: "If an account exists for that email, a reset link will be prepared.",
    resetUrl: process.env.NODE_ENV === "production" ? "" : resetUrl
  });
});

app.post(["/api/password-reset/confirm", "/founders-password-reset-confirm"], async (request, response) => {
  const token = String(request.body.token || "");
  const password = String(request.body.password || "");

  if (!token || password.length < 10) {
    response.status(400).json({ error: "A reset token and a password of at least 10 characters are required." });
    return;
  }

  const store = await readStore();
  store.passwordResets = prunePasswordResets(store.passwordResets);
  const tokenHash = hashToken(token);
  const reset = store.passwordResets.find((item) => item.tokenHash === tokenHash);

  if (!reset) {
    response.status(400).json({ error: "This reset link is invalid or expired." });
    return;
  }

  const user = store.authUsers.find((item) => item.id === reset.userId);
  if (!user) {
    response.status(400).json({ error: "This reset link is invalid or expired." });
    return;
  }

  user.passwordHash = hashPassword(password);
  user.passwordUpdatedAt = new Date().toISOString();
  store.passwordResets = store.passwordResets.filter((item) => item.userId !== user.id);
  store.authSessions = store.authSessions.filter((session) => session.userId !== user.id);
  await writeStore(store);
  response.json({ ok: true });
});

app.get(["/api/crypto-quote", "/crypto-quote"], async (request, response) => {
  const assetKey = String(request.query.asset || "").toLowerCase();
  const asset = cryptoAssets[assetKey];

  if (!asset) {
    response.status(400).json({ error: "Unsupported asset" });
    return;
  }

  try {
    const session = request.query.session ? await getPaymentSession(request.query.session) : null;
    const quotedAmountUsd = normalizeUsdAmount(
      session?.amountUsd || request.query.amountUsd || request.query.amount || membershipFeeUsd,
      membershipFeeUsd
    );
    const usdPrice = await getUsdPrice(asset);

    if (!usdPrice) {
      response.status(502).json({ error: "Price quote unavailable" });
      return;
    }

    const amountDue = quotedAmountUsd / usdPrice;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);

    response.json({
      asset: assetKey,
      label: asset.label,
      membershipFeeUsd: quotedAmountUsd,
      amountUsd: quotedAmountUsd,
      usdPrice,
      amountDue,
      amountDueText: formatCryptoAmount(amountDue),
      address: process.env[asset.addressEnv] || "",
      addressConfigured: Boolean(process.env[asset.addressEnv]),
      confirmationsRequired: asset.confirmations,
      quotedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    response.status(502).json({ error: "Price quote unavailable", message: error.message });
  }
});

app.get(["/api/payment-projects", "/payment-projects"], (_request, response) => {
  response.json(paymentProjects);
});

app.post(["/api/payment-sessions", "/payment-sessions"], async (request, response) => {
  const store = await readStore();
  const project = paymentProjects[request.body.project] || paymentProjects["freedom-unchained"];
  const amountUsd = normalizeUsdAmount(request.body.amountUsd || request.body.amount, project.defaultAmountUsd);
  const session = {
    id: crypto.randomUUID(),
    projectKey: request.body.project || "freedom-unchained",
    projectName: request.body.projectName || project.name,
    purpose: request.body.purpose || project.defaultPurpose,
    amountUsd,
    currency: "USD",
    referenceId: request.body.referenceId || "",
    payerName: request.body.payerName || "",
    payerEmail: request.body.payerEmail || "",
    returnUrl: request.body.returnUrl || "",
    destination: request.body.destination || request.body.project || "freedom-unchained",
    bridgeBucksUrl: request.body.bridgeBucksUrl || project.bridgeBucksUrl,
    status: "created",
    createdAt: new Date().toISOString()
  };

  store.paymentSessions.push(session);
  await writeStore(store);
  response.status(201).json(session);
});

app.get(["/api/payment-sessions/:id", "/payment-sessions/:id"], async (request, response) => {
  const session = await getPaymentSession(request.params.id);
  if (!session) {
    response.status(404).json({ error: "Payment session not found" });
    return;
  }

  response.json(session);
});

app.patch(["/api/payment-sessions/:id", "/payment-sessions/:id"], async (request, response) => {
  const store = await readStore();
  const index = store.paymentSessions.findIndex((session) => session.id === request.params.id);

  if (index === -1) {
    response.status(404).json({ error: "Payment session not found" });
    return;
  }

  store.paymentSessions[index] = {
    ...store.paymentSessions[index],
    ...request.body,
    updatedAt: new Date().toISOString()
  };
  await writeStore(store);
  response.json(store.paymentSessions[index]);
});

app.post(["/api/applications", "/founders-applications"], async (request, response) => {
  const firstName = String(request.body.firstName || "").trim();
  const lastName = String(request.body.lastName || "").trim();
  const email = normalizeEmail(request.body.email);
  const phone = normalizePhone(request.body.phone);

  if (!firstName || !lastName || !email || !phone) {
    response.status(400).json({ error: "First name, last name, email, and phone number are required." });
    return;
  }

  const store = await readStore();
  const application = {
    id: crypto.randomUUID(),
    firstName,
    lastName,
    email,
    phone,
    submittedAt: new Date().toISOString()
  };

  const sendFoxResult = await addApplicationToSendFox(application);
  if (sendFoxResult) {
    application.sendFox = sendFoxResult;
    application.sendFoxStages = {
      applied: sendFoxResult
    };
  }

  store.foundersApplications.push(application);
  await writeStore(store);
  response.status(201).json(application);
});

app.patch(["/api/applications/:id", "/founders-applications/:id"], async (request, response) => {
  const store = await readStore();
  const index = store.foundersApplications.findIndex((application) => application.id === request.params.id);

  if (index === -1) {
    response.status(404).json({ error: "Application not found" });
    return;
  }

  const updatedApplication = {
    ...store.foundersApplications[index],
    ...request.body,
    detailsSubmittedAt: request.body.details ? new Date().toISOString() : store.foundersApplications[index].detailsSubmittedAt
  };
  const stageSyncResult = await syncApplicationStageToSendFox(updatedApplication, updatedApplication.stage);
  if (stageSyncResult) {
    updatedApplication.sendFoxStages = {
      ...(updatedApplication.sendFoxStages || {}),
      [updatedApplication.stage]: stageSyncResult
    };
  }

  store.foundersApplications[index] = updatedApplication;
  await writeStore(store);
  response.json(store.foundersApplications[index]);
});

app.put(["/api/availability", "/founders-availability"], requireAdmin, async (request, response) => {
  const store = await readStore();
  store.foundersAvailability = request.body.availability || {};
  store.foundersAvailabilityVersion = 2;
  await writeStore(store);
  response.json({ ok: true });
});

app.put(["/api/date-overrides/:date", "/founders-date-overrides/:date"], requireAdmin, async (request, response) => {
  const store = await readStore();
  store.foundersDateOverrides[request.params.date] = request.body;
  await writeStore(store);
  response.json({ ok: true });
});

app.delete(["/api/date-overrides/:date", "/founders-date-overrides/:date"], requireAdmin, async (request, response) => {
  const store = await readStore();
  delete store.foundersDateOverrides[request.params.date];
  await writeStore(store);
  response.json({ ok: true });
});

app.post(["/api/bookings", "/founders-bookings"], async (request, response) => {
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
  return { ...initialStore, ...JSON.parse(await readFile(storePath, "utf8")) };
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

async function renderPageWithState(fileName, extraState = {}, includePrivateState = true) {
  const html = await readFile(path.join(__dirname, fileName), "utf8");
  const store = await readStore();
  const state = includePrivateState ? adminStoreState(store) : publicStoreState(store);
  Object.assign(state, extraState);
  const stateScript = `<script>window.__FOUNDERS_INITIAL_STATE__ = ${JSON.stringify(state).replaceAll("<", "\\u003c")};</script>`;
  return html.replace('<script src="script.js"></script>', `${stateScript}\n    <script src="script.js"></script>`);
}

function adminStoreState(store) {
  return {
    foundersApplications: store.foundersApplications,
    alignmentCallRequests: store.alignmentCallRequests,
    foundersAvailability: store.foundersAvailability,
    foundersAvailabilityVersion: store.foundersAvailabilityVersion,
    foundersDateOverrides: store.foundersDateOverrides,
    paymentSessions: store.paymentSessions,
    authUsers: store.authUsers.map(publicUser)
  };
}

function migrationExportState(store) {
  return {
    exportedAt: new Date().toISOString(),
    foundersApplications: store.foundersApplications,
    alignmentCallRequests: store.alignmentCallRequests,
    foundersAvailability: store.foundersAvailability,
    foundersAvailabilityVersion: store.foundersAvailabilityVersion,
    foundersDateOverrides: store.foundersDateOverrides,
    paymentSessions: store.paymentSessions,
    authUsers: store.authUsers.map(publicUser)
  };
}

function publicStoreState(store) {
  return {
    foundersAvailability: store.foundersAvailability,
    foundersAvailabilityVersion: store.foundersAvailabilityVersion,
    foundersDateOverrides: store.foundersDateOverrides,
    alignmentCallRequests: store.alignmentCallRequests.map((booking) => ({
      selectedDate: booking.selectedDate,
      selectedTime: booking.selectedTime,
      requestedAt: booking.requestedAt
    }))
  };
}

async function ensureInitialAdminUser() {
  if (!initialAdminEmail || !initialAdminPassword) {
    return;
  }

  const store = await readStore();
  const email = normalizeEmail(initialAdminEmail);
  const existingUser = store.authUsers.find((user) => normalizeEmail(user.email) === email);

  if (existingUser) {
    const roles = new Set([...(existingUser.roles || []), "admin", "member"]);
    existingUser.roles = [...roles];
    existingUser.updatedAt = new Date().toISOString();
  } else {
    store.authUsers.push({
      id: crypto.randomUUID(),
      email,
      roles: ["admin", "member"],
      passwordHash: hashPassword(initialAdminPassword),
      createdAt: new Date().toISOString()
    });
  }

  await writeStore(store);
}

async function requireMember(request, response, next) {
  const user = await getRequestUser(request);
  if (user?.roles?.includes("member") || user?.roles?.includes("admin")) {
    request.authUser = user;
    next();
    return;
  }

  response.redirect("member-login.html");
}

async function getRequestUser(request) {
  const token = getSessionToken(request);
  if (!token) return null;

  const store = await readStore();
  const sessions = pruneSessions(store.authSessions);
  if (sessions.length !== store.authSessions.length) {
    store.authSessions = sessions;
    await writeStore(store);
  }

  const tokenHash = hashToken(token);
  const session = sessions.find((item) => item.tokenHash === tokenHash);
  if (!session) return null;

  return store.authUsers.find((user) => user.id === session.userId) || null;
}

function createSession(userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  return {
    token,
    record: {
      id: crypto.randomUUID(),
      userId,
      tokenHash: hashToken(token),
      createdAt: new Date().toISOString(),
      expiresAt
    }
  };
}

function createPasswordReset(userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  return {
    token,
    record: {
      id: crypto.randomUUID(),
      userId,
      tokenHash: hashToken(token),
      createdAt: new Date().toISOString(),
      expiresAt
    }
  };
}

function pruneSessions(sessions = []) {
  const now = Date.now();
  return sessions.filter((session) => Date.parse(session.expiresAt || "") > now);
}

function prunePasswordResets(resets = []) {
  const now = Date.now();
  return resets.filter((reset) => Date.parse(reset.expiresAt || "") > now);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${key}`;
}

async function verifyPassword(password, passwordHash = "") {
  const [scheme, salt, key] = passwordHash.split(":");
  if (scheme !== "scrypt" || !salt || !key) return false;

  const testKey = crypto.scryptSync(password, salt, 64);
  const savedKey = Buffer.from(key, "hex");
  return savedKey.length === testKey.length && crypto.timingSafeEqual(savedKey, testKey);
}

function getSessionToken(request) {
  const header = request.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    return header.slice("Bearer ".length).trim();
  }

  return parseCookies(request.headers.cookie || "").founders_session || "";
}

function hashToken(token) {
  return crypto.createHmac("sha256", sessionSecret).update(token).digest("hex");
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    roles: user.roles || []
  };
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizePhone(phone) {
  return String(phone || "").trim();
}

function parseCookies(cookieHeader) {
  return String(cookieHeader || "")
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .reduce((cookies, cookie) => {
      const separator = cookie.indexOf("=");
      if (separator === -1) return cookies;
      const key = decodeURIComponent(cookie.slice(0, separator));
      const value = decodeURIComponent(cookie.slice(separator + 1));
      cookies[key] = value;
      return cookies;
    }, {});
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 14 * 24 * 60 * 60 * 1000
  };
}

function serializeCookie(name, value, options = {}) {
  const cookieParts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
  if (options.maxAge !== undefined) cookieParts.push(`Max-Age=${Math.floor(options.maxAge / 1000)}`);
  if (options.path) cookieParts.push(`Path=${options.path}`);
  if (options.httpOnly) cookieParts.push("HttpOnly");
  if (options.secure) cookieParts.push("Secure");
  if (options.sameSite) cookieParts.push(`SameSite=${options.sameSite}`);
  return cookieParts.join("; ");
}

function paymentFlowFileName(requestPath) {
  if (requestPath.includes("crypto-payment")) return "crypto-payment.html";
  if (requestPath.includes("bridge-bucks-payment")) return "bridge-bucks-payment.html";
  if (requestPath.includes("payment")) return "payment.html";
  return "pma-agreement.html";
}

function formatCryptoAmount(amount) {
  if (amount >= 1) return amount.toFixed(6);
  return amount.toFixed(8);
}

function normalizeUsdAmount(value, fallback) {
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount) || amount <= 0) return fallback;
  return Math.round(amount * 100) / 100;
}

async function getPaymentSession(id) {
  const store = await readStore();
  return store.paymentSessions.find((session) => session.id === id) || null;
}

async function getUsdPrice(asset) {
  const coingeckoPrice = await getCoinGeckoUsdPrice(asset).catch(() => null);
  if (coingeckoPrice) return coingeckoPrice;

  const coinbasePrice = await getCoinbaseUsdPrice(asset).catch(() => null);
  if (coinbasePrice) return coinbasePrice;

  return getCryptoCompareUsdPrice(asset).catch(() => null);
}

async function getCoinGeckoUsdPrice(asset) {
  const priceResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${asset.coingeckoId}&vs_currencies=usd`, {
    headers: { "accept": "application/json" }
  });

  if (!priceResponse.ok) return null;

  const priceData = await priceResponse.json();
  return Number(priceData?.[asset.coingeckoId]?.usd) || null;
}

async function getCoinbaseUsdPrice(asset) {
  const priceResponse = await fetch("https://api.coinbase.com/v2/exchange-rates?currency=USD", {
    headers: { "accept": "application/json" }
  });

  if (!priceResponse.ok) return null;

  const priceData = await priceResponse.json();
  const tokensPerUsd = Number(priceData?.data?.rates?.[asset.symbol]);
  return tokensPerUsd ? 1 / tokensPerUsd : null;
}

async function getCryptoCompareUsdPrice(asset) {
  const priceResponse = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${asset.symbol}&tsyms=USD`, {
    headers: { "accept": "application/json" }
  });

  if (!priceResponse.ok) return null;

  const priceData = await priceResponse.json();
  return Number(priceData?.USD) || null;
}

async function requireAdmin(request, response, next) {
  const user = await getRequestUser(request);
  if (user?.roles?.includes("admin")) {
    request.authUser = user;
    next();
    return;
  }

  const header = request.headers.authorization || "";
  const [scheme, encoded] = header.split(" ");
  const credentials = encoded ? Buffer.from(encoded, "base64").toString("utf8") : "";
  const [, password] = credentials.split(":");

  if (adminPassword && scheme === "Basic" && password === adminPassword) {
    next();
    return;
  }

  if (request.accepts("html")) {
    response.redirect("member-login.html");
    return;
  }

  response.setHeader("WWW-Authenticate", 'Basic realm="Founders Circle Admin"');
  response.status(401).send("Authentication required");
}

async function syncApplicationStageToSendFox(application, stage) {
  if (!stage || !sendFoxStageListIds[stage]) {
    return null;
  }

  return addApplicationToSendFox(application, sendFoxStageListIds[stage]);
}

async function addApplicationToSendFox(application, listIdValue = sendFoxAppliedListId) {
  if (!sendFoxToken || !application.email) {
    return null;
  }

  const lists = parseSendFoxListIds(listIdValue);
  const payload = {
    email: application.email,
    first_name: application.firstName,
    last_name: application.lastName
  };

  if (lists.length) {
    payload.lists = lists;
  }

  try {
    const response = await fetch("https://api.sendfox.com/contacts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendFoxToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const contact = await response.json();
      return {
        synced: true,
        contactId: contact.id || null,
        syncedAt: new Date().toISOString()
      };
    }

    return {
      synced: false,
      status: response.status,
      message: await response.text(),
      attemptedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      synced: false,
      message: error.message,
      attemptedAt: new Date().toISOString()
    };
  }
}

function parseSendFoxListIds(value) {
  return String(value || "")
    .split(",")
    .map((id) => Number.parseInt(id.trim(), 10))
    .filter(Number.isInteger);
}

function parseCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function sendPasswordResetEmail({ to, resetUrl, resetId }) {
  if (!resendApiKey || !resendEmailFrom) {
    return {
      sent: false,
      reason: "resend-not-configured",
      attemptedAt: new Date().toISOString()
    };
  }

  const payload = {
    from: resendEmailFrom,
    to: [to],
    subject: "Reset your Founders' Circle password",
    html: passwordResetEmailHtml(resetUrl),
    text: passwordResetEmailText(resetUrl)
  };

  if (resendEmailReplyTo) {
    payload.reply_to = resendEmailReplyTo;
  }

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `founders-password-reset-${resetId}`
      },
      body: JSON.stringify(payload)
    });

    if (resendResponse.ok) {
      const data = await resendResponse.json();
      return {
        sent: true,
        resendId: data.id || null,
        sentAt: new Date().toISOString()
      };
    }

    return {
      sent: false,
      status: resendResponse.status,
      message: await resendResponse.text(),
      attemptedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      sent: false,
      message: error.message,
      attemptedAt: new Date().toISOString()
    };
  }
}

function requestBaseUrl(request) {
  if (appBaseUrl) {
    return appBaseUrl.replace(/\/+$/, "");
  }

  const forwardedProtocol = String(request.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  const protocol = forwardedProtocol || request.protocol;
  return `${protocol}://${request.get("host")}`;
}

function passwordResetEmailHtml(resetUrl) {
  const safeResetUrl = escapeHtml(resetUrl);
  return `
    <div style="font-family: Arial, sans-serif; color: #2d2d2f; line-height: 1.5;">
      <h1 style="color: #070d66;">Reset your Founders' Circle password</h1>
      <p>Use the button below to choose a new password. This link expires in one hour.</p>
      <p>
        <a href="${safeResetUrl}" style="display: inline-block; background: #adfb72; color: #222; padding: 14px 22px; border-radius: 6px; text-decoration: none; font-weight: 700;">
          Reset password
        </a>
      </p>
      <p>If you did not request this, you can ignore this email.</p>
      <p style="font-size: 13px; color: #666;">If the button does not work, open this link: ${safeResetUrl}</p>
    </div>
  `;
}

function passwordResetEmailText(resetUrl) {
  return [
    "Reset your Founders' Circle password",
    "",
    "Use this link to choose a new password. It expires in one hour:",
    resetUrl,
    "",
    "If you did not request this, you can ignore this email."
  ].join("\n");
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
