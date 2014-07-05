/*
*
*画板行为
*
*/ 
//传递对象
var strightFlag = false;
//鼠标形状
var cursor = 'line';
//存放画笔操作
var txtMemory = [];
//文字框开始坐标
var txtStartPoint=[];
var txtInputFlag = false;

//存放拖拽图片
var moveTarget = null;
var dragImage = false;

//cur
var ss=null;

//绘画参数
var paramter = {
	type:'line',    //操作类型
    point:[],
    lineWidth:'1',     //线的宽度
    lineStyle:[0,0],       //虚线
    lineColor:'black', //先的颜色
    fillColor:null,    //填充颜色
    ctn:null    		//内容:文字或图
};

function clone(myObj){
    if(typeof(myObj) != 'object') return myObj;
    if(myObj == null) return myObj;

    var myNewObj = new Object();

    for(var i in myObj)
        myNewObj[i] = clone(myObj[i]);

    return myNewObj;
}

//正常绘画舞台
var painterStage =  new Kinetic.Stage({
    container:'canvas',
    width:$('.canvasWrap').width(),
    height:$('.canvasWrap').height()
});

//pdf绘画舞台
var pdfStage =  new Kinetic.Stage({
    container:'canvas',
    width:$('.canvasWrap').width(),
    height:$('.canvasWrap').height()
});

//stage为当前操作舞台
var stage =painterStage;
//正常舞台绘画撤销
var painterShapesArray =[];

//pdf绘画撤销
var pdfShapesArray =[];

//正常舞台恢复
var painterMemoryArray = [];

//pdf绘画恢复
var pdfMemoryArray = [];

//撤销
var shapesArray =painterShapesArray;
var memoryArray = painterMemoryArray;


//正常绘画层
var painterLayerArry=[];

//pdf绘画层
var pdfLayerArry=[];

var layerArry=painterLayerArry;

layerArry.push(new Kinetic.Layer());
stage.add(layerArry[layerArry.length-1]);
shapesArray[0] = [];
memoryArray[0] = [];
var shapes = shapesArray[0];
var memory = memoryArray[0];
var layer = layerArry[layerArry.length-1];
// 绘画功能

