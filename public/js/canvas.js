var thisaction = [];//贝塞尔数组记录
var isonclass = 0; //是否在上课
var drawFlag = false;
var drawStartPoint = [];
var pagenum = 0;
var pagelength = 0;

//开始上课通知服务器记录
$('#timeCountStart').click(function(){
    var txt = $(this).text();

    if(txt=='开始上课'){
//        if(!isonclass){

//            $('#timeCountStart').html("上课ING");
//            isonclass = 1;
//        }else{
//            alert('你已经在上课啊！');
//        }

        $(this).text('结束并保存');
        $(this).css('background','#B72424');
        room.emit('is on class now',roomName);
    }else{
        $(this).text('开始上课');
        $(this).css('background','#458BCA');
        room.emit('is on class out',null);
        isonclass = 0;
    }

});

//结束上课
$('#timeCountEnd').click(function(){
    if(isonclass){
        room.emit('is on class out',null);
        $('#timeCountStart').html("开始上课");
        isonclass = 0;
    }else{
        alert('还没有开始上课啊！');
    }

});

//下一个学生
$('#nextStudent').click(function (){
    if(isonclass){
        alert('请先终结这节课！');
    }else{
        room.emit('newt student',roomName);
    }
});


// /去除字符串前后空格
function trim(str){
    str = str.replace(/^(\s|\u00A0)+/,'');
    for(var i=str.length-1; i>=0; i--){
        if(/\S/.test(str.charAt(i))){
            str = str.substring(0, i+1);
            break;
        }
    }
    return str;
}

//图片是否移动
//function dragPicFunc(flag){
//    for(var i=0;i<shapesArray.length;i++){
//        var shape = shapesArray[i];
//        for(var k=0;k<shape.length;k++){
//            if(shape[k].className=='Image'){
//                var draggable = shape[k].draggable();
//                shape[k].draggable(flag);
//            }
//        };
//        layerArry[i].draw();
//    }
//}


//窗口大小判定
function resizeWindowFunc(){
    changeCanvasDiv();
    var windowWidth = $(window).width();
    if(windowWidth<1200){
        $('.mainRight').stop().animate({'right':'-200px'},300,function(){
            $('.mainRight').hide();
        });
        $('.mainMid').stop().animate({'width':(windowWidth-233)+'px'},300,function(){
            changeCanvasDiv();
        });
        $('#rightCtnBtn').show();
    }else{
        $('.mainRight').show();
        $('.mainRight').stop().animate({'right':'0'},300);
        $('.mainMid').stop().animate({'width':(windowWidth-433)+'px'},300,function(){
            changeCanvasDiv();
        });
        $('#rightCtnBtn').hide();
    }
}
resizeWindowFunc();
$(window).resize(function(){
    resizeWindowFunc();
});
$('#rightCtnBtn').click(function(){
    var windowWidth = $(window).width();
    if($('.mainRight').css('right')!='0px'){
        $('.mainRight').show();
        $('.mainRight').stop().animate({'right':'0'},300);

        $('.mainMid').stop().animate({'width':(windowWidth-433)+'px'},300,function(){
//            changeCanvasDiv();
        });
    }else{

        $('.mainRight').stop().animate({'right':'-200px'},300);
        $('.mainRight').hide();
        $('.mainMid').stop().animate({'width':(windowWidth-233)+'px'},300,function(){
//            changeCanvasDiv();
        });
    }


});


//config
var httpline = 'http://172.16.3.78';
//进入不同的聊天房间
var room = io.connect(httpline+':3000/room');

//刷新用户列表
room.on('fresh shtudent list msg',function(data){
    console.log(data.UpStudent)
    console.log(data.DownStudent)
    addStudent(data.UpStudent,null);
    addAudit(data.DownStudent,null);
});
room.on('fresh shtudent list other msg',function(data){
    console.log(data.UpStudent)
    console.log(data.DownStudent)
    addStudent(data.UpStudent,null);
    addAudit(data.DownStudent,null);
});

//进行加入房间的判定
room.on('connect',function(){
    if(mouseFlag=='true'){
        console.log('教师')
        room.emit('teacher join room',{roomID:roomName,roomName:encodeURI(userName),user:encodeURI(userName)});
    }else{
        console.log('学生')
        room.emit('student join room',{roomID:roomName,user:encodeURI(userName)});
    }

})

//增加上课学生列表
function addStudent(stuArray){
    if(!stuArray) return;
    $('#studentList table').html('');
    if(stuArray.length!=0){
        console.log(stuArray)
        for(var i=0;i<stuArray.length;i++){
            var studentName = decodeURI(stuArray[i]);
            var tr = $('<tr></tr>');
            tr.html('<td></td><td>'+studentName+'</td><td><img src="images/studentCamera.png"> <img src="images/studentVoice.png"> <img src="images/studentBoardGray.png"></td>');
            $('#studentList table').append(tr);
        };
    }
}

