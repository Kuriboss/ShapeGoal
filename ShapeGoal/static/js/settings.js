function settingsCreate() {
    /*
      Generally, there is a hamburger on the top-left, though some people
      put it on the right. I think Google do the top left, and because
      they are so ubiquitus, I will choose to place my settings thing there.
    */
    var newElem1 = document.createElement('div');
    newElem1.id = 'sets';
    newElem1.classList = 'settB';
    newElem1.innerHTML = '&#9776;';
    document.body.appendChild(newElem1);

    // If this project has sound, add a global volume slider.
    var volControl = (typeof zVol != 'undefined') ? zVol : ''
        , newElem2 = document.createElement('div')
        ;
    newElem2.id = 'settCont';

    newElem2.innerHTML =
        //close button
        '<div id="setsClose" class="buttonClose">X</div>'
        + '<div id="settInner" class="settInner">'
        //fullscreen toggle button
        + '<div id="fs" class="uButtons uButtonGreen">'
        + '<span id="fsI" class="fsInner">&#9974;</span>&nbsp;Fullscreen'
        + '</div>'
        + '<br>'
        //volume slider:
        + volControl
        + '<br><div id="bPrivacy" class="uButtons uButtonGrey">Privacy</div>'
        + '<div id="bChange" class="uButtons uButtonGrey">webapp changeLog</div>'
        + '<hr>' //Now for the Support buttons:
        + supportStewved
        + appAbout
        + appBugs
        + '</div>'
        ;
    document.body.appendChild(newElem2);

    if (volControl) {
        //set the volume slider:
        mouseVars.start.target = document.getElementById('sli-vol-I');
        sliderUpdate([globVol], 0);
        //check whether muted or not.
        swapToggler('muteToggle');

    }

    //check for other things to go into the Settings panel
    if (window['settingsExtra']) {
        settingsExtra();
    }

    upSetClass(newElem2);

}

function settingsClose() {
    //move the settings element back offscreen to the left
    document.getElementById('settCont').style.transition = 'left .4s ease-in';
    document.getElementById('settCont').style.left = '';
    document.getElementById('settCont').style.boxSizing = '';
}
function settingsOpen() {
    document.getElementById('settCont').style.transition = '';
    document.getElementById('settCont').style.left = 0;
    document.getElementById('settCont').style.boxSizing = 'content-box';
}