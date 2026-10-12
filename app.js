'use strict';
const CONTACT = Object.freeze({ name: 'Abreu', number: '5586998338949', display: '(86) 99833-8949' });
const materials = window.ROCHA_MATERIALS || [];
const glassModels = window.ROCHA_GLASS || [];
const catalogItems = materials.concat(glassModels);
const itemsById = new Map(catalogItems.map(item => [item.id, item]));

// O visitante confere e confirma a mensagem no WhatsApp.
function quoteMessage({ material = '', service = '', name = '', phone = '', details = '', catalog = '' } = {}) {
  const lines = [catalog.trim()
    ? 'Olá, Abreu! Vim pelo site da Rocha Representações e gostaria de receber o catálogo de ' + catalog.trim() + '.'
    : 'Olá, Abreu! Vim pelo site da Rocha Representações e gostaria de solicitar um orçamento.'];
  if (name.trim()) lines.push('Meu nome: ' + name.trim());
  if (phone.trim()) lines.push('WhatsApp para contato: ' + phone.trim());
  if (service.trim()) lines.push('Tipo de serviço: ' + service.trim());
  if (material.trim()) lines.push('Material: ' + material.trim());
  if (details.trim()) lines.push('Detalhes do projeto: ' + details.trim());
  return lines.join('\n');
}
function whatsappURL(options = {}) {
  return 'https://wa.me/' + CONTACT.number + '?text=' + encodeURIComponent(quoteMessage(options));
}
function itemQuote(item) {
  return item.category === 'vidro'
    ? whatsappURL({ service: item.service, details: 'Modelo de referência: ' + item.name + ' — ' + item.caption })
    : whatsappURL({ material: item.name });
}
document.querySelectorAll('[data-whatsapp]').forEach(link => {
  link.href = whatsappURL({ material: link.dataset.material || '', service: link.dataset.service || '', details: link.dataset.details || '', catalog: link.dataset.catalog || '' });
});
const phoneDisplay = document.getElementById('phone-display');
const yearDisplay = document.getElementById('year');
if (phoneDisplay) phoneDisplay.textContent = CONTACT.display;
if (yearDisplay) yearDisplay.textContent = String(new Date().getFullYear());

// Navegação comum às duas páginas.
const menu = document.querySelector('.menu-toggle');
const nav = document.getElementById('navigation');
function setMenu(open, restoreFocus = false) {
  if (!menu || !nav) return;
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  nav.classList.toggle('open', open);
  if (restoreFocus) menu.focus();
}
if (menu && nav) {
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') setMenu(false, true);
  });
  document.addEventListener('click', event => {
    if (nav.classList.contains('open') && !nav.contains(event.target) && !menu.contains(event.target)) setMenu(false);
  });
  const menuViewport = window.matchMedia('(max-width: 960px)');
  if (menuViewport.addEventListener) menuViewport.addEventListener('change', () => setMenu(false));
  else if (menuViewport.addListener) menuViewport.addListener(() => setMenu(false));
}

