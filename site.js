(() => {
  const menuButton = document.querySelector('.menu-button');
  const mobileNav = document.getElementById('mobile-nav');
  if (menuButton && mobileNav) menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    mobileNav.hidden = open;
  });
  document.addEventListener('click', event => {
    document.querySelectorAll('.resources-nav[open]').forEach(details => {
      if (!details.contains(event.target)) details.removeAttribute('open');
    });
  });
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas=document.createElement('canvas'); canvas.id='oryele-starfield';
  Object.assign(canvas.style,{position:'fixed',inset:'0',width:'100%',height:'100%',zIndex:'0',pointerEvents:'none',opacity:'.92'});
  document.body.prepend(canvas); const ctx=canvas.getContext('2d'); let w=0,h=0,dpr=1,pts=[];
  const resize=()=>{dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);const n=Math.max(95,Math.floor(w*h/13500));pts=Array.from({length:n},(_,i)=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.055,vy:(Math.random()-.5)*.055,r:i%17===0?Math.random()*2.1+1.2:Math.random()*1.15+.28,pulse:Math.random()*Math.PI*2}))};
  const draw=(t=0)=>{ctx.clearRect(0,0,w,h);for(const p of pts){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;const glow=.72+.22*Math.sin(t*.0012+p.pulse);if(p.r>1.3){const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*7);g.addColorStop(0,`rgba(105,194,255,${glow})`);g.addColorStop(.25,'rgba(42,133,255,.38)');g.addColorStop(1,'rgba(0,82,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r*7,0,Math.PI*2);ctx.fill()}ctx.beginPath();ctx.fillStyle=`rgba(102,190,255,${glow})`;ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}for(let i=0;i<pts.length;i++)for(let k=i+1;k<pts.length;k++){const a=pts[i],b=pts[k],dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);if(d<155){ctx.strokeStyle=`rgba(38,121,214,${(1-d/155)*.22})`;ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}}requestAnimationFrame(draw)};
  addEventListener('resize',resize,{passive:true});resize();draw();
})();
// v17 resources dropdown reliability
(() => {
  const menus = [...document.querySelectorAll('.resources-nav')];
  document.addEventListener('click', (event) => {
    for (const menu of menus) {
      if (!menu.contains(event.target)) menu.removeAttribute('open');
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      for (const menu of menus) menu.removeAttribute('open');
      document.querySelector('.resources-nav > summary')?.focus();
    }
  });
})();

// v18 capability-card interaction and analytics-safe activation
(() => {
  document.querySelectorAll('.capability-reference .cap-link').forEach((link) => {
    link.addEventListener('keydown', (event) => {
      if (event.key === ' ') {
        event.preventDefault();
        link.click();
      }
    });
  });
})();


// v19 capability summary panel: hover, focus, pointer and keyboard support
(() => {
  const visual = document.querySelector('.capability-reference');
  const panel = document.getElementById('capability-summary');
  const title = document.getElementById('capability-summary-title');
  const description = document.getElementById('capability-summary-description');
  if (!visual || !panel || !title || !description) return;

  const links = [...visual.querySelectorAll('.cap-link')];
  let activeLink = null;
  let switchTimer = null;
  let hideTimer = null;

  const show = (link) => {
    clearTimeout(hideTimer);
    const nextTitle = link.dataset.capabilityTitle || link.getAttribute('aria-label') || '';
    const nextDescription = link.dataset.capabilityDescription || '';
    if (activeLink && activeLink !== link) {
      panel.classList.add('is-switching');
      clearTimeout(switchTimer);
      switchTimer = setTimeout(() => {
        title.textContent = nextTitle;
        description.textContent = nextDescription;
        panel.classList.remove('is-switching');
      }, 90);
    } else {
      title.textContent = nextTitle;
      description.textContent = nextDescription;
    }
    activeLink = link;
    links.forEach(item => item.classList.toggle('is-active', item === link));
    panel.classList.add('is-visible');
    panel.setAttribute('aria-hidden', 'false');
    visual.classList.add('has-active-capability');
  };

  const hide = () => {
    hideTimer = setTimeout(() => {
      if (visual.matches(':hover') || visual.contains(document.activeElement)) return;
      activeLink = null;
      links.forEach(item => item.classList.remove('is-active'));
      panel.classList.remove('is-visible', 'is-switching');
      panel.setAttribute('aria-hidden', 'true');
      visual.classList.remove('has-active-capability');
    }, 90);
  };

  links.forEach(link => {
    link.addEventListener('mouseenter', () => show(link));
    link.addEventListener('focus', () => show(link));
    link.addEventListener('pointerdown', () => show(link));
    link.addEventListener('mouseleave', hide);
    link.addEventListener('blur', hide);
  });
  visual.addEventListener('mouseleave', hide);
})();
