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
        finished: false,
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

    /* ---------- HUD ---------- */

    function renderLevels() {
        $$('.level', root).forEach((li, i) => {
            const done = state.finished || i < state.level;
            li.classList.toggle('is-done', done);
            li.classList.toggle('is-current', !state.finished && i === state.level);
            li.querySelector('.level__no').innerHTML = done ? icon('check') : String(i + 1);
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
                <p class="splash__num" data-num>${done ? state.level : state.level + 1}</p>
                <h3 class="splash__title">${lvl.title}</h3>
                <p class="splash__rules">${lvl.intro}</p>
                <ul class="splash__facts">${lvl.facts().map(f => `<li>${f}</li>`).join('')}</ul>
                <div class="splash__actions">
                    <button class="btn btn--primary" type="button" data-go>${icon('play')}${done ? 'შემდეგი დონე' : 'დაწყება'}</button>
                </div>
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
        if (state.level === LEVELS.length - 1) return victory(finished, earned);
        state.level++;
        state.hearts = HEARTS;
        setMood('party', 3200);
        say(pickLine(GAME_TEXT.levelUp), 3200);
        splash({ done: { name: finished.name, earned } });
    }

    function gameOver() {
        resetStage();
        const lost = state.levelEarned;
        state.coins = state.levelStart;
        state.levelEarned = 0;
        showCoins(state.coins);
        progress(0, 1);
        stage.innerHTML = `
            <div class="splash splash--over">
                <div class="splash__icon">${icon('heartCrack')}</div>
                <p class="splash__kicker">${GAME_TEXT.overKicker}</p>
                <h3 class="splash__title">${pickLine(GAME_TEXT.over)}</h3>
                <p class="splash__rules">${lost ? `ამ დონეზე მოგროვებული ${lost} ${GAME_TEXT.coinName} იკარგება. ` : ''}სცადე ისევ: კითხვები სხვა იქნება.</p>
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
        const record = state.coins > state.best;
        if (record) saveBest(state.coins);
        renderBest();
        stage.innerHTML = `
            <div class="splash splash--win">
                ${confetti(70)}
                <p class="splash__done">${icon('check')}<span>${finished.name}: გავლილია · +${earned}</span></p>
                <p class="splash__kicker">${GAME_TEXT.winKicker}</p>
                <p class="splash__score"><span class="coin" aria-hidden="true"></span><span class="splash__num">${state.coins}</span></p>
                <h3 class="splash__title">${icon('crown')} ${rank}</h3>
                <p class="splash__rules">${record ? 'ახალი რეკორდია!' : `რეკორდი: ${state.best}`} · მაქსიმუმი: ${max} ${GAME_TEXT.coinName}</p>
                <div class="splash__actions">
                    <button class="btn btn--primary" type="button" data-restart>${icon('rotate')}თავიდან თამაში</button>
                </div>
            </div>`;
        setMood('party', 6000);
        say(pickLine(GAME_TEXT.win), 6000);
        stage.onclick = (e) => { if (e.target.closest('[data-restart]')) restart(); };
    }

    function restart() {
        Object.assign(state, { level: 0, coins: 0, levelStart: 0, levelEarned: 0, hearts: HEARTS, assists: 0, assistGiven: false, streak: 0, finished: false });
        showCoins(0);
        setMood('idle');
        splash();
    }

    /* ---------- the window ---------- */

    function init() {
        root = $('#game');
        state.best = loadBest();
        root.innerHTML = `
            <div class="game__bar">
                <span class="game__dots" aria-hidden="true"><i></i><i></i><i></i></span>
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
            <div class="game__stage"></div>`;
        stage = $('.game__stage', root);
        renderBest();
        setMood('idle');

        $('[data-restart-game]', root).addEventListener('click', restart);
        $('[data-mascot]', root).addEventListener('click', () => {
            setMood('happy');
            say(pickLine(GAME_TEXT.poke));
        });

        new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(root);
        document.addEventListener('keydown', (e) => {
            if (!visible || !Game.onKey || e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.target.matches('input, textarea, select')) return;
            Game.onKey(e);
        });

        splash();
    }

    return { init, reward, penalty, skip, assist, arm, disarm, progress, complete, onKey: null };
})();
