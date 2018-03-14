(function($){
	
	/*====================dialog对话框==========================*/
	$.ymDialog = function(options){
		var This = this;
		var opts = $.extend({},$.ymDialog.methods,$.ymDialog.defalutes,options);
		//opts.inits(This,opts); //初始化
		opts.inits(opts);
	}
	
	/*方法设置*/
	$.ymDialog.methods = {
		
		//初始化
		inits:function(opts){
			var _this = this;
			_this.template(opts);
		},
		
		dragMoves : function(obj,opts){
			var _this = this;
			var editTlt = obj.find(".tm_title");
			var $closeBtn = obj.find(".tm_close");
			var $sureBtn = obj.find(".tm_sure");
			var $cancleBtn = obj.find(".tm_cancel");
			$closeBtn.off("mousedown").on("mousedown",_this.cancleEvent(obj));//关闭
			$cancleBtn.off("click").on("click",_this.cancleEvent(obj));//取消
			$sureBtn.off("click").on("click",function(){ //确定
				var timer = setTimeout(function(){
					opts.success && opts.success();
					clearTimeout(timer);
				},500);
				_this.cancleEvent(obj)();
			});
			
			if(opts.isDrag){
				editTlt.on("mousedown",function(ev){
					var ev = ev || window.event;
					var oldX = ev.clientX;
					var oldY = ev.clientY;
					var _left = obj.offset().left;
					var _top = obj.offset().top;
					var width = obj.width();
					var height = obj.height();
					var scrollLeft = $(window).scrollLeft();
					var scrollTop = $(window).scrollTop();
					var dottedPanel = $("<div></div>");
					dottedPanel.css({
						"width":width,
						"height":height,
						"position":"fixed",
						"overflow":"hidden",
						"border-radius":"3px",
						"left":_left-scrollLeft-2,
						"top":_top-scrollTop-2,
						"cursor":"move",
						"zIndex":"12",
						"border":"2px dashed #ccc"
					});
					$("body").append(dottedPanel);
					
					var maxLeft = $(window).width()-width;
					var maxTop = $(window).height()-height;
					var isFlag = true;
					
					$(document).on("mousemove",dragMove);
					$(document).on("mouseup",dragUp);
					
					function dragMove(ev){ //移动
						if(isFlag){
							var e = ev || window.event;
							var newX = e.clientX;
							var newY = e.clientY;
							var newdisx = Math.abs(newX - oldX);
							var newdisy = Math.abs(newY - oldY);
							if(newdisx >=10 || newdisy >=10){
								var newLeft = newX - oldX + _left - scrollLeft; 
								var newTop = newY - oldY + _top - scrollTop;
								if(newLeft<=0)newLeft=0;
								if(newTop<=0)newTop=0;
								if(newLeft>maxLeft)newLeft = maxLeft;
								if(newTop>maxTop)newTop = maxTop;
								dottedPanel.css({"left":newLeft,"top":newTop});	
							}
						}
					}
					
					function dragUp(ev){
						var resulteLeft = dottedPanel.offset().left;
						var resulteTop = dottedPanel.offset().top;
						dottedPanel.remove();
						if(resulteLeft == _left-scrollLeft-2 && resulteTop == _top-scrollTop-2)dottedPanel.remove();
						else if(resulteLeft == 0 && resulteTop == 0)return false;
						else{
							if(resulteLeft <= 0)resulteLeft = 0;
							if(resulteTop <= 0)resulteTop = 0;
							var scrollLeft = $(window).scrollLeft();
							var scrollTop = $(window).scrollTop();
							obj.animate({"left":resulteLeft-scrollLeft+2,"top":resulteTop-scrollTop+2},300);
						}
						isFlag = false;
						$(document).off("mousedown");
						$(document).off("mouseup");
					}
					return false;
				});
			}
		},
		
		//窗口改变，继续居中
		resize:function(obj){
			var _this = this;
			var tipTimer = null;
			$(window).resize(function(){
				clearTimeout(tipTimer);
				timer = setTimeout(function(){tzUtil._position(obj);},30);
			})
			/*$(window).on("resize",function(){
				_this.getCenter(obj,true);
			})*/
		},
		
		//事件取消
		cancleEvent : function(obj){
			return function(){
				obj.removeClass("animated bounceInUp").addClass("animated bounceOutUp");
				$("#tm-overlay").fadeOut();
				setTimeout(function(){
					obj.remove();
					$("#tm-overlay").remove();
				},400);
				return false;
			}
		},
		
		//居中
		getCenter:function(obj,state){
			var height = obj.height();
			var width = obj.width();
			var winW = $(window).width();
			var winH = $(window).height();
			var left = (winW - width)/2;
			var top =  (winH - height)/2;
			if(!state){
				obj.css({"left":left,"top":top});
			}else{
				obj.stop(true,true).animate({"left":left,"top":top});
			}
		},
		template : function(opts){
			
			var tm_dialog = $("#tm_dialog");
			var coverlayer = $("#tm-overlay");
			if(tm_dialog.html() === undefined){
				tm_dialog = $(
					"<div class='tm_dialog' id='tm_dialog'>"+
					"			<div class='tm_title'>"+
					"				<h2 id='tm_title'>"+opts.title+"</h2>"+
					"				<a href='javascript:void(0)' class='tm_close'></a>"+
					"			</div>"+
					"			<div class='tm_contents'>"+
					"			<p class='tips-title'>"+opts.contents+"</p>"+
					"			</div>"+
					"			<div class='tm-btns'>"+
					"				<a href='javascript:void(0)' class='tm_sure'>确认</a>"+
					"				<a href='javascript:void(0)' class='tm_cancel'>取消</a>"+
					"			</div>"+
					"</div>"
				);
				coverlayer = $("<div class='tm-overlay' id='tm-overlay'></div>");
				$("body").append(tm_dialog);
				$("body").append(coverlayer);
				this.getCenter(tm_dialog);
				coverlayer.stop().fadeIn();
				tm_dialog.show().removeClass("animated bounceOutUp").addClass("animated bounceInUp");
				this.resize(tm_dialog);
				this.dragMoves(tm_dialog,opts);
			}else{
				coverlayer.stop().fadeIn();
				tm_dialog.find("#tm_title").html(opts.title);
				tm_dialog.find(".tips-title").html(opts.contents);
				tm_dialog.show().removeClass("animated bounceOutUp").addClass("animated bounceInUp");
			}
			
			return tm_dialog;
		}
	};
	
	//可配置的信息 
	$.ymDialog.defalutes = {
		/*isDrag : true, //是否可以拖拽，默认true
		closeBtn : $(".tm_close"),//配置关闭按钮
		suerBtn : $(".tm_sure"),
		cancleBtn : $(".tm_cancel"),
		success : function(){}*/
		
		isDrag : true,
		title : "标题",
		contents : "这里是内容",
		success : function(){}
		
	};
	
	
	/*=================drags拖拽框===================*/
	/**
	 * 使用方式
	 * $(selector).ymDrags({}）
	 * @param {Object} options
	 */
	$.fn.ymDrags = function(options){
		var This = this;
		var opts = $.extend({},$.fn.ymDrags.methods,$.fn.ymDrags.defalutes,options);
		opts.inits(This,opts); //初始化
	}
	
	/*方法设置*/
	$.fn.ymDrags.methods = {
		
		//初始化
		inits:function(obj,opts){
			this.getCenter(obj);
			obj.show().removeClass("animated bounceOutUp").addClass("animated bounceInUp");
			this.resize(obj);
			this.dragMoves(obj,opts);
		},
		
		dragMoves : function(obj,opts){
			var _this = this;
			var editTlt = obj.children("div").eq(0);
			var $closeBtn = obj.find(opts.closeBtn);
			var $sureBtn = obj.find(opts.suerBtn);
			var $cancleBtn = obj.find(opts.cancleBtn);
			$closeBtn.off("mousedown").on("mousedown",_this.cancleEvent(obj,opts));//关闭
			$cancleBtn.off("click").on("click",_this.cancleEvent(obj,opts));//取消
			$sureBtn.off("click").on("click",function(){ //确定
				opts.callback && opts.callback();
				$cancleBtn.trigger("click");
			});
			
			if(opts.isDrag){
				editTlt.on("mousedown",function(ev){
					var ev = ev || window.event;
					var oldX = ev.clientX;
					var oldY = ev.clientY;
					var _left = obj.offset().left;
					var _top = obj.offset().top;
					var width = obj.width();
					var height = obj.height();
					var scrollLeft = $(window).scrollLeft();
					var scrollTop = $(window).scrollTop();
					var dottedPanel = $("<div></div>");
					dottedPanel.css({
						"width":width,
						"height":height,
						"position":"fixed",
						"overflow":"hidden",
						"border-radius":"3px",
						"left":_left-scrollLeft-2,
						"top":_top-scrollTop-2,
						"cursor":"move",
						"zIndex":"12",
						"border":"2px dashed #ccc"
					});
					$("body").append(dottedPanel);
					
					var maxLeft = $(window).width()-width;
					var maxTop = $(window).height()-height;
					var isFlag = true;
					
					$(document).on("mousemove",dragMove);
					$(document).on("mouseup",dragUp);
					
					function dragMove(ev){ //移动
						if(isFlag){
							var e = ev || window.event;
							var newX = e.clientX;
							var newY = e.clientY;
							var newdisx = Math.abs(newX - oldX);
							var newdisy = Math.abs(newY - oldY);
							if(newdisx >=10 || newdisy >=10){
								var newLeft = newX - oldX + _left - scrollLeft; 
								var newTop = newY - oldY + _top - scrollTop;
								if(newLeft<=0)newLeft=0;
								if(newTop<=0)newTop=0;
								if(newLeft>maxLeft)newLeft = maxLeft;
								if(newTop>maxTop)newTop = maxTop;
								dottedPanel.css({"left":newLeft,"top":newTop});	
							}
						}
					}
					
					function dragUp(ev){
						var resulteLeft = dottedPanel.offset().left;
						var resulteTop = dottedPanel.offset().top;
						dottedPanel.remove();
						if(resulteLeft == _left-scrollLeft-2 && resulteTop == _top-scrollTop-2)dottedPanel.remove();
						else if(resulteLeft == 0 && resulteTop == 0)return false;
						else{
							if(resulteLeft <= 0)resulteLeft = 0;
							if(resulteTop <= 0)resulteTop = 0;
							var scrollLeft = $(window).scrollLeft();
							var scrollTop = $(window).scrollTop();
							obj.animate({"left":resulteLeft-scrollLeft+2,"top":resulteTop-scrollTop+2},300);
						}
						isFlag = false;
						$(document).off("mousedown");
						$(document).off("mouseup");
					}
					return false;
				});
			}
		},
		
		//窗口改变，继续居中
		resize:function(obj){
			var _this = this;
			$(window).on("resize",function(){
				_this.getCenter(obj,true);
			})
		},
		
		//事件取消
		cancleEvent : function(obj,opts){
			return function(){
				obj.removeClass("animated bounceInUp").addClass("animated bounceOutUp");
				setTimeout(function(){
					obj.hide();
				},400);
				opts.closeFn && opts.closeFn();
				return false;
			}
		},
		
		//居中
		getCenter:function(obj,state){
			var height = obj.height();
			var width = obj.width();
			var winW = $(window).width();
			var winH = $(window).height();
			var left = (winW - width)/2;
			var top =  (winH - height)/2;
			if(!state){
				obj.css({"left":left,"top":top});
			}else{
				obj.stop(true,true).animate({"left":left,"top":top});
			}
		}
	};
	
	//可配置的信息 
	$.fn.ymDrags.defalutes = {
		isDrag : true, //是否可以拖拽，默认true
		closeBtn : $(".tm_close"),//配置关闭按钮
		suerBtn : $(".tm_sure"),
		cancleBtn : $(".tm_cancel"),
		closeFn : function(){},//其他方法，【不一定成功回调，比如：在窗口关闭的时候，同时触发其他操作】
		callback : function(){}
	};
	
	/****************suspend tips**************/
	$.fn.tips = function(options){
        var defaults = {
            side:2,
            msg:'',
            color:'#FFF',
            bg:'#FF5080',
            time:2,
            x:0,
            y:0
        }
        /**
         	* 使用方法
			* $(selector).tips({
			*  msg:'your messages!',    //提示消息  必填
			*  side:1,  //提示窗显示位置  1，2，3，4 分别代表 上右下左 默认为1（上） 可选
			*  color:'#FFF', //提示文字色 默认为白色 可选
			*  bg:'#F00',//提示窗背景色 默认为红色 可选
			*  time:3,//自动关闭时间 默认3秒， 设置0则不自动关闭 可选
			*  x:0,//横向偏移  正数向右偏移 负数向左偏移 默认为0 可选
			*  y:0,//纵向偏移  正数向下偏移 负数向上偏移 默认为0 可选
			* })
         * 
         */
        var options = $.extend(defaults, options);
        if (!options.msg||isNaN(options.side)) {
	        throw new Error('params error');
	    }
	    if(!$('#tz_jquery_tips_style').length){
	        var style='<style id="tz_jquery_tips_style" type="text/css">';
	        style+='.tz_jq_tips_box{padding:10px;position:absolute;overflow:hidden;display:inline;display:none;z-index:10176523;}';
	        style+='.tz_jq_tips_arrow{display:block;width:0px;height:0px;position:absolute;}';
	        style+='.tz_jq_tips_top{border-left:10px solid transparent;left:20px;bottom:0px;}';
	        style+='.tz_jq_tips_left{border-top:10px solid transparent;right:0px;top:18px;}';
	        style+='.tz_jq_tips_bottom{border-left:10px solid transparent;left:20px;top:0px;}';
	        style+='.tz_jq_tips_right{border-top:10px solid transparent;left:0px;top:18px;}';
	        style+='.tz_jq_tips_info{word-wrap: break-word;word-break:normal;border-radius:4px;padding:5px 8px;max-width:130px;overflow:hidden;box-shadow:1px 1px 1px #999;font-size:12px;cursor:pointer;}';
	        style+='</style>';
	        $(document.body).append(style);
	    }
        this.each(function(){
            var element=$(this);
            var element_top=element.offset().top,element_left=element.offset().left,element_height=element.outerHeight(),element_width=element.outerWidth();
            options.side=options.side<1?1:options.side>4?4:Math.round(options.side);
            var sideName=options.side==1?'top':options.side==2?'right':options.side==3?'bottom':options.side==4?'left':'top';
            var tips=$('<div class="tz_jq_tips_box"><i class="tz_jq_tips_arrow tz_jq_tips_'+sideName+'"></i><div class="tz_jq_tips_info">'+options.msg+'</div></div>').appendTo(document.body);
            tips.find('.tz_jq_tips_arrow').css('border-'+sideName,'10px solid '+options.bg);
            tips.find('.tz_jq_tips_info').css({
                color:options.color,
                backgroundColor:options.bg
            });
            switch(options.side){
                case 1:
                    tips.css({
                        top:element_top-tips.outerHeight()+options.x,
                        left:element_left-10+options.y
                    });
                    break;
                case 2:
                    tips.css({
                        top:element_top-20+options.x,
                        left:element_left+element_width+options.y
                    });
                    break;
                case 3:
                    tips.css({
                        top:element_top+element_height+options.x,
                        left:element_left-10+options.y
                    });
                    break;
                case 4:
                    tips.css({
                        top:element_top-20+options.x,
                        left:element_left-tips.outerWidth()+options.y
                    });
                    break;
                default:
            }
            var closeTime;
            tips.fadeIn('fast').click(function(){
                clearTimeout(closeTime);
                tips.fadeOut('fast',function(){
                    tips.remove();
                })
            })
            if(options.time){
                closeTime=setTimeout(function(){
                    tips.click();
                },options.time*1000);
                tips.hover(function(){
                    clearTimeout(closeTime);
                },function(){
                    closeTime=setTimeout(function(){
                        tips.click();
                    },options.time*1000);
                })
            }
        });
        return this;
    };
	
   /**********************silder*****************************/
   for(i in document.images)document.images[i].ondragstart=function(){return false;};	
	$.fn.tzSlider = function(options){
		var opts = $.extend({},$.fn.tzSlider.methods,$.fn.tzSlider.defaults,options);
		$("body").data("opts",opts);
		this.each(function(){
			var optss = $.extend({},$("body").data("opts"),$.fn.tzSlider.optionAttr($(this)));
			opts.init($(this),optss);
		});
	};

	$.fn.tzSlider.methods = {
		init : function($slider,opts){
			this.template($slider,opts);
			//参数初始化
			this.params($slider,opts);
			//事件的初始化
			this.events($slider,opts);
		},

		template:function($slider,opts){
			if(opts.horizontal){
				$slider.addClass("tzui-slider tzui-slider-uhorizontal");
				if(opts.height)$slider.height(opts.height);
			}else{
				$slider.addClass("tzui-slider tzui-slider-horizontal");
				if(opts.width)$slider.width(opts.width);
			}
			if(opts.bgcolor){
				$slider.append("<div class='tzui-slider-range'></div>");
			}
			$slider.append("<a class='tzui-slider-handle' draggable='false' href='javascript:void(0);'></a>");
		},

		params : function($slider,opts){
			if(!opts.horizontal){
				var maxWidth = $slider.width();
				$slider.find(".tzui-slider-handle").css("left",(maxWidth * opts.percent)/100);
				if(opts.bgcolor)$slider.find(".tzui-slider-range").width(opts.percent+"%");
			}

			if(opts.horizontal){
				var maxHeight = $slider.height();
				$slider.find(".tzui-slider-handle").css("top",(maxHeight * opts.percent)/100);
				if(opts.bgcolor)$slider.find(".tzui-slider-range").height(opts.percent+"%");
			}
			
			if(!opts.silderColor){
				if(opts.randomcolor && opts.bgcolor){
					$slider.find(".tzui-slider-range").css("background",tzUtil.getRandomColor());
				}
			}else{
				$slider.find(".tzui-slider-range").css("background","#"+opts.silderColor);
			}
			
			if(opts.load)opts.load($slider,opts.percent);
		},

		silderX:function($this,e){
			var x= e.clientX;//获取当前鼠标按下去的x轴坐标，
			//拿滑块的距离
			var left = $this.offset().left;
			var nleft = x-left;
			var maxWidth = $this.width();
			//赋予滑块的新的left
			$this.find(".tzui-slider-handle").css("left",nleft);
			//计算百分比
			var percent =  Math.ceil((nleft/maxWidth)*100);
			$this.find(".tzui-slider-range").width(percent+"%");
		},

		silderY:function($this,e){
			var y= e.clientY;//获取当前鼠标按下去的x轴坐标，
			//拿滑块的距离
			var top = $this.offset().top;
			var ntop = y-top;
			var maxHeight = $this.height();
			//赋予滑块的新的left
			$this.find(".tzui-slider-handle").css("top",ntop);
			//计算百分比
			var percent =  Math.ceil((ntop/maxHeight)*100);
			$this.find(".tzui-slider-range").height(percent+"%");
		},

		events : function($slider,opts){
			var flag = false;
			//滑块事件绑定
			var obj = this;
			$slider.mousedown(function(e){
				if(!opts.horizontal)obj.silderX($(this),e);
				if(opts.horizontal)obj.silderY($(this),e);
			});

			//滑块拖动事件绑定
			$slider.find(".tzui-slider-handle").on("mousedown",function(e){
				flag = true;
				var $this = $(this);
				var x = e.clientX;//获取当前鼠标按下去的x轴坐标，
				var y = e.clientY;//获取当前鼠标按下去的y轴坐标，
				var left = $this.position().left;//获取元素的绝对位置left
				var top = $this.position().top;//获取元素的绝对位置top
				var maxWidth = $this.parent().width();//获取滑块宽度
				var maxHeight = $this.parent().height();//获取滑块高度
				var sliderWidth = $this.width();//获取小滑块的宽度
				var sliderHeight= $this.height();//获取小滑块的高度
				var percent = 0;
				var horizontalMark = opts.horizontal;
				$(document).on("mousemove",function(ev){
					if(flag){
						if(!horizontalMark){
							var nx = ev.clientX;
							var nleft = nx+left-x+(sliderWidth/2)-4 ;
							if(nleft<=0)nleft=0;
							if(nleft > maxWidth)nleft = maxWidth;
							$this.css({left:nleft});
							percent =  Math.ceil((nleft/maxWidth)*100);
							$slider.find(".tzui-slider-range").width(percent+"%");
						}else{
							var ny = ev.clientY;
							var ntop = ny+top-y+(sliderHeight/2)-4 ;
							if(ntop<=0)ntop=0;
							if(ntop > maxHeight)ntop = maxHeight;
							$this.css({top:ntop});
							percent =  Math.ceil((ntop/maxHeight)*100);
							$slider.find(".tzui-slider-range").height(percent+"%");
						}
					}
				}).on("mouseup",function(){
					flag = false;
					if(opts.callback)opts.callback($slider,percent);
				});
			}).on("mouseup",function(){
				flag = false;	
			});
		}
	};

	$.fn.tzSlider.optionAttr = function($slider){
		return {
			width:$slider.data("width"),
			height:$slider.data("height"),
			percent:$slider.data("percent"),
			bgcolor:$slider.data("bgcolor"),
			silderColor:$slider.data("sildercolor"),
			horizontal:	$slider.data("horizontal")
		};
	};

	$.fn.tzSlider.defaults = {
		bgcolor :true,
		percent:20,
		width:0,
		height:0,
		horizontal:true,
		randomcolor:true,
		silderColor:"",
		load:function($silder,percent){

		},
		callback:function($silder,percent){
		
		}
	};
	
	$.fn.tmTip = function(options){
		return this.each(function(){
			var opts = $.extend({},$.fn.tmTip.defaults,options,$.fn.tmTip.parseOptions($(this)));
			if(opts.event=='hover'){
				$(this).hover(function(){
					tipInit($(this),opts);
				},function(){
					if(opts.event!='click'){
						$('.tm-tips').remove();
					}
				});
			}
			
			if(opts.event=='click'){
				$(this).click(function(){
					tipInit($(this),opts);
				});
			}
			
			
			$(this).blur(function(){
				$('.tm-tips').remove();
			});
			/*.mouseleave(function(){
				$('.tm-tips').remove();
			});*/
		});
		
		function tipInit($this,opts){
			$('.tm-tips').remove();
			var content = opts.tip;
			if(opts.proxy)content = $this.find(opts.proxy).html();
			if(isEmpty(content))content = opts.title;
			if(isEmpty(content))content = $this.attr("placeholder");
			if(isEmpty(content))content = $this.text();
			if(isEmpty(content))content = "提示";
			$("body").append('<div class="tm-tips"><div class="tm-window-tip tooltip-nightly magictime tinRightIn"><div id="tm-tip-content"></div></div><div class="tooltip-nightly-arrow magictime tinUpIn"></div><div>');
			$('#tm-tip-content').css("textAlign",opts.contentAlign).html(content);//设置内容
			if(opts.width!=0){$(".tm-window-tip").css({width:opts.width});}/*设置高度如果高度设置为0：则为自动高度*/
			if(opts.height!=0){$(".tm-window-tip").css({height:opts.height});}/*设置高度如果高度设置为0：则为自动高度*/
			var _selfWidth = $(".tm-window-tip").width();//tip框的宽度
			var _selfHeight = $(".tm-window-tip").height();//tip框的高度
			var height = $this.height();/*元素自身高度*/
			var width = $this.width();/*元素自身宽度*/
			var offsetLeft = $this.offset().left;/*元素的相对左边距*/
			var offsetTop = $this.offset().top;/*元素的相对顶部距离*/
			var bodyWidth = $("body").innerWidth();
			var bodyHeight = $("body").innerHeight();
			var fixWidth = offsetLeft+_selfWidth+width;
			var fixHeight = offsetTop+_selfHeight+height;
			var left = 0;
			var top = 0;
			var arrowLeft = 0;
			var arrowTop = 0;
			
			/*如果offsetLeft=0的情况下*/
			if(offsetLeft==0 || offsetLeft<_selfWidth){
				if(opts.arrow=='rightTop')opts.arrow = "leftTop";
				if(opts.arrow=='rightMiddle')opts.arrow = "leftMiddle";
				if(opts.arrow=='rightBottom')opts.arrow = "leftBottom";
				if(opts.arrow=='topRight')opts.arrow = "topLeft";
				if(opts.arrow=='topMiddle')opts.arrow = "topLeft";
				if(opts.arrow=='bottomMiddle')opts.arrow = "bottomLeft";
				if(opts.arrow=='bottomRight')opts.arrow = "bottomLeft";
			}
			
			if(offsetTop==0 || offsetTop < _selfHeight){
				opts.arrow = "topMiddle";
			}
			
			if(fixWidth > bodyWidth ){
				if(opts.arrow=='topLeft')opts.arrow = "topRight";
				if(opts.arrow=='topMiddle')opts.arrow = "topRight";
				if(opts.arrow=='bottomMiddle')opts.arrow = "bottomRight";
				if(opts.arrow=='bottomLeft')opts.arrow = "bottomRight";
				if(opts.arrow=='leftTop')opts.arrow = "rightTop";
				if(opts.arrow=='leftMiddle')opts.arrow = "rightMiddle";
				if(opts.arrow=='leftBottom')opts.arrow = "rightBottom";
			}
			
			if(fixHeight > bodyHeight){
				opts.arrow = "bottomMiddle";
			}	
			
			
			if(opts.arrow=='topMiddle'){
				left = offsetLeft - _selfWidth/2+width/2  ;
				top = offsetTop+height+10;
				arrowLeft = offsetLeft+width/2-5 ;
				arrowTop = offsetTop +height-2;
			}
			
			if(opts.arrow=='topLeft'){
				left = offsetLeft + width/2;
				top = offsetTop+height+14;
				arrowLeft = offsetLeft+(width/2)+7;
				arrowTop = offsetTop +height+4;
			}
			
			if(opts.arrow=='topRight'){
				left = offsetLeft - _selfWidth+width/2;
				top = offsetTop+height+10;
				arrowLeft = offsetLeft+width/2-16;
				arrowTop = offsetTop +height ;
			}
			
			if(opts.arrow=='bottomLeft'){
				top = offsetTop-_selfHeight-13 ;
				left = offsetLeft +width/2;
				arrowLeft = offsetLeft+width/2+12 ;
				arrowTop = offsetTop-10;
			}
			
			if(opts.arrow=='bottomMiddle'){
				top = offsetTop-_selfHeight-16 ;
				left = offsetLeft - _selfWidth/2 +width/2 ;
				arrowLeft = offsetLeft+width/2-4 ;
				arrowTop = offsetTop-12;
			}
			
			if(opts.arrow=='bottomRight'){
				top = offsetTop-_selfHeight-13 ;
				left = offsetLeft -_selfWidth+width/2;
				arrowLeft = offsetLeft+width/2-18;
				arrowTop = offsetTop-10;
			}
			
			if(opts.arrow=='leftTop'){
				left = offsetLeft +width+14;
				top = offsetTop;
				arrowLeft = offsetLeft+width+2;
				arrowTop = offsetTop+12;
			}
			if(opts.arrow=='leftMiddle'){
				left = offsetLeft +width+12;
				top = offsetTop - _selfHeight/2+2;
				arrowLeft = offsetLeft+width-2;
				arrowTop = offsetTop;
			}
			if(opts.arrow=='leftBottom'){
				left = offsetLeft +width+12;
				top = offsetTop-_selfHeight+12;
				arrowLeft = offsetLeft+width;
				arrowTop = offsetTop-1;
			}
			
			if(opts.arrow=='rightTop'){
				left = offsetLeft -_selfWidth-16;
				top = offsetTop;
				arrowLeft = offsetLeft-12;
				arrowTop = offsetTop+14;
			}
			if(opts.arrow=='rightMiddle'){
				left = offsetLeft -_selfWidth-16;
				top = offsetTop - _selfHeight/2+2;
				arrowLeft = offsetLeft-12;
				arrowTop = offsetTop;
			}
			if(opts.arrow=='rightBottom'){
				left = offsetLeft -_selfWidth-16;
				top = offsetTop - _selfHeight;
				arrowLeft = offsetLeft-12;
				arrowTop = offsetTop-16;
			}
			if(!opts.hideArrow){
				$(".tooltip-nightly-arrow").addClass("tooltip-nightly-"+opts.arrow);
			}
			if(isEmpty(opts.arrow))opts.arrow = "bottomMiddle";
			var st = 2;
			opts.border = opts.border||"2px solid #333";
			opts.background = opts.background||"#333";
			$(".tooltip-nightly-arrow").addClass("tooltip-nightly-"+opts.arrow+"-black");
			$(".tooltip-nightly-arrow").css({left:(arrowLeft+opts.offLeft),top:(arrowTop+opts.offTop)});
			$(".tm-window-tip").css({left:left+"px",top:(top+st),opacity:1,border:opts.border,background:opts.background,color:opts.fontColor});
			$('.tm-tips').click(function(){
				$(this).remove();
			});
		}	
	};

	$.fn.tmTip.parseOptions = function($target) {
		return {
			width : $target.data("width"),
			height : $target.data("height"),
			tip : $target.attr("tip"),
			title:$target.attr("title"),
			event:$target.data("event"),
			arrow:$target.data("arrow"),
			offLeft:$target.data("offLeft"),
			offTop:$target.data("offTop"),
			background:$target.data("background"),
			border:$target.data("border"),
			color:$target.data("color"),
			proxy:$target.data("proxy")
		};
	};
	$.fn.tmTip.defaults ={
		width : 0,//宽度
		height : 0,//高度如果为0则为自动高度
		title:"",//如果tip为空用title
		event:"hover",//触发的事件类型
		arrow:"bottomMiddle",
		hideArrow:false,//是否隐藏方向箭头
		background:"",//设置背景
		border:"",//设置边框
		proxy:"",//异步
		tip : "",//内容
		contentAlign:"left",
		offLeft:0,//左部偏移
		offTop:0,//顶部移动
		color:"black"//
	};



	/********************tab***************************/
	$.fn.tzTab = function(options){
		var opts = $.extend({},$.fn.tzTab.methods,$.fn.tzTab.defaults,options);
		this.each(function(){
			var optss = $.extend({},opts,$.fn.tzTab.parseOptions($(this)));
			opts.init($(this),optss);
		});
	};

	$.fn.tzTab.methods = {
		init : function($tab,opts){
			$tab.addClass("tzui-tabs");
			var $ul = $("<ul class='tzui-tabs-nav'></ul>");
			var liHtml = "";
			var contentHtml = "";
			var jdata = opts.tabDatas;
			var length = jdata.length;
			var className = "tzui-state-default";
			
			if(opts.index==0 || opts.index>length)opts.index=0;//边界判断
			for(var i=0;i<length;i++){
				var classStyle = "display:none";
				if(opts.index == i){
					className="tzui-tabs-active tzui-state-active";
					classStyle="";
				}
				liHtml+= "<li tab='tab-"+i+"' data-url='"+jdata[i].url+"' class='"+className+"'><a href='javascript:void(0)' class='tzui-tabs-anchor'>"+jdata[i].title+"</a></li>";
				contentHtml+="<div id='tab-"+i+"' class='tzui-tabs-panel' style='"+classStyle+"'>"+jdata[i].content+"</div>";
				className = "";					
			}
			$ul.html(liHtml);
			$tab.append($ul);
			//面板内容
			$tab.append(contentHtml);
			if(opts.width)$tab.width(opts.width);
			if(opts.height)$tab.height(opts.height);
			if(opts.background){
				$tab.css("border","2px solid "+opts.background);
				$ul.css({"background":opts.background});
				$ul.find("li>a").filter(function(){
					if(!$(this).parent().hasClass("tzui-state-active")){
						$(this).css({"background":opts.background,"color":"#fff"});
					}
				});
			}

			if(opts.linear && opts.border){
				$tab.css("border","2px solid "+opts.border);
				$ul.css({"background":"linear-gradient("+opts.linear+")"});
				$ul.find("li>a").filter(function(){
					if(!$(this).parent().hasClass("tzui-state-active")){
						$(this).css({"background":"linear-gradient("+opts.linear+")","color":"#fff"});
					}
				});
			}

			$tab.find(".tzui-tabs-nav > li").on(opts.event,function(){
				var markFlag = $(this).hasClass("tzui-tabs-active");
				if(markFlag)return;
				var tab = $(this).attr("tab");
				$(this).addClass("tzui-tabs-active tzui-state-active").siblings().removeClass("tzui-tabs-active tzui-state-active");
				$tab.find(".tzui-tabs-panel").hide();
				var $content = $tab.find("#"+tab);
				$content.show();
				$(this).find("a").removeAttr("style");
				if(opts.linear && opts.border){
					$(this).siblings().find("a").css({"background":"linear-gradient("+opts.linear+")","color":"#fff"});
				}else{
					$(this).siblings().find("a").css({"background":opts.background,"color":"#fff"});
				}
				if(opts.callback)opts.callback($(this),$content);
				//当前元素解绑事件
			});

			
		}
	};

	$.fn.tzTab.parseOptions = function($target){
		var datas = $target.find(".data").text();
		var json = {
			width:$target.data("width"),//选项卡的宽度
			height:$target.data("height"),//选项卡的高度
			event:$target.data("event"),//选项卡的事件类型
			background:$target.data("background"),
			linear:$target.data("linear"),
			border:$target.data("border"),
			index:$target.data("index")//默认选择哪一个
		};
		if(datas)json["tabDatas"]=eval("("+datas+")");
		return json;
	};

	$.fn.tzTab.defaults = {
		width:600,//选项卡的宽度
		height:300,//选项卡的高度
		event:"click",//选项卡的事件类型
		background:"#4684b2",
		linear:"",
		border:"",
		index:2,//默认选择哪一个
		callback:function($current,$content){
			
		},
		tabDatas:[
			{title:"选项卡1",content:"士大夫收到111","url":"user.action"},
			{title:"选项卡2",content:"士大夫收到22222","url":"delete.action"},
			{title:"选项卡3",content:"选项卡3333"}
		]
	};


	/**********************drag***********************/
	$.fn.tzDrag = function(options){
		var opts = $.extend({},$.fn.tzDrag.methods,$.fn.tzDrag.defaults,options);
		this.each(function(){
			var optss = $.extend({},opts,$.fn.tzDrag.parseOptions($(this)));
			opts.init($(this),optss);	
		});
	};

	$.fn.tzDrag.methods = {
		init:function($dialog,opts){//层拖动
			var thisObj = this;
			var mark = false;
//			$dialog.css("position","absolute");
			var $dialogClone  = null;
			$dialog.on("mousedown",opts.handler,function(e){
				//镜像
				tzUtil.forbiddenSelect();
				if(opts.ghost)$dialogClone= thisObj.ghsot($dialog,opts);
				var $this = $(this).parent();

				if(!opts.handler){
					$this=$(this);
				}

				var x = e.clientX;
				var y = e.clientY;
				var left = $this.offset().left;
				var top = $this.offset().top;
				var w = $this.width();
				var h = $this.height();
				var offsetHeight = $this.parent().height() - h-2;
				//var offsetHeight = $(document).height() - h-2;
				var offsetWidth= $this.parent(). width() - w-2;
				var stop= $(window).scrollTop();
				var jsonData = {};
				jsonData.width=w;
				jsonData.height=h;
				mark = true;
				$(document).on("mousemove",function(e){
					if(mark){
						var nx = e.clientX;
						var ny = e.clientY;
						var nl = nx + left - x;
						var nt = ny + top - y - stop;
						if(nl<=0)nl=opts.sleft||1;
						if(nt<=0)nt=opts.stop||1;
						if(nl>=offsetWidth)nl = offsetWidth;
						if(nt>=offsetHeight)nt = offsetHeight;
						jsonData.left = nl;
						jsonData.top = nt;
						if(opts.ghost){
							$dialogClone.css({left:nl,top:nt});	
						}else{
							$this.css({left:nl,top:nt});	
						}
						if(opts.move)opts.move(jsonData,$this);
					}

				}).on("mouseup",function(){
					if(opts.ghost){
						$dialogClone.remove();
						$this.css({left:jsonData.left,top:jsonData.top});	
					}
					tzUtil.autoSelect();
					if(opts.up)opts.up($this);
					mark = false;
				});
			});
		},
		ghsot:function($dialog,opts){
			var $dialogClone = $dialog.clone();
			$dialogClone.html("") // 新增
			$dialogClone.css({"background":"none","opacity":0.5,"border":"1px dotted #ccc"}).find(".tzui-empty").empty();
			$("body").append($dialogClone);
			return $dialogClone;
		}	


	   };

	   $.fn.tzDrag.parseOptions = function($dialog){
			return {
				handler:$dialog.data("handler"),
				ghost:$dialog.data("ghost")
			};
	   };

	   $.fn.tzDrag.defaults = {
			handler:"",//拖动代理
			ghost:true,//是否产生镜像
			move:function(opts){
			},
			up:function(opts){
			}

	   };

})(jQuery);




