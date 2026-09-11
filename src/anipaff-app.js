import { createRandomPicker } from './random-picker.js?v=20260911-filters';
import { availabilityAudience, availabilityAudiences, mediaInterestKey, mediaInterest, participatesInAvailability } from './participation.js';
import { createAniPaffDatabase } from './anipaff-database.js';
import { randomAnime, getAnimeDiscoveryFilters, searchAnime, getAnimeDetails, animeImageUrl, animeMetadata, animeMetaLabel, sameAnime, isAnimeSeries, formatAnimeFormat, formatAnimeStatus } from './anipaff-main.js?v=20260911-filterfix';
import { changeSharedAccount } from './account-data.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js';
import { getDatabase, get, set, push, remove, onValue } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js';

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



const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const { ref, update } = createAniPaffDatabase(db);
const encoder = new TextEncoder();
const storageKey = 'cinepaff_user';
const ratingFormatter = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const elements = {
  authPage: document.querySelector('#authPage'),
  appPage: document.querySelector('#appPage'),
  authForm: document.querySelector('#authForm'),
  identifier: document.querySelector('#identifier'),
  password: document.querySelector('#password'),
  authError: document.querySelector('#authError'),
  authSubmit: document.querySelector('#authSubmit'),
  authSubmitLabel: document.querySelector('#authSubmitLabel'),
  authToggle: document.querySelector('#authToggle'),
  currentUser: document.querySelector('#currentUser'),
  sessionAvatar: document.querySelector('.session__avatar'),
  tabProfileAvatar: document.querySelector('.tab__profile-avatar'),
  sessionProfileButton: document.querySelector('#sessionProfileButton'),
  profileAvatar: document.querySelector('.profile-card__avatar'),
  logoutButton: document.querySelector('#logoutButton'),
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
  primaryMovieCount: document.querySelector('#primaryMovieCount'),
  secondaryMovieSection: document.querySelector('#secondaryMovieSection'),
  secondaryMovieCount: document.querySelector('#secondaryMovieCount'),
  secondaryMovieList: document.querySelector('#secondaryMovieList'),
  currentPick: document.querySelector('#currentPick'),
  currentPickBackdrop: document.querySelector('#currentPickBackdrop'),
  currentPickContent: document.querySelector('#currentPick .now-playing__content'),
  currentPickLogo: document.querySelector('#currentPickLogo'),
  currentPickTitle: document.querySelector('#currentPickTitle'),
  currentPickUser: document.querySelector('#currentPickUser'),
  currentPickLink: document.querySelector('#currentPickLink'),
  currentPickBestSlot: document.querySelector('#currentPickBestSlot'),
  currentPickBestSlotValue: document.querySelector('#currentPickBestSlotValue'),
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
  drawForcedMovieField: document.querySelector('#drawForcedMovieField'),
  drawForcedMovie: document.querySelector('#drawForcedMovie'),
  userList: document.querySelector('#userList'),
  seenList: document.querySelector('#seenList'),
  seenCount: document.querySelector('#seenCount'),
  ratingModal: document.querySelector('#ratingModal'),
  ratingModalBackdrop: document.querySelector('#ratingModalBackdrop'),
  ratingModalBackdropArt: document.querySelector('#ratingModalBackdropArt'),
  ratingModalClose: document.querySelector('#ratingModalClose'),
  ratingModalLogo: document.querySelector('#ratingModalLogo'),
  ratingModalTitle: document.querySelector('#ratingModalTitle'),
  ratingModalFacts: document.querySelector('#ratingModalFacts'),
  ratingModalOverview: document.querySelector('#ratingModalOverview'),
  ratingModalOverviewToggle: document.querySelector('#ratingModalOverviewToggle'),
  ratingModalOverviewToggleLabel: document.querySelector('#ratingModalOverviewToggleLabel'),
  ratingModalCredits: document.querySelector('#ratingModalCredits'),
  ratingModalImdb: document.querySelector('#ratingModalImdb'),
  ratingModalAverage: document.querySelector('#ratingModalAverage'),
  ratingModalRatingCount: document.querySelector('#ratingModalRatingCount'),
  ratingModalAttribution: document.querySelector('#ratingModalAttribution'),
  ratingModalCommunity: document.querySelector('#ratingModalCommunity'),
  ratingModalPoster: document.querySelector('#ratingModalPoster'),
  ratingModalStars: document.querySelector('#ratingModalStars'),
  ratingModalClear: document.querySelector('#ratingModalClear'),
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
  profileLogoutButton: document.querySelector('#profileLogoutButton'),
  profileDeleteAccount: document.querySelector('#profileDeleteAccount'),
  profileSeenCount: document.querySelector('#profileSeenCount'),
  profileAvailabilityCount: document.querySelector('#profileAvailabilityCount'),
  profileProposalState: document.querySelector('#profileProposalState'),
  profileShortcuts: document.querySelectorAll('[data-profile-route]'),
};

let authMode = 'login';
let selectionFilter = 'all';
let selectionSort = 'member';
let historyFilter = 'all';
let screenings = {};
let screeningLoadFailed = false;
let screeningMovie = null;
let editingScreeningKey = '';
let screeningSaving = false;
let screeningSearchTimer = null;
let screeningSearchController = null;
let profileSection = 'account';
let adminRoleFilter = 'all';
const pendingRoleUpdates = new Set();
let previewPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let memoryUser = null;
let currentUser = readStoredUser();
let movies = {};
let proposalDiscovery = null;
let screeningDiscovery = null;
let users = {};
let availability = {};
const clubId = 'anipaff';
let interests = {};
const pendingInterestUpdates = new Set();
let availabilityAudienceSaving = false;
let draw = null;
let storedDraw = null;
let testDraw = null;
let lastDrawn = null;
let history = {};
let route = 'home';
let activeSeenMovie = null;
let ratedMovieKey = '';
let ratingRemovalPending = false;
let keepSelectionOnDraw = false;
let movieDetailsRequestId = 0;
let selectionHeroRequestId = 0;
let selectionHeroActiveKey = '';
let selectionPreviewMovieKey = '';
let selectionPreviewIndex = 0;
let selectionPreviewTimer = null;
let selectionProgressAnimation = null;
let selectionRenderedKey = "";
let activeMovieDetailsKey = '';
let movieOverviewExpanded = false;
let pendingMovie = null;
let proposalSaving = false;
let pendingWarnings = new Set();
let pendingDeleteRequest = null;
let availabilityMode = 'weekly';
let availabilitySelectedDays = new Set([(new Date().getDay() + 6) % 7]);
let availabilityAllDay = false;
let availabilityCalendarSelection = { start: null, end: null };
let drawRuntimeMinutes = null;
let drawRuntimeKey = '';
let drawRuntimeLoadingKey = '';
let drawRuntimeRetryTimer = null;
let drawRuntimeRetryCount = 0;
let drawInProgress = false;
let messageTimer = null;
let searchTimer = null;
let searchController = null;
let avatarCropState = null;
const drawAnimationDuration = 3600;
const selectionPreviewDuration = 15000;
const movieDetailsCache = new Map();
const movieRuntimeCache = new Map();
const modalReturnFocus = new WeakMap();
const availabilityStepMinutes = 30;
const availabilityHorizonDays = 14;
const defaultMovieRuntimeMinutes = 120;
const maxMoviesPerUser = 10;
const movieOverviewPreviewLength = 150;
const routeConfig = {
  home: { label: 'Sélection' },
  availability: { label: 'Disponibilités' },
  draws: { label: 'Tirage', drawPermission: true },
  seen: { label: 'Historique' },
  screenings: { label: 'Soirées' },
  profile: { label: 'Profil' },
};
const routeNames = Object.keys(routeConfig);

