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

  // Fixed vegetable-only harvest across all levels. Fruit rotation removed after playtest feedback.
  // Existing SVGs provide consistent highlight and outline; new pieces use the same 64x64 canvas.
  const baseSvg=VEG.slice();
  const art=(id,a,b,body)=>'<svg viewBox="0 0 64 64" width="1em" height="1em" role="img" aria-label="'+id+'">'
    +'<defs><radialGradient id="v2-'+id+'" cx=".3" cy=".24" r=".82"><stop stop-color="'+a+'"/><stop offset=".56" stop-color="'+b+'"/><stop offset="1" stop-color="#442839"/></radialGradient></defs>'
    +'<ellipse cx="32" cy="59" rx="18" ry="3" fill="#33271B" opacity=".13"/>'
    +body+'</svg>';
  const pepper=art('pepper','#FFEAA3','#D93227',
    '<path d="M32 19C10 12 5 34 11 47Q14 59 26 55Q33 60 39 55Q52 58 56 44Q60 18 38 18Q35 17 32 19Z" fill="url(#v2-pepper)" stroke="#A22E1F" stroke-width="2"/>'
    +'<path d="M31 20Q27 12 32 7Q40 7 39 16Q46 14 49 20Q40 17 35 23Z" fill="#43863B" stroke="#276039" stroke-width="1.4"/>'
    +'<path d="M18 28Q12 39 20 48M44 24Q54 37 47 48" fill="none" stroke="#A83324" stroke-width="2" opacity=".6"/>'
    +'<ellipse cx="21" cy="31" rx="5" ry="11" fill="#FFF4C8" opacity=".64" transform="rotate(32 21 31)"/>');
  const beet=art('beet','#FF99C9','#992058',
    '<path d="M31 18C10 14 7 35 19 50Q26 58 30 58Q36 58 44 49Q57 28 41 20Q37 18 31 18Z" fill="url(#v2-beet)" stroke="#752044" stroke-width="2.3"/>'
    +'<path d="M30 19Q18 8 22 3Q30 4 33 16Q37 4 44 4Q47 11 35 20Q19 12 9 17Q15 5 30 19Z" fill="#599B49" stroke="#346B3D" stroke-width="1.6"/>'
    +'<path d="M30 57l-4 5" stroke="#9B5070" stroke-width="2.8"/><ellipse cx="22" cy="29" rx="6" ry="10" fill="#FFD4EC" opacity=".56" transform="rotate(30 22 29)"/>');
  const pear=art('pear','#FFF5B2','#91B32F',
    '<path d="M32 9l3-5" fill="none" stroke="#71522F" stroke-width="4" stroke-linecap="round"/>'
    +'<path d="M35 9Q47 3 53 12Q42 17 35 14Z" fill="#68A746" stroke="#2D733B" stroke-width="1.6"/>'
    +'<path d="M28 15Q31 22 21 30Q11 36 10 45Q8 58 29 58Q56 61 55 44Q54 35 44 27Q37 21 40 15Q33 10 28 15Z" fill="url(#v2-pear)" stroke="#6F8227" stroke-width="2"/>'
    +'<ellipse cx="21" cy="38" rx="6" ry="11" fill="#FFFDE3" opacity=".65" transform="rotate(25 21 38)"/>');
  const cherry=art('cherry','#FF9A8B','#C51E30',
    '<path d="M31 17Q19 12 18 4M31 17Q49 9 44 3" stroke="#498B3B" stroke-width="3" fill="none"/>'
    +'<path d="M31 15Q26 1 38 4Q47 11 31 15Z" fill="#5CAD46" stroke="#2C7B39" stroke-width="1.5"/>'
    +'<circle cx="19" cy="40" r="14" fill="url(#v2-cherry)" stroke="#8E182C" stroke-width="2"/>'
    +'<circle cx="45" cy="42" r="14" fill="url(#v2-cherry)" stroke="#8E182C" stroke-width="2"/>'
    +'<ellipse cx="13" cy="33" rx="4" ry="7" fill="#FFE1D7" opacity=".7" transform="rotate(28 13 33)"/>'
    +'<ellipse cx="39" cy="35" rx="4" ry="7" fill="#FFE1D7" opacity=".64" transform="rotate(28 39 35)"/>');
  const plum=art('plum','#D5AAFF','#7342AB',
    '<path d="M32 13l4-8" stroke="#6C6130" stroke-width="3.5" stroke-linecap="round"/>'
    +'<path d="M32 15Q23 8 17 13Q21 22 32 18Z" fill="#5DA447" stroke="#286A38" stroke-width="1.8"/>'
    +'<path d="M32 17Q15 13 10 32Q6 48 22 56Q32 61 42 55Q60 45 53 28Q46 12 32 17Z" fill="url(#v2-plum)" stroke="#502F7E" stroke-width="2.5"/>'
    +'<path d="M32 21Q39 37 32 55" stroke="#4F3679" stroke-width="2" fill="none" opacity=".5"/>'
    +'<ellipse cx="21" cy="29" rx="6" ry="11" fill="#EEE1FF" opacity=".63" transform="rotate(26 21 29)"/>');
  const grapes=art('grapes','#E1B7FF','#8342B1',
    '<path d="M32 15l-3-9M32 15Q37 3 49 7Q47 17 32 19Z" fill="#519743" stroke="#33743A" stroke-width="2"/>'
    +'<g fill="url(#v2-grapes)" stroke="#60318B" stroke-width="1.5">'
    +'<circle cx="23" cy="27" r="9"/><circle cx="36" cy="25" r="9"/><circle cx="44" cy="35" r="9"/>'
    +'<circle cx="16" cy="39" r="9"/><circle cx="30" cy="39" r="9"/><circle cx="37" cy="49" r="9"/>'
    +'<circle cx="23" cy="51" r="9"/></g><g fill="#FFF2FF" opacity=".65"><circle cx="20" cy="23" r="3"/><circle cx="34" cy="21" r="3"/><circle cx="12" cy="36" r="3"/><circle cx="28" cy="35" r="3"/></g>');
  const vegetableSet={names:['🍅','🥕','🥒','🥬','🫑','🫜'],icons:[baseSvg[0],baseSvg[1],baseSvg[2],baseSvg[4],pepper,beet]};
  function setProduce(level){
    TYPES.splice(0,TYPES.length,...vegetableSet.names);
    VEG.splice(0,VEG.length,...vegetableSet.icons);
    document.documentElement.dataset.harvest='vegetable';
  }

  startLevel=function(i){
    activeLevel=i;
    setProduce(i);
    const ret=ORIGINAL.startLevel(i);
    if(G&&G.lvl===i){
      const L=LEVELS[i];
      if(L.locks)G.goals.lock=extraBlocks(G.board);
      G.pests=!!L.pests;G.pestTurns=0;
      renderGoals();
      // No fruit-switch modal: every level uses the same six vegetables.
    }
    return ret;
  };
})();
