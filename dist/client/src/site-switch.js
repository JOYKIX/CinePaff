const anime=document.documentElement.dataset.app==='anipaff';
function createSwitch(){
  const link=document.createElement('a');
  link.className='site-switch';
  const target=anime?'CinePaff':'AniPaff';
  link.href=anime?'./index.html':'./anipaff.html';
  link.setAttribute('aria-label','Passer sur '+target);
  link.title='Passer sur '+target;
  const icon=document.createElement('span');icon.className='material-symbols-rounded';icon.setAttribute('aria-hidden','true');icon.textContent='swap_horiz';
  const label=document.createElement('span');label.textContent=target;
  link.append(icon,label);
  return link;
}
const brand=document.querySelector('.app-brand');
if(brand){const group=document.createElement('div');group.className='club-brand-group';brand.before(group);group.append(brand,createSwitch());}
const authBrand=document.querySelector('.auth-brand');
if(authBrand)authBrand.append(createSwitch());
// Profile/session changes in the other club are reflected when returning to this tab.
window.addEventListener('storage',event=>{if(event.key==='cinepaff_user')window.location.reload();});
