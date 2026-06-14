/* ================================================================
   presentacion-tfg.js — Landing privada TFG moldoLab
   Scroll natural + navegación guiada + exposición visual automática
================================================================ */

const ACCESS_PASSWORD = "moldo2026";

/* ── ESTADO ── */
let sections      = [];
let currentIndex  = 0;
let isModalOpen   = false;
let jumpCooldown  = false;
let autoModules   = [];   // módulos con autoplay {el, start, stop, running}
let accAutoTimer  = null;
const REDUCED     = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── DATOS RRSS (5 carpetas reales en /assets) ── */
const SOCIAL_DATA = [
    { piece: 'CALA', type: 'Anillo estrella', folder: 'RRSS/cala',
      text: 'CALA abre la colección desde el volumen y la presencia escultórica. Transforma el gesto de llevar un anillo en una declaración visual.',
      imgs: ['POST INSTAGRAM.jpg','POST INSTAGRAM2.jpg','POST INSTAGRAM3-copy-0.jpg','POST INSTAGRAM4.jpg','POST INSTAGRAM5.jpg'] },
    { piece: 'NARA', type: 'Collar', folder: 'RRSS/nara',
      text: 'NARA trabaja desde la torsión, la continuidad y la forma envolvente. Una pieza central pensada para ocupar el cuerpo con calma y presencia.',
      imgs: ['POST INSTAGRAM6.jpg','POST INSTAGRAM7.jpg','POST INSTAGRAM8.jpg','POST INSTAGRAM9.jpg','POST INSTAGRAM10.jpg'] },
    { piece: 'ORA', type: 'Brazalete', folder: 'RRSS/ora',
      text: 'ORA rodea el cuerpo desde una forma amplia, fluida y orgánica. Su recorrido visual convierte el brazalete en una estructura blanda.',
      imgs: ['POST INSTAGRAM-copy-0.jpg','POST INSTAGRAM11.jpg','POST INSTAGRAM13.jpg','POST INSTAGRAM14.jpg','POST INSTAGRAM15.jpg'] },
    { piece: 'SIRA', type: 'Pendientes', folder: 'RRSS/sira',
      text: 'SIRA concentra la fuerza escultórica de moldoLab en un formato más contenido. Pliegues, volumen y presencia cerca del rostro.',
      imgs: ['POST INSTAGRAM21.jpg','POST INSTAGRAM23.jpg','POST INSTAGRAM24.jpg','POST INSTAGRAM25.jpg','POST INSTAGRAM3.jpg'] },
    { piece: 'LUA', type: 'Anillo', folder: 'RRSS/lua',
      text: 'LUA se construye desde el brillo, la curva y la sensación de fluidez. Una pieza suave, pero imposible de ignorar.',
      imgs: ['POST INSTAGRAM16.jpg','POST INSTAGRAM18.jpg','POST INSTAGRAM19.jpg','POST INSTAGRAM2-copy-0.jpg','POST INSTAGRAM20.jpg'] },
];

/* Fotos de campaña 1-12 con etiquetas editoriales */
const CAMPAIGN_PHOTOS = [
    { src: 'assets/1.jpg',  tag: 'cuerpo' },
    { src: 'assets/2.jpg',  tag: 'atmósfera' },
    { src: 'assets/3.jpg',  tag: 'objeto' },
    { src: 'assets/4.jpg',  tag: 'detalle' },
    { src: 'assets/5.jpg',  tag: 'campaña' },
    { src: 'assets/6.jpg',  tag: 'cuerpo' },
    { src: 'assets/7.jpg',  tag: 'proceso' },
    { src: 'assets/8.jpg',  tag: 'detalle' },
    { src: 'assets/9.jpg',  tag: 'atmósfera' },
    { src: 'assets/10.jpg', tag: 'campaña' },
    { src: 'assets/11.jpg', tag: 'objeto' },
    { src: 'assets/12.JPG', tag: 'cuerpo' },
];