var DrawAction = function(para){
	if(para===null) return; // // //--------->>>>>>>>问题
	switch(para.type){

		case 'line':
			(function(){
                var canvasWidth = $('#canvas').width();
                var canvasHeight = $('#canvas').height();
                para.point[0] = Math.floor(para.point[0]*canvasWidth);
                para.point[1] = Math.floor(para.point[1]*canvasHeight);
                para.point[2] = Math.floor(para.point[2]*canvasWidth);
                para.point[3] = Math.floor(para.point[3]*canvasHeight);
//                stroke:para.lineColor,
				var line = new Kinetic.Line({
					points:para.point,
                    stroke:para.lineColor,
					strokeWidth:para.lineWidth,
					lineCap:'round',
					lineJoin:'round',
					dash:para.lineStyle,
					tension:1
				});
				shapes.push(line);
				layer.add(line);
				layer.draw();
			})();
			paramter.point = [];
			break;
		case 'segment':
			(function(){
                var canvasWidth = $('#canvas').width();
                var canvasHeight = $('#canvas').height();
                para.point[0] = Math.floor(para.point[0]*canvasWidth);
                para.point[1] = Math.floor(para.point[1]*canvasHeight);
                para.point[2] = Math.floor(para.point[2]*canvasWidth);
                para.point[3] = Math.floor(para.point[3]*canvasHeight);
				if(strightFlag){
					if(shapes.length>0){
						shapes[shapes.length-1].hide();
						shapes.splice(shapes.length-1,1);
						layer.draw();
					}
				}
				var line = new Kinetic.Line({
					points:para.point,
					stroke:para.lineColor,
					strokeWidth:para.lineWidth,
					lineCap:'round',
					lineJoin:'round',
					dash:para.lineStyle,
					tension:1
				});
				shapes.push(line);
				layer.add(line);
				layer.draw();
			})();
			paramter.point = [];
			strightFlag = true;
			break;
		case 'circle':
			(function(){
                var canvasWidth = $('#canvas').width();
                var canvasHeight = $('#canvas').height();
                para.point[0] = Math.floor(para.point[0]*canvasWidth);
                para.point[1] = Math.floor(para.point[1]*canvasHeight);
                para.point[2] = Math.floor(para.point[2]*canvasWidth);
                para.point[3] = Math.floor(para.point[3]*canvasHeight);
				if(strightFlag){
					if(shapes.length>0){
						shapes[shapes.length-1].hide();
						shapes.splice(shapes.length-1,1);
						layer.draw();
					}
				}
				var startX = para.point[0];
				var startY = para.point[1];
				var endX = para.point[2];
				var endY = para.point[3];
				var disX = endX - startX;
				var disY = endY - startY;
				var distance = Math.floor(Math.pow((disX * disX + disY * disY), 0.5));
				var line = new Kinetic.Circle({
					x:startX,
					y:startY,
					radius:Math.floor(distance),
					stroke:para.lineColor,
					fill:para.fillColor,
					dash:para.lineStyle,
					strokeWidth:para.lineWidth
				});
				shapes.push(line);
				layer.add(line);
				layer.draw();
			})();
			paramter.point = [];
			strightFlag = true;
			break;
		case 'triangle':
			(function(){
                var canvasWidth = $('#canvas').width();
                var canvasHeight = $('#canvas').height();
                para.point[0] = Math.floor(para.point[0]*canvasWidth);
                para.point[1] = Math.floor(para.point[1]*canvasHeight);
                para.point[2] = Math.floor(para.point[2]*canvasWidth);
                para.point[3] = Math.floor(para.point[3]*canvasHeight);
				if(strightFlag){
					if(shapes.length>0){
						shapes[shapes.length-1].hide();
						shapes.splice(shapes.length-1,1);
						layer.draw();
					}
				}
				var topPoint = [];
				topPoint[0] = Math.floor(((para.point)[0]+(para.point)[2])/2); 
				topPoint[1] = Math.floor(topPoint[0]*1.73/2);
				var line = new Kinetic.Line({
					points:[(para.point)[0],(para.point)[1],topPoint[0],topPoint[1],(para.point)[2],(para.point)[3]],
					stroke:para.lineColor,
					fill:para.fillColor,
					strokeWidth:para.lineWidth,
					dash:para.lineStyle,
					closed:true
				});
				shapes.push(line);
				layer.add(line);
				layer.draw();
			})();
			paramter.point = [];
			strightFlag = true;
			break;
		case 'rect':
			(function(){
                var canvasWidth = $('#canvas').width();
                var canvasHeight = $('#canvas').height();
                para.point[0] = Math.floor(para.point[0]*canvasWidth);
                para.point[1] = Math.floor(para.point[1]*canvasHeight);
                para.point[2] = Math.floor(para.point[2]*canvasWidth);
                para.point[3] = Math.floor(para.point[3]*canvasHeight);
				if(strightFlag){
					if(shapes.length>0){
						shapes[shapes.length-1].hide();
						shapes.splice(shapes.length-1,1);
						layer.draw();
					}
				}
				var startX = para.point[0];
				var startY = para.point[1];
				var endX = para.point[2];
				var endY = para.point[3];
				var width =endX - startX ;
				var height = endY - startY;
				var line = new Kinetic.Rect({
					x:startX,
					y:startY,
					width:width,
					height:height,
					stroke:para.lineColor,
					dash:para.lineStyle,
					fill:para.fillColor=='null'?null:para.fillColor,
					strokeWidth:para.lineWidth
				});
				shapes.push(line);
				layer.add(line);
				layer.draw();
			})();
			paramter.point = [];
			strightFlag = true;
			break;
		case 'earser':
			(function(){
                var canvasWidth = $('#canvas').width();
                var canvasHeight = $('#canvas').height();
                para.point[0] = Math.floor(para.point[0]*canvasWidth);
                para.point[1] = Math.floor(para.point[1]*canvasHeight);
                para.point[2] = Math.floor(para.point[2]*canvasWidth);
                para.point[3] = Math.floor(para.point[3]*canvasHeight);
				var line = new Kinetic.Line({
					points:para.point,
					strokeWidth:para.lineWidth*1.5<6?6:para.lineWidth*2,
                    stroke:'rgba(255,255,255,0)',
					lineCap:'round',
					lineJoin:'round',
					tension:1
				});
				shapes.push(line);
				layer.add(line);
				layer.draw();
			})();
			paramter.point = [];
			break;
		case 'text':
			(function(){
				if(para.txt===null) return; //防止拖动的时候进行复制
				var text = new Kinetic.Text({
					x:para.point[0],
					y:para.point[1],
					text:para.ctn,
					fill:para.lineColor,
					fontSize:16+para.lineWidth*4
				});

				//进行修改
				// text.on('click',function(e){
				// 	oldTxt = e.target;
				// 	oldTxtId = oldTxt._id;
				// 	$('#textPlace').show();
				//     $('#textInput').val(oldTxtCtn);
				//     $('#textInput').focus();
				//     oldTxt.hide();
				//     layer.draw();
				//     // socket.emit('drawChangeTxt',oldTxtId);
				// });
				// text.on('mousedown',function(e){
				// 	socket.emit('dragStartTxt','333')
				// });
				// text.on('mousemove',function(e){
				// 	var txtPoint = [e.evt.clientX,e.evt.clientX,e.target._id,e.target.partialText]
				// 	socket.emit('dragMoveTxt',txtPoint)
				// });
				// text.on('mousemove',function(e){
				// 	socket.emit('dragEndTxt',null)
				// });

				shapes.push(text);
				txtMemory[0] = text;
				layer.add(text);
				layer.draw();
			})();
			break;
		case 'upload':
			(function(){
				var imageObj = new Image();
				imageObj.onload = function() {
				    var image = new Kinetic.Image({
				       x: 400,
				       y: 50,
				       image: imageObj,
				       draggable:false
				    });
				    shapes.push(image);
				    layer.add(image);
				    layer.draw();
				    moveTarget = null;
				    image.on('mousedown',function(e){
				    	moveTarget = e.target._id;
						room.emit('drag image start','333');
					});
					$(document).mousemove(function(e){
						if(moveTarget){
							var curShape = null;
							for(var i=0;i<shapes.length;i++){
								if(shapes[i]._id == moveTarget){
									curShape = shapes[i];
								}
							}
							var txtPoint = [curShape.x(),curShape.y(),moveTarget];
							room.emit('drag image on',txtPoint);
						}
						
					});
					image.on('mouseup',function(e){
						moveTarget = null;
						room.emit('drag image end',null);
					});

				};
				imageObj.src =para.ctn;
			})();
			break;
	}

};


