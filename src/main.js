import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js';
import { getDatabase, ref, get, set, push, update, onValue } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js';

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

const elements = {
  authPage: document.querySelector('#authPage'),
  appPage: document.querySelector('#appPage'),
  authForm: document.querySelector('#authForm'),
  identifier: document.querySelector('#identifier'),
  password: document.querySelector('#password'),
  authError: document.querySelector('#authError'),
  authSubmit: document.querySelector('#authSubmit'),
  authToggle: document.querySelector('#authToggle'),
  currentUser: document.querySelector('#currentUser'),
  logoutButton: document.querySelector('#logoutButton'),
  searchForm: document.querySelector('#searchForm'),
  movieQuery: document.querySelector('#movieQuery'),
  message: document.querySelector('#message'),
  results: document.querySelector('#results'),
  movieList: document.querySelector('#movieList'),
  winnerCard: document.querySelector('#winnerCard'),
  winnerTitle: document.querySelector('#winnerTitle'),
  winnerUser: document.querySelector('#winnerUser'),
  tabs: document.querySelectorAll('.tab'),
  adminTabs: document.querySelectorAll('.admin-only'),
  views: document.querySelectorAll('.view'),
  adminPanel: document.querySelector('#adminPanel'),
  usersPanel: document.querySelector('#usersPanel'),
  drawButton: document.querySelector('#drawButton'),
  userList: document.querySelector('#userList'),
  historyList: document.querySelector('#historyList'),
  profileDetails: document.querySelector('#profileDetails'),
};

let authMode = 'login';
let memoryUser = null;
let currentUser = readStoredUser();
let movies = {};
let users = {};
let draw = null;
let history = {};
let route = 'home';

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

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('cinepaff_user'));
  } catch {
    return memoryUser;
  }
}

function storeCurrentUser() {
  try {
    localStorage.setItem('cinepaff_user', JSON.stringify(currentUser));
  } catch {
    memoryUser = currentUser;
  }
}

function clearStoredUser() {
  memoryUser = null;
  try {
    localStorage.removeItem('cinepaff_user');
  } catch {
    // Ignore storage errors so logout still works.
  }
}

function goHome() {
  route = 'home';
  if (window.location.hash === '#home') {
    setRoute('home');
    return;
  }
  window.location.hash = 'home';
}

async function passwordMatches(password, account) {
  if (account.passwordSalt && account.passwordHash) {
    const passwordData = await hashPassword(password, hexToBytes(account.passwordSalt));
    return passwordData.hash === account.passwordHash;
  }

  const legacyHash = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  return bytesToHex(new Uint8Array(legacyHash)) === account.passwordHash;
}


function setRoute(nextRoute) {
  route = nextRoute;
  if (route === 'draws' && !currentUser?.isAdmin) route = 'home';
  elements.views.forEach((view) => view.classList.toggle('hidden', view.dataset.view !== route));
  elements.tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.route === route));
}

function syncRouteFromHash() {
  const nextRoute = window.location.hash.replace('#', '') || 'home';
  setRoute(['home', 'draws', 'history', 'profile'].includes(nextRoute) ? nextRoute : 'home');
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

function render() {
  elements.authPage.classList.toggle('hidden', Boolean(currentUser));
  elements.appPage.classList.toggle('hidden', !currentUser);
  if (!currentUser) return;

  currentUser.isAdmin = Boolean(users[currentUser.id]?.isAdmin ?? currentUser.isAdmin);
  storeCurrentUser();
  elements.currentUser.textContent = currentUser.id;
  elements.adminTabs.forEach((tab) => tab.classList.toggle('hidden', !currentUser.isAdmin));
  syncRouteFromHash();
  renderMovies();
  renderUsers();
  renderDraw();
  renderHistory();
  renderProfile();
}

function renderMovies() {
  const list = movieArray().sort((a, b) => a.createdAt - b.createdAt);
  const ownMovie = proposedMovie();
  elements.drawButton.disabled = list.length === 0;
  elements.searchForm.classList.toggle('hidden', Boolean(ownMovie));
  elements.message.textContent = ownMovie ? 'Film proposé' : '';
  elements.movieList.replaceChildren(...list.map((movie) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    const title = document.createElement('span');
    title.textContent = movie.title;
    const proposedBy = document.createElement('small');
    proposedBy.textContent = movie.proposedBy;
    item.append(title, proposedBy);
    return item;
  }));
}

function renderUsers() {
  const list = Object.entries(users).map(([id, data]) => ({ id, ...data })).sort((a, b) => a.id.localeCompare(b.id));
  elements.userList.replaceChildren(...list.map((account) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    const id = document.createElement('span');
    id.textContent = account.id;
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = Boolean(account.isAdmin);
    checkbox.addEventListener('change', async () => {
      await update(ref(db, `users/${account.id}`), { isAdmin: checkbox.checked });
      if (account.id === currentUser.id) currentUser = { ...currentUser, isAdmin: checkbox.checked };
    });
    label.append(checkbox, 'Admin');
    item.append(id, label);
    return item;
  }));
}

function renderDraw() {
  elements.winnerCard.classList.toggle('hidden', !draw);
  elements.winnerTitle.textContent = draw?.title || '';
  elements.winnerUser.textContent = draw?.proposedBy || '';
}

function renderHistory() {
  const list = Object.entries(history)
    .map(([key, movie]) => ({ key, ...movie }))
    .sort((a, b) => (b.drawnAt || 0) - (a.drawnAt || 0));
  elements.historyList.replaceChildren(...list.map((movie) => createMetaItem(movie.title, formatDate(movie.drawnAt))));
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
  if (!id || !password) return;

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
}

async function searchMovies(event) {
  event.preventDefault();
  elements.message.textContent = '';
  elements.results.replaceChildren();
  const query = elements.movieQuery.value.trim();
  if (!query) return;
  const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=fr-FR`, {
    headers: { Authorization: `Bearer ${tmdbToken}`, accept: 'application/json' },
  });
  const data = await response.json();
  elements.results.replaceChildren(...(data.results || []).slice(0, 8).map(createMovieButton));
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
  }
  const title = document.createElement('span');
  title.textContent = movie.title;
  button.append(title);
  button.addEventListener('click', () => proposeMovie(movie));
  return button;
}

async function proposeMovie(movie) {
  if (proposedMovie()) {
    elements.message.textContent = 'Film déjà proposé';
    return;
  }
  await push(ref(db, 'movies'), {
    tmdbId: movie.id,
    title: movie.title,
    posterPath: movie.poster_path || '',
    releaseDate: movie.release_date || '',
    proposedBy: currentUser.id,
    createdAt: Date.now(),
  });
  elements.results.replaceChildren();
  elements.movieQuery.value = '';
  elements.message.textContent = 'Film proposé';
}

async function drawMovie() {
  const list = movieArray();
  if (!currentUser?.isAdmin || !list.length) return;
  const selected = { ...list[Math.floor(Math.random() * list.length)], drawnAt: Date.now() };
  await set(ref(db, 'draw/current'), selected);
  await push(ref(db, 'draw/history'), selected);
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
elements.tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    window.location.hash = tab.dataset.route;
    setRoute(tab.dataset.route);
  });
});
window.addEventListener('hashchange', syncRouteFromHash);

elements.logoutButton.addEventListener('click', () => {
  clearStoredUser();
  currentUser = null;
  render();
});
elements.searchForm.addEventListener('submit', searchMovies);
elements.drawButton.addEventListener('click', drawMovie);

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
onValue(ref(db, 'draw/history'), (snapshot) => {
  history = snapshot.val() || {};
  if (currentUser) renderHistory();
});

syncRouteFromHash();
render();
