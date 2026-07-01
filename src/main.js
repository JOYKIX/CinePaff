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
  authToggle: document.querySelector('#authToggle'),
  currentUser: document.querySelector('#currentUser'),
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
  winnerCard: document.querySelector('#winnerCard'),
  winnerTitle: document.querySelector('#winnerTitle'),
  winnerUser: document.querySelector('#winnerUser'),
  winnerPoster: document.querySelector('#winnerPoster'),
  drawStage: document.querySelector('#drawStage'),
  coverStack: document.querySelector('#coverStack'),
  tabs: document.querySelectorAll('.tab'),
  adminTabs: document.querySelectorAll('.admin-only'),
  views: document.querySelectorAll('.view'),
  adminPanel: document.querySelector('#adminPanel'),
  profileAdminTools: document.querySelector('#profileAdminTools'),
  adminUserSearch: document.querySelector('#adminUserSearch'),
  drawButton: document.querySelector('#drawButton'),
  drawKeepSelectionToggle: document.querySelector('#drawKeepSelectionToggle'),
  drawMarker: document.querySelector('.draw-marker'),
  userList: document.querySelector('#userList'),
  seenList: document.querySelector('#seenList'),
  ratingModal: document.querySelector('#ratingModal'),
  ratingModalBackdrop: document.querySelector('#ratingModalBackdrop'),
  ratingModalClose: document.querySelector('#ratingModalClose'),
  ratingModalTitle: document.querySelector('#ratingModalTitle'),
  ratingModalFacts: document.querySelector('#ratingModalFacts'),
  ratingModalOverview: document.querySelector('#ratingModalOverview'),
  ratingModalCredits: document.querySelector('#ratingModalCredits'),
  ratingModalImdb: document.querySelector('#ratingModalImdb'),
  ratingModalAverage: document.querySelector('#ratingModalAverage'),
  ratingModalPoster: document.querySelector('#ratingModalPoster'),
  ratingModalStars: document.querySelector('#ratingModalStars'),
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
  deleteHistoryText: document.querySelector('#deleteHistoryText'),
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
  availabilityRecommendations: document.querySelector('#availabilityRecommendations'),
  availabilityCalendar: document.querySelector('#availabilityCalendar'),
  profileDetails: document.querySelector('#profileDetails'),
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
let pendingHistoryDeleteMovie = null;
let availabilityMode = 'weekly';
let availabilitySelectedDays = new Set([(new Date().getDay() + 6) % 7]);
let availabilityAllDay = false;
let drawRuntimeMinutes = null;
let drawRuntimeKey = '';
const drawAnimationDuration = 5800;
const movieDetailsCache = new Map();
const availabilityStepMinutes = 30;
const availabilityHorizonDays = 14;
const defaultMovieRuntimeMinutes = 120;
const routeConfig = {
  home: { label: 'Accueil' },
  draws: { label: 'Tirages', adminOnly: true },
  seen: { label: 'Films vus' },
  availability: { label: 'Dispos' },
  profile: { label: 'Profil' },
};
const routeNames = Object.keys(routeConfig);
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
  elements.message.textContent = text;
  elements.message.classList.toggle('is-visible', Boolean(text));
}

function setProposalStatus(text = '') {
  elements.proposalStatus.textContent = text;
}

function renderProposalPreview(movie) {
  elements.proposalPreview.replaceChildren();
  elements.proposalPreview.classList.toggle('hidden', !movie);
  if (!movie) return;

  const media = document.createElement('div');
  media.className = 'proposal-preview__poster';
  media.append(createPosterMedia(movie, 'w185'));

  const meta = document.createElement('span');
  meta.className = 'meta';
  const title = document.createElement('strong');
  title.textContent = movie.title;
  const detail = document.createElement('small');
  detail.textContent = [movie.proposedBy, formatYear(movie.releaseDate)].filter(Boolean).join(' · ');
  meta.append(title, detail);

  const deleteButton = document.createElement('button');
  deleteButton.className = 'proposal-preview__delete';
  deleteButton.type = 'button';
  deleteButton.setAttribute('aria-label', `Supprimer ${movie.title}`);
  deleteButton.append(createIcon('delete'));
  deleteButton.addEventListener('click', () => deleteMovie(movie.key));

  elements.proposalPreview.append(media, meta, deleteButton);
}

