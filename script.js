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
    "Home Run Robbing"
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

    pendingResult: null,

    fieldingChoice: null
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

    const cardPhase =
    	getCardPhase(card);

    if(cardPhase !== gameState.phase){

    	addLog(
        	card +
        	" cannot be played during " +
        	gameState.phase
    	);

    	return;
    }

    if(card === "Defense Boost"){

    	defenseBoostActive = true;

    	addLog("Defense Boost Activated");

	discardCard(card);

    	return;
    }

    if(gameState.phase === "FIELDING"){

    	if(
        	card === "Single" ||
        	card === "Double" ||
        	card === "Triple"
    	){

        	gameState.fieldingChoice = card;

        	addLog(
            		"Fielding Card Selected: " +
            		card
        	);

        	return;
    	}
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

function aiCard(phase){

    const validCards =
        aiHand.filter(
            card =>
            getCardPhase(card) === phase
        );

    if(validCards.length === 0){

        return null;
    }

    const card =
        validCards[
            Math.floor(
                Math.random() *
                validCards.length
            )
        ];

    const index =
        aiHand.indexOf(card);

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

function getCardPhase(card){

    switch(card){

        case "Defense Boost":
        case "Speed":
        case "Steal":
            return "PREPARE";

        case "Contact":
        case "Power":
        case "Intimidating Batter":
        case "Bunt":

        case "4SFB":
        case "2SFB":
        case "Curveball":
        case "Sinker":
        case "Changeup":
        case "Cutter":
        case "Forkball":
        case "Slider":
        case "Sweeper":
        case "Splitter":
            return "AT-BAT";

        case "Batting Eye":
        case "Home Run":
        case "Fly Out":
        case "Ground Out":
        case "Pop Out":
        case "Home Run Robbing":
            return "REACTION";

        case "Single":
        case "Double":
        case "Triple":
            return "FIELDING";

        default:
            return null;
    }
}

function rollPitch(){

    if(gameState.phase !== "AT-BAT"){

    	addLog(
        	"Current Phase: " +
        	gameState.phase +
        	". Press Continue."
    	);

    	return;
    }

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

    const aiChoice =
    	aiCard("AT-BAT");

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

    if(gameState.phase === "PREPARE"){

    	selectedCard = null;

    	gameState.phase = "AT-BAT";

    	updateUI();

    	return;
    }

    if(gameState.phase === "REACTION"){

    	gameState.phase = "FIELDING";

    	updateUI();

    	return;
    }

    if(gameState.phase === "FIELDING"){

    	if(gameState.pendingResult === "HOME_RUN"){

        	homeRun();

        	addLog("HOME RUN!");

    	}else if(gameState.pendingResult === "HIT"){

    		if(gameState.fieldingChoice === "Triple"){

        		tripleHit();

        		addLog("Triple!");

    		}else if(gameState.fieldingChoice === "Double"){

        		doubleHit();

        		addLog("Double!");

    		}else{

        		single();

        		addLog("Single!");
    		}
	}

    	gameState.pendingResult = null;

	gameState.fieldingChoice = null;

    	nextBatter();

    	updateUI();

    	return;
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

    gameState.phase = "PREPARE";

    updateBases();
    updateUI();
}

function nextBatter(){

    gameState.strikes = 0;
    gameState.balls = 0;

    defenseBoostActive = false;

    gameState.phase = "PREPARE";

    updateUI();
}

function discardCard(card){

    const index =
        playerHand.indexOf(card);

    if(index > -1){

        playerHand.splice(index,1);
    }

    renderHand();
}