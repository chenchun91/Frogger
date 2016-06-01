/**
 * Created by asus1 on 2016/5/12.
 */

/*
*建立一个命名空间来放置代码，定义一些关键属性和方法，以便在其余代码中使用，
* 采用观察者模式，实现各模块之间通信
* */

//定义命名空间，关键属性和方法
var Frogger = (function () {
   var canvas = document.getElementById("canvas"),
       drawingSurface = canvas.getContext("2d"),
       backgroundCanvas = document.getElementById("background-canvas"),
       backgroundDrawingSurface = backgroundCanvas.getContext("2d"),

       drawingSurfaceWidth = canvas.width,
       drawingSurfaceHeight = canvas.height;

    return{
        //暴露以下代码供其他模块使用
        canvas:canvas,
        drawingSurface:drawingSurface,
        drawingSurfaceWidth:drawingSurfaceWidth,
        drawingSurfaceHeight:drawingSurfaceHeight,
        backgroundDrawingSurface: backgroundDrawingSurface,

        direction:{
            UP:"up",
            DOWN:"down",
            LEFT:"left",
            RIGHT:"right"
        },

        //观察者模式
       observer:(function(){
            var events = {};

            return {
                subscribe: function(eventName, callback) {
                    if (!events.hasOwnProperty(eventName)) {
                        events[eventName] = [];
                    }

                    events[eventName].push(callback);
                },

                publish: function (eventName){

                    var data = Array.prototype.slice.call(arguments, 1),
                        index = 0,
                        length = 0;

                    if (events.hasOwnProperty(eventName)) {
                        length = events[eventName].length;

                        for (; index < length; index++) {
                            events[eventName][index].apply(this, data);
                        }
                    }
                }
            };
        }()),

        //检测碰撞
        intersects:function(position1, position2){
            var doseIntersect = false;

            if ((position1.left > position2.left && position1.left < position2.right) ||
                (position1.right > position2.left && position1.left < position2.right)) {
                doseIntersect  = true;          //dose拼成does!!!
            }
            return doseIntersect;
        }
    };
}());

window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.
    mozRequestAnimationFrame || function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();


/*
* 核心逻辑
* */

(function (Frogger) {
    var _score = 0,   //当前分数
        _highScore = 1000,   //最高分
        _lives =5,     //生命条数
        _timeTotal = 60000,   //总时间
        _timeRemaining = _timeTotal,   //当前剩余时间
        _refreshRate = 33.333,   //刷新时间
        _timesAtGoal = 0,    //到达目标位置的次数
        _maxTimesAtGoal = 5,
        _isPlayerFrozen = false, //是否被冻结
        //上一次游戏运行主循环的时间
        _lastTimeGameLoopRan = (new Date()).getTime();

    //对玩家到达目标而不至于失去一条生命的剩余时间进行倒计时
    function countDown(){
        if(_timeRemaining > 0){

            //此函数会根据_refreshRate的值的频率进行调用
            _timeRemaining -=_refreshRate;

            Frogger.observer.publish("time-remaining-change",_timeRemaining/_timeTotal);
        }else{
            loseLife();
        }
    }

    //玩家生命均失去时时调用
    function gameOver(){

        //暂停玩家的移动
        freezePlayer();

        //通知其他的模块
        Frogger.observer.publish("game-over");
    }

    function gameWon(){
        Frogger.observer.publish("game-won");
    }

    function loseLife(){
        //生命条数减1
        _lives--;

        //暂停玩家移动
        freezePlayer();

        Frogger.observer.publish("player-lost-life");

        if(_lives === 0){
            gameOver();
        }else{

            //如果还有剩余生命，重置
            setTimeout(reset,2000);
        }
    }

    function freezePlayer(){
        //表示冻结状态
        _isPlayerFrozen = true;

        Frogger.observer.publish("player-freeze");
    }

    function unfreezePlayer(){
        _isPlayerFrozen = false;
        Frogger.observer.publish("player-unfreeze");
    }

    //以特定 分值增加玩家的分数
    function increaseScore(increaseBy){
        _score  +=increaseBy ||0;
        Frogger.observer.publish("score-change",_score);

        //刷新最高分
        if(_score > _highScore){
            _highScore = _score;
            Frogger.observer.publish("high-score-change",_highScore);
        }
    }

    //玩家到达指定的目标位置执行
    function playerAtGoal(){
        increaseScore(1000);
        _timesAtGoal++;

        //临时冻结，表示已到达目的地
        freezePlayer();

        if(_timesAtGoal < _maxTimesAtGoal){
            setTimeout(reset,2000);
        }else{
            gameWon();
        }
    }

    //玩家移动时，增加20分
    function playerMoved(){
        increaseScore(20);
    }

    function reset(){
        _timeRemaining = _timeTotal;

        unfreezePlayer();

        Frogger.observer.publish("reset");
    }

    //主循环
    function gameLoop(){
        //计算从上一次主循环调用以来过去的时间
        var currentTime = (new Date()).getTime(),
            timeDifference = currentTime - _lastTimeGameLoopRan;

        //当下一帧准备好可供浏览器使用时，执行此函数
        window.requestAnimationFrame(gameLoop);

        //如果已经过去的时间超过刷新频率，绘制个物体在跟新后的位置，并检测碰撞
        if(timeDifference >= _refreshRate){
            Frogger.drawingSurface.clearRect(0,0,Frogger.drawingSurfaceWidth,Frogger.
                drawingSurfaceHeight);

            if(!_isPlayerFrozen){
                //如果没被冻结继续倒计时，
                countDown();
                Frogger.observer.publish("check-collisions");
            }

            //绘制个物体
            Frogger.observer.publish("render-base-layer");

            //绘制玩家
            Frogger.observer.publish("render-character");

            //保存当前时间，稍后进行对比
            _lastTimeGameLoopRan = currentTime;
        }
    }

    //开始主循环
    function start(){
        Frogger.observer.publish("high-score-change",_highScore);
        gameLoop();
    }

    //一旦game-load发生，执行start()函数来启动主循环
    Frogger.observer.subscribe("game-load",start);

    Frogger.observer.subscribe("player-at-goal",playerAtGoal);
    Frogger.observer.subscribe("player-moved",playerMoved);
    Frogger.observer.subscribe("collision",loseLife);

//把全局Frogger变量传入模块中，这样他就能以局部变量方式被访问
}(Frogger));

