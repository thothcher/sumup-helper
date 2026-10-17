'use strict';

/* =========================================================
   PROJECTS — data for the fifth level: a real task, and the topics it needs.

   The student reads a task ("show users from a server") and switches on the
   topics that solving it takes. Every text is a [Georgian, English] pair.

   lines   the smallest honest solution, one entry per line, each tagged with the
           topics that line uses. The answer key comes from here: a topic is NEEDED
           when a line of the smallest solution cannot do without it.
   needs   topic → why it is needed (the same topics the lines use)
   maybe   topic → a good extra that is NOT required. Switching it on or off costs nothing.
   no      topic → why NOT, for the ones a student is tempted by; the rest get NO_BECAUSE
   run     async (out, step) → the code runs in slow motion: step(i) lights line i
           (step([a, b]) lights several). It may return a [ka, en] note for the student.

   Keep it that way when adding a task: each topic should be needed in a few tasks and
   clearly unneeded in others, or the switches stop teaching anything.
   ========================================================= */

/** The question each topic answers: the questions to ask while reading a task. */
const PROJECT_ASKS = {
    variables: ['რამე უნდა დავიმახსოვროთ?', 'Must something be remembered?'],
    conditions: ['არის არჩევანი: თუ ეს, მაშინ ის?', 'Is there a choice: if this, then that?'],
    loops: ['რამე მეორდება?', 'Does something repeat?'],
    functions: ['არის ქმედება, რომელიც მოვლენაზე ან ბევრჯერ შესრულდება?', 'Is there an action to run on an event, or many times?'],
    classes: ['ბევრი ერთნაირი ობიექტია, თავისი მონაცემებითა და ქცევით?', 'Many similar objects, each with its own data and behaviour?'],
    dom: ['უნდა შეიცვალოს ის, რასაც გვერდზე ხედავენ?', 'Must something change on the page?'],
    bom: ['გვჭირდება ბრაუზერი: მეხსიერება, მისამართი, ტაიმერი?', 'Do we need the browser: storage, address, timers?'],
    api: ['მონაცემი სერვერიდან მოდის?', 'Does the data come from a server?'],
};

/** Why a topic is not needed, when a task has nothing more specific to say. */
const NO_BECAUSE = {
    variables: ['არაფერი გვჭირდება დასამახსოვრებლად.', 'Nothing here has to be remembered.'],
    conditions: ['არჩევანი არ არის: ყოველთვის ერთი და იგივე ხდება.', 'There is no choice: the same thing always happens.'],
    loops: ['არაფერი მეორდება, ამიტომ ციკლი არ გვჭირდება.', 'Nothing repeats, so no loop is needed.'],
    functions: ['ქმედება ერთხელ და მაშინვე სრულდება.', 'The action runs once, right away.'],
    classes: ['ბევრი ერთნაირი ობიექტი არ გვაქვს: კლასი ზედმეტი იქნებოდა.', 'We have no crowd of similar objects, so a class would be overkill.'],
    dom: ['გვერდზე არაფერი იცვლება.', 'Nothing on the page changes.'],
    bom: ['ბრაუზერის საკუთარი საშუალებები (მეხსიერება, მისამართი, ტაიმერი) არ გვჭირდება.', 'We do not need the browser’s own tools (storage, address, timers).'],
    api: ['მონაცემი სერვერიდან არ მოდის.', 'No data comes from a server.'],
};