//jquery插件的定义方式
var tzLoading = function(message,options){
	var opts = $.extend({},options);
	this.init(message,opts.timeout,opts);
};

tzLoading.prototype = {
	init : function(message,timeout,opts){
		var $loading = this.template(message,opts);
		if($loading){
			//定位	
			tzUtil._position($loading).resize($loading);
			//事件绑定
			this.events($loading,function(){
				if(opts.top)$loading.css("top",opts.top);
				if(opts.left)$loading.css("left",opts.left);
			});
			//时间关闭
			this.timeout($loading,timeout);
		}
	},
	
	template:function(content,opts){
		var $loading = $("#tzloading");
		if(content=="remove"){
			tzUtil.animates($loading,"slideUp");
			return;
		}
		if($loading.length==0){
			if(content=="remove"){
				tzUtil.animates($loading,"slideUp");
				return;
			}
			$loading = $("<div id='tzloading' class='tzui-loading "+tz_animateIn()+"'></div>");
			var $loadingGif = $("<div class='tzui-loading-gif'></div>");
			var $loadingContent = $("<div class='tzui-loading-cnt'></div>");
			$loadingContent.html(content);
			$loading.append($loadingGif).append($loadingContent);
			$("body").append($loading);
			if(opts.overlay){
				$("body").append("<div class='tzui-loading-overlay'></div>");
				$loading.next().click(function(){
					$(this).remove();
					$loading.trigger("click");
				});
			}
		}else{
			$loading.find(".tzui-loading-cnt").html(content);
		}
		
		if(opts.height)$loading.height(opts.height);
		return $loading;
	},

	events :function($loading,callback){
		$loading.click(function(){
			tzUtil.animates($(this),"slideUp",function(){
				if(callback)callback();
			});
		});
	},

	timeout:function($loading,timeout){
		var timr = null;
		if(isNotEmpty(timeout+"") && timeout >0){
			clearTimeout(timr);
			timr = setTimeout(function(){
				//事件的触发
				$loading.trigger("click");
			},timeout*500);
		}
	}
};

