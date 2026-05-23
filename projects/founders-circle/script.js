const form = document.querySelector("#founders-application");
const note = document.querySelector("#form-note");
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
const sharedKeys = [
  "foundersApplications",
  "alignmentCallRequests",
  "foundersAvailability",
  "foundersAvailabilityVersion",
  "foundersDateOverrides"
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

let visibleMonth = new Date();
visibleMonth.setDate(1);
let adminVisibleMonth = new Date();
adminVisibleMonth.setDate(1);
let selectedDate = "";
let selectedTime = "";

upgradeSavedAvailability();
syncFromServer().then(() => {
  upgradeSavedAvailability();
  refreshCurrentView();
});
let selectedPeriod = "morning";

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());
    const application = await createApplication(data);
    const applications = readJson("foundersApplications", []);
    applications.push(application);
    writeJson("foundersApplications", applications);
    writeJson("activeApplicant", application);

    note.textContent = "Application received. Continue to the next step.";
    window.location.href = "application-details.html";
  });
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
      detailsSubmittedAt: new Date().toISOString()
    };
    await updateApplication(updatedApplicant);
    writeJson("activeApplicant", updatedApplicant);

    const applications = readJson("foundersApplications", []);
    writeJson("foundersApplications", applications.map((item) => (
      item.id === updatedApplicant.id ? updatedApplicant : item
    )));

    window.location.href = "alignment-call.html";
  });
}

if (alignmentForm) {
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

    const booking = {
      applicantId: applicantForBooking.id,
      firstName: applicantForBooking.firstName,
      lastName: applicantForBooking.lastName,
      email: applicantForBooking.email,
      details: applicantForBooking.details || {},
      selectedDate: selectedDateInput.value,
      selectedTime: selectedTimeInput.value,
      requestedAt: new Date().toISOString()
    };
    const savedBooking = await createBooking(booking);
    const requests = readJson("alignmentCallRequests", []);
    requests.push(savedBooking);
    writeJson("alignmentCallRequests", requests);

    alignmentNote.textContent = `Alignment call booked for ${formatDateForDisplay(booking.selectedDate)} at ${booking.selectedTime}.`;
    selectedTime = "";
    selectedTimeInput.value = "";
    renderTimes(selectedDate);
    renderCalendar();
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
}

if (clearOverride) {
  clearOverride.addEventListener("click", async () => {
    const dateKey = overrideDateInput.value;
    if (!dateKey) {
      overrideNote.textContent = "Choose a date to clear.";
      return;
    }

    const overrides = readJson("foundersDateOverrides", {});
    delete overrides[dateKey];
    await deleteDateOverride(dateKey);
    writeJson("foundersDateOverrides", overrides);
    overrideForm.reset();
    overrideTimes.classList.remove("disabled-options");
    overrideNote.textContent = "Date override cleared.";
    renderOverrideList();
    renderAdminCalendar();
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
    button.type = "button";
    button.className = "time-slot";
    button.textContent = time;
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

function renderOverrideList() {
  if (!overrideList) return;

  const overrides = readJson("foundersDateOverrides", {});
  const entries = Object.entries(overrides).sort(([a], [b]) => a.localeCompare(b));

  overrideList.innerHTML = entries.length
    ? entries.map(([dateKey, override]) => `
      <div class="override-item">
        <strong>${formatDateForDisplay(dateKey)}</strong>
        <span>${override.blocked ? "Blocked all day" : `Custom times: ${override.times.join(", ") || "none"}`}</span>
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
      overrideDateInput.value = dateKey;
      loadOverrideForDate(dateKey);
      overrideNote.textContent = `${formatDateForDisplay(dateKey)} loaded for editing.`;
      document.querySelector(".override-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  try {
    const response = await fetch("/api/state");
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
}

async function createApplication(data) {
  if (location.protocol === "file:") {
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      ...data,
      submittedAt: new Date().toISOString()
    };
  }

  const response = await fetch("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return response.json();
}

async function updateApplication(application) {
  if (location.protocol === "file:") return application;

  await fetch(`/api/applications/${application.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(application)
  });
  return application;
}

async function createBooking(booking) {
  if (location.protocol === "file:") return booking;

  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking)
  });
  return response.json();
}

async function saveAvailability(availability) {
  if (location.protocol === "file:") return;

  await fetch("/api/availability", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ availability })
  });
}

async function saveDateOverride(dateKey, override) {
  if (location.protocol === "file:") return;

  await fetch(`/api/date-overrides/${dateKey}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(override)
  });
}

async function deleteDateOverride(dateKey) {
  if (location.protocol === "file:") return;

  await fetch(`/api/date-overrides/${dateKey}`, {
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
