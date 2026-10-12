'use strict';

/* =========================================================
   LIVE DEMOS — the "გაუშვი" button runs real React 18 (vendor/).
   The page has no build step, so the demos use createElement instead of JSX:
       h('p', { className: 'x' }, 'ტექსტი')   is   <p className="x">ტექსტი</p>
   ========================================================= */

const h = React.createElement;
const Fragment = React.Fragment;
const { useState, useEffect, useRef, useReducer, useContext, createContext } = React;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/* ---- one React root per demo; a root whose box was replaced is unmounted ---- */

const reactRoots = new Map();   // host element → root

/** Unmounts roots whose box left the page (or sits inside `inside`). */
function unmountDetached(inside = null) {
    for (const [host, root] of reactRoots) {
        if (!host.isConnected || inside?.contains(host)) {
            root.unmount();
            reactRoots.delete(host);
        }
    }
}

function mountReact(container, element) {
    unmountDetached(container);
    container.textContent = '';
    const host = document.createElement('div');
    host.className = 'demo';
    container.append(host);
    const root = ReactDOM.createRoot(host);
    root.render(element);
    reactRoots.set(host, root);
}

/* ---- small building blocks ---- */

function LeafIcon({ color = 'green', size }) {
    return h('span', {
        className: `r-leaf r-leaf--${color}`,
        style: size ? { '--s': `${size}px` } : undefined,
        'aria-hidden': true,
        dangerouslySetInnerHTML: { __html: icon('leaf') },
    });
}

const Btn = ({ primary, ...props }) =>
    h('button', { type: 'button', className: `btn btn--sm${primary ? ' btn--primary' : ''}`, ...props });
const Note = (props) => h('p', { className: 'demo-note', ...props });
const Console = ({ lines }) => h('pre', { className: 'demo-console' }, lines.join('\n') || ' ');

/** A log kept in state: the last 10 lines. */
function useLog(first) {
    const [lines, setLines] = useState(first ? [first] : []);
    const log = (line) => setLines(prev => [...prev.slice(-9), line]);
    return [lines, log];
}

/* =========================================================
   1. Components & props
   ========================================================= */

function LeafCard({ color, size }) {
    return h('span', { className: 'r-leaf-card' }, h(LeafIcon, { color, size }), color);
}

function Card({ title, children }) {
    return h('div', { className: 'r-card' }, h('b', null, title), children);
}

function DemoComponents() {
    return h(Fragment, null,
        h(Note, null, 'ეს ნამდვილი React-ია: ერთი Leaf კომპონენტი სამჯერ, სამი სხვადასხვა props-ით.'),
        h('section', { className: 'r-garden', 'aria-label': 'ბაღი' },
            h(LeafCard, { color: 'green' }),
            h(LeafCard, { color: 'yellow', size: 36 }),
            h(LeafCard, { color: 'dry', size: 20 })),
        h(Card, { title: 'მუხა' },
            h(LeafIcon, null),
            h('span', null, '12 წლის: ეს ტექსტი Card-ს children-ად გადაეცა')));
}

/* =========================================================
   2. State & events
   ========================================================= */

function DemoState() {
    const [leaves, setLeaves] = useState(3);
    const renders = useRef(0);
    renders.current++;

    function addThree() {
        setLeaves(n => n + 1);
        setLeaves(n => n + 1);
        setLeaves(n => n + 1);
    }

    return h(Fragment, null,
        h('div', { className: 'r-garden', 'aria-label': `${leaves} ფოთოლი` },
            Array.from({ length: leaves }, (_, i) =>
                h(LeafIcon, { key: i, color: i % 3 === 2 ? 'yellow' : 'green' }))),
        leaves === 0 && h(Note, null, 'ბაღი ცარიელია.'),
        h('div', { className: 'demo-btns' },
            h(Btn, { primary: true, onClick: () => setLeaves(leaves + 1) }, '+1 ფოთოლი'),
            h(Btn, { onClick: () => setLeaves(Math.max(0, leaves - 1)) }, '−1'),
            h(Btn, { onClick: addThree }, '+3 (updater სამჯერ)')),
        h(Note, null,
            `leaves = ${leaves} · კომპონენტი დარენდერდა ${renders.current}-ჯერ. `
            + 'ყოველი setLeaves ახალ რენდერს იწვევს, DOM-ს ხელით არ ვეხებით. '
            + '+3 სამ განახლებას ერთ რენდერად აერთიანებს (batching).'));
}

