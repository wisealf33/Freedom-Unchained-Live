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
const sendFoxToken = process.env.SENDFOX_TOKEN || "";
const sendFoxAppliedListId = process.env.SENDFOX_APPLIED_LIST_ID || process.env.SENDFOX_LIST_ID || "";
const membershipFeeUsd = Number.parseFloat(process.env.MEMBERSHIP_FEE_USD || "33");

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
  paymentSessions: []
};

app.use(express.json({ limit: "1mb" }));

app.get(["/admin-availability", "/admin-availability.html"], requireAdmin, async (_request, response) => {
  response.send(await renderPageWithState("admin-availability.html"));
});

app.get(["/admin-applications", "/admin-applications.html"], requireAdmin, async (_request, response) => {
  response.send(await renderPageWithState("admin-applications.html"));
});

app.get(["/admin-payments", "/admin-payments.html"], requireAdmin, async (_request, response) => {
  response.send(await renderPageWithState("admin-payments.html"));
});

app.get(["/pma-agreement", "/pma-agreement.html", "/payment", "/payment.html", "/crypto-payment", "/crypto-payment.html", "/bridge-bucks-payment", "/bridge-bucks-payment.html"], async (request, response, next) => {
  const fileName = paymentFlowFileName(request.path);
  if (!existsSync(path.join(__dirname, fileName))) {
    next();
    return;
  }
  response.send(await renderPageWithState(fileName));
});

app.use(express.static(__dirname, {
  extensions: ["html"]
}));

app.get(["/api/state", "/founders-state"], async (_request, response) => {
  response.json(await readStore());
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
  const store = await readStore();
  const application = {
    id: crypto.randomUUID(),
    firstName: request.body.firstName || "",
    lastName: request.body.lastName || "",
    email: request.body.email || "",
    submittedAt: new Date().toISOString()
  };

  const sendFoxResult = await addApplicationToSendFox(application);
  if (sendFoxResult) {
    application.sendFox = sendFoxResult;
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

  store.foundersApplications[index] = {
    ...store.foundersApplications[index],
    ...request.body,
    detailsSubmittedAt: request.body.details ? new Date().toISOString() : store.foundersApplications[index].detailsSubmittedAt
  };
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

async function renderPageWithState(fileName) {
  const html = await readFile(path.join(__dirname, fileName), "utf8");
  const state = await readStore();
  const stateScript = `<script>window.__FOUNDERS_INITIAL_STATE__ = ${JSON.stringify(state).replaceAll("<", "\\u003c")};</script>`;
  return html.replace('<script src="script.js"></script>', `${stateScript}\n    <script src="script.js"></script>`);
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

async function addApplicationToSendFox(application) {
  if (!sendFoxToken || !application.email) {
    return null;
  }

  const lists = parseSendFoxListIds(sendFoxAppliedListId);
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
