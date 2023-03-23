/*
A personal and private browser-based food diary to keep track of your daily calorie intake.

potential names for the project:
Food Diary
Food Watcher
Food Tracker
Food Calorie Tracker
Private Food Diary
Calorie Diary
*Calorie Watcher - the one I originaly chose.
Calorie Tracker
calorie storer

*/
var zAppPrefix = 'cw'           /* Because localStorage uses the base domain not the exact page! */
    , d1 = '^*'                   /* hopefully obscure enough that it'll never happen in a string! */
    , d2 = '#*'                   /* as above. These are delimiters for seperating data. */
    , savedToday
    , savedTotal
    , maintCalories
    , targetCalories
    , todayList = []
    , savedFoodList = []
    ;

function initContent() {
    return '<h1 id="titleHead" style="text-align:center;'
        + 'font-size:2.5em;font-family: Arial, Helvetica, sans-serif;margin:0;text-shadow:0 0 5px;cursor:default;">'
        + '<span style="color:rgb(255, 165, 0);">Calorie</span>'
        + '<span style="color:rgb(0, 0, 205);font-style:italic;">Watcher</span></h1>'
        + '<div id="CalorieStuff">Maint Calories: '
        + '<input type="number" id="maintCals" class="inputTing editEnable"'
        + ' style="width: 4em;">'
        + ' = <span id="maintCalsLeft"></span> cals left.'
        + '<br>Target Calories:'
        + '<input type="number" id="targCals" class="inputTing editEnable"'
        + ' style="width: 4em;">'
        + ' = <span id="targCalsLeft"></span> cals left.'
        + '</div>'
        + '<div id="todayPane"><div id="todayPaneInner">'
        + '<h1 style="margin:0.3em 0em 0em 0em;">Today&apos;s food list</h1>'
        + '<button id="t+" class="foodButton diaButton uButtonOrange" type="button"'
        + ' style="width:7em;font-size:1em;">New&nbsp;Day</button>'
        + '<div id="searchPane" style="position:relative;">'
        + '<input id="fdsrch" type="search" class="foodButton editEnable" style="margin:0;width:100%;" placeholder="add food (search)">'
        + '<div id="searchFoods"></div>'
        + '</div>'
        + '<div id="todayPaneFoods"></div>'
        + '</div></div>'
        ;
}

function runApp() {
    savedToday = (storageLoad('Today') || 0);
    savedTotal = (storageLoad('TotalCals') || 0);
    maintCalories = (storageLoad('MaintCals') || 1800);
    targetCalories = (storageLoad('TargCals') || 1600);
    document.getElementById('maintCals').value = maintCalories;
    document.getElementById('targCals').value = targetCalories;
    loadFoodList();
    savedFoodsLoad();
}

function loadFoodList() {
    var firstScript = document.getElementsByTagName('script')[0];
    var zNewElement = document.createElement('script');
    zNewElement.src = '/static/js/watcher/foodList.js';
    zNewElement.id = 'foodlistjs';

    zNewElement.addEventListener('load', function () {
        foodListPopulate();
        todayPopulate();
    });

    firstScript.parentNode.insertBefore(zNewElement, firstScript);
}

function dialogueMake(zId, message, zFocus) {
    var newElement = document.createElement('div');
    newElement.id = zId //add the index number here so we know what do add later.
    newElement.className = 'dialog';
    //add it to the foodpane:
    document.body.appendChild(newElement);

    newElement.style.top =
        (document.getElementById('titleHead').offsetHeight - 2)
        + 'px';

    newElement.style.height =
        window.innerHeight
        - document.getElementById('titleHead').offsetHeight
        + 'px';

    newElement.innerHTML = message;

    if (zFocus) {
        document.getElementById(zFocus).focus();
    }
}

function foodListPopulate() {
    //["Banana", 89, 100, 'g']
    foodSearch();
    document.getElementById('fdsrch').addEventListener('input', foodSearch, false);
}

