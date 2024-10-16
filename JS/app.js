// Master class to keep track of global variables
class Master {
    constructor() {
        this.totalTime = 10;
        this.highScore = 0
        this.maxNum = 10;
        this.mode = 'Easy'
        this.operation = [
            ['add', true, 10],
            ['subtract', false, 12],
            ['multiply', false, 15],
            ['divide', false, 15]
        ]
        this.totalOps = 1;
        this.multiplier = 1;
    }

    // Handles when a operation checks are switched
    changeOperation(operation, bool) {
        
        // If the check is the only option undo check removal
        if (this.totalOps === 1 && !bool) {
            $('#' + operation + 'Check').prop('checked', true);

        // Update master with active operations
        } else {
            for (let op of this.operation) {
                if (op[0] === operation) {
                    op[1] = bool
                    this.totalOps = bool ? this.totalOps + 1 : this.totalOps - 1
                }
            }

        }
    }
}

// Game class to handle indiviual round variables
class Game {
    constructor() {
        this.score = 0;
        this.timeLeft = undefined;
        this.endTime = undefined;
        this.num1 = undefined;
        this.num2 = undefined;
        this.answer = undefined;
        this.currentOperation = undefined;
    }

    // Function to generate a new question
    newQuestion() {

        // Get random operation
        let operationSelector = Math.floor((Math.random() * master.totalOps));
        let trueOps = master.operation.filter(a => a[1] === true)
        this.currentOperation = trueOps[operationSelector][0]

        // Switch for each operator type
        switch (this.currentOperation) {

            // Addition case
            case 'add':
                $('#operation').html('+');
                this.num1 = Math.ceil((Math.random() * master.maxNum));
                $('#num1').html(this.num1);
                this.num2 = Math.ceil((Math.random() * master.maxNum));
                $('#num2').html(this.num2);
                this.answer = this.num1 + this.num2;
                break;

            // Subtraction case, always outputs larger number - smaller number
            case 'subtract':
                $('#operation').html('-');
                this.num1 = Math.ceil((Math.random() * master.maxNum));
                this.num2 = Math.ceil((Math.random() * master.maxNum));
                if (this.num1 < this.num2) {
                    $('#num1').html(this.num2);
                    $('#num2').html(this.num1);
                    this.answer = this.num2 - this.num1;
                } else {
                    $('#num1').html(this.num1);
                    $('#num2').html(this.num2);
                    this.answer = this.num1 - this.num2;
                }
                break;

            // Multiplication case
            case 'multiply':
                $('#operation').html('*');
                this.num1 = Math.ceil((Math.random() * master.maxNum));
                $('#num1').html(this.num1);
                this.num2 = Math.ceil((Math.random() * master.maxNum));
                $('#num2').html(this.num2);
                this.answer = this.num1 * this.num2;
                break;

            // Division case, solved by generating random answer and denominator and solving for numerator
            case 'divide':
                $('#operation').html('/');
                this.num2 = Math.ceil((Math.random() * master.maxNum));
                this.answer = Math.ceil((Math.random() * master.maxNum));
                this.num1 = this.num2 * this.answer
                $('#num1').html(this.num1);
                $('#num2').html(this.num2);
                break;
        }
    }

    // Handles updating the current score
    updateGameScore() {
        let multiplier = master.multiplier * (((master.totalOps - 1) * .25) + 1)
        this.score = this.score + master.operation.filter(a => a[0] === this.currentOperation)[0][2] * multiplier
        console.log(multiplier)
        $('#currentScore').html(this.score)
    }
}

// Create new master object when page loads
let master = new Master()

// Initialize and display variables
let countdown = $('#countdown');
countdown.html(master.totalTime)
$('#highScore').html(master.highScore);
$('#multiplier').html(master.multiplier * (((master.totalOps - 1) * .25) + 1))

// Handles start button press
let startGame = function () {

    // Creat new game object
    let game = new Game()

    // Disable all buttons during game and focus on input field
    $('#startBtn').prop("disabled", true)
    $('#difficulty').prop("disabled", true)
    $('.form-check-input').prop("disabled", true)
    $('#guessInput').focus()

    // Pull a question to start
    game.newQuestion()

    // Initializ timer variables
    let startTime = Date.now();
    game.endTime = startTime + (master.totalTime * 1000)

    // Timer function
    let timer = setInterval(function () {
        
        // Get current time left
        game.timeLeft = game.endTime - Date.now();
        countdown.html((game.timeLeft / 1000).toFixed(2))

        // Update timer bar
        let percentLeft = Math.ceil(game.timeLeft / master.totalTime / 10)
        $('.countdown').css('background', 'linear-gradient(90deg, #B0F201 ' + percentLeft + '%, #F24201 ' + percentLeft + '%)')
        
        // When timer reaches 0 reset game detail, enable inputs and update high score if applicable
        if (game.timeLeft <= 0) {
            clearInterval(timer);
            countdown.html(0);
            game.timeLeft = undefined;
            $('#startBtn').prop("disabled", false)
            $('#difficulty').prop("disabled", false)
            $('.form-check-input').prop("disabled", false)
            $('#operation').html('');
            $('#num1').html('Nice job!');
            $('#num2').html('');
            if (game.score > master.highScore) {
                master.highScore = game.score
                $('#highScore').html(master.highScore);
                $('#num2').html('- New High Score!!!');
            }
        }
    }, 100)

    // Handles when enter key is pressed during game, clear input field and check answer
    $(document).keydown(function (e) {
        if (e.key === 'Enter' && game.timeLeft > 0) {
            let guess = $('#guessInput').val();
            $('#guessInput').val('');
            if (guess == game.answer) {
                game.endTime += 1000;
                game.updateGameScore()
                game.newQuestion()
            } else {
                // wrong
            }
        }
    });
}

// Listener function
$(document).ready(function () {

    // Listens for difficulty change and updates master and multiplier
    $("#difficulty").change(function () {
        switch (Number(this.value)) {
            case 0:
                $('#difficultyLabel').html('Easy (1-10)*')
                master.maxNum = 10;
                master.mode = "Easy";
                master.multiplier = 1;
                break;
            case 1:
                $('#difficultyLabel').html('Hard (1-100)*')
                master.maxNum = 100;
                master.mode = "Hard";
                master.multiplier = 2;
                break;
            case 2:
                $('#difficultyLabel').html('Math Wiz (1-1,000)*')
                master.maxNum = 1000;
                master.mode = "Wiz";
                master.multiplier = 5;
                break;
        }
        $('#multiplier').html(master.multiplier * (((master.totalOps - 1) * .25) + 1))
    });

    // Listens for operation change, and upate master and multiplier 
    $(".form-check-input").change(function () {
        master.changeOperation(this.value, this.checked)
        $('#multiplier').html(master.multiplier * (((master.totalOps - 1) * .25) + 1))
    });
});