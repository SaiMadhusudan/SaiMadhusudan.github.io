/* ---------- Year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Nav scroll state ---------- */
const nav = document.querySelector('.nav');
const onScroll = () => {
  if (window.scrollY > 12) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- Reveal on scroll ---------- */
const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
reveals.forEach((r) => io.observe(r));

/* Stagger reveals inside grid containers */
document.querySelectorAll('.pubs, .projects, .skills, .achievements, .contact-grid, .about-grid, .hero-stats').forEach((grid) => {
  Array.from(grid.children).forEach((child, i) => {
    if (child.classList.contains('reveal')) {
      child.style.transitionDelay = `${Math.min(i, 6) * 60}ms`;
    }
  });
});

/* ---------- Count-up stats ---------- */
const counters = document.querySelectorAll('[data-count]');
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const end = parseFloat(el.dataset.count);
    const duration = 1100;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = end * eased;
      el.textContent = end >= 10 ? Math.floor(value) : value.toFixed(0);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = end;
    };
    requestAnimationFrame(tick);
    countObserver.unobserve(el);
  });
}, { threshold: 0.4 });
counters.forEach((c) => countObserver.observe(c));

/* ---------- Animated background (particles + connections) ---------- */
(() => {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  const mouse = { x: -9999, y: -9999 };

  const resize = () => {
    w = canvas.clientWidth = window.innerWidth;
    h = canvas.clientHeight = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // density-aware particle count
    const target = Math.min(95, Math.floor((w * h) / 16000));
    particles = new Array(target).fill(0).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.4 + 0.4,
    }));
  };
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });

  const tick = () => {
    ctx.clearRect(0, 0, w, h);

    // particles
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      // attract slightly toward mouse
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const d2 = dx*dx + dy*dy;
      if (d2 < 22000) {
        const f = (22000 - d2) / 22000;
        p.x += (dx / Math.sqrt(d2 + 0.001)) * f * 0.6;
        p.y += (dy / Math.sqrt(d2 + 0.001)) * f * 0.6;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(180, 175, 255, 0.55)';
      ctx.fill();
    }

    // connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = dx*dx + dy*dy;
        if (dist < 15000) {
          const alpha = (1 - dist / 15000) * 0.18;
          ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(tick);
  };
  tick();
})();

/* ---------- Magnetic hover for primary CTA ---------- */
document.querySelectorAll('.btn.primary, .resume-btn').forEach((el) => {
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${x * 0.12}px, ${y * 0.18}px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
});

/* ---------- Active nav link based on section ---------- */
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const activate = (id) => {
  navLinks.forEach((a) => {
    a.style.color = (a.getAttribute('href') === `#${id}`) ? 'var(--text)' : '';
  });
};
const secObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) activate(e.target.id);
  });
}, { threshold: 0.4 });
sections.forEach((s) => secObserver.observe(s));
