import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js';
import { getDatabase, ref, get, set, push, update, remove, onValue, onChildAdded } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js';

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
  winnerPoster: document.querySelector('#winnerPoster'),
  drawStage: document.querySelector('#drawStage'),
  coverStack: document.querySelector('#coverStack'),
  tabs: document.querySelectorAll('.tab'),
  adminTabs: document.querySelectorAll('.admin-only'),
  views: document.querySelectorAll('.view'),
  adminPanel: document.querySelector('#adminPanel'),
  usersPanel: document.querySelector('#usersPanel'),
  drawButton: document.querySelector('#drawButton'),
  userList: document.querySelector('#userList'),
  historyList: document.querySelector('#historyList'),
  profileDetails: document.querySelector('#profileDetails'),
  cinemaActions: document.querySelectorAll('.cinema-actions'),
  cinemaShares: document.querySelector('#cinemaShares'),
  startCinemaButton: document.querySelector('#startCinemaButton'),
  stopCinemaButton: document.querySelector('#stopCinemaButton'),
  cinemaScreen: document.querySelector('#cinemaScreen'),
  cinemaVideo: document.querySelector('#cinemaVideo'),
  fullscreenCinemaButton: document.querySelector('#fullscreenCinemaButton'),
  cinemaMessage: document.querySelector('#cinemaMessage'),
};

let authMode = 'login';
let memoryUser = null;
let currentUser = readStoredUser();
let movies = {};
let users = {};
let draw = null;
let history = {};
let route = 'home';
let cinema = {};
let cinemaSessionKey = null;
let cinemaStream = null;
let cinemaPeer = null;
let cinemaPeers = new Map();
let cinemaAnswerUnsubscribe = null;
let cinemaRemoteCandidateUnsubscribe = null;
let cinemaOfferUnsubscribe = null;
let cinemaViewerAnswerKey = null;
let cinemaConnectionRole = null;
let cinemaJoinedSessionKey = null;

const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

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
  setRoute(['home', 'draws', 'cinema', 'history', 'profile'].includes(nextRoute) ? nextRoute : 'home');
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

function canProposeMovie() {
  return currentUser?.isAdmin || !proposedMovie();
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
  renderCinema();
}

function posterUrl(path, size = 'w342') {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : '';
}

