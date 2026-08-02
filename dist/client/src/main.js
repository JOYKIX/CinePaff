import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js';
import { getDatabase, ref, get, set, push, update, remove, onValue } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCU6x9NpQofU3wuYVzd0QIhHVO9uO_WRNA',
  authDomain: 'zogfilm.firebaseapp.com',
  databaseURL: 'https://zogfilm-default-rtdb.europe-west1.firebasedatabase.app/',
  projectId: 'zogfilm',
  storageBucket: 'zogfilm.firebasestorage.app',
  messagingSenderId: '653861137747',
  appId: '1:653861137747:web:e700c13f2982d2576045a6',
  measurementId: 'G-0K9GZV1EM0',
};

const tmdbToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MzBkNTBhZjI5YjNjMzFmOTE2NDJhNTk2NTBlYzRiNyIsIm5iZiI6MTcyODQyNjQ5NC44NTQsInN1YiI6IjY3MDViMWZlNDAyYmU4NTJiM2U5ZDE2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.uZZDjATh9z_0gaKy2PjPFBwpZu3_cSttVJt9OMpOaJU';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const encoder = new TextEncoder();
const storageKey = 'cinepaff_user';
const ratingFormatter = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const elements = {
  authPage: document.querySelector('#authPage'),
  appPage: document.querySelector('#appPage'),
  appHeader: document.querySelector('.app-header'),
  authForm: document.querySelector('#authForm'),
  identifier: document.querySelector('#identifier'),
  password: document.querySelector('#password'),
  authError: document.querySelector('#authError'),
  authSubmit: document.querySelector('#authSubmit'),
  authSubmitLabel: document.querySelector('#authSubmitLabel'),
  authToggle: document.querySelector('#authToggle'),
  currentUser: document.querySelector('#currentUser'),
  sessionAvatar: document.querySelector('.session__avatar'),
  sessionProfileButton: document.querySelector('#sessionProfileButton'),
  profileAvatar: document.querySelector('.profile-card__avatar'),
  logoutButton: document.querySelector('#logoutButton'),
  menuToggle: document.querySelector('#menuToggle'),
  navRow: document.querySelector('#primaryNav'),
  searchForm: document.querySelector('#searchForm'),
  movieQuery: document.querySelector('#movieQuery'),
  message: document.querySelector('#message'),
  proposalStatus: document.querySelector('#proposalStatus'),
  proposalPreview: document.querySelector('#proposalPreview'),
  results: document.querySelector('#results'),
  pendingMoviePanel: document.querySelector('#pendingMoviePanel'),
  pendingMoviePoster: document.querySelector('#pendingMoviePoster'),
  pendingMovieTitle: document.querySelector('#pendingMovieTitle'),
  pendingMovieMeta: document.querySelector('#pendingMovieMeta'),
  warningList: document.querySelector('#warningList'),
  cancelMovieSelection: document.querySelector('#cancelMovieSelection'),
  confirmMovieSelection: document.querySelector('#confirmMovieSelection'),
  movieList: document.querySelector('#movieList'),
  selectionCount: document.querySelector('#selectionCount'),
  currentPick: document.querySelector('#currentPick'),
  currentPickPoster: document.querySelector('#currentPickPoster'),
  currentPickTitle: document.querySelector('#currentPickTitle'),
  currentPickUser: document.querySelector('#currentPickUser'),
  winnerCard: document.querySelector('#winnerCard'),
  winnerTitle: document.querySelector('#winnerTitle'),
  winnerUser: document.querySelector('#winnerUser'),
  winnerPoster: document.querySelector('#winnerPoster'),
  drawStage: document.querySelector('#drawStage'),
  coverStack: document.querySelector('#coverStack'),
  tabs: document.querySelectorAll('.tab'),
  adminTabs: document.querySelectorAll('.admin-only'),
  drawTabs: document.querySelectorAll('.draw-only'),
  views: document.querySelectorAll('.view'),
  adminPanel: document.querySelector('#adminPanel'),
  profileAdminTools: document.querySelector('#profileAdminTools'),
  adminUserSearch: document.querySelector('#adminUserSearch'),
  drawButton: document.querySelector('#drawButton'),
  drawButtonLabel: document.querySelector('#drawButtonLabel'),
  drawPoolCount: document.querySelector('#drawPoolCount'),
  drawStatus: document.querySelector('#drawStatus'),
  drawCountdown: document.querySelector('#drawCountdown'),
  drawBurst: document.querySelector('#drawBurst'),
  drawKeepSelectionToggle: document.querySelector('#drawKeepSelectionToggle'),
  userList: document.querySelector('#userList'),
  seenList: document.querySelector('#seenList'),
  seenCount: document.querySelector('#seenCount'),
  ratingModal: document.querySelector('#ratingModal'),
  ratingModalBackdrop: document.querySelector('#ratingModalBackdrop'),
  ratingModalClose: document.querySelector('#ratingModalClose'),
  ratingModalTitle: document.querySelector('#ratingModalTitle'),
  ratingModalFacts: document.querySelector('#ratingModalFacts'),
  ratingModalOverview: document.querySelector('#ratingModalOverview'),
  ratingModalCredits: document.querySelector('#ratingModalCredits'),
  ratingModalImdb: document.querySelector('#ratingModalImdb'),
  ratingModalAverage: document.querySelector('#ratingModalAverage'),
  ratingModalAttribution: document.querySelector('#ratingModalAttribution'),
  ratingModalCommunity: document.querySelector('#ratingModalCommunity'),
  ratingModalPoster: document.querySelector('#ratingModalPoster'),
  ratingModalStars: document.querySelector('#ratingModalStars'),
  ratingModalComments: document.querySelector('#ratingModalComments'),
  ratingModalCommentCount: document.querySelector('#ratingModalCommentCount'),
  ratingModalCommentList: document.querySelector('#ratingModalCommentList'),
  ratingModalCommentForm: document.querySelector('#ratingModalCommentForm'),
  ratingModalCommentInput: document.querySelector('#ratingModalCommentInput'),
  ratingModalCommentDelete: document.querySelector('#ratingModalCommentDelete'),
  ratingModalCommentSubmit: document.querySelector('#ratingModalCommentSubmit'),
  ratingModalCommentSubmitLabel: document.querySelector('#ratingModalCommentSubmitLabel'),
  warningModal: document.querySelector('#warningModal'),
  warningModalBackdrop: document.querySelector('#warningModalBackdrop'),
  warningModalClose: document.querySelector('#warningModalClose'),
  warningModalTitle: document.querySelector('#warningModalTitle'),
  warningModalIntro: document.querySelector('#warningModalIntro'),
  warningModalList: document.querySelector('#warningModalList'),
  deleteHistoryModal: document.querySelector('#deleteHistoryModal'),
  deleteHistoryBackdrop: document.querySelector('#deleteHistoryBackdrop'),
  deleteHistoryClose: document.querySelector('#deleteHistoryClose'),
  deleteHistoryCancel: document.querySelector('#deleteHistoryCancel'),
  deleteHistoryConfirm: document.querySelector('#deleteHistoryConfirm'),
  deleteHistoryConfirmLabel: document.querySelector('#deleteHistoryConfirmLabel'),
  deleteHistoryTitle: document.querySelector('#deleteHistoryTitle'),
  deleteHistoryText: document.querySelector('#deleteHistoryText'),
  passwordModal: document.querySelector('#passwordModal'),
  passwordModalBackdrop: document.querySelector('#passwordModalBackdrop'),
  passwordModalClose: document.querySelector('#passwordModalClose'),
  passwordModalCancel: document.querySelector('#passwordModalCancel'),
  profilePasswordForm: document.querySelector('#profilePasswordForm'),
  profileCurrentPassword: document.querySelector('#profileCurrentPassword'),
  profileNewPassword: document.querySelector('#profileNewPassword'),
  profileConfirmPassword: document.querySelector('#profileConfirmPassword'),
  profilePasswordError: document.querySelector('#profilePasswordError'),
  profilePasswordSubmit: document.querySelector('#profilePasswordSubmit'),
  avatarCropModal: document.querySelector('#avatarCropModal'),
  avatarCropBackdrop: document.querySelector('#avatarCropBackdrop'),
  avatarCropClose: document.querySelector('#avatarCropClose'),
  avatarCropCancel: document.querySelector('#avatarCropCancel'),
  avatarCropConfirm: document.querySelector('#avatarCropConfirm'),
  avatarCropViewport: document.querySelector('#avatarCropViewport'),
  avatarCropCanvas: document.querySelector('#avatarCropCanvas'),
  avatarCropZoom: document.querySelector('#avatarCropZoom'),
  availabilityForm: document.querySelector('#availabilityForm'),
  availabilityRecurringMode: document.querySelector('#availabilityRecurringMode'),
  availabilityDateMode: document.querySelector('#availabilityDateMode'),
  availabilityDateField: document.querySelector('#availabilityDateField'),
  availabilityDate: document.querySelector('#availabilityDate'),
  availabilityDayPicker: document.querySelector('#availabilityDayPicker'),
  availabilityStart: document.querySelector('#availabilityStart'),
  availabilityEnd: document.querySelector('#availabilityEnd'),
  availabilityAllDay: document.querySelector('#availabilityAllDay'),
  availabilityList: document.querySelector('#availabilityList'),
  availabilityRuntime: document.querySelector('#availabilityRuntime'),
  availabilityBestSlot: document.querySelector('#availabilityBestSlot'),
  availabilityBestCoverage: document.querySelector('#availabilityBestCoverage'),
  availabilityBestPeople: document.querySelector('#availabilityBestPeople'),
  availabilityOwnCount: document.querySelector('#availabilityOwnCount'),
  availabilityPresets: document.querySelectorAll('[data-availability-preset]'),
  availabilityRoster: document.querySelector('#availabilityRoster'),
  availabilityRecommendations: document.querySelector('#availabilityRecommendations'),
  availabilityCalendarShell: document.querySelector('#availabilityCalendarShell'),
  availabilityCalendar: document.querySelector('#availabilityCalendar'),
  availabilityCalendarSelectionText: document.querySelector('#availabilityCalendarSelectionText'),
  availabilityCalendarClear: document.querySelector('#availabilityCalendarClear'),
  availabilityScheduleJumps: document.querySelectorAll('[data-schedule-jump]'),
  profileName: document.querySelector('#profileName'),
  profileRole: document.querySelector('#profileRole'),
  profileIdForm: document.querySelector('#profileIdForm'),
  profileIdInput: document.querySelector('#profileIdInput'),
  profileIdSubmit: document.querySelector('#profileIdSubmit'),
  profileAvatarButton: document.querySelector('#profileAvatarButton'),
  profileAvatarInput: document.querySelector('#profileAvatarInput'),
  profileAvatarRemove: document.querySelector('#profileAvatarRemove'),
  profilePasswordOpen: document.querySelector('#profilePasswordOpen'),
  profileDeleteAccount: document.querySelector('#profileDeleteAccount'),
  profileSeenCount: document.querySelector('#profileSeenCount'),
  profileAvailabilityCount: document.querySelector('#profileAvailabilityCount'),
  profileProposalState: document.querySelector('#profileProposalState'),
  profileShortcuts: document.querySelectorAll('[data-profile-route]'),
};

let authMode = 'login';
let memoryUser = null;
let currentUser = readStoredUser();
let movies = {};
let users = {};
let availability = {};
let draw = null;
let lastDrawn = null;
let history = {};
let route = 'home';
let activeSeenMovie = null;
let ratedMovieKey = '';
let keepSelectionOnDraw = false;
let movieDetailsRequestId = 0;
let activeMovieDetailsKey = '';
let pendingMovie = null;
let pendingWarnings = new Set();
let pendingDeleteRequest = null;
let availabilityMode = 'weekly';
let availabilitySelectedDays = new Set([(new Date().getDay() + 6) % 7]);
let availabilityAllDay = false;
let availabilityCalendarSelection = { start: null, end: null };
let drawRuntimeMinutes = null;
let drawRuntimeKey = '';
let drawInProgress = false;
let messageTimer = null;
let searchTimer = null;
let searchController = null;
let avatarCropState = null;
const drawAnimationDuration = 3600;
const movieDetailsCache = new Map();
const modalReturnFocus = new WeakMap();
const availabilityStepMinutes = 30;
const availabilityHorizonDays = 14;
const defaultMovieRuntimeMinutes = 120;
const maxMoviesPerUser = 10;
const routeConfig = {
  home: { label: 'Sélection' },
  availability: { label: 'Disponibilités' },
  draws: { label: 'Tirage', drawPermission: true },
  seen: { label: 'Historique' },
  profile: { label: 'Profil' },
};
const routeNames = Object.keys(routeConfig);

async function hydrateBrandWordmarks() {
  const wordmarks = [...document.querySelectorAll('[data-brand-wordmark]')];
  if (!wordmarks.length) return;

  try {
    const response = await fetch('./image/logocinepafftext.svg');
    if (!response.ok) throw new Error('Wordmark unavailable');

    const source = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
    const sourceSvg = source.documentElement;
    if (sourceSvg.nodeName.toLowerCase() !== 'svg' || source.querySelector('parsererror')) {
      throw new Error('Invalid wordmark');
    }

    sourceSvg.removeAttribute('width');
    sourceSvg.removeAttribute('height');
    sourceSvg.setAttribute('focusable', 'false');
    sourceSvg.setAttribute('aria-hidden', 'true');
    sourceSvg.querySelectorAll('text').forEach((textNode) => {
      textNode.style.fontFamily = '"Syne", sans-serif';
    });

    wordmarks.forEach((wordmark) => {
      wordmark.replaceChildren(document.importNode(sourceSvg, true));
      wordmark.classList.add('is-ready');
    });
  } catch {
    wordmarks.forEach((wordmark) => {
      const fallback = document.createElement('span');
      fallback.className = 'brand-lockup__fallback';
      fallback.innerHTML = '<span>Cine</span><strong>Paff</strong>';
      wordmark.replaceChildren(fallback);
      wordmark.classList.add('is-ready');
    });
  }
}

hydrateBrandWordmarks();

const dayOptions = [
  { id: 0, short: 'Lun', long: 'Lundi' },
  { id: 1, short: 'Mar', long: 'Mardi' },
  { id: 2, short: 'Mer', long: 'Mercredi' },
  { id: 3, short: 'Jeu', long: 'Jeudi' },
  { id: 4, short: 'Ven', long: 'Vendredi' },
  { id: 5, short: 'Sam', long: 'Samedi' },
  { id: 6, short: 'Dim', long: 'Dimanche' },
];
const triggerWarningOptions = [
  { id: 'violence', label: 'Violence' },
  { id: 'blood', label: 'Sang' },
  { id: 'sexual_content', label: 'Sexe / nudité' },
  { id: 'sexual_violence', label: 'Violence sexuelle' },
  { id: 'drugs', label: 'Drogues' },
  { id: 'suicide', label: 'Suicide' },
  { id: 'horror', label: 'Horreur / angoisse' },
  { id: 'discrimination', label: 'Discrimination' },
];

