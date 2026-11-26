const DATA={
  bbq:{title:'Korean Table BBQ',origin:'A lively Korean dining tradition',kicker:'Smoke, sear, share',description:'Thin cuts of marinated meat, seafood, and vegetables arrive raw and are grilled together at the center of your table. The experience is social, hands-on, and paced one sizzling bite at a time.',price:'$37.99',note:'per adult · BBQ only',image:'assets/optimized/menu-bbq-1600.avif',items:[['Angus Ribeye','Beef · grilled center','ribeye'],['Marinated Short Rib','Beef · grilled edge','short-rib'],['Pork Belly','Pork · grilled center','pork-belly'],['Chili Chicken','Chicken · grilled edge','chili-chicken'],['King Mushroom','Vegetable · grilled edge','king-mushroom'],['Garlic Mussels','Seafood · grilled center','garlic-mussels']]},
  hotpot:{title:'Chinese Hotpot',origin:'A communal Chinese comfort ritual',kicker:'Dip, simmer, discover',description:'A fragrant shared broth stays bubbling at the center of the table while thinly sliced meats, seafood, tofu, noodles, and vegetables are cooked to order. Every guest builds each bite and dipping sauce to their own taste.',price:'$37.99',note:'per adult · Hotpot only',image:'assets/optimized/menu-hotpot-1600.avif',items:[['Sliced Beef Belly','Meat · 15 sec','beef-belly'],['Sweet Shrimp','Seafood · 3 min','sweet-shrimp'],['Fried Tofu Puffs','Soybean · 2 min','tofu-puffs'],['Udon Noodle','Noodle · 5 min','udon'],['Enoki Mushroom','Vegetable · 2 min','enoki'],['Lobster Ball','Other · 3 min','lobster-ball']]}
};
let currentMode='bbq',selected=[],touchDrag=null,scrollTick=false;
const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
const clamp=n=>Math.min(1,Math.max(0,n));
const smooth=n=>{n=clamp(n);return n*n*(3-2*n)};
const segment=(p,a,b)=>smooth((p-a)/(b-a));

function setMode(mode){
  currentMode=mode;selected=[];const d=DATA[mode];
  $$('.toggle button').forEach(b=>{const on=b.dataset.mode===mode;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1});
  $('#builder-kicker').textContent=d.kicker;$('#builder-title').textContent=d.title;$('#cuisine-origin').textContent=d.origin;$('#builder-description').textContent=d.description;$('#builder-price').textContent=d.price;$('#builder-note').textContent=d.note;$('#menu-board').ariaLabel=`Open full ${d.title} menu`;$('#drop-zone').classList.toggle('hotpot',mode==='hotpot');$('#drop-label').textContent=mode==='hotpot'?'Fill the pot':'Fire up the grill';renderIngredients();renderSelected();
}
function dishPicture(slug,name){return `<picture><source type="image/avif" srcset="assets/optimized/dishes/${slug}.avif"><img src="assets/optimized/dishes/${slug}.webp" width="320" height="232" loading="lazy" decoding="async" alt="${name}"></picture>`}
function renderIngredients(){
  const d=DATA[currentMode];
  $('#ingredient-list').innerHTML=d.items.map((it,i)=>`<button type="button" class="ingredient" draggable="true" data-index="${i}" aria-pressed="false">${dishPicture(it[2],it[0])}<span><b>${it[0]}</b><small>${it[1]}</small></span><i aria-hidden="true">+</i></button>`).join('');
  $$('.ingredient').forEach(el=>{el.addEventListener('click',e=>{if(el.dataset.justDragged!=='true')addItem(+el.dataset.index)});el.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',el.dataset.index));el.addEventListener('pointerdown',startTouchDrag)});
}
function addItem(i){if(!Number.isInteger(i)||selected.includes(i)||selected.length>=5)return;selected.push(i);renderSelected()}
function renderSelected(){
  const d=DATA[currentMode];
  $('#chosen-chips').innerHTML=selected.map(i=>`<button type="button" data-index="${i}" aria-label="Remove ${d.items[i][0]}">${d.items[i][0]} ×</button>`).join('');
  $('#selected-count').textContent=`${selected.length} / 5 selected`;
  $$('.ingredient').forEach(el=>{const on=selected.includes(+el.dataset.index);el.classList.toggle('selected',on);el.setAttribute('aria-pressed',String(on))});
  $$('#chosen-chips button').forEach(el=>el.onclick=()=>{selected=selected.filter(i=>i!==+el.dataset.index);renderSelected()});
}
function startTouchDrag(e){
  if(e.pointerType==='mouse')return;const el=e.currentTarget;touchDrag={el,index:+el.dataset.index,startX:e.clientX,startY:e.clientY,moved:false,ghost:null,target:null};el.addEventListener('pointermove',moveTouchDrag);el.addEventListener('pointerup',endTouchDrag,{once:true});el.addEventListener('pointercancel',endTouchDrag,{once:true});try{el.setPointerCapture(e.pointerId)}catch{}
}
function moveTouchDrag(e){
  if(!touchDrag)return;const dx=e.clientX-touchDrag.startX,dy=e.clientY-touchDrag.startY;if(!touchDrag.moved&&Math.hypot(dx,dy)<10)return;
  touchDrag.moved=true;e.preventDefault();if(!touchDrag.ghost){touchDrag.ghost=touchDrag.el.cloneNode(true);touchDrag.ghost.removeAttribute('id');Object.assign(touchDrag.ghost.style,{position:'fixed',zIndex:'100',width:'260px',pointerEvents:'none',opacity:'.92',boxShadow:'0 20px 50px rgba(0,0,0,.45)',background:'#211616',border:'1px solid #CE8946',borderRadius:'8px'});touchDrag.target=document.createElement('div');touchDrag.target.className='touch-drop-target';touchDrag.target.innerHTML='<span>+</span><b>Drop to add</b>';document.body.append(touchDrag.target,touchDrag.ghost)}
  touchDrag.ghost.style.left=`${Math.min(innerWidth-270,Math.max(10,e.clientX-130))}px`;touchDrag.ghost.style.top=`${Math.max(10,e.clientY-45)}px`;const over=document.elementFromPoint(e.clientX,e.clientY)?.closest('#drop-zone,.touch-drop-target');$('#drop-zone').classList.toggle('drag-over',!!over);touchDrag.target?.classList.toggle('drag-over',!!over);
}
function endTouchDrag(e){
  if(!touchDrag)return;const {el,index,moved,ghost,target}=touchDrag;if(moved){el.dataset.justDragged='true';setTimeout(()=>delete el.dataset.justDragged,0);if(document.elementFromPoint(e.clientX,e.clientY)?.closest('#drop-zone,.touch-drop-target'))addItem(index)}ghost?.remove();target?.remove();$('#drop-zone').classList.remove('drag-over');el.removeEventListener('pointermove',moveTouchDrag);touchDrag=null;
}

$$('.toggle button').forEach(b=>{b.addEventListener('click',()=>setMode(b.dataset.mode));b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const next=b.parentElement.querySelector(`[data-mode="${b.dataset.mode==='bbq'?'hotpot':'bbq'}"]`);setMode(next.dataset.mode);next.focus()})});
const drop=$('#drop-zone');['dragenter','dragover'].forEach(n=>drop.addEventListener(n,e=>{e.preventDefault();drop.classList.add('drag-over')}));['dragleave','drop'].forEach(n=>drop.addEventListener(n,e=>{e.preventDefault();drop.classList.remove('drag-over')}));drop.addEventListener('drop',e=>addItem(Number(e.dataTransfer.getData('text/plain'))));$('#clear-selection').onclick=()=>{selected=[];renderSelected()};

