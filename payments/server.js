import express from "express";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 5191;
const dataDir = process.env.DATA_DIR || path.join(__dirname, "data");
const storePath = path.join(dataDir, "store.json");
const appRole = process.env.PAYMENTS_ROLE || "local-dashboard";
const gatewayUrl = (process.env.PAYMENTS_GATEWAY_URL || "").replace(/\/$/, "");
const gatewayApiKey = process.env.PAYMENTS_GATEWAY_API_KEY || "";
const adminApiKey = process.env.PAYMENTS_ADMIN_API_KEY || "";

const assets = {
  btc: { label: "Bitcoin (BTC)", symbol: "BTC", coingeckoId: "bitcoin", confirmations: 3 },
  eth: { label: "Ethereum (ETH)", symbol: "ETH", coingeckoId: "ethereum", confirmations: 12 },
  usdt: { label: "Tether (USDT / TRC20)", symbol: "USDT", coingeckoId: "tether", confirmations: 20 },
  bnb: { label: "BNB (BNB Smart Chain)", symbol: "BNB", coingeckoId: "binancecoin", confirmations: 15 },
  xrp: { label: "XRP", symbol: "XRP", coingeckoId: "ripple", confirmations: 1 },
  usdc: { label: "USD Coin (USDC / Ethereum)", symbol: "USDC", coingeckoId: "usd-coin", confirmations: 12 },
  trx: { label: "TRON (TRX)", symbol: "TRX", coingeckoId: "tron", confirmations: 20 },
  doge: { label: "Dogecoin (DOGE)", symbol: "DOGE", coingeckoId: "dogecoin", confirmations: 20 },
  hype: { label: "Hyperliquid (HYPE)", symbol: "HYPE", coingeckoId: "hyperliquid", confirmations: 20 },
  zec: { label: "Zcash (ZEC)", symbol: "ZEC", coingeckoId: "zcash", confirmations: 10 },
  ada: { label: "Cardano (ADA)", symbol: "ADA", coingeckoId: "cardano", confirmations: 15 },
  bch: { label: "Bitcoin Cash (BCH)", symbol: "BCH", coingeckoId: "bitcoin-cash", confirmations: 6 },
  xmr: { label: "Monero (XMR)", symbol: "XMR", coingeckoId: "monero", confirmations: 10 },
  link: { label: "Chainlink (LINK / Ethereum)", symbol: "LINK", coingeckoId: "chainlink", confirmations: 12 },
  ltc: { label: "Litecoin (LTC)", symbol: "LTC", coingeckoId: "litecoin", confirmations: 6 },
  icp: { label: "Internet Computer (ICP)", symbol: "ICP", coingeckoId: "internet-computer", confirmations: 12 },
  dash: { label: "Dash (DASH)", symbol: "DASH", coingeckoId: "dash", confirmations: 6 }
};

const defaultBridgeBucksUrl = "https://www.bridgebucksbank.com/participate?a_aid=Freedom_Unchained";
const defaultAccounts = [
  {
    id: "founders-circle",
    name: "Founders' Circle",
    type: "PMA",
    bridgeBucksUrl: defaultBridgeBucksUrl,
    addresses: {},
    createdAt: new Date().toISOString()
  },
  {
    id: "foundation-freedom",
    name: "Foundation Freedom",
    type: "Trust / Project",
    bridgeBucksUrl: defaultBridgeBucksUrl,
    addresses: {},
    createdAt: new Date().toISOString()
  },
  {
    id: "localized",
    name: "Localized",
    type: "Project Group",
    bridgeBucksUrl: defaultBridgeBucksUrl,
    addresses: {},
    createdAt: new Date().toISOString()
  },
  {
    id: "pawpaw-revival",
    parentId: "localized",
    name: "Pawpaw Revival",
    type: "Localized Fundraiser",
    bridgeBucksUrl: defaultBridgeBucksUrl,
    addresses: {},
    createdAt: new Date().toISOString()
  },
  {
    id: "freedom-unchained",
    name: "Freedom Unchained",
    type: "Mission / Project",
    bridgeBucksUrl: defaultBridgeBucksUrl,
    addresses: {},
    createdAt: new Date().toISOString()
  },
  {
    id: "mystery-school",
    name: "Mystery School",
    type: "Project",
    bridgeBucksUrl: defaultBridgeBucksUrl,
    addresses: {},
    createdAt: new Date().toISOString()
  },
  {
    id: "bitcoin-game-show",
    name: "Bitcoin Game Show",
    type: "Project",
    bridgeBucksUrl: defaultBridgeBucksUrl,
    addresses: {},
    createdAt: new Date().toISOString()
  }
];

const initialStore = {
  accounts: defaultAccounts,
  sessions: []
};

app.use(express.json({ limit: "1mb" }));

app.get(["/", "/index.html"], (request, response, next) => {
  if (appRole !== "gateway") {
    next();
    return;
  }

  response.type("html").send(`
    <!doctype html>
    <html lang="en">
      <head><meta charset="utf-8"><title>Freedom Payments Gateway</title></head>
      <body>
        <h1>Freedom Payments Gateway</h1>
        <p>The public payment gateway is online. Checkout links are created from the private local dashboard.</p>
      </body>
    </html>
  `);
});

