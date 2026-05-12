const body = document.body;
const headerShell = document.querySelector(".header-shell");
const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = document.querySelectorAll(".site-nav a");
const form = document.getElementById("waitlist-form");
const statusNode = document.getElementById("form-status");
const submitButton = form?.querySelector(".submit-button");
const customSelects = document.querySelectorAll("[data-custom-select]");

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

function closeCustomSelect(select) {
  const trigger = select?.querySelector("[data-custom-select-trigger]");
  const menu = select?.querySelector("[data-custom-select-menu]");

  if (!select || !trigger || !menu) {
    return;
  }

  select.classList.remove("is-open");
  trigger.setAttribute("aria-expanded", "false");
  menu.hidden = true;
}

function syncCustomSelect(select, value = "") {
  const shell = select?.closest(".select-shell");
  const hiddenInput = shell?.querySelector("[data-custom-select-input]");
  const mobileSelect = shell?.querySelector("[data-custom-select-mobile]");
  const trigger = select?.querySelector("[data-custom-select-trigger]");
  const valueNode = select?.querySelector("[data-custom-select-value]");
  const options = select?.querySelectorAll("[data-value]");

  if (!shell || !hiddenInput || !mobileSelect || !trigger || !valueNode || !options?.length) {
    return;
  }

  hiddenInput.value = value;
  mobileSelect.value = value;

  const selectedOption = Array.from(options).find((option) => option.dataset.value === value);

  if (selectedOption) {
    valueNode.textContent = selectedOption.textContent || "Select one";
    trigger.classList.remove("is-placeholder");
  } else {
    valueNode.textContent = "Select one";
    trigger.classList.add("is-placeholder");
  }

  options.forEach((option) => {
    option.classList.toggle("is-selected", option.dataset.value === value);
  });
}

customSelects.forEach((select) => {
  const shell = select.closest(".select-shell");
  const hiddenInput = shell?.querySelector("[data-custom-select-input]");
  const mobileSelect = shell?.querySelector("[data-custom-select-mobile]");
  const trigger = select.querySelector("[data-custom-select-trigger]");
  const menu = select.querySelector("[data-custom-select-menu]");
  const options = select.querySelectorAll("[data-value]");

  if (!shell || !hiddenInput || !mobileSelect || !trigger || !menu || !options.length) {
    return;
  }

  syncCustomSelect(select, hiddenInput.value || mobileSelect.value || "");

  trigger.addEventListener("click", () => {
    const isOpen = select.classList.contains("is-open");

    customSelects.forEach((node) => {
      if (node !== select) {
        closeCustomSelect(node);
      }
    });

    select.classList.toggle("is-open", !isOpen);
    trigger.setAttribute("aria-expanded", String(!isOpen));
    menu.hidden = isOpen;
  });

  options.forEach((option) => {
    option.addEventListener("click", () => {
      syncCustomSelect(select, option.dataset.value || "");
      closeCustomSelect(select);
    });
  });

  mobileSelect.addEventListener("change", () => {
    syncCustomSelect(select, mobileSelect.value);
  });
});

document.addEventListener("click", (event) => {
  if (headerShell?.classList.contains("is-nav-open") && !headerShell.contains(event.target)) {
    setNavOpen(false);
  }

  customSelects.forEach((select) => {
    if (!select.contains(event.target)) {
      closeCustomSelect(select);
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setNavOpen(false);
    customSelects.forEach((select) => closeCustomSelect(select));
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

  const interestInput = form.querySelector('input[name="interest"]');
  const focusInput = form.querySelector('input[name="focus"]');

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
    customSelects.forEach((select) => syncCustomSelect(select, ""));
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
