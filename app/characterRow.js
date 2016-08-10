/*
* 定义各行和各种类型的物体，并将他们放置于游戏面板上。
*/

//添加一些包含各个物体的行到游戏面板上
define(['Frogger', 'Row', 'Image', 'Character'], function (Frogger, Row, Image
  , Character) {
  //保存在游戏面板上所填充的行以及游戏面板自身的各项属性和设置
  var _row = [],
      _gameBoard = {};

  //初始化后执行，把各行和物体放置在游戏面板上
  function initialize(gameBoard){
    _gameBoard = gameBoard;

    _row = [
      //第三行，目标位置行
      new Row.Goal({
        top: _gameBoard.rows[2],
        obstacles:[new Image.Goal(33, 111), new Image.Goal(237, 315), new
          Image.Goal(441, 519), new Image.Goal(645, 723)
          , new Image.Goal(849, 927)]
      }),

        //中长度圆木行
        new Row.Log({
          top: _gameBoard.rows[3],
          direction: Frogger.direction.RIGHT,
          speed: 5,

          obstacles: [new Image.MediumLog(_gameBoard.columns[1]), new Image.
            MediumLog(_gameBoard.columns[6]), new Image.MediumLog(_gameBoard.
            columns[10])]
        }),

        //2乌龟组
        new Row.Turtle({
          top: _gameBoard.rows[4],
          speed: 6,

          obstacles: [new Image.TwoTurtles(_gameBoard.columns[0]), new Image.
            TwoTurtles(_gameBoard.columns[3]), new Image.TwoTurtles(_gameBoard.
            columns[6]), new Image.TwoTurtles(_gameBoard.columns[9])]
        }),

        //长圆木组
        new Row.Log({
          top: _gameBoard.rows[5],
          direction: Frogger.direction.RIGHT,
          speed: 7,

          obstacles: [new Image.LongLog(_gameBoard.columns[1]), new Image.
            LongLog(_gameBoard.columns[10])]
        }),

        //短圆木组
        new Row.Log({
          top: _gameBoard.rows[6],
          direction: Frogger.direction.RIGHT,
          speed: 3,

          obstacles: [new Image.ShortLog(_gameBoard.columns[1]), new Image.
          ShortLog(_gameBoard.columns[6]), new Image.ShortLog(_gameBoard.columns[10])]
        }),

        //3乌龟组
        new Row.Turtle({
          top: _gameBoard.rows[7],
          speed: 5,
          obstacles: [new Image.ThreeTurtles(_gameBoard.columns[0]), new Image.
          ThreeTurtles(_gameBoard.columns[3]), new Image.ThreeTurtles
          (_gameBoard.columns[7]), new Image.ThreeTurtles(_gameBoard.columns[10])]
        }),

        //货车组
        new Row.Road({
          top:_gameBoard.rows[9],
          speed: 3,
          obstacles: [new Image.Truck(_gameBoard.columns[1]), new Image.
          Truck(_gameBoard.columns[7])]
        }),

        //涡轮赛车组
        new Row.Road({
          top: _gameBoard.rows[10],
          direction: Frogger.direction.RIGHT,
          speed: 12,
          obstacles: [new Image.TurboRaceCar(_gameBoard.columns[1]), new Image.
            TurboRaceCar(_gameBoard.columns[7])]
        }),

        //公路汽车组
        new Row.Road({
          top: _gameBoard.rows[11],
          direction: Frogger.direction.RIGHT,
          speed: 4,
          obstacles: [new Image.RoadCar(_gameBoard.columns[1]), new Image.
            RoadCar(_gameBoard.columns[7])]
        }),

        //推土机
        new Row.Road({
          top: _gameBoard.rows[12],
          direction: Frogger.direction.RIGHT,
          speed: 3,
          obstacles: [new Image.Bulldozer(_gameBoard.columns[1]), new Image.
            Bulldozer(_gameBoard.columns[7])]
        }),

        //赛车
        new Row.Road({
          top:_gameBoard.rows[13],
          speed:4,
          obstacles:[new Image.RaceCar(_gameBoard.columns[2]), new Image.
            RaceCar(_gameBoard.columns[6])]
        })
    ];

    //初始化后关联局部函数render()至游戏主循环发出的render-base-layer事件，用于把以上内容绘制到游戏面板上
    Frogger.observer.subscribe("render-base-layer", render);
  }

  //把每个定义的物体渲染至游戏面板上
  function render(){
    var row,
        index = 0,
        length = _row.length;

    //依次遍历每一行并调用render()，
    for(; index < length ; index++){
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
    for(; index < length ; index++){
      row = _row[index];
      if(Character.getTop() === row.getTop()){
        collided = row.isCollision(Character.getPosition());
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

    for(var index=0, length = _row.length; index < length; index++){
      row = _row[index];
      row.reset();
    }
  }

  Frogger.observer.subscribe("reset", reset);

  Frogger.observer.subscribe("check-collisions", isCollision);

  Frogger.observer.subscribe("game-board-initialize", initialize);
});