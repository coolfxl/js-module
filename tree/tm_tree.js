/*table tree*/
var treeBlankCount = 0;/*控制线的全局变量-*/
var tableTreeArr = [];
(function($) {
	var treeLineCount = 0;/*控制线的全局变量-*/
	var rootId = "";
	$.fn.tmTree = function(options) {
		return this.each(function() {
			var opts = $.extend( {}, $.fn.tmTree.defaults, $.fn.tmTree
					.parseOptions($(this)), options);
			init($(this), opts);
		});
	};
	
	var tree_zindex = 1;
	/*初始化方法*/
	function init($this, opts) {
		var root = "<div>";
		if (opts.showClose) {
			root += '<a style="text-decoration:underline;" class="tm-tree-close" href="javascript:void(0);">关闭</a>&nbsp;&nbsp;';
		}
		if (opts.expand) {
			root += '<a style="text-decoration:underline;" class="tm-tree-expand-down" href="javascript:void(0);">展开</a>&nbsp;&nbsp;<a  style="text-decoration:underline;" class="tm-tree-expand-up" href="javascript:void(0);">收起</a>';
		}
		root+="</div>";
		for ( var i = 0; i < opts.root.length; i++) {
			root += '<ul class="tree treeFolder">';
			var rootData = opts.root[i];
			var opid = rootData.opid;
			var parent = rootData.pid;
			var childJson = opts.children[parent];
			root += dateMessage("", treeLineCount, rootData,childJson, opts);
			root += "</ul>";
		}
		
		//树初始化
		$this.append(root);
		/*事件绑定*/
		initEvent($this, opts);
		/*其他事件*/
		tm_tree_line_icons($this, opts);
		if (opts.width != 0) {
			$this.width(opts.width + "px");
		}
		if (opts.height != 0) {
			$this.css( {height : opts.height + "px",overflow : "auto"});
		}
		if (opts.left != 0 && opts.top != 0) {
			$this.css( {left : opts.left,top : opts.top});
		}
		if (isNotEmpty(opts.border)) {
			$this.css("border", opts.border);
		}
	}

	function dateMessage(rid, treeLineCount, rootData, childrenData, opts) {
		var arrowTo = "";
		if (isEmpty(rootData.url))rootData.url = "javascript:void(0);";
		if (childrenData != undefined) {
			if (rid != "")rid = 'pid="' + rid + '"';
			var rootHTML = '<li id="tm-tree-' + rootData.opid + '" opid="' + rootData.opid + '" ' + rid + '>';
			if (isEmpty(opts.type)) {
				rootHTML += '<div class="">'
						+ getTreeLine(treeLineCount)
						+ '<div class="expandable"></div><div class="folder_expandable"></div><label class="tm-ui-tree-name" id="tm-tree-name-'
						+ rootData.opid + '"><a  href=' + rootData.url
						+ '  opid="' + rootData.opid + '" ' + rid + ' '+opts.elements+'>'
						+ rootData.name + '</a>'+opts.outhtml+'</label></div>';
			} else {
				rootHTML += '<div class="">'
						+ getTreeLine(treeLineCount)
						+ '<div class="expandable"></div><div class="folder_expandable"></div><div class="folder_'
						+ opts.type
						+ '_expandable"><span class="tm-tree-'+opts.type+'"  data-title="'+rootData.name+'"   opid="'
						+ rootData.opid
						+ '" '
						+ rid
						+ '></span></div><label class="tm-ui-tree-name" id="tm-tree-name-'
						+ rootData.opid + '"><a  href=' + rootData.url
						+ '  opid="' + rootData.opid + '" ' + rid + ' '+opts.elements+' data-name="' + rootData.name + '">'
						+ rootData.name + '</a>'+opts.outhtml+'</label></div>';
			}
			rootHTML += '<ul style="display:none;">';
			treeLineCount++;
			if(childrenData!=undefined){
				for ( var i = 0; i < childrenData.length; i++) {
					var cdata = opts.children[childrenData[i].pid];
					if (cdata != undefined) {
						rootId = rootData.opid;
						rootHTML += dateMessage( rootId, treeLineCount,childrenData[i], cdata, opts);//这里递归
					} else {
						if(isEmpty(childrenData[i].url))childrenData[i].url = "javascript:void(0);";
						if (isEmpty(opts.type)) {
							rootHTML += '<li id="tm-tree-'
									+ childrenData[i].opid
									+ '" opid="'
									+ childrenData[i].opid
									+ '" pid="'
									+ rootData.opid
									+ '"><div class="">'
									+ getTreeLine(treeLineCount)
									+ '<div class="node"></div><div class="file"></div><label class="tm-ui-tree-name"  id="tm-tree-name-'
									+ childrenData[i].opid + '"><a href='
									+ childrenData[i].url + '  opid="'
									+ childrenData[i].opid + '" pid="'
									+ rootData.opid + '" '+opts.elements+' data-name="' + childrenData[i].name + '">' + childrenData[i].name
									+ '</a>'+opts.outhtml+'</label></div></li>';
						} else {
							rootHTML += '<li id="tm-tree-'
									+ childrenData[i].opid
									+ '" opid="'
									+ childrenData[i].opid
									+ '" pid="'
									+ rootData.opid
									+ '"><div class="">'
									+ getTreeLine(treeLineCount)
									+ '<div class="node"></div><div class="file"></div><div class="file_'
									+ opts.type
									+ '"><span class="tm-tree-'+opts.type+'"   data-title="'+childrenData[i].name+'" opid="'
									+ childrenData[i].opid
									+ '" pid="'
									+ rootData.opid
									+ '"></span></div><label class="tm-ui-tree-name"  id="tm-tree-name-'
									+ childrenData[i].opid + '" ><a href='
									+ childrenData[i].url + '  opid="'
									+ childrenData[i].opid + '" pid="'
									+ rootData.opid + '" '+opts.elements+' data-name="' + childrenData[i].name + '">' + childrenData[i].name
									+ '</a>'+opts.outhtml+'</label></div></li>';
						}
					}
				}
				rootHTML += "</ul>";
				rootHTML += '</li>';
			}
			return rootHTML;
		} else {
			//根节点没有子节点
			if (isEmpty(opts.type)) {
				return '<li id="tm-tree-'
						+ rootData.opid
						+ '" class="last" opid="'
						+ rootData.opid
						+ '"><div class=""><div class="node"></div><div class="file"></div><label class="tm-ui-tree-name" id="tm-tree-name-'
						+ rootData.opid + '"><a href=' + rootData.url
						+ '  opid="' + rootData.opid + '" '+opts.elements+' data-name="' + rootData.name + '">' + rootData.name
						+ '</a>'+opts.outhtml+'</label></div></li>';
			} else {
				return '<li id="tm-tree-'
						+ rootData.opid
						+ '" class="last" opid="'
						+ rootData.opid
						+ '"><div class=""><div class="node"></div><div class="file"></div><div class="file_'
						+ opts.type
						+ '"><span class="tm-tree-'+opts.type+'" data-title="'+rootData.name+'"  opid="'
						+ rootData.opid
						+ '"></span></div><label class="tm-ui-tree-name" id="tm-tree-name-'
						+ rootData.opid + '"><a href=' + rootData.url
						+ '  opid="' + rootData.opid + '" '+opts.elements+' data-name="' + rootData.name + '">' + rootData.name
						+ '</a>'+opts.outhtml+'</label></div></li>';

			}
		}
	}

	/*通过全局变量linecount获取需要的线距*/
	function getTreeLine(numberLine) {
		var line = "";
		for ( var i = 0; i < numberLine; i++) {
			line += "<div class='line'></div>";
		}
		return line;
	}

	/*线和图标控制*/
	function tm_tree_line_icons($this, opts) {
		/*控制是否有图标*/
		if (!opts.icons) {
			$this.find(".folder_expandable").hide();
			$this.find(".file").hide();
		}
		/*控制是否有线*/
		if (!opts.line) {
			$this.find(".line").css("backgroundPosition", "0 -600px");
			$this.find(".node").css("backgroundPosition", "0 -600px");
		}
	}

	/*初始化事件*/
	function initEvent($this, opts) {
		$this.find(".remove").click(function(){
			var opid = $(this).parent().find("a").eq(0).attr("opid");
			if(opts.callback)opts.callback.call(this,opid);
		});
		
		
		$this.find(".first_collapsable").on("click",
		function() {
			if ($(this).hasClass("first_collapsable")) {
				$(this).removeClass("first_collapsable");
				$(this).addClass("expandable");
				$(this).parent().next().hide();
			} else {
				$(this).removeClass("expandable");
				$(this).addClass("first_collapsable");
				$(this).parent().next().show();
				/*是否互斥*/
				if (opts.exclusion) {
					$(this).parents("li").siblings().find(".first_collapsable").addClass("expandable");
					$(this).parents("li").siblings().find(".first_collapsable").parent().next().hide();
					$(this).parents("li").siblings().find(".first_collapsable").removeClass("first_collapsable");
				}
			}
		});

		$this.find(".expandable").on("click",function() {
			if ($(this).hasClass("first_collapsable")) {
				$(this).removeClass("first_collapsable");
				$(this).addClass("expandable");
				$(this).parent().next().hide();
			} else {
				$(this).removeClass("expandable");
				$(this).addClass("first_collapsable");
				$(this).parent().next().show();
				/*是否互斥*/
				if (opts.exclusion) {
					$(this).parents("li").siblings().find(".first_collapsable").addClass("expandable");
					$(this).parents("li").siblings().find(".first_collapsable").parent().next().hide();
					$(this).parents("li").siblings().find(".first_collapsable").removeClass("first_collapsable");
				}
			}
		});

		/*点击选中*/
		if (isNotEmpty(opts.to)) {
			$this.hide();
			var arr = new Array();
			var opidsArr = [];
			var namesArr = [];
			/*文本框事件绑定*/
			$("#" + opts.to).click(function() {
				var x = $(this).offset().left;
				var y = $(this).offset().top + $(this).outerHeight() + 1;
				var width = $(this).outerWidth();
				var val = $(this).val();
				$(this).blur();
				$this.css( {border : "1px solid #ccc",width : width,"position" : "absolute",left : x,top : y}).show();
				$this.find(".file").next(".tm-ui-tree-name").each(function() {
					if (val.indexOf($(this).text()) != -1) {
						$(this).addClass("tm_85C1E4");
					}
				});
			});
			
			/*子类选中定位事件*/
			if(opts.childrenSelected){
				/*事件绑定*/
				$this.find(".file").next(".tm-ui-tree-name").find("a").click(function(e) {
					tree_zindex ++;
					var opid = $(this).attr("opid");
					var pid = $(this).attr("pid");
					var name = $this.find("#tm-tree-name-" + opid).text();
					var pid = $this.find("#tm-tree-" + opid).attr("pid");
					var text = $(this).text();
					var pname = $this.find("#tm-tree-name-" + pid).text();
					if (isEmpty(pid))pid = opid;
					if (isEmpty(pname))pname = name;
					$(".tm-selected-floder").removeClass("tm-selected-floder");
					var data = {opid : opid,name : name,pid : pid,pname : pname};
					if(opts.ctrl){
						if (e.ctrlKey) {
							if(!$(this).parent().hasClass("tm_85C1E4")){
								arr.push(data);
								$(this).parent().addClass("tm_85C1E4");
							}else{
								arr.removeObject(text);
								namesArr.removeElement(text);
								opidsArr.removeElement(opid);
								$(this).parent().removeClass("tm_85C1E4");
							}
							for ( var i = 0; i < arr.length; i++) {
								var jsonData = arr[i];
								if ($.inArray(jsonData.name, namesArr) == -1) {
									opidsArr.push(jsonData.opid);
									namesArr.push(jsonData.name);
								}
							}
							opts.onclick($this, {opid : opidsArr.toString(),name : namesArr.toString(),pid : pid,pname : pname});
						} else {
							$(".tm-ui-tree-name").removeClass("tm_85C1E4");
							arr = new Array();
							opidsArr = new Array();
							namesArr = new Array();
							namesArr.push(name);
							opidsArr.push(opid);
							arr.push(data);
							$(this).parent().addClass("tm_85C1E4");
							opts.onclick($this, data);
						}
					}else{
						$(".tm-ui-tree-name").removeClass("tm_85C1E4");
						$(this).parent().addClass("tm_85C1E4");
						namesArr = new Array();
						opidsArr = new Array();
						namesArr.push(name);
						opidsArr.push(opid);
						arr.push(data);
						opts.onclick($this, data);
					}
				});
			}
			
			/*父类选中子类定位事件*/
			if(opts.parentSelected){
				tree_zindex++;
				$this.find(".folder_expandable").next(".tm-ui-tree-name").find("a").click(function(){
					alert(1);
					var opid = $(this).attr("opid");	
					var pname =  $(this).text();
					var $parent = $this.find("#tm-tree-"+opid);
					if(!$(this).hasClass("tm-selected-floder")){
						$parent.find(".folder_expandable").next(".tm-ui-tree-name").find("a").addClass("tm-selected-floder");
						$(this).addClass("tm-selected-floder");
						$parent.find("li").find(".file").next(".tm-ui-tree-name").find("a").each(function(){
							$(this).parent().addClass("tm_85C1E4");
							namesArr.push($(this).text());
							opidsArr.push($(this).attr("opid"));
						});
					}else{
						$(this).removeClass("tm-selected-floder");
						$parent.find(".folder_expandable").next(".tm-ui-tree-name").find("a").removeClass("tm-selected-floder");
						$parent.find("li").find(".file").next(".tm-ui-tree-name").find("a").each(function(){
							$(this).parent().removeClass("tm_85C1E4");
							namesArr.removeElement($(this).text());
							opidsArr.removeElement($(this).attr("opid"));
						});
					}
					opts.onclick($this, {opid : $.tmArray.unique(opidsArr).toString(),name : $.tmArray.unique(namesArr).toString(),pid : opid,pname : pname});
				});
			}
			
			
			$this.mouseleave(function(){
				$this.hide();
			});
			
			$this.css("zIndex",tree_zindex);
		}else{
			$this.find(".folder_expandable").next(".tm-ui-tree-name").find("a").click(function(){
				if(isNotEmpty(opts.selectClass)){
					$(".tm-ui-tree-name").find("a").removeClass(opts.selectClass);
					$(this).addClass(opts.selectClass);
				}	
				var opid = $(this).attr("opid");
				var name = $(this).text();
				var pid = $this.find("#tm-tree-" + opid).attr("pid");
				var pname = $this.find("#tm-tree-name-" + pid).text();
				if (isEmpty(pid))pid = opid;
				if (isEmpty(pname))pname = name;
				var data = {opid : opid,name : name,pid : pid,pname : pname};
				opts.onclick($this,data);
			});
			
			$this.find(".file").next(".tm-ui-tree-name").find("a").click(function() {
				if(isNotEmpty(opts.selectClass)){
					$(".tm-ui-tree-name").find("a").removeClass(opts.selectClass);	
					$(this).addClass(opts.selectClass);
				}	
				var opid = $(this).attr("opid");
				var name = $(this).text();
				var pid = $this.find("#tm-tree-" + opid).attr("pid");
				var pname = $this.find("#tm-tree-name-" + pid).text();
				if (isEmpty(pid))pid = opid;
				if (isEmpty(pname))pname = name;
				var data = {opid : opid,name : name,pid : pid,pname : pname};
				opts.onclick($this,data);
			});	
			
		}
		
		$this.click(function(){
			tree_zindex++;
			$this.css("zIndex",tree_zindex);
		});
		/*只限制于子类点击按住ctrl多选*/

		//是否采用右键
		if (opts.rightMenu) {
			$this.find(".tm-ui-tree-name").attr("menu","tm-tree-menu");
			//$this.find(".tm-ui-tree-name").find("*").attr("menu","tm-tree-menu");
			var $menu = $this.find(".tm-ui-tree-name").attr("menu");
			var params = {};
			if($menu){
				$this.find("a").contextmenu(function(e){
					var $opTarget = $(this);//当前右键菜单对象
					var event = e || event;
					var pid = $(this).attr("pid");//选中节点的父级id
					var opid = $(this).attr("opid");//选中节点的id
					var name = $(this).text();//选中节点的名字
					if(pid){
						params["pid"] = pid;
					}
					if(opid){
						params["opid"] = opid;
					}
					if(name){
						params["name"] = name;
					}
					
					var tz_right_menu = $("#tm-right-menu-box");
					if(tz_right_menu){
						$(document).find("body").find("#tm-right-menu-box").remove();
					}
					
					$(document).find("body").append("<div id='tm-right-menu-box'>"+
					"<ul id='tm-right-menu'>"+
					"			    <li data-model='add'><em class='tm-right-menu-plus'></em><a href='javascript:;'>添加</a></li>"+
					"			    <li data-model='edit'><em class='tm-right-menu-edit'></em><a href='javascript:;'>编辑</a></li>"+
					"			    <li data-model='delete'><em class='tm-right-menu-delete'></em><a href='javascript:;'>删除</a></li>"+
					"			    <li data-model='cancel'><em class='tm-right-menu-cancel'></em><a href='javascript:;'>取消</a></li>"+
					"			</ul>"+
					"</div>");
					$("#tm-right-menu-box").css({"display":"block", "left": getXY(event)["x"], "top": getXY(event)["y"]});
					$("#tm-right-menu-box").find("li").each(function(){
						$(this).off().on("click", function(){
							var model = $(this).data("model");
							if(opts.callback){
								opts.callback($opTarget, params, model);
							}
							//console.log($(this).text()+"=="+jsonToString(params));
							//如果有回调函数，那么就执行回调函数的内容，然后这个样式消失，这时候就不用阻止冒泡
							//stopBubble();
						});
					});
					return false;
				});
			}
			//点击文档右键菜单消失
			$(document).click(function(){
				$("#tm-right-menu-box").css("display", "none");
			});
			
			
		};

		/*高亮*/
		$this.find(".tm-ui-tree-name").hover(function() {
			$(this).addClass("tm_ccc");
		}, function() {
			$(this).removeClass("tm_ccc");
		});

		/*展开收起*/
		$this.find(".tm-tree-expand-down").on("click", function() {
			$this.find(".expandable").addClass("first_collapsable");
			$this.find(".expandable").removeClass("expandable");
			$this.find("ul").show();
		});

		$this.find(".tm-tree-expand-up").on("click", function() {
			$this.find(".first_collapsable").addClass("expandable");
			$this.find(".first_collapsable").removeClass("first_collapsable");
			$this.find("ul").hide();
			$this.find(".tree").show();
		});

		/*关闭*/
		$this.find(".tm-tree-close").on("click", function() {
			$this.hide();
		});

		/*展开第几个节点*/
		if (isNotEmpty(opts.expandCount) && opts.expandCount != 0) {
			var $li = $this.find(".tree").children("li").eq(
					(opts.expandCount - 1));
			$li.find("ul").show();
			$li.find(".expandable").addClass("first_collapsable");
			$li.find(".expandable").removeClass("expandable");
		}

		/*
		  .tm-tree-checkbox:最初没有选中状态
		 * tm-tree-checkbox-focus:半选状态
		 * tm-tree-checkbox-checked:选中状态
		 */
		if(!opts.isRadio){
			$this.find(".tm-tree-"+opts.type).click(function() {
				var opid = $(this).attr("opid");
				var pid = $(this).attr("pid");
				var $parent = $this.find("#tm-tree-" + opid);
				var $parents = $this.find("#tm-tree-" + pid);
				if (!$(this).hasClass("tm-tree-"+opts.type+"-checked")) {
					$(this).addClass("tm-tree-"+opts.type+"-checked");
					$parent.each(function() {
						$(this).find(".tm-tree-"+opts.type).addClass("tm-tree-"+opts.type+"-checked");
					});
					$(this).parents("li").each(function() {
						var $p = $(this);
						var len = $p.find(".tm-tree-"+opts.type).length;
						var clen = $p.find(".tm-tree-"+opts.type+"-checked").length;
						if (len != (clen + 1)) {
							$p.find(".tm-tree-"+opts.type).first().addClass("tm-tree-"+opts.type+"-focus");
						} else {
							$p.find(".tm-tree-"+opts.type).first().addClass("tm-tree-"+opts.type+"-checked");
						}
					});
				} else {
					$(this).removeClass("tm-tree-"+opts.type+"-focus").removeClass("tm-tree-"+opts.type+"-checked");
					$parent.each(function() {
						$(this).find(".tm-tree-"+opts.type).removeClass("tm-tree-"+opts.type+"-focus").removeClass("tm-tree-"+opts.type+"-checked");
					});
	
					$(this).parents("li").each(function() {
						var $p = $(this);
							var len = $p.find(".tm-tree-"+opts.type).length;
							var clen = $p.find(".tm-tree-"+opts.type+"-checked").length;
							if (clen != 0) {
								$p.find(".tm-tree-"+opts.type).first().removeClass("tm-tree-"+opts.type+"-checked").addClass("tm-tree-"+opts.type+"-focus");
							} else {
								$p.find(".tm-tree-"+opts.type).first().removeClass("tm-tree-"+opts.type+"-focus").removeClass("tm-tree-"+opts.type+"-checked");
							}
						});
				}
				
				
				//元素值获取的返回
				var chkOpidArr = [];
				var chkNameArr = [];
				var focusOpidArr = [];
				var focusNameArr = [];
				$this.find(".tm-tree-"+opts.type+"-checked").each(function(){
					var name = $(this).parent().next().text();
					chkOpidArr.push($(this).attr("opid"));
					chkNameArr.push(name);
				});
				
				$this.find(".tm-tree-"+opts.type+"-focus").each(function(){
					var name = $(this).parent().next().text();
					chkOpidArr.push($(this).attr("opid"));
					chkNameArr.push(name);
					focusOpidArr.push($(this).attr("opid"));
					focusNameArr.push(name);
				});
				
				var checkedArr = {opid:$.tmArray.unique(chkOpidArr).toString(),name:$.tmArray.unique(chkNameArr).toString()};
				var focusArr = {opid:focusOpidArr.toString(),name:focusNameArr.toString()};
				var data = {"checkArr":checkedArr,"focusArr":focusArr};
				if(opts.onclick)opts.onclick($(this),data);
			});
		}else{
			//raido互斥
			$this.find(".tm-tree-"+opts.type).click(function(){
				var opid = $(this).attr("opid");
				var pid = $(this).attr("pid");
				var name = $(this).parent().next().text();
				var $parent = $this.find("#tm-tree-" + opid);
				var $parents = $this.find("#tm-tree-" + pid);
				$this.find(".tm-tree-"+opts.type).removeClass("tm-tree-"+opts.type+"-checked");
				$(this).addClass("tm-tree-"+opts.type+"-checked");
				var pname = $this.find("#tm-tree-name-" + pid).text();
				if(isEmpty(pname))pname = name;
				if(isEmpty(pid))pid = opid;
				var data = {opid:opid,name:name,pid:pid,pname:pname};
				opts.onclick($(this),data);
			});
			
		}
		
		$this.find(".tm-ui-tree-name").click(function(){
			$(this).prev().find("span").trigger("click");
		});
		if(opts.iconFolder){
			$(".file").addClass("folder_expandable");
			$(".folder_expandable").removeClass("file");
		}
		
		if(opts.iconFile){
			$(".folder_expandable").addClass("file");
			$(".file").removeClass("folder_expandable");
		}
		
		
		
	};

	$.fn.tmTree.parseOptions = function($target) {
		return {
			width : $target.attr("width"),
			height : $target.attr("height")
		}
	};

	$.fn.tmTree.methods = {
		remove : function($this) {
			$this.remove();
		}
	}

	function tm_window_posXY(event) {
		event = event || window.event;
		var posX = event.pageX
				|| (event.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft));
		var posY = event.pageY
				|| (event.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
		return {
			x : posX,
			y : posY
		};
	};
	
	//获取鼠标的位置。兼容ie678
	function getXY(e){
		var ev = e || window.event;
		var x=0,y=0;
		if(ev.pageX){
			x = ev.pageX;
			y = ev.pageY;
		}else{
			//拿到scrollTop 和scrollLeft
			var sleft = 0,stop = 0;
			//ie678---
			if(document.documentElement){
				stop =document.documentElement.scrollTop;
				sleft = document.documentElement.scrollLeft;
			}else{
			//ie9+ 谷歌 
				stop = document.body.scrollTop;
				sleft = document.body.scrollLeft;
			}	
			x = ev.clientX + sleft;
			y = ev.clientY + stop;
		}
		return {x:x,y:y};
	};

	$.fn.tmTree.defaults = {
		root : [ 
			{name : "主题框架",url : "",opid : 1,pid : "root1"}, 
			{name : "主题框架2",url : "",opid : 2,pid : "root2"}, 
			{name : "主题框架3",url : "",opid : 3,pid : "root3"}, 
			{name : "主题框架4",url : "",opid : 4,pid : "root4"}, 
			{name : "主题框架5",url : "",opid : 5,pid : "root5"}, 
			{name : "主题框架6",url : "",opid : 6,pid : "root6"} 
		],
		
		children : {
			root1 : [ {
				name : "框架11",
				url : "javascript:void(0);",
				opid : 11,
				pid : "c11"
			}, {
				name : "框架12",
				url : "javascript:void(0);",
				opid : 12,
				pid : "root12"
			}, {
				name : "框架13",
				url : "javascript:void(0);",
				opid : 13,
				pid : "root13"
			} ],
			root2 : [ {
				name : "框架21",
				url : "javascript:void(0);",
				opid : 21,
				pid : "root21"
			}, {
				name : "框架22",
				url : "javascript:void(0);",
				opid : 22,
				pid : "root22"
			}, {
				name : "框架23",
				url : "javascript:void(0);",
				opid : 23,
				pid : "root23"
			} ],
			root3 : [ {
				name : "框架31",
				url : "javascript:void(0);",
				opid : 31,
				pid : "root31"
			}, {
				name : "框架32",
				url : "javascript:void(0);",
				opid : 32,
				pid : "root32"
			}, {
				name : "框架33",
				url : "javascript:void(0);",
				opid : 33,
				pid : "root33"
			} ],
			root4 : [ {
				name : "框架41",
				url : "javascript:void(0);",
				opid : 41,
				pid : "root41"
			}, {
				name : "框架32",
				url : "javascript:void(0);",
				opid : 42,
				pid : "root42"
			}, {
				name : "框架33",
				url : "javascript:void(0);",
				opid : 43,
				pid : "root43"
			} ],
			c11 : [ {
				name : "框架111",
				url : "javascript:void(0);",
				opid : 111,
				pid : "root111"
			}, {
				name : "框架112",
				url : "javascript:void(0);",
				opid : 112,
				pid : "root112"
			}, {
				name : "框架113",
				url : "javascript:void(0);",
				opid : 113,
				pid : "root113"
			} ],
			root111 : [ {
				name : "框架1111",
				url : "javascript:void(0);",
				opid : 1111,
				pid : "root1111"
			}, {
				name : "框架1112",
				url : "javascript:void(0);",
				opid : 1112,
				pid : "root1112"
			}, {
				name : "框架1113",
				url : "javascript:void(0);",
				opid : 1113,
				pid : "root1113"
			} ],
			root1111 : [ {
				name : "人文",
				url : "javascript:void(0);",
				opid : 11111,
				pid : "root11111"
			}, {
				name : "地理",
				url : "javascript:void(0);",
				opid : 11112,
				pid : "root11112"
			}, {
				name : "经典歌曲",
				url : "javascript:void(0);",
				opid : 11113,
				pid : "root11113"
			} ],
			root5 : [ {
				name : "框架15",
				url : "javascript:void(0);",
				opid : 15,
				pid : "root15"
			}, {
				name : "框架25",
				url : "javascript:void(0);",
				opid : 25,
				pid : "root25"
			}, {
				name : "框架35",
				url : "javascript:void(0);",
				opid : 35,
				pid : "root35"
			} ]
		},
		elements : "",
		selectClass:"",
		exclusion : true,/*根节点同时点击是否互斥*/
		rightMenu : false,
		expand : false,//是否显示展开和收起
		expandCount : 1,//展示第几个节点
		showClose : false,//是否显示关闭
		type : "",//
		outhtml:"",// 额外扩展元素在文字
		iconFolder:false,
		iconFile:false,
		icons : true,//控制是否显示图标
		line : true,//控制是否显示线
		left : 0,
		top : 0,
		width : 0,
		height : 0,
		isRadio:false,
		childrenSelected:false,/*控制只能选择子类*/
		parentSelected:false,/*控制父类选中所有子类不包含自身*/
		to : "",//目标元素
		ctrl:false,//目标子元素是否支持多选,和to结合使用
		border : "",//给外边框加线
		onclick : function($obj,data) {//触发点击事件以后回调返回的函数
			
		},
		callback : function($opTarget, params, model){
			
		}

	};
	$.tmTree = {
		_expand : function(pid,obj,e){
			tableTreeArr = [];
			var $this = $(obj);
			var $root = $("#tm_items_"+pid);
			var isOpen = $root.attr("isOpen");
			var isRoot = $root.attr("isRoot");
			if(isRoot==1)treeBlankCount=0;
			if(isOpen==0){ 
				$this.attr("src","../../images/treetable/minus.gif");
				$root.attr("isOpen",1);
    			var len = $(".tm_children_"+pid).length;
    			if(len==0)$this.parents("tr").after(this._initChildren(pid));$.tmTable._init();
				$(".tm_children_"+pid).show();
			}else{
				$this.attr("src","../../images/treetable/plus.gif");
				$root.attr("isOpen",0);
				this._childrenHide(pid);
			}
			//tm_tree_callback(obj,pid,e);
			stopBubble(e);
		},
		_childrenHide : function(pid){
			var childrenArr = this._getAllChlidren(pid);
			if(childrenArr.length>0){
				for(i=0;i<childrenArr.length;i++){
					var node = $("#tm_items_"+childrenArr[i]);
					$(".tm_children_"+childrenArr[i]).hide();
					if(isNotEmpty(node.attr("isOpen")) && node.attr("isOpen")==1){
						node.attr("isOpen",0);
						$("#tm_items_expand_"+childrenArr[i]).attr("src","../../images/treetable/plus.gif");
					}
				}
			}
			
		},
		_initTableTree : function(options){
			var opts = $.extend({target:$("#tm_tbody")},options);
			opts.target.data("treeTableData",opts);
			opts.target.html(this._initRoot());
			$.tmTable._init();
			this._initMethod(opts);
		},
		_initMethod : function(opts){
			if(isNotEmpty(opts.type)){
				$(".tm_tree_box").find(".tm-icon").before("<input type='"+opts.type+"'/>&nbsp;");
			}
		},
		_initRoot : function(){
			var html = "";
			var n =1;
			for(var i=0;i<root.length;i++,n++){
				var data = root[i];
				var chhtml = "<img id=\"tm_items_expand_"+data.pid+"\"  class=\"tm-icon\" style=\"CURSOR: pointer;\"  onclick=\"$.tmTree._expand("+data.pid+",this,event);\" src=\"../../images/treetable/plus.gif\"><img style=\"position: relative;top:2px;\"  src=\"../../images/treetable/fshut.gif\">";
				if(isEmpty(children[data.pid])){//在子类中找不到就不显示收起和展开节点了。
					chhtml = "<img class=\"tm_tree_leaf tm-icon \"  src=\"../../images/treetable/leaf.gif\">";
				}
    			html+="<tr id=\"tm_items_"+data.opid+"\" isStatus=\""+data.publishFlag+"\" parentId=\""+data.parentId+"\"  opid=\""+data.opid+"\" isRoot=\"1\"  title=\""+data.name+"\" isOpen=\"0\" class=\"tm-items\">"+
				"<td></td>"+
				"<td><span class=\"tm_sort\">"+n+"</span></td>"+
				"<td>"+chhtml+"<a href=\"javascript:void(0)\" class=\"tmui-name\">"+data.name+"</a></td>"+
				"<td><span class=\"tm_publish\">"+data.publish+"</span></td>"+
				"<td><span class=\"tmui-buttons none\" style=\"position: relative;left: 15px;\" >"+
				"<a href=\"javascript:void(0)\" opid=\""+data.opid+"\" onclick=\"$.tmChannel._edit(this)\"><img src=\"../../images/admin/edit.png\" height=\"12\" /></a>&nbsp;&nbsp;&nbsp;&nbsp;"+
				"<a href=\"javascript:void(0)\" opid=\""+data.opid+"\" onclick=\"$.tmTable._delete(this)\"><img src=\"../../images/admin/delete.png\" height=\"12\"></a>"+
				"</span>"+
				"</td>"+
				"</tr>";
			}
			return html;
		},
		_initChildren : function(pid){
			var html = "";
			if(children){
				var childrenArr = children[pid];
				if(childrenArr.length>0){
					var n = 1;
	    			treeBlankCount++;
					for(var i=0;i<childrenArr.length;i++,n++){
						var data =childrenArr[i]; 
						var chhtml = "<img id=\"tm_items_expand_"+data.pid+"\" style=\"CURSOR: pointer;\" class=\"tm-icon\" onclick=\"$.tmTree._expand("+data.pid+",this,event);\" src=\"../../images/treetable/plus.gif\"><img style=\"position: relative;top:2px;\" src=\"../../images/treetable/fshut.gif\">";
	    				if(isEmpty(children[data.pid])){//在子类中找不到就不显示收起和展开节点了。
	    					chhtml = "<img class=\"tm_tree_leaf tm-icon\"  src=\"../../images/treetable/leaf.gif\">";
	    				}
						html+="<tr id=\"tm_items_"+data.opid+"\" isStatus=\""+data.publishFlag+"\"  parentId=\""+data.parentId+"\" opid=\""+data.opid+"\" title=\""+data.name+"\" class=\"tm-items tm-items-children tm_children_"+pid+"\">"+
						"<td></td>"+
						"<td><span class=\"tm_sort\">"+this._getTreeLine(treeBlankCount)+n+"</span></td>"+
						"<td>"+this._getTreeLine(treeBlankCount)+chhtml+"<a href=\"javascript:void(0)\" class=\"tmui-name\">"+data.name+"</a></td>"+
						"<td><span class=\"tm_publish\">"+data.publish+"</span></td>"+
						"<td _td_pro=\"rd\"><span class=\"tmui-buttons none\" style=\"position: relative;left: 15px;\" >"+
						"<a href=\"javascript:void(0)\" opid=\""+data.opid+"\" onclick=\"$.tmChannel._edit(this)\"><img src=\"../../images/admin/edit.png\" height=\"12\" /></a>&nbsp;&nbsp;&nbsp;&nbsp;"+
						"<a href=\"javascript:void(0)\" opid=\""+data.opid+"\" onclick=\"$.tmTable._delete(this)\"><img src=\"../../images/admin/delete.png\" height=\"12\"></a>"+
						"</span>"+
						"</td>"+
						"</tr>";
					}
				}
			}
			return html;
		},
		_getTreeLine : function(numberLine) {
			var line = "";
			for ( var i = 0; i < numberLine; i++) {
				line += "<img src=\"../..//images/treetable/blank.gif\">";
			}
			return line;
		},
		_getAllChlidren : function(pid){
			tableTreeArr.push(pid);
			var childrenArr = children[pid];
			if(isNotEmpty(childrenArr) && childrenArr.length>0){
				for(var i=0;i<childrenArr.length;i++){
					this._getAllChlidren(childrenArr[i].pid);
					tableTreeArr.push(childrenArr[i].pid);
				}
			}
			return tableTreeArr;
		}
	}
	
	
})(jQuery)

