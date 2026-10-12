'use strict';

/* =========================================================
   INIT
   ========================================================= */

// small icons written in the HTML as <span data-icon="name">
$$('[data-icon]').forEach(el => el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon)));

renderChain();
renderTopics();
bindTopicEvents();
observeSections();
setActiveChain(TOPICS[0].id);

initScreen($('#screen'));
Game.init();