function foodSearch() {
    var toMatch = document.getElementById('fdsrch').value.toLowerCase()
        , searchList = []
        ;

    var regMatch = new RegExp('\\b' + toMatch, 'gi');

    //debugger;
    if (toMatch.length > 0) {
        //add custom foods foodlist first, so they are on the top of the list
        for (var x in savedFoodList) {
            if (regMatch.test(savedFoodList[x][1])) {
                searchList.push(savedFoodList[x]); //copy the entire array entry
            }
        }
        //loop through all foods in the foodList, and make an array of
        //matching foods
        for (var x in foodList) {
            if (foodList[x][1].match(regMatch)) {
                searchList.push(foodList[x]); //copy the entire array entry
            }
        }
    }
    var listOfFoods = '';

    if (searchList.length || toMatch.length > 0) {
        //list the matching foods - this would be the same as populateFoods?
        for (var x in searchList) {
            listOfFoods += '<div id="fl'
                + searchList[x][0]
                + '" class="foodButton uButtonGreen">'
                + searchList[x][1] + '&nbsp;&nbsp;'
                + '<span id="fi'
                + searchList[x][0]
                + '" style="font-size:.75em;">('
                + searchList[x][2] + '/'
                + searchList[x][3]
                + searchList[x][4]
                + ')</span></div>'
                ;
        }

        listOfFoods +=
            '<div id="f+"'
            + ' class="foodButton uButtonGreen" style="width:7em;margin:0.5em auto;">'
            + 'Add New&nbsp;Food</div>'
    }

    //add the list to the pane.
    document.getElementById('searchFoods').innerHTML = listOfFoods;
    //make the list scrollable
    upSetClass(document.getElementById('searchFoods'));
}

function findFoodIndex(num) {
    //this is needed because the index number of the food may
    //not be the arrays index number, say for instance when the
    //array has been sorted, or added to, or an element in the
    //array was deleted. the food's individual number will remain.
    for (var x in foodList) {
        if (foodList[x][0] == num) {
            return x; //breaks out of the loop and returns, because no finally.
        }
    }
}
function findFoodFromIndex(num) {
    if (num >= 1000000) {
        for (var x in savedFoodList) {
            if (savedFoodList[x][0] == num) {
                return savedFoodList[x]; //breaks out of the loop and returns, because no finally.
            }
        }
    }
    for (var x in foodList) {
        if (foodList[x][0] == num) {
            return foodList[x]; //breaks out of the loop and returns, because no finally.
        }
    }
}

function foodListClick(targ) {
    //the index number is the individual number assigned to the food.
    //this does not change.
    var indexNum = parseInt(targ.id.slice(2));

    //Create the aad food dialogue:
    var zId = indexNum + '_add'; //add the index number here so we know what do add later.

    //add stuff to it...
    var tmpArry = findFoodFromIndex(indexNum);

    var message =
        '<p style="margin:4px;font-size:2em;">Add food to today&apos;s list</p>'
        + '<H2>' + tmpArry[1] + ':</h2>'
        + '<input type="number" id="addAmount" class="inputThingy editEnable" style="float:none;width:5em;" value="">' + tmpArry[4]
        + '<br>OR<br>'
        + '<input type="number" id="addcals" class="inputThingy editEnable" style="float:none;width:5em;" value="">  Calories &nbsp;'
        + '</p>'
        + '<button id="y" class="foodButton diaButton uButtonGreen" type="button" style="clear:both;float:left;width:5em;">add</button>'
        + '<button id="b" class="foodButton diaButton uButtonRed" type="button" style="float:right;width:5em;">Cancel</button>'
        ;

    dialogueMake(zId, message, 'addAmount');
    document.getElementById('addAmount').addEventListener('input', function () { dialogueKeyUp('addAmount', indexNum) }, false);
    document.getElementById('addcals').addEventListener('input', function () { dialogueKeyUp('addcals', indexNum) }, false);
    //dialogueKeyUp(targ)
}

