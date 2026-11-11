(function () {
  "use strict";

  /* ========================================================
     Switch between the two views
     ======================================================== */
  var corpo = document.body;
  var interruptor = document.getElementById("interruptor");
  var visaoMau = document.getElementById("visao-mau");
  var visaoBom = document.getElementById("visao-bom");
  var DURACAO_FADE = 350;
  var emTransicao = false;

  function modoAtual() {
    return corpo.classList.contains("modo-bom") ? "bom" : "mau";
  }

  function aplicarModo(modo) {
    var bom = modo === "bom";
    corpo.classList.toggle("modo-bom", bom);
    corpo.classList.toggle("modo-mau", !bom);
    visaoMau.hidden = bom;
    visaoBom.hidden = !bom;
    interruptor.setAttribute("aria-checked", String(bom));
    window.scrollTo(0, 0);
  }

  function alternar() {
    if (emTransicao) return;
    emTransicao = true;
    var seguinte = modoAtual() === "mau" ? "bom" : "mau";

    corpo.classList.add("em-transicao");
    window.setTimeout(function () {
      aplicarModo(seguinte);
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          corpo.classList.remove("em-transicao");
          window.setTimeout(function () {
            emTransicao = false;
          }, DURACAO_FADE);
        });
      });
    }, DURACAO_FADE);
  }

  /* ========================================================
     Start-up: view 1 (bad use) is the default view
     ======================================================== */
  function modoInicial() {
    var escolha = new URLSearchParams(window.location.search).get("modo");
    if (escolha === "ferramenta") return "bom";
    if (escolha === "operador") return "mau";
    return "mau";
  }

  /* ========================================================
     View 2: each section lets the visitor pick between three looks
     ======================================================== */
  document.querySelectorAll(".estilo").forEach(function (grupo) {
    var seccao = grupo.closest("[data-estilo]");
    var botoes = grupo.querySelectorAll("button");
    botoes.forEach(function (botao) {
      botao.addEventListener("click", function () {
        var escolha = botao.getAttribute("data-escolha");
        if (seccao.getAttribute("data-estilo") === escolha) return;
        seccao.classList.add("a-trocar");
        window.setTimeout(function () {
          seccao.setAttribute("data-estilo", escolha);
          botoes.forEach(function (b) {
            b.setAttribute("aria-pressed", String(b === botao));
          });
          seccao.classList.remove("a-trocar");
        }, 150);
      });
    });
  });

  interruptor.addEventListener("click", alternar);
  aplicarModo(modoInicial());
})();