/* ================================================================
   1. ACCESO
================================================================ */
(function initAccess() {
    const screen  = document.getElementById('access-screen');
    const landing = document.getElementById('landing');
    const form    = document.getElementById('access-form');
    const input   = document.getElementById('access-input');
    const errMsg  = document.getElementById('access-error');

    if (sessionStorage.getItem('tfg_access') === '1') { unlock(false); return; }

    form.addEventListener('submit', e => {
        e.preventDefault();
        if (input.value.trim() === ACCESS_PASSWORD) {
            sessionStorage.setItem('tfg_access', '1');
            unlock(true);
        } else { showError(); }
    });

    function unlock(animate) {
        if (animate) {
            screen.style.opacity = '0';
            screen.style.transform = 'scale(1.04)';
            screen.style.transition = 'opacity .6s ease, transform .6s ease';
            setTimeout(() => { screen.style.display = 'none'; landing.classList.remove('hidden'); initLanding(); }, 650);
        } else {
            screen.style.display = 'none'; landing.classList.remove('hidden'); initLanding();
        }
    }
    function showError() {
        errMsg.classList.add('visible');
        input.classList.add('shake'); input.value = ''; input.focus();
        setTimeout(() => { errMsg.classList.remove('visible'); input.classList.remove('shake'); }, 2200);
    }
})();

/* ================================================================
   2. INIT LANDING
================================================================ */
function initLanding() {
    buildSocialShowcase();
    buildCampaignSequence();
    buildArchiveMarquee();

    sections = Array.from(document.querySelectorAll('.tfg-section'));
    buildDots();
    initSectionObserver();
    initReveal();
    initKeyboard();
    initScrollProgress();
    initCarousels();
    initPosterStack();
    initVideoModal();
    initLightbox();
    initAccordions();
    initMobileMenu();
    initBackToTop();
    initColorChips();
    initHeaderShrink();
    initAutoPauseOnScroll();
    initSpotVideo();
    initArchiveFullscreen();
}

/* ── SPOT: reproducir al entrar + toggle de sonido ── */
function initSpotVideo() {
    const video = document.getElementById('spot-video');
    const btn   = document.getElementById('spot-sound');
    if (!video) return;

    // Asegurar reproducción al entrar (autoplay arranca en mute)
    video.muted = true;
    const p = video.play();
    if (p && p.catch) p.catch(() => {});

    if (!btn) return;
    btn.addEventListener('click', () => {
        video.muted = !video.muted;
        btn.classList.toggle('is-on', !video.muted);
        btn.querySelector('span').textContent = video.muted ? 'Sonido' : 'Silenciar';
        if (!video.muted) { const pp = video.play(); if (pp && pp.catch) pp.catch(() => {}); }
    });
}

/* ================================================================
   3. NAVEGACIÓN POR SECCIONES
================================================================ */
function scrollToSection(i) {
    if (i < 0 || i >= sections.length) return;
    sections[i].scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
}
function goToId(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    closeMobileMenu();
}
window.goToId = goToId;

function nextSection() {
    if (jumpCooldown) return; jumpCooldown = true;
    setTimeout(() => jumpCooldown = false, 700);
    scrollToSection(Math.min(currentIndex + 1, sections.length - 1));
}
function prevSection() {
    if (jumpCooldown) return; jumpCooldown = true;
    setTimeout(() => jumpCooldown = false, 700);
    scrollToSection(Math.max(currentIndex - 1, 0));
}
window.nextSection = nextSection;
window.prevSection = prevSection;

function buildDots() {
    const wrap = document.getElementById('section-dots');
    if (!wrap) return;
    wrap.innerHTML = '';
    sections.forEach((sec, i) => {
        const dot = document.createElement('button');
        dot.className = 'sdot';
        dot.setAttribute('aria-label', sec.dataset.name || `Sección ${i + 1}`);
        dot.dataset.tip = sec.dataset.name || '';
        dot.addEventListener('click', () => scrollToSection(i));
        wrap.appendChild(dot);
    });
}

function initSectionObserver() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                const idx = sections.indexOf(entry.target);
                if (idx !== -1) setActive(idx);
            }
        });
    }, { threshold: [0.5] });
    sections.forEach(s => observer.observe(s));
}