function savedFoodDialog() {
    var message =
        '<p style="margin:4px;font-size:2em;">Add new food to list</p>'

        + '<input type="text" id="afName" class="inputThingy editEnable" placeholder="Name of Food">'
        + '<br><br>'
        + '<input type="number" id="afCals" class="inputThingy editEnable" placeholder="calories" style="width:23%;margin-right:2%;">'
        + '<input type="text" id="afPer" class="inputThingy editEnable" placeholder=" per (eg 100g, 100ml, 1 slice)" style="width:75%;clear:none;padding-left:0;text-align:left;">'

        + '<button id="c" class="foodButton diaButton uButtonGreen" type="button" style="width:5em;clear:both;float:left;">Add</button>'
        + '<button id="b" class="foodButton diaButton uButtonRed" type="button" style="width:5em;float:right;">Cancel</button>'
        ;
    dialogueMake('addFood', message, '');
}

function savedFoodAdd() {
    var a = (1000000 + savedFoodList.length).toFixed()
        , b = document.getElementById('afName').value
        , c = document.getElementById('afCals').value
        , perSplit = document.getElementById('afPer').value
        , d
        , e
        ;
    //split up the per into amount and description
    d = parseFloat(perSplit).toString(); //should just nab the number at the start of the string
    e = perSplit.slice(perSplit.indexOf(d) + d.length, perSplit.length); //take the number off the front.

    // if user puts "slice" for per without saying "1 slice".
    if (!isFinite(d)) {
        d = 1;
    }

    if (a && b && c && d && e) {
        //later, maybe add checking for this
        savedFoodList.push([
            a /*alphabet-based index*/
            , b /*name of food (eg "Tesco Sweet Popcorn")*/
            , c /*amount of calories (eg 490)*/
            , d /*per amount (eg per 100)*/
            , e /*per description (eg g)*/
        ]);

        savedFoodsSave();
        document.getElementById('fdsrch').value = b;
        foodSearch();
        searchBlur();
    }
    else {
        if (!b) {
            document.getElementById('afName').style.backgroundColor = 'hsla(0, 100%, 50%, .33)';
        }
        if (!c) {
            document.getElementById('afCals').style.backgroundColor = 'hsla(0, 100%, 50%, .33)';
        }
        if (!d || !e) {
            document.getElementById('afPer').style.backgroundColor = 'hsla(0, 100%, 50%, .33)';
        }
    }
}

function savedFoodsLoad() {
    var savedFoods = storageLoad('SavedFoods');

    if (savedFoods) {
        var b = savedFoods.split(d1), c;

        for (var x = 0; x < (b.length - 1); x++) {
            c = b[x].split(d2);
            /*[148, "Tesco Sweet Popcorn", 490, 100, 'g']*/
            savedFoodList.push([
                c[0] /*alphabet-based index*/
                , c[1] /*name of food (eg "Tesco Sweet Popcorn")*/
                , c[2] /*amount of calories (eg 490)*/
                , c[3] /*per amount (eg per 100)*/
                , c[4] /*per description (eg g)*/
            ]);
        }
    }
}

function savedFoodsSave() {
    var toSave = '';// = todaysDate(); //today's date UTC milliseconds from 1970-01-01
    /*[148, "Tesco Sweet Popcorn", 490, 100, 'g']*/
    for (var x in savedFoodList) {
        toSave += savedFoodList[x][0] /*alphabet-based index*/
            + d2 + savedFoodList[x][1] /*name of food (eg "Tesco Sweet Popcorn")*/
            + d2 + savedFoodList[x][2] /*amount of calories (eg 490)*/
            + d2 + savedFoodList[x][3] /*per amount (eg per 100)*/
            + d2 + savedFoodList[x][4] /*per description (eg g)*/
            + d1
            ;
    }
    storageSave('SavedFoods', toSave);
}

function searchFocus() {
    //put the searchPane into the todayPane
    document.getElementById('todayPane').insertBefore(
        document.getElementById('searchPane')
        , document.getElementById('todayPaneInner')
    );
    document.getElementById('fdsrch').focus();
    //hide the food list panel
    document.getElementById('todayPaneInner').hidden = 'true';
    mouseClear();
}

