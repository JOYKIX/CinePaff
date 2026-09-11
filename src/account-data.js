import { get, ref, update } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js';

// Accounts are shared. Contributions stay in their original club when an ID changes.
export function accountChanges(data, oldId, nextId = null) {
  const account = data.users?.[oldId];
  if (!account) throw new Error('Compte introuvable');
  if (nextId && data.users?.[nextId]) throw new Error('Cet ID est déjà utilisé');
  const changes = { ['users/' + oldId]: null };
  if (nextId) changes['users/' + nextId] = { ...account, profileUpdatedAt: Date.now() };
  const moveMapEntry = (path, value) => {
    if (value?.[oldId] === undefined) return;
    changes[path + '/' + oldId] = null;
    if (nextId) changes[path + '/' + nextId] = value[oldId];
  };
  for (const [prefix, club] of [['', data], ['anipaff/', data.anipaff || {}]]) {
    moveMapEntry(prefix + 'availability', club.availability);
    for (const [key, choices] of Object.entries(club.interests || {})) moveMapEntry(prefix + 'interests/' + key, choices);
    const content = (path, media, proposal = false) => {
      if (!media) return;
      if (!nextId && proposal && media.proposedBy === oldId) { changes[path] = null; return; }
      if (media.proposedBy === oldId) changes[path + '/proposedBy'] = nextId || 'COMPTE SUPPRIMÉ';
      if (media.warningBy === oldId) changes[path + '/warningBy'] = nextId;
      for (const field of ['ratings', 'comments', 'seenBy']) moveMapEntry(path + '/' + field, media[field]);
    };
    for (const [key, media] of Object.entries(club.movies || {})) content(prefix + 'movies/' + key, media, true);
    for (const key of ['current', 'lastDrawn']) content(prefix + 'draw/' + key, club.draw?.[key]);
    for (const [key, media] of Object.entries(club.draw?.history || {})) content(prefix + 'draw/history/' + key, media);
    for (const [key, screening] of Object.entries(club.screenings || {})) {
      if (screening.createdBy === oldId) changes[prefix + 'screenings/' + key + '/createdBy'] = nextId || 'COMPTE SUPPRIMÉ';
    }
  }
  const remaining = Object.entries(data.users || {}).filter(([id]) => id !== oldId).sort(([,a],[,b]) => (a.createdAt || 0) - (b.createdAt || 0));
  if (!nextId && account.isAdmin && remaining.length && !remaining.some(([,user]) => user.isAdmin)) {
    changes['users/' + remaining[0][0] + '/isAdmin'] = true;
    changes['users/' + remaining[0][0] + '/role'] = null;
  }
  return changes;
}

export async function changeSharedAccount(db, oldId, nextId = null) {
  const data = (await get(ref(db))).val() || {};
  await update(ref(db), accountChanges(data, oldId, nextId));
}
