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
  results: document.querySelector('#results'),
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
  profileDetails: document.querySelector('#profileDetails'),
};

let authMode = 'login';
let memoryUser = null;
let currentUser = readStoredUser();
let movies = {};
let users = {};
let draw = null;
let lastDrawn = null;
let history = {};
let route = 'home';
let activeSeenMovie = null;
let ratedMovieKey = '';
let keepSelectionOnDraw = false;
let movieDetailsRequestId = 0;
const movieDetailsCache = new Map();

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
  route = nextRoute;
  if (route === 'draws' && !currentUser?.isAdmin) route = 'home';
  elements.views.forEach((view) => view.classList.toggle('hidden', view.dataset.view !== route));
  elements.tabs.forEach((tab) => {
    const isActive = tab.dataset.route === route;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
  setMobileMenu(false);
}

function syncRouteFromHash() {
  const nextRoute = window.location.hash.replace('#', '') || 'home';
  setRoute(['home', 'draws', 'seen', 'profile'].includes(nextRoute) ? nextRoute : 'home');
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
  return remainingMinutes ? `${hours} h ${remainingMinutes}` : `${hours} h`;
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
    if (requestId !== movieDetailsRequestId || activeSeenMovie?.key !== movie.key) return;
    renderMovieDetails(movie, details, details ? 'ready' : 'error');
  } catch {
    if (requestId !== movieDetailsRequestId || activeSeenMovie?.key !== movie.key) return;
    renderMovieDetails(movie, null, 'error');
  }
}

