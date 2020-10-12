
$(document).ready(function () {

    viewport = document.querySelector("meta[name=viewport]");
    if (viewport != null) {
        var legacyWidth = 1280;
        var windowWidth = window.screen.width;
        var scale = (windowWidth / legacyWidth).toFixed(3);
        init_str = "initial-scale=".concat(scale.toString());
        min_str = "minimum-scale=".concat(scale.toString());
        max_str = "maximum-scale=".concat(scale.toString());
        viewport.setAttribute("content", init_str.concat(",").concat(min_str).concat(",").concat(max_str));
    }

    session.then(
        function (session) {
            console.log('Qimessaging: connected!');
        },
        function () {
            //console.error('Qimessaging: disconnected!');
            stateChanged();
        }
    );

    session.subscribeToEvent("HelloWorld/Question", function (title) {
        display("#yes_no");
        $("#yes_no .title").text(title);
    });

    session.subscribeToEvent("HelloWorld/Logo", function (dummy) {
        display("#logo");
    });

    session.subscribeToEvent("HelloWorld/Pepper", function (dummy) {
        display("#pepper");
    });

    session.subscribeToEvent("HelloWorld/Survey", function (dummy) {
        display("#survey");
    });

    session.subscribeToEvent("HelloWorld/Exit", function (dummy) {
        display("#logo");
    });

    session.subscribeToEvent("HelloWorld/Home", function (dummy) {
        display("#home");
    });
    session.subscribeToEvent("HelloWorld/RobAutisme", function (dummy) {
        display("#robAutisme");
        document.getElementById("robAutismeVideo").play();
    });
    session.subscribeToEvent("HelloWorld/RobZheimer", function (dummy) {
        display("#robZheimer");
    });
    session.subscribeToEvent("HelloWorld/RobEduc", function (dummy) {
        display("#robEduc");
    });
    session.subscribeToEvent("HelloWorld/Equipe", function (dummy) {
        display("#equipe");
    });
    session.subscribeToEvent("HelloWorld/Projets", function (dummy) {
        display("#projets");
    });
    session.subscribeToEvent("HelloWorld/Jouons", function (dummy) {
        display("#jouons");
    });
    session.subscribeToEvent("HelloWorld/Animaux", function (dummy) {
        display("#animaux");
    });
    session.subscribeToEvent("HelloWorld/SportsMusique", function (dummy) {
        display("#sportsMusique");
    });
    session.subscribeToEvent("HelloWorld/Danser", function (dummy) {
        display("#danser");
    });
    session.subscribeToEvent("HelloWorld/Autres", function (dummy) {
        display("#autres");
    });
    session.subscribeToEvent("HelloWorld/abientot", function (dummy) {
        display("#abientot");
    });


    
});


multipleClick_clickTime = null; multipleClick_target = null; function preventMultipleClick(id) { sameTarget = false; if (id == multipleClick_target) { sameTarget = true; } multipleClick_target = id; fastClick = false; var currentClickTime = new Date(); if (currentClickTime - multipleClick_clickTime < 500) { fastClick = true; } multipleClick_clickTime = currentClickTime; return (sameTarget && fastClick); }
var current_item = null; var current_timeout = null;
function display(id){
    new_menu = $( id );
    if (current_item == null) {
        current_item = new_menu;
        new_menu.fadeIn();
    } else if (current_item == new_menu) {
        return;
    } else {
        current_item.stop( true, true ).fadeOut(complete=function() {
            current_item = new_menu;
            new_menu.fadeIn();
        });
    }
}

function stateChanged(state, behaviorName) {
    console.log("State changed:", state);
    if (state == "Ready") display(".main_menu");
    else if (state == "BehaviorRunning") {
        display("#back_menu");
        current_running_behavior=behaviorName;
    }
    else if (state == "Sleeping")   display("#onsleep_menu");
    else display("#loading_menu");
}

