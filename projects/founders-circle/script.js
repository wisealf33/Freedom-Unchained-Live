const form = document.querySelector("#founders-application");
const note = document.querySelector("#form-note");
const memberLoginForm = document.querySelector("#member-login-form");
const memberLoginNote = document.querySelector("#member-login-note");
const memberDashboard = document.querySelector("#member-dashboard");
const forgotPasswordForm = document.querySelector("#forgot-password-form");
const forgotPasswordNote = document.querySelector("#forgot-password-note");
const resetPasswordForm = document.querySelector("#reset-password-form");
const resetPasswordNote = document.querySelector("#reset-password-note");
const detailsForm = document.querySelector("#application-details-form");
const detailsNote = document.querySelector("#details-note");
const alignmentForm = document.querySelector("#alignment-call-form");
const alignmentNote = document.querySelector("#alignment-note");
const calendarGrid = document.querySelector("#calendar-grid");
const calendarMonth = document.querySelector("#calendar-month");
const selectedDateLabel = document.querySelector("#selected-date-label");
const timeSlots = document.querySelector("#time-slots");
const selectedDateInput = document.querySelector("#selected-date-input");
const selectedTimeInput = document.querySelector("#selected-time-input");
const timeZoneSelect = document.querySelector("#timezone-select");
const timePeriodButtons = document.querySelectorAll(".time-period");
const prevMonth = document.querySelector("#prev-month");
const nextMonth = document.querySelector("#next-month");
const applicantSummary = document.querySelector("#applicant-summary");
const availabilityForm = document.querySelector("#availability-form");
const availabilityGrid = document.querySelector("#availability-grid");
const availabilityNote = document.querySelector("#availability-note");
const overrideForm = document.querySelector("#override-form");
const overrideDateInput = document.querySelector("#override-date");
const overrideBlockedInput = document.querySelector("#override-blocked");
const overrideTimes = document.querySelector("#override-times");
const overrideNote = document.querySelector("#override-note");
const overrideList = document.querySelector("#override-list");
const clearOverride = document.querySelector("#clear-override");
const adminCalendarGrid = document.querySelector("#admin-calendar-grid");
const adminCalendarMonth = document.querySelector("#admin-calendar-month");
const adminPrevMonth = document.querySelector("#admin-prev-month");
const adminNextMonth = document.querySelector("#admin-next-month");
const resetAvailability = document.querySelector("#reset-availability");
const applicantList = document.querySelector("#applicant-list");
const applicantDetail = document.querySelector("#applicant-detail");
const applicantStageFilter = document.querySelector("#applicant-stage-filter");
const funnelSummary = document.querySelector("#funnel-summary");
const paymentSessionList = document.querySelector("#payment-session-list");
const pmaForm = document.querySelector("#pma-form");
const pmaNote = document.querySelector("#pma-note");
const pmaApplicantSummary = document.querySelector("#pma-applicant-summary");
const paymentForm = document.querySelector("#payment-form");
const cryptoPaymentForm = document.querySelector("#crypto-payment-form");
const bridgePaymentForm = document.querySelector("#bridge-payment-form");
const paymentNote = document.querySelector("#payment-note");
const paymentApplicantSummary = document.querySelector("#payment-applicant-summary");
const cryptoPaymentLink = document.querySelector("#crypto-payment-link");
const bridgePaymentLink = document.querySelector("#bridge-payment-link");
const lockCryptoQuote = document.querySelector("#lock-crypto-quote");
const cryptoAsset = document.querySelector("#crypto-asset");
const cryptoQuotePanel = document.querySelector("#crypto-quote-panel");
const quoteAmount = document.querySelector("#quote-amount");
const quoteAddress = document.querySelector("#quote-address");
const quoteExpires = document.querySelector("#quote-expires");
const quoteUsd = document.querySelector("#quote-usd");
const quoteConfirmations = document.querySelector("#quote-confirmations");
const paymentAmountText = document.querySelectorAll("[data-payment-amount]");
const temporaryFoundersBackendUrl = "https://founders-circle-backend.wisealf33.workers.dev/api/founders";
const permanentFoundersBackendPath = "/api/founders";
const foundersBackendUrl = window.__FOUNDERS_BACKEND_URL__
  || (["freedomunchained.life", "www.freedomunchained.life", "founderscircle.freedomunchained.life"].includes(location.hostname) ? temporaryFoundersBackendUrl : location.origin);
const isStaticFreedomUnchainedHost = ["freedomunchained.life", "www.freedomunchained.life", "founderscircle.freedomunchained.life"].includes(location.hostname);
const ownerTimeZone = "America/Chicago";
const ownerTimeZoneLabel = "Central Time";
const timeZoneOptions = [
  { value: "America/Los_Angeles", label: "Pacific Time" },
  { value: "America/Denver", label: "Mountain Time" },
  { value: "America/Chicago", label: "Central Time" },
  { value: "America/New_York", label: "Eastern Time" },
  { value: "America/Anchorage", label: "Alaska Time" },
  { value: "Pacific/Honolulu", label: "Hawaii Time" },
  { value: "America/Phoenix", label: "Arizona Time" },
  { value: "UTC", label: "UTC" }
];
const sharedKeys = [
  "foundersApplications",
  "alignmentCallRequests",
  "foundersAvailability",
  "foundersAvailabilityVersion",
  "foundersDateOverrides",
  "paymentSessions"
];

const defaultAvailability = {
  1: ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"],
  2: ["10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "4:00 PM", "4:30 PM"],
  3: ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"],
  4: ["11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"],
  5: ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"]
};

const timeOptions = [
  "8:00 AM", "8:30 AM",
  "9:00 AM", "9:30 AM",
  "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM",
  "5:00 PM", "5:30 PM",
  "6:00 PM", "6:30 PM",
  "7:00 PM", "7:30 PM"
];
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const funnelStages = [
  { value: "applied", label: "Applied" },
  { value: "details-completed", label: "Details Completed" },
  { value: "call-booked", label: "Call Booked" },
  { value: "approved", label: "Approved" },
  { value: "pma-sent", label: "PMA Sent" },
  { value: "payment", label: "Payment" },
  { value: "member", label: "Member" },
  { value: "declined", label: "Declined" }
];
const membershipFeeUsd = 33;

let visibleMonth = new Date();
visibleMonth.setDate(1);
let adminVisibleMonth = new Date();
adminVisibleMonth.setDate(1);
let selectedDate = "";
let selectedTime = "";
let activePaymentContext = null;

if (isStaticFreedomUnchainedHost && isBackendOnlyPage()) {
  const pageName = location.pathname.split("/").filter(Boolean).pop() || "member-login.html";
  window.location.replace(backendPageUrl(`${pageName}${location.search}`));
}

upgradeSavedAvailability();
syncFromServer().then(() => {
  upgradeSavedAvailability();
  refreshCurrentView();
});
let selectedPeriod = "morning";

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const data = Object.fromEntries(new FormData(form).entries());
      data.phone = normalizeInternationalPhone(data.countryCode, data.phone);
      delete data.countryCode;
      const application = await createApplication(data);
      const applications = readJson("foundersApplications", []);
      applications.push(application);
      writeJson("foundersApplications", applications);
      writeJson("activeApplicant", application);

      note.textContent = "Application received. Choose a time for the alignment call.";
      window.location.href = "alignment-call.html";
    } catch {
      note.textContent = "The application could not be submitted. Make sure the local Founders Circle server is running, then try again.";
    }
  });
}

if (memberLoginForm) {
  memberLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(apiUrl("/founders-login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(memberLoginForm).entries()))
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        memberLoginNote.textContent = result.error || "Login failed. Check the email and password.";
        return;
      }

      localStorage.setItem("foundersAuthToken", result.token);
      memberLoginNote.textContent = "Login accepted. Opening the member portal.";
      window.location.href = backendPageUrl(new URLSearchParams(window.location.search).get("next") || "member-dashboard.html");
    } catch {
      memberLoginNote.textContent = "Member login needs the Founders Circle backend to be running.";
    }
  });
}