/*
* 用于从拼合图片中建立各图像和动画的基础代码
* */

//建立图片，并将其放置在面板中
Frogger.ImageSprite = function(startPositionLeft,startPositionTop){
    this.startLeft = startPositionLeft || 0;
    this.startTop = startPositionTop || 0;

    //初始化一个对象属性，保存用于游戏的动画
    this.animations = {};

    this.reset();
};

//定义一个“类”，将动画指派给独立小图像实例，使任何图像都可以产生动画效果
Frogger.Animation = function(options){
    options = options || {};

    //保存切换频率
    this.rate = options.rate || 150;

    //该动画是否一直进行循环
    this.loop = options.loop || false;

    //保存传入参数所提供的像素位置
    this.spriteLeft = options.spriteLeft || 0;

    //保存动画序列数组，此数组用于存储从属性spriteLeft起计的偏移量
    this.sequence = options.sequence || [];
};

Frogger.Animation.prototype = {
    //动画序列处于第几帧，实际上就是sequence数组的序号
    frame:0,
    //该动画是否进行（frame是否已设定的频率增加）
    playing: false,
    //计时指示器，根据需要启动或停止帧序号的增加
    timer:null,

    //启动动画，本质是以实例化是所提供的频率，通过计时器将帧序号增加
    play: function(){
        var that = this;

        if(!this.playing){
            this.reset();
            this.playing = true;
        }

        //以实例化时提供的频率通过计时器增加帧序号
        this.timer = setInterval(function(){
            that.incrementFrame();
        },this.rate);
    },

    //是当前动画的帧序号返回到开始位置
    reset: function () {
        this.frame = 0;
    },

    //增加当前动画序列的帧序号
    incrementFrame: function () {
        //只有在动画进行时增加
        if(this.playing){
            this.frame++;

            //到达末端，
            if(this.frame === this.sequence.length-1){
                if(!this.loop){
                    this.stop();
                }else{
                    this.reset();
                }
            }
        }
    },

    //以当前序列号返回存放在动画序列数组中的值
    getSequenceValue:function(){
        return this.sequence[this.frame];
    },

    //返回此动画第一帧的独立小图像的左边缘的像素
    getSpriteLeft:function(){
        return this.spriteLeft;
    },

    stop: function () {
        clearInterval(this.timer);
        this.playing = false;
    }
};

Frogger.ImageSprite.prototype = {
    //保存独立小图像当前在游戏面板上 的位置
    top:0,
    left:0,

    //独立小图像初始位置
    startLeft:0,
    startTop:0,

    sprite:(function(){
        var img =document.createElement("img");
        img.src = "spritemap.png";
        return img;
    }()),

    //独立小图像的默认高度和宽度
    width:80,
    height:80,

    //独立小图像在大拼合图像中的位置的位置
    spriteTop:0,
    spriteLeft:0,

    //默认状态下为没有动画
    animations:null,

    //当前所进行的动画的名称
    currentAnimation:"",

    isHidden:false,    // 独立小图像的当前位置是否为隐藏

    reset: function() {
        this.left = this.startLeft;
        this.top = this.startTop;

        //重置任何与之相关的动画至各自的初始状态
        this.isHidden = false;
    },

    //把一个或多个动画关联起来，每个key表示动画的名称
    registerAnimation:function(animations){
        var key,
            animation;

        //
        for(key in animations){
            animation = animations[key];
            this.animations[key] = new Frogger.Animation(animation);
        }
    },

    resetAnimation: function () {
        if(this.animations[this.currentAnimation]){
            this.animations[this.currentAnimation].reset();
        }
        this.currentAnimation = "";
    },

    //根据名称播放指定的动画序列，该名称必须与之前提供给registerAnimation（）的某个名称一致
    playAnimation:function(name){
        this.currentAnimation = name;
        if(this.animations[this.currentAnimation]){
            this.animations[this.currentAnimation].play();
        }
    },

    renderAt: function(left,top) {
        //找出当前正在进行的动画
        var animation = this.animations[this.currentAnimation],

            //如果有动画正在进行，则基于他的内部的帧序号获取当前序列值，如果没有，假设序列数组中的值为
            //0，将该值乘以拼合图片中独立小图片的宽度，准确识别出图像并进行显示
            sequenceValue = animation ? animation.getSequenceValue():0,

            //获取的初始帧的位置。动画所有的帧应该与主图片放置在一起，并置于拼合图片的同一行
            animationSpriteLeft = animation ? animation.getSpriteLeft():0,

            //计算所要显示的图片相对于拼合图片左边缘的偏移值
            spriteLeft = this.spriteLeft + animationSpriteLeft + (this.width*sequenceValue);

        if(!this.isHidden){
            Frogger.drawingSurface.drawImage(this.sprite,spriteLeft,this.spriteTop,this.width,
            this.height,left,top,this.width,this.height);
        }

    },

    //设置所保存的左部和上部位置，该位置表示图像将会在游戏面板上显示的位置，偏移位置值将在renderAt
    //方法中使用，以在该位置绘制图像。
    moveTo: function (left,top) {
        this.left = left || 0;
        if(typeof top !== "undefined"){
            this.top = top || 0;
        }
    },

    //独立图片的宽度
    getWidth:function(){
        return this.width;
    },

    //返回图像的左部右部位置
    getPosition:function(){
        return {
            left:this.left,
            right:this.left +this.width
        };
    },

    //把这个图像从游戏面板隐藏，实际上就是停止renderAt()
    hide:function(){
        this.isHidden = true;
    }
};

