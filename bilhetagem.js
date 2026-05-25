  let digitando = false;

  document.addEventListener("focusin", () => digitando = true);
  document.addEventListener("focusout", () => digitando = false);

// (JS original mantido)

// RESTAURAR BANCO

let historicoBondes = JSON.parse(localStorage.getItem("historicoBondes")) || [];

let dados = JSON.parse(localStorage.getItem("bilhetagem")) || {
  bilhetes: {
    inteira: { inicial: 27000, atual: 27000 },
    meia: { inicial: 5000, atual: 5000 },
    isento: { inicial: 0, atual: 0 }
  },
  viagens: []
};

let topo = JSON.parse(localStorage.getItem("topo")) || {};

document.getElementById("data").value = topo.data || "";
document.getElementById("turno").value = topo.turno || "";
// O select de funcionario e populado via JS mais abaixo; aqui so guardamos o valor.
document.getElementById("reg").value = topo.reg || "";

let saldoPixDia = 0;
let turnoExportado = localStorage.getItem("turnoExportado") === "true";
let turnoIniciado = localStorage.getItem("turnoIniciado") === "true";

// 1) declarar banco
let banco = JSON.parse(localStorage.getItem("banco")) || {
  ccInicial: 0,
  deposito: 0,
  saque: 0,
  pixInicial: 0,
  pixFinal: 0
};

// 2) depois preencher os inputs
document.getElementById("ccInicial").value = formatarNumero(banco.ccInicial);
document.getElementById("deposito").value = formatarNumero(banco.deposito);
document.getElementById("saque").value = formatarNumero(banco.saque);
document.getElementById("pixInicial").value = formatarNumero(banco.pixInicial);
document.getElementById("pixFinal").value = formatarNumero(banco.pixFinal);

// 3) recalcular saldo
saldoPixDia = banco.pixFinal - banco.pixInicial;
document.getElementById("saldoPix").value = formatarNumero(saldoPixDia);

const regsPadrao = {
  "IVAN": "1908",
  "SAMPAIO": "1267",
  "BETH": "698",
  "WELCIO": "134",
  "SUELI": "740",
  "LEANDRO ALVES": "2031"
};

function popularSelectFuncionarios() {
  const select = document.getElementById("funcionario");
  if (!select) return;

  const selecionadoAtual = select.value || "";

  // Limpa tudo e recria (mant?m o placeholder)
  select.innerHTML = "";

  const optPlaceholder = document.createElement("option");
  optPlaceholder.value = "";
  optPlaceholder.textContent = "Funcionario";
  select.appendChild(optPlaceholder);

  const nomes = Object.keys(regsPadrao)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "pt-BR"));

  nomes.forEach((nome) => {
    const opt = document.createElement("option");
    opt.value = nome;
    opt.textContent = nome;
    select.appendChild(opt);
  });

  // Restaura selecao (se ainda existir)
  if (selecionadoAtual) {
    const exists = Array.from(select.options).some(o => o.value === selecionadoAtual);
    if (exists) select.value = selecionadoAtual;
  }
}

let regs = { ...regsPadrao };
popularSelectFuncionarios();
document.getElementById("funcionario").value = topo.funcionario || "";
preencherReg();
atualizarEstadoTurnoUI();
vincularAtualizacaoBotaoIniciar();

function topoPreenchidoParaIniciar() {
  const data = document.getElementById("data")?.value?.trim();
  const turno = document.getElementById("turno")?.value?.trim();
  const funcionario = document.getElementById("funcionario")?.value?.trim();
  const reg = document.getElementById("reg")?.value?.trim();
  return !!(data && turno && funcionario && reg);
}

function vincularAtualizacaoBotaoIniciar() {
  const campos = ["data", "turno", "funcionario", "reg"];
  campos.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", atualizarEstadoTurnoUI);
    el.addEventListener("change", atualizarEstadoTurnoUI);
  });
}

function atualizarEstadoTurnoUI() {
  const btnIniciar = document.getElementById("btnIniciarTurno");
  const btnAddViagem = document.getElementById("btnAddViagem");

  const dataEl = document.getElementById("data");
  const turnoEl = document.getElementById("turno");
  const funcEl = document.getElementById("funcionario");
  const regEl = document.getElementById("reg");

  const iniciado = !!turnoIniciado;
  const podeIniciar = topoPreenchidoParaIniciar();

  // Bot?o iniciar
  if (btnIniciar) {
    btnIniciar.textContent = iniciado ? "TURNO INICIADO" : "INICIAR TURNO";
    btnIniciar.disabled = iniciado || !podeIniciar;
  }

  // Trava topo depois de iniciar
  if (dataEl) dataEl.disabled = iniciado;
  if (turnoEl) turnoEl.disabled = iniciado;
  if (funcEl) funcEl.disabled = iniciado;
  if (regEl) regEl.disabled = iniciado;

  // +VIAGEM s? com turno iniciado
  if (btnAddViagem) {
    btnAddViagem.disabled = !iniciado;
  }
}

function iniciarTurno() {
  if (turnoIniciado) {
    alert("O turno j\u00e1 est\u00e1 iniciado.");
    return;
  }

  const data = document.getElementById("data").value;
  const turno = document.getElementById("turno").value;
  const funcionario = document.getElementById("funcionario").value;
  const reg = document.getElementById("reg").value;

  if (!data || !turno || !funcionario || !reg) {
    alert("Preencha Data, Turno, Funcion\u00e1rio e Reg para iniciar o turno.");
    return;
  }

  turnoIniciado = true;
  localStorage.setItem("turnoIniciado", "true");
  salvarTopo();
  atualizarEstadoTurnoUI();
  render();
}

function preencherReg() {
  let funcionario = document.getElementById("funcionario").value;
  let regInput = document.getElementById("reg");

  regInput.value = regs[funcionario] || "";
}

function salvarTopo() {
  localStorage.setItem("topo", JSON.stringify({
    data: document.getElementById("data").value,
    turno: document.getElementById("turno").value,
    funcionario: document.getElementById("funcionario").value,
    reg: document.getElementById("reg").value
  }));
}

function salvarBanco() {
  localStorage.setItem("banco", JSON.stringify(banco));
}

