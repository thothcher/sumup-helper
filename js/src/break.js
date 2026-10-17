'use strict';

/* =========================================================
   8. COFFEE BREAK — the ☕ button next to the seasons.
      The same idea as the break in the lecture decks: a full-screen
      countdown, here over the forest, with a small internet radio
      (data/radio.js). The leaves keep falling behind it.

      While the break plays the radio, Kancheli's song (music.js) steps aside
      and comes back when the break ends. The two talk through two events:
      'radio:play' / 'radio:stop' (from here) and 'music:play' (from music.js).

      No letter shortcuts: the game's levels already use 1-8 and A-D.
      Keys inside the break: Esc hides, Space plays or pauses, +/- change the time,
      ↑/↓ change the volume.
   ========================================================= */

function initBreak(startSeason) {
    const btn = $('#coffee-btn');
    const btnTime = $('.coffee-btn__time', btn);
    const baseTitle = document.title;

    const store = {
        get(name, fallback) {
            try {
                const raw = localStorage.getItem(`${STORAGE_PREFIX}-break-${name}`);
                return raw === null ? fallback : JSON.parse(raw);
            } catch { return fallback; }
        },
        set(name, value) {
            try { localStorage.setItem(`${STORAGE_PREFIX}-break-${name}`, JSON.stringify(value)); } catch { /* ignore */ }
        },
    };

    const s = {
        open: false,        // the overlay is on screen
        running: false,     // the countdown is going (also while the overlay is hidden)
        over: false,        // the countdown reached 0: "welcome back"
        end: 0,
        total: 0,
        left: 0,
        timer: 0,
        genre: store.get('genre', 'jazz'),
        station: store.get('station', 'fip-jazz'),
        volume: store.get('volume', 0.6),
        wantRadio: false,   // intent: the radio should be playing
        playing: false,
        failures: 0,        // stations in a row that did not start
        fadeId: 0,
        tip: Math.floor(Math.random() * BREAK_TIPS.length),
        tipTimer: 0,
        season: startSeason,
        status: { kind: 'off' },
    };

    let el = null;          // the dialog, built on first use
    let bg = null;          // the forest photo behind it
    let audio = null;
    let actx = null;

    const pad = (n) => String(n).padStart(2, '0');
    const fmt = (sec) => { const t = Math.max(0, Math.ceil(sec)); return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`; };
    const clock = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const clamp01 = (v) => Math.min(1, Math.max(0, v));
    const station = () => RADIO.find(r => r.id === s.station) || RADIO[0];

    /* ---------- the picture ---------- */

    function cupSvg() {
        return `
        <svg class="cup" viewBox="0 0 240 230" role="img" aria-label="ყავა / coffee">
            <defs>
                <linearGradient id="cup-shade" x1="0" x2="1">
                    <stop offset="0" stop-color="#fff" stop-opacity=".0"/>
                    <stop offset=".72" stop-color="#7a5a2c" stop-opacity=".0"/>
                    <stop offset="1" stop-color="#7a5a2c" stop-opacity=".28"/>
                </linearGradient>
            </defs>
            <ellipse cx="120" cy="204" rx="96" ry="14" fill="#000" opacity=".28"/>
            <ellipse cx="120" cy="196" rx="92" ry="15" fill="#e9dcb8"/>
            <ellipse cx="120" cy="192" rx="66" ry="9" fill="#d8c79a"/>
            <path d="M178 112 h8 c26 0 26 44 0 44 h-14" fill="none" stroke="#f6edd2" stroke-width="11" stroke-linecap="round"/>
            <path d="M56 98 h128 v28 c0 38 -28 66 -64 66 s-64 -28 -64 -66 z" fill="#f6edd2"/>
            <path d="M56 98 h128 v28 c0 38 -28 66 -64 66 s-64 -28 -64 -66 z" fill="url(#cup-shade)"/>
            <ellipse cx="120" cy="98" rx="64" ry="12" fill="#d9c9a0"/>
            <ellipse cx="120" cy="99" rx="55" ry="9" fill="#4a2912"/>
            <ellipse cx="108" cy="97" rx="22" ry="3" fill="#7a4d29" opacity=".75"/>
            <g class="cup__steam" fill="none" stroke="#e9f5ec" stroke-width="5" stroke-linecap="round">
                <path d="M96 76 c-10 -11 10 -20 0 -33"/>
                <path d="M120 72 c-10 -11 10 -20 0 -33"/>
                <path d="M144 76 c-10 -11 10 -20 0 -33"/>
            </g>
            <g transform="translate(14 168) rotate(-28) scale(1.7)">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" fill="#e6c34a" stroke="#b8912a" stroke-width="1" stroke-linejoin="round"/>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" fill="none" stroke="#8a6a1c" stroke-width="1.3" stroke-linecap="round"/>
            </g>
        </svg>`;
    }

    function template() {
        return `
        <div class="break__ui">
            <header class="break__top">
                <p class="break__label" id="break-title">${icon('coffee')}<span>JS ფოთლები · ${bi('შესვენება', 'Coffee break', 'bi--line')}</span></p>
                <div class="break__actions">
                    ${Lang.button('break__btn')}
                    <button class="break__btn" type="button" data-b="hide">${icon('minimize')}${bi('დამალვა', 'Hide', 'bi--line')}</button>
                    <button class="break__btn" type="button" data-b="end">${icon('x')}${bi('დასრულება', 'End break', 'bi--line')}</button>
                </div>
            </header>

            <main class="break__main">
                <div class="break__count">
                    <p class="break__kicker">${bi('გაიჭიმე, დალიე ყავა, თვალებს დაუსვენე. დაბრუნებამდე დარჩა:', 'Stretch, grab a coffee, rest your eyes. Back in:')}</p>
                    <p class="break__time" data-time>${fmt(BREAK_MINUTES * 60)}</p>
                    <div class="break__bar" aria-hidden="true"><span></span></div>
                    <div class="break__meta">
                        <span class="break__back">${bi('დაბრუნება', 'Back at', 'bi--line')} <b data-back>--:--</b></span>
                        <span class="break__adj">
                            <button type="button" data-b="minus" aria-label="−1">${icon('minus')}1 ${bi('წთ', 'min', 'bi--line')}</button>
                            <button type="button" data-b="plus" aria-label="+1">${icon('plus')}1 ${bi('წთ', 'min', 'bi--line')}</button>
                        </span>
                    </div>
                    <p class="break__tip">${icon('bulb')}<span data-tip></span></p>
                </div>

                <div class="break__welcome">
                    <p class="break__kicker">${bi('შესვენება დასრულდა', 'The break is over')}</p>
                    <h2 class="break__hello">${bi('კეთილი დაბრუნება.', 'Welcome back.')}</h2>
                    <button class="btn btn--primary" type="button" data-b="resume">${icon('arrowRight')}${bi('სწავლაზე დაბრუნება', 'Back to learning', 'bi--line')}</button>
                </div>

                <div class="break__cup" aria-hidden="true">${cupSvg()}</div>
            </main>

            <section class="break__player" aria-label="რადიო · Radio">
                <button class="break__play" type="button" data-b="play" aria-label="დაკვრა ან პაუზა · Play or pause">${icon('play')}</button>
                <div class="break__now">
                    <p class="break__status" role="status"><span class="live"></span><span data-status></span><span class="break__eq" aria-hidden="true"><i></i><i></i><i></i></span></p>
                    <div class="break__genres" role="group" aria-label="ჟანრი · Genre"></div>
                    <div class="break__stations" role="group" aria-label="სადგური · Station"></div>
                </div>
                <label class="break__vol">${icon('volume')}<span class="sr-only">ხმა · Volume</span><input type="range" min="0" max="1" step="0.01" data-volume></label>
            </section>
        </div>`;
    }

    /* ---------- the radio ---------- */

    function say(kind, a, b) {
        s.status = { kind, a, b };
        if (!el) return;
        const n = a ? escapeHtml(a.name) : '';
        const lines = {
            off: ['რადიო გამორთულია. აირჩიე სადგური.', 'Radio off. Pick a station.'],
            connecting: [`უკავშირდება: ${n}…`, `Connecting to ${n}…`],
            buffering: [`იტვირთება: ${n}…`, `Buffering ${n}…`],
            live: [`ეთერშია: ${n}`, `Live: ${n}`],
            press: [`დააჭირე ▶: ჩაირთვება ${n}`, `Press play to start ${n}.`],
            skip: [`${n} მიუწვდომელია. ვცდი: ${b ? escapeHtml(b.name) : ''}…`, `${n} is unavailable. Trying ${b ? escapeHtml(b.name) : ''}…`],
            fail: ['სადგური ვერ ჩაირთო. შეამოწმე ინტერნეტი ან აირჩიე სხვა.', 'Could not start. Check your internet or pick another one.'],
        };
        $('[data-status]', el).innerHTML = bi(...lines[kind], 'bi--line');
    }

    function renderRadio() {
        if (!el) return;
        el.classList.toggle('is-playing', s.playing);
        $('[data-b="play"]', el).innerHTML = icon(s.playing || s.wantRadio ? 'pause' : 'play');
        $('.break__genres', el).innerHTML = RADIO_GENRES.map(g => `
            <button type="button" data-b="genre" data-id="${g.id}" aria-pressed="${g.id === s.genre}">${bi(g.ka, g.en, 'bi--line')}</button>`).join('');
        $('.break__stations', el).innerHTML = RADIO.filter(r => r.genre === s.genre).map(r => `
            <button type="button" data-b="station" data-id="${r.id}" aria-pressed="${r.id === s.station}">${escapeHtml(r.name)}<small>${escapeHtml(r.where)}</small></button>`).join('');
    }

    function fadeRadio(to, ms, pauseAfter = false) {
        clearInterval(s.fadeId);
        if (!audio) return;
        const from = audio.volume;
        const t0 = performance.now();
        // setInterval, not rAF: it keeps going (slowly) when the tab is in the background
        s.fadeId = setInterval(() => {
            const t = Math.min(1, (performance.now() - t0) / ms);
            audio.volume = clamp01(from + (to - from) * t);
            if (t < 1) return;
            clearInterval(s.fadeId);
            if (pauseAfter) silence();
        }, 30);
    }

    /** Stops the stream for good (a live stream has nothing to resume). */
    function silence() {
        s.wantRadio = false;
        s.playing = false;
        if (audio) {
            audio.pause();
            audio.removeAttribute('src');
            audio.load();
        }
        say('off');
        renderRadio();
    }

    function playRadio(id = s.station) {
        const st = RADIO.find(r => r.id === id) || RADIO[0];
        s.station = st.id;
        s.genre = st.genre;
        store.set('station', s.station);
        store.set('genre', s.genre);
        s.wantRadio = true;
        audio.src = st.url;
        audio.volume = 0;
        say('connecting', st);
        renderRadio();
        document.dispatchEvent(new CustomEvent('radio:play'));
        const started = audio.play();
        if (started?.catch) {
            started.catch((err) => {
                // Only a blocked autoplay ends here. A stream that fails is dealt with by the 'error'
                // event (it moves on to the next station), and a promise left over from an earlier
                // station must not undo the one that is playing now.
                if (err?.name !== 'NotAllowedError' || s.station !== st.id) return;
                s.wantRadio = false;
                s.playing = false;
                say('press', st);
                renderRadio();
            });
        }
        fadeRadio(s.volume, 1800);
    }

    function togglePlay() {
        if (s.wantRadio || s.playing) fadeRadio(0, 500, true);
        else playRadio();
    }

    /** The next station of this genre after the one that failed. */
    function nextStation() {
        const list = RADIO.filter(r => r.genre === s.genre);
        const at = list.findIndex(r => r.id === s.station);
        return list[(at + 1) % list.length];
    }

    function bindAudio() {
        audio = new Audio();
        audio.preload = 'none';
        audio.volume = s.volume;
        audio.addEventListener('playing', () => {
            s.playing = true;
            s.failures = 0;
            say('live', station());
            renderRadio();
        });
        audio.addEventListener('waiting', () => { if (s.wantRadio) say('buffering', station()); });
        audio.addEventListener('pause', () => { s.playing = false; renderRadio(); });
        audio.addEventListener('ended', () => { if (s.wantRadio) playRadio(s.station); });   // a live stream closed: reconnect
        audio.addEventListener('error', () => {
            if (!audio.getAttribute('src') || !s.wantRadio) return;
            s.playing = false;
            const failed = station();
            const next = nextStation();
            if (s.failures++ < 3 && next && next.id !== failed.id) {
                say('skip', failed, next);
                playRadio(next.id);
                say('skip', failed, next);      // keep the explanation visible while the next one connects
            } else {
                s.wantRadio = false;
                say('fail');
                renderRadio();
            }
        });
    }

    function setVolume(v) {
        s.volume = clamp01(v);
        store.set('volume', s.volume);
        clearInterval(s.fadeId);
        if (audio) audio.volume = s.volume;
        if (el) $('[data-volume]', el).value = s.volume;
    }

    /* ---------- the countdown ---------- */

    function unlockSound() {
        try {
            actx = actx || new (window.AudioContext || window.webkitAudioContext)();
            actx.resume?.();
        } catch { /* no chime then */ }
    }

    /** Three soft notes, like the lecture decks. */
    function chime() {
        try {
            unlockSound();
            const now = actx.currentTime;
            [659.25, 783.99, 1046.5].forEach((freq, i) => {
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                const t = now + i * 0.2;
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
                osc.connect(gain);
                gain.connect(actx.destination);
                osc.start(t);
                osc.stop(t + 1.9);
            });
        } catch { /* no chime then */ }
    }

    function renderButton(text) {
        btn.classList.toggle('is-running', s.running);
        btn.classList.toggle('is-over', s.over);
        btnTime.hidden = !s.running;
        if (s.running) btnTime.textContent = text;
        btn.setAttribute('aria-label', s.running ? `შესვენება: დარჩა ${text}` : 'შესვენება');
        btn.title = s.running ? `შესვენება · Coffee break: ${text}` : 'შესვენება · Coffee break';
    }

    function tick() {
        s.left = Math.max(0, (s.end - Date.now()) / 1000);
        const text = fmt(s.left);
        $('[data-time]', el).textContent = text;
        $('[data-back]', el).textContent = clock(new Date(s.end));
        $('.break__bar span', el).style.width = `${s.total ? (s.left / s.total) * 100 : 0}%`;
        el.classList.toggle('is-last-minute', s.left <= 60);
        renderButton(text);
        document.title = `☕ ${text} · ${baseTitle}`;
        if (s.left <= 0) finish();
    }

    function begin(seconds = BREAK_MINUTES * 60) {
        s.total = seconds;
        s.end = Date.now() + seconds * 1000;
        s.running = true;
        s.over = false;
        el.classList.remove('is-over', 'is-last-minute');
        clearInterval(s.timer);
        s.timer = setInterval(tick, 250);
        unlockSound();      // we are inside the click: later, the chime may play
        tick();
    }

    function adjust(seconds) {
        if (!s.running) return;
        s.end = Math.max(Date.now() + 5000, s.end + seconds * 1000);
        s.total = Math.max(s.total, (s.end - Date.now()) / 1000);
        tick();
    }

    function finish() {
        clearInterval(s.timer);
        s.running = false;
        s.over = true;
        el.classList.add('is-over');
        el.classList.remove('is-last-minute');
        chime();
        if (s.wantRadio) fadeRadio(0, 6000, true);
        renderButton();
        document.title = `☕ დაბრუნდი! · ${baseTitle}`;
        if (!s.open) show();
    }

    /** Ends the break completely: no countdown, no radio, Kancheli comes back. */
    function stop() {
        clearInterval(s.timer);
        s.running = false;
        s.over = false;
        if (s.wantRadio || s.playing) fadeRadio(0, 1200, true);
        el.classList.remove('is-over', 'is-last-minute');
        renderButton();
        document.title = baseTitle;
        hide();
        document.dispatchEvent(new CustomEvent('radio:stop'));
    }

    /* ---------- showing and hiding ---------- */

    const pageParts = () => $$('.hero, .chain, .wrap, .foot');

    function paintBackground() {
        bg.style.setProperty('--photo', `url("${s.season.image}")`);
        bg.style.setProperty('--dim', s.season.dim);
    }

    function nextTip() {
        const [ka, en] = BREAK_TIPS[s.tip];
        const tip = $('[data-tip]', el);
        tip.classList.remove('is-in');
        void tip.offsetWidth;
        tip.innerHTML = bi(ka, en);
        tip.classList.add('is-in');
        s.tip = (s.tip + 1) % BREAK_TIPS.length;
    }

    function onKey(e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        e.stopPropagation();        // the game's keys (1-8, A-D, Enter) must not reach the page behind
        const typing = e.target.matches('input, textarea, select');
        if (e.key === 'Escape') {
            e.preventDefault();
            hide();
        } else if (e.key === ' ' && !e.target.closest('button, a, input')) {
            e.preventDefault();
            if (!s.over) togglePlay();
        } else if (!typing && (e.key === '+' || e.key === '=')) {
            adjust(60);
        } else if (!typing && (e.key === '-' || e.key === '_')) {
            adjust(-60);
        } else if (!typing && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            e.preventDefault();
            setVolume(s.volume + (e.key === 'ArrowUp' ? 0.05 : -0.05));
        }
    }

    function show() {
        if (!el) build();
        paintBackground();
        bg.hidden = false;
        el.hidden = false;
        void el.offsetWidth;                // let the fade start from transparent
        bg.classList.add('is-open');
        el.classList.add('is-open');
        document.documentElement.classList.add('is-break');
        pageParts().forEach((part) => { part.inert = true; });
        s.open = true;
        btn.setAttribute('aria-expanded', 'true');
        window.addEventListener('keydown', onKey, true);
        nextTip();
        clearInterval(s.tipTimer);
        s.tipTimer = setInterval(nextTip, 20000);
        $('[data-b="play"]', el).focus({ preventScroll: true });
    }

    function hide() {
        if (!s.open) return;
        // after "welcome back" the break is finished: hiding it means it is over
        if (s.over) return stop();
        s.open = false;
        bg.classList.remove('is-open');
        el.classList.remove('is-open');
        document.documentElement.classList.remove('is-break');
        pageParts().forEach((part) => { part.inert = false; });
        btn.setAttribute('aria-expanded', 'false');
        window.removeEventListener('keydown', onKey, true);
        clearInterval(s.tipTimer);
        setTimeout(() => {
            if (s.open) return;
            bg.hidden = true;
            el.hidden = true;
        }, prefersReducedMotion.matches ? 0 : 400);
        btn.focus({ preventScroll: true });
    }

    function build() {
        bg = document.createElement('div');
        bg.className = 'break-bg';
        bg.setAttribute('aria-hidden', 'true');
        bg.hidden = true;

        el = document.createElement('div');
        el.className = 'break';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-modal', 'true');
        el.setAttribute('aria-labelledby', 'break-title');
        el.hidden = true;
        el.innerHTML = template();
        document.body.append(bg, el);

        bindAudio();
        const volume = $('[data-volume]', el);
        volume.value = s.volume;
        volume.addEventListener('input', () => setVolume(Number(volume.value)));

        el.addEventListener('click', (e) => {
            const target = e.target.closest('[data-b]');
            if (!target) return;
            const { b: act, id } = target.dataset;
            if (act === 'hide') hide();
            else if (act === 'end' || act === 'resume') stop();
            else if (act === 'minus') adjust(-60);
            else if (act === 'plus') adjust(60);
            else if (act === 'play') togglePlay();
            else if (act === 'station') playRadio(id);
            else if (act === 'genre') {
                s.genre = id;
                store.set('genre', id);
                renderRadio();
                // while the radio plays, a new genre starts with its first station
                if (s.wantRadio) playRadio(RADIO.find(r => r.genre === id).id);
            }
        });

        say('off');
        renderRadio();
        Lang.apply();
    }

    /* ---------- wiring ---------- */

    btn.addEventListener('click', () => {
        if (s.open) return hide();
        if (!el) build();
        show();
        if (!s.running && !s.over) {
            begin();
            playRadio();
        }
    });

    // the page's own song starts: the radio makes room for it
    document.addEventListener('music:play', () => {
        if (s.wantRadio || s.playing) fadeRadio(0, 600, true);
    });

    renderButton();

    return {
        /** The forest behind the break follows the season. */
        setSeason(next) {
            s.season = next;
            if (bg) paintBackground();
        },
    };
}
