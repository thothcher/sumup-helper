'use strict';

/* =========================================================
   RADIO — what the coffee break plays. Free internet radio, one <audio> tag.

   Every station here was played in Chrome from an https page (Oct 2026).
   Not SomaFM: it answers 403 to any request that comes from another website.
   If a station dies, the player tries the next one of the same genre by itself,
   so a dead link costs one line here, not a broken break.

   where: a short place or flavour, shown small beside the name.
   ========================================================= */

const BREAK_MINUTES = 10;

const RADIO_GENRES = [
    { id: 'jazz', ka: 'ჯაზი', en: 'Jazz' },
    { id: 'chill', ka: 'ჩილი', en: 'Chill' },
    { id: 'focus', ka: 'ფოკუსი', en: 'Focus' },
    { id: 'classical', ka: 'კლასიკა', en: 'Classical' },
    { id: 'electronic', ka: 'ელექტრონული', en: 'Electronic' },
    { id: 'indie', ka: 'ინდი და როკი', en: 'Indie & rock' },
    { id: 'world', ka: 'საქართველო და მსოფლიო', en: 'Georgia & world' },
];

const RADIO = [
    // jazz
    { id: 'fip-jazz', genre: 'jazz', name: 'FIP Jazz', where: 'Paris', url: 'https://icecast.radiofrance.fr/fipjazz-midfi.mp3' },
    { id: 'swiss-jazz', genre: 'jazz', name: 'Radio Swiss Jazz', where: 'Basel', url: 'https://stream.srg-ssr.ch/m/rsj/mp3_128' },
    { id: 'tsf-jazz', genre: 'jazz', name: 'TSF Jazz', where: 'Paris', url: 'https://tsfjazz.ice.infomaniak.ch/tsfjazz-high.mp3' },
    { id: 'xjazz', genre: 'jazz', name: 'FluxFM XJazz', where: 'Berlin', url: 'https://streams.fluxfm.de/xjazz/mp3-128/audio/' },

    // chill
    { id: 'cafe-del-mar', genre: 'chill', name: 'Café del Mar', where: 'Ibiza', url: 'https://streams.radio.co/se1a320b47/listen' },
    { id: 'chillhop', genre: 'chill', name: 'FluxFM Chillhop', where: 'Berlin', url: 'https://streams.fluxfm.de/Chillhop/mp3-128/audio/' },
    { id: 'chillhouse', genre: 'chill', name: 'Chillhouse Live', where: 'chill house', url: 'https://stream.chillhouse-live.com/live' },
    { id: 'fip-groove', genre: 'chill', name: 'FIP Groove', where: 'Paris', url: 'https://icecast.radiofrance.fr/fipgroove-midfi.mp3' },
    { id: 'laut-lofi', genre: 'chill', name: 'laut.fm Lofi', where: 'lo-fi', url: 'https://stream.laut.fm/lofi' },

    // focus: music to code to
    { id: 'code-radio', genre: 'focus', name: 'Code Radio', where: 'freeCodeCamp', url: 'https://coderadio-admin-v2.freecodecamp.org/listen/coderadio/radio.mp3' },
    { id: 'hm-chillout', genre: 'focus', name: 'Hirschmilch Chillout', where: 'Germany', url: 'https://hirschmilch.de:7001/chillout.mp3' },
    { id: 'rp-mellow', genre: 'focus', name: 'Radio Paradise Mellow', where: 'California', url: 'https://stream.radioparadise.com/mellow-128' },
    { id: 'nightride-chill', genre: 'focus', name: 'Nightride Chillsynth', where: 'synthwave', url: 'https://stream.nightride.fm/chillsynth.mp3' },

    // classical
    { id: 'swiss-classic', genre: 'classical', name: 'Radio Swiss Classic', where: 'Basel', url: 'https://stream.srg-ssr.ch/m/rsc_de/mp3_128' },
    { id: 'fm-easyclassique', genre: 'classical', name: 'France Musique Easy', where: 'Paris', url: 'https://icecast.radiofrance.fr/francemusiqueeasyclassique-midfi.mp3' },
    { id: 'fm-classiqueplus', genre: 'classical', name: 'France Musique Plus', where: 'Paris', url: 'https://icecast.radiofrance.fr/francemusiqueclassiqueplus-midfi.mp3' },
    { id: 'venice-classic', genre: 'classical', name: 'Venice Classic Radio', where: 'Italy', url: 'https://uk2.streamingpulse.com/ssl/vcr1' },

    // electronic
    { id: 'hm-prog', genre: 'electronic', name: 'Hirschmilch Prog-House', where: 'Germany', url: 'https://hirschmilch.de:7001/prog-house.mp3' },
    { id: 'clubsandwich', genre: 'electronic', name: 'FluxFM Clubsandwich', where: 'Berlin', url: 'https://streams.fluxfm.de/clubsandwich/mp3-128/audio/' },
    { id: 'fip-electro', genre: 'electronic', name: 'FIP Electro', where: 'Paris', url: 'https://icecast.radiofrance.fr/fipelectro-midfi.mp3' },
    { id: 'dublab', genre: 'electronic', name: 'dublab', where: 'Los Angeles', url: 'https://dublab.out.airtime.pro/dublab_a' },

    // indie and rock
    { id: 'rp-main', genre: 'indie', name: 'Radio Paradise', where: 'California', url: 'https://stream.radioparadise.com/mp3-128' },
    { id: 'fip-rock', genre: 'indie', name: 'FIP Rock', where: 'Paris', url: 'https://icecast.radiofrance.fr/fiprock-midfi.mp3' },
    { id: 'swiss-pop', genre: 'indie', name: 'Radio Swiss Pop', where: 'Basel', url: 'https://stream.srg-ssr.ch/m/rsp/mp3_128' },
    { id: 'fip-nouv', genre: 'indie', name: 'FIP Nouveautés', where: 'Paris', url: 'https://icecast.radiofrance.fr/fipnouveautes-midfi.mp3' },

    // Georgia and the world
    { id: 'ge-rioni', genre: 'world', name: 'Rioni FM', where: 'საქართველო', url: 'https://video.rionitv.com/s;stream' },
    { id: 'ge-mutant', genre: 'world', name: 'Mutant Radio', where: 'თბილისი', url: 'https://listen.radioking.com/radio/282820/stream/328621' },
    { id: 'fip-world', genre: 'world', name: 'FIP World', where: 'Paris', url: 'https://icecast.radiofrance.fr/fipworld-midfi.mp3' },
    { id: 'fm-ocora', genre: 'world', name: 'Ocora Monde', where: 'Paris', url: 'https://icecast.radiofrance.fr/francemusiqueocoramonde-midfi.mp3' },
];