function renderMovies() {
  const list = movieArray().sort((a, b) => a.createdAt - b.createdAt);
  const ownMovie = proposedMovie();
  const canPropose = canProposeMovie();
  elements.drawButton.disabled = list.length === 0;
  elements.searchForm.classList.toggle('hidden', !canPropose);
  elements.message.textContent = ownMovie && !currentUser?.isAdmin ? 'Film proposé' : '';
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
  elements.winnerPoster.replaceChildren();
  const imageUrl = posterUrl(draw?.posterPath, 'w500');
  if (imageUrl) {
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = '';
    elements.winnerPoster.append(image);
  }
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


function setCinemaMessage(message = '') {
  elements.cinemaMessage.textContent = message;
}

function resetCinemaVideo() {
  elements.cinemaVideo.pause();
  elements.cinemaVideo.srcObject = null;
  elements.cinemaVideo.removeAttribute('src');
  elements.cinemaVideo.load();
  elements.fullscreenCinemaButton.disabled = true;
}

function setCinemaStream(stream) {
  elements.cinemaVideo.srcObject = stream;
  elements.cinemaVideo.muted = cinemaConnectionRole === 'admin';
  elements.cinemaVideo.play().catch(() => {
    // Ignore autoplay restrictions; the stream remains attached to the video element.
  });
  elements.fullscreenCinemaButton.disabled = false;
}

function closeCinemaPeer() {
  const joinedSessionKey = cinemaJoinedSessionKey;
  const viewerAnswerKey = cinemaViewerAnswerKey;
  if (cinemaAnswerUnsubscribe) cinemaAnswerUnsubscribe();
  if (cinemaRemoteCandidateUnsubscribe) cinemaRemoteCandidateUnsubscribe();
  if (cinemaOfferUnsubscribe) cinemaOfferUnsubscribe();
  cinemaPeers.forEach(({ peer, unsubscribeCandidates, unsubscribeAnswer }) => {
    if (unsubscribeCandidates) unsubscribeCandidates();
    if (unsubscribeAnswer) unsubscribeAnswer();
    peer.close();
  });
  cinemaPeers = new Map();
  cinemaAnswerUnsubscribe = null;
  cinemaRemoteCandidateUnsubscribe = null;
  cinemaOfferUnsubscribe = null;
  if (cinemaPeer) cinemaPeer.close();
  cinemaPeer = null;
  cinemaViewerAnswerKey = null;
  cinemaConnectionRole = null;
  cinemaJoinedSessionKey = null;
  if (joinedSessionKey && viewerAnswerKey) {
    remove(ref(db, `cinema/sessions/${joinedSessionKey}/answers/${viewerAnswerKey}`));
    remove(ref(db, `cinema/sessions/${joinedSessionKey}/offers/${viewerAnswerKey}`));
    remove(ref(db, `cinema/sessions/${joinedSessionKey}/candidates/${viewerAnswerKey}`));
  }
}

function stopLocalCinemaStream() {
  if (!cinemaStream) return;
  cinemaStream.getTracks().forEach((track) => track.stop());
  cinemaStream = null;
}

function renderCinema() {
  const isSharing = Boolean(cinemaStream);
  const sessions = activeCinemaSessions();
  elements.startCinemaButton.disabled = isSharing;
  elements.stopCinemaButton.disabled = !isSharing;
  elements.cinemaShares.replaceChildren(...sessions.map(createCinemaShareItem));
  if (!sessions.length && !isSharing) {
    resetCinemaVideo();
    setCinemaMessage('');
  }
}

async function flushPendingIceCandidates(peer) {
  if (!peer?.remoteDescription || !peer.pendingIceCandidates?.length) return;
  const pendingCandidates = peer.pendingIceCandidates.splice(0);
  await Promise.all(pendingCandidates.map((candidate) => addIceCandidate(peer, candidate)));
}

async function addIceCandidate(peer, candidate) {
  if (!peer || !candidate) return;
  if (!peer.remoteDescription) {
    peer.pendingIceCandidates = peer.pendingIceCandidates || [];
    peer.pendingIceCandidates.push(candidate);
    return;
  }
  try {
    await peer.addIceCandidate(new RTCIceCandidate(candidate));
  } catch {
    // Ignore candidates that arrive after a closed connection.
  }
}

function watchRemoteCandidates(path, peer) {
  const candidatesRef = ref(db, path);
  return onChildAdded(candidatesRef, (snapshot) => addIceCandidate(peer, snapshot.val()));
}

function createCinemaPeer(localCandidatePath) {
  const peer = new RTCPeerConnection(rtcConfig);
  peer.pendingIceCandidates = [];
  peer.addEventListener('icecandidate', (event) => {
    if (event.candidate) push(ref(db, localCandidatePath), event.candidate.toJSON());
  });
  peer.addEventListener('track', (event) => {
    const [stream] = event.streams;
    if (stream) setCinemaStream(stream);
  });
  return peer;
}

function activeCinemaSessions() {
  return Object.entries(cinema || {})
    .map(([key, session]) => ({ key, ...session }))
    .filter((session) => session.active)
    .sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0));
}

function createCinemaShareItem(session) {
  const item = createMetaItem(session.startedBy || '', formatDate(session.startedAt));
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = cinemaConnectionRole === 'viewer' && cinemaJoinedSessionKey === session.key ? 'Connecté' : 'Rejoindre';
  button.disabled = Boolean(cinemaStream) || session.key === cinemaSessionKey || (cinemaConnectionRole === 'viewer' && cinemaJoinedSessionKey === session.key);
  button.addEventListener('click', () => joinCinema(session.key));
  item.append(button);
  return item;
}

