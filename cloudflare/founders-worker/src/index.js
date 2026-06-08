import crypto from "node:crypto";

const publicPages = new Set([
  "/member-login.html",
  "/forgot-password.html",
  "/reset-password.html",
  "/pma-agreement.html",
  "/payment.html",
  "/crypto-payment.html",
  "/bridge-bucks-payment.html"
]);

const adminPages = new Set([
  "/admin-applications.html",
  "/admin-availability.html",
  "/admin-payments.html"
]);

const memberPages = new Set([
  "/member-dashboard.html"
]);

const assetPaths = new Set([
  "/script.js",
  "/styles.css"
]);

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

const paymentProjects = {
  "founders-circle": {
    name: "Founders' Circle",
    defaultPurpose: "Yearly membership",
    defaultAmountUsd: 33,
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

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const path = normalizePath(url.pathname);

      if (request.method === "OPTIONS") {
        return corsResponse(null, env, request, { status: 204 });
      }

      if (assetPaths.has(path)) {
        return fetchOriginAsset(path, request, env);
      }

      if (path === "/healthz") {
        return json({ ok: true, service: "founders-circle-worker", timestamp: new Date().toISOString() }, env, request);
      }

      if (path === "/founders-public-state" || path === "/api/public-state") {
        const store = await readStore(env);
        return json(publicStoreState(store), env, request);
      }

      if (path === "/founders-state" || path === "/api/state") {
        const admin = await requireAdmin(request, env);
        if (!admin.ok) return admin.response;
        const store = await readStore(env);
        return json(adminStoreState(store), env, request);
      }

      if (path === "/founders-export" || path === "/api/export") {
        const admin = await requireAdmin(request, env);
        if (!admin.ok) return admin.response;
        const store = await readStore(env);
        return json(migrationExportState(store), env, request);
      }

      if (path === "/founders-me" || path === "/api/me") {
        const user = await getRequestUser(request, env);
        return json({ user: publicUser(user) }, env, request);
      }

      if (path === "/founders-login" || path === "/api/login") {
        return handleLogin(request, env);
      }

      if (path === "/founders-logout" || path === "/api/logout") {
        return handleLogout(request, env);
      }

      if (path === "/founders-password-reset" || path === "/api/password-reset/request") {
        return handlePasswordResetRequest(request, env);
      }

      if (path === "/founders-password-reset-confirm" || path === "/api/password-reset/confirm") {
        return handlePasswordResetConfirm(request, env);
      }

      if ((path === "/founders-applications" || path === "/api/applications") && request.method === "POST") {
        return handleCreateApplication(request, env);
      }

      const applicationMatch = path.match(/^\/(?:founders-applications|api\/applications)\/([^/]+)$/);
      if (applicationMatch && request.method === "PATCH") {
        return handleUpdateApplication(request, env, applicationMatch[1]);
      }

      if (path === "/founders-bookings" || path === "/api/bookings") {
        if (request.method === "POST") return handleCreateBooking(request, env);
      }

      if (path === "/founders-availability" || path === "/api/availability") {
        const admin = await requireAdmin(request, env);
        if (!admin.ok) return admin.response;
        if (request.method === "PUT") return handleSaveAvailability(request, env);
      }

      const overrideMatch = path.match(/^\/(?:founders-date-overrides|api\/date-overrides)\/([^/]+)$/);
      if (overrideMatch) {
        const admin = await requireAdmin(request, env);
        if (!admin.ok) return admin.response;
        if (request.method === "PUT") return handleSaveDateOverride(request, env, overrideMatch[1]);
        if (request.method === "DELETE") return handleDeleteDateOverride(request, env, overrideMatch[1]);
      }

      if (path === "/payment-projects" || path === "/api/payment-projects") {
        return json(paymentProjects, env, request);
      }

      if (path === "/crypto-quote" || path === "/api/crypto-quote") {
        return handleCryptoQuote(request, env);
      }

      if (path === "/payment-sessions" || path === "/api/payment-sessions") {
        if (request.method === "POST") return handleCreatePaymentSession(request, env);
      }

      const paymentMatch = path.match(/^\/(?:payment-sessions|api\/payment-sessions)\/([^/]+)$/);
      if (paymentMatch) {
        if (request.method === "GET") return handleGetPaymentSession(request, env, paymentMatch[1]);
        if (request.method === "PATCH") return handleUpdatePaymentSession(request, env, paymentMatch[1]);
      }

      if (adminPages.has(path)) {
        const admin = await requireAdmin(request, env, true);
        if (!admin.ok) return admin.response;
        const store = await readStore(env);
        return renderPage(path, env, adminStoreState(store));
      }

      if (memberPages.has(path)) {
        const member = await requireMember(request, env, true);
        if (!member.ok) return member.response;
        const store = await readStore(env);
        return renderPage(path, env, { ...publicStoreState(store), authUser: publicUser(member.user) });
      }

      if (publicPages.has(path)) {
        return renderPage(path, env, {});
      }

      return json({ error: "Not found" }, env, request, { status: 404 });
    } catch (error) {
      return json({ error: "Worker error", message: error.message }, env, request, { status: 500 });
    }
  }
};

