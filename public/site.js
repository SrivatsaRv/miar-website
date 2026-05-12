const body = document.body;
const headerShell = document.querySelector(".header-shell");
const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = document.querySelectorAll(".site-nav a");
const form = document.getElementById("waitlist-form");
const statusNode = document.getElementById("form-status");
const submitButton = form?.querySelector(".submit-button");

function setNavOpen(isOpen) {
  if (!headerShell || !navToggle) {
    return;
  }

  headerShell.classList.toggle("is-nav-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  body.classList.toggle("nav-open", isOpen);
}

navToggle?.addEventListener("click", () => {
  const isOpen = headerShell?.classList.contains("is-nav-open");
  setNavOpen(!isOpen);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 980) {
    setNavOpen(false);
  }
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setNavOpen(false);
  });
});

document.addEventListener("click", (event) => {
  if (headerShell?.classList.contains("is-nav-open") && !headerShell.contains(event.target)) {
    setNavOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setNavOpen(false);
  }
});

function setStatus(message, type = "") {
  if (!statusNode) {
    return;
  }

  statusNode.textContent = message;
  statusNode.classList.remove("is-success", "is-error");

  if (type) {
    statusNode.classList.add(type);
  }
}

function setSubmittingState(isSubmitting) {
  if (!form || !submitButton) {
    return;
  }

  form.setAttribute("aria-busy", String(isSubmitting));
  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? "Recording request..." : "Request access";
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const interestInput = form.querySelector('select[name="interest"]');
  const focusInput = form.querySelector('select[name="focus"]');

  if (interestInput && !interestInput.value) {
    setStatus("Select a primary workflow before submitting.", "is-error");
    return;
  }

  if (focusInput && !focusInput.value) {
    setStatus("Select an operating focus before submitting.", "is-error");
    return;
  }

  setSubmittingState(true);
  setStatus("Recording request...");

  const formData = new FormData(form);

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.error || "Submission failed.");
    }

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