function searchBlur() {
    if (document.getElementById('fdsrch').value.length === 0) {
        //put the searchPane back.
        document.getElementById('todayPaneInner').insertBefore(
            document.getElementById('searchPane')
            , document.getElementById('todayPaneFoods')
        );
        document.getElementById('searchPane').style.top = '';
        //show the food list panel
        document.getElementById('todayPaneInner').hidden = '';
        mouseClear();
    }
}
function todayCheck() {
    //check that the current list of food is today.
    //if not, ask user if there as anything else
    //then copy the cals for the day, and add to 
    //the pastPane.
}


function todayPopulate() {
    //do similar to foodlist here!
    if (savedToday) {
        var b = savedToday.split(d1), c;
        /*
        if (b[0] != todaysDate()) {
          todayNew();
        }
        */

        //to save space, only save the indexNum and weight of a food
        //then find the food in the foodlist, and populate todatList with
        //all of the details (ram should never be a problem!)

        for (var x = 0; x < (b.length - 1); x++) {
            c = b[x].split(d2);
            //find the food from it's indexNum
            //var indexNum = findFoodIndex(c[0]);
            var tmpArry = findFoodFromIndex(c[0]);

            //add the food and it's stuff to todayList
            todayList.push([
                tmpArry[0] /* indexNum */
                , tmpArry[1] /* food's name */
                , tmpArry[2] /* amount per */
                , tmpArry[3] /* per something (eg.100g) */
                , tmpArry[4] /* unit desc (eg. "g") */
                , c[1]       /* weight of the food */
            ]);
        }
    }

    var listOfFoods = '';

    if (todayList.length === 0) {
        if (typeof (Storage) !== 'undefined') {
            zNum = localStorage.length;
        }
        //check if there is anything stored
        if (!zNum) {
            listOfFoods += '<p id="localDataNotice">Calorie Watcher uses your browser&apos;s'
                + ' Local Storage to remember your data; No data goes anywhere!</p>'
        }
    } else {
        // reverse the list so the oldest item is at the bottom.
        for (var x = todayList.length - 1; x >= 0; x--) {
            //add to list.
            listOfFoods += '<div id="tl' + x + '" class="foodButton uButtonGreen">'
                + todayList[x][1] + ': '
                + calcCals(todayList[x][5], todayList[x][0])
                + ' cals'
                + '</div>'
                ;
        }
    }

    document.getElementById('todayPaneFoods').innerHTML = listOfFoods;

    document.getElementById('maintCals').addEventListener('blur', saveCals);
    document.getElementById('targCals').addEventListener('blur', saveCals);
    document.getElementById('fdsrch').addEventListener('click', searchFocus, false);
    document.getElementById('fdsrch').addEventListener('blur', searchBlur, false);
    todayRecalculate();
    searchBlur();
}

function todayAdd(a, b) {
    //add the new food into today's food list
    //a is the food's individual index number
    //b is the weight of the food.

    //find the food from it's indexNum
    var tmpArry = findFoodFromIndex(a);

    //add the food and it's stuff to todayList
    todayList.push([
        tmpArry[0] /* indexNum */
        , tmpArry[1] /* food's name */
        , tmpArry[2] /* amount per */
        , tmpArry[3] /* per something (eg.100g) */
        , tmpArry[4] /* unit desc (eg. "g") */
        , b          /* weight of the food */
    ]);
    //
    var x = todayList.length - 1;
    //Create the added food entry:
    var newElement = document.createElement('div');
    newElement.id = 'tl' + x; //add the index number here so we know what do add later.
    newElement.className = 'foodButton uButtonGreen';
    //add it to the top of the foodpane: (don't have to worry about null cos tis never empty)
    document.getElementById('todayPaneFoods').insertBefore(
        newElement, document.getElementById('todayPaneFoods').firstChild
    );
    //add stuff to the new entry
    newElement.innerHTML =
        todayList[x][1] + ': '
        + calcCals(todayList[x][5], todayList[x][0])
        + ' cals'
        ;
    if (document.getElementById('localDataNotice')) {
        document.getElementById('localDataNotice').parentNode.removeChild(
            document.getElementById('localDataNotice')
        );
    }
    todayRecalculate();
    todaySave();
    document.getElementById('fdsrch').value = '';
    foodSearch();
    searchBlur();
}

