//定义一个模块，把游戏背景图片绘制到<canvas>上，只进行一次绘制，因为是静态的
define(['Frogger'], function (Frogger){
    var _background = document.createElement("img");
    _background.addEventListener("load", function () {
        Frogger.backgroundDrawingSurface.drawImage(_background, 0, 0, Frogger.drawingSurfaceWidth
          , Frogger.drawingSurfaceHeight);
    }, false);
    _background.src = "gameboard.gif";
});