function setActive(idx) {
    currentIndex = idx;
    const id = sections[idx].id;
    document.querySelectorAll('.sdot').forEach((d, i) => d.classList.toggle('active', i === idx));
    document.querySelectorAll('.hdr-link').forEach(l => l.classList.toggle('active', l.dataset.target === id));
    const counter = document.getElementById('section-counter');
    if (counter) counter.textContent = pad(idx + 1) + ' / ' + pad(sections.length);

    clearTimeout(accAutoTimer);
    if (id === 'investigacion') {
        const triggers = sections[idx].querySelectorAll('.acc-trigger');
        triggers.forEach(t => { t.classList.remove('open'); t.nextElementSibling.style.maxHeight = null; });
        let i = 0;
        function openNext() {
            if (i >= triggers.length) return;
            const t = triggers[i++];
            const panel = t.nextElementSibling;
            t.classList.add('open');
            panel.style.maxHeight = panel.scrollHeight + 'px';
            accAutoTimer = setTimeout(openNext, 750);
        }
        accAutoTimer = setTimeout(openNext, 800);
    }
}
function pad(n) { return String(n).padStart(2, '0'); }

/* ================================================================
   4. TECLADO
================================================================ */
function initKeyboard() {
    document.addEventListener('keydown', e => {
        if (isModalOpen) { if (e.key === 'Escape') { closeVideoModal(); closeLightbox(); } return; }
        if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
        switch (e.key) {
            case ' ': case 'ArrowDown': case 'ArrowRight': e.preventDefault(); nextSection(); break;
            case 'ArrowUp': case 'ArrowLeft': e.preventDefault(); prevSection(); break;
            case 'Home': e.preventDefault(); scrollToSection(0); break;
            case 'End':  e.preventDefault(); scrollToSection(sections.length - 1); break;
        }
    });
}

/* ================================================================
   5. PROGRESO + HEADER
================================================================ */
function initScrollProgress() {
    const bar = document.getElementById('progress-bar');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + '%';
    }, { passive: true });
}
function initHeaderShrink() {
    const header = document.getElementById('tfg-header');
    if (!header) return;
    window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 40), { passive: true });
}