var current_running_behavior = "";
function runBehavior(behavior) {
    return new Promise(function(resolve, reject) {
        session.service("ALBehaviorManager").then(
            function(bm) {
                bm.runBehavior(behavior).then(
                    function() { console.log("Behavior run"); resolve(); },
                    function(error) { console.error(error); reject(error); }
                );
            },
            function(error) { console.log(error); reject(error); }
        );
    });
}
function stopBehavior(behavior) {
    return new Promise(function(resolve, reject) {
        if(behavior) {
            session.service("ALBehaviorManager").then(
                function(bm) {
                    console.log("Stopping behavior: ", behavior);
                    bm.stopBehavior(behavior).then(
                        function() { current_running_behavior = ""; console.log("Behavior stopped"); resolve(); },
                        function(error) { console.log(error); reject(error); }
                    );
                },
                function(error) { console.log(error); reject(error); }
            );
        } else {
            session.service("DemoLauncher").then(
                function(DemoLauncher) {
                    DemoLauncher.get_running_behavior().then(
                        function(behavior) {
                            if (behavior) {
                                console.log("DemoLauncher is running behavior: ", behavior);
                                stopBehavior(behavior);
                            } else {
                                console.log("DemoLauncher is not running any behavior...");
                                reject(error);
                            }
                        },
                        function(error) { console.log(error); reject(error); }
                    );
                },
                function(error) { console.log(error); reject(error); }
            );
        }
    });
}

function adjustVolume(diff) {
    return new Promise(function(resolve, reject) {
        session.service("ALAudioDevice").then(
            function(audio) {
                audio.getOutputVolume().then(
                    function(currentVolume) {
                        var newVolume = currentVolume + diff;
                        if (newVolume > 100) { newVolume = 100; }
                        if (newVolume <  20) { newVolume =  20; }
                        audio.setOutputVolume(newVolume).then(resolve, reject);
                    },
                    function(error) { console.log(error); reject(error); }
                );
            },
            function(error) { console.log(error); reject(error); }
        );
    });
}

function setAnswer(value) {
    session.service("ALMemory").then(function (ALMemory) {
        if (value) {
            ALMemory.raiseEvent("HelloWorld/AnswerYes", "");
        } else {
            ALMemory.raiseEvent("HelloWorld/AnswerNo", "");
        }
    });
    return;
}

function setSurvey(value) {
    session.service("ALMemory").then(function (ALMemory) {
		switch (value) {
			case 1:
				ALMemory.raiseEvent("HelloWorld/SurveyGood", "");
				break;
			case 0:
				ALMemory.raiseEvent("HelloWorld/SurveyNeutral", "");
				break;
			case -1:
				ALMemory.raiseEvent("HelloWorld/SurveyBad", "");
				break;
		}
    });
    return;
}

function bPepper(value) {
    session.service("ALMemory").then(function (ALMemory) {
        if (value) {
            ALMemory.raiseEvent("HelloWorld/bPepper", "");
        }
    });
    return;
}
function fHome(value) {
    session.service("ALMemory").then(function (ALMemory) {
        if (value) {
            ALMemory.raiseEvent("HelloWorld/back_Home", "");
        }
    });
    return;
}

function buttons_Home(value) {
    session.service("ALMemory").then(function (ALMemory) {
        switch (value) {
            case 'bPepper':
                ALMemory.raiseEvent("HelloWorld/bPepper", "");
                break;
            case 'bEquipe':
                ALMemory.raiseEvent("HelloWorld/bEquipe", "");
                break;
            case 'bProjets':
                ALMemory.raiseEvent("HelloWorld/bProjets", "");
                break;
            case 'bJouons':
                ALMemory.raiseEvent("HelloWorld/bJouons", "");
                break;
        }
    });
    return;
}

function fEquipe(imgs) {
    var expandImg = document.getElementById("expandedImg"); // Get the expanded image
    var imgText = document.getElementById("imgtext"); // Get the image text
    // Use the same src in the expanded image as the image being clicked on from the grid
    expandImg.src = imgs.src;
    // Use the value of the alt attribute of the clickable image as text inside the expanded image
    imgText.innerHTML = imgs.alt;
    // Show the container element (hidden with CSS)
    expandImg.parentElement.style.display = "block";
    switch (imgs.alt) {
        case 'Sophie':
            ALMemory.raiseEvent("HelloWorld/fEquipe/Sophie", "");
            break;
        case 'Noemie':
            ALMemory.raiseEvent("HelloWorld/fEquipe/Noemie", "");
            break;
        case 'Elodie':
            ALMemory.raiseEvent("HelloWorld/fEquipe/Elodie", "");
            break;
        case 'Isaac':
            ALMemory.raiseEvent("HelloWorld/fEquipe/Isaac", "");
            break;
    }
}