function createIcon(name) {
  const icon = document.createElement('span');
  icon.className = 'material-symbols-rounded';
  icon.ariaHidden = 'true';
  icon.textContent = name;
  return icon;
}

function setMessage(text = '') {
  window.clearTimeout(messageTimer);
  elements.message.textContent = text;
  elements.message.classList.toggle('is-visible', Boolean(text));
  if (text) {
    messageTimer = window.setTimeout(() => {
      elements.message.textContent = '';
      elements.message.classList.remove('is-visible');
    }, 3600);
  }
}

function setProposalStatus(text = '') {
  elements.proposalStatus.textContent = text;
}

function renderProposalPreview(list) {
  elements.proposalPreview.replaceChildren();
  elements.proposalPreview.classList.toggle('hidden', !list.length);
  if (!list.length) return;

  const primary = getPrimaryMovie(list);
  const orderedMovies = [primary, ...list.filter((movie) => movie.key !== primary?.key)].filter(Boolean);
  elements.proposalPreview.replaceChildren(...orderedMovies.map((movie) => {
    const isPrimary = movie.key === primary?.key;
    const item = document.createElement('div');
    item.className = `proposal-preview__item${isPrimary ? ' is-primary' : ''}`;

    const media = document.createElement('div');
    media.className = 'proposal-preview__poster';
    media.append(createPosterMedia(movie, 'w185'));

    const meta = document.createElement('span');
    meta.className = 'proposal-preview__meta';
    const title = document.createElement('strong');
    title.textContent = movie.title;
    const detail = document.createElement('small');
    detail.textContent = `${isPrimary ? 'Principal' : 'Secondaire'}${formatYear(movie.releaseDate) ? ` · ${formatYear(movie.releaseDate)}` : ''}`;
    meta.append(title, detail);

    const actions = document.createElement('span');
    actions.className = 'proposal-preview__actions';
    if (!isPrimary) {
      const primaryButton = document.createElement('button');
      primaryButton.className = 'proposal-preview__promote';
      primaryButton.type = 'button';
      primaryButton.setAttribute('aria-label', `Définir ${movie.title} comme film principal`);
      primaryButton.title = 'Définir comme principal';
      primaryButton.append(createIcon('star'));
      primaryButton.addEventListener('click', () => setPrimaryMovie(movie));
      actions.append(primaryButton);
    }

    const deleteButton = document.createElement('button');
    deleteButton.className = 'proposal-preview__delete';
    deleteButton.type = 'button';
    deleteButton.setAttribute('aria-label', `Supprimer ${movie.title}`);
    deleteButton.title = 'Supprimer';
    deleteButton.append(createIcon('delete'));
    deleteButton.addEventListener('click', () => openDeleteConfirmModal(movie, 'proposal'));
    actions.append(deleteButton);

    item.append(media, meta, actions);
    return item;
  }));
}

function syncModalLock() {
  const hasOpenModal = [elements.ratingModal, elements.warningModal, elements.deleteHistoryModal, elements.passwordModal, elements.avatarCropModal]
    .some((modal) => modal && !modal.classList.contains('hidden'));
  document.body.classList.toggle('modal-lock', hasOpenModal);
}

function getOpenModal() {
  return [elements.avatarCropModal, elements.passwordModal, elements.deleteHistoryModal, elements.warningModal, elements.ratingModal]
    .find((modal) => modal && !modal.classList.contains('hidden')) || null;
}

function trapModalFocus(event, modal) {
  const focusable = [...modal.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => element.offsetParent !== null && !element.classList.contains('modal-backdrop'));
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function showModal(modal, initialFocus = null) {
  modalReturnFocus.set(modal, document.activeElement);
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  syncModalLock();
  requestAnimationFrame(() => {
    (initialFocus || modal.querySelector('.modal-close, button:not(.modal-backdrop), [href]'))?.focus();
  });
}

function hideModal(modal) {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  syncModalLock();
  const returnFocus = modalReturnFocus.get(modal);
  modalReturnFocus.delete(modal);
  if (returnFocus?.isConnected) requestAnimationFrame(() => returnFocus.focus());
}

function createPosterMedia(movie, size = 'w342') {
  const imageUrl = posterUrl(movie?.posterPath, size);
  if (imageUrl) {
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = '';
    image.loading = 'lazy';
    return image;
  }

  const fallback = document.createElement('div');
  fallback.className = 'poster-card__fallback';
  fallback.textContent = movie?.title || 'CinePaff';
  return fallback;
}

function createCardButton(movie, label, onOpen) {
  const button = document.createElement('button');
  button.className = 'poster-card__button';
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.append(createPosterMedia(movie), createMovieCardMeta(movie));
  button.addEventListener('click', onOpen);
  return button;
}

function createMovieCardMeta(movie) {
  const meta = document.createElement('div');
  meta.className = 'poster-card__meta';
  const title = createMovieTitleRow(movie, { withWarningButton: false });
  const proposedBy = document.createElement('small');
  proposedBy.textContent = movie.proposedBy || '';
  meta.append(title, proposedBy);
  return meta;
}

function normalizeId(id) {
  return id.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
}

function bytesToHex(bytes) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex) {
  return new Uint8Array(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
}

async function hashPassword(password, salt = crypto.getRandomValues(new Uint8Array(16))) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' },
    key,
    256,
  );
  return { salt: bytesToHex(salt), hash: bytesToHex(new Uint8Array(bits)) };
}

function isStoredUser(user) {
  return Boolean(user && typeof user.id === 'string');
}

function getStorage(type) {
  try {
    return window[type];
  } catch {
    return null;
  }
}

function readStorage(storage) {
  if (!storage) return null;
  try {
    const storedUser = JSON.parse(storage.getItem(storageKey));
    return isStoredUser(storedUser) ? storedUser : null;
  } catch {
    return null;
  }
}

function writeStorage(storage, user) {
  if (!storage) return false;
  try {
    storage.setItem(storageKey, JSON.stringify(user));
    return true;
  } catch {
    return false;
  }
}

function removeStorage(storage) {
  if (!storage) return;
  try {
    storage.removeItem(storageKey);
  } catch {
    // Ignore storage errors so logout still works.
  }
}

function readStoredUser() {
  return readStorage(getStorage('localStorage')) || readStorage(getStorage('sessionStorage')) || memoryUser;
}

function storeCurrentUser() {
  if (!currentUser) return;
  memoryUser = currentUser;
  const stored = writeStorage(getStorage('localStorage'), currentUser);
  if (!stored) writeStorage(getStorage('sessionStorage'), currentUser);
}

function clearStoredUser() {
  memoryUser = null;
  removeStorage(getStorage('localStorage'));
  removeStorage(getStorage('sessionStorage'));
}

function goHome() {
  route = 'home';
  if (window.location.hash === '#home') {
    setRoute('home');
    return;
  }
  window.location.hash = 'home';
}

function setMobileMenu(open) {
  elements.appHeader.classList.toggle('menu-open', open);
  document.body.classList.toggle('menu-lock', open);
  elements.menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  elements.menuToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  elements.menuToggle.querySelector('.menu-toggle__label').textContent = open ? 'Fermer' : 'Menu';
  if (open) {
    window.setTimeout(() => {
      elements.navRow.querySelector('.tab:not(.hidden), #logoutButton')?.focus();
    }, 0);
  } else if (elements.navRow.contains(document.activeElement)) {
    elements.menuToggle.focus();
  }
}

function setKeepSelectionOnDraw(enabled) {
  keepSelectionOnDraw = enabled;
  elements.drawKeepSelectionToggle.classList.toggle('is-on', keepSelectionOnDraw);
  elements.drawKeepSelectionToggle.setAttribute('aria-pressed', keepSelectionOnDraw ? 'true' : 'false');
  if (currentUser) renderMovies();
}

async function passwordMatches(password, account) {
  try {
    if (account.passwordSalt && account.passwordHash) {
      const passwordData = await hashPassword(password, hexToBytes(account.passwordSalt));
      return passwordData.hash === account.passwordHash;
    }

    const legacyHash = await crypto.subtle.digest('SHA-256', encoder.encode(password));
    return bytesToHex(new Uint8Array(legacyHash)) === account.passwordHash;
  } catch {
    return false;
  }
}

function getAccountRole(account) {
  if (account?.isAdmin) return 'admin';
  if (account?.role === 'organizer' || account?.canDraw) return 'organizer';
  return 'user';
}

function getRoleLabel(account) {
  const labels = { admin: 'Admin', organizer: 'Organisateur', user: 'Utilisateur' };
  return labels[getAccountRole(account)];
}

function canRunDraw(account = currentUser) {
  return ['admin', 'organizer'].includes(getAccountRole(account));
}

function setRoute(nextRoute) {
  const requestedRoute = routeConfig[nextRoute] ? nextRoute : 'home';
  const previousRoute = route;
  route = requestedRoute;
  if (routeConfig[route]?.drawPermission && !canRunDraw()) route = 'home';
  if (window.location.hash !== `#${route}`) {
    window.history.replaceState(null, '', `#${route}`);
  }
  elements.views.forEach((view) => view.classList.toggle('hidden', view.dataset.view !== route));
  elements.tabs.forEach((tab) => {
    const isActive = tab.dataset.route === route;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
  document.body.dataset.route = route;
  document.title = `${routeConfig[route].label} — CinePaff`;
  setMobileMenu(false);
  if (previousRoute !== route) window.scrollTo({ top: 0, behavior: 'auto' });
}

function syncRouteFromHash() {
  const nextRoute = window.location.hash.replace('#', '') || 'home';
  setRoute(routeNames.includes(nextRoute) ? nextRoute : 'home');
}

function formatDate(timestamp) {
  if (!timestamp) return '';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(timestamp);
}

function movieArray() {
  return Object.entries(movies).map(([key, movie]) => ({ key, ...movie }));
}

function proposedMovies(userId = currentUser?.id) {
  if (!userId) return [];
  return movieArray()
    .filter((movie) => movie.proposedBy === userId)
    .sort((first, second) => (first.createdAt || 0) - (second.createdAt || 0));
}

function getPrimaryMovie(list) {
  return list.find((movie) => movie.isPrimary === true) || list[0] || null;
}

function proposedMovie(userId = currentUser?.id) {
  return getPrimaryMovie(proposedMovies(userId));
}

function getParticipantPools({ excludeLastDrawn = false } = {}) {
  const pools = new Map();
  movieArray().forEach((movie) => {
    if (!movie.proposedBy) return;
    if (excludeLastDrawn && movie.proposedBy === lastDrawn?.proposedBy) return;
    if (!pools.has(movie.proposedBy)) pools.set(movie.proposedBy, []);
    pools.get(movie.proposedBy).push(movie);
  });
  return [...pools.values()].map((pool) => pool.sort((first, second) => (first.createdAt || 0) - (second.createdAt || 0)));
}

function getSelectionMovies() {
  return getParticipantPools()
    .map(getPrimaryMovie)
    .filter(Boolean);
}

function buildBalancedDrawPool() {
  return getParticipantPools({ excludeLastDrawn: !keepSelectionOnDraw })
    .map((pool) => pool[Math.floor(Math.random() * pool.length)]);
}

function wasLastDrawnUser() {
  return lastDrawn?.proposedBy === currentUser?.id;
}

function canProposeMovie() {
  return !wasLastDrawnUser() && proposedMovies().length < maxMoviesPerUser;
}

function renderUserAvatars() {
  const initials = currentUser.id.slice(0, 2).toUpperCase();
  const avatarDataUrl = users[currentUser.id]?.avatarDataUrl || '';
  elements.sessionAvatar.textContent = avatarDataUrl ? '' : initials;
  elements.sessionAvatar.style.backgroundImage = avatarDataUrl ? `url("${avatarDataUrl}")` : '';
  elements.sessionAvatar.classList.toggle('has-image', Boolean(avatarDataUrl));
  elements.profileAvatar.dataset.initials = initials;
  elements.profileAvatar.style.backgroundImage = avatarDataUrl ? `url("${avatarDataUrl}")` : '';
  elements.profileAvatar.classList.toggle('has-image', Boolean(avatarDataUrl));
  elements.profileAvatarRemove.classList.toggle('hidden', !avatarDataUrl);
}

function render() {
  elements.authPage.classList.toggle('hidden', Boolean(currentUser));
  elements.appPage.classList.toggle('hidden', !currentUser);
  document.body.classList.toggle('is-authenticated', Boolean(currentUser));
  if (!currentUser) return;

  const account = users[currentUser.id] || currentUser;
  currentUser.isAdmin = Boolean(account.isAdmin);
  currentUser.role = getAccountRole(account);
  storeCurrentUser();
  elements.currentUser.textContent = currentUser.id;
  renderUserAvatars();
  elements.adminTabs.forEach((tab) => tab.classList.toggle('hidden', !currentUser.isAdmin));
  elements.drawTabs.forEach((tab) => tab.classList.toggle('hidden', !canRunDraw()));
  elements.profileAdminTools.classList.toggle('hidden', !currentUser.isAdmin);
  syncRouteFromHash();
  renderMovies();
  renderUsers();
  renderDraw();
  renderSeenMovies();
  renderAvailability();
  renderProfile();
}

function posterUrl(path, size = 'w342') {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : '';
}

function formatYear(date) {
  return typeof date === 'string' && date.length >= 4 ? date.slice(0, 4) : '';
}

function formatRuntime(minutes) {
  const value = Number(minutes);
  if (!Number.isFinite(value) || value <= 0) return '';
  const hours = Math.floor(value / 60);
  const remainingMinutes = value % 60;
  if (!hours) return `${remainingMinutes} min`;
  return remainingMinutes ? `${hours} h ${remainingMinutes} min` : `${hours} h`;
}

function padNumber(value) {
  return String(value).padStart(2, '0');
}

function toDateKey(date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

function dateFromKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getWeekdayIndex(date) {
  return (date.getDay() + 6) % 7;
}

function parseTimeMinutes(time) {
  const [hours, minutes] = String(time || '').split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return (hours * 60) + minutes;
}

function formatTimeFromMinutes(minutes) {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  return `${padNumber(Math.floor(normalized / 60))}:${padNumber(normalized % 60)}`;
}

function formatSlotRange(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const day = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: '2-digit', month: 'short' }).format(startDate);
  const startTime = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(startDate);
  const endTime = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(endDate);
  const nextDay = toDateKey(startDate) !== toDateKey(endDate) ? ' + lendemain' : '';
  return `${day} · ${startTime} - ${endTime}${nextDay}`;
}

function roundUpToStep(timestamp, stepMinutes) {
  const stepMs = stepMinutes * 60 * 1000;
  return Math.ceil(timestamp / stepMs) * stepMs;
}

function formatTmdbScore(score) {
  const value = Number(score);
  if (!Number.isFinite(value) || value <= 0) return '';
  return `${ratingFormatter.format(value)}/10`;
}

function createFact(label, value) {
  if (!value) return null;
  const fact = document.createElement('span');
  fact.className = 'movie-fact';
  const factLabel = document.createElement('small');
  factLabel.textContent = label;
  const factValue = document.createElement('strong');
  factValue.textContent = value;
  fact.append(factLabel, factValue);
  return fact;
}

function getTriggerWarnings(movie) {
  const rawWarnings = Array.isArray(movie?.triggerWarnings) ? movie.triggerWarnings : [];
  return rawWarnings
    .map((warning) => {
      if (typeof warning === 'string') {
        const option = triggerWarningOptions.find((item) => item.id === warning || item.label === warning);
        return option || { id: warning, label: warning };
      }
      const option = triggerWarningOptions.find((item) => item.id === warning?.id);
      return option || (warning?.label ? { id: warning.id || warning.label, label: warning.label } : null);
    })
    .filter(Boolean);
}

function hasTriggerWarnings(movie) {
  return getTriggerWarnings(movie).length > 0;
}

function createWarningButton(movie) {
  if (!hasTriggerWarnings(movie)) return null;
  const button = document.createElement('button');
  button.className = 'warning-button';
  button.type = 'button';
  button.title = 'Voir les trigger warnings';
  button.setAttribute('aria-label', `Voir les trigger warnings de ${movie.title}`);
  button.append(createIcon('warning'));
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    openWarningModal(movie);
  });
  return button;
}