/*
* 编写游戏面板相关参数
* */

//定义游戏面板的参数、网络行数、列数以及他们的相对位置
(function (Frogger) {
    var _grid={
            width: 80,
            height: 80
        },
        _numRows = 16,
        _numColumns = 11,

        //玩家在游戏面板上的移动范围
        _characterBounds = {
            left: 0,
            right: _numColumns * _grid.width,
            top: 2 * _grid.height,
            bottom: (_numRows - 2) * _grid.height
        },

        //保存从游戏面板的最上端位置起计17行中每一行的像素位置，实际上
        //数组每一项都是网络高度的倍数。
        _rows = (function() {
            var output = [],
                index = 0,
                length = _numRows;

            for (; index < length; index++) {
                output.push(index * _grid.width);
            }

            return output;
        }()),

        _columns = (function() {
            var output = [],
                index = 0,
                length = _numColumns;

            for (; index < length; index++) {
                output.push(index * _grid.height);
            }

            return output;
        }());

    Frogger.observer.subscribe("game-load", function() {
        //发布事件，携带供其他代码模块使用的游戏面板相关信息，确保他们会把
        //相应的图像画在游戏面板的正确位置上。
        Frogger.observer.publish("game-board-initialize",{    //错写成subscribe!!!
            numRows: _numRows,
            numcolumns: _numColumns,
            rows: _rows,
            columns: _columns,
            grid:{
                width:_grid.width,
                height:_grid.height
            },
            characterBounds: _characterBounds
        });
    });
}(Frogger));

/*
* 通过把所有代码一起保存在一个负责处理文字和游戏状态信息渲染的模块中，
* 当涉及文字问题时，确切知道在哪里进行排查。
* */

//在游戏面板上添加文字

(function(Frogger) {

    // Define the text size and font name to use for the text. You can find the Arcade
    // Classic font for download for free online at http://bit.ly/arcade_font
    var _font = "67px Arcade Classic",

    // Define variables to store the current game state locally in this module
        _score = 0,
        _highScore = 0,
        _gameWon = false,
        _gameOver = false,

    // Define a variable to store the initialized data from the game board module
    // defined previously - this will be populated later with data from that module
        _gameBoard = {};

    // Define a function to render the player's score and high score to the <canvas> element
    function renderScore() {

        // Select the font face and size
        Frogger.drawingSurface.font = _font;

        // Right-align text at the position we define to draw the text at
        Frogger.drawingSurface.textAlign = "end";

        // Write the text "1-UP", right-aligned to the 4th column position and ending half
        // a row down from the top of the game board in white (hex color value #FFF)
        Frogger.drawingSurface.fillStyle = "#FFF";
        Frogger.drawingSurface.fillText("1-UP", _gameBoard.columns[3], _gameBoard.grid.height / 2);

        // Write out the current score in red (hex color value #F00) right-aligned beneath
        // the "1-UP" text previously drawn to the <canvas>
        Frogger.drawingSurface.fillStyle = "#F00";
        Frogger.drawingSurface.fillText(_score, _gameBoard.columns[3], _gameBoard.grid.height);

        // Write the text "HI-SCORE", right-aligned to the 8th column position and ending
        // half a row down from the top of the game board in white (hex color value #FFF)
        Frogger.drawingSurface.fillStyle = "#FFF";
        Frogger.drawingSurface.fillText("HI-SCORE", _gameBoard.columns[8], _gameBoard.grid.height / 2);

        // Write out the current high score in red (hex color value #F00) right-aligned
        // beneath the "HI-SCORE" text previously drawn to the <canvas>
        Frogger.drawingSurface.fillStyle = "#F00";
        Frogger.drawingSurface.fillText(_highScore, _gameBoard.columns[8], _gameBoard.grid.height);
    }

    // Define a function to render the text "GAME OVER" to the <canvas>. This will only be
    // called when the game is over
    function renderGameOver() {

        // Use the Arcade Classic font as previously defined, and write the text centered
        // around the given drawing position in white
        Frogger.drawingSurface.font = _font;
        Frogger.drawingSurface.textAlign = "center";
        Frogger.drawingSurface.fillStyle = "#FFF";

        // Write the text center aligned within the <canvas> and at the 9th row position
        // from the top of the game board
        Frogger.drawingSurface.fillText("GAME OVER", Frogger.drawingSurfaceWidth / 2, _gameBoard.rows[9]);
    }

    // Define a function to render the text "YOU WIN!" to the <canvas> which will be called
    // when the player has won the game by reaching the home base position five times
    function renderGameWon() {

        // Use the Arcade Classic font as previously defined, and write the text centered
        // around the given drawing position in yellow (hex value #FF0)
        Frogger.drawingSurface.font = _font;
        Frogger.drawingSurface.textAlign = "center";
        Frogger.drawingSurface.fillStyle = "#FF0";

        // Write the text center aligned within the <canvas> and at the 9th row position
        // from the top of the game board
        Frogger.drawingSurface.fillText("YOU WIN!", Frogger.drawingSurfaceWidth / 2, _gameBoard.rows[9]);
    }

    // Define a function to render the "TIME" label in the bottom-right corner of the
    // game board
    function renderTimeLabel() {

        // Use the Arcade Classic font as previously defined, and write the text centered
        // around the given drawing position in yellow (hex value #FF0)
        Frogger.drawingSurface.font = _font;
        Frogger.drawingSurface.textAlign = "end";
        Frogger.drawingSurface.fillStyle = "#FF0";

        // Write the text right aligned within the <canvas> and in the bottom right corner
        // of the game board
        Frogger.drawingSurface.fillText("TIME", Frogger.drawingSurfaceWidth, Frogger.drawingSurfaceHeight);
    }

    // Define a function to render the text-based visuals to the game board as appropriate
    // depending on the current game state - we'll connect this up later to be called
    // once on every cycle of the game loop
    function render() {
        renderScore();
        renderTimeLabel();

        // Only render the "GAME OVER" text if the game is actually over
        if (_gameOver) {
            renderGameOver();
        }

        // Only render the "YOU WIN!" text if the players has won the game
        if (_gameWon) {
            renderGameWon();
        }
    }

    // When the game logic publishes a message declaring that the player has won the game,
    // set the local variable to indicate this also so that the "YOU WIN!" text will be
    // drawn onto the <canvas> during any following execution of the game loop
    Frogger.observer.subscribe("game-won", function() {
        _gameWon = true;
    });

    // When the game logic module publishes a message indicating that the game has been
    // lost, set the local variable to reflect this fact so that the "GAME OVER" text gets
    // written to the <canvas> element on the next cycle around the game loop
    Frogger.observer.subscribe("game-over", function() {
        _gameOver = true;
    });

    // Reset the local variables indicating the game state if the game logic has forced
    // a game state reset to occur
    Frogger.observer.subscribe("reset", function() {
        _gameOver = false;
        _gameWon = false;
    });

    // Update the local score variable when the player's score changes throughout the
    // course of the game. The updated score will then be written onto the <canvas> on
    // the next cycle of the game loop
    Frogger.observer.subscribe("score-change", function(newScore) {
        _score = newScore;
    });

    // Update the local high score variable when the game's high score changes throughout
    // the course of the game. The updated high score will then be drawn to the <canvas>
    // on the next cycle of the game loop
    Frogger.observer.subscribe("high-score-change", function(newHighScore) {
        _highScore = newHighScore;
    });

    // Subscribe to the "game-board-initialize" event fired by the previous code module,
    // storing the game board properties and settings in a local variable
    Frogger.observer.subscribe("game-board-initialize", function(gameBoard) {
        _gameBoard = gameBoard;

        // Start listening to the "render-base-layer" event, fired from within the game
        // loop, and execute the render() function when it occurs, drawing the text onto
        // the game board in the appropriate position for each cycle of the game loop
        Frogger.observer.subscribe("render-base-layer", render);
    });
}(Frogger));

