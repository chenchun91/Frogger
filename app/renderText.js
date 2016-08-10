/*
* 通过把所有代码一起保存在一个负责处理文字和游戏状态信息渲染的模块中，
* 当涉及文字问题时，确切知道在哪里进行排查。
* */

//在游戏面板上添加文字
define(['Frogger'], function(Frogger){
  var _font = "67px Arcade Classic",

  // 定义一些变量保存当前游戏状态
    _score = 0,
    _highScore = 0,
    _gameWon = false,
    _gameOver = false,

    //存放之前定义的游戏面板的初始化数据
    _gameBoard = {};

  // 渲染玩家的分数及最高纪录
  function renderScore() {

    Frogger.drawingSurface.font = _font;

    // 右对齐
    Frogger.drawingSurface.textAlign = "end";

    Frogger.drawingSurface.fillStyle = "#FFF";
    Frogger.drawingSurface.fillText("1-UP", _gameBoard.columns[3], _gameBoard.grid.height / 2);

    Frogger.drawingSurface.fillStyle = "#F00";
    Frogger.drawingSurface.fillText(_score, _gameBoard.columns[3], _gameBoard.grid.height);

    Frogger.drawingSurface.fillStyle = "#FFF";
    Frogger.drawingSurface.fillText("HI-SCORE", _gameBoard.columns[8], _gameBoard.grid.height / 2);

    Frogger.drawingSurface.fillStyle = "#F00";
    Frogger.drawingSurface.fillText(_highScore, _gameBoard.columns[8], _gameBoard.grid.height);
  }

  // 渲染文字'GAME OVER'
  function renderGameOver() {

    Frogger.drawingSurface.font = _font;
    Frogger.drawingSurface.textAlign = "center";
    Frogger.drawingSurface.fillStyle = "#FFF";

    Frogger.drawingSurface.fillText("GAME OVER", Frogger.drawingSurfaceWidth / 2, _gameBoard.rows[9]);
  }

  // Define a function to render the text "YOU WIN!" to the <canvas> which will be called
  // when the player has won the game by reaching the home base position five times
  function renderGameWon() {
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
    Frogger.drawingSurface.font = _font;
    Frogger.drawingSurface.textAlign = "end";
    Frogger.drawingSurface.fillStyle = "#FF0";

    Frogger.drawingSurface.fillText("TIME", Frogger.drawingSurfaceWidth, Frogger.drawingSurfaceHeight);
  }

  //根据当前游戏的状态，把对应的基于文字的视觉效果渲染到游戏面板上
  function render() {
    renderScore();
    renderTimeLabel();

    if (_gameOver) {
      renderGameOver();
    }

    if (_gameWon) {
      renderGameWon();
    }
  }

  Frogger.observer.subscribe("game-won", function() {
    _gameWon = true;
  });

  Frogger.observer.subscribe("game-over", function() {
    _gameOver = true;
  });

  Frogger.observer.subscribe("reset", function() {
    _gameOver = false;
    _gameWon = false;
  });

  Frogger.observer.subscribe("score-change", function(newScore) {
    _score = newScore;
  });

  Frogger.observer.subscribe("high-score-change", function(newHighScore) {
    _highScore = newHighScore;
  });

  //把游戏面板的各项属性和局部设置保存在一个局部变量中
  Frogger.observer.subscribe("game-board-initialize", function(gameBoard) {
    _gameBoard = gameBoard;

    Frogger.observer.subscribe("render-base-layer", render);
  });
});