/** Little reminders for the countdown screen: [Georgian, English]. */
const BREAK_TIPS = [
    ['20-20-20: ყოველ 20 წუთში 20 წამით შეხედე რამეს, რაც 6 მეტრზე შორსაა.', 'The 20-20-20 rule: every 20 minutes, look at something 6 metres away for 20 seconds.'],
    ['დალიე წყალი. თუნდაც მცირე გაუწყლოება კონცენტრაციას აქვეითებს.', 'Drink some water. Even mild dehydration lowers your focus.'],
    ['ადექი და გაიარე: რამდენიმე წუთის სიარული ფიქრს ათავისუფლებს.', 'Stand up and walk. A few minutes of walking clears your head.'],
    ['გაშალე მხრები და მაჯები: კლავიატურასთან დიდხანს ჯდომა მათ ღლის.', 'Stretch your shoulders and wrists. Long hours at a keyboard wear them out.'],
    ['დახუჭე თვალები 20 წამით და ღრმად ისუნთქე.', 'Close your eyes for 20 seconds and breathe deeply.'],
    ['ბაგი, რომელიც ვერ იპოვე, შესვენების მერე ხშირად თავისით ჩანს.', 'The bug you could not find often shows itself after a break.'],
    ['ტელეფონიც ეკრანია. თვალებს მართლა დაუსვენე.', 'A phone is a screen too. Give your eyes a real rest.'],
];