function createMovieTitleRow(movie, options = {}) {
  const withWarningButton = options.withWarningButton !== false;
  const row = document.createElement('span');
  row.className = 'movie-title-row';
  const title = document.createElement('strong');
  title.textContent = movie.title;
  row.append(title);
  const warningButton = withWarningButton ? createWarningButton(movie) : null;
  if (warningButton) row.append(warningButton);
  return row;
}

function getMovieDetailsCacheKey(movie) {
  return movie.tmdbId ? `tmdb-${movie.tmdbId}` : `movie-${getSeenMovieId(movie)}`;
}

async function fetchMovieDetails(movie) {
  const cacheKey = getMovieDetailsCacheKey(movie);
  if (movieDetailsCache.has(cacheKey)) return movieDetailsCache.get(cacheKey);
  if (!movie.tmdbId) return null;

  const response = await fetch(`https://api.themoviedb.org/3/movie/${movie.tmdbId}?language=fr-FR&append_to_response=credits,external_ids`, {
    headers: { Authorization: `Bearer ${tmdbToken}`, accept: 'application/json' },
  });
  if (!response.ok) throw new Error('Movie details failed');
  const details = await response.json();
  movieDetailsCache.set(cacheKey, details);
  return details;
}

function getDirector(details) {
  return (details?.credits?.crew || []).find((person) => person.job === 'Director')?.name || '';
}

function getCast(details) {
  return (details?.credits?.cast || [])
    .slice(0, 3)
    .map((person) => person.name)
    .filter(Boolean)
    .join(', ');
}

function renderMovieDetails(movie, details, state = 'ready') {
  const genres = (details?.genres || []).map((genre) => genre.name).filter(Boolean).slice(0, 3).join(', ');
  const facts = [
    movie.isTestDraw ? createFact('Tirage', 'Test') : null,
    createFact('Année', formatYear(details?.release_date || movie.releaseDate)),
    createFact('Durée', formatRuntime(details?.runtime)),
    createFact('Genre', genres),
    createFact('TMDB', formatTmdbScore(details?.vote_average)),
  ].filter(Boolean);

  if (state === 'loading') {
    facts.unshift(createFact('Infos', 'Chargement'));
  }

  elements.ratingModalFacts.replaceChildren(...facts);
  elements.ratingModalOverview.textContent = state === 'loading'
    ? 'Chargement des infos du film...'
    : details?.overview || movie.overview || 'Synopsis indisponible pour ce film.';

  const director = getDirector(details);
  const cast = getCast(details);
  const credits = [
    director ? `Réalisation : ${director}` : '',
    cast ? `Avec : ${cast}` : '',
  ].filter(Boolean);

  if (state === 'error') credits.unshift('Infos détaillées indisponibles pour le moment.');
  elements.ratingModalCredits.replaceChildren(...credits.map((credit) => {
    const item = document.createElement('span');
    item.textContent = credit;
    return item;
  }));

  const imdbId = details?.external_ids?.imdb_id;
  elements.ratingModalImdb.classList.toggle('hidden', !imdbId);
  if (imdbId) elements.ratingModalImdb.href = `https://www.imdb.com/title/${imdbId}/`;
}

async function loadMovieDetails(movie, requestId) {
  try {
    const details = await fetchMovieDetails(movie);
    if (requestId !== movieDetailsRequestId || activeMovieDetailsKey !== getMovieDetailsCacheKey(movie)) return;
    renderMovieDetails(movie, details, details ? 'ready' : 'error');
  } catch {
    if (requestId !== movieDetailsRequestId || activeMovieDetailsKey !== getMovieDetailsCacheKey(movie)) return;
    renderMovieDetails(movie, null, 'error');
  }
}

function renderMovies() {
  const list = getSelectionMovies().sort((a, b) => {
    const ownA = a.proposedBy === currentUser?.id;
    const ownB = b.proposedBy === currentUser?.id;
    if (ownA !== ownB) return ownA ? -1 : 1;
    return (a.createdAt || 0) - (b.createdAt || 0);
  });
  const ownMovies = proposedMovies();
  const canPropose = canProposeMovie();
  const eligibleParticipants = getParticipantPools({ excludeLastDrawn: !keepSelectionOnDraw }).length;
  elements.selectionCount.textContent = `${list.length} en lice`;
  elements.drawPoolCount.textContent = `${eligibleParticipants} participant${eligibleParticipants > 1 ? 's' : ''}`;
  elements.drawButton.disabled = eligibleParticipants === 0 || drawInProgress;
  elements.searchForm.classList.toggle('hidden', !canPropose);
  if (!canPropose && pendingMovie) clearPendingMovie();
  setProposalStatus(wasLastDrawnUser()
    ? 'Pause jusqu’au prochain tirage'
    : ownMovies.length
      ? `${ownMovies.length}/${maxMoviesPerUser} films · 1 principal`
      : `0/${maxMoviesPerUser} films`);
  renderProposalPreview(ownMovies);
  if (!list.length) {
    elements.movieList.replaceChildren(createEmptyState('Aucun film en sélection'));
    return;
  }

  elements.movieList.replaceChildren(...list.map((movie) => {
    const item = document.createElement('article');
    item.className = 'poster-card';
    item.append(createCardButton(movie, `Voir la fiche de ${movie.title}`, () => openRatingModal(movie, { allowRating: false })));
    const warningButton = createWarningButton(movie);
    if (warningButton) item.append(warningButton);
    return item;
  }));
}

function createEmptyState(text) {
  const empty = document.createElement('div');
  empty.className = 'empty-state';
  empty.textContent = text;
  return empty;
}

function renderUsers() {
  if (!currentUser?.isAdmin) {
    elements.userList.replaceChildren();
    return;
  }

  const query = elements.adminUserSearch.value.trim().toUpperCase();
  const list = Object.entries(users)
    .map(([id, data]) => ({ id, ...data }))
    .filter((account) => !query || account.id.includes(query))
    .sort((a, b) => a.id.localeCompare(b.id));

  if (!list.length) {
    elements.userList.replaceChildren(createEmptyState('Aucun utilisateur trouvé'));
    return;
  }

  const adminCount = Object.values(users).filter((account) => account?.isAdmin).length;
  elements.userList.replaceChildren(...list.map((account) => {
    const item = document.createElement('div');
    item.className = 'list-item admin-user-item';
    const meta = document.createElement('span');
    meta.className = 'meta';
    const id = document.createElement('strong');
    id.textContent = account.id;
    const role = document.createElement('small');
    role.textContent = getRoleLabel(account);
    meta.append(id, role);

    const roleSelect = document.createElement('select');
    roleSelect.className = 'role-select';
    roleSelect.setAttribute('aria-label', `Rôle de ${account.id}`);
    [
      { value: 'user', label: 'Utilisateur' },
      { value: 'organizer', label: 'Organisateur' },
      { value: 'admin', label: 'Admin' },
    ].forEach(({ value, label }) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      roleSelect.append(option);
    });
    roleSelect.value = getAccountRole(account);
    roleSelect.addEventListener('change', async () => {
      const previousRole = getAccountRole(account);
      const nextRole = roleSelect.value;
      if (account.id === currentUser.id && previousRole === 'admin' && nextRole !== 'admin' && adminCount === 1) {
        roleSelect.value = previousRole;
        setMessage('Nomme un autre admin avant de changer ton rôle');
        return;
      }
      roleSelect.disabled = true;
      try {
        await update(ref(db, `users/${account.id}`), {
          isAdmin: nextRole === 'admin',
          role: nextRole === 'organizer' ? 'organizer' : null,
        });
        users[account.id] = {
          ...(users[account.id] || account),
          isAdmin: nextRole === 'admin',
          role: nextRole === 'organizer' ? 'organizer' : null,
        };
        if (account.id === currentUser.id) {
          currentUser = { ...currentUser, isAdmin: nextRole === 'admin', role: nextRole };
          storeCurrentUser();
          render();
        }
      } catch {
        roleSelect.value = previousRole;
        setMessage('Impossible de modifier cet utilisateur');
      } finally {
        roleSelect.disabled = false;
      }
    });
    item.append(meta, roleSelect);
    return item;
  }));
}

function renderDraw() {
  elements.winnerCard.classList.toggle('hidden', !draw);
  elements.drawStage.classList.toggle('has-winner', Boolean(draw));
  elements.winnerTitle.textContent = draw?.title || '';
  elements.winnerUser.textContent = draw?.proposedBy ? `Proposé par ${draw.proposedBy}` : '';
  elements.winnerPoster.replaceChildren();
  elements.currentPick.classList.toggle('hidden', !draw);
  elements.currentPickTitle.textContent = draw?.title || '';
  elements.currentPickUser.textContent = draw?.proposedBy ? `Proposé par ${draw.proposedBy}` : '';
  elements.currentPickPoster.replaceChildren();
  if (draw) {
    elements.winnerPoster.append(createPosterMedia(draw, 'w500'));
    elements.currentPickPoster.append(createPosterMedia(draw, 'w185'));
  }
  if (!isDrawing) elements.drawStatus.textContent = draw ? 'À L’AFFICHE' : 'PRÊT';
}

function normalizeRating(rating) {
  const value = Number(rating);
  return Number.isInteger(value) && value >= 1 && value <= 5 ? value : null;
}

function getMovieRatings(movie) {
  return Object.values(movie.ratings || {})
    .map(normalizeRating)
    .filter((rating) => rating !== null);
}

function getUserRating(movie) {
  if (!currentUser) return 0;
  return normalizeRating(movie.ratings?.[currentUser.id]) || 0;
}

function getAverageRating(movie) {
  const ratings = getMovieRatings(movie);
  if (!ratings.length) return '';
  const average = ratings.reduce((total, rating) => total + rating, 0) / ratings.length;
  return ratingFormatter.format(average);
}

function getRatingCount(movie) {
  return getMovieRatings(movie).length;
}

function getSeenMovieId(movie) {
  return movie.tmdbId || `${movie.title}-${movie.posterPath}`;
}

function normalizeSeenMovie(historyKey, movie) {
  const { key: movieKey = '', ratings = {}, comments = {}, ...movieData } = movie;
  return {
    ...movieData,
    key: historyKey,
    movieKey,
    historyKeys: [historyKey],
    ratings: { ...ratings },
    comments: { ...comments },
  };
}

function seenMovieArray() {
  const grouped = new Map();
  Object.entries(history).forEach(([historyKey, movie]) => {
    if (!movie?.title) return;
    const movieId = getSeenMovieId(movie);
    const nextMovie = normalizeSeenMovie(historyKey, movie);
    const existing = grouped.get(movieId);
    if (!existing) {
      grouped.set(movieId, nextMovie);
      return;
    }

    const latestMovie = (nextMovie.drawnAt || 0) > (existing.drawnAt || 0) ? nextMovie : existing;
    grouped.set(movieId, {
      ...latestMovie,
      historyKeys: Array.from(new Set([...(existing.historyKeys || []), historyKey])),
      drawnAt: Math.max(existing.drawnAt || 0, nextMovie.drawnAt || 0),
      ratings: { ...(existing.ratings || {}), ...(nextMovie.ratings || {}) },
      comments: { ...(existing.comments || {}), ...(nextMovie.comments || {}) },
    });
  });

  return [...grouped.values()].sort((a, b) => (b.drawnAt || 0) - (a.drawnAt || 0));
}

function getMovieComments(movie) {
  return Object.entries(movie.comments || {})
    .map(([authorId, comment]) => ({
      authorId,
      text: typeof comment === 'string' ? comment.trim() : String(comment?.text || '').trim(),
      createdAt: typeof comment === 'object' ? Number(comment?.createdAt) || 0 : 0,
      updatedAt: typeof comment === 'object' ? Number(comment?.updatedAt) || 0 : 0,
    }))
    .filter((comment) => comment.text)
    .sort((first, second) => (first.createdAt || first.updatedAt) - (second.createdAt || second.updatedAt));
}

function createMovieComment(comment) {
  const item = document.createElement('article');
  item.className = 'movie-comment';
  const avatar = document.createElement('span');
  avatar.className = 'movie-comment__avatar';
  const avatarDataUrl = users[comment.authorId]?.avatarDataUrl || '';
  avatar.textContent = avatarDataUrl ? '' : comment.authorId.slice(0, 2).toUpperCase();
  avatar.style.backgroundImage = avatarDataUrl ? `url("${avatarDataUrl}")` : '';

  const body = document.createElement('div');
  const head = document.createElement('div');
  const author = document.createElement('strong');
  author.textContent = comment.authorId;
  const date = document.createElement('small');
  date.textContent = formatDate(comment.updatedAt || comment.createdAt);
  head.append(author, date);
  const text = document.createElement('p');
  text.textContent = comment.text;
  body.append(head, text);
  item.append(avatar, body);
  return item;
}