/* =========================================================
   3. Lists & keys — the same list with key={index} and key={tree.id}
   ========================================================= */

const START_TREES = [
    { id: 1, name: 'მუხა' },
    { id: 2, name: 'ცაცხვი' },
    { id: 3, name: 'ნეკერჩხალი' },
];

/** Its note is state, so it stays with whatever React thinks is "the same row". */
function TreeRow({ tree }) {
    const [note, setNote] = useState(`შენიშვნა (${tree.name})`);
    const wrong = note.startsWith('შენიშვნა (') && !note.includes(tree.name);
    return h('li', { className: wrong ? 'is-wrong' : '' },
        h('b', null, tree.name),
        h('input', { value: note, onChange: e => setNote(e.target.value), 'aria-label': `${tree.name}: შენიშვნა` }));
}

function KeyColumn({ title, trees, byIndex }) {
    return h('div', { className: 'r-col' },
        h('p', { className: 'r-col__title' }, h('code', null, title)),
        trees.length === 0
            ? h(Note, null, 'სია ცარიელია.')
            : h('ul', { className: 'r-list' },
                trees.map((tree, i) => h(TreeRow, { key: byIndex ? i : tree.id, tree }))));
}

function DemoLists() {
    const [trees, setTrees] = useState(START_TREES);
    const [version, setVersion] = useState(0);

    return h(Fragment, null,
        h(Note, null, 'ყოველ ხეს თავისი შენიშვნა აქვს (state). წაშალე პირველი ხე და შეადარე სვეტები.'),
        h('div', { className: 'r-cols', key: version },
            h(KeyColumn, { title: 'key={index}', trees, byIndex: true }),
            h(KeyColumn, { title: 'key={tree.id}', trees, byIndex: false })),
        h('div', { className: 'demo-btns' },
            h(Btn, { primary: true, disabled: !trees.length, onClick: () => setTrees(trees.slice(1)) }, 'პირველის წაშლა'),
            h(Btn, { onClick: () => { setTrees(START_TREES); setVersion(v => v + 1); } }, 'თავიდან')),
        h(Note, null, 'key={index}-ით React ფიქრობს, რომ წაიშალა ბოლო ხაზი, და state პოზიციას მიჰყვება: შენიშვნები სხვა ხეს მიეწერება. id-ით state თავის ხესთან რჩება.'));
}

/* =========================================================
   4. Effects — mount / unmount a timer, with and without cleanup
   ========================================================= */

let tickerSerial = 0;
let activeTicker = 0;   // the ticker that is on screen right now (0 = none)

function Ticker({ withCleanup, log }) {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const me = ++tickerSerial;
        activeTicker = me;
        let ghostTicks = 0;
        log(`#${me} setup: setInterval ჩაირთო`);

        const id = setInterval(() => {
            if (activeTicker === me) {
                setSeconds(s => s + 1);
                log(`#${me} tick`);
                return;
            }
            ghostTicks++;
            log(`#${me} tick ← კომპონენტი წაშლილია, ტაიმერი კი ისევ მუშაობს!`);
            if (ghostTicks >= 5) {
                clearInterval(id);
                log(`#${me} (დემო: გაჟონილ ტაიმერს აქ ხელით ვაჩერებთ)`);
            }
        }, 1000);

        if (!withCleanup) return undefined;
        return () => {
            clearInterval(id);
            log(`#${me} cleanup: clearInterval`);
        };
    }, []);

    return h('div', { className: 'r-card' },
        h('span', { dangerouslySetInnerHTML: { __html: icon('clock') }, 'aria-hidden': true }),
        `Ticker: ${seconds} წმ`);
}

