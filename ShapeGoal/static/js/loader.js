/*
 * Purpose of this file:
 * to give the user a progressbar for each file that is being loaded.
 * does not appear to work on GitHub at the moment though.
*/

/*
  Have a development mode based on whether the ip is local or not.
  127.0.0.1 is generally a computer's local ip address.
  Use window.location.hostname as I think that is just the base ip address
*/
var dev = (window.location.hostname == "127.0.0.1" || window.location.hostname == '')

    //text shortcodes put here in case the app's text loads before gtexts.
    , zAll = '<span class="B'
    , zNew = zAll + ' Bl">New Stuff: </span>'
    , zImp = zAll + ' Gr">Improvement: </span>'
    , zBug = zAll + ' Re">Bug-Fix: </span>'
    , zDev = zAll + ' Or">Development: </span>'

    //vars for the game itself
    //put here so that I can check when the game has initialized
    , gameVars = null
    , isLoaded = 0
    , isUpdated = 0
    , isOffline = 0
    , loadingVars = []

    //set up the internet address for globalscripts and the base IP for images
    , baseIP = window.location.href.slice(0, window.location.href.lastIndexOf('/', window.location.href.length - 2))
    , gs = baseIP//for general stuff, like images and scripts.
    , isUpdating = 0 // to see if a serviceWorker is installing or updating.
    , gUpdating = 0 // globalscripts serviceWorker active (a) | installed (i) | updated (u) | error (e)
    , upFreq = 1 //the frequency of looking for updates to the serviceworkers 1 = on every load.
    ;

//perhaps when files are cached then window.location is local?
//if (!dev) {
initServiceWorkers();
//}


var aSWR, gSWR; //to hold the serviceworker registrations for manually updating later.

function initServiceWorkers() {
    if ('serviceWorker' in navigator) {
        //Register the globalscripts serviceworker to cache all global files.
        navigator.serviceWorker.register(gs + '/sw.js').then(function (gregistration) {
            gSWR = gregistration;
            /*
              if there is an active serviceWorker, then this is not the
              first install of the webapp.
              this also means that an 'activated' statechange event means
              an update of the webapp, and not an install.
      
              So, is there an active serviceWorker?
            */
            if (gregistration.active) {
                gUpdating = 'a'; //a for active.
            }
            /*
              listen for an update to the serviceworker's file.
              This should fire on the first load of the web page, since
              any serviceWorker file is different to nothing.
              Also should fire if there is any difference in cached
              and server's serviceWorker file.
            */
            gregistration.addEventListener('updatefound', function () {
                //Listen for changes in the installing serviceWorker's state
                gregistration.installing.addEventListener('statechange', function (e) {
                    if (e.target.state === 'installed') {
                        if (gUpdating === 'a') {
                            upNotCheck('updating base files...');
                        }
                    }
                    else if (e.target.state === 'activated') {
                        if (gUpdating === 'a') {
                            gUpdating = 'u'; // u for updated.
                            upNotCheck('Base files updated.<br>'
                                + '<button id="grdf" class="uButtons uButtonGreen"'
                                + ' type="button"'
                                + '>Restart for updated version</button>'
                            );
                        }
                        else {
                            gUpdating = 'i'; // i for installed.
                            upNotCheck('i');
                        }
                    }
                });
            });
            //make the serviceWorker check for updates here.
            //this doesn't seem to happen on it's own.
            if (gUpdating === 'a' && upFreq === 1) {
                gregistration.update();
            }
        }).catch(function (err) {
            gUpdating = 'e' // e for error.
            console.log('GS SW registration failed: ', err)
        });

        //now register the website's own serviceworker to cache it's files.
        navigator.serviceWorker.register('sw.js').then(function (registration) {
            aSWR = registration;
            if (registration.active) {
                isUpdating = 'a';
            }
            registration.addEventListener('updatefound', function () {
                registration.installing.addEventListener('statechange', function (e) {
                    if (e.target.state === 'installed') {
                        if (isUpdating === 'a') {
                            upNotCheck('updating webapp...');
                        }
                    }
                    else if (e.target.state === 'activated') {
                        if (isUpdating === 'a') {
                            isUpdating = 'u';
                            upNotCheck('i');
                        }
                        else {
                            isUpdating = 'i';
                            upNotCheck('i');
                        }
                    }
                });
            })
            //make the serviceWorker check for updates here.
            //this doesn't seem to happen on it's own.
            if (isUpdating === 'a' && upFreq === 1) {
                registration.update();
            }
        }).catch(function (err) {
            isUpdating = 'e'
            console.log('ServiceWorker registration failed: ', err)
        });
    }
}

