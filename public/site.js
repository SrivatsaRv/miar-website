const body = document.body;
const header = document.querySelector("[data-site-header]");
const headerShell = document.querySelector(".header-shell");
const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = document.querySelectorAll(".site-nav a");
const navGroupToggles = document.querySelectorAll("[data-nav-group-toggle]");
const form = document.getElementById("waitlist-form");
const statusNode = document.getElementById("form-status");
const submitButton = form?.querySelector(".submit-button");

/* ---------- Header ---------- */

if (header?.classList.contains("site-header-home")) {
  const pinnedHero = document.querySelector(".field-hero");
  // Stay transparent while the dark hero sits under the header (rect-based, so page zoom is safe).
  const syncHeader = () => {
    const pinned = pinnedHero && !pinnedHero.classList.contains("is-flow");
    const heroBottom = pinnedHero ? pinnedHero.getBoundingClientRect().bottom : 0;
    const headerBottom = header.getBoundingClientRect().bottom;
    const past = pinned ? heroBottom <= headerBottom + 1 : window.scrollY > 24;
    // Once the pinned hero releases, its content moves up under the header: go solid then.
    const moving = pinned && !past && heroBottom < window.innerHeight - 1;
    header.classList.toggle("is-scrolled", past);
    header.classList.toggle("is-solid-dark", moving);
  };
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
}

function setNavOpen(isOpen) {
  if (!headerShell || !navToggle) return;
  headerShell.classList.toggle("is-nav-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  body.classList.toggle("nav-open", isOpen);
}

navToggle?.addEventListener("click", () => {
  setNavOpen(!headerShell?.classList.contains("is-nav-open"));
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 920) setNavOpen(false);
});

navLinks.forEach((link) => link.addEventListener("click", () => setNavOpen(false)));

navGroupToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const isOpen = toggle.closest(".nav-group")?.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  });
});

document.addEventListener("click", (event) => {
  if (headerShell?.classList.contains("is-nav-open") && !headerShell.contains(event.target)) {
    setNavOpen(false);
  }
  document.querySelectorAll(".nav-group.is-open").forEach((group) => {
    if (!group.contains(event.target)) {
      group.classList.remove("is-open");
      group.querySelector("[data-nav-group-toggle]")?.setAttribute("aria-expanded", "false");
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setNavOpen(false);
});

/* ---------- Theme ---------- */

const themeToggle = document.querySelector("[data-theme-toggle]");
const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
const currentTheme = () => document.documentElement.dataset.theme || (darkQuery.matches ? "dark" : "light");

themeToggle?.addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("miar-theme", next);
  } catch {}
});

/* ---------- Request form ---------- */

const messages = {
  email: "Enter your work email.",
  emailFormat: "Enter a valid email address.",
  interest: "Select a primary workflow before submitting.",
  focus: "Select an operating focus before submitting.",
};

function setStatus(message, type = "") {
  if (!statusNode) return;
  statusNode.textContent = message;
  statusNode.classList.remove("is-success", "is-error");
  if (type) statusNode.classList.add(type);
}

function setFieldError(name, message) {
  if (!form) return;
  const errorNode = form.querySelector(`[data-error-for="${name}"]`);
  if (errorNode) {
    errorNode.textContent = message || "";
    errorNode.hidden = !message;
  }
  if (name === "email") {
    form.elements.email?.setAttribute("aria-invalid", String(Boolean(message)));
  }
  if (name === "interest") {
    form.querySelector('[data-chips="interest"]')?.classList.toggle("is-invalid", Boolean(message));
  }
  if (name === "focus") {
    form.querySelector('[data-select-wrap="focus"]')?.classList.toggle("is-invalid", Boolean(message));
    form.elements.focus?.setAttribute("aria-invalid", String(Boolean(message)));
  }
}

function validate() {
  const data = new FormData(form);
  const email = String(data.get("email") || "").trim();
  const errors = {
    email: !email ? messages.email : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : messages.emailFormat,
    interest: data.get("interest") ? "" : messages.interest,
    focus: data.get("focus") ? "" : messages.focus,
  };
  Object.entries(errors).forEach(([name, message]) => setFieldError(name, message));
  return Object.values(errors).find(Boolean) || "";
}

function setSubmittingState(isSubmitting) {
  if (!form || !submitButton) return;
  form.setAttribute("aria-busy", String(isSubmitting));
  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? "Sending request…" : "Request access";
}

if (form) {
  form.noValidate = true;
  form.setAttribute("aria-busy", "false");

  form.addEventListener("change", (event) => {
    const name = event.target?.name;
    if (name && form.querySelector(`[data-error-for="${name}"]:not([hidden])`)) validate();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const firstError = validate();
    if (firstError) {
      setStatus(firstError, "is-error");
      form.querySelector('[aria-invalid="true"], .is-invalid input')?.focus();
      return;
    }

    setSubmittingState(true);
    setStatus("");

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(result.error || "Submission failed.");

      form.reset();
      setStatus(
        result.message || "Request recorded. We will review fit and reach out directly.",
        result.persisted === false ? "is-error" : "is-success"
      );
    } catch (error) {
      setStatus(error.message || "Something went wrong. Please try again.", "is-error");
    } finally {
      setSubmittingState(false);
    }
  });
}

/* ---------- Reactive sections ---------- */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealTargets = document.querySelectorAll(".section");

if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  revealTargets.forEach((node) => revealObserver.observe(node));
} else {
  revealTargets.forEach((node) => node.classList.add("is-in"));
}

const heroNode = document.querySelector(".hero");
if (heroNode && !reduceMotion) {
  heroNode.addEventListener("pointermove", (event) => {
    const rect = heroNode.getBoundingClientRect();
    heroNode.style.setProperty("--mx", `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`);
    heroNode.style.setProperty("--my", `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`);
  });
}
