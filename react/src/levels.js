'use strict';

/* =========================================================
   LEVELS — the four practice levels inside the game window.
   Each start(stage) renders into the window and reports to Game.
   The questions come from data/quiz.js, data/practice.js and data/puzzles.js.
   ========================================================= */

const COINS = { quiz: 10, bugs: 20, bugsHint: 10, order: [30, 20, 10], output: 15 };

const coinFact = (text) => `<span class="coin" aria-hidden="true"></span>${text}`;
const heartFact = () => `${icon('heart')}შეცდომა: −1 გული`;
const comboFact = () => `${icon('flame')}ზედიზედ ${COMBO_EVERY}: +${COMBO_BONUS}`;
const nextLabel = (last) => `${last ? 'დონის დასრულება' : 'შემდეგი'}${icon('arrowRight')}`;

const LEVELS = [
    {
        id: 'quiz',
        name: 'ტესტი',
        title: 'რომელ თემას ეკუთვნის?',
        intro: 'გაჩვენებ კოდს, შენ კი აირჩიე თემა, რომელსაც ის ეკუთვნის. ციფრებით (1, 2…) სწრაფად უპასუხებ.',
        count: 8,
        maxPer: COINS.quiz,
        size() { return Math.min(this.count, QUIZ.length); },
        facts: () => [coinFact(`+${COINS.quiz} სწორზე`), heartFact(), comboFact()],
        start: quizLevel,
    },
    {
        id: 'bugs',
        name: 'იპოვე ბაგი',
        title: 'სად იმალება შეცდომა?',
        intro: 'კოდი ისე არ მუშაობს, როგორც უნდა. დააჭირე ხაზს, რომელიც მას აფუჭებს.',
        count: 6,
        maxPer: COINS.bugs,
        size() { return Math.min(this.count, BUGS.length); },
        facts: () => [coinFact(`+${COINS.bugs}, მინიშნებით +${COINS.bugsHint}`), heartFact(), comboFact()],
        start: bugsLevel,
    },
    {
        id: 'order',
        name: 'დაალაგე',
        title: 'ააწყე პროგრამა',
        intro: 'ხაზები არეულია: გადაათრიე ისინი სწორ თანმიმდევრობაში. ხაზზე დაჭერით ის გადაბრუნდება და ნახავ, რას აკეთებს.',
        count: 4,
        maxPer: COINS.order[0],
        safe: true,
        size() { return Math.min(this.count, PUZZLES.length); },
        facts: () => [coinFact(`პირველი ცდით +${COINS.order[0]}, მერე +${COINS.order[1]} და +${COINS.order[2]}`), `${icon('shieldCheck')}გულები ამ დონეზე დაცულია`],
        start: orderLevel,
    },
    {
        id: 'output',
        name: 'რა მოხდება?',
        title: 'წაიკითხე და გამოიცანი',
        intro: 'წაიკითხე კოდი და გამოიცანი შედეგი. პასუხი ასოებითაც შეგიძლია: A, B, C, D.',
        count: 8,
        maxPer: COINS.output,
        size() { return Math.min(this.count, OUTPUTS.length); },
        facts: () => [coinFact(`+${COINS.output} სწორზე`), heartFact(), comboFact()],
        start: outputLevel,
    },
];

const sizeOf = (id) => LEVELS.find(l => l.id === id).size();

/* =========================================================
   1. Quiz — which topic does this code belong to?
   ========================================================= */

