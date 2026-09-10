import * as firebase from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js';

// Every club operation goes through this boundary, including multipath updates.
// Only the account registry is shared with CinePaff.
export function createAniPaffDatabase(db) {
  const roots = new WeakSet();
  const pathFor = path => path === 'users' || path.startsWith('users/') ? path : 'anipaff/' + path;
  function ref(database, path = '') {
    const result = firebase.ref(database, path ? pathFor(path) : 'anipaff');
    if (!path) roots.add(result);
    return result;
  }
  function update(reference, changes) {
    if (!roots.has(reference)) return firebase.update(reference, changes);
    return firebase.update(firebase.ref(db), Object.fromEntries(Object.entries(changes).map(([path,value]) => [pathFor(path),value])));
  }
  return { ref, update };
}