var loading = function(message,timeout,overlay){
	new tzLoading(message,{"timeout":timeout,overlay:overlay});
};


$.loading = function(options){
	var opts = $.extend({},$.loading.template,$.loading.defaults,options);
	var mark = Math.floor(Math.random() * 11);
	if(opts.random)opts.mark = mark;
	var $div = $(opts["t"+opts.mark]);
	$div.width(opts.width).height(opts.height);//.css("marginTop",(opts.target.height()/2-opts.height/2));
	//$div.find("*").css("background","green")
	opts.target.html($div);
};

$.loading.defaults = {
	width:36,
	height:36,
	random:true,
	mark:1
};

$.loading.template = {
	t1:"<div class='sk-cube-grid'>"+
		"      <div class='sk-cube sk-cube1'></div>"+
		"      <div class='sk-cube sk-cube2'></div>"+
		"      <div class='sk-cube sk-cube3'></div>"+
		"      <div class='sk-cube sk-cube4'></div>"+
		"      <div class='sk-cube sk-cube5'></div>"+
		"      <div class='sk-cube sk-cube6'></div>"+
		"      <div class='sk-cube sk-cube7'></div>"+
		"      <div class='sk-cube sk-cube8'></div>"+
		"      <div class='sk-cube sk-cube9'></div>"+
		"    </div>",
	t2:" <div class='sk-rotating-plane'></div>",
	t3:"<div class='sk-folding-cube'>"+
		"      <div class='sk-cube1 sk-cube'></div>"+
		"      <div class='sk-cube2 sk-cube'></div>"+
		"      <div class='sk-cube4 sk-cube'></div>"+
		"      <div class='sk-cube3 sk-cube'></div>"+
		"    </div>",
	t4:"<div class='sk-spinner sk-spinner-pulse'></div>",
	t5:"<div class='sk-wandering-cubes'>"+
	   "   <div class='sk-cube sk-cube1'></div>"+
	   "   <div class='sk-cube sk-cube2'></div>"+
	   "</div>",
	t6:"<div class='sk-wave'>"+
		"   <div class='sk-rect sk-rect1'></div>"+
		"   <div class='sk-rect sk-rect2'></div>"+
		"   <div class='sk-rect sk-rect3'></div>"+
		"   <div class='sk-rect sk-rect4'></div>"+
		"   <div class='sk-rect sk-rect5'></div>"+
		"</div>",
	t7:"<div class='sk-circle'>"+
		"   <div class='sk-circle1 sk-child'></div>"+
		"   <div class='sk-circle2 sk-child'></div>"+
		"   <div class='sk-circle3 sk-child'></div>"+
		"   <div class='sk-circle4 sk-child'></div>"+
		"   <div class='sk-circle5 sk-child'></div>"+
		"   <div class='sk-circle6 sk-child'></div>"+
		"   <div class='sk-circle7 sk-child'></div>"+
		"   <div class='sk-circle8 sk-child'></div>"+
		"   <div class='sk-circle9 sk-child'></div>"+
		"   <div class='sk-circle10 sk-child'></div>"+
		"   <div class='sk-circle11 sk-child'></div>"+
		"   <div class='sk-circle12 sk-child'></div>"+
		"</div>",
	t8:"<div class='sk-double-bounce'>"+
		"   <div class='sk-child sk-double-bounce1'></div>"+
		"   <div class='sk-child sk-double-bounce2'></div>"+
		" </div>",
	t9:"<div class='sk-chasing-dots'>"+
		"   <div class='sk-child sk-dot1'></div>"+
		"   <div class='sk-child sk-dot2'></div>"+
		"</div>",
	t10:"<div class='sk-three-bounce'>"+
		"  <div class='sk-child sk-bounce1'></div>"+
		"  <div class='sk-child sk-bounce2'></div>"+
		"  <div class='sk-child sk-bounce3'></div>"+
		"</div>",
	t11:"<div class='sk-fading-circle'>"+
		"	<div class='sk-circle1 sk-circle'></div>"+
		"	<div class='sk-circle2 sk-circle'></div>"+
		"	<div class='sk-circle3 sk-circle'></div>"+
		"	<div class='sk-circle4 sk-circle'></div>"+
		"	<div class='sk-circle5 sk-circle'></div>"+
		"	<div class='sk-circle6 sk-circle'></div>"+
		"	<div class='sk-circle7 sk-circle'></div>"+
		"	<div class='sk-circle8 sk-circle'></div>"+
		"	<div class='sk-circle9 sk-circle'></div>"+
		"	<div class='sk-circle10 sk-circle'></div>"+
		"	<div class='sk-circle11 sk-circle'></div>"+
		"	<div class='sk-circle12 sk-circle'></div>"+
		"</div>"
};