document.querySelectorAll("[data-password-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.passwordToggle);
    if (!input) return;

    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    button.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
    button.classList.toggle("visible", isPassword);
  });
});

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(apiUrl("/founders-password-reset"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(forgotPasswordForm).entries()))
      });
      const result = await response.json().catch(() => ({}));
      forgotPasswordNote.textContent = result.message || "If an account exists for that email, a reset link will be prepared.";

      if (result.resetUrl) {
        forgotPasswordNote.innerHTML = `${escapeHtml(forgotPasswordNote.textContent)}<br><a href="${escapeHtml(result.resetUrl)}">Open local reset link</a>`;
      }
    } catch {
      forgotPasswordNote.textContent = "Password reset needs the Founders Circle backend to be running.";
    }
  });
}

if (resetPasswordForm) {
  resetPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token") || "";

    if (!token) {
      resetPasswordNote.textContent = "This reset link is missing its token.";
      return;
    }

    try {
      const response = await fetch(apiUrl("/founders-password-reset-confirm"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: new FormData(resetPasswordForm).get("password")
        })
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        resetPasswordNote.textContent = result.error || "Could not update this password.";
        return;
      }

      resetPasswordNote.innerHTML = 'Password updated. <a href="member-login.html">Return to login</a>.';
    } catch {
      resetPasswordNote.textContent = "Password reset needs the Founders Circle backend to be running.";
    }
  });
}

if (memberDashboard) {
  const user = window.__FOUNDERS_INITIAL_STATE__?.authUser || null;
  const emailTarget = memberDashboard.querySelector("[data-member-email]");
  const adminTools = memberDashboard.querySelector("[data-admin-tools]");

  if (emailTarget && user?.email) {
    emailTarget.textContent = user.email;
  }

  if (adminTools && user?.roles?.includes("admin")) {
    adminTools.hidden = false;
  }
}

if (detailsForm) {
  detailsForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const applicant = readJson("activeApplicant", null);
    if (!applicant) {
      detailsNote.textContent = "Please start with the application form first.";
      return;
    }

    const details = Object.fromEntries(new FormData(detailsForm).entries());
    const updatedApplicant = {
      ...applicant,
      details,
      detailsSubmittedAt: new Date().toISOString(),
      stage: "details-completed",
      stageUpdatedAt: new Date().toISOString()
    };
    await updateApplication(updatedApplicant);
    writeJson("activeApplicant", updatedApplicant);

    const applications = readJson("foundersApplications", []);
    writeJson("foundersApplications", applications.map((item) => (
      item.id === updatedApplicant.id ? updatedApplicant : item
    )));

    window.location.href = "thank-you.html";
  });
}

if (alignmentForm) {
  initializeTimeZoneSelect();
  const applicant = readJson("activeApplicant", null);
  if (applicantSummary) {
    applicantSummary.innerHTML = applicant
      ? `<strong>Scheduling for ${applicant.firstName} ${applicant.lastName}</strong><span>${applicant.email}</span>`
      : `<strong>No applicant loaded</strong><span>Start from the application page so name and email can carry forward.</span>`;
  }

  renderCalendar();

  alignmentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const applicantForBooking = readJson("activeApplicant", null);
    if (!applicantForBooking) {
      alignmentNote.textContent = "Please start from the application page before booking.";
      return;
    }

    if (!selectedDateInput.value || !selectedTimeInput.value) {
      alignmentNote.textContent = "Please select an available date and time before booking the call.";
      return;
    }

    const timeZoneDetails = getBookingTimeZoneDetails(selectedDateInput.value, selectedTimeInput.value);
    const booking = {
      applicantId: applicantForBooking.id,
      firstName: applicantForBooking.firstName,
      lastName: applicantForBooking.lastName,
      email: applicantForBooking.email,
      phone: applicantForBooking.phone,
      details: applicantForBooking.details || {},
      selectedDate: selectedDateInput.value,
      selectedTime: selectedTimeInput.value,
      selectedDateCentral: timeZoneDetails.selectedDateCentral,
      selectedTimeCentral: timeZoneDetails.selectedTimeCentral,
      selectedDateApplicant: timeZoneDetails.selectedDateApplicant,
      selectedTimeApplicant: timeZoneDetails.selectedTimeApplicant,
      ownerTimeZone: timeZoneDetails.ownerTimeZone,
      ownerTimeZoneLabel: timeZoneDetails.ownerTimeZoneLabel,
      applicantTimeZone: timeZoneDetails.applicantTimeZone,
      applicantTimeZoneLabel: timeZoneDetails.applicantTimeZoneLabel,
      selectedDateTimeUtc: timeZoneDetails.selectedDateTimeUtc,
      requestedAt: new Date().toISOString()
    };
    const savedBooking = await createBooking(booking);
    const requests = readJson("alignmentCallRequests", []);
    requests.push(savedBooking);
    writeJson("alignmentCallRequests", requests);

    const applicantWithBooking = {
      ...applicantForBooking,
      latestBookingId: savedBooking.id,
      latestBookingAt: new Date().toISOString(),
      stage: "call-booked",
      stageUpdatedAt: new Date().toISOString()
    };
    await updateApplication({
      id: applicantWithBooking.id,
      latestBookingId: applicantWithBooking.latestBookingId,
      latestBookingAt: applicantWithBooking.latestBookingAt,
      stage: applicantWithBooking.stage,
      stageUpdatedAt: applicantWithBooking.stageUpdatedAt
    });
    writeJson("activeApplicant", applicantWithBooking);
    const applications = readJson("foundersApplications", []);
    writeJson("foundersApplications", applications.map((item) => (
      item.id === applicantWithBooking.id ? applicantWithBooking : item
    )));

    alignmentNote.textContent = `Alignment call booked for ${formatBookingShort(booking)}. Continue to the quick questions.`;
    window.location.href = "application-details.html";
  });
}

if (prevMonth) {
  prevMonth.addEventListener("click", () => {
    visibleMonth.setMonth(visibleMonth.getMonth() - 1);
    renderCalendar();
  });
}

timePeriodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedPeriod = button.dataset.period;
    selectedTime = "";
    if (selectedTimeInput) selectedTimeInput.value = "";
    timePeriodButtons.forEach((item) => item.classList.toggle("selected", item === button));
    renderTimes(selectedDate);
  });
});

if (nextMonth) {
  nextMonth.addEventListener("click", () => {
    visibleMonth.setMonth(visibleMonth.getMonth() + 1);
    renderCalendar();
  });
}

if (availabilityForm) {
  renderAvailabilityAdmin();
  renderAdminCalendar();

  availabilityForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(availabilityForm);
    const availability = {};

    dayNames.forEach((_, index) => {
      const selected = formData.getAll(`day-${index}`);
      if (selected.length) availability[index] = selected;
    });

    await saveAvailability(availability);
    writeJson("foundersAvailability", availability);
    availabilityNote.textContent = "Availability saved. The scheduler will use these bookable windows.";
    renderAdminCalendar();
  });
}

if (resetAvailability) {
  resetAvailability.addEventListener("click", async () => {
    await saveAvailability(defaultAvailability);
    writeJson("foundersAvailability", defaultAvailability);
    writeJson("foundersAvailabilityVersion", 2);
    renderAvailabilityAdmin();
    renderAdminCalendar();
    availabilityNote.textContent = "Availability reset to the 30-minute default schedule.";
  });
}

if (overrideForm) {
  renderOverrideControls();
  renderOverrideList();
  renderAdminCalendar();

  overrideDateInput.addEventListener("change", () => {
    loadOverrideForDate(overrideDateInput.value);
  });

  overrideBlockedInput.addEventListener("change", () => {
    overrideTimes.classList.toggle("disabled-options", overrideBlockedInput.checked);
  });

  overrideForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const dateKey = overrideDateInput.value;
    const overrides = readJson("foundersDateOverrides", {});

    if (overrideBlockedInput.checked) {
      overrides[dateKey] = { blocked: true, times: [] };
    } else {
      const selectedTimes = new FormData(overrideForm).getAll("overrideTime");
      overrides[dateKey] = { blocked: false, times: selectedTimes };
    }

    await saveDateOverride(dateKey, overrides[dateKey]);
    writeJson("foundersDateOverrides", overrides);
    overrideNote.textContent = "Date override saved.";
    renderOverrideList();
    renderAdminCalendar();
  });

  overrideList?.addEventListener("click", async (event) => {
    const action = event.target.closest("[data-override-action]");
    if (!action) return;

    const dateKey = action.dataset.date;
    if (!dateKey) return;

    if (action.dataset.overrideAction === "edit") {
      openOverrideEditor(dateKey);
      return;
    }

    if (action.dataset.overrideAction === "delete") {
      await clearDateOverride(dateKey);
    }
  });
}