const PROJECTS = (() => {
    const V = 'variables', C = 'conditions', L = 'loops', F = 'functions', K = 'classes', D = 'dom', B = 'bom', A = 'api';
    const line = (code, ...topics) => ({ code, topics });
    const el = demoEl;
    const wait = demoWait;

    /** A pretend server: it answers after a short wait, like the real thing. */
    const server = async (data, ms = 800) => { await wait(ms); return data; };

    /** One narrated line under a demo: caption(['ქართულად', 'English']). */
    const captionIn = (out) => {
        const p = el('p', 'pd-caption');
        out.append(p);
        return (ka, en) => { p.innerHTML = bi(ka, en, 'bi--line'); };
    };

    const press = async (btn) => {
        btn.classList.add('is-press');
        await wait(180);
        btn.classList.remove('is-press');
    };

    const bump = (node) => {
        node.classList.remove('is-bump');
        void node.offsetWidth;
        node.classList.add('is-bump');
    };

    return [
        /* ---------- 1. the smallest one ---------- */
        {
            id: 'clicks',
            title: ['დაჭერების მთვლელი', 'Click counter'],
            story: ['გვერდზე ღილაკია. ყოველ დაჭერაზე მის გვერდით მდგომი რიცხვი 1-ით უნდა გაიზარდოს.', 'There is a button on the page. Each click must raise the number beside it by 1.'],
            lines: [
                line("const btn = document.querySelector('#add');", D),
                line("const out = document.querySelector('#count');", D),
                line('let count = 0;', V),
                line("btn.addEventListener('click', () => {", D, F),
                line('  count++;', V),
                line('  out.textContent = count;', D),
                line('});'),
            ],
            needs: {
                variables: ['რიცხვი დაჭერებს შორის უნდა „ახსოვდეს“: count ინახავს, რამდენჯერ დააჭირეს.', 'The number has to survive between clicks: count remembers how many there were.'],
                functions: ['ყოველ დაჭერაზე ერთი და იგივე ქმედება სრულდება. ის ფუნქციაშია, რომელსაც ღილაკი იძახებს.', 'The same action runs on every click. It lives in a function the button calls.'],
                dom: ['ღილაკი და რიცხვი გვერდის ელემენტებია: ვპოულობთ მათ და textContent-ს ვცვლით.', 'The button and the number are page elements: we find them and change textContent.'],
            },
            maybe: {},
            no: {
                loops: ['ერთი დაჭერა ერთი ნაბიჯია. ციკლს აქ გასამეორებელი არაფერი აქვს.', 'One click is one step. A loop would have nothing to repeat.'],
                classes: ['ერთადერთი რიცხვია. მისთვის „ნახაზი“ (კლასი) ზედმეტია.', 'It is a single number. A “blueprint” (class) is overkill.'],
            },
            async run(out, step) {
                const row = el('div', 'pd-row');
                const btn = el('button', 'btn btn--primary', 'დააჭირე');
                const num = el('output', 'pd-count', '0');
                row.append(btn, num);
                out.append(row);
                let count = 0;
                const show = () => { num.textContent = count; bump(num); };
                await step([0, 3]);
                for (let i = 0; i < 3; i++) {
                    await press(btn);
                    await step(4);
                    count++;
                    await step(5);
                    show();
                }
                btn.addEventListener('click', () => { count++; show(); });
                return ['ახლა შენ სცადე: დააჭირე ღილაკს.', 'Now you try: press the button.'];
            },
        },

        /* ---------- 2. a choice at the edge of a list ---------- */
        {
            id: 'gallery',
            title: ['ფოტო გალერეა', 'Photo gallery'],
            story: ['სამი ფოტო გაქვს. ღილაკი „შემდეგი“ ერთი ფოტოთი წინ გადადის, ბოლო ფოტოს შემდეგ კი ისევ პირველი უნდა გამოჩნდეს.', 'You have three photos. The “Next” button moves one photo forward, and after the last one the first must come back.'],
            lines: [
                line("const photos = ['batumi', 'tbilisi', 'kazbegi'];", V),
                line('let index = 0;', V),
                line("const img = document.querySelector('#photo');", D),
                line("document.querySelector('#next').addEventListener('click', () => {", D, F),
                line('  index++;', V),
                line('  if (index === photos.length) index = 0;', C),
                line("  img.src = photos[index] + '.jpg';", D),
                line('});'),
            ],
            needs: {
                variables: ['photos სიას ინახავს, index კი იმას, რომელი ფოტო ჩანს ახლა.', 'photos holds the list, and index remembers which photo is showing now.'],
                conditions: ['ბოლო ფოტოს შემდეგ გადაწყვეტილებაა საჭირო: თუ index სიის ბოლოს გასცდა, ვუბრუნდებით 0-ს.', 'After the last photo we must decide: if index runs past the end, go back to 0.'],
                functions: ['„შემდეგი“ ღილაკი ფუნქციას იძახებს, რომელიც ყოველ დაჭერაზე თავიდან სრულდება.', 'The “Next” button calls a function that runs again on every click.'],
                dom: ['ფოტო გვერდზე img ელემენტია: მისი src იცვლება.', 'The photo is an img element on the page: its src changes.'],
            },
            maybe: {},
            no: {
                loops: ['ციკლი ყველა ფოტოს ერთბაშად გადაუვლიდა. აქ ყოველ დაჭერაზე მხოლოდ ერთი ნაბიჯია.', 'A loop would run through all photos at once. Here each click is just one step.'],
                api: ['ფოტოების სახელები ჩვენთანვეა, სერვერიდან არაფერი მოდის.', 'The photo names are right here; nothing comes from a server.'],
            },
            async run(out, step) {
                const photos = [
                    ['ბათუმი', 'linear-gradient(135deg, #1f6f9a, #7fd0e8)'],
                    ['თბილისი', 'linear-gradient(135deg, #a8543a, #f0b36a)'],
                    ['ყაზბეგი', 'linear-gradient(135deg, #51647a, #dfe9f2)'],
                ];
                const tile = el('div', 'pd-photo');
                const tag = el('code', 'pd-tag', 'index = 0');
                const btn = el('button', 'btn', 'შემდეგი →');
                const row = el('div', 'pd-row');
                row.append(btn, tag);
                out.append(tile, row);
                const draw = (i) => { tile.style.background = photos[i][1]; tile.textContent = photos[i][0]; };
                let index = 0;
                draw(0);
                await step([0, 3]);
                for (let n = 0; n < 4; n++) {
                    await press(btn);
                    await step(4);
                    index++;
                    tag.textContent = `index = ${index}`;
                    await step(5);
                    if (index === photos.length) {
                        tag.textContent = 'index = 3: სიის ბოლოს გავცდით → 0';
                        index = 0;
                        await wait(500);
                        tag.textContent = 'index = 0';
                    }
                    await step(6);
                    draw(index);
                }
                return null;
            },
        },

        /* ---------- 2b. the browser keeps its own memory ---------- */
        {
            id: 'back',
            title: ['„უკან“ ღილაკი', 'Back button'],
            story: ['გვერდზე ღილაკია „უკან“. დაჭერისას ბრაუზერი წინა გვერდზე უნდა დაბრუნდეს.', 'The page has a “Back” button. When it is pressed, the browser must return to the previous page.'],
            lines: [
                line("document.querySelector('#back').addEventListener('click', () => {", D, F),
                line('  history.back();', B),
                line('});'),
            ],
            needs: {
                dom: ['ღილაკს გვერდზე ვპოულობთ და მასზე დაჭერას ვუსმენთ.', 'We find the button on the page and listen for a click on it.'],
                functions: ['დაჭერისას ფუნქცია სრულდება, რომელიც ბრაუზერს უკან დაბრუნებას სთხოვს.', 'On a click a function runs that tells the browser to go back.'],
                bom: ['გვერდების ისტორია ბრაუზერს ეკუთვნის: history.back() ბრაუზერისავე „უკან“ ღილაკს აჭერს.', 'The history of pages belongs to the browser: history.back() presses the browser’s own back button.'],
            },
            maybe: {},
            no: {
                variables: ['დასამახსოვრებელი არაფერია: ისტორიას ბრაუზერი თავად ინახავს.', 'Nothing for us to remember: the browser keeps the history itself.'],
            },
            async run(out, step) {
                const pages = ['გვერდი 1: მთავარი', 'გვერდი 2: პროდუქტი'];
                const frame = el('div', 'pd-browser', '<div class="pd-browser__bar"><span class="pd-browser__back">←</span><span class="pd-browser__url"></span></div><div class="pd-browser__page"></div>');
                const url = frame.querySelector('.pd-browser__url');
                const view = frame.querySelector('.pd-browser__page');
                const arrow = frame.querySelector('.pd-browser__back');
                const row = el('div', 'pd-row');
                const btn = el('button', 'btn', '← უკან');
                row.append(btn);
                out.append(frame, row);
                const say = captionIn(out);
                const show = (i) => { url.textContent = pages[i]; view.textContent = pages[i]; arrow.classList.toggle('is-off', i === 0); bump(view); };
                show(1);
                say('ბრაუზერს უკვე ახსოვს, რომ ამ გვერდამდე მთავარი გვერდი იყო.', 'The browser already knows the main page came before this one.');
                await step(0);
                await press(btn);
                await step(1);
                show(0);
                say('ბრაუზერმა თავისი ისტორიიდან წინა გვერდი ამოიღო: ჩვენ არაფერი შეგვინახავს.', 'The browser took the previous page from its own history: we stored nothing.');
                return null;
            },
        },

        /* ---------- 3. the browser remembers ---------- */
        {
            id: 'darkmode',
            title: ['ბნელი რეჟიმი', 'Dark mode'],
            story: ['ღილაკი გვერდს ბნელ რეჟიმში გადაიყვანს. გვერდის გადატვირთვის შემდეგაც არჩევანი უნდა დარჩეს.', 'A button switches the page to dark mode. After a reload, the choice must still be there.'],
            lines: [
                line("const btn = document.querySelector('#theme');", D),
                line("if (localStorage.getItem('theme') === 'dark') {", C, B),
                line("  document.body.classList.add('dark');", D),
                line('}'),
                line("btn.addEventListener('click', () => {", D, F),
                line("  const isDark = document.body.classList.toggle('dark');", D),
                line("  localStorage.setItem('theme', isDark ? 'dark' : 'light');", B, C),
                line('});'),
            ],
            needs: {
                bom: ['ცვლადი გვერდის გადატვირთვისას ქრება. ბრაუზერის მეხსიერება, localStorage, კი რჩება.', 'A variable vanishes on reload. The browser’s memory, localStorage, stays.'],
                conditions: ['გვერდის გახსნისას ვამოწმებთ: თუ შენახული არჩევანი dark-ია, ბნელ რეჟიმს ვრთავთ.', 'When the page opens we check: if the saved choice is dark, we switch it on.'],
                dom: ['ბნელი რეჟიმი გვერდის იერსახეა: body-ს კლასი იცვლება.', 'Dark mode is how the page looks: the body’s class changes.'],
                functions: ['დაჭერისას ფუნქცია სრულდება: კლასს ცვლის და არჩევანს ინახავს.', 'On a click a function runs: it toggles the class and saves the choice.'],
            },
            maybe: {
                variables: ['isDark მხოლოდ დროებითი დამხმარეა. რაც დასამახსოვრებელია, localStorage-შია: ჩვეულებრივი ცვლადი გადატვირთვაზე დაიკარგებოდა.', 'isDark is only a helper. What must be remembered lives in localStorage: an ordinary variable would be lost on reload.'],
            },
            no: {
                api: ['არჩევანი ბრაუზერში ინახება, სერვერი არ გვჭირდება.', 'The choice is kept in the browser; no server is needed.'],
            },
            async run(out, step) {
                const KEY = 'js-leaves-demo-theme';
                try { localStorage.removeItem(KEY); } catch { /* the demo still works */ }
                const page = el('div', 'pd-page', '<b>გამარჯობა!</b><span>ეს ჩემი გვერდია.</span>');
                const btn = el('button', 'btn', '☾ ბნელი რეჟიმი');
                const memory = el('code', 'pd-tag', 'localStorage: (ცარიელია)');
                const row = el('div', 'pd-row');
                row.append(btn, memory);
                out.append(page, row);
                const say = captionIn(out);

                say('პირველი ვიზიტი: ბრაუზერს ჯერ არაფერი ახსოვს.', 'First visit: the browser remembers nothing yet.');
                await step(0);
                await step(1);
                await step(4);
                await press(btn);
                say('დაჭერა: კლასი ჩაირთო და არჩევანი ინახება.', 'A click: the class is on and the choice is saved.');
                await step(5);
                page.classList.add('is-dark');
                await step(6);
                try { localStorage.setItem(KEY, 'dark'); } catch { /* ignore */ }
                memory.textContent = 'localStorage: theme = "dark"';
                bump(memory);
                await wait(700);

                say('↻ გვერდი გადაიტვირთა: ყველა ცვლადი წაიშალა, localStorage კი დარჩა.', '↻ The page reloaded: every variable is gone, localStorage stayed.');
                page.classList.remove('is-dark');
                await wait(600);
                await step(0);
                await step(1);
                await step(2);
                page.classList.add('is-dark');
                say('ბნელი რეჟიმი დაბრუნდა: ბრაუზერს ახსოვდა!', 'Dark mode is back: the browser remembered!');
                try { localStorage.removeItem(KEY); } catch { /* ignore */ }
                return null;
            },
        },

        /* ---------- 4. loop + choice ---------- */
        {
            id: 'search',
            title: ['ძებნა სიაში', 'Live search'],
            story: ['ქალაქების სიაა და მის ზემოთ საძიებო ველი. რასაც ჩაწერ, სიაში მხოლოდ ის ქალაქები უნდა დარჩეს, რომლებშიც ეს ტექსტი გვხვდება.', 'There is a list of cities with a search box above it. As you type, only the cities that contain that text stay in the list.'],
            lines: [
                line("const input = document.querySelector('#search');", D),
                line("const items = document.querySelectorAll('li');", D),
                line("input.addEventListener('input', () => {", D, F),
                line('  const text = input.value.toLowerCase();', V, D),
                line('  for (const li of items) {', L),
                line('    if (li.textContent.toLowerCase().includes(text)) {', C),
                line('      li.hidden = false;', D),
                line('    } else {'),
                line('      li.hidden = true;', D),
                line('    }'),
                line('  }'),
                line('});'),
            ],
            needs: {
                dom: ['ველიდან ტექსტს ვკითხულობთ და სიის ელემენტებს ვმალავთ ან ვაჩვენებთ.', 'We read the text from the box and hide or show list items.'],
                functions: ['ყოველ ასოზე (input მოვლენა) ფუნქცია თავიდან სრულდება.', 'On every keystroke (the input event) the function runs again.'],
                variables: ['text ინახავს, რა ჩაწერეს, რომ ყველა ქალაქს მას შევადაროთ.', 'text holds what was typed, so every city can be compared with it.'],
                loops: ['ყოველი ქალაქი უნდა შემოწმდეს, ამიტომ ციკლი სიას თითო-თითოდ გადაუვლის.', 'Every city must be checked, so a loop walks through the list one by one.'],
                conditions: ['ქალაქი ან ემთხვევა და რჩება, ან არა და იმალება: ეს არჩევანია.', 'A city either matches and stays, or does not and hides: that is a choice.'],
            },
            maybe: {},
            no: {
                api: ['ქალაქები უკვე გვერდზეა, სერვერს არავინ ეკითხება.', 'The cities are already on the page; no server is asked.'],
            },
            async run(out, step) {
                const cities = ['თბილისი', 'ბათუმი', 'ქუთაისი', 'თელავი', 'გორი', 'ბორჯომი'];
                const box = el('div', 'pd-input', '<span class="pd-input__text"></span><i class="pd-caret"></i>');
                const ul = el('ul', 'demo-list pd-cities');
                const items = cities.map((name) => { const li = el('li', '', name); ul.append(li); return li; });
                out.append(box, ul);
                const typed = box.querySelector('.pd-input__text');
                await step([0, 1]);
                for (const query of ['თ', 'თბ']) {
                    typed.textContent = query;
                    await step(2, 380);
                    await step(3, 380);
                    for (const li of items) {
                        await step(4, 110);
                        const match = li.textContent.toLowerCase().includes(query);
                        await step(5, 110);
                        await step(match ? 6 : 8, 110);
                        li.hidden = !match;
                    }
                    await wait(500);
                }
                return null;
            },
        },

        /* ---------- 5. a sum with a rule ---------- */
        {
            id: 'cart',
            title: ['შეკვეთის ჯამი', 'Order total'],
            story: ['კალათაში ხაჭაპური და ლიმონათია. ეკრანზე ჯამი უნდა გამოჩნდეს, ხოლო თუ ის 30 ₾-ზე ნაკლებია, მიტანისთვის 5 ₾ ემატება.', 'The basket holds khachapuri and lemonade. The total shows on screen, and if it is under 30 ₾, delivery adds 5 ₾.'],
            lines: [
                line('const cart = [', V),
                line("  { name: 'ხაჭაპური', price: 12, qty: 2 },", V),
                line("  { name: 'ლიმონათი', price: 4, qty: 1 },", V),
                line('];', V),
                line('function total() {', F),
                line('  let sum = 0;', V),
                line('  for (const item of cart) {', L),
                line('    sum += item.price * item.qty;', V),
                line('  }'),
                line('  if (sum < 30) sum += 5;', C),
                line('  return sum;', F),
                line('}'),
                line("document.querySelector('#total').textContent = total() + ' ₾';", D, F),
            ],
            needs: {
                variables: ['cart ინახავს პროდუქტებს, sum კი გზაში მზარდი ჯამია.', 'cart holds the items, and sum is the running total.'],
                loops: ['პროდუქტების რაოდენობა შეიძლება შეიცვალოს, ამიტომ ციკლი ყველას ერთნაირად გადაუვლის და ფასებს ჯამს დაუმატებს.', 'The number of items can change, so a loop goes through each one the same way and adds its price.'],
                conditions: ['მიტანის საფასური მხოლოდ მაშინ ემატება, თუ ჯამი 30-ზე ნაკლებია.', 'Delivery is added only if the total is under 30.'],
                functions: ['total() ერთხელ იწერება და ნებისმიერ კალათაზე მუშაობს.', 'total() is written once and works for any basket.'],
                dom: ['შედეგი ეკრანზე უნდა გამოჩნდეს: ელემენტის textContent იცვლება.', 'The result must show on screen: an element’s textContent changes.'],
            },
            maybe: {
                classes: ['თუ პროდუქტს საკუთარი ქცევა დასჭირდა (მაგ. subtotal()), CartItem კლასი გამოდგებოდა. ახლა უბრალო ობიექტები საკმარისია.', 'If an item needed behaviour of its own (say subtotal()), a CartItem class would help. For now plain objects are enough.'],
            },
            no: {
                api: ['კალათა უკვე ჩვენს კოდშია: სერვერთან სალაპარაკო არაფერია.', 'The basket is already in our code: there is nothing to ask a server.'],
            },
            async run(out, step) {
                const cart = [{ name: 'ხაჭაპური', price: 12, qty: 2 }, { name: 'ლიმონათი', price: 4, qty: 1 }];
                const table = el('table', 'demo-receipt', '<thead><tr><th>პროდუქტი</th><th>ფასი × რაოდენობა</th><th>ჯამი</th></tr></thead><tbody></tbody><tfoot></tfoot>');
                out.append(table);
                const body = table.querySelector('tbody');
                const foot = table.querySelector('tfoot');
                await step([0, 3]);
                await step(12);                // total() is called
                await step([4, 5]);
                let sum = 0;
                for (const item of cart) {
                    await step(6);
                    await step(7);
                    sum += item.price * item.qty;
                    const tr = el('tr', '', `<td>${item.name}</td><td>${item.price} × ${item.qty}</td><td><b>${sum}</b></td>`);
                    body.append(tr);
                }
                await step(9);
                if (sum < 30) {
                    sum += 5;
                    body.append(el('tr', '', `<td>მიტანა</td><td>30 ₾-ზე ნაკლებია</td><td><b>${sum}</b></td>`));
                }
                await step(10);
                await step(12);
                foot.innerHTML = `<tr><td colspan="2">ჯამი</td><td>${sum} ₾</td></tr>`;
                return null;
            },
        },

        /* ---------- 6. get data and show it: the classic ---------- */
        {
            id: 'users',
            title: ['მომხმარებლების სია სერვერიდან', 'Users from a server'],
            story: ['სერვერზე მომხმარებლების სიაა. საიტმა უნდა წამოიღოს ის და სახელები ეკრანზე სიად ჩამოწეროს.', 'A server holds a list of users. The site must fetch it and write the names on the screen as a list.'],
            lines: [
                line('async function showUsers() {', F),
                line("  const res = await fetch('https://jsonplaceholder.typicode.com/users');", A, V),
                line('  const users = await res.json();', A, V),
                line('  for (const user of users) {', L),
                line("    const li = document.createElement('li');", D),
                line('    li.textContent = user.name;', D),
                line('    list.append(li);', D),
                line('  }'),
                line('}'),
                line('showUsers();', F),
            ],
            needs: {
                api: ['მონაცემი სხვა კომპიუტერზეა: fetch სერვერს ეკითხება, json() კი პასუხს JS-ის მასივად აქცევს.', 'The data lives on another computer: fetch asks the server and json() turns the answer into a JS array.'],
                variables: ['users ინახავს პასუხს, რომ მასზე გავიაროთ.', 'users holds the answer so we can go through it.'],
                loops: ['სიაში ბევრი მომხმარებელია და ციკლი თითოეულისთვის ერთსა და იმავეს აკეთებს.', 'The list has many users, and a loop does the same thing for each of them.'],
                dom: ['სახელები გვერდზე უნდა გამოჩნდეს: ვქმნით li-ებს და სიაში ვამატებთ.', 'The names must show on the page: we create li elements and add them to the list.'],
                functions: ['async ფუნქცია გვაძლევს await-ს: კოდი პასუხს ელოდება და მერე აგრძელებს.', 'An async function gives us await: the code waits for the answer, then carries on.'],
            },
            maybe: {
                conditions: ['სერვერი შეიძლება ჩავარდეს. if (!res.ok) შეცდომის ტექსტს აჩვენებდა. კარგი პრაქტიკაა, მაგრამ მინიმალურ ვერსიას არ სჭირდება.', 'A server can fail. if (!res.ok) would show an error message. Good practice, but the smallest version does not need it.'],
            },
            no: {
                classes: ['თითოეული მომხმარებელი სერვერიდან უკვე მზა ობიექტად მოდის. საკუთარი ნახაზი არ გვჭირდება.', 'Each user already arrives as a ready-made object. We need no blueprint of our own.'],
            },
            async run(out, step) {
                const say = captionIn(out);
                const ul = el('ul', 'demo-list');
                out.append(ul);
                let users;
                let live = true;
                await step(9);
                await step(0);
                say('⏳ ველოდები სერვერს…', 'Waiting for the server…');
                await step(1, 200);
                try {
                    const ctl = new AbortController();
                    const timer = setTimeout(() => ctl.abort(), 3500);
                    const res = await fetch('https://jsonplaceholder.typicode.com/users', { signal: ctl.signal });
                    clearTimeout(timer);
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    users = await res.json();
                } catch {
                    live = false;
                    await wait(600);
                    users = ['ნინო გელაშვილი', 'გიორგი ბერიძე', 'ლევან კაპანაძე', 'მარიამ წულაძე', 'დავით ხარაიშვილი'].map(name => ({ name }));
                }
                if (live) say('✓ პასუხი ნამდვილი სერვერიდან მოვიდა: jsonplaceholder.typicode.com', '✓ The answer came from a real server: jsonplaceholder.typicode.com');
                else say('✓ სერვერთან დაკავშირება ვერ მოხერხდა, ამიტომ სასწავლო მონაცემებია. კოდი კი იგივეა.', '✓ Could not reach the server, so this is practice data. The code is the same.');
                await step(2);
                for (const user of users.slice(0, 5)) {
                    await step(3, 160);
                    await step(4, 160);
                    const li = el('li', '', '');
                    await step(5, 160);
                    li.textContent = user.name;
                    await step(6, 160);
                    ul.append(li);
                }
                return null;
            },
        },

        /* ---------- 7. an answer from a server, used in a calculation ---------- */
        {
            id: 'converter',
            title: ['ლარის კონვერტერი', 'GEL to USD converter'],
            story: ['ადამიანი ლარის თანხას წერს და ღილაკს აჭერს. საიტმა სერვერიდან კურსი უნდა წამოიღოს და თანხა დოლარებში აჩვენოს.', 'A person types an amount in lari and presses a button. The site fetches the rate from a server and shows the amount in dollars.'],
            lines: [
                line('async function convert() {', F),
                line("  const res = await fetch('/api/rate?from=GEL&to=USD');", A, V),
                line('  const { rate } = await res.json();', A, V),
                line('  const lari = Number(input.value);', V, D),
                line("  output.textContent = (lari * rate).toFixed(2) + ' $';", D),
                line('}'),
                line("button.addEventListener('click', convert);", D, F),
            ],
            needs: {
                api: ['კურსი ყოველდღე იცვლება და სერვერზეა, ამიტომ მას fetch-ით ვკითხულობთ.', 'The rate changes every day and lives on a server, so we read it with fetch.'],
                variables: ['rate და lari გამოთვლამდე ერთი წამით უნდა გვახსოვდეს.', 'rate and lari must be held for a moment before we calculate.'],
                functions: ['convert() ღილაკზე დაჭერისას ეშვება და await-ს იყენებს.', 'convert() runs on the button press and uses await.'],
                dom: ['თანხას ველიდან ვკითხულობთ და შედეგს გვერდზე ვწერთ.', 'We read the amount from a box and write the result on the page.'],
            },
            maybe: {
                conditions: ['თუ ველში რიცხვი არ არის, NaN გამოჩნდება. if-ით შეგვეძლო გვეთქვა: „ჩაწერე რიცხვი“.', 'If the box holds no number, NaN shows up. An if could say: “type a number”.'],
            },
            no: {
                loops: ['ერთი თანხა და ერთი კურსია: გასამეორებელი არაფერია.', 'One amount and one rate: nothing to repeat.'],
            },
            async run(out, step) {
                const row = el('div', 'pd-row');
                const amount = el('div', 'pd-input', '<span class="pd-input__text">100</span> ₾');
                const btn = el('button', 'btn btn--primary', 'გადაიყვანე');
                const result = el('output', 'pd-result', '— $');
                row.append(amount, btn, result);
                out.append(row);
                const say = captionIn(out);
                await step(6);
                await press(btn);
                await step(0);
                say('GET /api/rate?from=GEL&to=USD …', 'GET /api/rate?from=GEL&to=USD …');
                await step(1, 200);
                const answer = await server({ rate: 0.37 }, 900);
                say('← { "rate": 0.37 }', '← { "rate": 0.37 }');
                await step(2);
                await step(3);
                await step(4);
                result.textContent = `${(100 * answer.rate).toFixed(2)} $`;
                bump(result);
                return null;
            },
        },

        /* ---------- 8. almost everything at once ---------- */
        {
            id: 'movies',
            title: ['ფილმები ჟანრის მიხედვით', 'Movies by genre'],
            story: ['სერვერი ფილმების სიას აგზავნის. მომხმარებელი ჟანრს ირჩევს და ეკრანზე მხოლოდ ამ ჟანრის ფილმები უნდა დარჩეს.', 'A server sends a list of movies. The user picks a genre and only movies of that genre stay on screen.'],
            lines: [
                line('async function showMovies(genre) {', F),
                line("  const res = await fetch('/api/movies');", A, V),
                line('  const movies = await res.json();', A, V),
                line("  list.innerHTML = '';", D),
                line('  for (const movie of movies) {', L),
                line('    if (movie.genre !== genre) continue;', C),
                line("    const li = document.createElement('li');", D),
                line('    li.textContent = movie.title;', D),
                line('    list.append(li);', D),
                line('  }'),
                line('}'),
                line("select.addEventListener('change', () => showMovies(select.value));", D, F),
            ],
            needs: {
                api: ['ფილმების სია სერვერზეა: fetch-ით ვიღებთ.', 'The movie list lives on a server: we get it with fetch.'],
                variables: ['movies ინახავს მთელ სიას, რომ ფილტრი მასზე გაიაროს.', 'movies holds the whole list so the filter can go over it.'],
                loops: ['ყოველი ფილმი ცალ-ცალკე უნდა შემოწმდეს.', 'Every movie must be checked on its own.'],
                conditions: ['ფილმი ან ჟანრს ემთხვევა და ჩანს, ან არა და გამოტოვდება (continue).', 'A movie either matches the genre and shows, or it does not and is skipped (continue).'],
                dom: ['სიას ვასუფთავებთ და ახალ li-ებს ვამატებთ.', 'We clear the list and add fresh li elements.'],
                functions: ['showMovies ყოველ ჯერზე ეშვება, როცა ჟანრი იცვლება.', 'showMovies runs every time the genre changes.'],
            },
            maybe: {
                bom: ['localStorage-ს შეეძლო ბოლო ჟანრის დამახსოვრება, მაგრამ ამოცანა ამას არ ითხოვს.', 'localStorage could remember the last genre, but the task does not ask for it.'],
            },
            no: {
                classes: ['ფილმი უკვე მზა ობიექტია, რომელიც სერვერიდან მოდის. კლასი არ გვჭირდება.', 'A movie is already a ready object from the server. No class needed.'],
            },
            async run(out, step) {
                const movies = [
                    { title: 'მიმინო', genre: 'კომედია' },
                    { title: 'მონანიება', genre: 'დრამა' },
                    { title: 'ქეთო და კოტე', genre: 'კომედია' },
                    { title: 'ფიროსმანი', genre: 'დრამა' },
                ];
                const genre = 'კომედია';
                const pick = el('div', 'pd-input', `ჟანრი: <b>${genre}</b>`);
                const ul = el('ul', 'demo-list');
                out.append(pick, ul);
                await step(11);
                await step(0);
                await step(1, 200);
                const data = await server(movies, 800);
                await step(2);
                await step(3);
                for (const movie of data) {
                    await step(4, 160);
                    await step(5, 160);
                    if (movie.genre !== genre) {
                        const skipped = el('li', 'pd-skipped', `${movie.title} · ${movie.genre}`);
                        ul.append(skipped);
                        await wait(450);
                        skipped.remove();
                        continue;
                    }
                    await step(6, 120);
                    await step(7, 120);
                    const li = el('li', '', movie.title);
                    await step(8, 120);
                    ul.append(li);
                }
                return null;
            },
        },

        /* ---------- 9. the address bar belongs to the browser ---------- */
        {
            id: 'product',
            title: ['პროდუქტის გვერდი', 'Product page'],
            story: ['მისამართი ასეთია: shop.ge/product.html?id=3. გვერდმა მისამართიდან უნდა გაიგოს, რომელი პროდუქტია, სერვერიდან წამოიღოს და ეკრანზე აჩვენოს.', 'The address is shop.ge/product.html?id=3. The page must learn which product it is from the address, fetch it from a server and show it.'],
            lines: [
                line("const id = new URLSearchParams(location.search).get('id');", B, V),
                line('async function showProduct() {', F),
                line("  const res = await fetch('/api/products/' + id);", A, V),
                line('  const product = await res.json();', A, V),
                line("  document.querySelector('h1').textContent = product.name;", D),
                line("  document.querySelector('.price').textContent = product.price + ' ₾';", D),
                line('}'),
                line('showProduct();', F),
            ],
            needs: {
                bom: ['მისამართის ზოლი ბრაუზერს ეკუთვნის: location.search გვეუბნება, რომელი პროდუქტია.', 'The address bar belongs to the browser: location.search tells us which product it is.'],
                api: ['პროდუქტის მონაცემები სერვერზეა, ამიტომ id-ით ვკითხულობთ.', 'The product data is on a server, so we ask for it by id.'],
                variables: ['id და product ინფორმაციას ერთი ნაბიჯიდან მეორეში გადააქვთ.', 'id and product carry the information from one step to the next.'],
                functions: ['showProduct პასუხს ელოდება (await) და მხოლოდ მერე ავსებს გვერდს.', 'showProduct waits for the answer (await) and only then fills the page.'],
                dom: ['სათაური და ფასი გვერდის ელემენტებია.', 'The title and the price are page elements.'],
            },
            maybe: {
                conditions: ['არასწორ id-ზე სერვერი 404-ს დააბრუნებდა. if (!res.ok) „პროდუქტი ვერ მოიძებნა“-ს აჩვენებდა.', 'With a wrong id the server would answer 404. if (!res.ok) could show “product not found”.'],
            },
            no: {
                loops: ['ერთი პროდუქტია: გასამეორებელი არაფერია.', 'It is one product: nothing to repeat.'],
            },
            async run(out, step) {
                const bar = el('div', 'pd-url', 'shop.ge/product.html<b>?id=3</b>');
                const card = el('div', 'pd-card', '<h4>…</h4><p class="price">…</p>');
                out.append(bar, card);
                await step(0);
                bar.classList.add('is-read');
                await step(7);
                await step(1);
                await step(2, 200);
                const product = await server({ name: 'აჭარული ხაჭაპური', price: 14 }, 800);
                await step(3);
                await step(4);
                card.querySelector('h4').textContent = product.name;
                await step(5);
                card.querySelector('.price').textContent = `${product.price} ₾`;
                bump(card);
                return null;
            },
        },

        /* ---------- 10. a list that survives a reload ---------- */
        {
            id: 'todo',
            title: ['დავალებების სია', 'To-do list'],
            story: ['ველში დავალებას წერ და ღილაკს აჭერ: ის სიაში ემატება. გვერდის გადატვირთვის შემდეგაც სია უნდა დარჩეს.', 'You type a task and press a button, and it joins the list. After the page reloads, the list must still be there.'],
            lines: [
                line("let todos = JSON.parse(localStorage.getItem('todos')) || [];", V, B),
                line('function render() {', F),
                line("  list.innerHTML = '';", D),
                line('  for (const text of todos) {', L),
                line("    const li = document.createElement('li');", D),
                line('    li.textContent = text;', D),
                line('    list.append(li);', D),
                line('  }'),
                line('}'),
                line("addBtn.addEventListener('click', () => {", D, F),
                line('  todos.push(input.value);', V),
                line("  localStorage.setItem('todos', JSON.stringify(todos));", B),
                line('  render();', F),
                line('});'),
                line('render();', F),
            ],
            needs: {
                variables: ['todos სიას ინახავს, სანამ გვერდი ღიაა.', 'todos holds the list while the page is open.'],
                bom: ['გადატვირთვაზე ცვლადი ქრება, ამიტომ სიას localStorage-შიც ვინახავთ.', 'A variable is lost on reload, so we also save the list in localStorage.'],
                loops: ['სიაში რამდენი დავალებაცაა, იმდენი li უნდა შეიქმნას.', 'There must be one li for every task in the list.'],
                dom: ['დავალებები გვერდზე უნდა გამოჩნდეს; ველსა და ღილაკსაც DOM-ით ვპოულობთ.', 'The tasks must appear on the page, and we find the box and the button through the DOM.'],
                functions: ['render() ერთხელ იწერება და ყოველ ცვლილებაზე ისევ გამოიძახება.', 'render() is written once and called again after every change.'],
            },
            maybe: {
                conditions: ['ცარიელ ველზე დაჭერისას ცარიელი დავალება დაემატებოდა. if-ით ამას შევაჩერებდით.', 'Pressing the button on an empty box would add an empty task. An if could stop that.'],
                classes: ['თუ დავალებას საკუთარი მდგომარეობა დასჭირდა (შესრულებულია თუ არა), Todo კლასი გამოდგებოდა.', 'If a task needed a state of its own (done or not), a Todo class would fit.'],
            },
            no: {
                api: ['სია მხოლოდ ბრაუზერშია და სერვერზე არ გადის.', 'The list stays in the browser; it never goes to a server.'],
            },
            async run(out, step) {
                const KEY = 'js-leaves-demo-todos';
                try { localStorage.removeItem(KEY); } catch { /* the demo still works */ }
                const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
                const row = el('div', 'pd-row');
                const field = el('div', 'pd-input', '<span class="pd-input__text"></span><i class="pd-caret"></i>');
                const btn = el('button', 'btn btn--primary', 'დამატება');
                row.append(field, btn);
                const ul = el('ul', 'demo-list');
                const memory = el('code', 'pd-tag', 'localStorage: (ცარიელია)');
                out.append(row, ul, memory);
                const say = captionIn(out);
                const typed = field.querySelector('.pd-input__text');
                let todos = [];
                const render = async () => {
                    await step([1, 2], 200);
                    ul.innerHTML = '';
                    for (const text of todos) {
                        await step(3, 160);
                        await step(4, 160);
                        const li = el('li', '', '');
                        await step(5, 160);
                        li.textContent = text;
                        await step(6, 160);
                        ul.append(li);
                    }
                };

                say('პირველი ვიზიტი: სია ცარიელია.', 'First visit: the list is empty.');
                await step(0);
                await step(14);
                await render();
                await step(9);
                typed.textContent = 'ვისწავლო JS';
                await press(btn);
                say('დაჭერა: სიაში ემატება და ბრაუზერშიც ინახება.', 'A click: it joins the list and is saved in the browser.');
                await step(10);
                todos.push('ვისწავლო JS');
                await step(11);
                try { localStorage.setItem(KEY, JSON.stringify(todos)); } catch { /* ignore */ }
                memory.textContent = `localStorage: todos = ${JSON.stringify(todos)}`;
                bump(memory);
                await step(12);
                await render();
                await wait(500);

                say('↻ გვერდი გადაიტვირთა: ცვლადი ცარიელია, localStorage-ში კი დავალება დარჩა.', '↻ The page reloaded: the variable is empty, but the task is still in localStorage.');
                todos = [];
                ul.innerHTML = '';
                typed.textContent = '';
                await wait(700);
                await step(0);
                todos = read();
                await step(14);
                await render();
                say('სია დაბრუნდა: ბრაუზერს ახსოვდა!', 'The list is back: the browser remembered!');
                try { localStorage.removeItem(KEY); } catch { /* ignore */ }
                return null;
            },
        },

        /* ---------- 11. a timer is not a loop ---------- */
        {
            id: 'countdown',
            title: ['უკუთვლა', 'Countdown'],
            story: ['ტესტის დაწყებამდე 5 წამია დარჩენილი. რიცხვი ყოველ წამს უნდა შემცირდეს, 0-ზე კი „დაიწყო!“ უნდა გამოჩნდეს.', 'The test starts in 5 seconds. The number drops every second, and at zero it says “Go!”.'],
            lines: [
                line('let left = 5;', V),
                line('out.textContent = left;', D),
                line('function tick() {', F),
                line('  left--;', V),
                line('  if (left === 0) {', C),
                line('    clearInterval(timer);', B),
                line("    out.textContent = 'დაიწყო!';", D),
                line('  } else {'),
                line('    out.textContent = left;', D),
                line('  }'),
                line('}'),
                line('const timer = setInterval(tick, 1000);', B, V),
            ],
            needs: {
                variables: ['left იმახსოვრებს, რამდენი წამი დარჩა.', 'left remembers how many seconds are left.'],
                bom: ['ტაიმერი ბრაუზერს ეკუთვნის: setInterval ფუნქციას ყოველ წამს გამოიძახებს, clearInterval კი შეაჩერებს.', 'Timers belong to the browser: setInterval calls our function every second, and clearInterval stops it.'],
                functions: ['tick() ერთი წამის საქმეს აკეთებს და ბრაუზერი მას თავად იძახებს.', 'tick() does one second’s work, and the browser calls it for us.'],
                conditions: ['0-ზე უნდა გადავწყვიტოთ: ვჩერდებით და „დაიწყო!“-ს ვწერთ, თორემ ვაგრძელებთ.', 'At zero we must decide: stop and write “Go!”, otherwise carry on.'],
                dom: ['რიცხვი ეკრანზე უნდა ჩანდეს.', 'The number must be visible on screen.'],
            },
            maybe: {},
            no: {
                loops: ['setInterval ციკლი არ არის: ბრაუზერი თავად იძახებს tick-ს ყოველ წამს, ჩვენი კოდი არსად ელოდება.', 'setInterval is not a loop: the browser calls tick every second, and our code never waits.'],
                api: ['ტაიმერი ბრაუზერშია, სერვერი არ გვჭირდება.', 'The timer lives in the browser; no server needed.'],
            },
            async run(out, step) {
                const box = el('output', 'pd-count', '5');
                out.append(box);
                let left = 5;
                await step([0, 1]);
                await step(11);
                for (let n = 0; n < 5; n++) {
                    await wait(850);
                    await step(2, 140);
                    left--;
                    await step(3, 140);
                    await step(4, 140);
                    if (left === 0) {
                        await step(5, 140);
                        await step(6, 140);
                        box.textContent = 'დაიწყო!';
                        box.classList.add('is-go');
                    } else {
                        await step(7, 140);
                        await step(8, 140);
                        box.textContent = left;
                        bump(box);
                    }
                }
                return null;
            },
        },

        /* ---------- 12. many similar things: a class ---------- */
        {
            id: 'squad',
            title: ['ფეხბურთელების ბარათები', 'Player cards'],
            story: ['გუნდის ყველა მოთამაშეს სახელი და ნომერი აქვს. ეკრანზე თითოეული ბარათად უნდა გამოჩნდეს: „7. ნიკა“.', 'Every player in the squad has a name and a number. Each one must show on screen as a card: “7. Nika”.'],
            lines: [
                line('class Player {', K),
                line('  constructor(name, number) {', K),
                line('    this.name = name;', K),
                line('    this.number = number;', K),
                line('  }', K),
                line('  card() {', K),
                line("    return this.number + '. ' + this.name;", K),
                line('  }', K),
                line('}', K),
                line("const squad = [new Player('ნიკა', 7), new Player('გიო', 9), new Player('ლუკა', 10)];", V, K),
                line('for (const player of squad) {', L),
                line("  const li = document.createElement('li');", D),
                line('  li.textContent = player.card();', D),
                line('  list.append(li);', D),
                line('}'),
            ],
            needs: {
                classes: ['ბევრი ერთნაირი მოთამაშეა: ყველას სახელი, ნომერი და card() აქვს. კლასი ამ „ნახაზს“ ერთხელ აღწერს.', 'Many similar players, each with a name, a number and card(). A class describes this “blueprint” once.'],
                variables: ['squad მოთამაშეებს ინახავს.', 'squad holds the players.'],
                loops: ['ყველა მოთამაშისთვის ერთი და იგივე ბარათი უნდა დაიხატოს.', 'The same card must be drawn for every player.'],
                dom: ['ბარათები გვერდზე li ელემენტებია.', 'The cards are li elements on the page.'],
            },
            maybe: {
                functions: ['card() ფუნქციაა, რომელიც კლასის შიგნით ცხოვრობს. ცალკე ფუნქცია არ გვჭირდება.', 'card() is a function that lives inside the class, so no separate function is needed.'],
            },
            no: {
                api: ['მოთამაშეები ჩვენს კოდშივეა, სერვერზე არაფერს ვეკითხებით.', 'The players are right in our code; we ask no server.'],
            },
            async run(out, step) {
                const players = [['ნიკა', 7], ['გიო', 9], ['ლუკა', 10]];
                const ul = el('ul', 'pd-cards');
                out.append(ul);
                await step([0, 8]);
                await step(9);
                for (const [name, number] of players) {
                    await step(10, 260);
                    await step(11, 200);
                    const li = el('li', '', '');
                    await step(12, 200);
                    li.textContent = `${number}. ${name}`;
                    await step(13, 200);
                    ul.append(li);
                }
                return null;
            },
        },

        /* ---------- 12b. every object keeps its own count ---------- */
        {
            id: 'likes',
            title: ['ლაიქის ღილაკები', 'Like buttons'],
            story: ['გვერდზე სამი პოსტია და თითოს თავისი ♥ ღილაკი აქვს. ყოველი ღილაკი მხოლოდ თავისი პოსტის ლაიქებს ითვლის.', 'The page has three posts, each with its own ♥ button. Every button counts the likes of its own post only.'],
            lines: [
                line('class Like {', K),
                line('  constructor(button) {', K),
                line('    this.count = 0;', K),
                line('    this.button = button;', K),
                line("    button.addEventListener('click', () => this.add());", K, D, F),
                line('  }', K),
                line('  add() {', K),
                line('    this.count++;', K),
                line("    this.button.textContent = '♥ ' + this.count;", K, D),
                line('  }', K),
                line('}', K),
                line("for (const button of document.querySelectorAll('.like')) {", L, D),
                line('  new Like(button);', K),
                line('}'),
            ],
            needs: {
                classes: ['სამივე ღილაკი ერთნაირად იქცევა, მაგრამ თითოს საკუთარი რიცხვი აქვს. კლასი ამას ერთხელ აღწერს, new Like კი სამ დამოუკიდებელ ეგზემპლარს ქმნის.', 'All three buttons behave the same, yet each has its own number. A class describes that once, and new Like makes three independent copies.'],
                loops: ['ყველა .like ღილაკისთვის ერთსა და იმავეს ვაკეთებთ: ციკლი თითოეულზე ახალ Like-ს ქმნის.', 'We wire up every .like button the same way: a loop makes a new Like for each one.'],
                dom: ['ღილაკებს გვერდზე ვპოულობთ და მათი ტექსტი იცვლება.', 'We find the buttons on the page and their text changes.'],
                functions: ['დაჭერისას ფუნქცია გამოიძახება, რომელიც add()-ს უშვებს.', 'On a click a function is called, and it runs add().'],
            },
            maybe: {
                variables: ['რიცხვი თითოეული ობიექტის შიგნითაა (this.count), ამიტომ ცალკე ცვლადი არ გვჭირდება.', 'The number lives inside each object (this.count), so no separate variable is needed.'],
            },
            no: {
                conditions: ['ყოველი დაჭერა ერთნაირად მუშაობს: ორ გზას შორის არჩევანი არ არის.', 'Every click works the same way: there is no choice between two paths.'],
            },
            async run(out, step) {
                const posts = el('div', 'pd-posts');
                const buttons = ['პოსტი 1', 'პოსტი 2', 'პოსტი 3'].map((title) => {
                    const card = el('div', 'pd-post', `<span>${title}</span>`);
                    const button = el('button', 'btn pd-like', '♥ 0');
                    card.append(button);
                    posts.append(card);
                    return button;
                });
                out.append(posts);
                const counts = [0, 0, 0];
                const like = async (i) => {
                    await press(buttons[i]);
                    await step(4, 240);
                    await step(7, 240);
                    counts[i]++;
                    await step(8, 240);
                    buttons[i].textContent = `♥ ${counts[i]}`;
                    bump(buttons[i]);
                };
                await step([0, 10]);
                for (let i = 0; i < 3; i++) {
                    await step(11, 160);
                    await step(12, 160);
                }
                await like(0);
                await like(0);
                await like(2);
                return ['სამი ღილაკი, სამი დამოუკიდებელი რიცხვი: ახლა შენ სცადე.', 'Three buttons, three independent numbers: now you try.'];
            },
        },

        /* ---------- 13. a class that guards its own data ---------- */
        {
            id: 'wallet',
            title: ['საფულე', 'Wallet'],
            story: ['საფულეში 50 ₾ გაქვს. ღილაკი 30 ₾-ს იხდის, მაგრამ თუ ფული არ ჰყოფნის, უარს ამბობს და ბალანსი არ იცვლება.', 'Your wallet holds 50 ₾. The button pays 30 ₾, but if there is not enough money it refuses and the balance stays.'],
            lines: [
                line('class Wallet {', K),
                line('  constructor(balance) { this.balance = balance; }', K),
                line('  pay(price) {', K),
                line('    if (price > this.balance) return false;', K, C),
                line('    this.balance -= price;', K),
                line('    return true;', K),
                line('  }', K),
                line('}', K),
                line('const wallet = new Wallet(50);', V, K),
                line("payBtn.addEventListener('click', () => {", D, F),
                line('  const paid = wallet.pay(30);', V),
                line("  out.textContent = paid ? wallet.balance + ' ₾' : 'არ ჰყოფნის';", D, C),
                line('});'),
            ],
            needs: {
                classes: ['საფულეს თავისი თანხა და თავისი წესები აქვს, ორივე ერთ ადგილას: ბალანსი და pay().', 'The wallet has its own money and its own rules, kept together in one place: the balance and pay().'],
                conditions: ['pay() წყვეტს: თუ თანხა არ ჰყოფნის, უარს ამბობს. ეკრანზეც არჩევანია: ახალი ბალანსი ან „არ ჰყოფნის“.', 'pay() decides: if there is not enough, it refuses. The screen has a choice too: the new balance or “not enough”.'],
                variables: ['wallet და paid შედეგს შემდეგი ნაბიჯისთვის ინახავენ.', 'wallet and paid hold results for the next step.'],
                dom: ['ბალანსი ეკრანზე უნდა ჩანდეს.', 'The balance must show on screen.'],
                functions: ['ღილაკზე დაჭერისას ფუნქცია სრულდება.', 'On a click a function runs.'],
            },
            maybe: {},
            no: {
                loops: ['ერთი საფულეა და ერთი გადახდა: გასამეორებელი არაფერია.', 'One wallet, one payment: nothing to repeat.'],
            },
            async run(out, step) {
                const row = el('div', 'pd-row');
                const btn = el('button', 'btn btn--primary', 'გადაიხადე 30 ₾');
                const result = el('output', 'pd-result', '50 ₾');
                row.append(btn, result);
                out.append(row);
                const say = captionIn(out);
                let balance = 50;
                await step([0, 7]);
                await step(8);
                for (let n = 0; n < 2; n++) {
                    await press(btn);
                    await step(9);
                    await step(10);
                    await step(2, 260);
                    await step(3, 380);
                    const enough = 30 <= balance;
                    if (enough) {
                        await step(4, 260);
                        balance -= 30;
                        await step(5, 260);
                    }
                    await step(11);
                    result.textContent = enough ? `${balance} ₾` : 'არ ჰყოფნის';
                    result.classList.toggle('is-no', !enough);
                    bump(result);
                    say(enough ? 'ფული ეყო: ბალანსი შემცირდა.' : 'ფული არ ეყო: pay() უარს ამბობს, ბალანსი იგივეა.', enough ? 'Enough money: the balance dropped.' : 'Not enough: pay() refuses and the balance stays.');
                    await wait(500);
                }
                return null;
            },
        },

        /* ---------- 14-16. no page at all: the result goes to the console ---------- */
        {
            id: 'taxi',
            title: ['ტაქსის ფასი', 'Taxi fare'],
            story: ['ტაქსი 3 ₾-ით იწყება და თითო კილომეტრი 1.2 ₾ ღირს. ღამით ფასი 1.5-ჯერ მეტია. ფუნქციამ ფასი უნდა გამოთვალოს და კონსოლში დაბეჭდოს.', 'A taxi starts at 3 ₾ and each kilometre costs 1.2 ₾. At night the price is 1.5 times higher. A function must work out the fare and print it to the console.'],
            lines: [
                line('function fare(km, isNight) {', F),
                line('  let price = 3 + km * 1.2;', V),
                line('  if (isNight) {', C),
                line('    price = price * 1.5;', V),
                line('  }'),
                line('  return price;', F),
                line('}'),
                line('console.log(fare(5, true)); // 13.5', F),
            ],
            needs: {
                functions: ['ფასს სხვადასხვა მონაცემით ხშირად ვითვლით, ამიტომ fare(km, isNight) ერთხელ იწერება.', 'We work out fares again and again with different input, so fare(km, isNight) is written once.'],
                variables: ['price გზაში იცვლება: ჯერ საბაზო ფასია, მერე შესაძლოა ღამის ფასი.', 'price changes along the way: first the base fare, then maybe the night fare.'],
                conditions: ['ღამე ფასი სხვაა: if ირჩევს, გავამრავლოთ თუ არა.', 'Night costs more: if chooses whether to multiply.'],
            },
            maybe: {},
            no: {
                dom: ['console.log გვერდს არ ცვლის: ის დეველოპერის ფანჯარაში ბეჭდავს.', 'console.log does not change the page: it prints in the developer tools.'],
                loops: ['ერთი მგზავრობაა: გასამეორებელი არაფერია.', 'It is one ride: nothing repeats.'],
            },
            async run(out, step) {
                const box = consoleBox([]);
                out.append(box);
                const log = (text) => { box.textContent += (box.textContent ? '\n' : '') + text; };
                await step(7);
                await step(0);
                await step(1);
                log('price = 3 + 5 × 1.2  →  9');
                await step(2);
                await step(3);
                log('ღამეა: price = 9 × 1.5  →  13.5');
                await step(5);
                log('13.5');
                return null;
            },
        },
        {
            id: 'average',
            title: ['საშუალო ქულა', 'Average grade'],
            story: ['სტუდენტს ხუთი ქულა აქვს. ფუნქციამ საშუალო უნდა გამოთვალოს და კონსოლში დაბეჭდოს.', 'A student has five grades. A function must work out the average and print it to the console.'],
            lines: [
                line('function average(grades) {', F),
                line('  let sum = 0;', V),
                line('  for (const grade of grades) {', L),
                line('    sum += grade;', V),
                line('  }'),
                line('  return sum / grades.length;', F),
                line('}'),
                line('console.log(average([8, 10, 7, 9, 6])); // 8', F),
            ],
            needs: {
                functions: ['საშუალოს ნებისმიერ ქულებზე ვითვლით, ამიტომ average(grades) ერთხელ იწერება.', 'We average any set of grades, so average(grades) is written once.'],
                variables: ['sum გზაში იზრდება და ბოლოს გაყოფამდე უნდა დაგვრჩეს.', 'sum grows along the way and must be kept until the final division.'],
                loops: ['ყველა ქულა უნდა მიემატოს: ციკლი თითოს გადაუვლის.', 'Every grade must be added: a loop visits each one.'],
            },
            maybe: {},
            no: {
                conditions: ['ყველა ქულა ერთნაირად ითვლება: არჩევანი არ არის.', 'Every grade counts the same way: there is no choice.'],
                dom: ['console.log გვერდს არ ცვლის: ის დეველოპერის ფანჯარაში ბეჭდავს.', 'console.log does not change the page: it prints in the developer tools.'],
            },
            async run(out, step) {
                const box = consoleBox([]);
                out.append(box);
                const log = (text) => { box.textContent += (box.textContent ? '\n' : '') + text; };
                const grades = [8, 10, 7, 9, 6];
                let sum = 0;
                await step(7);
                await step(0);
                await step(1);
                for (const grade of grades) {
                    await step(2, 200);
                    await step(3, 200);
                    sum += grade;
                    log(`sum = ${sum}`);
                }
                await step(5);
                log(`${sum} / ${grades.length}  →  ${sum / grades.length}`);
                return null;
            },
        },
        {
            id: 'sum',
            title: ['ხარჯების ჯამი', 'Total spending'],
            story: ['დღეს სამ რამეში დახარჯე ფული: 5, 4 და 6 ლარი. კონსოლში დაბეჭდე, რამდენი დახარჯე ჯამში.', 'Today you spent money three times: 5, 4 and 6 lari. Print the total to the console.'],
            lines: [
                line('const spent = [5, 4, 6];', V),
                line('let total = 0;', V),
                line('for (const amount of spent) {', L),
                line('  total += amount;', V),
                line('}'),
                line('console.log(total); // 15'),
            ],
            needs: {
                variables: ['spent ხარჯებს ინახავს, total კი გზაში მზარდ ჯამს.', 'spent holds the amounts, and total is the sum that grows along the way.'],
                loops: ['ყოველი ხარჯი ჯამს უნდა დაემატოს: ციკლი თითოეულს გადაუვლის.', 'Every amount must be added to the total: a loop visits each one.'],
            },
            maybe: {},
            no: {
                functions: ['ეს ერთჯერადი სკრიპტია: ფუნქცია მხოლოდ მაშინ გვჭირდება, როცა ერთი და იგივე ქმედება ბევრჯერ ან მოვლენაზე სრულდება.', 'This is a one-off script: a function is for an action that runs many times or on an event.'],
                dom: ['console.log გვერდს არ ცვლის: ის დეველოპერის ფანჯარაში ბეჭდავს.', 'console.log does not change the page: it prints in the developer tools.'],
            },
            async run(out, step) {
                const box = consoleBox([]);
                out.append(box);
                const log = (text) => { box.textContent += (box.textContent ? '\n' : '') + text; };
                const spent = [5, 4, 6];
                let total = 0;
                await step([0, 1]);
                for (const amount of spent) {
                    await step(2, 220);
                    await step(3, 220);
                    total += amount;
                    log(`total = ${total}`);
                }
                await step(5);
                log(String(total));
                return null;
            },
        },
        {
            id: 'adults',
            title: ['სრულწლოვნების დათვლა', 'Counting adults'],
            story: ['გაქვს ხალხის ასაკები. დათვალე, რამდენია 18 წლის ან უფროსი, და დაბეჭდე კონსოლში.', 'You have a list of ages. Count how many people are 18 or older and print it to the console.'],
            lines: [
                line('const ages = [15, 21, 17, 30, 18];', V),
                line('let adults = 0;', V),
                line('for (const age of ages) {', L),
                line('  if (age >= 18) {', C),
                line('    adults++;', V),
                line('  }'),
                line('}'),
                line('console.log(adults); // 3'),
            ],
            needs: {
                variables: ['ages ასაკებს ინახავს, adults კი გზაში მზარდ რაოდენობას.', 'ages holds the ages, and adults is the count that grows along the way.'],
                loops: ['ყოველი ასაკი ცალ-ცალკე უნდა შემოწმდეს.', 'Every age must be checked on its own.'],
                conditions: ['ყოველი ასაკისთვის გადაწყვეტილებაა: 18 ან მეტი ითვლება, ნაკლები არა.', 'For each age there is a decision: 18 or more counts, less does not.'],
            },
            maybe: {},
            no: {
                functions: ['ეს ერთჯერადი სკრიპტია: ფუნქცია მხოლოდ მაშინ გვჭირდება, როცა ერთი და იგივე ქმედება ბევრჯერ ან მოვლენაზე სრულდება.', 'This is a one-off script: a function is for an action that runs many times or on an event.'],
                dom: ['console.log გვერდს არ ცვლის: ის დეველოპერის ფანჯარაში ბეჭდავს.', 'console.log does not change the page: it prints in the developer tools.'],
            },
            async run(out, step) {
                const box = consoleBox([]);
                out.append(box);
                const log = (text) => { box.textContent += (box.textContent ? '\n' : '') + text; };
                const ages = [15, 21, 17, 30, 18];
                let adults = 0;
                await step([0, 1]);
                for (const age of ages) {
                    await step(2, 170);
                    await step(3, 170);
                    if (age >= 18) {
                        await step(4, 170);
                        adults++;
                        log(`${age}: სრულწლოვანია  →  adults = ${adults}`);
                    } else {
                        log(`${age}: ჯერ არა`);
                    }
                }
                await step(7);
                log(String(adults));
                return null;
            },
        },
    ];
})();
