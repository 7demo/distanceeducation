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
var shapes =[];
var memory = [];
var txtMemory = [];
//文字框开始坐标
var txtStartPoint=[];
var txtInputFlag = false;

//存放拖拽图片
var moveTarget = null;
var dragImage = false;

//美术体的变换宽度

var timenow;
var millis = 0;
//cur
var ss=null;

var pencil = 0;

//绘画参数
var paramter = {
    type:'line',    //操作类型
    point:[],
    lineWidth:'2',     //线的宽度
    lineStyle:[0,0],       //虚线
    lineColor:'black', //先的颜色
    fillColor:null,    //填充颜色
    ctn:null    		//内容:文字或图
};

/*var stage = new Kinetic.Stage({
 container:'canvas',
 width:$(window).width()-402,
 height:$(window).height()-70
 });

 var layerArry=[];
 layerArry.push(new Kinetic.Layer());
 stage.add(layerArry[layerArry.length-1]);
 var layer = layerArry[layerArry.length-1];*/

function getPageCanvas(page,layername){
    var context =  document.getElementById('page'+page+layername).getContext('2d');
    return context;
}
function getPage(page,layername){
    var context =  document.getElementById('page'+page+layername);
    return context;
}

//ysdraw即时方法构建
var ysDraw = function (para){
    if(para===null) return;//判断数据非空
    switch(para.type) {  //判断操作类型
        case 'line':
            drawLine(getPageCanvas(pagenum,'write'));
            paramter.point = [];
            break;
        case 'earser' : //亚楠拼错了
            eraser(getPageCanvas(pagenum,'down'));
            paramter.point = [];
            break;
        case 'rect':
            clearPage(getPageCanvas(pagenum,'write'));
            drawRect(getPageCanvas(pagenum,'write'));
            paramter.point = [];
            break;
        case 'circle':
            clearPage(getPageCanvas(pagenum,'write'));
            drawCirc(getPageCanvas(pagenum,'write'));
            break;
        case 'segment':
            clearPage(getPageCanvas(pagenum,'write'));
            drawLine(getPageCanvas(pagenum,'write'),0);
            break;
        case 'text':
            drawText(getPageCanvas(pagenum,'down'));
            break;
        case 'upload':
            drawPaper(getPageCanvas(pagenum,'paper'));
            break;
    }
};
//画图片
function drawPaper(context){
    var img=new Image();



    img.src=paramter.ctn;
    img.onload = function(){context.drawImage(img,0,0);};
}

//写入下层绘画方法构建
function inputAction(para){
    switch (para.type){
        case 'line':
            bzrLine(getPageCanvas(pagenum,'down'));
            clearPage(getPageCanvas(pagenum,'write'));
            break;
        case 'rect':
        case 'circle':
        case 'segment':
            inputDown(getPage(pagenum,'write'),getPageCanvas(pagenum,'down'));
            clearPage(getPageCanvas(pagenum,'write'));
            break;
    }

}
//写入down层
function inputDown(context,contextdown){
    contextdown.drawImage(context,0,0);
}
//画方块
function drawRect(context){
    context.beginPath();
    context.rect(paramter.point[0],paramter.point[1],paramter.point[2]-paramter.point[0],paramter.point[3]-paramter.point[1]);
    context.strokeStyle=paramter.lineColor;
    context.globalCompositeOperation="source-over";
    console.log(context.globalCompositeOperation);
    context.closePath();


    context.stroke();
}
//画圆形
function drawCirc(context){
    context.beginPath();
    context.arc(paramter.point[0],paramter.point[1],paramter.point[2]-paramter.point[0],0,2*Math.PI);
    context.strokeStyle=paramter.lineColor;
    context.globalCompositeOperation="source-over";
    context.closePath();
    context.stroke();
}

//画直线

function drawLine(context,close){

    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = paramter.lineColor;
    context.lineWidth = paramter.lineWidth;
    context.beginPath();
    context.moveTo(paramter.point[0],paramter.point[1]);
    context.lineTo(paramter.point[2],paramter.point[3]);
    context.globalCompositeOperation="source-over";
    if(close){
        context.closePath();
    }
    context.stroke();
}
//橡皮擦
function eraser(context){
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth =  paramter.lineWidth+2;
    context.fillStyle = 'black';
    context.beginPath();
    context.moveTo( paramter.point[0],paramter.point[1] );
    context.lineTo(paramter.point[2],paramter.point[3] );
    context.globalCompositeOperation="destination-out";
    context.stroke();
    context.globalCompositeOperation="source-over";

}
function clearPage(context){
        var canvasWidth = $('#canvas').width();
        var canvasHeight =  $('#canvas').height();
        context.clearRect(0,0,canvasWidth,canvasHeight);
}
//贝塞尔优化函数