function quizLevel(stage) {
    const questions = shuffle(QUIZ).slice(0, sizeOf('quiz'));
    let index = 0;
    let answered = false;

    function render() {
        const q = questions[index];
        answered = false;
        stage.innerHTML = `
            <p class="task-count">კითხვა ${index + 1} / ${questions.length}</p>
            <h3 class="task-title">ეს კოდი რომელ თემას ეკუთვნის?</h3>
            ${codeBlock(q.code)}
            <div class="options" role="group" aria-label="პასუხის ვარიანტები">
                ${TOPICS.map((t, i) => `
                    <button class="option" type="button" data-answer="${t.id}">
                        <span class="option__key">${i + 1}</span>${t.label}
                    </button>`).join('')}
            </div>
            <div class="task-feedback" aria-live="polite"></div>`;
        Game.progress(index, questions.length);
        const mode = Game.assist();
        if (mode) {
            const options = $$('.option', stage);
            Game.arm(mode, options.filter(b => b.dataset.answer !== q.answer), { right: options.find(b => b.dataset.answer === q.answer) });
        }
    }

    function answer(id, btn = $(`[data-answer="${id}"]`, stage)) {
        if (answered || !btn || btn.dataset.assist) return;
        answered = true;
        Game.disarm();
        const q = questions[index];
        const ok = id === q.answer;
        $$('.option', stage).forEach((b) => {
            b.disabled = true;
            const a = b.dataset.answer;
            b.classList.add(a === q.answer ? 'is-correct' : a === id ? 'is-wrong' : 'is-dim');
        });
        let alive = true;
        if (ok) Game.reward(btn, COINS.quiz);
        else alive = Game.penalty(btn);

        const right = TOPICS.find(t => t.id === q.answer);
        const last = index === questions.length - 1;
        $('.task-feedback', stage).innerHTML = `
            ${feedbackTemplate(ok, ok ? 'სწორია!' : `სწორი პასუხი: ${right.label}.`, `${q.explain} <a href="#${right.id}">თემის გამეორება</a>`)}
            ${alive ? `<div class="task-nav"><button class="btn btn--primary" type="button" data-next>${nextLabel(last)}</button></div>` : ''}`;
        Game.progress(index + 1, questions.length);
        if (alive) $('[data-next]', stage).focus({ preventScroll: true });
    }

    function next() {
        if (!answered) return;
        index++;
        if (index < questions.length) render();
        else Game.complete();
    }

    stage.onclick = (e) => {
        const option = e.target.closest('[data-answer]');
        if (option) return answer(option.dataset.answer, option);
        if (e.target.closest('[data-next]')) next();
    };
    Game.onKey = (e) => {
        const n = Number(e.key);
        if (!answered && n >= 1 && n <= TOPICS.length) {
            e.preventDefault();
            answer(TOPICS[n - 1].id);
        } else if (answered && e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
            e.preventDefault();
            next();
        }
    };
    render();
}

/* =========================================================
   2. Bug hunt — click the line that breaks the code
   ========================================================= */

function bugsLevel(stage) {
    const bugs = shuffle(BUGS).slice(0, sizeOf('bugs'));
    let index = 0;
    let solved = false;
    let hinted = false;

    function render() {
        const b = bugs[index];
        const topic = TOPICS.find(t => t.id === b.topic);
        solved = false;
        hinted = false;
        stage.innerHTML = `
            <p class="task-count">ბაგი ${index + 1} / ${bugs.length}</p>
            <div class="task-head">
                <p class="task-goal">${icon('target')}<span><b>მიზანი:</b> ${escapeHtml(b.goal)}</span></p>
                <span class="tag">${icon(topic.icon)}${topic.label}</span>
            </div>
            <p class="task-help">კოდი ისე არ მუშაობს, როგორც უნდა. იპოვე ხაზი, რომელიც ამას იწვევს, და დააჭირე.</p>
            <div class="bug-code" role="group" aria-label="კოდის ხაზები">
                ${b.lines.map((line, i) => `
                    <button class="bug-line" type="button" data-line="${i}">
                        <span class="bug-line__no">${i + 1}</span><code>${highlight(line) || ' '}</code>
                    </button>`).join('')}
            </div>
            <p class="task-msg" aria-live="polite"></p>
            <div class="task-actions">
                <button class="btn btn--sm" type="button" data-hint>${icon('bulb')}მინიშნება (ჯილდო +${COINS.bugsHint})</button>
                <button class="btn btn--sm btn--ghost" type="button" data-reveal>${icon('eye')}მაჩვენე (0 მონეტა)</button>
            </div>
            <div class="hint" hidden>${icon('bulb')}<span>${escapeHtml(b.hint)}</span></div>
            <div class="task-answer" aria-live="polite"></div>`;
        Game.progress(index, bugs.length);
        const mode = Game.assist();
        if (mode) {
            $('.bug-code', stage).classList.add('is-assist');
            const lines = $$('.bug-line', stage);
            Game.arm(mode, lines.filter(l => Number(l.dataset.line) !== b.bug), { dodge: true, right: lines[b.bug] });
        }
    }

    function pick(i, line = $(`[data-line="${i}"]`, stage)) {
        const b = bugs[index];
        if (solved || !line || line.dataset.assist) return;
        if (i === b.bug) {
            Game.reward(line, hinted ? COINS.bugsHint : COINS.bugs);
            return reveal(true);
        }
        line.classList.remove('is-wrong');
        void line.offsetWidth;
        line.classList.add('is-wrong');
        $('.task-msg', stage).textContent = `ხაზი ${i + 1} რიგზეა.`;
        if (!Game.penalty(line)) {
            solved = true;
            $$('.bug-line, .task-actions button', stage).forEach(el => { el.disabled = true; });
        }
    }

    function reveal(found) {
        const b = bugs[index];
        solved = true;
        Game.disarm();
        $$('.bug-line', stage).forEach((btn, i) => {
            btn.disabled = true;
            btn.classList.remove('is-wrong');
            if (i === b.bug) btn.classList.add(found ? 'is-found' : 'is-bug');
        });
        $('.task-actions', stage).hidden = true;
        $('.hint', stage).hidden = false;
        $('.task-msg', stage).textContent = '';
        $('.task-answer', stage).innerHTML = `
            ${feedbackTemplate(found, found ? 'იპოვე!' : 'აი, სად იყო ბაგი.', escapeHtml(b.explain))}
            <div class="diff" aria-label="გასწორება">
                <p class="diff__title">გასწორება, ხაზი ${b.bug + 1}</p>
                <div class="diff__row diff__row--del"><span aria-hidden="true">−</span><code>${highlight(b.lines[b.bug])}</code></div>
                <div class="diff__row diff__row--add"><span aria-hidden="true">+</span><code>${highlight(b.fix)}</code></div>
            </div>
            <div class="task-nav"><button class="btn btn--primary" type="button" data-next>${nextLabel(index === bugs.length - 1)}</button></div>`;
        Game.progress(index + 1, bugs.length);
        $('[data-next]', stage).focus({ preventScroll: true });
    }

    function next() {
        index++;
        if (index < bugs.length) render();
        else Game.complete();
    }

    stage.onclick = (e) => {
        const line = e.target.closest('[data-line]');
        if (line) return pick(Number(line.dataset.line), line);
        if (e.target.closest('[data-hint]')) {
            hinted = true;
            $('.hint', stage).hidden = false;
            e.target.closest('[data-hint]').disabled = true;
            return;
        }
        if (e.target.closest('[data-reveal]')) {
            Game.skip();
            return reveal(false);
        }
        if (e.target.closest('[data-next]')) next();
    };
    Game.onKey = (e) => {
        if (solved && e.key === 'Enter' && e.target.tagName !== 'BUTTON' && $('[data-next]', stage)) {
            e.preventDefault();
            next();
        }
    };
    render();
}