//增加旁听列表
function addAudit(stuArray){
    $('#other table').html('');
    if(stuArray.length){
        for(var i=0;i<stuArray.length;i++){
            var studentName = decodeURI(stuArray[i]);
            var tr = $('<tr></tr>');
            tr.html('<td>'+studentName+'</td><td><img src="images/studentCamera.png"> <img src="images/studentVoice.png"> <img src="images/studentBoardGray.png"></td>');
            $('#other table').append(tr);
        };
    }
}

//告知房间没有权限
room.on('classroom admin',function(){
    room.on('classroom admin',function(data){
        console.log('欢迎'+decodeURI(data.roomName)+'回来执教'+decodeURI(data.roomName)+'教室,课程编号'+decodeURI(data.classID));
        addAudit(data.UstudentArray,data.onStudent);
    });
});

//通知自己是房间的老师还学生
room.on('permission',function(data){
    console.log('欢迎来到'+decodeURI(data.roomName)+'教室');
    console.log(data.students)
    $('.nav').text(decodeURI(data.roomName)+'的教室');
    addAudit(data.students);
    if(mouseFlag=='true'){
//        $.ajax({                //加入房间后请求老胡
//            type:'POST',
//            dataType:'json',
//            data:{id:userID,status:1},
//            url:'http://172.16.3.141'+'/Account/callbackRoom',
//            success:function(data){
//                console.log('发送成功');
//            }
//        })
    }

});

//通知有人进来了 -----旁听
room.on('rooms other perple',function(data){
   addAudit(data.students);
   console.log(data);
   console.log('有人进来了');
});

//解散房间
room.on('disslove room',function(){
    console.log('房间已解散，请离开');
})

//更新房间学生列表-----旁听
room.on('update room students',function(data){
//    addAudit(data)
    addAudit(data.students,data.onStudent);
});

//答疑
$('#answerBtn').click(function(){
    $('.answerBlock').show();
});

$('#answerFile').fileupload({
    maxFileSize: 5000000,
    done:function(e,data){
        $('.answerBlock').hide();
        $('#answerBlockProgress').attr('value',0);
        console.log('_______'+curUser)
        addCourse('img',data.result.url,data.result.name,curUser);

        //更新上传列表
        room.emit('upload file list',{type:'img',url:data.result.url,name:encodeURI(data.result.name),user:encodeURI(curUser),roomId:roomName});

        //更新学生列表
        room.emit('reload list',null);

    },
    progressall: function (e, data) {
        console.log(data.loaded)
        var val = Math.floor(data.loaded / data.total )*100;
        $('#answerBlockProgress').attr('value',val);
    }
});



//开始上课按钮切换







//
//$('#answerFile').fileupload({
//    autoUpload: false,
//    sequentialUploads: true,
//    format:{name:'这是一个测试文件的名字啊！！！'},
//    add:function(e,data){
//        $("#answerBlockSubmit").on("click",function(){
//            console.log(data);
//            data.format = $('.answerBlockTitle input').val();
//            data.submit();
//        })
//    },
//    done:function(e,data){
//        $('.answerBlock').hide();
//        addCourse('img',data.result.url,data.result.name);
//        room.emit('upload file list',{type:'img',url:data.result.url,name:encodeURI(data.result.name)});
//    }
//});

$('#answerBlockCancle').click(function(){
    $('.answerBlock').hide();
});


//更新画布页面
function updatePage(){
    var curNums = $('.mainTitle li').length;
    for(var m=0;m<curNums;m++){
        $('.mainTitle li').eq(m).html('<span>×</span>'+'Page'+(m+1))
    }
}


//画板文字
//$('#fillTxt').blur(function(){
//	var val = $('#fillTxt').val();
//	if(val.length===0){
//		$('#fillTxt').val('');
//		$('#fillTxt').hide();
//		paramter.point=[];
//		paramter.ctn='';
//	}else{
//		paramter.type='text';
//		paramter.ctn = val;
//		paramter.point=[txtStartPoint[0]-236,txtStartPoint[1]-52];
//		DrawAction(paramter);
//		$('#fillTxt').val('');
//		$('#fillTxt').hide();
//		paramter.point=[];
//		paramter.ctn='';
//	}
//    room.emit('draw txt',null);
//});


//
//
//********聊天
//
//
var curUser = userName;
function getNowTime(){
	var nowDate = new Date();
	var year = nowDate.getFullYear();
	var month = nowDate.getMonth()+1;
	var date = nowDate.getDate();
	var hours = nowDate.getHours();
	var minutes = nowDate.getMinutes();
	var seconds = nowDate.getSeconds();
	return year+'-'+month+'-'+date+' '+hours+':'+minutes+':'+seconds;
}
function scrollToBottom() {
     var scrollTop = $(".chatWrap")[0].scrollHeight;
    $(".chatWrap").scrollTop(scrollTop);
 }
