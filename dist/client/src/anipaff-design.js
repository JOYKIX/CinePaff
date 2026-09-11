const hero=document.querySelector('#currentPick');
if(hero){const label=document.createElement('span');label.className='anime-hero-lettering';label.lang='ja';label.setAttribute('aria-hidden','true');label.textContent='アニメ';hero.append(label);}
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const fine=window.matchMedia('(pointer: fine)');
const attached=new WeakSet();
function enhance(){
  document.querySelectorAll('.poster-card').forEach((card,index)=>{
    if(attached.has(card))return;attached.add(card);card.classList.add('anime-poster');
    card.style.setProperty('--enter-delay',Math.min(index,5)*45+'ms');
    let frame=0;
    card.addEventListener('pointermove',event=>{
      if(reduced.matches||!fine.matches)return;
      cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{const box=card.getBoundingClientRect();card.style.setProperty('--tilt-x',((event.clientY-box.top)/box.height-.5)*-5+'deg');card.style.setProperty('--tilt-y',((event.clientX-box.left)/box.width-.5)*7+'deg');});
    });
    card.addEventListener('pointerleave',()=>{cancelAnimationFrame(frame);card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg');});
  });
}
const observer=new MutationObserver(enhance);observer.observe(document.querySelector('#pageContent'),{childList:true,subtree:true});enhance();