/*******************dialog**********************************/
//dialog的弹出层
$.tzConfirm = function(options){
	var opts = $.extend({},$.tzDialog.methods,$.tzDialog.defaults,options);
	opts.icon = opts.icon;
	/**
	 * 原来是opts.icon = "warn"，
	 * 为了在弹出层显示标签元素，所以将弹出层的图标样式进行修改，
	 * 默认图标样式是"success"，这里的是"warn",tzAlert也是如此
	 */
	opts.init(opts);
};

$.tzPrompt = function(options){
	var opts = $.extend({},$.tzDialog.methods,$.tzDialog.defaults,options);
	var $dialog = opts.init(opts);
	var mw= opts.width - 68;
	if(opts.textarea){
		var mh = opts.height - 120;
		$dialog.find(".tzdialog_message").html("<div style='width:"+mw+"px;margin:0 auto;text-align:left'>" +
				"<p><textarea class='dtext' autofocus='autofocus' style='overflow:auto;line-height:22px;font-size:12px;width:"+mw+"px;height:"+mh+"px;border:1px solid #ccc;' placeholder='请输入内容...'>"+opts.value+"</textarea></p></div>");
		
	}else{
		$dialog.find(".tzdialog_message").html("<div style='width:"+mw+"px;margin:0 auto;text-align:left'><p>&nbsp;&nbsp;"+opts.content+":</p>" +
				"<p><input type='text'  class='dtext' autofocus='autofocus' style='width:"+mw+"px;height:25px;text-indent:0.5em;border:1px solid #ccc;' value='"+opts.value+"' placeholder='请输入内容...'></p></div>");
	}
	$dialog.find(".tzdialog_message").find(".dtext").select();
	//这个确定按钮事件
	$dialog.find(".tzdialog_ok").off("click").on("click",function(){
		var $input = $dialog.find(".tzdialog_message").find(".dtext");
		var value = $input.val().trim();
		if(value==""){
			loading("请输入内容!",2);
			$input.select();
			return;
		}
		if(opts.validator($input)){
			if(opts.callback)opts.callback(value);//回调方法
			$dialog.next().remove();
			tzUtil.animates($dialog,opts.animate);
		}
	});
};