const menuModal=$('#menu-modal');$('#menu-board').onclick=()=>{$('#modal-menu-image').src=DATA[currentMode].image;$('#modal-menu-image').alt=`Full ${DATA[currentMode].title} menu`;menuModal.showModal()};
$$('.modal-close').forEach(b=>b.onclick=()=>b.closest('dialog').close());$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close()}));
const contact=$('#contact-modal');function openContact(kind){$('#modal-kicker').textContent=kind==='gather'?'Plan a gathering':'Reserve your table';$('#modal-title').textContent=kind==='gather'?'Make room for everyone.':'Come gather around.';contact.showModal()}$$('.reserve-open').forEach(b=>b.onclick=()=>openContact('reserve'));$$('.gather-open').forEach(b=>b.onclick=()=>openContact('gather'));
$('form',contact).onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),subject=encodeURIComponent(`${$('#modal-kicker').textContent}: ${f.get('name')}`),body=encodeURIComponent(`Name: ${f.get('name')}\nEmail: ${f.get('email')}\nDate: ${f.get('date')}\nGuests: ${f.get('guests')}\nNotes: ${f.get('note')||'None'}`);$('.form-status',contact).textContent='Opening your email app to send this request…';location.href=`mailto:hello@volcanoalbany.com?subject=${subject}&body=${body}`};

const nav=$('.site-header nav'),menuBtn=$('.menu-button');menuBtn.onclick=()=>{const open=nav.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open));menuBtn.setAttribute('aria-label',open?'Close navigation':'Open navigation')};$$('.site-header nav a').forEach(a=>a.onclick=()=>{nav.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');menuBtn.setAttribute('aria-label','Open navigation')});
const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');io.unobserve(entry.target)}}),{threshold:.12});$$('.reveal').forEach(el=>io.observe(el));

function renderScroll(){
  $('.site-header').classList.toggle('scrolled',scrollY>40);const story=$('.bar-story'),sticky=$('.bar-sticky'),book=$('.drink-book'),rect=story.getBoundingClientRect(),travel=Math.max(1,story.offsetHeight-innerHeight),p=clamp(-rect.top/travel);
  sticky.style.setProperty('--bar-progress',p.toFixed(4));const intro=1-segment(p,.03,.22),rise=segment(p,.06,.42),open=segment(p,.34,.78),exit=segment(p,.9,1);
  sticky.style.setProperty('--intro-opacity',intro.toFixed(4));sticky.style.setProperty('--intro-y',`${(1-intro)*-28}px`);book.style.setProperty('--book-opacity',String(1-exit*.55));book.style.setProperty('--book-y',`${(1-rise)*24+exit*-4}vh`);book.style.setProperty('--book-tilt',`${(1-rise)*52}deg`);book.style.setProperty('--book-scale',String(.72+rise*.28-exit*.04));book.style.setProperty('--book-clip',`${(1-open)*50}%`);book.style.setProperty('--book-x',`${(1-open)*-25}%`);book.style.setProperty('--pages-opacity','1');book.style.setProperty('--cover-angle',`${open*-178}deg`);
  const sign=$('.hanging-sign'),sr=sign.getBoundingClientRect(),sp=segment(clamp((innerHeight-sr.top)/(innerHeight*.82)),0,1);sign.style.setProperty('--sign',sp.toFixed(4));scrollTick=false;
}
function onScroll(){if(!scrollTick){scrollTick=true;requestAnimationFrame(renderScroll)}}addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll,{passive:true});
renderScroll();setMode('bbq');