//图片的拖拽
room.on('drag image start msg',function(){
	dragImage = true;
});

room.on('drag image on msg',function(data){
	if(dragImage){
		for(var i=0;i<shapes.length;i++){
			if(shapes[i]._id == (data.ctn)[2]){
				var curShape = shapes[i];
				ss = shapes[i];
				shapes[i].x((data.ctn)[0]);
				shapes[i].y((data.ctn)[1]);
				layer.draw();
			}
		}
	}
});
room.on('drag image end msg',function(){
	layer.draw();
	dragImage = false;
});

//撤销操作
$('#toolCancel').click(function(){
	if(shapes.length===0) return;
	shapes[shapes.length-1].hide();
	memory[memory.length]=shapes.slice(shapes.length-1);
	shapes.splice(shapes.length-1,1);
	layer.draw();
	room.emit('drawCancel',null);
});
room.on('drawOtherCancel',function(data){
	if(shapes.length===0) return;
	shapes[shapes.length-1].hide();
	memory[memory.length]=shapes.slice(shapes.length-1);
	shapes.splice(shapes.length-1,1);
	layer.draw();
});

//恢复操作
$('#toolRepainter').click(function(){
	if(memory.length===0) return;
	shapes[shapes.length]=memory[memory.length-1][0];
	memory.splice(memory.length-1,1);
	shapes[shapes.length-1].show();
	layer.draw();
	room.emit('drawRepainter',null);
});
room.on('drawOtherRepainter',function(data){
	if(memory.length===0) return;
	shapes[shapes.length]=memory[memory.length-1][0];
	memory.splice(memory.length-1,1);
	shapes[shapes.length-1].show();
	layer.draw();
});

