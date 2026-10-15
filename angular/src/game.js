'use strict';

/* =========================================================
   GAME — the practice window: four levels, coins, three hearts,
   help at the last heart, and a mascot with opinions.

   A level (levels.js) is a function start(stage) that talks to Game:
     Game.reward(el, coins)     right answer: coins fly from el into the counter
     Game.penalty(el)           wrong answer: −1 heart. Returns false when it was the last one
     Game.skip()                gave up on a question: no coins, the combo resets
     Game.assist()              help for this question: 'runaway' | 'vanish' | null
     Game.arm(mode, els, opts)  help on those wrong answers (opts.right = the right answer)
     Game.disarm()              the question is answered: stop the help
     Game.progress(done, total) the thin bar under the HUD
     Game.complete()            the level is over: splash, then the next one
     Game.onKey                 the level's keyboard handler while the window is on screen
     Game.picked()              the topics in play (a Set of topic ids)

   The topic drawer (a tab on the window's side, a chip in the bar on phones)
   picks which topics the questions come from. A level with no questions
   for those topics is skipped.
   ========================================================= */

const HEARTS = 3;
const COMBO_EVERY = 3;
const COMBO_BONUS = 10;
const HELP = { mercyMs: 15 * 1000 };   // the last help: think this long and every answer turns right

