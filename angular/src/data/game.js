'use strict';

/* =========================================================
   GAME TEXT — what the practice game says, and its mascot.
   This file gives the Angular app its voice; game.js is the same in every app.
   ========================================================= */

const STORAGE_PREFIX = 'ng-signal';

const GAME_TEXT = {
    windowTitle: 'practice.component.ts',
    mascotName: 'ანგი',
    coinName: 'სიგნალი',
    levelWord: 'დონე',
    overKicker: 'გულები გათავდა',
    winKicker: 'ოთხივე დონე გავლილია',
    combo: 'კომბო!',
    lastHeart: 'ბოლო გული! ფარი ჩართულია... ვნახოთ, რას იზამს.',
    right: ['ზუსტად!', 'build წარმატებულია.', 'signal.set(ბრავო)', 'ეს ნამდვილი Angular-ის ინსტინქტია.', 'ტიპები ემთხვევა!', 'change detection-მა ეს მაშინვე შენიშნა.', 'DI-მ თავი დაგიკრა.'],
    wrong: ['NG0100: ExpressionChangedAfterItHasBeenChecked... შენში.', 'NullInjectorError: No provider for სწორი პასუხი.', 'ფრჩხილები დაგავიწყდა? temp() და არა temp.', 'zone.js ამას შენიშნავდა... ჩვენ კი zoneless ვართ.', 'track-ის გარეშე ვერ ვცნობ!', 'ეს RxJS-ის ბრალია, დარწმუნებული ვარ.'],
    safe: ['ჯერ არა, მაგრამ აქ გულები დაცულია.', 'თითქმის! გადააგორე ხაზი და წაიკითხე.', 'კომპილატორი ჯერ არ არის კმაყოფილი.'],
    taunts: ['ვერ დამიჭერ!', 'zoneless ვარ!', 'აქ არა!', 'NG0404: ვერ მიპოვე!', 'მე არასწორი ვარ!'],
    poof: ['პუფ!', 'ngOnDestroy()', 'გაქრა!', 'unsubscribed!'],
    morph: ['აბრა-კადაბრა!', 'ახლა სწორია!', 'linkedSignal!', 'set(სწორი)'],
    mercy: 'მოთმინება ყველაზე ძლიერი სიგნალია! ყველა ღილაკი ახლა სწორია.',
    over: ['ERROR: გულები გათავდა.', 'ngOnDestroy: თამაში დასრულდა. ცადე ისევ.', 'zone.js-იც ვერ გადაგარჩენდა.', 'ng serve --again'],
    levelUp: ['შემდეგ დონეზე!', 'build #2 წარმატებულია.', 'ახალი ფიჩა გაიხსნა!', 'level.update(l => l + 1)'],
    picked: ['სიგნალი მივიღე: თემები განახლდა!', 'computed(() => ახალი თემები)', 'ახალი თემები, ახალი გრაფი.'],
    win: ['ოთხივე დონე! სათბური შენია.', 'Angular-ის გუნდი გელოდება.', 'ახლა ნამდვილი Angular პროექტის დროა.'],
    poke: ['ჰეი, ფარი მაქვს!', 'მე ანგი ვარ, შენი Angular-ის მეგობარი.', 'საიდუმლო: სიგნალს ფრჩხილები სჭირდება.', 'standalone ვარ, NgModule-ის გარეშე.', 'inject(ყავა)', 'ბოლო გულზე... არა, არაფერს გეტყვი.'],
    ranks: [
        [0.9, 'Angular-ის არქიტექტორი'],
        [0.7, 'სიგნალების ოსტატი'],
        [0.5, 'კომპონენტების მშენებელი'],
        [0.3, 'NgModule-ის მოგონება'],
        [0, 'zone.js-ის აჩრდილი'],
    ],
    confetti: ['#e40035', '#f0145a', '#c2187f', '#7c3aed', '#fbbf24', '#38bdf8'],
};

/** The mascot: Angular's shield with a face. */
function mascotSvg(mood) {
    const ink = '#1b0f2b';
    const grad = {
        idle: ['#f0145a', '#7c3aed'],
        happy: ['#ff3d7f', '#a855f7'],
        sad: ['#9a8aa8', '#5b4e70'],
        panic: ['#ff6b2c', '#e40035'],
        party: ['#fbbf24', '#f0145a'],
    }[mood] || ['#f0145a', '#7c3aed'];
    const faces = {
        idle: `
            <ellipse cx="-6" cy="-1" rx="2.6" ry="3.4" fill="${ink}"><animate attributeName="ry" values="3.4;3.4;0.4;3.4" keyTimes="0;0.92;0.96;1" dur="3.8s" repeatCount="indefinite"/></ellipse>
            <ellipse cx="6" cy="-1" rx="2.6" ry="3.4" fill="${ink}"><animate attributeName="ry" values="3.4;3.4;0.4;3.4" keyTimes="0;0.92;0.96;1" dur="3.8s" repeatCount="indefinite"/></ellipse>
            <path d="M-5 7 Q0 11 5 7" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`,
        happy: `
            <path d="M-9 0 Q-6 -6 -3 0 M3 0 Q6 -6 9 0" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M-7 5 Q0 14 7 5 Z" fill="#ff8fab" stroke="${ink}" stroke-width="1.8" stroke-linejoin="round"/>`,
        sad: `
            <ellipse cx="-6" cy="1" rx="2.2" ry="2.6" fill="${ink}"/><ellipse cx="6" cy="1" rx="2.2" ry="2.6" fill="${ink}"/>
            <path d="M-5 11 Q0 6 5 11" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
            <path d="M9 4 q2 4 0 6 q-2 -2 0 -6 Z" fill="#7dd3fc"/>`,
        panic: `
            <circle cx="-6" cy="-1" r="4.4" fill="#fff" stroke="${ink}" stroke-width="1.6"/><circle cx="6" cy="-1" r="4.4" fill="#fff" stroke="${ink}" stroke-width="1.6"/>
            <circle cx="-6" cy="-1" r="1.6" fill="${ink}"/><circle cx="6" cy="-1" r="1.6" fill="${ink}"/>
            <ellipse cx="0" cy="9" rx="3" ry="3.6" fill="${ink}"/>`,
        party: `
            <path d="M-9 0 Q-6 -6 -3 0 M3 0 Q6 -6 9 0" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M-7 5 Q0 14 7 5 Z" fill="#ff8fab" stroke="${ink}" stroke-width="1.8" stroke-linejoin="round"/>
            <path d="M-6 -24 L0 -36 L6 -24 Z" fill="#fbbf24" stroke="${ink}" stroke-width="1.4" stroke-linejoin="round"/>`,
    };
    const id = `ng-shield-${mood}`;
    return `
        <svg viewBox="-30 -38 60 70" aria-hidden="true">
            <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${grad[0]}"/><stop offset="1" stop-color="${grad[1]}"/></linearGradient></defs>
            <path d="M0 -26 L23 -18 L19 15 L0 27 L-19 15 L-23 -18 Z" fill="url(#${id})" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>
            <path d="M0 -20 L16 -14 L13 11 L0 20 L-13 11 L-16 -14 Z" fill="#fff" opacity=".92"/>
            ${faces[mood] || faces.idle}
        </svg>`;
}