function syncModalLock() {
  const hasOpenModal = [elements.ratingModal, elements.warningModal, elements.deleteHistoryModal]
    .some((modal) => modal && !modal.classList.contains('hidden'));
  document.body.classList.toggle('modal-lock', hasOpenModal);
}

function showModal(modal) {
  modal.classList.remove('hidden');
  syncModalLock();
}

function hideModal(modal) {
  modal.classList.add('hidden');
  syncModalLock();
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
  fallback.textContent = movie?.title || 'Grand Paff';
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


function setRoute(nextRoute) {
  const requestedRoute = routeConfig[nextRoute] ? nextRoute : 'home';
  route = requestedRoute;
  if (routeConfig[route]?.adminOnly && !currentUser?.isAdmin) route = 'home';
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
  document.title = `Grand Paff - ${routeConfig[route].label}`;
  setMobileMenu(false);
}

function syncRouteFromHash() {
  const nextRoute = window.location.hash.replace('#', '') || 'home';
  setRoute(routeNames.includes(nextRoute) ? nextRoute : 'home');
}

function formatDate(timestamp) {
  if (!timestamp) return '';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(timestamp);
}

function createMetaItem(title, detail = '') {
  const item = document.createElement('div');
  item.className = 'list-item';
  const meta = document.createElement('span');
  meta.className = 'meta';
  const strong = document.createElement('strong');
  strong.textContent = title;
  meta.append(strong);
  if (detail) {
    const small = document.createElement('small');
    small.textContent = detail;
    meta.append(small);
  }
  item.append(meta);
  return item;
}

function movieArray() {
  return Object.entries(movies).map(([key, movie]) => ({ key, ...movie }));
}

function proposedMovie() {
  return movieArray().find((movie) => movie.proposedBy === currentUser?.id);
}

function wasLastDrawnUser() {
  return lastDrawn?.proposedBy === currentUser?.id;
}

function canProposeMovie() {
  return !wasLastDrawnUser() && !proposedMovie();
}

function render() {
  elements.authPage.classList.toggle('hidden', Boolean(currentUser));
  elements.appPage.classList.toggle('hidden', !currentUser);
  document.body.classList.toggle('is-authenticated', Boolean(currentUser));
  if (!currentUser) return;

  currentUser.isAdmin = Boolean(users[currentUser.id]?.isAdmin ?? currentUser.isAdmin);
  storeCurrentUser();
  elements.currentUser.textContent = currentUser.id;
  elements.adminTabs.forEach((tab) => tab.classList.toggle('hidden', !currentUser.isAdmin));
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
  const list = movieArray().sort((a, b) => {
    const ownA = a.proposedBy === currentUser?.id;
    const ownB = b.proposedBy === currentUser?.id;
    if (ownA !== ownB) return ownA ? -1 : 1;
    return (a.createdAt || 0) - (b.createdAt || 0);
  });
  const ownMovie = proposedMovie();
  const canPropose = canProposeMovie();
  elements.drawButton.disabled = list.length === 0;
  elements.searchForm.classList.toggle('hidden', !canPropose);
  if (!canPropose && pendingMovie) clearPendingMovie();
  setProposalStatus(wasLastDrawnUser() ? 'Dernier tiré au sort' : ownMovie ? 'Film proposé' : '');
  renderProposalPreview(ownMovie);
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
    if (movie.proposedBy === currentUser?.id) {
      const deleteButton = document.createElement('button');
      deleteButton.className = 'poster-card__delete';
      deleteButton.type = 'button';
      deleteButton.append(createIcon('delete'), 'Supprimer');
      deleteButton.addEventListener('click', () => deleteMovie(movie.key));
      item.append(deleteButton);
    }
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

  elements.userList.replaceChildren(...list.map((account) => {
    const item = document.createElement('div');
    item.className = 'list-item admin-user-item';
    const meta = document.createElement('span');
    meta.className = 'meta';
    const id = document.createElement('strong');
    id.textContent = account.id;
    const role = document.createElement('small');
    role.textContent = account.isAdmin ? 'Admin' : 'Utilisateur';
    meta.append(id, role);

    const switchButton = document.createElement('button');
    switchButton.className = 'switch-button switch-button--compact';
    switchButton.type = 'button';
    switchButton.setAttribute('aria-pressed', account.isAdmin ? 'true' : 'false');
    switchButton.setAttribute('aria-label', `${account.isAdmin ? 'Retirer' : 'Ajouter'} ${account.id} admin`);
    switchButton.classList.toggle('is-on', Boolean(account.isAdmin));
    const switchTrack = document.createElement('span');
    switchTrack.className = 'switch-button__track';
    switchTrack.ariaHidden = 'true';
    switchTrack.append(document.createElement('span'));
    switchButton.append(createIcon('admin_panel_settings'), 'Admin', switchTrack);
    switchButton.addEventListener('click', async () => {
      const nextValue = !account.isAdmin;
      switchButton.disabled = true;
      try {
        await update(ref(db, `users/${account.id}`), { isAdmin: nextValue });
        if (account.id === currentUser.id) currentUser = { ...currentUser, isAdmin: nextValue };
      } catch {
        setMessage('Impossible de modifier cet utilisateur');
      } finally {
        switchButton.disabled = false;
      }
    });
    item.append(meta, switchButton);
    return item;
  }));
}

function renderDraw() {
  elements.winnerCard.classList.toggle('hidden', !draw);
  elements.drawStage.classList.toggle('has-winner', Boolean(draw));
  elements.drawMarker.classList.toggle('draw-marker--hidden', Boolean(draw));
  elements.winnerTitle.textContent = draw?.title || '';
  elements.winnerUser.textContent = draw?.proposedBy || '';
  elements.winnerPoster.replaceChildren();
  const imageUrl = posterUrl(draw?.posterPath, 'w500');
  if (imageUrl) {
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = '';
    elements.winnerPoster.append(image);
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
  return movie.tmdbId || `${movie.title}-${movie.posterPath}`;
}

function normalizeSeenMovie(historyKey, movie) {
  const { key: movieKey = '', ratings = {}, ...movieData } = movie;
  return {
    ...movieData,
    key: historyKey,
    movieKey,
    historyKeys: [historyKey],
    ratings: { ...ratings },
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
    });
  });

  return [...grouped.values()].sort((a, b) => (b.drawnAt || 0) - (a.drawnAt || 0));
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
    deleteButton.append(createIcon('delete'), 'Supprimer');
    deleteButton.addEventListener('click', () => openDeleteHistoryModal(movie));
    item.append(deleteButton);
  }
  return item;
}

