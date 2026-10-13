'use strict';

/* =========================================================
   LIVE DEMOS — the "გაუშვი" button drops a real Angular component into the
   page. The components live in demos-src/ (an Angular 22 workspace) and are
   compiled ahead of time into ng/main.js, where Angular Elements registers
   each one as a custom element: <ng-demo-signals>, <ng-puzzle-counter>…
   Removing the element destroys the component, so a re-run starts fresh.
   ========================================================= */

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/** Empties the box and puts one Angular element in it. */
function mountNg(container, tag) {
    container.textContent = '';
    const box = document.createElement('div');
    box.className = 'demo';
    const element = document.createElement(tag);
    element.className = 'ng-host';
    box.append(element);
    container.append(box);

    // the bundle defines the elements a moment after the page loads
    if (customElements.get(tag)) return;
    const wait = setTimeout(() => {
        if (customElements.get(tag) || !box.isConnected) return;
        const note = document.createElement('p');
        note.className = 'demo-error';
        note.textContent = 'Angular-ის დემოები ვერ ჩაიტვირთა. გახსენი გვერდი Live Server-ით (ან სხვა სერვერით) და განაახლე.';
        box.append(note);
    }, 4000);
    customElements.whenDefined(tag).then(() => clearTimeout(wait));
}
