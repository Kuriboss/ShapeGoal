//cancel fullscreen:
var killFS = (document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen)
    //kick up fullscreen:
    , getFS = (document.documentElement.requestFullscreen || document.documentElement.mozRequestFullScreen || document.documentElement.webkitRequestFullscreen || document.documentElement.msRequestFullscreen)
    //mousewheel event, based on the all-encompassing mozDev version
    , mouseWheelType = 'onwheel' in document.createElement('div') ? 'wheel' : document.onmousewheel ? 'mousewheel' : 'DOMMouseScroll'
    /*
     * Keys to ignore... alt-tab is annoying, so don't bother with alt for example
     * 16 = shift
     * 17 = Ctrl
     * 18 = Alt (and 17 if altGr)
     * 91 = windows key
     * 116 = F5 - browser refresh
     * 122 = F11 - Full Screen Toggle
     * 123 = F12 - Dev tools.
    */
    , keysIgnore = [0, 16, 17, 18, 91, 116, 122, 123]
    /*
      left,up,right,down,A,B,X,Y you can add more should your game require it.
    */
    , keysDefault = { 100: 0, 101: 1, 97: 2, 98: 3 }
    /*
      the currently used keys are loaded on init
    */
    , keysCurrent = null
    //Input events vars to hold the event info:
    , inputType = null
    //touch|gamePad|mouse|keyboard - depending on game type you could add GPS or whatever else HTML supports...
    //Mouse:
    , mouseVars = []
    //Gamepad:
    , gamePadVars = []
    , gamepadReMap = [2, 3, 0, 1]
    //keyboard:
    , keyVars = []
    //For touch-enabled devices
    , touchVars = []
    //vars to hold variables for the window
    , gameWindow = null

    , LS1 = '@#~'
    , LS2 = '~#@'
    , saveY = 0 //whether the user allows saving to HTML5 local storage
    ;

function Init() {
    //Add event listeners to the game element
    addEventListeners();
    //initialize the mouse event
    mouseClear();
    //initialize the scroll vars
    scrollClear();
    //window management vars - is this even needed any more?!?!
    gameWindow = {
        initWidth: 640
        , initHeight: 360
        , width: 0
        , height: 0
        , scale: 1
    };

    //check for saved data. If set, the user has chosen to either save or not save data.
    storageCheck();

    //for the moment, just use the default keyset:
    keysCurrent = parseFloat(storageLoad('keymap')) || keysDefault;

    //add the initContent function to the main project, and return
    //the html content of the app :)
    document.body.innerHTML = initContent();

    /*
      if this project has audio then:
      add the "play" button with a mute toggler to get around
      Google's decision to suspend a created audioContext
      instead of preventing/muting a play attempt!
    */
    if (typeof audioCtx != 'undefined') {
        //check if the user has modified the volume level if not, default to 54%:
        globVol = parseFloat(storageLoad('volume') || 54);
        //when the user activates the play button, runApp is called.
        playButton();
    }
    else {
        runApp();
        /*
          extra bit to center contC rescaling apps, because of all of the content is not
          all on the screen, it squashes up so that it all fits horizontally.
          it is set to -100% - fully off to the left on startup 
        */
        //if (typeof document.getElementById('contC') != 'undefined') {
        if (document.getElementById('contC')) {
            document.getElementById('contC').style.left = '50%';
            document.getElementById('contC').style.top = '50%';
        }
    }

    // if this project has tooltips then:
    if (typeof tooltipVars != 'undefined') {
        //add the tooltip elements:
        tooltipsAdd();
    }

    //add my settings system to the project.
    settingsCreate();

    //scale the UI to the available screen size
    resize();

    //now that everything is set up, make a recurring checker for button presses:
    gamePadsButtonEventCheck();
}

function addEventListeners() {
    window.addEventListener('resize', resize, false);
    window.addEventListener('contextmenu', bubbleStop, false);
    window.addEventListener('dblclick', bubbleStop, false);
    window.addEventListener(mouseWheelType, mouseWheel, false);
    window.addEventListener('touchstart', touchDown, false);
    window.addEventListener('touchmove', touchMove, false);
    window.addEventListener('touchcancel', touchUp, false);
    window.addEventListener('touchend', touchUp, false);
    window.addEventListener('touchleave', touchUp, false);
    window.addEventListener('mousedown', mouseDown, false);
    window.addEventListener('mousemove', mouseMove, false);
    window.addEventListener('mouseup', mouseUp, false);
    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup', keyUp, false);
}