if (clearOverride) {
  clearOverride.addEventListener("click", async () => {
    const dateKey = overrideDateInput.value;
    if (!dateKey) {
      overrideNote.textContent = "Choose a date to clear.";
      return;
    }

    await clearDateOverride(dateKey);
  });
}

if (adminPrevMonth) {
  adminPrevMonth.addEventListener("click", () => {
    adminVisibleMonth.setMonth(adminVisibleMonth.getMonth() - 1);
    renderAdminCalendar();
  });
}

if (adminNextMonth) {
  adminNextMonth.addEventListener("click", () => {
    adminVisibleMonth.setMonth(adminVisibleMonth.getMonth() + 1);
    renderAdminCalendar();
  });
}

if (applicantStageFilter) {
  applicantStageFilter.addEventListener("change", () => renderApplicantDashboard());
}

if (applicantList) {
  renderApplicantDashboard();
}

if (paymentSessionList) {
  renderPaymentSessionsDashboard();
}

if (pmaForm) {
  const applicant = getActiveOrLinkedApplicant();
  renderApplicantGateSummary(pmaApplicantSummary, applicant, "No applicant loaded. Use the approval link from the dashboard.");

  pmaForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const currentApplicant = getActiveOrLinkedApplicant();
    if (!currentApplicant) {
      pmaNote.textContent = "No approved applicant found for this agreement.";
      return;
    }

    const formData = Object.fromEntries(new FormData(pmaForm).entries());
    const signedApplicant = {
      ...currentApplicant,
      pma: {
        signedName: formData.signedName || "",
        signedAt: new Date().toISOString(),
        accepted: Boolean(formData.pmaAccepted)
      },
      stage: "payment",
      stageUpdatedAt: new Date().toISOString()
    };
    const saved = await updateApplication(signedApplicant);
    saveApplicantLocally({ ...signedApplicant, ...saved });
    writeJson("activeApplicant", { ...signedApplicant, ...saved });
    window.location.href = linkedPageUrl("payment.html", signedApplicant.id);
  });
}

if (paymentForm || cryptoPaymentLink || bridgePaymentLink) {
  initializePaymentFlow();
}

if (cryptoPaymentForm) {
  initializePaymentFlow();
  hydrateStoredQuote();

  lockCryptoQuote?.addEventListener("click", lockQuoteForSelectedAsset);
  cryptoAsset?.addEventListener("change", () => {
    cryptoQuotePanel.hidden = true;
    writeJson("activeCryptoQuote", null);
  });

  cryptoPaymentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const quote = readJson("activeCryptoQuote", null);
    if (!quote || new Date(quote.expiresAt).getTime() < Date.now()) {
      paymentNote.textContent = "Lock a fresh crypto quote before submitting payment.";
      return;
    }

    if (!quote.addressConfigured) {
      paymentNote.textContent = "This currency does not have a receiving address yet. Choose another currency or wait until the address is configured.";
      return;
    }

    const formData = Object.fromEntries(new FormData(cryptoPaymentForm).entries());
    await submitPaymentForReview({
      method: "Crypto",
      asset: quote.label,
      amount: `${quote.amountDueText} ${quote.asset.toUpperCase()}`,
      usdAmount: `$${Number(quote.amountUsd || quote.membershipFeeUsd).toFixed(2)}`,
      address: quote.address || "Address not configured",
      quote,
      note: formData.paymentNote || "",
      confirmed: Boolean(formData.paymentConfirmed)
    });
  });
}

if (bridgePaymentForm) {
  initializePaymentFlow();

  bridgePaymentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(bridgePaymentForm).entries());
    await submitPaymentForReview({
      method: "Bridge Bucks",
      amount: paymentAmountForContext(activePaymentContext),
      usdAmount: paymentAmountForContext(activePaymentContext),
      note: formData.paymentNote || "",
      confirmed: Boolean(formData.paymentConfirmed)
    });
  });
}

function renderCalendar() {
  if (!calendarGrid || !calendarMonth) return;

  const monthName = visibleMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const lastDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
  const today = stripTime(new Date());

  calendarMonth.textContent = monthName;
  calendarGrid.innerHTML = "";

  for (let i = 0; i < firstDay.getDay(); i += 1) {
    const spacer = document.createElement("span");
    spacer.className = "calendar-spacer";
    calendarGrid.appendChild(spacer);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
    const dateKey = toDateKey(date);
    const button = document.createElement("button");
    const isPast = stripTime(date) < today;
    const hasAvailability = Boolean(getTimesForDate(dateKey).length);
    const isBookedOut = hasAvailability && getAvailableTimes(dateKey).length === 0;

    button.type = "button";
    button.className = "calendar-day";
    button.textContent = day;
    button.disabled = isPast || !hasAvailability || isBookedOut;

    if (dateKey === selectedDate) button.classList.add("selected");
    if (isBookedOut) button.classList.add("booked-out");

    button.addEventListener("click", () => {
      selectedDate = dateKey;
      selectedTime = "";
      selectedDateInput.value = selectedDate;
      selectedTimeInput.value = "";
      renderCalendar();
      renderTimes(selectedDate);
    });

    calendarGrid.appendChild(button);
  }

  if (!selectedDate) {
    const firstAvailable = findFirstAvailableDate(today);
    if (firstAvailable) {
      selectedDate = firstAvailable;
      selectedDateInput.value = selectedDate;
      renderCalendar();
      renderTimes(selectedDate);
    }
  }
}

function renderTimes(dateKey) {
  if (!timeSlots || !selectedDateLabel) return;

  const allTimes = getAvailableTimes(dateKey);
  const times = allTimes.filter((time) => getTimePeriod(time) === selectedPeriod);
  selectedDateLabel.textContent = dateKey ? formatDateForDisplay(dateKey) : "Select a date";
  timeSlots.innerHTML = "";

  if (!times.length) {
    const empty = document.createElement("p");
    empty.className = "empty-times";
    empty.textContent = allTimes.length
      ? `No ${selectedPeriod} call times remain for this date.`
      : "No remaining call times for this date.";
    timeSlots.appendChild(empty);
    return;
  }

  times.forEach((time) => {
    const button = document.createElement("button");
    const label = formatTimeSlotLabel(dateKey, time);
    button.type = "button";
    button.className = "time-slot";
    button.innerHTML = label.secondary
      ? `<span>${escapeHtml(label.primary)}</span><small>${escapeHtml(label.secondary)}</small>`
      : `<span>${escapeHtml(label.primary)}</span>`;
    if (time === selectedTime) button.classList.add("selected");

    button.addEventListener("click", () => {
      selectedTime = time;
      selectedTimeInput.value = time;
      renderTimes(dateKey);
      alignmentNote.textContent = "";
    });

    timeSlots.appendChild(button);
  });
}

function renderAvailabilityAdmin() {
  if (!availabilityGrid) return;

  const availability = getAvailability();
  availabilityGrid.innerHTML = "";

  dayNames.forEach((day, dayIndex) => {
    const group = document.createElement("fieldset");
    group.className = "availability-day";
    group.innerHTML = `<legend>${day}</legend>`;

    timeOptions.forEach((time) => {
      const id = `day-${dayIndex}-${time.replace(/[^a-z0-9]/gi, "")}`;
      const label = document.createElement("label");
      label.setAttribute("for", id);
      label.innerHTML = `
        <input id="${id}" name="day-${dayIndex}" type="checkbox" value="${time}" ${availability[dayIndex]?.includes(time) ? "checked" : ""}>
        <span>${time}</span>
      `;
      group.appendChild(label);
    });

    availabilityGrid.appendChild(group);
  });
}

function renderOverrideControls() {
  if (!overrideTimes) return;

  overrideTimes.innerHTML = "";
  timeOptions.forEach((time) => {
    const id = `override-${time.replace(/[^a-z0-9]/gi, "")}`;
    const label = document.createElement("label");
    label.setAttribute("for", id);
    label.innerHTML = `
      <input id="${id}" name="overrideTime" type="checkbox" value="${time}">
      <span>${time}</span>
    `;
    overrideTimes.appendChild(label);
  });
}

function loadOverrideForDate(dateKey) {
  if (!dateKey || !overrideForm) return;

  const override = readJson("foundersDateOverrides", {})[dateKey];
  overrideForm.querySelectorAll('input[name="overrideTime"]').forEach((input) => {
    input.checked = Boolean(override?.times?.includes(input.value));
  });
  overrideBlockedInput.checked = Boolean(override?.blocked);
  overrideTimes.classList.toggle("disabled-options", overrideBlockedInput.checked);
}

