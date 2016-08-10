//玩家的生命条数以及距离自动失去生命还有多少时间
define(['Frogger', 'ImageSprite'], function (Frogger, ImageSprite){
    var _lives = [],   //剩余生命条数
        _timeRemainingAsPersentage = 100,    //剩余时间
        _gameBoard;    //各项属性和参数

    //描述了一只小青蛙，用以表示剩余的生命
    function Life(left,top){
        ImageSprite.ImageSprite.call(this, left, top);
    }

    Life.prototype = new ImageSprite.ImageSprite();
    Life.prototype.constructor = Life;

    //根据表示生命的图像在拼合图像上的位置和尺寸对相应的属性赋值
    Life.prototype.spriteLeft = 720;
    Life.prototype.spriteTop = 80;
    Life.prototype.width = 40;
    Life.prototype.height = 40;

    //初始化时执行，把来自于游戏面板代码模块的属性和设置作为参数传入
    function initialize(gameBoard){
        //从游戏面板上边缘起，剩余生命显示位置的上部位置
        var lifePositionTop;

        _gameBoard = gameBoard;

        //对应到游戏面板左下角的相应位置
        lifePositionTop = (_gameBoard.numRows - 1) * _gameBoard.grid.height;

        //对于每个生命图像的显示位置
        _lives =[
            new Life(0, lifePositionTop),
            new Life(1 * Life.prototype.width, lifePositionTop),
            new Life(2 * Life.prototype.width, lifePositionTop),
            new Life(3 * Life.prototype.width, lifePositionTop),
            new Life(4 * Life.prototype.width, lifePositionTop)
        ];

        Frogger.observer.subscribe("render-base-layer", render);
    }

    //渲染剩余生命条数至面板
    function renderLives(){
        var index = 0,
            length = _lives.length,
            life;

        for(;index < length ; index++){
            life = _lives[index];
            life.renderAt(life.left, life.top);      
        }
    }

    //渲染绿色的长方形进度条表示剩余时间
    function renderTimeRemaining(){
        var rectangleWidth = _timeRemainingAsPersentage * _gameBoard.rows[10],

            rectangleHeight = _gameBoard.grid.height / 2,

            rectangleLeft = (1-_timeRemainingAsPersentage) * _gameBoard.rows[10],

            rectangleTop = Frogger.drawingSurfaceHeight - rectangleHeight;

        Frogger.drawingSurface.fillStyle = "#0F0";

        Frogger.drawingSurface.fillRect(rectangleLeft, rectangleTop, rectangleWidth
          , rectangleHeight);
    }

    //将剩余生命条数和剩余时间绘制到游戏面板上
    function render(){
        renderLives();
        renderTimeRemaining();
    }

    Frogger.observer.subscribe("player-lost-life", function () {
        _lives.pop();
    });

    Frogger.observer.subscribe("time-remaining-change", function (newTimeRemainingPersentage) {
        _timeRemainingAsPersentage = newTimeRemainingPersentage;
    });

    Frogger.observer.subscribe("game-board-initialize", initialize);   
});