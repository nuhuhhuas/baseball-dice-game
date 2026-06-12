let selectedCard = null;

const gameState = {
    inning:1,
    half:"TOP",

    balls:0,
    strikes:0,
    outs:0,

    homeScore:0,
    awayScore:0
};

function startGame(){

    document.getElementById("menu").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");

    addLog("Game Started");
}

function playCard(card){

    selectedCard = card;

    addLog("Player selected " + card);
}

function rollD6(){
    return Math.floor(Math.random()*6)+1;
}

function getPitchModifier(card){

    switch(card){

        case "4SFB":
            return -1;

        case "Curveball":
            return -3;

        case "Splitter":
            return -7;

        default:
            return 0;
    }
}

function aiCard(){

    const cards = [
        "Contact",
        "Power",
        "Bunt"
    ];

    return cards[
        Math.floor(Math.random()*cards.length)
    ];
}

function getBatModifier(card){

    switch(card){

        case "Contact":
            return 4;

        case "Power":
            return 5;

        case "Bunt":
            return 2;

        default:
            return 0;
    }
}

function rollPitch(){

    const def1 = rollD6();
    const def2 = rollD6();

    const atk1 = rollD6();
    const atk2 = rollD6();

    let defense =
        def1 + def2;

    let attack =
        atk1 + atk2;

    defense += 0;

    attack += 0;

    if(selectedCard){
        attack += getPitchModifier(selectedCard);
    }

    const aiChoice = aiCard();

    attack += getBatModifier(aiChoice);

    document.getElementById("defRoll")
        .innerText =
        `${def1}+${def2} = ${defense}`;

    document.getElementById("atkRoll")
        .innerText =
        `${atk1}+${atk2} = ${attack}`;

    addLog("Pitcher used: " + selectedCard);
    addLog("Batter used: " + aiChoice);

    if(defense > attack){

        gameState.strikes++;

        addLog("STRIKE");

        if(gameState.strikes >= 3){

            gameState.outs++;

            gameState.strikes = 0;

            addLog("OUT");
        }

    }else if(defense === attack){

        addLog("FOUL");

    }else{

        addLog("HIT");
    }

    updateUI();
}

function updateUI(){

    document.getElementById("balls")
        .innerText =
        gameState.balls;

    document.getElementById("strikes")
        .innerText =
        gameState.strikes;

    document.getElementById("outs")
        .innerText =
        gameState.outs;
}

function addLog(text){

    const log =
        document.getElementById("log");

    log.innerHTML +=
        text + "<br>";

    log.scrollTop =
        log.scrollHeight;
}