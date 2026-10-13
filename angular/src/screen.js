'use strict';

/* =========================================================
   SCREEN — the hero shows a live signal graph. A cursor presses the
   button in the template, temp changes, and pulses run along the wires:
   signal → computed → effect → template. When status does not change,
   the pulse stops there: computed only wakes what really changed.
   Pauses when it is off screen; shows one still frame for reduced motion.
   ========================================================= */

/* node centres in the SVG's 100 × 62 space */
const GRAPH = {
    temp: [15, 17],
    fahrenheit: [50, 9],
    status: [50, 31],
    window: [85, 15],
    view: [80, 47],
};
const WIRES = [
    ['temp', 'fahrenheit'],
    ['temp', 'status'],
    ['status', 'window'],
    ['fahrenheit', 'view'],
    ['status', 'view'],
];

function initScreen(host) {
    const wireId = (a, b) => `wire-${a}-${b}`;
    const curve = (a, b) => {
        const [x1, y1] = GRAPH[a];
        const [x2, y2] = GRAPH[b];
        const mx = (x1 + x2) / 2;
        return `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`;
    };
    const node = (key, kind, name) => `
        <div class="sig__node sig__node--${kind}" data-node="${key}" style="left:${GRAPH[key][0]}%;top:${(GRAPH[key][1] / 62) * 100}%">
            <small>${kind}</small><b>${name}</b><span data-val></span>
        </div>`;

    host.innerHTML = `
        <figure class="sig" aria-label="სიგნალების გრაფი: ღილაკი ცვლის temp-ს, ცვლილება computed-ებით effect-სა და შაბლონამდე მიდის">
            <div class="sig__frame">
                <div class="sig__bar">
                    <span class="sig__dots" aria-hidden="true"><i></i><i></i><i></i></span>
                    <span class="sig__file">greenhouse.ts</span>
                    <span class="sig__badge">zoneless</span>
                </div>
                <div class="sig__body">
                    <svg class="sig__wires" viewBox="0 0 100 62" aria-hidden="true">
                        <defs>
                            <linearGradient id="sig-grad" x1="0" x2="1"><stop offset="0" stop-color="#f0145a"/><stop offset="1" stop-color="#7c3aed"/></linearGradient>
                        </defs>
                        ${WIRES.map(([a, b]) => `<path id="${wireId(a, b)}" d="${curve(a, b)}"/>`).join('')}
                        <g class="sig__pulses"></g>
                    </svg>
                    ${node('temp', 'signal', 'temp')}
                    ${node('fahrenheit', 'computed', 'fahrenheit')}
                    ${node('status', 'computed', 'status')}
                    ${node('window', 'effect', 'ფანჯარა')}
                    <div class="sig__view" data-node="view" style="left:${GRAPH.view[0]}%;top:${(GRAPH.view[1] / 62) * 100}%">
                        <small>template</small>
                        <p data-val></p>
                        <button type="button" class="sig__btn" tabindex="-1"></button>
                    </div>
                    <span class="sig__cursor" aria-hidden="true">
                        <svg viewBox="0 0 24 24"><path d="M5 3l14 8-6.5 1.5L9 19z" fill="#1b0f2b" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>
                    </span>
                </div>
            </div>
            <figcaption class="sig__caption">temp.set() <i></i> computed <i></i> effect <i></i> template</figcaption>
        </figure>`;

    const fig = $('.sig', host);
    const body = $('.sig__body', fig);
    const pulses = $('.sig__pulses', fig);
    const button = $('.sig__btn', fig);
    const cursor = $('.sig__cursor', fig);
    const val = (key) => $(`[data-node="${key}"] [data-val]`, fig);
    let visible = true;
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(fig);

    async function wait(ms) {
        let left = ms;
        while (left > 0) {
            await sleep(Math.min(left, 100));
            if (visible && !document.hidden) left -= 100;
        }
    }

    /* the "signals": plain values here, drawn as a graph */
    let temp = 21;
    const fahrenheit = () => Math.round((temp * 9) / 5 + 32);
    const status = () => (temp >= 30 ? 'ცხელა' : 'კომფორტული');
    const windowState = (s) => (s === 'ცხელა' ? 'გაიღო' : 'დახურულია');
    let shownStatus = status();

    function flash(key) {
        const el = $(`[data-node="${key}"]`, fig);
        el.classList.remove('is-hit', 'is-skip');
        void el.offsetWidth;
        el.classList.add('is-hit');
    }

    function skip(key) {
        const el = $(`[data-node="${key}"]`, fig);
        el.classList.remove('is-hit', 'is-skip');
        void el.offsetWidth;
        el.classList.add('is-skip');
    }

    function pulse(a, b) {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('r', '1.3');
        const move = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
        move.setAttribute('dur', '0.55s');
        move.setAttribute('fill', 'freeze');
        move.setAttribute('begin', 'indefinite');
        const mpath = document.createElementNS('http://www.w3.org/2000/svg', 'mpath');
        mpath.setAttribute('href', `#${wireId(a, b)}`);
        move.append(mpath);
        dot.append(move);
        pulses.append(dot);
        move.beginElement();
        setTimeout(() => dot.remove(), 650);
    }

    function render() {
        val('temp').textContent = `${temp}°C`;
        val('fahrenheit').textContent = `${fahrenheit()}°F`;
        val('status').textContent = status();
        val('window').textContent = windowState(shownStatus);
        val('view').textContent = `${temp}°C · ${status()}`;
        button.textContent = temp >= 30 ? '−9°' : '+3°';
    }

    async function press() {
        const b = button.getBoundingClientRect();
        const s = body.getBoundingClientRect();
        cursor.style.transform = `translate(${b.left - s.left + b.width * 0.55}px, ${b.top - s.top + b.height * 0.55}px)`;
        await wait(900);
        cursor.classList.remove('is-click');
        void cursor.offsetWidth;
        cursor.classList.add('is-click');
        button.classList.add('is-press');
        setTimeout(() => button.classList.remove('is-press'), 250);

        const before = status();
        temp = temp >= 30 ? temp - 9 : temp + 3;
        val('temp').textContent = `${temp}°C`;
        flash('temp');
        await wait(150);
        pulse('temp', 'fahrenheit');
        pulse('temp', 'status');
        await wait(550);
        val('fahrenheit').textContent = `${fahrenheit()}°F`;
        flash('fahrenheit');
        const changed = status() !== before;
        if (changed) {
            val('status').textContent = status();
            flash('status');
        } else {
            skip('status');
        }
        await wait(200);
        pulse('fahrenheit', 'view');
        pulse('status', 'view');
        if (changed) pulse('status', 'window');
        await wait(550);
        if (changed) {
            shownStatus = status();
            val('window').textContent = windowState(shownStatus);
            flash('window');
        }
        render();
        flash('view');
        cursor.style.transform = '';
        await wait(1800);
    }

    render();
    if (prefersReducedMotion.matches) {
        cursor.hidden = true;
        return;
    }
    (async () => {
        await wait(1200);
        for (;;) await press();
    })();
}