$('#chatBtn').click(function(){
	var chatTxt = $('#chatInput').val();
	if(chatTxt.length===0) return;
	room.emit('add chat',{
		user:encodeURI(curUser),
		time:getNowTime(),
		ctn:encodeURI(chatTxt)
	});
	$('#chatInput').val('');
});

room.on('chat msg student',function(data){
	var ctn = '<li><p><strong>'+decodeURI(data.ctn.user)+' </strong>'+data.ctn.time+'<p>'+decodeURI(data.ctn.ctn,'utf-8')+'</p>';
	$('#chatCtn').append(ctn);
    console.log('555');
	scrollToBottom();
});
room.on('chat msg slef',function(data){
    console.log('555');
	var ctn = '<li><p><strong>'+decodeURI(data.ctn.user)+' </strong>'+data.ctn.time+'<p>'+decodeURI(data.ctn.ctn,'utf-8')+'</p>';
	$('#chatCtn').append(ctn);
	scrollToBottom();
});

$(document).keydown(function(e){
	if(e.keyCode==13&&cursor!=='text'){
		$('#chatBtn').click();
	}
});

//
//
// +++++++++画画操作
//
//

addPage();
function changeCanvasDiv(){
//    $('#page'+pagenum+'write,#page'+pagenum+'down,#page'+pagenum+'paper').attr({width:$('#canvas').width(),height:$('#canvas').height()});
}
if(mouseFlag=='true'){
	//鼠标样式
	$('#canvas').mouseover(function(e){
		switch(cursor){
			case 'line':
				$('#canvas').css('cursor','url(images/line.png),auto');
				break;
			case 'earser':
				$('#canvas').css('cursor','url(images/eraser.png),auto');
				break;
			case 'shape':
				$('#canvas').css('cursor','url(images/shape.png),auto');
				break;
			case 'text':
				$('#canvas').css('cursor','url(images/text.png),auto');
				break;
			case 'upload':
				$('#canvas').css('cursor','url(images/upload.png),auto');
				break;
            case 'move':
                $('#canvas').css('cursor','url(images/move.png),auto');
                break;
		}
	});
	$('#canvas').mouseout(function(e){
		$('#canvas').css('cursor','auto');
	});

	//按钮及样式的改变
//	$('#drawType>button').click(function(){
//		var btnIndex = $('#drawType>button').index($(this));
//		$(this).addClass('active').siblings('button').removeClass('active');
//		paramter.type = $(this).attr('type');
//		if(btnIndex===2){
//			$('#shapeClassfy').show();
//			cursor = 'shape';
//		}else{
//			$('#shapeClassfy').hide();
//		}
//		if(btnIndex===0){
//			cursor = 'line';
//		}
//		if(btnIndex===1){
//			cursor = 'earser';
//		}
//		// if(btnIndex!=4){  已改正 但是不好使
//		// 	console.log('33323232323');
//		// 	for(var i=0;i<shapes.length;i++){
//		// 		if(shapes[i].className==='Image'){
//		// 			shapes[i].attrs.draggable = false;
//		// 		}
//		// 	};
//		// 	layer.draw();
//		// }else{
//		// 	for(var i=0;i<shapes.length;i++){
//		// 		if(shapes[i].className==='Image'){
//		// 			shapes[i].attrs.draggable = true;
//		// 		}
//		// 	};
//		// 	layer.draw();
//		// };
//		room.emit('draw style btn',btnIndex);
//	});

    //点击进行移动操作
    $('#drawTypeMove').click(function(){
        paramter.type = 'move';
        cursor = 'move';

        $('.canvasTool li').removeClass('active');
        $(this).addClass('active');

        //dragPicFunc(true);
        room.emit('draw type move',null);
    });
    //点击画线
    $('#drawTypeLine').click(function(){
        paramter.type = 'line';
        cursor = 'line';

        $('.canvasTool li').removeClass('active');
        $(this).addClass('active');

        //dragPicFunc(false);
        room.emit('draw type line',null);
    });

    //点击橡皮擦
    $('#drawTypeEarser').click(function(){
        paramter.type = 'earser';
        cursor = 'earser';

        $('.canvasTool li').removeClass('active');
        $(this).addClass('active');

        //dragPicFunc(false);
        room.emit('draw type earser',null);
    });

    //形状的选择
    $('#drawTypeShape').click(function(){
        if($('#shapeCtn').is(':visible')==true){
            $('#shapeCtn').hide();
        }else{
            paramter.type = 'shape';
            cursor = 'shape';
            $('#shapeCtn').show();
            //dragPicFunc(false);
        }
        //dragPicFunc(false);
        room.emit('draw type shape',null);

    });

    //形状内容选择
    $('#shapeCtn em').click(function(){
        paramter.type = $(this).attr('type');
        cursor = $(this).attr('type');

        $('#shapeCtn').hide();

        $('.canvasTool li').removeClass('active');
        $('#drawTypeShape').addClass('active');

        //dragPicFunc(false);
        room.emit('draw type shape ctn',$(this).attr('type'));
        return false;
    });

    //点击文字
    $('#drawTypeText').click(function(){
        cursor = 'text';
        paramter.type=null;

        $('.canvasTool li').removeClass('active');
        $(this).addClass('active');
        //dragPicFunc(false);
        room.emit('chose draw txt',null);
    });
    $('#canvas').on('mousedown',function(e){
        if(cursor=='text'){
            txtStartPoint[0]=e.pageX;
            txtStartPoint[1]=e.pageY;
            $('#fillTxtdiv').show();
            //$('#fillTxt').focus();
            txtInputFlag = true;
            room.emit('text input show',[e.pageX,e.pageY]);
        }
    });
    $(document).on('mousemove',function(e){
        if(txtInputFlag==true){
            $('#fillTxtdiv,#fillTxt').css({'top':txtStartPoint[1],'left':txtStartPoint[0],'width':e.pageX-txtStartPoint[0],'height':e.pageY-txtStartPoint[1]});
            room.emit('text input change',[e.pageX,e.pageY]);
        }
    });
    $('#textok').click(function(){//提交文字
        filltextok();
        room.emit('draw txt',null);
    });



    $(document).on('mouseup',function(e){
        if(cursor==='text'){
            txtInputFlag = false;
        }
    });

    //文字框同步
    $(document).keyup(function(){
        var val = $('#fillTxt').val();
        room.emit('text input ctn',encodeURI(val));
    });

    //颜色的选择
    $('#drawTypeColor').click(function(){
        if($('#colorCtn').is(':visible')==true){
            $('#colorCtn').hide();
        }else{
            $('#colorCtn').show();
            //dragPicFunc(false);
        }
        room.emit('draw type color',null);
    });

    //颜色内容选择
    $('#colorCtn em').click(function(){
        paramter.lineColor = $(this).attr('type');
        $('#colorCtn').hide();
        $('#drawTypeColor>img').attr('src',$(this).attr('sourceImg'));
        room.emit('draw line color',$(this).attr('type'));
        return false;
    });

    //线的宽度设定
    $('#pencilSize li').click(function(){
        var index = $('#pencilSize li').index($(this));
        if(index==0){
            paramter.lineWidth = 1;
            $('#drawTypeLineFlag').attr('src','images/pencilSmall.png');
        }else if(index==1){
            paramter.lineWidth =3;
            $('#drawTypeLineFlag').attr('src','images/pencilMid.png');
        }else if(index==2){
            paramter.lineWidth = 6;
            $('#drawTypeLineFlag').attr('src','images/pencilBig.png');
        }
        room.emit('draw line width',index);
    })






//	$('#shapeClassfy>button').click(function(){
//		var btnIndex = $('#shapeClassfy>button').index($(this));
//		paramter.type = $(this).attr('type');
//		room.emit('draw shape style btn',btnIndex);
//		$('#shapeClassfy').hide();
//	});

	//线颜色的改变
//	$('#drawLineColor div button').click(function(){
//		var color = $(this).attr('type');
//		paramter.lineColor = color;
//		$('#drawLineColor>p>span')[0].style.background=color;
//		room.emit('draw line color',color);
//	});

	//填充色的改变
//	$('#drawColor div button').click(function(){
//		var color = $(this).attr('type');
//		paramter.fillColor = color!='white'?color:null;
//		$('#drawColor>p>span')[0].style.background=color;
//		room.emit('draw color',color);
//	});
//
//	//线的宽度
//	$('#drawLineWidth input').change(function(){
//		var value = $('#drawLineWidth input').val();
//		$('#drawLineWidth p span').text(value);
//        dragPicFunc(false);
//		room.emit('draw line width',value);
//		paramter.lineWidth = value;
//	});

	//线的样式设定
//	$('#drawLineStyle input').click(function(){
//		var index = $('#drawLineStyle input').index($(this));
//		if(index===0){
//			paramter.lineStyle = [0,0];
//		}else{
//			paramter.lineStyle = [10,10];
//		}
//		room.emit('draw line style',index);
//	});

    //是否开启贝塞尔优化
	//画画
	$('#canvas').mousedown(function(e){
		drawFlag = true;
        var canvasWidth = $('#canvas').width();
        var canvasHeight = $('#canvas').height();
		drawStartPoint[0] = (e.pageX-234);
		drawStartPoint[1] = (e.pageY-50);
	});
	$(document).mousemove(function(e){
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();
		room.emit('mouse location',[e.pageX,e.pageY]);
		if(drawFlag){
			paramter.point[0] = drawStartPoint[0];
			paramter.point[1] = drawStartPoint[1];
			paramter.point[2] = (e.pageX-234);
			paramter.point[3] = (e.pageY-50);
            ysDraw(paramter);
            var thispoint = [drawStartPoint[0],drawStartPoint[1]];
            thisaction.push(thispoint);
			paramter.point=[];
			room.emit('draw line',[drawStartPoint[0],drawStartPoint[1],(e.pageX-234),(e.pageY-50)]);
			if(paramter.type!=='segment'&&paramter.type!=='rect'&&paramter.type!=='circle'&&paramter.type!=='triangle'){
				drawStartPoint[0] = (e.pageX-234);
				drawStartPoint[1] = (e.pageY-50);
			}
		}
	});
	$('#canvas').mouseup(function(e){
		drawFlag = false;
		strightFlag = false;
		drawStartPoint=[];
		paramter.point=[];
        //判断为shape执行拷贝操作
        inputAction(paramter);
        thisaction=[];
       	room.emit('mouse up',null);
	});

	// 出现上传框
	$('#drawTypeUpload').click(function(){
		$('#uploadCtn').show();

        $('.canvasTool li').removeClass('active');
        $(this).addClass('active');
        paramter.type = 'upload';
		cursor='upload';
        room.emit('show upload file',null);
	});

    //增加课件到列表
    function addCourse(type,data,name,user){
        var li = $('<li></li>');
        li.attr('type',type);
        li.attr('data',data);
        li.attr('draggable',true);
        if(type=='img'){
           li.html('<img src="images/coursewareImg.png" > '+user)
        }else{
            li.html('<img src="images/coursewarePDF.png" > '+user)
        }
        $('#courseware ul').append(li);
    }

	$('#file').fileupload({
	    maxFileSize: 5000000,
	    done:function(e,data){
	    	$('#uploadCtn progress').attr('value','0');
		    $('#uploadCtn').hide();
            addCourse(data.result.type,data.result.url,data.result.name,curUser);
            room.emit('upload file list',{type:data.result.type,url:data.result.url,name:encodeURI(data.result.name),user:encodeURI(curUser),roomId:roomName});
	    },
	    progressall: function (e, data) {
	        var val = Math.floor(data.loaded / data.total )*100;
	       $('#uploadCtn progress').attr('value',val);
	    }
	});


	//pdf的翻页与关闭
    $('#pdfPre').click(function(){
    	if(nums===1) return;
    	console.log('AAA'+nums);
	    nums--;
	    pdfShow(pdfUrl);
	    console.log('BBB'+nums);
	    room.emit('pdf pre',null);
	});

	$('#pdfNext').click(function(){
		if(nums===totalNum) return;
		console.log('AAA'+nums);
	    nums++;
	    pdfShow(pdfUrl);
	    console.log('BBB'+nums);
	    room.emit('pdf next',null);
	});

	$('#pdfColse').click(function(){
	    $('#pdfWrap').hide();
	    room.emit('pdf close',null);
	});

	//pdf的滚动
	$('#pdfWrap').scroll(function(){
		var scrollTop = $('#pdfWrap').scrollTop();
		room.emit('pdf scroll',scrollTop);
	});



    //TEST执行增加页面

	//新建画布
	$('#createLayer').click(function(){
        var liNums = $('.mainTitle li').length+1;
        $('.mainTitle li').removeClass('active');
        $('#createLayer').before('<li class="active"><span>×</span>'+'Page'+liNums+'</li>');
        //增加总画布数量
        addPage();
        room.emit('create layer',null);
    });

    function addPage(){
        pagelength += 1;
        pagenum = pagelength;
        //增加新DIV框架
        $('#canvas').append('<div id = "page'+pagenum+'" style="width:100%;height: 100%"><canvas id="page'+pagenum+'paper" width="2000px" height="1000px" class="pagebg pagepaper"></canvas><canvas id="page'+pagenum+'down" width="2000px" height="1000px" class="pagedown" ></canvas><canvas id="page'+pagenum+'write" width="2000px" height="1000px" class="pagewrite"></canvas></div>');
        //设定画板的大小
        changeCanvasDiv();
        showPage(pagenum);
        //显示新DIV框架
    }
    function showPage(page){
        for(var i=1;i<=pagelength;i++){
            $('#page'+i).hide();
        }
        $('#page'+page).show();
        pagenum = page;
    }


//      原游戏层级
//		var oldLayer =null;
//		for(var i=0;i<layerArry.length;i++){
//			if(layerArry[i]==layer){
//				oldLayer = layerArry[i];
//			}
//		}
//		oldLayer.hide();
//		oldLayer.draw();
//		layerArry.push(new Kinetic.Layer());
//        shapesArray.push(new Array);
//        memoryArray.push(new Array);
//        shapes = shapesArray[shapesArray.length-1];
//        memory = memoryArray[memoryArray.length-1];
//		stage.add(layerArry[layerArry.length-1]);
//		layer = layerArry[layerArry.length-1];
//		room.emit('create layer',null);
//        return false;



    //画布的翻
    $('.mainTitle').on('click','li',function(){
        $(this).addClass('active').siblings().removeClass('active');
        var curLayerIndex = $('.mainTitle li').index($(this));

        showPage(curLayerIndex+1);
        room.emit('pre layer',curLayerIndex);
    });

    //删除画布
    $('.mainTitle').on('click','li span',function(){
        if($('.mainTitle li').length==1) return;

        var hitIndex = $('.mainTitle li').index($(this).parent('li'));  //当前要删除的索引

        if(hitIndex==0){//
            alert('此页暂时无法删除');
        }else{
            $('.mainTitle li').eq(hitIndex).remove();
            $('.mainTitle li').eq(hitIndex-1).addClass('active').siblings().removeClass('active');
        };

        //删除对应画布的整个DIV
        if(hitIndex>0){
            $('#page'+(hitIndex+1)).remove();
            pagelength -= 1;
        }else{console.error('页面报错')};
        if((hitIndex+1)<$('.mainTitle li').length+1){
            console.log('进入c');
            for(var i=hitIndex;i<($('.mainTitle li').length+1);i++){
                console.log(i);
                console.log($('.mainTitle li').eq(i).html('<span>×</span>Page'+(i+1)));
                $('#page'+(i+1)).attr({id:'page'+i});
                $('#page'+(i+1)+'paper').attr({id:'page'+i+'paper'});
                $('#page'+(i+1)+'down').attr({id:'page'+i+'down'});
                $('#page'+(i+1)+'write').attr({id:'page'+i+'write'});
            }
        }

        //如果页面后边还有页面
        //pagenum = pagenum-1;
        //console.log(pagenum);
        showPage(hitIndex);
        room.emit('delete layer',hitIndex);
        return false;

    });

	//保存当前canvas
	$('#toolSave').click(function(){

        stage.toDataURL({
            callback:function(dataUrl){
                console.log(dataUrl);
                window.open(dataUrl);
            }
        });
//		for(var i=0;i<3;i++){
//			for(var k=0; k<layerArry.length;k++){
//				layerArry[k].hide();
//				layerArry[k].draw();
//			};
//			layerArry[i].show();
//			layerArry[i].draw();
//			stage.toDataURL({
//				callback:function(dataUrl){
//					console.log(dataUrl);
//					window.open(dataUrl);
//				}
//			})
//		}
	});


    //
    //拖拽课件
    //
    var dragEle = null;
    $('#courseware').on('dragstart','li',function(e){
        dragEle = e.target;
    });
    $('#courseware').on('dragend','li',function(e){
        dragEle = null;
        return false;
    });
    $('.canvasWrap')[0].ondrop = function(e){
        if(dragEle){
            if($(dragEle).attr('type')=='img'){
                paramter.type = 'upload';
                paramter.ctn = $(dragEle).attr('data');
                ysDraw(paramter);
                room.emit('upload file',$(dragEle).attr('data'));
                paramter.type = null;
                paramter.ctn = null;
            }else if($(dragEle).attr('type')=='pdf'){
                paramter.type = 'upload';
                pdfUrl = $(dragEle).attr('data');
	    		$('#pdfWrap').show();
	    		pdfShow($(dragEle).attr('data'));
	    		room.emit('upload pdf',$(dragEle).attr('data'));
                paramter.type = null;
                paramter.ctn = null;
            }
        }
        return false
    }
    $('.canvasWrap')[0].ondragover = function(ev) {
        /*拖拽元素在目标元素头上移动的时候*/
        ev.preventDefault();
        return true;
    };

    $('.canvasWrap')[0].ondragenter = function(ev) {
        /*拖拽元素进入目标元素头上的时候*/
        return true;
    };

    //学生列表和备课文件进行切换操作
    $('.rightRitle span').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
        var type = $(this).attr('type');
        if(type=='studentList'){
            $('#studentList').show();
            $('#courseware').hide();
        }else if(type=='courseware'){
            $('#studentList').hide();
            $('#courseware').show();
        }
        room.emit('rightRitle slide',type)
    });



