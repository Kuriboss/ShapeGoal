/*
 * Ideally, I would have only two different tpes of input;
 * pointer (for touch and mouse)
 * gamepad for gamepads, and keybnoards
 *
 * having said that, I could make the mouse into a 3-button, 1 axis gamepad, and touches similar, but more axis and buttons.
 * and gamepads and keyboards could be used to move a pointer around too.
 *
 * Sensetivity should be adjustable, and axes and buttons would be configurable
*/
function gamePadUpdate() {
    var gamePads = navigator.getGamepads();
    for (var x = 0; x < gamePads.length; x++) {
        if (gamePads[x]) {
            //only add if the gamepad exists - NOT FOOLPROOF!
            //initialize/clear the gamePadVar
            gamePadVars[x] = [];
            //only shallow-copy the buttons and axes - don't need the rest (yet!)
            gamePadVars[x].buttons = gamePads[x].buttons.slice(0);
            gamePadVars[x].axes = gamePads[x].axes.slice(0);
        }
    }
}
function gamePadsButtonEventCheck() {
    //only worry about gamePadVar[0] for this version
    var oldButtons = []
    if (gamePadVars[0]) {
        //shallow-copy cos it is an (object) array:
        for (var x = 0; x < gamePadVars[0].buttons.length; x++) {
            oldButtons[x] = gamePadVars[0].buttons[x].pressed;
        }
    }
    gamePadUpdate();
    //if there is at least 1 gamepad being used:
    if (gamePadVars[0]) {
        //if there has been any change to the buttons:
        if (oldButtons.length === gamePadVars[0].buttons.length) {
            //cycle through the newButtons, comparing them to the oldButtons
            for (var x = 0; x < gamePadVars[0].buttons.length; x++) {
                if (oldButtons[x] !== gamePadVars[0].buttons[x].pressed) {
                    if (gamePadVars[0].buttons[x].pressed) {
                        gamePadsButtonDown(x);
                    } else {
                        gamePadsButtonUp(x);
                    }
                    anEvent();
                }
            }
        }
    }
    //because there are no events for a gamepad, I must check for them myself...

    if (gamePadVars[0]) {
        //use animationFrame when there is a gamepad being used.
        window.requestAnimationFrame(function () {
            gamePadsButtonEventCheck();
        });
    } else {
        //there are no current gamepads, so just check for a new one every second.
        window.setTimeout(function () {
            gamePadsButtonEventCheck();
        }, 1000);
    }
}
function keyNum(e) {
    return e.keyCode || window.event.keyCode;
}
function keyDown(e) {
    var theKey = keyNum(e);
    if (!document.activeElement.classList.contains('editEnable')) {
        if (keysIgnore.indexOf(theKey) === -1) {
            bubbleStop(e);
            //simply add the newly pressed key into the WinKeys array.
            keyVars.push(theKey);
            keyDownGameEvents(theKey);
            anEvent();
        }
    }
    else {
        //if user presses Return or Tab, remove input focus.
        if (theKey == 13 || theKey == 9) {
            bubbleStop(e);
            document.activeElement.blur();
        }
        else {
            keyDownEvents();
        }
    }
}
function keyUp(e) {
    var theKey = keyNum(e);
    if (!document.activeElement.classList.contains('editEnable')) {
        if (keysIgnore.indexOf(theKey) === -1) {
            bubbleStop(e);
            while (keyVars.indexOf(theKey) != -1) {
                //updates array length while delete() doesn't
                keyVars.splice(keyVars.indexOf(theKey), 1);
            }
            keyUpGameEvents(theKey);
            anEvent();
        }
    }
    else {
        keyUpEvents();
    }
}
function mouseDown(e) {
    var targ = findTarget(e);

    if (targ.id.slice(0, 4) === 'game') {
        gameVars.gameObject = findObject(e);
    }
    mouseVars.button = null == e.which ? e.button : e.which;
    mouseVars.type = 'click';
    mouseVars.clickTimer = window.setTimeout(function () {
        mouseLongClick()
    }, 500);
    mouseVars.current.target = targ;
    mouseVars.current.time = new Date().getTime();
    mouseVars.current.x = e.clientX;
    mouseVars.current.y = e.clientY;
    mouseVars.last.target = targ;
    mouseVars.last.time = new Date().getTime();
    mouseVars.last.x = e.clientX;
    mouseVars.last.y = e.clientY;
    mouseVars.start.target = targ;
    mouseVars.start.time = new Date().getTime();
    mouseVars.start.x = e.clientX;
    mouseVars.start.y = e.clientY;

    if (targ.classList.contains('editEnable')) {
        return;
    }

    bubbleStop(e);

    // if this project has tooltips then:
    if (typeof tooltipVars != 'undefined') {
        //look for tooltip
        if (targ.classList.contains('toolTipclass')) {
            tooltipVars.over = true;
            toolTipOver(targ.id);
            toolTipSort(targ.id, 1);
        }
    }

    //look for sliders here:
    var targSplit = targ.id.split('-');
    if (targ.id !== 'sli-pan-I') {
        if (targSplit[0] === 'sli') {
            //change the mouseType to slider.
            mouseVars.type = 'sli';
            //change the target to the slider's button
            mouseVars.start.target = document.getElementById('sli-' + targSplit[1] + '-I');
            //call the sliderMove function to begin moving the slider.
            sliderMoveH();
        }
    }

    mouseDownEvents();
    anEvent();
}
function mouseMove(e) {
    //make sure that only one mouse movement is done per frame to reduce cpu usage.
    if (mouseVars.moved) {
        return;
    }
    mMoved = 1;
    window.requestAnimationFrame(function () {
        mMoved = 0;
    });


    var zTime = new Date().getTime();

    var targ = findTarget(e);
    if (targ.id.slice(0, 4) === 'game') {
        gameVars.gameObjectLast = gameVars.gameObject;
        gameVars.gameObject = findObject(e);
    }

    if (mouseVars.current.target) {
        if (mouseVars.current.target.classList.contains('editEnable')) {
            mouseVars.current = { target: targ, time: zTime, x: e.clientX, y: e.clientY };
            return;
        }
    }

    bubbleStop(e);
    //check for onmouseout/onmousein events
    //if using canvas, check the game objects:
    if (targ.id.slice(0, 4) === 'game') {
        if (gameVars.gameObjectLast !== gameVars.gameObject) {
            if (mouseVars.type === 'click') {
                mouseVars.type = 'drag';
                window.clearTimeout(mouseVars.clickTimer);
            }
            mouseMoveEnter(targ);
            mouseMoveOut(targ);
        }
    }
    //now the mouse version
    else if (mouseVars.current.target !== mouseVars.last.target) {
        if (mouseVars.type === 'click') {
            mouseVars.type = 'drag';
            window.clearTimeout(mouseVars.clickTimer);
        }
        mouseMoveEnter(targ);
        mouseMoveOut(targ);
    }

    //now onmouseover - this one is done always.
    mouseMoveOver(targ);
    //scroll the about/changelogs type dialogues
    if (mouseVars.type === 'scrollable' && (e.clientY != mouseVars.current.y)) {
        var framesPerSecond = (1000 / (scrollVars.time - mouseVars.current.time));
        var pixlesMoved = (mouseVars.current.y - scrollVars.y);
        var speedInPixelsPerSecond = pixlesMoved * framesPerSecond;

        //console.log(speedInPixelsPerSecond);
        if (pixlesMoved) {
            scroller(mouseVars.start.target, findCloseButton(mouseVars.start.target), pixlesMoved);
        }

        scrollVars.time = mouseVars.current.time;
        scrollVars.x = mouseVars.current.x;
        scrollVars.y = mouseVars.current.y;
    }
    //update the last mouse events - copy current to last
    mouseVars.last = {
        target: mouseVars.current.target
        , time: mouseVars.current.time
        , x: mouseVars.current.x
        , y: mouseVars.current.y
    };
    //then update current.
    mouseVars.current = { target: targ, time: zTime, x: e.clientX, y: e.clientY };

    // if this project has tooltips then:
    if (typeof tooltipVars != 'undefined') {
        if (targ.classList.contains('toolTipclass')) {
            toolTipOver(targ.id);
            toolTipMouseMove(e);
            tooltipVars.over = true;
        } else if (tooltipVars.over && !targ.classList.contains('ttElem')) {
            tooltipVars.over = false;
            toolTipHide();
        }
    }

    if (mouseVars.type === 'sli') {
        sliderMoveH();
        //volMove();
    } else if (mouseVars.type === 'click') {
        if (((mouseVars.start.x + 25) < e.clientX) || ((mouseVars.start.x - 25) > e.clientX) || ((mouseVars.start.y + 25) < e.clientY) || ((mouseVars.start.y - 25) > e.clientY)) {
            window.clearTimeout(mouseVars.clickTimer);
            //debugger;
            if (mouseVars.start.target.id === 'sli-pan-I') {
                //change the mouseType to slider.
                mouseVars.type = 'sli';
                //call the sliderMove function to begin moving the slider.
                sliderMoveH();
            }
            else {
                mouseVars.type = 'drag';
            }
        }
    }

    if (mouseVars.type === 'drag' && mouseVars.start.target) {
        if (mouseVars.start.target.classList.contains('letScroll')) {
            //there is currently only one scrolling element at the moment.
            mouseVars.start.target = findUpperScrollable(mouseVars.start.target);
            //the inner element may not be tall enough to require scrolling:
            if (mouseVars.start.target.offsetHeight > mouseVars.start.target.parentNode.offsetHeight) {
                mouseVars.type = 'scrollable';
                scrollVars.time = mouseVars.current.time;
                scrollVars.x = mouseVars.current.x;
                scrollVars.y = mouseVars.current.y;
            } else {
                mouseVars.type = 'notScrollable';
            }
        }
    }
    if (mouseVars.type === 'sgDrag') {
        tg_mMove(mouseVars.start.target, e)
        return;
    }

    mouseMoveEvents();
}
function mouseMoveVarsUpdate(targ) {
    mouseVars.current.target = targ;
    mouseVars.current.time = zTime;
    mouseVars.current.x = e.clientX;
    mouseVars.current.y = e.clientY;
}