function DemoEffects() {
    const [shown, setShown] = useState(false);
    const [withCleanup, setWithCleanup] = useState(true);
    const [lines, log] = useLog('დააჭირე Mount-ს.');

    function toggle() {
        if (shown) {
            activeTicker = 0;
            log('— Unmount —');
        } else {
            log('— Mount —');
        }
        setShown(!shown);
    }

    return h(Fragment, null,
        h('div', { className: 'demo-btns' },
            h(Btn, { primary: true, onClick: toggle }, shown ? 'Unmount' : 'Mount'),
            h('label', { className: 'demo-check' },
                h('input', { type: 'checkbox', checked: withCleanup, disabled: shown, onChange: e => setWithCleanup(e.target.checked) }),
                'cleanup-ით: return () => clearInterval(id)')),
        shown && h(Ticker, { withCleanup, log }),
        h(Console, { lines }),
        h(Note, null, withCleanup
            ? 'Mount, მერე Unmount: cleanup ტაიმერს აჩერებს. მერე გამორთე cleanup და გაიმეორე.'
            : 'cleanup-ის გარეშე ტაიმერი Unmount-ის შემდეგაც მუშაობს. ყოველი Mount კიდევ ერთს ამატებს: ეს მეხსიერების გაჟონვაა.'));
}

/* =========================================================
   5. Context + useReducer — the season reaches Leaf without props
   ========================================================= */

const SEASON_LOOK = {
    autumn: { name: 'შემოდგომა', color: 'yellow' },
    winter: { name: 'ზამთარი', color: 'white' },
    spring: { name: 'გაზაფხული', color: 'pink' },
    summer: { name: 'ზაფხული', color: 'green' },
};
const SEASON_ORDER = Object.keys(SEASON_LOOK);
const SeasonContext = createContext('autumn');

function seasonReducer(state, action) {
    switch (action.type) {
        case 'set':
            return { season: action.season, changes: state.changes + 1 };
        case 'next': {
            const next = SEASON_ORDER[(SEASON_ORDER.indexOf(state.season) + 1) % SEASON_ORDER.length];
            return { season: next, changes: state.changes + 1 };
        }
        default:
            return state;
    }
}

function TreeBox({ name, info, children }) {
    return h('div', { className: 'r-tree' },
        h('span', null, h('span', { className: 'r-tree__name' }, `<${name}>`), ' ', h('span', { className: 'r-tree__props' }, info)),
        children);
}

function CtxLeaf() {
    const season = useContext(SeasonContext);
    const { color } = SEASON_LOOK[season];
    return h(TreeBox, { name: 'Leaf', info: `useContext(SeasonContext) → '${season}'` },
        h('div', { className: 'r-garden' },
            h(LeafIcon, { color, size: 30 }), h(LeafIcon, { color }), h(LeafIcon, { color, size: 20 })));
}
const CtxBranch = () => h(TreeBox, { name: 'Branch', info: 'props: არცერთი' }, h(CtxLeaf));
const CtxGarden = () => h(TreeBox, { name: 'Garden', info: 'props: არცერთი' }, h(CtxBranch));

