// Club interests are independent; profile visibility belongs to the shared account.
export const availabilityAudiences = ['both', 'cinepaff', 'anipaff', 'none'];
export function availabilityAudience(account) {
  return availabilityAudiences.includes(account?.availabilityAudience) ? account.availabilityAudience : 'both';
}
export function mediaInterestKey(media) {
  const id = media?.catalogId ? 'anime-' + media.catalogId : media?.tmdbId ? 'film-' + media.tmdbId : 'proposal-' + (media?.movieKey || media?.key || '');
  return id.replace(/[.#$\[\]\/\u0000-\u001f\u007f]/g, '_');
}
export function mediaInterest(interests, media, userId) {
  return media && userId ? interests?.[mediaInterestKey(media)]?.[userId] ?? null : null;
}
export function participatesInAvailability(account, club, interest = null) {
  if (!account) return false;
  const audience = availabilityAudience(account);
  return (audience === 'both' || audience === club) && interest !== -1;
}
