/* ── moldoLab · Música persistente entre páginas ── */
(function () {
    if (document.getElementById('moldo-music-widget')) return;

    const TRACK      = 'assets/NATHY PELUSO, Rawayana - MALPORTADA (Video Oficial).mp3';
    const wasPlaying = sessionStorage.getItem('moldo_music_playing') === '1';
    const wasMuted   = sessionStorage.getItem('moldo_music_muted')   === '1';
    const savedTime  = parseFloat(sessionStorage.getItem('moldo_music_time') || '0');
    const firstVisit = sessionStorage.getItem('moldo_music_playing') === null;

    /* ── Audio ── */
    const audio = document.createElement('audio');
    audio.id    = 'bg-music';
    audio.loop  = true;
    audio.volume = 0.35;
    const src = document.createElement('source');
    src.src  = TRACK;
    src.type = 'audio/mpeg';
    audio.appendChild(src);
    document.body.appendChild(audio);

    /* ── Widget ── */
    const widget = document.createElement('div');
    widget.id        = 'moldo-music-widget';
    widget.className = 'music-widget';
    widget.innerHTML = `
        <p class="music-hint" id="music-hint" style="${firstVisit ? '' : 'display:none'}">
            <span id="hint-l1"></span><span class="hint-cursor" id="hint-cursor"></span>
        </p>
        <button class="music-btn" id="music-btn" aria-label="Silenciar música">
            <svg id="music-icon-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"/>
            </svg>
            <svg id="music-icon-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15" style="display:none">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"/>
            </svg>
        </button>`;
    document.body.appendChild(widget);

    const hint   = document.getElementById('music-hint');
    const l1     = document.getElementById('hint-l1');
    const cursor = document.getElementById('hint-cursor');
    const btn    = document.getElementById('music-btn');
    const iconOn = document.getElementById('music-icon-on');
    const iconOff= document.getElementById('music-icon-off');
    let started  = false;

    /* ── Typewriter (solo primera visita) ── */
    if (firstVisit && l1) {
        function typeLine(el, text, speed) {
            return new Promise(resolve => {
                let i = 0;
                (function next() {
                    if (i >= text.length) { resolve(); return; }
                    const ch = document.createElement('span');
                    ch.className  = 'tw-ch';
                    ch.textContent = text[i] === ' ' ? ' ' : text[i];
                    el.appendChild(ch);
                    i++;
                    setTimeout(next, speed + Math.random() * 55 - 15);
                })();
            });
        }
        setTimeout(function () {
            typeLine(l1, 'ACTIVA EL SONIDO', 75).then(function () {
                if (cursor) cursor.style.animation = 'cursorBlink 0.65s step-end infinite';
            });
        }, 2000);
    }

    /* ── Helpers ── */
    function hideHint() {
        if (!hint) return;
        hint.style.opacity = '0';
        hint.style.pointerEvents = 'none';
        setTimeout(function () { if (hint.parentNode) hint.remove(); }, 650);
    }

    function showState(muted) {
        iconOn.style.display  = muted ? 'none'  : 'block';
        iconOff.style.display = muted ? 'block' : 'none';
        btn.setAttribute('aria-label', muted ? 'Activar música' : 'Silenciar música');
    }

    function start() {
        audio.muted = false;
        audio.play().then(function () {
            started = true;
            showState(false);
            hideHint();
            sessionStorage.setItem('moldo_music_playing', '1');
            sessionStorage.setItem('moldo_music_muted', '0');
        }).catch(function () {});
    }

    /* ── Guardar estado al salir de la página ── */
    window.addEventListener('pagehide', function () {
        sessionStorage.setItem('moldo_music_playing', (!audio.paused && !audio.muted) ? '1' : '0');
        sessionStorage.setItem('moldo_music_muted',   audio.muted ? '1' : '0');
        sessionStorage.setItem('moldo_music_time',    String(audio.currentTime));
    });

    /* ── Arranque ── */
    if (!firstVisit) {
        /* Visita de regreso — restaurar estado */
        audio.currentTime = savedTime;
        if (wasPlaying) {
            audio.muted = false;
            audio.play().then(function () {
                started = true;
                showState(false);
            }).catch(function () { showState(true); });
        } else {
            audio.muted = wasMuted;
            started = true;
            showState(true);
        }
    } else {
        /* Primera visita — intentar autoplay */
        audio.play().then(function () {
            started = true;
            audio.muted = false;
            showState(false);
        }).catch(function () {
            showState(true);
            var unlock = function () {
                if (!started) start();
                document.removeEventListener('click',  unlock);
                document.removeEventListener('scroll', unlock);
                document.removeEventListener('keydown', unlock);
            };
            document.addEventListener('click',  unlock);
            document.addEventListener('scroll', unlock, { passive: true });
            document.addEventListener('keydown', unlock);
        });
    }

    /* ── Botón ── */
    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        hideHint();
        if (!started) { start(); return; }
        if (audio.paused) {
            audio.play().then(function () { audio.muted = false; showState(false); }).catch(function () {});
        } else {
            audio.muted = !audio.muted;
            showState(audio.muted);
        }
    });
})();
