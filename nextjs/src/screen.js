'use strict';

/* =========================================================
   SCREEN — the rig in the hero: a server terminal on one side, a browser
   on the other, and packets running between them. It loops through four
   scenes: streaming a page, a Server Action, an API call, a proxy redirect.
   Pauses when it is off screen; shows one still frame for reduced motion.
   ========================================================= */

function initScreen(host) {
    host.innerHTML = `
        <figure class="rig" aria-label="სერვერი გვერდს ბრაუზერში ნაწილ-ნაწილ აგზავნის">
            <div class="rig__head">
                <span class="rig__brand">NET//RUN</span>
                <span class="rig__req"></span>
                <span class="rig__live"><i></i>LIVE</span>
            </div>
            <div class="rig__body">
                <section class="rig__pane rig__pane--server">
                    <p class="rig__label">${icon('server')}SERVER · node</p>
                    <div class="rig__log" aria-hidden="true"></div>
                </section>
                <div class="rig__wire" aria-hidden="true"></div>
                <section class="rig__pane rig__pane--client">
                    <p class="rig__label">${icon('monitor')}BROWSER</p>
                    <p class="rig__url"></p>
                    <div class="rig__page"></div>
                </section>
            </div>
            <figcaption class="rig__caption"><span>server</span><i></i><span>stream</span><i></i><span>browser</span></figcaption>
        </figure>`;

    const rig = $('.rig', host);
    const logBox = $('.rig__log', rig);
    const wire = $('.rig__wire', rig);
    const page = $('.rig__page', rig);
    const url = $('.rig__url', rig);
    const req = $('.rig__req', rig);
    let visible = true;

    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(rig);

    async function wait(ms) {
        let left = ms;
        while (left > 0) {
            await sleep(Math.min(left, 100));
            if (visible && !document.hidden) left -= 100;
        }
    }

    function log(html) {
        const line = document.createElement('span');
        line.className = 'rig__line';
        line.innerHTML = html;
        logBox.append(line);
        while (logBox.children.length > 11) logBox.firstElementChild.remove();
    }

    /** dir: 'down' = server → browser, 'up' = browser → server */
    function packet(dir = 'down') {
        for (let i = 0; i < 3; i++) {
            const p = document.createElement('span');
            p.className = `packet packet--${dir}`;
            p.style.animationDelay = `${i * 110}ms`;
            wire.append(p);
            p.addEventListener('animationend', () => p.remove());
        }
    }

    const set = (html) => { page.innerHTML = html; };
    const skel = (w) => `<span class="rig-skel" style="width:${w}"></span>`;

    async function streamScene() {
        req.textContent = 'GET /plants/monstera';
        url.textContent = 'leaves.ge/plants/monstera';
        set('<p class="rig-blank">…</p>');
        log('<b class="c">▲ GET</b> /plants/monstera');
        await wait(600);
        log('  ├ layout.tsx <i>გარსი</i>');
        packet();
        await wait(500);
        set(`<p class="rig-site">ფოთლების სანერგე</p>${skel('55%')}${skel('35%')}<div class="rig-reviews">${skel('80%')}</div>`);
        await wait(500);
        log('  ├ PlantPage  getPlant() <span class="g">38ms</span>');
        packet();
        await wait(500);
        const reviews = $('.rig-reviews', page).outerHTML;
        set(`<p class="rig-site">ფოთლების სანერგე</p><h4>მონსტერა</h4><p class="rig-price">45.00 ₾</p><button class="rig-btn" type="button" tabindex="-1">კალათაში</button>${reviews}`);
        log('  ├ &lt;Suspense&gt; <span class="y">streaming…</span>');
        await wait(1100);
        log('  └ Reviews    <span class="g">420ms</span>');
        packet();
        await wait(500);
        $('.rig-reviews', page).innerHTML = '<small>შეფასება:</small> „ორ თვეში ახალი ფოთოლი!“';
        log('<span class="g">✓ 200</span> · 512ms');
        await wait(700);
        const btn = $('.rig-btn', page);
        btn.classList.add('is-live');
        btn.insertAdjacentHTML('afterend', '<span class="rig-chip">hydrated</span>');
        await wait(900);
        btn.classList.add('is-press');
        btn.textContent = 'კალათაში (1)';
        $('.rig-chip', page).textContent = 'click → მხოლოდ ბრაუზერში';
        await wait(2200);
    }

    async function actionScene() {
        req.textContent = 'POST · Server Action';
        url.textContent = 'leaves.ge/plants/new';
        set(`<p class="rig-site">ახალი მცენარე</p>
            <div class="rig-form"><span class="rig-input"></span><button class="rig-btn is-live" type="button" tabindex="-1">დამატება</button></div>
            <ul class="rig-list"><li>მონსტერა</li><li>ფიკუსი</li></ul>`);
        const input = $('.rig-input', page);
        await wait(600);
        for (const ch of 'ლავანდა') {
            input.textContent += ch;
            await wait(110);
        }
        await wait(400);
        $('.rig-btn', page).classList.add('is-press');
        packet('up');
        await wait(500);
        log('<b class="m">⚡ action</b> createPlant(formData)');
        await wait(400);
        log('  ├ auth   <span class="g">✓ ნინო</span>');
        await wait(350);
        log('  ├ zod    <span class="g">✓ ვალიდურია</span>');
        await wait(350);
        log('  ├ INSERT INTO plants');
        await wait(350);
        log("  └ updateTag(<span class=\"y\">'plants'</span>)");
        packet();
        await wait(500);
        $('.rig-list', page).insertAdjacentHTML('beforeend', '<li class="is-new">ლავანდა</li>');
        input.textContent = '';
        await wait(2400);
    }

    async function apiScene() {
        req.textContent = 'GET /api/plants';
        url.textContent = 'leaves.ge/api/plants?sort=price';
        set('<p class="rig-blank">…</p>');
        log('<b class="c">▲ GET</b> /api/plants?sort=price');
        await wait(500);
        log('  └ route.ts GET → <span class="g">200</span> · 9ms');
        packet();
        await wait(500);
        set(`<pre class="rig-json">[
  { "id": 3, "name": "ალოე", "price": 12 },
  { "id": 2, "name": "ფიკუსი", "price": 30 },
  { "id": 1, "name": "მონსტერა", "price": 45 }
]</pre>`);
        await wait(2600);
    }

    async function proxyScene() {
        req.textContent = 'GET /admin · სტუმარი';
        url.textContent = 'leaves.ge/admin';
        set('<p class="rig-blank">…</p>');
        log('<b class="c">▲ GET</b> /admin');
        await wait(500);
        log('  ├ proxy.ts  session cookie? <span class="r">✗</span>');
        await wait(400);
        log('  └ <span class="y">307</span> → /login');
        packet();
        await wait(500);
        url.textContent = 'leaves.ge/login';
        set(`<p class="rig-site">შესვლა</p><span class="rig-input">nino@leaves.ge</span><span class="rig-input">••••••••</span><button class="rig-btn is-live" type="button" tabindex="-1">შესვლა</button>`);
        await wait(2600);
    }

    if (prefersReducedMotion.matches) {
        url.textContent = 'leaves.ge/plants/monstera';
        req.textContent = 'GET /plants/monstera';
        ['<b class="c">▲ GET</b> /plants/monstera', '  ├ PlantPage       <span class="g">38ms</span>', '<span class="g">✓ 200</span> · 512ms'].forEach(log);
        set('<p class="rig-site">ფოთლების სანერგე</p><h4>მონსტერა</h4><p class="rig-price">45.00 ₾</p><button class="rig-btn is-live" type="button" tabindex="-1">კალათაში</button>');
        return;
    }

    (async () => {
        const scenes = [streamScene, actionScene, apiScene, proxyScene];
        for (let n = 0; ; n++) {
            await scenes[n % scenes.length]();
            log('<span class="d">────────────</span>');
        }
    })();
}
