  /*
  * 玩家的角色
  * */

  /**
  * 定义一个代码模块表示游戏面板上玩家的角色，根据当前游戏状态处理它的移动动作和行为
  * @type {{getTop, getPosition, setPosition}}
  */
define(['Frogger', 'ImageSprite'], function(Frogger, ImageSprite){
  var _character,    //表示玩家角色的图像
      _gameBoard = {},
      _startRow = 14,     //开始行
      _startColum = 6,    //开始列
      _currentRow = _startRow,     //已经达到的当前行
      _isFrozen = false;

  //玩家的青蛙角色，left,top 对应开始位置
  function Character(left, top) {
    ImageSprite.ImageSprite.call(this, left, top);

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

  Character.prototype = new ImageSprite.ImageSprite();
  Character.prototype.constructor = Character;
  Character.prototype.spriteLeft = 0;
  Character.prototype.spriteTop = 0;

  //将玩家在游戏面板上上移一行
  Character.prototype.moveUp = function () {
    //把角色的上部位置向上移动，移动距离为游戏面板的一个方格的高度
    this.top -= _gameBoard.grid.height;

    if(this.top < _gameBoard.characterBounds.top){
      this.top = _gameBoard.characterBounds.top;
    }

    this.playAnimation("move-up");

    //保持对角色目前所在行的记录
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
    _character.renderAt(_character.left, _character.top);
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

  //在游戏面板已经初始化时执行，把来自游戏面板代码模块的各项属性和设置传入
  function initialize(gameBoard){
    _gameBoard = gameBoard;

    _character = new Character(_gameBoard.columns[_startColum], _gameBoard.rows[_startRow]);

    Frogger.observer.subscribe("render-character", render);
  }

  Frogger.observer.subscribe("player-lost-life", loseLife);
  Frogger.observer.subscribe("reset", reset);
  Frogger.observer.subscribe("player-at-goal", hide);
  Frogger.observer.subscribe("player-freeze", freeze);
  Frogger.observer.subscribe("player-unfreeze", unfreeze);
  Frogger.observer.subscribe("game-board-initialize", initialize);

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
  }, false);

  Frogger.canvas.addEventListener("touchstart", function (event) {
    var touchLeft = event.targetTouches[0].clientX,
      touchTop = event.targetTouches[0].clientY;

    if(touchLeft < (Frogger.drawingSurfaceWidth/8)){
      move(Frogger.direction.LEFT);
    }else if(touchLeft > (3 * Frogger.drawingSurfaceWidth/8)){
      move(Frogger.direction.RIGHT);
    }else if(touchTop < (Frogger.drawingSurfaceHeight/8)){
      move(Frogger.direction.UP);
    }else if(touchTop > (3 * Frogger.drawingSurfaceHeight/8)){
      move(Frogger.direction.DOWN);
    }
  }, false);

  return{
    getTop: getTop,
    getPosition: getPosition,
    setPosition: setPosition
  };
});