function bzrLine(context){
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = paramter.lineColor;
    context.lineWidth =  paramter.lineWidth;
    context.beginPath();
    context.moveTo(thisaction[0][0], thisaction[0][1]);
    for (i = 1; i < thisaction.length - 2; i ++)
    {
        var xc = (thisaction[i][0] + thisaction[i + 1][0]) / 2;
        var yc = (thisaction[i][1] + thisaction[i + 1][1]) / 2;
        context.quadraticCurveTo(thisaction[i][0], thisaction[i][1], xc, yc);
    }
    context.quadraticCurveTo(thisaction[thisaction.length-2][0], thisaction[thisaction.length-2][1], thisaction[thisaction.length-1][0],thisaction[thisaction.length-1][1]);
    context.globalCompositeOperation="source-over";
    context.stroke();
}

//写字功能
function drawText(context){
    context.font="20px Georgia";
    context.fillStyle=paramter.lineColor;
    context.globalCompositeOperation="source-over";
    context.fillText(paramter.ctn,paramter.point[0],paramter.point[1]);
}
/*
 // 绘画功能
 Sketch.create({

 container: document.getElementById( 'canvas' ),
 autoclear: false,

 setup: function() {
 console.log( 'setup' );
 },

 update: function() {
 radius = 2 + abs( sin( this.millis * 0.003 ) * 5 );
 },
 mousemove:function(){
 if(!pencil) return;

 console.log(this.globalCompositeOperation);
 //画线
 var oldcomposite = this.globalCompositeOperation;*//*

 if(paramter['type']=='line'){
 for ( var i = this.touches.length - 1, touch; i >= 0; i-- ) {
 touch = this.touches[i];
 this.lineCap = 'round';
 this.lineJoin = 'round';
 this.fillStyle = this.strokeStyle = 'black';
 this.lineWidth = radius;

 this.beginPath();
 this.moveTo( touch.ox, touch.oy );
 this.lineTo( touch.x, touch.y );
 oldcomposite="source-over";
 this.stroke();
 }
 if(paramter['type']=='eraser'){
 for ( var i = this.touches.length - 1, touch; i >= 0; i-- ) {
 touch = this.touches[i];
 this.lineCap = 'round';
 this.lineJoin = 'round';
 this.fillStyle = this.strokeStyle = 'black';
 this.lineWidth = radius;
 this.beginPath();
 this.moveTo( touch.ox, touch.oy );
 this.lineTo( touch.x, touch.y );
 oldcomposite="destination-out";
 this.stroke();
 }
 }

 }
 }





 // Mouse & touch events are merged, so handling touch events by default
 // and powering sketches using the touches array is recommended for easy
 // scalability. If you only need to handle the mouse / desktop browsers,
 // use the 0th touch element and you get wider device support for free.

 //PAD的手动触控
 //             touchmove: function() {
 //
 //                for ( var i = this.touches.length - 1, touch; i >= 0; i-- ) {
 //
 //                    touch = this.touches[i];
 //
 //                    this.lineCap = 'round';
 //                    this.lineJoin = 'round';
 //                    this.fillStyle = this.strokeStyle = COLOURS[ i % COLOURS.length ];
 //                    this.lineWidth = radius;
 //
 //                    this.beginPath();
 //                    this.moveTo( touch.ox, touch.oy );
 //                    this.lineTo( touch.x, touch.y );
 //                    this.stroke();
 //                }
 //            }
 });





 */



/*
 var DrawAction = function(para){
 if(para===null) return; // // //--------->>>>>>>>问题
 //alert(1);
 switch(para.type){

 case 'line':
 (function(){
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
 //                var startX = para.point[0];
 //                var startY = para.point[1];
 //               // var distance = Math.floor(Math.pow((disX * disX + disY * disY), 0.5));
 //                var distance = para.lineWidth*1<6?6:para.lineWidth*1;
 //                var line =new Kinetic.EraserCircle({
 //                    x:startX,
 //                    y:startY,
 //                    radius:Math.floor(distance),
 //                    fill:'#00D2FF',
 //                    strokeWidth:3
 //                });
 //                //console.log(.length);
 //                shapes.push(line);
 //                layer.add(line);
 //                layer.draw();
 layer.clear();

 //				var line = new Kinetic.Line({
 //
 //					points:para.point,
 //					stroke:'#000000',
 //					strokeWidth:para.lineWidth*1.5<6?6:para.lineWidth*2,
 //					lineCap:'round',
 //					lineJoin:'round',
 //					tension:1
 //				});
 //				shapes.push(line);
 //				layer.add(line);
 //				layer.draw();
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
 draggable:true
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



 function makeShapeComposite(shape, operation) {

 shape.attrs._sceneFunc = shape.attrs.sceneFunc;

 shape.attrs.sceneFunc = function (context) {
 context.save();
 context.globalCompositeOperation = operation;
 this.attrs._sceneFunc.call(this, context);
 console.log(context.globalCompositeOperation);
 context.restore();
 };
 return shape; //For easier insertion in code.
 }

 */