// Imagem ampliada, indicação de uso, qualidade e cuidados.
const materialDialog = document.getElementById('material-dialog');
const dialogs = Array.from(document.querySelectorAll('dialog'));
function showDialog(dialog) {
  if (!dialog) return;
  if (!dialog.open) dialog.showModal();
  document.body.classList.add('modal-open');
}
function openMaterial(item) {
  if (!item || !materialDialog) return;
  const image = document.getElementById('material-image');
  image.src = item.applicationImage || item.image;
  image.alt = (item.applicationKind === 'illustration' ? 'Ilustração de aplicação: ' : 'Exemplo de aplicação: ') + item.applicationCaption + ' em ' + item.name;
  const swatch = document.getElementById('material-swatch');
  swatch.hidden = !item.applicationImage || item.applicationImage === item.image;
  if (!swatch.hidden) {
    const label = item.imageKind === 'simulation' ? 'Simulação de tonalidade' : 'Amostra de referência';
    const sample = document.getElementById('material-swatch-image');
    sample.src = item.image;
    sample.alt = label + ' de ' + item.name;
    document.getElementById('material-swatch-label').textContent = label + '. Confira a chapa na cotação.';
  }
  document.getElementById('material-category').textContent = item.type;
  document.getElementById('material-title').textContent = item.name + (item.caption ? ' — ' + item.caption : '');
  document.getElementById('material-description').textContent = item.description;
  const uses = document.getElementById('material-uses');
  uses.replaceChildren();
  item.recommendedFor.forEach(use => {
    const line = document.createElement('li');
    line.textContent = use;
    uses.append(line);
  });
  document.getElementById('material-quality').textContent = item.quality;
  document.getElementById('material-care').textContent = item.care;
  document.getElementById('material-notice').textContent = item.applicationKind === 'illustration'
    ? 'Ilustração de aplicação gerada por IA. Tons, grãos e veios podem variar; consulte a amostra real e o acabamento.'
    : item.imageKind === 'simulation'
    ? 'Simulação gráfica de tonalidade. Consulte a chapa real, o acabamento e a disponibilidade.'
    : item.category === 'vidro'
      ? 'Modelo de referência. Medidas, vidro, ferragens e instalação são definidos para o projeto.'
      : 'Imagem de referência. Tons, veios e acabamentos podem variar; consulte a amostra do material.';
  const source = document.getElementById('material-source');
  source.hidden = !item.sourcePage;
  if (item.sourcePage) source.href = 'catalogos/catalogo-materiais-rocha.pdf#page=' + item.sourcePage;
  const quote = document.getElementById('material-quote');
  quote.href = itemQuote(item);
  quote.textContent = 'Solicitar orçamento ↗';
  showDialog(materialDialog);
}
document.querySelectorAll('[data-material-details]').forEach(button => {
  button.addEventListener('click', () => openMaterial(itemsById.get(button.dataset.materialDetails)));
});
dialogs.forEach(dialog => {
  const close = dialog.querySelector('.dialog-close');
  if (close) close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    if (!dialogs.some(item => item.open)) document.body.classList.remove('modal-open');
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
});
const sourcesButton = document.getElementById('sources-button');
if (sourcesButton) sourcesButton.addEventListener('click', () => showDialog(document.getElementById('sources-dialog')));

// O ícone do Instagram só aparece quando o perfil correto estiver configurado.
const instagramLink = document.getElementById('instagram-link');
const instagramProfile = String((window.ROCHA_SOCIAL || {}).instagram || '').trim();
if (instagramLink && instagramProfile) {
  try {
    const candidate = instagramProfile.startsWith('https://') ? instagramProfile : 'https://www.instagram.com/' + instagramProfile.replace(/^@/, '') + '/';
    const profile = new URL(candidate);
    if (profile.protocol === 'https:' && ['instagram.com', 'www.instagram.com'].includes(profile.hostname) && /^\/[a-zA-Z0-9._]{1,30}\/?$/.test(profile.pathname)) {
      instagramLink.href = profile.origin + profile.pathname;
      instagramLink.hidden = false;
    }
  } catch (_) { /* Aguarda um perfil válido, sem publicar um destino incorreto. */ }
}

// Catálogo completo: o conteúdo já está no HTML, inclusive sem JavaScript.
function normalise(value) {
  return value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}