function DemoContext() {
    const [state, dispatch] = useReducer(seasonReducer, { season: 'autumn', changes: 0 });
    const [last, setLast] = useState(null);
    const send = (action) => { setLast(action); dispatch(action); };

    return h(Fragment, null,
        h('div', { className: 'demo-btns' },
            SEASON_ORDER.map(id => h(Btn, { key: id, primary: state.season === id, onClick: () => send({ type: 'set', season: id }) }, SEASON_LOOK[id].name)),
            h(Btn, { onClick: () => send({ type: 'next' }) }, 'შემდეგი')),
        h(SeasonContext.Provider, { value: state.season },
            h(TreeBox, { name: 'SeasonContext.Provider', info: `value="${state.season}"` }, h(CtxGarden))),
        h(Note, null, last
            ? `dispatch(${JSON.stringify(last)}) → reducer → season: '${state.season}' (ცვლილება #${state.changes}). Garden და Branch ვერაფერს ხედავენ, Leaf კი Context-იდან კითხულობს.`
            : 'აირჩიე სეზონი: dispatch(action) → reducer → ახალი state → Provider → Leaf.'));
}

/* =========================================================
   6. Router — a tiny browser: Link keeps the state, <a href> reloads
   ========================================================= */

const ROUTER_LEAVES = { 1: 'მუხის ფოთოლი', 2: 'ნეკერჩხლის ფოთოლი', 3: 'ცაცხვის ფოთოლი' };
const ROUTER_LINKS = ['/', '/leaves', '/leaves/2', '/leaves/7', '/admin', '/nope'];

function matchPath(path, user) {
    if (path === '/') return { route: '/', page: 'Home' };
    if (path === '/leaves') return { route: '/leaves', page: 'LeafList' };
    const leaf = path.match(/^\/leaves\/([^/]+)$/);
    if (leaf) return { route: '/leaves/:id', page: 'LeafPage', params: { id: leaf[1] } };
    if (path === '/admin') return user ? { route: '/admin', page: 'Admin' } : { redirect: '/login' };
    if (path === '/login') return { route: '/login', page: 'Login' };
    return { route: '*', page: 'NotFound' };
}

function DemoRouter() {
    const [history, setHistory] = useState(['/']);
    const [user, setUser] = useState(null);
    const [loads, setLoads] = useState(1);     // full page loads
    const [clicks, setClicks] = useState(0);   // state that lives in the layout
    const path = history[history.length - 1];
    const match = matchPath(path, user);

    function navigate(to, who = user) {
        const target = matchPath(to, who).redirect ?? to;
        setHistory(hs => [...hs, target]);
    }
    // <a href>: the browser loads the page again and every bit of React state is gone
    function hardLoad(to) {
        navigate(to);
        setClicks(0);
        setLoads(n => n + 1);
    }
    const linkTo = (to, onGo) => h('a', { key: to, href: `#${to}`, onClick: e => { e.preventDefault(); onGo(to); } }, to);

    let content;
    if (match.page === 'Home') content = 'მთავარი გვერდი. ჩაეხედე ფოთლებს.';
    else if (match.page === 'LeafList') {
        content = h('ul', { className: 'demo-list' }, Object.entries(ROUTER_LEAVES).map(([id, name]) =>
            h('li', { key: id }, h('a', { href: `#/leaves/${id}`, onClick: e => { e.preventDefault(); navigate(`/leaves/${id}`); } }, name))));
    } else if (match.page === 'LeafPage') {
        const name = ROUTER_LEAVES[match.params.id];
        content = name ? `${name} (#${match.params.id})` : `ფოთოლი #${match.params.id} ვერ მოიძებნა.`;
    } else if (match.page === 'Admin') content = `ადმინის პანელი. გამარჯობა, ${user}!`;
    else if (match.page === 'Login') {
        content = h(Btn, { primary: true, onClick: () => { setUser('ნინო'); navigate('/admin', 'ნინო'); } }, 'შესვლა (ნინო)');
    } else content = '404: ასეთი გვერდი არ არსებობს.';

    return h(Fragment, null,
        h('div', { className: 'browser' },
            h('div', { className: 'browser__bar' },
                h(Btn, { onClick: () => setHistory(hs => hs.slice(0, -1)), disabled: history.length < 2, 'aria-label': 'უკან' }, '←'),
                h('span', { className: 'browser__url' }, `leaves.ge${path}`)),
            h('div', { key: loads, className: `browser__body${loads > 1 ? ' is-reloaded' : ''}` },
                h('nav', { className: 'browser__nav', 'aria-label': 'Link' }, h('b', null, '<Link>'), ROUTER_LINKS.map(to => linkTo(to, navigate))),
                h('nav', { className: 'browser__nav', 'aria-label': 'a href' }, h('b', null, '<a href>'), ROUTER_LINKS.slice(0, 3).map(to => linkTo(to, hardLoad))),
                h('div', { className: 'r-card' }, h('b', null, `<${match.page} />`), h('div', null, content)),
                h('div', { className: 'demo-btns' },
                    h(Btn, { onClick: () => setClicks(c => c + 1) }, `Layout-ის მთვლელი: ${clicks}`),
                    user && h('span', { className: 'demo-pill' }, `შესული: ${user}`)))),
        h(Note, null,
            `route: ${match.route}`
            + (match.params ? ` · useParams() → { id: '${match.params.id}' }, სტრიქონი` : '')
            + ` · გვერდის სრული ჩატვირთვები: ${loads}. მთვლელი Link-ით გადასვლისას რჩება, <a href>-ით კი ნულდება.`));
}

