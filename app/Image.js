//存放表示拼合图片上每个独立图像的各个“类”。游戏面板上所出现的物体都是这些类的实例。
define(['ImageSprite'], function(ImageSprite){
  //定义赛车
  function RaceCar(left){
    ImageSprite.ImageSprite.call(this, left);
  }

  //拼合图片上位置0px*80px的位置上定义为赛车
  RaceCar.prototype = new ImageSprite.ImageSprite();
  RaceCar.prototype.constructor = RaceCar;
  RaceCar.prototype.spriteLeft = 0;
  RaceCar.prototype.spriteTop = 80;

  //推土机
  function Bulldozer(left){
    ImageSprite.ImageSprite.call(this, left);
  }

  Bulldozer.prototype = new ImageSprite.ImageSprite();
  Bulldozer.prototype.constructor = Bulldozer;
  Bulldozer.prototype.spriteLeft = 80;
  Bulldozer.prototype.spriteTop = 80;

  //定义涡轮赛车
  function TurboRaceCar(left){
    ImageSprite.ImageSprite.call(this, left);
  }

  TurboRaceCar.prototype = new ImageSprite.ImageSprite();
  TurboRaceCar.prototype.constructor = TurboRaceCar;
  TurboRaceCar.prototype.spriteLeft = 160;
  TurboRaceCar.prototype.spriteTop = 80;

  //定义公路小汽车
  function RoadCar(left){
    ImageSprite.ImageSprite.call(this, left);
  }
  RoadCar.prototype = new ImageSprite.ImageSprite();
  RoadCar.prototype.constructor = RoadCar;
  RoadCar.prototype.spriteLeft = 240;
  RoadCar.prototype.spriteTop = 80;

  //定义大货车
  function Truck(left){
    ImageSprite.ImageSprite.call(this, left);
  }
  Truck.prototype = new ImageSprite.ImageSprite();
  Truck.prototype.constructor = Truck;
  Truck.prototype.spriteLeft = 320;
  Truck.prototype.spriteTop = 80;
  Truck.prototype.width = 122;

  //短圆木
  function ShortLog(left){
    ImageSprite.ImageSprite.call(this, left);
  }
  ShortLog.prototype = new ImageSprite.ImageSprite();
  ShortLog.prototype.constructor = ShortLog;
  ShortLog.prototype.spriteLeft = 0;
  ShortLog.prototype.spriteTop = 160;
  ShortLog.prototype.width = 190;

  //中长度圆木
  function MediumLog(left){
    ImageSprite.ImageSprite.call(this, left);
  }
  MediumLog.prototype = new ImageSprite.ImageSprite();
  MediumLog.prototype.constructor = MediumLog;
  MediumLog.prototype.spriteLeft = 0;
  MediumLog.prototype.spriteTop = 240;
  MediumLog.prototype.width = 254;

  //长圆木
  function LongLog(left){
    ImageSprite.ImageSprite.call(this, left);
  }
  LongLog.prototype = new ImageSprite.ImageSprite();
  LongLog.prototype.constructor = LongLog;
  LongLog.prototype.spriteLeft = 240;
  LongLog.prototype.spriteTop = 160;
  LongLog.prototype.width = 392;

  //定义乌龟，2乌龟组，3乌龟组，共同行为
  function Turtle(left){
    ImageSprite.ImageSprite.call(this, left);
  }
  Turtle.prototype = new ImageSprite.ImageSprite();
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
    Turtle.call(this, left);
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
    Turtle.call(this, left);
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
    ImageSprite.ImageSprite.call(this, left);
  }
  GoalFrog.prototype = new ImageSprite.ImageSprite();
  GoalFrog.prototype.constructor = GoalFrog;
  GoalFrog.prototype.spriteLeft = 640;
  GoalFrog.prototype.spriteTop = 80;

  //在游戏面板上的位置不能改变了
  GoalFrog.prototype.moveTo = function () {};

  //目标位置
  function Goal(left){         
    ImageSprite.ImageSprite.call(this, left);
  }
  //不需要进行绘制
  Goal.prototype = new ImageSprite.ImageSprite();
  Goal.prototype.constructor = Goal;
  Goal.prototype.spriteLeft = 800;
  Goal.prototype.spriteTop = 320;

  Goal.prototype.moveTo = function () {};

  //该目标位置是否已被玩家达到
  Goal.prototype.isMet = false;

  return {
    RaceCar: RaceCar,
    Bulldozer: Bulldozer,
    RoadCar: RoadCar,
    TurboRaceCar: TurboRaceCar,
    Truck: Truck,
    ShortLog: ShortLog,
    MediumLog: MediumLog,
    LongLog: LongLog,
    TwoTurtles: TwoTurtles,
    ThreeTurtles: ThreeTurtles,
    GoalFrog: GoalFrog,
    Goal: Goal
  };
});