//将动画指派给独立小图像实例，使任何图像都可以产生动画效果
define(['Frogger'], function(Frogger){
  var Animation = function(options){
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

  Animation.prototype = {
    //动画序列处于第几帧，实际上就是sequence数组的序号
    frame: 0,
    //该动画是否进行（frame是否已设定的频率增加）
    playing: false,
    //计时指示器，根据需要启动或停止帧序号的增加
    timer: null,

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
      }, this.rate);
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
    getSequenceValue: function(){
      return this.sequence[this.frame];
    },

    //返回此动画第一帧的独立小图像的左边缘的像素
    getSpriteLeft: function(){
      return this.spriteLeft;
    },

    //停止计时器，使当前帧序号停止增加，并因此停止动画进行
    stop: function () {
			clearInterval(this.timer);
			this.playing = false;
    }
  };

	return {
	  Animation: Animation
	};
});