/*右键菜单*/
//function tm_tree_selected(obj, opid) {
//	var pid = $("#tm-tree-" + opid).attr("pid");
//	var pname = $("#tm-tree-name-" + pid).text();
//	myHomeInitLoading("你当前选中的【opid】是：" + opid + ",名称是："
//			+ $("#tm-tree-name-" + opid).text()
//			+ "&nbsp;&nbsp;<br/><br/>父类pid是：" + pid + ",父名称是：" + pname);
//}
//
///*获取子类*/
//function tm_tree_children_selected(obj, opid, mark) {
//	var $this = $("#tm-tree-" + opid);
//	var opidArr = [];
//	if (mark == 'self')
//		opidArr.push(opid);
//	$this.find("ul").find("li").each(function() {
//		if ($(this).attr("pid") == opid) {
//			opidArr.push($(this).attr("opid"));
//		}
//	});
//	myHomeInitLoading("子类ID有：" + opidArr.toString());
//}
//
//function tm_tree_childrens_selected(obj, opid, mark) {
//	var $this = $("#tm-tree-" + opid);
//	var opidArr = [];
//	if (mark == 'self')
//		opidArr.push(opid);
//	$this.find("ul").find("li").each(function() {
//		opidArr.push($(this).attr("opid"));
//	});
//	myHomeInitLoading("所有子类ID有：" + opidArr.toString());
//}
///*右键删除子类*/
//function tm_tree_remove(obj, opid) {
//	$("#tm-tree-" + opid).remove();
//}
