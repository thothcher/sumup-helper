'use strict';

/* =========================================================
   GAME TEXT — what the practice game says, and its mascot.
   This file gives the Next.js app its voice; game.js is the same in every app.
   ========================================================= */

const STORAGE_PREFIX = 'next-netrunner';


const GAME_TEXT = {
    windowTitle: '// netrun:practice',
    mascotName: 'ნეტი',
    coinName: 'კრედიტი',
    levelWord: 'დონე',
    overKicker: 'კავშირი გაწყდა',
    winKicker: 'ოთხივე დონე გატეხილია',
    combo: 'კომბო!',
    lastHeart: 'ბოლო გული! სისტემა კრიტიკულ რეჟიმშია... რაღაც უცნაური ხდება.',
    morph: ['PATCHED', 'ახლა სწორია!', 'hot reload!', 'git checkout სწორი'],
    mercy: 'ACCESS GRANTED: მოთმინება ICE-ზე ძლიერი აღმოჩნდა. ყველა პასუხი სწორია.',
    right: ['ACCESS GRANTED.', '200 OK.', 'ICE გავიარეთ.', 'deploy წარმატებულია.', 'ნეტრანერის ინსტინქტი!', 'cache HIT შენს თავში.', 'Lighthouse: 100.'],
    wrong: ['500 Internal Server Error... შენში.', 'hydration mismatch ტვინში.', 'ICE-მა დაგარტყა!', 'proxy.ts-მა არ შეგიშვა.', 'cache MISS.', 'სერვერი ტირის ლოგებში.', 'ეს "use client"-ის ბრალია, დარწმუნებული ვარ.'],
    safe: ['ჯერ არა, მაგრამ ფაირვოლი გიცავს.', 'თითქმის! გადააბრუნე ხაზი და წაიკითხე.', 'კოდი ჯერ არ კომპილირდება.'],
    taunts: ['404: ვერ მიპოვი!', 'ERR_TOO_SLOW', 'ვერ დამიჭერ, ნეტრანერო!', 'ping... pong!', 'სხვა პორტზე ეძებე!', 'rate limited!'],
    poof: ['DELETED', 'rm -rf', 'პუფ!', '410 Gone'],
    over: ['SYSTEM FAILURE. გადატვირთვა?', 'კავშირი გაწყდა. ICE-მა გაიმარჯვა.', 'სერვერი ჩავარდა. შენ არა.', 'ROLLBACK: ვცდით თავიდან.'],
    levelUp: ['შემდეგი სერვერი!', 'ფაირვოლი გატეხილია.', 'ლეველ-აპ. ICE უფრო ძლიერია.', 'პაკეტი მიღებულია.'],
    picked: ['route განახლდა: ახალი თემები.', 'ახალი build, ახალი თემები!', 'ქეში გასუფთავდა: ვიწყებთ თავიდან.'],
    win: ['ოთხივე დონე! ქსელი შენია.', 'ასეთ ნეტრანერს ყველა კორპორაცია დაიქირავებს.', 'ახლა ნამდვილი Next.js პროექტის დროა.'],
    poke: ['ბიპ-ბუპ. ნუ მიჩხირკნი ვიზორს.', 'მე ნეტი ვარ, შენი ნეტრანერი-დამხმარე.', 'საიდუმლო: params Promise-ია.', 'ჩემი ანტენა cookie-ებს იჭერს.', 'ჩაი? არა, ქეში.', 'ბოლო გულზე... ეს საიდუმლოა.'],
    ranks: [
        [0.9, 'ლეგენდარული ნეტრანერი'],
        [0.7, 'ნეტრანერი'],
        [0.5, 'ჰაკერი'],
        [0.3, 'სკრიპტ-კიდი'],
        [0, 'ტურისტი ქსელში'],
    ],
    confetti: ['#00f0ff', '#ff2bd6', '#f5ff3b', '#7aa2ff', '#3dffa0'],
};

/** The mascot: a little robot with a visor. */
function mascotSvg(mood) {
    const cyan = '#00f0ff';
    const pink = '#ff2bd6';
    const red = '#ff3864';
    const visorLine = mood === 'panic' ? red : mood === 'sad' ? '#3a3360' : cyan;
    const eyes = {
        idle: `
            <rect x="-11" y="-8" width="6" height="4" rx="1" fill="${cyan}"><animate attributeName="height" values="4;4;.6;4" keyTimes="0;0.9;0.95;1" dur="3.6s" repeatCount="indefinite"/></rect>
            <rect x="5" y="-8" width="6" height="4" rx="1" fill="${cyan}"><animate attributeName="height" values="4;4;.6;4" keyTimes="0;0.9;0.95;1" dur="3.6s" repeatCount="indefinite"/></rect>
            <path d="M-6 10 H6" stroke="${cyan}" stroke-width="2" stroke-linecap="round"/>`,
        happy: `
            <path d="M-12 -4 L-8 -9 L-4 -4 M4 -4 L8 -9 L12 -4" fill="none" stroke="${cyan}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
            <path d="M-7 8 Q0 15 7 8" fill="none" stroke="${pink}" stroke-width="2.2" stroke-linecap="round"/>`,
        sad: `
            <path d="M-12 -8 L-5 -6 M12 -8 L5 -6" stroke="#8580ad" stroke-width="2" stroke-linecap="round"/>
            <rect x="-10" y="-5" width="4" height="3" fill="#8580ad"/><rect x="6" y="-5" width="4" height="3" fill="#8580ad"/>
            <path d="M-6 12 Q0 7 6 12" fill="none" stroke="#8580ad" stroke-width="2" stroke-linecap="round"/>`,
        panic: `
            <path d="M-12 -10 L-5 -3 M-5 -10 L-12 -3 M5 -10 L12 -3 M12 -10 L5 -3" stroke="${red}" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M-8 10 L-4 7 L0 10 L4 7 L8 10" fill="none" stroke="${red}" stroke-width="2" stroke-linejoin="round"/>`,
        party: `
            <path d="M-8 -11 L-7 -8 L-4 -8 L-6.5 -6 L-5.5 -3 L-8 -5 L-10.5 -3 L-9.5 -6 L-12 -8 L-9 -8 Z M8 -11 L9 -8 L12 -8 L9.5 -6 L10.5 -3 L8 -5 L5.5 -3 L6.5 -6 L4 -8 L7 -8 Z" fill="#f5ff3b"/>
            <path d="M-8 7 Q0 16 8 7 Z" fill="${pink}"/>`,
    };
    return `
        <svg viewBox="-30 -36 60 64" aria-hidden="true">
            <path d="M0 -22 V-30" stroke="${pink}" stroke-width="2"/>
            <circle cy="-31" r="3" fill="${pink}"><animate attributeName="opacity" values="1;.25;1" dur="1.4s" repeatCount="indefinite"/></circle>
            <rect x="-22" y="-22" width="44" height="40" rx="7" fill="#141127" stroke="${cyan}" stroke-width="2"/>
            <rect x="-27" y="-8" width="5" height="12" rx="1.5" fill="#2a2350"/><rect x="22" y="-8" width="5" height="12" rx="1.5" fill="#2a2350"/>
            <rect x="-17" y="-14" width="34" height="15" rx="3" fill="#05040b" stroke="${visorLine}" stroke-width="1.4"/>
            ${eyes[mood] || eyes.idle}
        </svg>`;
}
