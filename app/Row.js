/*
* 所有的相类似的物体都包含在一起，处于同一行上，定义出一个游戏面板上的“行”行为，
* 包含在该行中所有物体对象的引用。
* */

/**
 * 创建一个“行”
 * @type {{Road, Log, Turtle, Goal}}
 */
define(['Frogger', 'Character', 'Image'], function(Frogger, Character, Image){
  /**
   * 定义一个基础行“类”，包含游戏面板上每个不同类型的特定行所需要共享的代码
   * @param options
   * @constructor
   */
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

        //基于这个物体的当前位置以及物体移动方向和速度，更新它的左部位置
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

      //返回此行的上部像素位置
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
    Row.call(this, options);
  }

  Road.prototype = new Row();
  Road.prototype.constructor = Road;

  function Log(options){
    Row.call(this, options);
  }

  Log.prototype = new Row();
  Log.prototype.constructor = Log;

  //重载isCollosion(),使他产生相反的效果
  Log.prototype.isCollision = function (characterPosition) {
    return !Row.prototype.isCollision.call(this, characterPosition);
  };

  //重载render(),当玩家停在圆木上时，玩家跟圆木一起运动
  Log.prototype.render = function () {
    if(Character.getTop() === this.getTop()){
        Character.setPosition(Character.getPosition().left +
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
    Row.call(this, options);
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

        this.obstacles.push(new Image.GoalFrog(obstaclesItem.getPosition().left));
      }
    }

    return isCollision;
  };

  return{
    Road: Road,
    Log: Log,
    Turtle: Turtle,
    Goal: Goal
  };
});