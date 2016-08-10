//定义游戏面板的参数、网络行数、列数以及他们的相对位置
define(['Frogger'], function(Frogger){
  var _grid={
    width: 80,
    height: 80
  },
  //定义游戏面板行数
  _numRows = 16,
  //列数
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
    Frogger.observer.publish("game-board-initialize", {   
      // 传出游戏面板所组成的行数和列数
      numsows: _numRows,
      numcolumns: _numColumns,

      //传出两个数组，分别表示游戏面板的每一行和每一列的像素位置，使得能够简便地在
      //<canvas>元素上的正确位置上绘制图像
      rows: _rows,
      columns: _columns,

      //传出游戏面板每个网格的宽度和高度
      grid:{
        width:_grid.width,
        height:_grid.height
      },

      //传出一个对象包含角色允许移动的最上下左右位置
      characterBounds: _characterBounds
    });
  });
});