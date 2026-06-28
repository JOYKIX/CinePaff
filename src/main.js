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
  adminPanel: document.querySelector('#adminPanel'),
  drawButton: document.querySelector('#drawButton'),
  userList: document.querySelector('#userList'),
};

let authMode = 'login';
let currentUser = JSON.parse(localStorage.getItem('cinepaff_user'));
let movies = {};
let users = {};

function normalizeId(id) {
  return id.trim().toUpperCase();
}

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hashBuffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function movieArray() {
  return Object.entries(movies).map(([key, movie]) => ({ key, ...movie }));
}

function render() {
  elements.authPage.classList.toggle('hidden', Boolean(currentUser));
  elements.appPage.classList.toggle('hidden', !currentUser);
  if (!currentUser) return;

  elements.currentUser.textContent = currentUser.id;
  elements.adminPanel.classList.toggle('hidden', !currentUser.isAdmin);
  renderMovies();
  renderUsers();
}

function renderMovies() {
  const list = movieArray();
  elements.drawButton.disabled = list.length === 0;
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
  const list = Object.entries(users).map(([id, data]) => ({ id, ...data }));
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
      if (account.id === currentUser.id) {
        currentUser = { ...currentUser, isAdmin: checkbox.checked };
        localStorage.setItem('cinepaff_user', JSON.stringify(currentUser));
      }
    });
    label.append(checkbox, 'Admin');
    item.append(id, label);
    return item;
  }));
}

async function handleAuth(event) {
  event.preventDefault();
  elements.authError.textContent = '';
  const id = normalizeId(elements.identifier.value);
  const password = elements.password.value;
  if (!id || !password) return;

  const userRef = ref(db, `users/${id}`);
  const snapshot = await get(userRef);
  const passwordHash = await hashPassword(password);

  if (authMode === 'register') {
    if (snapshot.exists()) {
      elements.authError.textContent = 'ID déjà utilisé';
      return;
    }
    const user = { passwordHash, isAdmin: id === 'JOYKIX', createdAt: Date.now() };
    await set(userRef, user);
    currentUser = { id, isAdmin: user.isAdmin };
  } else {
    if (!snapshot.exists() || snapshot.val().passwordHash !== passwordHash) {
      elements.authError.textContent = 'ID ou MDP incorrect';
      return;
    }
    currentUser = { id, isAdmin: Boolean(snapshot.val().isAdmin) };
  }

  localStorage.setItem('cinepaff_user', JSON.stringify(currentUser));
  render();
}

async function searchMovies(event) {
  event.preventDefault();
  elements.message.textContent = '';
  if (!elements.movieQuery.value.trim()) return;
  const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(elements.movieQuery.value)}&language=fr-FR`, {
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
  if (movieArray().some((item) => item.proposedBy === currentUser.id)) {
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
  if (!list.length) return;
  await set(ref(db, 'draw/current'), { ...list[Math.floor(Math.random() * list.length)], drawnAt: Date.now() });
}

elements.authForm.addEventListener('submit', handleAuth);
elements.authToggle.addEventListener('click', () => {
  authMode = authMode === 'login' ? 'register' : 'login';
  elements.authSubmit.textContent = authMode === 'login' ? 'Connexion' : 'Créer un compte';
  elements.authToggle.textContent = authMode === 'login' ? 'Créer un compte' : 'Connexion';
  elements.password.autocomplete = authMode === 'login' ? 'current-password' : 'new-password';
});
elements.logoutButton.addEventListener('click', () => {
  localStorage.removeItem('cinepaff_user');
  currentUser = null;
  render();
});
elements.searchForm.addEventListener('submit', searchMovies);
elements.drawButton.addEventListener('click', drawMovie);

onValue(ref(db, 'movies'), (snapshot) => {
  movies = snapshot.val() || {};
  renderMovies();
});
onValue(ref(db, 'users'), (snapshot) => {
  users = snapshot.val() || {};
  renderUsers();
});
onValue(ref(db, 'draw/current'), (snapshot) => {
  const winner = snapshot.val();
  elements.winnerCard.classList.toggle('hidden', !winner);
  elements.winnerTitle.textContent = winner?.title || '';
  elements.winnerUser.textContent = winner?.proposedBy || '';
});

render();
