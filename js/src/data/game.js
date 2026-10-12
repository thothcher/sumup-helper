'use strict';

/* =========================================================
   GAME TEXT — what the practice game says, and its mascot.
   This file gives the JS app its voice; game.js is the same in every app.
   ========================================================= */

const STORAGE_PREFIX = 'js-leaves';

const GAME_TEXT = {
    windowTitle: 'practice.js',
    mascotName: 'ფოთოლა',
    coinName: 'მონეტა',
    levelWord: 'დონე',
    outputLabel: 'კონსოლში დაიბეჭდება:',
    overKicker: 'ფოთლები ჩამოცვივდა',
    winKicker: 'ოთხივე დონე გავლილია',
    combo: 'კომბო!',
    lastHeart: 'ბოლო გული! ქარი ძლიერდება... მაგრამ ხეები ერთმანეთს ეხმარებიან.',
    right: ['ზუსტად!', 'ბაღი ყვავის!', 'console.log("ბრავო")', 'ეს === სწორია.', 'ფოთოლი გამწვანდა!', 'return true;', 'ასე წერენ JS-ს!'],
    wrong: ['ოჰ, undefined...', 'ეს == იყო და არა ===.', 'ფოთოლი გაყვითლდა.', 'TypeError: გულს ვერ ვკითხულობ.', 'ქარმა ერთი ფოთოლი წაიღო.', 'NaN... ანუ არც ისე.', 'ამ ბაგს console.log-იც ვერ იპოვიდა.'],
    safe: ['ჯერ არა, მაგრამ აქ გულები დაცულია.', 'თითქმის! გადააგორე ხაზი და წაიკითხე.', 'ხაზები ფოთლებივით აირია ქარში.'],
    taunts: ['ვერ დამიჭერ!', 'ქარი მიმაქანებს!', 'აქ არა!', 'ფიუ-ფიუ!', 'მე არასწორი ვარ!'],
    poof: ['პუფ!', 'ჩამოვარდა!', 'remove()!', 'ბაი!'],
    morph: ['აბრა-კადაბრა!', 'ახლა სწორია!', 'გაყვითლდა... ანუ გაოქროვდა!', 'textContent = სწორი'],
    mercy: 'მოთმინება ოქროა! ყველა ღილაკი ახლა სწორია.',
    over: ['ყველა ფოთოლი ჩამოცვივდა. გაზაფხულზე თავიდან!', 'Uncaught Error: გულები გათავდა.', 'ზამთარი მოვიდა. ცადე ისევ.', 'location.reload() ყველაფერს შველის.'],
    levelUp: ['შემდეგ დონეზე!', 'ბაღი იზრდება!', 'ახალი ტოტი!', 'level++'],
    win: ['ოთხივე დონე! შენი ბაღი ოქროსფერია.', 'JavaScript-მა მეგობრად ჩაგთვალა.', 'ახლა React-ის დროა.'],
    poke: ['ჰეი, მიღიტინებს!', 'მე ფოთოლა ვარ, ამ ბაღიდან.', 'საიდუმლო: typeof [] === "object".', 'ქარი უბერავს... ფრთხილად!', 'const მე = "ფოთოლი";', 'ბოლო გულზე... არა, არაფერს გეტყვი.'],
    ranks: [
        [0.9, 'JavaScript-ის ოსტატი'],
        [0.7, 'ტყის მცველი'],
        [0.5, 'მებაღე'],
        [0.3, 'ნერგი'],
        [0, 'თესლი'],
    ],
    confetti: ['#e6c34a', '#c48a4a', '#8fd6a2', '#e07a5f', '#f0dc96', '#5fb67d'],
};

/** The mascot: a leaf with a face. It dries out when sad and turns gold when it wins. */
function mascotSvg(mood) {
    const ink = '#1c2a1f';
    const fill = { idle: '#86c98f', happy: '#9fd36a', sad: '#c99a5b', panic: '#e6c34a', party: '#f0c84a' }[mood] || '#86c98f';
    const faces = {
        idle: `
            <ellipse cx="-7" cy="-1" rx="2.4" ry="3.2" fill="${ink}"><animate attributeName="ry" values="3.2;3.2;0.4;3.2" keyTimes="0;0.92;0.96;1" dur="4.2s" repeatCount="indefinite"/></ellipse>
            <ellipse cx="7" cy="-1" rx="2.4" ry="3.2" fill="${ink}"><animate attributeName="ry" values="3.2;3.2;0.4;3.2" keyTimes="0;0.92;0.96;1" dur="4.2s" repeatCount="indefinite"/></ellipse>
            <path d="M-5 7 Q0 11 5 7" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`,
        happy: `
            <path d="M-10 0 Q-7 -6 -4 0 M4 0 Q7 -6 10 0" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M-7 5 Q0 14 7 5 Z" fill="#e07a5f" stroke="${ink}" stroke-width="1.8" stroke-linejoin="round"/>`,
        sad: `
            <ellipse cx="-7" cy="1" rx="2.2" ry="2.6" fill="${ink}"/><ellipse cx="7" cy="1" rx="2.2" ry="2.6" fill="${ink}"/>
            <path d="M-5 11 Q0 6 5 11" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
            <path d="M9 4 q2 4 0 6 q-2 -2 0 -6 Z" fill="#7fb3d5"/>`,
        panic: `
            <circle cx="-7" cy="-1" r="4.4" fill="#fff" stroke="${ink}" stroke-width="1.6"/><circle cx="7" cy="-1" r="4.4" fill="#fff" stroke="${ink}" stroke-width="1.6"/>
            <circle cx="-7" cy="-1" r="1.6" fill="${ink}"/><circle cx="7" cy="-1" r="1.6" fill="${ink}"/>
            <ellipse cx="0" cy="9" rx="3" ry="3.6" fill="${ink}"/>`,
        party: `
            <path d="M-10 0 Q-7 -6 -4 0 M4 0 Q7 -6 10 0" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M-7 5 Q0 14 7 5 Z" fill="#e07a5f" stroke="${ink}" stroke-width="1.8" stroke-linejoin="round"/>
            <path d="M-20 -20 l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 Z M18 -24 l1.5 -4 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 Z" fill="#fff6c8"/>`,
    };
    return `
        <svg viewBox="-30 -34 60 70" aria-hidden="true">
            <path d="M0 -30 C20 -22 27 -2 18 14 C12 24 -12 24 -18 14 C-27 -2 -20 -22 0 -30 Z" fill="${fill}" stroke="#2f5d3a" stroke-width="2" stroke-linejoin="round"/>
            <path d="M0 -26 V-9" stroke="#2f5d3a" stroke-width="1.4" opacity=".45"/>
            <path d="M0 21 q3 7 -3 12" fill="none" stroke="#6b4423" stroke-width="2.4" stroke-linecap="round"/>
            ${faces[mood] || faces.idle}
        </svg>`;
}