function renderSeenMovies() {
  const list = seenMovieArray();
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
  if (allowRating) {
    const averageRating = getAverageRating(movie);
    const ratingCount = getRatingCount(movie);
    const userRating = getUserRating(movie);
    const averageLabel = averageRating
      ? `Moyenne ${averageRating}/5 - ${ratingCount} note${ratingCount > 1 ? 's' : ''}`
      : 'Aucune note pour le moment';
    elements.ratingModalAverage.textContent = userRating
      ? `${averageLabel} - Votre note ${userRating}/5`
      : averageLabel;
  } else {
    elements.ratingModalAverage.textContent = movie.proposedBy ? `Proposé par ${movie.proposedBy}` : '';
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

function openDeleteHistoryModal(movie) {
  if (!currentUser?.isAdmin || !movie?.key) return;
  pendingHistoryDeleteMovie = movie;
  elements.deleteHistoryText.textContent = `Supprimer "${movie.title}" de l'historique ? Cette action retirera aussi ses notes.`;
  showModal(elements.deleteHistoryModal);
}

function closeDeleteHistoryModal() {
  pendingHistoryDeleteMovie = null;
  hideModal(elements.deleteHistoryModal);
  elements.deleteHistoryConfirm.disabled = false;
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

async function deleteSeenMovie(movie) {
  if (!currentUser?.isAdmin || !movie?.key) return;
  try {
    await Promise.all((movie.historyKeys?.length ? movie.historyKeys : [movie.key])
      .map((key) => remove(ref(db, `draw/history/${key}`))));
    if (activeSeenMovie?.key === movie.key) closeRatingModal();
    closeDeleteHistoryModal();
  } catch {
    setMessage('Impossible de supprimer ce film de l’historique');
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
  if (!entries.length) {
    elements.availabilityList.replaceChildren(createEmptyState('Aucune disponibilité enregistrée'));
    return;
  }

  elements.availabilityList.replaceChildren(...entries.map((entry) => {
    const item = document.createElement('div');
    item.className = 'availability-list-item';
    const meta = document.createElement('span');
    meta.className = 'meta';
    const title = document.createElement('strong');
    title.textContent = entry.type === 'date' ? 'Jour précis' : 'Récurrent';
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
    item.append(meta, deleteButton);
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

function renderAvailabilityRecommendations() {
  const slots = calculateAvailabilitySlots().slice(0, 5);
  elements.availabilityRuntime.textContent = getDrawRuntimeLabel();
  if (!slots.length) {
    elements.availabilityRecommendations.replaceChildren(createEmptyState('Aucun créneau commun trouvé pour le moment'));
    return;
  }

  elements.availabilityRecommendations.replaceChildren(...slots.map((slot, index) => {
    const item = document.createElement('article');
    item.className = `availability-recommendation${index === 0 ? ' availability-recommendation--best' : ''}`;
    const count = document.createElement('strong');
    count.textContent = `${slot.userIds.length} personne${slot.userIds.length > 1 ? 's' : ''}`;
    const time = document.createElement('span');
    time.textContent = formatSlotRange(slot.start, slot.end);
    const names = document.createElement('small');
    names.textContent = slot.userIds.join(', ');
    item.append(count, time, names);
    return item;
  }));
}

function renderAvailabilityCalendar() {
  const today = new Date(startOfDay(new Date()));
  const intervalsByUser = buildAvailabilityIntervals();
  const cards = Array.from({ length: availabilityHorizonDays }, (_, offset) => {
    const date = addDays(today, offset);
    const dayStart = startOfDay(date);
    const card = document.createElement('article');
    card.className = 'availability-day-card';
    const head = document.createElement('div');
    head.className = 'availability-day-card__head';
    const title = document.createElement('strong');
    title.textContent = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: '2-digit' }).format(date);
    const maxCount = document.createElement('small');
    const segments = Array.from({ length: 12 }, (_, index) => {
      const midpoint = dayStart + (((index * 120) + 60) * 60 * 1000);
      return [...intervalsByUser.values()]
        .filter((intervals) => intervals.some((interval) => interval.start <= midpoint && interval.end >= midpoint)).length;
    });
    const peak = Math.max(0, ...segments);
    maxCount.textContent = peak ? `${peak} max` : 'vide';
    head.append(title, maxCount);

    const timeline = document.createElement('div');
    timeline.className = 'availability-timeline';
    const maxUsers = Math.max(1, Object.keys(users).length, intervalsByUser.size);
    timeline.replaceChildren(...segments.map((count) => {
      const segment = document.createElement('span');
      segment.style.setProperty('--level', String(count / maxUsers));
      segment.title = `${count} disponible${count > 1 ? 's' : ''}`;
      return segment;
    }));
    card.append(head, timeline);
    return card;
  });
  elements.availabilityCalendar.replaceChildren(...cards);
}

function renderAvailability() {
  if (!currentUser) return;
  setAvailabilityMode(availabilityMode);
  setAvailabilityAllDay(availabilityAllDay);
  renderAvailabilityList();
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

  await push(ref(db, `availability/${currentUser.id}`), entry);
  setMessage('Disponibilité ajoutée');
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
  const role = currentUser?.isAdmin ? 'Admin' : 'Utilisateur';
  elements.profileDetails.replaceChildren(createMetaItem(currentUser.id, role));
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
      currentUser = { id, isAdmin: user.isAdmin };
    } else {
      if (!snapshot.exists() || !(await passwordMatches(password, snapshot.val()))) {
        elements.authError.textContent = 'ID ou MDP incorrect';
        return;
      }
      currentUser = { id, isAdmin: Boolean(snapshot.val().isAdmin) };
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

async function searchMovies(event) {
  event.preventDefault();
  setMessage('');
  elements.results.replaceChildren();
  const query = elements.movieQuery.value.trim();
  if (!query) return;
  elements.searchForm.querySelector('button').disabled = true;
  try {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=fr-FR`, {
      headers: { Authorization: `Bearer ${tmdbToken}`, accept: 'application/json' },
    });
    if (!response.ok) throw new Error('Search failed');
    const data = await response.json();
    const results = (data.results || []).slice(0, 8);
    elements.results.replaceChildren(...results.map(createMovieButton));
    if (!results.length) setMessage('Aucun film trouvé');
  } catch {
    setMessage('Recherche impossible pour le moment');
  } finally {
    elements.searchForm.querySelector('button').disabled = false;
  }
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
    setMessage(wasLastDrawnUser() ? 'Dernier tiré au sort' : 'Film déjà proposé');
    return;
  }
  pendingMovie = movieFromSearchResult(movie);
  pendingWarnings = new Set();
  setMessage('Choisis les warnings puis valide le film');
  renderPendingMovie();
}

function clearPendingMovie() {
  pendingMovie = null;
  pendingWarnings = new Set();
  renderPendingMovie();
}

async function proposeMovie() {
  if (!canProposeMovie()) {
    setMessage(wasLastDrawnUser() ? 'Dernier tiré au sort' : 'Film déjà proposé');
    return;
  }
  if (!pendingMovie) return;

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
      createdAt: Date.now(),
    });
    elements.results.replaceChildren();
    elements.movieQuery.value = '';
    clearPendingMovie();
    setMessage('Film proposé');
  } catch {
    setMessage('Impossible d’ajouter le film');
  }
}

async function deleteMovie(key) {
  const movie = movies[key];
  if (!movie || movie.proposedBy !== currentUser?.id) return;
  try {
    await remove(ref(db, `movies/${key}`));
    setMessage('');
  } catch {
    setMessage('Impossible de supprimer le film');
  }
}

function pickDrawMovie(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function buildDrawCovers(list, selected) {
  const covers = list.filter((movie) => movie.posterPath);
  const pool = covers.length ? covers : list;
  const count = Math.min(Math.max(pool.length * 10, 30), 52);
  const winnerIndex = Math.max(22, count - 9);
  const nodes = Array.from({ length: count }, (_, index) => {
    const movie = index === winnerIndex ? selected : pool[index % pool.length];
    const image = document.createElement('img');
    image.className = `draw-cover${index === winnerIndex ? ' draw-cover--winner' : ''}`;
    image.src = posterUrl(movie.posterPath, 'w342') || './image/Logo.png';
    image.alt = '';
    return image;
  });
  elements.coverStack.replaceChildren(...nodes);

  const stageWidth = elements.drawStage.clientWidth;
  const winnerNode = nodes[winnerIndex];
  const winnerCenter = winnerNode.offsetLeft + (winnerNode.offsetWidth / 2);
  const stopOffset = (stageWidth / 2) - winnerCenter;
  elements.coverStack.style.setProperty('--track-start', `${stageWidth}px`);
  elements.coverStack.style.setProperty('--track-end', `${stopOffset}px`);
}

function playDrawAnimation(list, selected) {
  buildDrawCovers(list, selected);
  elements.winnerCard.classList.add('hidden');
  elements.drawStage.classList.remove('has-winner');
  elements.drawMarker.classList.remove('draw-marker--hidden');
  elements.drawStage.classList.remove('is-drawing');
  void elements.drawStage.offsetWidth;
  elements.drawStage.classList.add('is-drawing');
  return new Promise((resolve) => {
    window.setTimeout(() => {
      elements.drawStage.classList.remove('is-drawing');
      elements.coverStack.replaceChildren();
      elements.coverStack.style.removeProperty('--track-start');
      elements.coverStack.style.removeProperty('--track-end');
      resolve();
    }, drawAnimationDuration);
  });
}

async function drawMovie() {
  const list = movieArray();
  if (!currentUser?.isAdmin || !list.length || elements.drawButton.disabled) return;
  elements.drawButton.disabled = true;
  let completed = false;
  try {
    const { key: movieKey, ...pickedMovie } = pickDrawMovie(list);
    const selected = { ...pickedMovie, movieKey, drawnAt: Date.now(), isTestDraw: keepSelectionOnDraw };
    await playDrawAnimation(list, selected);
    await set(ref(db, 'draw/current'), selected);
    await push(ref(db, 'draw/history'), selected);
    if (!keepSelectionOnDraw) {
      await set(ref(db, 'draw/lastDrawn'), selected);
      await remove(ref(db, 'movies'));
    }
    completed = true;
  } catch {
    setMessage('Tirage impossible pour le moment');
  } finally {
    elements.drawButton.disabled = (!keepSelectionOnDraw && completed) || movieArray().length === 0;
  }
}

elements.authForm.addEventListener('submit', handleAuth);
elements.authToggle.addEventListener('click', () => {
  authMode = authMode === 'login' ? 'register' : 'login';
  elements.authError.textContent = '';
  elements.authForm.reset();
  elements.authSubmit.textContent = authMode === 'login' ? 'Connexion' : 'Créer un compte';
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
window.addEventListener('hashchange', syncRouteFromHash);

elements.logoutButton.addEventListener('click', () => {
  setMobileMenu(false);
  clearStoredUser();
  currentUser = null;
  render();
});
elements.searchForm.addEventListener('submit', searchMovies);
elements.availabilityForm.addEventListener('submit', handleAvailabilitySubmit);
elements.availabilityRecurringMode.addEventListener('click', () => setAvailabilityMode('weekly'));
elements.availabilityDateMode.addEventListener('click', () => setAvailabilityMode('date'));
elements.availabilityAllDay.addEventListener('click', () => setAvailabilityAllDay(!availabilityAllDay));
elements.cancelMovieSelection.addEventListener('click', () => {
  clearPendingMovie();
  setMessage('');
});
elements.confirmMovieSelection.addEventListener('click', proposeMovie);
elements.drawButton.addEventListener('click', drawMovie);
elements.ratingModalBackdrop.addEventListener('click', closeRatingModal);
elements.ratingModalClose.addEventListener('click', closeRatingModal);
elements.warningModalBackdrop.addEventListener('click', closeWarningModal);
elements.warningModalClose.addEventListener('click', closeWarningModal);
elements.deleteHistoryBackdrop.addEventListener('click', closeDeleteHistoryModal);
elements.deleteHistoryClose.addEventListener('click', closeDeleteHistoryModal);
elements.deleteHistoryCancel.addEventListener('click', closeDeleteHistoryModal);
elements.deleteHistoryConfirm.addEventListener('click', async () => {
  if (!pendingHistoryDeleteMovie) return;
  const movie = pendingHistoryDeleteMovie;
  elements.deleteHistoryConfirm.disabled = true;
  await deleteSeenMovie(movie);
  if (!elements.deleteHistoryModal.classList.contains('hidden')) {
    elements.deleteHistoryConfirm.disabled = false;
  }
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && elements.menuToggle.getAttribute('aria-expanded') === 'true') {
    setMobileMenu(false);
    return;
  }
  if (event.key === 'Escape' && !elements.deleteHistoryModal.classList.contains('hidden')) {
    closeDeleteHistoryModal();
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
  if (currentUser) renderMovies();
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
  if (currentUser) renderSeenMovies();
});

onValue(ref(db, 'availability'), (snapshot) => {
  availability = snapshot.val() || {};
  if (currentUser) renderAvailability();
});

elements.availabilityDate.value = toDateKey(new Date());
setAvailabilityMode('weekly');
setAvailabilityAllDay(false);
setKeepSelectionOnDraw(false);
syncRouteFromHash();
render();
