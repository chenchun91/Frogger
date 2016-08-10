/**
 * @type {{canvas, drawingSurface, drawingSurfaceWidth, drawingSurfaceHeight
 * , backgroundDrawingSurface, direction, observer, intersects}}
 */
define(function(){
  var canvas = document.getElementById("canvas"),
    drawingSurface = canvas.getContext("2d"),
    backgroundCanvas = document.getElementById("background-canvas"),
    backgroundDrawingSurface = backgroundCanvas.getContext("2d"),

    drawingSurfaceWidth = canvas.width,
    drawingSurfaceHeight = canvas.height;

  return{
    //暴露以下代码供其他模块使用
    canvas: canvas,
    drawingSurface: drawingSurface,
    drawingSurfaceWidth: drawingSurfaceWidth,
    drawingSurfaceHeight: drawingSurfaceHeight,
    backgroundDrawingSurface: backgroundDrawingSurface,

    //游戏中各角色可以移动方向的应引用，全局化定义
    direction:{
      UP: "up",
      DOWN: "down",
      LEFT: "left",
      RIGHT: "right"
    },

    //观察者模式
    observer: (function(){
      //定义一个对象，用于按事件名称保存所注册的事件以及和该事件相关联的各个回调函数
      var events = {};

      return {
        /**
         * 保存一个函数，以及与之相关联的事件名称，当此名称对应的事件发生时，
         * 调用该函数
         * @param eventName 事件名称
         * @param callback
         */
        subscribe: function(eventName, callback) {
          //如果名称对应的时间没有被订阅，则在events对象中添加一个属性，
          //数据类型为数组
          if (!events.hasOwnProperty(eventName)) {
            events[eventName] = [];
          }

          events[eventName].push(callback);
        },

        /**
         * 一次执行与给定的事件名称相关联的所有函数，
         * 传给这些函数的参数都是相同的任意项数据，
         * 此数据是作为publish()的参数传入的
         * @param eventName
         */
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

    /**
     * 判断在游戏面板中的2个物体是否发生水平方向上的碰撞
     * @param position1
     * @param position2
     * @returns {boolean}
     */
    intersects: function(position1, position2){
      var doseIntersect = false;

      if ((position1.left > position2.left && position1.left < position2.right) ||
        (position1.right > position2.left && position1.left < position2.right)) {
        doseIntersect  = true;          
      }
      return doseIntersect;
    }
  };
});