function normalizePath(pathname) {
  const path = pathname.replace(/^\/api\/founders/, "") || "/";
  if (path === "/admin-applications") return "/admin-applications.html";
  if (path === "/admin-availability") return "/admin-availability.html";
  if (path === "/admin-payments") return "/admin-payments.html";
  if (path === "/member-login") return "/member-login.html";
  if (path === "/forgot-password") return "/forgot-password.html";
  if (path === "/reset-password") return "/reset-password.html";
  if (path === "/member-dashboard") return "/member-dashboard.html";
  return path;
}

async function renderPage(path, env, state = {}) {
  const originBaseUrl = String(env.ORIGIN_BASE_URL || "https://freedomunchained.life/projects/founders-circle").replace(/\/+$/, "");
  const pageResponse = await fetch(`${originBaseUrl}${path}`, { cf: { cacheTtl: 60 } });
  if (!pageResponse.ok) return new Response("Page not found", { status: 404 });

  let html = await pageResponse.text();
  const stateScript = `<script>window.__FOUNDERS_BACKEND_URL__ = "/api/founders"; window.__FOUNDERS_INITIAL_STATE__ = ${JSON.stringify(state).replaceAll("<", "\\u003c")};</script>`;
  if (html.includes("if (!window.__FOUNDERS_INITIAL_STATE__")) {
    html = html.replace(/(\s*<script>\s*if \(!window\.__FOUNDERS_INITIAL_STATE__)/, `\n    ${stateScript}$1`);
  } else {
    html = html.replace(/<script src="script\.js[^"]*"><\/script>/, `${stateScript}\n    <script src="script.js?v=timezone-select-1"></script>`);
  }
  html = html.replace(/<script src="script\.js[^"]*"><\/script>/, '<script src="script.js?v=timezone-select-1"></script>');
  return htmlResponse(html);
}

async function fetchOriginAsset(path, request, env) {
  const originBaseUrl = String(env.ORIGIN_BASE_URL || "https://freedomunchained.life/projects/founders-circle").replace(/\/+$/, "");
  const url = new URL(request.url);
  const assetResponse = await fetch(`${originBaseUrl}${path}${url.search}`, { cf: { cacheTtl: 0, cacheEverything: false } });
  return new Response(assetResponse.body, assetResponse);
}

async function handleCreateApplication(request, env) {
  const body = await request.json().catch(() => ({}));
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const email = normalizeEmail(body.email);
  const phone = normalizePhone(body.phone);

  if (!firstName || !lastName || !email || !phone) {
    return json({ error: "First name, last name, email, and phone number are required." }, env, request, { status: 400 });
  }

  const application = {
    id: crypto.randomUUID(),
    firstName,
    lastName,
    email,
    phone,
    submittedAt: new Date().toISOString()
  };

  const sendFoxResult = await addApplicationToSendFox(application, env);
  if (sendFoxResult) {
    application.sendFox = sendFoxResult;
    application.sendFoxStages = { applied: sendFoxResult };
  }

  await supabaseUpsert(env, "founders_applications", [applicationToRow(application)], "id");
  return json(application, env, request, { status: 201 });
}

async function handleUpdateApplication(request, env, id) {
  const existingRows = await supabaseSelect(env, "founders_applications", new URLSearchParams({ id: `eq.${id}`, select: "*" }));
  if (!existingRows.length) return json({ error: "Application not found" }, env, request, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const existing = applicationFromRow(existingRows[0]);
  const updated = {
    ...existing,
    ...body,
    detailsSubmittedAt: body.details ? new Date().toISOString() : existing.detailsSubmittedAt
  };

  const stageSyncResult = await syncApplicationStageToSendFox(updated, updated.stage, env);
  if (stageSyncResult) {
    updated.sendFoxStages = { ...(updated.sendFoxStages || {}), [updated.stage]: stageSyncResult };
  }

  await supabaseUpsert(env, "founders_applications", [applicationToRow(updated)], "id");
  return json(updated, env, request);
}

async function handleCreateBooking(request, env) {
  const body = await request.json().catch(() => ({}));
  const booking = {
    id: crypto.randomUUID(),
    ...body,
    requestedAt: new Date().toISOString()
  };
  await supabaseUpsert(env, "founders_bookings", [bookingToRow(booking)], "id");
  return json(booking, env, request, { status: 201 });
}

async function handleSaveAvailability(request, env) {
  const body = await request.json().catch(() => ({}));
  await supabaseUpsert(env, "founders_availability", [{
    id: "default",
    availability: body.availability || {},
    version: 2,
    updated_at: new Date().toISOString()
  }], "id");
  return json({ ok: true }, env, request);
}

async function handleSaveDateOverride(request, env, dateKey) {
  const body = await request.json().catch(() => ({}));
  await supabaseUpsert(env, "founders_date_overrides", [{
    date_key: dateKey,
    override: body,
    updated_at: new Date().toISOString()
  }], "date_key");
  return json({ ok: true }, env, request);
}

async function handleDeleteDateOverride(request, env, dateKey) {
  await supabaseDelete(env, "founders_date_overrides", "date_key", dateKey);
  return json({ ok: true }, env, request);
}

async function handleLogin(request, env) {
  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");

  if (!email || !password) {
    return json({ error: "Email and password are required" }, env, request, { status: 400 });
  }

  const users = await supabaseSelect(env, "founders_auth_users", new URLSearchParams({ email: `eq.${email}`, select: "*" }));
  const user = users.map(authUserFromRow)[0] || null;
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return json({ error: "Invalid email or password" }, env, request, { status: 401 });
  }

  const session = createSession(user.id, env);
  await supabaseUpsert(env, "founders_auth_sessions", [authSessionToRow(session.record)], "id");
  await supabaseUpsert(env, "founders_auth_users", [authUserToRow({ ...user, lastLoginAt: new Date().toISOString() })], "id");

  return json({ token: session.token, user: publicUser(user) }, env, request, {
    headers: { "Set-Cookie": serializeCookie("founders_session", session.token, cookieOptions()) }
  });
}

async function handleLogout(request, env) {
  const token = getSessionToken(request);
  if (token) {
    await supabaseDelete(env, "founders_auth_sessions", "token_hash", hashToken(token, env));
  }
  return json({ ok: true }, env, request, {
    headers: { "Set-Cookie": serializeCookie("founders_session", "", { ...cookieOptions(), maxAge: 0 }) }
  });
}

async function handlePasswordResetRequest(request, env) {
  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(body.email);
  if (!email) return json({ error: "Email is required" }, env, request, { status: 400 });

  const users = await supabaseSelect(env, "founders_auth_users", new URLSearchParams({ email: `eq.${email}`, select: "*" }));
  const user = users.map(authUserFromRow)[0] || null;
  let resetUrl = "";

  if (user) {
    const reset = createPasswordReset(user.id, env);
    resetUrl = `${requestBaseUrl(request, env)}/reset-password.html?token=${encodeURIComponent(reset.token)}`;
    reset.record.emailDelivery = await sendPasswordResetEmail({ to: user.email, resetUrl, resetId: reset.record.id }, env);
    await supabaseUpsert(env, "founders_password_resets", [passwordResetToRow(reset.record)], "id");
  }

  return json({
    ok: true,
    message: "If an account exists for that email, a reset link will be prepared.",
    resetUrl: env.NODE_ENV === "production" ? "" : resetUrl
  }, env, request);
}

async function handlePasswordResetConfirm(request, env) {
  const body = await request.json().catch(() => ({}));
  const token = String(body.token || "");
  const password = String(body.password || "");

  if (!token || password.length < 10) {
    return json({ error: "A reset token and a password of at least 10 characters are required." }, env, request, { status: 400 });
  }

  const rows = await supabaseSelect(env, "founders_password_resets", new URLSearchParams({ token_hash: `eq.${hashToken(token, env)}`, select: "*" }));
  const reset = rows.map(passwordResetFromRow)[0] || null;
  if (!reset || Date.parse(reset.expiresAt || "") <= Date.now()) {
    return json({ error: "This reset link is invalid or expired." }, env, request, { status: 400 });
  }

  const users = await supabaseSelect(env, "founders_auth_users", new URLSearchParams({ id: `eq.${reset.userId}`, select: "*" }));
  const user = users.map(authUserFromRow)[0] || null;
  if (!user) return json({ error: "This reset link is invalid or expired." }, env, request, { status: 400 });

  await supabaseUpsert(env, "founders_auth_users", [authUserToRow({
    ...user,
    passwordHash: hashPassword(password),
    passwordUpdatedAt: new Date().toISOString()
  })], "id");
  await supabaseDelete(env, "founders_password_resets", "user_id", user.id);
  await supabaseDelete(env, "founders_auth_sessions", "user_id", user.id);
  return json({ ok: true }, env, request);
}

async function handleCreatePaymentSession(request, env) {
  const body = await request.json().catch(() => ({}));
  const project = paymentProjects[body.project] || paymentProjects["freedom-unchained"];
  const amountUsd = normalizeUsdAmount(body.amountUsd || body.amount, project.defaultAmountUsd);
  const session = {
    id: crypto.randomUUID(),
    projectKey: body.project || "freedom-unchained",
    projectName: body.projectName || project.name,
    purpose: body.purpose || project.defaultPurpose,
    amountUsd,
    currency: "USD",
    referenceId: body.referenceId || "",
    payerName: body.payerName || "",
    payerEmail: body.payerEmail || "",
    returnUrl: body.returnUrl || "",
    destination: body.destination || body.project || "freedom-unchained",
    bridgeBucksUrl: body.bridgeBucksUrl || project.bridgeBucksUrl,
    status: "created",
    createdAt: new Date().toISOString()
  };
  await supabaseUpsert(env, "founders_payment_sessions", [paymentSessionToRow(session)], "id");
  return json(session, env, request, { status: 201 });
}

async function handleGetPaymentSession(request, env, id) {
  const rows = await supabaseSelect(env, "founders_payment_sessions", new URLSearchParams({ id: `eq.${id}`, select: "*" }));
  const session = rows.map(paymentSessionFromRow)[0] || null;
  if (!session) return json({ error: "Payment session not found" }, env, request, { status: 404 });
  return json(session, env, request);
}

async function handleUpdatePaymentSession(request, env, id) {
  const rows = await supabaseSelect(env, "founders_payment_sessions", new URLSearchParams({ id: `eq.${id}`, select: "*" }));
  const existing = rows.map(paymentSessionFromRow)[0] || null;
  if (!existing) return json({ error: "Payment session not found" }, env, request, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
  await supabaseUpsert(env, "founders_payment_sessions", [paymentSessionToRow(updated)], "id");
  return json(updated, env, request);
}

async function handleCryptoQuote(request, env) {
  const url = new URL(request.url);
  const assetKey = String(url.searchParams.get("asset") || "").toLowerCase();
  const asset = cryptoAssets[assetKey];
  if (!asset) return json({ error: "Unsupported asset" }, env, request, { status: 400 });

  const amountUsd = normalizeUsdAmount(url.searchParams.get("amountUsd") || url.searchParams.get("amount"), 33);
  const usdPrice = await getUsdPrice(asset);
  if (!usdPrice) return json({ error: "Price quote unavailable" }, env, request, { status: 502 });

  const amountDue = amountUsd / usdPrice;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
  const address = env[asset.addressEnv] || "";

  return json({
    asset: assetKey,
    label: asset.label,
    membershipFeeUsd: amountUsd,
    amountUsd,
    usdPrice,
    amountDue,
    amountDueText: formatCryptoAmount(amountDue),
    address,
    addressConfigured: Boolean(address),
    confirmationsRequired: asset.confirmations,
    quotedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  }, env, request);
}

async function readStore(env) {
  const [
    applications,
    bookings,
    availabilityRows,
    overrideRows,
    paymentSessions,
    authUsers,
    authSessions,
    passwordResets
  ] = await Promise.all([
    supabaseSelect(env, "founders_applications", new URLSearchParams({ select: "*", order: "submitted_at.desc" })),
    supabaseSelect(env, "founders_bookings", new URLSearchParams({ select: "*", order: "requested_at.desc" })),
    supabaseSelect(env, "founders_availability"),
    supabaseSelect(env, "founders_date_overrides", new URLSearchParams({ select: "*", order: "date_key.asc" })),
    supabaseSelect(env, "founders_payment_sessions", new URLSearchParams({ select: "*", order: "created_at.desc" })),
    supabaseSelect(env, "founders_auth_users", new URLSearchParams({ select: "*", order: "created_at.asc" })),
    supabaseSelect(env, "founders_auth_sessions", new URLSearchParams({ select: "*", order: "created_at.asc" })),
    supabaseSelect(env, "founders_password_resets", new URLSearchParams({ select: "*", order: "created_at.asc" }))
  ]);

  const availabilityRow = availabilityRows.find((row) => row.id === "default") || availabilityRows[0] || null;
  return {
    ...initialStore,
    foundersApplications: applications.map(applicationFromRow),
    alignmentCallRequests: bookings.map(bookingFromRow),
    foundersAvailability: availabilityRow?.availability || null,
    foundersAvailabilityVersion: availabilityRow?.version || 2,
    foundersDateOverrides: overrideRows.reduce((overrides, row) => {
      overrides[row.date_key] = row.override || {};
      return overrides;
    }, {}),
    paymentSessions: paymentSessions.map(paymentSessionFromRow),
    authUsers: authUsers.map(authUserFromRow),
    authSessions: authSessions.map(authSessionFromRow),
    passwordResets: passwordResets.map(passwordResetFromRow)
  };
}

async function supabaseSelect(env, tableName, query = new URLSearchParams({ select: "*" })) {
  return supabaseRequest(env, tableName, { query });
}

async function supabaseUpsert(env, tableName, rows, conflictColumn) {
  return supabaseRequest(env, tableName, {
    method: "POST",
    query: new URLSearchParams({ on_conflict: conflictColumn }),
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: rows
  });
}

async function supabaseDelete(env, tableName, column, value) {
  const query = new URLSearchParams();
  query.set(column, `eq.${value}`);
  return supabaseRequest(env, tableName, {
    method: "DELETE",
    query,
    headers: { Prefer: "return=minimal" }
  });
}

async function supabaseRequest(env, tableName, options = {}) {
  const baseUrl = requiredEnv(env, "SUPABASE_PROJECT_URL").replace(/\/+$/, "");
  const serviceRoleKey = requiredEnv(env, "SUPABASE_SERVICE_ROLE_KEY");
  const query = options.query ? `?${options.query.toString()}` : "";
  const response = await fetch(`${baseUrl}/rest/v1/${tableName}${query}`, {
    method: options.method || "GET",
    headers: {
      "apikey": serviceRoleKey,
      "Authorization": `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  if (!response.ok) throw new Error(`Supabase ${tableName} ${response.status}: ${await response.text()}`);
  if (response.status === 204) return [];
  const text = await response.text();
  return text ? JSON.parse(text) : [];
}

async function requireAdmin(request, env, html = false) {
  const user = await getRequestUser(request, env);
  if (user?.roles?.includes("admin")) return { ok: true, user };
  return { ok: false, response: html ? redirect("member-login.html") : new Response("Authentication required", { status: 401 }) };
}

async function requireMember(request, env, html = false) {
  const user = await getRequestUser(request, env);
  if (user?.roles?.includes("member") || user?.roles?.includes("admin")) return { ok: true, user };
  return { ok: false, response: html ? redirect("member-login.html") : new Response("Authentication required", { status: 401 }) };
}

async function getRequestUser(request, env) {
  const token = getSessionToken(request);
  if (!token) return null;

  const rows = await supabaseSelect(env, "founders_auth_sessions", new URLSearchParams({
    token_hash: `eq.${hashToken(token, env)}`,
    select: "*"
  }));
  const session = rows.map(authSessionFromRow)[0] || null;
  if (!session || Date.parse(session.expiresAt || "") <= Date.now()) return null;

  const users = await supabaseSelect(env, "founders_auth_users", new URLSearchParams({
    id: `eq.${session.userId}`,
    select: "*"
  }));
  return users.map(authUserFromRow)[0] || null;
}

function createSession(userId, env) {
  const token = crypto.randomBytes(32).toString("base64url");
  return {
    token,
    record: {
      id: crypto.randomUUID(),
      userId,
      tokenHash: hashToken(token, env),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    }
  };
}

function createPasswordReset(userId, env) {
  const token = crypto.randomBytes(32).toString("base64url");
  return {
    token,
    record: {
      id: crypto.randomUUID(),
      userId,
      tokenHash: hashToken(token, env),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    }
  };
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
  const header = request.headers.get("authorization") || "";
  if (header.startsWith("Bearer ")) return header.slice("Bearer ".length).trim();
  return parseCookies(request.headers.get("cookie") || "").founders_session || "";
}

function hashToken(token, env) {
  return crypto.createHmac("sha256", requiredEnv(env, "SESSION_SECRET")).update(token).digest("hex");
}

function cookieOptions() {
  return { httpOnly: true, sameSite: "Lax", secure: true, path: "/", maxAge: 14 * 24 * 60 * 60 * 1000 };
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

function parseCookies(cookieHeader) {
  return String(cookieHeader || "")
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .reduce((cookies, cookie) => {
      const separator = cookie.indexOf("=");
      if (separator === -1) return cookies;
      cookies[decodeURIComponent(cookie.slice(0, separator))] = decodeURIComponent(cookie.slice(separator + 1));
      return cookies;
    }, {});
}

function applicationToRow(application) {
  const sendfox = {};
  if (application.sendFox) sendfox.initial = application.sendFox;
  if (application.sendFoxStages) sendfox.stages = application.sendFoxStages;
  return {
    id: application.id,
    first_name: application.firstName || "",
    last_name: application.lastName || "",
    email: application.email || "",
    phone: application.phone || "",
    stage: application.stage || "applied",
    details: application.details || {},
    pma: application.pma || {},
    payment: application.payment || {},
    sendfox,
    submitted_at: application.submittedAt || application.createdAt || new Date().toISOString(),
    details_submitted_at: application.detailsSubmittedAt || null,
    latest_booking_id: application.latestBookingId || null,
    latest_booking_at: application.latestBookingAt || null,
    stage_updated_at: application.stageUpdatedAt || null,
    created_at: application.createdAt || application.submittedAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function applicationFromRow(row) {
  const sendfox = row.sendfox || {};
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    stage: row.stage,
    details: row.details || {},
    pma: row.pma || {},
    payment: row.payment || {},
    sendFox: sendfox.initial || null,
    sendFoxStages: sendfox.stages || {},
    submittedAt: row.submitted_at,
    detailsSubmittedAt: row.details_submitted_at,
    latestBookingId: row.latest_booking_id,
    latestBookingAt: row.latest_booking_at,
    stageUpdatedAt: row.stage_updated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function bookingToRow(booking) {
  const timeZone = bookingTimeZonePayload(booking);
  return {
    id: booking.id,
    applicant_id: booking.applicantId || null,
    first_name: booking.firstName || "",
    last_name: booking.lastName || "",
    email: booking.email || "",
    phone: booking.phone || "",
    details: { ...(booking.details || {}), timeZone },
    selected_date: booking.selectedDate,
    selected_time: booking.selectedTime,
    requested_at: booking.requestedAt || new Date().toISOString(),
    created_at: booking.createdAt || booking.requestedAt || new Date().toISOString()
  };
}

function bookingFromRow(row) {
  const timeZone = row.details?.timeZone || {};
  return {
    id: row.id,
    applicantId: row.applicant_id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    details: row.details || {},
    selectedDate: row.selected_date,
    selectedTime: row.selected_time,
    selectedDateCentral: timeZone.selectedDateCentral || row.selected_date,
    selectedTimeCentral: timeZone.selectedTimeCentral || row.selected_time,
    selectedDateApplicant: timeZone.selectedDateApplicant || row.selected_date,
    selectedTimeApplicant: timeZone.selectedTimeApplicant || row.selected_time,
    ownerTimeZone: timeZone.ownerTimeZone || "America/Chicago",
    ownerTimeZoneLabel: timeZone.ownerTimeZoneLabel || "Central Time",
    applicantTimeZone: timeZone.applicantTimeZone || "",
    applicantTimeZoneLabel: timeZone.applicantTimeZoneLabel || "",
    selectedDateTimeUtc: timeZone.selectedDateTimeUtc || "",
    requestedAt: row.requested_at,
    createdAt: row.created_at
  };
}

function bookingTimeZonePayload(booking) {
  return {
    selectedDateCentral: booking.selectedDateCentral || booking.selectedDate || "",
    selectedTimeCentral: booking.selectedTimeCentral || booking.selectedTime || "",
    selectedDateApplicant: booking.selectedDateApplicant || booking.selectedDate || "",
    selectedTimeApplicant: booking.selectedTimeApplicant || booking.selectedTime || "",
    ownerTimeZone: booking.ownerTimeZone || "America/Chicago",
    ownerTimeZoneLabel: booking.ownerTimeZoneLabel || "Central Time",
    applicantTimeZone: booking.applicantTimeZone || "",
    applicantTimeZoneLabel: booking.applicantTimeZoneLabel || "",
    selectedDateTimeUtc: booking.selectedDateTimeUtc || ""
  };
}

function paymentSessionToRow(session) {
  return {
    id: session.id,
    project: session.projectKey || session.project || "",
    purpose: session.purpose || "",
    amount_usd: session.amountUsd || null,
    reference_id: session.referenceId || "",
    payer_name: session.payerName || "",
    payer_email: session.payerEmail || "",
    destination: session.destination || "",
    status: session.status || "created",
    method: session.method || "",
    crypto: session.crypto || {},
    bridge_bucks: session.bridgeBucks || {},
    raw: session,
    created_at: session.createdAt || new Date().toISOString(),
    updated_at: session.updatedAt || null
  };
}

function paymentSessionFromRow(row) {
  return {
    ...(row.raw || {}),
    id: row.id,
    projectKey: row.project || row.raw?.projectKey,
    purpose: row.purpose || row.raw?.purpose,
    amountUsd: row.amount_usd === null ? row.raw?.amountUsd : Number(row.amount_usd),
    referenceId: row.reference_id || row.raw?.referenceId,
    payerName: row.payer_name || row.raw?.payerName,
    payerEmail: row.payer_email || row.raw?.payerEmail,
    destination: row.destination || row.raw?.destination,
    status: row.status || row.raw?.status,
    method: row.method || row.raw?.method,
    crypto: row.crypto || row.raw?.crypto || {},
    bridgeBucks: row.bridge_bucks || row.raw?.bridgeBucks || {},
    createdAt: row.created_at || row.raw?.createdAt,
    updatedAt: row.updated_at || row.raw?.updatedAt
  };
}

function authUserToRow(user) {
  return {
    id: user.id,
    email: user.email,
    roles: user.roles || ["member"],
    password_hash: user.passwordHash,
    created_at: user.createdAt || new Date().toISOString(),
    updated_at: user.updatedAt || null,
    last_login_at: user.lastLoginAt || null,
    password_updated_at: user.passwordUpdatedAt || null
  };
}

function authUserFromRow(row) {
  return {
    id: row.id,
    email: row.email,
    roles: row.roles || ["member"],
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at,
    passwordUpdatedAt: row.password_updated_at
  };
}

function authSessionToRow(session) {
  return { id: session.id, user_id: session.userId, token_hash: session.tokenHash, created_at: session.createdAt || new Date().toISOString(), expires_at: session.expiresAt };
}

function authSessionFromRow(row) {
  return { id: row.id, userId: row.user_id, tokenHash: row.token_hash, createdAt: row.created_at, expiresAt: row.expires_at };
}

function passwordResetToRow(reset) {
  return { id: reset.id, user_id: reset.userId, token_hash: reset.tokenHash, email_delivery: reset.emailDelivery || {}, created_at: reset.createdAt || new Date().toISOString(), expires_at: reset.expiresAt };
}

function passwordResetFromRow(row) {
  return { id: row.id, userId: row.user_id, tokenHash: row.token_hash, emailDelivery: row.email_delivery || {}, createdAt: row.created_at, expiresAt: row.expires_at };
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

function publicUser(user) {
  if (!user) return null;
  return { id: user.id, email: user.email, roles: user.roles || [] };
}

async function syncApplicationStageToSendFox(application, stage, env) {
  const listId = sendFoxListIdForStage(stage, env);
  if (!stage || !listId) return null;
  return addApplicationToSendFox(application, env, listId);
}

async function addApplicationToSendFox(application, env, listIdValue = env.SENDFOX_APPLIED_LIST_ID || env.SENDFOX_LIST_ID || "") {
  if (!env.SENDFOX_TOKEN || !application.email) return null;
  const payload = { email: application.email, first_name: application.firstName, last_name: application.lastName };
  const lists = parseSendFoxListIds(listIdValue);
  if (lists.length) payload.lists = lists;

  try {
    const response = await fetch("https://api.sendfox.com/contacts", {
      method: "POST",
      headers: { "Authorization": `Bearer ${env.SENDFOX_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      const contact = await response.json();
      return { synced: true, contactId: contact.id || null, syncedAt: new Date().toISOString() };
    }
    return { synced: false, status: response.status, message: await response.text(), attemptedAt: new Date().toISOString() };
  } catch (error) {
    return { synced: false, message: error.message, attemptedAt: new Date().toISOString() };
  }
}

function sendFoxListIdForStage(stage, env) {
  return ({
    applied: env.SENDFOX_APPLIED_LIST_ID || env.SENDFOX_LIST_ID || "",
    "details-completed": env.SENDFOX_DETAILS_LIST_ID || "",
    "call-booked": env.SENDFOX_CALL_BOOKED_LIST_ID || "",
    approved: env.SENDFOX_APPROVED_LIST_ID || "",
    "pma-sent": env.SENDFOX_PMA_SENT_LIST_ID || "",
    payment: env.SENDFOX_PAYMENT_LIST_ID || "",
    member: env.SENDFOX_MEMBER_LIST_ID || "",
    declined: env.SENDFOX_DECLINED_LIST_ID || ""
  })[stage] || "";
}

function parseSendFoxListIds(value) {
  return String(value || "").split(",").map((id) => Number.parseInt(id.trim(), 10)).filter(Number.isInteger);
}

async function sendPasswordResetEmail({ to, resetUrl, resetId }, env) {
  if (!env.RESEND_API_KEY || !env.RESEND_EMAIL_FROM) {
    return { sent: false, reason: "resend-not-configured", attemptedAt: new Date().toISOString() };
  }

  const payload = {
    from: env.RESEND_EMAIL_FROM,
    to: [to],
    subject: "Reset your Founders' Circle password",
    html: passwordResetEmailHtml(resetUrl),
    text: passwordResetEmailText(resetUrl)
  };
  if (env.RESEND_EMAIL_REPLY_TO) payload.reply_to = env.RESEND_EMAIL_REPLY_TO;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `founders-password-reset-${resetId}`
      },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      const data = await response.json();
      return { sent: true, resendId: data.id || null, sentAt: new Date().toISOString() };
    }
    return { sent: false, status: response.status, message: await response.text(), attemptedAt: new Date().toISOString() };
  } catch (error) {
    return { sent: false, message: error.message, attemptedAt: new Date().toISOString() };
  }
}

async function getUsdPrice(asset) {
  const gecko = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${asset.coingeckoId}&vs_currencies=usd`).then((res) => res.ok ? res.json() : null).catch(() => null);
  const geckoPrice = Number(gecko?.[asset.coingeckoId]?.usd);
  if (geckoPrice) return geckoPrice;

  const coinbase = await fetch("https://api.coinbase.com/v2/exchange-rates?currency=USD").then((res) => res.ok ? res.json() : null).catch(() => null);
  const tokensPerUsd = Number(coinbase?.data?.rates?.[asset.symbol]);
  if (tokensPerUsd) return 1 / tokensPerUsd;

  const compare = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${asset.symbol}&tsyms=USD`).then((res) => res.ok ? res.json() : null).catch(() => null);
  return Number(compare?.USD) || null;
}