async function hydrateBrandWordmarks() {
  const wordmarks = [...document.querySelectorAll('[data-brand-wordmark]')];
  if (!wordmarks.length) return;

  try {
    const response = await fetch('./image/logoanipafftext.svg');
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
      textNode.style.fontFamily = '"Reggae One", sans-serif';
    });

    wordmarks.forEach((wordmark) => {
      wordmark.replaceChildren(document.importNode(sourceSvg, true));
      wordmark.classList.add('is-ready');
    });
  } catch {
    wordmarks.forEach((wordmark) => {
      const fallback = document.createElement('span');
      fallback.className = 'brand-lockup__fallback';
      fallback.innerHTML = '<span>Ani</span><strong>Paff</strong>';
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
      primaryButton.setAttribute('aria-label', `Définir ${movie.title} comme anime principal`);
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
  stopSelectionPreview();
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
  if (currentUser && route === 'home') scheduleSelectionPreview(getSelectionPreviewMovies());
  if (returnFocus?.isConnected) requestAnimationFrame(() => returnFocus.focus());
}

function createPosterMedia(movie, size = 'w342') {
  const imageUrl = posterUrl(movie?.posterPath, size);
  if (imageUrl) {
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.addEventListener('error', () => {
      const fallback = document.createElement('div');
      fallback.className = 'poster-card__fallback';
      fallback.textContent = movie?.title || 'CinePaff';
      image.replaceWith(fallback);
    }, { once: true });
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

function setKeepSelectionOnDraw(enabled) {
  keepSelectionOnDraw = enabled;
  if (!enabled) testDraw = null;
  elements.drawKeepSelectionToggle.classList.toggle('is-on', keepSelectionOnDraw);
  elements.drawKeepSelectionToggle.setAttribute('aria-pressed', keepSelectionOnDraw ? 'true' : 'false');
  elements.drawForcedMovieField.classList.remove('hidden');
  if (currentUser) { renderMovies(); renderDraw(); }
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
  document.title = `${routeConfig[route].label} — AniPaff`;
  if (previousRoute !== route) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (currentUser) document.querySelector('#pageContent').focus({ preventScroll: true });
    if (route === 'availability') requestAnimationFrame(() => scrollAvailabilityCalendarToHour(18));
  }
  if (route === 'draws' && currentUser && !drawInProgress) renderDraw();
  if (route === 'screenings' && currentUser) renderScreenings();
  if (route !== 'home') stopSelectionPreview();
  else if (currentUser && previousRoute !== route) renderSelectionHero();
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

function getSelectionPreviewMovies() {
  return getSelectionMovies().sort((first, second) => (
    (first.createdAt || 0) - (second.createdAt || 0)
    || String(first.title || '').localeCompare(String(second.title || ''), 'fr')
  ));
}

function buildBalancedDrawPool(forcedMovieKey = '', testMode = keepSelectionOnDraw) {
  return getParticipantPools({ excludeLastDrawn: !testMode })
    .map((pool) => pool.find((movie) => movie.key === forcedMovieKey)
      || pool[Math.floor(Math.random() * pool.length)]);
}

function wasLastDrawnUser() {
  return lastDrawn?.proposedBy === currentUser?.id;
}

function canProposeMovie() {
  return !wasLastDrawnUser() && proposedMovies().length < maxMoviesPerUser;
}

function renderUserAvatars() {
  const initials = currentUser.id.slice(0, 2).toLowerCase();
  const avatarDataUrl = users[currentUser.id]?.avatarDataUrl || '';
  elements.sessionAvatar.textContent = avatarDataUrl ? '' : initials;
  elements.sessionAvatar.style.backgroundImage = avatarDataUrl ? `url("${avatarDataUrl}")` : '';
  elements.sessionAvatar.classList.toggle('has-image', Boolean(avatarDataUrl));
  elements.tabProfileAvatar.textContent = avatarDataUrl ? '' : initials;
  elements.tabProfileAvatar.style.backgroundImage = avatarDataUrl ? `url("${avatarDataUrl}")` : '';
  elements.tabProfileAvatar.classList.toggle('has-image', Boolean(avatarDataUrl));
  elements.profileAvatar.dataset.initials = initials;
  elements.profileAvatar.style.backgroundImage = avatarDataUrl ? `url("${avatarDataUrl}")` : '';
  elements.profileAvatar.classList.toggle('has-image', Boolean(avatarDataUrl));
  elements.profileAvatarRemove.classList.toggle('hidden', !avatarDataUrl);
}

function render() {
  elements.authPage.classList.toggle('hidden', Boolean(currentUser));
  elements.appPage.classList.toggle('hidden', !currentUser);
  document.body.classList.toggle('is-authenticated', Boolean(currentUser));
  if (!currentUser) {
    document.title = 'CinePaff — Le ciné-club entre amis';
    document.querySelector('.skip-link').href = '#authForm';
    return;
  }
  document.querySelector('.skip-link').href = '#pageContent';

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
  renderScreenings();
}

function posterUrl(path) { return animeImageUrl(path); }

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

function getMovieSeenUserIds(movie) {
  return Object.entries(movie?.seenBy || {})
    .filter(([, value]) => Boolean(value))
    .map(([userId]) => userId)
    .sort((first, second) => first.localeCompare(second));
}

function createSelectionSeenButton(movie) {
  const viewerIds = getMovieSeenUserIds(movie);
  const isSeenByCurrentUser = viewerIds.includes(currentUser?.id);
  const button = document.createElement('button');
  button.className = `selection-seen-button${isSeenByCurrentUser ? ' is-seen' : ''}`;
  button.type = 'button';
  button.setAttribute('aria-pressed', isSeenByCurrentUser ? 'true' : 'false');
  button.setAttribute('aria-label', isSeenByCurrentUser
    ? `Retirer mon signal déjà vu pour ${movie.title}`
    : `Marquer ${movie.title} comme déjà vu`);
  button.title = viewerIds.length
    ? `Déjà vu par ${viewerIds.length} personne${viewerIds.length > 1 ? 's' : ''} : ${viewerIds.join(', ')}`
    : `Personne n’a encore marqué ${movie.title} comme déjà vu`;

  const count = document.createElement('span');
  count.textContent = String(viewerIds.length);
  count.setAttribute('aria-hidden', 'true');
  button.append(createIcon('visibility'), count);
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleMovieSeen(movie, button);
  });
  return button;
}

async function toggleMovieSeen(movie, button) {
  if (!currentUser?.id || !movie?.key || button.disabled) return;
  const isAlreadySeen = Boolean(movie.seenBy?.[currentUser.id]);
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  try {
    await set(ref(db, `movies/${movie.key}/seenBy/${currentUser.id}`), isAlreadySeen ? null : Date.now());
  } catch {
    button.disabled = false;
    button.removeAttribute('aria-busy');
    setMessage('Impossible de mettre à jour le statut déjà vu');
  }
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
  return movie.catalogId ? `anime-${movie.catalogId}` : `movie-${getSeenMovieId(movie)}`;
}

async function fetchMovieDetails(movie) {
  const key=getMovieDetailsCacheKey(movie);
  if(movieDetailsCache.has(key))return movieDetailsCache.get(key);
  if(!movie.catalogId)return null;
  const details=await getAnimeDetails(movie.catalogId);
  movieDetailsCache.set(key,details);
  return details;
}

function normalizeRuntimeMinutes(value) {
  const runtime = Number(value);
  return Number.isFinite(runtime) && runtime > 0 && runtime <= 1440 ? Math.round(runtime) : null;
}

async function fetchMovieRuntime(movie) {
  const stored=normalizeRuntimeMinutes(movie?.runtime);
  if(stored)return stored;
  const details=await fetchMovieDetails(movie);
  if(!details?.episodeDuration)return null;
  return normalizeRuntimeMinutes(details.episodeDuration * (isAnimeSeries(details) ? (movie.sessionEpisodes || details.sessionEpisodes || 3) : 1));
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

function getPreferredMovieLogo(details) {
  const logos = Array.isArray(details?.images?.logos) ? details.images.logos : [];
  const languagePriority = { fr: 0, en: 1, none: 2 };
  return [...logos].sort((first, second) => {
    const firstLanguage = first.iso_639_1 || 'none';
    const secondLanguage = second.iso_639_1 || 'none';
    const languageDifference = (languagePriority[firstLanguage] ?? 3) - (languagePriority[secondLanguage] ?? 3);
    if (languageDifference) return languageDifference;
    const voteDifference = Number(second.vote_average || 0) - Number(first.vote_average || 0);
    if (voteDifference) return voteDifference;
    return Number(second.width || 0) - Number(first.width || 0);
  })[0] || null;
}

function createArtworkImage(url, { alt = '', priority = 'auto' } = {}) {
  const image = document.createElement('img');
  image.src = url;
  image.alt = alt;
  image.decoding = 'async';
  image.loading = priority === 'high' ? 'eager' : 'lazy';
  image.fetchPriority = priority;
  return image;
}

function createMoviePosterFallback(movie) {
  const fallback = document.createElement('div');
  fallback.className = 'poster-card__fallback';
  fallback.textContent = movie.title;
  return fallback;
}

function renderMovieArtwork(movie, details) {
  const posterPath = details?.poster_path || movie.posterPath;
  const posterImageUrl = posterUrl(posterPath, 'w500');
  elements.ratingModalPoster.replaceChildren();
  if (posterImageUrl) {
    const posterImage = createArtworkImage(posterImageUrl, { priority: 'high' });
    posterImage.addEventListener('error', () => {
      elements.ratingModalPoster.replaceChildren(createMoviePosterFallback(movie));
    }, { once: true });
    elements.ratingModalPoster.append(posterImage);
  } else {
    elements.ratingModalPoster.append(createMoviePosterFallback(movie));
  }

  const backdropPath = details?.backdrop_path || details?.images?.backdrops?.[0]?.file_path || '';
  const backdropImageUrl = posterUrl(backdropPath, 'w1280');
  elements.ratingModalBackdropArt.replaceChildren();
  elements.ratingModalBackdropArt.classList.toggle('hidden', !backdropImageUrl);
  if (backdropImageUrl) {
    const backdropImage = createArtworkImage(backdropImageUrl, { priority: 'high' });
    backdropImage.addEventListener('error', () => {
      elements.ratingModalBackdropArt.replaceChildren();
      elements.ratingModalBackdropArt.classList.add('hidden');
    }, { once: true });
    elements.ratingModalBackdropArt.append(backdropImage);
  }

  const logo = getPreferredMovieLogo(details);
  const logoImageUrl = posterUrl(logo?.file_path, 'w500');
  elements.ratingModalLogo.replaceChildren();
  elements.ratingModalLogo.classList.toggle('hidden', !logoImageUrl);
  elements.ratingModalTitle.classList.toggle('rating-modal__title--logo', Boolean(logoImageUrl));
  if (logoImageUrl) {
    const logoImage = createArtworkImage(logoImageUrl, { priority: 'high' });
    logoImage.addEventListener('error', () => {
      elements.ratingModalLogo.replaceChildren();
      elements.ratingModalLogo.classList.add('hidden');
      elements.ratingModalTitle.classList.remove('rating-modal__title--logo');
    }, { once: true });
    elements.ratingModalLogo.append(logoImage);
  }
}

function getMovieOverviewPreview(overview) {
  if (overview.length <= movieOverviewPreviewLength) return overview;
  const rawPreview = overview.slice(0, movieOverviewPreviewLength - 1).trimEnd();
  const lastSpace = rawPreview.lastIndexOf(' ');
  const preview = lastSpace >= Math.floor(movieOverviewPreviewLength * 0.72)
    ? rawPreview.slice(0, lastSpace)
    : rawPreview;
  return `${preview}…`;
}

function renderMovieOverview(overview, { animate = false } = {}) {
  const overviewElement = elements.ratingModalOverview;
  const startHeight = overviewElement.getBoundingClientRect().height;
  overviewElement.getAnimations().forEach((animation) => animation.cancel());
  overviewElement.style.height = '';
  overviewElement.style.overflow = '';
  const fullOverview = String(overview || 'Synopsis indisponible pour cet anime.').trim();
  const canExpand = fullOverview.length > movieOverviewPreviewLength;
  overviewElement.dataset.fullText = fullOverview;
  overviewElement.textContent = canExpand && !movieOverviewExpanded
    ? getMovieOverviewPreview(fullOverview)
    : fullOverview;
  elements.ratingModalOverviewToggle.classList.toggle('hidden', !canExpand);
  elements.ratingModalOverviewToggle.setAttribute('aria-expanded', movieOverviewExpanded ? 'true' : 'false');
  elements.ratingModalOverviewToggleLabel.textContent = movieOverviewExpanded ? 'Réduire' : 'Afficher la suite';

  const endHeight = overviewElement.getBoundingClientRect().height;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (animate && !reducedMotion && Math.abs(endHeight - startHeight) > 1) {
    overviewElement.style.height = `${startHeight}px`;
    overviewElement.style.overflow = 'hidden';
    const animation = overviewElement.animate([
      { height: `${startHeight}px`, opacity: 0.72 },
      { height: `${endHeight}px`, opacity: 1 },
    ], {
      duration: 320,
      easing: 'cubic-bezier(0.22, 0.72, 0.16, 1)',
    });
    animation.onfinish = () => {
      overviewElement.style.height = '';
      overviewElement.style.overflow = '';
    };
  }
}

function renderMovieDetails(movie, details, state = 'ready') {
  renderMovieArtwork(movie,details);
  const media=details||movie;
  const genres=(details?.genres||[]).map(genre=>genre.name).slice(0,3).join(', ');
  const facts=[
    movie.isTestDraw?createFact('Tirage','Test'):null,
    createFact('Format',formatAnimeFormat(media.animeFormat)),
    createFact('Année',formatYear(details?.release_date||movie.releaseDate)),
    isAnimeSeries(media)?createFact('Épisodes',media.episodes?String(media.episodes):'À confirmer'):null,
    createFact(isAnimeSeries(media)?'Par épisode':'Durée',formatRuntime(media.episodeDuration)),
    createFact('Statut',formatAnimeStatus(media.animeStatus)),
    createFact('Genre',genres),
    createFact(media.catalogName||'Catalogue',media.anilistScore?ratingFormatter.format(media.anilistScore)+' / 100':''),
  ].filter(Boolean);
  if(state==='loading')facts.unshift(createFact('Infos','Chargement'));
  elements.ratingModalFacts.replaceChildren(...facts);
  renderMovieOverview(state==='loading'?'Chargement de l’anime…':media.overview||'Synopsis indisponible.');
  const studio=(details?.studios||[]).join(', ');
  const credits=[studio?'Studio : '+studio:'',getDirector(details)?'Réalisation : '+getDirector(details):'',getCast(details)?'Personnages : '+getCast(details):''].filter(Boolean);
  if(state==='error')credits.unshift('Fiche indisponible pour le moment.');
  elements.ratingModalCredits.replaceChildren(...credits.map(text=>{const item=document.createElement('span');item.textContent=text;return item}));
  const id=movie.catalogId;
  elements.ratingModalImdb.classList.toggle('hidden',!id);
  const url=details?.catalogUrl||movie.catalogUrl;
  elements.ratingModalImdb.classList.toggle('hidden',!url);
  if(url){elements.ratingModalImdb.href=url;elements.ratingModalImdb.querySelector('span:not(.material-symbols-rounded)')?.remove();elements.ratingModalImdb.replaceChildren(document.createTextNode('Voir sur '+(media.catalogName||'le catalogue')),createIcon('north_east'));}
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

function renderForcedDrawOptions() {
  const previousValue = elements.drawForcedMovie.value;
  const candidates = getParticipantPools({ excludeLastDrawn: !keepSelectionOnDraw }).flat().sort((first, second) => (
    String(first.proposedBy || '').localeCompare(String(second.proposedBy || ''))
    || String(first.title || '').localeCompare(String(second.title || ''))
  ));
  const randomOption = document.createElement('option');
  randomOption.value = '';
  randomOption.textContent = candidates.length ? 'Aléatoire' : 'Aucun anime';
  const options = candidates.map((movie) => {
    const option = document.createElement('option');
    option.value = movie.key;
    option.textContent = `${movie.title} — ${movie.proposedBy}`;
    return option;
  });
  elements.drawForcedMovie.replaceChildren(randomOption, ...options);
  if (candidates.some((movie) => movie.key === previousValue)) elements.drawForcedMovie.value = previousValue;
  elements.drawForcedMovie.disabled = drawInProgress || !candidates.length;
}


function getAvailabilityParticipants() {
  return Object.keys(users).filter(userId => participatesInAvailability(users[userId], clubId, mediaInterest(interests, draw, userId)));
}

function createInterestControls(movie) {
  const group = document.createElement('div');
  group.className = 'interest-choices';
  group.dataset.interestKey = mediaInterestKey(movie);
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', 'Ton envie pour ' + movie.title);
  for (const [value, label, icon] of [[1, 'Intéressé', 'favorite'], [-1, 'Pas pour moi', 'close']]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.interestValue = value;
    button.setAttribute('aria-label', label + ' : ' + movie.title);
    button.title = 'Cliquer à nouveau pour retirer ce choix';
    const text = document.createElement('span');
    text.textContent = label;
    button.append(createIcon(icon), text);
    button.addEventListener('click', () => saveMovieInterest(movie, value));
    group.append(button);
  }
  return group;
}

function refreshInterestControls() {
  document.querySelectorAll('[data-interest-key]').forEach(group => {
    const key = group.dataset.interestKey;
    const value = interests[key]?.[currentUser?.id] ?? null;
    group.closest('.selection-card')?.classList.toggle('is-declined', value === -1);
    group.querySelectorAll('[data-interest-value]').forEach(button => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.interestValue) === value));
      button.disabled = !currentUser || pendingInterestUpdates.has(key);
    });
  });
}

async function saveMovieInterest(movie, value) {
  if (!currentUser) return;
  const key = mediaInterestKey(movie);
  if (pendingInterestUpdates.has(key)) return;
  const next = mediaInterest(interests, movie, currentUser.id) === value ? null : value;
  pendingInterestUpdates.add(key);
  refreshInterestControls();
  try {
    await update(ref(db, 'interests/' + key), { [currentUser.id]: next });
    setMessage(next === -1 ? 'Tu ne comptes pas dans les dispos pour ce titre.' : next === 1 ? 'Envie enregistrée' : 'Choix retiré');
  } catch {
    setMessage('Impossible d’enregistrer ton choix. Réessaie.');
  } finally {
    pendingInterestUpdates.delete(key);
    refreshInterestControls();
  }
}

