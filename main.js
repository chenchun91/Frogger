require.config({
  baseUrl: "./app"
});

require(['Frogger', 'renderBackground', 'coreModule', 'ImageSprite', 'renderText'
  , 'gameBoard', 'remainingLifeAndTime', 'Character', 'characterRow']
  , function(Frogger){
 
  Frogger.observer.publish("game-load");
});