/* =========================================================
   7. Forms — validation with one schema, errors next to the field
   ========================================================= */

// Hand-written so the demo needs no library. With Zod it is one z.object({...}).
const TREE_RULES = {
    name: v => v.trim().length >= 2 || 'მინიმუმ 2 სიმბოლო',
    age: v => (/^\d+$/.test(v) && Number(v) >= 1) || 'ასაკი: მთელი რიცხვი, 1-დან',
    color: v => ['green', 'yellow'].includes(v) || 'აირჩიე ფერი',
};

function validateTree(data) {
    const errors = {};
    for (const [field, rule] of Object.entries(TREE_RULES)) {
        const result = rule(String(data[field] ?? ''));
        if (result !== true) errors[field] = result;
    }
    return errors;
}

function DemoForms() {
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [trees, setTrees] = useState([]);
    const renders = useRef(0);
    renders.current++;

    function onSubmit(e) {
        e.preventDefault();
        const form = e.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        const found = validateTree(data);
        setErrors(found);
        if (Object.keys(found).length) return;

        setSubmitting(true);
        setTimeout(() => {
            setTrees(list => [...list, { id: Date.now(), name: data.name.trim(), age: Number(data.age), color: data.color }]);
            setSubmitting(false);
            form.reset();
        }, 800);
    }

    const field = (name, label, input) =>
        h('label', null, label, input, errors[name] && h('span', { className: 'demo-error' }, errors[name]));

    return h(Fragment, null,
        h('form', { className: 'demo-form', onSubmit, noValidate: true },
            field('name', 'სახელი', h('input', { name: 'name', placeholder: 'მუხა', 'aria-invalid': Boolean(errors.name) })),
            field('age', 'ასაკი', h('input', { name: 'age', inputMode: 'numeric', placeholder: '12', 'aria-invalid': Boolean(errors.age) })),
            field('color', 'ფერი', h('select', { name: 'color', defaultValue: '' },
                h('option', { value: '' }, '—'),
                h('option', { value: 'green' }, 'მწვანე'),
                h('option', { value: 'yellow' }, 'ყვითელი'))),
            h('div', { className: 'demo-btns' },
                h('button', { className: 'btn btn--sm btn--primary', disabled: submitting }, submitting ? 'ინახება...' : 'შენახვა'))),
        trees.length > 0 && h('ul', { className: 'r-list' }, trees.map(t =>
            h('li', { key: t.id }, h('span', null, h(LeafIcon, { color: t.color, size: 18 }), ` ${t.name}, ${t.age} წლის`)))),
        h(Note, null,
            `რენდერები: ${renders.current}. აკრეფა რენდერს არ იწვევს: ველები uncontrolled-ია და მნიშვნელობებს submit-ისას ვკითხულობთ, როგორც React Hook Form. `
            + 'სქემა აქ ხელით წერია, რომ დემომ ბიბლიოთეკის გარეშე იმუშაოს.'));
}

