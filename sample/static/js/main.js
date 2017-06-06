var isInt = 0;      //判断源码是否已经获取过，如果获取过，则直接显示当前页面源码，否则从服务器获取
var isTab = 1;
var myWidth = 0, myHeight = 0, isOpen = 0, editor = null;//获取浏览器高度和宽度,高亮代码编辑器
var prefixUrl = "views/",
  currentPage = null,
  firstPage,
  loader = new M.Loader({el: '#mapContent'});

function screenResize(){
  function initLayout(){
    if(typeof( $(window).innerWidth()) == 'number' ) {
      //Non-IE
      myWidth = $(window).innerWidth();
      myHeight = $(window).innerHeight();
    }
    else if(document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight)){
      //IE 6+ in 'standards compliant mode'
      myWidth = document.documentElement.clientWidth;
      myHeight = document.documentElement.clientHeight;
    }
  }

  initLayout();
  window.onresize = function (){
    initLayout();
    mapheight();
  }
}

/** 设置地图容器宽度 **/
function mapheight(){
    $("#container").width(myWidth - $("#menu")[0].offsetWidth - $("#code_area")[0].offsetWidth -5);
    $("#container").height(myHeight - 50);
}

function codeChange(){
  if($("#code_area")[0].offsetWidth >0){
    $("#code_open").hide();
    $("#code_close").show();
  }else{
    $("#code_close").hide();
    $("#code_open").show();
  }
}
/**开关代码编辑器**/
function toggleFooter () {
    var code_area = $('#code_area');
    var map = $('#container');
    var toggleImg = $('#toggle-img');
    if(code_area[0].offsetWidth <=0){//如果已经关闭，则打开
        code_area.animate({
            width: 500
        }, 200);
    map.animate({
        width: myWidth - 785
    },200);
    }else{
        code_area.animate({
             width: 0
        }, 200);
    map.animate({
        width: myWidth - 285
    },200);
    }
    setTimeout(function(){codeChange()},200);
}

// 获取资源文件
function getresource(){
  var link = currentPage ? currentPage : firstPage;
  $.get(link, function (result) {
      $("#myresource").val(result);
      localStorage.content = result;
      initEditor();
      isInt = 1;
      isTab = 0;
  });
}

// 设置资源到iframe
function setIntro(id){
  loader.create();
  $('#container').attr("src",id).on('load', function () {
    loader.destroy();
  });
  currentPage = id;
  isTab = 1;
  getresource();
}

/**初始化文本编辑器**/
function initEditor(){
    if(!editor){
        editor = CodeMirror.fromTextArea(document.getElementById("myresource"), {
            lineWrapping:true, //是否显示scroll
            lineNumbers: true, //是否显示number
            styleActiveLine: true,
            matchBrackets: true,
            mode:"htmlmixed",
            viewportMargin: Infinity
        });
    }else{
        editor.setValue($("#myresource").val());
    }
}
// 刷新
function refresh(){
    $("#myresource").val(localStorage.content);
    initEditor();
    run();
}

/**将用户修改过的代码加载到iframe中**/
function run(){
  M.log('running...');
    var iframeContent=$("#myresource").val();
    if(editor){
        iframeContent=editor.getValue();
    }
    var nr=iframeContent.indexOf("<body>");
    var iframeHead=iframeContent.slice(0,nr);
    var iframeFooter=iframeContent.slice(nr,iframeContent.length);
    var iFrame=document.getElementById("container").contentWindow;

    var isIE = /msie/.test(navigator.userAgent.toLowerCase());
    if(!isIE){
        iFrame.document.designMode = 'On';
        iFrame.document.contentEditable = true;
        iFrame.document.open();
        iFrame.document.write(iframeHead);
        iFrame.document.write(iframeFooter);
        iFrame.document.close();
        iFrame.document.designMode = 'Off';
    }
  M.log('done...');
}