//
//
//if结束
//
//
//
}

//鼠标位置
room.on('mouse location msg',function(data){
    var canvasWidth = $(window).width();
    var canvasHeight = $(window).height();
    var x= Math.floor((data.data)[0]);
    var y= Math.floor((data.data)[1]);
	$('#cursor').show();
	$('#cursor').css({'left':x,'top':y+10});
});

//移动操作
room.on('draw type move msg',function(data){
    paramter.type = 'move';
    cursor = 'move';

    $('.canvasTool li').removeClass('active');
    $('#drawTypeMove').addClass('active');
});

//选择划线
room.on('draw type line msg',function(data){
    console.log(1);
    paramter.type = 'line';
    cursor = 'line';
    $('.canvasTool li').removeClass('active');
    $('#drawTypeLine').addClass('active');
});

//选择橡皮擦

room.on('draw type earser msg',function(data){
    paramter.type = 'earser';
    cursor = 'earser';
    $('.canvasTool li').removeClass('active');
    $('#drawTypeEarser').addClass('active');
});

//进行形状操作
room.on('draw type shape msg',function(data){
    if($('#shapeCtn').is(':visible')==true){
        $('#shapeCtn').hide();
    }else{
        paramter.type = 'shape';
        cursor = 'shape';
        $('#shapeCtn').show();
    }
});

