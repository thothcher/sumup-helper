'use strict';

/* =========================================================
   SIMULATIONS — Next.js runs on a server, so the "გაუშვი" demos act it out
   in the browser: what the server does, what the browser gets, and when.
   The running example: "ფოთლების სანერგე", an online plant shop.
   ========================================================= */

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/** make('p', { class: 'x', onClick: fn }, 'ტექსტი', child) → element */
function make(tag, attrs, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
        if (value == null || value === false) continue;
        if (key === 'class') node.className = value;
        else if (key === 'html') node.innerHTML = value;
        else if (key.startsWith('on')) node.addEventListener(key.slice(2).toLowerCase(), value);
        else node.setAttribute(key, value === true ? '' : value);
    }
    node.append(...children.flat().filter(c => c != null && c !== false));
    return node;
}

/** Like replaceChildren, but skips null / false, so `cond ? el : null` works. */
const fill = (node, ...children) => node.replaceChildren(...children.flat().filter(c => c != null && c !== false));

/** Empties an output box and returns a fresh demo container inside it. */
function demoBox(container) {
    container.textContent = '';
    const box = make('div', { class: 'demo' });
    container.append(box);
    return box;
}

const demoButton = (label, onClick, primary = false) =>
    make('button', { type: 'button', class: `btn btn--sm${primary ? ' btn--primary' : ''}`, onClick }, label);
const demoNote = (text) => make('p', { class: 'demo-note' }, text);
const demoCode = (code) => make('pre', { class: 'code', html: `<code>${highlight(code)}</code>` });
const pill = (text, kind = '') => make('span', { class: `demo-pill${kind ? ` demo-pill--${kind}` : ''}` }, text);

/** A console that keeps its last lines. */
function demoLog(first = '', max = 12) {
    const box = make('pre', { class: 'demo-console' }, first);
    const lines = first ? [first] : [];
    box.log = (line) => {
        lines.push(line);
        while (lines.length > max) lines.shift();
        box.textContent = lines.join('\n');
        box.scrollTop = box.scrollHeight;
    };
    box.clear = () => {
        lines.length = 0;
        box.textContent = '';
    };
    return box;
}

