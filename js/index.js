/*
1.	融云需要发送消息相关的用户、群组、聊天室信息，具体如下：
	应用服务器维护用户所有信息，请求融云注册用户（提供 id、name、portrait），id 用于消息收发，name 用于 push，此接口同时提供了刷新方法。
	应用服务器维护群组及成员信息，也就是说，群的创建、群成员的维护都需要在应用服务器完成后同步到融云，但只同步群组（群 id）及群成员信息（成员 id），两种 id 同样用于消息的收发，消息发送给群组id，群成员可以获取对应消息。
2.	融云通过链接服务器、消息收发等携带相关 id （用户 Id、群组 Id）到各端，端上通过 id 请求应用服务器获取详细信息（用户名、头像、群组名称、群头像、群成员信息以及其他业务需要的职位、等级等业务相关数据）。
*/
var appKey = '3argexb630cze'
var token  = 'blAqvbBe5xKY/cQpnhxjggnReq6Og098TYtdQwwNFfM6wloEApHyPpXieNOeeDXrN3JSSzDdL0RDVwluXRNs+A=='

// 	连接状态监听器
function connectionListener () {
	RongIMClient.setConnectionStatusListener({
	    onChanged: function (status) {
	        switch (status) {
	            case RongIMLib.ConnectionStatus.CONNECTED:
	                console.log('链接成功');
	                break;
	            case RongIMLib.ConnectionStatus.CONNECTING:
	                console.log('正在链接');
	                break;
	            case RongIMLib.ConnectionStatus.DISCONNECTED:
	                console.log('断开连接');
	                break;
	            case RongIMLib.ConnectionStatus.KICKED_OFFLINE_BY_OTHER_CLIENT:
	                console.log('其他设备登录');
	                break;
	              case RongIMLib.ConnectionStatus.DOMAIN_INCORRECT:
	                console.log('域名不正确');
	                break;
	            case RongIMLib.ConnectionStatus.NETWORK_UNAVAILABLE:
	              console.log('网络不可用');
	              break;
	        }
	    }
	});
}

// 消息监听器
function receiveMessageListener () {
	RongIMClient.setOnReceiveMessageListener({
	    // 接收到的消息
	    onReceived: function (message) {
	        // 判断消息类型
	        switch(message.messageType){
	            case RongIMClient.MessageType.TextMessage:
	                // message.content.content => 消息内容
	                break;
	            case RongIMClient.MessageType.VoiceMessage:
	                // 对声音进行预加载                
	                // message.content.content 格式为 AMR 格式的 base64 码
	                break;
	            case RongIMClient.MessageType.ImageMessage:
	               // message.content.content => 图片缩略图 base64。
	               // message.content.imageUri => 原图 URL。
	               break;
	            case RongIMClient.MessageType.ContactNotificationMessage:
	                //	好友通知消息
	                // do something...
	               break;
	            case RongIMClient.MessageType.CommandNotificationMessage:
	                //	通用命令通知消息
	                // do something...
	               break;
	            case RongIMClient.MessageType.CommandMessage:
	            	//	命令消息
	                // do something...
	               break;
	            case RongIMClient.MessageType.UnknownMessage:
	                // do something...
	               break;
	            default:
	                // do something...
	        }
	    }
	});
}

//	连接服务器
function connectServer (token) {
	RongIMClient.connect(token, {
        onSuccess: function(userId) {
          console.log("Connect successfully." + userId);
        },
        onTokenIncorrect: function() {
          console.log('token无效');
        },
        onError:function(errorCode){
              var info = '';
              switch (errorCode) {
                case RongIMLib.ErrorCode.TIMEOUT:
                  info = '超时';
                  break;
                case RongIMLib.ErrorCode.UNKNOWN_ERROR:
                  info = '未知错误';
                  break;
                case RongIMLib.ErrorCode.UNACCEPTABLE_PaROTOCOL_VERSION:
                  info = '不可接受的协议版本';
                  break;
                case RongIMLib.ErrorCode.IDENTIFIER_REJECTED:
                  info = 'appkey不正确';
                  break;
                case RongIMLib.ErrorCode.SERVER_UNAVAILABLE:
                  info = '服务器不可用';
                  break;
              }
              console.log(errorCode);
            }
    });
}

//	重新连接
function reconnectServer () {
	var callback = {
        onSuccess: function(userId) {
            console.log("Reconnect successfully." + userId);
        },
        onTokenIncorrect: function() {
            console.log('token无效');
        },
        onError:function(errorCode){
            console.log(errorcode);
        }
    };
    var config = {
        // 默认 false, true 启用自动重连，启用则为必选参数
        auto: true,
        // 重试频率 [100, 1000, 3000, 6000, 10000, 18000] 单位为毫秒，可选
        url: 'https://cdn.ronghub.com/RongIMLib-2.2.6.min.js',
        // 网络嗅探地址 [http(s)://]cdn.ronghub.com/RongIMLib-2.2.6.min.js 可选
        rate: [100, 1000, 3000, 6000, 10000]
    };
    RongIMClient.reconnect(callback, config);
}

//	发送消息
function sendMessage (type, data) {
	switch (type) {
		case RongIMClient.MessageType.TextMessage: 	//	发送文本消息
			sendTextMessage(data);
			break;
		case RongIMClient.MessageType.ImageMessage: 	//	发送图片消息
			sendImageMessage(data);
			break;
	}
}