//形状内容操作
room.on('draw type shape ctn msg',function(data){
    paramter.type = data.data;
    cursor = data.data;

    $('.canvasTool li').removeClass('active');
    $('#drawTypeShape').addClass('active');

    $('#shapeCtn').hide();
});


//点击进行颜色操作 线
room.on('draw type color msg',function(){
    if($('#colorCtn').is(':visible')==true){
        $('#colorCtn').hide();
    }else{
        $('#colorCtn').show();
    }
});

//颜色选择操作  线
room.on('draw line color msg',function(data){
    $('#colorCtn').hide();
    var liList = $('#colorCtn li');
    for(var i=0;i<liList.length;i++){
        if(liList.eq(i).attr('type')==data.color){
            $('#drawTypeColor>img').attr('src',liList.eq(i).attr('sourceimg'));
        }
    };
    paramter.lineColor = data.color;
});

//出现上传框
room.on('show upload file msg',function(){
    $('#uploadCtn').show();
    $('.canvasTool li').removeClass('active');
    $('#drawTypeUpload').addClass('active');
    cursor='upload';
    paramter.type='upload';
});

//上传到右边列表
room.on('upload file list msg',function(data){
    addCourse(data.type,data.url,decodeURI(data.name),decodeURI(data.user));
});

//右边学生和作业切换
room.on('rightRitle slide msg',function(data){
    if(data.type=='studentList'){
        $('.rightRitle span').eq(0).addClass('active').siblings().removeClass('active');
        $('#studentList').show();
        $('#courseware').hide();
    }else if(data.type=='courseware'){
        $('.rightRitle span').eq(1).addClass('active').siblings().removeClass('active');
        $('#studentList').hide();
        $('#courseware').show();
    }
});