async function saveAvailabilityAudience() {
  if (!currentUser || availabilityAudienceSaving) return;
  const select = document.querySelector('#profileAvailabilityAudience');
  const status = document.querySelector('#profileAvailabilityStatus');
  const value = select.value;
  if (!availabilityAudiences.includes(value)) return;
  availabilityAudienceSaving = true;
  select.disabled = true;
  status.classList.remove('is-error');
  status.textContent = 'Enregistrement…';
  try {
    await update(ref(db, 'users/' + currentUser.id), { availabilityAudience: value });
    status.textContent = 'Enregistré';
  } catch {
    status.classList.add('is-error');
    status.textContent = 'Enregistrement impossible. Réessaie.';
  } finally {
    availabilityAudienceSaving = false;
    select.disabled = false;
    select.value = availabilityAudience(users[currentUser.id]);
  }
}

function createSelectionMovieCard(movie, { secondary = false } = {}) {
  const item = document.createElement('article');
  item.className = `poster-card selection-card${secondary ? ' poster-card--secondary' : ''}`;
  item.append(createCardButton(movie, `Voir la fiche de ${movie.title}`, () => openRatingModal(movie, { allowRating: false })));
  item.append(createSelectionSeenButton(movie), createInterestControls(movie));
  const warningButton = createWarningButton(movie);
  if (warningButton) item.append(warningButton);
  return item;
}

function renderMovies() {
  const sortMovies = (a, b) => {
    if (selectionSort === 'title') return a.title.localeCompare(b.title, 'fr');
    if (selectionSort === 'recent') return (b.createdAt || 0) - (a.createdAt || 0);
    const ownA = a.proposedBy === currentUser?.id;
    const ownB = b.proposedBy === currentUser?.id;
    if (ownA !== ownB) return ownA ? -1 : 1;
    return String(a.proposedBy || '').localeCompare(String(b.proposedBy || ''), 'fr')
      || (a.createdAt || 0) - (b.createdAt || 0);
  };
  const allPrimary = getSelectionMovies();
  const matchesFilter = (movie) => selectionFilter === 'interested' ? mediaInterest(interests, movie, currentUser?.id) === 1 : selectionFilter === 'mine' ? movie.proposedBy === currentUser?.id : selectionFilter === 'unseen' ? !getMovieSeenUserIds(movie).includes(currentUser?.id) : true;
  const primaryList = allPrimary.filter(matchesFilter).sort(sortMovies);
  const primaryKeys = new Set(allPrimary.map((movie) => movie.key));
  const secondaryList = movieArray()
    .filter((movie) => !primaryKeys.has(movie.key) && matchesFilter(movie))
    .sort(sortMovies);
  const ownMovies = proposedMovies();
  const canPropose = canProposeMovie();
  proposalDiscovery?.setEnabled(canPropose && !proposalSaving);
  const eligibleParticipants = getParticipantPools({ excludeLastDrawn: !keepSelectionOnDraw }).length;
  const totalMovies = movieArray().length;
  document.querySelector('#clubStats').textContent = `${totalMovies} anime${totalMovies > 1 ? 's' : ''} · ${allPrimary.length} membre${allPrimary.length > 1 ? 's' : ''}`;
  document.querySelector('#addFilmShortcut').disabled = !canPropose;
  document.querySelector('#firstFilmShortcut').disabled = !canPropose;
  elements.selectionCount.textContent = `${totalMovies} anime${totalMovies > 1 ? 's' : ''}`;
  elements.primaryMovieCount.textContent = String(primaryList.length);
  elements.secondaryMovieCount.textContent = String(secondaryList.length);
  elements.secondaryMovieSection.classList.toggle('hidden', !secondaryList.length);
  elements.drawPoolCount.textContent = `${eligibleParticipants} participant${eligibleParticipants > 1 ? 's' : ''}`;
  elements.drawButton.disabled = eligibleParticipants === 0 || drawInProgress;
  renderForcedDrawOptions();
  if (!draw) renderSelectionHero();
  elements.searchForm.classList.toggle('hidden', !canPropose);
  if (!canPropose) resetMovieSearch();
  setProposalStatus(wasLastDrawnUser()
    ? 'Pause jusqu’au prochain tirage'
    : ownMovies.length
      ? `${ownMovies.length}/${maxMoviesPerUser} animes · 1 principal`
      : `0/${maxMoviesPerUser} animes`);
  renderProposalPreview(ownMovies);
  elements.movieList.replaceChildren(...(primaryList.length
    ? primaryList.map((movie) => createSelectionMovieCard(movie))
    : [createEmptyState(selectionFilter === 'all' ? 'Aucun anime en sélection' : 'Aucun anime pour ce filtre')]));
  elements.secondaryMovieList.replaceChildren(...secondaryList.map((movie) => createSelectionMovieCard(movie, { secondary: true })));
  refreshInterestControls();
}

function createEmptyState(text) {
  const empty = document.createElement('div');
  empty.className = 'empty-state';
  const title = document.createElement('strong');
  title.textContent = text;
  empty.append(createIcon(text.includes('créneau') ? 'calendar_month' : 'movie_filter'), title);
  if (text === 'Aucun anime en sélection' && canProposeMovie()) {
    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'text-action';
    action.textContent = 'Ajouter un anime';
    action.addEventListener('click', focusMovieSearch);
    empty.append(action);
  }
  return empty;
}

function setProfileSection(section, focus = false) {
  profileSection = section === 'admin' && currentUser?.isAdmin ? 'admin' : 'account';
  const adminTab = document.querySelector('#profileAdminTab');
  adminTab.classList.toggle('hidden', !currentUser?.isAdmin);
  document.querySelector('#profileAccountPanel').classList.toggle('hidden', profileSection !== 'account');
  elements.profileAdminTools.classList.toggle('hidden', profileSection !== 'admin');
  document.querySelectorAll('[data-profile-section]').forEach(button => {
    const selected = button.dataset.profileSection === profileSection;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
    if (selected && focus) button.focus();
  });
  if (profileSection === 'admin') renderUsers();
}

function renderUsers() {
  if (!currentUser?.isAdmin) { elements.userList.replaceChildren(); return; }
  const query = normalizeSearch(elements.adminUserSearch.value);
  const accounts = Object.entries(users).map(([id, data]) => ({ ...data, id }));
  document.querySelector('#adminMemberCount').textContent = String(accounts.length);
  document.querySelectorAll('[data-role-count]').forEach(count => {
    count.textContent = String(accounts.filter(account => count.dataset.roleCount === 'all' || getAccountRole(account) === count.dataset.roleCount).length);
  });
  const list = accounts.filter(account => normalizeSearch(account.id).includes(query) && (adminRoleFilter === 'all' || getAccountRole(account) === adminRoleFilter))
    .sort((a, b) => a.id.localeCompare(b.id, 'fr'));
  document.querySelector('#adminResultCount').textContent = `${list.length} membre${list.length > 1 ? 's' : ''}`;
  if (!list.length) {
    const empty = document.createElement('p'); empty.className = 'admin-empty'; empty.textContent = 'Aucun membre trouvé.';
    elements.userList.replaceChildren(empty);
    return;
  }
  elements.userList.replaceChildren(...list.map(account => {
    const item = document.createElement('div'); item.className = 'admin-user-item';
    const identity = document.createElement('div'); identity.className = 'admin-user-identity';
    const avatar = document.createElement('span'); avatar.className = 'admin-user-avatar'; avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = account.id.slice(0,2).toLowerCase();
    if (account.avatarDataUrl) {
      const image = document.createElement('img'); image.src = account.avatarDataUrl; image.alt = ''; image.loading = 'lazy';
      image.addEventListener('error', () => image.remove(), { once:true }); avatar.append(image);
    }
    const meta = document.createElement('span'); meta.className = 'admin-user-meta';
    const name = document.createElement('strong'); name.textContent = account.id;
    meta.append(name);
    if (account.id === currentUser.id) { const self = document.createElement('small'); self.className = 'admin-user-self'; self.textContent = 'Vous'; meta.append(self); }
    const count = proposedMovies(account.id).length;
    const mobileCount = document.createElement('small'); mobileCount.className = 'admin-user-mobile-count'; mobileCount.textContent = `${count} anime${count > 1 ? 's' : ''}`; meta.append(mobileCount);
    identity.append(avatar,meta);
    const activity = document.createElement('span'); activity.className = 'admin-user-activity'; activity.textContent = String(count);
    activity.setAttribute('aria-label', `${count} anime${count > 1 ? 's' : ''} proposé${count > 1 ? 's' : ''}`);
    const roleSelect = document.createElement('select'); roleSelect.className = 'role-select';
    roleSelect.setAttribute('aria-label', `Rôle de ${account.id}`);
    [['user','Membre'],['organizer','Organisateur'],['admin','Admin']].forEach(([value,label]) => {
      const option = document.createElement('option'); option.value = value; option.textContent = label; roleSelect.append(option);
    });
    roleSelect.value = getAccountRole(account);
    roleSelect.dataset.role = roleSelect.value;
    roleSelect.disabled = pendingRoleUpdates.has(account.id);
    roleSelect.addEventListener('change', async () => {
      const previousRole = getAccountRole(users[account.id]);
      const nextRole = roleSelect.value;
      if (!currentUser?.isAdmin || pendingRoleUpdates.has(account.id)) { roleSelect.value = previousRole; return; }
      const adminCount = Object.values(users).filter(user => user?.isAdmin).length;
      if (previousRole === 'admin' && nextRole !== 'admin' && adminCount <= 1) {
        roleSelect.value = previousRole;
        setMessage('Nomme un autre admin avant de changer ce rôle');
        return;
      }
      pendingRoleUpdates.add(account.id); roleSelect.disabled = true; roleSelect.setAttribute('aria-busy','true');
      try {
        await update(ref(db, `users/${account.id}`), { isAdmin: nextRole === 'admin', role: nextRole === 'organizer' ? 'organizer' : null });
        users[account.id] = { ...users[account.id], isAdmin: nextRole === 'admin', role: nextRole === 'organizer' ? 'organizer' : null };
        if (account.id === currentUser.id) { currentUser = { ...currentUser, isAdmin:nextRole === 'admin', role:nextRole }; storeCurrentUser(); render(); }
        setMessage('Rôle mis à jour');
      } catch { setMessage('Impossible de modifier ce rôle'); }
      finally { pendingRoleUpdates.delete(account.id); renderUsers(); }
    });
    item.append(identity,activity,roleSelect); return item;
  }));
}

function renderDraw() {
  renderSelectionHero();
  if (drawInProgress) return;
  const winner = (keepSelectionOnDraw && testDraw) || draw;
  elements.winnerCard.classList.toggle('hidden', !winner);
  elements.drawStage.classList.toggle('has-winner', Boolean(winner));
  elements.winnerTitle.textContent = winner?.title || '';
  elements.winnerUser.textContent = winner?.proposedBy ? `Proposé par ${winner.proposedBy}` : '';
  elements.winnerPoster.replaceChildren();
  if (winner) { elements.winnerPoster.append(createPosterMedia(winner, 'w500')); elements.coverStack.replaceChildren(); }
  else buildDrawCovers(getSelectionPreviewMovies());
  document.querySelector('#winnerLabel').textContent = winner?.isTestDraw ? 'Simulation' : 'Ce soir';
  elements.drawStatus.textContent = winner?.isTestDraw ? 'TEST · NON ENREGISTRÉ' : winner ? 'À L’AFFICHE' : 'PRÊT';
}

function stopSelectionPreview() {
  window.clearTimeout(selectionPreviewTimer);
  selectionPreviewTimer = null;
  selectionProgressAnimation?.cancel();
  selectionProgressAnimation = null;
}

function clearSelectionHeroOutgoing() {
  elements.currentPick.querySelectorAll('.selection-spotlight__backdrop--outgoing, .now-playing__content--outgoing, .hero-poster--outgoing')
    .forEach((element) => element.remove());
}

function removeCloneIds(element) {
  if (element.id) element.removeAttribute('id');
  element.querySelectorAll('[id]').forEach((child) => child.removeAttribute('id'));
  element.querySelectorAll('a, button, input, select, textarea').forEach((control) => control.setAttribute('tabindex', '-1'));
  element.setAttribute('aria-hidden', 'true');
  element.setAttribute('inert', '');
}

function prepareSelectionHeroSlide() {
  clearSelectionHeroOutgoing();
  if (elements.currentPick.classList.contains('hidden') || !elements.currentPickTitle.textContent) return;

  const outgoingBackdrop = elements.currentPickBackdrop.cloneNode(true);
  const outgoingContent = elements.currentPickContent.cloneNode(true);
  // Preserve the exact layout while the next title and artwork enter.
  outgoingContent.style.left = elements.currentPickContent.offsetLeft + 'px';
  outgoingContent.style.top = elements.currentPickContent.offsetTop + 'px';
  outgoingContent.style.bottom = 'auto';
  outgoingContent.style.width = elements.currentPickContent.offsetWidth + 'px';
  const outgoingPoster = document.querySelector('#heroPoster').cloneNode(true);
  outgoingPoster.classList.add('hero-poster--outgoing');
  removeCloneIds(outgoingPoster);
  outgoingBackdrop.classList.add('selection-spotlight__backdrop--outgoing');
  outgoingContent.classList.add('now-playing__content--outgoing');
  removeCloneIds(outgoingBackdrop);
  removeCloneIds(outgoingContent);
  elements.currentPick.append(outgoingBackdrop, outgoingContent, outgoingPoster);
  window.setTimeout(() => {
    outgoingBackdrop.remove();
    outgoingContent.remove();
    outgoingPoster.remove();
  }, 720);
}

