const SUPABASE_URL = 'https://dhmsjbdvtknlyopglnnh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_WKuWi9x_I0nuh44jnR8Q7g_oZ6DhZot';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const params = new URLSearchParams(window.location.search);
const listaId = params.get('lista') || params.get('id');
const storageKey = listaId ? `futeboleiros_lista_online_${listaId}` : '';

let estado = null;
let buscaTimer = null;
let refreshTimer = null;
let realtimeChannel = null;
let ultimaRequisicao = 0;

const el = (id) => document.getElementById(id);

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const getInscricaoLocal = () => {
  if (!storageKey) return null;
  try { return JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch { return null; }
};

const setInscricaoLocal = (dados) => {
  if (!storageKey) return;
  localStorage.setItem(storageKey, JSON.stringify({ ...dados, salvo_em: new Date().toISOString() }));
};

const mostrarMensagem = (texto, tipo = 'error') => {
  const box = el('mensagem');
  if (!texto) {
    box.className = 'message hidden';
    box.textContent = '';
    return;
  }
  box.className = `message ${tipo}`;
  box.textContent = texto;
};

const atualizarPix = () => {
  const pixCard = el('pixCard');
  const pixChaveLinha = el('pixChaveLinha');
  const pixTitularLinha = el('pixTitularLinha');
  const btnCopiarPix = el('btnCopiarPix');
  const inscricao = getInscricaoLocal();
  const pixChave = estado?.lista?.pix_chave?.trim() || '';
  const pixTitular = estado?.lista?.pix_titular?.trim() || '';

  if (!inscricao || (!pixChave && !pixTitular)) {
    pixCard.classList.add('hidden');
    pixChaveLinha.classList.add('hidden');
    pixTitularLinha.classList.add('hidden');
    btnCopiarPix.classList.add('hidden');
    return;
  }

  pixCard.classList.remove('hidden');

  if (pixTitular) {
    el('pixTitular').textContent = pixTitular;
    pixTitularLinha.classList.remove('hidden');
  } else {
    pixTitularLinha.classList.add('hidden');
  }

  if (pixChave) {
    el('pixChave').textContent = pixChave;
    pixChaveLinha.classList.remove('hidden');
    btnCopiarPix.classList.remove('hidden');
  } else {
    pixChaveLinha.classList.add('hidden');
    btnCopiarPix.classList.add('hidden');
  }
};

const atualizarBloqueioInscricao = () => {
  const inscricao = getInscricaoLocal();
  const searchCard = el('searchCard');
  const realizada = el('inscricaoRealizada');
  if (inscricao) {
    searchCard.classList.add('hidden');
    realizada.classList.remove('hidden');
  } else {
    realizada.classList.add('hidden');
    if (estado?.lista?.inscricoes_abertas) searchCard.classList.remove('hidden');
  }
  atualizarPix();
};

const textoPosicao = (item) => item.posicao === 'Goleiro' ? 'Goleiro' : (item.funcao_linha || 'Linha');
const textoPagamento = (status) => status === 'pago' ? 'Pago' : 'Pendente';

const preencherResumo = (resumo = {}) => {
  const linha = resumo.linha || {};
  const goleiros = resumo.goleiros || {};
  const reservas = resumo.reservas || {};
  const espera = resumo.espera || {};
  el('resumoLinha').textContent = `${linha.preenchidas || 0}/${linha.total || 0}`;
  el('resumoGoleiros').textContent = `${goleiros.preenchidas || 0}/${goleiros.total || 0}`;
  el('resumoReservas').textContent = `${reservas.preenchidas || 0}/${reservas.total || 0}`;
  el('resumoEspera').textContent = `${espera.preenchidas || 0}/${espera.total || 0}`;
};

const renderInscritos = (containerId, itens = [], opcoes = {}) => {
  const container = el(containerId);
  if (!itens.length) {
    container.innerHTML = '<div class="empty">Nenhum jogador nesta seção.</div>';
    return;
  }
  container.innerHTML = itens.map((item, index) => {
    const numero = item.numero_vaga || index + 1;
    const status = textoPagamento(item.status_pagamento);
    const badgeClass = item.status_pagamento === 'pago' ? 'paid' : 'pending';
    const pagamentoHtml = opcoes.mostrarPagamento === false
      ? ''
      : `<span class="payment-badge ${badgeClass}">${status}</span>`;
    return `
      <div class="player-row">
        <span class="vaga-number">${escapeHtml(numero)}</span>
        <span class="player-main inscrit-main">
          <strong class="player-name">${escapeHtml(item.nome)}</strong>
          <span class="player-sub">${escapeHtml(textoPosicao(item))}</span>
        </span>
        <span class="inscrit-meta">
          ${pagamentoHtml}
          <span class="time-text">${escapeHtml(item.inscrito_em_iso || '')}</span>
        </span>
      </div>`;
  }).join('');
};

const aplicarEstado = (dados) => {
  estado = dados;
  const lista = dados.lista;
  el('listaNome').textContent = lista.nome || 'Lista online';
  const status = el('listaStatus');
  status.textContent = lista.inscricoes_abertas ? 'Inscrições abertas' : 'Inscrições fechadas';
  status.className = `status-pill ${lista.inscricoes_abertas ? '' : 'closed'}`;
  preencherResumo(dados.resumo || {});

  const inscritos = dados.inscritos || {};
  renderInscritos('listaGoleiros', inscritos.goleiros || [], { mostrarPagamento: false });
  renderInscritos('listaTitulares', inscritos.titulares || []);
  renderInscritos('listaReservas', inscritos.reservas || []);
  renderInscritos('listaEspera', inscritos.espera || []);

  if (!lista.inscricoes_abertas) {
    el('searchCard').classList.add('hidden');
    mostrarMensagem('As inscrições desta lista estão fechadas.', 'error');
  } else {
    mostrarMensagem('');
  }
  atualizarBloqueioInscricao();
};

const carregarLista = async (busca = el('busca').value) => {
  if (!listaId) return;

  const numeroRequisicao = ++ultimaRequisicao;
  try {
    const { data, error } = await supabaseClient.rpc('buscar_lista_online_publica', {
      p_lista_id: listaId,
      p_busca: busca || null,
    });

    if (numeroRequisicao !== ultimaRequisicao) return;
    if (error) throw error;
    if (!data?.ok) {
      aplicarErro(data?.mensagem || 'Não foi possível carregar a lista.');
      return;
    }
    aplicarEstado(data);
    renderResultados(data.jogadores || []);
  } catch (error) {
    if (numeroRequisicao !== ultimaRequisicao) return;
    console.error('Erro ao carregar lista:', error);
    aplicarErro('Não foi possível carregar a lista agora.');
  }
};

const aplicarErro = (mensagem) => {
  el('listaStatus').textContent = 'Indisponível';
  el('listaStatus').className = 'status-pill closed';
  el('searchCard').classList.add('hidden');
  mostrarMensagem(mensagem, 'error');
};

const textoIdentificacao = (jogador) => {
  const posicao = jogador.posicao === 'Goleiro' ? 'Goleiro' : (jogador.funcao_linha || 'Linha');
  return jogador.data_nascimento_publica ? `${posicao} • Nasc. ${jogador.data_nascimento_publica}` : posicao;
};

const renderResultados = (jogadores = []) => {
  const container = el('resultadosBusca');
  const termo = el('busca').value.trim();
  el('btnLimparBusca').classList.toggle('hidden', !termo);
  if (!termo || termo.length < 2 || getInscricaoLocal() || !estado?.lista?.inscricoes_abertas) {
    container.innerHTML = '';
    return;
  }
  if (!jogadores.length) {
    container.innerHTML = '<div class="empty">Nenhum jogador encontrado.</div>';
    return;
  }
  container.innerHTML = jogadores.map((jogador) => {
    const disabled = jogador.ja_inscrito ? 'disabled' : '';
    return `
      <div class="player-row search-player-row">
        <span class="player-main">
          <strong class="player-name">${escapeHtml(jogador.nome)}</strong>
          <span class="player-sub">${escapeHtml(textoIdentificacao(jogador))}</span>
        </span>
        <button class="action-button" type="button" data-jogador-id="${escapeHtml(jogador.id)}" data-jogador-nome="${escapeHtml(jogador.nome)}" ${disabled}>${jogador.ja_inscrito ? 'Inscrito' : 'Entrar'}</button>
      </div>`;
  }).join('');
};

const inscrever = async (jogadorId, nome) => {
  if (getInscricaoLocal()) return;
  if (!window.confirm(`Tem certeza que deseja entrar na lista como ${nome}?`)) return;
  try {
    const { data, error } = await supabaseClient.rpc('inscrever_jogador_lista_online', {
      p_lista_id: listaId,
      p_jogador_id: jogadorId,
      p_origem: 'web',
    });
    if (error) throw error;
    const resposta = Array.isArray(data) ? data[0] : data;
    if (!resposta?.ok) {
      const mensagem = resposta?.mensagem || 'Não foi possível realizar a inscrição.';
      await carregarLista();
      mostrarMensagem(mensagem, 'error');
      return;
    }
    setInscricaoLocal({ jogador_id: resposta.jogador_id, nome: resposta.nome_jogador, inscricao_id: resposta.inscricao_id });
    el('busca').value = '';
    renderResultados([]);
    mostrarMensagem('');
    atualizarBloqueioInscricao();
    await carregarLista('');
  } catch (error) {
    console.error('Erro ao inscrever:', error);
    mostrarMensagem('Não foi possível realizar a inscrição agora.', 'error');
  }
};

const agendarBusca = () => {
  if (buscaTimer) clearTimeout(buscaTimer);
  buscaTimer = setTimeout(() => carregarLista(), 280);
};

const agendarRefresh = () => {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => carregarLista(), 450);
};