function openOverrideEditor(dateKey) {
  if (!dateKey || !overrideDateInput) return;

  overrideDateInput.value = dateKey;
  loadOverrideForDate(dateKey);
  overrideNote.textContent = `${formatDateForDisplay(dateKey)} loaded for editing.`;
  document.querySelector(".override-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function clearDateOverride(dateKey) {
  const overrides = readJson("foundersDateOverrides", {});
  delete overrides[dateKey];
  await deleteDateOverride(dateKey);
  writeJson("foundersDateOverrides", overrides);

  if (overrideDateInput?.value === dateKey) {
    overrideForm.reset();
    overrideTimes.classList.remove("disabled-options");
  }

  overrideNote.textContent = `${formatDateForDisplay(dateKey)} cleared.`;
  renderOverrideList();
  renderAdminCalendar();
}

function renderOverrideList() {
  if (!overrideList) return;

  const overrides = readJson("foundersDateOverrides", {});
  const entries = Object.entries(overrides).sort(([a], [b]) => {
    const dateA = new Date(`${a}T00:00:00`);
    const dateB = new Date(`${b}T00:00:00`);
    return dateA - dateB;
  });

  overrideList.innerHTML = entries.length
    ? entries.map(([dateKey, override]) => `
      <div class="override-item">
        <div>
          <strong>${formatDateForDisplay(dateKey)}</strong>
          <span>${override.blocked ? "Blocked all day" : `Custom times: ${override.times.join(", ") || "none"}`}</span>
        </div>
        <div class="override-item-actions" aria-label="Actions for ${formatDateForDisplay(dateKey)}">
          <button type="button" class="button secondary-admin-button" data-override-action="edit" data-date="${dateKey}">Edit</button>
          <button type="button" class="button secondary-admin-button" data-override-action="delete" data-date="${dateKey}">Clear</button>
        </div>
      </div>
    `).join("")
    : `<p>No date-specific overrides yet.</p>`;
}

function renderAdminCalendar() {
  if (!adminCalendarGrid || !adminCalendarMonth) return;

  const monthName = adminVisibleMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const firstDay = new Date(adminVisibleMonth.getFullYear(), adminVisibleMonth.getMonth(), 1);
  const lastDay = new Date(adminVisibleMonth.getFullYear(), adminVisibleMonth.getMonth() + 1, 0);

  adminCalendarMonth.textContent = monthName;
  adminCalendarGrid.innerHTML = "";

  for (let i = 0; i < firstDay.getDay(); i += 1) {
    const spacer = document.createElement("span");
    spacer.className = "calendar-spacer";
    adminCalendarGrid.appendChild(spacer);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(adminVisibleMonth.getFullYear(), adminVisibleMonth.getMonth(), day);
    const dateKey = toDateKey(date);
    const status = getDateStatus(dateKey);
    const bookingCount = getBookingsForDate(dateKey).length;
    const timesCount = getAvailableTimes(dateKey).length;
    const button = document.createElement("button");

    button.type = "button";
    button.className = `admin-calendar-day ${status}`;
    button.innerHTML = `
      <strong>${day}</strong>
      <span>${statusLabel(status, bookingCount, timesCount)}</span>
    `;

    button.addEventListener("click", () => {
      openOverrideEditor(dateKey);
    });

    adminCalendarGrid.appendChild(button);
  }
}

function getAvailability() {
  return readJson("foundersAvailability", defaultAvailability);
}

function upgradeSavedAvailability() {
  const version = readJson("foundersAvailabilityVersion", null);
  const savedAvailability = readJson("foundersAvailability", null);
  if (version === 2) return;

  const hasHalfHourSlots = savedAvailability && Object.values(savedAvailability).some((times) => (
    Array.isArray(times) && times.some((time) => time.includes(":30"))
  ));

  if (!savedAvailability || !hasHalfHourSlots) {
    writeJson("foundersAvailability", defaultAvailability);
  }

  writeJson("foundersAvailabilityVersion", 2);
}

function getAvailableTimes(dateKey) {
  const booked = getBookingsForDate(dateKey).map((request) => request.selectedTime);

  return getTimesForDate(dateKey).filter((time) => !booked.includes(time));
}

function getBookingsForDate(dateKey) {
  return readJson("alignmentCallRequests", []).filter((request) => request.selectedDate === dateKey);
}

function getTimePeriod(time) {
  const [hourText, minuteMeridian] = time.split(":");
  const [minuteText, meridian] = minuteMeridian.split(" ");
  let hour = Number(hourText);
  const minute = Number(minuteText);
  if (meridian === "PM" && hour !== 12) hour += 12;
  if (meridian === "AM" && hour === 12) hour = 0;

  const totalMinutes = hour * 60 + minute;
  if (totalMinutes < 12 * 60) return "morning";
  if (totalMinutes < 17 * 60) return "afternoon";
  if (totalMinutes < 20 * 60) return "evening";
  return "night";
}

function getDateStatus(dateKey) {
  const override = readJson("foundersDateOverrides", {})[dateKey];
  const bookings = getBookingsForDate(dateKey);
  const totalTimes = getTimesForDate(dateKey);
  const availableTimes = getAvailableTimes(dateKey);

  if (override?.blocked) return "blocked";
  if (override && !override.blocked) return bookings.length ? "custom booked" : "custom";
  if (bookings.length && availableTimes.length) return "booked";
  if (bookings.length && !availableTimes.length) return "booked full";
  if (totalTimes.length) return "open";
  return "closed";
}

function statusLabel(status, bookingCount, timesCount) {
  if (status.includes("blocked")) return "Blocked";
  if (status.includes("custom") && bookingCount) return `${bookingCount} booked`;
  if (status.includes("custom")) return "Custom";
  if (status.includes("full")) return "Full";
  if (status.includes("booked")) return `${bookingCount} booked`;
  if (status.includes("open")) return `${timesCount} open`;
  return "Closed";
}

function getTimesForDate(dateKey) {
  const override = readJson("foundersDateOverrides", {})[dateKey];
  if (override?.blocked) return [];
  if (override && Array.isArray(override.times)) return override.times;

  const date = new Date(`${dateKey}T00:00:00`);
  return getAvailability()[date.getDay()] || [];
}

function findFirstAvailableDate(today) {
  for (let offset = 0; offset < 60; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const dateKey = toDateKey(date);
    if (getTimesForDate(dateKey).length && getAvailableTimes(dateKey).length) {
      return dateKey;
    }
  }
  return "";
}

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function formatDateForDisplay(dateKey) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
}

async function syncFromServer() {
  if (location.protocol === "file:") return;

  if (window.__FOUNDERS_INITIAL_STATE__) {
    sharedKeys.forEach((key) => {
      if (window.__FOUNDERS_INITIAL_STATE__[key] !== undefined && window.__FOUNDERS_INITIAL_STATE__[key] !== null) {
        localStorage.setItem(key, JSON.stringify(window.__FOUNDERS_INITIAL_STATE__[key]));
      }
    });
    return;
  }

  try {
    const response = await fetch(apiUrl("/founders-public-state"));
    if (!response.ok) return;
    const state = await response.json();

    sharedKeys.forEach((key) => {
      if (state[key] !== undefined && state[key] !== null) {
        localStorage.setItem(key, JSON.stringify(state[key]));
      }
    });
  } catch {
    // Local files and offline previews fall back to localStorage.
  }
}

function refreshCurrentView() {
  if (alignmentForm) {
    renderCalendar();
    if (selectedDate) renderTimes(selectedDate);
  }

  if (availabilityForm) {
    renderAvailabilityAdmin();
    renderAdminCalendar();
    renderOverrideList();
  }

  if (applicantList) {
    renderApplicantDashboard();
  }

  if (paymentSessionList) {
    renderPaymentSessionsDashboard();
  }
}

