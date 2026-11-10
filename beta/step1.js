/* Бабушкина дача 2.0: STEP 1 ONLY. Isolated beta logic, not live VK/OK/TG. */
(function(){
  'use strict';
  const ORIGINAL={genBoard,gravity,clearCells,look,startLevel,renderGoals,finishTurn,onTap};
  const marker=(kind)=>kind==='lock'
    ? '<svg viewBox="0 0 64 64" width="1em" height="1em"><defs><linearGradient id="goldLock" x2="1" y2="1"><stop stop-color="#FFF4BA"/><stop offset=".55" stop-color="#E9B441"/><stop offset="1" stop-color="#9E672A"/></linearGradient></defs><path d="M20 28V22a12 12 0 0 1 24 0v9" stroke="#B6C4CC" stroke-width="8" fill="none"/><path d="M20 28V22a12 12 0 0 1 24 0v9" stroke="#FAFBFC" stroke-width="2" fill="none"/><rect x="12" y="27" width="40" height="30" rx="7" fill="url(#goldLock)" stroke="#875123" stroke-width="2"/><circle cx="32" cy="40" r="4" fill="#70431E"/><path d="M31 42l-3 8h8l-3-8" fill="#70431E"/></svg>'
    : '<svg viewBox="0 0 64 64" width="1em" height="1em"><defs><radialGradient id="rotBerry"><stop stop-color="#98835B"/><stop offset=".7" stop-color="#595239"/><stop offset="1" stop-color="#393A31"/></radialGradient></defs><path d="M31 13Q56 8 55 36Q52 60 31 56Q8 60 9 35Q11 10 31 13Z" fill="url(#rotBerry)" stroke="#51432D" stroke-width="3"/><path d="M32 14l4-8M32 14q-11-12-17-3" fill="none" stroke="#548336" stroke-width="4"/><g fill="#292D21"><circle cx="23" cy="31" r="5"/><circle cx="40" cy="43" r="7"/><circle cx="40" cy="25" r="3"/></g><path d="M20 50q12-9 23 0" stroke="#D7B993" stroke-width="2.6" fill="none"/></svg>';
  // Difficulty is candidate tuning; actual win probabilities are measured by the bot.
  LEVELS.forEach((L,i)=>{
    const n=i+1;
    if(n>=5 && n%6===5)L.boxes=Math.max(L.boxes||0,4);
    if(n>=12 && n%3===0)L.locks=2+(n>=30?1:0);
    if(n>=15 && n%4===0)L.rotten=2+(n>=36?1:0);
    if(n>=25 && n%5===0)L.pests=true;
    if(n>=30 && n%5===0){
      L.boxes=Math.max(L.boxes||0,4);
      L.locks=Math.max(L.locks||0,2);
      L.rotten=Math.max(L.rotten||0,2);
      L.pests=true;
      if(!L.weeds)L.weeds='center';
      L.goals.weed=0;
    }
    if(n>=15)L.moves=Math.max(17,Math.round(L.moves*(n>=30?.9:.94)));
    L.mechanics=[L.weeds?'сорняки':null,L.boxes?'ящики':null,L.locks?'замки':null,L.rotten?'гнилые фишки':null,L.pests?'вредители':null].filter(Boolean);
  });
  let activeLevel=0;
  const extraBlocks=B=>B.flat().filter(t=>t&&t.kind==='lock').length;
  const blocks=B=>B.flat().filter(t=>t&&t.s==='box'&&!t.kind).length;
  const addObstacle=(B,kind)=>{
    for(let k=0;k<120;k++){
      const r=kind==='rot'?1+rnd(N-2):rnd(N),c=rnd(N);
      if(B[r][c].s==='box')continue;
      const tile=makeTile(-3);
      tile.s='box';tile.kind=kind;tile.hp=kind==='lock'?3:Infinity;
      B[r][c]=tile;return true;
    }
    return false;
  };
  genBoard=function(boxCount){
    const L=LEVELS[activeLevel];
    for(let attempt=0;attempt<75;attempt++){
      const B=ORIGINAL.genBoard(boxCount);
      for(let i=0;i<(L.locks||0);i++)addObstacle(B,'lock');
      for(let i=0;i<(L.rotten||0);i++)addObstacle(B,'rot');
      if(hasMove(B))return B;
    }
    // Fail safe: keep the board playable rather than force an impossible pattern.
    return ORIGINAL.genBoard(boxCount);
  };
  // Rotten pieces are immovable barriers: gravity acts separately on both sides of each barrier.
  gravity=function(){
    if(!G.board.some(row=>row.some(t=>t&&t.kind==='rot')))return ORIGINAL.gravity();
    const B=G.board;
    for(let c=0;c<N;c++){
      let bottom=N-1;
      for(let cut=N-1;cut>=-1;cut--){
        if(cut!==-1&&(!B[cut][c]||B[cut][c].kind!=='rot'))continue;
        let w=bottom;
        for(let r=bottom;r>cut;r--)if(B[r][c]){
          if(w!==r){B[w][c]=B[r][c];B[r][c]=null;}w--;
        }
        const free=w-cut;
        for(let r=w;r>cut;r--){const t=makeTile();t.spawn=r-free;B[r][c]=t;}
        bottom=cut-1;
      }
    }
  };
  look=function(el,t){
    ORIGINAL.look(el,t);
    if(t.kind){
      el.dataset.k=t.kind;
      el.firstChild.innerHTML=marker(t.kind);
      el.classList.toggle('rotten',t.kind==='rot');
      el.classList.toggle('locked',t.kind==='lock');
      el.setAttribute('aria-label',t.kind==='lock'?'Замок: три соседних совпадения':'Гнилая фишка: не перемещается');
    }else{
      el.classList.remove('rotten','locked');el.removeAttribute('aria-label');
    }
  };
  renderGoals=function(){
    ORIGINAL.renderGoals();
    if(G&&G.goals&&G.goals.lock!==undefined){
      const i=Object.keys(G.goals).indexOf('lock');
      const el=document.querySelector('#goals')?.children[i]?.querySelector('span');
      if(el)el.textContent='🔒';
    }
  };
  clearCells=async function(set,creates){
    const beforeBox=blocks(G.board),beforeLock=extraBlocks(G.board),beforeBoxGoal=G.goals.box||0;
    await ORIGINAL.clearCells(set,creates);
    const removedBox=Math.max(0,beforeBox-blocks(G.board)),removedLock=Math.max(0,beforeLock-extraBlocks(G.board));
    if('box' in G.goals)G.goals.box=Math.max(0,beforeBoxGoal-removedBox);
    if('lock' in G.goals)G.goals.lock=Math.max(0,G.goals.lock-removedLock);
    if(removedLock)toast('🔒 Замок открылся!');
    renderGoals();
  };
  onTap=async function(pos){
    if(G&&G.mode==='hammer'&&G.board[pos[0]][pos[1]].kind==='rot'){
      toast('Гнилую фишку нельзя убрать молотком');return;
    }
    return ORIGINAL.onTap(pos);
  };
  finishTurn=async function(){
    if(G&&G.pests&&!goalsDone()){
      G.pestTurns=(G.pestTurns||0)+1;
      if(G.pestTurns%6===0){
        const remaining=Object.keys(G.goals).filter(k=>/^\d+$/.test(k)&&G.goals[k]>0);
        if(remaining.length){const k=remaining[rnd(remaining.length)];G.goals[k]++;toast('🐛 Вредители съели урожай: +1 к цели');}
      }
    }
    return ORIGINAL.finishTurn();
  };
  startLevel=function(i){
    activeLevel=i;
    const ret=ORIGINAL.startLevel(i);
    if(G&&G.lvl===i){
      const L=LEVELS[i];
      if(L.locks)G.goals.lock=extraBlocks(G.board);
      G.pests=!!L.pests;G.pestTurns=0;
      renderGoals();
    }
    return ret;
  };
})();