const iniciarRealtime = () => {
  if (!listaId || realtimeChannel) return;
  realtimeChannel = supabaseClient
    .channel(`lista-publica-${listaId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'listas_online', filter: `id=eq.${listaId}` }, agendarRefresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'lista_online_inscritos', filter: `lista_id=eq.${listaId}` }, agendarRefresh)
    .subscribe();
};

el('busca').addEventListener('input', agendarBusca);
el('btnAtualizar').addEventListener('click', () => carregarLista());
el('btnCopiarPix').addEventListener('click', async () => {
  const pixChave = estado?.lista?.pix_chave?.trim() || '';
  if (!pixChave) return;
  try {
    await navigator.clipboard.writeText(pixChave);
    mostrarMensagem('Chave Pix copiada.', 'success');
  } catch (error) {
    mostrarMensagem('Não foi possível copiar automaticamente. Selecione e copie a chave Pix.', 'error');
  }
});
el('btnLimparBusca').addEventListener('click', () => {
  el('busca').value = '';
  renderResultados([]);
  carregarLista('');
});
el('resultadosBusca').addEventListener('click', (event) => {
  const botao = event.target.closest('button[data-jogador-id]');
  if (!botao || botao.disabled) return;
  inscrever(botao.dataset.jogadorId, botao.dataset.jogadorNome || 'jogador');
});

if (!listaId) {
  aplicarErro('Link da lista inválido.');
} else {
  carregarLista('');
  iniciarRealtime();
  setInterval(() => {
    if (document.visibilityState === 'visible') carregarLista();
  }, 2000);
}
