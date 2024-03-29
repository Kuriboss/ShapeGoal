var saveY;
//use LS1 & LS2 for joining/splitting lines
function storageCheck() {
    try {
        if (localStorage) {
            if (localStorage.length) {
                //something is stored
                var dataToLoad = storageLoad('AllowSave');
                if (dataToLoad == 1) {
                    //user has said YES to saving.
                    saveY = 1;
                } else if (dataToLoad == 0) {
                    //user has said NO to saving.
                    saveY = -1;
                } else {
                    //either there is nothing saved yet, or something is amiss!
                    saveY = 0;
                }
            } else {
                saveY = 0;
            }
        }
        else {
            upNotOpen('localStorage appears to be unavailable in this browser. Unable to save anything.', '');
            saveY = -1;
        }
    }
    catch (e) {
        upNotOpen('localStorage appears to be unavailable in this browser. Unable to save anything.', '');
        saveY = -1;
    }
}
function storageChoose(zChoice) {
    if (zChoice === 'Y') {
        var a = saveY[0]
            , b = saveY[1];
        saveY = 1;
        storageSave('AllowSave', 1);
        storageSave(a, b);
    } else {
        //disable saving for this session.
        saveY = -1;
    }
    //later on if it is called for by anyone, I can add a 'never' save that disables saving, except for saving the preference to never save :D
    upNotClose();
}
function storageLoad(toLoad) {
    if (saveY !== -1) {
        var dataToLoad = '';

        try {
            dataToLoad = localStorage.getItem(zAppPrefix + toLoad);
        } catch (ex) { }

        return dataToLoad;
    }
}
function storageSave(toSave, dataToSave) {
    //ONLY save if if is 1
    if (saveY === 1) {
        localStorage.setItem(zAppPrefix + toSave, dataToSave);
    }//check whether this is the first time the user has saved something:
    else if (saveY === 0) {
        //nothing stored
        //check if the user has already got a notifyer yet:
        if (!document.getElementById('storY')) {
            //temporerily store the data in this variable.
            saveY = [toSave, dataToSave];
            upNotOpen('Would you like your browser to remember your preferences?<br><br>I respect your privacy: no data is sent anywhere; everything is done within your browser.<br><br><button id="storY" class="uButtons uButtonGreen" type="button " style="font-size:1.5em;width:30%;margin:.1em .2em;float:left;">Yes</button>' + '<button id="storN" class="uButtons uButtonRed" type="button" style="font-size:1.5em;width:30%;margin:.1em .2em;float:right;">No</button>', '');
        }
    }
    //else stor is -1 which means the user has opted to not save anything.
}