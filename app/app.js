document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById("requestButton").addEventListener("click", requestPermission);
document.getElementById("calibrateButton").addEventListener("click", calibrate);

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

function calibrate() {
    isCalibrated = false;
    window.addEventListener('devicemotion', calibrateAccelerometer, true);
}

function requestPermission() {
    if (typeof (DeviceMotionEvent) !== "undefined" && typeof (DeviceMotionEvent.requestPermission) === "function") {
        // (optional) Do something before API request prompt.
        DeviceMotionEvent.requestPermission()
            .then(response => {
                // (optional) Do something after API prompt dismissed.
                if (response === "granted") {
                    window.addEventListener('devicemotion', handleMotionEvent, true);
                    window.addEventListener('devicemotion', calibrateAccelerometer, true);
                } else {
                    console.error("Permission denied: " + response)
                }
            })
            .catch(console.error)
    } else {
        alert("DeviceMotionEvent is not defined");
    }
}

function startRound() {
    if (round >= 3) {
        declareOverallWinner();
        return;
    }
    round++;
    // currentFigure = figures[Math.floor(Math.random() * figures.length)];
    currentFigure = 'line';
    document.getElementById('figure').innerText = `Draw this figure: ${currentFigure}`;
    document.getElementById('status').innerText = "Start moving your phone!";
    startTime = Date.now();
    endTime = startTime + 10000; // 10 seconds for the round
    document.getElementById('timeLeft').innerText = 10;

    if (window.DeviceMotionEvent) {
        console.log("DeviceMotionEvent supported!");
        window.addEventListener('devicemotion', handleMotionEvent, true);
    } else {
        console.error("DeviceMotionEvent not supported!")
        document.getElementById('status').innerText = "DeviceMotionEvent not supported!";
    }

    interval = setInterval(updateTimer, 100);
}

let bias = {x: 0, y: 0, z: 0};
let isCalibrated = false;

function calibrateAccelerometer(event) {
    if (!isCalibrated) {
        console.error("Calibrating accelerometer")
        //wait for the device to be stationary
        const threshold = 0.1;

        let x = event.acceleration.x;
        let y = event.acceleration.y;
        let z = event.acceleration.z;

        if (Math.abs(x) <= threshold && Math.abs(y) <= threshold && Math.abs(z) <= threshold) {
            console.error("Device is stationary")

            // Capture biases when the device is stationary
            bias.x = x;
            bias.y = y;
            bias.z = z;

            isCalibrated = true;

            window.removeEventListener('devicemotion', calibrateAccelerometer, true);

            console.error("Calibration done : ", bias);
        }
    }
}

//sensor fusion
let alpha = 0.98;
let beta = 1 - alpha;

let accelerometerData = {x: 0, y: 0, z: 0};
let gyroscopeData = {x: 0, y: 0, z: 0};

//event throttle
let lastEventTime = 0;
let throttleInterval = 100; // Handle events every 100 ms

function handleMotionEvent(event) {
    let currentTime = Date.now();
    if (currentTime > endTime) {
        window.removeEventListener('devicemotion', handleMotionEvent, true);
        window.removeEventListener('devicemotion', calibrateAccelerometer, true);
        clearInterval(interval);
        calculatePoints(currentTime - startTime);
        return;
    }

    if (currentTime - lastEventTime >= throttleInterval) {
        lastEventTime = currentTime;

        // let accelX = event.acceleration.x - bias.x;
        // let accelY = event.acceleration.y - bias.y;
        // let accelZ = event.acceleration.z - bias.z;

        let accelX = event.acceleration.x;
        let accelY = event.acceleration.y;
        let accelZ = event.acceleration.z;

        document.getElementById('acceleration').innerText = `X: ${accelX}, Y: ${accelY}, Z: ${accelZ}`;

        let gyroX = event.rotationRate.alpha;
        let gyroY = event.rotationRate.beta;
        let gyroZ = event.rotationRate.gamma;

        accelerometerData = {x: accelX, y: accelY, z: accelZ};
        gyroscopeData = {x: gyroX, y: gyroY, z: gyroZ};

        let fusedX = alpha * (accelerometerData.x) + beta * (gyroscopeData.x);
        let fusedY = alpha * (accelerometerData.y) + beta * (gyroscopeData.y);
        let fusedZ = alpha * (accelerometerData.z) + beta * (gyroscopeData.z);

        document.getElementById('fused').innerText = `X: ${fusedX}, Y: ${fusedY}, Z: ${fusedZ}`;

        // Example logic to detect if the figure is drawn correctly
        if (currentFigure === "square") {
            if (Math.abs(fusedX) < 1 && Math.abs(fusedY) < 1 && Math.abs(fusedZ) < 1) {
                document.getElementById('status').innerText = "Correct figure!";
                playerPoints++;
            } else {
                document.getElementById('status').innerText = "Keep moving!";
            }
        } else if (currentFigure === "line") {
            if (Math.abs(accelX) > 5 && Math.abs(accelY) < 1 && Math.abs(accelZ) < 1) {
                document.getElementById('status').innerText = "OK line!";
                playerPoints++;
            } else {
                document.getElementById('status').innerText = "Naaaah!";
            }
        } else if (currentFigure === "cross") {
            if (Math.abs(accelX) < 1 && Math.abs(accelY) < 1 && Math.abs(accelZ) > 5) {
                document.getElementById('status').innerText = "Correct figure!";
                playerPoints++;
            } else {
                document.getElementById('status').innerText = "Keep moving!";
            }
        } else if (currentFigure === "circle") {
            if (Math.abs(fusedX) < 1 && Math.abs(fusedY) > 5 && Math.abs(fusedZ) < 1) {
                document.getElementById('status').innerText = "Correct figure!";
                playerPoints++;
            } else {
                document.getElementById('status').innerText = "Keep moving!";
            }
        } else if (currentFigure === "triangle") {
            if (Math.abs(fusedX) > 5 && Math.abs(fusedY) > 5 && Math.abs(fusedZ) < 1) {
                document.getElementById('status').innerText = "Correct figure!";
                playerPoints++;
            } else {
                document.getElementById('status').innerText = "Keep moving!";
            }
        }
    }

    // console.error("Throttling event");
}

function calculatePoints(timeTaken) {
    // let basePoints = 1000; // Base points for a correct figure
    // let timeBonus = Math.max(0, 1000 - timeTaken); // Faster completion gives higher bonus
    //
    // // Example logic to add points based on time taken to complete the figure
    // if (currentFigure === "square" || currentFigure === "circle") {
    //     playerPoints += basePoints + timeBonus;
    // } else {
    //     playerPoints += basePoints + (timeBonus / 2); // Lines and crosses have a smaller bonus
    // }

    // Simulate opponent's points for the round
    opponentPoints = Math.floor(Math.random() * 10);

    console.error(`Player points: ${playerPoints}, Opponent points: ${opponentPoints}`)

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
