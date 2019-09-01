// Set the body class to show/hide certain elements on mobile/desktop
document.body.className = ('ontouchstart' in window) ? 'mobile' : 'desktop';


// Setup the WebSocket connection and start the player
var client = new WebSocket( 'ws://' + window.location.host + '/ws' );

var canvas = document.getElementById('videoCanvas');
var player = new jsmpeg(client, {canvas:canvas});


// Input

var mouseLock = !!document.location.href.match('mouselock');
var lastMouse = {x: 0, y: 0};
if( mouseLock ) {
	// FUCK YEAH, VENDOR PREFIXES. LOVE EM!
	canvas.requestPointerLock = canvas.requestPointerLock ||
		canvas.mozRequestPointerLock || 
		canvas.webkitRequestPointerLock || 
		(function(){});
}

// enum input_type_t
var INPUT_KEY = 0x0001,
	INPUT_MOUSE_BUTTON = 0x0002,
	INPUT_MOUSE_ABSOLUTE = 0x0004,
	INPUT_MOUSE_RELATIVE = 0x0008;

var KEY_DOWN = 0x01,
	KEY_UP = 0x00,
	MOUSE_1_DOWN = 0x0002,
	MOUSE_1_UP = 0x0004,
	MOUSE_2_DOWN = 0x0008,
	MOUSE_2_UP = 0x0010,
	MOUSEEVENTF_WHEEL = 0x0800,
	MOUSEEVENTF_MIDDLEUP = 0x0040,
	MOUSEEVENTF_MIDDLEDOWN = 0x0020,
	MOUSEEVENTF_XDOWN = 0x0080, //an "x" button is like the forward and back button on your mouse. Microsoft doesn't have different up and down identifers for each key
	MOUSEEVENTF_XUP = 0x0100, //You define if it's the forward or backward key via the dwExtraInfo parameter.
	XBUTTON1 = 0x0001,
	XBUTTON2 = 0x0002; //It's this number that goes into the dwExtraInfo parameter.

// struct input_key_t { uint16 type, uint16 state; uint16 key_code; }
var sendKey = function(ev, action, key) {
	client.send(new Uint16Array([INPUT_KEY, action, key]));
	ev.preventDefault();
};

// struct input_mouse_t { uint16 type, uint16 flags; float32 x; float32 y; int16 amount }
var mouseDataBuffer = new ArrayBuffer(16);
var mouseDataTypeFlags = new Uint16Array(mouseDataBuffer, 0);
var mouseDataCoords = new Float32Array(mouseDataBuffer, 4);
var mouseScrollAmount = new Int32Array(mouseDataBuffer, 12);

var sendMouse = function(ev, action, xbutton) {
	var type = 0;
	var x, y;

	if( action ) {
		type |= INPUT_MOUSE_BUTTON;
		
		// Attempt to lock pointer at mouse1 down
		if( mouseLock && action === MOUSE_1_DOWN ) {
			canvas.requestPointerLock();
		}
	}
	
	// Only make relative mouse movements if no button is pressed
	if( !action && mouseLock ) {
		type |= INPUT_MOUSE_RELATIVE;
		
		var p = ev.changedTouches ? ev.changedTouches[0] : ev;
		
		// FUCK, DID I MENTION I LOOOOOVE VENDOR PREFIXES? SO USEFUL! 
		x = p.movementX || p.mozMovementX || p.webkitMovementX;
		y = p.movementY || p.mozMovementY || p.webkitMovementY;

		if( typeof x === 'undefined' ) {
			x = p.clientX - lastMouse.x;
			y = p.clientY - lastMouse.y;
		}

		lastMouse.x = p.clientX;
		lastMouse.y = p.clientY;
	}

	// If we send absoulte mouse coords, we can always do so, even for
	// button presses.
	if( !mouseLock ) {
		type |= INPUT_MOUSE_ABSOLUTE;
		
		var rect = canvas.getBoundingClientRect();
		var scaleX = canvas.width / (rect.right-rect.left),
			scaleY = canvas.height / (rect.bottom-rect.top);
		
		var p = ev.changedTouches ? ev.changedTouches[0] : ev;
		var x = (p.clientX - rect.left) * scaleX,
			y = (p.clientY - rect.top) * scaleY;
	}

	mouseDataTypeFlags[0] = type;
	mouseDataTypeFlags[1] = (action||0);
	mouseDataCoords[0] = x;
	mouseDataCoords[1] = y;
	//Because the xbutton and scroll data go into the dwExtraInfo parameter we will just send the xbutton here.
	mouseScrollAmount[0] = (xbutton || -ev.detail * 20 || ev.wheelDelta || 0);
	 
	client.send(mouseDataBuffer);
	ev.preventDefault();
};


