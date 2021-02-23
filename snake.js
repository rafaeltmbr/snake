(function snakeGame(snakeId = "snakeGame", statusMsgId = "statusMsg", scoreId = "score") {
    var canvas = document.getElementById(snakeId);
    var c = canvas.getContext("2d");
    window.addEventListener("keydown", keyHandler);
    var gameTimer = null;

    var statusMsg = document.getElementById(statusMsgId);
    statusMsg.RUNNING = "Running";
    statusMsg.PAUSED = "Paused";
    statusMsg.GAMEOVER = "Game Over";
    statusMsg.innerText = statusMsg.PAUSED;
    statusMsg.status = statusMsg.innerText;

    var stopSymbol = document.getElementById("stop-symbol");
    var playSymbol = document.getElementById("play-symbol");
    var reloadSymbol = document.getElementById("reload-symbol");

    var score = document.getElementById(scoreId);
    score.accumulator = 0;
    score.innerText = score.accumulator;

    var speedValue = document.getElementById("speedValue");
    if (typeof speedValue.level === "undefined") speedValue.level = 5;
    speedValue.innerHTML = speedValue.level;

    var speedElements = document.getElementsByClassName("speedText");
    (function () {
        for (var i = 0; i < speedElements.length; i++) {
            var speedStyle = getComputedStyle(speedElements[i]);
            speedElements[i].defaultStroke = speedStyle.stroke;
            speedElements[i].defaultFill = speedStyle.fill;
        }
    }());
    stop();

    var buttons = document.getElementsByClassName("buttons");
    (function () {
        var buttonsLength = buttons.length;
        for (var i = 0; i < buttonsLength; i++) buttons[i].addEventListener("click", controlHandler);
    }());

    var pixels = {
        x: 25,
        y: 25
    };
    var pixel = {
        width: parseInt(canvas.width / pixels.x),
        height: parseInt(canvas.height / pixels.y),
        x: parseInt(canvas.width / pixels.x) * parseInt(pixels.x / 2),
        y: parseInt(canvas.height / pixels.y) * parseInt(pixels.y / 2),
        color: {
            r: 0,
            g: 0,
            b: 0
        },
        dir: "right",
        draw: function () {
            c.beginPath();
            c.fillStyle = "rgb(" + this.color.r + "," + this.color.g + "," + this.color.b + ")";
            c.fillRect(this.x, this.y, this.width, this.height);
        },
        setPosition(x, y) {
            this.x = x;
            this.y = y;
        },
        equalPosition(x, y) {
            return x === this.x && y === this.y;
        }
    };

    var snake = {
        pixels: [Object.create(pixel)],
        nextDir: [],
        draw: function () {
            this.pixels.forEach(function (pixel) {
                pixel.draw();
            });
        },
        inc: function () {
            var newPixel = Object.create(this.pixels[this.pixels.length - 1]);
            if (newPixel.dir === "right") newPixel.x = newPixel.x - newPixel.width;
            else if (newPixel.dir === "left") newPixel.x = newPixel.x + newPixel.width;
            else if (newPixel.dir === "up") newPixel.y = newPixel.y + newPixel.height;
            else newPixel.y = newPixel.y + newPixel.height;

            this.pixels.push(newPixel);
            c.clearRect(0, 0, canvas.width, canvas.height);
            this.changeBodyColor();
        },
        changeDirection: function () {
            this.shiftBody();
            var head = this.pixels[0];
            this.updateHeadDir();
            if (food.equalPosition(head.x, head.y)) this.hitFood();
            this.moveSnakeHead();
            if (this.isColision()) this.colisionHandler();
        },
        hitFood: function () {
            this.inc();
            food.setPosition(parseInt(Math.random() * pixels.x) * food.width,
                parseInt(Math.random() * pixels.y) * food.height);
            score.accumulator += speedValue.level;
            score.innerText = score.accumulator + "";
        },
        getNextValidDir: function () {
            var dir = "";
            while (this.nextDir.length > 0) {
                dir = this.nextDir.shift();
                if (this.isValidDir(dir)) break;
                else dir = "";
            }
            return dir;
        },
        moveSnakeHead: function () {
            var head = this.pixels[0];
            if (head.dir === "right") head.x += head.width;
            else if (head.dir === "left") head.x -= head.width;
            else if (head.dir === "up") head.y -= head.height;
            else head.y += head.height;
        },
        shiftBody: function () {
            for (var i = snake.pixels.length - 1; i > 0; i--) {
                snake.pixels[i].x = snake.pixels[i - 1].x;
                snake.pixels[i].y = snake.pixels[i - 1].y;
                snake.pixels[i].dir = snake.pixels[i - 1].dir;
            }
        },
        updateHeadDir: function () {
            var head = this.pixels[0];
            var lastDir = head.dir;
            if ((head.dir = this.getNextValidDir()) === "") head.dir = lastDir;
        },
        isValidDir: function (s) {
            var head = this.pixels[0];
            return (s === "right" && head.dir !== "left") || (s === "left" && head.dir !== "right") ||
                (s === "up" && head.dir !== "down") || (s === "down" && head.dir !== "up");
        },
        isColision: function () {
            var head = this.pixels[0];
            for (var i = 1; i < this.pixels.length; i++)
                if (this.pixels[i].equalPosition(head.x, head.y)) return true;
            return head.x < 0 || head.x >= (head.width * pixels.x) ||
                head.y < 0 || head.y >= (head.height * pixels.y);
        },
        colisionHandler: function () {
            statusMsg.status = statusMsg.innerText = statusMsg.GAMEOVER;
            reloadSymbol.style.display = "inline";
            playSymbol.style.display = "none";
            stopSymbol.style.display = "none";
            clearInterval(gameTimer);
        },
        changeBodyColor: function () {
            if (this.pixels[0].color.g >= 5) this.pixels[0].color.g -= 5;
            else if (this.pixels[0].color.b >= 5) this.pixels[0].color.b -= 5;
            else if (this.pixels[0].color.r >= 5) this.pixels[0].color.r -= 5;

            if (this.pixels[1].color.g >= 5) this.pixels[1].color.g -= 5;
            else if (this.pixels[1].color.b >= 5) this.pixels[1].color.b -= 5;
            else if (this.pixels[1].color.r >= 5) this.pixels[1].color.r -= 5;
        }
    };

    var food = Object.create(pixel);
    food.setPosition(parseInt(Math.random() * pixels.x) * food.width, parseInt(Math.random() * pixels.y) * food.height);
    food.color = {
        r: 218,
        g: 165,
        b: 32
    }; //goldenred

    snake.inc();
    snake.inc();
    snake.pixels[0].color = {
        r: 150,
        g: 250,
        b: 200
    };
    snake.pixels[1].color = {
        r: 200,
        g: 250,
        b: 200
    };
    screenUpdate();

    function screenUpdate() {
        c.clearRect(0, 0, canvas.width, canvas.height);
        food.draw();
        snake.draw();
    }

    function statusToggle() {
        if (statusMsg.status === statusMsg.PAUSED) start();
        else if (statusMsg.status === statusMsg.RUNNING) stop();
        else {
            restoreDefaults();
            snakeGame();
        }
    }

    function timerUpdate() {
        clearInterval(gameTimer);
        gameTimer = setInterval(function () {
            snake.changeDirection();
            screenUpdate();
        }, 600 / speedValue.level);
    }

    function start() {
        if (statusMsg.status !== statusMsg.PAUSED) return;
        timerUpdate();
        statusMsg.status = statusMsg.innerText = statusMsg.RUNNING;
        playSymbol.style.display = "none";
        stopSymbol.style.display = "inline";
        for (var i = 0; i < speedElements.length; i++) {
            speedElements[i].style.stroke = speedElements[i].defaultStroke;
            speedElements[i].style.fill = speedElements[i].defaultFill;
        }
    }

    function stop() {
        statusMsg.innerText = statusMsg.PAUSED;
        statusMsg.status = statusMsg.innerText;
        playSymbol.style.display = "inline";
        stopSymbol.style.display = "none";
        clearInterval(gameTimer);
        for (var i = 0; i < speedElements.length; i++) {
            speedElements[i].style.stroke = "rgba(112,128,144, 1.0)";
            speedElements[i].style.fill = "rgba(112,128,144, 1.0)";
        }
    }

    function fullScreenToggle() {
        if (typeof fullScreenToggle.flag === "undefined") {
            fullScreenToggle.flag = false;
            fullScreenToggle.on = document.getElementById("full-screen-on");
            fullScreenToggle.off = document.getElementById("full-screen-off");
        }
        if (fullScreenToggle.flag) {
            exitFullscreenMethods();
            fullScreenToggle.flag = false;
            fullScreenToggle.on.style.display = "none";
            fullScreenToggle.off.style.display = "inline";
        } else {
            requestFullscreenMethods();
            fullScreenToggle.flag = true;
            fullScreenToggle.on.style.display = "inline";
            fullScreenToggle.off.style.display = "none";
        }
    }

    function requestFullscreenMethods() {
        var elem = document.documentElement;
        if (elem.requestFullscreen) elem.requestFullscreen();
        else if (elem.mozRequestFullscreen) elem.mozRequestFullscreen(); /* Firefox */
        else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen(); /*Chrome, Opera & Safari */
        else if (elem.msRequestFullscreen) elem.msRequestFullscreen(); /* Edge/IE */
    }

    function exitFullscreenMethods() {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.mozCancelFullscreen) document.mozCancelFullscreen(); /* Firefox */
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen(); /* Chrome, Opera & Safari */
        else if (document.msExitFullscreen) document.msExitFullscreen(); /* Edge/IE */
    }

    function changeSpeedLevel(c) {
        if (statusMsg.status !== statusMsg.PAUSED) return;
        if (c === "+" && speedValue.level < 10) speedValue.level++;
        else if (c === "-" && speedValue.level > 1) speedValue.level--;
        speedValue.innerHTML = speedValue.level;
    }

    function keyHandler(event) {
        var k = event.key;
        if (k === "ArrowRight" || k === "d" || k === "right") k = "right";
        else if (k === "ArrowLeft" || k === "a" || k === "left") k = "left";
        else if (k === "ArrowUp" || k === "w" || k === "up") k = "up";
        else if (k === "ArrowDown" || k === "s" || k === "down") k = "down";
        else if (k === " " || k === "pause") return statusToggle();
        else if (k === "full-screen") return fullScreenToggle();
        else if (k === "speedMinus" || k === "-") return changeSpeedLevel("-");
        else if (k === "speedPlus" || k === "+") return changeSpeedLevel("+");
        else return;

        while (snake.nextDir.length > 1) snake.nextDir.shift();
        snake.nextDir.push(k)
        if ((snake.nextDir[0] === snake.pixels[0].dir) || !snake.isValidDir(snake.nextDir[0]))
            snake.nextDir.reverse();
        start();
    }

    function controlHandler(event) {
        event.key = event.target.id;
        keyHandler(event);
    }

    function restoreDefaults() {
        window.removeEventListener("keydown", keyHandler);
        for (var i = 0; i < buttons.length; i++) buttons[i].removeEventListener("click", controlHandler);
        food = "undefined";
        snake.pixels = "undefined";
        snake.nextDir = "undefined";
        snake = "undefined";
        pixel = "undefined";
        buttons = "undefined";
        score = "undefined";
        stopSymbol.style.display = "none";
        reloadSymbol.style.display = "none";
        playSymbol.style.display = "inline";
        c = "undefined";
        canvas = "undefined";
    }
}());

