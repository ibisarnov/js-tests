document.getElementById('startButton').addEventListener('click', startGame);

const figures = ["square", "line", "cross", "circle", "triangle"];
let currentFigure = null;
let startTime = null;
let endTime = null;
let interval = null;
let round = 0;
let playerPoints = 0;
let opponentPoints = 0;
let playerRoundsWon = 0;
let opponentRoundsWon = 0;

function startGame() {
    round = 0;
    playerPoints = 0;
    opponentPoints = 0;
    playerRoundsWon = 0;
    opponentRoundsWon = 0;
    startRound();
}

function startRound() {
    if (round >= 3) {
        declareOverallWinner();
        return;
    }
    round++;
    currentFigure = figures[Math.floor(Math.random() * figures.length)];
    document.getElementById('figure').innerText = `Draw this figure: ${currentFigure}`;
    document.getElementById('status').innerText = "Start moving your phone!";
    startTime = Date.now();
    endTime = startTime + 10000; // 10 seconds for the round
    document.getElementById('timeLeft').innerText = 10;

    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', handleMotionEvent, true);
    } else {
        document.getElementById('status').innerText = "DeviceMotionEvent not supported!";
    }

    interval = setInterval(updateTimer, 100);
}

function handleMotionEvent(event) {
    let currentTime = Date.now();
    if (currentTime > endTime) {
        window.removeEventListener('devicemotion', handleMotionEvent, true);
        clearInterval(interval);
        calculatePoints(currentTime - startTime);
        return;
    }

    //get acceleration values with gravity
    let x = event.accelerationIncludingGravity.x;
    let y = event.accelerationIncludingGravity.y;
    let z = event.accelerationIncludingGravity.z;

    console.log("x: " + x + " y: " + y + " z: " + z);

    //get rotation values
    let xRotation = event.rotationRate.alpha;
    let yRotation = event.rotationRate.beta;
    let zRotation = event.rotationRate.gamma;

    console.log("xRotation: " + xRotation + " yRotation: " + yRotation + " zRotation: " + zRotation);

    //get acceleration values
    let xWithGravity = event.acceleration.x;
    let yWithGravity = event.acceleration.y;
    let zWithGravity = event.acceleration.z;

    console.log("xWithGravity: " + xWithGravity + " yWithGravity: " + yWithGravity + " zWithGravity: " + zWithGravity);

    // Example logic to detect if the figure is drawn correctly
    if (currentFigure === "square") {
        if (Math.abs(x) < 1 && Math.abs(y) < 1 && Math.abs(z) < 1) {
            document.getElementById('status').innerText = "Correct figure!";
        }
    } else if (currentFigure === "line") {
        if (Math.abs(x) > 5 && Math.abs(y) < 1 && Math.abs(z) < 1) {
            document.getElementById('status').innerText = "Correct figure!";
        }
    } else if (currentFigure === "cross") {
        if (Math.abs(x) < 1 && Math.abs(y) < 1 && Math.abs(z) > 5) {
            document.getElementById('status').innerText = "Correct figure!";
        }
    } else if (currentFigure === "circle") {
        if (Math.abs(x) < 1 && Math.abs(y) > 5 && Math.abs(z) < 1) {
            document.getElementById('status').innerText = "Correct figure!";
        }
    } else if (currentFigure === "triangle") {
        if (Math.abs(x) > 5 && Math.abs(y) > 5 && Math.abs(z) < 1) {
            document.getElementById('status').innerText = "Correct figure!";
        }
    }
}

function calculatePoints(timeTaken) {
    let basePoints = 1000; // Base points for a correct figure
    let timeBonus = Math.max(0, 1000 - timeTaken); // Faster completion gives higher bonus

    // Example logic to add points based on time taken to complete the figure
    if (currentFigure === "square" || currentFigure === "circle") {
        playerPoints += basePoints + timeBonus;
    } else {
        playerPoints += basePoints + (timeBonus / 2); // Lines and crosses have a smaller bonus
    }

    // Simulate opponent's points for the round
    opponentPoints = Math.floor(Math.random() * 2000);

    if (playerPoints > opponentPoints) {
        playerRoundsWon++;
        document.getElementById('status').innerText = `You win this round! You: ${playerPoints} points, Opponent: ${opponentPoints} points.`;
    } else {
        opponentRoundsWon++;
        document.getElementById('status').innerText = `You lose this round. You: ${playerPoints} points, Opponent: ${opponentPoints} points.`;
    }

    setTimeout(startRound, 2000); // Wait 2 seconds before starting the next round
}

function updateTimer() {
    let timeLeft = Math.max(0, Math.round((endTime - Date.now()) / 1000));
    document.getElementById('timeLeft').innerText = timeLeft;
    if (timeLeft === 0) {
        clearInterval(interval);
        document.getElementById('status').innerText = "Time's up!";
    }
}

function declareOverallWinner() {
    if (playerRoundsWon > opponentRoundsWon) {
        alert(`You win the game! You won ${playerRoundsWon} rounds, Opponent won ${opponentRoundsWon} rounds.`);
    } else {
        alert(`You lose the game. You won ${playerRoundsWon} rounds, Opponent won ${opponentRoundsWon} rounds.`);
    }
}