$.tzIframe = function(options){
	var opts = $.extend({},$.tzDialog.methods,$.tzDialog.defaults,options);
	var $dialog = opts.init(opts);
	$dialog.find(".tzdialog_message").html("<div  class='tm-dialog-loading tmWindow_loading'><img src='../css/images/loading.gif'><label style='font-size:12px;'>请稍后，正在加载中...</label></div>");
	var iframe=document.createElement("iframe");
	iframe.id = opts.dialogId+"_iframe";
	iframe.width="100%";
	iframe.height="100%";
	iframe.scrolling="no";
	iframe.frameborder ="0";
	var src = "";
	if(opts.content.indexOf("?")==-1){
		src = opts.content+"?window=true";
	}else{
		src = opts.content+"&window=true";
	}
	iframe.src=src;
	iframe.style.display ="none";
	$(iframe).attr("frameborder","0");
	var h = 42;
	if(!opts.showButton)h=42;
	$dialog.find(".tzdialog_message").height(opts.height-h).css("padding","0px").append(iframe);
	$(iframe).load(function(){
		$dialog.find(".tmWindow_loading").remove();
		iframe.style.display ="block";
		if(opts.loadSuccess)opts.loadSuccess(iframe.contentWindow);
	});
	$dialog.find(".tzdialog_ok").off("click").on("click",function(){
		if(opts.callback)opts.callback(iframe.contentWindow,$dialog,opts);
	});
};