function renderMovieComments(movie, allowComments) {
  elements.ratingModalComments.classList.toggle('hidden', !allowComments);
  if (!allowComments) {
    elements.ratingModalCommentList.replaceChildren();
    elements.ratingModalCommentInput.value = '';
    return;
  }

  const comments = getMovieComments(movie);
  const ownComment = comments.find((comment) => comment.authorId === currentUser?.id) || null;
  elements.ratingModalCommentCount.textContent = String(comments.length);
  elements.ratingModalCommentList.replaceChildren(...comments.map(createMovieComment));
  if (document.activeElement !== elements.ratingModalCommentInput) {
    elements.ratingModalCommentInput.value = ownComment?.text || '';
  }
  elements.ratingModalCommentDelete.classList.toggle('hidden', !ownComment);
  elements.ratingModalCommentSubmitLabel.textContent = ownComment ? 'Modifier' : 'Publier';
}

function createRatingButton(movie, value) {
  const button = document.createElement('button');
  button.className = 'rating-button';
  button.type = 'button';
  button.textContent = '★';
  button.ariaLabel = `Noter ${value}/5`;
  button.title = `Noter ${value}/5`;
  const userRating = getUserRating(movie);
  button.classList.toggle('active', value <= userRating);
  button.classList.toggle('selected', value === userRating);
  button.setAttribute('aria-pressed', value <= userRating ? 'true' : 'false');
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    rateSeenMovie(movie.key, value);
  });
  return button;
}

function createSeenMovieCard(movie) {
  const item = document.createElement('article');
  item.className = 'poster-card seen-card';
  const cardButton = document.createElement('button');
  cardButton.className = 'poster-card__button';
  cardButton.type = 'button';
  cardButton.setAttribute('aria-label', `Noter ${movie.title}`);
  cardButton.append(createPosterMedia(movie));
  cardButton.addEventListener('click', () => openRatingModal(movie));

  const meta = document.createElement('div');
  meta.className = 'poster-card__meta';
  const title = createMovieTitleRow(movie, { withWarningButton: false });
  const proposedBy = document.createElement('small');
  proposedBy.textContent = movie.proposedBy;
  const testBadge = document.createElement('span');
  testBadge.className = 'seen-card__badge';
  testBadge.textContent = 'Tirage test';
  const ratingRow = document.createElement('span');
  ratingRow.className = 'seen-card__rating-row';
  const average = document.createElement('span');
  average.className = 'seen-card__rating';
  const averageRating = getAverageRating(movie);
  average.textContent = averageRating ? `${averageRating}/5` : '—/5';
  const ratingCount = getRatingCount(movie);
  average.title = ratingCount ? `${ratingCount} note${ratingCount > 1 ? 's' : ''}` : 'Aucune note';
  const userRating = getUserRating(movie);
  item.classList.toggle('seen-card--rated', userRating > 0);
  if (movie.key === ratedMovieKey) item.classList.add('seen-card--just-rated');
  ratingRow.append(average);
  if (userRating > 0) {
    const marker = document.createElement('span');
    marker.className = 'seen-card__rated-marker';
    marker.textContent = `★ ${userRating}`;
    marker.ariaLabel = `Votre note ${userRating}/5`;
    ratingRow.append(marker);
  }
  const commentCount = getMovieComments(movie).length;
  if (commentCount > 0) {
    const comments = document.createElement('span');
    comments.className = 'seen-card__comments';
    comments.append(createIcon('chat_bubble'));
    const count = document.createElement('span');
    count.textContent = String(commentCount);
    comments.append(count);
    comments.ariaLabel = `${commentCount} commentaire${commentCount > 1 ? 's' : ''}`;
    ratingRow.append(comments);
  }
  meta.append(title, proposedBy);
  if (movie.isTestDraw) meta.append(testBadge);
  meta.append(ratingRow);
  cardButton.append(meta);
  item.append(cardButton);
  const warningButton = createWarningButton(movie);
  if (warningButton) item.append(warningButton);
  if (currentUser?.isAdmin) {
    const deleteButton = document.createElement('button');
    deleteButton.className = 'poster-card__delete seen-card__delete';
    deleteButton.type = 'button';
    deleteButton.setAttribute('aria-label', `Supprimer ${movie.title} de l’historique`);
    deleteButton.title = 'Supprimer';
    deleteButton.append(createIcon('delete'));
    deleteButton.addEventListener('click', () => openDeleteConfirmModal(movie, 'history'));
    item.append(deleteButton);
  }
  return item;
}

function renderSeenMovies() {
  const list = seenMovieArray();
  elements.seenCount.textContent = `${list.length} film${list.length > 1 ? 's' : ''}`;
  elements.seenList.replaceChildren(...(list.length ? list.map(createSeenMovieCard) : [createEmptyState('Aucun film vu')]));
  if (activeSeenMovie) {
    const refreshedMovie = list.find((movie) => (
      movie.key === activeSeenMovie.key
      || movie.historyKeys?.includes(activeSeenMovie.key)
    ));
    if (refreshedMovie) openRatingModal(refreshedMovie);
    else closeRatingModal();
  }
}

function openRatingModal(movie, options = {}) {
  const allowRating = options.allowRating !== false;
  activeSeenMovie = allowRating ? movie : null;
  activeMovieDetailsKey = getMovieDetailsCacheKey(movie);
  const requestId = ++movieDetailsRequestId;
  elements.ratingModalTitle.textContent = movie.title;
  elements.ratingModalAttribution.textContent = movie.proposedBy ? `Proposé par ${movie.proposedBy}` : '';
  elements.ratingModalCommunity.classList.toggle('hidden', !allowRating);
  if (allowRating) {
    const averageRating = getAverageRating(movie);
    const ratingCount = getRatingCount(movie);
    const userRating = getUserRating(movie);
    const averageLabel = averageRating
      ? `${averageRating}/5 · ${ratingCount} note${ratingCount > 1 ? 's' : ''}`
      : 'Pas encore noté';
    elements.ratingModalAverage.textContent = userRating
      ? `${averageLabel} · Ta note ${userRating}/5`
      : averageLabel;
  } else {
    elements.ratingModalAverage.textContent = '';
  }
  elements.ratingModalPoster.replaceChildren();
  const imageUrl = posterUrl(movie.posterPath, 'w500');
  if (imageUrl) {
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = '';
    elements.ratingModalPoster.append(image);
  } else {
    const fallback = document.createElement('div');
    fallback.className = 'poster-card__fallback';
    fallback.textContent = movie.title;
    elements.ratingModalPoster.append(fallback);
  }
  renderMovieDetails(movie, null, 'loading');
  loadMovieDetails(movie, requestId);
  elements.ratingModalStars.replaceChildren(...(allowRating ? [1, 2, 3, 4, 5].map((value) => createRatingButton(movie, value)) : []));
  elements.ratingModalStars.classList.toggle('hidden', !allowRating);
  elements.ratingModalStars.classList.toggle('rating--confirmed', allowRating && movie.key === ratedMovieKey && getUserRating(movie) > 0);
  renderMovieComments(movie, allowRating);
  showModal(elements.ratingModal);
}

function closeRatingModal() {
  activeSeenMovie = null;
  activeMovieDetailsKey = '';
  movieDetailsRequestId += 1;
  hideModal(elements.ratingModal);
}

function openWarningModal(movie) {
  const warnings = getTriggerWarnings(movie);
  if (!warnings.length) return;
  elements.warningModalTitle.textContent = movie.title;
  elements.warningModalIntro.textContent = `Warnings ajoutés par ${movie.warningBy || movie.proposedBy || 'la personne qui a proposé le film'}.`;
  elements.warningModalList.replaceChildren(...warnings.map((warning) => {
    const item = document.createElement('span');
    item.className = 'warning-modal-item';
    const icon = document.createElement('span');
    icon.className = 'material-symbols-rounded';
    icon.ariaHidden = 'true';
    icon.textContent = 'warning';
    item.append(icon, warning.label);
    return item;
  }));
  showModal(elements.warningModal);
}

function closeWarningModal() {
  hideModal(elements.warningModal);
  elements.warningModalList.replaceChildren();
}

function openDeleteConfirmModal(movie, type) {
  const isProposal = type === 'proposal';
  if (!movie?.key) return;
  if (isProposal && movie.proposedBy !== currentUser?.id) return;
  if (!isProposal && !currentUser?.isAdmin) return;

  pendingDeleteRequest = { movie, type };
  elements.deleteHistoryTitle.textContent = isProposal ? 'Retirer ta proposition' : 'Supprimer de l’historique';
  elements.deleteHistoryText.textContent = isProposal
    ? `Retirer « ${movie.title} » de la sélection ?`
    : `Supprimer « ${movie.title} » de l’historique ? Ses notes et commentaires seront également retirés.`;
  elements.deleteHistoryConfirmLabel.textContent = isProposal ? 'Retirer' : 'Supprimer';
  showModal(elements.deleteHistoryModal, elements.deleteHistoryCancel);
}

function openAccountDeleteConfirmModal() {
  if (!currentUser) return;
  pendingDeleteRequest = { type: 'account' };
  elements.deleteHistoryTitle.textContent = 'Supprimer ton compte';
  elements.deleteHistoryText.textContent = `Supprimer définitivement le compte « ${currentUser.id} » ? Ta proposition, tes disponibilités, tes notes et tes commentaires seront retirés.`;
  elements.deleteHistoryConfirmLabel.textContent = 'Supprimer mon compte';
  showModal(elements.deleteHistoryModal, elements.deleteHistoryCancel);
}

function openAvatarDeleteConfirmModal() {
  if (!currentUser || !users[currentUser.id]?.avatarDataUrl) return;
  pendingDeleteRequest = { type: 'avatar' };
  elements.deleteHistoryTitle.textContent = 'Supprimer la photo';
  elements.deleteHistoryText.textContent = 'Retirer ta photo de profil ? Tes initiales seront affichées à la place.';
  elements.deleteHistoryConfirmLabel.textContent = 'Supprimer la photo';
  showModal(elements.deleteHistoryModal, elements.deleteHistoryCancel);
}

function closeDeleteConfirmModal() {
  pendingDeleteRequest = null;
  hideModal(elements.deleteHistoryModal);
  elements.deleteHistoryConfirm.disabled = false;
  elements.deleteHistoryConfirm.removeAttribute('aria-busy');
}

async function rateSeenMovie(key, rating) {
  const normalizedRating = normalizeRating(rating);
  if (!currentUser || !key || !normalizedRating) return;
  ratedMovieKey = key;
  if (history[key]) {
    history[key] = {
      ...history[key],
      ratings: { ...(history[key].ratings || {}), [currentUser.id]: normalizedRating },
    };
    renderSeenMovies();
  }
  try {
    await set(ref(db, `draw/history/${key}/ratings/${currentUser.id}`), normalizedRating);
  } catch {
    setMessage('Impossible d’enregistrer la note');
  }
}

async function saveSeenComment(event) {
  event.preventDefault();
  const movie = activeSeenMovie;
  const text = elements.ratingModalCommentInput.value.trim();
  if (!currentUser || !movie?.key || !text) return;
  const existing = movie.comments?.[currentUser.id];
  const now = Date.now();
  const historyKeys = movie.historyKeys?.length ? movie.historyKeys : [movie.key];
  const changes = Object.fromEntries(historyKeys.map((key) => [`draw/history/${key}/comments/${currentUser.id}`, null]));
  changes[`draw/history/${movie.key}/comments/${currentUser.id}`] = {
    text,
    createdAt: Number(existing?.createdAt) || now,
    updatedAt: now,
  };
  elements.ratingModalCommentSubmit.disabled = true;
  try {
    await update(ref(db), changes);
  } catch {
    setMessage('Impossible d’enregistrer le commentaire');
  } finally {
    elements.ratingModalCommentSubmit.disabled = false;
  }
}

async function deleteSeenComment() {
  const movie = activeSeenMovie;
  if (!currentUser || !movie?.key || !movie.comments?.[currentUser.id]) return;
  const historyKeys = movie.historyKeys?.length ? movie.historyKeys : [movie.key];
  const changes = Object.fromEntries(historyKeys.map((key) => [`draw/history/${key}/comments/${currentUser.id}`, null]));
  elements.ratingModalCommentDelete.disabled = true;
  try {
    await update(ref(db), changes);
  } catch {
    setMessage('Impossible de supprimer le commentaire');
  } finally {
    elements.ratingModalCommentDelete.disabled = false;
  }
}

async function deleteSeenMovie(movie) {
  if (!currentUser?.isAdmin || !movie?.key) return;
  try {
    await Promise.all((movie.historyKeys?.length ? movie.historyKeys : [movie.key])
      .map((key) => remove(ref(db, `draw/history/${key}`))));
    if (activeSeenMovie?.key === movie.key) closeRatingModal();
    closeDeleteConfirmModal();
  } catch {
    setMessage('Impossible de supprimer ce film de l’historique');
  }
}

async function deleteCurrentAccount() {
  if (!currentUser) return;
  const deletedUser = { ...currentUser };
  try {
    const rootSnapshot = await get(ref(db));
    const data = rootSnapshot.val() || {};
    const changes = {
      [`users/${deletedUser.id}`]: null,
      [`availability/${deletedUser.id}`]: null,
    };

    Object.entries(data.movies || {}).forEach(([key, movie]) => {
      if (movie.proposedBy === deletedUser.id) {
        changes[`movies/${key}`] = null;
        return;
      }
      if (movie.warningBy === deletedUser.id) changes[`movies/${key}/warningBy`] = null;
    });

    ['current', 'lastDrawn'].forEach((drawKey) => {
      const movie = data.draw?.[drawKey];
      if (!movie) return;
      if (movie.proposedBy === deletedUser.id) changes[`draw/${drawKey}/proposedBy`] = 'COMPTE SUPPRIMÉ';
      if (movie.warningBy === deletedUser.id) changes[`draw/${drawKey}/warningBy`] = null;
    });

    Object.entries(data.draw?.history || {}).forEach(([key, movie]) => {
      if (movie.proposedBy === deletedUser.id) changes[`draw/history/${key}/proposedBy`] = 'COMPTE SUPPRIMÉ';
      if (movie.warningBy === deletedUser.id) changes[`draw/history/${key}/warningBy`] = null;
      if (movie.ratings?.[deletedUser.id] !== undefined) changes[`draw/history/${key}/ratings/${deletedUser.id}`] = null;
      if (movie.comments?.[deletedUser.id] !== undefined) changes[`draw/history/${key}/comments/${deletedUser.id}`] = null;
    });

    const remainingUsers = Object.entries(data.users || {})
      .filter(([userId]) => userId !== deletedUser.id)
      .sort(([, first], [, second]) => (first.createdAt || 0) - (second.createdAt || 0));
    if (deletedUser.isAdmin && remainingUsers.length && !remainingUsers.some(([, account]) => account.isAdmin)) {
      changes[`users/${remainingUsers[0][0]}/isAdmin`] = true;
      changes[`users/${remainingUsers[0][0]}/role`] = null;
    }

    await update(ref(db), changes);
    closeDeleteConfirmModal();
    setMobileMenu(false);
    clearStoredUser();
    currentUser = null;
    elements.authForm.reset();
    elements.authError.textContent = 'Compte supprimé';
    render();
  } catch {
    setMessage('Impossible de supprimer ton compte');
  }
}

