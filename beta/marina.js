/* Animated Marina: front and two independently drawn side views, not a mirrored image. */
(function(){
 'use strict';
 const g=document.getElementById('granny'); if(!g)return;
 const holder=g.querySelector('.gf');if(!holder)return;
 const face=(side)=>{
   const right=side==='right',cx=right?28:16, nose=right?36:8;
   return `<g class="marina-profile">
      <g class="marina-leg marina-leg-a"><path d="M18 51L17 60" stroke="#726b80" stroke-width="5" stroke-linecap="round"/><ellipse cx="17" cy="61" rx="6" ry="2.5" fill="#463c39"/></g>
      <g class="marina-leg marina-leg-b"><path d="M25 51L27 60" stroke="#726b80" stroke-width="5" stroke-linecap="round"/><ellipse cx="27" cy="61" rx="6" ry="2.5" fill="#463c39"/></g>
      <path d="M20 27Q14 27 13 34L10 53Q23 58 35 52L31 33Q29 27 24 27Z" fill="#3f75c0" stroke="#31558c" stroke-width="1.6"/>
      <path d="M${right?30:12} 32L${right?37:6} 46" stroke="#efc09a" stroke-width="5" stroke-linecap="round"/>
      <path d="M17 30L25 30L30 52Q23 56 16 52Z" fill="#f9ead8" stroke="#b7a18f"/>
      <path d="M20 29Q23 34 26 29" fill="none" stroke="#bf8c60" stroke-width="1.7"/>
      <circle cx="${cx}" cy="17" r="12" fill="#ded5c3" stroke="#aaa293"/>
      <path d="M${cx-10} 16Q${cx-11} 7 ${cx-3} 5Q${cx+9} 2 ${cx+10} 17Q${cx+4} 9 ${cx-7} 13Z" fill="#dbdbd5"/>
      <path d="M${cx-8} 15Q${cx-10} 23 ${cx-2} 28Q${cx+7} 29 ${cx+8} 17Q${cx+1} 10 ${cx-8} 15Z" fill="#edc6a5"/>
      <path d="M${right?cx+2:cx-2} 16Q${nose} 18 ${nose} 20Q${cx+1} 23 ${right?cx+4:cx-4} 20" fill="#e5b38f"/>
      <circle cx="${right?cx+3:cx-3}" cy="17" r="1.4" fill="#543b30"/>
      <path d="M${cx-1} 24Q${cx+2} 26 ${right?cx+4:cx-4} 24" fill="none" stroke="#9c5d50" stroke-width="1.1"/>
      <path d="M${cx-9} 13Q${cx-4} 8 ${cx+4} 11" fill="none" stroke="#d9d9d0" stroke-width="2"/>
      <path d="M${right?cx-11:cx+9} 12Q${right?cx-15:cx+15} 3 ${right?cx-7:cx+7} 2" fill="none" stroke="#b8b8b6" stroke-width="5" stroke-linecap="round"/>
    </g>`;
 };
 const front=`<g class="marina-front">
   <g class="marina-leg marina-leg-a"><path d="M17 48L16 60" stroke="#817788" stroke-width="5" stroke-linecap="round"/><ellipse cx="15" cy="61" rx="6" ry="2.3" fill="#51413b"/></g>
   <g class="marina-leg marina-leg-b"><path d="M27 48L28 60" stroke="#817788" stroke-width="5" stroke-linecap="round"/><ellipse cx="29" cy="61" rx="6" ry="2.3" fill="#51413b"/></g>
   <g class="marina-arm marina-arm-a"><path d="M12 30L6 44" stroke="#f2c7a4" stroke-width="5" stroke-linecap="round"/></g>
   <g class="marina-arm marina-arm-b"><path d="M31 30L37 44" stroke="#f2c7a4" stroke-width="5" stroke-linecap="round"/></g>
   <path d="M14 28Q22 25 30 28L35 53Q22 58 9 53Z" fill="#457bc5" stroke="#365b9c" stroke-width="1.6"/>
   <path d="M17 30L27 30L31 52Q22 56 13 52Z" fill="#fff0d7" stroke="#cfb89c" stroke-width="1.3"/>
   <path d="M16 31L22 38L28 31" fill="none" stroke="#de9f75" stroke-width="1.3"/>
   <circle cx="22" cy="17" r="13" fill="#f3caa6"/>
   <path d="M9 17Q8 2 21 3Q36 1 35 18L30 11L13 11Z" fill="#d1d1c9"/>
   <path d="M11 15Q7 8 11 5M33 15Q37 8 33 5" fill="none" stroke="#b7b7b2" stroke-width="4"/>
   <ellipse cx="11" cy="17" rx="2" ry="4" fill="#efbd9b"/><ellipse cx="33" cy="17" rx="2" ry="4" fill="#efbd9b"/>
   <g class="marina-eyes"><circle cx="17" cy="18" r="1.7" fill="#49382f"/><circle cx="27" cy="18" r="1.7" fill="#49382f"/></g>
   <path d="M19 24Q22 27 25 24" stroke="#a95c5c" stroke-width="1.4" stroke-linecap="round" fill="none"/>
   <path d="M15 14Q17 12 19 14M25 14Q27 12 29 14" stroke="#9f9c91" stroke-width="1.2" fill="none"/>
   <path d="M16 20Q22 18 28 20" fill="none" stroke="#d49975" stroke-width="1" opacity=".55"/>
   <g class="marina-glasses"><circle cx="17" cy="18" r="5" fill="none" stroke="#765341" stroke-width="1.2"/><circle cx="27" cy="18" r="5" fill="none" stroke="#765341" stroke-width="1.2"/><path d="M22 18h0.5M12 17l-3-2M32 17l3-2" stroke="#765341" stroke-width="1.2"/></g>
 </g>`;
 const svg='<svg class="mimg marina-rig" viewBox="0 0 44 65" role="img" aria-label="Бабушка Марина — анимированный персонаж" xmlns="http://www.w3.org/2000/svg">'+
  '<ellipse cx="22" cy="63" rx="17" ry="2" fill="#304923" opacity=".2"/>'+front+
  '<g class="marina-side-right">'+face('right')+'</g>'+
  '<g class="marina-side-left">'+face('left')+'</g></svg>';
 holder.insertAdjacentHTML('beforeend',svg);
 const render=()=>{
  const moving=g.classList.contains('walk');
  const view=moving?(g.classList.contains('left')?'left':'right'):'front';
  g.dataset.marinaView=view;
 };
 new MutationObserver(render).observe(g,{attributes:true,attributeFilter:['class']});
 render();
})();
