/* E level skin and four real tools; reuses approved embedded beta sprites. */
(function(){
  'use strict';
  const game=document.getElementById('game');
  if(!game||game.dataset.levelV2)return;
  game.dataset.levelV2='1';
  const mk=(tag,cls,html)=>{const el=document.createElement(tag);el.className=cls;if(html!==undefined)el.innerHTML=html;return el;};
  const bar=game.querySelector('.gbar'),back=document.getElementById('backBtn'),lv=document.getElementById('lvName');
  const goals=document.getElementById('goals'),moves=game.querySelector('.moves'),frame=game.querySelector('.frame');
  const tools=game.querySelector('.boosters'),hint=document.getElementById('hint');
  const header=mk('div','level-head');
  const logo=mk('div','logo-plank','<span>Бабушкина<br>дача 2.0</span>');
  const ribbon=mk('div','level-ribbon');
  ribbon.appendChild(lv);header.append(back,logo,ribbon);
  const panel=mk('div','goals-panel');
  panel.append(mk('div','goals-label','Собрать:'),goals,moves);
  const cast=mk('div','level-cast');
  const art=window.BETA_ART||{};
  const castImage=(key,cls,name)=>{
    const img=mk('img','cast-img '+cls);
    img.alt=name;img.loading='eager';img.draggable=false;
    if(art[key])img.src=art[key];else img.hidden=true;
    return img;
  };
  cast.append(
    castImage('murka-sit','cat','Муся'),
    castImage('marina-stand','mar','Бабушка Марина'),
    mk('div','cast-talk','Собери все овощи<br>и убери сорняки!'),
    castImage('sharik-sit','dog','Доня')
  );
  if(bar)bar.remove();
  game.prepend(header,panel);
  game.append(frame,cast,tools,hint);
  /* Keep the legacy IDs and listeners attached to the original nodes. */
  const hammer=document.getElementById('hammerBtn'),shuffle=document.getElementById('shuffleBtn');
  hammer.innerHTML='<span class="tool-symbol" aria-hidden="true">🪏</span><span class="tool-name">Лопата</span><span class="tool-count" id="hammerN"></span>';
  shuffle.innerHTML='<span class="tool-symbol" aria-hidden="true">🧺</span><span class="tool-name">Корзина</span><span class="tool-count" id="shuffleN"></span>';
  hammer.setAttribute('aria-label','Лопата: убрать одну фишку');
  shuffle.setAttribute('aria-label','Корзина: перемешать овощи, не сдвигая препятствия');
  const water=mk('button','bst','<span class="tool-symbol" aria-hidden="true">🚿</span><span class="tool-name">Лейка</span><span class="tool-count" id="wateringN"></span>');
  water.id='wateringBtn';water.type='button';water.setAttribute('aria-label','Лейка: убрать ряд овощей');
  const pruner=mk('button','bst','<span class="tool-symbol" aria-hidden="true">✂️</span><span class="tool-name">Секатор</span><span class="tool-count" id="prunerN"></span>');
  pruner.id='prunerBtn';pruner.type='button';pruner.setAttribute('aria-label','Секатор: убрать сорняк или ящик');
  tools.prepend(water);tools.insertBefore(pruner,shuffle);
  if(!Number.isFinite(S.boost.watering))S.boost.watering=3;
  if(!Number.isFinite(S.boost.pruner))S.boost.pruner=3;
  save();
  const baseBoosters=updateBoosters;
  updateBoosters=function(){
    baseBoosters();
    document.getElementById('wateringN').textContent=String(S.boost.watering);
    document.getElementById('prunerN').textContent=String(S.boost.pruner);
    document.getElementById('hammerN').textContent=String(S.boost.hammer);
    document.getElementById('shuffleN').textContent=String(S.boost.shuffle);
    water.classList.toggle('active',!!(G&&G.mode==='watering'));
    pruner.classList.toggle('active',!!(G&&G.mode==='pruner'));
  };
  const baseGoals=renderGoals;
  renderGoals=function(){
    baseGoals();
    for(const g of goals.children)g.setAttribute('aria-label','Осталось: '+g.textContent.trim());
  };
  function choose(kind){
    if(!G||G.busy)return;
    if(S.boost[kind]<=0){toast('Инструмент закончился');return;}
    G.mode=G.mode===kind?null:kind;G.sel=null;renderBoard();updateBoosters();
    hint.textContent=G.mode===kind?(kind==='watering'?'Коснитесь любого овоща нужного ряда':'Коснитесь сорняка или ящика'):levelHint();
  }
  water.onclick=()=>choose('watering');
  pruner.onclick=()=>choose('pruner');
  const baseTap=onTap;
  onTap=async function(pos){
    if(!G||G.busy)return;
    const mode=G.mode;
    if(mode!=='watering'&&mode!=='pruner')return baseTap(pos);
    const [r,c]=pos,t=G.board[r]&&G.board[r][c],idx=r*N+c;
    if(!t)return;
    if(mode==='pruner'&&!G.weeds.has(idx)&&!(isBox(t)&&!t.kind)){
      toast('Выберите сорняк или обычный ящик');return;
    }
    if(S.boost[mode]<=0){G.mode=null;updateBoosters();return;}
    G.mode=null;G.sel=null;G.busy=true;S.boost[mode]--;save();updateBoosters();resetHint();
    if(mode==='watering'){
      await clearCells(new Set(G.board[r].map((_,x)=>r*N+x)),[]);
      await cascade(null);
    }else if(G.weeds.has(idx)){
      G.weeds.delete(idx);
      if(G.goals.weed>0)G.goals.weed--;
      const weed=weedEls.get(idx);
      if(weed){weed.classList.add('gone');setTimeout(()=>weed.remove(),330);weedEls.delete(idx);}
      renderGoals();
    }else{
      /* Directly remove a normal crate while preserving standard goal accounting. */
      t.hp=1;
      await clearCells(new Set([idx]),[]);
      await cascade(null);
    }
    return finishTurn();
  };
  updateBoosters();
})();