function renderMovies() {
  const list = movieArray().sort((a, b) => a.createdAt - b.createdAt);
  const ownMovie = proposedMovie();
  const canPropose = canProposeMovie();
  elements.drawButton.disabled = list.length === 0;
  elements.searchForm.classList.toggle('hidden', !canPropose);
  elements.message.textContent = wasLastDrawnUser() ? 'Dernier tiré au sort' : ownMovie ? 'Film proposé' : '';
  if (!list.length) {
    elements.movieList.replaceChildren(createEmptyState('Aucun film en sélection'));
    return;
  }

  elements.movieList.replaceChildren(...list.map((movie) => {
    const item = document.createElement('article');
    item.className = 'poster-card';
    const imageUrl = posterUrl(movie.posterPath);
    if (imageUrl) {
      const image = document.createElement('img');
      image.src = imageUrl;
      image.alt = '';
      item.append(image);
    } else {
      const fallback = document.createElement('div');
      fallback.className = 'poster-card__fallback';
      fallback.textContent = movie.title;
      item.append(fallback);
    }
    const meta = document.createElement('div');
    meta.className = 'poster-card__meta';
    const title = document.createElement('strong');
    title.textContent = movie.title;
    const proposedBy = document.createElement('small');
    proposedBy.textContent = movie.proposedBy;
    meta.append(title, proposedBy);
    item.append(meta);
    if (movie.proposedBy === currentUser?.id) {
      const deleteButton = document.createElement('button');
      deleteButton.className = 'poster-card__delete';
      deleteButton.type = 'button';
      deleteButton.textContent = 'Supprimer';
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
    switchButton.innerHTML = '<span class="material-symbols-rounded" aria-hidden="true">admin_panel_settings</span><span>Admin</span><span class="switch-button__track" aria-hidden="true"><span></span></span>';
    switchButton.addEventListener('click', async () => {
      const nextValue = !account.isAdmin;
      switchButton.disabled = true;
      try {
        await update(ref(db, `users/${account.id}`), { isAdmin: nextValue });
        if (account.id === currentUser.id) currentUser = { ...currentUser, isAdmin: nextValue };
      } catch {
        elements.message.textContent = 'Impossible de modifier cet utilisateur';
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
  item.tabIndex = 0;
  item.setAttribute('role', 'button');
  item.setAttribute('aria-label', `Noter ${movie.title}`);
  item.addEventListener('click', () => openRatingModal(movie));
  item.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openRatingModal(movie);
    }
  });
  const imageUrl = posterUrl(movie.posterPath);
  if (imageUrl) {
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = '';
    item.append(image);
  } else {
    const fallback = document.createElement('div');
    fallback.className = 'poster-card__fallback';
    fallback.textContent = movie.title;
    item.append(fallback);
  }

  const meta = document.createElement('div');
  meta.className = 'poster-card__meta';
  const title = document.createElement('strong');
  title.textContent = movie.title;
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
  item.append(meta);
  if (currentUser?.isAdmin) {
    const deleteButton = document.createElement('button');
    deleteButton.className = 'poster-card__delete seen-card__delete';
    deleteButton.type = 'button';
    deleteButton.innerHTML = '<span class="material-symbols-rounded" aria-hidden="true">delete</span>Supprimer';
    deleteButton.addEventListener('click', (event) => {
      event.stopPropagation();
      deleteSeenMovie(movie);
    });
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

function openRatingModal(movie) {
  activeSeenMovie = movie;
  const requestId = ++movieDetailsRequestId;
  elements.ratingModalTitle.textContent = movie.title;
  const averageRating = getAverageRating(movie);
  const ratingCount = getRatingCount(movie);
  const userRating = getUserRating(movie);
  const averageLabel = averageRating
    ? `Moyenne ${averageRating}/5 - ${ratingCount} note${ratingCount > 1 ? 's' : ''}`
    : 'Aucune note pour le moment';
  elements.ratingModalAverage.textContent = userRating
    ? `${averageLabel} - Votre note ${userRating}/5`
    : averageLabel;
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
  elements.ratingModalStars.replaceChildren(...[1, 2, 3, 4, 5].map((value) => createRatingButton(movie, value)));
  elements.ratingModalStars.classList.toggle('rating--confirmed', movie.key === ratedMovieKey && getUserRating(movie) > 0);
  elements.ratingModal.classList.remove('hidden');
}

function closeRatingModal() {
  activeSeenMovie = null;
  movieDetailsRequestId += 1;
  elements.ratingModal.classList.add('hidden');
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
    elements.message.textContent = 'Impossible d’enregistrer la note';
  }
}

async function deleteSeenMovie(movie) {
  if (!currentUser?.isAdmin || !movie?.key) return;
  if (!window.confirm(`Supprimer "${movie.title}" de l'historique ?`)) return;
  try {
    await Promise.all((movie.historyKeys?.length ? movie.historyKeys : [movie.key])
      .map((key) => remove(ref(db, `draw/history/${key}`))));
    if (activeSeenMovie?.key === movie.key) closeRatingModal();
  } catch {
    elements.message.textContent = 'Impossible de supprimer ce film de l’historique';
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
  elements.message.textContent = '';
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
    if (!results.length) elements.message.textContent = 'Aucun film trouvé';
  } catch {
    elements.message.textContent = 'Recherche impossible pour le moment';
  } finally {
    elements.searchForm.querySelector('button').disabled = false;
  }
}

function createMovieButton(movie) {
  const button = document.createElement('button');
  button.className = 'movie';
  button.type = 'button';
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
  const title = document.createElement('span');
  title.textContent = movie.title;
  button.append(title);
  button.addEventListener('click', () => proposeMovie(movie));
  return button;
}

async function proposeMovie(movie) {
  if (!canProposeMovie()) {
    elements.message.textContent = wasLastDrawnUser() ? 'Dernier tiré au sort' : 'Film déjà proposé';
    return;
  }
  try {
    await push(ref(db, 'movies'), {
      tmdbId: movie.id,
      title: movie.title,
      originalTitle: movie.original_title || movie.title,
      posterPath: movie.poster_path || '',
      releaseDate: movie.release_date || '',
      overview: movie.overview || '',
      proposedBy: currentUser.id,
      createdAt: Date.now(),
    });
    elements.results.replaceChildren();
    elements.movieQuery.value = '';
    elements.message.textContent = 'Film proposé';
  } catch {
    elements.message.textContent = 'Impossible d’ajouter le film';
  }
}

async function deleteMovie(key) {
  const movie = movies[key];
  if (!movie || movie.proposedBy !== currentUser?.id) return;
  try {
    await remove(ref(db, `movies/${key}`));
    elements.message.textContent = '';
  } catch {
    elements.message.textContent = 'Impossible de supprimer le film';
  }
}

function pickDrawMovie(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function buildDrawCovers(list, selected) {
  const covers = list.filter((movie) => movie.posterPath);
  const pool = covers.length ? covers : list;
  const count = Math.min(Math.max(pool.length * 8, 26), 44);
  const winnerIndex = Math.max(18, count - 8);
  const nodes = Array.from({ length: count }, (_, index) => {
    const movie = index === winnerIndex ? selected : pool[index % pool.length];
    const image = document.createElement('img');
    image.className = 'draw-cover';
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
    }, 5400);
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
    elements.message.textContent = 'Tirage impossible pour le moment';
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
    window.location.hash = tab.dataset.route;
    setRoute(tab.dataset.route);
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
elements.drawButton.addEventListener('click', drawMovie);
elements.ratingModalBackdrop.addEventListener('click', closeRatingModal);
elements.ratingModalClose.addEventListener('click', closeRatingModal);
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && elements.menuToggle.getAttribute('aria-expanded') === 'true') {
    setMobileMenu(false);
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
});
onValue(ref(db, 'draw/lastDrawn'), (snapshot) => {
  lastDrawn = snapshot.val();
  if (currentUser) renderMovies();
});

onValue(ref(db, 'draw/history'), (snapshot) => {
  history = snapshot.val() || {};
  if (currentUser) renderSeenMovies();
});

setKeepSelectionOnDraw(false);
syncRouteFromHash();
render();
