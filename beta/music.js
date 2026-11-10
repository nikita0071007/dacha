/* Original gentle WebAudio score, NOT live instrument recordings. */
(function(){
  'use strict';
  let touched=false; const originalPlay=playTrack;
  stopMusic();
  playTrack=function(name){if(touched)return originalPlay(name);};
  ['pointerdown','touchend','keydown'].forEach(ev=>document.addEventListener(ev,()=>{touched=true},{capture:true,passive:true}));
  const melody={
    splash:[['C5',1],['E5',1],['G5',2],['A5',1],['G5',1],['E5',2],['F5',1],['G5',1],['C5',2]],
    home:[['E5',1],['G5',1],['A5',2],['G5',1],['E5',1],['D5',2],['C5',1],['E5',1],['C5',2]],
    level:[['A4',1],['C5',1],['E5',2],['D5',1],['C5',1],['A4',2],['F4',1],['A4',1],['G4',2]]
  };
  for(const [scene,mel] of Object.entries(melody)){
    TRACKS[scene]=buildTrack({bpm:scene==='splash'?76:scene==='home'?72:82,lead:.030,arp:.004,drums:'--------',
      chords:scene==='level'?['Am','F','C','G','Am','Dm','G','Am']:['C','Am','F','G','C','F','Dm','G'],
      mel:Array(4).fill(mel).flat()});
  }
  // Soft plucked tones: no third-party samples or libraries.
  mnote=function(freq,at,dur,wave,volume){
    if(!AC||!MUS.gain)return;
    const o=AC.createOscillator(),g=AC.createGain(),f=AC.createBiquadFilter();
    o.type=wave==='triangle'?'triangle':'sine';o.frequency.setValueAtTime(freq,at);
    f.type='lowpass';f.frequency.value=1500;
    g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(Math.max(.001,volume*.65),at+.03);
    g.gain.exponentialRampToValueAtTime(.0001,at+Math.max(.09,dur));
    o.connect(f);f.connect(g);g.connect(MUS.gain);o.start(at);o.stop(at+dur+.02);
  };
  const originalWin=SFX.win;
  SFX.win=function(){
    originalWin();if(!touched||!S.music||document.hidden)return;
    const ctx=ac();if(!ctx)return;
    [[523,0],[659,.2],[784,.4],[1047,.65]].forEach(([f,d])=>{
      const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+d+.02;
      o.type='sine';o.frequency.setValueAtTime(f,t);
      g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.03,t+.03);
      g.gain.exponentialRampToValueAtTime(.0001,t+.5);
      o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.52);
    });
  };
  window.BetaMusic={get unlocked(){return touched;},tracks:['splash','home','level','victory'],
    preview(name){if(!this.tracks.includes(name))return false;touched=true;if(!ac())return false;
      if(!S.music){S.music=true;save();renderMusicBtn();}
      if(name==='victory'){SFX.win();return true;}
      stopMusic();playTrack(name);return true;
    }};
})();