function scheduleSelectionPreview(candidates) {
  const pauseButton = document.querySelector('#heroPause');
  pauseButton.setAttribute('aria-pressed', String(previewPaused));
  pauseButton.setAttribute('aria-label', previewPaused ? 'Reprendre le défilement' : 'Mettre le défilement en pause');
  pauseButton.firstElementChild.textContent = previewPaused ? 'play_arrow' : 'pause';
  if (previewPaused || !currentUser || document.hidden || getOpenModal() || draw || route !== 'home' || candidates.length < 2) {
    stopSelectionPreview();
    return;
  }
  // Live data and filters must not restart the current slide's 15-second interval.
  if (selectionPreviewTimer !== null) return;
  selectionProgressAnimation = document.querySelector('#heroProgress').animate(
    [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
    { duration: selectionPreviewDuration, easing: 'linear', fill: 'forwards' },
  );
  selectionPreviewTimer = window.setTimeout(() => {
    stopSelectionPreview();
    if (draw || route !== 'home' || document.hidden || getOpenModal()) return;
    stepHero(1);
  }, selectionPreviewDuration);
}

function preloadSelectionMovie(movie) {
  if (!movie) return;
  fetchMovieDetails(movie).then(details => {
    [details?.backdrop_path || movie.backdropPath, movie.posterPath, getPreferredMovieLogo(details)?.file_path]
      .filter(Boolean).forEach((path, index) => {
        const image = new Image();
        image.src = posterUrl(path, index === 0 ? 'w1280' : 'w500');
      });
  }).catch(() => {});
}

function renderSelectionHero({ animate = false } = {}) {
  const candidates = draw ? [] : getSelectionPreviewMovies();
  let movie = draw;

  if (!movie && candidates.length) {
    const preservedIndex = candidates.findIndex((candidate) => candidate.key === selectionPreviewMovieKey);
    selectionPreviewIndex = preservedIndex >= 0
      ? preservedIndex
      : Math.min(selectionPreviewIndex, candidates.length - 1);
    movie = candidates[selectionPreviewIndex];
    selectionPreviewMovieKey = movie.key;
  }

  document.querySelector('#clubWelcome').classList.toggle('hidden', Boolean(movie));
  document.querySelector('.hero-navigation').classList.toggle('hidden', Boolean(draw) || candidates.length < 2);
  document.querySelector('#heroLabel').textContent = draw ? 'À l’affiche' : 'En sélection';
  document.querySelector('#heroPosition').textContent = draw ? 'LE FILM DU SOIR' : `${String(selectionPreviewIndex + 1).padStart(2, '0')} / ${String(candidates.length).padStart(2, '0')}`;
  ['heroPrevious', 'heroNext', 'heroPause'].forEach(id => { document.getElementById(id).disabled = Boolean(draw) || candidates.length < 2; });
  if (!movie) {
    stopSelectionPreview();
    clearSelectionHeroOutgoing();
    selectionHeroActiveKey = '';
    selectionRenderedKey = '';
    ++selectionHeroRequestId;
    document.querySelector('#heroPoster').replaceChildren();
    elements.currentPick.classList.add('hidden');
    elements.currentPick.classList.remove('is-preview', 'is-switching');
    elements.currentPickTitle.textContent = '';
    elements.currentPickUser.textContent = '';
    setCurrentPickArtwork(null);
    return;
  }

  const isPreview = !draw;
  const renderedKey = (isPreview ? 'preview:' : 'draw:') + getMovieDetailsCacheKey(movie);
  const changed = selectionRenderedKey !== renderedKey;
  if (!changed) {
    elements.currentPickUser.textContent = movie.proposedBy ? `Proposé par ${movie.proposedBy}` : '';
    scheduleSelectionPreview(candidates);
    return;
  }
  stopSelectionPreview();
  selectionRenderedKey = renderedKey;
  if (animate && isPreview) prepareSelectionHeroSlide();
  else clearSelectionHeroOutgoing();
  elements.currentPick.classList.remove('hidden', 'is-switching');
  elements.currentPick.classList.toggle('is-preview', isPreview);
  elements.currentPick.setAttribute('aria-label', isPreview ? 'Animes en lice' : 'Anime actuellement tiré');
  elements.currentPickTitle.textContent = movie.title || '';
  elements.currentPickUser.textContent = movie.proposedBy ? `Proposé par ${movie.proposedBy}` : '';
  elements.currentPickLink.classList.toggle('hidden', isPreview);
  if (isPreview) elements.currentPickBestSlot.classList.add('hidden');

  void elements.currentPick.offsetWidth;
  if (animate) elements.currentPick.classList.add('is-switching');
  renderCurrentPickHero(movie);
  if (isPreview && candidates.length > 1) preloadSelectionMovie(candidates[(selectionPreviewIndex + 1) % candidates.length]);
  scheduleSelectionPreview(candidates);
}

function setCurrentPickArtwork(movie, details = null) {
  elements.currentPickBackdrop.replaceChildren();
  elements.currentPickLogo.replaceChildren();
  elements.currentPickLogo.classList.add('hidden');
  elements.currentPickTitle.classList.remove('now-playing__title--logo');
  if (!movie) return;

  const backdropPath = details?.backdrop_path || details?.images?.backdrops?.[0]?.file_path || movie.backdropPath || movie.posterPath || '';
  const backdropImageUrl = posterUrl(backdropPath, 'w1280');
  if (backdropImageUrl) {
    const backdropImage = createArtworkImage(backdropImageUrl, { priority: 'high' });
    backdropImage.addEventListener('error', () => {
      if (elements.currentPickBackdrop.firstElementChild === backdropImage) elements.currentPickBackdrop.replaceChildren();
    }, { once: true });
    elements.currentPickBackdrop.append(backdropImage);
  }

  const logo = getPreferredMovieLogo(details);
  const logoImageUrl = posterUrl(logo?.file_path, 'w500');
  if (logoImageUrl) {
    const logoImage = createArtworkImage(logoImageUrl, { priority: 'high' });
    logoImage.addEventListener('error', () => {
      elements.currentPickLogo.replaceChildren();
      elements.currentPickLogo.classList.add('hidden');
      elements.currentPickTitle.classList.remove('now-playing__title--logo');
    }, { once: true });
    elements.currentPickLogo.append(logoImage);
    elements.currentPickLogo.classList.remove('hidden');
    elements.currentPickTitle.classList.add('now-playing__title--logo');
  }
}

async function renderCurrentPickHero(movie) {
  const requestId = ++selectionHeroRequestId;
  const heroKey = movie ? getMovieDetailsCacheKey(movie) : '';
  selectionHeroActiveKey = heroKey;
  const poster = document.querySelector('#heroPoster');
  poster.replaceChildren(createPosterMedia(movie, 'w500'));
  poster.querySelector('img')?.setAttribute('loading', 'eager');
  const cached = movieDetailsCache.get(heroKey);
  setCurrentPickArtwork(movie, cached);
  if (cached || !movie?.catalogId) return;
  try {
    const details = await fetchMovieDetails(movie);
    if (requestId !== selectionHeroRequestId || selectionHeroActiveKey !== heroKey) return;
    setCurrentPickArtwork(movie, details);
    if (draw && getMovieDetailsCacheKey(draw) === heroKey) applyDrawRuntime(movie, details?.runtime);
  } catch {
    // Keep the poster-based fallback already rendered.
  }
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
  return movie.catalogId || `${movie.title}-${movie.posterPath}`;
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
    if (!movie?.title || movie.isTestDraw) return;
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
  avatar.textContent = avatarDataUrl ? '' : comment.authorId.slice(0, 2).toLowerCase();
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
  button.disabled = ratingRemovalPending;
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
  const allMovies = seenMovieArray();
  const query = normalizeSearch(document.querySelector('#historyQuery').value);
  const list = allMovies.filter(movie => normalizeSearch(movie.title).includes(query) && (historyFilter === 'unrated' ? !getUserRating(movie) : historyFilter === 'favorites' ? getUserRating(movie) >= 4 : true));
  elements.seenCount.textContent = `${allMovies.length} anime${allMovies.length > 1 ? 's' : ''}`;
  elements.seenList.replaceChildren(...(list.length ? list.map(createSeenMovieCard) : [createEmptyState(allMovies.length ? 'Aucun résultat pour le moment' : 'Aucun anime vu')]));
  if (activeSeenMovie) {
    const refreshedMovie = allMovies.find((movie) => (
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
  movieOverviewExpanded = false;
  document.querySelector('#ratingModalInterest').replaceChildren(createInterestControls(movie));
  refreshInterestControls();
  const requestId = ++movieDetailsRequestId;
  elements.ratingModalTitle.textContent = movie.title;
  elements.ratingModalAttribution.textContent = movie.proposedBy ? `Proposé par ${movie.proposedBy}` : '';
  elements.ratingModalCommunity.classList.toggle('hidden', !allowRating);
  if (allowRating) {
    const averageRating = getAverageRating(movie);
    const ratingCount = getRatingCount(movie);
    elements.ratingModalAverage.textContent = averageRating || '—';
    elements.ratingModalRatingCount.textContent = ratingCount
      ? `${ratingCount} note${ratingCount > 1 ? 's' : ''}`
      : 'Aucune note';
  } else {
    elements.ratingModalAverage.textContent = '—';
    elements.ratingModalRatingCount.textContent = 'Aucune note';
  }
  renderMovieDetails(movie, null, 'loading');
  loadMovieDetails(movie, requestId);
  elements.ratingModalStars.replaceChildren(...(allowRating ? [1, 2, 3, 4, 5].map((value) => createRatingButton(movie, value)) : []));
  elements.ratingModalStars.classList.toggle('hidden', !allowRating);
  elements.ratingModalClear.classList.toggle('hidden', !allowRating || !getUserRating(movie));
  elements.ratingModalClear.disabled = ratingRemovalPending;
  elements.ratingModalStars.classList.toggle('rating--confirmed', allowRating && movie.key === ratedMovieKey && getUserRating(movie) > 0);
  renderMovieComments(movie, allowRating);
  showModal(elements.ratingModal);
}

function closeRatingModal() {
  activeSeenMovie = null;
  activeMovieDetailsKey = '';
  movieOverviewExpanded = false;
  movieDetailsRequestId += 1;
  hideModal(elements.ratingModal);
}

function openWarningModal(movie) {
  const warnings = getTriggerWarnings(movie);
  if (!warnings.length) return;
  elements.warningModalTitle.textContent = movie.title;
  elements.warningModalIntro.textContent = `Warnings ajoutés par ${movie.warningBy || movie.proposedBy || 'la personne qui a proposé l’anime'}.`;
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
  if (type === 'screening' ? !canManageScreening(screenings[movie.key]) : !isProposal && !currentUser?.isAdmin) return;

  pendingDeleteRequest = { movie, type };
  elements.deleteHistoryTitle.textContent = type === 'screening' ? 'Annuler la soirée' : isProposal ? 'Retirer ta proposition' : 'Supprimer de l’historique';
  elements.deleteHistoryText.textContent = isProposal
    ? `Retirer « ${movie.title} » de la sélection ?`
    : `Supprimer « ${movie.title} » de l’historique ? Ses notes et commentaires seront également retirés.`;
  if (type === 'screening') elements.deleteHistoryText.textContent = `Annuler la soirée « ${movie.title} » ?`;
  elements.deleteHistoryConfirmLabel.textContent = type === 'screening' ? 'Annuler la soirée' : isProposal ? 'Retirer' : 'Supprimer';
  showModal(elements.deleteHistoryModal, elements.deleteHistoryCancel);
}

function openAccountDeleteConfirmModal() {
  if (!currentUser) return;
  pendingDeleteRequest = { type: 'account' };
  elements.deleteHistoryTitle.textContent = 'Supprimer ton compte';
  elements.deleteHistoryText.textContent = `Supprimer définitivement le compte « ${currentUser.id} » ? Tes propositions, disponibilités, notes et commentaires seront retirés de CinePaff et AniPaff.`;
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

async function clearSeenRating() {
  const movie = activeSeenMovie;
  const userId = currentUser?.id;
  if (!userId || !movie?.key || !getUserRating(movie) || ratingRemovalPending) return;
  const historyKeys = movie.historyKeys?.length ? movie.historyKeys : [movie.key];
  const changes = Object.fromEntries(historyKeys.map(key => [`draw/history/${key}/ratings/${userId}`, null]));
  ratingRemovalPending = true;
  elements.ratingModalClear.disabled = true;
  elements.ratingModalClear.setAttribute('aria-busy', 'true');
  elements.ratingModalStars.querySelectorAll('button').forEach(button => { button.disabled = true; });
  try {
    await update(ref(db), changes);
    historyKeys.forEach(key => { if (history[key]?.ratings) delete history[key].ratings[userId]; });
    if (historyKeys.includes(ratedMovieKey)) ratedMovieKey = '';
    if (currentUser?.id === userId) renderSeenMovies();
    setMessage('Note retirée');
  } catch {
    setMessage('Impossible de retirer la note. Réessaie.');
  } finally {
    ratingRemovalPending = false;
    elements.ratingModalClear.disabled = false;
    elements.ratingModalClear.removeAttribute('aria-busy');
    elements.ratingModalStars.querySelectorAll('button').forEach(button => { button.disabled = false; });
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
    setMessage('Impossible de supprimer cet anime de l’historique');
  }
}

async function deleteCurrentAccount() {
  if (!currentUser) return;
  const deletedUser = { ...currentUser };
  try {
    await changeSharedAccount(db, deletedUser.id);
    closeDeleteConfirmModal();
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

function getAvailabilityRuntimeState() {
  const storedRuntime = normalizeRuntimeMinutes(draw?.runtime);
  const currentDrawKey = draw?.catalogId ? `anime-${draw.catalogId}` : '';
  const resolvedRuntime = drawRuntimeKey === currentDrawKey ? normalizeRuntimeMinutes(drawRuntimeMinutes) : null;
  const exactRuntime = storedRuntime || resolvedRuntime;
  return {
    minutes: exactRuntime || defaultMovieRuntimeMinutes,
    exact: Boolean(exactRuntime),
  };
}

function getAvailabilityRuntime() {
  return getAvailabilityRuntimeState().minutes;
}

function getDrawRuntimeLabel() {
  if (!draw) return `Aucun anime tiré · estimation ${formatRuntime(defaultMovieRuntimeMinutes)}`;
  const runtime = getAvailabilityRuntimeState();
  return runtime.exact
    ? `${draw.title} · ${isAnimeSeries(draw) ? (draw.sessionEpisodes||3)+" épisodes · " : ""}${formatRuntime(runtime.minutes)}`
    : `${draw.title} · estimation provisoire ${formatRuntime(runtime.minutes)}`;
}

function buildAvailabilityIntervals() {
  const today = new Date(startOfDay(new Date()));
  const intervalsByUser = new Map();
  const participants = new Set(getAvailabilityParticipants());
  Object.entries(availability).forEach(([userId, userEntries]) => {
    if (!participants.has(userId)) return;
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
  avatar.textContent = avatarDataUrl ? '' : normalizedUserId.slice(0, 2).toLowerCase();
  avatar.style.backgroundImage = avatarDataUrl ? `url("${avatarDataUrl}")` : '';
  avatar.classList.toggle('has-image', Boolean(avatarDataUrl));
  avatar.title = accountKey || userId;
  avatar.setAttribute('aria-label', accountKey || userId);
  return avatar;
}

function renderAvailabilityRoster() {
  const members = getAvailabilityParticipants().sort((a, b) => a.localeCompare(b));
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
  const totalUsers = Math.max(1, getAvailabilityParticipants().length);
  elements.availabilityRuntime.textContent = getDrawRuntimeLabel();
  elements.availabilityBestPeople.replaceChildren();

  const slots = getDistinctAvailabilitySlots(3);

  if (!slots.length) {
    elements.availabilityBestSlot.textContent = 'À compléter';
    elements.availabilityBestCoverage.textContent = '0 disponible';
    elements.currentPickBestSlot.classList.add('hidden');
    elements.currentPickBestSlotValue.textContent = '';
    elements.currentPickBestSlotValue.removeAttribute('datetime');
    elements.availabilityRecommendations.replaceChildren(createEmptyState('Ajoutez vos créneaux pour lancer le calcul'));
    return;
  }

  const best = slots[0];
  const bestDay = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' }).format(best.start);
  const bestStartTime = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(best.start);
  elements.availabilityBestSlot.textContent = formatSlotRange(best.start, best.end);
  elements.availabilityBestCoverage.textContent = `${best.userIds.length}/${totalUsers} disponibles`;
  elements.availabilityBestPeople.replaceChildren(...best.userIds.slice(0, 5).map((userId) => createInitialAvatar(userId, true)));
  elements.currentPickBestSlotValue.textContent = `${bestDay} · ${bestStartTime}`;
  elements.currentPickBestSlotValue.dateTime = new Date(best.start).toISOString();
  elements.currentPickBestSlot.classList.toggle('hidden', !draw);

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
  shell.scrollTo({ left: target, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}

function renderAvailabilityCalendar() {
  const today = new Date(startOfDay(new Date()));
  const intervalsByUser = buildAvailabilityIntervals();
  const maxUsers = Math.max(1, getAvailabilityParticipants().length);
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
  const notice = document.querySelector('#availabilityParticipationNotice');
  const audience = availabilityAudience(users[currentUser.id]);
  notice.textContent = audience !== 'both' && audience !== clubId ? 'Ton profil est masqué des dispos sur ce site. Réglage dans ton profil.' : mediaInterest(interests, draw, currentUser.id) === -1 ? 'Pas pour toi : tes dispos ne comptent pas pour ce titre. Tu peux changer d’avis dans sa fiche.' : '';
  notice.classList.toggle('hidden', !notice.textContent);
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

function clearDrawRuntimeRetry() {
  if (drawRuntimeRetryTimer) window.clearTimeout(drawRuntimeRetryTimer);
  drawRuntimeRetryTimer = null;
}

function applyDrawRuntime(movie, value, { persist = true } = {}) {
  const runtime = normalizeRuntimeMinutes(value);
  const movieKey = movie?.catalogId ? `anime-${movie.catalogId}` : '';
  const currentDrawKey = draw?.catalogId ? `anime-${draw.catalogId}` : '';
  if (!runtime || !movieKey || movieKey !== currentDrawKey) return false;

  const shouldPersist = normalizeRuntimeMinutes(draw.runtime) !== runtime;
  drawRuntimeKey = movieKey;
  drawRuntimeMinutes = runtime;
  drawRuntimeRetryCount = 0;
  clearDrawRuntimeRetry();
  draw.runtime = runtime;
  renderAvailability();

  if (persist && shouldPersist) {
    update(ref(db, 'draw/current'), { runtime }).catch((error) => {
      console.warn('[cinepaff:runtime] impossible de mémoriser la durée exacte', {
        catalogId: movie.catalogId,
        message: error?.message || String(error),
      });
    });
  }
  return true;
}

async function refreshDrawRuntime() {
  const nextKey = draw?.catalogId ? `anime-${draw.catalogId}` : '';
  if (!nextKey) {
    clearDrawRuntimeRetry();
    drawRuntimeKey = '';
    drawRuntimeLoadingKey = '';
    drawRuntimeMinutes = null;
    drawRuntimeRetryCount = 0;
    renderAvailability();
    return;
  }

  if (drawRuntimeKey && drawRuntimeKey !== nextKey) {
    clearDrawRuntimeRetry();
    drawRuntimeRetryCount = 0;
    drawRuntimeMinutes = null;
  }

  const storedRuntime = normalizeRuntimeMinutes(draw.runtime);
  if (storedRuntime) {
    applyDrawRuntime(draw, storedRuntime, { persist: false });
    return;
  }

  if (drawRuntimeLoadingKey === nextKey) return;
  drawRuntimeKey = nextKey;
  drawRuntimeLoadingKey = nextKey;
  renderAvailability();
  try {
    const runtime = await fetchMovieRuntime(draw);
    if (drawRuntimeKey !== nextKey || !draw || `anime-${draw.catalogId}` !== nextKey) return;
    applyDrawRuntime(draw, runtime);
  } catch (error) {
    if (drawRuntimeKey === nextKey) {
      renderAvailability();
      console.warn('[cinepaff:runtime] durée TMDB indisponible, estimation provisoire conservée', {
        catalogId: draw?.catalogId,
        tentative: drawRuntimeRetryCount + 1,
        message: error?.message || String(error),
      });
      if (drawRuntimeRetryCount < 2) {
        drawRuntimeRetryCount += 1;
        clearDrawRuntimeRetry();
        drawRuntimeRetryTimer = window.setTimeout(() => {
          drawRuntimeRetryTimer = null;
          refreshDrawRuntime();
        }, 2000 * drawRuntimeRetryCount);
      }
    }
  } finally {
    if (drawRuntimeLoadingKey === nextKey) drawRuntimeLoadingKey = '';
  }
}

function renderProfile() {
  if (!availabilityAudienceSaving) document.querySelector('#profileAvailabilityAudience').value = availabilityAudience(users[currentUser.id]);
  const role = getRoleLabel(currentUser);
  elements.profileName.textContent = currentUser.id;
  elements.profileRole.textContent = role;
  if (document.activeElement !== elements.profileIdInput) elements.profileIdInput.value = currentUser.id;
  elements.profileSeenCount.textContent = String(seenMovieArray().length);
  elements.profileAvailabilityCount.textContent = String(getUserAvailabilityEntries(currentUser.id).length);
  elements.profileProposalState.textContent = String(proposedMovies().length);
  setProfileSection(profileSection);
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
    await changeSharedAccount(db, previousId, nextId);
    currentUser = { ...currentUser, id: nextId };
    storeCurrentUser();
    render();
    setMessage('Profil mis à jour');
  } catch (error) {
    setMessage(error.message === 'Cet ID est déjà utilisé' ? error.message : 'Impossible de modifier ton ID');
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
    elements.authError.textContent = 'Renseigne ton identifiant et ton mot de passe.';
    return;
  }

  elements.authSubmit.disabled = true;
  elements.authToggle.disabled = true;
  elements.authSubmit.setAttribute('aria-busy', 'true');
  elements.authSubmitLabel.textContent = 'Un instant…';
  try {
    const userRef = ref(db, `users/${id}`);
    const snapshot = await get(userRef);

    if (authMode === 'register') {
      if (snapshot.exists()) {
        elements.authError.textContent = 'Ce pseudo est déjà pris. Essaie-en un autre.';
        return;
      }
      const usersSnapshot = await get(ref(db, 'users'));
      const passwordData = await hashPassword(password);
      const user = { passwordHash: passwordData.hash, passwordSalt: passwordData.salt, isAdmin: !usersSnapshot.exists(), createdAt: Date.now() };
      await set(userRef, user);
      currentUser = { id, isAdmin: user.isAdmin, role: user.isAdmin ? 'admin' : 'user' };
    } else {
      if (!snapshot.exists() || !(await passwordMatches(password, snapshot.val()))) {
        elements.authError.textContent = 'Identifiant ou mot de passe incorrect.';
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
    elements.authToggle.disabled = false;
    elements.authSubmit.removeAttribute('aria-busy');
    elements.authSubmitLabel.textContent = authMode === 'login' ? 'Se connecter' : 'Créer un compte';
  }
}

const screeningUI = Object.fromEntries(['newScreening','screeningForm','screeningEditorTitle','closeScreeningEditor','screeningQuery','screeningSearchStatus','screeningResults','screeningSelected','screeningDateTime','screeningTimeZone','screeningFormError','saveScreening','upcomingScreenings','pastScreeningsSection','pastScreeningsCount','pastScreenings'].map(id => [id, document.getElementById(id)]));

function localDateTimeValue(timestamp) {
  const date = new Date(timestamp);
  const pad = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function canManageScreening(event) {
  return Boolean(currentUser && event && (currentUser.isAdmin || event.createdBy === currentUser.id));
}

function closeScreeningEditor({ focus = true } = {}) {
  if (screeningSaving) return;
  screeningDiscovery?.setMode('search');
  window.clearTimeout(screeningSearchTimer);
  screeningSearchController?.abort();
  screeningUI.screeningForm.classList.add('hidden');
  editingScreeningKey = ''; screeningMovie = null;
  if (focus && currentUser) screeningUI.newScreening.focus({ preventScroll: true });
}

function renderScreenings() {
  if (!currentUser) return;
  screeningUI.newScreening.classList.remove('hidden');
  if (editingScreeningKey && screenings[editingScreeningKey] && !canManageScreening(screenings[editingScreeningKey]) && !screeningSaving) closeScreeningEditor({ focus: false });
  const list = Object.entries(screenings).map(([key,event]) => ({...event,key})).filter(event => event.movie?.title && Number.isFinite(event.startsAt)).sort((a,b)=>a.startsAt-b.startsAt);
  const now = Date.now();
  const upcoming = list.filter(event => event.startsAt >= now);
  const past = list.filter(event => event.startsAt < now).reverse();
  screeningUI.upcomingScreenings.replaceChildren(...upcoming.map(createScreeningCard));
  if (!upcoming.length) {
    const empty = document.createElement('div'); empty.className = 'screening-empty';
    const title = document.createElement('h3'); title.textContent = screeningLoadFailed ? 'Soirées indisponibles' : 'Aucune soirée prévue';
    empty.append(createIcon('local_activity'),title);
    if (screeningLoadFailed) {const info=document.createElement('p'); info.textContent='Impossible de charger les soirées. Réessaie dans un instant.';empty.append(info);}
    screeningUI.upcomingScreenings.append(empty);
  }
  screeningUI.pastScreeningsSection.classList.toggle('hidden', !past.length);
  screeningUI.pastScreeningsCount.textContent = String(past.length);
  screeningUI.pastScreenings.replaceChildren(...past.map(createScreeningCard));
}

function createScreeningCard(event) {
  const card=document.createElement('article');card.className='screening-card';
  const date = new Date(event.startsAt);
  const dateBadge=document.createElement('div');dateBadge.className='screening-date';
  const day=document.createElement('strong');day.textContent=new Intl.DateTimeFormat('fr-FR',{day:'2-digit'}).format(date);
  const month=document.createElement('span');month.textContent=new Intl.DateTimeFormat('fr-FR',{month:'short'}).format(date);
  dateBadge.append(day,month);
  const poster=document.createElement('button');poster.type='button';poster.className='screening-poster';poster.setAttribute('aria-label',`Fiche de ${event.movie.title}`);poster.append(createPosterMedia(event.movie,'w342'));poster.addEventListener('click',()=>openRatingModal(event.movie,{allowRating:false}));
  const content=document.createElement('div');content.className='screening-copy';
  const time=document.createElement('time');time.dateTime=date.toISOString();time.textContent=new Intl.DateTimeFormat('fr-FR',{weekday:'long',hour:'2-digit',minute:'2-digit',...(date.getFullYear()!==new Date().getFullYear()?{year:'numeric'}:{})}).format(date);
  const title=document.createElement('h3');title.textContent=event.movie.title;
  const host=document.createElement('small');host.textContent=`Par ${event.createdBy || 'le club'}`;
  const details=document.createElement('button');details.type='button';details.className='text-action';details.textContent='Fiche de l’anime';details.append(createIcon('arrow_forward'));details.addEventListener('click',()=>openRatingModal(event.movie,{allowRating:false}));
  content.append(time,title);
  if(event.episodeStart){const episodes=document.createElement('span');episodes.className='screening-episodes-label';episodes.textContent=event.episodeStart===event.episodeEnd?'Épisode '+event.episodeStart:'Épisodes '+event.episodeStart+' à '+event.episodeEnd;content.append(episodes);}
  content.append(host,details);
  card.append(dateBadge,poster,content);
  if(canManageScreening(event)){
    const actions=document.createElement('div');actions.className='screening-actions';
    const edit=document.createElement('button');edit.type='button';edit.className='icon-action';edit.setAttribute('aria-label',`Modifier la soirée ${event.movie.title}`);edit.title='Modifier';edit.append(createIcon('edit'));edit.addEventListener('click',()=>openScreeningEditor(event));
    const cancel=document.createElement('button');cancel.type='button';cancel.className='icon-action';cancel.setAttribute('aria-label',`Annuler la soirée ${event.movie.title}`);cancel.title='Annuler';cancel.append(createIcon('delete'));cancel.addEventListener('click',()=>openDeleteConfirmModal({...event,title:event.movie.title},'screening'));
    actions.append(edit,cancel);card.append(actions);
  }
  return card;
}

function openScreeningEditor(event = null) {
  if(!currentUser || screeningSaving || (event && !canManageScreening(event)))return;
  window.clearTimeout(screeningSearchTimer);screeningSearchController?.abort();
  editingScreeningKey=event?.key || '';screeningMovie=event?.movie || null;
  screeningUI.screeningForm.reset();screeningUI.screeningForm.classList.remove('hidden');
  screeningUI.screeningEditorTitle.textContent=event?'Modifier la soirée':'Nouvelle soirée';
  screeningUI.saveScreening.firstChild.textContent=event?'Enregistrer':'Programmer la soirée';
  screeningUI.screeningDateTime.value=event?localDateTimeValue(event.startsAt):'';
  screeningUI.screeningDateTime.min=localDateTimeValue(Date.now()+60000);
  screeningUI.screeningTimeZone.textContent=`Heure locale · ${Intl.DateTimeFormat().resolvedOptions().timeZone.replaceAll('_',' ')}`;
  screeningUI.screeningResults.replaceChildren();screeningUI.screeningSearchStatus.textContent='';screeningUI.screeningFormError.textContent='';
  renderScreeningSelection();
  (event?screeningUI.screeningDateTime:screeningUI.screeningQuery).focus({preventScroll:true});
  screeningUI.screeningForm.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});
}

function renderScreeningSelection() {
  screeningUI.screeningSelected.classList.toggle('hidden', !screeningMovie);
  screeningUI.screeningSelected.replaceChildren();
  document.querySelector('#screeningEpisodes').classList.toggle('hidden',!isAnimeSeries(screeningMovie));
  const previous=screenings[editingScreeningKey];
  const from=document.querySelector('#screeningEpisodeStart'),to=document.querySelector('#screeningEpisodeEnd');
  from.disabled=to.disabled=!isAnimeSeries(screeningMovie);
  from.max=to.max=screeningMovie?.episodes||999;
  from.value=Math.min(previous?.episodeStart||1,Number(from.max));
  to.value=Math.min(previous?.episodeEnd||screeningMovie?.sessionEpisodes||3,Number(to.max));
  if(!screeningMovie)return;
  const art=document.createElement('div');art.className='screening-selected-art';art.append(createPosterMedia(screeningMovie,'w185'));
  const title=document.createElement('strong');title.textContent=screeningMovie.title;
  screeningUI.screeningSelected.append(art,title,createIcon('check'));
}

async function searchScreeningMovies() {
  const query=screeningUI.screeningQuery.value.trim();
  if(query.length<2||!currentUser||screeningSaving)return;
  const controller=new AbortController();screeningSearchController?.abort();screeningSearchController=controller;
  screeningUI.screeningSearchStatus.textContent='Recherche…';
  try{
    const data={results:await searchAnime(query,controller.signal)};
    if(controller.signal.aborted||query!==screeningUI.screeningQuery.value.trim())return;
    const list=(data.results||[]).slice(0,6);
    screeningUI.screeningSearchStatus.textContent=list.length?'':'Aucun anime trouvé.';
    screeningUI.screeningResults.replaceChildren(...list.map(movie=>{
      const button=document.createElement('button');button.type='button';button.className='screening-result';button.setAttribute('aria-label',`Programmer ${movie.title}`);
      button.append(createPosterMedia(movieFromSearchResult(movie),'w185'));const title=document.createElement('strong');title.textContent=movie.title;button.append(title);
      const year=document.createElement('small');year.textContent=formatYear(movie.release_date);button.append(year);
      button.addEventListener('click',()=>{screeningMovie=movieFromSearchResult(movie);screeningUI.screeningResults.replaceChildren();screeningUI.screeningQuery.value='';screeningUI.screeningFormError.textContent='';renderScreeningSelection();screeningUI.screeningDateTime.focus({preventScroll:true});});return button;
    }));
  }catch(error){if(!controller.signal.aborted){screeningUI.screeningSearchStatus.textContent='Recherche indisponible. Réessaie.';}}
}

// Save each announcement with the screening in one atomic Firebase update.
// A deletion keeps its anime/date snapshot in the queue for the Discord bot.
async function saveScreening(event) {
  event.preventDefault();
  if(!currentUser||screeningSaving)return;
  if(editingScreeningKey && !canManageScreening(screenings[editingScreeningKey])) { screeningUI.screeningFormError.textContent="Tu ne peux pas modifier cette soirée.";return; }
  const startsAt=new Date(screeningUI.screeningDateTime.value).getTime();
  const error=screeningUI.screeningFormError;
  if(!screeningMovie){error.textContent='Choisis un anime.';screeningUI.screeningQuery.focus();return;}
  if(!Number.isFinite(startsAt)||startsAt<=Date.now()){error.textContent='Choisis une date à venir.';screeningUI.screeningDateTime.focus();return;}
  if(editingScreeningKey&&!screenings[editingScreeningKey]){error.textContent='Cette soirée a déjà été annulée.';return;}
  const episodeStart=Number(document.querySelector('#screeningEpisodeStart').value);
  const episodeEnd=Number(document.querySelector('#screeningEpisodeEnd').value);
  if(isAnimeSeries(screeningMovie)&&(!Number.isInteger(episodeStart)||!Number.isInteger(episodeEnd)||episodeStart<1||episodeEnd<episodeStart||episodeEnd>(screeningMovie.episodes||999))){error.textContent='Vérifie les épisodes à regarder.';return;}
  screeningSaving=true;error.textContent='';
  screeningUI.screeningForm.querySelectorAll('input,button').forEach(control=>control.disabled=true);
  screeningUI.saveScreening.setAttribute('aria-busy','true');
  try{
    const previous = editingScreeningKey ? screenings[editingScreeningKey] : null;
    const key = editingScreeningKey || push(ref(db, 'screenings')).key;
    const data = {
      ...(previous || { createdAt: Date.now(), createdBy: currentUser.id }),
      movie: screeningMovie, startsAt, updatedAt: Date.now(),
      episodeStart:isAnimeSeries(screeningMovie)?episodeStart:null,
      episodeEnd:isAnimeSeries(screeningMovie)?episodeEnd:null,
    };
    const changes = { [`screenings/${key}`]: data };
    await Promise.all([update(ref(db), changes), new Promise(resolve=>window.setTimeout(resolve,500))]);
    setMessage(editingScreeningKey?'Soirée modifiée':'Soirée programmée');screeningSaving=false;closeScreeningEditor();
  }catch{error.textContent='Impossible d’enregistrer la soirée. Réessaie.';}
  finally{screeningSaving=false;screeningUI.screeningForm.querySelectorAll('input,button').forEach(control=>control.disabled=false);screeningUI.saveScreening.removeAttribute('aria-busy');document.querySelectorAll('#screeningEpisodes input').forEach(input=>input.disabled=!isAnimeSeries(screeningMovie));}
}

const deletingScreenings = new Set();
async function deleteScreening(key) {
  if (!canManageScreening(screenings[key]) || deletingScreenings.has(key)) return;
  deletingScreenings.add(key);
  try {
    const changes = { [`screenings/${key}`]: null };
    await update(ref(db), changes);
    closeDeleteConfirmModal(); setMessage('Soirée annulée');
  } catch { setMessage('Impossible d’annuler cette soirée'); }
  finally { deletingScreenings.delete(key); }
}

screeningUI.newScreening.addEventListener('click',()=>openScreeningEditor());
screeningUI.closeScreeningEditor.addEventListener('click',()=>closeScreeningEditor());
screeningUI.screeningForm.addEventListener('submit',saveScreening);
screeningUI.screeningQuery.addEventListener('input',()=>{
  window.clearTimeout(screeningSearchTimer);screeningSearchController?.abort();screeningUI.screeningResults.replaceChildren();screeningUI.screeningSearchStatus.textContent='';
  screeningMovie=null;renderScreeningSelection();
  screeningSearchTimer=window.setTimeout(searchScreeningMovies,250);
});
screeningUI.screeningQuery.addEventListener('keydown',event=>{
  if(event.key==='Enter'){event.preventDefault();window.clearTimeout(screeningSearchTimer);searchScreeningMovies();}
  if(event.key==='ArrowDown'){event.preventDefault();screeningUI.screeningResults.querySelector('button')?.focus();}
});
window.setInterval(()=>{if(currentUser&&route==='screenings'&&!document.hidden)renderScreenings();},60000);
onValue(ref(db,'screenings'),snapshot=>{screenings=snapshot.val()||{};screeningLoadFailed=false;renderScreenings();},()=>{screeningLoadFailed=true;renderScreenings();});

function setSearchBusy(isBusy) {
  elements.searchForm.classList.toggle('is-searching', isBusy);
  elements.results.setAttribute('aria-busy', String(isBusy));
}

function resetMovieSearch({ focus = false } = {}) {
  window.clearTimeout(searchTimer);
  searchController?.abort();
  searchController = null;
  setSearchBusy(false);
  elements.movieQuery.value = '';
  elements.results.replaceChildren();
  document.querySelector('#searchStatus').textContent = '';
  document.querySelector('#clearMovieSearch').classList.add('hidden');
  if (!proposalSaving) clearPendingMovie();
  if (focus) elements.movieQuery.focus({ preventScroll: true });
}

async function searchMovies(event = null) {
  event?.preventDefault();
  window.clearTimeout(searchTimer);
  const query = elements.movieQuery.value.trim();
  if (query.length < 2 || !canProposeMovie() || proposalSaving) return;
  searchController?.abort();
  const controller = new AbortController();
  searchController = controller;
  setSearchBusy(true);
  const status = document.querySelector('#searchStatus');
  status.textContent = 'Recherche…';
  if (!elements.results.children.length) {
    elements.results.replaceChildren(...Array.from({ length: 6 }, () => {
      const skeleton = document.createElement('div');
      skeleton.className = 'search-skeleton';
      skeleton.setAttribute('aria-hidden', 'true');
      return skeleton;
    }));
  }
  try {
    const data={results:await searchAnime(query,controller.signal)};
    if (controller.signal.aborted || query !== elements.movieQuery.value.trim()) return;
    const results = (data.results || []).slice(0, 12);
    elements.results.replaceChildren(...results.map(createMovieButton));
    status.textContent = results.length ? 'Choisis ton anime' : 'Aucun anime trouvé. Essaie un autre titre.';
  } catch (error) {
    if (controller.signal.aborted || query !== elements.movieQuery.value.trim()) return;
    elements.results.replaceChildren();
    status.textContent = 'Recherche indisponible.';
    const retry = document.createElement('button');
    retry.type = 'button'; retry.className = 'search-retry'; retry.textContent = 'Réessayer';
    retry.addEventListener('click', () => searchMovies());
    elements.results.append(retry);
  } finally {
    if (searchController === controller) { searchController = null; setSearchBusy(false); }
  }
}

function scheduleMovieSearch() {
  window.clearTimeout(searchTimer);
  searchController?.abort();
  searchController = null;
  setSearchBusy(false);
  if (proposalSaving) return;
  clearPendingMovie();
  elements.results.replaceChildren();
  const query = elements.movieQuery.value.trim();
  document.querySelector('#clearMovieSearch').classList.toggle('hidden', !query);
  document.querySelector('#searchStatus').textContent = query.length === 1 ? 'Encore une lettre…' : '';
  if (query.length < 2) return;
  searchTimer = window.setTimeout(() => searchMovies(), 250);
}

function createMovieButton(movie) {
  const alreadyAdded = proposedMovies().some(item => sameAnime(item,movie));
  const button = document.createElement('button');
  button.className = 'movie';
  button.type = 'button';
  button.disabled = alreadyAdded;
  button.setAttribute('aria-label', alreadyAdded ? `${movie.title} · Déjà ajouté` : `Sélectionner ${movie.title}`);
  const art = document.createElement('span');
  art.className = 'movie__art';
  art.append(createPosterMedia(movieFromSearchResult(movie), 'w342'));
  const icon = document.createElement('span');
  icon.className = 'material-symbols-rounded movie__add';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = alreadyAdded ? 'check' : 'add';
  art.append(icon);
  const content = document.createElement('span');
  content.className = 'movie__content';
  const title = document.createElement('strong');
  title.textContent = movie.title;
  const meta = document.createElement('small');
  meta.textContent = alreadyAdded ? 'Déjà ajouté' : animeMetaLabel(movie) || formatYear(movie.release_date);
  content.append(title, meta);
  button.append(art, content);
  button.addEventListener('click', () => selectPendingMovie(movie));
  return button;
}

function movieFromSearchResult(movie) {
  return {
    ...animeMetadata(movie),
    key: `anime-${movie.id}`,
    catalogId: movie.id,
    title: movie.title,
    originalTitle: movie.original_title || movie.title,
    posterPath: movie.poster_path || '',
    backdropPath: movie.backdrop_path || '',
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
  elements.pendingMovieMeta.textContent = animeMetaLabel(pendingMovie);
  document.querySelector('#animeSessionField').classList.toggle('hidden',!isAnimeSeries(pendingMovie));
  const sessionInput=document.querySelector('#animeSessionEpisodes');
  sessionInput.max=pendingMovie.episodes||24;
  sessionInput.value=pendingMovie.sessionEpisodes||Math.min(3,pendingMovie.episodes||3);
  updateAnimeSession();
  renderWarningSwitches();
}

function selectPendingMovie(movie) {
  if (!canProposeMovie()) {
    setMessage(wasLastDrawnUser() ? 'Pause jusqu’au prochain tirage' : 'Limite de 10 animes atteinte');
    return;
  }
  pendingMovie = movieFromSearchResult(movie);
  const selectedMovie = pendingMovie;
  fetchMovieRuntime(selectedMovie).then((runtime) => {
    if (pendingMovie === selectedMovie && runtime) pendingMovie.runtime = runtime;
  }).catch(() => {
    // La durée sera retentée au tirage si elle n'est pas disponible ici.
  });
  pendingWarnings = new Set();
  searchController?.abort();
  elements.results.replaceChildren();
  setMessage('');
  document.querySelector('#searchStatus').textContent = '';
  document.querySelector('#pendingWarnings').open = false;
  renderPendingMovie();
  elements.confirmMovieSelection.focus({ preventScroll: true });
}

function clearPendingMovie() {
  pendingMovie = null;
  pendingWarnings = new Set();
  renderPendingMovie();
}

function updateAnimeSession() {
  if(!pendingMovie || !isAnimeSeries(pendingMovie))return;
  const input=document.querySelector('#animeSessionEpisodes');
  const count=Number(input.value);
  const valid=Number.isInteger(count)&&count>=1&&count<=Number(input.max);
  input.setCustomValidity(valid?'':'Choisis un nombre d’épisodes valide.');
  if(valid){pendingMovie.sessionEpisodes=count;pendingMovie.runtime=pendingMovie.episodeDuration?pendingMovie.episodeDuration*count:null;}
  document.querySelector('#animeSessionDuration').textContent=valid&&pendingMovie.runtime?formatRuntime(pendingMovie.runtime):'Durée à confirmer';
}
document.querySelector('#animeSessionEpisodes').addEventListener('input',updateAnimeSession);

async function proposeMovie() {
  if(pendingMovie&&isAnimeSeries(pendingMovie)&&!document.querySelector('#animeSessionEpisodes').reportValidity())return;
  const ownMovies = proposedMovies();
  if (!canProposeMovie()) {
    setMessage(wasLastDrawnUser() ? 'Pause jusqu’au prochain tirage' : 'Limite de 10 animes atteinte');
    return;
  }
  if (!pendingMovie || proposalSaving) return;
  if (ownMovies.some((movie) => movie.catalogId && movie.catalogId === pendingMovie.catalogId)) {
    setMessage('Cet anime est déjà dans ta sélection');
    return;
  }

  const triggerWarnings = triggerWarningOptions
    .filter((warning) => pendingWarnings.has(warning.id))
    .map((warning) => ({ id: warning.id, label: warning.label }));

  proposalSaving = true;
  proposalDiscovery?.setEnabled(false);
  elements.confirmMovieSelection.disabled = true;
  elements.confirmMovieSelection.setAttribute('aria-busy', 'true');
  elements.confirmMovieSelection.querySelector('span').textContent = 'Ajout…';
  elements.cancelMovieSelection.disabled = true;
  elements.movieQuery.disabled = true;
  document.querySelector('#clearMovieSearch').disabled = true;
  try {
    const movieData = {
      ...animeMetadata(pendingMovie),
      catalogId: pendingMovie.catalogId,
      title: pendingMovie.title,
      originalTitle: pendingMovie.originalTitle,
      posterPath: pendingMovie.posterPath,
      backdropPath: pendingMovie.backdropPath,
      releaseDate: pendingMovie.releaseDate,
      overview: pendingMovie.overview,
      proposedBy: currentUser.id,
      triggerWarnings,
      warningBy: currentUser.id,
      isPrimary: ownMovies.length === 0,
      createdAt: Date.now(),
    };
    const runtime = normalizeRuntimeMinutes(pendingMovie.runtime);
    if (runtime) movieData.runtime = runtime;
    // Keep the disabled confirmation in place through a double click.
    await Promise.all([
      push(ref(db, 'movies'), movieData),
      new Promise(resolve => window.setTimeout(resolve, 500)),
    ]);
    resetMovieSearch();
    clearPendingMovie();
    setMessage('Anime ajouté');
  } catch {
    setMessage('Impossible d’ajouter l’anime. Réessaie.');
  } finally {
    proposalSaving = false;
    proposalDiscovery?.setEnabled(canProposeMovie());
    elements.confirmMovieSelection.disabled = false;
    elements.confirmMovieSelection.removeAttribute('aria-busy');
    elements.confirmMovieSelection.querySelector('span').textContent = 'Ajouter à mes animes';
    elements.cancelMovieSelection.disabled = false;
    elements.movieQuery.disabled = false;
    document.querySelector('#clearMovieSearch').disabled = false;
    if (!pendingMovie) elements.movieQuery.focus({ preventScroll: true });
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
    setMessage('Impossible de supprimer l’anime');
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
    setMessage('Anime principal modifié');
  } catch {
    setMessage('Impossible de modifier l’anime principal');
  }
}

function pickDrawMovie(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function buildDrawCovers(list, selected = list[0]) {
  if (!list.length) { elements.coverStack.replaceChildren(); return { nodes: [] }; }
  const pool = list.filter(movie => movie.key !== selected?.movieKey && movie.key !== selected?.key);
  const count = Math.min(12, Math.max(6, list.length * 2));
  const width = elements.coverStack.parentElement.clientWidth;
  const cardWidth = Math.max(100, Math.min(190, width * 0.21));
  const radius = Math.round(cardWidth / (2 * Math.tan(Math.PI / count)) + 28);
  elements.coverStack.style.setProperty('--orbit-radius', radius + 'px');
  elements.coverStack.style.setProperty('--orbit-card-width', cardWidth + 'px');
  elements.coverStack.style.transform = `translateZ(-${radius}px) rotateX(-7deg) rotateY(24deg)`;
  const nodes = Array.from({ length: count }, (_, index) => {
    const movie = index === 0 ? selected : pool.length ? pool[(index - 1) % pool.length] : selected;
    const image = document.createElement('img');
    image.className = 'draw-cover';
    image.src = posterUrl(movie.posterPath, 'w342') || './image/logoanipafficon.svg';
    image.alt = '';
    image.decoding = 'async';
    image.draggable = false;
    image.style.setProperty('--orbit-angle', (360 / count * index) + 'deg');
    image.addEventListener('error', () => { image.src = './image/logoanipafficon.svg'; }, { once: true });
    return image;
  });
  elements.coverStack.replaceChildren(...nodes);
  return { nodes };
}

function animateDrawArena(nodes, duration) {
  const radius = elements.coverStack.style.getPropertyValue('--orbit-radius');
  const transform = (angle, tilt) => `translateZ(-${radius}) rotateX(${tilt}deg) rotateY(${angle}deg)`;
  const animation = elements.coverStack.animate([
    { transform: transform(24, -7) },
    { transform: transform(-1080, 0) },
  ], { duration, easing: 'cubic-bezier(0.12, 0.62, 0.08, 1)', fill: 'forwards' });
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
  elements.drawStatus.textContent = selected.isTestDraw ? 'TEST · NON ENREGISTRÉ' : 'SÉLECTIONNÉ';
  document.querySelector('#winnerLabel').textContent = selected.isTestDraw ? 'Simulation' : 'Ce soir';
  createDrawBurst();
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) navigator.vibrate?.(35);
  window.setTimeout(() => elements.drawStage.classList.remove('is-impact'), 900);
}

async function playDrawAnimation(list, selected) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = delay => new Promise(resolve => window.setTimeout(resolve, delay));
  elements.winnerCard.classList.add('hidden');
  elements.drawStage.classList.remove('has-winner', 'is-drawing', 'is-impact', 'is-suspense');
  elements.drawBurst.replaceChildren();
  elements.drawCountdown.textContent = '';
  elements.drawStage.classList.add('is-arming');
  elements.drawStatus.textContent = selected.isTestDraw ? 'SIMULATION' : 'PRÉPARATION';
  elements.drawButtonLabel.textContent = 'En cours…';
  const arena = buildDrawCovers(list, selected);
  const animations = [];
  try {
    if (reducedMotion) {
      elements.coverStack.replaceChildren();
      await wait(300);
    } else {
      await Promise.race([
        Promise.allSettled(arena.nodes.map(image => image.decode())),
        wait(700),
      ]);
      for (const count of ['3', '2', '1']) {
        setDrawCountdown(count);
        await wait(420);
      }
      elements.drawCountdown.textContent = '';
      elements.drawStage.classList.remove('is-arming');
      elements.drawStage.classList.add('is-drawing');
      elements.drawStatus.textContent = 'TIRAGE EN COURS';
      animations.push(...animateDrawArena(arena.nodes, drawAnimationDuration));
      await Promise.all(animations.map(animation => animation.finished));
      await wait(260);
      elements.drawStage.classList.add('is-suspense');
      await wait(200);
    }
    elements.coverStack.replaceChildren();
    elements.drawStage.classList.remove('is-arming', 'is-drawing', 'is-suspense');
    revealDrawWinner(selected);
    await wait(reducedMotion ? 100 : 950);
  } finally {
    animations.forEach(animation => animation.cancel());
    elements.drawCountdown.textContent = '';
    elements.drawStage.classList.remove('is-arming', 'is-drawing', 'is-suspense');
  }
}

async function drawMovie() {
  const isTestDraw = keepSelectionOnDraw;
  const forcedMovieKey = elements.drawForcedMovie.value;
  const list = buildBalancedDrawPool(forcedMovieKey, isTestDraw);
  if (!canRunDraw() || !list.length || elements.drawButton.disabled) return;
  if (forcedMovieKey && !list.some(movie => movie.key === forcedMovieKey)) {
    renderForcedDrawOptions();
    setMessage('Cet anime n’est plus disponible pour le tirage.');
    return;
  }
  drawInProgress = true;
  elements.drawButton.disabled = true;
  elements.drawKeepSelectionToggle.disabled = true;
  elements.drawForcedMovie.disabled = true;
  let completed = false;
  try {
    const forcedMovie = forcedMovieKey ? list.find((movie) => movie.key === forcedMovieKey) : null;
    const { key: movieKey, ...pickedMovie } = forcedMovie || pickDrawMovie(list);
    const selected = {
      ...pickedMovie,
      movieKey,
      drawnAt: Date.now(),
      isTestDraw,
      isForcedDraw: Boolean(forcedMovie),
      isForcedTestDraw: isTestDraw && Boolean(forcedMovie),
    };
    const runtimeRequest = fetchMovieRuntime(selected).catch(() => null);
    await playDrawAnimation(list, selected);
    const runtime = await runtimeRequest;
    if (runtime) selected.runtime = runtime;
    if (isTestDraw) {
      testDraw = selected;
      completed = true;
      return;
    }
    testDraw = null;
    const historyEntry = push(ref(db, 'draw/history'));
    const changes = {
      'draw/current': selected,
      [`draw/history/${historyEntry.key}`]: selected,
    };
    if (!isTestDraw) {
      changes['draw/lastDrawn'] = selected;
      changes[`movies/${movieKey}`] = null;
      const userMovies = proposedMovies(selected.proposedBy);
      const primary = getPrimaryMovie(userMovies);
      const replacement = userMovies.find((movie) => movie.key !== movieKey) || null;
      if (primary?.key === movieKey && replacement) changes[`movies/${replacement.key}/isPrimary`] = true;
    }
    await update(ref(db), changes);
    if (!isTestDraw) {
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
    elements.drawKeepSelectionToggle.disabled = false;
    renderForcedDrawOptions();
    elements.drawButtonLabel.textContent = 'Lancer';
    if (completed) { renderMovies(); renderDraw(); }
    else elements.drawButton.disabled = list.length === 0;
  }
}


function normalizeSearch(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr').trim();
}
function focusMovieSearch() {
  proposalDiscovery?.setMode('search');
  if (!canProposeMovie()) { setMessage('Tu ne peux pas proposer d’anime pour le moment.'); return; }
  elements.movieQuery.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
  elements.movieQuery.focus({ preventScroll: true });
}
function stepHero(direction) {
  const candidates = getSelectionPreviewMovies();
  if (draw || candidates.length < 2) return;
  selectionPreviewIndex = (selectionPreviewIndex + direction + candidates.length) % candidates.length;
  selectionPreviewMovieKey = candidates[selectionPreviewIndex].key;
  renderSelectionHero({ animate: true });
}
document.querySelector('#passwordVisibility').addEventListener('click', event => {
  const visible = elements.password.type === 'password';
  elements.password.type = visible ? 'text' : 'password';
  event.currentTarget.setAttribute('aria-pressed', String(visible));
  event.currentTarget.setAttribute('aria-label', visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe');
  event.currentTarget.firstElementChild.textContent = visible ? 'visibility_off' : 'visibility';
});
['addFilmShortcut', 'firstFilmShortcut'].forEach(id => document.getElementById(id).addEventListener('click', focusMovieSearch));
document.querySelectorAll('[data-selection-filter]').forEach(button => button.addEventListener('click', () => {
  selectionFilter = button.dataset.selectionFilter;
  document.querySelectorAll('[data-selection-filter]').forEach(item => { const on = item === button; item.classList.toggle('is-active', on); item.setAttribute('aria-pressed', String(on)); });
  renderMovies();
}));
document.querySelector('#selectionSort').addEventListener('change', event => { selectionSort = event.target.value; renderMovies(); });
document.querySelectorAll('[data-history-filter]').forEach(button => button.addEventListener('click', () => {
  historyFilter = button.dataset.historyFilter;
  document.querySelectorAll('[data-history-filter]').forEach(item => { const on = item === button; item.classList.toggle('is-active', on); item.setAttribute('aria-pressed', String(on)); });
  renderSeenMovies();
}));
document.querySelector('#historyQuery').addEventListener('input', renderSeenMovies);
document.querySelector('#heroPrevious').addEventListener('click', () => stepHero(-1));
document.querySelector('#heroNext').addEventListener('click', () => stepHero(1));
document.querySelector('#heroPause').addEventListener('click', event => {
  previewPaused = !previewPaused;
  event.currentTarget.setAttribute('aria-pressed', String(previewPaused));
  event.currentTarget.setAttribute('aria-label', previewPaused ? 'Reprendre le défilement' : 'Mettre le défilement en pause');
  event.currentTarget.firstElementChild.textContent = previewPaused ? 'play_arrow' : 'pause';
  scheduleSelectionPreview(getSelectionPreviewMovies());
});
document.querySelector('#heroDetails').addEventListener('click', () => {
  const movie = draw || getSelectionPreviewMovies().find(item => item.key === selectionPreviewMovieKey);
  if (movie) openRatingModal(movie, { allowRating: false });
});
elements.currentPick.addEventListener('focusin', event => {
  if (event.target.id !== 'heroPause' && event.target.matches(':focus-visible')) {
    previewPaused = true;
    scheduleSelectionPreview(getSelectionPreviewMovies());
  }
});
let heroTouchStart = null;
elements.currentPick.addEventListener('touchstart', event => {
  if (event.target.closest('button, a')) return;
  heroTouchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
}, { passive: true });
elements.currentPick.addEventListener('touchend', event => {
  if (!heroTouchStart) return;
  const dx = event.changedTouches[0].clientX - heroTouchStart.x;
  const dy = event.changedTouches[0].clientY - heroTouchStart.y;
  heroTouchStart = null;
  if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) stepHero(dx < 0 ? 1 : -1);
}, { passive: true });
elements.currentPick.addEventListener('touchcancel', () => { heroTouchStart = null; }, { passive: true });
elements.currentPick.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const rect = elements.currentPick.getBoundingClientRect();
  elements.currentPick.style.setProperty('--poster-turn', ((event.clientX - rect.left) / rect.width * 10 - 5) + 'deg');
  elements.currentPick.style.setProperty('--poster-lean', ((event.clientY - rect.top) / rect.height * -6 + 3) + 'deg');
});
elements.currentPick.addEventListener('pointerleave', () => {
  elements.currentPick.style.removeProperty('--poster-turn');
  elements.currentPick.style.removeProperty('--poster-lean');
});
document.addEventListener('visibilitychange', () => document.hidden ? stopSelectionPreview() : scheduleSelectionPreview(getSelectionPreviewMovies()));

elements.authForm.addEventListener('submit', handleAuth);
elements.authToggle.addEventListener('click', () => {
  authMode = authMode === 'login' ? 'register' : 'login';
  elements.authError.textContent = '';
  elements.authForm.reset();
  elements.authSubmitLabel.textContent = authMode === 'login' ? 'Se connecter' : 'Créer un compte';
  elements.authToggle.textContent = authMode === 'login' ? 'Créer un compte' : 'Se connecter';
  document.querySelector('#authHeading').textContent = authMode === 'login' ? 'Connexion' : 'Créer un compte';
  document.querySelector('#authSwitchHint').textContent = authMode === 'login' ? 'Pas de compte ?' : 'Déjà inscrit ?';
  elements.identifier.focus();
  elements.password.autocomplete = authMode === 'login' ? 'current-password' : 'new-password';
});
elements.drawKeepSelectionToggle.addEventListener('click', () => {
  setKeepSelectionOnDraw(!keepSelectionOnDraw);
});
elements.adminUserSearch.addEventListener('input', renderUsers);
document.querySelectorAll('[data-profile-section]').forEach(button => button.addEventListener('click', () => setProfileSection(button.dataset.profileSection)));
document.querySelector('#profileNavigation').addEventListener('keydown', event => {
  if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key) || !currentUser?.isAdmin) return;
  event.preventDefault();
  setProfileSection(event.key === 'Home' ? 'account' : event.key === 'End' ? 'admin' : profileSection === 'account' ? 'admin' : 'account', true);
});
document.querySelectorAll('[data-admin-role]').forEach(button => button.addEventListener('click', () => {
  adminRoleFilter = button.dataset.adminRole;
  document.querySelectorAll('[data-admin-role]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  renderUsers();
}));
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

function logoutCurrentUser() {
  stopSelectionPreview();
  clearStoredUser();
  currentUser = null;
  render();
}

elements.logoutButton.addEventListener('click', logoutCurrentUser);
elements.profileLogoutButton.addEventListener('click', logoutCurrentUser);
elements.searchForm.addEventListener('submit', searchMovies);
elements.movieQuery.addEventListener('input', scheduleMovieSearch);
document.querySelector('#clearMovieSearch').addEventListener('click', () => resetMovieSearch({ focus: true }));
elements.movieQuery.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown') {
    const first = elements.results.querySelector('button:not(:disabled)');
    if (first) { event.preventDefault(); first.focus(); }
  }
  if (event.key === 'Escape') resetMovieSearch({ focus: true });
});
elements.results.addEventListener('keydown', event => {
  const buttons = [...elements.results.querySelectorAll('button:not(:disabled)')];
  const index = buttons.indexOf(document.activeElement);
  if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
    event.preventDefault();
    const next = index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1);
    if (next < 0) elements.movieQuery.focus();
    else buttons[Math.min(next, buttons.length - 1)]?.focus();
  }
  if (event.key === 'Escape') resetMovieSearch({ focus: true });
});
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
  elements.movieQuery.focus({ preventScroll: true });
  searchMovies();
});
elements.confirmMovieSelection.addEventListener('click', proposeMovie);
elements.drawButton.addEventListener('click', drawMovie);
elements.ratingModalBackdrop.addEventListener('click', closeRatingModal);
elements.ratingModalClose.addEventListener('click', closeRatingModal);
elements.ratingModalOverviewToggle.addEventListener('click', () => {
  movieOverviewExpanded = !movieOverviewExpanded;
  renderMovieOverview(elements.ratingModalOverview.dataset.fullText, { animate: true });
});
elements.ratingModalClear.addEventListener('click', clearSeenRating);
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
  else if (request.type === 'screening') await deleteScreening(request.movie.key);
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


function setupRandomDiscovery() {
  const ownDuplicate = movie => proposedMovies().some(existing => sameAnime(existing,movie));
  const common = {
    kind: 'anime',
    loadFilters: getAnimeDiscoveryFilters,
    createArtwork: movie => createPosterMedia(movieFromSearchResult(movie),'w342'),
    describe: movie => [formatYear(movie.release_date),animeMetaLabel(movie)].filter(Boolean).join(' · '),
  };
  const discover = (filters,{signal,recent},selection) => {
    const exclude = movie => recent.includes(String(movie.id)) || (selection && ownDuplicate(movie));
    return randomAnime(filters,{signal,exclude});
  };
  proposalDiscovery = createRandomPicker({
    ...common,id:'proposalDiscovery',host:document.querySelector('.proposal-zone'),
    searchNodes:[elements.searchForm,document.querySelector('#searchStatus'),elements.results],
    discover:(filters,options)=>discover(filters,options,true),
    onRandomMode:()=>resetMovieSearch(),
    canChoose:movie=>!canProposeMovie()?'Tu ne peux pas ajouter de proposition pour le moment.':ownDuplicate(movie)?'Déjà dans tes propositions.':'',
    onChoose:movie=>selectPendingMovie(movie),
  });
  screeningDiscovery = createRandomPicker({
    ...common,id:'screeningDiscovery',host:document.querySelector('.screening-movie-picker'),
    searchNodes:[screeningUI.screeningQuery.closest('label'),screeningUI.screeningSearchStatus,screeningUI.screeningResults],
    discover:(filters,options)=>discover(filters,options,false),
    onRandomMode:()=>{window.clearTimeout(screeningSearchTimer);screeningSearchController?.abort();screeningUI.screeningQuery.value='';screeningUI.screeningResults.replaceChildren();screeningUI.screeningSearchStatus.textContent='';},
    canChoose:()=>!currentUser||screeningSaving?'Cette soirée n’est pas modifiable pour le moment.':'',
    onChoose:movie=>{screeningMovie=movieFromSearchResult(movie);screeningUI.screeningFormError.textContent='';renderScreeningSelection();screeningUI.screeningDateTime.focus({preventScroll:true});},
  });
}

setupRandomDiscovery();

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
  storedDraw = snapshot.val();
  draw = storedDraw?.isTestDraw ? (lastDrawn?.isTestDraw ? null : lastDrawn) : storedDraw;
  if (currentUser) { renderDraw(); renderAvailability(); }
  refreshDrawRuntime();
});
onValue(ref(db, 'draw/lastDrawn'), (snapshot) => {
  lastDrawn = snapshot.val();
  if (storedDraw?.isTestDraw) {
    draw = lastDrawn?.isTestDraw ? null : lastDrawn;
    if (currentUser) renderDraw();
    refreshDrawRuntime();
  }
  if (currentUser) renderMovies();
});

onValue(ref(db, 'draw/history'), (snapshot) => {
  history = snapshot.val() || {};
  if (currentUser) {
    renderSeenMovies();
    renderProfile();
  }
});

document.querySelector('#profileAvailabilityAudience').addEventListener('change', saveAvailabilityAudience);

onValue(ref(db, 'interests'), (snapshot) => {
  interests = snapshot.val() || {};
  if (!currentUser) return;
  if (selectionFilter === 'interested') renderMovies();
  refreshInterestControls();
  renderAvailability();
}, () => setMessage('Tes envies ne sont pas accessibles. Réessaie dans un instant.'));

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