(function layoutHandler() {
    var gameWindow = document.getElementById("snakeGame");
    if (typeof gameWindow.initStyle === "undefined") setGameWindowDefault();
    window.addEventListener("resize", resizeGameWindow);
    resizeGameWindow();

    function setGameWindowDefault() {
        var gameStyle = getComputedStyle(gameWindow);
        gameWindow.initStyle = {};
        gameWindow.initStyle.width = gameStyle.width;
        gameWindow.initStyle.height = gameStyle.height;
        gameWindow.initStyle.offsetWidth = gameWindow.offsetWidth;
        gameWindow.initStyle.offsetHeight = gameWindow.offsetHeight;
        gameWindow.initStyle.additionalWidth = gameWindow.offsetWidth - parseInt(gameStyle.width);
        gameWindow.initStyle.additionalHeight = gameWindow.offsetHeight - parseInt(gameStyle.height);
    }

    function resizeGameWindow() {
        var screen = document.documentElement;
        if (gameWindow.initStyle.offsetWidth > screen.clientWidth) {
            gameWindow.style.setProperty("width", screen.clientWidth - gameWindow.initStyle.additionalWidth + "px");
            gameWindow.style.setProperty("height", screen.clientWidth - gameWindow.initStyle.additionalWidth + "px");
            gameWindow.style.setProperty("margin", "0");
        } else if (gameWindow.initStyle.offsetHeight > screen.clientHeight) {
            gameWindow.style.setProperty("width", screen.clientHeight - gameWindow.initStyle.additionalHeight + "px");
            gameWindow.style.setProperty("height", screen.clientHeight - gameWindow.initStyle.additionalHeight + "px");
            gameWindow.style.setProperty("margin", "0");
        } else {
            gameWindow.style.setProperty("width", gameWindow.initStyle.width);
            gameWindow.style.setProperty("height", gameWindow.initStyle.height);
            gameWindow.style.setProperty("margin", "10px auto");
        }
    }
}());