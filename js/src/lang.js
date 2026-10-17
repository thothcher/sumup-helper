'use strict';

/* =========================================================
   LANG — Georgian first, the English translation right under it.
   The coffee break and the project level write every line twice:
   bi('ქართულად', 'in English'). The EN button (in the game's title bar
   and in the break) hides or shows the English half; the choice is saved.
   ========================================================= */

const Lang = (() => {
    const KEY = `${STORAGE_PREFIX}-en`;
    let on = true;
    try { on = localStorage.getItem(KEY) !== 'off'; } catch { /* ignore */ }

    /** Puts the choice on <html> (CSS hides .bi__en) and on every EN button. */
    function apply() {
        document.documentElement.classList.toggle('en-off', !on);
        $$('[data-lang-toggle]').forEach((btn) => {
            btn.setAttribute('aria-pressed', String(on));
            btn.title = on ? 'ინგლისურის დამალვა · Hide English' : 'ინგლისური თარგმანი · Show English';
        });
    }

    function set(next) {
        on = Boolean(next);
        try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* ignore */ }
        apply();
    }

    /** The button markup; any number of them can exist, they all follow the same choice. */
    const button = (className = '') =>
        `<button class="lang-btn ${className}" type="button" data-lang-toggle aria-pressed="${on}">${icon('globe')}<span>EN</span></button>`;

    document.addEventListener('click', (e) => {
        if (e.target.closest('[data-lang-toggle]')) set(!on);
    });

    return { apply, set, button, get on() { return on; } };
})();

/**
 * One line in two languages. `mod` adds a modifier class, e.g. 'bi--line' keeps
 * the English on the same line (for buttons and chips). Trusted, static HTML only.
 */
function bi(ka, en, mod = '') {
    return `<span class="bi ${mod}"><span class="bi__ka">${ka}</span><span class="bi__en" lang="en">${en}</span></span>`;
}

/** The same, from a [ka, en] pair (how the project data stores its texts). */
const biPair = (pair, mod = '') => bi(pair[0], pair[1], mod);