app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

app.get("/api/state", requirePrivateAccess, async (_request, response) => {
  if (gatewayUrl) return proxyJson(response, "/api/state");
  response.json(await readStore());
});

app.get("/api/assets", (_request, response) => {
  response.json(assets);
});

app.post("/api/accounts", requirePrivateAccess, async (request, response) => {
  if (gatewayUrl) return proxyJson(response, "/api/accounts", {
    method: "POST",
    body: request.body
  });

  const store = await readStore();
  const account = {
    id: slugify(request.body.id || request.body.name || crypto.randomUUID()),
    name: request.body.name || "New Payment Account",
    type: request.body.type || "Project",
    parentId: request.body.parentId || "",
    bridgeBucksUrl: request.body.bridgeBucksUrl || "",
    addresses: request.body.addresses || {},
    createdAt: new Date().toISOString()
  };

  store.accounts.push(account);
  await writeStore(store);
  response.status(201).json(account);
});

app.patch("/api/accounts/:id", requirePrivateAccess, async (request, response) => {
  if (gatewayUrl) return proxyJson(response, `/api/accounts/${encodeURIComponent(request.params.id)}`, {
    method: "PATCH",
    body: request.body
  });

  const store = await readStore();
  const index = store.accounts.findIndex((account) => account.id === request.params.id);
  if (index === -1) return response.status(404).json({ error: "Account not found" });

  store.accounts[index] = {
    ...store.accounts[index],
    ...request.body,
    addresses: request.body.addresses || store.accounts[index].addresses || {},
    updatedAt: new Date().toISOString()
  };
  await writeStore(store);
  response.json(store.accounts[index]);
});

app.post("/api/sessions", requirePrivateAccess, async (request, response) => {
  if (gatewayUrl) return proxyJson(response, "/api/sessions", {
    method: "POST",
    body: request.body
  });

  const store = await readStore();
  const account = store.accounts.find((item) => item.id === request.body.accountId) || store.accounts[0];
  const session = {
    id: crypto.randomUUID(),
    accountId: account.id,
    accountName: account.name,
    bridgeBucksUrl: account.bridgeBucksUrl || "",
    purpose: request.body.purpose || "Payment",
    amountUsd: normalizeUsdAmount(request.body.amountUsd || request.body.amount, 33),
    referenceId: request.body.referenceId || "",
    payerName: request.body.payerName || "",
    payerEmail: request.body.payerEmail || "",
    status: "created",
    createdAt: new Date().toISOString()
  };

  store.sessions.push(session);
  await writeStore(store);
  response.status(201).json(session);
});

app.get("/api/sessions/:id", async (request, response) => {
  if (gatewayUrl) return proxyJson(response, `/api/sessions/${encodeURIComponent(request.params.id)}`, {
    useGatewayKey: false
  });

  const session = (await readStore()).sessions.find((item) => item.id === request.params.id);
  if (!session) return response.status(404).json({ error: "Session not found" });
  response.json(publicSession(session));
});

app.patch("/api/sessions/:id", async (request, response) => {
  if (gatewayUrl) return proxyJson(response, `/api/sessions/${encodeURIComponent(request.params.id)}`, {
    method: "PATCH",
    body: sanitizePaymentPatch(request.body),
    useGatewayKey: false
  });

  const store = await readStore();
  const index = store.sessions.findIndex((session) => session.id === request.params.id);
  if (index === -1) return response.status(404).json({ error: "Session not found" });

  store.sessions[index] = {
    ...store.sessions[index],
    ...sanitizePaymentPatch(request.body),
    updatedAt: new Date().toISOString()
  };
  await writeStore(store);
  response.json(publicSession(store.sessions[index]));
});

app.get("/api/quote", async (request, response) => {
  if (gatewayUrl) return proxyJson(response, `/api/quote?${new URLSearchParams(request.query).toString()}`, {
    useGatewayKey: false
  });

  const assetKey = String(request.query.asset || "").toLowerCase();
  const asset = assets[assetKey];
  if (!asset) return response.status(400).json({ error: "Unsupported asset" });

  const store = await readStore();
  const session = store.sessions.find((item) => item.id === request.query.session);
  const account = store.accounts.find((item) => item.id === session?.accountId);
  const amountUsd = normalizeUsdAmount(session?.amountUsd || request.query.amountUsd, 33);
  const usdPrice = await getUsdPrice(asset);
  if (!usdPrice) return response.status(502).json({ error: "Price quote unavailable" });

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
  const amountDue = amountUsd / usdPrice;

  response.json({
    asset: assetKey,
    label: asset.label,
    amountUsd,
    usdPrice,
    amountDue,
    amountDueText: formatCryptoAmount(amountDue),
    address: account?.addresses?.[assetKey] || "",
    addressConfigured: Boolean(account?.addresses?.[assetKey]),
    confirmationsRequired: asset.confirmations,
    quotedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  });
});

