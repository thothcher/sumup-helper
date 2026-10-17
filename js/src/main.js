'use strict';

/* =========================================================
   INIT
   ========================================================= */

renderChain();
renderTopics();
bindTopicEvents();
observeSections();
setActiveChain(TOPICS[0].id);

Game.init();

// the EN button joins the game's title bar: Georgian first, the English translation under it
$('[data-restart-game]').insertAdjacentHTML('beforebegin', Lang.button());
Lang.apply();

// one season drives the forest photo, the leaf colours, the song and the coffee break's backdrop
const season = savedSeason();
initForest(season);
const leafScene = initLeaves(season);
const music = initMusic(season);
const coffee = initBreak(season);
initSeasons(season, (next) => {
    setForest(next);
    leafScene.setSeason(next);
    music.select(next);
    coffee.setSeason(next);
});