async function startCinemaShare() {
  if (!currentUser || cinemaStream) return;
  setCinemaMessage('');
  try {
    cinemaStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: {
        autoGainControl: false,
        echoCancellation: false,
        noiseSuppression: false,
      },
      systemAudio: 'include',
      windowAudio: 'system',
    });
  } catch {
    setCinemaMessage('Partage annulé');
    return;
  }

  closeCinemaPeer();
  cinemaConnectionRole = 'admin';
  cinemaSessionKey = push(ref(db, 'cinema/sessions')).key;
  await set(ref(db, `cinema/sessions/${cinemaSessionKey}`), { active: true, startedAt: Date.now(), startedBy: currentUser.id });

  setCinemaStream(cinemaStream);
  cinemaStream.getVideoTracks()[0]?.addEventListener('ended', stopCinemaShare);
  watchCinemaAnswers(cinemaSessionKey);
  renderCinema();
}

async function stopCinemaShare() {
  const sessionKey = cinemaSessionKey;
  closeCinemaPeer();
  stopLocalCinemaStream();
  resetCinemaVideo();
  if (sessionKey) await remove(ref(db, `cinema/sessions/${sessionKey}`));
  cinemaSessionKey = null;
  renderCinema();
}

async function prepareCinemaOffer(sessionKey, answerKey) {
  if (!cinemaStream || !sessionKey || !answerKey) return;
  const existing = cinemaPeers.get(answerKey);
  if (existing) return;
  cinemaConnectionRole = 'admin';
  const peer = createCinemaPeer(`cinema/sessions/${sessionKey}/candidates/${answerKey}/admin`);
  cinemaStream.getTracks().forEach((track) => peer.addTrack(track, cinemaStream));
  const unsubscribeCandidates = watchRemoteCandidates(`cinema/sessions/${sessionKey}/candidates/${answerKey}/viewer`, peer);
  const unsubscribeAnswer = onValue(ref(db, `cinema/sessions/${sessionKey}/answers/${answerKey}/description`), async (snapshot) => {
    const answer = snapshot.val();
    if (answer && peer.signalingState === 'have-local-offer') {
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
      await flushPendingIceCandidates(peer);
    }
  });
  cinemaPeers.set(answerKey, { peer, unsubscribeCandidates, unsubscribeAnswer });
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  await set(ref(db, `cinema/sessions/${sessionKey}/offers/${answerKey}`), offer.toJSON());
}

function watchCinemaAnswers(sessionKey) {
  if (cinemaAnswerUnsubscribe) cinemaAnswerUnsubscribe();
  const answersRef = ref(db, `cinema/sessions/${sessionKey}/answers`);
  cinemaAnswerUnsubscribe = onChildAdded(answersRef, async (snapshot) => {
    await prepareCinemaOffer(sessionKey, snapshot.key);
  });
}

async function joinCinema(sessionKey) {
  if (!currentUser || !sessionKey || (cinemaConnectionRole === 'viewer' && cinemaJoinedSessionKey === sessionKey)) return;
  closeCinemaPeer();
  cinemaConnectionRole = 'viewer';
  cinemaJoinedSessionKey = sessionKey;
  const answerKey = push(ref(db, `cinema/sessions/${sessionKey}/answers`)).key;
  cinemaViewerAnswerKey = answerKey;
  cinemaPeer = createCinemaPeer(`cinema/sessions/${sessionKey}/candidates/${answerKey}/viewer`);
  cinemaRemoteCandidateUnsubscribe = watchRemoteCandidates(`cinema/sessions/${sessionKey}/candidates/${answerKey}/admin`, cinemaPeer);
  await set(ref(db, `cinema/sessions/${sessionKey}/answers/${answerKey}`), { requestedAt: Date.now(), userId: currentUser.id });
  cinemaOfferUnsubscribe = onValue(ref(db, `cinema/sessions/${sessionKey}/offers/${answerKey}`), async (snapshot) => {
    const offer = snapshot.val();
    if (!offer || !cinemaPeer || cinemaPeer.currentRemoteDescription) return;
    await cinemaPeer.setRemoteDescription(new RTCSessionDescription(offer));
    await flushPendingIceCandidates(cinemaPeer);
    const answer = await cinemaPeer.createAnswer();
    await cinemaPeer.setLocalDescription(answer);
    await set(ref(db, `cinema/sessions/${sessionKey}/answers/${answerKey}/description`), answer.toJSON());
  });
}

