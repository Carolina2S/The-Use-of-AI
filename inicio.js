(function () {
  "use strict";

  /* ========================================================
     Name of the HTML file with the switch.
     Change it here if you rename that file.
     ======================================================== */
  var DESTINO = "instalacao.html";

  /* ========================================================
     VIDEOS. One intro video per area, then one for each use.
     Change the file names here if yours are different.
       intro = plays when the area is chosen
       bom   = good use (AI as a tool)
       mau   = bad use (AI on autopilot)
     ======================================================== */
  var VIDEOS = {
    music: {
      intro: "videos/Music1.mp4",
      bom: "videos/Music2.mp4",
      mau: "videos/Music3.mp4"
    },
    photography: {
      intro: "videos/good_photography.mp4",
      bom: "videos/good_photography.mp4",
      mau: "https://github.com/Carolina2S/The-Use-of-AI/releases/download/v1.2/bad_photography.mp4"
    },
    development: {
      intro: "videos/Prog1.mp4",
      bom: "videos/Prog2.mp4",
      mau: "videos/Prog3.mp4"
    }
  };

  /* Where each "do it the right way" button goes */
  var HANDSON = {
    music: "hands-on-music.html",
    photography: "hands-on-photography.html",
    development: "#decisao"
  };

  var reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DURACAO_EXPANDIR = reduzirMovimento ? 0 : 700;

  /* ========================================================
     Final choice: goes to the right page, already in the right mode
     ======================================================== */
  var escolhas = document.querySelectorAll(".escolha");

  escolhas.forEach(function (ligacao) {
    var modo = ligacao.getAttribute("data-modo");
    var url = DESTINO + "?modo=" + encodeURIComponent(modo);
    ligacao.setAttribute("href", url);

    ligacao.addEventListener("click", function (evento) {
      var comModificador = evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey;
      if (comModificador || evento.button !== 0 || reduzirMovimento) return;
      evento.preventDefault();
      document.body.classList.add("a-sair");
      window.setTimeout(function () {
        window.location.href = url;
      }, 300);
    });
  });

  window.addEventListener("pageshow", function () {
    document.body.classList.remove("a-sair");
  });

  /* ========================================================
     The screen
     ======================================================== */
  var ecra = document.getElementById("ecra");
  var grupoAreas = document.getElementById("grupo-areas");
  var grupoUso = document.getElementById("grupo-uso");
  var video = document.getElementById("video");
  var aviso = document.getElementById("aviso");
  var controlos = document.getElementById("controlos");
  var btnVoltar = document.getElementById("btn-voltar");
  var btnEcraCheio = document.getElementById("btn-ecra-cheio");
  var legendas = document.getElementById("legendas");

  if (!ecra) return;

  var areaAtual = null;
  var faseAtual = null;     // "intro", "bom" or "mau"
  var ocupado = false;      // true while a panel is expanding
  var temporizador = null;
  var comSom = true;

  /* ---- "Do it the right way" choice, added under every text ---- */
  Array.prototype.forEach.call(legendas.querySelectorAll(".legenda"), function (legenda) {
    var area = legenda.getAttribute("data-area");
    var corpo = legenda.querySelector(".legenda__corpo");
    var bloco = document.createElement("div");
    bloco.className = "fazer";

    var pergunta = document.createElement("p");
    pergunta.className = "fazer__pergunta";
    pergunta.textContent = "Do you want to do it the right way?";

    var botao = document.createElement("a");
    botao.className = "fazer__botao";
    botao.href = HANDSON[area];
    botao.textContent = "Yes, show me how";

    bloco.appendChild(pergunta);
    bloco.appendChild(botao);
    corpo.appendChild(bloco);
  });

  /* ---- Helpers ---- */
  function mostrarLegenda(area, fase) {
    Array.prototype.forEach.call(legendas.querySelectorAll(".legenda"), function (l) {
      var certa = l.getAttribute("data-area") === area && l.getAttribute("data-fase") === fase;
      l.hidden = !certa;
    });
  }

  function esconderLegendas() {
    Array.prototype.forEach.call(legendas.querySelectorAll(".legenda"), function (l) {
      l.hidden = true;
    });
  }

  /* Puts a group back to its initial look without animating it */
  function reiniciar(grupo) {
    grupo.classList.add("sem-transicao");
    grupo.classList.remove("a-expandir", "grupo--visivel");
    Array.prototype.forEach.call(grupo.querySelectorAll(".painel--ativo"), function (p) {
      p.classList.remove("painel--ativo");
    });
    void grupo.offsetWidth;
    grupo.classList.remove("sem-transicao");
  }

  function mostrarGrupo(grupo) {
    grupo.classList.add("grupo--visivel");
    var primeiro = grupo.querySelector(".painel");
    var foco = document.activeElement;
    if (primeiro && (foco === document.body || ecra.contains(foco))) {
      /* keeps keyboard users inside the screen after a change */
      try { primeiro.focus({ preventScroll: true }); } catch (e) { primeiro.focus(); }
    }
  }

  function aplicarSom() {
    video.muted = !comSom;
  }

  function limparTemporizador() {
    if (temporizador) {
      window.clearTimeout(temporizador);
      temporizador = null;
    }
  }

  /* ---- Play one video on the screen ---- */
  function tocar(area, fase) {
    var origem = VIDEOS[area][fase];
    areaAtual = area;
    faseAtual = fase;

    aviso.hidden = true;
    video.src = origem;
    comSom = true;
    aplicarSom();
    ecra.classList.add("ecra--video");
    btnVoltar.hidden = false;
    mostrarLegenda(area, fase);

    var promessa = video.play();
    if (promessa && typeof promessa.catch === "function") {
      promessa.catch(function () {
        /* some browsers refuse sound without a gesture: try muted */
        comSom = false;
        aplicarSom();
        var segunda = video.play();
        if (segunda && typeof segunda.catch === "function") segunda.catch(function () {});
      });
    }
  }

  function acabou() {
    limparTemporizador();
    video.pause();

    if (faseAtual === "intro") {
      /* area video finished: show good use vs bad use */
      reiniciar(grupoAreas);
      ecra.classList.remove("ecra--video");
      btnVoltar.hidden = false;
      /* the area text stays while you choose good or bad use */
      faseAtual = "escolha";
      ocupado = false;
      mostrarGrupo(grupoUso);
    } else {
      /* use video finished: back to the first menu */
      voltarAoMenu();
    }
  }

  function voltarAoMenu() {
    limparTemporizador();
    video.pause();
    reiniciar(grupoAreas);
    reiniciar(grupoUso);
    ecra.classList.remove("ecra--video");
    btnVoltar.hidden = true;
    esconderLegendas();   /* the text only leaves here, in the 3-area menu */
    areaAtual = null;
    faseAtual = null;
    ocupado = false;
    mostrarGrupo(grupoAreas);
  }

  /* A missing file should not freeze the flow while you are building the site */
  video.addEventListener("ended", acabou);
  video.addEventListener("error", function () {
    if (!video.getAttribute("src")) return;
    aviso.textContent = "Video not found: " + video.getAttribute("src");
    aviso.hidden = false;
    limparTemporizador();
    temporizador = window.setTimeout(acabou, 2500);
  });

  /* ---- Expand a panel, then run the callback ---- */
  function expandir(grupo, painel, depois) {
    ocupado = true;
    grupo.classList.add("a-expandir");
    painel.classList.add("painel--ativo");
    limparTemporizador();
    temporizador = window.setTimeout(depois, DURACAO_EXPANDIR);
  }

  /* ---- Clicks ---- */
  Array.prototype.forEach.call(grupoAreas.querySelectorAll(".painel"), function (painel) {
    painel.addEventListener("click", function () {
      if (ocupado) return;
      var area = painel.getAttribute("data-area");
      ecra.scrollIntoView({ behavior: reduzirMovimento ? "auto" : "smooth", block: "start" });
      areaAtual = area;
      btnVoltar.hidden = false;
      mostrarLegenda(area, "intro");   /* text appears as soon as the area is chosen */
      expandir(grupoAreas, painel, function () {
        tocar(area, "intro");
      });
    });
  });

  Array.prototype.forEach.call(grupoUso.querySelectorAll(".painel"), function (painel) {
    painel.addEventListener("click", function () {
      if (ocupado) return;
      var uso = painel.getAttribute("data-uso");
      var area = areaAtual;
      mostrarLegenda(area, uso);
      expandir(grupoUso, painel, function () {
        tocar(area, uso);
      });
    });
  });

  btnVoltar.addEventListener("click", voltarAoMenu);

  /* ---- Full screen: the screen itself, with a way out (button or Esc) ---- */
  var ultimaSaidaEcraCheio = 0;

  function elementoEcraCheio() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  var podeEcraCheio = !!(ecra.requestFullscreen || ecra.webkitRequestFullscreen);

  function atualizarEcraCheio() {
    var ativo = elementoEcraCheio() === ecra;
    btnEcraCheio.setAttribute("aria-pressed", String(ativo));
    btnEcraCheio.textContent = ativo ? "Exit full screen" : "Full screen";
    if (!ativo) ultimaSaidaEcraCheio = Date.now();
  }

  if (!podeEcraCheio) {
    btnEcraCheio.hidden = true;   /* e.g. iPhone Safari has no element full screen */
  }

  btnEcraCheio.addEventListener("click", function () {
    if (elementoEcraCheio() === ecra) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    } else if (ecra.requestFullscreen) {
      ecra.requestFullscreen().catch(function () {});
    } else if (ecra.webkitRequestFullscreen) {
      ecra.webkitRequestFullscreen();
    }
  });

  document.addEventListener("fullscreenchange", atualizarEcraCheio);
  document.addEventListener("webkitfullscreenchange", atualizarEcraCheio);

  document.addEventListener("keydown", function (evento) {
    if (evento.key !== "Escape") return;
    /* Esc leaves full screen first; it must not also send you back to the menu */
    if (elementoEcraCheio() || Date.now() - ultimaSaidaEcraCheio < 400) return;
    if (faseAtual !== null) voltarAoMenu();
  });

  /* ---- Details with the real installation ---- */
  var detalhes = document.querySelector(".bastidores");
  if (detalhes) {
    detalhes.addEventListener("toggle", function () {
      var v = detalhes.querySelector("video");
      if (v && !detalhes.open) v.pause();
    });
  }
})();