const catalogGrid = document.getElementById('catalog');
if (catalogGrid) {
  const cards = Array.from(catalogGrid.querySelectorAll('[data-catalog-item]'));
  const filters = Array.from(document.querySelectorAll('[data-filter]'));
  const search = document.getElementById('catalog-search');
  const clear = document.getElementById('catalog-clear');
  const marble = document.getElementById('catalogo-marmores');
  const empty = document.getElementById('catalog-empty');
  const count = document.getElementById('catalog-count');
  const importedHighlight = document.getElementById('imported-highlight');
  const hashFilters = { todos: 'all', granitos: 'granito', marmores: 'marmore', superficies: 'superficie', vidros: 'vidro' };
  const searchText = new Map(catalogItems.map(item => [item.id, normalise([
    item.name, item.caption || '', item.type, item.description, item.quality,
    ...(item.aliases || []), ...item.recommendedFor
  ].join(' '))]));
  const marbleText = normalise('mármore mármores catálogo pedra cores acabamentos bancada tampo banheiro lavabo cozinha consultar');
  let selectedCategory = 'all';
  function applyCatalog() {
    const terms = normalise(search.value).split(/\s+/).filter(Boolean);
    if (importedHighlight) importedHighlight.hidden = selectedCategory === 'vidro';
    let visible = 0;
    cards.forEach(card => {
      const item = itemsById.get(card.dataset.catalogItem);
      const matches = item && (selectedCategory === 'all' || item.category === selectedCategory)
        && terms.every(term => searchText.get(item.id).includes(term));
      card.hidden = !matches;
      if (matches) visible++;
    });
    marble.hidden = (selectedCategory !== 'all' && selectedCategory !== 'marmore')
      || !terms.every(term => marbleText.includes(term));
    catalogGrid.hidden = visible === 0;
    empty.hidden = visible > 0 || !marble.hidden;
    clear.hidden = search.value.length === 0;
    count.textContent = visible > 0
      ? visible + (visible === 1 ? ' opção para conhecer' : ' opções para conhecer') + (!marble.hidden ? ' · mármores sob consulta' : '')
      : !marble.hidden ? 'Catálogo de mármores sob consulta' : 'Nenhuma opção encontrada';
  }
  function selectCategory(category, updateAddress = false) {
    selectedCategory = filters.some(button => button.dataset.filter === category) ? category : 'all';
    filters.forEach(button => {
      const active = button.dataset.filter === selectedCategory;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    applyCatalog();
    if (updateAddress) {
      const fragment = Object.keys(hashFilters).find(key => hashFilters[key] === selectedCategory);
      window.history.replaceState(null, '', '#' + fragment);
    }
  }
  function readCatalogAddress() {
    let fragment = '';
    try { fragment = decodeURIComponent(window.location.hash.slice(1)); } catch (_) { /* Fragmento inválido: mostra todos. */ }
    search.value = '';
    selectCategory(hashFilters[fragment] || 'all');
    const target = itemsById.has(fragment) || hashFilters[fragment] ? document.getElementById(fragment) : null;
    if (target) window.requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'auto' }));
  }
  filters.forEach(button => button.addEventListener('click', () => selectCategory(button.dataset.filter, true)));
  search.addEventListener('input', applyCatalog);
  clear.addEventListener('click', () => { search.value = ''; applyCatalog(); search.focus(); });
  window.addEventListener('hashchange', readCatalogAddress);
  document.getElementById('catalog-tools').hidden = false;
  readCatalogAddress();
}

// Formulário da página de início; não armazena nem envia dados automaticamente.
const form = document.getElementById('quote-form');
if (form) {
  const nameInput = document.getElementById('quote-name');
  const phoneInput = document.getElementById('quote-phone');
  function contactPhone(value) {
    const raw = value.trim();
    if (!/^[+\d\s().-]+$/.test(raw)) return '';
    const digits = raw.replace(/\D/g, '');
    const country = (digits.length === 12 || digits.length === 13) && digits.startsWith('55');
    const local = country ? digits.slice(2) : digits;
    if (!/^\d{10,11}$/.test(local)) return '';
    return (country ? '+55 ' : '') + '(' + local.slice(0, 2) + ') ' + local.slice(2, -4) + '-' + local.slice(-4);
  }
  const feedback = document.getElementById('quote-feedback');
  const continueLink = document.getElementById('quote-continue');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const phone = contactPhone(phoneInput.value);
    nameInput.setCustomValidity(nameInput.value.trim() ? '' : 'Informe seu nome.');
    phoneInput.setCustomValidity(phone ? '' : 'Informe seu WhatsApp com DDD.');
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const url = whatsappURL({ name: String(data.get('name') || ''), phone, service: String(data.get('service') || ''), material: String(data.get('material') || '') });
    continueLink.href = url;
    document.getElementById('quote-status').textContent = 'Mensagem preparada. Se o WhatsApp não abrir, use o link abaixo.';
    feedback.hidden = false;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.append(link);
    link.click();
    link.remove();
  });
  form.addEventListener('input', () => { feedback.hidden = true; nameInput.setCustomValidity(''); phoneInput.setCustomValidity(''); });
  form.addEventListener('change', () => { feedback.hidden = true; });
  document.getElementById('quote-details').hidden = false;
  document.querySelector('.quote-panel').classList.remove('quote-direct');
}
document.querySelectorAll('.connection-badge').forEach(badge => { badge.hidden = window.location.protocol !== 'https:'; });
document.documentElement.classList.add('js-ready');