$.tzDialog = {};

$.tzAlert = function(options){
	var opts = $.extend({},$.tzDialog.methods,$.tzDialog.defaults,options);
	opts.icon = opts.icon;
	/**
	 * 这里也可以这样写，
	 * opts.icon = opts.icon,
	 * 方便做业务的时候用，比如需要将数据展示在这个层上，
	 * 同时在这个层上需要进一步的业务操作,
	 * 默认使用的icon是success，调用的时候，icon滞空即可
	 * 同样，避免使用iframe可以减少很多的业务逻辑上的交互
	 */
	opts.init(opts);
	//var $dialog = opts.init(opts);
//	$dialog.find(".tzdialog_cancel").remove();
};

$.tzDialog.methods = {
	//初始化
	init:function(opts){
		var $dialog = this.template(opts);
		//弹出层事件初始化
		this.events($dialog,opts);
		this.params($dialog,opts);
		var btns = opts.buttons;
		for(var key in btns){
			$dialog.append("<a class='btns' href='javascript:void(0);'>"+key+"</a>&nbsp;&nbsp;");
		}
		$dialog.find("a.btns").click(function(){
			var text = $(this).text();
			btns[text].call($dialog);
		});	
		
		return $dialog;
	},
	params:function($dialog,opts){
		if(opts.width)$dialog.width(opts.width);
		if(opts.height){
			if(opts.height<=160)opts.height=160;
			$dialog.height(opts.height);
		}
		$dialog.find(".tzdialog_message").css({"textAlign":"center","lineHeight":opts.height-135+"px"}).height(opts.height-135);
		//弹出层居中
		tzUtil._position($dialog,1);
		//拖动事件的绑定
		if(opts.drag)$dialog.tzDrag({handler:".tzdialog_title","ghost":opts.ghost});
	},
	
	//弹出层的模板
	template : function(opts){
		var $dialog = $("<div class='tzui-dialog "+tz_animateIn(13)+"'>"+
		"		<h1 class='tzdialog_title'>"+opts.title+"</h1>" +
		"		<a href='javascript:void(0);' class='delete'><i class='fa fa-remove'></i></a>"+
		"		<div class='tzdialog_content tzui-empty'>"+
		"			<div class='tzdialog_message'>" +
		"			<span class='icon "+opts.icon+"'></span>" +
		"			<span class='content'>"+opts.content+"</span></div>"+
		"			<div class='tzdialog_panel'>"+
		"				<input type='button' value='&nbsp;"+opts.sureText+"&nbsp;' class='tzdialog_ok'> "+
		"				<input type='button' value='&nbsp;"+opts.cancelText+"&nbsp;' class='tzdialog_cancel'>"+
		"			</div>"+
		"		</div>"+
		"	</div>");
		$("body").append($dialog).append("<div class='tmui-overlay'></div>");
		if(!opts.showButton)$dialog.find(".tzdialog_panel").remove();
		return $dialog;
	},
	events:function($dialog,opts){
		//这个确定按钮事件
		$dialog.find(".tzdialog_ok").on("click",function(){
			if(opts.callback)opts.callback(true,$dialog,opts);//回调方法,这样操作的意义是将弹出层在return条件下依然保留在视图中
			/*$dialog.next().remove();
			tzUtil.animates($dialog,opts.animate);*/
		});

		//关闭按钮事件
		$dialog.find(".tzdialog_cancel,.delete").on("click",function(){
			if(opts.callback)opts.callback(false,$dialog,opts);//回调方法
			$dialog.next().remove();
			tzUtil.animates($dialog,opts.animate);
		});

		//响应事件
		var timer = null;
		$(window).resize(function(){
			clearTimeout(timer);
			timer = setTimeout(function(){tzUtil._position($dialog);},30);
		});
	}
};