/* ================================================================
   6. REVEAL
================================================================ */
function initReveal() {
    if (REDUCED) { document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible')); return; }
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ================================================================
   7. CARRUSELES SIMPLES (colección, campaña, apps, redes legacy)
================================================================ */
function initCarousels() {
    document.querySelectorAll('.auto-carousel').forEach(setupCarousel);
}
function setupCarousel(el) {
    const items    = el.querySelectorAll('.carousel-item');
    const dotsWrap = el.querySelector('.carousel-dots');
    const prevBtn  = el.querySelector('.carousel-prev');
    const nextBtn  = el.querySelector('.carousel-next');
    if (!items.length) return;

    let current = 0, interval = null;
    const total = items.length;
    const delay = parseInt(el.dataset.delay) || 4000;

    if (dotsWrap) {
        dotsWrap.innerHTML = '';
        for (let i = 0; i < total; i++) {
            const d = document.createElement('button');
            d.className = 'cdot'; d.setAttribute('aria-label', `Imagen ${i + 1}`);
            d.addEventListener('click', () => { stop(); move(i); start(); });
            dotsWrap.appendChild(d);
        }
    }
    function move(i) {
        items[current].classList.remove('active');
        current = (i + total) % total;
        items[current].classList.add('active');
        if (dotsWrap) dotsWrap.querySelectorAll('.cdot').forEach((d, j) => d.classList.toggle('active', j === current));
    }
    function start() { if (!REDUCED) interval = setInterval(() => move(current + 1), delay); }
    function stop()  { clearInterval(interval); }

    items[0].classList.add('active');
    if (dotsWrap) dotsWrap.querySelector('.cdot')?.classList.add('active');
    start();
    el.addEventListener('mouseenter', stop);
    el.addEventListener('mouseleave', start);
    if (prevBtn) prevBtn.addEventListener('click', () => { stop(); move(current - 1); start(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { stop(); move(current + 1); start(); });

    let cx = 0;
    el.addEventListener('touchstart', e => cx = e.touches[0].clientX, { passive: true });
    el.addEventListener('touchend', e => {
        const dx = cx - e.changedTouches[0].clientX;
        if (Math.abs(dx) > 40) { stop(); move(dx > 0 ? current + 1 : current - 1); start(); }
    }, { passive: true });

    autoModules.push({ el, start, stop, running: true });
}

/* ================================================================
   8. POSTER STACK (carteles)
================================================================ */
function initPosterStack() {
    const stack = document.getElementById('poster-stack');
    if (!stack) return;
    const posters = Array.from(stack.querySelectorAll('.poster'));
    if (!posters.length) return;

    let order = posters.map((_, i) => i); // índices, [0]=frente
    let interval = null;

    function render() {
        order.forEach((posterIdx, pos) => {
            const p = posters[posterIdx];
            p.className = 'poster pos-' + Math.min(pos, 2);
            p.style.zIndex = posters.length - pos;
        });
    }
    function rotate() {
        order.push(order.shift()); // el del frente va al fondo
        render();
    }
    function start() { if (!REDUCED) interval = setInterval(rotate, 4500); }
    function stop()  { clearInterval(interval); }

    render();
    start();
    // Movimiento automático continuo — NO se pausa al pasar el ratón.

    autoModules.push({ el: stack, start, stop, running: true });
}

/* ================================================================
   9. SOCIAL WALL (RRSS — 3 columnas inclinadas automáticas)
   Muro tipo exposición: 3 columnas que se desplazan solas en
   vertical (alternando sentido) e inclinadas en abanico.
================================================================ */
function buildSocialShowcase() {
    const root = document.getElementById('social-showcase');
    if (!root) return;
    const enc = s => encodeURIComponent(s);

    // Aplanar las 5 carpetas (25 imágenes) conservando el nombre de la pieza
    const pairs = [];
    SOCIAL_DATA.forEach(d => d.imgs.forEach(img =>
        pairs.push({ piece: d.piece, src: `assets/${d.folder}/${enc(img)}` })
    ));

    // Repartir en 6 columnas (round-robin → sin amontonar la misma pieza)
    const cols = [[], [], [], [], [], []];
    pairs.forEach((p, i) => cols[i % 6].push(p));

    const colHtml = cols.map((col, ci) => {
        const items = col.map(p =>
            `<figure class="scw-item">
                <img src="${p.src}" alt="${p.piece} — publicación moldoLab" loading="lazy" decoding="async" data-lightbox>
                <figcaption class="scw-tag">${p.piece}</figcaption>
             </figure>`
        ).join('');
        // duplicado para bucle infinito sin saltos
        return `<div class="scw-col scw-col--${ci + 1}"><div class="scw-track">${items}${items}</div></div>`;
    }).join('');

    const legend = SOCIAL_DATA.map(d =>
        `<span class="scw-legend-item"><b>${d.piece}</b> · ${d.type}</span>`
    ).join('');

    root.innerHTML = `
        <div class="scw-frame">
            <div class="scw-wall">${colHtml}</div>
        </div>
        <div class="scw-legend">${legend}</div>`;
}

/* ================================================================
   10. CAMPAIGN MARQUEE (fotos 1-12 — carrusel continuo destacado)
   Full-bleed, imágenes grandes: es el carrusel protagonista.
================================================================ */
function buildCampaignSequence() {
    const root = document.getElementById('campaign-sequence');
    if (!root) return;
    root.classList.add('campaign-marquee');

    const figs = CAMPAIGN_PHOTOS.map((p, i) =>
        `<figure class="cm-item">
            <img src="${p.src}" alt="Campaña moldoLab — ${p.tag}" loading="lazy" decoding="async" data-lightbox>
            <figcaption class="cm-tag"><b>${pad(i + 1)}</b> ${p.tag}</figcaption>
         </figure>`
    ).join('');

    // duplicado x2 para loop CSS sin saltos
    root.innerHTML = `<div class="cm-track">${figs}${figs}</div>`;
}

/* ================================================================
   11. ARCHIVE MARQUEE (loop visual + pantalla completa)
================================================================ */

/* Archivo visual: solo fotos de campaña 1-12 */
const ARCHIVE_IMGS = [
    'assets/1.jpg','assets/2.jpg','assets/3.jpg','assets/4.jpg',
    'assets/5.jpg','assets/6.jpg','assets/7.jpg','assets/8.jpg',
    'assets/9.jpg','assets/10.jpg','assets/11.jpg','assets/12.JPG',
];

function buildArchiveMarquee() {
    const root = document.getElementById('archive-marquee');
    if (!root) return;
    root.classList.add('campaign-marquee');
    const figs = ARCHIVE_IMGS.map((src, i) =>
        `<figure class="cm-item">
            <img src="${src}" alt="Archivo visual moldoLab — ${pad(i + 1)}" loading="lazy" decoding="async" data-lightbox>
            <figcaption class="cm-tag"><b>${pad(i + 1)}</b> archivo</figcaption>
         </figure>`
    ).join('');
    root.innerHTML = `<div class="cm-track">${figs}${figs}</div>`;
}

/* Pantalla completa: muchas filas de marquee infinito */
function initArchiveFullscreen() {
    const btn   = document.getElementById('archive-expand-btn');
    const fs     = document.getElementById('archive-fs');
    const rowsEl = document.getElementById('archive-fs-rows');
    const close  = document.getElementById('archive-fs-close');
    if (!btn || !fs || !rowsEl) return;

    let built = false;
    function build() {
        if (built) return;
        // 4 filas con las 12 imágenes de campaña (distintos órdenes).
        // El navegador las sirve desde caché → 0 bytes extra de descarga.
        const imgs = ARCHIVE_IMGS;
        const rows = [
            imgs,                                           // 1→12, izq
            [...imgs].reverse(),                           // 12→1, der
            [...imgs.slice(4), ...imgs.slice(0,4)],       // desplazado +4, izq
            [...imgs.slice(8), ...imgs.slice(0,8)],       // desplazado +8, der
        ];
        const mk = arr => arr.concat(arr).map(src =>
            `<img src="${src}" alt="Archivo visual moldoLab" decoding="async" data-lightbox>`).join('');
        const dirs = ['left','right','left','right'];
        const durs = [44, 52, 48, 56];
        rowsEl.innerHTML = rows.map((arr, i) =>
            `<div class="vm-row vm-row--${dirs[i]}" style="--vmdur:${durs[i]}s"><div class="vm-track">${mk(arr)}</div></div>`
        ).join('');
        built = true;
    }

    function open() { build(); fs.classList.add('open'); isModalOpen = true; document.body.style.overflow = 'hidden'; }
    function closeFs() { fs.classList.remove('open'); isModalOpen = false; document.body.style.overflow = ''; }

    btn.addEventListener('click', open);
    if (close) close.addEventListener('click', closeFs);
    fs.addEventListener('click', e => { if (e.target === fs) closeFs(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && fs.classList.contains('open')) closeFs(); });
}

/* ================================================================
   12. PAUSA AUTOPLAY SEGÚN SCROLL
================================================================ */
function initAutoPauseOnScroll() {
    if (!('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const mod = autoModules.find(m => m.el === entry.target);
            if (!mod) return;
            if (entry.isIntersecting) { if (!mod.running) { mod.start(); mod.running = true; } }
            else { if (mod.running) { mod.stop(); mod.running = false; } }
        });
    }, { threshold: 0.05 });
    autoModules.forEach(m => obs.observe(m.el));
}

/* ================================================================
   13. MODAL VÍDEO
================================================================ */
function initVideoModal() {
    const modal = document.getElementById('video-modal');
    const close = document.getElementById('video-modal-close');
    if (!modal) return;
    if (close) close.addEventListener('click', closeVideoModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeVideoModal(); });
}
window.openVideoModal = function() {
    const modal = document.getElementById('video-modal');
    const vid = document.getElementById('modal-video');
    if (!modal || !vid) return;
    modal.classList.add('open'); isModalOpen = true;
    document.body.style.overflow = 'hidden';
    vid.play().catch(() => {});
};
function closeVideoModal() {
    const modal = document.getElementById('video-modal');
    const vid = document.getElementById('modal-video');
    if (!modal || !modal.classList.contains('open')) return;
    modal.classList.remove('open'); isModalOpen = false;
    document.body.style.overflow = '';
    if (vid) { vid.pause(); vid.currentTime = 0; }
}
window.closeVideoModal = closeVideoModal;

/* ================================================================
   14. LIGHTBOX (delegado — funciona con contenido dinámico)
================================================================ */
function initLightbox() {
    const lb    = document.getElementById('img-lightbox');
    const lbImg = document.getElementById('lb-img');
    const close = document.getElementById('lb-close');
    if (!lb) return;

    document.addEventListener('click', e => {
        const img = e.target.closest('[data-lightbox]');
        if (!img || !lb) return;
        if (lb.classList.contains('open')) return;
        lbImg.src = img.src; lbImg.alt = img.alt;
        lb.classList.add('open'); isModalOpen = true;
        document.body.style.overflow = 'hidden';
    });
    if (close) close.addEventListener('click', closeLightbox);
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
}
function closeLightbox() {
    const lb = document.getElementById('img-lightbox');
    if (!lb || !lb.classList.contains('open')) return;
    lb.classList.remove('open'); isModalOpen = false;
    document.body.style.overflow = '';
    document.getElementById('lb-img').src = '';
}
window.closeLightbox = closeLightbox;

/* ================================================================
   15. ACORDEONES / MENÚ / BACKTOP / CHIPS
================================================================ */
function initAccordions() {
    document.querySelectorAll('.acc-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            const panel  = btn.nextElementSibling;
            const isOpen = btn.classList.contains('open');
            document.querySelectorAll('.acc-trigger.open').forEach(b => {
                b.classList.remove('open'); b.nextElementSibling.style.maxHeight = null;
            });
            if (!isOpen) { btn.classList.add('open'); panel.style.maxHeight = panel.scrollHeight + 'px'; }
        });
    });
}
function initMobileMenu() {
    const btn = document.getElementById('menu-toggle');
    const drawer = document.getElementById('mobile-drawer');
    if (!btn || !drawer) return;
    btn.addEventListener('click', () => {
        const open = drawer.classList.toggle('open');
        btn.classList.toggle('active', open); btn.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', e => {
        if (drawer.classList.contains('open') && !drawer.contains(e.target) && !btn.contains(e.target)) closeMobileMenu();
    });
}
function closeMobileMenu() {
    document.getElementById('mobile-drawer')?.classList.remove('open');
    document.getElementById('menu-toggle')?.classList.remove('active');
}
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 700), { passive: true });
    btn.addEventListener('click', () => scrollToSection(0));
}
function initColorChips() {
    document.querySelectorAll('.color-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const hex = chip.dataset.hex; if (!hex) return;
            navigator.clipboard?.writeText(hex).then(() => {
                const label = chip.querySelector('.chip-hex'); if (!label) return;
                const orig = label.textContent; label.textContent = 'copiado';
                setTimeout(() => label.textContent = orig, 1200);
            });
        });
    });
}

/* ================================================================
   16. CURSOR BLOB
================================================================ */
(function initCursor() {
    if (REDUCED || window.matchMedia('(hover: none)').matches) return;
    const blob = document.getElementById('cursor-blob');
    if (!blob) return;
    let bx = -200, by = -200, tx = -200, ty = -200;
    document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
    (function tick() {
        bx += (tx - bx) * .09; by += (ty - by) * .09;
        blob.style.transform = `translate(${bx - 20}px, ${by - 20}px)`;
        requestAnimationFrame(tick);
    })();
})();