function mouseUp(e) {
    if (mouseVars.current.target == null || mouseVars.current.target.classList.contains('editEnable')) {
        return;
    }
    //if the pointer is not on an input, take the focus off of
    //the focused element. This should remove focus from input elements
    //when the user clicks off of them.
    document.activeElement.blur();

    bubbleStop(e);
    mouseUpEvents();
    //do any mouseup stuff here, eg. flinging or animated panning
    if (mouseVars.type == 'click') {
        if (mouseVars.button == 1) {
            mouseClick();
        } else if (mouseVars.button == 2) {
            mouseLongClick();
        }
    }

    if (mouseVars.button == 1) {
        if (mouseVars.type == 'scrollable' || mouseVars.type === 'scrolling') {
            //console.log('begin auto scroll...');
            var tNow = new Date().getTime();
            var framesPerSecond = (1000 / (scrollVars.time - mouseVars.current.time));
            var pixlesMoved = (mouseVars.current.y - scrollVars.y);
            var speedInPixelsPerSecond = pixlesMoved * framesPerSecond;
            //console.log(speedInPixelsPerSecond);

            if (pixlesMoved) {
                scroller(mouseVars.start.target, findCloseButton(mouseVars.start.target), pixlesMoved);
            }
            //speed should now be pixels per second, averaged over the last 5 frames.
            //console.log('average speed = ' + zSpeed);
            //mouseVars.start.target gets cleared, so make a seperate pointer.
            var targ = document.getElementById(mouseVars.start.target.id);
            var zCloseButton = findCloseButton(targ);
            window.requestAnimationFrame(function () {
                divScroller(targ, zCloseButton, -speedInPixelsPerSecond, tNow)
            });
        }
    }

    //check for tooltips in this project:
    if (typeof tooltipVars != 'undefined') {
        //tooltip stuff for touch and click support
        if (tooltipVars.over && vPup.style.opacity > 0 && !mouseVars.start.target.classList.contains('toolTipclass')) {
            toolTipStuffHide(mouseVars.start.target.id);
        } else if (mouseVars.start.target) {
            if (mouseVars.start.target.classList) {
                if (mouseVars.start.target.classList.contains('toolTipclass')) {
                    //show tooltip immediatly
                    toolTipShowNow(e, mouseVars.start.target.id);
                }
            }
        }
    }

    mouseClear();
    anEvent();
}
function mouseWheel(e) {//for zooming in/out, changing speed, etc.
    var targ = findTarget(e);
    if (targ.id.slice(0, 4) === 'game') {
        gameVars.gameObjectLast = gameVars.gameObject;
        gameVars.gameObject = findObject(e);
    }

    bubbleStop(e);

    var delta;
    if (e.deltaY) {
        delta = -e.deltaY;
        //seems like the main one
    } else if ('wheelDelta' in e) {
        delta = e.wheelDelta;
    } else {
        delta = -40 * e.detail;
        //fallback!
    }
    if (delta > 0) {
        delta = 1;
    } else {
        delta = -1;
    }

    // check for scrollable element and one who's height is taller than the parentNode's height
    if (targ.classList.contains('letScroll') && mouseVars.type != 'notScrollable') {
        targ = findUpperScrollable(targ);
        if (targ.offsetHeight > targ.parentNode.offsetHeight) {
            var zCloseButton = findCloseButton(targ);
            divScroller(targ, zCloseButton, delta * 1000, new Date().getTime());
        } else {
            mouseVars.type = 'notScrollable';
            mouseWheelEvents(targ, delta);
        }
    }
    else {
        mouseWheelEvents(targ, delta);
    }

}