function todayRemove(a) {
    //delete the thing!
    delete todayList[a];
    //delete the food from the food list
    document.getElementById('tl' + a).parentNode.removeChild(
        document.getElementById('tl' + a)
    );
    //recalculate and save the updated list
    todayRecalculate();
    todaySave();
    searchBlur();
}

function todayEdit(a, b) {
    //
    todayList[a][5] = b;
    document.getElementById('tl' + a).innerHTML =
        todayList[a][1] + ': '
        + calcCals(todayList[a][5], todayList[a][0])
        + ' cals'
        ;
    todayRecalculate();
    todaySave();
}

function todayRecalculate() {
    var a = 0;
    for (var x in todayList) {
        a += parseFloat(calcCals(todayList[x][5], todayList[x][0]));
    }

    document.getElementById('maintCalsLeft').innerHTML =
        maintCalories - a.toFixed();

    document.getElementById('targCalsLeft').innerHTML =
        targetCalories - a.toFixed();

    //rather inefficient place for it, but put letScroll adder here:
    upSetClass(document.getElementById('todayPane'));
}


function todaySave() {
    var toSave = '';// = todaysDate(); //today's date UTC milliseconds from 1970-01-01
    //just save the food's indexNum and it's weight to save space.
    for (var x in todayList) {
        toSave += todayList[x][0]
            + d2 + todayList[x][5]
            + d1
            ;
    }
    storageSave('Today', toSave);
}

function todaysDate() {
    var a = new Date();
    //return today from midnight, so it remains the same until next day.
    return Date.UTC(a.getUTCFullYear().toString(), a.getUTCMonth().toString(), a.getUTCDate().toString());
}

function todayNew() {
    //add today's cals left to pastList and pastPane
    //save pastList, and blank then save todayList//, and todayDate
    savedTotal = (parseInt(savedTotal) +
        parseInt(document.getElementById('maintCalsLeft').innerHTML));
    storageSave('TotalCals', savedTotal);
    savedToday = null;
    todayList = [];
    todaySave();
    todayPopulate();
}

function todayListClick(targ) {
    if (targ.id === 't+') {
        //show dialogue to confirm new day.
        var message =
            '<H2>Confirm new day</h2>'
            + '<p>Are you sure that all foods are listed for today?'
            + '</p>'
            + '<button id="n" class="foodButton diaButton uButtonGreen" type="button" style="clear:both;float:left;">Confirm</button>'
            + '<button id="b" class="foodButton diaButton uButtonRed" type="button" style="float:right;">Cancel</button>'
            ;

        dialogueMake('new', message, '');
    } else if (targ.id.slice(0, 2) === 'tl') {
        //the index number is the individual number assigned to the food.
        //this does not change.
        var indexNum = parseInt(targ.id.slice(2));

        //Create the aad food dialogue:
        var zId = todayList[indexNum][0] + '_edit_' + indexNum; //add the index number here so we know what do add later.

        var message =
            '<H2>Edit ' + todayList[indexNum][1] + ':</h2>'
            + '<p>'
            + '<input type="number" id="addAmount" class="inputThingy editEnable" style="float:none;width:5em;" value="' + todayList[indexNum][5] + '">' + todayList[indexNum][4]
            + '<br>OR<br>'
            + '<input type="number" id="addcals" class="inputThingy editEnable" style="float:none;width:5em;" value="' + calcCals(todayList[indexNum][5], todayList[indexNum][0]) + '">  Calories &nbsp; &nbsp;'
            + '</p>'
            + '<button id="a" class="foodButton diaButton uButtonGreen" type="button" style="clear:both;float:left;width:5em;">Confirm</button>'
            + '<button id="b" class="foodButton diaButton uButtonOrange" type="button" style="width:5em;">Cancel</button>'
            + '<button id="r" class="foodButton diaButton uButtonRed" type="button" style="float:right;width:5em;">Remove</button>'
            ;

        dialogueMake(zId, message, 'addAmount');
        document.getElementById('addAmount').addEventListener('input', function () { dialogueKeyUp('addAmount', todayList[indexNum][0]) }, false);
        document.getElementById('addcals').addEventListener('input', function () { dialogueKeyUp('addcals', todayList[indexNum][0]) }, false);    //dialogueKeyUp(targ)
    }
}