/* =========================================================
   8. Server state — a tiny TanStack-Query-like cache:
      one key, two components, one request, staleTime, invalidation
   ========================================================= */

function createLeafServer() {
    let nextId = 4;
    const leaves = [{ id: 1, color: 'green' }, { id: 2, color: 'yellow' }, { id: 3, color: 'green' }];
    return {
        requests: 0,
        get() {
            this.requests++;
            return sleep(900).then(() => leaves.map(l => ({ ...l })));
        },
        post(color) {
            return sleep(500).then(() => { leaves.push({ id: nextId++, color }); });
        },
    };
}

function createMiniQueryClient(log) {
    const cache = new Map();          // key → { data, updatedAt, promise }
    const listeners = new Set();
    const emit = () => listeners.forEach(fn => fn());

    function fetchKey(key, fn, reason) {
        const entry = cache.get(key);
        log(`${reason} → GET /api/${key}`);
        entry.promise = fn().then((data) => {
            Object.assign(entry, { data, updatedAt: Date.now(), promise: null });
            log(`← პასუხი: ${data.length} ფოთოლი`);
            emit();
        });
        emit();
    }

    return {
        subscribe(fn) {
            listeners.add(fn);
            return () => listeners.delete(fn);
        },
        get: key => cache.get(key),
        ensure(key, fn, staleTime, who) {
            if (!cache.has(key)) cache.set(key, { data: undefined, updatedAt: 0, promise: null });
            const entry = cache.get(key);
            if (entry.promise) return log(`${who}: ['${key}'] უკვე იტვირთება, ვუერთდებით`);
            if (entry.data !== undefined && Date.now() - entry.updatedAt < staleTime) {
                return log(`${who}: ქეშიდან, მოთხოვნა არ გაიგზავნა`);
            }
            fetchKey(key, fn, entry.data === undefined
                ? `${who}: ქეში ცარიელია`
                : `${who}: მოძველდა, ვაჩვენებთ ძველს და ფონზე ვაახლებთ`);
        },
        invalidate(key, fn) {
            const entry = cache.get(key);
            if (!entry) return;
            entry.updatedAt = 0;
            if (entry.promise) return;
            if (listeners.size) fetchKey(key, fn, 'invalidate: მოძველებულად მოინიშნა');
            else log('invalidate: მოძველებულად მოინიშნა, ჩაიტვირთება შემდეგ mount-ზე');
        },
    };
}

function useLeavesQuery(client, server, who) {
    const [, rerender] = useReducer(x => x + 1, 0);
    useEffect(() => client.subscribe(rerender), [client]);
    useEffect(() => {
        client.ensure('leaves', () => server.get(), 5000, who);
    }, [client, server, who]);
    const entry = client.get('leaves');
    return { data: entry?.data, isPending: entry?.data === undefined, isFetching: Boolean(entry?.promise) };
}

function LeafCount({ client, server }) {
    const { data, isPending, isFetching } = useLeavesQuery(client, server, 'LeafCount');
    return h('div', { className: 'r-card' },
        h('b', null, 'LeafCount'),
        isPending ? 'იტვირთება...' : `${data.length} ფოთოლი`,
        isFetching && !isPending && h('span', { className: 'demo-pill demo-pill--warn' }, 'ახლდება'));
}

function LeafRow({ client, server }) {
    const { data, isPending } = useLeavesQuery(client, server, 'LeafList');
    return h('div', { className: 'r-card' },
        h('b', null, 'LeafList'),
        isPending ? 'იტვირთება...' : h('span', { className: 'r-garden' }, data.map(l => h(LeafIcon, { key: l.id, color: l.color, size: 22 }))));
}