/*
* 绘制游戏背景，剩余生命条数和剩余时间
* */

//把游戏背景图片绘制到<canvas>上，只进行一次绘制，因为是静态的
(function (Frogger) {
    var _background = document.createElement("img");
    _background.addEventListener("load", function () {
        Frogger.backgroundDrawingSurface.drawImage(_background, 0, 0, Frogger.drawingSurfaceWidth,
        Frogger.drawingSurfaceHeight);
    },false);
    _background.src = "gameboard.gif";
}(Frogger));

//玩家的生命条数以及距离自动失去生命还有多少时间
(function (Frogger) {
    var _lives = [],   //剩余生命条数
        _timeRemainingAsPersentage = 100,    //剩余时间
        _gameBoard;    //各项属性和参数

    //描述了一只小青蛙，用以表示剩余的生命
    function Life(left,top){
        Frogger.ImageSprite.call(this, left, top);
    }

    Life.prototype = new Frogger.ImageSprite();
    Life.prototype.constructor = Life;

    //根据表示生命的图像在拼合图像上的位置和尺寸对相应的属性赋值
    Life.prototype.spriteLeft = 720;
    Life.prototype.spriteTop = 80;
    Life.prototype.width = 40;
    Life.prototype.height = 40;

    //初始化时执行，把来自于游戏面板代码模块的属性和设置作为参数传入
    function initialize(gameBoard){
        var lifePositionTop;
        _gameBoard = gameBoard;

        //对应到游戏面板左下角的相应位置
        lifePositionTop = (_gameBoard.numRows - 1) * _gameBoard.grid.height;

        //对于每个生命图像的显示位置
        _lives =[
            new Life(0,lifePositionTop),
            new Life(1*Life.prototype.width,lifePositionTop),
            new Life(2*Life.prototype.width,lifePositionTop),
            new Life(3*Life.prototype.width,lifePositionTop),
            new Life(4*Life.prototype.width,lifePositionTop)
        ];

        Frogger.observer.subscribe("render-base-layer",render);
    }

    //渲染剩余生命条数至面板
    function renderLives(){
        var index = 0,
            length = _lives.length,
            life;


        for(;index < length ; index++){
            life = _lives[index];
            life.renderAt(life.left, life.top);        //“，”写成了“.”!!!
        }
    }

    //渲染绿色的长方形进度条表示剩余时间
    function renderTimeRemaining(){
        var rectangleWidth = _timeRemainingAsPersentage * _gameBoard.rows[10],

            rectangleHeight = _gameBoard.grid.height / 2,

            rectangleLeft = (1-_timeRemainingAsPersentage) * _gameBoard.rows[10],

            rectangleTop = Frogger.drawingSurfaceHeight - rectangleHeight;

        Frogger.drawingSurface.fillStyle = "#0F0";

        Frogger.drawingSurface.fillRect(rectangleLeft, rectangleTop, rectangleWidth,
            rectangleHeight);
    }

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

    Frogger.observer.subscribe("game-board-initialize",initialize);   //写成"game-load-initialize"！！！
}(Frogger));

/*
* 为游戏面板上的物体和目标位置建立显示图像和动画
* */

