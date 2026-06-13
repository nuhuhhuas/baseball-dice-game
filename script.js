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
    third: false,

    phase: "PREPARE",

    pendingResult: null
};

function startGame(){

    document.getElementById("menu").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");

    drawHand();

    drawAiHand();

    gameState.phase = "PREPARE";

    updateUI();

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
            return -2;

        case "2SFB":
            return -2;

        case "Sinker":
            return -3;

        case "Changeup":
            return -4;

        case "Cutter":
            return -4;

        case "Forkball":
            return -5;

        case "Slider":
            return -5;

        case "Sweeper":
            return -5;

        case "Splitter":
            return -6;

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
            return 2;

        case "Power":
            return 3;

        case "Intimidating Batter":
            return 2;

        case "Bunt":
            return -4;

        default:
            return 0;
    }
}

function rollPitch(){

    gameState.phase = "AT-BAT";

    updateUI();

    const def1 = rollD6();
    const def2 = rollD6();

    let atk1 = rollD6();
    let atk2 = rollD6();

    let defense =
    	def1 + def2;

    let pitchMod = 0;
    let batMod = 0;

    if(defenseBoostActive){

    	defense += 3;

    	addLog("Defense Boost: +3");
    }

    const aiChoice = aiCard();

    if(aiChoice === "Batting Eye"){

    	if(atk1 <= atk2){

        	const oldRoll = atk1;

        	atk1 = rollD6();

        	addLog(
            		`Batting Eye: Dice 1 ${oldRoll} → ${atk1}`
        	);

    	}else{

        	const oldRoll = atk2;

        	atk2 = rollD6();

        	addLog(
            		`Batting Eye: Dice 2 ${oldRoll} → ${atk2}`
        	);
    	}
    }

    let attack =
    	atk1 + atk2;

    if(selectedCard){

    	pitchMod =
        	getPitchModifier(selectedCard);

    	attack += pitchMod;

    	addLog(
        	selectedCard +
        	": " +
        	pitchMod
    	);
    }

    if(aiChoice){

    	batMod =
        	getBatModifier(aiChoice);

    	attack += batMod;

    	if(batMod !== 0){

        	addLog(
            		aiChoice +
            		": " +
            		(batMod > 0 ? "+" : "") +
            		batMod
        	);
    	}

    	if(aiChoice === "Bunt"){

        	addLog("Bunt: All runners advance 1 base.");

        	buntAdvance();
    	}
    }

    addLog(
    	`Defense Roll: ${def1}+${def2} = ${defense}`
    );

    addLog(
    	`Attack Roll: ${atk1}+${atk2}${batMod >= 0 ? "+" : ""}${batMod}${pitchMod >= 0 ? "+" : ""}${pitchMod} = ${attack}`
    );

    document.getElementById("defRoll")
        .innerText =
        `${def1}+${def2} = ${defense}`;

    document.getElementById("atkRoll")
        .innerText =
        `${atk1}+${atk2} = ${attack}`;

    addLog(
    	"Pitcher used: " +
    	(selectedCard || "No Card")
    );

    addLog(
    	"Batter used: " +
    	(aiChoice || "No Card")
    );    

    if(defense <= 3){

    	gameState.balls++;

    	addLog("BALL");

    	if(gameState.balls >= 4){

        	addLog("WALK");

        	single();

        	nextBatter();
    	}

    	updateUI();

    	discardSelectedCard();

    	selectedCard = null;

    	defenseBoostActive = false;

    	return;
    }

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

    	if(gameState.strikes < 2){

        	gameState.strikes++;

        	addLog(
            	"Strike Count: " +
            	gameState.strikes
        	);
    	}

    }else{

    	if(atk1 === 6 && atk2 === 6){

        	addLog("TWIN 6! POTENTIAL HOME RUN!");

        	gameState.pendingResult = "HOME_RUN";

    	}else{

        	addLog("HIT!");

        	gameState.pendingResult = "HIT";
    	}

    	gameState.phase = "REACTION";

    	updateUI();
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

    document.getElementById("phase")
    	.innerText =
    	"Phase: " + gameState.phase;
}

function continuePhase(){

    if(gameState.phase === "REACTION"){

        if(gameState.pendingResult === "HOME_RUN"){

            homeRun();

            nextBatter();

            addLog("HOME RUN!");

        }else if(gameState.pendingResult === "HIT"){

            single();

            nextBatter();

            addLog("Single!");
        }

        gameState.pendingResult = null;

        gameState.phase = "END";

        updateUI();
    }
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

function buntAdvance(){

    if(gameState.third){

        scoreRun();
        gameState.third = false;
    }

    if(gameState.second){

        gameState.third = true;
        gameState.second = false;
    }

    if(gameState.first){

        gameState.second = true;
        gameState.first = false;
    }

    updateBases();
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