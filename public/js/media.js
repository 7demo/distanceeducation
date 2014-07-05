/*
 media.js 
 用于处理教学房间中的各种webrtc请求，实现视频音频通信
 
 火狐下始终有问题，视频不能直接显示，peerconnection也没通，预计是RTCPeerConnection初始化的问题
 
 JerryWong  2014.6.18
*/
var MediaStatus = {
    INITIALIZING: 0,
    CONNECTING: 1,
    CONNECTED: 2,
    DISCONNECTED: 3
};

function UserMedia() {
    this.pc = null;
    this.stream = null;
    this.status = MediaStatus.INITIALIZING;
}

function Media(sendMsg) {

    this.sendMsg = sendMsg;

    function trace(desc, obj) {
        if (obj) {
            console.log(desc + ':', obj);
        } else {
            console.log(desc);
        }
    }

    var self = this;
	this.isOpened = false;//判断是否已经点击开启，避免重复弹框
    var RTCPeerConnection = window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection ||window.mozRTCPeerConnection|| window.webkitDeprecatedPeerConnection || window.webkitPeerConnection;
   // var RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection || window.RTCPeerConnection;
    var URL = (window.URL || window.webkitURL || window.msURL || window.oURL);
    this.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    this.RTCSessionDescription = (window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription);
    this.RTCIceCandidate = (window.RTCIceCandidate || window.webkitRTCIceCandidate || window.mozRTCIceCandidate);

    this.users = {};
    this.stream = null;

    this.constraints = {
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        }
    };

    this.errorHandler = function(error) {
        trace('error', error);
    };

    this.attachMediaStream = function(element, stream) {
        element.src = URL.createObjectURL(stream);
        element.play();
    };

	/*全屏函数，传入的element为Dom对象 如var elem = document.getElementById("myvideo")*/
	this.fullScreen = function(element){
	    if(element.requestFullScreen) {
		element.requestFullScreen();
	  } else if(element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	  } else if(element.webkitRequestFullScreen) {
		element.webkitRequestFullScreen();
	  }
	};
	
	/*开关闭别人的音频*/
	this.audioControl = function(element,vol){
	  console.log(element.id+" "+vol);
	   if(vol == 0)
	      element.muted = true;
		else
		  element.muted = false;
	};
	
    /*共享屏幕*/
    this.shareScreen = function() {
        /* this.getUserMedia.call(navigator, {
			audio: true,
			video: {
			mandatory: {
			 chromeMediaSource: 'screen',
			 maxWidth: 1350,
			 maxHeight: 800
			   },
			 optional: []
			}
        }, function(stream) {  //or
             document.getElementById('remote-screen').src = URL.createObjectURL(stream);
             $("#screen-share").show();			 
             },
             function(error) { 
             console.log(error);			 
			// alert("失败！");
            });*/
    };

    /*this.close_shareSreen = function (){	
	   var data = {
			type: "close_sharescreen"
		};
		var msg = {
			data: JSON.stringify(data)
		};
		self.sendMsg(msg);
		
	   if(self.stream){
	   for(remorepeer in this.users){
		   remorepeer.pc.addStream(self.stream);   
	   }
	   }
	   $('#share-myscreen').val("屏幕广播");   
	};*/

    this.showVideo = function(stream, name, mirror) {
        $parent = $('.video-area');
        //$videoWrapper = $('<div class="video-wrapper"></div>').attr('id', 'uid_'+name);
        if(name == 'me'){
            $videoWrapper = $parent.find('.video-wrapper-me').eq(0);
        }else{
            $videoWrapper = $parent.find('.video-wrapper-other:not(.video-rendered)').eq(0);
        }
        $videoWrapper.data('orginChild', $videoWrapper.children().detach()).addClass('video-rendered').attr('id', 'uid_' + name);

        $video = $('<video autoplay="autoplay"></video>').attr('id', 'vuid_' + name);
        if (mirror) { //是否镜像
            $video.addClass('mirror-video');
        }
        self.attachMediaStream($video[0], stream);

        $videoWrapper.append($video);
        //$parent.append($videoWrapper);
    };

    this.showAudio = function(stream, name) {
        $parent = $('.video-area');
        //$audioWrapper = $('<div class="video-wrapper" ></div>').attr('id', 'uid_'+name);
        if(name == 'me'){
            $audioWrapper = $parent.find('.video-wrapper-me').eq(0);
        }else{
            $audioWrapper = $parent.find('.video-wrapper-other:not(.video-rendered)').eq(0);
        }
        $audioWrapper.data('orginChild', $audioWrapper.children().detach()).addClass('video-rendered').attr('id', 'uid_' + name);

        $audio = $('<audio autoplay></audio>').attr('id', 'auid_' + name);
        $audioimg = $('<img src="/static/img/audio.jpg" style="width:195px;height:148px;"></img>');

        self.attachMediaStream($audio[0], stream);
        $audioWrapper.append($audioimg);
        $audioWrapper.append($audio);
        //$parent.append($audioWrapper);
    };


    /*下面两个函数用来开关闭音视频流，参数为true的话就关闭，否则开启*/
    this.VideoMute = function(isVideoMuted) {
        videoTracks = self.stream.getVideoTracks();
        if (videoTracks.length === 0) {
            console.log("No local video available.");
            return;
        }

        if (isVideoMuted) {
            for (i = 0; i < videoTracks.length; i++) {
                videoTracks[i].enabled = true;
            }
            console.log("Video unmuted.");
        } else {
            for (i = 0; i < videoTracks.length; i++) {
                videoTracks[i].enabled = false;
            }
            console.log("Video muted.");
        }
       // isVideoMuted = !isVideoMuted;
    };

    this.AudioMute = function(isAudioMuted) {
        audioTracks = self.stream.getAudioTracks();
        if (audioTracks.length === 0) {
            console.log("No local audio available.");
            return;
        }
        if (isAudioMuted) {
            for (i = 0; i < audioTracks.length; i++) {
                audioTracks[i].enabled = true;
            }
            console.log("Audio unmuted.");
        } else {
            for (i = 0; i < audioTracks.length; i++) {
                audioTracks[i].enabled = false;
            }
            console.log("Audio muted.");
        }

       // isAudioMuted = !isAudioMuted;
    };

    this.processSignaling = function(msg) {
        var data = JSON.parse(msg.data);
        var to = msg.from;
        // trace("from", to);
        //trace("type", data.type);
        if (data.type === 'ready') {
            if (self.isConnected(to) &&
                self.users[to].status === MediaStatus.INITIALIZING) {
                self.callout(to);
            }
        } else if (data.type === 'ice') {
            if (self.isConnected(to)) {
                var candidate = new self.RTCIceCandidate(JSON.parse(data.ice));
                self.users[to].pc.addIceCandidate(candidate);
            }
        } else if (data.type === 'offer') {
            if (self.isConnected(to)) {
                var desc = new self.RTCSessionDescription(data);
                self.users[to].pc.setRemoteDescription(desc);
                self.answer(to);
            }
        } else if (data.type === 'answer') {
            if (self.isConnected(to)) {
                var desc = new self.RTCSessionDescription(data);
                self.users[to].pc.setRemoteDescription(desc);
                self.users[to].status = MediaStatus.CONNECTED;
            }
        } else if (data.type === 'sharescreen') {
            self.users[to].onaddstream = function(event) {
                self.users[to].stream = event.stream;
                self.showRemoteScreen(event.stream);
            };
        } else if (data.type === 'close_sharescreen') {

        }

    };

    this.userJoin = function(uid) {
        this.users[uid] = new UserMedia(); //本地维护一个Remotepeers集合
        //document.getElementById('reminder').play();
        /* remind_audio = new Audio('img/remind.wav'); 		  
          remind_audio.play();	*/
    };

    this.userLeave = function(uid) {
        this.removeUser(uid);
    };

    this.removeUser = function(uid) {
        var user = self.users[uid];
        if (!user) {
            return;
        }
        $('#auid_' + uid).remove();
        $('#vuid_' + uid).remove();
        $('#uid_' + uid).removeClass('video-rendered').empty().append($('#uid_' + uid).data('orginChild'));

        delete self.users[uid];
    };

    this.isConnected = function(to) {
        var user = self.users[to];
        if (!user) {
            user = self.users[to] = new UserMedia();
        }
        if (!user.pc /*&& self.stream*/ ) {
            self.connect(to);
            if (!user.pc) { //中继server有问题
                self.removeUser(to);
                var data = {
                    type: "fail"
                };
                var msg = {
                    to: to,
                    data: JSON.stringify(data)
                };
                self.sendMsg(msg);
                return false;
            }
            if (self.stream) {
                user.pc.addStream(self.stream);
            }
        }
        return true;
    };

    this.connect = function(to) {
        var server = {
            iceServers: [{
                    url: "stun:115.28.41.94"
                }, {
                    url: "turn:haijiaoedu.com@115.28.41.94",
                    credential: "bc807ee29df3c9ffa736523fb2c4e8ee"
                }, {
                    url: "turn:haijiaoedu1@202.120.1.47",
                    credential: "9a68969e15884a370ba10429dd2a35541"
                }
                /*,
			{
			url: "turn:115.29.46.185",
			credential: "idO9d8kL",
			username: "prinbit"
			}*/
            ]
        };
      //  trace('server', server);

        var pc = self.users[to].pc = new RTCPeerConnection(server);
        pc.onicecandidate = function(event) {
            if (event.candidate) {
                // send this to server
                var data = {
                    type: "ice",
                    ice: JSON.stringify(event.candidate)
                };
                var msg = {
                    to: to,
                    data: JSON.stringify(data)
                };
                self.sendMsg(msg);
            }
        };

        pc.onaddstream = function(event) {
            self.users[to].stream = event.stream;
            if (event.stream.getVideoTracks().length > 0)
                self.showVideo(event.stream, to);
            else {
                self.showAudio(event.stream, to);
            }
        };

        pc.onremovestream = function(event) {
           // trace('remove stream', event);
        };
		
		//数据连接***
	/*	pc.ondatachannel = function(event) {
            that.addDataChannel(socketId, event.channel);
        };*/
    };
	
	
	

    this.start = function(options, callback) {
	
	    this.isOpened = true; 

        options.video = !! options.video; //获取布尔值
        options.audio = !! options.audio;

        this.getUserMedia.call(navigator, options, function(stream) { //or

                if (stream.getVideoTracks().length > 0) {
                    self.showVideo(stream, 'me', false);
                    document.getElementById('vuid_me').muted = true;
                } else {
                    self.showAudio(stream, 'me');
                    document.getElementById('auid_me').muted = true;
                }

                self.stream = stream;
                var data = {
                    type: "ready"
                };
                var msg = {
                    data: JSON.stringify(data)
                };
                //trace("Ready", msg);
                self.sendMsg(msg);

                callback && callback();
            },
            function(error) {
                var data = {
                    type: "ready"
                };
                var msg = {
                    data: JSON.stringify(data)
                };
                self.sendMsg(msg);
                alert("设备不存在或已被使用，当前将不能使用语音/视频功能");
            });
    };

    this.callout = function(to) {
        trace('createOffer');
        self.users[to].status = MediaStatus.CONNECTING;
        var pc = self.users[to].pc;
        pc.createOffer(function(description) {
            pc.setLocalDescription(description);
            var msg = {
                to: to,
                data: JSON.stringify(description)
            };
            self.sendMsg(msg);
        }, self.errorHandler, self.constraints);
    };


    this.answer = function(to) {
        trace('createAnswer');
        var pc = self.users[to].pc;
        pc.createAnswer(function(description) {
            pc.setLocalDescription(description);
            var msg = {
                to: to,
                data: JSON.stringify(description)
            };
            self.sendMsg(msg);
            self.users[to].status = MediaStatus.CONNECTED;
        }, self.errorHandler, self.constraints);
    };

    /*if(this.getUserMedia){
       this.start({
      "video": true,
      "audio": true
    });
	}else{
	   alert("当前浏览器不支持相关协议，建议使用最新版的Chrome或者火狐浏览器");
	}*/
}
