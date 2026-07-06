/* LEDNomad — interactions */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- loader ---------- */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('is-done'), reduced ? 0 : 1200);
  });
  // Safety: never trap the page behind the loader
  setTimeout(() => loader.classList.add('is-done'), 3500);

  /* ---------- year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- custom cursor ---------- */
  if (matchMedia('(hover:hover) and (pointer:fine)').matches && !reduced) {
    document.body.classList.add('cursor-custom');
  }

  /* ---------- kelvin control ---------- */
  const stops = document.querySelectorAll('.kelvin__stop');
  stops.forEach(btn => btn.addEventListener('click', () => {
    stops.forEach(b => b.classList.toggle('is-active', b === btn));
    document.body.dataset.kelvin = btn.dataset.k;
  }));

  /* ---------- scroll-to-top links (brand + footer) ---------- */
  document.querySelectorAll('a[href="#top"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------- header: scrim on scroll, hide on scroll-down ---------- */
  const head = document.querySelector('.site-head');
  let lastY = scrollY;
  const onHeadScroll = () => {
    const y = scrollY;
    head.classList.toggle('is-scrolled', y > 40);
    // hide when scrolling down past the hero, show when scrolling up
    if (y > lastY && y > 240) head.classList.add('is-hidden');
    else head.classList.remove('is-hidden');
    lastY = y;
  };
  let headTick = false;
  addEventListener('scroll', () => {
    if (!headTick) { headTick = true; requestAnimationFrame(() => { onHeadScroll(); headTick = false; }); }
  }, { passive: true });
  onHeadScroll();

  /* ---------- scroll reveals ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- work carousel: continuous conveyor + LED-strip navigator ---------- */
  const track = document.getElementById('workTrack');
  if (track) {
    const originals = [...track.querySelectorAll('.slide')];
    const N = originals.length;

    // Clone the full set once so the belt can loop seamlessly.
    originals.forEach(s => {
      const c = s.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.querySelectorAll('a,button,img').forEach(el => { el.tabIndex = -1; });
      track.appendChild(c);
    });
    const allSlides = [...track.querySelectorAll('.slide')];

    const gap = () => {
      const s = getComputedStyle(track);
      return parseFloat(s.columnGap || s.gap) || 24;
    };
    const slideW = () => originals[0].offsetWidth;
    const unit = () => slideW() + gap();
    const setWidth = () => allSlides[N].offsetLeft - allSlides[0].offsetLeft; // one full period
    const wrap = () => {
      const sw = setWidth();
      if (sw <= 0) return;
      if (track.scrollLeft >= sw) track.scrollLeft -= sw;
      else if (track.scrollLeft < 0) track.scrollLeft += sw;
    };

    /* --- scrubber bar navigator --- */
    const bar = document.getElementById('workBar');
    const fill = document.getElementById('workBarFill');
    bar.style.setProperty('--seg', (100 / N) + '%');
    let activeIdx = -1, focusIdx = -1, barHover = false, lastBarI = -1;

    const setFill = i => {              // slide the glowing highlight to photo i's zone
      if (i === activeIdx) return;
      activeIdx = i;
      fill.style.left = (i * 100 / N) + '%';
      bar.setAttribute('aria-valuenow', i + 1);
    };
    const setFocus = i => {             // enlarge every copy of photo i (-1 = none)
      if (i === focusIdx) return;
      focusIdx = i;
      allSlides.forEach((s, k) => s.classList.toggle('is-focus', i >= 0 && (k % N) === i));
    };
    const barIndex = e => {
      const r = bar.getBoundingClientRect();
      return Math.max(0, Math.min(N - 1, Math.floor((e.clientX - r.left) / r.width * N)));
    };
    const scrubTo = i => { if (i === lastBarI) return; lastBarI = i; setFill(i); setFocus(i); goToPhoto(i); };

    bar.addEventListener('pointerenter', () => { barHover = true; paused = true; });
    bar.addEventListener('pointerdown', e => { bar.setPointerCapture?.(e.pointerId); barHover = true; paused = true; scrubTo(barIndex(e)); });
    bar.addEventListener('pointermove', e => { if (barHover) scrubTo(barIndex(e)); });
    const barLeave = () => { barHover = false; paused = false; lastBarI = -1; setFocus(-1); };
    bar.addEventListener('pointerleave', barLeave);
    bar.addEventListener('pointerup', barLeave);
    bar.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const i = ((activeIdx + (e.key === 'ArrowRight' ? 1 : -1)) % N + N) % N;
      paused = true; setFill(i); setFocus(i); goToPhoto(i);
    });
    bar.addEventListener('blur', () => { if (!barHover) { paused = false; setFocus(-1); } });

    const centeredPhoto = () => {
      const center = track.scrollLeft + track.clientWidth / 2;
      const base = allSlides[0].offsetLeft + slideW() / 2;
      const idx = Math.round((center - base) / unit());
      return ((idx % N) + N) % N;
    };

    /* --- continuous drift --- */
    const SPEED = 0.15;              // px per ms  (~150px/sec)
    let paused = false, dragging = false, last = null, raf = null, tween = null;

    const frame = now => {
      if (last === null) last = now;
      const dt = Math.min(now - last, 50); last = now;
      if (tween) {
        tween.t += dt;
        const p = Math.min(1, tween.t / tween.dur);
        track.scrollLeft = tween.from + tween.dist * (1 - Math.pow(1 - p, 3));
        wrap();
        if (p >= 1) tween = null;
      } else if (!paused && !dragging) {
        track.scrollLeft += SPEED * dt;
        wrap();
      }
      if (!barHover) setFill(centeredPhoto());
      raf = requestAnimationFrame(frame);
    };
    const startLoop = () => { if (!reduced && raf === null) { last = null; raf = requestAnimationFrame(frame); } };
    const stopLoop = () => { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } };

    // glide the belt so photo i sits centered, choosing the nearest copy
    const goToPhoto = i => {
      let bestTarget = 0, bestD = Infinity;
      for (let k = i; k < allSlides.length; k += N) {
        const c = allSlides[k].offsetLeft - allSlides[0].offsetLeft + slideW() / 2;
        const target = c - track.clientWidth / 2;
        const d = Math.abs(target - track.scrollLeft);
        if (d < bestD) { bestD = d; bestTarget = target; }
      }
      if (reduced) { track.scrollLeft = bestTarget; wrap(); setFill(i); return; }
      tween = { from: track.scrollLeft, dist: bestTarget - track.scrollLeft, t: 0, dur: 620 };
    };

    /* --- pause only while dragging --- */
    document.addEventListener('visibilitychange', () => { document.hidden ? stopLoop() : startLoop(); });

    /* --- drag / swipe --- */
    let down = false, startX = 0, startScroll = 0, moved = false;
    track.addEventListener('pointerdown', e => {
      tween = null;
      if (e.pointerType === 'mouse') {
        if (e.button !== 0) return;
        down = true; moved = false; dragging = false;
        startX = e.clientX; startScroll = track.scrollLeft;
      } else {
        dragging = true;
      }
    });
    addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) {
        moved = true;
        dragging = true;
      }
      track.scrollLeft = startScroll - dx;
      wrap();
    }, { passive: true });
    const endDrag = () => { down = false; dragging = false; };
    addEventListener('pointerup', endDrag);
    addEventListener('pointercancel', endDrag);
    // touch: native scroll drives it; clear the drag flag shortly after release
    track.addEventListener('touchend', () => setTimeout(() => { dragging = false; }, 60), { passive: true });
    track.addEventListener('click', e => { if (moved) e.preventDefault(); }, true);

    setFill(0);
    startLoop();
    addEventListener('resize', wrap);
  }

  /* ---------- craft: kelvin story ---------- */
  const craft = document.querySelector('.craft');
  const kEl = document.getElementById('craftK');
  const dEl = document.getElementById('craftDesc');
  const glowEl = document.querySelector('.craft__glow');
  const ticks = document.querySelectorAll('.craft__tick');
  const steps = [
    { k: '2700<i>K</i>', c: '#ffab5e', d: 'Candlelight warm. The temperature of wind-down — bedrooms, coves, evening rooms.' },
    { k: '3000<i>K</i>', c: '#ffc38a', d: 'Soft white. Kitchens and gathering spaces, made golden without going amber.' },
    { k: '4000<i>K</i>', c: '#ffe8cf', d: 'Gallery neutral. True color for task light, displays and backlit stone.' },
    { k: '<i>R</i>G<i>B</i>', c: '#7dd0ff', d: 'Full spectrum. Game rooms, LED matrices and scenes that shift with the night.' }
  ];
  let current = -1;
  const setStep = i => {
    if (i === current) return;
    current = i;
    const s = steps[i];
    craft.classList.add('is-fading');
    setTimeout(() => {
      kEl.innerHTML = s.k;
      dEl.textContent = s.d;
      craft.classList.remove('is-fading');
    }, reduced ? 0 : 320);
    glowEl.style.setProperty('--craft-glow', s.c);
    craft.style.setProperty('--craft-glow', s.c);
    glowEl.classList.toggle('is-rgb', i === 3);
    ticks.forEach((t, ti) => t.classList.toggle('is-active', ti === i));
  };
  setStep(0);
  const sio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) setStep(parseInt(e.target.dataset.step, 10));
    });
  }, { threshold: 0.55 });
  document.querySelectorAll('.craft__step').forEach(el => sio.observe(el));
})();