app.listen(port, () => {
  console.log(`Freedom Payments running on port ${port}`);
});

async function readStore() {
  await ensureStore();
  return normalizeStore({ ...initialStore, ...JSON.parse(await readFile(storePath, "utf8")) });
}

async function writeStore(store) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(storePath, JSON.stringify(normalizeStore({ ...initialStore, ...store }), null, 2));
}

async function ensureStore() {
  await mkdir(dataDir, { recursive: true });
  if (!existsSync(storePath)) await writeStore(initialStore);
}

function normalizeUsdAmount(value, fallback) {
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount) || amount <= 0) return fallback;
  return Math.round(amount * 100) / 100;
}

function normalizeStore(store) {
  const existingAccounts = store.accounts || [];
  const accountsById = new Map(defaultAccounts.map((account) => [account.id, account]));
  existingAccounts.forEach((account) => {
    accountsById.set(account.id, {
      ...accountsById.get(account.id),
      ...account,
      addresses: account.addresses || {}
    });
  });

  return {
    ...initialStore,
    ...store,
    accounts: [...accountsById.values()],
    sessions: store.sessions || []
  };
}

function formatCryptoAmount(amount) {
  if (amount >= 1) return amount.toFixed(6);
  return amount.toFixed(8);
}

function slugify(value) {
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function requirePrivateAccess(request, response, next) {
  if (gatewayUrl || appRole === "local-dashboard") {
    if (isLocalRequest(request)) return next();
  }

  const providedKey = request.headers["x-payments-admin-key"] || request.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (adminApiKey && providedKey === adminApiKey) return next();

  response.status(401).json({ error: "Private payment dashboard access required" });
}

function publicSession(session) {
  return {
    id: session.id,
    accountId: session.accountId,
    accountName: session.accountName,
    bridgeBucksUrl: session.bridgeBucksUrl || "",
    purpose: session.purpose,
    amountUsd: session.amountUsd,
    referenceId: session.referenceId || "",
    status: session.status,
    payment: session.payment ? {
      method: session.payment.method,
      asset: session.payment.asset,
      amount: session.payment.amount,
      verificationStatus: session.payment.verificationStatus,
      confirmationsRequired: session.payment.confirmationsRequired,
      submittedAt: session.payment.submittedAt
    } : null
  };
}

function sanitizePaymentPatch(body) {
  const payment = body.payment && typeof body.payment === "object" ? body.payment : null;
  return {
    status: body.status === "payment-submitted" ? "payment-submitted" : "created",
    payment: payment ? {
      method: payment.method || "",
      asset: payment.asset || "",
      amount: payment.amount || "",
      quote: payment.quote || null,
      transactionHash: payment.transactionHash || "",
      bridgeReference: payment.bridgeReference || "",
      verificationStatus: payment.verificationStatus || "confirmation-needed",
      confirmationsRequired: payment.confirmationsRequired || null,
      submittedAt: payment.submittedAt || new Date().toISOString()
    } : undefined
  };
}

function isLocalRequest(request) {
  const ip = request.ip || request.socket?.remoteAddress || "";
  return ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(ip) || ip.startsWith("::ffff:127.");
}

async function proxyJson(response, apiPath, options = {}) {
  if (!gatewayUrl) {
    response.status(500).json({ error: "Gateway URL is not configured" });
    return;
  }

  const headers = { "accept": "application/json" };
  const useGatewayKey = options.useGatewayKey !== false;
  if (useGatewayKey && gatewayApiKey) headers["x-payments-admin-key"] = gatewayApiKey;
  if (options.body) headers["content-type"] = "application/json";

  const gatewayResponse = await fetch(`${gatewayUrl}${apiPath}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const body = await gatewayResponse.text();

  response.status(gatewayResponse.status);
  response.type(gatewayResponse.headers.get("content-type") || "application/json");
  response.send(body);
}

async function getUsdPrice(asset) {
  return await getCoinGeckoUsdPrice(asset).catch(() => null)
    || await getCoinbaseUsdPrice(asset).catch(() => null)
    || await getCryptoCompareUsdPrice(asset).catch(() => null);
}

async function getCoinGeckoUsdPrice(asset) {
  const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${asset.coingeckoId}&vs_currencies=usd`);
  if (!response.ok) return null;
  const data = await response.json();
  return Number(data?.[asset.coingeckoId]?.usd) || null;
}

async function getCoinbaseUsdPrice(asset) {
  const response = await fetch("https://api.coinbase.com/v2/exchange-rates?currency=USD");
  if (!response.ok) return null;
  const data = await response.json();
  const tokensPerUsd = Number(data?.data?.rates?.[asset.symbol]);
  return tokensPerUsd ? 1 / tokensPerUsd : null;
}

async function getCryptoCompareUsdPrice(asset) {
  const response = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${asset.symbol}&tsyms=USD`);
  if (!response.ok) return null;
  const data = await response.json();
  return Number(data?.USD) || null;
}