function setAvailabilityMode(mode) {
  availabilityMode = mode;
  const isWeekly = availabilityMode === 'weekly';
  elements.availabilityRecurringMode.classList.toggle('is-on', isWeekly);
  elements.availabilityRecurringMode.setAttribute('aria-pressed', isWeekly ? 'true' : 'false');
  elements.availabilityDateMode.classList.toggle('is-on', !isWeekly);
  elements.availabilityDateMode.setAttribute('aria-pressed', isWeekly ? 'false' : 'true');
  elements.availabilityDateField.classList.toggle('hidden', isWeekly);
  elements.availabilityDayPicker.classList.toggle('hidden', !isWeekly);
  renderAvailabilityDayPicker();
}

function setAvailabilityAllDay(enabled) {
  availabilityAllDay = enabled;
  elements.availabilityAllDay.classList.toggle('is-on', availabilityAllDay);
  elements.availabilityAllDay.setAttribute('aria-pressed', availabilityAllDay ? 'true' : 'false');
  elements.availabilityStart.disabled = availabilityAllDay;
  elements.availabilityEnd.disabled = availabilityAllDay;
}

function applyAvailabilityPreset(preset) {
  resetAvailabilityCalendarSelection(false);
  setAvailabilityAllDay(false);
  if (preset === 'tonight') {
    setAvailabilityMode('date');
    elements.availabilityDate.value = toDateKey(new Date());
    elements.availabilityStart.value = '20:00';
    elements.availabilityEnd.value = '23:30';
  } else {
    setAvailabilityMode('weekly');
    if (preset === 'weekend') {
      availabilitySelectedDays = new Set([5, 6]);
      elements.availabilityStart.value = '14:00';
      elements.availabilityEnd.value = '00:00';
    } else {
      availabilitySelectedDays = new Set([0, 1, 2, 3, 4]);
      elements.availabilityStart.value = '19:30';
      elements.availabilityEnd.value = '23:30';
    }
    renderAvailabilityDayPicker();
  }
  elements.availabilityPresets.forEach((button) => {
    button.classList.toggle('is-on', button.dataset.availabilityPreset === preset);
  });
  renderAvailabilityCalendar();
}

function renderAvailabilityDayPicker() {
  const allSelected = availabilitySelectedDays.size === dayOptions.length;
  const allButton = document.createElement('button');
  allButton.className = `day-chip${allSelected ? ' is-on' : ''}`;
  allButton.type = 'button';
  allButton.textContent = 'Tous';
  allButton.setAttribute('aria-pressed', allSelected ? 'true' : 'false');
  allButton.addEventListener('click', () => {
    availabilitySelectedDays = allSelected ? new Set() : new Set(dayOptions.map((day) => day.id));
    renderAvailabilityDayPicker();
  });

  const dayButtons = dayOptions.map((day) => {
    const button = document.createElement('button');
    const selected = availabilitySelectedDays.has(day.id);
    button.className = `day-chip${selected ? ' is-on' : ''}`;
    button.type = 'button';
    button.textContent = day.short;
    button.title = day.long;
    button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    button.addEventListener('click', () => {
      if (availabilitySelectedDays.has(day.id)) availabilitySelectedDays.delete(day.id);
      else availabilitySelectedDays.add(day.id);
      renderAvailabilityDayPicker();
    });
    return button;
  });

  elements.availabilityDayPicker.replaceChildren(allButton, ...dayButtons);
}