const Game = (() => {
    const state = {
        level: 0,
        coins: 0,
        levelStart: 0,      // coins when the level began (given back on a retry)
        levelEarned: 0,
        hearts: HEARTS,
        assists: 0,         // help left at the last heart
        assistGiven: false,
        streak: 0,
        best: 0,
        started: false,     // a level was started since the last restart
        finished: false,
        picked: new Set(),  // topic ids in play
    };
    let root;
    let stage;
    let shownCoins = 0;
    let coinFrame = 0;
    let sayTimer = 0;
    let moodTimer = 0;
    let disarmHelp = null;
    let visible = false;

    const pickLine = (list) => list[Math.floor(Math.random() * list.length)];
    const clamp = (v, min, max) => Math.min(Math.max(v, min), Math.max(min, max));
    const level = () => LEVELS[state.level];

    /* ---------- storage ---------- */

    const BEST_KEY = `${STORAGE_PREFIX}-best`;
    function loadBest() {
        try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; }
    }
    function saveBest(value) {
        state.best = value;
        try { localStorage.setItem(BEST_KEY, String(value)); } catch { /* ignore */ }
    }

    /* ---------- topics in play ---------- */

    const TOPICS_KEY = `${STORAGE_PREFIX}-topics`;
    const allTopics = () => TOPICS.map(t => t.id);
    const isFull = (picked = state.picked) => picked.size === TOPICS.length;
    const sameSet = (a, b) => a.size === b.size && [...a].every(id => b.has(id));

    /** The first level from `from` on that has questions for these topics (−1: none). */
    const nextLevel = (from, picked = state.picked) => LEVELS.findIndex((l, i) => i >= from && l.size(picked) > 0);

    function loadPicked() {
        try {
            const saved = JSON.parse(localStorage.getItem(TOPICS_KEY));
            const ids = Array.isArray(saved) ? saved.filter(id => allTopics().includes(id)) : [];
            if (ids.length && nextLevel(0, new Set(ids)) >= 0) return new Set(ids);
        } catch { /* ignore */ }
        return new Set(allTopics());
    }
    function savePicked() {
        try {
            // all topics is the default, so a topic added later joins in by itself
            if (isFull()) localStorage.removeItem(TOPICS_KEY);
            else localStorage.setItem(TOPICS_KEY, JSON.stringify([...state.picked]));
        } catch { /* ignore */ }
    }

    /** "All 8 topics" or "3 of 8: State, Lists, Effect". */
    function topicSummary() {
        if (isFull()) return `ყველა თემა (${TOPICS.length})`;
        const names = TOPICS.filter(t => state.picked.has(t.id)).map(t => t.label);
        const more = names.length > 3 ? ` +${names.length - 3}` : '';
        return `${names.length} თემა ${TOPICS.length}-დან: ${names.slice(0, 3).join(', ')}${more}`;
    }

    /* ---------- HUD ---------- */

    function renderLevels() {
        $$('.level', root).forEach((li, i) => {
            const off = LEVELS[i].size() === 0;
            const done = !off && (state.finished || i < state.level);
            li.classList.toggle('is-off', off);
            li.classList.toggle('is-done', done);
            li.classList.toggle('is-current', !off && !state.finished && i === state.level);
            li.querySelector('.level__no').innerHTML = done ? icon('check') : off ? '–' : String(i + 1);
            li.title = off ? 'ამ თემებით ეს დონე გამოტოვდება' : '';
        });
    }

    function renderPicked() {
        $$('[data-topics-toggle]', root).forEach((btn) => {
            btn.classList.toggle('is-filtered', !isFull());
            $('[data-topic-count]', btn).textContent = `${state.picked.size}/${TOPICS.length}`;
        });
    }

    function renderHearts(breaking = -1) {
        const box = $('.hearts', root);
        box.innerHTML = Array.from({ length: HEARTS }, (_, i) =>
            `<span class="heart${i >= state.hearts ? ' is-lost' : ''}${i === breaking ? ' is-breaking' : ''}">${icon('heart')}</span>`).join('');
        box.classList.toggle('is-last', state.hearts === 1 && !level()?.safe);
        box.classList.toggle('is-safe', Boolean(level()?.safe));
        box.setAttribute('aria-label', level()?.safe
            ? 'ამ დონეზე გულები დაცულია'
            : `${state.hearts} სიცოცხლე ${HEARTS}-დან`);
    }

    function renderBest() {
        $('.game__best', root).textContent = state.best ? `რეკორდი: ${state.best}` : '';
    }

    function showCoins(value) {
        const label = $('.coins__value', root);
        const from = shownCoins;
        shownCoins = value;
        cancelAnimationFrame(coinFrame);
        if (prefersReducedMotion.matches || from === value) {
            label.textContent = value;
            return;
        }
        const start = performance.now();
        const tick = (now) => {
            const t = Math.min(1, (now - start) / 450);
            label.textContent = Math.round(from + (value - from) * t);
            if (t < 1) coinFrame = requestAnimationFrame(tick);
        };
        coinFrame = requestAnimationFrame(tick);
        const box = $('.coins', root);
        box.classList.remove('is-bump');
        void box.offsetWidth;
        box.classList.add('is-bump');
    }

    function progress(done, total) {
        $('.game__progress span', root).style.width = `${total ? (done / total) * 100 : 0}%`;
    }

    /* ---------- the mascot ---------- */

    function setMood(mood, hold = 2600) {
        const face = $('[data-mascot]', root);
        face.innerHTML = mascotSvg(mood);
        face.classList.remove('is-happy', 'is-sad', 'is-panic', 'is-party');
        void face.offsetWidth;
        if (mood !== 'idle') face.classList.add(`is-${mood}`);
        clearTimeout(moodTimer);
        if (mood !== 'idle') moodTimer = setTimeout(() => setMood(state.hearts === 1 && !level()?.safe && !state.finished ? 'panic' : 'idle'), hold);
    }

    function say(text, ms = 2800) {
        const bubble = $('.mascot__say', root);
        bubble.textContent = text;
        bubble.hidden = false;
        bubble.style.animation = 'none';
        void bubble.offsetWidth;
        bubble.style.animation = '';
        clearTimeout(sayTimer);
        sayTimer = setTimeout(() => { bubble.hidden = true; }, ms);
    }

    /* ---------- flying coins and floating words ---------- */

    function floatText(el, text, kind = '') {
        if (!el?.isConnected) return;
        const r = el.getBoundingClientRect();
        const word = document.createElement('span');
        word.className = `float-text${kind ? ` float-text--${kind}` : ''}`;
        word.textContent = text;
        word.style.left = `${r.left + r.width / 2}px`;
        word.style.top = `${r.top + 4}px`;
        document.body.append(word);
        word.addEventListener('animationend', () => word.remove());
        setTimeout(() => word.remove(), 1600);
    }

    function flyCoins(fromEl, amount) {
        const target = $('.coins .coin', root);
        if (!fromEl?.isConnected || prefersReducedMotion.matches) return Promise.resolve();
        const from = fromEl.getBoundingClientRect();
        const to = target.getBoundingClientRect();
        const count = Math.min(7, Math.max(2, Math.round(amount / 6)));
        const flights = Array.from({ length: count }, (_, i) => {
            const coin = document.createElement('span');
            coin.className = 'coin coin--fly';
            const x0 = from.left + from.width / 2 + (Math.random() - 0.5) * Math.min(80, from.width);
            const y0 = from.top + from.height / 2 + (Math.random() - 0.5) * 14;
            coin.style.left = `${x0 - 11}px`;
            coin.style.top = `${y0 - 11}px`;
            document.body.append(coin);
            const dx = to.left + to.width / 2 - x0;
            const dy = to.top + to.height / 2 - y0;
            const lift = -60 - Math.random() * 50;
            return coin.animate([
                { transform: 'translate(0, 0) scale(.4)', opacity: 0 },
                { transform: `translate(${dx * 0.25}px, ${dy * 0.25 + lift}px) scale(1.15)`, opacity: 1, offset: 0.35 },
                { transform: `translate(${dx}px, ${dy}px) scale(.75)`, opacity: 0.95 },
            ], { duration: 720, delay: i * 70, easing: 'cubic-bezier(.45, 0, .3, 1)', fill: 'both' })
                .finished.then(() => coin.remove(), () => coin.remove());
        });
        return Promise.all(flights);
    }

    /* ---------- answers ---------- */

    function reward(el, amount) {
        state.streak++;
        const combo = state.streak % COMBO_EVERY === 0;
        const total = amount + (combo ? COMBO_BONUS : 0);
        state.coins += total;
        state.levelEarned += total;
        floatText(el, `+${amount}`);
        if (combo) setTimeout(() => floatText(el, `${GAME_TEXT.combo} +${COMBO_BONUS}`, 'combo'), 260);
        flyCoins(el, total).then(() => showCoins(state.coins));
        setMood('happy');
        if (combo) say(`${GAME_TEXT.combo} ${pickLine(GAME_TEXT.right)}`);
        else if (Math.random() < 0.5) say(pickLine(GAME_TEXT.right));
    }

    function penalty(el) {
        state.streak = 0;
        if (level().safe) {
            setMood('sad');
            say(pickLine(GAME_TEXT.safe));
            return true;
        }
        state.hearts = Math.max(0, state.hearts - 1);
        renderHearts(state.hearts);
        floatText(el, '−1', 'bad');
        root.classList.remove('is-hit');
        void root.offsetWidth;
        root.classList.add('is-hit');

        if (state.hearts === 0) {
            setMood('sad', 5000);
            say(pickLine(GAME_TEXT.over), 3000);
            setTimeout(gameOver, 1300);
            return false;
        }
        if (state.hearts === 1 && !state.assistGiven) {
            state.assistGiven = true;
            state.assists = HELPS.length;
            setMood('panic', 5600);
            say(GAME_TEXT.lastHeart, 6000);
        } else {
            setMood('sad');
            say(pickLine(GAME_TEXT.wrong));
        }
        return true;
    }

    function skip() {
        state.streak = 0;
        setMood('sad');
    }

    /* ---------- help at the last heart ---------- */

    /** The last heart hands these out, one per question, in this order. */
    const HELPS = ['runaway', 'vanish', 'morph', 'mercy'];

    /** The helps are a surprise: nothing on screen announces them. */
    function assist() {
        disarm();
        if (!state.assists) return null;
        const mode = HELPS[HELPS.length - state.assists];
        state.assists--;
        return mode;
    }

    /**
     * Help for one question. els are the wrong answers, opts.right the right one.
     * runaway: wrong answers glide away from the pointer (code lines, with dodge, hop aside)
     * vanish:  they go "poof" when the pointer or the focus reaches them
     * morph:   they fade into the right answer when the pointer reaches them
     * mercy:   a silent timer; when it ends, every wrong answer fades into the right one
     * During the first three a wrong answer can't be picked; during mercy it still can.
     */
    function arm(mode, els, { dodge = false, right = null } = {}) {
        disarm();
        const cleanups = [];
        const on = (target, type, fn, opts) => {
            target.addEventListener(type, fn, opts);
            cleanups.push(() => target.removeEventListener(type, fn, opts));
        };
        const block = (e) => {
            if (!e.currentTarget.dataset.assist) return;
            e.preventDefault();
            e.stopImmediatePropagation();
        };
        if (mode !== 'mercy') {
            els.forEach((el) => {
                el.dataset.assist = mode;
                on(el, 'click', block, true);
            });
        }

        /** Fades a wrong answer out and back in as the right one (it keeps its own key). */
        const morph = (el) => {
            if (!right || el.dataset.morphed) return;
            el.dataset.morphed = 'true';
            el.classList.add('is-fading');
            setTimeout(() => {
                const ownKey = el.querySelector('.option__key, .bug-line__no');
                const copy = [...right.childNodes]
                    .filter(n => !(n.nodeType === 1 && n.matches('.option__key, .bug-line__no')))
                    .map(n => n.cloneNode(true));
                el.replaceChildren(...(ownKey ? [ownKey] : []), ...copy);
                ['answer', 'out', 'line'].forEach((key) => {
                    if (right.dataset[key] !== undefined) el.dataset[key] = right.dataset[key];
                });
                delete el.dataset.assist;
                el.classList.remove('is-fading');
                el.classList.add('is-morphed');
                floatText(el, pickLine(GAME_TEXT.morph), 'poof');
            }, 280);
        };

        if (mode === 'vanish') {
            const poof = (el) => {
                if (el.classList.contains('is-poof')) return;
                el.classList.add('is-poof');
                floatText(el, pickLine(GAME_TEXT.poof), 'poof');
                setTimeout(() => {
                    el.classList.add('is-gone');
                    el.setAttribute('aria-hidden', 'true');
                    el.tabIndex = -1;
                }, 450);
            };
            els.forEach((el) => {
                on(el, 'pointerenter', () => poof(el));
                on(el, 'pointerdown', () => poof(el));
                on(el, 'focus', () => poof(el));
            });
        } else if (mode === 'morph') {
            els.forEach((el) => {
                on(el, 'pointerenter', () => morph(el));
                on(el, 'pointerdown', () => morph(el));
                on(el, 'focus', () => morph(el));
            });
        } else if (mode === 'mercy') {
            const end = Date.now() + HELP.mercyMs;
            const timer = setInterval(() => {
                const left = end - Date.now();
                if (left > 0) return;
                clearInterval(timer);
                els.forEach((el, i) => setTimeout(() => morph(el), i * 150));
                setMood('party', 3600);
                say(GAME_TEXT.mercy, 4200);
            }, 250);
            cleanups.push(() => clearInterval(timer));
        } else {
            let lastTaunt = 0;
            const taunt = (el) => {
                const now = Date.now();
                if (now - lastTaunt < 1400) return;
                lastTaunt = now;
                floatText(el, pickLine(GAME_TEXT.taunts), 'taunt');
            };
            els.forEach(el => el.classList.add('is-runaway'));

            if (dodge) {
                // a code line hops gently to the side, then slowly comes back
                els.forEach((el) => {
                    let side = Math.random() < 0.5 ? -1 : 1;
                    let back = 0;
                    const hop = () => {
                        side = -side;
                        el.style.transform = `translateX(${side * 40}px) rotate(${side * -1}deg)`;
                        taunt(el);
                        clearTimeout(back);
                        back = setTimeout(() => { el.style.transform = ''; }, 1700);
                    };
                    on(el, 'pointerenter', hop);
                    on(el, 'pointerdown', hop);
                    on(el, 'focus', hop);
                });
            } else {
                const offsets = new Map(els.map(el => [el, { x: 0, y: 0 }]));
                const lastMove = new Map();
                const place = (el, x, y) => {
                    const area = stage.getBoundingClientRect();
                    const r = el.getBoundingClientRect();
                    const o = offsets.get(el);
                    const baseX = r.left - o.x;
                    const baseY = r.top - o.y;
                    o.x = clamp(x, area.left + 8 - baseX, area.right - 8 - r.width - baseX);
                    o.y = clamp(y, area.top + 8 - baseY, area.bottom - 8 - r.height - baseY);
                    el.style.transform = `translate(${o.x}px, ${o.y}px)`;
                };
                const jump = (el) => {
                    const area = stage.getBoundingClientRect();
                    const r = el.getBoundingClientRect();
                    const o = offsets.get(el);
                    place(el,
                        area.left + 8 + Math.random() * Math.max(0, area.width - r.width - 16) - (r.left - o.x),
                        area.top + 8 + Math.random() * Math.max(0, area.height - r.height - 16) - (r.top - o.y));
                    taunt(el);
                };
                // a calm glide: a short step, and each button moves at most once every 380 ms
                on(document, 'pointermove', (e) => {
                    const now = performance.now();
                    for (const el of els) {
                        if (!el.isConnected || now - (lastMove.get(el) || 0) < 380) continue;
                        const r = el.getBoundingClientRect();
                        const gapX = Math.max(0, r.left - e.clientX, e.clientX - r.right);
                        const gapY = Math.max(0, r.top - e.clientY, e.clientY - r.bottom);
                        if (Math.hypot(gapX, gapY) > 46) continue;
                        lastMove.set(el, now);
                        const dx = r.left + r.width / 2 - e.clientX;
                        const dy = r.top + r.height / 2 - e.clientY;
                        const len = Math.hypot(dx, dy) || 1;
                        const o = offsets.get(el);
                        const before = { x: o.x, y: o.y };
                        place(el, o.x + (dx / len) * 85, o.y + (dy / len) * 85);
                        // cornered against the window's edge: glide somewhere else
                        if (Math.hypot(o.x - before.x, o.y - before.y) < 25) jump(el);
                        else taunt(el);
                    }
                }, { passive: true });
                els.forEach((el) => {
                    on(el, 'pointerdown', () => jump(el));
                    on(el, 'focus', () => jump(el));
                });
            }
        }
        disarmHelp = () => cleanups.forEach(fn => fn());
    }

    function disarm() {
        disarmHelp?.();
        disarmHelp = null;
    }

    /* ---------- the topic drawer ---------- */

    let drawer;
    let staged = new Set();     // the drawer's choice, until it is applied
    let opener = null;
    let hideTimer = 0;

    const isPicking = () => drawer.classList.contains('is-open');
    const playing = () => (state.started && !state.finished) || state.coins > 0;

    /** How many questions (of every level) touch this topic. */
    const countFor = (id) => LEVELS.reduce((n, l) =>
        n + l.items().filter(item => [].concat(l.topicsOf(item)).includes(id)).length, 0);

    function drawerTemplate() {
        return `
            <div class="topic-drawer__scrim" data-close-topics></div>
            <section class="topic-drawer__panel" role="dialog" aria-labelledby="topic-drawer-title">
                <header class="topic-drawer__head">
                    <div>
                        <p class="topic-drawer__kicker">${icon('filter')}ფილტრი</p>
                        <h3 class="topic-drawer__title" id="topic-drawer-title">რა შევიდეს თამაშში?</h3>
                        <p class="topic-drawer__lead">მონიშნე თემები, რომლებიც უკვე გაიარე: კითხვები მხოლოდ მათზე იქნება.</p>
                    </div>
                    <button class="icon-btn" type="button" data-close-topics aria-label="დახურვა">${icon('x')}</button>
                </header>
                <div class="topic-drawer__body">
                    <div class="topic-drawer__quick">
                        <button class="btn btn--sm" type="button" data-pick="all">${icon('check')}ყველა</button>
                        <button class="btn btn--sm btn--ghost" type="button" data-pick="none">გასუფთავება</button>
                        <span class="topic-drawer__tally"></span>
                    </div>
                    <ul class="topic-picks" aria-label="თემები">
                        ${TOPICS.map((t, i) => `
                            <li style="--i: ${i}"><label class="topic-pick">
                                <input type="checkbox" value="${t.id}">
                                <span class="topic-pick__icon">${icon(t.icon)}</span>
                                <span class="topic-pick__text"><b>${t.label}</b><small>${countFor(t.id)} კითხვა</small></span>
                                <span class="topic-pick__box">${icon('check')}</span>
                            </label></li>`).join('')}
                    </ul>
                    <div class="topic-plan">
                        <p class="topic-plan__title">ასე გამოვა</p>
                        <ol class="topic-plan__list"></ol>
                    </div>
                </div>
                <footer class="topic-drawer__foot">
                    <p class="topic-drawer__note" aria-live="polite"></p>
                    <button class="btn btn--primary" type="button" data-apply-topics></button>
                </footer>
            </section>`;
    }

    /** Draws the drawer for the staged choice: ticks, the plan per level, the button. */
    function syncDrawer() {
        $$('.topic-pick input', drawer).forEach((box) => {
            box.checked = staged.has(box.value);
            box.closest('.topic-pick').classList.toggle('is-on', box.checked);
        });
        $('.topic-drawer__tally', drawer).textContent = `${staged.size} / ${TOPICS.length}`;
        $('.topic-plan__list', drawer).innerHTML = LEVELS.map((l, i) => {
            const n = l.size(staged);
            const why = staged.size < (l.minTopics || 1) ? `${l.minTopics}+ თემა სჭირდება` : 'ამ თემებზე არ არის';
            return `
                <li class="${n ? '' : 'is-off'}">
                    <span>${i + 1}. ${l.name}</span>
                    ${n ? `<b>${n}</b><small>${l.unit}</small>` : `<small>${why}</small>`}
                </li>`;
        }).join('');

        const total = LEVELS.reduce((sum, l) => sum + l.size(staged), 0);
        const levels = LEVELS.filter(l => l.size(staged) > 0).length;
        const btn = $('[data-apply-topics]', drawer);
        const note = $('.topic-drawer__note', drawer);
        const summary = `${total} კითხვა · ${levels} დონე`;
        btn.disabled = !total;
        if (!staged.size) {
            btn.innerHTML = 'აირჩიე თემა';
            note.textContent = 'ერთი თემა მაინც მონიშნე.';
        } else if (!total) {
            btn.innerHTML = 'კითხვები არ არის';
            note.textContent = 'ამ თემებზე კითხვები ჯერ არ გვაქვს.';
        } else if (sameSet(staged, state.picked)) {
            btn.innerHTML = `${icon('check')}მზადაა`;
            note.textContent = summary;
        } else if (playing()) {
            btn.innerHTML = `${icon('rotate')}თავიდან დაწყება`;
            note.textContent = `${summary}. მიმდინარე თამაში და მონეტები განულდება.`;
        } else {
            btn.innerHTML = `${icon('play')}გამოყენება`;
            note.textContent = summary;
        }
    }

    function openTopics(from) {
        if (isPicking()) return closeTopics();
        clearTimeout(hideTimer);
        opener = from;
        staged = new Set(state.picked);
        syncDrawer();
        drawer.style.setProperty('--top', `${$('.game__bar', root).offsetHeight}px`);
        drawer.hidden = false;
        void drawer.offsetWidth;
        drawer.classList.add('is-open');
        root.classList.add('is-picking');
        $$('[data-topics-toggle]', root).forEach(b => b.setAttribute('aria-expanded', 'true'));
        $$('.game__hud, .game__progress, .game__stage', root).forEach((el) => { el.inert = true; });
        if (root.getBoundingClientRect().top < 0) {
            root.scrollIntoView({ block: 'start', behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
        }
        $('.topic-pick input', drawer).focus({ preventScroll: true });
    }

    function closeTopics({ focus = true } = {}) {
        if (!isPicking()) return;
        drawer.classList.remove('is-open');
        root.classList.remove('is-picking');
        $$('[data-topics-toggle]', root).forEach(b => b.setAttribute('aria-expanded', 'false'));
        $$('.game__hud, .game__progress, .game__stage', root).forEach((el) => { el.inert = false; });
        hideTimer = setTimeout(() => { drawer.hidden = true; }, prefersReducedMotion.matches ? 0 : 400);
        if (!focus) return;
        // back to whatever opened it, or to the toggle this screen size shows
        const back = opener?.isConnected && opener.offsetParent ? opener
            : $$('[data-topics-toggle]', root).find(b => b.offsetParent);
        back?.focus({ preventScroll: true });
    }

    function applyTopics() {
        if (sameSet(staged, state.picked)) return closeTopics();
        state.picked = new Set(staged);
        savePicked();
        renderPicked();
        closeTopics({ focus: false });
        restart();
        setMood('happy');
        say(pickLine(GAME_TEXT.picked || ['ახალი თემები, ახალი თამაში!']), 3200);
        $('[data-go]', stage)?.focus({ preventScroll: true });
    }

    function initDrawer() {
        drawer = $('.topic-drawer', root);
        drawer.innerHTML = drawerTemplate();
        root.addEventListener('click', (e) => {
            const from = e.target.closest('[data-topics]');
            if (from) openTopics(from);
        });
        drawer.addEventListener('click', (e) => {
            if (e.target.closest('[data-close-topics]')) return closeTopics();
            const pick = e.target.closest('[data-pick]');
            if (pick) {
                staged = new Set(pick.dataset.pick === 'all' ? allTopics() : []);
                return syncDrawer();
            }
            if (e.target.closest('[data-apply-topics]')) applyTopics();
        });
        drawer.addEventListener('change', (e) => {
            const box = e.target.closest('.topic-pick input');
            if (!box) return;
            if (box.checked) staged.add(box.value);
            else staged.delete(box.value);
            syncDrawer();
        });
    }

    /* ---------- screens between levels ---------- */

    function resetStage() {
        disarm();
        Game.onKey = null;
        ['onclick', 'onpointerdown', 'onpointermove', 'onpointerup', 'onpointercancel', 'onkeydown']
            .forEach(handler => { stage[handler] = null; });
        if (typeof unmountDetached === 'function') unmountDetached();
    }

    function confetti(count) {
        const colors = GAME_TEXT.confetti;
        return `<div class="confetti" aria-hidden="true">${Array.from({ length: count }, () => {
            const style = [
                `left:${Math.random() * 100}%`,
                `--c:${pickLine(colors)}`,
                `--t:${1.8 + Math.random() * 1.6}s`,
                `--d:${Math.random() * 0.7}s`,
                `--x:${(Math.random() - 0.5) * 220}px`,
                `--r:${Math.random() * 900 - 450}deg`,
            ].join(';');
            return `<i style="${style}"></i>`;
        }).join('')}</div>`;
    }

    function splash({ done } = {}) {
        resetStage();
        const lvl = level();
        progress(0, 1);
        renderLevels();
        renderHearts();
        stage.innerHTML = `
            <div class="splash${done ? ' splash--next' : ''}">
                ${done ? confetti(26) : ''}
                ${done ? `<p class="splash__done">${icon('check')}<span>${done.name}: გავლილია · +${done.earned}</span></p>` : ''}
                <p class="splash__kicker">${GAME_TEXT.levelWord}</p>
                <p class="splash__num" data-num>${done ? done.from + 1 : state.level + 1}</p>
                <h3 class="splash__title">${lvl.title}</h3>
                <p class="splash__rules">${lvl.intro}</p>
                <ul class="splash__facts">${[`${icon('listOrdered')}${lvl.size()} ${lvl.unit}`, ...lvl.facts()].map(f => `<li>${f}</li>`).join('')}</ul>
                <div class="splash__actions">
                    <button class="btn btn--primary" type="button" data-go>${icon('play')}${done ? 'შემდეგი დონე' : 'დაწყება'}</button>
                </div>
                ${done ? '' : `
                <p class="splash__topics">${icon('filter')}<span>${topicSummary()}</span>
                    <button class="splash__change" type="button" data-topics>შეცვლა</button></p>`}
            </div>`;
        if (done) {
            const num = $('[data-num]', stage);
            setTimeout(() => {
                num.classList.add('is-flip');
                setTimeout(() => { num.textContent = state.level + 1; }, 330);
            }, 700);
        }
        stage.onclick = (e) => { if (e.target.closest('[data-go]')) startLevel(); };
        Game.onKey = (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
                e.preventDefault();
                startLevel();
            }
        };
    }

    function startLevel() {
        resetStage();
        state.levelStart = state.coins;
        state.levelEarned = 0;
        state.hearts = HEARTS;
        state.assists = 0;
        state.assistGiven = false;
        state.streak = 0;
        state.started = true;
        renderLevels();
        renderHearts();
        setMood('idle');
        stage.innerHTML = '';
        if (root.getBoundingClientRect().top < 0) {
            root.scrollIntoView({ block: 'start', behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
        }
        level().start(stage);
    }

    function complete() {
        const finished = level();
        const earned = state.levelEarned;
        progress(1, 1);
        const next = nextLevel(state.level + 1);
        if (next < 0) return victory(finished, earned);
        const from = state.level;
        state.level = next;
        state.hearts = HEARTS;
        setMood('party', 3200);
        say(pickLine(GAME_TEXT.levelUp), 3200);
        splash({ done: { name: finished.name, earned, from } });
    }

    function gameOver() {
        resetStage();
        const lost = state.levelEarned;
        // with few topics a retry can only reshuffle the same questions
        const again = level().pool(state.picked).length > level().size()
            ? 'სცადე ისევ: კითხვები სხვა იქნება.'
            : 'სცადე ისევ: ახლა უკვე იცი, სად იმალება მახე.';
        state.coins = state.levelStart;
        state.levelEarned = 0;
        showCoins(state.coins);
        progress(0, 1);
        stage.innerHTML = `
            <div class="splash splash--over">
                <div class="splash__icon">${icon('heartCrack')}</div>
                <p class="splash__kicker">${GAME_TEXT.overKicker}</p>
                <h3 class="splash__title">${pickLine(GAME_TEXT.over)}</h3>
                <p class="splash__rules">${lost ? `ამ დონეზე მოგროვებული ${lost} ${GAME_TEXT.coinName} იკარგება. ` : ''}${again}</p>
                <div class="splash__actions">
                    <button class="btn btn--primary" type="button" data-retry>${icon('rotate')}დონის თავიდან დაწყება</button>
                    <button class="btn" type="button" data-restart>მთლიანად თავიდან</button>
                </div>
            </div>`;
        stage.onclick = (e) => {
            if (e.target.closest('[data-retry]')) startLevel();
            if (e.target.closest('[data-restart]')) restart();
        };
    }

    function maxCoins() {
        return LEVELS.reduce((sum, l) => sum + l.size() * l.maxPer + Math.floor(l.size() / COMBO_EVERY) * COMBO_BONUS, 0);
    }

    function victory(finished, earned) {
        resetStage();
        state.finished = true;
        renderLevels();
        renderHearts();
        const max = maxCoins();
        const ratio = state.coins / max;
        const rank = GAME_TEXT.ranks.find(([min]) => ratio >= min)[1];
        // a record only counts on the full game: fewer topics, fewer coins to win
        const full = isFull();
        const record = full && state.coins > state.best;
        if (record) saveBest(state.coins);
        renderBest();
        const allLevels = LEVELS.every(l => l.size() > 0);
        const best = !full ? `${state.picked.size} თემა ${TOPICS.length}-დან: რეკორდი მხოლოდ ყველა თემით ითვლება`
            : record ? 'ახალი რეკორდია!' : `რეკორდი: ${state.best}`;
        stage.innerHTML = `
            <div class="splash splash--win">
                ${confetti(70)}
                <p class="splash__done">${icon('check')}<span>${finished.name}: გავლილია · +${earned}</span></p>
                <p class="splash__kicker">${allLevels ? GAME_TEXT.winKicker : 'ყველა არჩეული დონე გავლილია'}</p>
                <p class="splash__score"><span class="coin" aria-hidden="true"></span><span class="splash__num">${state.coins}</span></p>
                <h3 class="splash__title">${icon('crown')} ${rank}</h3>
                <p class="splash__rules">${best} · მაქსიმუმი: ${max} ${GAME_TEXT.coinName}</p>
                <div class="splash__actions">
                    <button class="btn btn--primary" type="button" data-restart>${icon('rotate')}თავიდან თამაში</button>
                </div>
            </div>`;
        setMood('party', 6000);
        say(pickLine(GAME_TEXT.win), 6000);
        stage.onclick = (e) => { if (e.target.closest('[data-restart]')) restart(); };
    }

    function restart() {
        Object.assign(state, { level: nextLevel(0), coins: 0, levelStart: 0, levelEarned: 0, hearts: HEARTS, assists: 0, assistGiven: false, streak: 0, started: false, finished: false });
        showCoins(0);
        setMood('idle');
        splash();
    }

    /* ---------- the window ---------- */

    function init() {
        root = $('#game');
        state.best = loadBest();
        state.picked = loadPicked();
        state.level = nextLevel(0);
        const toggle = 'data-topics data-topics-toggle aria-expanded="false" aria-controls="game-topics"';
        root.innerHTML = `
            <div class="topic-rail">
                <button class="topic-tab" type="button" ${toggle} title="რომელი თემები შევიდეს თამაშში?">
                    <span class="topic-tab__arrow">${icon('chevronRight')}</span>
                    <span class="topic-tab__label">თემები</span>
                    <b class="topic-tab__count" data-topic-count></b>
                </button>
            </div>
            <div class="game__bar">
                <span class="game__dots" aria-hidden="true"><i></i><i></i><i></i></span>
                <button class="topic-chip" type="button" ${toggle}>${icon('filter')}<span>თემები</span><b data-topic-count></b>${icon('chevronRight', 'topic-chip__arrow')}</button>
                <span class="game__title">${GAME_TEXT.windowTitle}</span>
                <span class="game__best"></span>
                <button class="icon-btn" type="button" data-restart-game title="თამაში თავიდან" aria-label="თამაში თავიდან">${icon('rotate')}</button>
            </div>
            <div class="game__hud">
                <div class="mascot-wrap">
                    <button class="mascot" type="button" data-mascot aria-label="${GAME_TEXT.mascotName}: დააჭირე"></button>
                    <p class="mascot__say" role="status" hidden></p>
                </div>
                <ol class="levels" aria-label="დონეები">
                    ${LEVELS.map((l, i) => `<li class="level"><span class="level__no">${i + 1}</span><span class="level__name">${l.name}</span></li>`).join('')}
                </ol>
                <div class="hud__stats">
                    <div class="hearts" role="img"></div>
                    <div class="coins" title="${GAME_TEXT.coinName}">
                        <span class="coin" aria-hidden="true"></span><b class="coins__value">0</b><span class="sr-only"> ${GAME_TEXT.coinName}</span>
                    </div>
                </div>
            </div>
            <div class="game__progress" aria-hidden="true"><span></span></div>
            <div class="game__stage"></div>
            <div class="topic-drawer" id="game-topics" hidden></div>`;
        stage = $('.game__stage', root);
        renderBest();
        renderPicked();
        initDrawer();
        setMood('idle');

        $('[data-restart-game]', root).addEventListener('click', restart);
        $('[data-mascot]', root).addEventListener('click', () => {
            setMood('happy');
            say(pickLine(GAME_TEXT.poke));
        });

        new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(root);
        document.addEventListener('keydown', (e) => {
            if (isPicking()) {
                // the drawer is open: the level's keys (1, 2… A, B…) wait
                if (e.key === 'Escape') {
                    e.preventDefault();
                    closeTopics();
                }
                return;
            }
            if (!visible || !Game.onKey || e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.target.matches('input, textarea, select')) return;
            Game.onKey(e);
        });

        splash();
    }

    return { init, reward, penalty, skip, assist, arm, disarm, progress, complete, picked: () => state.picked, onKey: null };
})();