// Keyboard
window.addEventListener('keydown', function(ev) { sendKey(ev, KEY_DOWN, ev.keyCode); }, false );
window.addEventListener('keyup', function(ev) { sendKey(ev, KEY_UP, ev.keyCode); }, false );

// Mouse

canvas.addEventListener('mousemove', function(ev){ sendMouse(ev, null); }, false);
function btndwn(ev){
	var ev = ev || window.event;
    var btnCode;
	ev.preventDefault();

        btnCode = ev.button;

        switch (btnCode) {
            case 0:
                sendMouse(ev, MOUSE_1_DOWN);
            break;

            case 1:
                sendMouse(ev, MOUSEEVENTF_MIDDLEDOWN);
            break;

            case 2:
                sendMouse(ev, MOUSE_2_DOWN);
			break;
			
			//These keys are handled differently from the rest https://docs.microsoft.com/en-us/windows/desktop/api/winuser/nf-winuser-mouse_event#parameters
			case 3:
				//This is usually the browser back button
				sendMouse(ev, MOUSEEVENTF_XDOWN, XBUTTON1);
			break;
			
			case 4:
				//This is usually the browser forward button
				sendMouse(ev, MOUSEEVENTF_XDOWN, XBUTTON2);
            break;

            default:
                console.log('Unexpected code: ' + btnCode);
        }
}
function btnup(ev){
	var ev = ev || window.event;
    var btnCode;
	ev.preventDefault();

        btnCode = ev.button;

        switch (btnCode) {
            case 0:
                sendMouse(ev, MOUSE_1_UP);
            break;

            case 1:
                sendMouse(ev, MOUSEEVENTF_MIDDLEUP);
            break;

            case 2:
                sendMouse(ev, MOUSE_2_UP);
            break;
			
			//These keys are handled differently from the rest https://docs.microsoft.com/en-us/windows/desktop/api/winuser/nf-winuser-mouse_event#parameters
			case 3:
				//This is usually the browser back button
				sendMouse(ev, MOUSEEVENTF_XUP, XBUTTON1);
			break;
			
			case 4:
				//This is usually the browser forward button
				sendMouse(ev, MOUSEEVENTF_XUP, XBUTTON2);
            break;
			
            default:
                console.log('Unexpected code: ' + btnCode);
        }
}
canvas.addEventListener('mousedown', function(ev){ btndwn(ev); });
canvas.addEventListener('mouseup', function(ev){ btnup(ev); });
canvas.addEventListener('onmousewheel', function(ev){ sendMouse(ev, MOUSEEVENTF_WHEEL); });
canvas.addEventListener('mousewheel', function(ev){ sendMouse(ev, MOUSEEVENTF_WHEEL); });
canvas.addEventListener('DOMMouseScroll', function(ev){ sendMouse(ev, MOUSEEVENTF_WHEEL); });

// Touch
canvas.addEventListener('touchstart', function(ev){
	lastMouse.x = ev.changedTouches[0].clientX;
	lastMouse.y = ev.changedTouches[0].clientY;
	sendMouse(ev, MOUSE_1_DOWN);
}, false);
canvas.addEventListener('touchend', function(ev){ sendMouse(ev, MOUSE_1_UP); }, false);
canvas.addEventListener('touchmove', function(ev){ sendMouse(ev, null); }, false);

// Touch buttons emulating keyboard keys
var defineTouchButton = function( element, keyCode ) {
	element.addEventListener('touchstart', function(ev){ sendKey(ev, KEY_DOWN, keyCode); }, false);
	element.addEventListener('touchend', function(ev){ sendKey(ev, KEY_UP, keyCode); }, false);
};

var touchKeys = document.querySelectorAll('.key');
for( var i = 0; i < touchKeys.length; i++ ) {
	defineTouchButton(touchKeys[i], touchKeys[i].dataset.code);
}