async function createApplication(data) {
  const localApplication = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    ...data,
    submittedAt: new Date().toISOString()
  };

  if (location.protocol === "file:") return localApplication;

  try {
    const response = await fetch(apiUrl("/founders-applications"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return response.ok ? response.json() : localApplication;
  } catch {
    return localApplication;
  }
}

async function updateApplication(application) {
  if (location.protocol === "file:") return application;

  try {
    const response = await fetch(apiUrl(`/founders-applications/${application.id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(application)
    });
    return response.ok ? response.json() : application;
  } catch {
    return application;
  }
}

async function getPaymentSession(id) {
  if (location.protocol === "file:") {
    const sessions = readJson("paymentSessions", []);
    return sessions.find((session) => session.id === id) || readJson("activePaymentSession", null);
  }

  const response = await fetch(apiUrl(`/payment-sessions/${id}`));
  return response.ok ? response.json() : null;
}

async function updatePaymentSession(session) {
  if (location.protocol === "file:" || !session.id) {
    const sessions = readJson("paymentSessions", []);
    const updated = sessions.some((item) => item.id === session.id)
      ? sessions.map((item) => (item.id === session.id ? session : item))
      : [...sessions, session];
    writeJson("paymentSessions", updated);
    return session;
  }

  const response = await fetch(apiUrl(`/payment-sessions/${session.id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session)
  });
  return response.ok ? response.json() : session;
}

async function createBooking(booking) {
  const localBooking = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    ...booking
  };

  if (location.protocol === "file:") return localBooking;

  try {
    const response = await fetch(apiUrl("/founders-bookings"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(booking)
    });
    return response.ok ? response.json() : localBooking;
  } catch {
    return localBooking;
  }
}

async function saveAvailability(availability) {
  if (location.protocol === "file:") return;

  await fetch(apiUrl("/founders-availability"), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ availability })
  });
}

