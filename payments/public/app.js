const accountsEl = document.querySelector("#accounts");
const sessionsEl = document.querySelector("#sessions");
const accountSelect = document.querySelector("#account-select");
const accountForm = document.querySelector("#account-form");
const sessionForm = document.querySelector("#session-form");
const accountNote = document.querySelector("#account-note");
const sessionNote = document.querySelector("#session-note");
const checkoutTitle = document.querySelector("#checkout-title");
const checkoutMeta = document.querySelector("#checkout-meta");
const assetSelect = document.querySelector("#asset-select");
const cryptoForm = document.querySelector("#crypto-form");
const bridgeForm = document.querySelector("#bridge-form");
const lockQuote = document.querySelector("#lock-quote");
const bridgeLink = document.querySelector("#bridge-link");
const cryptoNote = document.querySelector("#crypto-note");
const bridgeNote = document.querySelector("#bridge-note");
const quoteBox = document.querySelector("#quote");
const quoteAmount = document.querySelector("#quote-amount");
const quoteAddress = document.querySelector("#quote-address");
const quoteConfirmations = document.querySelector("#quote-confirmations");
const quoteExpires = document.querySelector("#quote-expires");

let state = { accounts: [], sessions: [] };
let assets = {};
let checkoutSession = null;
let activeQuote = null;

init();

async function init() {
  if (checkoutTitle) {
    await loadAssets();
    renderCheckout();
    return;
  }

  await loadState();
  if (accountsEl) renderAdmin();
}

async function loadState() {
  const [stateResponse, assetResponse] = await Promise.all([
    fetch("/api/state"),
    fetch("/api/assets")
  ]);
  state = await stateResponse.json();
  assets = await assetResponse.json();
}

async function loadAssets() {
  const assetResponse = await fetch("/api/assets");
  assets = await assetResponse.json();
}

function renderAdmin() {
  accountsEl.innerHTML = state.accounts.map((account) => `
    <article class="account-card${account.parentId ? " child-account" : ""}">
      <div>
        <h3>${escapeHtml(account.name)}</h3>
        <p>${escapeHtml(account.type || "Project")}${account.parentId ? ` · under ${escapeHtml(getAccountName(account.parentId))}` : ""}</p>
      </div>
      <dl>
        <div><dt>Bridge Bucks</dt><dd>${account.bridgeBucksUrl ? "Configured" : "Not set"}</dd></div>
        <div><dt>Crypto addresses</dt><dd>${Object.keys(account.addresses || {}).length}</dd></div>
      </dl>
    </article>
  `).join("");

  accountSelect.innerHTML = state.accounts.map((account) => (
    `<option value="${escapeHtml(account.id)}">${escapeHtml(account.name)}</option>`
  )).join("");

  sessionsEl.innerHTML = state.sessions.length
    ? state.sessions.map(renderSessionCard).join("")
    : `<div class="empty">No checkout sessions yet.</div>`;
}

function getAccountName(id) {
  return state.accounts.find((account) => account.id === id)?.name || id;
}

function renderSessionCard(session) {
  const checkoutUrl = `checkout.html?session=${encodeURIComponent(session.id)}`;
  const payment = session.payment || {};
  return `
    <article class="session-card">
      <div>
        <h3>${escapeHtml(session.accountName)}</h3>
        <p>${escapeHtml(session.purpose)} · $${Number(session.amountUsd).toFixed(2)}</p>
      </div>
      <dl>
        <div><dt>Status</dt><dd>${escapeHtml(session.status)}</dd></div>
        <div><dt>Method</dt><dd>${escapeHtml(payment.method || "Not selected")}</dd></div>
        <div><dt>Confirmation</dt><dd>${escapeHtml(payment.verificationStatus || "Not started")}</dd></div>
      </dl>
      <a class="button secondary" href="${checkoutUrl}">Open Checkout</a>
    </article>
  `;
}