//画线样式按钮
//room.on('draw style btn msg',function(index){
//	$('#drawType>button').eq(index.index).addClass('active').siblings('button').removeClass('active');
//	if(index.index===2){
//		$('#shapeClassfy').show();
//	}else{
//		$('#shapeClassfy').hide();
//	}
//	cursor = $('#drawType>button').eq(index.index).attr('type');
//	paramter.type = $('#drawType>button').eq(index.index).attr('type');
//});
//room.on('draw shape style btn msg',function(index){
//	$('#shapeClassfy').hide();
//	paramter.type = $('#shapeClassfy>button').eq(index.index).attr('type');
//
//});

//刷新学生列表
room.on('reload list msg',function(data){

    addAudit(data.DownStudent,null);
    addStudent(data.UpStudent,null);
});

room.on('reload list other msg',function(data){
    addAudit(data.DownStudent,null);
    addStudent(data.UpStudent,null);
});

//画线
room.on('draw line msg',function(para){
	paramter.point[0] = (para.para)[0];
	paramter.point[1] = (para.para)[1];
	paramter.point[2] = (para.para)[2];
	paramter.point[3] = (para.para)[3];
    var thispoint = [paramter.point[0],paramter.point[1]];
    thisaction.push(thispoint);
    ysDraw(paramter);
});