function getUserAvailabilityEntries(userId) {
  return Object.entries(availability[userId] || {})
    .map(([key, entry]) => ({ key, ...entry }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

function describeAvailabilityEntry(entry) {
  const dayText = entry.type === 'date'
    ? new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' }).format(dateFromKey(entry.date))
    : (entry.days?.length === dayOptions.length
      ? 'Tous les jours'
      : (entry.days || []).map((id) => dayOptions.find((day) => day.id === id)?.long).filter(Boolean).join(', '));

  if (entry.allDay) return `${dayText} · toute la journée`;
  const overnight = parseTimeMinutes(entry.end) <= parseTimeMinutes(entry.start);
  return `${dayText} · ${entry.start} - ${entry.end}${overnight ? ' (+ lendemain)' : ''}`;
}

function renderAvailabilityList() {
  const entries = getUserAvailabilityEntries(currentUser.id);
  elements.availabilityOwnCount.textContent = String(entries.length);
  if (!entries.length) {
    elements.availabilityList.replaceChildren(createEmptyState('Aucun créneau ajouté'));
    return;
  }

  elements.availabilityList.replaceChildren(...entries.map((entry) => {
    const item = document.createElement('div');
    item.className = 'availability-list-item';
    const icon = document.createElement('span');
    icon.className = 'material-symbols-rounded availability-list-item__icon';
    icon.ariaHidden = 'true';
    icon.textContent = entry.type === 'date' ? 'event' : 'event_repeat';
    const meta = document.createElement('span');
    meta.className = 'meta';
    const title = document.createElement('strong');
    title.textContent = entry.type === 'date' ? 'Date précise' : 'Chaque semaine';
    const detail = document.createElement('small');
    detail.textContent = describeAvailabilityEntry(entry);
    meta.append(title, detail);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'poster-card__delete availability-delete';
    deleteButton.type = 'button';
    deleteButton.append(createIcon('delete'));
    deleteButton.setAttribute('aria-label', 'Supprimer cette disponibilité');
    deleteButton.addEventListener('click', async () => {
      await remove(ref(db, `availability/${currentUser.id}/${entry.key}`));
    });
    item.append(icon, meta, deleteButton);
    return item;
  }));
}

function getAvailabilityRuntime() {
  return drawRuntimeMinutes || defaultMovieRuntimeMinutes;
}

function getDrawRuntimeLabel() {
  if (!draw) return `Aucun film tiré · estimation ${formatRuntime(defaultMovieRuntimeMinutes)}`;
  if (drawRuntimeMinutes) return `${draw.title} · ${formatRuntime(drawRuntimeMinutes)}`;
  return `${draw.title} · estimation ${formatRuntime(defaultMovieRuntimeMinutes)}`;
}

function buildAvailabilityIntervals() {
  const today = new Date(startOfDay(new Date()));
  const intervalsByUser = new Map();
  Object.entries(availability).forEach(([userId, userEntries]) => {
    Object.values(userEntries || {}).forEach((entry) => {
      const startMinutes = entry.allDay ? 0 : parseTimeMinutes(entry.start);
      const endMinutes = entry.allDay ? 1440 : parseTimeMinutes(entry.end);
      if (startMinutes === null || endMinutes === null) return;

      const addInterval = (date) => {
        const start = startOfDay(date) + (startMinutes * 60 * 1000);
        const durationMinutes = entry.allDay
          ? 1440
          : (endMinutes <= startMinutes ? (endMinutes + 1440 - startMinutes) : (endMinutes - startMinutes));
        const end = start + (durationMinutes * 60 * 1000);
        if (!intervalsByUser.has(userId)) intervalsByUser.set(userId, []);
        intervalsByUser.get(userId).push({ start, end });
      };

      if (entry.type === 'date' && entry.date) {
        addInterval(dateFromKey(entry.date));
        return;
      }

      const days = Array.isArray(entry.days) ? entry.days : [];
      for (let offset = -1; offset <= availabilityHorizonDays; offset += 1) {
        const date = addDays(today, offset);
        if (days.includes(getWeekdayIndex(date))) addInterval(date);
      }
    });
  });
  return intervalsByUser;
}

function getUsersForSlot(intervalsByUser, start, end) {
  return [...intervalsByUser.entries()]
    .filter(([, intervals]) => intervals.some((interval) => interval.start <= start && interval.end >= end))
    .map(([userId]) => userId)
    .sort((a, b) => a.localeCompare(b));
}

function calculateAvailabilitySlots() {
  const runtime = getAvailabilityRuntime();
  const intervalsByUser = buildAvailabilityIntervals();
  const start = roundUpToStep(Date.now(), availabilityStepMinutes);
  const horizonEnd = startOfDay(addDays(new Date(), availabilityHorizonDays + 1));
  const slots = [];
  for (let slotStart = start; slotStart + (runtime * 60 * 1000) <= horizonEnd; slotStart += availabilityStepMinutes * 60 * 1000) {
    const slotEnd = slotStart + (runtime * 60 * 1000);
    const userIds = getUsersForSlot(intervalsByUser, slotStart, slotEnd);
    if (userIds.length) slots.push({ start: slotStart, end: slotEnd, userIds });
  }
  return slots.sort((a, b) => b.userIds.length - a.userIds.length || a.start - b.start);
}

function getDistinctAvailabilitySlots(limit = 3) {
  const minimumGap = Math.max(getAvailabilityRuntime(), 120) * 60 * 1000;
  return calculateAvailabilitySlots().reduce((selection, slot) => {
    if (selection.length >= limit) return selection;
    const overlapsExisting = selection.some((selected) => (
      toDateKey(new Date(selected.start)) === toDateKey(new Date(slot.start))
      && Math.abs(selected.start - slot.start) < minimumGap
    ));
    if (!overlapsExisting) selection.push(slot);
    return selection;
  }, []);
}

function createInitialAvatar(userId, compact = false) {
  const normalizedUserId = normalizeId(String(userId || ''));
  const accountKey = Object.keys(users).find((id) => normalizeId(id) === normalizedUserId);
  const account = accountKey ? users[accountKey] : null;
  const avatar = document.createElement('span');
  avatar.className = `availability-avatar${compact ? ' availability-avatar--compact' : ''}`;
  const avatarDataUrl = account?.avatarDataUrl || '';
  avatar.textContent = avatarDataUrl ? '' : normalizedUserId.slice(0, 2);
  avatar.style.backgroundImage = avatarDataUrl ? `url("${avatarDataUrl}")` : '';
  avatar.classList.toggle('has-image', Boolean(avatarDataUrl));
  avatar.title = accountKey || userId;
  avatar.setAttribute('aria-label', accountKey || userId);
  return avatar;
}

function renderAvailabilityRoster() {
  const members = Object.keys(users).sort((a, b) => a.localeCompare(b));
  elements.availabilityRoster.replaceChildren(...members.map((userId) => {
    const entries = getUserAvailabilityEntries(userId);
    const item = document.createElement('div');
    item.className = `availability-member${entries.length ? ' is-ready' : ''}`;
    const avatar = createInitialAvatar(userId);
    const meta = document.createElement('span');
    const name = document.createElement('strong');
    name.textContent = userId;
    const status = document.createElement('small');
    status.textContent = entries.length ? `${entries.length} créneau${entries.length > 1 ? 'x' : ''}` : 'En attente';
    meta.append(name, status);
    item.append(avatar, meta);
    return item;
  }));
}

function renderAvailabilityRecommendations() {
  const slots = getDistinctAvailabilitySlots(3);
  const totalUsers = Math.max(1, Object.keys(users).length);
  elements.availabilityRuntime.textContent = getDrawRuntimeLabel();
  elements.availabilityBestPeople.replaceChildren();

  if (!slots.length) {
    elements.availabilityBestSlot.textContent = 'À compléter';
    elements.availabilityBestCoverage.textContent = '0 disponible';
    elements.availabilityRecommendations.replaceChildren(createEmptyState('Ajoutez vos créneaux pour lancer le calcul'));
    return;
  }

  const best = slots[0];
  elements.availabilityBestSlot.textContent = formatSlotRange(best.start, best.end);
  elements.availabilityBestCoverage.textContent = `${best.userIds.length}/${totalUsers} disponibles`;
  elements.availabilityBestPeople.replaceChildren(...best.userIds.slice(0, 5).map((userId) => createInitialAvatar(userId, true)));

  elements.availabilityRecommendations.replaceChildren(...slots.map((slot, index) => {
    const item = document.createElement('article');
    item.className = `availability-recommendation${index === 0 ? ' availability-recommendation--best' : ''}`;

    const rank = document.createElement('span');
    rank.className = 'availability-recommendation__rank';
    rank.textContent = `0${index + 1}`;

    const date = document.createElement('strong');
    date.textContent = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: '2-digit', month: 'short' }).format(slot.start);

    const time = document.createElement('span');
    const startTime = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(slot.start);
    const endTime = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(slot.end);
    time.textContent = `${startTime} — ${endTime}`;

    const coverage = document.createElement('div');
    coverage.className = 'availability-recommendation__coverage';
    const coverageLabel = document.createElement('span');
    coverageLabel.textContent = `${slot.userIds.length}/${totalUsers}`;
    const coverageBar = document.createElement('i');
    coverageBar.style.setProperty('--coverage', String(slot.userIds.length / totalUsers));
    coverage.append(coverageLabel, coverageBar);

    const people = document.createElement('div');
    people.className = 'availability-recommendation__people';
    people.replaceChildren(...slot.userIds.map((userId) => createInitialAvatar(userId)));
    item.append(rank, date, time, coverage, people);
    return item;
  }));
}

function formatCalendarPoint(timestamp, withDate = true) {
  const date = new Date(timestamp);
  const time = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(date);
  if (!withDate) return time;
  const day = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' }).format(date);
  return `${day} · ${time}`;
}

function renderAvailabilityCalendarSelection() {
  const { start, end } = availabilityCalendarSelection;
  elements.availabilityCalendarClear.classList.toggle('hidden', !start);
  if (!start) {
    elements.availabilityCalendarSelectionText.textContent = 'Choisis une heure de départ, puis une heure de fin.';
    return;
  }
  if (!end) {
    elements.availabilityCalendarSelectionText.textContent = `Début : ${formatCalendarPoint(start)} · choisis l’heure de fin.`;
    return;
  }
  const sameDay = toDateKey(new Date(start)) === toDateKey(new Date(end));
  const endLabel = formatCalendarPoint(end, !sameDay);
  const duration = formatRuntime(Math.round((end - start) / (60 * 1000)));
  elements.availabilityCalendarSelectionText.textContent = `${formatCalendarPoint(start)} → ${endLabel} · ${duration}`;
}

function resetAvailabilityCalendarSelection(renderCalendar = true) {
  availabilityCalendarSelection = { start: null, end: null };
  renderAvailabilityCalendarSelection();
  if (renderCalendar) renderAvailabilityCalendar();
}

function setAvailabilityCalendarStart(timestamp) {
  const date = new Date(timestamp);
  availabilityCalendarSelection = { start: timestamp, end: null };
  setAvailabilityMode('date');
  setAvailabilityAllDay(false);
  elements.availabilityDate.value = toDateKey(date);
  elements.availabilityStart.value = formatTimeFromMinutes((date.getHours() * 60) + date.getMinutes());
  elements.availabilityEnd.value = '';
}

function selectAvailabilityCalendarTime(timestamp) {
  const { start, end } = availabilityCalendarSelection;
  const stepMs = availabilityStepMinutes * 60 * 1000;
  if (!start || end) {
    setAvailabilityCalendarStart(timestamp);
    renderAvailabilityCalendar();
    return;
  }

  const selectedEnd = timestamp === start ? timestamp + stepMs : timestamp;
  if (selectedEnd < start || selectedEnd - start > 24 * 60 * 60 * 1000) {
    setAvailabilityCalendarStart(timestamp);
    renderAvailabilityCalendar();
    return;
  }

  availabilityCalendarSelection = { start, end: selectedEnd };
  const endDate = new Date(selectedEnd);
  elements.availabilityEnd.value = formatTimeFromMinutes((endDate.getHours() * 60) + endDate.getMinutes());
  renderAvailabilityCalendar();
}

function scrollAvailabilityCalendarToHour(hour) {
  const shell = elements.availabilityCalendarShell;
  const maxScroll = Math.max(0, shell.scrollWidth - shell.clientWidth);
  const timelineWidth = Math.max(0, shell.scrollWidth - 84);
  const target = Math.min(maxScroll, timelineWidth * (Number(hour) / 24));
  shell.scrollTo({ left: target, behavior: 'smooth' });
}

function renderAvailabilityCalendar() {
  const today = new Date(startOfDay(new Date()));
  const intervalsByUser = buildAvailabilityIntervals();
  const maxUsers = Math.max(1, Object.keys(users).length, intervalsByUser.size);
  const scheduleStart = 0;
  const scheduleEnd = 24 * 60;
  const step = availabilityStepMinutes;
  const previousScroll = elements.availabilityCalendarShell.scrollLeft;

  const axis = document.createElement('div');
  axis.className = 'schedule-axis';
  const axisSpacer = document.createElement('span');
  axisSpacer.ariaHidden = 'true';
  axis.append(axisSpacer);
  for (let minute = scheduleStart; minute < scheduleEnd; minute += 120) {
    const label = document.createElement('span');
    label.textContent = formatTimeFromMinutes(minute);
    axis.append(label);
  }

  const rows = Array.from({ length: availabilityHorizonDays }, (_, offset) => {
    const date = addDays(today, offset);
    const dayStart = startOfDay(date);
    const row = document.createElement('div');
    row.className = 'schedule-row';

    const label = document.createElement('div');
    label.className = 'schedule-row__label';
    const day = document.createElement('strong');
    day.textContent = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(date);
    const dayNumber = document.createElement('small');
    dayNumber.textContent = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' }).format(date);
    label.append(day, dayNumber);
    row.append(label);

    for (let minute = scheduleStart; minute < scheduleEnd; minute += step) {
      const start = dayStart + (minute * 60 * 1000);
      const end = start + (step * 60 * 1000);
      const userIds = getUsersForSlot(intervalsByUser, start, end);
      const cell = document.createElement('button');
      cell.className = 'schedule-cell';
      cell.type = 'button';
      cell.style.setProperty('--level', String(userIds.length / maxUsers));
      cell.dataset.count = String(userIds.length);
      const timeLabel = formatTimeFromMinutes(minute);
      const peopleLabel = userIds.length ? userIds.join(', ') : 'personne';
      const isPast = start < Date.now();
      const isRangeStart = availabilityCalendarSelection.start === start;
      const isRangeEnd = availabilityCalendarSelection.end === start;
      const isInRange = Boolean(
        availabilityCalendarSelection.start
        && availabilityCalendarSelection.end
        && start >= availabilityCalendarSelection.start
        && start < availabilityCalendarSelection.end,
      );
      cell.classList.toggle('is-past', isPast);
      cell.classList.toggle('is-range-start', isRangeStart);
      cell.classList.toggle('is-range-end', isRangeEnd);
      cell.classList.toggle('is-in-range', isInRange);
      cell.disabled = isPast;
      cell.title = `${timeLabel} · ${userIds.length} dispo · ${peopleLabel}`;
      cell.setAttribute('aria-label', `${day.textContent} ${dayNumber.textContent} à ${timeLabel}, ${userIds.length} disponible${userIds.length > 1 ? 's' : ''}`);
      cell.setAttribute('aria-pressed', isRangeStart || isRangeEnd || isInRange ? 'true' : 'false');
      cell.addEventListener('click', () => selectAvailabilityCalendarTime(start));
      row.append(cell);
    }
    return row;
  });

  elements.availabilityCalendar.replaceChildren(axis, ...rows);
  elements.availabilityCalendarShell.scrollLeft = previousScroll;
  renderAvailabilityCalendarSelection();
}

function renderAvailability() {
  if (!currentUser) return;
  setAvailabilityMode(availabilityMode);
  setAvailabilityAllDay(availabilityAllDay);
  renderAvailabilityList();
  renderAvailabilityRoster();
  renderAvailabilityRecommendations();
  renderAvailabilityCalendar();
}

async function handleAvailabilitySubmit(event) {
  event.preventDefault();
  if (!currentUser) return;
  const entry = {
    type: availabilityMode === 'date' ? 'date' : 'weekly',
    allDay: availabilityAllDay,
    start: availabilityAllDay ? '00:00' : elements.availabilityStart.value,
    end: availabilityAllDay ? '00:00' : elements.availabilityEnd.value,
    createdAt: Date.now(),
  };

  if (entry.type === 'date') {
    if (!elements.availabilityDate.value) {
      setMessage('Choisis une date');
      return;
    }
    entry.date = elements.availabilityDate.value;
  } else {
    if (!availabilitySelectedDays.size) {
      setMessage('Choisis au moins un jour');
      return;
    }
    entry.days = [...availabilitySelectedDays].sort((a, b) => a - b);
  }

  if (!entry.allDay && (!entry.start || !entry.end || parseTimeMinutes(entry.start) === parseTimeMinutes(entry.end))) {
    setMessage('Choisis une plage horaire valide');
    return;
  }

  try {
    await push(ref(db, `availability/${currentUser.id}`), entry);
    resetAvailabilityCalendarSelection();
    setMessage('Disponibilité ajoutée');
  } catch {
    setMessage('Impossible d’ajouter la disponibilité');
  }
}

async function refreshDrawRuntime() {
  const nextKey = draw?.tmdbId ? `tmdb-${draw.tmdbId}` : '';
  if (!nextKey) {
    drawRuntimeKey = '';
    drawRuntimeMinutes = null;
    renderAvailability();
    return;
  }
  if (drawRuntimeKey === nextKey) return;
  drawRuntimeKey = nextKey;
  drawRuntimeMinutes = null;
  renderAvailability();
  try {
    const details = await fetchMovieDetails(draw);
    if (drawRuntimeKey !== nextKey) return;
    drawRuntimeMinutes = Number(details?.runtime) || null;
    renderAvailability();
  } catch {
    if (drawRuntimeKey === nextKey) renderAvailability();
  }
}

function renderProfile() {
  const role = getRoleLabel(currentUser);
  elements.profileName.textContent = currentUser.id;
  elements.profileRole.textContent = role;
  if (document.activeElement !== elements.profileIdInput) elements.profileIdInput.value = currentUser.id;
  elements.profileSeenCount.textContent = String(seenMovieArray().length);
  elements.profileAvailabilityCount.textContent = String(getUserAvailabilityEntries(currentUser.id).length);
  elements.profileProposalState.textContent = String(proposedMovies().length);
}

async function updateProfileId(event) {
  event.preventDefault();
  if (!currentUser) return;
  const previousId = currentUser.id;
  const nextId = normalizeId(elements.profileIdInput.value).slice(0, 24);
  elements.profileIdInput.value = nextId;
  if (!nextId || nextId.length < 2) {
    setMessage('Choisis un ID d’au moins 2 caractères');
    return;
  }
  if (nextId === previousId) {
    setMessage('Ton ID est déjà à jour');
    return;
  }

  elements.profileIdSubmit.disabled = true;
  try {
    const [targetUserSnapshot, sourceUserSnapshot, rootSnapshot] = await Promise.all([
      get(ref(db, `users/${nextId}`)),
      get(ref(db, `users/${previousId}`)),
      get(ref(db)),
    ]);
    if (targetUserSnapshot.exists()) {
      setMessage('Cet ID est déjà utilisé');
      return;
    }
    if (!sourceUserSnapshot.exists()) throw new Error('Missing source profile');

    const data = rootSnapshot.val() || {};
    const changes = {
      [`users/${nextId}`]: { ...sourceUserSnapshot.val(), profileUpdatedAt: Date.now() },
      [`users/${previousId}`]: null,
    };

    if (data.availability?.[previousId]) {
      changes[`availability/${nextId}`] = data.availability[previousId];
      changes[`availability/${previousId}`] = null;
    }

    Object.entries(data.movies || {}).forEach(([key, movie]) => {
      if (movie.proposedBy === previousId) changes[`movies/${key}/proposedBy`] = nextId;
      if (movie.warningBy === previousId) changes[`movies/${key}/warningBy`] = nextId;
    });

    ['current', 'lastDrawn'].forEach((drawKey) => {
      const movie = data.draw?.[drawKey];
      if (movie?.proposedBy === previousId) changes[`draw/${drawKey}/proposedBy`] = nextId;
      if (movie?.warningBy === previousId) changes[`draw/${drawKey}/warningBy`] = nextId;
    });

    Object.entries(data.draw?.history || {}).forEach(([key, movie]) => {
      if (movie.proposedBy === previousId) changes[`draw/history/${key}/proposedBy`] = nextId;
      if (movie.warningBy === previousId) changes[`draw/history/${key}/warningBy`] = nextId;
      if (movie.ratings?.[previousId] !== undefined) {
        changes[`draw/history/${key}/ratings/${nextId}`] = movie.ratings[previousId];
        changes[`draw/history/${key}/ratings/${previousId}`] = null;
      }
      if (movie.comments?.[previousId] !== undefined) {
        changes[`draw/history/${key}/comments/${nextId}`] = movie.comments[previousId];
        changes[`draw/history/${key}/comments/${previousId}`] = null;
      }
    });

    await update(ref(db), changes);
    currentUser = { ...currentUser, id: nextId };
    storeCurrentUser();
    render();
    setMessage('Profil mis à jour');
  } catch {
    setMessage('Impossible de modifier ton ID');
  } finally {
    elements.profileIdSubmit.disabled = false;
  }
}

function constrainAvatarCrop() {
  if (!avatarCropState) return;
  const { bitmap, zoom } = avatarCropState;
  const size = elements.avatarCropCanvas.width;
  const baseScale = Math.max(size / bitmap.width, size / bitmap.height);
  const drawWidth = bitmap.width * baseScale * zoom;
  const drawHeight = bitmap.height * baseScale * zoom;
  const limitX = Math.max(0, (drawWidth - size) / 2);
  const limitY = Math.max(0, (drawHeight - size) / 2);
  avatarCropState.offsetX = Math.max(-limitX, Math.min(limitX, avatarCropState.offsetX));
  avatarCropState.offsetY = Math.max(-limitY, Math.min(limitY, avatarCropState.offsetY));
  return { drawWidth, drawHeight };
}

function renderAvatarCrop() {
  if (!avatarCropState) return;
  const canvas = elements.avatarCropCanvas;
  const context = canvas.getContext('2d', { alpha: false });
  const { drawWidth, drawHeight } = constrainAvatarCrop();
  const x = ((canvas.width - drawWidth) / 2) + avatarCropState.offsetX;
  const y = ((canvas.height - drawHeight) / 2) + avatarCropState.offsetY;
  context.fillStyle = '#11152a';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(avatarCropState.bitmap, x, y, drawWidth, drawHeight);
}

async function openAvatarCrop(file) {
  if (!file?.type.startsWith('image/')) throw new Error('Invalid image');
  if (file.size > 12 * 1024 * 1024) throw new Error('Image too large');
  const bitmap = await createImageBitmap(file);
  avatarCropState?.bitmap?.close();
  avatarCropState = { bitmap, zoom: 1, offsetX: 0, offsetY: 0, pointerId: null };
  elements.avatarCropZoom.value = '1';
  renderAvatarCrop();
  showModal(elements.avatarCropModal, elements.avatarCropZoom);
}

function closeAvatarCropModal() {
  avatarCropState?.bitmap?.close();
  avatarCropState = null;
  elements.profileAvatarInput.value = '';
  hideModal(elements.avatarCropModal);
}

function moveAvatarCrop(event) {
  if (!avatarCropState || avatarCropState.pointerId !== event.pointerId) return;
  const rect = elements.avatarCropCanvas.getBoundingClientRect();
  const scale = elements.avatarCropCanvas.width / rect.width;
  avatarCropState.offsetX = avatarCropState.originX + ((event.clientX - avatarCropState.startX) * scale);
  avatarCropState.offsetY = avatarCropState.originY + ((event.clientY - avatarCropState.startY) * scale);
  renderAvatarCrop();
}

async function saveProfileAvatar() {
  if (!avatarCropState || !currentUser) return;
  elements.avatarCropConfirm.disabled = true;
  try {
    const output = document.createElement('canvas');
    output.width = 320;
    output.height = 320;
    output.getContext('2d', { alpha: false }).drawImage(elements.avatarCropCanvas, 0, 0, 320, 320);
    const avatarDataUrl = output.toDataURL('image/webp', 0.84);
    await update(ref(db, `users/${currentUser.id}`), { avatarDataUrl, profileUpdatedAt: Date.now() });
    users[currentUser.id] = { ...(users[currentUser.id] || {}), avatarDataUrl };
    renderUserAvatars();
    closeAvatarCropModal();
    setMessage('Photo de profil mise à jour');
  } catch {
    setMessage('Impossible de modifier la photo');
  } finally {
    elements.avatarCropConfirm.disabled = false;
  }
}

async function updateProfileAvatar(event) {
  const [file] = event.target.files || [];
  if (!file || !currentUser) return;
  elements.profileAvatarButton.disabled = true;
  try {
    await openAvatarCrop(file);
  } catch (error) {
    elements.profileAvatarInput.value = '';
    setMessage(error.message === 'Image too large' ? 'Image trop lourde (12 Mo max)' : 'Format d’image non pris en charge');
  } finally {
    elements.profileAvatarButton.disabled = false;
  }
}

async function removeProfileAvatar() {
  if (!currentUser) return;
  elements.profileAvatarRemove.disabled = true;
  try {
    await remove(ref(db, `users/${currentUser.id}/avatarDataUrl`));
    if (users[currentUser.id]) delete users[currentUser.id].avatarDataUrl;
    renderUserAvatars();
    setMessage('Photo retirée');
    closeDeleteConfirmModal();
  } catch {
    setMessage('Impossible de retirer la photo');
  } finally {
    elements.profileAvatarRemove.disabled = false;
  }
}

function openPasswordModal() {
  if (!currentUser) return;
  elements.profilePasswordForm.reset();
  elements.profilePasswordError.textContent = '';
  showModal(elements.passwordModal, elements.profileCurrentPassword);
}

function closePasswordModal() {
  elements.profilePasswordForm.reset();
  elements.profilePasswordError.textContent = '';
  hideModal(elements.passwordModal);
}

async function updateProfilePassword(event) {
  event.preventDefault();
  if (!currentUser) return;
  const currentPassword = elements.profileCurrentPassword.value;
  const nextPassword = elements.profileNewPassword.value;
  const confirmation = elements.profileConfirmPassword.value;
  elements.profilePasswordError.textContent = '';

  if (nextPassword.length < 6) {
    elements.profilePasswordError.textContent = '6 caractères minimum';
    return;
  }
  if (nextPassword !== confirmation) {
    elements.profilePasswordError.textContent = 'Les nouveaux mots de passe ne correspondent pas';
    return;
  }

  elements.profilePasswordSubmit.disabled = true;
  elements.profilePasswordSubmit.setAttribute('aria-busy', 'true');
  try {
    const accountSnapshot = await get(ref(db, `users/${currentUser.id}`));
    if (!accountSnapshot.exists() || !(await passwordMatches(currentPassword, accountSnapshot.val()))) {
      elements.profilePasswordError.textContent = 'Mot de passe actuel incorrect';
      return;
    }
    const passwordData = await hashPassword(nextPassword);
    await update(ref(db, `users/${currentUser.id}`), {
      passwordHash: passwordData.hash,
      passwordSalt: passwordData.salt,
      passwordUpdatedAt: Date.now(),
    });
    if (users[currentUser.id]) {
      users[currentUser.id] = {
        ...users[currentUser.id],
        passwordHash: passwordData.hash,
        passwordSalt: passwordData.salt,
        passwordUpdatedAt: Date.now(),
      };
    }
    closePasswordModal();
    setMessage('Mot de passe mis à jour');
  } catch {
    elements.profilePasswordError.textContent = 'Impossible de modifier le mot de passe';
  } finally {
    elements.profilePasswordSubmit.disabled = false;
    elements.profilePasswordSubmit.removeAttribute('aria-busy');
  }
}

async function handleAuth(event) {
  event.preventDefault();
  elements.authError.textContent = '';
  const id = normalizeId(elements.identifier.value);
  const password = elements.password.value;
  if (!id || !password) {
    elements.authError.textContent = 'ID et MDP requis';
    return;
  }

  elements.authSubmit.disabled = true;
  try {
    const userRef = ref(db, `users/${id}`);
    const snapshot = await get(userRef);

    if (authMode === 'register') {
      if (snapshot.exists()) {
        elements.authError.textContent = 'ID déjà utilisé';
        return;
      }
      const usersSnapshot = await get(ref(db, 'users'));
      const passwordData = await hashPassword(password);
      const user = { passwordHash: passwordData.hash, passwordSalt: passwordData.salt, isAdmin: !usersSnapshot.exists(), createdAt: Date.now() };
      await set(userRef, user);
      currentUser = { id, isAdmin: user.isAdmin, role: user.isAdmin ? 'admin' : 'user' };
    } else {
      if (!snapshot.exists() || !(await passwordMatches(password, snapshot.val()))) {
        elements.authError.textContent = 'ID ou MDP incorrect';
        return;
      }
      currentUser = { id, isAdmin: Boolean(snapshot.val().isAdmin), role: getAccountRole(snapshot.val()) };
    }

    storeCurrentUser();
    elements.authForm.reset();
    goHome();
    render();
  } catch {
    elements.authError.textContent = 'Connexion impossible pour le moment';
  } finally {
    elements.authSubmit.disabled = false;
  }
}

function setSearchBusy(isBusy) {
  elements.searchForm.classList.toggle('is-searching', isBusy);
}

async function searchMovies(event = null) {
  event?.preventDefault();
  window.clearTimeout(searchTimer);
  setMessage('');
  const query = elements.movieQuery.value.trim();
  if (query.length < 2) {
    searchController?.abort();
    elements.results.replaceChildren();
    return;
  }

  searchController?.abort();
  const controller = new AbortController();
  searchController = controller;
  setSearchBusy(true);
  try {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=fr-FR`, {
      headers: { Authorization: `Bearer ${tmdbToken}`, accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error('Search failed');
    const data = await response.json();
    if (controller.signal.aborted || query !== elements.movieQuery.value.trim()) return;
    const results = (data.results || []).slice(0, 8);
    elements.results.replaceChildren(...results.map(createMovieButton));
    if (!results.length) setMessage('Aucun film trouvé');
  } catch (error) {
    if (error.name === 'AbortError') return;
    setMessage('Recherche impossible pour le moment');
  } finally {
    if (searchController === controller) {
      searchController = null;
      setSearchBusy(false);
    }
  }
}

function scheduleMovieSearch() {
  window.clearTimeout(searchTimer);
  const query = elements.movieQuery.value.trim();
  if (query.length < 2) {
    searchController?.abort();
    elements.results.replaceChildren();
    return;
  }
  searchTimer = window.setTimeout(() => searchMovies(), 220);
}

function createMovieButton(movie) {
  const button = document.createElement('button');
  button.className = 'movie';
  button.type = 'button';
  button.setAttribute('aria-label', `Sélectionner ${movie.title}`);
  if (movie.poster_path) {
    const image = document.createElement('img');
    image.src = `https://image.tmdb.org/t/p/w185${movie.poster_path}`;
    image.alt = '';
    button.append(image);
  } else {
    const fallback = document.createElement('span');
    fallback.className = 'movie__fallback';
    fallback.textContent = 'GP';
    fallback.ariaHidden = 'true';
    button.append(fallback);
  }
  const content = document.createElement('span');
  content.className = 'movie__content';
  const title = document.createElement('strong');
  title.textContent = movie.title;
  const meta = document.createElement('small');
  meta.textContent = [formatYear(movie.release_date), formatTmdbScore(movie.vote_average)].filter(Boolean).join(' · ') || 'Infos indisponibles';
  content.append(title, meta);
  button.append(content);
  button.addEventListener('click', () => selectPendingMovie(movie));
  return button;
}

function movieFromSearchResult(movie) {
  return {
    key: `tmdb-${movie.id}`,
    tmdbId: movie.id,
    title: movie.title,
    originalTitle: movie.original_title || movie.title,
    posterPath: movie.poster_path || '',
    releaseDate: movie.release_date || '',
    overview: movie.overview || '',
  };
}

function renderWarningSwitches() {
  elements.warningList.replaceChildren(...triggerWarningOptions.map((warning) => {
    const button = document.createElement('button');
    const enabled = pendingWarnings.has(warning.id);
    button.className = 'switch-button switch-button--compact warning-switch';
    button.type = 'button';
    button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    button.classList.toggle('is-on', enabled);
    const label = document.createElement('span');
    label.textContent = warning.label;
    const track = document.createElement('span');
    track.className = 'switch-button__track';
    track.ariaHidden = 'true';
    track.append(document.createElement('span'));
    button.append(label, track);
    button.addEventListener('click', () => {
      if (pendingWarnings.has(warning.id)) pendingWarnings.delete(warning.id);
      else pendingWarnings.add(warning.id);
      renderPendingMovie();
    });
    return button;
  }));
}

function renderPendingMovie() {
  elements.pendingMoviePanel.classList.toggle('hidden', !pendingMovie);
  if (!pendingMovie) {
    elements.pendingMoviePoster.replaceChildren();
    elements.pendingMovieTitle.textContent = '';
    elements.pendingMovieMeta.textContent = '';
    elements.warningList.replaceChildren();
    return;
  }

  elements.pendingMoviePoster.replaceChildren();
  const imageUrl = posterUrl(pendingMovie.posterPath, 'w185');
  if (imageUrl) {
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = '';
    elements.pendingMoviePoster.append(image);
  } else {
    const fallback = document.createElement('div');
    fallback.className = 'poster-card__fallback';
    fallback.textContent = pendingMovie.title;
    elements.pendingMoviePoster.append(fallback);
  }
  elements.pendingMovieTitle.textContent = pendingMovie.title;
  elements.pendingMovieMeta.textContent = formatYear(pendingMovie.releaseDate) || 'Année inconnue';
  renderWarningSwitches();
}

function selectPendingMovie(movie) {
  if (!canProposeMovie()) {
    setMessage(wasLastDrawnUser() ? 'Pause jusqu’au prochain tirage' : 'Limite de 10 films atteinte');
    return;
  }
  pendingMovie = movieFromSearchResult(movie);
  pendingWarnings = new Set();
  searchController?.abort();
  elements.results.replaceChildren();
  setMessage('Choisis les warnings puis valide le film');
  renderPendingMovie();
}

function clearPendingMovie() {
  pendingMovie = null;
  pendingWarnings = new Set();
  renderPendingMovie();
}

async function proposeMovie() {
  const ownMovies = proposedMovies();
  if (!canProposeMovie()) {
    setMessage(wasLastDrawnUser() ? 'Pause jusqu’au prochain tirage' : 'Limite de 10 films atteinte');
    return;
  }
  if (!pendingMovie) return;
  if (ownMovies.some((movie) => movie.tmdbId && movie.tmdbId === pendingMovie.tmdbId)) {
    setMessage('Ce film est déjà dans ta sélection');
    return;
  }

  const triggerWarnings = triggerWarningOptions
    .filter((warning) => pendingWarnings.has(warning.id))
    .map((warning) => ({ id: warning.id, label: warning.label }));

  try {
    await push(ref(db, 'movies'), {
      tmdbId: pendingMovie.tmdbId,
      title: pendingMovie.title,
      originalTitle: pendingMovie.originalTitle,
      posterPath: pendingMovie.posterPath,
      releaseDate: pendingMovie.releaseDate,
      overview: pendingMovie.overview,
      proposedBy: currentUser.id,
      triggerWarnings,
      warningBy: currentUser.id,
      isPrimary: ownMovies.length === 0,
      createdAt: Date.now(),
    });
    elements.results.replaceChildren();
    elements.movieQuery.value = '';
    clearPendingMovie();
    setMessage(ownMovies.length ? 'Film secondaire ajouté' : 'Film principal ajouté');
  } catch {
    setMessage('Impossible d’ajouter le film');
  }
}

async function deleteMovie(key) {
  const movie = movies[key];
  if (!movie || movie.proposedBy !== currentUser?.id) return;
  try {
    const userMovies = proposedMovies(movie.proposedBy);
    const primary = getPrimaryMovie(userMovies);
    const replacement = userMovies.find((item) => item.key !== key) || null;
    const changes = { [`movies/${key}`]: null };
    if (primary?.key === key && replacement) changes[`movies/${replacement.key}/isPrimary`] = true;
    await update(ref(db), changes);
    setMessage('');
    closeDeleteConfirmModal();
  } catch {
    setMessage('Impossible de supprimer le film');
  }
}

async function setPrimaryMovie(movie) {
  if (!movie?.key || movie.proposedBy !== currentUser?.id) return;
  const userMovies = proposedMovies();
  if (getPrimaryMovie(userMovies)?.key === movie.key) return;
  const changes = {};
  userMovies.forEach((item) => {
    changes[`movies/${item.key}/isPrimary`] = item.key === movie.key;
  });
  try {
    await update(ref(db), changes);
    setMessage('Film principal modifié');
  } catch {
    setMessage('Impossible de modifier le film principal');
  }
}

function pickDrawMovie(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function buildDrawCovers(list) {
  const covers = list.filter((movie) => movie.posterPath);
  const pool = [...(covers.length ? covers : list)];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[target]] = [pool[target], pool[index]];
  }
  const count = Math.min(Math.max(list.length * 5, 24), 36);
  const rotations = [-3.2, -1.1, 2.4, 0.7, -2.1, 3, -0.4, 1.6];
  const offsets = [5, -4, 2, -2, 4, -5, 1, -3];
  const nodes = Array.from({ length: count }, (_, index) => {
    const movie = pool[index % pool.length];
    const image = document.createElement('img');
    image.className = 'draw-cover';
    image.src = posterUrl(movie.posterPath, 'w342') || './image/logocinepafficon.svg';
    image.alt = '';
    image.decoding = 'async';
    image.draggable = false;
    const rotation = rotations[index % rotations.length];
    image.style.setProperty('--card-rotation', `${rotation}deg`);
    image.style.setProperty('--card-rotation-end', `${rotation + ((index % 2 ? 1 : -1) * 0.8)}deg`);
    image.style.setProperty('--card-y', `${offsets[index % offsets.length]}px`);
    image.style.setProperty('--card-delay', `${-(index % 7) * 75}ms`);
    return image;
  });
  elements.coverStack.replaceChildren(...nodes);
  return { nodes };
}

