let selectedCard = null;

let defenseBoostActive = false;

let playerHand = [];

let aiHand = [];

const attackDeck = [
    "Contact",
    "Contact",

    "Power",
    "Power",

    "Bunt",
    "Bunt",

    "Batting Eye",
    "Batting Eye",

    "Intimidating Batter",
    "Intimidating Batter",

    "Home Run",
    "Single",
    "Double",
    "Triple",
    "Speed",
    "Steal"
];

const defenseDeck = [
    "4SFB",
    "2SFB",
    "Sinker",
    "Curveball",
    "Cutter",
    "Changeup",
    "Forkball",
    "Slider",
    "Sweeper",
    "Splitter",
    "Defense Boost",
    "Ground Out",
    "Pop Out",
    "Fly Out",
    "HR Robbing"
];

function shuffle(array){

    for(let i = array.length - 1; i > 0; i--){

        const j =
            Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] =
            [array[j], array[i]];
    }

    return array;
}

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

    drawAiHand();

    addLog("Game Started");
}

function drawHand(){

    playerHand = [];

    const shuffledDeck =
        shuffle([...defenseDeck]);

    playerHand =
        shuffledDeck.slice(0,5);

    renderHand();
}

function drawAiHand(){

    const shuffledDeck =
        shuffle([...attackDeck]);

    aiHand =
        shuffledDeck.slice(0,5);
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

    if(card === "Defense Boost"){

        defenseBoostActive = true;

        selectedCard = card;

        addLog("Defense Boost Activated");

        return;
    }

    selectedCard = card;

    addLog("Selected: " + card);

    renderHand();
}

function discardSelectedCard(){

    if(!selectedCard) return;

    const index =
        playerHand.indexOf(selectedCard);

    if(index > -1){

        playerHand.splice(index,1);
    }

    renderHand();
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

    if(aiHand.length === 0){

        return null;
    }

    const index =
        Math.floor(Math.random() * aiHand.length);

    const card =
        aiHand[index];

    aiHand.splice(index,1);

    return card;
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

    if(defenseBoostActive){

    	defense += 3;

    	addLog("Defense Boost +3");
    }

    let attack =
        atk1 + atk2;

    defense += 0;

    attack += 0;

    if(selectedCard){
        attack += getPitchModifier(selectedCard);
    }

    const aiChoice = aiCard();

    if(aiChoice){

    	attack += getBatModifier(aiChoice);
    }

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

    discardSelectedCard();

    selectedCard = null;

    defenseBoostActive = false;

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

    drawAiHand();

    updateBases();
    updateUI();
}

function nextBatter(){

    gameState.strikes = 0;
    gameState.balls = 0;

    updateUI();
}