/* =========================================================
   3. Order the code — drag, arrows or keyboard. Every line is a square
   tube: click it and it rolls like a long die to show what it does.
   ========================================================= */

// the tube is as deep as it is tall, so each prism needs its own height in px
const prismSizer = new ResizeObserver((entries) => {
    entries.forEach(({ target }) => target.style.setProperty('--h', `${target.offsetHeight}px`));
});

/** A sequence is valid when ranks never go down. */
const isValidSequence = (seq, steps) => seq.every((s, i) => i === 0 || steps[seq[i - 1]].rank <= steps[s].rank);

function shuffledSequence(steps) {
    const ids = steps.map((_, i) => i);
    let seq;
    do { seq = shuffle(ids); } while (isValidSequence(seq, steps));
    return seq;
}

function rollTemplate(step) {
    const sides = [
        `<code>${highlight(step.code)}</code>${icon('info', 'roll__hint')}`,
        `<span>${escapeHtml(step.explain)}</span>${icon('code', 'roll__hint')}`,
    ];
    const faces = [0, 1, 2, 3].map(i => `
        <span class="roll__face roll__face--${i % 2 ? 'info' : 'code'} ${i ? '' : 'is-front'}" ${i ? 'aria-hidden="true"' : ''}>${sides[i % 2]}</span>`).join('');
    return `
        <button class="roll" type="button" aria-pressed="false" title="გადააგორე: რას აკეთებს ეს ხაზი?">
            <span class="roll__prism" style="--turn: 0">${faces}</span>
        </button>`;
}

const showsInfo = (roll) => roll.getAttribute('aria-pressed') === 'true';

/** Rolls one line a quarter turn. With `toInfo`, only rolls if needed. */
function rollLine(roll, toInfo) {
    if (toInfo !== undefined && toInfo === showsInfo(roll)) return;
    const prism = roll.firstElementChild;
    const turn = Number(prism.style.getPropertyValue('--turn')) + 1;
    prism.style.setProperty('--turn', turn);
    [...prism.children].forEach((face, i) => {
        const front = i === turn % 4;
        face.classList.toggle('is-front', front);
        if (front) face.removeAttribute('aria-hidden');
        else face.setAttribute('aria-hidden', 'true');
    });
    roll.setAttribute('aria-pressed', String(turn % 2 === 1));
}

