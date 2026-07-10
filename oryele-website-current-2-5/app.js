(() => {
  const menu = document.querySelector('.menu');
  const mobile = document.querySelector('.mobile');
  if (menu && mobile) {
    menu.addEventListener('click', () => mobile.classList.toggle('open'));
  }

  const canvas = document.getElementById('network') || document.querySelector('.starfield');
  if (!canvas) return;

  const isHomeOverlay = canvas.classList.contains('starfield');
  const host = isHomeOverlay ? document.querySelector('.page-shell') : null;
  const ctx = canvas.getContext('2d', { alpha: true });
  const reduceMotion = true;

  let width = 1;
  let height = 1;
  let dpr = 1;
  let stars = [];
  let raf = 0;
  let last = performance.now();

  function bounds() {
    if (host) {
      const rect = host.getBoundingClientRect();
      return { width: Math.max(1, rect.width), height: Math.max(1, rect.height) };
    }
    return { width: Math.max(1, window.innerWidth), height: Math.max(1, window.innerHeight) };
  }

  function createStar() {
    const flare = Math.random() < 0.075;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (0.005 + Math.random() * 0.014) * (Math.random() < 0.5 ? -1 : 1),
      vy: (0.003 + Math.random() * 0.009) * (Math.random() < 0.5 ? -1 : 1),
      radius: flare ? 1.0 + Math.random() * 1.3 : 0.28 + Math.random() * 0.72,
      alpha: flare ? 0.62 + Math.random() * 0.30 : 0.18 + Math.random() * 0.50,
      phase: Math.random() * Math.PI * 2,
      speed: 0.00045 + Math.random() * 0.00085,
      flare
    };
  }

  function resize() {
    const b = bounds();
    width = b.width;
    height = b.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const density = isHomeOverlay ? 5200 : 6500;
    const count = Math.max(170, Math.round((width * height) / density));
    stars = Array.from({ length: count }, createStar);
  }

  function drawConnections() {
    const max = Math.min(105, width * 0.07);
    const max2 = max * max;
    for (let i = 0; i < stars.length; i++) {
      const a = stars[i];
      let links = 0;
      for (let j = i + 1; j < stars.length && links < 2; j++) {
        const b = stars[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < max2) {
          const opacity = (1 - d2 / max2) * (isHomeOverlay ? 0.12 : 0.16);
          ctx.strokeStyle = `rgba(28,119,255,${opacity})`;
          ctx.lineWidth = 0.55;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          links++;
        }
      }
    }
  }

  function drawStar(s, now) {
    const pulse = 0.82;
    const alpha = Math.max(0.06, s.alpha * pulse);

    if (s.flare) {
      const radius = s.radius * 10;
      const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, radius);
      glow.addColorStop(0, `rgba(199,231,255,${alpha * 0.95})`);
      glow.addColorStop(0.16, `rgba(56,153,255,${alpha * 0.52})`);
      glow.addColorStop(1, 'rgba(0,88,255,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(125,201,255,${alpha * 0.75})`;
      ctx.lineWidth = 0.65;
      ctx.beginPath();
      ctx.moveTo(s.x - s.radius * 5.5, s.y);
      ctx.lineTo(s.x + s.radius * 5.5, s.y);
      ctx.moveTo(s.x, s.y - s.radius * 5.5);
      ctx.lineTo(s.x, s.y + s.radius * 5.5);
      ctx.stroke();
    }

    ctx.fillStyle = `rgba(74,168,255,${alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function frame(now) {
    const delta = Math.min(34, now - last);
    last = now;
    ctx.clearRect(0, 0, width, height);

    for (const s of stars) {
      if (!reduceMotion) {
        s.x += s.vx * delta;
        s.y += s.vy * delta;
        if (s.x < -14) s.x = width + 14;
        if (s.x > width + 14) s.x = -14;
        if (s.y < -14) s.y = height + 14;
        if (s.y > height + 14) s.y = -14;
      }
    }

    drawConnections();
    for (const s of stars) drawStar(s, now);
    if (!reduceMotion) raf = requestAnimationFrame(frame);
  }

  const onResize = () => {
    cancelAnimationFrame(raf);
    resize();
    last = performance.now();
    frame(last);
  };

  window.addEventListener('resize', onResize, { passive: true });
  if (host && 'ResizeObserver' in window) new ResizeObserver(onResize).observe(host);
  resize();
  frame(last);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (!reduceMotion) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  });
})();
