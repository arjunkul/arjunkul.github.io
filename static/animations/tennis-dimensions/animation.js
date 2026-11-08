(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const ns = 'http://www.w3.org/2000/svg';
  const create = (tag, attrs, parent) => {
    const el = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
    parent.appendChild(el);
    return el;
  };
  const clamp = n => Math.max(0, Math.min(1, n));
  const ease = n => { n = clamp(n); return n * n * (3 - 2 * n); };
  const mix = (a, b, t) => a + (b - a) * t;
  const between = (a, b, t) => a.map((v, i) => mix(v, b[i], t));
  const add = (a, b, scale = 1) => a.map((v, i) => v + b[i] * scale);
  const line = (el, a, b) => ['x1', 'y1', 'x2', 'y2'].forEach((key, i) => el.setAttribute(key, [...a, ...b][i]));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const data = [
    {name:'TECHNIQUE / x', color:'var(--x)', labels:[['Ready','position'],['Rules'],['Forehand'],['Backhand'],['Return','of serve'],['Serve'],['Volley'],['Footwork'],['Shot','selection'],['Spin'],['Point','construction']], times:[0,3,6,9,25,28,31,59,62,65,68]},
    {name:'COMPETITION / y', color:'var(--y)', labels:[['Playing a match'],['Tournaments'],['Longer-range prep'],['Nationals'],['Friends and','competitors'],['Doubles'],['Equipment']], times:[16,19,22,47,50,53,56]},
    {name:'MINDSET / z', color:'var(--z)', labels:[['Staying calm','when trailing'],['Reading the','opponent'],['Visualization'],['Handling losses'],['Handling wins']], times:[38,41,44,71,74]}
  ];
  const duration = 78;
  const playbackRate = 6;
  const events = data.flatMap((d,a) => d.times.map((t,i)=>({t,a,i}))).sort((a,b)=>a.t-b.t);
  const distance = (a,i) => a===0 ? 60+i*73 : a===1 ? 55+i*86 : 90+i*110;
  const axes = data.map((d,a) => {
    const group = create('g', {}, $('axes'));
    const shaft = create('line', {class:'axis',stroke:d.color}, group);
    const arrow = create('polyline', {class:'axis',stroke:d.color}, group);
    const title = create('text', {class:'axis-title'}, group); title.textContent = d.name;
    const markers = d.labels.map((words, i) => {
      const g = create('g', {}, $('markers'));
      const leader = create('line', {class:'leader'}, g);
      const point = create('circle', {r:4,class:'point',fill:d.color}, g);
      const label = create('text', {}, g);
      words.forEach((word, j) => {const span = create('tspan', {x:0,dy:j ? '1.2em' : 0}, label); span.textContent=word;});
      return {g,leader,point,label,time:d.times[i],event:events.findIndex(e=>e.a===a&&e.i===i)};
    });
    return {group,shaft,arrow,title,markers};
  });
  const planeFill = create('polygon', {fill:'var(--y)','fill-opacity':'.035'}, $('plane'));
  const grid = Array.from({length:12}, () => create('line', {class:'grid'}, $('plane')));
  const volume = Array.from({length:8}, () => create('line', {class:'grid'}, $('volume')));
  const verticalGrid = Array.from({length:20}, () => create('line', {class:'grid'}, $('volume')));
  const yzGrid = [1,2].flatMap(a=>data[a].labels.map((_,i)=>({
    a,i,el:create('line',{class:'grid'},$('volume'))
  })));
  // Interior lines run through every pair of label coordinates in 3D.
  const internalGrid = [0,1,2].flatMap(a=>{
    const [b,c]=[0,1,2].filter(axis=>axis!==a);
    return data[b].labels.flatMap((_,i)=>data[c].labels.map((_,j)=>({
      a,b,c,i,j,el:create('line',{class:'grid',style:'stroke-opacity:.045'},$('volume'))
    })));
  });
  const captions = ['Learn the actions. Build your technical vocabulary.', 'See the bigger game. Connect your skills to competition.', 'Expand your awareness. Technique, competition, and mindset work together.'];
  const svg=document.querySelector('.scene svg');
  const stages=[
    {origin:[130,340],vectors:[[1,0],[0,-1],[0,-1]],counts:[4,0,0],view:[0,0,1200,800]},
    {origin:[230,520],vectors:[[1,0],[0,-1],[0,-1]],counts:[7,3,0],view:[0,0,1200,800]},
    {origin:[250,430],vectors:[[.978,.208],[.87,-.493],[0,-1]],counts:[11,7,5]}
  ];
  const full=stages[2];
  const extent=full.vectors.map((v,a)=>v.map(n=>n*(distance(a,data[a].labels.length-1)+25)));
  const top=Math.min(0,full.origin[1]+extent[1][1]+extent[2][1]-65);
  full.view=[-240,top,Math.max(1200,full.origin[0]+extent[0][0]+extent[1][0]+100)+240,
    Math.max(800,full.origin[1]+extent[0][1]+220)-top];
  let layouts=[];
  function measureLayouts(){
    const rect=svg.getBoundingClientRect();
    // Measure and reserve all label slots once per stage, including future labels.
    // Animation frames never run collision detection or change those slots.
    layouts=stages.map(stage=>{
      const scale=Math.min(rect.width/stage.view[2],rect.height/stage.view[3]);
      const fontSize=Math.max(16,13/Math.max(.15,scale));
      const axisSize=Math.max(12,11/Math.max(.15,scale));
      svg.style.setProperty('--label-size',`${fontSize}px`);
      const positions=data.map(()=>[]),placed=[];
      for(const a of [2,1,0]){
        axes[a].markers.forEach((m,i)=>{
          const p=add(stage.origin,stage.vectors[a],distance(a,i));
          let [lx,ly]=a===0?[p[0],p[1]+35+(i%3)*48]:[p[0]-20,p[1]-(a===1?10:6)];
          m.label.setAttribute('text-anchor',a===0?'middle':'end');
          if(i<stage.counts[a]){
            const box=m.label.getBBox();
            const intersects=b=>lx+box.x<b.right+8&&lx+box.x+box.width>b.left-8&&ly+box.y<b.bottom+8&&ly+box.y+box.height>b.top-8;
            let tries=0;
            while(placed.some(intersects)&&tries++<30)ly+=a===0?fontSize*1.3:-fontSize*1.3;
            placed.push({left:lx+box.x,right:lx+box.x+box.width,top:ly+box.y,bottom:ly+box.y+box.height});
          }
          positions[a][i]=[lx,ly];
        });
      }
      return {positions,fontSize,axisSize};
    });
  }
  let time = 0, playing = false, last = 0, frame = 0, currentStage = -1;
  function render() {
    const plane = ease((time - 13) / 2), space = ease((time - 35) / 2);
    const origin = between(between(stages[0].origin, stages[1].origin, plane), stages[2].origin, space);
    const view=between(between(stages[0].view,stages[1].view,plane),stages[2].view,space);
    const fontSize=mix(mix(layouts[0].fontSize,layouts[1].fontSize,plane),layouts[2].fontSize,space);
    const axisSize=mix(mix(layouts[0].axisSize,layouts[1].axisSize,plane),layouts[2].axisSize,space);
    svg.setAttribute('viewBox',view.join(' '));
    svg.style.setProperty('--label-size',`${fontSize}px`);
    svg.style.setProperty('--axis-size',`${axisSize}px`);
    const x = between([1,0], [.978,.208], space);
    const y = between([0,-1], [.87,-.493], space);
    const z = [0,-1];
    const lengths = data.map((d,a)=>d.times.reduce((length,t,i)=>{
      const previous=i===0?0:distance(a,i-1)+25;
      return length+(distance(a,i)+25-previous)*clamp((time-t)/3);
    },0));
    const vectors = [x,y,z];
    axes.forEach((axis,a) => {
      const vec = vectors[a], end = add(origin,vec,lengths[a]);
      axis.group.setAttribute('opacity',lengths[a]>0?1:0);
      line(axis.shaft,origin,end);
      const back = add(end,vec,-9), normal = [-vec[1],vec[0]];
      axis.arrow.setAttribute('points',[add(back,normal,4),end,add(back,normal,-4)].map(p=>p.join(',')).join(' '));
      axis.title.setAttribute('x',a===0?end[0]-4:a===1?end[0]+16:end[0]-18);
      axis.title.setAttribute('y',a===0?end[1]+185:a===1?end[1]-20:end[1]-16);
      axis.title.setAttribute('text-anchor',a===1?'start':'end');
      axis.markers.forEach((m,i) => {
        const opacity = ease((time-m.time)/2.7);
        m.g.setAttribute('opacity',opacity);
        const markerDistance=Math.min(distance(a,i),Math.max(0,lengths[a]-25));
        const p = add(origin,vec,markerDistance);
        const fresh = 1-ease((time-m.time-.6)/2.4);
        const color=`color-mix(in srgb, white ${fresh*55}%, ${data[a].color})`;
        m.label.style.fill=color;m.point.style.fill=color;
        m.point.setAttribute('cx',p[0]);m.point.setAttribute('cy',p[1]);
        const labelPos=between(between(layouts[0].positions[a][i],layouts[1].positions[a][i],plane),layouts[2].positions[a][i],space);
        line(m.leader,p,[labelPos[0]+(a===0?0:8),labelPos[1]-fontSize*.35]);
        m.label.setAttribute('transform',`translate(${labelPos.join(' ')})`);
        m.label.setAttribute('text-anchor',a===0?'middle':'end');
      });
    });
    const vx=x.map(v=>v*lengths[0]), vy=y.map(v=>v*lengths[1]), vz=z.map(v=>v*lengths[2]);
    // Every face follows the full current axis lengths.
    const px=vx, py=vy;
    const corner=add(add(origin,px),py);
    planeFill.setAttribute('points',[origin,add(origin,px),corner,add(origin,py)].map(p=>p.join(',')).join(' '));
    $('plane').setAttribute('opacity',plane);
    grid.forEach((el,i)=>{const f=(i%6+1)/6;line(el,add(origin,i<6?px:py,f),add(add(origin,i<6?px:py,f),i<6?py:px));});
    const depth=vz, corners=[origin,add(origin,px),corner,add(origin,py)];
    volume.forEach((el,i)=> i<4 ? line(el,corners[i],add(corners[i],depth)) : line(el,add(corners[i-4],depth),add(corners[(i-3)%4],depth)));
    // Subdivide the two far vertical faces, leaving the labeled axes clear.
    verticalGrid.forEach((el,i)=>{
      const faceOrigin=i<10?corners[3]:corners[1];
      const horizontal=i<10?px:py;
      const f=(i%5+1)/6;
      const upright=i%10>=5;
      const start=add(faceOrigin,upright?horizontal:depth,f);
      line(el,start,add(start,upright?depth:horizontal));
    });
    const markerPosition=(a,i)=>Math.min(distance(a,i),Math.max(0,lengths[a]-25));
    const markerOpacity=(a,i)=>ease((time-data[a].times[i])/2.7);
    yzGrid.forEach(({a,i,el})=>{
      const start=add(origin,vectors[a],markerPosition(a,i));
      line(el,start,add(start,a===1?depth:py));
      el.setAttribute('opacity',markerOpacity(a,i));
    });
    internalGrid.forEach(({a,b,c,i,j,el})=>{
      const start=add(add(origin,vectors[b],markerPosition(b,i)),vectors[c],markerPosition(c,j));
      line(el,start,add(start,vectors[a],lengths[a]));
      el.setAttribute('opacity',Math.min(markerOpacity(b,i),markerOpacity(c,j)));
    });
    $('volume').setAttribute('opacity',space*.65);
    $('origin').setAttribute('cx',origin[0]);$('origin').setAttribute('cy',origin[1]);
    const stage=time<13?0:time<35?1:2;
    if(stage!==currentStage){
      currentStage=stage;$('dimension').textContent=`${stage+1}D`;$('caption').textContent=captions[stage];
      document.querySelectorAll('[data-stage]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===stage)));
    }
    const active=events.find(e=>time>=e.t&&time<e.t+3);
    $('focus-item').textContent=active?data[active.a].labels[active.i].join(' ').replace('- ','-'):time>=77?'Technique. Competition. Mindset.':time>=35&&time<38?'Opening a third dimension…':time>=13&&time<16?'Opening a second dimension…':'Your thinking gains dimensions.';
    $('timeline').value=time/playbackRate;
    const elapsed=time/playbackRate;
    $('time').textContent=`${elapsed.toFixed(1)}s / ${(duration/playbackRate).toFixed(1)}s · ${playbackRate}×`;
    $('play').textContent=playing?'Pause':time>=duration?'Play again':'Play animation';
  }
  function tick(now){
    time=Math.min(duration,time+(now-last)/1000*playbackRate);last=now;
    if(time>=duration)playing=false;
    render();if(playing)frame=requestAnimationFrame(tick);
  }
  function stop(){playing=false;cancelAnimationFrame(frame);}
  function start(){
    if(reduced.matches){stop();time=duration;render();return;}
    playing=true;last=performance.now();frame=requestAnimationFrame(tick);render();
  }
  let firstPlay=true;
  $('play').addEventListener('click',()=>{if(playing){stop();render();}else{if(time>=duration || firstPlay)time=0;firstPlay=false;start();}});
  $('replay').addEventListener('click',()=>{stop();firstPlay=false;time=0;start();});
  $('timeline').addEventListener('input',event=>{stop();firstPlay=false;time=Number(event.target.value)*playbackRate;render();});
  document.querySelectorAll('[data-stage]').forEach(button=>button.addEventListener('click',()=>{
    stop();firstPlay=false;time=[12.5,34.5,duration][Number(button.dataset.stage)];render();
  }));
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();render();}});
  reduced.addEventListener('change',()=>{if(reduced.matches){stop();time=duration;render();}});
  // Start with a useful first stage; play tells the complete story from its beginning.
  new ResizeObserver(()=>{measureLayouts();render();}).observe(svg);
  time=reduced.matches?duration:12.5;measureLayouts();render();
  document.fonts.ready.then(()=>{measureLayouts();render();});
})();
