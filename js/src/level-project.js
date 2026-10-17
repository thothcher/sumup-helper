'use strict';

/* =========================================================
   LEVEL 5 — PROJECT: "which topics will you need?"

   The student reads a real task and switches on the topics that solving it takes.
   Then the answer opens up: why each topic is (or is not) needed, how they work
   together line by line, and the code running in slow motion.

   The level is safe (hearts are protected): the question is "what does this need?",
   and a real task can have more than one honest answer, so a topic marked optional
   costs nothing either way. Coins follow the slips: 0 → 30, 1 → 20, 2 → 10.

   data/projects.js holds the tasks; this file only knows how to ask them.
   ========================================================= */

const PROJECT_PRIZE = [30, 20, 10];
const PROJECT_STOP = Symbol('project-stop');    // thrown inside a demo to cut it short

LEVELS.push(wireLevel({
    id: 'project',
    name: 'პროექტი',
    title: bi('რომელი თემები დაგჭირდება?', 'Which topics will you need?'),
    intro: bi('ეკრანზე რეალური ამოცანაა, როგორიც ნებისმიერ საიტზე შეგხვდება. ჩართე ის თემები, რომლებიც მის გასაკეთებლად დაგჭირდება, და შეამოწმე.',
        'A real task, the kind you meet on any website. Switch on the topics you would need to build it, then check.'),
    count: 6,
    maxPer: PROJECT_PRIZE[0],
    safe: true,
    unit: 'ამოცანა',
    minTopics: 4,         // with fewer topics there is nothing to tell apart
    items: () => PROJECTS,
    topicsOf: p => Object.keys(p.needs),
    // a task needs at least one picked topic that is clearly NOT needed, or "switch everything on" wins
    fits: (p, picked) => [...picked].some(id => !(id in p.needs) && !(id in p.maybe)),
    facts: () => [
        coinFact(bi('სრულყოფილ პასუხზე +30', 'perfect answer: +30', 'bi--line')),
        `${icon('shieldCheck')}${bi('გულები ამ დონეზე დაცულია', 'hearts are safe here', 'bi--line')}`,
        `${icon('bulb')}${bi('სურვილისამებრ თემა არ ჯარიმდება', 'optional topics cost nothing', 'bi--line')}`,
        comboFact(),
    ],
    start: projectLevel,
}));

const PROJECT_BADGE = {
    right: ['საჭიროა', 'Needed'],
    missed: ['გამორჩა', 'Missed'],
    extra: ['ზედმეტია', 'Not needed'],
    'maybe-on': ['სურვილისამებრ', 'Optional'],
    'maybe-off': ['სურვილისამებრ', 'Optional'],
    quiet: ['არ სჭირდება', 'Not needed'],
};

