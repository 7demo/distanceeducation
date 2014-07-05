$(function(){
	$('.creatRoom').click(function(){
		$(this).animate({'marginTop':'-400px'},500);
	});	
	$('#cancelRoomBtn').click(function(){
		$('.creatRoom').animate({'marginTop':'0'},500);
		return false;
	});

	$('.relinkTitle').click(function(){
		if($('.relink').width()=='268'){
			$('.relink').animate({'width':'55px'});
		}else{
			$('.relink').animate({'width':'268px'});
		}	
	});

	//创建房间
	$('#createRoomBtn').click(function(){
		var roomName = $('#roomName').val();
		var author = $('#userName').val();
		var dec = $('#roomDec').val();
		$.ajax({
			url:'/',
			type:'post',
			data:{roomName:roomName,author:author,dec:dec},
			dataType:'json',
			success:function(){
				document.cookie =roomName;

				//---------更新房间列表
				reateRoom.emit('creat new room',{roomName:roomName,author:author,dec:dec});
				
				window.location.href = 'http://127.0.0.1:3000/'+roomName;
			}
		});
	});

});