function saveCals() {
    maintCalories = parseInt(document.getElementById('maintCals').value);
    targetCalories = parseInt(document.getElementById('targCals').value);
    storageSave('MaintCals', maintCalories);
    storageSave('TargCals', targetCalories);
    todayRecalculate();
}
function dialogueMouseUp(targ) {
    //look only for the buttons:
    if (targ.id === 'y' || targ.id === 'n'
        || targ.id === 'e' || targ.id === 'a'
        || targ.id === 'b' || targ.id === 'r' || targ.id === 'c'
    ) {
        var zDialog = targ.parentNode; //only ever one element within the dialogue div
        if (targ.id === 'y') {
            //add to today's list, also recalculating today's calories
            todayAdd(
                parseInt(zDialog.id)
                , parseFloat(document.getElementById('addAmount').value)
            );
        } else if (targ.id === 'e') {
            //edit the seleted food item's details
        } else if (targ.id === 'a') {
            //edit a list item on today's list
            todayEdit(
                zDialog.id.split('_')[2]
                , parseFloat(document.getElementById('addAmount').value)
            );
        } else if (targ.id === 'r') {
            //remove food from todayPane and todayList
            todayRemove(zDialog.id.split('_')[2]);
        } else if (targ.id === 'n') {
            //New day dialogue confirmed
            todayNew();
        } else if (targ.id === 'c') {
            //New day dialogue confirmed
            savedFoodAdd();
        }
        //no matter the button pressed, close the dialogue:
        zDialog.parentNode.removeChild(zDialog);
    }
}

function dialogueKeyUp(zID, listNum) {
    var zNum = parseFloat(document.getElementById(zID).value);
    if (zID === 'addAmount' && zNum) {
        document.getElementById('addcals').value =
            calcCals(zNum, listNum);
    } else if (zID === 'addcals' && zNum) {
        document.getElementById('addAmount').value =
            calcWeight(zNum, listNum);
    }
}
//use toFixed instead of parseInt, because I want a string anyway :)
function calcCals(zWeight, zNum) {
    var tmpArry = findFoodFromIndex(zNum);
    //["Banana", 89, 100, 'g']
    var xBy = tmpArry[2] / tmpArry[3];//would be .89
    return (zWeight * xBy).toFixed();
}

function calcWeight(zcals, zNum) {
    var tmpArry = findFoodFromIndex(zNum);
    //["Banana", 89, 100, 'g']
    var xBy = tmpArry[3] / tmpArry[2];//would be .89
    return (zcals * xBy).toFixed(1);
}

function mClick(targ) {
    var zParentID = ['--', '--'];
    var zParentClass = '';

    if (targ.parentNode) {
        if (targ.parentNode.id) {
            zParentID = targ.parentNode.id.split('_');
        }
        if (targ.parentNode.className) {
            zParentClass = targ.parentNode.className;
        }
    }

    if (targ.id.slice(0, 2) === 'fl' || targ.id.slice(0, 2) === 'fi') {
        foodListClick(targ);
    } else if (zParentID[0] == 'todayPaneInner' || zParentID[0] == 'todayPaneFoods' || targ.id.slice(0, 2) === 'tl') {
        todayListClick(targ);
    } else if (zParentClass === 'dialog') {
        dialogueMouseUp(targ);
    } else if (targ.id === 'f+') {
        savedFoodDialog();
    }
}
