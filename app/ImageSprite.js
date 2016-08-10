//建立图片，并将其放置在面板中
define(['Frogger', 'Animation'], function(Frogger, Animation){
  function ImageSprite(startPositionLeft, startPositionTop){
    this.startLeft = startPositionLeft || 0;
    this.startTop = startPositionTop || 0;

    //初始化一个对象属性，保存用于游戏的动画
    this.animations = {};

    this.reset();
  };

  /**
  * 定义和初始化一些方法和属性
  * @type {{top: number, left: number, startLeft: number, startTop: number, sprite
  * , width: number, height: number, spriteTop: number, spriteLeft: number, animations: null
  * , currentAnimation: string, isHidden: boolean, reset: Function, registerAnimation: Function
  * , resetAnimation: Function, playAnimation: Function, renderAt: Function, moveTo: Function
  * , getWidth: Function, getPosition: Function, hide: Function}}
  */
  ImageSprite.prototype = {
    //保存独立小图像当前在游戏面板上的位置
    top: 0,
    left: 0,

    //独立小图像初始位置
    startLeft: 0,
    startTop: 0,

    sprite:(function(){
			var img =document.createElement("img");
			img.src = "spritemap.png";
			return img;
    }()),

    //独立小图像的默认高度和宽度
    width: 80,
    height: 80,

    //独立小图像在大拼合图像中的位置的位置
    spriteTop: 0,
    spriteLeft: 0,

    //默认状态下为没有动画
    animations: null,

    //当前所进行的动画的名称
    currentAnimation: "",

    isHidden: false,    // 独立小图像的当前位置是否为隐藏

    reset: function() {
			this.left = this.startLeft;
			this.top = this.startTop;

			//重置任何与之相关的动画至各自的初始状态
			this.resetAnimation();

			this.isHidden = false;
    },

    //把一个或多个动画与该图片关联，每个key表示动画的名称
    registerAnimation: function(animations){
			var key, animation;

			//为所提供的数据对象中的每一项创建Frogger.Animation实例，每一项的数据会在该项的
			//对应动画实例化时传入，以定义出它的动画序列、频率和其他属性
			for(key in animations){
				animation = animations[key];
				this.animations[key] = new Animation.Animation(animation);
			}
    },

    resetAnimation: function () {
			if(this.animations[this.currentAnimation]){
				this.animations[this.currentAnimation].reset();
			}
			this.currentAnimation = "";
    },

    //根据名称播放指定的动画序列，该名称必须与之前提供给registerAnimation（）的某个名称一致
    playAnimation: function(name){
			this.currentAnimation = name;
			if(this.animations[this.currentAnimation]){
				this.animations[this.currentAnimation].play();
			}
    },

    renderAt: function(left, top) {
			//找出当前正在进行的动画
			var animation = this.animations[this.currentAnimation],

				//如果有动画正在进行，则基于他的内部的帧序号获取当前序列值，如果没有，假设序列数组中的值为
				//0，将该值乘以拼合图片中独立小图片的宽度，准确识别出图像并进行显示
				sequenceValue = animation ? animation.getSequenceValue():0,

				//获取的初始帧的位置。动画所有的帧应该与主图片放置在一起，并置于拼合图片的同一行
				animationSpriteLeft = animation ? animation.getSpriteLeft():0,

				//计算所要显示的图片相对于拼合图片左边缘的偏移值
				spriteLeft = this.spriteLeft + animationSpriteLeft + (this.width * sequenceValue);

			if(!this.isHidden){
				Frogger.drawingSurface.drawImage(this.sprite, spriteLeft, this.spriteTop, this.width
				,this.height, left, top, this.width, this.height);
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
    getWidth: function(){
      return this.width;
    },

    //返回图像的左部右部位置
    getPosition: function(){
			return {
				left:this.left,
				right:this.left +this.width
			};
    },

    //把这个图像从游戏面板隐藏，实际上就是停止renderAt()
    hide: function(){
      this.isHidden = true;
    }
	};
  
  return {
    ImageSprite: ImageSprite
  };
});