function fprojets(value) {
    session.service("ALMemory").then(function (ALMemory) {
        switch (value) {
            case 'RobAutisme':
                ALMemory.raiseEvent("HelloWorld/fprojets/RobAutisme", "");
                break;
            case 'RobZheimer':
                ALMemory.raiseEvent("HelloWorld/fprojets/RobZheimer", "");
                break;
            case 'RobEduc':
                ALMemory.raiseEvent("HelloWorld/fprojets/RobEduc", "");
                break;
        }
    });
    return;
}

function fjouons(value) {
    session.service("ALMemory").then(function (ALMemory) {
        switch (value) {
            case 'Animaux':
                ALMemory.raiseEvent("HelloWorld/fjouons/Animaux", "");
                break;
            case 'Danser':
                ALMemory.raiseEvent("HelloWorld/fjouons/Danser", "");
                break;
            case 'Sportes et Musique':
                ALMemory.raiseEvent("HelloWorld/fjouons/SportsMusique", "");
                break;
            case 'Autres':
                ALMemory.raiseEvent("HelloWorld/fjouons/Autres", "");
                break;
        }
    });
    return;
}
function fanimaux(value) {
    session.service("ALMemory").then(function (ALMemory) {
        switch (value) {
            case 'Elephant':
                ALMemory.raiseEvent("HelloWorld/fjouons/fanimaux/Elephant", "");
                break;
            case 'Souris':
                ALMemory.raiseEvent("HelloWorld/fjouons/fanimaux/Souris", "");
                break;
            case 'Gorille':
                ALMemory.raiseEvent("HelloWorld/fjouons/fanimaux/Gorille", "");
                break;
        }
    });
    return;
}
function fanimaux(value) {
    session.service("ALMemory").then(function (ALMemory) {
        switch (value) {
            case 'Elephant':
                ALMemory.raiseEvent("HelloWorld/fjouons/fanimaux/Elephant", "");
                break;
            case 'Souris':
                ALMemory.raiseEvent("HelloWorld/fjouons/fanimaux/Souris", "");
                break;
            case 'Gorille':
                ALMemory.raiseEvent("HelloWorld/fjouons/fanimaux/Gorille", "");
                break;
        }
    });
    return;
}
function fsportsMusique(value) {
    session.service("ALMemory").then(function (ALMemory) {
        switch (value) {
            case 'Golf':
                ALMemory.raiseEvent("HelloWorld/fjouons/fsportsMusique/Golf", "");
                break;
            case 'Football':
                ALMemory.raiseEvent("HelloWorld/fjouons/fsportsMusique/Football", "");
                break;
            case 'Guitar':
                ALMemory.raiseEvent("HelloWorld/fjouons/fsportsMusique/Guitar", "");
                break;
            case 'Saxophone':
                ALMemory.raiseEvent("HelloWorld/fjouons/fsportsMusique/Saxophone", "");
                break;
        }
    });
    return;
}
function fdanser(value) {
    session.service("ALMemory").then(function (ALMemory) {
        switch (value) {
            case 'Tai Chi Chuan':
                ALMemory.raiseEvent("HelloWorld/fjouons/fdanser/TaiChiChuan", "");
                break;
            case 'Disco':
                ALMemory.raiseEvent("HelloWorld/fjouons/fdanser/Disco", "");
                break;
            case 'Headbang':
                ALMemory.raiseEvent("HelloWorld/fjouons/fdanser/Headbang", "");
                break;
            case 'Dab':
                ALMemory.raiseEvent("HelloWorld/fjouons/fdanser/Dab", "");
                break;
        }
    });
    return;
}
function fautres(value) {
    session.service("ALMemory").then(function (ALMemory) {
        switch (value) {
            case 'Prendre une photo':
                ALMemory.raiseEvent("HelloWorld/fjouons/fautres/photo", "");
                break;
            case 'Aspirateur':
                ALMemory.raiseEvent("HelloWorld/fjouons/fautres/Aspirateur", "");
                break;
            case 'Mystique':
                ALMemory.raiseEvent("HelloWorld/fjouons/fautres/Mystique", "");
                break;
        }
    });
    return;
}
function fAuRevoir(value) {
    session.service("ALMemory").then(function (ALMemory) {
        if (value) {
            ALMemory.raiseEvent("HelloWorld/AuRevoir", "");
        }
    });
    return;
}