function mouseClick() {
    var targID = mouseVars.current.target.id;
    if (targID === 'toastClose') {
        upNotClose();
    } else if (targID === 'sets') {
        settingsOpen();
        document.getElementById('bChange').textContent = "Contact Younes";
        document.getElementById('bPrivacy').textContent = "Contact Nadir";
    } else if (targID === 'setsClose') {
        settingsClose();
    } else if (targID === 'bPrivacy') {
        window.location.href = "https://www.linkedin.com/in/nadir-lechheb-87857613a/";
    } else if (targID === 'bChange') {
        var updateButton = '';
        window.location.href = "https://www.instagram.com/younes_abbouelhassan/?next=%2F";

        upNotOpen('webapp changeLog<br>' + updateButton, appCL);
    } else if (targID === 'grdf') {
        reloadDrFreeman();// reload the webpage.
    } else if (targID === 'uSW') {
        updateServiceWorkers();// reload the webpage.
    } else if (targID.slice(0, 4) === 'stor') { //storage question.
        storageChoose(targID.slice(-1));
        upNotClose();
    } else if (targID === 'fsI' || targID === 'fs') {//fullscreen button
        fullScreenToggle();
    } else if (targID === 'muteToggle' || targID === 'pmuteToggle') {//toggle audio mute.
        MuteToggle();
    } else if (targID === 'playB') {//Play button press for apps with sound
        document.body.removeChild(document.getElementById('pB'));
        soundInit()
    } else {
        mouseClickEvents();
    }
}
function mouseLongClick() {//this is also the right-click.
    //for right click, and long taps.
}
function touchChange(e) {
    return {
        button: 1,
        target: e.target,
        id: e.identifier,
        clientX: e.clientX,
        clientY: e.clientY,
        preventDefault: function () { },
        stopPropagation: function () { }
    };
    //return a new event object back with only the things I want in it :)
}
function touchDown(e) {
    var cTouches = e.changedTouches;
    for (var x = 0; x < cTouches.length; x++) {
        var zID = cTouches[x].identifier;
        touchVars[zID] = touchChange(cTouches[x]);
        //would overwrite existing event if a finger was not deleted - from aen error for example.
        if (touchVars[zID].target) {
            if (zID == 0) {
                if (!touchVars[zID].target.classList.contains('editEnable')) {
                    bubbleStop(e);
                    //should change the mouse cursor if needed.
                    mouseDown(touchVars[zID]);
                    //only do the mouse events on the first finger.
                    //mouseMove(touchVars[zID]);
                }
            }
            else {
                bubbleStop(e);
            }
        }
    }
}
function touchMove(e) {
    bubbleStop(e);
    var cTouches = e.changedTouches;
    for (var x = 0; x < cTouches.length; x++) {
        var zID = cTouches[x].identifier;
        if (zID >= 0) {
            touchVars.splice(zID, 1, touchChange(cTouches[x]));
            // swap in the new touch record
        }

        if (zID == 0) {
            if (!touchVars[zID].target.classList.contains('editEnable')) {
                bubbleStop(e);
                //only do the mouse events on the first finger.
                mouseMove(touchVars[zID]);
            }
        }
        else {
            bubbleStop(e);
        }
    }
}
function touchUp(e) {
    var cTouches = e.changedTouches;
    //new array for all current events
    for (var x = 0; x < cTouches.length; x++) {
        var zID = cTouches[x].identifier;
        if (zID >= 0) {
            if (touchVars[zID]) {
                mouseMoveOut(touchVars[zID].target);
            } else {
                touchVars[zID].target = document.body;
            }

            if (zID == 0) {
                if (!touchVars[zID].target.classList.contains('editEnable')) {
                    bubbleStop(e);
                    mouseUp(touchVars[zID]);
                }
            } else {
                bubbleStop(e);
            }

            //should change the mouse cursor if needed.
            delete touchVars[zID];
        }
    }
}

function findUpperScrollable(targ) {
    /*
      Go through the parentNodes of the targ element,
      making a note of each element as we go,
      until we reach the outermost element that
      has 'letScroll' in its classList.
      Make targ that element.
    */
    if (targ.parentNode) {
        while (targ.parentNode.classList.contains('letScroll')) {
            targ = targ.parentNode;
            //check whether there is another parentNode!
            if (!targ.parentNode) {
                break;
            }
        }
    }
    return targ;
}
document.getElementById('bChange').textContent = "Contact Younes";