function projectLevel(stage) {
    // an easy task first, the big ones last
    const tasks = drawFor('project').sort((a, b) => Object.keys(a.needs).length - Object.keys(b.needs).length);
    const choices = TOPICS.filter(t => Game.picked().has(t.id));
    const slips = {};            // topic id → slips this round, for the recap on the last task
    let index = 0;
    let on = new Set();          // the topics switched on
    let checked = false;
    let runId = 0;               // a new number stops the demo that is still running

    const task = () => tasks[index];
    const topicOf = (id) => TOPICS.find(t => t.id === id);
    const pips = (p) => { const n = Object.keys(p.needs).length; return n <= 3 ? 1 : n <= 5 ? 2 : 3; };

    function toolTemplate(t, i) {
        return `
            <li class="tools__item">
                <button class="tool t-${t.id}" type="button" role="switch" aria-checked="false" data-tool="${t.id}">
                    <span class="tool__key" aria-hidden="true">${i + 1}</span>
                    <span class="tool__icon">${icon(t.icon)}</span>
                    <span class="tool__text"><b>${t.label}</b>${biPair(PROJECT_ASKS[t.id])}</span>
                    <span class="tool__end">
                        <span class="tool__switch" aria-hidden="true"><i></i></span>
                        <span class="tool__badge"></span>
                    </span>
                </button>
                <p class="tool__why" hidden></p>
            </li>`;
    }

    function render() {
        const p = task();
        on = new Set();
        checked = false;
        runId++;
        const level = pips(p);
        stage.innerHTML = `
            <p class="task-count">${bi(`ამოცანა ${index + 1} / ${tasks.length}`, `Task ${index + 1} / ${tasks.length}`, 'bi--line')}</p>
            <article class="ticket">
                <p class="ticket__badge">
                    ${icon('ticket')}${bi('ამოცანა', 'Task', 'bi--line')}
                    <span class="ticket__pips" title="სირთულე · Difficulty" aria-hidden="true">${[1, 2, 3].map(n => `<i class="${n <= level ? 'is-on' : ''}"></i>`).join('')}</span>
                </p>
                <h3 class="ticket__title">${biPair(p.title)}</h3>
                <p class="ticket__story">${biPair(p.story)}</p>
            </article>
            <p class="task-help">${bi('ჩართე ის თემები, რომლებიც ამ ამოცანას დასჭირდება. თითოეულ თემასთან კითხვაა: ამოცანის კითხვისას ეს კითხვები დაუსვი საკუთარ თავს.',
                'Switch on the topics this task needs. Each topic comes with a question: ask yourself these while you read a task.')}</p>
            <ul class="tools" aria-label="თემები · Topics">${choices.map(toolTemplate).join('')}</ul>
            <div class="action-bar" data-bar>
                <p class="action-bar__text" data-count></p>
                <button class="btn btn--ghost" type="button" data-reveal>${icon('eye')}${bi('მაჩვენე ამოხსნა (0 მონეტა)', 'Show me (0 coins)', 'bi--line')}</button>
                <button class="btn btn--primary" type="button" data-check>${icon('check')}${bi('შემოწმება', 'Check', 'bi--line')}</button>
            </div>
            <div class="task-answer" aria-live="polite"></div>`;
        showCount();
        Game.progress(index, tasks.length);
    }

    /** The pinned bar says how many topics are on, so "Check" never needs hunting for. */
    function showCount() {
        $('[data-count]', stage).innerHTML = on.size
            ? bi(`ჩართულია: ${on.size} / ${choices.length}`, `On: ${on.size} of ${choices.length}`, 'bi--line')
            : bi('ჩართე ის თემები, რომლებიც დაგჭირდება', 'Switch on what you will need', 'bi--line');
    }

    function toggle(id, btn = $(`[data-tool="${id}"]`, stage)) {
        if (checked || !btn) return;
        const next = !on.has(id);
        if (next) on.add(id);
        else on.delete(id);
        btn.setAttribute('aria-checked', String(next));
        btn.classList.toggle('is-on', next);
        showCount();
    }

    /* ---------- the answer ---------- */

    /** The topics in the order the solution first uses them: the road the data travels. */
    function flowOf(p) {
        const order = [];
        p.lines.forEach(l => l.topics.forEach((id) => { if (!order.includes(id)) order.push(id); }));
        return order;
    }

    function blueprintTemplate(p) {
        const nodes = flowOf(p).map(id => `
            <li class="flow__node t-${id}" data-topic="${id}">${icon(topicOf(id).icon)}<span>${topicOf(id).label}</span></li>`)
            .join(`<li class="flow__arrow" aria-hidden="true">${icon('arrowRight')}</li>`);
        const lines = p.lines.map((l, i) => `
            <div class="bp-line" data-line="${i}">
                <span class="bp-line__chips">${l.topics.map(id => `<i class="bp-chip t-${id}" title="${topicOf(id).label}">${icon(topicOf(id).icon)}</i>`).join('')}</span>
                <code>${highlight(l.code) || ' '}</code>
            </div>`).join('');
        return `
            <section class="blueprint">
                <header class="blueprint__head">
                    <h4>${icon('route')}${bi('როგორ მუშაობს ეს ყველაფერი ერთად', 'How it all works together', 'bi--line')}</h4>
                    <button class="btn btn--sm btn--primary is-pulse" type="button" data-demo>${icon('play')}${bi('გაუშვი', 'Run', 'bi--line')}</button>
                </header>
                <ol class="flow" aria-label="თემების რიგი · Order of topics">${nodes}</ol>
                <div class="code bp" aria-label="კოდი · Code">${lines}</div>
                <div class="preview" hidden>
                    <p class="preview__title">${icon('play')}${bi('შედეგი: კოდი ნელა გაეშვა', 'Result: the code, in slow motion', 'bi--line')}</p>
                    <div class="preview__body"></div>
                    <p class="pd-note" hidden></p>
                </div>
            </section>`;
    }

    /** On the last task: the topics that cost slips this round, with a link back to each. */
    function recapTemplate() {
        const ids = Object.keys(slips).sort((a, b) => slips[b] - slips[a]);
        if (!ids.length) {
            return `<p class="tip recap">${icon('crown')}<span>${bi('ერთი შეცდომაც არ დაგიშვია: ამოცანებს უკვე „თემებად“ ხედავ!', 'Not a single slip: you already see tasks as topics!')}</span></p>`;
        }
        return `
            <div class="recap">
                <p class="recap__title">${icon('listChecks')}${bi('გაიმეორე ეს თემები:', 'Review these topics:', 'bi--line')}</p>
                <div class="links">${ids.map(id => `<a class="chip-link" href="#${id}">${icon(topicOf(id).icon)}${topicOf(id).label}</a>`).join('')}</div>
            </div>`;
    }

    function check(reveal = false) {
        if (checked) return;
        checked = true;
        runId++;
        const p = task();
        const rows = choices.map((t) => {
            const need = t.id in p.needs;
            const optional = t.id in p.maybe;
            const isOn = on.has(t.id);
            const kind = need ? (isOn ? 'right' : 'missed')
                : optional ? (isOn ? 'maybe-on' : 'maybe-off')
                    : (isOn ? 'extra' : 'quiet');
            return { t, kind };
        });
        const missed = rows.filter(r => r.kind === 'missed').length;
        const extra = rows.filter(r => r.kind === 'extra').length;
        const mistakes = missed + extra;
        rows.filter(r => r.kind === 'missed' || r.kind === 'extra').forEach((r) => { slips[r.t.id] = (slips[r.t.id] || 0) + 1; });

        // every switch turns into a verdict, with its reason underneath
        rows.forEach(({ t, kind }) => {
            const btn = $(`[data-tool="${t.id}"]`, stage);
            const why = btn.closest('li').querySelector('.tool__why');
            const reason = kind === 'right' || kind === 'missed' ? p.needs[t.id]
                : kind.startsWith('maybe') ? p.maybe[t.id]
                    : kind === 'extra' ? (p.no[t.id] || NO_BECAUSE[t.id])
                        : p.no[t.id];
            btn.disabled = true;
            btn.classList.add('is-checked', `is-${kind}`);
            why.id = `why-${t.id}`;
            btn.setAttribute('aria-describedby', why.id);
            $('.tool__badge', btn).innerHTML = biPair(PROJECT_BADGE[kind], 'bi--line');
            if (reason) {
                why.innerHTML = biPair(reason);
                why.hidden = false;
                why.classList.add(`is-${kind}`);
            }
        });

        const checkBtn = $('[data-check]', stage);
        if (!reveal) {
            if (mistakes < PROJECT_PRIZE.length) Game.reward(checkBtn, PROJECT_PRIZE[mistakes]);
            else Game.penalty(checkBtn);            // a safe level: no heart is lost, the streak starts over
        }

        const ok = !reveal && mistakes === 0;
        const head = reveal ? ['აი, ამოხსნა.', 'Here is the answer.']
            : mistakes === 0 ? ['სრულყოფილია!', 'Perfect!']
                : mistakes === 1 ? ['თითქმის!', 'Almost!']
                    : mistakes === 2 ? ['კარგი ცდა.', 'A good try.']
                        : ['ეს რთული იყო.', 'That was a tough one.'];
        const detail = reveal ? ['მიზეზები თემების გვერდითაა. მონეტა ამჯერად არ ითვლება.', 'The reasons are beside each topic. No coins this time.']
            : mistakes === 0 ? ['ყველა საჭირო თემა იპოვე და ზედმეტი არც ერთი ჩაგირთავს.', 'You found every needed topic and switched on nothing extra.']
                : [`${missed} თემა გამორჩა, ${extra} კი ზედმეტი იყო. წაიკითხე მიზეზები თემების გვერდით.`, `${missed} missed, ${extra} not needed. Read the reasons beside the topics.`];
        const last = index === tasks.length - 1;
        // the pinned bar turns from "Check" into the result, with the way on
        const bar = $('[data-bar]', stage);
        bar.classList.add('is-done', ok ? 'is-ok' : 'is-slip');
        bar.setAttribute('role', 'status');
        bar.innerHTML = `
            ${icon(ok ? 'check' : 'bulb', 'action-bar__icon')}
            <div class="action-bar__text"><p class="feedback__head">${biPair(head, 'bi--line')}</p>${biPair(detail)}</div>
            <button class="btn btn--primary" type="button" data-next>${bi(last ? 'დონის დასრულება' : 'შემდეგი', last ? 'Finish level' : 'Next', 'bi--line')}${icon('arrowRight')}</button>`;
        $('.task-answer', stage).innerHTML = `${last ? recapTemplate() : ''}${blueprintTemplate(p)}`;
        Game.progress(index + 1, tasks.length);
        $('[data-next]', stage).focus({ preventScroll: true });
    }

    /* ---------- the code in slow motion ---------- */

    async function run() {
        const id = ++runId;
        const p = task();
        const lines = $$('.bp-line', stage);
        const nodes = $$('.flow__node', stage);
        const preview = $('.preview', stage);
        const body = $('.preview__body', stage);
        const note = $('.pd-note', stage);
        const btn = $('[data-demo]', stage);
        preview.hidden = false;
        body.replaceChildren();
        note.hidden = true;
        lines.forEach(l => l.classList.remove('is-lit', 'is-seen'));
        btn.disabled = true;
        btn.classList.remove('is-pulse');
        preview.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });

        /** step(i) lights line i (step([a, b]) a few lines) and waits a moment. */
        const step = async (at, ms = 460) => {
            if (id !== runId || !body.isConnected) throw PROJECT_STOP;
            const [from, to] = Array.isArray(at) ? at : [at, at];
            const topics = new Set();
            lines.forEach((line, i) => {
                const lit = i >= from && i <= to;
                if (lit) {
                    line.classList.add('is-seen');
                    p.lines[i].topics.forEach(t => topics.add(t));
                }
                line.classList.toggle('is-lit', lit);
            });
            nodes.forEach(node => node.classList.toggle('is-lit', topics.has(node.dataset.topic)));
            await demoWait(ms);
            if (id !== runId) throw PROJECT_STOP;
        };

        try {
            const text = await p.run(body, step);
            if (text) {
                note.innerHTML = biPair(text, 'bi--line');
                note.hidden = false;
            }
        } catch (err) {
            if (err !== PROJECT_STOP) {
                console.error(err);
                body.append(consoleBox(['ეს დემო ვერ გაეშვა · The demo could not run.']));
            }
        } finally {
            if (id === runId) {
                lines.forEach(l => l.classList.remove('is-lit'));
                nodes.forEach(n => n.classList.remove('is-lit'));
                btn.disabled = false;
                btn.innerHTML = `${icon('rotate')}${bi('ხელახლა', 'Replay', 'bi--line')}`;
            }
        }
    }

    function next() {
        index++;
        if (index < tasks.length) render();
        else {
            runId++;
            Game.complete();
        }
    }

    stage.onclick = (e) => {
        const tool = e.target.closest('[data-tool]');
        if (tool) return toggle(tool.dataset.tool, tool);
        if (e.target.closest('[data-check]')) return check();
        if (e.target.closest('[data-reveal]')) {
            Game.skip();
            return check(true);
        }
        if (e.target.closest('[data-demo]')) return run();
        if (e.target.closest('[data-next]')) next();
    };
    Game.onKey = (e) => {
        const n = Number(e.key);
        if (!checked && n >= 1 && n <= choices.length) {
            e.preventDefault();
            toggle(choices[n - 1].id);
        } else if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
            e.preventDefault();
            if (checked) next();
            else check();
        }
    };
    render();
}
