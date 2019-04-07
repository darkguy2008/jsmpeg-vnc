    var element = document.getElementById('controller');
    var joydiv = new JoydivModule.Joydiv({'element':element});
    element.addEventListener('joydiv-changed',function(e){
	  switch(joydiv.getOneOf8Directions().name) {
		case "up":
		sendKey(null, KEY_DOWN, 87);//W
		break;
		case "down":
		sendKey(null, KEY_DOWN, 83);//S
		break;
		
		case "left":
		sendKey(null, KEY_DOWN, 65);//A
		break;
		
		case "right":
		sendKey(null, KEY_DOWN, 68);//D
		break;
		
		case "up-left":
		sendKey(null, KEY_DOWN, 87);//W
		sendKey(null, KEY_DOWN, 65);//A
		break;
		
		case "up-right":
		sendKey(null, KEY_DOWN, 87);//W
		sendKey(null, KEY_DOWN, 68);//D
		break;
		
		case "down-left":
		sendKey(null, KEY_DOWN, 83);//S
		sendKey(null, KEY_DOWN, 65);//A
		break;
		
		case "down-right":
		sendKey(null, KEY_DOWN, 83);//S
		sendKey(null, KEY_DOWN, 68);//D
		break;
		
		case "none":
		sendKey(null, KEY_UP, 87);//W
		sendKey(null, KEY_UP, 83);//S
		sendKey(null, KEY_UP, 65);//A
		sendKey(null, KEY_UP, 68);//D
		break;
	  }
    });

    var element = document.getElementById('mouse');
    var joydiv = new JoydivModule.Joydiv({'element':element});
    element.addEventListener('joydiv-changed',function(e){
		direction = joydiv.getOneOf8Directions();
		var changeX=direction.offset.x * JoySensitivity;
		var changeY=direction.offset.y * JoySensitivity;
		sendMouse(null, null, null, true, changeX, changeY);
    });