//定义命名空间，存放表示拼合图片上每个独立图像的各个“类”。游戏面板上锁出现的物体都是这些类的实例。
Frogger.Image = (function (Frogger) {
    //定义赛车
    function RaceCar(left){
        Frogger.ImageSprite.call(this,left);
    }

    //拼合图片上位置0px*80px的位置上定义为赛车
    RaceCar.prototype = new Frogger.ImageSprite();
    RaceCar.prototype.constructor = RaceCar;
    RaceCar.prototype.spriteLeft = 0;
    RaceCar.prototype.spriteTop = 80;

    //推土机
    function Bulldozer(left){
        Frogger.ImageSprite.call(this,left);
    }

    Bulldozer.prototype = new Frogger.ImageSprite();
    Bulldozer.prototype.constructor = Bulldozer;
    Bulldozer.prototype.spriteLeft = 80;
    Bulldozer.prototype.spriteTop = 80;

    //定义涡轮赛车
    function TurboRaceCar(left){
        Frogger.ImageSprite.call(this,left);
    }

    TurboRaceCar.prototype = new Frogger.ImageSprite();
    TurboRaceCar.prototype.constructor = TurboRaceCar;
    TurboRaceCar.prototype.spriteLeft = 160;
    TurboRaceCar.prototype.spriteTop = 80;

    //定义公路小汽车
    function RoadCar(left){
        Frogger.ImageSprite.call(this,left);
    }
    RoadCar.prototype = new Frogger.ImageSprite();
    RoadCar.prototype.constructor = RoadCar;
    RoadCar.prototype.spriteLeft = 240;
    RoadCar.prototype.spriteTop = 80;

    //定义大货车
    function Truck(left){
        Frogger.ImageSprite.call(this,left);
    }
    Truck.prototype = new Frogger.ImageSprite();
    Truck.prototype.constructor = Truck;
    Truck.prototype.spriteLeft = 320;
    Truck.prototype.spriteTop = 80;
    Truck.prototype.width = 122;

    //短圆木
    function ShortLog(left){
        Frogger.ImageSprite.call(this,left);
    }
    ShortLog.prototype = new Frogger.ImageSprite();
    ShortLog.prototype.constructor = ShortLog;
    ShortLog.prototype.spriteLeft = 0;
    ShortLog.prototype.spriteTop = 160;
    ShortLog.prototype.width = 190;

    //中长度圆木
    function MediumLog(left){
        Frogger.ImageSprite.call(this,left);
    }
    MediumLog.prototype = new Frogger.ImageSprite();
    MediumLog.prototype.constructor = MediumLog;
    MediumLog.prototype.spriteLeft = 0;
    MediumLog.prototype.spriteTop = 240;
    MediumLog.prototype.width = 254;

    //长圆木
    function LongLog(left){
        Frogger.ImageSprite.call(this,left);
    }
    LongLog.prototype = new Frogger.ImageSprite();
    LongLog.prototype.constructor = LongLog;
    LongLog.prototype.spriteLeft = 240;
    LongLog.prototype.spriteTop = 160;
    LongLog.prototype.width = 392;

    //定义乌龟，2乌龟组，3乌龟组，共同行为
    function Turtle(left){
        Frogger.ImageSprite.call(this,left);
    }
    Turtle.prototype = new Frogger.ImageSprite();
    Turtle.prototype.constructor = Turtle;

    //乌龟什么时候处于潜在水底的状态
    Turtle.prototype.isUnderwater = function () {
        var isUnderwater = false,
            //获悉动画引用
            animation = this.animations[this.currentAnimation];

        //拼合图片乌龟序列最后一张处于水底，通过动画帧序号的最大序列号表示。
        if(animation.getSequenceValue() === Math.max.apply(Math,animation.sequence)){
            isUnderwater = true;
        }
        return isUnderwater;
    };

    //2乌龟组
    function TwoTurtles(left){            //没有传参！！！
        Turtle.call(this,left);
    }
    TwoTurtles.prototype = new Turtle();
    TwoTurtles.prototype.constructor = TwoTurtles;
    TwoTurtles.prototype.spriteLeft = 320;
    TwoTurtles.prototype.spriteTop = 240;
    TwoTurtles.prototype.width = 130;

    TwoTurtles.prototype.reset = function () {
        Turtle.prototype.reset.call(this);

        //注册动画，以200ms的频率播放动画序列的每一帧，到达最后一帧后循环播放，
        //序列中的数值表示获取动画帧所用的独立图像的宽度的偏移量的倍数。
        this.registerAnimation({
            "diveAndSurface":{
                sequence:[0,1,2,3,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
                loop:true,
                rate:200
            }
        });

        //立刻播放动画
        this.playAnimation("diveAndSurface");
    };

    //3乌龟组
    function ThreeTurtles(left){
        Turtle.call(this,left);
    }
    ThreeTurtles.prototype = new Turtle();
    ThreeTurtles.prototype.constructor = ThreeTurtles;

    ThreeTurtles.prototype.spriteLeft = 0;
    ThreeTurtles.prototype.spriteTop = 320;
    ThreeTurtles.prototype.width = 200;

    ThreeTurtles.prototype.reset = function () {
        Turtle.prototype.reset.call(this);

        this.registerAnimation({
            "diveAndSurface":{
                sequence:[0,1,2,3,3,3,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
                loop:true,
                rate:300
            }
        });

        this.playAnimation("diveAndSurface");
    };

    //玩家达到目的地所显示的青蛙图像
    function GoalFrog(left){
        Frogger.ImageSprite.call(this,left);
    }
    GoalFrog.prototype = new Frogger.ImageSprite();
    GoalFrog.prototype.constructor = GoalFrog;
    GoalFrog.prototype.spriteLeft = 640;
    GoalFrog.prototype.spriteTop = 80;

    //在游戏面板上的位置不能改变了
    GoalFrog.prototype.moveTo = function () {};

    //目标位置
    function Goal(left){          //没有传参！！！
        Frogger.ImageSprite.call(this,left);
    }
    //不需要进行绘制
    Goal.prototype = new Frogger.ImageSprite();
    Goal.prototype.constructor = Goal;
    Goal.prototype.spriteLeft = 800;
    Goal.prototype.spriteTop = 320;

    Goal.prototype.moveTo = function () {};

    //该目标位置是否已被玩家达到
    Goal.prototype.isMet = false;

    return {
        RaceCar:RaceCar,
        Bulldozer:Bulldozer,
        RoadCar:RoadCar,
        TurboRaceCar:TurboRaceCar,
        Truck:Truck,
        ShortLog:ShortLog,
        MediumLog:MediumLog,
        LongLog:LongLog,
        TwoTurtles:TwoTurtles,
        ThreeTurtles:ThreeTurtles,
        GoalFrog:GoalFrog,
        Goal:Goal
    };
}(Frogger));

/*
* 玩家的角色
* */

//定义一个代码模块表示游戏面板上玩家的角色，根据当前游戏状态处理它的移动动作和行为
Frogger.Character = (function (Frogger) {
    var _character,    //表示玩家角色的图像
        _gameBoard = {},
        _startRow = 14,     //开始行
        _startColum = 6,    //开始列
        _currentRow = _startRow,     //已经达到的当前行
        _isFrozen = false;

    //玩家的青蛙角色，left,top 对应开始位置
    function Character(left, top) {
        Frogger.ImageSprite.call(this, left, top);

        //注册5个动画对应失去一条生命和上下左右移动
        this.registerAnimation({
            "lose-life": {
                spriteLeft: 640,
                sequence: [0, 1, 2],
                rate: 350
            },

            "move-up": {
                spriteLeft: 0,
                sequence: [1, 0]
            },

            "move-right": {
                spriteLeft: 160,
                sequence: [1, 0]
            },

            "move-down": {
                spriteLeft: 320,
                sequence: [1, 0]
            },

            "move-left": {
                spriteLeft: 480,
                sequence: [1, 0]
            }
        });
    }

    Character.prototype = new Frogger.ImageSprite();
    Character.prototype.constructor = Character;
    Character.prototype.spriteLeft = 0;
    Character.prototype.spriteTop = 0;

    //将玩家在游戏面板上上移一行
    Character.prototype.moveUp = function () {
        this.top -= _gameBoard.grid.height;

        if(this.top < _gameBoard.characterBounds.top){
            this.top = _gameBoard.characterBounds.top;
        }

        this.playAnimation("move-up");

        _currentRow--;
    };

    Character.prototype.moveDown = function () {
        this.top += _gameBoard.grid.height;

        if(this.top > _gameBoard.characterBounds.bottom){
            this.top = _gameBoard.characterBounds.bottom;
        }

        this.playAnimation("move-down");

        _currentRow++;
    };

    Character.prototype.moveLeft = function () {
        this.left -= _gameBoard.grid.width;

        if(this.left < _gameBoard.characterBounds.left){
            this.left = _gameBoard.characterBounds.left;
        }

        this.playAnimation("move-left");
    };

    Character.prototype.moveRight = function () {
        this.left += _gameBoard.grid.width;

        if(this.left > _gameBoard.characterBounds.right){
            this.left = _gameBoard.characterBounds.right;
        }

        this.playAnimation("move-right");
    };

    //返回玩家距离当前游戏面板顶部边界距离
    function getTop(){
        return _gameBoard.rows[_currentRow];
    }

    //使玩家从现实状态变为隐藏
    function hide(){
        _character.hide();
    }

    //使玩家朝某一方向移动
    function move(characterDirection){

        if(!_isFrozen){
            if(characterDirection === Frogger.direction.LEFT){
                _character.moveLeft();
            }else if(characterDirection === Frogger.direction.RIGHT){
                _character.moveRight();
            }else if(characterDirection === Frogger.direction.UP){
                _character.moveUp();
            }else if(characterDirection === Frogger.direction.DOWN){
                _character.moveDown();
            }

            Frogger.observer.publish("player-moved");
        }
    }

    //将玩家渲染至屏幕
    function render(){
        _character.renderAt(_character.left,_character.top);
    }

    function loseLife(){
        _character.playAnimation("lose-life");
    }

    //玩家处于移动的物体上时，跟随一起移动
    function setPosition(left){

        if(left > _gameBoard.characterBounds.right){
            left = _gameBoard.characterBounds.right;
        }else if(left < _gameBoard.characterBounds.left){
            left = _gameBoard.characterBounds.left;
        }

        //移动玩家位置（从面板左边缘计）
        _character.moveTo(left);
    }

    function reset(){
        _character.reset();
        _currentRow = _startRow;
    }

    //返回当前位置
    function getPosition(){
        return _character.getPosition();
    }

    function freeze(){
        _isFrozen = true;
    }

    function unfreeze(){
        _isFrozen = false;
    }

    function initialize(gameBoard){
        _gameBoard = gameBoard;

        _character = new Character(_gameBoard.columns[_startColum],_gameBoard.rows[_startRow]);

        Frogger.observer.subscribe("render-character",render);
    }

    Frogger.observer.subscribe("player-lost-life",loseLife);
    Frogger.observer.subscribe("reset",reset);
    Frogger.observer.subscribe("player-at-goal",hide);
    Frogger.observer.subscribe("player-freeze",freeze);
    Frogger.observer.subscribe("player-unfreeze",unfreeze);
    Frogger.observer.subscribe("game-board-initialize",initialize);

    window.addEventListener("keydown", function(event) {

        var LEFT_ARROW = 37,
            UP_ARROW = 38,
            RIGHT_ARROW = 39,
            DOWN_ARROW = 40;

        if(event.keyCode ===LEFT_ARROW){
            move(Frogger.direction.LEFT);
        }else if(event.keyCode ===UP_ARROW){
            move(Frogger.direction.UP);
        }else if(event.keyCode ===RIGHT_ARROW){
            move(Frogger.direction.RIGHT);
        }else if(event.keyCode ===DOWN_ARROW){
            move(Frogger.direction.DOWN);
        }
    },false);

    Frogger.canvas.addEventListener("touchstart", function (event) {
        var touchLeft = event.targetTouch[0].clientX,
            touchTop = event.targetTouch[0].clientY;

        if(touchLeft < (Frogger.drawingSurfaceWidth/8)){
            move(Frogger.direction.LEFT);
        }else if(touchLeft > (3*Frogger.drawingSurfaceWidth/8)){
            move(Frogger.direction.RIGHT);
        }else if(touchTop < (Frogger.drawingSurfaceHeight/8)){
            move(Frogger.direction.UP);
        }else if(touchTop > (3*Frogger.drawingSurfaceHeight/8)){
            move(Frogger.direction.DOWN);
        }
    },false);

    return{
        getTop:getTop,
        getPosition:getPosition,
        setPosition:setPosition
    };
}(Frogger));

/*
* 所有的相类似的物体都包含在一起，处于同一行上，定义出一个游戏面板上的“行”行为，
* 包含在该行中所有物体对象的引用。
* */

//创建一个“行”
Frogger.Row =(function() {
    //定义一个基础行“类”，包含游戏面板上每个不同类型的特定行所需要共享的代码
    function Row(options){
        options = options || {};

        this.direction = options.direction || Frogger.direction.LEFT;

        //定义一组物体，将其放在此行，并使其进行移动
        this.obstacles = options.obstacles || [];

        this.top = options.top || 0;

        this.speed = options.speed || 1;
    }

    Row.prototype ={
        render: function () {
            var index =0,
                length = this.obstacles.length,
                left,
                obstacalsItem;

            for(;index <length ; index++){
                obstacalsItem = this.obstacles[index];

                left = obstacalsItem.getPosition().left + ((this.direction === Frogger.direction.
                    RIGHT?1:-1)*this.speed);

                //如果物体移出游戏游戏面板的一条边界，他就从另一条边界返回
                if(left < -obstacalsItem.getWidth()){
                    left = Frogger.drawingSurfaceWidth;
                }else if(left >= Frogger.drawingSurfaceWidth){
                    left = -obstacalsItem.getWidth();
                }

                obstacalsItem.moveTo(left);
                obstacalsItem.renderAt(left,this.top);
            }
        },

        getTop: function () {
            return this.top;
        },

        //检测碰撞
        isCollision: function (characterPosition) {
            var index =0,
                length = this.obstacles.length,
                obstaclesItem,
                isCollision = false;

            for(;index < length; index++){
                obstaclesItem = this.obstacles[index];

                if(Frogger.intersects(obstaclesItem.getPosition(),characterPosition)){
                    isCollision = true;
                }
            }
            return isCollision;
        },

        reset: function () {
            var index = 0,
                length = this.obstacles.length;

            for(;index < length ; index++){
                this.obstacles[index].reset();
            }
        }
    };

    function Road(options){
        Row.call(this,options);
    }

    Road.prototype = new Row();
    Road.prototype.constructor = Road;

    function Log(options){
        Row.call(this,options);
    }

    Log.prototype = new Row();
    Log.prototype.constructor = Log;

    //重载isCollosion(),使他产生相反的效果
    Log.prototype.isCollision = function (characterPosition) {
        return !Row.prototype.isCollision.call(this,characterPosition);
    };

    //重载render(),当玩家停在圆木上时，玩家跟圆木一起运动
    Log.prototype.render = function () {
        if(Frogger.Character.getTop() === this.getTop()){
            Frogger.Character.setPosition(Frogger.Character.getPosition().left +
                ((this.direction === Frogger.direction.RIGHT?1:-1)*this.speed));
        }
        Row.prototype.render.call(this);
    };

    //包含乌龟的行
    function Turtle(options){
        Log.call(this,options);
    }

    Turtle.prototype = new Log();
    Turtle.prototype.constructor = Turtle;

    Turtle.prototype.isCollision = function (characterPosition) {
        var isCollision = Log.prototype.isCollision.call(this,characterPosition);
        return this.obstacles[0].isUnderwater() || isCollision;
    };

    //目标位置所在的行
    function Goal(options){
        options.speed = 0;
        Row.call(this,options);
    }

    Goal.prototype = new Row();
    Goal.prototype.constructor = Goal;

    Goal.prototype.isCollision = function (characterPosition) {
        var index = 0,
            length = this.obstacles.length,
            obstaclesItem,
            isCollision = true;

        for(;index < length;index++){
            obstaclesItem = this.obstacles[index];

            if(!obstaclesItem.isMet && Frogger.intersects(obstaclesItem.getPosition(),
                characterPosition)){
                this.obstacles[index].isMet = true;
                Frogger.observer.publish("player-at-goal");
                isCollision = false;

                this.obstacles.push(new Frogger.Image.GoalFrog(obstaclesItem.getPosition().left));
            }
        }

        return isCollision;
    };

    return{
        Road:Road,
        Log:Log,
        Turtle:Turtle,
        Goal:Goal
    };
}(Frogger));

/*
* 定义各行和各种类型的物体，并将他们放置于游戏面板上。
*/

//添加一些包含各个物体的行到游戏面板上
(function (Frogger) {
    //保存在游戏面板上所填充的行以及游戏面板自身的各项属性和设置
    var _row = [],
        _gameBoard = {};

    //初始化后执行，把各行和物体放置在游戏面板上
    function initialize(gameBoard){
        _gameBoard = gameBoard;

        _row = [
            //第三行，目标位置行
            new Frogger.Row.Goal({
                top:_gameBoard.rows[2],
                obstacles:[new Frogger.Image.Goal(33,111),new Frogger.Image.Goal(237,315),new
                    Frogger.Image.Goal(441,519),new Frogger.Image.Goal(645,723),new Frogger.Image.
                    Goal(849,927)]
            }),

            //中长度圆木行
            new Frogger.Row.Log({
                top:_gameBoard.rows[3],
                direction:Frogger.direction.RIGHT,
                speed:5,

                obstacles:[new Frogger.Image.MediumLog(_gameBoard.columns[1]),new Frogger.Image.
                    MediumLog(_gameBoard.columns[6]),new Frogger.Image.MediumLog(_gameBoard.
                    columns[10])]
            }),

            //2乌龟组
            new Frogger.Row.Turtle({
                top:_gameBoard.rows[4],
                speed:6,

                obstacles:[new Frogger.Image.TwoTurtles(_gameBoard.columns[0]),new Frogger.Image.
                    TwoTurtles(_gameBoard.columns[3]),new Frogger.Image.TwoTurtles(_gameBoard.
                    columns[6]),new Frogger.Image.TwoTurtles(_gameBoard.columns[9])]
            }),

            //长圆木组
            new Frogger.Row.Log({
                top:_gameBoard.rows[5],
                direction:Frogger.direction.RIGHT,
                speed:7,

                obstacles:[new Frogger.Image.LongLog(_gameBoard.columns[1]),new Frogger.Image.
                    LongLog(_gameBoard.columns[10])]
            }),

            //短圆木组
            new Frogger.Row.Log({
                top:_gameBoard.rows[6],
                direction:Frogger.direction.RIGHT,
                speed:3,

                obstacles:[new Frogger.Image.ShortLog(_gameBoard.columns[1]),new Frogger.Image.
                ShortLog(_gameBoard.columns[6]),new Frogger.Image.ShortLog(_gameBoard.columns[10])]
            }),

            //3乌龟组
            new Frogger.Row.Turtle({
                top:_gameBoard.rows[7],
                speed:5,
                obstacles:[new Frogger.Image.ThreeTurtles(_gameBoard.columns[0]),new Frogger.Image.
                ThreeTurtles(_gameBoard.columns[3]),new Frogger.Image.ThreeTurtles
                (_gameBoard.columns[7]),new Frogger.Image.ThreeTurtles(_gameBoard.columns[10])]
            }),

            //货车组
            new Frogger.Row.Road({
                top:_gameBoard.rows[9],
                speed:3,
                obstacles:[new Frogger.Image.Truck(_gameBoard.columns[1]),new Frogger.Image.
                Truck(_gameBoard.columns[7])]
            }),

            //涡轮赛车组
            new Frogger.Row.Road({
                top:_gameBoard.rows[10],
                direction:Frogger.direction.RIGHT,
                speed:12,
                obstacles:[new Frogger.Image.TurboRaceCar(_gameBoard.columns[1]),new Frogger.Image.
                    TurboRaceCar(_gameBoard.columns[7])]
            }),

            //公路汽车组
            new Frogger.Row.Road({
                top:_gameBoard.rows[11],
                direction:Frogger.direction.RIGHT,
                speed:4,
                obstacles:[new Frogger.Image.RoadCar(_gameBoard.columns[1]),new Frogger.Image.
                    RoadCar(_gameBoard.columns[7])]
            }),

            //推土机
            new Frogger.Row.Road({
                top:_gameBoard.rows[12],
                direction:Frogger.direction.RIGHT,
                speed:3,
                obstacles:[new Frogger.Image.Bulldozer(_gameBoard.columns[1]),new Frogger.Image.
                    Bulldozer(_gameBoard.columns[7])]
            }),

            //赛车
            new Frogger.Row.Road({
                top:_gameBoard.rows[13],
                speed:4,
                obstacles:[new Frogger.Image.RaceCar(_gameBoard.columns[2]),new Frogger.Image.
                    RaceCar(_gameBoard.columns[6])]
            })
        ];

        //初始化后关联局部函数render()至游戏主循环发出的render-base-layer事件，用于把以上内容绘制到游戏面板上
        Frogger.observer.subscribe("render-base-layer",render);
    }

    //把每个定义的物体渲染至游戏面板上
    function render(){
        var row,
            index = 0,
            length = _row.length;

        //依次遍历每一行并调用render()，
        for(;index < length ;index++){
            row = _row[index];
            row.render();
        }
    }

    //检测碰撞
    function isCollision(){
        var collided = false,
            row,
            index = 0,   //未付初值
            length = _row.length;

        //依次遍历每一行，调用该行的isClollision()，判断该行上的物体与玩家角色出现碰撞的情况
        for(;index < length ;index++){
            row = _row[index];
            if(Frogger.Character.getTop() === row.getTop()){
                collided = row.isCollision(Frogger.Character.getPosition());
                if(collided){
                    break;
                }
            }
        }

        if(collided){
            Frogger.observer.publish("collision");
        }

        return collided;
    }


    function reset(){
        var row;

        for(var index=0, length = _row.length; index < length ; index++){
            row = _row[index];
            row.reset();
        }
    }

    Frogger.observer.subscribe("reset",reset);

    Frogger.observer.subscribe("check-collisions",isCollision);

    Frogger.observer.subscribe("game-board-initialize",initialize);
}(Frogger));

Frogger.observer.publish("game-load");