/** Moves an element and animates the siblings that shifted (FLIP). */
function flipMove(list, mutate) {
    const items = [...list.children];
    const before = new Map(items.map(el => [el, el.getBoundingClientRect().top]));
    mutate();
    if (prefersReducedMotion.matches) return;
    items.forEach((el) => {
        const dy = before.get(el) - el.getBoundingClientRect().top;
        if (!dy || el.classList.contains('is-dragging')) return;
        el.style.transition = 'none';
        el.style.transform = `translateY(${dy}px)`;
        requestAnimationFrame(() => {
            el.style.transition = '';
            el.style.transform = '';
        });
    });
}

/** Lines that share a rank don't depend on each other, so either order was fine. */
function swapNote(p) {
    const byRank = new Map();
    p.steps.forEach(s => byRank.set(s.rank, [...(byRank.get(s.rank) || []), s]));
    const groups = [...byRank.values()].filter(g => g.length > 1);
    if (!groups.length) return '';
    const list = groups
        .map(g => g.map(s => `<code>${escapeHtml(s.code.trim().split('\n')[0])}</code>`).join(' ⇄ '))
        .join('<br>');
    return `<p class="tip swap-note">${icon('shuffle')}<span>ეს ხაზები ერთმანეთზე არ არის დამოკიდებული, ამიტომ მათი გაცვლაც სწორი იქნებოდა:<br>${list}</span></p>`;
}