//填充色
room.on('draw color msg',function(data){
	$('#drawColor>p>span')[0].style.background=data.color;
	paramter.fillColor = data.color!='white'?data.color:null;
});

//线的宽度
room.on('draw line width msg',function(data){
    if(data.value==0){
        paramter.lineWidth = 1;
        $('#drawTypeLineFlag').attr('src','images/pencilSmall.png');
    }else if(data.value==1){
        paramter.lineWidth =3;
        $('#drawTypeLineFlag').attr('src','images/pencilMid.png');
    }else if(data.value==2){
        paramter.lineWidth = 6;
        $('#drawTypeLineFlag').attr('src','images/pencilBig.png');
    }
});

//线的样式
room.on('draw line style msg',function(data){
	if(data.index===0){
		paramter.lineStyle = [0,0];
	}else{
		paramter.lineStyle = [10,10];
	}
	console.log(data.index);
	// $('#drawLineStyle input').attr('checked','false');
	// $('#drawLineStyle input').eq(data.index).attr('checked','checked');
	$('#drawLineStyle input').eq(data.index).click();
});

//鼠标弹起
room.on('mouse up msg',function(){
	drawFlag = false;
	strightFlag = false;
    inputAction(paramter);
    thisaction =[];
	drawStartPoint=[];
	paramter.point=[];
});