/** 复制功能 **/
var clip = null;
var copyTimer = null;   //显示复制成功的定时器
function initClipboard() {
  if(clip){
    clip.reposition('d_clip_button');
    M.log('clipboard is repositioned.');
  }else{
    ZeroClipboard.setMoviePath('./static/assets/zeroclipboard/ZeroClipboard.swf');
    clip = new ZeroClipboard.Client();
    clip.setHandCursor( true );
    clip.addEventListener('load', function (client) {
      M.log("Flash movie loaded and ready.");
    });
    clip.addEventListener('mouseOver', function (client) {
      // update the text on mouse over
      $("#d_clip_button").css({fontWeight:"bold"});
      var iframeContent=$("#myresource").val();
      if(editor){
        iframeContent=editor.getValue();
      }
      clip.setText( iframeContent );
    });
    clip.addEventListener('mouseOut', function (client) {
      $("#d_clip_button").css({fontWeight:"normal"});
    });
    clip.addEventListener('complete', function (client, text) {
      M.log("Copied text to clipboard: %s",text);
    });
    clip.glue('d_clip_button');
  }
}

function initNavigation(){
    new M.Create({
        elem: '#menu',
        data: menuDatas
    });
  firstPage = $('.submenu').find('a').attr('href');
  M.log('Menu is created.')
}
/**左侧导航**/
function navigation(){
    var menu_head = $('#menu ul>li>a');
    var menu_body = $('#menu ul>li>.submenu');
    var menu_i = $('#menu ul>li>a>i');
    var flag = 0;
    menu_head.on('click',function(event){
        if(!$(this).hasClass("open clickState")){
            var des = ($(this).attr("listid")-1) * 52;
            $("#menu").animate({scrollTop:des},200);
            //slideToggle
            menu_body.slideUp('fast');
            $(this).next().stop(true,true).slideToggle('fast');
            menu_head.removeClass('open clickState');
            menu_i.removeClass('t_open');
            menu_i.addClass('t_close');
            $(this).addClass('open clickState');
            $(this).find('i').addClass('t_open');
        }else{
            if(flag == $(this).attr("listid")){
                $(this).removeClass('open');
            }else{
                $(this).removeClass('open clickState');
            }
            $(this).find("i").removeClass('t_open').addClass('t_close');
            $(this).parents("li").find(".submenu").slideUp('fast');
        }
    });
    $(".submenu a").on('click',function(){
        flag = $(this).parents("li").find(".one_head").attr("listid");
        if(!$(this).hasClass("clickState")){
            $(".submenu a").removeClass("clickState");
            $(this).addClass("clickState");
        }
        //代码宽度还原
        $("#code_area").width(500);
        mapheight();
      return false;
    });
}
/**设置显示源码的拖拽效果**/
function dragCode(){
    $("#drag").mousedown(function(){
        document.onselectstart = function(){return false;};
        document.onmousemove = function(e){
            var bottomX = (e||window.event).clientX -281;
            if($("#overiframe").is(":hidden")==true){
                $("#overiframe").show();
            }
            if(bottomX <=0){
                bottomX = 0;
            }
            if(bottomX >= myWidth - 287){
                bottomX = myWidth - 287;
            }
            $("#code_area").width(bottomX);
            $("#myresource").width(bottomX*0.8);
            $("#container").width(myWidth - bottomX -287);
            $("#overiframe").width(myWidth - bottomX -287);
        };
        document.onmouseup=function(){
            document.onmousemove=null;
            $("#overiframe").hide();
            codeChange();
            initClipboard();
        };
    });
}
/**刷新页面保证menu的定位**/
function menuLocation(){
    var $menu;
    if(firstPage){
      $menu = $("#menu a[href$='"+ firstPage);
      $menu.parents("li").find(".one_head").addClass("open clickState");
      $menu.parents("li").find("i").removeClass("t_close").addClass("t_open");
      $menu.parents(".submenu").show();
      $menu.addClass("clickState");
	    var des = (($menu.parents("li").find(".header").attr("listid"))-1) * 52;
	    $("#menu").animate({scrollTop:des},0);
      M.log('first page is expanded (%s)',firstPage);
    }
}
function initContainer(){
  if(firstPage){
    loader.create();
    $('#container').attr('src',firstPage).on('load', function () {
      loader.destroy();
      M.log("page(%s) is loaded!",firstPage);
    });
  }
}
function init() {
  initNavigation();
  navigation();
  menuLocation();
  initContainer();
}
/**页面初始化**/
(function(){
  init();
  getresource();

  dragCode();
  codeChange();

  initClipboard();
  screenResize();
})();

