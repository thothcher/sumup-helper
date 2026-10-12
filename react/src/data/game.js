'use strict';

/* =========================================================
   GAME TEXT — what the practice game says, and its mascot.
   This file gives the React app its voice; game.js is the same in every app.
   ========================================================= */

const STORAGE_PREFIX = 'react-studio';


const GAME_TEXT = {
    windowTitle: 'practice.tsx',
    mascotName: 'რეაქტიკო',
    coinName: 'მონეტა',
    levelWord: 'დონე',
    overKicker: 'გულები გათავდა',
    winKicker: 'ოთხივე დონე გავლილია',
    combo: 'კომბო!',
    lastHeart: 'ბოლო გული! ღრმად ჩაისუნთქე... და ნახე, რა მოხდება.',
    morph: ['აბრა-კადაბრა!', 'ახლა სწორია!', 'ჯადოსნური re-render!', 'setState(სწორი)'],
    mercy: 'მოთმინება დაჯილდოვდა! ყველა ღილაკი ახლა სწორია.',
    right: ['Ship it!', 'Code review გავლილია.', 'ზუსტად!', 'Senior-ის ინსტინქტი.', 'React-მა თავი დაგიკრა.', 'ერთი ზედმეტი რენდერიც არა!', 'ეს უკვე portfolio-ში ჩადე.'],
    wrong: ['ოჰ, ეს ბაგი შენ ხომ არ დაწერე?', 'console.log("რატომ?!")', 'კომპილატორი ჩუმად ტირის.', 'Stack Overflow-ზეც ასე არ წერია.', 'ეს useEffect-ის ბრალია, დარწმუნებული ვარ.', 'გული გატყდა. შენი არა, ჩემი.', 'key={index}-ის სუნი მცემს.'],
    safe: ['ჯერ არა, მაგრამ აქ გულები დაცულია.', 'თითქმის! გადააგორე ხაზი და წაიკითხე.', 'ხაზებიც ზოგჯერ ჯიუტობენ.'],
    taunts: ['ვერ დამიჭერ!', 'აქ არა!', 'ნუ-ნუ!', 'მე არასწორი ვარ!', 'ლა-ლა-ლა', 'სხვაგან ეძებე!'],
    poof: ['პუფ!', 'გაქრა!', 'ბაი-ბაი!', 'unmount!'],
    over: ['React-იც ზოგჯერ crash-დება.', 'Error Boundary-მ დაგიჭირა.', 'ამჯერად state ჩვენს მხარეს არ იყო.', 'გადატვირთვა ყველაფერს შველის.'],
    levelUp: ['შემდეგ დონეზე!', 'რენდერი წარმატებულია!', 'ეს იყო გახურება.', 'დონე ატვირთულია!'],
    win: ['ოთხივე დონე! React-ის სტუდია შენია.', 'ასეთ კანდიდატს ხელიდან არ გავუშვებდი.', 'ახლა რეალური პროექტის დროა.'],
    poke: ['ჰეი, მიღიტინებს!', 'მე რეაქტიკო ვარ, შენი გუნდელი.', 'ერთ საიდუმლოს გეტყვი: key={id}.', 'ორბიტაზე ვტრიალებ, არ შემაჩერო.', 'useState(☕)', 'ბოლო გულზე... არა, არაფერს გეტყვი.'],
    ranks: [
        [0.9, 'React-ის ოსტატი'],
        [0.7, 'Senior დეველოპერი'],
        [0.5, 'Middle დეველოპერი'],
        [0.3, 'Junior დეველოპერი'],
        [0, 'სტაჟიორი'],
    ],
    confetti: ['#58c4dc', '#087ea4', '#f0a27a', '#f2c14e', '#9ad1b4', '#c9b6f2'],
};

/** The mascot: a little face inside an electron orbit. */
function mascotSvg(mood) {
    const ink = '#1f2a3a';
    const faces = {
        idle: `
            <ellipse cx="-7" cy="-3" rx="2.6" ry="3.4" fill="${ink}"><animate attributeName="ry" values="3.4;3.4;0.4;3.4" keyTimes="0;0.92;0.96;1" dur="4s" repeatCount="indefinite"/></ellipse>
            <ellipse cx="7" cy="-3" rx="2.6" ry="3.4" fill="${ink}"><animate attributeName="ry" values="3.4;3.4;0.4;3.4" keyTimes="0;0.92;0.96;1" dur="4s" repeatCount="indefinite"/></ellipse>
            <path d="M-6 6 Q0 11 6 6" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>`,
        happy: `
            <path d="M-10 -1 Q-7 -7 -4 -1 M4 -1 Q7 -7 10 -1" fill="none" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>
            <path d="M-8 4 Q0 15 8 4 Z" fill="#e8746a" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/>
            <circle cx="-12" cy="5" r="3" fill="#f6b7a8" opacity=".8"/><circle cx="12" cy="5" r="3" fill="#f6b7a8" opacity=".8"/>`,
        sad: `
            <path d="M-10 -5 L-4 -3 M10 -5 L4 -3" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
            <ellipse cx="-7" cy="0" rx="2.4" ry="2.8" fill="${ink}"/><ellipse cx="7" cy="0" rx="2.4" ry="2.8" fill="${ink}"/>
            <path d="M-6 10 Q0 5 6 10" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M9 3 q2 4 0 6 q-2 -2 0 -6 Z" fill="#58c4dc"/>`,
        panic: `
            <circle cx="-7" cy="-3" r="5" fill="#fff" stroke="${ink}" stroke-width="1.8"/><circle cx="7" cy="-3" r="5" fill="#fff" stroke="${ink}" stroke-width="1.8"/>
            <circle cx="-7" cy="-3" r="1.8" fill="${ink}"/><circle cx="7" cy="-3" r="1.8" fill="${ink}"/>
            <ellipse cx="0" cy="9" rx="3.4" ry="4" fill="${ink}"/>
            <path d="M15 -12 q3 5 0 7 q-3 -2 0 -7 Z" fill="#58c4dc"/>`,
        party: `
            <path d="M-10 -1 Q-7 -7 -4 -1 M4 -1 Q7 -7 10 -1" fill="none" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>
            <path d="M-8 4 Q0 15 8 4 Z" fill="#e8746a" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/>
            <path d="M-6 -18 L0 -34 L6 -18 Z" fill="#f2c14e" stroke="${ink}" stroke-width="1.6" stroke-linejoin="round"/>
            <circle cx="0" cy="-35" r="2.6" fill="#e8746a"/>`,
    };
    return `
        <svg viewBox="-34 -38 68 72" aria-hidden="true">
            <g>
                <ellipse rx="31" ry="11" fill="none" stroke="#58c4dc" stroke-width="2.4" transform="rotate(-24)"/>
                <circle cx="27" cy="-12" r="3.2" fill="#087ea4"/>
                <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="9s" repeatCount="indefinite"/>
            </g>
            <circle r="19" fill="#eef8fb" stroke="#087ea4" stroke-width="2.4"/>
            ${faces[mood] || faces.idle}
        </svg>`;
}