function handleCinemaState() {
  if (cinemaStream && cinemaSessionKey && cinema[cinemaSessionKey]) {
    watchCinemaAnswers(cinemaSessionKey);
  }
  if (cinemaConnectionRole === 'viewer' && cinemaJoinedSessionKey && !cinema[cinemaJoinedSessionKey]) {
    closeCinemaPeer();
    resetCinemaVideo();
  }
  renderCinema();
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
  if (!canProposeMovie()) {
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

async function deleteMovie(key) {
  const movie = movies[key];
  if (!movie || movie.proposedBy !== currentUser?.id) return;
  await remove(ref(db, `movies/${key}`));
  elements.message.textContent = '';
}

function buildDrawCovers(list) {
  const covers = list.filter((movie) => movie.posterPath);
  const pool = covers.length ? covers : list;
  const count = Math.min(Math.max(pool.length * 2, 8), 18);
  const nodes = Array.from({ length: count }, (_, index) => {
    const movie = pool[index % pool.length];
    const image = document.createElement('img');
    image.className = 'draw-cover';
    image.src = posterUrl(movie.posterPath, 'w342') || './image/Logo.png';
    image.alt = '';
    image.style.setProperty('--angle', `${(360 / count) * index}deg`);
    image.style.setProperty('--radius', `${170 + (index % 3) * 34}px`);
    image.style.setProperty('--delay', `${index * 42}ms`);
    return image;
  });
  elements.coverStack.replaceChildren(...nodes);
}

function playDrawAnimation(list) {
  buildDrawCovers(list);
  elements.winnerCard.classList.add('hidden');
  elements.drawStage.classList.remove('is-drawing');
  void elements.drawStage.offsetWidth;
  elements.drawStage.classList.add('is-drawing');
  return new Promise((resolve) => {
    window.setTimeout(() => {
      elements.drawStage.classList.remove('is-drawing');
      elements.coverStack.replaceChildren();
      resolve();
    }, 1900);
  });
}

async function drawMovie() {
  const list = movieArray();
  if (!currentUser?.isAdmin || !list.length || elements.drawButton.disabled) return;
  elements.drawButton.disabled = true;
  await playDrawAnimation(list);
  const selected = { ...list[Math.floor(Math.random() * list.length)], drawnAt: Date.now() };
  await set(ref(db, 'draw/current'), selected);
  await push(ref(db, 'draw/history'), selected);
  await remove(ref(db, 'movies'));
  elements.drawButton.disabled = false;
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
  const sessionKey = cinemaSessionKey;
  clearStoredUser();
  closeCinemaPeer();
  stopLocalCinemaStream();
  if (sessionKey) remove(ref(db, `cinema/sessions/${sessionKey}`));
  resetCinemaVideo();
  currentUser = null;
  render();
});
elements.searchForm.addEventListener('submit', searchMovies);
elements.drawButton.addEventListener('click', drawMovie);
elements.startCinemaButton.addEventListener('click', startCinemaShare);
elements.stopCinemaButton.addEventListener('click', stopCinemaShare);
elements.fullscreenCinemaButton.addEventListener('click', () => {
  if (elements.cinemaScreen.requestFullscreen) elements.cinemaScreen.requestFullscreen();
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
onValue(ref(db, 'draw/history'), (snapshot) => {
  history = snapshot.val() || {};
  if (currentUser) renderHistory();
});
onValue(ref(db, 'cinema/sessions'), (snapshot) => {
  cinema = snapshot.val() || {};
  if (currentUser) handleCinemaState();
});

syncRouteFromHash();
render();