function updateServiceWorkers() {
    /*
      I waited 2 days for globalscripts to update itself
      and it didn't despite my closing the webapp, and even
      restarting the device and loading it back up.
      The sw.js file was changed which should trigger a
      serviceWorker update, but that didn't happen.
  
      Also putting this in here will mean that I can manually
      update as soon as I have uploaded a change, just to make
      sure the updated code works as I intended.
  
      Besides, who doesn't like a "check for updates" button :D
    */
    if (document.getElementById('uSW').classList.contains('uButtonGreen')) {
        if (gSWR && aSWR) {
            //reset the vars for the state of the serviceWorkers:
            isUpdating = aSWR.active ? 'a' : 0;
            gUpdating = gSWR.active ? 'a' : 0;
            //call the update function of the serviceWorker registrations:
            //note: these seem to only update one each restart of the app!
            /*
              Let's try updating one then updating the other a second later?
            */
            gSWR.update();
            window.setTimeout(function () {
                aSWR.update();
            }, 1000);
        }
    }

    //now grey out the button so it doesn't get spammed.
    document.getElementById('uSW').classList.remove('uButtonGreen');
    document.getElementById('uSW').classList.add('uButtonGrey');
    document.getElementById('uSW').innerHTML = 'Checking...';



    window.setTimeout(function () {
        updateSWresult();
    }, 3000);
}

function updateSWresult() {

    if ((isUpdating === 0 || isUpdating === 'a') && (gUpdating === 0 || gUpdating === 'a')) {
        upNotCheck('No new updates found.');
    }
    else if (isUpdating === 'e' || gUpdating === 'e') {
        upNotCheck('Error getting updates.');
    }
}

function upNotCheck(msg) {
    //wait for everything to load and the webapp to be displayed.
    if (!document.getElementById('loading')) {
        //the main content has been added to the document, so it
        //is safe to add the 'toast' popup now.
        if (msg.length < 3) {
            if (msg === 'i') {
                if (isUpdating === 'u') {
                    // replace the changelog with the newest verion.
                    fReplaceSimple("texts.js", "texts", "upNotUpdate")
                }

                else if (isUpdating === 'i' && (gUpdating === 'i' || gUpdating === 'u' || gUpdating === 'a')) {
                    upNotOpen('webapp files cached.<br>You can use this webapp while offline!', '');
                }
            }
        }
        else {
            upNotOpen(msg, '');
        }
    }
    else {
        //not yet initialized, so wait a bit then check again.
        window.setTimeout(function () {
            upNotCheck(msg);
        }, 500);
    }
}
function upNotOpen(msg, extras) {
    if (document.getElementById('toastContainer')) {
        //for the moment, only allow one popup.
        document.body.removeChild(document.getElementById('toastContainer'));

    }

    var newWindow = document.createElement('div');
    newWindow.id = 'toastContainer';
    document.body.appendChild(newWindow);

    newWindow.innerHTML =
        '<div id="toastPopup">' +
        '<div id="toastClose" class="buttonClose">X</div>' +
        '<div id="unp">' + msg + '</div>' + extras + '</div>';

    upSetClass(newWindow);
    //newWindow.style.top = (document.body.offsetHeight - (document.getElementById('unp').offsetHeight + document.getElementById('unp').offsetTop + 6)) + 'px';
    newWindow.style.height = (document.getElementById('unp').offsetHeight + document.getElementById('unp').offsetTop + 6) + 'px';
}

function upNotUpdate() {
    //now that the changelog file is replaced, open the toast popup.
    upNotOpen(
        'update installed.<br>'
        + '<button id="grdf" class="uButtons uButtonGreen"'
        + ' type="button"'
        + '>Restart for updated version</button>'
        + '<br><br>scroll up to see what&apos;s new:'
        , appCL
    );
    //if this doesn't work, just don't bother with the changelog..
    //put it back into upNotCheck just with the reload button.
}