async function saveDateOverride(dateKey, override) {
  if (location.protocol === "file:") return;

  await fetch(apiUrl(`/founders-date-overrides/${dateKey}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(override)
  });
}

async function deleteDateOverride(dateKey) {
  if (location.protocol === "file:") return;

  await fetch(apiUrl(`/founders-date-overrides/${dateKey}`), {
    method: "DELETE"
  });
}

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function apiUrl(path) {
  return buildBackendUrl(path);
}

function backendPageUrl(path = "index.html") {
  if (location.protocol === "file:") return path;
  return buildBackendUrl(path);
}

function buildBackendUrl(path = "") {
  const cleanPath = String(path || "").replace(/^\/+/, "");
  const baseUrl = location.protocol === "file:" ? window.location.href : foundersBackendUrl;
  const url = new URL(baseUrl, location.origin);
  const basePath = url.pathname.replace(/\/+$/, "");
  url.pathname = basePath && basePath !== "/" ? `${basePath}/${cleanPath}` : `/${cleanPath}`;
  url.username = "";
  url.password = "";
  return url.toString();
}

function isBackendOnlyPage() {
  return Boolean(
    memberLoginForm
    || forgotPasswordForm
    || resetPasswordForm
    || memberDashboard
    || applicantList
    || availabilityForm
    || paymentSessionList
  );
}

function renderApplicantDashboard(selectedId = readJson("selectedApplicantId", "")) {
  if (!applicantList || !applicantDetail) return;

  const applications = getApplicationsWithDerivedStages();
  const bookings = readJson("alignmentCallRequests", []);
  const selectedFilter = applicantStageFilter?.value || "all";
  const filteredApplications = applications.filter((application) => (
    selectedFilter === "all" || getApplicantStage(application, bookings) === selectedFilter
  ));
  const selectedApplicant = applications.find((application) => application.id === selectedId)
    || filteredApplications[0]
    || null;

  renderFunnelSummary(applications, bookings);
  renderApplicantList(filteredApplications, bookings, selectedApplicant?.id || "");
  renderApplicantDetail(selectedApplicant, bookings);
}

function renderPaymentSessionsDashboard() {
  if (!paymentSessionList) return;

  const sessions = readJson("paymentSessions", [])
    .slice()
    .sort((a, b) => String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || "")));

  if (!sessions.length) {
    paymentSessionList.innerHTML = `
      <div class="empty-admin-state">
        <strong>No payment sessions yet</strong>
        <span>When a project starts a payment, donation, product purchase, or membership payment, it will show here.</span>
      </div>
    `;
    return;
  }

  paymentSessionList.innerHTML = sessions.map((session) => {
    const payment = session.payment || {};
    const status = session.status || "created";
    return `
      <article class="payment-session-card">
        <div>
          <p class="section-kicker">${escapeHtml(session.projectName || readableProjectName(session.projectKey))}</p>
          <h2>${escapeHtml(session.purpose || "Payment")}</h2>
          <p>${escapeHtml(session.payerName || session.payerEmail || session.referenceId || "No payer details yet")}</p>
        </div>
        <dl>
          <div><dt>Amount</dt><dd>$${Number(session.amountUsd || 0).toFixed(2)}</dd></div>
          <div><dt>Status</dt><dd>${escapeHtml(status)}</dd></div>
          <div><dt>Method</dt><dd>${escapeHtml(payment.method || "Not selected")}</dd></div>
          <div><dt>Confirmation</dt><dd>${escapeHtml(formatPaymentReview(payment))}</dd></div>
          <div><dt>Submitted</dt><dd>${escapeHtml(formatDateTime(payment.submittedAt))}</dd></div>
          <div><dt>Reference</dt><dd>${escapeHtml(payment.note || payment.quote?.asset || session.referenceId || "Not recorded")}</dd></div>
        </dl>
        <div class="admin-next-actions">
          <a href="${escapeHtml(paymentPageUrl("payment.html", { type: "session", session }))}">Open Payment</a>
          <a href="${escapeHtml(paymentPageUrl("crypto-payment.html", { type: "session", session }))}">Crypto Page</a>
          <a href="${escapeHtml(paymentPageUrl("bridge-bucks-payment.html", { type: "session", session }))}">Bridge Bucks Page</a>
        </div>
      </article>
    `;
  }).join("");
}

function renderFunnelSummary(applications, bookings) {
  if (!funnelSummary) return;

  funnelSummary.innerHTML = funnelStages.map((stage) => {
    const count = applications.filter((application) => getApplicantStage(application, bookings) === stage.value).length;
    return `
      <div class="funnel-stat">
        <strong>${count}</strong>
        <span>${stage.label}</span>
      </div>
    `;
  }).join("");
}

function renderApplicantList(applications, bookings, selectedId) {
  applicantList.innerHTML = applications.length
    ? applications.map((application) => {
      const stage = getApplicantStage(application, bookings);
      const booking = getLatestBookingForApplicant(application, bookings);
      const name = getApplicantName(application);
      const bookingLabel = booking ? formatBookingAdminListLabel(booking) : "";
      return `
        <button class="applicant-list-item ${application.id === selectedId ? "selected" : ""}" type="button" data-applicant-id="${escapeHtml(application.id)}">
          <strong>${escapeHtml(name)}</strong>
          <span>${escapeHtml(application.email || "No email")}</span>
          <small>${escapeHtml(getStageLabel(stage))}${bookingLabel ? ` • ${escapeHtml(bookingLabel)}` : ""}</small>
        </button>
      `;
    }).join("")
    : `<div class="empty-admin-state"><strong>No applicants here yet</strong><span>New applications will appear after someone submits the form.</span></div>`;

  applicantList.querySelectorAll("[data-applicant-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.applicantId;
      writeJson("selectedApplicantId", id);
      renderApplicantDashboard(id);
    });
  });
}

function renderApplicantDetail(application, bookings) {
  if (!application) {
    applicantDetail.innerHTML = `
      <div class="empty-admin-state">
        <strong>No applicant selected</strong>
        <span>Choose an applicant to review their answers and update their funnel stage.</span>
      </div>
    `;
    return;
  }

  writeJson("selectedApplicantId", application.id);
  const stage = getApplicantStage(application, bookings);
  const latestBooking = getLatestBookingForApplicant(application, bookings);
  const details = application.details || {};

  applicantDetail.innerHTML = `
    <div class="applicant-detail-header">
      <div>
        <p class="section-kicker">Applicant</p>
        <h2>${escapeHtml(getApplicantName(application))}</h2>
        <a href="mailto:${escapeHtml(application.email || "")}">${escapeHtml(application.email || "No email")}</a>
        ${application.phone ? `<a href="${escapeHtml(phoneHref(application.phone))}">${escapeHtml(application.phone)}</a>` : ""}
      </div>
      <span class="stage-pill">${escapeHtml(getStageLabel(stage))}</span>
    </div>

    <div class="stage-actions" aria-label="Update applicant stage">
      ${funnelStages.map((item) => `
        <button class="${item.value === stage ? "selected" : ""}" type="button" data-stage="${item.value}">
          ${escapeHtml(item.label)}
        </button>
      `).join("")}
    </div>

    <div class="admin-next-actions">
      <a href="${escapeHtml(linkedPageUrl("pma-agreement.html", application.id))}">Open PMA Agreement</a>
      <a href="${escapeHtml(linkedPageUrl("payment.html", application.id))}">Open Payment Page</a>
    </div>

    <div class="admin-detail-grid">
      <article>
        <h3>Application</h3>
        <dl>
          <div><dt>Submitted</dt><dd>${escapeHtml(formatDateTime(application.submittedAt))}</dd></div>
          <div><dt>Phone</dt><dd>${escapeHtml(application.phone || "Not provided")}</dd></div>
          <div><dt>Details</dt><dd>${escapeHtml(application.detailsSubmittedAt ? formatDateTime(application.detailsSubmittedAt) : "Not completed")}</dd></div>
          <div><dt>SendFox</dt><dd>${escapeHtml(formatSendFoxStatus(application.sendFox))}</dd></div>
          <div><dt>PMA</dt><dd>${escapeHtml(formatPmaStatus(application.pma))}</dd></div>
          <div><dt>Payment</dt><dd>${escapeHtml(formatPaymentStatus(application.payment))}</dd></div>
          <div><dt>Payment Confirmation</dt><dd>${escapeHtml(formatPaymentReview(application.payment))}</dd></div>
        </dl>
      </article>

      <article>
        <h3>Alignment Call</h3>
        ${latestBooking ? `
          <dl>
            <div><dt>Your Date</dt><dd>${escapeHtml(formatDateForDisplay(latestBooking.selectedDateCentral || latestBooking.selectedDate))}</dd></div>
            <div><dt>Your Time</dt><dd>${escapeHtml(`${latestBooking.selectedTimeCentral || latestBooking.selectedTime || ""} ${latestBooking.ownerTimeZoneLabel || ownerTimeZoneLabel}`)}</dd></div>
            ${latestBooking.selectedTimeApplicant && latestBooking.selectedTimeApplicant !== (latestBooking.selectedTimeCentral || latestBooking.selectedTime) ? `<div><dt>Applicant Time</dt><dd>${escapeHtml(`${formatDateForDisplay(latestBooking.selectedDateApplicant || latestBooking.selectedDate)} ${latestBooking.selectedTimeApplicant} ${latestBooking.applicantTimeZoneLabel || ""}`)}</dd></div>` : ""}
            <div><dt>Timezone Check</dt><dd>${escapeHtml(formatBookingShort(latestBooking))}</dd></div>
            <div><dt>Requested</dt><dd>${escapeHtml(formatDateTime(latestBooking.requestedAt))}</dd></div>
            <div><dt>Google Calendar</dt><dd>${escapeHtml(formatCalendarStatus(latestBooking.calendar))}</dd></div>
          </dl>
        ` : `<p>No call booked yet.</p>`}
      </article>
    </div>

    <div class="application-answers">
      <h3>Answers</h3>
      ${renderAnswer("What are you building right now?", details.project)}
      ${renderAnswer("Why does Founders' Circle feel aligned?", details.alignment)}
      ${renderAnswer("What help would move the project forward?", details.needs)}
      ${renderAnswer("Willing to support other members?", details.willingToSupport ? "Yes" : "Not confirmed yet")}
      ${renderAnswer("How can they support other members?", details.contribution)}
      ${renderAnswer("What does weekly commitment look like?", details.commitment)}
      ${renderAnswer("Anything else to know before the call?", details.context)}
      ${renderAnswer("Active member agreement", details.activeMember ? "Accepted" : "Not accepted yet")}
    </div>
  `;

  applicantDetail.querySelectorAll("[data-stage]").forEach((button) => {
    button.addEventListener("click", async () => {
      await setApplicantStage(application.id, button.dataset.stage);
    });
  });
}

function getApplicationsWithDerivedStages() {
  return readJson("foundersApplications", []).map((application) => ({
    stage: application.stage || null,
    ...application
  }));
}

function getApplicantStage(application, bookings = readJson("alignmentCallRequests", [])) {
  if (application.stage) return application.stage;
  if (getLatestBookingForApplicant(application, bookings)) return "call-booked";
  if (application.detailsSubmittedAt || application.details) return "details-completed";
  return "applied";
}

function getLatestBookingForApplicant(application, bookings) {
  const matched = bookings
    .filter((booking) => booking.applicantId === application.id || booking.email === application.email)
    .sort((a, b) => String(b.requestedAt || "").localeCompare(String(a.requestedAt || "")));

  return matched[0] || null;
}

async function setApplicantStage(id, stage) {
  const applications = readJson("foundersApplications", []);
  const existing = applications.find((application) => application.id === id);
  if (!existing) return;

  const updated = {
    ...existing,
    stage,
    stageUpdatedAt: new Date().toISOString()
  };
  const saved = await updateApplication({
    id,
    stage: updated.stage,
    stageUpdatedAt: updated.stageUpdatedAt
  });
  writeJson("foundersApplications", applications.map((application) => (
    application.id === id ? { ...updated, ...saved } : application
  )));
  renderApplicantDashboard(id);
}

function saveApplicantLocally(applicant) {
  const applications = readJson("foundersApplications", []);
  const exists = applications.some((item) => item.id === applicant.id);
  const updatedApplications = exists
    ? applications.map((item) => (item.id === applicant.id ? applicant : item))
    : [...applications, applicant];
  writeJson("foundersApplications", updatedApplications);
}

function getActiveOrLinkedApplicant() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("applicant");
  const applications = readJson("foundersApplications", []);
  if (id) return applications.find((application) => application.id === id) || null;
  return readJson("activeApplicant", null);
}

async function initializePaymentFlow() {
  activePaymentContext = await getPaymentContext();
  renderPaymentContextSummary(paymentApplicantSummary, activePaymentContext, "No payment session loaded. Start from the project, product, donation, or PMA approval link.");
  updatePaymentAmountText(activePaymentContext);
  updatePaymentPathLinks(activePaymentContext);
}

async function getPaymentContext() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session");
  if (sessionId) {
    const session = await getPaymentSession(sessionId);
    if (session) return { type: "session", session };
  }

  if (params.get("project")) {
    const session = await createPaymentSessionFromParams(params);
    if (session?.id && location.protocol !== "file:") {
      const url = new URL(window.location.href);
      url.search = `session=${encodeURIComponent(session.id)}`;
      history.replaceState(null, "", url.toString());
    }
    return session ? { type: "session", session } : buildPaymentContextFromParams(params);
  }

  const applicant = getActiveOrLinkedApplicant();
  if (applicant) {
    return {
      type: "applicant",
      applicant,
      projectName: "Founders' Circle",
      purpose: "Yearly membership",
      amountUsd: membershipFeeUsd
    };
  }

  const savedSession = readJson("activePaymentSession", null);
  if (savedSession) return { type: "session", session: savedSession };

  return null;
}

async function createPaymentSessionFromParams(params) {
  const payload = {
    project: params.get("project") || "freedom-unchained",
    projectName: params.get("projectName") || "",
    purpose: params.get("purpose") || "",
    amountUsd: params.get("amount") || params.get("amountUsd") || "",
    referenceId: params.get("reference") || params.get("referenceId") || "",
    payerName: params.get("name") || params.get("payerName") || "",
    payerEmail: params.get("email") || params.get("payerEmail") || "",
    returnUrl: params.get("returnUrl") || "",
    destination: params.get("destination") || params.get("project") || ""
  };

  if (location.protocol === "file:") {
    const session = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      projectKey: payload.project,
      projectName: payload.projectName || readableProjectName(payload.project),
      purpose: payload.purpose || "Payment",
      amountUsd: Number.parseFloat(payload.amountUsd) || membershipFeeUsd,
      referenceId: payload.referenceId,
      payerName: payload.payerName,
      payerEmail: payload.payerEmail,
      destination: payload.destination,
      status: "created",
      createdAt: new Date().toISOString()
    };
    writeJson("activePaymentSession", session);
    return session;
  }

  const response = await fetch(apiUrl("/payment-sessions"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const session = await response.json();
  writeJson("activePaymentSession", session);
  return session;
}

function buildPaymentContextFromParams(params) {
  const project = params.get("project") || "freedom-unchained";
  return {
    type: "session",
    session: {
      id: "",
      projectKey: project,
      projectName: params.get("projectName") || readableProjectName(project),
      purpose: params.get("purpose") || "Payment",
      amountUsd: Number.parseFloat(params.get("amount") || params.get("amountUsd")) || membershipFeeUsd,
      referenceId: params.get("reference") || params.get("referenceId") || "",
      payerName: params.get("name") || params.get("payerName") || "",
      payerEmail: params.get("email") || params.get("payerEmail") || "",
      destination: params.get("destination") || project
    }
  };
}

function readableProjectName(value) {
  return String(value || "Freedom Unchained")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function renderApplicantGateSummary(target, applicant, emptyMessage) {
  if (!target) return;

  target.innerHTML = applicant
    ? `<strong>${escapeHtml(getApplicantName(applicant))}</strong><span>${escapeHtml(applicant.email || "")}</span>`
    : `<strong>No applicant loaded</strong><span>${escapeHtml(emptyMessage)}</span>`;
}

function renderPaymentContextSummary(target, context, emptyMessage) {
  if (!target) return;

  if (!context) {
    target.innerHTML = `<strong>No payment loaded</strong><span>${escapeHtml(emptyMessage)}</span>`;
    return;
  }

  const session = context.session;
  const title = context.type === "applicant"
    ? getApplicantName(context.applicant)
    : session.projectName || readableProjectName(session.projectKey);
  const subtitle = context.type === "applicant"
    ? context.applicant.email || "Founders' Circle membership"
    : [session.purpose, session.payerEmail].filter(Boolean).join(" | ") || "Project payment";
  const amount = paymentAmountForContext(context);

  target.innerHTML = `
    <strong>${escapeHtml(title)}</strong>
    <span>${escapeHtml(subtitle)}</span>
    <span>${escapeHtml(amount)} due</span>
  `;
}

function linkedPageUrl(page, applicantId) {
  return `${page}?applicant=${encodeURIComponent(applicantId || "")}`;
}

function paymentPageUrl(page, context) {
  if (context?.type === "session" && context.session?.id) {
    return `${page}?session=${encodeURIComponent(context.session.id)}`;
  }

  const applicantId = context?.applicant?.id || new URLSearchParams(window.location.search).get("applicant") || "";
  return linkedPageUrl(page, applicantId);
}

function updatePaymentPathLinks(context) {
  if (cryptoPaymentLink) cryptoPaymentLink.href = paymentPageUrl("crypto-payment.html", context);
  if (bridgePaymentLink) bridgePaymentLink.href = paymentPageUrl("bridge-bucks-payment.html", context);
}

function updatePaymentAmountText(context) {
  paymentAmountText.forEach((item) => {
    item.textContent = paymentAmountForContext(context);
  });
}

function paymentAmountForContext(context = activePaymentContext) {
  const amount = context?.session?.amountUsd || context?.amountUsd || membershipFeeUsd;
  return `$${Number(amount).toFixed(2)}`;
}

async function lockQuoteForSelectedAsset() {
  if (!cryptoAsset?.value) {
    paymentNote.textContent = "Choose a currency first, then lock the quote.";
    return;
  }

  lockCryptoQuote.disabled = true;
  lockCryptoQuote.textContent = "Locking quote...";
  paymentNote.textContent = "";

  try {
    const context = activePaymentContext || await getPaymentContext();
    const quoteUrl = new URL(apiUrl("/crypto-quote"));
    quoteUrl.searchParams.set("asset", cryptoAsset.value);
    if (context?.type === "session" && context.session?.id) {
      quoteUrl.searchParams.set("session", context.session.id);
    } else {
      quoteUrl.searchParams.set("amountUsd", String(context?.amountUsd || membershipFeeUsd));
    }
    const response = await fetch(quoteUrl.toString());
    const quote = await response.json();

    if (!response.ok) {
      paymentNote.textContent = quote.error || "Crypto quote is unavailable right now.";
      return;
    }

    writeJson("activeCryptoQuote", quote);
    renderCryptoQuote(quote);
    paymentNote.textContent = quote.addressConfigured
      ? "Quote locked for one hour. Send the exact amount shown."
      : "Quote locked, but the receiving address is not configured yet. Do not send funds until the address is added.";
  } catch {
    paymentNote.textContent = "Crypto quote is unavailable right now. Try again in a minute.";
  } finally {
    lockCryptoQuote.disabled = false;
    lockCryptoQuote.textContent = "Lock 1-Hour Quote";
  }
}

function hydrateStoredQuote() {
  const quote = readJson("activeCryptoQuote", null);
  if (!quote || new Date(quote.expiresAt).getTime() < Date.now()) {
    writeJson("activeCryptoQuote", null);
    return;
  }

  if (cryptoAsset && quote.asset) cryptoAsset.value = quote.asset;
  renderCryptoQuote(quote);
}

function renderCryptoQuote(quote) {
  if (!cryptoQuotePanel) return;

  cryptoQuotePanel.hidden = false;
  if (quoteUsd) quoteUsd.textContent = `$${Number(quote.amountUsd || quote.membershipFeeUsd).toFixed(2)}`;
  if (quoteAmount) quoteAmount.textContent = `${quote.amountDueText} ${String(quote.asset || "").toUpperCase()}`;
  if (quoteAddress) {
    quoteAddress.textContent = quote.address || "Address not configured yet";
    quoteAddress.classList.toggle("missing-address", !quote.addressConfigured);
  }
  if (quoteConfirmations) {
    quoteConfirmations.textContent = `${quote.confirmationsRequired} confirmation${quote.confirmationsRequired === 1 ? "" : "s"}`;
  }
  if (quoteExpires) quoteExpires.textContent = formatDateTime(quote.expiresAt);
}

async function submitPaymentForReview(payment) {
  const context = activePaymentContext || await getPaymentContext();
  if (!context) {
    paymentNote.textContent = "No payment session loaded. Start from the project, product, donation, or PMA approval link.";
    return;
  }

  if (context.type === "session") {
    const updatedSession = {
      ...context.session,
      payment: {
        ...payment,
        verificationStatus: payment.method === "Crypto" ? "pending-confirmations" : "confirmation-needed",
        confirmationsRequired: payment.quote?.confirmationsRequired || null,
        status: "submitted",
        submittedAt: new Date().toISOString()
      },
      status: "payment-submitted"
    };
    const saved = await updatePaymentSession(updatedSession);
    const merged = { ...updatedSession, ...saved };
    activePaymentContext = { type: "session", session: merged };
    writeJson("activePaymentSession", merged);
    paymentNote.textContent = payment.method === "Crypto"
      ? "Transaction submitted. Payment will be confirmed after the required blockchain confirmations."
      : "Payment submitted. Confirmation will be recorded once the payment reference is verified.";
    return;
  }

  const applicant = context.applicant;

  const updatedApplicant = {
    ...applicant,
    payment: {
      ...payment,
      verificationStatus: payment.method === "Crypto" ? "pending-confirmations" : "confirmation-needed",
      confirmationsRequired: payment.quote?.confirmationsRequired || null,
      status: "submitted",
      submittedAt: new Date().toISOString()
    },
    stage: "payment",
    stageUpdatedAt: new Date().toISOString()
  };

  const saved = await updateApplication(updatedApplicant);
  const merged = { ...updatedApplicant, ...saved };
  saveApplicantLocally(merged);
  writeJson("activeApplicant", merged);
  paymentNote.textContent = payment.method === "Crypto"
    ? "Transaction submitted. Payment will be confirmed after the required blockchain confirmations."
    : "Payment submitted. Confirmation will be recorded once the payment reference is verified.";
}

function getApplicantName(application) {
  return [application.firstName, application.lastName].filter(Boolean).join(" ") || "Unnamed Applicant";
}

function getStageLabel(value) {
  return funnelStages.find((stage) => stage.value === value)?.label || "Applied";
}

function formatBookingShort(booking) {
  const centralTime = booking.selectedTimeCentral || booking.selectedTime || "";
  const centralDate = booking.selectedDateCentral || booking.selectedDate || "";
  const applicantTime = booking.selectedTimeApplicant || "";
  const applicantDate = booking.selectedDateApplicant || "";
  const applicantZone = booking.applicantTimeZoneLabel || "";

  if (applicantTime && applicantZone && applicantTime !== centralTime) {
    return `Your time: ${formatDateForDisplay(centralDate)} ${centralTime} ${ownerTimeZoneLabel} / Applicant: ${formatDateForDisplay(applicantDate || centralDate)} ${applicantTime} ${applicantZone}`;
  }

  return `Your time: ${formatDateForDisplay(centralDate)} ${centralTime} ${ownerTimeZoneLabel}`.trim();
}

function formatBookingAdminListLabel(booking) {
  const centralTime = booking.selectedTimeCentral || booking.selectedTime || "";
  const centralDate = booking.selectedDateCentral || booking.selectedDate || "";
  const applicantTime = booking.selectedTimeApplicant || "";
  const applicantDate = booking.selectedDateApplicant || "";
  const applicantZone = booking.applicantTimeZoneLabel || "";
  const yourTime = `YOUR TIME: ${formatDateForDisplay(centralDate)} ${centralTime} ${ownerTimeZoneLabel}`;

  if (applicantTime && applicantZone && (applicantTime !== centralTime || applicantDate !== centralDate)) {
    return `${yourTime} | Applicant: ${formatDateForDisplay(applicantDate || centralDate)} ${applicantTime} ${applicantZone}`;
  }

  return yourTime;
}

function formatCalendarStatus(calendar) {
  if (calendar?.status === "created") return "Added automatically";
  if (calendar?.status === "not_configured") return "Not connected yet";
  if (calendar?.status === "failed") return "Calendar add failed";
  return "Not recorded";
}

function formatDateTime(value) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function getBookingTimeZoneDetails(dateKey, centralTime) {
  const instant = zonedTimeToDate(dateKey, centralTime, ownerTimeZone);
  const applicantTimeZone = getSelectedTimeZone();

  return {
    selectedDateCentral: dateKey,
    selectedTimeCentral: centralTime,
    selectedDateApplicant: formatDateKeyForZone(instant, applicantTimeZone),
    selectedTimeApplicant: formatTimeForZone(instant, applicantTimeZone),
    ownerTimeZone,
    ownerTimeZoneLabel,
    applicantTimeZone,
    applicantTimeZoneLabel: friendlyTimeZoneLabel(applicantTimeZone),
    selectedDateTimeUtc: instant.toISOString()
  };
}

function formatTimeSlotLabel(dateKey, centralTime) {
  const applicantTimeZone = getSelectedTimeZone();
  const instant = zonedTimeToDate(dateKey, centralTime, ownerTimeZone);
  const applicantTime = formatTimeForZone(instant, applicantTimeZone);

  if (applicantTimeZone === ownerTimeZone || applicantTime === centralTime) {
    return {
      primary: `${centralTime} ${ownerTimeZoneLabel}`,
      secondary: ""
    };
  }

  return {
    primary: `${applicantTime} ${friendlyTimeZoneLabel(applicantTimeZone)}`,
    secondary: `${centralTime} ${ownerTimeZoneLabel}`
  };
}

function initializeTimeZoneSelect() {
  if (!timeZoneSelect) return;

  const browserTimeZone = getBrowserTimeZone();
  const options = normalizeTimeZoneOptions(browserTimeZone);
  timeZoneSelect.innerHTML = options.map((option) => (
    `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`
  )).join("");
  timeZoneSelect.value = options.some((option) => option.value === browserTimeZone) ? browserTimeZone : ownerTimeZone;

  timeZoneSelect.addEventListener("change", () => {
    selectedTime = "";
    if (selectedTimeInput) selectedTimeInput.value = "";
    if (selectedDate) renderTimes(selectedDate);
  });
}

function normalizeTimeZoneOptions(browserTimeZone) {
  const options = [...timeZoneOptions];
  if (browserTimeZone && !options.some((option) => option.value === browserTimeZone)) {
    options.unshift({
      value: browserTimeZone,
      label: friendlyTimeZoneLabel(browserTimeZone)
    });
  }
  return options;
}

function getSelectedTimeZone() {
  return timeZoneSelect?.value || getBrowserTimeZone();
}

function getBrowserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || ownerTimeZone;
}

function friendlyTimeZoneLabel(timeZone) {
  if (timeZone === "America/Chicago") return "Central Time";
  if (timeZone === "America/Los_Angeles") return "Pacific Time";
  if (timeZone === "America/Denver") return "Mountain Time";
  if (timeZone === "America/New_York") return "Eastern Time";
  if (timeZone === "America/Anchorage") return "Alaska Time";
  if (timeZone === "Pacific/Honolulu") return "Hawaii Time";
  if (timeZone === "America/Phoenix") return "Arizona Time";
  if (timeZone === "UTC") return "UTC";
  return timeZone.replaceAll("_", " ");
}

function zonedTimeToDate(dateKey, time, timeZone) {
  const { year, month, day } = parseDateKey(dateKey);
  const { hour, minute } = parseTimeTo24Hour(time);
  let timestamp = Date.UTC(year, month - 1, day, hour, minute);

  for (let index = 0; index < 3; index += 1) {
    const offset = getTimeZoneOffset(new Date(timestamp), timeZone);
    timestamp = Date.UTC(year, month - 1, day, hour, minute) - offset;
  }

  return new Date(timestamp);
}

function getTimeZoneOffset(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(date).reduce((values, part) => {
    if (part.type !== "literal") values[part.type] = Number(part.value);
    return values;
  }, {});

  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour % 24, parts.minute, parts.second);
  return asUtc - date.getTime();
}

function parseDateKey(dateKey) {
  const [year, month, day] = String(dateKey || "").split("-").map(Number);
  return { year, month, day };
}

function parseTimeTo24Hour(time) {
  const match = String(time || "").match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return { hour: 0, minute: 0 };
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridian = match[3].toUpperCase();
  if (meridian === "PM" && hour !== 12) hour += 12;
  if (meridian === "AM" && hour === 12) hour = 0;
  return { hour, minute };
}

function formatTimeForZone(date, timeZone) {
  return date.toLocaleTimeString(undefined, {
    timeZone,
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatDateKeyForZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date).reduce((values, part) => {
    if (part.type !== "literal") values[part.type] = part.value;
    return values;
  }, {});

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function formatSendFoxStatus(value) {
  if (!value) return "Not configured";
  if (value.synced) return `Synced${value.contactId ? ` #${value.contactId}` : ""}`;
  return value.status ? `Needs attention (${value.status})` : "Needs attention";
}

function formatPmaStatus(value) {
  if (!value?.signedAt) return "Not signed";
  return `Signed by ${value.signedName || "applicant"} on ${formatDateTime(value.signedAt)}`;
}

function formatPaymentStatus(value) {
  if (!value?.submittedAt) return "Not submitted";
  const amount = value.amount ? ` for ${value.amount}` : "";
  const asset = value.asset ? ` (${value.asset})` : "";
  return `${value.method || "Payment"}${asset}${amount} submitted on ${formatDateTime(value.submittedAt)}`;
}

function formatPaymentReview(value) {
  if (!value?.status) return "Not started";
  if (value.verificationStatus === "pending-confirmations") {
    const count = value.confirmationsRequired ? ` (${value.confirmationsRequired} needed)` : "";
    return `Pending blockchain confirmations${count}`;
  }
  if (value.verificationStatus === "confirmation-needed") return "Confirmation needed";
  if (value.status === "submitted") return "Submitted for confirmation";
  if (value.status === "confirmed") return "Confirmed";
  if (value.status === "needs-attention") return "Needs attention";
  return value.status;
}

function renderAnswer(label, value) {
  return `
    <article>
      <h4>${escapeHtml(label)}</h4>
      <p>${escapeHtml(value || "No answer yet.")}</p>
    </article>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeInternationalPhone(countryCode, phone) {
  const rawPhone = String(phone || "").trim();
  if (!rawPhone) return "";

  const collapsedPhone = rawPhone.replace(/\s+/g, " ");
  if (collapsedPhone.startsWith("+")) return collapsedPhone;
  if (collapsedPhone.startsWith("00")) return `+${collapsedPhone.slice(2).trim()}`;

  const code = String(countryCode || "")
    .trim()
    .replace(/^00/, "+")
    .replace(/[^\d+]/g, "");
  const normalizedCode = code.startsWith("+") ? code : `+${code || "1"}`;
  return `${normalizedCode} ${collapsedPhone}`;
}

function phoneHref(phone) {
  const normalized = String(phone || "")
    .trim()
    .replace(/^00/, "+")
    .replace(/[^\d+]/g, "");

  return normalized ? `tel:${normalized}` : "#";
}