if (accountForm) {
  accountForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(accountForm).entries());
    const response = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    accountNote.textContent = response.ok ? "Account created." : "Could not create account.";
    accountForm.reset();
    await loadState();
    renderAdmin();
  });
}

if (sessionForm) {
  sessionForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(sessionForm).entries());
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const session = await response.json();
    sessionNote.innerHTML = response.ok
      ? `Checkout created: <a href="checkout.html?session=${encodeURIComponent(session.id)}">open checkout</a>`
      : "Could not create checkout.";
    await loadState();
    renderAdmin();
  });
}

async function renderCheckout() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session");
  const response = await fetch(`/api/sessions/${encodeURIComponent(sessionId || "")}`);
  if (!response.ok) {
    checkoutTitle.textContent = "Payment session not found";
    checkoutMeta.textContent = "Return to the payment dashboard and create a new checkout.";
    return;
  }

  checkoutSession = await response.json();
  checkoutTitle.textContent = checkoutSession.accountName;
  checkoutMeta.textContent = `${checkoutSession.purpose} · $${Number(checkoutSession.amountUsd).toFixed(2)}`;
  bridgeLink.href = checkoutSession.bridgeBucksUrl || "#";
  bridgeLink.toggleAttribute("aria-disabled", !checkoutSession.bridgeBucksUrl);
  assetSelect.innerHTML = Object.entries(assets).map(([key, asset]) => (
    `<option value="${escapeHtml(key)}">${escapeHtml(asset.label)}</option>`
  )).join("");
}

if (lockQuote) {
  lockQuote.addEventListener("click", async () => {
    cryptoNote.textContent = "";
    const url = `/api/quote?session=${encodeURIComponent(checkoutSession.id)}&asset=${encodeURIComponent(assetSelect.value)}`;
    const response = await fetch(url);
    const quote = await response.json();
    if (!response.ok) {
      cryptoNote.textContent = quote.error || "Quote unavailable.";
      return;
    }

    activeQuote = quote;
    quoteBox.hidden = false;
    quoteAmount.textContent = `${quote.amountDueText} ${quote.asset.toUpperCase()}`;
    quoteAddress.textContent = quote.address || "Address not configured for this account yet.";
    quoteAddress.classList.toggle("missing", !quote.addressConfigured);
    quoteConfirmations.textContent = `${quote.confirmationsRequired} confirmation${quote.confirmationsRequired === 1 ? "" : "s"}`;
    quoteExpires.textContent = new Date(quote.expiresAt).toLocaleString();
    cryptoNote.textContent = quote.addressConfigured
      ? "Quote locked for one hour."
      : "Quote locked, but this account needs a receiving address before accepting this asset.";
  });
}

if (cryptoForm) {
  cryptoForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!activeQuote?.addressConfigured) {
      cryptoNote.textContent = "Lock a quote with a configured address before submitting.";
      return;
    }

    const payment = {
      method: "Crypto",
      asset: activeQuote.label,
      amount: `${activeQuote.amountDueText} ${activeQuote.asset.toUpperCase()}`,
      quote: activeQuote,
      transactionHash: new FormData(cryptoForm).get("transactionHash") || "",
      verificationStatus: "pending-confirmations",
      confirmationsRequired: activeQuote.confirmationsRequired,
      submittedAt: new Date().toISOString()
    };
    await savePayment(payment);
    cryptoNote.textContent = "Transaction submitted. Waiting for blockchain confirmations.";
  });
}

if (bridgeForm) {
  bridgeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payment = {
      method: "Bridge Bucks",
      bridgeReference: new FormData(bridgeForm).get("bridgeReference") || "",
      verificationStatus: "confirmation-needed",
      submittedAt: new Date().toISOString()
    };
    await savePayment(payment);
    bridgeNote.textContent = "Bridge Bucks reference saved.";
  });
}

async function savePayment(payment) {
  const response = await fetch(`/api/sessions/${encodeURIComponent(checkoutSession.id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payment, status: "payment-submitted" })
  });
  checkoutSession = await response.json();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