function animateDrawArena(nodes, duration) {
  const viewportWidth = elements.coverStack.parentElement.getBoundingClientRect().width;
  const trackWidth = elements.coverStack.scrollWidth;
  const startX = Math.min(viewportWidth * 0.16, 180);
  const endX = Math.min(startX - (viewportWidth * 2.4), (viewportWidth * 0.72) - trackWidth);
  const transformAt = (x) => `translate3d(${x}px, -50%, 0)`;
  elements.coverStack.style.transform = transformAt(startX);
  const animation = elements.coverStack.animate([
    { transform: transformAt(startX), filter: 'blur(0)', opacity: 0.72, offset: 0 },
    { transform: transformAt(startX - (viewportWidth * 0.75)), filter: 'blur(1.8px)', opacity: 0.96, offset: 0.2 },
    { transform: transformAt(endX + (viewportWidth * 0.34)), filter: 'blur(1px)', opacity: 0.96, offset: 0.76 },
    { transform: transformAt(endX), filter: 'blur(0)', opacity: 1, offset: 1 },
  ], {
    duration,
    easing: 'cubic-bezier(0.12, 0.7, 0.12, 1)',
    fill: 'forwards',
  });
  return [animation];
}

function setDrawCountdown(value) {
  elements.drawCountdown.textContent = value;
  elements.drawCountdown.classList.remove('is-pulsing');
  void elements.drawCountdown.offsetWidth;
  elements.drawCountdown.classList.add('is-pulsing');
}

function createDrawBurst() {
  const particles = Array.from({ length: 42 }, (_, index) => {
    const particle = document.createElement('i');
    particle.style.setProperty('--angle', `${(360 / 42) * index + (Math.random() * 8)}deg`);
    particle.style.setProperty('--distance', `${90 + (Math.random() * 210)}px`);
    particle.style.setProperty('--delay', `${Math.random() * 120}ms`);
    particle.style.setProperty('--size', `${2 + Math.random() * 5}px`);
    return particle;
  });
  elements.drawBurst.replaceChildren(...particles);
}

