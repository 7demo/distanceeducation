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
            drawLine(getPageCanvas(pagenum,'write'),1);
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
   // console.log(para.type)
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
// function inputAction(para){
//     switch (para.type){
//         case 'line':
//             bzrLine(getPageCanvas(pagenum,'down'));
//             clearPage(getPageCanvas(pagenum,'write'));
//             break;
//         default:
//             inputDown(getPage(pagenum,'write'),getPageCanvas(pagenum,'down'));
//             clearPage(getPageCanvas(pagenum,'write'));
//     }

// }
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
 