function formatarMoeda(input) {
  let valor = input.value.replace(/\D/g, "");

  if (!valor) {
    input.value = "";
    return;
  }

  valor = (parseInt(valor) / 100).toFixed(2);

  let partes = valor.split(".");
  let inteiro = partes[0];
  let decimal = partes[1];

  inteiro = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  input.value = inteiro + "," + decimal;
}

function lerMoeda(valor) {
  if (!valor) return 0;

  valor = valor.replace(/[^\d,-]/g, "")
               .replace(/\./g, "")
               .replace(",", ".");

  return parseFloat(valor) || 0;
}

function formatarNumero(valor) {
  return valor.toFixed(2)
  .replace(".", ",")
  .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function escaparHtml(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const ICON = {
  relogio: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  bonde: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="7" width="16" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 13h16M7 18v2M17 18v2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  lotacao: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 19c0-3 3-5 6-5s6 2 6 5M16 11h5M18.5 8.5v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  dinheiro: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  pix: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8h4a3 3 0 010 6H7V8zm10 0h-4a3 3 0 000 6h4V8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  pessoas: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 19c0-3 2.5-5 6-5s6 2 6 5M16 8h6M19 5v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
};

function mostrarToast(mensagem, tipo = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast--${tipo}`;
  toast.textContent = mensagem;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("toast--visivel"));
  setTimeout(() => {
    toast.classList.remove("toast--visivel");
    setTimeout(() => toast.remove(), 280);
  }, 2800);
}

function obterStatusOcupacao(viagem) {
  recalcularRestante(viagem);
  const cap = Number(viagem.capacidade) || 0;
  const ocup = obterOcupados(viagem);

  if (viagem.finalizada) {
    const pct = cap > 0 ? Math.min(100, Math.round((ocup / cap) * 100)) : 0;
    return { classe: "finalizada", label: "FINALIZADA", pct };
  }

  if (cap <= 0) {
    return { classe: "neutro", label: "DEFINIR CAP.", pct: 0 };
  }

  const pct = Math.min(100, Math.round((ocup / cap) * 100));

  if (pct >= 100 || viagem.restante <= 0) {
    return { classe: "lotado", label: "LOTADO", pct: 100 };
  }

  if (pct >= 75) {
    return { classe: "quase", label: "QUASE CHEIO", pct };
  }

  return { classe: "disponivel", label: "DISPON\u00cdVEL", pct };
}

function htmlBarraOcupacao(viagem, tipoLabel, numeroTipo) {
  const st = obterStatusOcupacao(viagem);
  const cap = Number(viagem.capacidade) || 0;
  const ocup = obterOcupados(viagem);
  const meta = cap > 0 ? `${ocup}/${cap} (${st.pct}%)` : "\u2014";
  const tipoTexto = escaparHtml(`${tipoLabel} ${numeroTipo}`);
  const restante = viagem.restante ?? Math.max(0, cap - ocup);

  return `
    <div class="barra-ocupacao barra-ocupacao--${st.classe}">
      <div class="barra-ocupacao__track" role="progressbar" aria-valuenow="${st.pct}" aria-valuemin="0" aria-valuemax="100">
        <div class="barra-ocupacao__fill" style="width:${st.pct}%"></div>
      </div>
      <div class="barra-ocupacao__meta">
        <span class="badge-status badge-status--${st.classe}">${st.label}</span>
        <span class="barra-ocupacao__nums">${ICON.lotacao} ${meta}</span>
        <span class="card-viagem__tipo">${tipoTexto}</span>
        <span class="barra-ocupacao__restante"><b>Restante:</b> ${restante}</span>
      </div>
    </div>
  `;
}

function renderCardViagem(h, i, viagensOrdenadas, espelhoFimInteira, espelhoFimMeia, espelhoFimIsento) {
  const viagemBloqueada = h.finalizada || !turnoIniciado;
  const t = total(h);
  const horaSafe = escaparHtml(h.hora);
  const nomeSafe = escaparHtml(h.nome);
  const capacidadeSafe = escaparHtml(h.capacidade);
  const tipoClasse = h.tipo === "AGENDAMENTO" ? "agendamento" : "publico";
  const tipoLabel = h.tipo === "AGENDAMENTO" ? "AGENDAMENTO" : "P\u00daBLICO";
  const numeroTipo = viagensOrdenadas
    .slice(0, viagensOrdenadas.indexOf(h) + 1)
    .filter((v) => v.tipo === h.tipo).length;
  const disabledAttr = viagemBloqueada ? "disabled" : "";

  return `
  <article class="card card-viagem card-viagem--${tipoClasse}${h.finalizada ? " card-viagem--finalizada" : ""}">
    <header class="card-viagem__top">
      <div class="card-viagem__linha">
        <div class="card-viagem__linha-campos">
          <div class="card-viagem__meta-item card-viagem__meta-item--hora">
            ${ICON.relogio}
            <input type="time" class="card-viagem__meta-valor card-viagem__meta-valor--hora" data-id="${h.id}" data-campo="hora" ${disabledAttr} value="${horaSafe}"
              onfocus="foco.id=${h.id}; foco.campo='hora'"
              onchange="dados.viagens[${i}].hora=this.value; salvar(); render();">
          </div>
          <div class="card-viagem__meta-item card-viagem__meta-item--bonde">
            ${ICON.bonde}
            <input list="listaBondes" class="card-viagem__meta-valor card-viagem__meta-valor--bonde" data-id="${h.id}" data-campo="nome" ${disabledAttr} value="${nomeSafe}"
              onfocus="foco.id=${h.id}; foco.campo='nome'"
              onchange="dados.viagens[${i}].nome=this.value; aplicarBonde(${i}, this.value);">
          </div>
          <div class="card-viagem__meta-item card-viagem__meta-item--cap">
            ${ICON.lotacao}
            <input type="number" class="card-viagem__meta-valor card-viagem__meta-valor--cap" data-id="${h.id}" data-campo="capacidade" inputmode="numeric" min="1" ${disabledAttr} value="${capacidadeSafe}"
              onfocus="foco.id=${h.id}; foco.campo='capacidade'"
              onchange="
                let novaCapacidade = Number(this.value);
                let viagem = dados.viagens[${i}];
                let ocupadosCap = viagem.inteira + viagem.meia + viagem.isento + viagem.reserva;
                viagem.capacidade = novaCapacidade;
                viagem.restante = novaCapacidade - ocupadosCap;
                if (viagem.restante < 0) viagem.restante = 0;
                salvarHistorico(viagem.nome, novaCapacidade);
                salvar();
                render();
              ">
          </div>
        </div>
        <div class="card-viagem__linha-acoes">
          <button type="button" class="btn-card btn-card--tipo" onclick="alternarTipo(${i})" ${!turnoIniciado ? "disabled" : ""}>${tipoLabel}</button>
          <button type="button" class="btn-card btn-card--fim" onclick="finalizarViagem(${i})" ${!turnoIniciado ? "disabled" : ""}>${h.finalizada ? "LIBERAR" : "FINALIZAR"}</button>
          <button type="button" class="btn-card btn-card--del btn-remover" onclick="removerViagem(${i})">REMOVER</button>
        </div>
      </div>
    </header>

    ${htmlBarraOcupacao(h, tipoLabel, numeroTipo)}

    <div class="espelho-series espelho-series--compact">
      <div class="espelho-series__tit">Espelho \u2014 s\u00e9ries finais</div>
      <div class="espelho-series__grid">
        <div class="espelho-series__item espelho-inteira"><span class="espelho-series__lbl">INT.</span><span class="espelho-series__num">${espelhoFimInteira}</span></div>
        <div class="espelho-series__item espelho-meia"><span class="espelho-series__lbl">MEIA</span><span class="espelho-series__num">${espelhoFimMeia}</span></div>
        <div class="espelho-series__item espelho-isento"><span class="espelho-series__lbl">ISENTO</span><span class="espelho-series__num">${espelhoFimIsento}</span></div>
      </div>
    </div>

    <div class="botoes botoes-venda">
      <div class="botoes-venda__grupo">
        <span class="botoes-venda__lbl">Adicionar</span>
        <div class="botoes-venda__linha">
          <button type="button" class="add-inteira" ${disabledAttr} onclick="alterar('inteira', ${i}, 1)">+ INTEIRA</button>
          <button type="button" class="add-meia" ${disabledAttr} onclick="alterar('meia', ${i}, 1)">+ MEIA</button>
          <button type="button" class="add-isento" ${disabledAttr} onclick="alterar('isento', ${i}, 1)">+ ISENTO</button>
          <button type="button" class="add-reserva" ${disabledAttr} onclick="alterarReserva(${i}, 1)">+ RES/PMS</button>
        </div>
      </div>
      <div class="botoes-venda__grupo">
        <span class="botoes-venda__lbl">Remover</span>
        <div class="botoes-venda__linha">
          <button type="button" class="sub" ${disabledAttr} onclick="alterar('inteira', ${i}, -1)">\u2212 INTEIRA</button>
          <button type="button" class="sub" ${disabledAttr} onclick="alterar('meia', ${i}, -1)">\u2212 MEIA</button>
          <button type="button" class="sub" ${disabledAttr} onclick="alterar('isento', ${i}, -1)">\u2212 ISENTO</button>
          <button type="button" class="sub btn-reserva-menos" ${disabledAttr} onclick="alterarReserva(${i}, -1)">\u2212 RES/PMS</button>
        </div>
      </div>
    </div>

    <div class="info card-viagem__rodape">
      <div class="mini-dashboard ${h.finalizada ? "bloqueado" : ""}">
        <div class="mini-box inteira"><div class="titulo">INTEIRA</div><div class="valor">${h.inteira}</div></div>
        <div class="mini-box meia"><div class="titulo">MEIA</div><div class="valor">${h.meia}</div></div>
        <div class="mini-box isento"><div class="titulo">ISENTO</div><div class="valor">${h.isento}</div></div>
        <div class="mini-box reserva"><div class="titulo">RES/PMS</div><div class="valor">${h.reserva}</div></div>
      </div>
      <div class="card-viagem__stats">
        <span class="card-viagem__fat">R$ ${t.toFixed(2)}</span>
      </div>
    </div>
  </article>
  `;
}

function obterOcupados(viagem) {
  return viagem.inteira + viagem.meia + viagem.isento + viagem.reserva;
}

function recalcularRestante(viagem) {
  viagem.restante = viagem.capacidade - obterOcupados(viagem);
  if (viagem.restante < 0) viagem.restante = 0;
}

function ordenarViagensPorHora(a, b) {
  if (!a.hora && !b.hora) return 0;
  if (!a.hora) return 1;
  if (!b.hora) return -1;
  return a.hora.localeCompare(b.hora);
}

function calcularPixInicial() {
  let cc = lerMoeda(document.getElementById("ccInicial").value);
  let dep = lerMoeda(document.getElementById("deposito").value);
  let saque = lerMoeda(document.getElementById("saque").value);

  let resultado = cc + dep - saque;

  document.getElementById("pixInicial").value = formatarNumero(resultado);

  // SALVAR
  banco.ccInicial = cc;
  banco.deposito = dep;
  banco.saque = saque;
  banco.pixInicial = resultado;

  salvarBanco();
}

function calcularSaldoPix() {
  let pixInicial = lerMoeda(document.getElementById("pixInicial").value);
  let pixFinal = lerMoeda(document.getElementById("pixFinal").value);

  let saldo = pixFinal - pixInicial;

  saldoPixDia = saldo;

  document.getElementById("saldoPix").value = formatarNumero(saldo);

  banco.pixFinal = pixFinal;
  salvarBanco();

  render();
}

function salvar() {
  localStorage.setItem("bilhetagem", JSON.stringify(dados));
  localStorage.setItem("historicoBondes", JSON.stringify(historicoBondes));
}

function salvarHistorico(nome, capacidade) {
  if (!nome) return;

  let existente = historicoBondes.find(b => b.nome === nome);

  if (existente) {
    existente.capacidade = capacidade;
  } else {
    historicoBondes.push({ nome, capacidade });
  }
}

function aplicarBonde(i, nome) {
  let b = historicoBondes.find(x => x.nome === nome);
  if (b) {
    dados.viagens[i].capacidade = b.capacidade;
    dados.viagens[i].restante = b.capacidade;
  }
  salvar();
  render();
}

// Cria uma vez so (global)
let ctx = new (window.AudioContext || window.webkitAudioContext)();

function tocarTom(start, freq, duration, volume, waveType) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const fim = start + duration;

  osc.type = waveType;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, fim);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(fim + 0.03);
}

async function feedback(tipo) {
  try {
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
  } catch (_) {
    return;
  }

  if (navigator.vibrate) {
    navigator.vibrate(tipo === "mais" ? 35 : [25, 30, 25]);
  }

  const t0 = ctx.currentTime;
  const vol = 0.85;

  if (tipo === "mais") {
    // Dois bipes agudos (confirmacao de venda)
    tocarTom(t0, 1040, 0.11, vol, "square");
    tocarTom(t0 + 0.13, 1320, 0.13, vol, "square");
  } else {
    // Bipe grave + queda (remocao)
    tocarTom(t0, 620, 0.14, vol, "triangle");
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = t0 + 0.1;
    const end = start + 0.18;

    osc.type = "triangle";
    osc.frequency.setValueAtTime(480, start);
    osc.frequency.exponentialRampToValueAtTime(220, end);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(vol * 0.9, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(end + 0.03);
  }
}

function somVenda(delta) {
  void feedback(delta > 0 ? "mais" : "menos");
}

function inicializarAudio() {
  if (inicializarAudio._ok) return;
  inicializarAudio._ok = true;

  document.addEventListener(
    "pointerdown",
    () => {
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
    },
    { passive: true, capture: true }
  );
}

inicializarAudio();

const LISTA_BONDES = [
  "ABERTO",
  "PORTO",
  "JAPAO",
  "PORTO+RBQ",
  "ABERTO+RBQ",
  "ITALIANO"
];

function criarNovaViagem(overrides = {}) {
  return {
    id: Date.now() + Math.random(),
    tipo: "PUBLICO",
    hora: "",
    nome: "",
    capacidade: "",
    restante: 0,
    inteira: 0,
    meia: 0,
    isento: 0,
    reserva: 0,
    finalizada: false,
    ...overrides
  };
}

function scrollParaViagens() {
  setTimeout(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth"
    });
  }, 100);
}

function minutosDesdeMeiaNoite(horaStr) {
  const [h, m] = horaStr.split(":").map(Number);
  return h * 60 + m;
}

function formatarHoraMinutos(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function gerarHorariosViagem(inicio, termino, intervaloMin) {
  const inicioMin = minutosDesdeMeiaNoite(inicio);
  const terminoMin = minutosDesdeMeiaNoite(termino);

  if (inicioMin > terminoMin) return null;

  const horarios = [];
  for (let atual = inicioMin; atual <= terminoMin; atual += intervaloMin) {
    horarios.push(formatarHoraMinutos(atual));
  }

  return horarios;
}

function popularSelectBondesAutomatico() {
  const select = document.getElementById("autoBonde");
  if (!select) return;

  const valorAtual = select.value;
  select.innerHTML = '<option value="">Selecione</option>';

  LISTA_BONDES.forEach((nome) => {
    const opt = document.createElement("option");
    opt.value = nome;
    opt.textContent = nome;
    select.appendChild(opt);
  });

  if (valorAtual && LISTA_BONDES.includes(valorAtual)) {
    select.value = valorAtual;
  }
}

function preencherCapacidadeAutomatica() {
  const nome = document.getElementById("autoBonde")?.value;
  const capInput = document.getElementById("autoCapacidade");
  if (!nome || !capInput) return;

  const b = historicoBondes.find((x) => x.nome === nome);
  if (b) capInput.value = b.capacidade;

  atualizarPreviewViagensAutomaticas();
}

function atualizarPreviewViagensAutomaticas() {
  const preview = document.getElementById("autoPreview");
  if (!preview) return;

  const inicio = document.getElementById("autoInicio")?.value;
  const termino = document.getElementById("autoTermino")?.value;
  const intervalo = Number(document.getElementById("autoIntervalo")?.value);

  if (!inicio || !termino || !intervalo) {
    preview.textContent = "";
    return;
  }

  const horarios = gerarHorariosViagem(inicio, termino, intervalo);

  if (!horarios || horarios.length === 0) {
    preview.textContent = "Hor\u00e1rio de in\u00edcio deve ser anterior ou igual ao t\u00e9rmino.";
    return;
  }

  if (horarios.length > 50) {
    preview.textContent = `Seriam ${horarios.length} viagens (m\u00e1ximo 50 por vez).`;
    return;
  }

  preview.textContent = `${horarios.length} viagem(ns): ${horarios.join(", ")}`;
}

function abrirModalAddViagem() {
  if (!turnoIniciado) {
    alert("Inicie o turno antes de adicionar viagem.");
    return;
  }

  const modal = document.getElementById("modalAddViagem");
  const form = document.getElementById("modalAddViagemAuto");

  if (!modal || !form) return;

  popularSelectBondesAutomatico();
  atualizarPreviewViagensAutomaticas();
  modal.hidden = false;
}

function fecharModalAddViagem() {
  const modal = document.getElementById("modalAddViagem");
  if (modal) modal.hidden = true;
}

function addViagemManual() {
  let quantidade = prompt("Quantas viagens deseja adicionar?\n\n(Digite um n\u00famero ou cancele para adicionar apenas 1)");

  if (quantidade === null || quantidade.trim() === "") {
    quantidade = 1;
  }

  quantidade = Number(quantidade);

  if (isNaN(quantidade) || quantidade <= 0) {
    alert("Digite um n\u00famero v\u00e1lido.");
    return;
  }

  if (quantidade > 50) {
    alert("M\u00e1ximo de 50 viagens por vez.");
    return;
  }

  for (let i = 0; i < quantidade; i++) {
    dados.viagens.push(criarNovaViagem());
  }

  salvar();
  render();
  scrollParaViagens();
  mostrarToast(`${quantidade} viagem(ns) adicionada(s)`, "sucesso");
}

function confirmarAddViagemAutomatica(event) {
  if (event) event.preventDefault();

  const inicio = document.getElementById("autoInicio")?.value;
  const termino = document.getElementById("autoTermino")?.value;
  const intervalo = Number(document.getElementById("autoIntervalo")?.value);
  const bonde = document.getElementById("autoBonde")?.value?.trim();
  const capacidade = Number(document.getElementById("autoCapacidade")?.value);

  if (!inicio || !termino) {
    alert("Informe o hor\u00e1rio de in\u00edcio e t\u00e9rmino.");
    return;
  }

  if (![20, 30, 40, 60].includes(intervalo)) {
    alert("Selecione um intervalo v\u00e1lido.");
    return;
  }

  if (!bonde) {
    alert("Selecione o bonde.");
    return;
  }

  if (!capacidade || capacidade <= 0) {
    alert("Informe a capacidade.");
    return;
  }

  const horarios = gerarHorariosViagem(inicio, termino, intervalo);

  if (!horarios || horarios.length === 0) {
    alert("O hor\u00e1rio de in\u00edcio deve ser anterior ou igual ao de t\u00e9rmino.");
    return;
  }

  if (horarios.length > 50) {
    alert(`Seriam ${horarios.length} viagens. M\u00e1ximo de 50 por vez.`);
    return;
  }

  if (!confirm(`Criar ${horarios.length} viagem(ns) de ${inicio} a ${termino} a cada ${intervalo} min?`)) {
    return;
  }

  horarios.forEach((hora) => {
    dados.viagens.push(criarNovaViagem({
      hora,
      nome: bonde,
      capacidade,
      restante: capacidade
    }));
  });

  salvarHistorico(bonde, capacidade);
  salvar();
  render();
  fecharModalAddViagem();
  scrollParaViagens();
  mostrarToast(`${horarios.length} viagem(ns) gerada(s)`, "sucesso");
}

function vincularModalAddViagem() {
  const form = document.getElementById("modalAddViagemAuto");
  const modal = document.getElementById("modalAddViagem");

  if (form) {
    form.addEventListener("submit", confirmarAddViagemAutomatica);
    ["autoInicio", "autoTermino", "autoIntervalo"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", atualizarPreviewViagensAutomaticas);
        el.addEventListener("change", atualizarPreviewViagensAutomaticas);
      }
    });
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) fecharModalAddViagem();
    });
  }
}

vincularModalAddViagem();

function alterarReserva(i, v) {
  somVenda(v);

  let h = dados.viagens[i];
  
  if (!turnoIniciado) {
    alert("Inicie o turno antes de registrar vendas.");
    return;
  }

  if (h.finalizada) return;

  let ocupados = obterOcupados(h);

  // BLOQUEIA SE LOTADO
  if (v > 0 && ocupados >= h.capacidade) {
    mostrarToast("Viagem lotada", "erro");
    return;
  }

  // Nao deixa negativo
  if (h.reserva + v < 0) return;

  // ALTERA SOMENTE RESERVA
  h.reserva += v;

  // ATUALIZA RESTANTE (IMPORTANTE)
  recalcularRestante(h);
  
  // FINALIZA AUTOMATICAMENTE SE LOTAR
  if (obterOcupados(h) >= h.capacidade) {
    h.finalizada = true;
  }

  salvar();
  render();
}

function finalizarViagem(i) {
  let viagem = dados.viagens[i];

  // Se ja esta finalizada: liberar
  if (viagem.finalizada) {
    viagem.finalizada = false;

    // Ao liberar manualmente, bloqueia nova finalizacao automatica
    viagem.finalizadaManual = true;

    salvar();
    render();
    return;
  }

  // FINALIZAR MANUAL
  if (viagem.restante > 0) {
    if (!confirm("Ainda h? lugares dispon?veis. Deseja finalizar mesmo assim?")) {
      return;
    }
  }

  viagem.finalizada = true;
  viagem.finalizadaManual = true;

  salvar();
  render();
}

function removerViagem(i) {
  if (!confirm("Deseja remover esta viagem?")) return;
  
  let viagem = dados.viagens[i];

  // DEVOLVER OS BILHETES
  dados.bilhetes.inteira.atual -= viagem.inteira;
  dados.bilhetes.meia.atual -= viagem.meia;
  dados.bilhetes.isento.atual -= viagem.isento;

  // EVITAR FICAR MENOR QUE INICIAL
  dados.bilhetes.inteira.atual = Math.max(dados.bilhetes.inteira.atual, dados.bilhetes.inteira.inicial);
  dados.bilhetes.meia.atual = Math.max(dados.bilhetes.meia.atual, dados.bilhetes.meia.inicial);
  dados.bilhetes.isento.atual = Math.max(dados.bilhetes.isento.atual, dados.bilhetes.isento.inicial);

  // REMOVER VIAGEM
  dados.viagens.splice(i, 1);

  salvar();
  render();
}

function alternarTipo(i) {
  let v = dados.viagens[i];

  v.tipo = (v.tipo === "PUBLICO") ? "AGENDAMENTO" : "PUBLICO";

  salvar();
  render();
}

function alterar(tipo, i, v) {
  somVenda(v);

  let h = dados.viagens[i];
  
  if (!turnoIniciado) {
    alert("Inicie o turno antes de registrar vendas.");
    return;
  }

  if (h.finalizada) return;

  if (v > 0 && h.restante <= 0) {
    mostrarToast("Viagem lotada", "erro");
    return;
  }
  if (h[tipo] + v < 0) return;

  if (v > 0) {
    dados.bilhetes[tipo].atual++;
  } else {
    if (dados.bilhetes[tipo].atual > dados.bilhetes[tipo].inicial) {
      dados.bilhetes[tipo].atual--;
    }
  }

  h[tipo] += v;
  recalcularRestante(h);
  
  // FINALIZA AUTOMATICAMENTE SE LOTAR
  if (obterOcupados(h) >= h.capacidade) {
    h.finalizada = true;
  }

  salvar();
  render();
}

function total(h) {
  return h.inteira * 7 + h.meia * 3.5;
}

function htmlCardVendasDia(tipo, qtd, valorReais, inicial, final, vendidas) {
  if (tipo === "reserva") {
    return `
    <div class="vendas-card vendas-card--reserva">
      <div class="vendas-card__titulo">RES/PMS</div>
      <div class="vendas-card__qtd-solo">${qtd}</div>
    </div>`;
  }

  const ini = vendidas > 0 ? inicial : "-";
  const fim = vendidas > 0 ? final : "-";

  return `
    <div class="vendas-card vendas-card--${tipo}">
      <div class="vendas-card__titulo">${tipo === "inteira" ? "INTEIRA" : tipo === "meia" ? "MEIA" : "ISENTO"}</div>
      <div class="vendas-card__corpo">
        <div class="vendas-card__dados">
          <div class="vendas-card__qtd">${qtd}</div>
          <div class="vendas-card__valor">R$ ${formatarNumero(valorReais)}</div>
          <div class="vendas-card__serie-linha">Inicial: ${ini}</div>
          <div class="vendas-card__serie-linha">Final: ${fim}</div>
        </div>
      </div>
    </div>`;
}

function calcularResumo() {

  let totalPessoas = 0;
  let totalValor = 0;

  let totalInteira = 0;
  let totalMeia = 0;
  let totalIsento = 0;
  let totalReserva = 0;

  dados.viagens.forEach(v => {
    totalPessoas += v.inteira + v.meia + v.isento + v.reserva;

    totalInteira += v.inteira;
    totalMeia += v.meia;
    totalIsento += v.isento;
    totalReserva += v.reserva;

    totalValor += (v.inteira * 7 + v.meia * 3.5);
  });

  return {
    totalPessoas,
    totalValor,
    totalInteira,
    totalMeia,
    totalIsento,
    totalReserva
  };
}

let foco = {
  id: null,
  campo: null
};

function restaurarFoco() {
  if (!foco.id || !foco.campo) return;

  let ativo = document.activeElement;

  // Se o usuario esta em outro tipo de campo (PIX, topo etc), nao mexe
  if (!ativo || !ativo.dataset || !ativo.dataset.id) return;

  // Procura o campo equivalente apos o render
  let input = document.querySelector(
    `[data-id="${foco.id}"][data-campo="${foco.campo}"]`
  );

  if (input && input !== ativo) {
    input.focus();

    // Opcional: manter cursor no final
    let val = input.value;
    input.value = "";
    input.value = val;
  }
}

function render() {

  let resumo = calcularResumo();

  let viagensOrdenadas = [...dados.viagens].sort(ordenarViagensPorHora);

  document.getElementById("iniInteira").value = dados.bilhetes.inteira.inicial;

  function calcularFim(inicial, atual) {
    return atual;
  }

  document.getElementById("fimInteira").value =
    calcularFim(dados.bilhetes.inteira.inicial, dados.bilhetes.inteira.atual);


  document.getElementById("iniMeia").value = dados.bilhetes.meia.inicial;

  document.getElementById("fimMeia").value =
    calcularFim(dados.bilhetes.meia.inicial, dados.bilhetes.meia.atual);


  document.getElementById("iniIsento").value = dados.bilhetes.isento.inicial;

  document.getElementById("fimIsento").value =
    calcularFim(dados.bilhetes.isento.inicial, dados.bilhetes.isento.atual);

  let espelhoFimInteira = calcularFim(dados.bilhetes.inteira.inicial, dados.bilhetes.inteira.atual);
  let espelhoFimMeia = calcularFim(dados.bilhetes.meia.inicial, dados.bilhetes.meia.atual);
  let espelhoFimIsento = calcularFim(dados.bilhetes.isento.inicial, dados.bilhetes.isento.atual);
  
  document.getElementById("iniInteira").onchange = (e) => {
    dados.bilhetes.inteira.inicial = Number(e.target.value);
    dados.bilhetes.inteira.atual = Number(e.target.value);
    salvar();
    render();
  };

  document.getElementById("iniMeia").onchange = (e) => {
    dados.bilhetes.meia.inicial = Number(e.target.value);
    dados.bilhetes.meia.atual = Number(e.target.value);
    salvar();
    render();
  };

  document.getElementById("iniIsento").onchange = (e) => {
    dados.bilhetes.isento.inicial = Number(e.target.value);
    dados.bilhetes.isento.atual = Number(e.target.value);
    salvar();
    render();
  };

  let div = document.getElementById("viagens");
  div.innerHTML = "";

  let lista = `
  <datalist id="listaBondes">
    <option value="ABERTO">
    <option value="PORTO">
    <option value="JAPAO">
    <option value="PORTO+RBQ">
    <option value="ABERTO+RBQ">
    <option value="ITALIANO">
  </datalist>
  `;

  viagensOrdenadas.forEach((h) => {
    const i = dados.viagens.findIndex((v) => v.id === h.id);
    recalcularRestante(h);
    div.innerHTML += renderCardViagem(
      h,
      i,
      viagensOrdenadas,
      espelhoFimInteira,
      espelhoFimMeia,
      espelhoFimIsento
    );
  });
  
  let dinheiro = Math.max(0, resumo.totalValor - saldoPixDia);
  
  div.innerHTML += lista;

dados.viagens.forEach((v) => {
  if (v.reserva === undefined) v.reserva = 0;
});

    // ===== SERIES VENDIDAS (IGUAL EXPORTACAO) =====

let vendidasInteira = dados.bilhetes.inteira.atual - dados.bilhetes.inteira.inicial;

let inicialInteira = dados.bilhetes.inteira.inicial;

let finalInteira = vendidasInteira > 0
  ? inicialInteira + vendidasInteira - 1
  : inicialInteira;
  
  // ===== SERIES MEIA =====
let vendidasMeia = dados.bilhetes.meia.atual - dados.bilhetes.meia.inicial;

let inicialMeia = dados.bilhetes.meia.inicial;

let finalMeia = vendidasMeia > 0
  ? inicialMeia + vendidasMeia - 1
  : inicialMeia;


// ===== SERIES ISENTO =====
let vendidasIsento = dados.bilhetes.isento.atual - dados.bilhetes.isento.inicial;

let inicialIsento = dados.bilhetes.isento.inicial;

let finalIsento = vendidasIsento > 0
  ? inicialIsento + vendidasIsento - 1
  : inicialIsento;

document.getElementById("resumo").innerHTML =
  `

    <div class="box total fechamento-card">
      <div class="fechamento-card__titulo">FECHAMENTO</div>
      <div class="fechamento-card__hero">${ICON.dinheiro} R$ ${formatarNumero(resumo.totalValor)}</div>
      <div class="fechamento-card__sub">Total arrecadado</div>
      <div class="metric-grid">
        <div class="metric metric--pessoas">
          <span class="metric__ico">${ICON.pessoas}</span>
          <span class="metric__lbl">Passageiros</span>
          <span class="metric__val">${resumo.totalPessoas}</span>
        </div>
        <div class="metric metric--pix">
          <span class="metric__ico">${ICON.pix}</span>
          <span class="metric__lbl">PIX</span>
          <span class="metric__val">R$ ${formatarNumero(saldoPixDia)}</span>
        </div>
        <div class="metric metric--dinheiro">
          <span class="metric__ico">${ICON.dinheiro}</span>
          <span class="metric__lbl">Dinheiro</span>
          <span class="metric__val">R$ ${formatarNumero(dinheiro)}</span>
        </div>
      </div>
    </div>
  
  `;

    const valorInteiraCard = resumo.totalInteira * 7;
    const valorMeiaCard = resumo.totalMeia * 3.5;

document.getElementById("resumo-bilheteria").innerHTML =
  `
  <div class="vendas-dia">
    <div class="vendas-dia-titulo">VENDAS DO DIA</div>
    <div class="vendas-dia-grid">
      ${htmlCardVendasDia("inteira", resumo.totalInteira, valorInteiraCard, inicialInteira, finalInteira, vendidasInteira)}
      ${htmlCardVendasDia("meia", resumo.totalMeia, valorMeiaCard, inicialMeia, finalMeia, vendidasMeia)}
      ${htmlCardVendasDia("isento", resumo.totalIsento, 0, inicialIsento, finalIsento, vendidasIsento)}
      ${htmlCardVendasDia("reserva", resumo.totalReserva)}
    </div>
  </div>
  `;

restaurarFoco();

}

function exportar() {
  if (!turnoIniciado) {
    alert("Inicie o turno antes de exportar.");
    return;
  }

  let data = document.getElementById("data").value;
  let turno = document.getElementById("turno").value;
  let funcionario = document.getElementById("funcionario").value;
  let reg = document.getElementById("reg").value;

  // Validacao
  if (!data || !turno || !funcionario || !reg) {
    alert("Preencha Data, Turno, Funcion\u00e1rio e Reg antes de exportar.");
    return;
  }

  let totalPessoas = 0;
  let totalValor = 0;
  let totalReserva = 0;

  let csv = `RELATORIO DE BILHETAGEM\n`;
  csv += `Data: ${data}\n`;
  csv += `Turno: ${turno}\n`;
  csv += `Funcionario: ${funcionario}\n`;
  csv += `Registro: ${reg}\n\n`;

  // =========================
  // BANCO / PIX
  // =========================
  csv += `DADOS BANCARIOS\n`;
  csv += `CC Inicial: "${formatarNumero(banco.ccInicial)}"\n`;
  csv += `Deposito: "${formatarNumero(banco.deposito)}"\n`;
  csv += `Saque: "${formatarNumero(banco.saque)}"\n`;
  csv += `PIX Inicial: "${formatarNumero(banco.pixInicial)}"\n`;
  csv += `PIX Final: "${formatarNumero(banco.pixFinal)}"\n`;
  csv += `Saldo PIX: "${formatarNumero(saldoPixDia)}"\n\n`;

  // =========================
  // SERIES
  // =========================
  let vendidasInteira = dados.bilhetes.inteira.atual - dados.bilhetes.inteira.inicial;
  let vendidasMeia = dados.bilhetes.meia.atual - dados.bilhetes.meia.inicial;
  let vendidasIsento = dados.bilhetes.isento.atual - dados.bilhetes.isento.inicial;

  let finalInteira = vendidasInteira > 0
    ? dados.bilhetes.inteira.inicial + vendidasInteira - 1
    : dados.bilhetes.inteira.inicial;

  let finalMeia = vendidasMeia > 0
    ? dados.bilhetes.meia.inicial + vendidasMeia - 1
    : dados.bilhetes.meia.inicial;

  let finalIsento = vendidasIsento > 0
    ? dados.bilhetes.isento.inicial + vendidasIsento - 1
    : dados.bilhetes.isento.inicial;

  csv += `SERIES DE BILHETES VENDIDOS\n`;
  csv += `Inteira: ${dados.bilhetes.inteira.inicial} ate ${finalInteira} (${vendidasInteira})\n`;
  csv += `Meia: ${dados.bilhetes.meia.inicial} ate ${finalMeia} (${vendidasMeia})\n`;
  csv += `Isento: ${dados.bilhetes.isento.inicial} ate ${finalIsento} (${vendidasIsento})\n\n`;

  // =========================
  // VIAGENS
  // =========================
  let viagensOrdenadas = [...dados.viagens].sort(ordenarViagensPorHora);

  viagensOrdenadas.forEach((h, i) => {

      let t = total(h);

      totalValor += t;
      totalPessoas += (h.inteira + h.meia + h.isento + h.reserva);
      totalReserva += h.reserva;

    csv += `-----------------------------\n`;
    csv += `VIAGEM ${i + 1}\n`;
    csv += `Tipo: ${h.tipo}\n`;
    csv += `Horario: ${h.hora}\n`;
    csv += `Bonde: ${h.nome}\n`;
    csv += `Capacidade: ${h.capacidade}\n\n`;

    let vendidos = h.inteira + h.meia;
    let transportados = h.inteira + h.meia + h.isento + h.reserva;

    let valorInteiraViagem = h.inteira * 7;
    let valorMeiaViagem = h.meia * 3.5;

    csv += `Bilhetes Vendidos:\n`;
    csv += `Inteira: ${h.inteira} (R$ ${formatarNumero(valorInteiraViagem)})\n`;
    csv += `Meia: ${h.meia} (R$ ${formatarNumero(valorMeiaViagem)})\n`;
    csv += `Total: ${vendidos} ( int. + meia )\n`;
    csv += `Isento: ${h.isento}\n`;
    csv += `Gratuitos RES/PMS: ${h.reserva}\n`;
    csv += `Passageiros Transportados: ${transportados}\n`;

    csv += `Faturamento da Viagem: R$ ${formatarNumero(t)}\n\n`;
  });

  // =========================
  // RESUMO FINAL
  // =========================
  let totalInteira = 0;
  let totalMeia = 0;
  let totalIsento = 0;

  dados.viagens.forEach(v => {
    totalInteira += v.inteira;
    totalMeia += v.meia;
    totalIsento += v.isento;
  });

  let valorInteira = totalInteira * 7;
  let valorMeia = totalMeia * 3.5;
  let totalBilhetesVendidos = totalInteira + totalMeia;

  let dinheiro = Math.max(0, totalValor - saldoPixDia);

  csv += `=============================\n`;
  csv += `RESUMO FINAL\n\n`;

  csv += `Bilhetes Vendidos: ${totalBilhetesVendidos}\n`;
  csv += `Isentos: ${totalIsento}\n`;
  csv += `Gratuitos RES/PMS: ${totalReserva}\n`;
  csv += `TOTAL DE PASSAGEIROS: ${totalPessoas}\n\n`;

  csv += `Inteira: ${totalInteira} (R$ ${formatarNumero(valorInteira)})\n`;
  csv += `Meia: ${totalMeia} (R$ ${formatarNumero(valorMeia)})\n`;
  csv += `Isento: ${totalIsento} (R$ ${formatarNumero(0)})\n`;
  csv += `Total Arrecadado: R$ ${formatarNumero(totalValor)}\n\n`;

  csv += `PIX: R$ ${formatarNumero(saldoPixDia)}\n`;
  csv += `Dinheiro: R$ ${formatarNumero(dinheiro)}\n`;

  // =========================
  // DOWNLOAD
  // =========================
  let blob = new Blob([new Uint8Array([0xEF,0xBB,0xBF]), csv], {
    type: "text/csv;charset=utf-8;"
  });

  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);

  let partesData = data.split("-");
  let dataFormatada = partesData.length === 3 
    ? `${partesData[2]}-${partesData[1]}-${partesData[0]}`
    : data;

  let turnoLimpo = turno.replace(/\s+/g, "_");
  let funcionarioLimpo = funcionario.replace(/\s+/g, "_");
  let regLimpo = reg.replace(/\s+/g, "_");

  a.download = `FILIPYTE_${dataFormatada}_${turnoLimpo}_${funcionarioLimpo}_${regLimpo}.csv`;
  a.click();
  turnoExportado = true;
  localStorage.setItem("turnoExportado", "true");
}

function verificarFinalizacaoAutomatica() {
  let dataTopo = document.getElementById("data").value;

  if (!dataTopo) return; // sem data, n?o faz nada

  let agora = new Date();

  let mudou = false;

  dados.viagens.forEach(h => {

    if (!h.hora) return;
    if (h.finalizadaManual) return;

    let [hora, minuto] = h.hora.split(":").map(Number);

    // Cria data completa (data + hora)
    let horarioViagem = new Date(dataTopo + "T00:00:00");
    horarioViagem.setHours(hora, minuto, 10, 0);

    // Comparacao correta
    if (agora >= horarioViagem) {
      if (!h.finalizada) {
        h.finalizada = true;
        mudou = true;
      }
    }

  });

  if (mudou) {
    salvar();
    render();
  }
}

function resetar() {
  if (!turnoIniciado) {
    alert("Inicie o turno antes de encerrar.");
    return;
  }

  if (!turnoExportado) {
    alert("Exporte o turno antes de encerrar.");
    return;
  }

  if (!confirm("Deseja encerrar o turno?")) return;

  // Continuidade das series
  dados.bilhetes.inteira.inicial = dados.bilhetes.inteira.atual;
  dados.bilhetes.meia.inicial = dados.bilhetes.meia.atual;
  dados.bilhetes.isento.inicial = dados.bilhetes.isento.atual;

  dados.bilhetes.inteira.atual = dados.bilhetes.inteira.inicial;
  dados.bilhetes.meia.atual = dados.bilhetes.meia.inicial;
  dados.bilhetes.isento.atual = dados.bilhetes.isento.inicial;

  // Manter somente as nao finalizadas
  dados.viagens = dados.viagens.filter(v => !v.finalizada);

  // Ajustar viagens restantes
  dados.viagens.forEach(v => {

    // Nova regra principal
    // Capacidade vira o que ainda estava disponivel
    v.capacidade = v.restante;

    // Zera contadores
    v.inteira = 0;
    v.meia = 0;
    v.isento = 0;
    v.reserva = 0;

    // Restante = capacidade nova
    v.restante = v.capacidade;

    // Libera para novo turno
    v.finalizada = false;
    v.finalizadaManual = false;
  });

  // Banco
  banco.ccInicial = banco.pixFinal;
  banco.deposito = 0;
  banco.saque = 0;
  banco.pixInicial = banco.ccInicial;
  banco.pixFinal = 0;
  saldoPixDia = 0;

  document.getElementById("ccInicial").value = formatarNumero(banco.ccInicial);
  document.getElementById("deposito").value = formatarNumero(banco.deposito);
  document.getElementById("saque").value = formatarNumero(banco.saque);
  document.getElementById("pixInicial").value = formatarNumero(banco.pixInicial);
  document.getElementById("pixFinal").value = formatarNumero(banco.pixFinal);
  document.getElementById("saldoPix").value = formatarNumero(0);

  salvarBanco();

  // Limpar topo
  document.getElementById("data").value = "";
  document.getElementById("turno").value = "";
  document.getElementById("funcionario").value = "";
  document.getElementById("reg").value = "";

  localStorage.removeItem("topo");

  turnoExportado = false;
  localStorage.setItem("turnoExportado", "false");

  turnoIniciado = false;
  localStorage.setItem("turnoIniciado", "false");
  atualizarEstadoTurnoUI();

  salvar();
  render();
}

render();

// roda uma vez ao abrir
verificarFinalizacaoAutomatica();

// roda a cada 5 segundos
setInterval(() => {

  if (digitando) return; // Nao atualiza se estiver digitando

  verificarFinalizacaoAutomatica();

}, 5000);

if ("serviceWorker" in navigator) {
  let recarregandoSw = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (recarregandoSw) return;
    recarregandoSw = true;
    location.reload();
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js?v=21")
      .then((reg) => {
        reg.update();
        if (reg.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }
        reg.addEventListener("updatefound", () => {
          const novo = reg.installing;
          if (!novo) return;
          novo.addEventListener("statechange", () => {
            if (novo.state === "installed" && navigator.serviceWorker.controller) {
              novo.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      })
      .catch((erro) => {
        console.error("Falha ao registrar Service Worker:", erro);
      });
  });
}