function DemoQuery() {
    const [lines, log] = useLog('დააჭირე „კომპონენტების ჩვენებას“.');
    const [server] = useState(createLeafServer);
    const [client] = useState(() => createMiniQueryClient(log));
    const [shown, setShown] = useState(false);
    const [adding, setAdding] = useState(false);

    async function addLeaf() {
        setAdding(true);
        log('useMutation: POST /api/leaves');
        await server.post('yellow');
        log("onSuccess → invalidateQueries({ queryKey: ['leaves'] })");
        client.invalidate('leaves', () => server.get());
        setAdding(false);
    }

    function toggle() {
        log(shown ? '— კომპონენტები დაიმალა —' : '— Mount: LeafCount + LeafList —');
        setShown(!shown);
    }

    return h(Fragment, null,
        h('div', { className: 'demo-btns' },
            h(Btn, { primary: true, onClick: toggle }, shown ? 'კომპონენტების დამალვა' : 'კომპონენტების ჩვენება'),
            h(Btn, { onClick: addLeaf, disabled: adding }, adding ? 'ემატება...' : 'ფოთლის დამატება (mutation)')),
        shown && h('div', { className: 'demo-btns' }, h(LeafCount, { client, server }), h(LeafRow, { client, server })),
        h(Console, { lines }),
        h(Note, null,
            `სერვერზე მოთხოვნები: ${server.requests}. ორი კომპონენტი, ერთი queryKey, ერთი მოთხოვნა. `
            + 'staleTime 5 წამია: დამალე და მალევე აჩვენე, მონაცემი ქეშიდან მოვა. 5 წამის მერე ფონზე განახლდება.'));
}

/* =========================================================
   PUZZLE RESULTS — what the ordered code does when it runs
   ========================================================= */

function PuzzleCounter() {
    const [count, setCount] = useState(0);
    return h(Fragment, null,
        h('button', { type: 'button', className: 'btn btn--primary demo-counter', onClick: () => setCount(c => c + 1) }, count),
        h(Note, null, 'დააჭირე: setCount state-ს ცვლის და React ღილაკს თავიდან ხატავს.'));
}

const LIST_LEAVES = [
    { id: 1, name: 'მუხა', color: 'green' },
    { id: 2, name: 'ნეკერჩხალი', color: 'yellow' },
    { id: 3, name: 'ცაცხვი', color: 'green' },
    { id: 4, name: 'არყი', color: 'yellow' },
];

function PuzzleFilter() {
    const [filter, setFilter] = useState('all');
    const visible = LIST_LEAVES.filter(l => filter === 'all' || l.color === filter);
    const labels = { all: 'ყველა', green: 'მწვანეები', yellow: 'ყვითლები' };
    return h(Fragment, null,
        h('div', { className: 'demo-btns' },
            Object.entries(labels).map(([id, label]) => h(Btn, { key: id, primary: filter === id, onClick: () => setFilter(id) }, label))),
        h('ul', { className: 'r-list' }, visible.map(l =>
            h('li', { key: l.id }, h('span', null, h(LeafIcon, { color: l.color, size: 18 }), ` ${l.name}`)))),
        h(Note, null, `filter = '${filter}', ნაჩვენებია ${visible.length}. visible state-ში არ ინახება, ყოველ რენდერზე ითვლება.`));
}

function PuzzleUsers() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        fetch('https://jsonplaceholder.typicode.com/users', { signal: controller.signal })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(setUsers)
            .catch((err) => { if (err.name !== 'AbortError') setError(err.message); });
        return () => controller.abort();
    }, []);

    if (error) return h('p', { className: 'demo-error' }, `ვერ ჩაიტვირთა (${error}). შეამოწმე ინტერნეტი.`);
    if (!users.length) return h(Note, null, 'იტვირთება...');
    return h('ul', { className: 'demo-list' }, users.slice(0, 5).map(u => h('li', { key: u.id }, u.name)));
}

