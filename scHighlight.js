/**
 *	Name		: 	scHightlight 
 *	Include		: 	scHighlight.js,scHighlight.css
 * 	Function	: 	make your sourcecodes highlight on you web
 *	Description	: 	it's very easy to use,you just include the two files of scHighlight.js 
 				and scHighlight.css in the <head></head> tag of you html files,just like this:
					<script type="text/javascript" src="jquery-1.10.1.js"></script>
					<link rel="stylesheet" type="text/css" href="scHighlight.css">
					<script type="text/javascript" src="scHighlight.js"></script>
 				besides you just need to modify the 
 				scHighlight.css file if you want another style sheet.
 *	Author		: 	PheonixHkbxoic,email:hkbxoic@gmail.com
 *	Date		: 	2016/4/9-2016/4/10
 *	Version		: 	sch_v1.0
 *
 */
$(document).ready(function()
{
	var pre = $('pre');
	//通用单词
	var kw_common = [
					"main","alert","args","String","List","Set","ArrayList","File","util",
					"System","out","print","println","java","lang","Math","param", "response", 
					"response","throw", "ServletException", "throws", "IOException", "javax",
					"HttpServletRequest", "request,", "HttpServletResponse", "response",
					"Exception","session","httpsession","application","org","apache","io",
					"FileOutputStream","OutputStream","InputStream","FileInputStream","servlet",
					"http","commons","fileupload","FileItem","FileUploadException","makedirs"
					];
	//java关键字
	var kw_java	= [
					"abstract",	"boolean",	"break ",	"byte",		"case",		"implements",
					"catch",	"char",		"class",	"continue",	"default",	"do",  
					"double",	"else",		"extends",	"false",	"final",	"finally ", 
					"float",	"for",		"if",		"import",	"null",		"instanceof",
					"int",		"long",		"new",		"packag",	"interface",
					"private",	"true",		"public",	"return",	"short",	"static",
					"super",	"switch",	"this",		"throw",	"throws",	"protected",
					"transient","try",		"void",		"volatile",	"while",	"synchronized"
					]
	var preContents = [];//存放未渲染的各个pre的源代码，作为备份
	var preAccounts = [];//存放多个preAccount,即每个pre的统计信息
	var preAccount  = [];//存放单个pre的统计信息，(N:pre编号,W:单词数,C:字符数,A:注释行数,L:行数)

	$.each(pre,function(index,elem){
		var lan = $(elem).attr('language');//$(elem)等同于$(this);elem是节点对象,$('elem')是jQuery对象
		if(null == lan || lan == '') return;
		switch(lan){
			case 'java'			: renderjava(index,elem);			break;
			case 'javascript'	: renderjavascript(index,elem);		break;
			case 'html'			: renderhtml(index,elem);			break;
			case 'c/c++'		: rendercorc__(index,elem);			break;
		}

	})//--$.each(pre,function(index,elem)
	
	//下面三行代码顺序不要改变
	insertLineNumber();	//插入行号
	wrapSourcode();		//包裹代码
	toggleHeader();		//功能区的自动显示和隐藏

//------------------------------------------------------------------------------//
//								函数定义和实现									//
//------------------------------------------------------------------------------//
	//获取n个空白字符
	function getWhiteSpaces(n){//获取n个空白字符
		if(n == '.') return '.';
		var s = '';
		for (var i = 0; i < n; i++) {
			s += '&nbsp;';
		}
		return s;
	}
	//所有的源代码都插入行号,并记录每个pre的总行数
	function insertLineNumber(){
		$('pre').each(function(indexPre, elPre) {
			var linenumber = 1;
			$(elPre).children('span').each(function(indexSpan,elSpan){
				if($(elSpan).hasClass('span-br')){
					//在当前span后面插入
					$(this).after("<span class='sch_linenumber' style='display:inline-block;width:60px;text-align:right;'>"+
										// "<div style='display:inline-block'></div>"+
										"<span style='display:inline-block;width:60px;'>"+
											"<div style='text-align:right;position:inline;float:right;width:20px;'> |</div>"+
											"<div style='text-align:right;position:inline;float:right;width:40px;'>"+
												linenumber+
											"</div>"+
											"<div style='clear:right;width:0px;height:0px;visibility:hidden;display:inline-block;'>.</div>"+
										"</span>"+
									"</span>");
					// alert("linenumber:"+linenumber);
					linenumber++;
				}
			});
			var firstBr = $(elPre).children().first();
			if(firstBr === $("<span class='span-br'><br/></span>")){
				firstBr.remove();//去除第一个<br/>
			}
			//保存每个pre的总行数
			preAccounts[indexPre][4] = linenumber-1;
		});
		
	}
	//指定的源代码插入行号
	function insertLineNumberSingle(index){
		$('pre').each(function(indexPre, elPre) {
			if(index == indexPre){
				var linenumber = 1;
				$(elPre).children('span').each(function(indexSpan,elSpan){
					if($(elSpan).hasClass('span-br')){
						//在当前span后面插入
						$(this).after("<span class='sch_linenumber' style='display:inline-block;width:60px;text-align:right;'>"+
											// "<div style='display:inline-block'></div>"+
											"<span style='display:inline-block;width:60px;'>"+
												"<div style='text-align:right;position:inline;float:right;width:20px;'> |</div>"+
												"<div style='text-align:right;position:inline;float:right;width:40px;'>"+
													linenumber+
												"</div>"+
												"<div style='clear:right;width:0px;height:0px;visibility:hidden;display:inline-block;'>.</div>"+
											"</span>"+
										"</span>");
						// alert("linenumber:"+linenumber);
						linenumber++;
					}
				});
				var firstBr = $(elPre).children().first();
				if(firstBr === $("<span class='span-br'><br/></span>")){
					firstBr.remove();//去除第一个<br/>
				}
				return;
			}
			
		});
	}

	//指定的源代码，显示或隐藏行号
	toggleLineNumber = function(index){
		var toggle = function (i){
			$('pre').each(function(indexPre, elPre) {
				if(i == indexPre){
					var hasSetLineNumber = false;
					$(elPre).children('span').each(function(i,elSpan){
						if($(elSpan).hasClass('sch_linenumber')) {
							hasSetLineNumber = true;
							return;
						}
					});
					if(hasSetLineNumber){//如果设置了行号,隐藏行号
						sch_hideline(i);
						$(".sch_hideline"+i).val('显示行号');
					}else{
						insertLineNumberSingle(i);
						$(".sch_hideline"+i).val('隐藏行号');
					}
					return;
				}
			});
		}
		return new toggle(index);
	}
	//渲染源代码前的处理
	function format(codeContent){
		// alert(codeContent.match(/\n/ig).length);//只有制表符\t，空格' '和回车符\n
		codeContent = codeContent.replace(/\n|\r/ig," <br/>");//替换回车符\n
		codeContent = codeContent.replace(/(<br>|<br\/>)(\S+)/ig,"<br/> $2");//<br/>后面紧跟非空白字符，中间加空格
		codeContent = codeContent.replace(/(\s+)(<br>|<br\/>)/ig,"$1 <br/>");//<br/>前面紧跟非空白字符，
		codeContent = codeContent.replace(/\t/ig,"    ");//替换制表符\t
		codeContent = codeContent.replace(/([a-zA-Z0-9]+)\(/ig,'$1 \(');//如果是英文单词或数字，在括号前后添加空格
		codeContent = codeContent.replace(/\(([a-zA-Z0-9]+)/ig,'\( $1');//如果是英文单词或数字，在括号前后添加空格
		codeContent = codeContent.replace(/([a-zA-Z0-9]+)\)/ig,'$1 \)');
		codeContent = codeContent.replace(/([a-zA-Z0-9]+)\[/ig,'$1 \[');//在中括号前后添加空格
		codeContent = codeContent.replace(/([a-zA-Z0-9]+)\]/ig,'$1 \]');
		codeContent = codeContent.replace(/([a-zA-Z0-9]+)\{/ig,'$1 \{');//在大括号前后添加空格
		codeContent = codeContent.replace(/\{([a-zA-Z0-9]+)/ig,'\{ $1');
		codeContent = codeContent.replace(/([a-zA-Z0-9]+)\}/ig,'$1 \}');
		codeContent = codeContent.replace(/\}([a-zA-Z0-9]+)/ig,'\} $1');

		codeContent = codeContent.replace(/(.+)\/\/ /,'$1 //');// 注释字符后面有空格就去掉空格
		codeContent = codeContent.replace(/(\S+)\/\//,'$1 //');// 注释字符前面没空格就加上空格
		codeContent = codeContent.replace(/^(\s+)/,' $1');// 字符前面没空格就加上空格

		//多行注释/* */

		//转义字符<!-- dsf -->
		codeContent = codeContent.replace(/<!--\s*(\S*)\s*-->/ig,'&lt;!--&nbsp;$1&nbsp;--&gt;');
		// codeContent = codeContent.replace(/<!--/ig,'&lt;!--');
		return codeContent;
	}

	//各种源代码的渲染

	//渲染java源代码
	function renderjava(index,elem){			//index:第index个pre,从0开始

		var codeContent = $(elem).html();
		preContents.push(codeContent);			//备份到数组中
		codeContent = format(codeContent);
		

		var codespans = codeContent.split(/\s+/);//以空白字符，来分隔
		var ws_tab_rn = codeContent.split(/\S+/);//以非空白字符，来分隔，返回数组
		for (var i = 0; i < ws_tab_rn.length; i++) {
			ws_tab_rn[i] = (ws_tab_rn[i].length>0)? ws_tab_rn[i].length:1;//长度为0的话,就设为1
		}

		//存放单个pre的统计信息，(N:pre编号,W:单词数,C:字符数,A:注释行数,L:行数)
		//I
		preAccount[0] = index+1;
		//w
		preAccount[1] = codespans.length;
		//c
		var charSum = 0;
		for (var i = 0; i < codespans.length; i++) {
			charSum += codespans[i].length;
		}
		preAccount[2] = charSum;

		//
		console.log('codespans.length:'+codespans.length);
		console.log(codespans);
		console.log('ws_tab_rn.length:'+ws_tab_rn.length);
		console.log(ws_tab_rn);

		//如果代码上面有多余的空行，则去掉
		function check(){
			if(codespans[0]==''){
				for (var i = 0; i < codespans.length-1; i++) {
					codespans[i] = codespans[i+1];
				}
				check();
			}else{
				return;
			}
		}
		check();
		//从页面清除未渲染的源代码
		$(elem).text('');
		$(elem).append("<span class='span-br'><br/></span>");
		var linenumber = 1;
		var annotationNum = 0;
		for (var i = 0; i < codespans.length; i++) {
			
			//插入空白字符
			if(i==0&&codespans.length>ws_tab_rn.length){
				if (i==0) {
					$(elem).append("<span class='sch_spannum_"+i+"'>"+getWhiteSpaces(ws_tab_rn[i])+"</span>");
				}
			}else{
				$(elem).append("<span class='sch_spannum_"+i+"'>"+getWhiteSpaces(ws_tab_rn[i])+"</span>");
			}
			
			var keyword = codespans[i];
			if(keyword.indexOf('.')!=-1){//关键字中是否包含.
				keyword = keyword.substring(0,keyword.indexOf('.'));
			}
			
			if(keyword === '<br/>'){
				$(elem).append("<span class='span-br sch_spannum_"+i+"'><br/></span>");
			}else if (codespans[i].indexOf('//')!=-1 || 
				codespans[i].indexOf('/*')!=-1 || 
				codespans[i].indexOf('*')!=-1|| 
				codespans[i].indexOf('*/')!=-1||
				codespans[i].indexOf('&lt;!--')==0||//&lt;等<!-- -->
				codespans[i].indexOf('@')==0) {//@注解
				//是注释
				$(elem).append("<span class='sch_annotation sch_spannum_"+i+"'>"+codespans[i]+"</span>");
				//记录注释行数
				annotationNum++;
			}else if ($.inArray(keyword,kw_common) != -1) {//包含返回下标，否则返回-1
				//包含关键字,或包含带点的关键字
				$(elem).append("<span class='sch_kw_common sch_spannum_"+i+"'>"+codespans[i]+"</span>");
			}else if ($.inArray(keyword,kw_java) != -1) {
				//通用单词
				$(elem).append("<span class='sch_kw_java sch_spannum_"+i+"'>"+codespans[i]+"</span>");
			}else{//其他的字符
				$(elem).append("<span class='sch_other sch_spannum_"+i+"'>"+codespans[i]+"</span>");
			}
		}
		//将注释行数保存
		preAccount[3] = annotationNum;
		preAccounts[index]=preAccount;
		preAccount = [];//保存后清空当前pre的统计信息,为下个pre做准备
	}

	//渲染javascript
	function renderjavascript(elem){

	};

	//渲染html
	function renderhtml(elem){

	};		

	//渲染c/c++
	function rendercorc__(elem){

	};	

	//包裹源代码区域,并显示每个pre的统计信息，(N:pre编号,W:单词数,C:字符数,A:注释行数,L:行数)
	function wrapSourcode(){
		//为pre区域添加div和和初始化样式等
		$('pre').each(function(index,el){
			$(el).wrap("<div class='sch_wrapper sch_wrapper"+index+"'></div>");			//最内层包裹
		});
		$('.sch_wrapper').each(function(index,el){
			$(el).wrap("<div class='sch_inner sch_inner"+index+"'></div>");				//内层包裹
		});
		$('.sch_inner').wrap("<div class='sch_outer'></div>");							//最外层包裹
		$('.sch_outer').each(function(index, el) {
			$(el).prepend("<div class='sch_header sch_header"+index+"' style='position:relative;'>"+
								"<div class='sch_header_btns sch_header_btns_"+index+"' style='display:inline-block;float:left;'>"+
									"<input type='button' class='sch_copy' value='复制代码' onClick='sch_copy("+index+")'/>"+
									// "<input type='button' class='sch_hideline' value='隐藏行号' onClick='sch_hideline("+index+")'/>"+
									"  <input type='button' class='sch_hideline"+index+"' value='显/隐行号' onClick='toggleLineNumber("+index+")'/>"+
								"</div>"+
								"<div class='sch_header_accounts sch_header_accounts_"+index+"' style='display:inline-block;float:left;'>"+
									//显示pre的统计信息，(N:pre编号,W:单词数,C:字符数,A:注释行数,L:行数)
									"<span>统计: N:<span style='color:blue'>"+preAccounts[index][0]+"</span> "+
												 "W:<span style='color:blue'>"+preAccounts[index][1]+"</span> "+
									"</span>"+
									"<span class='sch_account sch_hideline"+index+"'> "+
											"C:<span style='color:blue'>"+preAccounts[index][2]+"</span> "+
											"A:<span style='color:blue'>"+preAccounts[index][3]+"</span> "+
											"L:<span style='color:blue'>"+preAccounts[index][4]+"</span>"+
									"</span>"+
								"</div>"+
								"<div style='display:inline-block;clear:left;width:0px;height:0px;visibility:hidden;'>."+
								"</div>"+
							"</div>");	//功能区
		
		});
	}

	//隐藏行号按钮调用函数
	sch_hideline = function(index){
		function hideline(index){
			$(".sch_wrapper>pre").each(function(indexPre,elPre){
				// alert("need to delete pre:"+index);
				// alert("indexPre:"+indexPre);
				if(indexPre == index){
					//要删除的是当前代码区域，删除当前区域下的所有class=".sch_linenumber"的span标签
					$(".sch_wrapper"+index+" span ").remove('.sch_linenumber');
					return;
				}
			})
		}
		return new hideline(index);
	}

	//复制按钮调用函数
	sch_copy = function(index){
		function copySourceCode(i){
			var txt = preContents[i];
			// if (window.clipboardData){
	  		//   sch_hideline(i);
			// 	window.clipboardData.setData('text',sourceCode);
			// 	alert('复制的内容为:'+sourceCode);
		 	//    }
			//   else{
			//    	alert('您的浏览器不支持复制功能，请手动copy：\n' + preContents[i]);
		 	//   }
		   
		     if(window.clipboardData) {
		           window.clipboardData.clearData();
		           window.clipboardData.setData("Text", txt);
		     	  alert('已经复制！');
		     } else if(navigator.userAgent.indexOf("Opera") != -1) {
		          window.location = txt;
		     	  alert('已经复制！');
		     } else if (window.netscape) {
		          try {
		               netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		          } catch (e) {
		               alert("被浏览器拒绝！\n请在浏览器地址栏输入'about:config'并回车\n然后将'signed.applets.codebase_principal_support'设置为'true'");
		          }
		          var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);
		          if (!clip)
		               return;
		          var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
		          if (!trans)
		               return;
		          trans.addDataFlavor('text/unicode');
		          var str = new Object();
		          var len = new Object();
		          var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
		          var copytext = txt;
		          str.data = copytext;
		          trans.setTransferData("text/unicode",str,copytext.length*2);
		          var clipid = Components.interfaces.nsIClipboard;
		          if (!clip)
		               return false;
		          clip.setData(trans,null,clipid.kGlobalClipboard);
		     	  alert('已经复制！');
		     }else{
			   	alert('您的浏览器不支持复制功能，请手动copy：\n\n' + preContents[i]);
		 	   }
		}//该代码片段来自于: http://www.sharejs.com/codes/javascript/2486
		return new copySourceCode(index);
	}
	
	//功能区的自动显示和隐藏
	function toggleHeader(){
		var timerenters = [],timerleaves = [];
		$('.sch_outer').each(function(i,el){

			//初始时,设置功能区为隐藏状态
			$('.sch_header'+i).hide();

			//设置事件,实现功能区的自动显示和隐藏
			var timerenter,timerleave;
			timerenters.push(timerenter);
			timerleaves.push(timerleaves);
			$('.sch_inner'+i).mouseenter(function(){
				clearTimeout(timerleaves[i]);
				timerenters[i] = setTimeout(function(){
					$('.sch_header'+i).show(400);
				},500);
			})
			$('.sch_inner'+i).mouseleave(function(){
				clearTimeout(timerenters[i]);
				timerleaves[i] = setTimeout(function(){
					$('.sch_header'+i).hide(400);
				},1500);
			})
			$('.sch_header'+i).mouseenter(function(){
				clearTimeout(timerleaves[i]);
				timerenters[i] = setTimeout(function(){
					$('.sch_header'+i).show(400);
				},500);
			})
			$('.sch_header'+i).mouseleave(function(){
				clearTimeout(timerenters[i]);
				timerleaves[i] = setTimeout(function(){
					$('.sch_header'+i).hide(400);
				},1500);
			})

		});
	}



	
})