//选择写字
room.on('chose draw txt msg',function(){
	cursor = 'text';

    $('.canvasTool li').removeClass('active');
    $('#drawTypeText').addClass('active');

	paramter.type=null;
});

//写字框弹出
room.on('text input show msg',function(data){
	txtStartPoint[0]=(data.pos)[0];
	txtStartPoint[1]=(data.pos)[1];
	$('#fillTxtdiv').show();
	//$('#fillTxtdiv').focus();
});

//写字框大小改变
room.on('text input change msg',function(data){
	$('#fillTxtdiv,#fillTxt').css({'top':txtStartPoint[1],'left':txtStartPoint[0],'width':(data.pos)[0]-txtStartPoint[0],'height':(data.pos)[1]-txtStartPoint[1]});
});

//文字框内容同步
room.on('text input ctn msg',function(data){
	$('#fillTxt').val(decodeURI(data.ctn));
});

//写字
room.on('draw txt msg',function(){
    filltextok();
});

function filltextok(){
    var val = $('#fillTxt').val();
    if(val.length===0){
        $('#fillTxt').val('');
        $('#fillTxtdiv').hide();
        paramter.point=[];
        paramter.ctn='';
    }else{
        paramter.type='text';
        paramter.ctn = val;
        paramter.point=[txtStartPoint[0]-236,txtStartPoint[1]-55];
        ysDraw(paramter);
        $('#fillTxt').val('');
        $('#fillTxtdiv').hide();
        paramter.point=[];
        paramter.ctn='';
    }
    if(cursor==='text'){
        txtInputFlag = false;
    }
}
//上传
room.on('upload file msg',function(data){
	paramter.type = 'upload';
    paramter.ctn = data.data;
    ysDraw(paramter);
    paramter.type = null;
    paramter.ctn = null;

    $('#uploadCtn').hide();
});

//上传pdf
room.on('upload pdf msg',function(data){
	pdfUrl = data.url;
	$('#pdfWrap').show();
	pdfShow(pdfUrl);
});

//前翻pdf
room.on('pdf pre msg',function(){
	console.log('5555');
	nums--;
    pdfShow(pdfUrl);
});

//后翻pdf
room.on('pdf next msg',function(){
	nums++;
    pdfShow(pdfUrl);
});

//关闭pdf
room.on('pdf close msg',function(){
	$('#pdfWrap').hide();
});

//翻滚pdf
room.on('pdf scroll msg',function(data){
	console.log(';5');
	console.log(data);
	$('#pdfWrap').scrollTop(data.height);
});

//新建画布
room.on('create layer msg',function(){
    var liNums = $('.mainTitle li').length+1;
    $('.mainTitle li').removeClass('active');
    $('#createLayer').before('<li class="active"><span>×</span>'+'Page'+liNums+'</li>');
    addPage();
});

//翻页画布----后
//room.on('next layer msg',function(){
//	var curLayerIndex = null;
//	for(var i=0;i<layerArry.length;i++){
//		if(layerArry[i]==layer){
//			console.log('hou'+i);
//			if(i===layerArry.length-1) return;
//			curLayerIndex = i+1 ;
//		}
//		layerArry[i].hide();
//		layerArry[i].draw();
//	}
//	layer = layerArry[curLayerIndex];
//	layerArry[curLayerIndex].show();
//	layerArry[curLayerIndex].draw();
//});

//翻页画布
room.on('pre layer msg',function(data){
    $('.mainTitle li').eq(data.index).addClass('active').siblings().removeClass('active');
    showPage(data.index+1);


    $(this).addClass('active').siblings().removeClass('active');
    var curLayerIndex = $('.mainTitle li').index($(this));

    showPage(curLayerIndex+1);
});

//删除画布
room.on('delete layer msg',function(data){
    var hitIndex = data.index;
    if(hitIndex==0){//
        alert('此页暂时无法删除');
    }else{
        $('.mainTitle li').eq(hitIndex).remove();
        $('.mainTitle li').eq(hitIndex-1).addClass('active').siblings().removeClass('active');
    };

    //删除对应画布的整个DIV
    if(hitIndex>0){
        $('#page'+(hitIndex+1)).remove();
        pagelength -= 1;
    }else{console.error('页面报错')};
    if((hitIndex+1)<$('.mainTitle li').length+1){
        console.log('进入c');
        for(var i=hitIndex;i<($('.mainTitle li').length+1);i++){
            console.log(i);
            console.log($('.mainTitle li').eq(i).html('<span>×</span>Page'+(i+1)));
            $('#page'+(i+1)).attr({id:'page'+i});
            $('#page'+(i+1)+'paper').attr({id:'page'+i+'paper'});
            $('#page'+(i+1)+'down').attr({id:'page'+i+'down'});
            $('#page'+(i+1)+'write').attr({id:'page'+i+'write'});
        }
    }

    //如果页面后边还有页面
    //pagenum = pagenum-1;
    //console.log(pagenum);
    showPage(hitIndex);
})