function upSetClass(zElem) {
    var zElemChildList = zElem.children;
    for (var zChilds = 0; zChilds < zElemChildList.length; zChilds++) {
        if (zElemChildList[zChilds].nodeName.toLowerCase() != 'br') {
            zElemChildList[zChilds].classList.add('letScroll');
        }
        if (zElemChildList[zChilds].nodeName.toLowerCase() == 'a') {
            //new bit to make links black in the dialogue!
            zElemChildList[zChilds].style.color = '#000';
        }
        if (zElemChildList[zChilds].childElementCount > 0) {
            upSetClass(zElemChildList[zChilds]);
        }
    }
}
function upNotClose() {
    if (document.getElementById('toastPopup')) {
        document.getElementById('toastPopup').style.transition = '.4s ease-in';
        document.getElementById('toastPopup').style.top = '100%';
        window.setTimeout(function () {
            if (document.getElementById('toastContainer')) {
                //after a second, once the element is hidden, remove it.
                document.body.removeChild(document.getElementById('toastContainer'));
            }
        }, 500);
    }
}



//Now for the file loading portion of the loader file.

//loop through the required files, and load then now.
var a = ''
    , b = ''
    , c = ''
    , d = ''
    ;

for (var fileName of cssList) {
    fPreload(fileName);
}
for (var fileName of fileList) {
    fPreload(fileName);
}
function fPreload(fileName) {
    a = fileName[0] + fileName[1] + '.' + fileName[2]; //pre address - careful of CORS!
    b = fileName[1]; //the file name. No '.' dots allowed :D
    c = ''; // for images and audio, where special stuff has to happen.
    d = ''; //custom function call on load. (if needed)

    if (fileName.length == 4) {
        if (fileName[3].length === 1) {
            c = fileName[3];
        } else {
            d = fileName[3];
        }
    } else if (fileName.length == 5) {
        c = fileName[3];
        d = fileName[4];
    }

    if (dev && fileName[2] === 'js') {
        //load up the javascript files directly for ease of editing.
        fLoadSimple(a, b);
    }
    else {
        fLoad(a, b, c, d);
    }
}
function fLoad(zSrc, zFileName, zType, zLoad) {

    var zText = zFileName + ' file';

    fLoadProgressBar(zFileName, zText);
    //create a new global variable with the name of the file so that the progress bar moves a little bit even with no response from the server
    loadingVars[zFileName] = [];
    //create an object to keep the time and amount downloaded for dl speed:
    loadingVars[zFileName].text = zText;
    loadingVars[zFileName].time = performance.now();
    //high resolution version of date.now()
    loadingVars[zFileName].tick = performance.now();
    loadingVars[zFileName].size = 0;
    //the amount of data currently downlaoded.
    loadingVars[zFileName].speed = 2;
    //bytes per second (I think)
    loadingVars[zFileName].total = 0;
    loadingVars[zFileName].xhr = 1;
    //the total amount to be downloaded.
    //Create a new request to the server
    var xhr = new XMLHttpRequest();
    xhr.open('GET', zSrc, true);

    if (zType === 'i') {
        xhr.responseType = 'blob';
    } else if (zType === 'a') {
        xhr.responseType = 'arraybuffer';
    }
    //create an onLoad event for when the server has sent the data through to the browser
    xhr.addEventListener('loadend', function () {
        if (loadingVars[zFileName].xhr) {
            if (zType === 'a') {
                audioCtx.decodeAudioData(xhr.response).then(function (decodedData) {
                    audioSprite = decodedData;
                });
            } else {
                //Create an empty element of the type required (link=css, script=javascript, img=image)
                var a = '';
                if (zType) {
                    if (zType === 'i') {
                        a = 'img';
                    }
                    else if (zType === 'c') {
                        a = 'link';
                    }
                } else {
                    a = 'script';
                }
                var zElem = document.createElement(a);
                //if there is an ID for this script, add it to the new element
                if (zFileName) {
                    zElem.id = zFileName;
                }
                if (zType === 'i') {
                    //make sure there is no src
                    window.URL.revokeObjectURL(zElem.src);
                    //add the downloaded src to the element
                    zElem.src = window.URL.createObjectURL(xhr.response);
                } else if (zType === 'c') {
                    zElem.rel = 'stylesheet';
                    zElem.type = 'text/css';
                    zElem.href = xhr.responseURL;
                } else {
                    zElem.innerHTML = xhr.responseText;
                }
                document.head.appendChild(zElem);
                if (zFileName === 'gstyles') {
                    //change back the body color:
                    document.getElementById('loading').style.color = 'black';
                }
            }
        }
    }, false);
    xhr.addEventListener('error', function (e) {
        //will happen with files during local development
        console.log('error loading recource: ' + e)
    }, false);
    xhr.addEventListener('progress', function (e) {
        fileProgress(e, zFileName)
    }, false);
    xhr.send();
    //high resolution version of date.now()
    loadingVars[zFileName].frame = window.requestAnimationFrame(function () {
        fileProgresser(zFileName)
    });
}
function fLoadProgressBar(zFileName, zText) {
    if (document.getElementById('loading')) {
        //create new element for the progressbar of this loader
        var pBar = '<div id="' + zFileName + 'C" class="loadC">' + '<div id="' + zFileName + 'Pi" class="loadPi"></div>' + '<div id="' + zFileName + 'Pc" class="loadPc">' + zText + ' (...)</div>' + '</div>';
        //add the progreassBar to the game
        document.getElementById('loading').innerHTML += pBar;
        loaderReHeight();
    }
}
function fileProgress(e, zFileName) {
    if (document.getElementById(zFileName + 'Pi')) {
        if (e.lengthComputable) {
            if (loadingVars[zFileName].sizeUnknown) {
                loadingVars[zFileName].sizeUnknown = 0;
                window.clearInterval(loadingVars[zFileName].endCheckTimer);
                loadingVars[zFileName].endCheckTimer = null;
            }
            document.getElementById(zFileName + 'Pi').classList.remove('loadVV');
            //calculate the amount of time that has passed since last update:
            var timeNow = performance.now();
            //on slower devices, this might change by the end of the function, so make a var of the time.
            var timePassed = timeNow - loadingVars[zFileName].time;
            var amountDownloaded = e.loaded - loadingVars[zFileName].size;
            loadingVars[zFileName].speed = amountDownloaded / timePassed;
            //bytes per millisecond (I think)
            loadingVars[zFileName].time = timeNow;
            //high resolution version of date.now()
            loadingVars[zFileName].size = e.loaded;
            //the amount of data currently downlaoded
            if (!loadingVars[zFileName].total) {
                loadingVars[zFileName].total = e.total;
            }
            var pCent = (e.loaded / e.total) * 100;
            document.getElementById(zFileName + 'Pi').style.width = pCent + '%';
            document.getElementById(zFileName + 'Pc').innerHTML = loadingVars[zFileName].text + ' (' + pCent.toFixed(1) + '%)';
        } else {
            /*
              this appears to happen on github, which is reallllly annoying, but let's hack through it :D
              v1 - non-hack; move the inner progress back and forth in knight-rider/cylon/linux style...
              heh thinking about it.. maybe I should make it glowing... but still green!
            */
            //try pure css animation for the job:
            if (!loadingVars[zFileName].sizeUnknown) {
                loadingVars[zFileName].sizeUnknown = 1;
                loadingVars[zFileName].endCheckTimer = window.setInterval(function () {
                    filesLoadedCheck()
                }, 500);
            }
            document.getElementById(zFileName + 'Pi').classList.add('loadVV');
        }
    }
}
function fileProgresser(zFileName) {
    if (document.getElementById(zFileName + 'Pi')) {
        var zNum = parseFloat(document.getElementById(zFileName + 'Pi').style.width || 0);
        if (zNum < 100) {
            if (loadingVars[zFileName].total) {
                /*
                 * additional bit to calculate download speed since last fileProgress...
                 * All I need is the amount of time that has elapsed, and the amount
                 * that has been downloaded during that time, and the total.
                */
                //calculate the amount of time that has passed since last update:
                var timeNow = performance.now();
                //on slower devices, this might change by the end of the function, so make a var of the time.
                var timePassed = timeNow - loadingVars[zFileName].tick;
                var amountToAdd = parseFloat(loadingVars[zFileName].speed * timePassed);
                //300 because that is the amount of the timer Interval
                var percentToAdd = parseFloat((amountToAdd / loadingVars[zFileName].total) * 100);
                var pCent = (zNum + percentToAdd);
                document.getElementById(zFileName + 'Pi').style.width = pCent + '%';
                document.getElementById(zFileName + 'Pc').innerHTML = loadingVars[zFileName].text + ' (' + pCent.toFixed(1) + '%)';
            } else {
                document.getElementById(zFileName + 'Pc').innerHTML = loadingVars[zFileName].text + ' (...)';
                document.getElementById(zFileName + 'Pi').classList.add('loadVV');
            }
            loadingVars[zFileName].tick = timeNow;
            //high resolution version of date.now()
            loadingVars[zFileName].frame = window.requestAnimationFrame(function () {
                fileProgresser(zFileName)
            });
        } else {
            document.getElementById(zFileName + 'C').style.transition = 'opacity 1s';
            document.getElementById(zFileName + 'C').style.opacity = 0;
            window.setTimeout(function () {
                if (document.getElementById(zFileName + 'C')) {
                    document.getElementById(zFileName + 'C').parentNode.removeChild(document.getElementById(zFileName + 'C'));
                    loaderReHeight();
                }
                filesLoadedCheck();
            }, 1000);
        }
    }
}
function filesLoadedCheck() {
    //if all essential data is loaded, initialize. Once only
    if (document.getElementById('loading')) {
        //check for the styles:
        for (var fileName of cssList) {
            if (!document.getElementById(fileName[1])) {
                //Not all scripts have finished (down)loading, so do not start yet.
                return;
            }
        }
        //check for the scripts:
        for (var fileName of fileList) {
            if (!document.getElementById(fileName[1])) {
                //Not all scripts have finished (down)loading, so do not start yet.
                return;
            }
        }
        //getting this far means everything is loaded. continue...
        //make sure to only run this once :D
        if (!isLoaded) {
            isLoaded = 1;
            //hopefully this will end all timers instead of having to clear them all individually.
            //This happens on gitHub at least.
            loadingVars = [];
            document.getElementById('loading').parentNode.removeChild(document.getElementById('loading'));
            Init();
        }
    }
}
function loaderReHeight() {
    document.getElementById('loading').style.top = ((window.innerHeight - document.getElementById('loading').offsetHeight) / 2) + 'px';
}
/*
  fo ease of developing, directly load the js files into the DOM.
  use var 'dev' for switching this and fLoad.
  ONLY FOR JAVASCRIPT FILES.
*/
function fLoadSimple(zSrc, fileName) {
    var firstScript = document.getElementsByTagName('script')[0];
    var zScript = document.createElement('script');
    //zScript.type = 'text/javascript'; //needed in modern browsers?!Q?
    zScript.id = fileName + 'l';
    zScript.src = zSrc;
    zScript.addEventListener('load', function () {
        this.id = this.id.slice(0, -1);
        filesLoadedCheck();
    });
    firstScript.parentNode.insertBefore(zScript, firstScript);
}

function fReplaceSimple(zSrc, fileName, funky) {
    /*
      firstly, single out all the scripts in case a div or something
      has the same ID
    */
    var zScripts = document.getElementsByTagName('script');
    var oldScript;// = zScripts.getElementById(fileName);
    // look for the old file name in the zScripts list
    for (var scrpt in zScripts) {
        if (zScripts[scrpt].id === fileName) {
            oldScript = zScripts[scrpt];
        }
    }

    if (oldScript) {
        var newScript = document.createElement('script');
        newScript.id = fileName + 'l';
        newScript.src = zSrc;
        newScript.addEventListener('load', function () {
            this.id = this.id.slice(0, -1);
            window[funky](); //call a function when the script is loaded/replaced.
        });
        oldScript.parentNode.replaceChild(newScript, oldScript)
    }
}
/*
  true makes the window reload ignoring cache - load from server.
  HL3 confirmed XD
*/
function reloadDrFreeman() {
    location.reload(true);
}
