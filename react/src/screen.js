'use strict';

/* =========================================================
   SCREEN — the computer in the hero. It types a component, then really
   runs it with React, and a cursor plays with the result: UI = f(state).
   Pauses when it is off screen; shows one still frame for reduced motion.
   ========================================================= */

function ScreenCounter({ onState }) {
    const [count, setCount] = useState(0);
    useEffect(() => onState(`count = ${count}`), [count]);
    return h('button', { type: 'button', className: 'mini-btn', onClick: () => setCount(count + 1) }, `მოწონება: ${count}`);
}

function ScreenLamp({ onState }) {
    const [on, setOn] = useState(false);
    useEffect(() => onState(`on = ${on}`), [on]);
    return h('div', { className: `mini-lamp${on ? ' is-on' : ''}` },
        h('span', { className: 'mini-lamp__bulb' }),
        h('button', { type: 'button', className: 'mini-btn', onClick: () => setOn(!on) }, on ? 'ჩაქრობა' : 'ანთება'));
}

function ScreenBadge({ name, tone }) {
    return h('span', { className: `mini-badge mini-badge--${tone}` }, name);
}

function ScreenBadges({ onState }) {
    useEffect(() => onState('props → UI'), []);
    return h('div', { className: 'mini-badges' },
        h(ScreenBadge, { name: 'React', tone: 'cyan' }),
        h(ScreenBadge, { name: 'Props', tone: 'peach' }),
        h(ScreenBadge, { name: 'JSX', tone: 'ink' }));
}

const SCREEN_SCENES = [
    {
        file: 'Counter.tsx',
        App: ScreenCounter,
        clicks: 3,
        code: `function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      მოწონება: {count}
    </button>
  );
}`,
    },
    {
        file: 'Lamp.tsx',
        App: ScreenLamp,
        clicks: 2,
        code: `function Lamp() {
  const [on, setOn] = useState(false);
  return (
    <div className={on ? 'lamp on' : 'lamp'}>
      <button onClick={() => setOn(!on)}>
        {on ? 'ჩაქრობა' : 'ანთება'}
      </button>
    </div>
  );
}`,
    },
    {
        file: 'Badge.tsx',
        App: ScreenBadges,
        clicks: 0,
        code: `function Badge({ name, tone }) {
  return <span className={tone}>{name}</span>;
}

<Badge name="React" tone="cyan" />
<Badge name="Props" tone="peach" />
<Badge name="JSX" tone="ink" />`,
    },
];

function initScreen(host) {
    host.innerHTML = `
        <figure class="screen" aria-label="კომპიუტერი წერს React კომპონენტს და უშვებს მას">
            <div class="screen__frame">
                <div class="screen__bar">
                    <span class="screen__dots" aria-hidden="true"><i></i><i></i><i></i></span>
                    <span class="screen__tab"><span class="screen__file"></span><span class="screen__saved"></span></span>
                </div>
                <div class="screen__body">
                    <pre class="screen__code"><code></code><span class="screen__caret"></span></pre>
                    <div class="screen__preview">
                        <p class="screen__url">localhost:5173</p>
                        <div class="screen__app"></div>
                        <p class="screen__state"></p>
                    </div>
                </div>
            </div>
            <div class="screen__stand" aria-hidden="true"></div>
            <span class="screen__cursor" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M5 3l14 8-6.5 1.5L9 19z" fill="#1f2330" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>
            </span>
            <figcaption class="screen__caption">UI = f(state)</figcaption>
        </figure>`;

    const screen = $('.screen', host);
    const code = $('.screen__code code', screen);
    const app = $('.screen__app', screen);
    const stateLabel = $('.screen__state', screen);
    const file = $('.screen__file', screen);
    const saved = $('.screen__saved', screen);
    const cursor = $('.screen__cursor', screen);
    let visible = true;

    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(screen);

    /** Sleeps, but the clock only runs while the screen is visible. */
    async function wait(ms) {
        let left = ms;
        while (left > 0) {
            await sleep(Math.min(left, 100));
            if (visible && !document.hidden) left -= 100;
        }
    }

    const onState = (text) => {
        stateLabel.textContent = `state: ${text}`;
        app.classList.remove('is-render');
        void app.offsetWidth;
        app.classList.add('is-render');
    };

    function moveCursor(target) {
        const s = screen.getBoundingClientRect();
        if (!target) {
            cursor.style.transform = `translate(${s.width * 0.82}px, ${s.height * 0.78}px)`;
            return;
        }
        const r = target.getBoundingClientRect();
        cursor.style.transform = `translate(${r.left - s.left + r.width * 0.6}px, ${r.top - s.top + r.height * 0.55}px)`;
    }

    async function type(text) {
        for (let i = 1; i <= text.length; i++) {
            code.innerHTML = highlight(text.slice(0, i));
            const ch = text[i - 1];
            await wait(ch === '\n' ? 110 : 26);
        }
    }

    async function play(scene) {
        file.textContent = scene.file;
        saved.textContent = '●';
        saved.className = 'screen__saved';
        code.innerHTML = '';
        stateLabel.textContent = '';
        mountReact(app, h('p', { className: 'screen__empty' }, 'აქ გამოჩნდება კომპონენტი…'));
        moveCursor(null);
        await wait(500);
        await type(scene.code);
        await wait(400);
        saved.textContent = 'შენახულია';
        saved.className = 'screen__saved is-saved';
        mountReact(app, h(scene.App, { onState }));
        await wait(900);
        for (let i = 0; i < scene.clicks; i++) {
            const button = $('button', app);
            moveCursor(button);
            await wait(850);
            cursor.classList.remove('is-click');
            void cursor.offsetWidth;
            cursor.classList.add('is-click');
            button?.click();
            await wait(700);
        }
        moveCursor(null);
        await wait(2600);
    }

    if (prefersReducedMotion.matches) {
        const scene = SCREEN_SCENES[0];
        file.textContent = scene.file;
        code.innerHTML = highlight(scene.code);
        mountReact(app, h(scene.App, { onState }));
        cursor.hidden = true;
        return;
    }

    (async () => {
        for (let n = 0; ; n++) await play(SCREEN_SCENES[n % SCREEN_SCENES.length]);
    })();
}