const FRUIT = {
    apple: { id: 'apple', name: 'ვაშლი', price: 2 },
    pear: { id: 'pear', name: 'მსხალი', price: 3 },
};

function cartReducer(state, action) {
    switch (action.type) {
        case 'add': return [...state, action.item];
        case 'clear': return [];
        default: return state;
    }
}

function PuzzleCart() {
    const [items, dispatch] = useReducer(cartReducer, []);
    const total = items.reduce((sum, i) => sum + i.price, 0);
    return h(Fragment, null,
        h('div', { className: 'demo-btns' },
            h(Btn, { onClick: () => dispatch({ type: 'add', item: FRUIT.apple }) }, '+ ვაშლი (2 ₾)'),
            h(Btn, { onClick: () => dispatch({ type: 'add', item: FRUIT.pear }) }, '+ მსხალი (3 ₾)'),
            h(Btn, { onClick: () => dispatch({ type: 'clear' }) }, 'გასუფთავება')),
        h('div', { className: 'r-card' }, h('span', { dangerouslySetInnerHTML: { __html: icon('cart') }, 'aria-hidden': true }), `კალათაში: ${items.length} · ${total} ₾`),
        h(Note, null, 'ყოველი ღილაკი action-ს აგზავნის, reducer კი ახალ მასივს აბრუნებს. total state-ში არ ინახება.'));
}

function PuzzleForm() {
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(null);

    function onSubmit(e) {
        e.preventDefault();
        const name = String(new FormData(e.currentTarget).get('name') ?? '').trim();
        if (name.length < 2) {
            setError('მინიმუმ 2 სიმბოლო');
            setSaved(null);
            return;
        }
        setError(null);
        setSaved(name);
    }

    return h('form', { className: 'demo-form', onSubmit, noValidate: true },
        h('label', null, 'სახელი',
            h('input', { name: 'name', placeholder: 'ნინო', 'aria-invalid': Boolean(error) }),
            error && h('span', { className: 'demo-error' }, error)),
        h('div', { className: 'demo-btns' }, h('button', { className: 'btn btn--sm btn--primary' }, 'შენახვა')),
        saved && h(Note, null, `შენახულია: ${saved}`));
}

const LEAF_DETAILS = { 1: 'მუხის ფოთოლი', 2: 'ნეკერჩხლის ფოთოლი' };

function PuzzleLeafPage() {
    const [id, setId] = useState('1');
    const [cache, setCache] = useState({});
    const [lines, log] = useLog();

    useEffect(() => {
        if (cache[id]) {
            log(`['leaf', '${id}'] → ქეშიდან, მყისიერად`);
            return undefined;
        }
        let ignore = false;
        log(`['leaf', '${id}'] → GET /api/leaves/${id}`);
        sleep(700).then(() => {
            if (!ignore) setCache(c => ({ ...c, [id]: { name: LEAF_DETAILS[id] } }));
        });
        return () => { ignore = true; };
    }, [id]);

    const data = cache[id];
    return h(Fragment, null,
        h('div', { className: 'demo-btns' },
            ['1', '2'].map(n => h(Btn, { key: n, primary: id === n, onClick: () => setId(n) }, `/leaves/${n}`))),
        h('div', { className: 'r-card' }, data ? h('b', null, data.name) : 'იტვირთება...'),
        h(Console, { lines }),
        h(Note, null, 'გადადი 1 → 2 → 1: მეორედ ნანახი ფოთოლი ქეშიდან მოდის, რადგან key-ში id წერია.'));
}

function PuzzleWidth() {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const onResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    return h(Fragment, null,
        h('div', { className: 'r-card' }, h('b', null, 'useWindowWidth()'), `${width}px`),
        h(Note, null, 'შეცვალე ფანჯრის ზომა: რიცხვი მაშინვე განახლდება.'));
}
