/*
* 核心逻辑
* */
//此模块保持追踪游戏状态、玩家的分数、剩余生命条数，处理玩家与其他物体之间的碰撞，
//确保游戏图形可以在正确的时刻绘制到<canvas>上

define(['Frogger'], function(Frogger){
  window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame || 
    function(callback){
    window.setTimeout(callback, 1000 / 60);
    };
  })();
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

        //此函数会根据_refreshRate的值的频率进行调用，实现精确倒计时
        _timeRemaining -=_refreshRate;

        Frogger.observer.publish("time-remaining-change", _timeRemaining/_timeTotal);
    }else{
        //剩余到达时间为0，生命条数减1
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

  //玩家失去一条生命时调用
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
        setTimeout(reset, 2000);
      }
  }

  //玩家被冻结在原地时进行调用，如游戏结束或失去一条生命
  function freezePlayer(){
      //表示冻结状态
      _isPlayerFrozen = true;

      Frogger.observer.publish("player-freeze");
  }

  //从原先冻结的状态恢复到自由移动状态是调用
  function unfreezePlayer(){
      _isPlayerFrozen = false;
      Frogger.observer.publish("player-unfreeze");
  }


  /**
   * 以特定分值增加玩家的分数,并相应更新最高分数记录
   * @param increaseBy 增加的分数
   */
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
      //分值增加2000
      increaseScore(1000);
      //到达目的地的总次数
      _timesAtGoal++;

      //临时冻结，表示已到达目的地
      freezePlayer();

      if(_timesAtGoal < _maxTimesAtGoal){
          setTimeout(reset, 2000);
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

  //主循环以特定的频率（_refreshRate）按某时间间隔执行
  function gameLoop(){
      //计算从上一次主循环调用以来过去的时间
      var currentTime = (new Date()).getTime(),
          timeDifference = currentTime - _lastTimeGameLoopRan;

      //当下一帧准备好可供浏览器使用时，执行此函数
      window.requestAnimationFrame(gameLoop);

      //如果已经过去的时间超过刷新频率，绘制个物体在更新后的位置，并检测碰撞
      if(timeDifference >= _refreshRate){
          //清空<canvas>元素的绘制表面
          Frogger.drawingSurface.clearRect(0,0,Frogger.drawingSurfaceWidth,Frogger.
              drawingSurfaceHeight);

          if(!_isPlayerFrozen){
              //如果没被冻结继续倒计时
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
      Frogger.observer.publish("high-score-change", _highScore);
      gameLoop();
  }

  //一旦game-load发生，执行start()函数来启动主循环
  Frogger.observer.subscribe("game-load", start);

  Frogger.observer.subscribe("player-at-goal", playerAtGoal);
  Frogger.observer.subscribe("player-moved", playerMoved);
  Frogger.observer.subscribe("collision", loseLife);

});