function orderLevel(stage) {
    const puzzles = shuffle(PUZZLES).slice(0, sizeOf('order'));
    let index = 0;
    let fails = 0;
    let solved = false;
    let drag = null;

    const puzzle = () => puzzles[index];
    const prize = () => COINS.order[Math.min(fails, COINS.order.length - 1)];

    function itemTemplate(stepIndex) {
        return `
            <li class="sort-item" data-step="${stepIndex}">
                <button class="sort-item__grip" type="button" aria-label="გადაადგილება (ისრები ↑ ↓)">${icon('grip')}</button>
                ${rollTemplate(puzzle().steps[stepIndex])}
                <span class="sort-item__mark" aria-hidden="true"></span>
                <span class="sort-item__moves">
                    <button class="icon-btn" type="button" data-move="-1" aria-label="ზემოთ">${icon('arrowUp')}</button>
                    <button class="icon-btn" type="button" data-move="1" aria-label="ქვემოთ">${icon('arrowDown')}</button>
                </span>
            </li>`;
    }

    function render(sequence = shuffledSequence(puzzle().steps)) {
        const p = puzzle();
        solved = false;
        const tags = p.topics.map((id) => {
            const t = TOPICS.find(x => x.id === id);
            return `<span class="tag">${icon(t.icon)}${t.label}</span>`;
        }).join('');
        stage.innerHTML = `
            <p class="task-count">ამოცანა ${index + 1} / ${puzzles.length}</p>
            <div class="task-head">
                <div>
                    <h3 class="task-title">${p.title}</h3>
                    <p class="task-goal">${icon('target')}<span><b>მიზანი:</b> ${escapeHtml(p.goal)}</span></p>
                </div>
                <div class="tags">${tags}</div>
            </div>
            <p class="task-help">გადაათრიე ხაზები სახელურით (ან ისრებით) ზემოდან ქვემოთ. ხაზზე დაჭერით ის გადაგორდება და მეორე მხარეს წერია, რას აკეთებს.</p>
            <ol class="sortable" aria-label="კოდის ნაბიჯები">${sequence.map(itemTemplate).join('')}</ol>
            <div class="task-actions">
                <button class="btn btn--primary" type="button" data-check>${icon('check')}შემოწმება (+${prize()})</button>
                <button class="btn" type="button" data-roll-all></button>
                <button class="btn btn--ghost" type="button" data-shuffle>${icon('shuffle')}არევა</button>
            </div>
            <div class="task-answer" aria-live="polite"></div>
            <div class="preview" hidden>
                <p class="preview__title">${icon('play')}შედეგი: კოდი გაეშვა</p>
                <div class="preview__body"></div>
            </div>`;
        Game.progress(index, puzzles.length);
        prismSizer.disconnect();
        $$('.roll__prism', stage).forEach((prism) => {
            prism.style.setProperty('--h', `${prism.offsetHeight}px`);
            prismSizer.observe(prism);
        });
        syncRollAll();
    }

    function syncRollAll() {
        const allInfo = $$('.roll', stage).every(showsInfo);
        $('[data-roll-all]', stage).innerHTML = allInfo ? `${icon('code')}ყველას კოდი` : `${icon('info')}ყველას ახსნა`;
    }

    function rollAll() {
        const rolls = $$('.roll', stage);
        const toInfo = rolls.some(r => !showsInfo(r));
        rolls.forEach((roll, i) => {
            roll.firstElementChild.style.setProperty('--delay', `${i * 70}ms`);
            rollLine(roll, toInfo);
        });
        setTimeout(() => rolls.forEach(r => r.firstElementChild.style.removeProperty('--delay')), rolls.length * 70 + 50);
        syncRollAll();
    }

    function clearMarks() {
        $$('.sort-item', stage).forEach((li) => {
            li.classList.remove('is-right', 'is-wrong');
            li.querySelector('.sort-item__mark').innerHTML = '';
        });
        if (!solved) $('.task-answer', stage).innerHTML = '';
    }

    function moveItem(li, dir) {
        const list = li.parentElement;
        const target = dir < 0 ? li.previousElementSibling : li.nextElementSibling;
        if (!target || solved) return;
        flipMove(list, () => (dir < 0 ? list.insertBefore(li, target) : list.insertBefore(target, li)));
        clearMarks();
    }

    function check() {
        const p = puzzle();
        const checkBtn = $('[data-check]', stage);
        const seq = $$('.sort-item', stage).map(li => Number(li.dataset.step));
        const sortedRanks = seq.map(s => p.steps[s].rank).sort((a, b) => a - b);
        let wrong = 0;
        $$('.sort-item', stage).forEach((li, i) => {
            const ok = p.steps[seq[i]].rank === sortedRanks[i];
            li.classList.toggle('is-right', ok);
            li.classList.toggle('is-wrong', !ok);
            li.querySelector('.sort-item__mark').innerHTML = icon(ok ? 'check' : 'x');
            if (!ok) wrong++;
        });

        if (wrong) {
            fails++;
            Game.penalty(checkBtn);
            checkBtn.innerHTML = `${icon('check')}შემოწმება (+${prize()})`;
            $('.task-answer', stage).innerHTML = feedbackTemplate(false, 'ჯერ არა.',
                `${wrong} ხაზი არასწორ ადგილზეა (წითლად). გადააგორე და წაიკითხე, რას აკეთებენ: რა უნდა არსებობდეს მანამ, სანამ ამ ხაზს გამოიყენებ?`);
            return;
        }

        solved = true;
        Game.reward(checkBtn, prize());
        fails = 0;
        $$('.sort-item button', stage).forEach((b) => { if (!b.classList.contains('roll')) b.disabled = true; });
        $$('[data-check], [data-shuffle]', stage).forEach((b) => { b.disabled = true; });
        $('.task-answer', stage).innerHTML = `
            ${feedbackTemplate(true, 'სწორია!', 'ყველა ნაბიჯი თავის ადგილზეა. ქვემოთ ნახე, რას აკეთებს ეს კოდი სინამდვილეში.')}
            ${swapNote(p)}
            <div class="task-nav"><button class="btn btn--primary" type="button" data-next>${nextLabel(index === puzzles.length - 1)}</button></div>`;
        Game.progress(index + 1, puzzles.length);
        const preview = $('.preview', stage);
        preview.hidden = false;
        p.run($('.preview__body', stage));
    }

    function next() {
        index++;
        if (index < puzzles.length) render();
        else Game.complete();
    }

    stage.onclick = (e) => {
        const roll = e.target.closest('.roll');
        if (roll) {
            rollLine(roll);
            return syncRollAll();
        }
        const move = e.target.closest('[data-move]');
        if (move) {
            moveItem(move.closest('.sort-item'), Number(move.dataset.move));
            return move.focus({ preventScroll: true });
        }
        if (e.target.closest('[data-check]')) return check();
        if (e.target.closest('[data-roll-all]')) return rollAll();
        if (e.target.closest('[data-shuffle]')) return render();
        if (e.target.closest('[data-next]')) next();
    };

    /* pointer drag by the grip */
    stage.onpointerdown = (e) => {
        const grip = e.target.closest('.sort-item__grip');
        if (!grip || e.button !== 0 || solved) return;
        const li = grip.closest('.sort-item');
        e.preventDefault();
        grip.setPointerCapture(e.pointerId);
        li.classList.add('is-dragging');
        drag = { li, grip, list: li.parentElement };
        clearMarks();
    };
    stage.onpointermove = (e) => {
        if (!drag) return;
        const { li, list } = drag;
        const after = [...list.children].filter(el => el !== li).find((el) => {
            const r = el.getBoundingClientRect();
            return e.clientY < r.top + r.height / 2;
        });
        if (after === li.nextElementSibling || (!after && li === list.lastElementChild)) return;
        flipMove(list, () => list.insertBefore(li, after || null));
    };
    stage.onpointerup = stage.onpointercancel = () => {
        if (!drag) return;
        drag.li.classList.remove('is-dragging');
        drag.grip.focus({ preventScroll: true });
        drag = null;
    };
    /* keyboard: focus a grip, then ↑ / ↓ */
    stage.onkeydown = (e) => {
        const grip = e.target.closest('.sort-item__grip');
        if (!grip || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
        e.preventDefault();
        moveItem(grip.closest('.sort-item'), e.key === 'ArrowUp' ? -1 : 1);
        grip.focus({ preventScroll: true });
    };
    Game.onKey = (e) => {
        if (solved && e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
            e.preventDefault();
            next();
        }
    };
    render();
}

/* =========================================================
   4. What happens? — read the code, predict the result
   ========================================================= */

function outputLevel(stage) {
    const questions = shuffle(OUTPUTS).slice(0, sizeOf('output'));
    let index = 0;
    let answered = false;

    function render() {
        const q = questions[index];
        answered = false;
        stage.innerHTML = `
            <p class="task-count">კითხვა ${index + 1} / ${questions.length}</p>
            <h3 class="task-title">რა მოხდება?</h3>
            ${codeBlock(q.code)}
            <p class="console-label">${icon(q.icon || 'terminal')}${q.label || GAME_TEXT.outputLabel || 'შედეგი:'}</p>
            <div class="options options--wide" role="group" aria-label="პასუხის ვარიანტები">
                ${q.options.map((o, i) => `
                    <button class="option" type="button" data-out="${i}">
                        <span class="option__key">${String.fromCharCode(65 + i)}</span><code>${escapeHtml(o)}</code>
                    </button>`).join('')}
            </div>
            <div class="task-feedback" aria-live="polite"></div>`;
        Game.progress(index, questions.length);
        const mode = Game.assist();
        if (mode) {
            const options = $$('.option', stage);
            Game.arm(mode, options.filter(b => Number(b.dataset.out) !== q.answer), { right: options.find(b => Number(b.dataset.out) === q.answer) });
        }
    }

    function answer(i, btn = $(`[data-out="${i}"]`, stage)) {
        if (answered || !btn || btn.dataset.assist) return;
        answered = true;
        Game.disarm();
        const q = questions[index];
        const ok = i === q.answer;
        $$('.option', stage).forEach((b) => {
            const n = Number(b.dataset.out);
            b.disabled = true;
            b.classList.add(n === q.answer ? 'is-correct' : n === i ? 'is-wrong' : 'is-dim');
        });
        let alive = true;
        if (ok) Game.reward(btn, COINS.output);
        else alive = Game.penalty(btn);

        const last = index === questions.length - 1;
        $('.task-feedback', stage).innerHTML = `
            ${feedbackTemplate(ok, ok ? 'სწორია!' : `სწორი პასუხი: ${escapeHtml(q.options[q.answer])}.`, escapeHtml(q.explain))}
            ${alive ? `<div class="task-nav"><button class="btn btn--primary" type="button" data-next>${nextLabel(last)}</button></div>` : ''}`;
        Game.progress(index + 1, questions.length);
        if (alive) $('[data-next]', stage).focus({ preventScroll: true });
    }

    function next() {
        if (!answered) return;
        index++;
        if (index < questions.length) render();
        else Game.complete();
    }

    stage.onclick = (e) => {
        const option = e.target.closest('[data-out]');
        if (option) return answer(Number(option.dataset.out), option);
        if (e.target.closest('[data-next]')) next();
    };
    Game.onKey = (e) => {
        const n = 'abcd'.indexOf(e.key.toLowerCase());
        const count = questions[index].options.length;
        if (!answered && n >= 0 && n < count) {
            e.preventDefault();
            answer(n);
        } else if (answered && e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
            e.preventDefault();
            next();
        }
    };
    render();
}
