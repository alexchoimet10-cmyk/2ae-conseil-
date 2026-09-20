(function () {
  "use strict";

  // Année footer
  var yearEls = document.querySelectorAll("#year");
  yearEls.forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // ---- Favicon ----
  // Injecté en JS pour garantir sa présence sur toutes les pages sans dupliquer
  // la balise <link> dans chacune d'elles.
  if (!document.querySelector('link[rel="icon"]')) {
    var favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/png";
    favicon.href = "img/favicon.png";
    document.head.appendChild(favicon);
  }

  // Burger mobile nav
  var burger = document.getElementById("burger");
  var navLinks = document.getElementById("navLinks");
  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // ---- Onglets génériques (accompagnements / secteurs) ----
  // Structure attendue : [data-tabs] contient des boutons [data-tab-btn="id"]
  // et des panneaux [data-tab-panel="id"]
  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    var btns = group.querySelectorAll("[data-tab-btn]");
    var panels = group.querySelectorAll("[data-tab-panel]");
    function activate(id) {
      btns.forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-tab-btn") === id); });
      panels.forEach(function (p) { p.hidden = p.getAttribute("data-tab-panel") !== id; });
    }
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        activate(b.getAttribute("data-tab-btn"));
        history.replaceState(null, "", "#" + b.getAttribute("data-tab-btn"));
      });
    });
    // Ouvre directement le bon onglet si l'URL contient une ancre (#creation, #dirigeant...)
    // -> utile pour les liens entrants et les redirections depuis l'ancien site
    var hashId = window.location.hash ? window.location.hash.slice(1) : "";
    var hashBtn = hashId ? group.querySelector('[data-tab-btn="' + hashId + '"]') : null;
    if (btns.length) activate(hashBtn ? hashId : btns[0].getAttribute("data-tab-btn"));
    if (hashBtn) hashBtn.scrollIntoView({ block: "start", behavior: "instant" });
  });

  // ---- Filtres par catégorie (page Guides) ----
  // Structure attendue : [data-filter-group] contient des boutons [data-filter-btn="cat"]
  // et des cartes [data-filter-item][data-category="cat"]
  document.querySelectorAll("[data-filter-group]").forEach(function (group) {
    var btns = group.querySelectorAll("[data-filter-btn]");
    var items = document.querySelectorAll("[data-filter-item]");
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var cat = b.getAttribute("data-filter-btn");
        btns.forEach(function (x) { x.classList.toggle("is-active", x === b); });
        items.forEach(function (it) {
          var show = cat === "tous" || it.getAttribute("data-category") === cat;
          it.hidden = !show;
        });
      });
    });
  });

  // ---- Bandeau cookies (RGPD) ----
  var cookieBanner = document.getElementById("cookieBanner");
  var cookieAccept = document.getElementById("cookieAccept");
  var cookieRefuse = document.getElementById("cookieRefuse");
  var cookieManage = document.getElementById("cookieManage");
  function getCookieChoice() {
    try { return localStorage.getItem("2ae_cookie_choice"); } catch (e) { return null; }
  }
  function setCookieChoice(v) {
    try { localStorage.setItem("2ae_cookie_choice", v); } catch (e) {}
  }

  // ---- Mesure d'audience (Google Analytics 4) ----
  // Chargée uniquement si l'utilisateur a accepté les cookies (RGPD).
  // ID de mesure PROVISOIRE : à remplacer par le véritable identifiant GA4
  // du client une fois le nom de domaine définitif en place, puis à activer
  // en retirant la vérification "XXXXXXXXXX" ci-dessous.
  var GA_MEASUREMENT_ID = "G-R3ZBMSRZTH";
  function loadAnalytics() {
    if (window.__gaLoaded || GA_MEASUREMENT_ID.indexOf("XXXXXXXXXX") !== -1) return;
    window.__gaLoaded = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
  }
  if (getCookieChoice() === "accepted") loadAnalytics();

  if (cookieBanner) {
    if (!getCookieChoice()) cookieBanner.hidden = false;
    if (cookieAccept) cookieAccept.addEventListener("click", function () { setCookieChoice("accepted"); cookieBanner.hidden = true; loadAnalytics(); });
    if (cookieRefuse) cookieRefuse.addEventListener("click", function () { setCookieChoice("refused"); cookieBanner.hidden = true; });
    if (cookieManage) cookieManage.addEventListener("click", function () { cookieBanner.hidden = false; });
  }

  // ---- Anti-spam (honeypot) sur le formulaire de contact ----
  // Champ invisible que seuls les robots remplissent : si rempli, on bloque
  // silencieusement l'envoi.
  var contactForm = document.querySelector(".form-card");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var trap = contactForm.querySelector('input[name="site_web"]');
      if (trap && trap.value) {
        return false;
      }
      var submitBtn = contactForm.querySelector('button[type="submit"]');
      var originalBtnLabel = submitBtn ? submitBtn.textContent : "";
      var existingMsg = contactForm.querySelector(".form-feedback-msg");
      if (existingMsg) { existingMsg.remove(); }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Envoi en cours...";
      }
      var formData = new FormData(contactForm);
      fetch(contactForm.getAttribute("action"), {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: formData
      })
        .then(function (response) {
          if (!response.ok) { throw new Error("network"); }
          return response.json();
        })
        .then(function () {
          contactForm.reset();
          var msg = document.createElement("p");
          msg.className = "form-feedback-msg form-feedback-msg--success";
          msg.textContent = "Votre message a bien ete envoye. Nous vous repondrons rapidement.";
          contactForm.appendChild(msg);
        })
        .catch(function () {
          var msg = document.createElement("p");
          msg.className = "form-feedback-msg form-feedback-msg--error";
          msg.textContent = "Une erreur est survenue lors de l'envoi. Merci de reessayer ou de nous appeler directement.";
          contactForm.appendChild(msg);
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnLabel;
          }
        });
    });
  }

  // ---- Présélection du sujet sur le formulaire de contact via ?sujet= ----
  var subjectSelect = document.getElementById("contactSubject");
  if (subjectSelect) {
    var params = new URLSearchParams(window.location.search);
    var sujet = params.get("sujet");
    if (sujet) {
      var opt = subjectSelect.querySelector('option[value="' + sujet + '"]');
      if (opt) subjectSelect.value = sujet;
    }
  }

  // ---- Téléchargement des guides PDF (page Guides) ----
  // Les PDF sont stockés encodés en base64 (guides/<nom>.b64) pour rester de simples
  // fichiers texte sur GitHub Pages. On les récupère, on les décode, puis on déclenche
  // le téléchargement via un Blob.
  window.downloadGuide = function (el, filename) {
    var base = filename.replace(/\.pdf$/i, "");
    var originalText = el ? el.textContent : "";
    if (el) el.textContent = "Préparation du téléchargement…";
    fetch("guides/" + base + ".b64")
      .then(function (r) {
        if (!r.ok) throw new Error("fetch failed");
        return r.text();
      })
      .then(function (b64) {
        b64 = b64.trim();
        var byteChars = atob(b64);
        var byteNumbers = new Array(byteChars.length);
        for (var i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
        var byteArray = new Uint8Array(byteNumbers);
        var blob = new Blob([byteArray], { type: "application/pdf" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      })
      .catch(function () {
        alert("Le téléchargement a échoué. Merci de réessayer ou de nous contacter.");
      })
      .then(function () {
        if (el) el.textContent = originalText;
      });
    return false;
  };
})();