function revealDrawWinner(selected) {
  elements.winnerTitle.textContent = selected.title;
  elements.winnerUser.textContent = selected.proposedBy ? `Proposé par ${selected.proposedBy}` : '';
  elements.winnerPoster.replaceChildren(createPosterMedia(selected, 'w500'));
  elements.winnerCard.classList.remove('hidden');
  elements.drawStage.classList.add('has-winner', 'is-impact');
  elements.drawStatus.textContent = 'SÉLECTIONNÉ';
  createDrawBurst();
  navigator.vibrate?.([25, 35, 55]);
  window.setTimeout(() => elements.drawStage.classList.remove('is-impact'), 900);
}

async function playDrawAnimation(list, selected) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = reducedMotion ? 680 : drawAnimationDuration;
  const countdownDelay = reducedMotion ? 120 : 520;
  const wait = (delay) => new Promise((resolve) => window.setTimeout(resolve, delay));
  const arena = buildDrawCovers(list);
  elements.winnerCard.classList.add('hidden');
  elements.drawStage.classList.remove('has-winner', 'is-drawing', 'is-impact', 'is-suspense');
  elements.drawStage.classList.add('is-arming');
  elements.drawBurst.replaceChildren();
  elements.drawStatus.textContent = 'PRÉPARATION';
  elements.drawButtonLabel.textContent = 'Préparation…';

  for (const count of ['3', '2', '1']) {
    setDrawCountdown(count);
    await wait(countdownDelay);
  }

  setDrawCountdown('PAFF');
  navigator.vibrate?.(reducedMotion ? 20 : [18, 28, 42]);
  await wait(reducedMotion ? 100 : 320);
  elements.drawCountdown.textContent = '';
  elements.drawStage.classList.remove('is-arming');
  elements.drawStage.classList.add('is-drawing');
  elements.drawStatus.textContent = 'MÉLANGE';
  elements.drawButtonLabel.textContent = 'Mélange…';

  const animations = animateDrawArena(arena.nodes, duration);
  const statusTimers = [
    window.setTimeout(() => { elements.drawStatus.textContent = 'DÉFILEMENT'; }, duration * 0.28),
    window.setTimeout(() => { elements.drawStatus.textContent = 'RALENTISSEMENT'; }, duration * 0.68),
    window.setTimeout(() => { elements.drawStatus.textContent = 'ARRÊT'; }, duration * 0.9),
  ];

  try {
    await Promise.allSettled(animations.map((animation) => animation.finished));
  } finally {
    statusTimers.forEach((timer) => window.clearTimeout(timer));
  }
  elements.drawStage.classList.remove('is-drawing');
  elements.drawStage.classList.add('is-suspense');
  elements.drawStatus.textContent = 'RÉVÉLATION';
  elements.drawButtonLabel.textContent = 'Verdict…';
  elements.coverStack.replaceChildren();
  await wait(reducedMotion ? 100 : 420);
  revealDrawWinner(selected);
  elements.drawStage.classList.remove('is-suspense');
  await wait(reducedMotion ? 120 : 760);
  animations.forEach((animation) => animation.cancel());
}

async function drawMovie() {
  const list = buildBalancedDrawPool();
  if (!canRunDraw() || !list.length || elements.drawButton.disabled) return;
  drawInProgress = true;
  elements.drawButton.disabled = true;
  let completed = false;
  try {
    const { key: movieKey, ...pickedMovie } = pickDrawMovie(list);
    const selected = { ...pickedMovie, movieKey, drawnAt: Date.now(), isTestDraw: keepSelectionOnDraw };
    await playDrawAnimation(list, selected);
    const historyEntry = push(ref(db, 'draw/history'));
    const changes = {
      'draw/current': selected,
      [`draw/history/${historyEntry.key}`]: selected,
    };
    if (!keepSelectionOnDraw) {
      changes['draw/lastDrawn'] = selected;
      changes[`movies/${movieKey}`] = null;
      const userMovies = proposedMovies(selected.proposedBy);
      const primary = getPrimaryMovie(userMovies);
      const replacement = userMovies.find((movie) => movie.key !== movieKey) || null;
      if (primary?.key === movieKey && replacement) changes[`movies/${replacement.key}/isPrimary`] = true;
    }
    await update(ref(db), changes);
    if (!keepSelectionOnDraw) {
      lastDrawn = selected;
      delete movies[movieKey];
      const nextPrimaryKey = Object.keys(changes)
        .find((path) => path.startsWith('movies/') && path.endsWith('/isPrimary'))
        ?.split('/')[1];
      if (nextPrimaryKey && movies[nextPrimaryKey]) movies[nextPrimaryKey].isPrimary = true;
    }
    completed = true;
  } catch {
    elements.drawStage.classList.remove('is-arming', 'is-drawing', 'is-suspense');
    elements.drawCountdown.textContent = '';
    elements.coverStack.replaceChildren();
    elements.drawStatus.textContent = 'ERREUR';
    setMessage('Tirage impossible pour le moment');
    window.setTimeout(renderDraw, 900);
  } finally {
    drawInProgress = false;
    elements.drawButtonLabel.textContent = 'Lancer';
    if (completed) renderMovies();
    else elements.drawButton.disabled = list.length === 0;
  }
}

elements.authForm.addEventListener('submit', handleAuth);
elements.authToggle.addEventListener('click', () => {
  authMode = authMode === 'login' ? 'register' : 'login';
  elements.authError.textContent = '';
  elements.authForm.reset();
  elements.authSubmitLabel.textContent = authMode === 'login' ? 'Connexion' : 'Créer un compte';
  elements.authToggle.textContent = authMode === 'login' ? 'Créer un compte' : 'Connexion';
  elements.password.autocomplete = authMode === 'login' ? 'current-password' : 'new-password';
});
elements.menuToggle.addEventListener('click', () => {
  const isOpen = elements.menuToggle.getAttribute('aria-expanded') === 'true';
  setMobileMenu(!isOpen);
});
elements.drawKeepSelectionToggle.addEventListener('click', () => {
  setKeepSelectionOnDraw(!keepSelectionOnDraw);
});
elements.adminUserSearch.addEventListener('input', renderUsers);
elements.navRow.addEventListener('click', (event) => {
  if (event.target === elements.navRow) setMobileMenu(false);
});
elements.tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const nextRoute = tab.dataset.route;
    if (window.location.hash === `#${nextRoute}`) setRoute(nextRoute);
    else window.location.hash = nextRoute;
  });
});
elements.sessionProfileButton.addEventListener('click', () => {
  if (window.location.hash === '#profile') setRoute('profile');
  else window.location.hash = 'profile';
});
elements.profileShortcuts.forEach((shortcut) => {
  shortcut.addEventListener('click', () => {
    window.location.hash = shortcut.dataset.profileRoute;
  });
});
window.addEventListener('hashchange', syncRouteFromHash);
window.matchMedia('(max-width: 820px), (max-width: 900px) and (max-height: 500px)').addEventListener('change', (event) => {
  if (!event.matches) setMobileMenu(false);
});

elements.logoutButton.addEventListener('click', () => {
  setMobileMenu(false);
  clearStoredUser();
  currentUser = null;
  render();
});
elements.searchForm.addEventListener('submit', searchMovies);
elements.movieQuery.addEventListener('input', scheduleMovieSearch);
elements.profileIdForm.addEventListener('submit', updateProfileId);
elements.profileAvatarButton.addEventListener('click', () => elements.profileAvatarInput.click());
elements.profileAvatarInput.addEventListener('change', updateProfileAvatar);
elements.profileAvatarRemove.addEventListener('click', openAvatarDeleteConfirmModal);
elements.profilePasswordOpen.addEventListener('click', openPasswordModal);
elements.profileDeleteAccount.addEventListener('click', openAccountDeleteConfirmModal);
elements.avatarCropBackdrop.addEventListener('click', closeAvatarCropModal);
elements.avatarCropClose.addEventListener('click', closeAvatarCropModal);
elements.avatarCropCancel.addEventListener('click', closeAvatarCropModal);
elements.avatarCropConfirm.addEventListener('click', saveProfileAvatar);
elements.avatarCropZoom.addEventListener('input', () => {
  if (!avatarCropState) return;
  avatarCropState.zoom = Number(elements.avatarCropZoom.value);
  renderAvatarCrop();
});
elements.avatarCropViewport.addEventListener('pointerdown', (event) => {
  if (!avatarCropState) return;
  avatarCropState.pointerId = event.pointerId;
  avatarCropState.startX = event.clientX;
  avatarCropState.startY = event.clientY;
  avatarCropState.originX = avatarCropState.offsetX;
  avatarCropState.originY = avatarCropState.offsetY;
  elements.avatarCropViewport.setPointerCapture(event.pointerId);
  elements.avatarCropViewport.classList.add('is-dragging');
});
elements.avatarCropViewport.addEventListener('pointermove', moveAvatarCrop);
elements.avatarCropViewport.addEventListener('pointerup', (event) => {
  if (!avatarCropState || avatarCropState.pointerId !== event.pointerId) return;
  avatarCropState.pointerId = null;
  elements.avatarCropViewport.classList.remove('is-dragging');
});
elements.avatarCropViewport.addEventListener('pointercancel', () => {
  if (avatarCropState) avatarCropState.pointerId = null;
  elements.avatarCropViewport.classList.remove('is-dragging');
});
elements.availabilityForm.addEventListener('submit', handleAvailabilitySubmit);
elements.availabilityRecurringMode.addEventListener('click', () => {
  resetAvailabilityCalendarSelection(false);
  setAvailabilityMode('weekly');
  renderAvailabilityCalendar();
});
elements.availabilityDateMode.addEventListener('click', () => setAvailabilityMode('date'));
elements.availabilityAllDay.addEventListener('click', () => {
  if (!availabilityAllDay) resetAvailabilityCalendarSelection(false);
  setAvailabilityAllDay(!availabilityAllDay);
  renderAvailabilityCalendar();
});
elements.availabilityPresets.forEach((button) => {
  button.addEventListener('click', () => applyAvailabilityPreset(button.dataset.availabilityPreset));
});
elements.availabilityCalendarClear.addEventListener('click', () => resetAvailabilityCalendarSelection());
elements.availabilityScheduleJumps.forEach((button) => {
  button.addEventListener('click', () => scrollAvailabilityCalendarToHour(button.dataset.scheduleJump));
});
[elements.availabilityDate, elements.availabilityStart, elements.availabilityEnd].forEach((input) => {
  input.addEventListener('change', () => {
    if (availabilityCalendarSelection.start) resetAvailabilityCalendarSelection();
  });
});
elements.cancelMovieSelection.addEventListener('click', () => {
  clearPendingMovie();
  setMessage('');
});
elements.confirmMovieSelection.addEventListener('click', proposeMovie);
elements.drawButton.addEventListener('click', drawMovie);
elements.ratingModalBackdrop.addEventListener('click', closeRatingModal);
elements.ratingModalClose.addEventListener('click', closeRatingModal);
elements.ratingModalCommentForm.addEventListener('submit', saveSeenComment);
elements.ratingModalCommentDelete.addEventListener('click', deleteSeenComment);
elements.warningModalBackdrop.addEventListener('click', closeWarningModal);
elements.warningModalClose.addEventListener('click', closeWarningModal);
elements.deleteHistoryBackdrop.addEventListener('click', closeDeleteConfirmModal);
elements.deleteHistoryClose.addEventListener('click', closeDeleteConfirmModal);
elements.deleteHistoryCancel.addEventListener('click', closeDeleteConfirmModal);
elements.passwordModalBackdrop.addEventListener('click', closePasswordModal);
elements.passwordModalClose.addEventListener('click', closePasswordModal);
elements.passwordModalCancel.addEventListener('click', closePasswordModal);
elements.profilePasswordForm.addEventListener('submit', updateProfilePassword);
elements.deleteHistoryConfirm.addEventListener('click', async () => {
  if (!pendingDeleteRequest) return;
  const request = pendingDeleteRequest;
  elements.deleteHistoryConfirm.disabled = true;
  elements.deleteHistoryConfirm.setAttribute('aria-busy', 'true');
  if (request.type === 'account') await deleteCurrentAccount();
  else if (request.type === 'avatar') await removeProfileAvatar();
  else if (request.type === 'proposal') await deleteMovie(request.movie.key);
  else await deleteSeenMovie(request.movie);
  if (!elements.deleteHistoryModal.classList.contains('hidden')) {
    elements.deleteHistoryConfirm.disabled = false;
    elements.deleteHistoryConfirm.removeAttribute('aria-busy');
  }
});
window.addEventListener('keydown', (event) => {
  const openModal = getOpenModal();
  if (event.key === 'Tab' && openModal) {
    trapModalFocus(event, openModal);
    return;
  }
  if (event.key === 'Escape' && !elements.avatarCropModal.classList.contains('hidden')) {
    closeAvatarCropModal();
    return;
  }
  if (event.key === 'Escape' && !elements.passwordModal.classList.contains('hidden')) {
    closePasswordModal();
    return;
  }
  if (event.key === 'Escape' && elements.menuToggle.getAttribute('aria-expanded') === 'true') {
    setMobileMenu(false);
    return;
  }
  if (event.key === 'Escape' && !elements.deleteHistoryModal.classList.contains('hidden')) {
    closeDeleteConfirmModal();
    return;
  }
  if (event.key === 'Escape' && !elements.warningModal.classList.contains('hidden')) {
    closeWarningModal();
    return;
  }
  if (event.key === 'Escape' && !elements.ratingModal.classList.contains('hidden')) closeRatingModal();
});

onValue(ref(db, 'movies'), (snapshot) => {
  movies = snapshot.val() || {};
  if (currentUser) {
    renderMovies();
    renderProfile();
  }
});
onValue(ref(db, 'users'), (snapshot) => {
  users = snapshot.val() || {};
  render();
});
onValue(ref(db, 'draw/current'), (snapshot) => {
  draw = snapshot.val();
  if (currentUser) renderDraw();
  refreshDrawRuntime();
});
onValue(ref(db, 'draw/lastDrawn'), (snapshot) => {
  lastDrawn = snapshot.val();
  if (currentUser) renderMovies();
});

onValue(ref(db, 'draw/history'), (snapshot) => {
  history = snapshot.val() || {};
  if (currentUser) {
    renderSeenMovies();
    renderProfile();
  }
});

onValue(ref(db, 'availability'), (snapshot) => {
  availability = snapshot.val() || {};
  if (currentUser) {
    renderAvailability();
    renderProfile();
  }
});

elements.availabilityDate.value = toDateKey(new Date());
setAvailabilityMode('weekly');
setAvailabilityAllDay(false);
setKeepSelectionOnDraw(false);
syncRouteFromHash();
render();