//	sendMessageBase
function sendMessageBase (conversationtype, targetId, msg) {
	RongIMClient.getInstance().sendMessage(conversationtype, targetId, msg, {
        onSuccess: function (message) {
            //message 为发送的消息对象并且包含服务器返回的消息唯一Id和发送消息时间戳
            console.log("Send successfully", message);
        },
        onError: function (errorCode,message) {
            var info = '';
            switch (errorCode) {
                case RongIMLib.ErrorCode.TIMEOUT:
                    info = '超时';
                    break;
                case RongIMLib.ErrorCode.UNKNOWN_ERROR:
                    info = '未知错误';
                    break;
                case RongIMLib.ErrorCode.REJECTED_BY_BLACKLIST:
                    info = '在黑名单中，无法向对方发送消息';
                    break;
                case RongIMLib.ErrorCode.NOT_IN_DISCUSSION:
                    info = '不在讨论组中';
                    break;
                case RongIMLib.ErrorCode.NOT_IN_GROUP:
                    info = '不在群组中';
                    break;
                case RongIMLib.ErrorCode.NOT_IN_CHATROOM:
                    info = '不在聊天室中';
                    break;
                default :
                    info = x;
                    break;
            }
            console.log('发送失败:' + info);
        }
    });
    // }, false, pushData);		//	发给android or ios
}

//	发送文本消息
function sendTextMessage (params) {
	var msg = new RongIMLib.TextMessage({
		content: params.content,	//	"hello RongCloud!",
		extra: params.extra || '' 		//	"附加信息"
	});
 	var conversationtype = RongIMLib.ConversationType.PRIVATE; // 单聊,其他会话选择相应的消息类型即可。
 	var targetId = params.targetId; // 目标 Id

 	sendMessageBase(conversationtype, targetId, msg)
 	
}

//	发送图片消息
////	1、缩略图必须是 base64 码的 jpg 图。
////	2、不带前缀。
////	3、大小不得超过 100kb。
function sendImageMessage (params) {
	var base64Str = params.base64Str;	//base64 格式缩略图;
	var imageUri  = params.imageUri; 	// 上传到自己服务器的 URL。
	var conversationtype = RongIMLib.ConversationType.PRIVATE; // 单聊,其他会话选择相应的消息类型即可。
	var targetId = params.targetId; // 目标 Id
 	var msg = new RongIMLib.ImageMessage({
 		content: base64Str,
 		imageUri: imageUri
 	});
	
	sendMessageBase(conversationtype, targetId, msg)
}

//	获取历史消息
////	该功能需要在开发者后台“应用/IM 服务/高级功能设置”中开通公有云专业版后，开启单群聊消息云存储功能即可使用，如没有开启则执行 onError 方法。
function getHistoryMessages (params) {
	var conversationType = RongIMLib.ConversationType.PRIVATE; //单聊,其他会话选择相应的消息类型即可。
	var targetId = params.targetId; // 想获取自己和谁的历史消息，targetId 赋值为对方的 Id。
	var timestrap = null; // 默认传 null，若从头开始获取历史消息，请赋值为 0 ,timestrap = 0;
	var count = 20; // 每次获取的历史消息条数，范围 0-20 条，可以多次获取。
	RongIMLib.RongIMClient.getInstance().getHistoryMessages(conversationType, targetId, timestrap, count, {
	  onSuccess: function(list, hasMsg) {
	       // list => Message 数组。
	    // hasMsg => 是否还有历史消息可以获取。
	  },
	  onError: function(error) {
	    console.log("GetHistoryMessages,errorcode:" + error);
	  }
	});
}

//	清除历史消息
////	conversationType: 会话类型
////	targetId: 目标 Id
////	timestamp: 清除时间点，message.sentTime <= timestamp 的消息将被清除 (message: 收发实时或者历史消息中有 sentTime 属性)
////	timestamp 取值范围:  timestamp >=0 并且 timestamp <= 当前会话最后一条消息的 sentTime
function clearRemoteHistoryMessages (params) {
	var param = {
	    conversationType: RongIMLib.ConversationType.PRIVATE, // 会话类型
	    targetId: params.targetId, // 目标 Id
	    timestamp: params.timestamp // 清除时间点
	};
	RongIMLib.RongIMClient.getInstance().clearRemoteHistoryMessages(param, {
	  onSuccess: function() {
	     // 清除成功
	  },
	  onError: function(error) {
	      // 请排查：单群聊消息云存储是否开通
	      console.log(error);
	  }
	});
}

//	获取会话列表
function getConversationList () {
	RongIMClient.getInstance().getConversationList({
	  onSuccess: function(list) {
	  	console.log('会话列表：')
	  	console.log(list)
	    // list => 会话列表集合。
	  },
	  onError: function(error) {
	  	console.log(error)
	     // do something...
	  }
	},null);
}

//	删除会话
function removeConversation (params) {
	RongIMClient.getInstance().removeConversation(RongIMLib.ConversationType.PRIVATE, params.targetId, {
	    onSuccess:function(bool){
	       // 删除会话成功。
	    },
	    onError:function(error){
	       // error => 删除会话的错误码
	    }
	});
}

$(document).ready(function () {
	//	初始化
	RongIMLib.RongIMClient.init(appKey);

	//	必须设置监听器后，再连接融云服务器
	connectionListener();		// 	连接状态监听器
	receiveMessageListener();	// 消息监听器
	
	//	连接服务器
	connectServer(token);


	//	event
	$('#send').on('click', function () {
		console.log('发送')

		let params = {
			content: 'lalala',
			extra: 'aaaa',
			targetId: 'user6'
		}
		sendMessage(RongIMClient.MessageType.TextMessage, params)
	})

	$("#list").on('click', function () {
		getConversationList()
	})
 	
})