//弹出层的默认参数
$.tzDialog.defaults = {
	width:272,//宽度
	handle:".tzdiaog_title",
	height:200,//高度
	title:"标题",//标题
	icon:"success",//默认图标样式
	drag:true,//拖拽
	ghost:true,//拖拽阴影
	textarea:false,//富文本框
	value:"",//input框值
	animate:"top",//点击关闭按钮往哪里消失
	showButton:true,//显示确定或者取消按钮
	cancelText:"取消",//按钮默认值
	sureText:"确定",//按钮默认值
	validator:function($input){
		return true;
	},//验证函数
	callback:function(ok, dialog, opts){
	},//回调函数
	content:"请输入内容..."//content
};

var ajaxTimeout = null;
$.tzAjax = {
	request : function(options,dataJson){
		var opts = $.extend({},{limit:true,before:function(){
		},error:function(){
			
		},callback:function(data){
			
		}},options);
		var _url = opts.url;
		if(isEmpty(_url)){
			_url = basePath+"/"+opts.model+"/"+opts.method;
		}
		if(isNotEmpty(opts.params)){
			_url+="&"+opts.params;
		}
		
		if(opts.limit){
			clearTimeout(ajaxTimeout);
			ajaxTimeout = setTimeout(function(){
				$.tzAjax.ajaxMain(opts,_url,dataJson);
			},200);
		}else{
			$.tzAjax.ajaxMain(opts,_url,dataJson);
		}
	},
	ajaxMain:function(opts,_url,dataJson){
		$.ajax({
			type:"post",
			data : dataJson,
			url : _url,
			beforeSend:function(){opts.before();},
			error:function(){loading("抱歉！因为操作不能够及时响应，请稍后在试...",1);opts.error();clearTimeout(ajaxTimeout);},
			success:function(data){
				if(data=="logout"){
					//loading("session超时,请登录...",4);
					//parent.window.location.href = rootPath+"/login";
					parent.$.tzIframe({drag:false,title:"",content:rootPath+"/loginDialog",showButton:false,width:340,height:460});
				}else if(data=="nopermission"){
					loading("非常抱歉,您没有权限...",4);
					parent.window.location.href = rootPath+"/error";
				}else{
					if(opts.callback)opts.callback(data);
				}
				clearTimeout(ajaxTimeout);
			}
		});
	}
};


