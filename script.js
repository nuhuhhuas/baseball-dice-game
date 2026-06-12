let selectedCard = null;

let playerHand = [];

const pitchDeck = [
    "4SFB",
    "2SFB",
    "Sinker",
    "Curveball",
    "Cutter",
    "Changeup",
    "Forkball",
    "Slider",
    "Sweeper",
    "Splitter"
];

const gameState = {
    inning: 1,
    half: "TOP",

    balls: 0,
    strikes: 0,
    outs: 0,

    homeScore: 0,
    awayScore: 0,

    first: false,
    second: false,
    third: false
};

function startGame(){

    document.getElementById("menu").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");

    drawHand();

    addLog("Game Started");
}

function drawHand(){

    playerHand = [];

    for(let i = 0; i < 5; i++){

        const randomCard =
            pitchDeck[
                Math.floor(Math.random() * pitchDeck.length)
            ];

        playerHand.push(randomCard);
    }

    renderHand();
}

function renderHand(){

    console.log("HAND:", playerHand);

    const cardArea =
        document.querySelector(".cards");

    cardArea.innerHTML =
        "<h3>Your Hand</h3>";

    playerHand.forEach(card => {

        cardArea.innerHTML +=
            `<button onclick="playCard('${card}')">${card}</button>`;

    });
}

function playCard(card){

    selectedCard = card;

    const index =
        playerHand.indexOf(card);

    if(index > -1){

        playerHand.splice(index,1);

        renderHand();
    }

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

   		nextBatter();

    		if(gameState.outs >= 3){

        		addLog("SIDE RETIRED");

        		nextHalfInning();
    		}
	}

    }else if(defense === attack){

        addLog("FOUL");

    }else{

        const roll =
    		rollD6();

	if(roll <= 3){

    		single();
		nextBatter();

	}
	else if(roll <= 5){

    		doubleHit();
		nextBatter();

	}
	else{

    		homeRun();
		nextBatter();
	}
    }

    selectedCard = null;

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

function updateBases(){

    document.getElementById("firstBase")
        .innerText =
        gameState.first ? "●" : "○";

    document.getElementById("secondBase")
        .innerText =
        gameState.second ? "●" : "○";

    document.getElementById("thirdBase")
        .innerText =
        gameState.third ? "●" : "○";
}

function single(){

    if(gameState.third){

        scoreRun();
    }

    gameState.third = gameState.second;
    gameState.second = gameState.first;
    gameState.first = true;

    updateBases();

    addLog("Single");
}

function doubleHit(){

    if(gameState.third){
        scoreRun();
    }

    if(gameState.second){
        scoreRun();
    }

    gameState.third = gameState.first;

    gameState.second = true;
    gameState.first = false;

    updateBases();

    addLog("Double");
}

function homeRun(){

    let runs = 1;

    if(gameState.first) runs++;
    if(gameState.second) runs++;
    if(gameState.third) runs++;

    for(let i=0;i<runs;i++){
        scoreRun();
    }

    gameState.first = false;
    gameState.second = false;
    gameState.third = false;

    updateBases();

    addLog("HOME RUN!");
}

function scoreRun(){

    if(gameState.half === "TOP"){

        gameState.awayScore++;

    }else{

        gameState.homeScore++;
    }

    document.getElementById("homeScore")
        .innerText =
        gameState.homeScore;

    document.getElementById("awayScore")
        .innerText =
        gameState.awayScore;
}

function nextHalfInning(){

    addLog("CHANGING SIDES");

    gameState.outs = 0;
    gameState.strikes = 0;
    gameState.balls = 0;

    gameState.first = false;
    gameState.second = false;
    gameState.third = false;

    if(gameState.half === "TOP"){

        gameState.half = "BOTTOM";

    }else{

        gameState.half = "TOP";
        gameState.inning++;
    }

    document.getElementById("inning").innerText =
        `${gameState.half} ${gameState.inning}`;

    drawHand();

    updateBases();
    updateUI();
}

function nextBatter(){

    gameState.strikes = 0;
    gameState.balls = 0;

    updateUI();
}