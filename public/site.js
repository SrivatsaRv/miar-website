const body = document.body;
const headerShell = document.querySelector(".header-shell");
const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = document.querySelectorAll(".site-nav a");
const form = document.getElementById("waitlist-form");
const statusNode = document.getElementById("form-status");
const customSelects = document.querySelectorAll("[data-custom-select]");

function setNavOpen(isOpen) {
  if (!headerShell || !navToggle) {
    return;
  }

  headerShell.classList.toggle("is-nav-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  body.classList.toggle("nav-open", isOpen);
}

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

function resetCustomSelect(select) {
  const input = select?.querySelector("[data-custom-select-input]");
  const trigger = select?.querySelector("[data-custom-select-trigger]");
  const valueNode = select?.querySelector("[data-custom-select-value]");
  const options = select?.querySelectorAll("[data-value]");

  if (input) {
    input.value = "";
  }

  if (trigger) {
    trigger.classList.add("is-placeholder");
  }

  if (valueNode) {
    valueNode.textContent = "Select one";
  }

  options?.forEach((node) => {
    node.classList.remove("is-selected");
  });

  closeCustomSelect(select);
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

customSelects.forEach((select) => {
  const input = select.querySelector("[data-custom-select-input]");
  const trigger = select.querySelector("[data-custom-select-trigger]");
  const valueNode = select.querySelector("[data-custom-select-value]");
  const menu = select.querySelector("[data-custom-select-menu]");
  const options = select.querySelectorAll("[data-value]");

  if (!input || !trigger || !valueNode || !menu || !options.length) {
    return;
  }

  resetCustomSelect(select);

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
      input.value = option.dataset.value || "";
      valueNode.textContent = option.textContent || "";
      trigger.classList.remove("is-placeholder");

      options.forEach((node) => {
        node.classList.toggle("is-selected", node === option);
      });

      closeCustomSelect(select);
    });
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

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const interestInput = form.querySelector("[data-custom-select-input]");

  if (interestInput && !interestInput.value) {
    setStatus("Select a primary interest before submitting.", "is-error");
    return;
  }

  setStatus("Submitting request...");

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
    customSelects.forEach((select) => resetCustomSelect(select));
    setStatus(result.message || "Request received. MIAR will be in touch.", "is-success");
  } catch (error) {
    setStatus(error.message || "Something went wrong. Please try again.", "is-error");
  }
});