/** A row of chips, one pressed at a time. Returns { el, select }. */
function demoChips(options, onPick) {
    const el = make('div', { class: 'demo-btns', role: 'group' });
    const select = (id) => {
        [...el.children].forEach(b => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
        onPick(id);
    };
    options.forEach(([id, label]) => el.append(make('button', { type: 'button', class: 'chip', 'data-id': id, onClick: () => select(id) }, label)));
    return { el, select };
}

/** Bars on one time axis. rows: [label, startMs, durationMs, 'slow'?]. They grow in real time. */
function timeline(rows, total) {
    const wrap = make('div', { class: 'bars' });
    const fills = rows.map(([label, start, duration, kind]) => {
        const fill = make('span', { class: `bar__fill${kind === 'slow' ? ' bar__fill--slow' : ''}` });
        fill.style.left = `${(start / total) * 100}%`;
        fill.style.width = `${(duration / total) * 100}%`;
        fill.style.setProperty('--d', `${duration}ms`);
        fill.style.setProperty('--delay', `${start}ms`);
        wrap.append(make('div', { class: 'bar' },
            make('span', {}, label),
            make('span', { class: 'bar__track' }, fill),
            make('span', { class: 'bar__time' }, `${start + duration} ms`)));
        return fill;
    });
    requestAnimationFrame(() => requestAnimationFrame(() => fills.forEach(f => f.classList.add('is-run'))));
    return wrap;
}

/** rows of objects → <table> */
function demoTable(rows) {
    if (!rows.length) return demoNote('ცარიელი შედეგი.');
    const cols = Object.keys(rows[0]);
    return make('div', { class: 'table-wrap' },
        make('table', { class: 'demo-table' },
            make('thead', {}, make('tr', {}, cols.map(c => make('th', {}, c)))),
            make('tbody', {}, rows.map(r => make('tr', {}, cols.map(c => make('td', {}, String(r[c]))))))));
}

/** One step of a request's journey: ok | bad | skip. */
const step = (state, title, detail) =>
    make('li', { class: `is-${state}`, html: icon(state === 'ok' ? 'check' : state === 'bad' ? 'x' : 'arrowRight') },
        make('span', {}, title, detail ? make('small', {}, detail) : null));

/* the shop's data: money in tetri, as the database keeps it */
const SHOP = [
    { id: 1, slug: 'monstera', name: 'მონსტერა', price: 4500, stock: 3 },
    { id: 2, slug: 'ficus', name: 'ფიკუსი', price: 3000, stock: 8 },
    { id: 3, slug: 'aloe', name: 'ალოე', price: 1200, stock: 15 },
];
const gel = (tetri) => `${(tetri / 100).toFixed(2)} ₾`;

/* =========================================================
   1. Rendering — where and when is the HTML made?
   ========================================================= */

const LIST_HTML = `<body>
  <h1>მცენარეები</h1>
  <ul>
    <li>მონსტერა: 45.00 ₾</li>
    <li>ფიკუსი: 30.00 ₾</li>
  </ul>
  <script src="/_next/…"></script>
</body>`;

const RENDER_MODES = {
    csr: {
        when: 'ბრაუზერში: ჯერ JS, მერე fetch, მერე ხატვა',
        google: 'თავიდან ცარიელ გვერდს',
        html: '<body>\n  <div id="root"></div>\n  <script src="/app.js"></script>\n</body>',
        rows: [['HTML (ცარიელი)', 0, 60], ['JS ბანდლი', 60, 450], ['fetch /api/plants', 510, 350], ['ხატვა ბრაუზერში', 860, 80]],
        visible: 940,
    },
    ssr: {
        when: 'სერვერზე, ყოველ მოთხოვნაზე თავიდან',
        google: 'მზა HTML-ს, ყოველთვის ახალს',
        html: LIST_HTML,
        rows: [['სერვერი: ბაზა + HTML', 0, 320], ['HTML ბრაუზერამდე', 320, 60], ['hydration', 380, 220]],
        visible: 380,
    },
    ssg: {
        when: 'ერთხელ, next build-ის დროს',
        google: 'მზა HTML-ს, მყისიერად',
        html: LIST_HTML,
        rows: [['CDN: მზა HTML', 0, 40], ['hydration', 40, 220]],
        visible: 40,
    },
    isr: {
        when: 'build-ისას, მერე ფონზე, მაგ. ყოველ 60 წამში',
        google: 'მზა HTML-ს; ვადის გასვლის შემდეგ ფონზე ახლდება',
        html: LIST_HTML,
        rows: [['CDN: მზა HTML', 0, 40], ['hydration', 40, 220], ['ფონზე ახალი ვერსია', 260, 320, 'slow']],
        visible: 40,
    },
};

const BUILD_OUTPUT = `$ next build
Route (app)                Size
┌ ○ /                      1.4 kB
├ ○ /about                 0.9 kB
├ ● /plants/[slug]         2.1 kB
│   ├ /plants/monstera
│   └ /plants/ficus
├ ƒ /cart                  1.8 kB
└ ƒ /api/plants            0 B

○ Static   ● SSG (generateStaticParams)   ƒ Dynamic`;

function demoRendering(container) {
    const box = demoBox(container);
    const panel = make('div', { class: 'demo' });
    const { el, select } = demoChips(
        [['csr', 'CSR'], ['ssr', 'SSR'], ['ssg', 'SSG'], ['isr', 'ISR']],
        (id) => {
            const mode = RENDER_MODES[id];
            fill(panel,
                make('p', {}, make('b', {}, 'HTML იქმნება: '), mode.when),
                make('p', {}, make('b', {}, 'Google ხედავს: '), mode.google),
                make('p', { class: 'pane__title', html: icon('code') }, 'view-source: რა მოვიდა სერვერიდან'),
                make('pre', { class: 'demo-console' }, mode.html),
                timeline(mode.rows, 1000),
                make('p', {}, 'კონტენტი ჩანს: ', pill(`${mode.visible} ms`, mode.visible > 500 ? 'bad' : '')));
        });
    box.append(el, panel,
        make('p', { class: 'pane__title', html: icon('terminal') }, 'build-ის შედეგი: Next.js თითოეულ გვერდს თავის გზას ურჩევს'),
        make('pre', { class: 'demo-console' }, BUILD_OUTPUT));
    select('csr');
}

/* =========================================================
   2. App Router — which file answers this URL?
   ========================================================= */

const APP_ROUTES = [
    { file: 'app/page.tsx', segments: [], layouts: ['app/layout.tsx'] },
    { file: 'app/plants/page.tsx', segments: ['plants'], layouts: ['app/layout.tsx', 'app/plants/layout.tsx'] },
    { file: 'app/plants/[slug]/page.tsx', segments: ['plants', '[slug]'], layouts: ['app/layout.tsx', 'app/plants/layout.tsx'], loading: 'app/plants/[slug]/loading.tsx' },
    { file: 'app/(shop)/cart/page.tsx', segments: ['cart'], layouts: ['app/layout.tsx', 'app/(shop)/layout.tsx'] },
    { file: 'app/docs/[...slug]/page.tsx', segments: ['docs', '[...slug]'], layouts: ['app/layout.tsx'] },
];

/** Static segments win over [dynamic] ones, and those over [...catch-all]. */
function matchAppRoute(url) {
    const parts = url.split(/[?#]/)[0].split('/').filter(Boolean);
    const weight = (r) => r.segments.reduce((w, s) => w + (s.startsWith('[...') ? 100 : s.startsWith('[') ? 10 : 0), 0);
    for (const route of [...APP_ROUTES].sort((a, b) => weight(a) - weight(b))) {
        const params = {};
        let ok = true;
        let rest = false;
        route.segments.forEach((seg, i) => {
            if (!ok || rest) return;
            if (seg.startsWith('[...')) {
                const tail = parts.slice(i);
                if (!tail.length) ok = false;
                params[seg.slice(4, -1)] = tail;
                rest = true;
            } else if (parts[i] === undefined) ok = false;
            else if (seg.startsWith('[')) params[seg.slice(1, -1)] = parts[i];
            else if (seg !== parts[i]) ok = false;
        });
        if (ok && (rest || parts.length === route.segments.length)) return { route, params };
    }
    return null;
}

function demoRouting(container) {
    const box = demoBox(container);
    const input = make('input', { value: '/plants/monstera', 'aria-label': 'URL', spellcheck: 'false',
        style: 'flex:1;min-width:0;padding:2px 4px;border:0;background:transparent;font:13px var(--mono)' });
    const result = make('div', { class: 'demo' });

    function show(url) {
        input.value = url;
        const found = matchAppRoute(url);
        if (!found) {
            fill(result,
                make('div', { class: 'r-card' }, pill('404', 'bad'), make('span', {}, 'არცერთი page.tsx არ დაემთხვა → app/not-found.tsx')),
                url.includes('(') ? demoNote('ფრჩხილებიანი ფოლდერი (route group) URL-ში არ ჩანს: (shop)/cart → /cart.') : null);
            return;
        }
        const { route, params } = found;
        const paramText = Object.keys(params).length
            ? `const { ${Object.keys(params).join(', ')} } = await params; // ${JSON.stringify(params)}`
            : '// params არ არის';
        fill(result,
            make('p', {}, make('b', {}, 'გვერდი: '), make('code', {}, route.file)),
            make('p', {}, make('b', {}, 'გარს ერტყმის: '), make('code', {}, [...route.layouts, 'page.tsx'].join(' → '))),
            route.loading ? make('p', {}, make('b', {}, 'სანამ იტვირთება: '), make('code', {}, route.loading)) : null,
            demoCode(paramText));
    }

    const presets = ['/', '/plants', '/plants/monstera', '/cart', '/(shop)/cart', '/docs/setup/install', '/about'];
    box.append(
        make('div', { class: 'browser' },
            make('div', { class: 'browser__bar' },
                make('span', { class: 'browser__url', style: 'display:flex;align-items:center;padding:2px 4px 2px 12px' }, 'leaves.ge', input),
                demoButton('გახსნა', () => show(input.value || '/'), true))),
        make('div', { class: 'demo-btns' }, presets.map(url => demoButton(url, () => show(url)))),
        result);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') show(input.value || '/'); });
    show('/plants/monstera');
}

/* =========================================================
   3. Server & Client — which logs go where, what code reaches the browser
   ========================================================= */

function demoServerClient(container) {
    const box = demoBox(container);
    const terminal = demoLog();
    const browser = demoLog();
    let qty = 1;
    let hydrated = false;

    const title = make('h4', {}, make('span', { class: 'skeleton', style: 'display:block;width:40%' }));
    const price = make('small', {}, '');
    const addBtn = make('button', { type: 'button', class: 'btn btn--sm btn--primary', disabled: true }, 'კალათაში (1)');
    addBtn.addEventListener('click', () => {
        if (!hydrated) return;
        qty++;
        addBtn.textContent = `კალათაში (${qty})`;
        browser.log(`click → setQty(${qty})   ← მხოლოდ ბრაუზერში`);
    });
    const tag = make('small', {}, 'AddToCart: Client Component, ჯერ არ „გაცოცხლებულა“');

    async function open() {
        terminal.clear();
        browser.clear();
        hydrated = false;
        qty = 1;
        addBtn.disabled = true;
        addBtn.textContent = 'კალათაში (1)';
        fill(title, make('span', { class: 'skeleton', style: 'display:block;width:40%' }));
        price.textContent = '';
        openBtn.disabled = true;

        terminal.log('▲ GET /plants/monstera');
        await sleep(300);
        terminal.log("PlantPage: console.log('render') ← Server Component");
        terminal.log("db: SELECT * FROM plants WHERE slug = 'monstera'");
        await sleep(300);
        terminal.log("AddToCart: console.log('render') ← pre-render სერვერზე");
        terminal.log('HTML გაიგზავნა');
        await sleep(200);
        title.textContent = 'მონსტერა';
        price.textContent = '45.00 ₾ · HTML უკვე ჩანს, ღილაკი ჯერ არ მუშაობს';
        browser.log('HTML მოვიდა: ტექსტი უკვე ეკრანზეა');
        await sleep(600);
        browser.log('JS: AddToCart.js (1.2 kB) ჩამოიტვირთა');
        browser.log("AddToCart: console.log('render') ← hydration");
        browser.log('PlantPage-ის JS: 0 kB, ის ბრაუზერში არ ჩამოდის');
        hydrated = true;
        addBtn.disabled = false;
        price.textContent = '45.00 ₾';
        tag.textContent = 'AddToCart: Client Component, მზადაა (hydrated)';
        openBtn.disabled = false;
    }

    const openBtn = demoButton('გვერდის გახსნა', open, true);
    box.append(
        make('div', { class: 'demo-btns' }, openBtn),
        make('div', { class: 'mock' }, title, price, addBtn, tag),
        make('div', { class: 'panes' },
            make('div', { class: 'pane' }, make('p', { class: 'pane__title', html: icon('server') }, 'ტერმინალი (სერვერი)'), terminal),
            make('div', { class: 'pane' }, make('p', { class: 'pane__title', html: icon('monitor') }, 'ბრაუზერის კონსოლი'), browser)),
        demoNote('Server Component-ის log მხოლოდ ტერმინალშია. Client Component-ის log ორივეგან ჩანს: სერვერზე pre-render-ისას და ბრაუზერში hydration-ისას. დაჭერის log კი მხოლოდ ბრაუზერშია.'));
    open();
}

/* =========================================================
   4. Data — waterfall vs Promise.all vs streaming
   ========================================================= */

const DATA_MODES = {
    waterfall: {
        rows: [['getPlant()', 0, 300], ['getStock()', 300, 500], ['getReviews()', 800, 900, 'slow']],
        shell: 1700, main: 1700, reviews: 1700,
        text: 'await, await, await: ყოველი მოთხოვნა წინას ელოდება, თუმცა მასზე არ არის დამოკიდებული.',
    },
    parallel: {
        rows: [['getPlant()', 0, 300], ['getStock()', 0, 500], ['getReviews()', 0, 900, 'slow']],
        shell: 900, main: 900, reviews: 900,
        text: 'Promise.all: სამივე ერთად იწყება. გვერდი ყველაზე ნელს ელოდება.',
    },
    streaming: {
        rows: [['getPlant()', 0, 300], ['getStock()', 0, 500], ['getReviews()', 0, 900, 'slow']],
        shell: 0, main: 500, reviews: 900,
        text: 'Promise.all + Suspense: გარსი მაშინვე ჩანს, მთავარი ნაწილი 500 ms-ზე, შეფასებები თავისით, როცა მზად იქნება.',
    },
};

function demoData(container) {
    const box = demoBox(container);
    const stage = make('div', { class: 'demo' });
    let timers = [];

    function play(id) {
        timers.forEach(clearTimeout);
        timers = [];
        const mode = DATA_MODES[id];
        const skel = (w) => make('span', { class: 'skeleton', style: `display:block;width:${w}` });
        const header = make('small', {}, 'ფოთლების სანერგე · კალათა');
        const main = make('div', { style: 'display:grid;gap:6px' }, skel('45%'), skel('30%'));
        const reviews = make('div', { style: 'display:grid;gap:6px' }, make('small', {}, 'შეფასებები'), skel('80%'));
        const page = make('div', { class: 'mock' }, header, main, reviews);
        page.style.visibility = mode.shell ? 'hidden' : 'visible';
        const blank = make('p', { class: 'demo-note' }, 'ეკრანი ცარიელია: სერვერი ჯერ HTML-ს აწყობს...');
        const at = (ms, fn) => timers.push(setTimeout(fn, ms));

        if (mode.shell) at(mode.shell, () => { blank.remove(); page.style.visibility = 'visible'; });
        at(mode.main, () => fill(main, make('h4', {}, 'მონსტერა'), make('span', {}, 'მარაგში: 3 ცალი')));
        at(mode.reviews, () => fill(reviews, make('small', {}, 'შეფასებები'), make('span', {}, '„ზრდის სწრაფად, ორ თვეში ახალი ფოთოლი!“')));

        fill(stage,
            timeline(mode.rows, 1700),
            demoNote(mode.text),
            mode.shell ? blank : null,
            page,
            make('p', {}, 'გარსი: ', pill(`${mode.shell} ms`, mode.shell > 1000 ? 'bad' : ''), ' · მცენარე: ', pill(`${mode.main} ms`), ' · შეფასებები: ', pill(`${mode.reviews} ms`)));
    }

    const { el, select } = demoChips(
        [['waterfall', 'რიგრიგობით'], ['parallel', 'Promise.all'], ['streaming', 'Streaming + Suspense']], play);
    box.append(el, stage);
    select('waterfall');
}

/* =========================================================
   5. Cache — "use cache", cacheTag and updateTag
   ========================================================= */

const NEW_PLANTS = ['ლავანდა', 'კაქტუსი', 'ორქიდეა', 'პეპერომია', 'ფერნი'];

function demoCache(container) {
    const box = demoBox(container);
    const db = ['მონსტერა', 'ფიკუსი', 'ალოე'];
    let cache = null;
    let added = 0;
    const log = demoLog('დააჭირე getPlants()-ს.');
    const status = make('p', {});
    const withTag = make('input', { type: 'checkbox' });
    const callBtn = demoButton('getPlants()', call, true);
    const addBtn = demoButton('+ მცენარე (Server Action)', addPlant);

    function render() {
        fill(status,
            pill(`ბაზაში: ${db.length}`),
            ' ',
            cache ? pill(`ქეშში: ${cache.length}`, cache.length === db.length ? '' : 'warn') : pill('ქეში ცარიელია', 'bad'));
    }

    async function call() {
        if (cache) {
            log.log(`getPlants() → HIT, 2 ms: ${cache.length} მცენარე`);
            if (cache.length !== db.length) log.log(`  ↳ ძველი მონაცემია! ბაზაში უკვე ${db.length} მცენარეა`);
            return render();
        }
        callBtn.disabled = addBtn.disabled = true;
        log.log('getPlants() → MISS: მივდივართ ბაზაში...');
        await sleep(600);
        cache = [...db];
        log.log(`  ↳ 600 ms: ${cache.length} მცენარე, ქეშში შეინახა (tag: 'plants', cacheLife: 'hours')`);
        callBtn.disabled = addBtn.disabled = false;
        render();
    }

    function addPlant() {
        const name = NEW_PLANTS[added++ % NEW_PLANTS.length];
        db.push(name);
        log.log(`createPlant('${name}') → INSERT, ბაზაში ${db.length}`);
        if (withTag.checked) {
            cache = null;
            log.log("  ↳ updateTag('plants') → ქეში წაიშალა, შემდეგი გამოძახება ახალს წაიკითხავს");
        } else {
            log.log('  ↳ updateTag არ გამოუძახებია: ქეშს არავინ უთხრა, რომ რამე შეიცვალა');
        }
        render();
    }

    box.append(
        make('div', { class: 'demo-btns' }, callBtn, addBtn,
            make('label', { class: 'demo-check' }, withTag, "action-ში updateTag('plants')")),
        status,
        log,
        demoNote('გამოიძახე ორჯერ (MISS, მერე HIT). მერე დაამატე მცენარე updateTag-ის გარეშე და ისევ გამოიძახე: ქეში ძველ სიას აბრუნებს. ჩართე updateTag და გაიმეორე.'));
    render();
}

/* =========================================================
   6. Server Actions — the form, the server's checks, the returned state
   ========================================================= */

function validatePlant({ name, price }) {
    const errors = {};
    if (String(name ?? '').trim().length < 2) errors.name = ['მინიმუმ 2 სიმბოლო'];
    const n = Number(price);
    if (price === '' || price == null || !Number.isFinite(n) || n <= 0) errors.price = ['ფასი დადებითი რიცხვი უნდა იყოს'];
    return Object.keys(errors).length
        ? { success: false, errors }
        : { success: true, data: { name: String(name).trim(), price: n } };
}

function demoActions(container) {
    const box = demoBox(container);
    const plants = ['მონსტერა', 'ფიკუსი'];
    const nameInput = make('input', { name: 'name', placeholder: 'ლავანდა' });
    const priceInput = make('input', { name: 'price', type: 'number', placeholder: '18' });
    const nameErr = make('span', { class: 'demo-error' });
    const priceErr = make('span', { class: 'demo-error' });
    const session = make('input', { type: 'checkbox', checked: true });
    const submit = make('button', { class: 'btn btn--sm btn--primary' }, 'დამატება');
    const journey = make('ol', { class: 'pipeline' });
    const state = make('pre', { class: 'demo-console' }, 'state = {}');
    const list = make('p', {});

    const renderList = () => fill(list, make('b', {}, 'ბაზაში: '), plants.join(', '));

    /** The "server": the same checks no matter who calls it. */
    async function createPlant(input, signedIn) {
        fill(journey, step('ok', "'use server' → სერვერზე სრულდება", `მოვიდა: ${JSON.stringify(input)}`));
        await sleep(350);
        if (!signedIn) {
            journey.append(step('bad', 'auth: getSession() → სესია არ არის'), step('skip', 'Zod, INSERT და updateTag აღარ სრულდება'));
            return { message: 'ჯერ შედი სისტემაში' };
        }
        journey.append(step('ok', 'auth: getSession() → ნინო'));
        await sleep(250);
        const parsed = validatePlant(input);
        if (!parsed.success) {
            journey.append(step('bad', 'Zod: safeParse → შეცდომები', JSON.stringify(parsed.errors)), step('skip', 'INSERT აღარ სრულდება'));
            return { errors: parsed.errors };
        }
        journey.append(step('ok', 'Zod: safeParse → ვალიდურია'));
        await sleep(250);
        plants.push(parsed.data.name);
        journey.append(step('ok', `INSERT INTO plants (name, price) VALUES ('${parsed.data.name}', ${parsed.data.price})`), step('ok', "updateTag('plants')"));
        renderList();
        return { message: 'დამატებულია' };
    }

    function showState(result) {
        state.textContent = `state = ${JSON.stringify(result, null, 2)}`;
        nameErr.textContent = result.errors?.name?.[0] ?? '';
        priceErr.textContent = result.errors?.price?.[0] ?? '';
    }

    const form = make('form', { class: 'demo-form', novalidate: true },
        make('label', {}, 'სახელი', nameInput, nameErr),
        make('label', {}, 'ფასი (₾)', priceInput, priceErr),
        make('div', { class: 'demo-btns' }, submit));
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submit.disabled = true;
        submit.textContent = 'ინახება...';           // useActionState: pending
        const result = await createPlant(Object.fromEntries(new FormData(form)), session.checked);
        showState(result);
        if (result.message === 'დამატებულია') form.reset();
        submit.disabled = false;
        submit.textContent = 'დამატება';
    });

    const attack = demoButton('თავდასხმა: action-ის პირდაპირ გამოძახება', async () => {
        showState(await createPlant({ name: '', price: '-5' }, session.checked));
    });

    box.append(
        make('div', { class: 'demo-btns' }, make('label', { class: 'demo-check' }, session, 'შესული ვარ (ნინო)'), attack),
        form,
        journey,
        state,
        list,
        demoNote('ბრაუზერში ვალიდაცია არ არის: ყველაფერს სერვერი ამოწმებს. „თავდასხმა“ UI-ს გვერდს უვლის, მაგრამ action იგივე შემოწმებებს გადის.'));
    renderList();
}

/* =========================================================
   7. Route Handlers — a small REST API to call
   ========================================================= */

const STATUS_TEXT = { 200: 'OK', 201: 'Created', 204: 'No Content', 400: 'Bad Request', 404: 'Not Found', 405: 'Method Not Allowed' };

function createPlantApi() {
    let rows = SHOP.map(p => ({ id: p.id, name: p.name, price: p.price / 100 }));
    let nextId = 4;
    return {
        reset() {
            rows = SHOP.map(p => ({ id: p.id, name: p.name, price: p.price / 100 }));
            nextId = 4;
        },
        // what app/api/plants/route.ts and app/api/plants/[id]/route.ts would answer
        handle(method, url, body) {
            const u = new URL(url, 'https://leaves.ge');
            const m = u.pathname.match(/^\/api\/plants(?:\/(\d+))?$/);
            if (!m) return [404, { error: 'ვერ მოიძებნა' }];
            const id = m[1] ? Number(m[1]) : null;
            if (method === 'GET' && id === null) {
                const items = [...rows];
                if (u.searchParams.get('sort') === 'price') items.sort((a, b) => a.price - b.price);
                return [200, items];
            }
            if (method === 'GET') {
                const plant = rows.find(p => p.id === id);
                return plant ? [200, plant] : [404, { error: 'მცენარე ვერ მოიძებნა' }];
            }
            if (method === 'POST' && id === null) {
                const parsed = validatePlant(body);
                if (!parsed.success) return [400, { error: 'არასწორი მონაცემი', fields: parsed.errors }];
                const plant = { id: nextId++, ...parsed.data };
                rows.push(plant);
                return [201, plant];
            }
            if (method === 'DELETE' && id !== null) {
                const before = rows.length;
                rows = rows.filter(p => p.id !== id);
                return rows.length < before ? [204, null] : [404, { error: 'მცენარე ვერ მოიძებნა' }];
            }
            return [405, { error: `${method} აქ არ არის: route.ts-ში ასეთი ფუნქცია არ არის დაექსპორტებული` }];
        },
    };
}

const API_CALLS = [
    ['GET', '/api/plants'],
    ['GET', '/api/plants?sort=price'],
    ['GET', '/api/plants/2'],
    ['GET', '/api/plants/99'],
    ['POST', '/api/plants', { name: '', price: -5 }],
    ['POST', '/api/plants', { name: 'ლავანდა', price: 18 }],
    ['DELETE', '/api/plants/1'],
    ['PUT', '/api/plants/2', { price: 50 }],
];

function demoApi(container) {
    const box = demoBox(container);
    const api = createPlantApi();
    const result = make('div', { class: 'demo' }, demoNote('აირჩიე მოთხოვნა.'));

    function call([method, url, body]) {
        const [status, data] = api.handle(method, url, body);
        const kind = status < 300 ? '' : status < 500 && status !== 404 ? 'warn' : 'bad';
        fill(result,
            make('pre', { class: 'demo-console' },
                `→ ${method} ${url}` + (body ? `\n${JSON.stringify(body)}` : '')),
            make('p', {}, '← ', pill(`${status} ${STATUS_TEXT[status]}`, kind)),
            data === null ? demoNote('ცარიელი პასუხი: წაშლის შემდეგ სხეული არ გვჭირდება.') : make('pre', { class: 'demo-console' }, JSON.stringify(data, null, 2)));
    }

    box.append(
        make('div', { class: 'demo-btns' }, API_CALLS.map(c => demoButton(`${c[0]} ${c[1]}${c[2] ? ' {…}' : ''}`, () => call(c)))),
        result,
        make('div', { class: 'demo-btns' }, demoButton('ბაზის განულება', () => { api.reset(); fill(result, demoNote('ბაზა საწყის მდგომარეობაშია.')); })));
}

/* =========================================================
   8. Database — Drizzle → SQL → rows, and a transaction
   ========================================================= */

function demoDb(container) {
    const box = demoBox(container);
    let plants = SHOP.map(p => ({ ...p }));
    let orders = [{ id: 1, plant_id: 2, qty: 1 }, { id: 2, plant_id: 1, qty: 2 }, { id: 3, plant_id: 3, qty: 5 }];
    const stage = make('div', { class: 'demo' });
    const plantRows = () => plants.map(p => ({ id: p.id, slug: p.slug, name: p.name, price: `${p.price} (${gel(p.price)})`, stock: p.stock }));

    const QUERIES = {
        all: {
            drizzle: 'await db.select().from(plants);',
            sql: 'SELECT * FROM plants;',
            rows: plantRows,
        },
        cheap: {
            drizzle: 'await db.select().from(plants)\n  .orderBy(asc(plants.price))\n  .limit(2);',
            sql: 'SELECT * FROM plants\nORDER BY price ASC\nLIMIT 2;',
            rows: () => plantRows().sort((a, b) => parseInt(a.price, 10) - parseInt(b.price, 10)).slice(0, 2),
        },
        slug: {
            drizzle: "await db.select().from(plants)\n  .where(eq(plants.slug, 'ficus'));",
            sql: "SELECT * FROM plants\nWHERE slug = $1;  -- $1 = 'ficus' (პარამეტრი, არა ტექსტის წებება)",
            rows: () => plantRows().filter(p => p.slug === 'ficus'),
        },
        join: {
            drizzle: 'await db.select({ order: orders.id, plant: plants.name, qty: orders.qty })\n  .from(orders)\n  .innerJoin(plants, eq(orders.plantId, plants.id));',
            sql: 'SELECT orders.id, plants.name, orders.qty\nFROM orders\nINNER JOIN plants ON orders.plant_id = plants.id;',
            rows: () => orders.map(o => ({ order: o.id, plant: plants.find(p => p.id === o.plant_id).name, qty: o.qty })),
        },
    };

    function showQuery(id) {
        if (id === 'tx') return showTransaction();
        const q = QUERIES[id];
        fill(stage,
            make('p', { class: 'pane__title' }, 'Drizzle'), demoCode(q.drizzle),
            make('p', { class: 'pane__title' }, 'SQL, რომელიც ბაზაში მიდის'), demoCode(q.sql),
            demoTable(q.rows()));
    }

    function showTransaction() {
        const qty = make('input', { type: 'number', value: '2', min: '1', max: '9', style: 'width:80px', 'aria-label': 'რაოდენობა' });
        const log = demoLog('მონსტერას მარაგი 3-ია. აირჩიე რაოდენობა და დააჭირე „ყიდვას“.');
        const tables = make('div', { class: 'demo' });
        const renderTables = () => fill(tables,
            make('p', { class: 'pane__title' }, 'plants'), demoTable(plantRows()),
            make('p', { class: 'pane__title' }, 'orders'), demoTable(orders));

        async function buy() {
            const n = Math.max(1, Number(qty.value) || 1);
            const monstera = plants.find(p => p.slug === 'monstera');
            log.clear();
            log.log('BEGIN;');
            await sleep(200);
            log.log(`SELECT stock FROM plants WHERE id = 1;   → ${monstera.stock}`);
            await sleep(200);
            if (monstera.stock < n) {
                log.log(`throw new Error('მარაგი არ კმარა')   (${monstera.stock} < ${n})`);
                log.log('ROLLBACK;   ← არაფერი შეცვლილა');
                return renderTables();
            }
            monstera.stock -= n;
            log.log(`UPDATE plants SET stock = stock - ${n} WHERE id = 1;`);
            orders = [...orders, { id: orders.length + 1, plant_id: 1, qty: n }];
            log.log(`INSERT INTO orders (plant_id, qty) VALUES (1, ${n});`);
            await sleep(200);
            log.log('COMMIT;   ← ორივე ცვლილება ერთად შეინახა');
            renderTables();
        }

        fill(stage,
            demoCode("await db.transaction(async (tx) => {\n  const [plant] = await tx.select().from(plants).where(eq(plants.id, 1));\n  if (plant.stock < qty) throw new Error('მარაგი არ კმარა');\n  await tx.update(plants).set({ stock: plant.stock - qty }).where(eq(plants.id, 1));\n  await tx.insert(orders).values({ plantId: 1, qty });\n});"),
            make('div', { class: 'demo-btns' }, make('label', { class: 'demo-check' }, 'მონსტერა ×', qty), demoButton('ყიდვა', buy, true),
                demoButton('მარაგის აღდგენა', () => { plants = SHOP.map(p => ({ ...p })); orders = orders.slice(0, 3); log.clear(); renderTables(); })),
            log,
            tables);
        renderTables();
    }

    const { el, select } = demoChips(
        [['all', 'ყველა'], ['cheap', 'იაფი, 2 ცალი'], ['slug', 'slug-ით'], ['join', 'JOIN'], ['tx', 'ტრანზაქცია']], showQuery);
    box.append(el, stage, demoNote('ფასი ბაზაში თეთრებშია (მთელი რიცხვი): 4500 = 45.00 ₾. ასე 0.1 + 0.2-ის ტიპის შეცდომები არ ჩნდება.'));
    select('all');
}

/* =========================================================
   9. Auth — proxy.ts, the session, and checks next to the data
   ========================================================= */

const AUTH_USERS = {
    guest: null,
    nino: { id: 7, name: 'ნინო', role: 'user' },
    ana: { id: 1, name: 'ანა', role: 'admin' },
};
const AUTH_ORDERS = { 41: { id: 41, userId: 7, owner: 'ნინო', plant: 'ფიკუსი' }, 43: { id: 43, userId: 12, owner: 'გიო', plant: 'მონსტერა' } };
const PROXY_MATCHER = ['/account', '/admin'];

function demoAuth(container) {
    const box = demoBox(container);
    let who = 'guest';
    const dalOff = make('input', { type: 'checkbox' });
    const journey = make('ol', { class: 'pipeline' });
    const verdict = make('p', {});

    function request(path) {
        const user = AUTH_USERS[who];
        const steps = [];
        const finish = (status, text, kind = '') => {
            fill(journey, ...steps);
            fill(verdict, make('code', {}, `GET ${path}`), ' → ', pill(status, kind), ' ', text);
        };

        // 1. proxy.ts: only for the matcher, only "is there a cookie?"
        if (PROXY_MATCHER.some(p => path.startsWith(p))) {
            if (!user) {
                steps.push(step('bad', 'proxy.ts: session cookie არ არის', "NextResponse.redirect('/login')"));
                return finish('307 → /login', 'შესვლის გვერდზე გადამისამართება', 'warn');
            }
            steps.push(step('ok', 'proxy.ts: cookie არის → NextResponse.next()', 'მხოლოდ cookie-ს არსებობა შემოწმდა, არა როლი'));
        } else {
            steps.push(step('skip', 'proxy.ts: ეს მისამართი matcher-ში არ არის, proxy არ ეშვება'));
        }

        // 2. DAL: who is it really?
        if (!user) {
            steps.push(step('bad', 'DAL: getSession() → სესია არ არის'));
            return finish('401', 'ჯერ შედი სისტემაში', 'bad');
        }
        steps.push(step('ok', `DAL: getSession() → ${user.name} (${user.role})`));

        // 3. DAL: may they do this?
        if (dalOff.checked) {
            steps.push(step('skip', 'DAL: როლის და მფლობელის შემოწმება გამორთულია!'));
        } else if (path === '/admin' && user.role !== 'admin') {
            steps.push(step('bad', "DAL: role === 'admin'? → არა"));
            return finish('403', 'არ გაქვს უფლება', 'bad');
        } else if (path.startsWith('/api/orders/')) {
            const order = AUTH_ORDERS[path.split('/').pop()];
            if (order.userId !== user.id && user.role !== 'admin') {
                steps.push(step('bad', `DAL: order.userId (${order.userId}) === session.user.id (${user.id})? → არა`));
                return finish('404', 'ვერ მოიძებნა: არ ვამხელთ, რომ სხვისი შეკვეთა არსებობს', 'bad');
            }
            steps.push(step('ok', user.role === 'admin' ? 'DAL: ადმინს ყველა შეკვეთის ნახვა შეუძლია' : 'DAL: შეკვეთა შენია'));
        } else {
            steps.push(step('ok', 'DAL: უფლება აქვს'));
        }

        if (path.startsWith('/api/orders/')) {
            const order = AUTH_ORDERS[path.split('/').pop()];
            const leak = dalOff.checked && order.userId !== user.id && user.role !== 'admin';
            return finish('200', leak ? `${order.owner}-ის შეკვეთა (${order.plant}) — IDOR! სხვისი მონაცემი გაჟონა` : `შეკვეთა #${order.id}: ${order.plant}`, leak ? 'bad' : '');
        }
        const leak = dalOff.checked && path === '/admin' && user.role !== 'admin';
        return finish('200', leak ? `ადმინის პანელი ${user.name}-ისთვის — როლი არავინ შეამოწმა!` : path === '/admin' ? 'ადმინის პანელი' : `${user.name}-ის ანგარიში`, leak ? 'bad' : '');
    }

    const users = demoChips([['guest', 'სტუმარი'], ['nino', 'ნინო (user)'], ['ana', 'ანა (admin)']], (id) => { who = id; });
    box.append(
        users.el,
        make('div', { class: 'demo-btns' }, ['/account', '/admin', '/api/orders/41', '/api/orders/43'].map(p => demoButton(`GET ${p}`, () => request(p), p === '/account'))),
        make('label', { class: 'demo-check' }, dalOff, 'DAL-ის შემოწმებები გამორთულია (ბაგიანი აპი)'),
        journey,
        verdict,
        demoNote('შეკვეთა 41 ნინოსია, 43 გიოს. სცადე ნინოთი /admin და /api/orders/43, მერე იგივე DAL-ის შემოწმებების გარეშე.'));
    users.select('guest');
}
