(function () {
  "use strict";

  // Année footer
  var yearEls = document.querySelectorAll("#year");
  yearEls.forEach(function (el) { el.textContent = new Date().getFullYear(); });

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
      b.addEventListener("click", function () { activate(b.getAttribute("data-tab-btn")); });
    });
    if (btns.length) activate(btns[0].getAttribute("data-tab-btn"));
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
  if (cookieBanner) {
    if (!getCookieChoice()) cookieBanner.hidden = false;
    if (cookieAccept) cookieAccept.addEventListener("click", function () { setCookieChoice("accepted"); cookieBanner.hidden = true; });
    if (cookieRefuse) cookieRefuse.addEventListener("click", function () { setCookieChoice("refused"); cookieBanner.hidden = true; });
    if (cookieManage) cookieManage.addEventListener("click", function () { cookieBanner.hidden = false; });
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
})();