function normalizeUsdAmount(value, fallback) {
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount) || amount <= 0) return fallback;
  return Math.round(amount * 100) / 100;
}

function formatCryptoAmount(amount) {
  if (amount >= 1) return amount.toFixed(6);
  return amount.toFixed(8);
}

function requestBaseUrl(request, env) {
  return String(env.APP_BASE_URL || new URL(request.url).origin).replace(/\/+$/, "");
}

function passwordResetEmailHtml(resetUrl) {
  const safeResetUrl = escapeHtml(resetUrl);
  return `<div style="font-family: Arial, sans-serif; color: #2d2d2f; line-height: 1.5;"><h1 style="color: #070d66;">Reset your Founders' Circle password</h1><p>Use the button below to choose a new password. This link expires in one hour.</p><p><a href="${safeResetUrl}" style="display: inline-block; background: #adfb72; color: #222; padding: 14px 22px; border-radius: 6px; text-decoration: none; font-weight: 700;">Reset password</a></p><p>If you did not request this, you can ignore this email.</p><p style="font-size: 13px; color: #666;">If the button does not work, open this link: ${safeResetUrl}</p></div>`;
}

function passwordResetEmailText(resetUrl) {
  return ["Reset your Founders' Circle password", "", "Use this link to choose a new password. It expires in one hour:", resetUrl, "", "If you did not request this, you can ignore this email."].join("\n");
}

function htmlResponse(html, init = {}) {
  return new Response(html, { ...init, headers: { "Content-Type": "text/html; charset=utf-8", ...(init.headers || {}) } });
}

function json(data, env, request, init = {}) {
  return corsResponse(JSON.stringify(data), env, request, {
    status: init.status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8", ...(init.headers || {}) }
  });
}

function corsResponse(body, env, request, init = {}) {
  const headers = new Headers(init.headers || {});
  const origin = request.headers.get("origin");
  const allowed = new Set(String(env.ALLOWED_ORIGINS || "").split(",").map((item) => item.trim()).filter(Boolean));
  if (origin && allowed.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
    headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
  }
  return new Response(body, { ...init, headers });
}

function redirect(path) {
  return new Response(null, { status: 302, headers: { Location: path } });
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizePhone(phone) {
  return String(phone || "").trim();
}

function requiredEnv(env, key) {
  const value = env[key];
  if (!value) throw new Error(`Missing ${key}`);
  return value;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
