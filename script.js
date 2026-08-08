/* =========================================================
   Hasanzee Group — Registration Form Logic
   =========================================================
   IMPORTANT — ONE PLACE TO EDIT:
   Paste your Google Apps Script Web App URL below.
   It looks like:
   https://script.google.com/macros/s/AKfycbx.../exec
   ========================================================= */
const GAS_WEB_APP_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Smooth scroll for "Register Now" buttons ---------- */
  document.querySelectorAll("[data-scroll-to]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-scroll-to");
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        // move focus to the first field shortly after scrolling, helps keyboard/mobile users
        setTimeout(() => {
          const firstField = document.getElementById("fullName");
          if (firstField) firstField.focus({ preventScroll: true });
        }, 500);
      }
    });
  });

  /* ---------- Elements ---------- */
  const form = document.getElementById("regForm");
  const formCard = document.getElementById("formCard");
  const successBox = document.getElementById("successBox");
  const submitBtn = document.getElementById("submitBtn");
  const submitBtnText = document.getElementById("submitBtnText");
  const submitSpinner = document.getElementById("submitSpinner");
  const formNote = document.getElementById("formNote");
  const registerAnotherBtn = document.getElementById("registerAnotherBtn");

  const qualificationSelect = document.getElementById("qualification");
  const qualOtherWrap = document.getElementById("qualOtherWrap");
  const qualificationOtherInput = document.getElementById("qualificationOther");

  const fields = {
    fullName: document.getElementById("fullName"),
    address: document.getElementById("address"),
    pinCode: document.getElementById("pinCode"),
    qualification: document.getElementById("qualification"),
    mobile: document.getElementById("mobile"),
    course: document.getElementById("course"),
  };

  const ALLOWED_COURSES = [
    "Computer Application & Basic of C & Python",
    "Garments Manufacturing (Tailoring)",
    "RACW MECHANIC (AC, FREEZE, WASHING MACHINE SERVICE)",
  ];

  let isSubmitting = false;

  /* ---------- Detect where the visitor came from ----------
     Priority:
     1. ?utm_source= or ?source= in the URL (set this on each ad's link,
        e.g. ...?utm_source=instagram or ...?utm_source=facebook)
     2. The referring page (in-app browsers usually keep this)
     3. Falls back to "Website" for anyone who typed/bookmarked the URL directly
     The backend re-validates this against an allowed list — the value here
     is a hint, not something the backend blindly trusts. */
  function detectSource() {
    const params = new URLSearchParams(window.location.search);
    const fromParam = (params.get("utm_source") || params.get("source") || "").toLowerCase();
    if (fromParam.includes("instagram")) return "Instagram";
    if (fromParam.includes("facebook") || fromParam === "fb") return "Facebook";
    if (fromParam) return "Website"; // an unrecognized param value — don't guess further

    const ref = (document.referrer || "").toLowerCase();
    if (ref.includes("instagram.com")) return "Instagram";
    if (ref.includes("facebook.com") || ref.includes("fb.com")) return "Facebook";

    return "Website";
  }
  const detectedSource = detectSource();

  /* ---------- Show/hide "Other" qualification field ---------- */
  qualificationSelect.addEventListener("change", () => {
    if (qualificationSelect.value === "Other") {
      qualOtherWrap.hidden = false;
    } else {
      qualOtherWrap.hidden = true;
      qualificationOtherInput.value = "";
    }
  });

  /* ---------- Restrict PIN code & mobile to digits only while typing ---------- */
  fields.pinCode.addEventListener("input", () => {
    fields.pinCode.value = fields.pinCode.value.replace(/\D/g, "").slice(0, 6);
  });
  fields.mobile.addEventListener("input", () => {
    fields.mobile.value = fields.mobile.value.replace(/\D/g, "").slice(0, 10);
  });

  /* ---------- Clear individual field errors as the user fixes them ---------- */
  Object.entries(fields).forEach(([name, el]) => {
    const evt = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(evt, () => clearFieldError(name));
  });

  function setFieldError(name, message) {
    const el = fields[name];
    const errEl = document.getElementById("err-" + name);
    if (el) el.classList.add("invalid");
    if (errEl) errEl.textContent = message;
  }

  function clearFieldError(name) {
    const el = fields[name];
    const errEl = document.getElementById("err-" + name);
    if (el) el.classList.remove("invalid");
    if (errEl) errEl.textContent = "";
  }

  function clearAllErrors() {
    Object.keys(fields).forEach(clearFieldError);
    hideNote();
  }

  function showNote(message, type = "error") {
    formNote.textContent = message;
    formNote.hidden = false;
    formNote.classList.toggle("field__note--info", type === "info");
  }

  function hideNote() {
    formNote.hidden = true;
    formNote.textContent = "";
    formNote.classList.remove("field__note--info");
  }

  /* ---------- Validation ---------- */
  function validateForm(data) {
    let valid = true;

    if (!data.fullName || data.fullName.trim().length === 0) {
      setFieldError("fullName", "Please enter your full name.");
      valid = false;
    } else if (data.fullName.trim().length > 100) {
      setFieldError("fullName", "Name is too long.");
      valid = false;
    }

    if (!data.address || data.address.trim().length === 0) {
      setFieldError("address", "Please enter your address.");
      valid = false;
    } else if (data.address.trim().length > 300) {
      setFieldError("address", "Address is too long.");
      valid = false;
    }

    if (!/^[0-9]{6}$/.test(data.pinCode || "")) {
      setFieldError("pinCode", "Enter a valid 6-digit PIN code.");
      valid = false;
    }

    if (!data.qualification) {
      setFieldError("qualification", "Please select your qualification.");
      valid = false;
    } else if (data.qualification === "Other" && (!data.qualificationOther || !data.qualificationOther.trim())) {
      setFieldError("qualification", "Please specify your qualification.");
      valid = false;
    }

    if (!/^[6-9][0-9]{9}$/.test(data.mobile || "")) {
      setFieldError("mobile", "Enter a valid 10-digit mobile number.");
      valid = false;
    }

    if (!data.course || !ALLOWED_COURSES.includes(data.course)) {
      setFieldError("course", "Please select a course.");
      valid = false;
    }

    return valid;
  }

  function getFormData() {
    return {
      fullName: fields.fullName.value.trim(),
      address: fields.address.value.trim(),
      pinCode: fields.pinCode.value.trim(),
      qualification: fields.qualification.value === "Other"
        ? (qualificationOtherInput.value.trim() || "Other")
        : fields.qualification.value,
      mobile: fields.mobile.value.trim(),
      course: fields.course.value,
      source: detectedSource,
    };
  }

  function setSubmittingState(submitting) {
    isSubmitting = submitting;
    submitBtn.disabled = submitting;
    submitBtnText.textContent = submitting ? "Submitting..." : "Submit Registration";
    submitSpinner.hidden = !submitting;
  }

  /* ---------- Submit handler ---------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // guards against double-click / double-tap

    clearAllErrors();
    const data = getFormData();

    if (!validateForm(data)) {
      showNote("Please fix the highlighted fields and try again.");
      // scroll to the first invalid field
      const firstInvalid = document.querySelector(".invalid");
      if (firstInvalid) firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (GAS_WEB_APP_URL.indexOf("PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE") !== -1) {
      showNote("Setup incomplete: the Google Apps Script Web App URL has not been added to script.js yet.");
      return;
    }

    setSubmittingState(true);

    try {
      const response = await fetch(GAS_WEB_APP_URL, {
        method: "POST",
        // Using text/plain avoids a CORS "preflight" (OPTIONS) request, which
        // Google Apps Script Web Apps do not handle. The Apps Script backend
        // still parses this as JSON via JSON.parse(e.postData.contents).
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok (" + response.status + ")");
      }

      const result = await response.json();

      if (result && result.success) {
        showSuccess();
      } else if (result && result.duplicate) {
        showNote(result.message || "This mobile number is already registered. Our team will contact you soon.", "info");
      } else {
        showNote((result && result.message) || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Registration submit error:", err);
      showNote("Something went wrong. Please check your internet connection and try again.");
    } finally {
      setSubmittingState(false);
    }
  });

  function showSuccess() {
    form.hidden = true;
    successBox.hidden = false;
    formCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  registerAnotherBtn.addEventListener("click", () => {
    form.reset();
    clearAllErrors();
    qualOtherWrap.hidden = true;
    successBox.hidden = true;
    form.hidden = false;
    document.getElementById("fullName").focus();
    formCard.scrollIntoView({ behavior: "smooth", block: "start" });
  });

});
