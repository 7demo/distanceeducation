var socketio = require('socket.io');
var path = require('path');
var request = require('request');
var querystring = require('querystring');
var fs = require('fs');
var http = require('http');

module.exports.listen = function(app){
    io = socketio.listen(app);
    function contains(arr, str) {
        var i = arr.length;
        while (i--) {
            if (arr[i] === str) {
                return i;
            }
        }
        return -1;
    }

    /*
    *
    *  数据库---roomInfo 为存放所有房间信息,所有信息
    *
    *
    * */

    var roomInfo =[]; //存放房间信息
    //全局变量信息
    var class_info=[];
    room = io.of('/room').on('connection',function(socket){
        //写入文件
        var uptime = 0;
        var nowtime = 0;
        var systick = 0;
        var nowtick = 0;
        var sysa;
        //写入文件
        var onClassWrite = false;
        var startWrite = 0;
        //进入房间
        var curName = null; //当前房间名字
        var userName = null; //当前用户名字
        var roomIndex = 0;
        socket.on('teacher join room', function (name) {

            if(roomInfo.length>0){  //已有房间存在的情况下
                for(var m=0;m<roomInfo.length;m++){
                    if(roomInfo[m].roomID==name.roomID){
                        room.emit('classroom admin',roomInfo[m]);
                        console.log(roomInfo[m]);
                        curName = name.roomID;
                        userName = name.user;
                        return;
                    }
                };
            }

            socket.join(name.roomID);
            curName = name.roomID;
            userName = name.user;


            /*
             *
             *  数据库---教师创建当前房间信息，并设置默认值
             *
             *
             * */
            roomInfo[roomInfo.length]={
                 roomID:name.roomID,
                 roomName:name.user,
                 DstudentArray:[],
                 UstudentArray:[],
                 teacherID:'',
                 classID:'135153153',
                 onStudent:''
            };

            socket.emit('permission',{
                roomName:roomInfo[roomIndex].roomName,
                students:roomInfo[roomIndex].DstudentArray
            });

            socket.broadcast.to(curName).emit('rooms other perple',{
                roomName:roomInfo[roomIndex].roomName,
                students:roomInfo[roomIndex].DstudentArray
            });
        });

        socket.on('student join room', function (name) {
            console.log('进入为学生');
            socket.sidd = name;
            console.log(socket.id+')))________++++++')
            socket.join(name.roomID);
            curName = name.roomID;
            userName = name.user;
            var isHasRoom = true;
            for(var i=0;i<roomInfo.length;i++){
                console.log(roomInfo[i].roomID)
                console.log(name.roomID)
                if(roomInfo[i].roomID == name.roomID){

                    //断电重连学生
                    for(var j=0;j<roomInfo[i].UstudentArray.length;j++){
                        if(roomInfo[i].UstudentArray[j]==name.user){
                            console.log('学生'+name.user+'重连');
                            return;
                        };
                    }
                    /*
                     *
                     *  数据库---在当前房间 在旁听列表写入学生信息
                     *
                     *
                     * */
                    roomInfo[i].DstudentArray.push(name.user); //增加学生到旁听列表
                    roomIndex = i;
                    isHasRoom = false;
                }
            }
            if(isHasRoom){  //房间不存在
                return;
            }
            socket.emit('permission',{
                roomName:roomInfo[roomIndex].roomName,
                students:roomInfo[roomIndex].DstudentArray
            })

            socket.broadcast.to(curName).emit('rooms other perple',{
                roomName:roomInfo[roomIndex].roomName,
                students:roomInfo[roomIndex].DstudentArray
            });
        });

        //房间列表刷新方法
        socket.on('reload list',function(ctn){
            socket.emit('reload list msg',{
                UpStudent:roomInfo[roomIndex].UstudentArray,
                DownStudent:roomInfo[roomIndex].DstudentArray
            })
            socket.broadcast.to(curName).emit('reload list other msg',{
                UpStudent:roomInfo[roomIndex].UstudentArray,
                DownStudent:roomInfo[roomIndex].DstudentArray
            })

        });


        //聊天
        socket.on('add chat',function(ctn){
            socket.broadcast.to(curName).emit('chat msg student',{
                ctn:ctn
            });
            socket.emit('chat msg slef',{
                ctn:ctn
            });
        });

        //通知鼠标位置
        socket.on('mouse location',function(data){
            socket.broadcast.to(curName).emit('mouse location msg',{
                data:data
            });
            writelog('m',data);
        });

        //移动操作
        socket.on('draw type move',function(data){
            socket.broadcast.to(curName).emit('draw type move msg',{

            });
            writelog('dtm',data);
        });

        //选择划线
        socket.on('draw type line',function(data){
            socket.broadcast.to(curName).emit('draw type line msg',{

            });
            writelog('dtlm',data);
        });

        //点击橡皮擦
        socket.on('draw type earser',function(data){
            socket.broadcast.to(curName).emit('draw type earser msg',{

            });
        });

        //进行形状操作
        socket.on('draw type shape',function(data){
            socket.broadcast.to(curName).emit('draw type shape msg',{

            });
            writelog('dtsm',data);
        });

        //形状内容操作
        socket.on('draw type shape ctn',function(data){
            socket.broadcast.to(curName).emit('draw type shape ctn msg',{
                data:data
            });
            writelog('dtscm',data);
        });

        //进行颜色操作
        socket.on('draw type color',function(data){
            socket.broadcast.to(curName).emit('draw type color msg',{

            });
            writelog('dtcm',data);
        });

        //线的颜色
        socket.on('draw line color',function(color){
            socket.broadcast.to(curName).emit('draw line color msg',{
                color:color
            });
            writelog('dlc',color);
        });

        //图形填充色
        socket.on('draw color',function(color){
            socket.broadcast.to(curName).emit('draw color msg',{
                color:color
            });
            writelog('dlc',color);
        });

        //线的宽度
        socket.on('draw line width',function(value){
            socket.broadcast.to(curName).emit('draw line width msg',{
                value:value
            });
            writelog('dlw',value);
        });

        //线的样式
        socket.on('draw line style',function(index){
            socket.broadcast.to(curName).emit('draw line style msg',{
                index:index
            });
            writelog('dls',index);
        });

        //画画
        socket.on('draw line',function(para){
            socket.broadcast.to(curName).emit('draw line msg',{
                para:para
            });
            writelog('dl',para);
        });

        //选择写字
        socket.on('chose draw txt',function(){

            socket.broadcast.to(curName).emit('chose draw txt msg',{
            });
            writelog('cdt','0');
        });

        //写字框弹出
        socket.on('text input show',function(pos){
            console.log('show');
            socket.broadcast.to(curName).emit('text input show msg',{
                pos:pos
            });
            writelog('tis',pos);
        });

        //写字框大小变化
        socket.on('text input change',function(pos){
            socket.broadcast.to(curName).emit('text input change msg',{
                pos:pos
            });
            writelog('tic',pos)
        });

        //文字框内容同步
        socket.on('text input ctn',function(ctn){
            socket.broadcast.to(curName).emit('text input ctn msg',{
                ctn:ctn
            });
            writelog('ticm',ctn);
        });

        //确定写字
        socket.on('draw txt',function(){
            socket.broadcast.to(curName).emit('draw txt msg',{
            });
            writelog('dtm','0');
        });

        //出现上传框
        socket.on('show upload file',function(){
            socket.broadcast.to(curName).emit('show upload file msg',{
            });
            writelog('sufm','0');
        });

        //上传到右边列表
        socket.on('upload file list',function(data){
            socket.broadcast.to(curName).emit('upload file list msg',{
                type:data.type,
                url:data.url,
                name:data.name,
                user:data.user
            });

            for(var i=0;i<roomInfo.length;i++){
                if(roomInfo[i].roomID == data.roomId){

                    /*
                     *
                     *  数据库---在当前房间 上传文件后写入到上课学生列表，同时在旁听列表中删除
                     *
                     *
                     * */
                    roomInfo[i].UstudentArray.push(data.user);
                    for(var m=0;m<(roomInfo[i].DstudentArray).length;m++){
                        if((roomInfo[i].DstudentArray)[m]==data.user){
                            (roomInfo[i].DstudentArray).splice(m,1);
                        }
                    }

                }
            };

            writelog('uflm',data);
        });

        //上传操作
        socket.on('upload file',function(data){
            socket.broadcast.to(curName).emit('upload file msg',{
                data:data
            });
            writelog('ufm',data);
        });


        //撤销
        socket.on('drawCancel',function(){
            socket.broadcast.to(curName).emit('drawOtherCancel',{

            });
            writelog('doc','0');
        });

        // 回复操作
        socket.on('drawRepainter',function(){
            socket.broadcast.to(curName).emit('drawOtherRepainter',{

            });
            writelog('dor','0');
        });

        //鼠标弹起
        socket.on('mouse up',function(){
            socket.broadcast.to(curName).emit('mouse up msg',{

            });
            writelog('mum','0');
        });

        //图片拖拽开始
        socket.on('drag image start',function(){
            socket.broadcast.to(curName).emit('drag image start msg',{

            });
            writelog('dism','0');
        });

        //图片拖拽过程
        socket.on('drag image on',function(pos){
            socket.broadcast.to(curName).emit('drag image on msg',{
                ctn:pos
            });
            writelog('diom',pos);
        });

        //右边学生与作业切换
        socket.on('rightRitle slide',function(data){
            socket.broadcast.to(curName).emit('rightRitle slide msg',{
                type:data
            });
            writelog('rrsm',data);
        });

        // 上传pdf
        socket.on('upload pdf',function(url){
            socket.broadcast.to(curName).emit('upload pdf msg',{
                url:url
            });
            writelog('upm',url);
        });

        //翻页pdf——前翻
        socket.on('pdf pre',function(){
            socket.broadcast.to(curName).emit('pdf pre msg',{
            });
            writelog('pdfp','0');
        });

        //翻页pdf——后翻
        socket.on('pdf next',function(){
            socket.broadcast.to(curName).emit('pdf next msg',{
            });
            writelog('pdfn','0');
        });

        //翻页pdf——关闭
        socket.on('pdf close',function(){
            socket.broadcast.to(curName).emit('pdf close msg',{
            });
            writelog('pdfc','0');
        });

        //pdf滚动
        socket.on('pdf scroll',function(height){
            socket.broadcast.to(curName).emit('pdf scroll msg',{
                height:height
            });
            writelog('psm','0');
        });

        //图片拖拽结束
        socket.on('drag image end',function(){
            socket.broadcast.to(curName).emit('drag image end msg',{

            });
            writelog('diem','0');
        });

        //新建画布
        socket.on('create layer',function(){
            socket.broadcast.to(curName).emit('create layer msg',{

            });
            writelog('clm','0');
        });

        //翻页画布
        socket.on('pre layer',function(index){
            socket.broadcast.to(curName).emit('pre layer msg',{
                index:index
            });
            writelog('plm',index);
        });

        //删除
        socket.on('delete layer',function(index){
            socket.broadcast.to(curName).emit('delete layer msg',{
                index:index
            });
        });

        //断开操作
        socket.on('disconnect',function(){
            console.log(socket.sidd)
            //通知人已走
//        request('http://localhost:3000/php',{form:{key:'这是什么东西'}} ,function (error, response, body) {
//            if (!error && response.statusCode == 200) {
//                console.log(body) // Print the body of response.
////                console.log(response) // Print the body of response.
//            }
//
//
//
//
//        })
//        for(var i=0;i<roomInfo.length;i++){
//            var roomMan = roomInfo[i].studentArray;
//
//            if(roomMan[0]==userName){  //教师离开
//                roomInfo.splice(i,1);
//                console.log(roomInfo)
//                socket.broadcast.to(curName).emit('disslove room',null)
//                return;
//            }
//            for(var m=0;m<roomMan.length;m++){  //学生离开
//                if(roomMan[m]==userName){
//                    console.log(roomInfo[i])
//                    roomInfo[i].studentArray.splice(m,1);
//                    socket.broadcast.to(curName).emit('update room students',roomInfo[i].studentArray);
//                }
//            }
//        };

        });

        function searchroom(roomName){
            for(var i=0;i<roomInfo.length;i++){
                if(roomInfo[i].roomID == roomName){
                    return roomInfo[i];
                }
            }
        }



        //接收上课指令
        socket.on('is on class now',function(roomName){

            /*
             *
             *  数据库---开始上课，把学生列表中的第一个 赋值到 当前上课学生，并在学生列表删除
             *
             *
             * */

            roomInfo[roomIndex].onStudent = (roomInfo[roomIndex].UstudentArray)[0];
            (roomInfo[roomIndex].UstudentArray).splice(0,1);


            var tid = 1;
            var sid = 1;
            var classid = 0;

            console.log('开始上课');
            console.log('老师ID，老师姓名，学生ID，学生姓名，时间戳');
            //给老胡法开始命令  老师ID  学生ID

            var post_data = querystring.stringify({
                tid : 1,
                sid : 1
            });
            var options = {
                host: '172.16.3.141',
                port: 80,
                path: '/Interface/beginClass',
                method: 'POST',
                headers: {
                    "Content-Type": 'application/x-www-form-urlencoded',
                    "Content-Length": post_data.length
                }
            };
            var req = http.request(options, function(res) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    var jsonobj=eval('('+chunk+')');
                    if(jsonobj['code']==200){
                        classid = jsonobj['data']['classID'];

                        for(var i=0;i<roomInfo.length;i++){
                            if(roomInfo[i].roomID == roomName){
                                roomInfo[i].classID = classid;
                                console.log(roomInfo[i].classID);
                                onClassWrite = true;
                            }
                        }
                    }
                });
            });

            req.write(post_data + "\n");
            req.end();
            //根据返回classID 创建TXT文件

            //开始写入命令
        });
        //接收下课指令
        socket.on('is on class out',function(){


            /*
             *
             *  数据库---结束上课，清空当前上课学生名单
             *
             *
             * */
            //结束上课
            roomInfo[roomIndex].onStudent ='';
            console.log('####');
            console.log(roomInfo[roomIndex]);
            socket.emit('fresh shtudent list msg',{
                UpStudent:roomInfo[roomIndex].UstudentArray,
                DownStudent:roomInfo[roomIndex].DstudentArray
            });
            socket.broadcast.to(curName).emit('fresh shtudent list other msg',{
                UpStudent:roomInfo[roomIndex].UstudentArray,
                DownStudent:roomInfo[roomIndex].DstudentArray
            });

            console.log('结束上课');
            onClassWrite = false;
            startWrite = 0;
            var classid= 0;
            var content = '';
            for(var i=0;i<roomInfo.length;i++){
                if(roomInfo[i].roomID == curName){
                    classid = roomInfo[i].classID;
                }
            }

            fs.readFile(classid+'.txt','utf-8',function(err,data){
                if(err){
                    console.log('if');
                    console.error(err);
                } else{
                    content = data;
                    console.log('222'+content);
                    var post_data = querystring.stringify({
                        classID : classid,
                        content : content,
                        papersrc : '111'
                    });
                    var options = {
                        host: '172.16.3.141',
                        port: 80,
                        path: '/Interface/endClass',
                        method: 'POST',
                        headers: {
                            "Content-Type": 'application/x-www-form-urlencoded',
                            "Content-Length": post_data.length
                        }
                    };
                    var req = http.request(options, function(res) {
                        res.setEncoding('utf8');
                        res.on('data', function (chunk) {
                            var jsonobj=eval('('+chunk+')');
                            if(jsonobj['code']==200){
//                    classid = jsonobj['data']['classID'];
//
//                    for(var i=0;i<roomInfo.length;i++){
//                        if(roomInfo[i].roomID == roomName){
//                            roomInfo[i].classID = classid;
//                            console.log(roomInfo[i].classID);
//                            onClassWrite = true;
//                        }
//                    }
                                console.log('和老胡对接完成');
                            }
                        });
                    });

                    req.write(post_data + "\n");
                    req.end();
                }
            });

            //给老胡发送classID 对应的 contents papers

            //根据你返回的code 反应到前台是否储存成功
        });
        //接收下一个学生指令
        socket.on('newt student',function(roomName){
            if((roomInfo[roomIndex].UstudentArray).length==0) {
                console.log('已经没有人了');
                return
            };

            socket.emit('fresh shtudent list msg',{
                UpStudent:roomInfo[roomIndex].UstudentArray,
                DownStudent:roomInfo[roomIndex].DstudentArray
            });
            socket.broadcast.to(curName).emit('fresh shtudent list other msg',{
                UpStudent:roomInfo[roomIndex].UstudentArray,
                DownStudent:roomInfo[roomIndex].DstudentArray
            });


            /*
             *
             *  数据库---在授课进行时，点击下一个的时候，把当前学生列表的第一个赋值到当前上课学生，并在学生列表删除
             *
             *
             * */

            roomInfo[roomIndex].onStudent = (roomInfo[roomIndex].UstudentArray)[0];
            (roomInfo[roomIndex].UstudentArray).splice(0,1);

//        for(var i=0;i<roomInfo.length;i++){
//            if(roomInfo[i].roomID == roomName){
//                if(roomInfo[i].UstudentArray.length){
//                    roomInfo[i].onStudent = roomInfo[i].UstudentArray[0];
//                    roomInfo[i].UstudentArray.splice(0,1);
//                    console.log(roomInfo[i].UstudentArray);
//                    console.log(roomInfo[i].onStudent+'已经开始了');
//                    socket.emit('fresh shtudent list msg',{
//                        UpStudent:roomInfo[roomIndex].UstudentArray,
//                        DownStudent:roomInfo[roomIndex].DstudentArray
//                    });
//                    socket.emit('fresh shtudent list other msg',{
//                        UpStudent:roomInfo[roomIndex].UstudentArray,
//                        DownStudent:roomInfo[roomIndex].DstudentArray
//                    });
//
//                }else{
//                    console.log('没学生了');
//                }
//            }
//        }
        })

        function writelog (a,data){
            if(!onClassWrite)return;

            var myDate = new Date();
            if(!uptime){
                systick = 0;
                uptime = myDate.getTime();
                sysa = a;
            }else{
                nowtime = myDate.getTime();
                nowtick = Math.ceil((nowtime-uptime)*30/1000);
            }

            if(systick==nowtick){
                if(a!=sysa){
                    writedo(a,data);
                }else if(a==sysa && a!="m"){
                    writedo(a,data);
                }
            }else{
                writedo(a,data);

            }
        }

        function writedo(a,data){
            var k = '';
            var classid= 0;
            for(var i=0;i<roomInfo.length;i++){
                if(roomInfo[i].roomID == curName){
                    classid = roomInfo[i].classID;
                }
            }
            if(startWrite == 0){//第一次写
                k = '{a:"'+a+'",data:"'+data+'",tick:'+nowtick+'}';
                startWrite = 1;
                console.log('change'+startWrite);
            }else{
                k = ',{a:"'+a+'",data:"'+data+'",tick:'+nowtick+'}';
                console.log('zhengchang'+startWrite);
            }
            fs.appendFile(classid+'.txt',k,'utf-8', function(err){
                if(err){
                    // console.log('写入文件失败');
                }else{
                    systick = nowtick;
                    sysa = a;
                    // console.log('保存成功, 赶紧去看看乱码吧');
                }
            })

        }

    });

    return io;
}