$.tmCookie = {
	setCookie : function(name, value,time,option){
	    var str=name+'='+escape(value); 
	    var date = new Date();
	    date.setTime(date.getTime()+this.getCookieTime(time)); 
	    str += "; expires=" + date.toGMTString();
	    if(option){ 
	        if(option.path) str+='; path='+option.path; 
	        if(option.domain) str+='; domain='+option.domain; 
	        if(option.secure) str+='; true'; 
	    } 
	    document.cookie=str; 
	},
	
	getCookie : function(name){
		var arr = document.cookie.split('; '); 
	    if(arr.length==0) return ''; 
	    for(var i=0; i <arr.length; i++){ 
	        tmp = arr[i].split('='); 
	        if(tmp[0]==name) return unescape(tmp[1]); 
	    } 
	    return ''; 
	},
	
	delCookie : function(name){
		$.tmCookie.setCookie(name,'',-1); 
		var date=new Date();
        date.setTime(date.getTime()-10000);
		document.cookie=name+"=; expire="+date.toGMTString()+"; path=/";
	},
	
	getCookieTime : function(time){
	   if(time<=0)return time;
	   var str1=time.substring(1,time.length)*1;
	   var str2=time.substring(0,1);
	   if (str2=="s"){
	        return str1*1000;
	   }
	   else if (str2=="m"){
	       return str1*60*1000;
	   }
	   else if (str2=="h"){
		   return str1*60*60*1000;
	   }
	   else if (str2=="d"){
	       return str1*24*60*60*1000;
	   }
	}
};


$.tzConsole = (function(){
	var arr =[];
	var speed = 50;
	var wordbox = null;
	var c = "",index = 0,pos = 0;
	var strLen = 0,tlen =0;
	var row = 0;
	function setData(targetId,sp,data){
		arr = data;
		speed = sp||50;
		wordbox = document.getElementById(targetId);
		strLen = arr[0].length;
		tlen = arr.length; 
		start();
	}
	
	function start(){
		c='';
		row = Math.max(0,index-tlen);
		while(row < index){
			c += arr[row++] + '\r\n';
		}
		wordbox.innerText = c+arr[index].slice(0,pos)+"_"; 
		wordbox.scrollTop=wordbox.scrollHeight;
		if(pos==strLen){
			pos = 0;
			c = arr[index]+"\r\n";
			index ++;			
			if(index < tlen){
				strLen = arr[index].length;
				setTimeout(start,300);
			}else{
				wordbox.innerText = wordbox.innerText.replace("_","");
				}
			}else{
				pos++;
				setTimeout(start,speed);
			}
	}
	
	return {
		console:setData	
	};
})();

/**
 * 友情提示组件，从html的顶部出现
 * 使用方式：
	$.topTips({
		content:"文件删除成功！",
		controls : "warn",
		timer:2
	});
	
	参数说明：
	content：提示的内容
	controls：提示样式
		错误提示:err,
		警告提示:warn,
		成功提示：ok
	timer:显示和消失总体时间
 * @param $
 */
(function($){
	
	//接口
	$.topTips = function(options){
		var opts = $.extend({}, $.topTips.methods , $.topTips.default , options);
		opts.init(opts);
	}
	
	//方法
	$.topTips.methods = {
		
		//初始化方法
		init : function(opts){
			this.template(opts);
		},
		
		//模板
		template : function(opts){
			var $tips = $("#cool_top_tips");
			if($tips.html() == undefined){ //保证页面只有一个tips
				$tips= $("<div id='cool_top_tips' class='cool_top_tips cool_top_tip_"+opts.controls+"' style='top:-50px'><i class='cool_top_tip_icon'></i><span>"+opts.content+"</span></div>");
				$("body").append($tips);
				this.event($tips,opts);
			}else{
				var newName = $tips.attr("class").split(" ");
				for(var i=0;i<newName.length;i++){
					if(newName[i] == "cool_top_tip_ok" || newName[i] == "cool_top_tip_loading" || newName[i] == "cool_top_tip_warn" || newName[i] == "cool_top_tip_err"){
						$tips.removeClass(newName[i]);
					}
				}
				$tips.addClass("cool_top_tip_"+opts.controls);
				$tips.find("span").html(opts.content);
				this.event($tips,opts);//重新初始化事件
			}
			$tips.animate({top:0},500);
		},
		//设置居中
		setCenter : function($tips){
			var winw = $(window).width();
			//var winh = $(window).height();
			var lw = $tips.width();
			//var lh = $tips.height();
			var left = (winw - lw)/2;
			//var top = (winh - lh)/2;
			//$tips.css({left:left,top:top});	
			
			$tips.css({left:left});
			
		},
		
		//为tips绑定事件
		event : function($tips,opts){
			var _this = this;
			this.setCenter($tips);//设置居中
			$(window).resize(function(){
				_this.setCenter($tips);
			});
			
			$tips.timer = setTimeout(function(){
				clearTimeout($tips.timer);	
				$tips.animate({"top":-50},300);
			},opts.timer * 800);
			}
	};
	
	//默认配置模板
	$.topTips.default = {
		content:"请稍后，数据正在加载中...",//提示内容
		/*
		 	提示方式：
		 		ok ： 成功
		 		loading ：加载中
		 		warn ：警告
		 		err ： 网络连接错误
		 */
		controls : "loading",
		timer:1 //时间
	};
	
})(jQuery);