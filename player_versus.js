class priorityQueue{
    constructor() {
        this.queue = [];
    }
    clear() {
        this.queue = [];
    }
    enqueue(botMove) {
        let score = simpleScoreWord(botMove.word);
        const newNode = new priorityQueueNode(botMove, score);
        let added = false;
        for (let i = 0; i < this.queue.length; i++) {
            if (newNode.score > this.queue[i].score) {
                this.queue.splice(i, 0, newNode);
                added = true;
                break;
            }
        }
        if (!added) {
            this.queue.push(newNode);
        }
    }

    dequeue() {
        if (this.isEmpty()) {
            return null;
        }
        return this.queue.shift().botMove;
    }

    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.queue[0].botMove;
    }

    isEmpty() {
        return this.queue.length === 0;
    }

    size() {
        return this.queue.length;
    }
}
class priorityQueueNode{
    constructor(botMove, score) {
        this.botMove = botMove;
        this.score = score;
    }
}

class Tile{
    constructor(letter, value){
        this.letter = letter;
        this.value = value;
    }
}
let legalWords = new priorityQueue();
let tile_selected = ".";

class TrieNode{
    constructor(){
        this.children = {}; // simply a "collection" of key-value pairs
        this.isEndOfWord = false;
    }
}
class botMove{
    constructor(word, end, isHorizontal){
        this.word = word;
        this.end = end;
        this.isHorizontal = isHorizontal;
    }
}

class Trie{
    constructor(){
        this.root = new TrieNode();
    }
    insert(word) {
        let node = this.root;
        for (let char of word) { // for each character in the word
            if (!node.children[char]) { // if there is not already some node with the key of that character
                node.children[char] = new TrieNode(); // create one
            }
            node = node.children[char]; // (before moving to successive letters) move the node to the one of the previous character
        }
        node.isEndOfWord = true; // at the end of the word, set isEndOfWord to true since it is truly a leaf node
    }
    search(word) {
        let node = this.root;
        for (let char of word) {
            if (!node.children[char]) {
                return false;
            }
            node = node.children[char];
        }
        return node.isEndOfWord;
    }
    startsWith(prefix) {
        let node = this.root;
        for (let char of prefix) {
            if (!node.children[char]) {
                return false;
            }
            node = node.children[char];
        }
        return true;
    }

}

class Player{
    constructor(moves, tiles){
        this.moves = moves;
        this.tiles = tiles;
    }
}

class Square{
    constructor(modifier, letter){
        this.modifier = modifier;
        this.letter = letter;
    }
    setModifier(modifier){
        this.modifier = modifier;
    }
    setLetter(letter){
        this.letter = letter;
    }
}

function createBag(){
    let bag = [];
    bag.push(new Tile('j', 8));
    bag.push(new Tile('k', 5));
    bag.push(new Tile('q', 10));
    bag.push(new Tile('x', 8));
    bag.push(new Tile('z', 10));
    for (let i = 0; i < 2; i++){ // next add ones that appear twice
        bag.push(new Tile('b', 3));
        bag.push(new Tile('c', 3));
        bag.push(new Tile('f', 4));
        bag.push(new Tile('h', 4));
        bag.push(new Tile('m', 3));
        bag.push(new Tile('p', 3));
        bag.push(new Tile('v', 4));
        bag.push(new Tile('w', 4));
        bag.push(new Tile('y', 4));
        } // now three times
    for (let i = 0; i < 3; i++){
        bag.push(new Tile('g', 2));
    } // now 4
    for (let i = 0; i < 4; i++){
        bag.push(new Tile('d', 2));
        bag.push(new Tile('l', 1));
        bag.push(new Tile('s', 1));
        bag.push(new Tile('u', 1));
    } // none for five, jump to six
    for (let i = 0; i < 6; i++){
        bag.push(new Tile('n', 1));
        bag.push(new Tile('r', 1));
        bag.push(new Tile('t', 1));
    } // A nine times, little work around
    for (let i = 0; i < 8; i++){
        bag.push(new Tile('o', 1));
        bag.push(new Tile('a', 1));
        bag.push(new Tile('i', 1));
    }
    bag.push(new Tile('a', 1));
    bag.push(new Tile('i', 1));
    for (let i = 0; i < 12; i++){
       bag.push(new Tile('e', 1));
    }  
    return bag
}
// Function to initialize the game
function initializeGame() { 
    let first_word = true;
    let bag = [];  
    bag = createBag(); 
    let moves_player1 = [];
    let moves_maverick = [];
    let player1_tiles = [];
    let maverick_tiles = [];
    let player1 = new Player(moves_player1, player1_tiles);
    let Maverick = new Player(moves_maverick, maverick_tiles);
    let board = [[]];
    board = createBoard();
    fillPlayerRack(player1, Maverick, bag);
    let word_list_trie = createWordList();
    let newBoard = copyBoard(board);
    runGame(player1, Maverick, bag, board, word_list_trie, first_word, newBoard);
    
}

let letter_selected = "."; // the dot means that no letter is selected
let loc = -1; // location inside of tiles array

function runGame(player1, Maverick, bag, board, word_list_trie, first_word, newBoard){
    // have permanent rack and board from the last play, but a temporary, developing version
    // of both to work with before the player enters their word
    let newRack = player1.tiles.slice();
    // code to do the right thing after the player submits a word - either defer to the robot (if valid word),
    // or kick turn back to player, say word not legal, etc
    const enter_click = document.getElementById('enter');
    enter_click.addEventListener('click', function(event){
        if (validateWord(board, newBoard, word_list_trie, player1.tiles) || first_word){ // if the word is valid
            first_word = false;
            player1.tiles = newRack.slice(); // update tiles to be the new rack (still lacking a few)
            fillPlayerRack(player1, Maverick, bag); // fill the guy's rack (easy)
            newRack = player1.tiles.slice(); // set the new rack to the new tiles w/ the filled in ones
            board = copyBoard(newBoard); // set the permanent board to be the temporary one
            // findBestMove(board, bag, Maverick.tiles, word_list_trie); // findBestMove finds and plays the best move for the bot
            let tile_letters = [];
            for (let i = 0; i < Maverick.tiles.length; i++){ // make the tile array of letters
                tile_letters.push(Maverick.tiles[i].letter);
            }
            let anchorCoordinates = findAnchors(board); // make the anchor coordinates
            for (let i = 0; i < anchorCoordinates.length; i++){
                let x = anchorCoordinates[i].x;
                let y = anchorCoordinates[i].y;
                let current_limit = findLimit(board, anchorCoordinates[i].x, anchorCoordinates[i].y, anchorCoordinates);
                leftPart("", word_list_trie.root, current_limit, tile_letters, board, x, y, word_list_trie, true, x, y, 0);
            } // need to score the word in here at some point
            let rotated_board = rotateBoard(board);
            let newAnchorCoordinates = findAnchors(rotated_board);
            for (let i = 0; i < newAnchorCoordinates.length; i++){ // iterate through every anchor coordinate, find possible words sthere
                let x = newAnchorCoordinates[i].x;
                let y = newAnchorCoordinates[i].y;
                let current_limit = findLimit(board, newAnchorCoordinates[i].x, newAnchorCoordinates[i].y, newAnchorCoordinates);
                leftPart("", word_list_trie.root, current_limit, tile_letters, rotated_board, x, y, word_list_trie, false, x, y, 0);
            } // eliminate words with tiles left or immediately above the full word
            for (let i = 0; i < legalWords.queue.length; i++){
                let isHorizontal = legalWords.queue[i].botMove.isHorizontal;
                let coordinate = legalWords.queue[i].botMove.end;
                let partialWord = legalWords.queue[i].botMove.word;
                if (isHorizontal && coordinate.x - partialWord.length > 0){
                    console.log("letter left: " + board[coordinate.y][coordinate.x - partialWord.length].letter);
                    console.log(partialWord);
                    if (board[coordinate.y][coordinate.x - partialWord.length].letter != " "){ // change word until legal
                        legalWords.queue.splice(i, 1);
                        i--;
                    } 
                } else if (!isHorizontal && coordinate.y  - partialWord.length > 0 ){
                    console.log(partialWord);
                    if (board[coordinate.y - partialWord.length][coordinate.x].letter != " "){ // double check these coordinates
                        legalWords.queue.splice(i, 1);
                        i--;
                    } 
                }
            }

            if (legalWords.queue.length == 0){ // kick turn back to the player if the bot has no possible words
                console.log("no legal words. passing turn back to user");
            } else{
                board = playBotWord(legalWords.peek().word, legalWords.peek().end, board, legalWords.peek().isHorizontal, Maverick.tiles, legalWords);
            }
            fillPlayerRack(player1, Maverick, bag); // fill the other guy's rack (must fill in the correct order)
            displayBoard(board); // old board still the vintage copy
            displayBoardInternals(board);
            displayBoardInternals(rotated_board);
            newRack = player1.tiles.slice(); // set the new rack to the new tiles w/ the filled in ones
            legalWords.clear();
            newBoard = copyBoard(board);
        } else{
            newRack = player1.tiles.slice(); // not valid, reset both back
            newBoard = copyBoard(board);
        }
        letter_selected = '.'; // reset the letter selected to be nothing
        displayRack(newRack);
        displayBoard(newBoard);
        displayCurrent();
    });

        // code to clear current selection is below
    const clear1_click = document.getElementById('clear');
    clear1_click.addEventListener('click', function(event){ // clear the played tiles, rack after the player clears their board
        newRack = player1.tiles.slice();
        newBoard = copyBoard(board);
        letter_selected = ".";
        displayCurrent();
        displayRack(newRack);
        displayBoard(board);
    });

    // code to change letter_selected is below

    const rack1_click = document.getElementById('rack');
    rack1_click.addEventListener('click', function(event) { // select tile
        let rect = rack1_click.getBoundingClientRect();
        let left = rect.left - 150;
        let num_tiles = newRack.length;
        let amount_right = Math.ceil((350 - 50 * num_tiles) / 2);
        left = left + amount_right;
        let x = event.clientX;
        for (let k = 0; k < num_tiles; k++){
            if (x < left + ((k + 1) * 50)){
                letter_selected = newRack[k].letter + "";
                break;
            }
        }
        
        displayCurrent();
        displayRack(newRack); // display the rack
        
    });

    document.addEventListener('click', function(event) {
        // Get the coordinates of the click event
        let x = event.clientX;
        let y = event.clientY;
        let x_start = 485;
        let x_end = 972;
        if (464 < x && x < 975 && 151 < y && y < 660 && letter_selected != "."){ // if click is inside of the game board
            let x_index = -1;
            let y_index = -1;
            for (let k = 0; k < 15; k++) {
                if (x < x_start + (k + 1) * Math.floor((x_end - x_start) / 15)) {
                    x_index = k;
                    break;
                }
            }
            for (let i = 0; i < 15; i++){
                if (y < 195 + 32 * i){
                    y_index = i;
                    break;
                }
            } // once the x and y indices are found, change the new board and render
            newBoard[y_index][x_index] = new Square(newBoard[y_index][x_index].modifier, letter_selected); // change the newBoard to match the added tile
            removeTileFromRack(letter_selected, newRack);
            displayRack(newRack);
            letter_selected = '.'; // reset the letter selected to be nothing
            displayBoard(newBoard);
            displayCurrent();
        
        }
    });
    renderGame(player1, Maverick, bag, newBoard, newRack);
    loc = -1;
}

function playBotWord(partialWord, coordinate, board, isHorizontal, tiles, legalWords){
    if (isHorizontal){
        coordinate.x = coordinate.x;
        let k = partialWord.length  - 1;
        for (let i = coordinate.x; i > coordinate.x - partialWord.length; i--){
           // i - coordinate.x is the relative difference form the end of the word
            board[coordinate.y][i] = new Square(board[coordinate.y][coordinate.x].modifier, partialWord.charAt(k));
            for (let n = tiles.length - 1; n >= 0; n--) {
                if (tiles[n].letter === partialWord.charAt(k)) {
                    tiles.splice(n, 1);
                    break;
                }
            }
            k--;
        }
    } else{ // coordinate is the far bottom coordinate I think?
        let k = partialWord.length - 1;
        let x = 14 - coordinate.x;
        for (let i = coordinate.y; i > coordinate.y - partialWord.length; i--){
            board[i][x] = new Square(board[i][x].modifier, partialWord.charAt(k));
            for (let n = tiles.length - 1; n >= 0; n--) {
                if (tiles[n].letter.toLowerCase() === partialWord.charAt(k).toLowerCase()) {
                    tiles.splice(n, 1);
                    break;
                }
            }
            k--;
        }
    }
    return board;
}
function copyBoard(board) {
    let newBoard = [];
    for (let i = 0; i < board.length; i++) {
        // create a new row array for the copied board
        let newRow = [];
        // copy everything over
        for (let j = 0; j < board[i].length; j++) {
            newRow.push(board[i][j]);
        }
        // don't want to just reuse the pointers
        newBoard.push(newRow);
    }

    // Return the copied board
    return newBoard;
}

// function to read the dictionary file and create the Trie
function createWordList() {
    let word_list_trie = new Trie();
    fetch('scrabble.txt')
        .then(response => response.text())
        .then(data => {
            const words = data.split('\n');
            // Insert each word into the Trie
            words.forEach(word => {
                word_list_trie.insert(word.trim().toLowerCase());
            });
        })
        .catch(error => {
            console.error('Error fetching scrabble.txt:', error);
        });
    return word_list_trie;
}

class Coordinate{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}
function findAnchors(board){ // returns an array of coordinates with all possible anchors in the current board to the left of things
    let anchors = []
    for (let i = 0; i < 15; i++){
        for (let k = 0; k < 15; k++){
            if (board[i][k].letter != " "){
                let x = k;
                while (x > 0 && board[i][x - 1].letter != " "){ // as soon as either all are full going left or open space appears @ k - 1
                    x--; // k is always the space to the right of the open space
                }
                if (x != 0 && !containsCoordinate(new Coordinate(x - 1, i), anchors)){
                    anchors.push(new Coordinate(x - 1, i)); // one to left
                }
                x = k;
                while (x < 14 && board[i][x + 1].letter != " "){
                    x++;
                }
                if (x != 15 && !containsCoordinate(new Coordinate(x + 1, i), anchors)){ // always gonna be one to the left of the real anchor
                    // anchors.push(new Coordinate(x + 1, i)); // one to right, I'll get rid of it for now
                }
            }
        }
    } // returns all anchors left and right so far, other anchors are just not gonna be 26 in the cross check set
    return anchors;
}

function createBoard(){ // function to initialize the board
    let board = [[]];
    for (let i = 0; i < 15; i++) {
        board[i] = []; // Initialize each row as an empty array
        for (let k = 0; k < 15; k++) {
            board[i][k] = new Square('none', ' ');
        }
    }
    for (let i = 0; i < 15; i++){ // k is row, i is column
        for (let k = 0; k < 15; k++){
            if (i % 7 == 0 && k % 7 == 0) {
                board[i][k].setModifier("tws"); // setting all tws, except very middle
            }
            if (k == i || k == 14 - i || i == 14 - k){ // if on the diagonal (used to add stuff on diagonals)
                if ((k > 0 && k < 5 || k < 14 && k > 9)){ // restricting the k (or i, same thing), based on where x val is
                    board[i][k].setModifier("dws");
                } else if (k == 5 || k == 9){
                    board[i][k].setModifier("tls");
                } else if (k == 6 || k == 8){
                    board[i][k].setModifier("dls");
                } else if (k == 7){
                    board[i][k].setModifier("dws");
                }
            } else {
                if (i == 5 || i == 9) { // adding tls on rows 5 and 9
                    if (k % 4 == 1) {
                        board[i][k].setModifier("tls");
                    }
                }
                else if (k == 5 || k == 9) {
                    if (i % 4 == 1) {
                        board[i][k].setModifier("tls");
                    }
                }
                else if (i == 3 || i == 11) {
                    if (k % 7 == 0) {
                        board[i][k].setModifier("dls");
                    }
                }
                else if (k == 3 || k == 11) {
                    if (i % 7 == 0) {
                        board[i][k].setModifier("dls");
                    }
                } else if (k == 2 || k == 12){
                    if (i == 6 || i == 8){
                        board[i][k].setModifier("dls");
                    }
                } else if (i == 2 || i == 12){
                    if (k == 6 || k == 8){
                        board[i][k].setModifier("dls");
                    }
                }
            }
        }
    }
    return board;

}
function isLegalWord(word){
    return word_list_trie.search(word);
}
function displayBoard(board){
    const left_main = 484;
    let leftOffset = left_main;
    const pixelSpacing = 32.25;
    const row1_container = document.getElementById('row1');
    row1_container.innerHTML = "";

    for (let i = 0; i < 15; i++){
        if (board[0][i].letter == ' ') {
            // Skip displaying this image
            leftOffset += pixelSpacing;
        }
         else {
            // Display png image
            let letter = board[0][i].letter.toLowerCase(); // Assuming the letter is in lowercase
            row1_container.innerHTML += '<img src="images/' + letter + '.png" alt="Letter ' + letter + '" style="position: absolute; left: ' + leftOffset + 'px; top: 167px; height: 32.25px; width: 32.25px;">';
            leftOffset += pixelSpacing; // Increase the left offset
       }

    }
    leftOffset = left_main;
    
    const row2_container = document.getElementById('row2');
    row2_container.innerHTML = "";
    for (let i = 0; i < 15; i++){
        if (board[1][i] instanceof Square && board[1][i].letter === " ") {
            // Skip displaying this image
            leftOffset += pixelSpacing;
        }
         else {
            // Display png image
            let letter = board[1][i].letter.toLowerCase(); // Assuming the letter is in lowercase

            row2_container.innerHTML += '<img src="images/' + letter + '.png" alt="Letter ' + letter + '" style="position: absolute; left: ' + leftOffset + 'px; top: 199px; height: 32.25px; width: 32.25px;">';
            leftOffset += pixelSpacing; // Increase the left offset
       }
    }
    leftOffset = left_main;

    const row3_container = document.getElementById('row3');
    row3_container.innerHTML = "";
    for (let i = 0; i < 15; i++){
        if (board[2][i] instanceof Square && board[2][i].letter === " ") {
            // Skip displaying this image
            leftOffset += pixelSpacing;
        }
         else {
            // Display png image
            let letter = board[2][i].letter.toLowerCase(); // Assuming the letter is in lowercase
            row3_container.innerHTML += '<img src="images/' + letter + '.png" alt="Letter ' + letter + '" style="position: absolute; left: ' + leftOffset + 'px; top: 231px; height: 32.25px; width: 32.25px;">';
            leftOffset += pixelSpacing; // Increase the left offset
       }
    }
    leftOffset = left_main;
    const row4_container = document.getElementById('row4');
    row4_container.innerHTML = "";
    for (let i = 0; i < 15; i++){
        if (board[3][i] instanceof Square && board[3][i].letter === " ") {
            // Skip displaying this image
            leftOffset += pixelSpacing;
        }
         else {
            // Display png image
            let letter = board[3][i].letter.toLowerCase(); // Assuming the letter is in lowercase

            row4_container.innerHTML += '<img src="images/' + letter + '.png" alt="Letter ' + letter + '" style="position: absolute; left: ' + leftOffset + 'px; top: 264px; height: 32.25px; width: 32.25px;">';
            leftOffset += pixelSpacing; // Increase the left offset
       }
    }
    leftOffset = left_main;
    const row5_container = document.getElementById('row5');
    row5_container.innerHTML = "";
    for (let i = 0; i < 15; i++){
        if (board[4][i] instanceof Square && board[4][i].letter === " ") {
            // Skip displaying this image
            leftOffset += pixelSpacing;
        }
         else {
            // Display png image
            let letter = board[4][i].letter.toLowerCase(); // Assuming the letter is in lowercase
            
            row5_container.innerHTML += '<img src="images/' + letter + '.png" alt="Letter ' + letter + '" style="position: absolute; left: ' + leftOffset + 'px; top: 296px; height: 32.25px; width: 32.25px;">';
            leftOffset += pixelSpacing; // Increase the left offset
       }
    }
    leftOffset = left_main;

    const row6_container = document.getElementById('row6');
    row6_container.innerHTML = "";
    for (let i = 0; i < 15; i++){
        if (board[5][i] instanceof Square && board[5][i].letter === " ") {
            // Skip displaying this image
            leftOffset += pixelSpacing;
        }
         else {
            // Display png image
            let letter = board[5][i].letter.toLowerCase(); // Assuming the letter is in lowercase
            
            row6_container.innerHTML += '<img src="images/' + letter + '.png" alt="Letter ' + letter + '" style="position: absolute; left: ' + leftOffset + 'px; top: 328px; height: 32.25px; width: 32.25px;">';
            leftOffset += pixelSpacing; // Increase the left offset
       }
    }
    leftOffset = left_main;
    const row7_container = document.getElementById('row7');
    row7_container.innerHTML = "";
    for (let i = 0; i < 15; i++){
        if (board[6][i] instanceof Square && board[6][i].letter === " ") {
            // Skip displaying this image
            leftOffset += pixelSpacing;
        }
         else {
            // Display png image
            let letter = board[6][i].letter.toLowerCase(); // Assuming the letter is in lowercase
            
            row7_container.innerHTML += '<img src="images/' + letter + '.png" alt="Letter ' + letter + '" style="position: absolute; left: ' + leftOffset + 'px; top: 360px; height: 32.25px; width: 32.25px;">';
            leftOffset += pixelSpacing; // Increase the left offset
       }
    }
    leftOffset = left_main;
    const row8_container = document.getElementById('row8');
    row8_container.innerHTML = "";
    for (let i = 0; i < 15; i++){
        if (board[7][i] instanceof Square && board[7][i].letter === " ") {
            // Skip displaying this image
            leftOffset += pixelSpacing;
        }
         else {
            // Display png image
            let letter = board[7][i].letter.toLowerCase(); // Assuming the letter is in lowercase
            
            row8_container.innerHTML += '<img src="images/' + letter + '.png" alt="Letter ' + letter + '" style="position: absolute; left: ' + leftOffset + 'px; top: 393px; height: 32.25px; width: 32.25px;">';
            leftOffset += pixelSpacing; // Increase the left offset
       }
    }
    leftOffset = left_main;
    const row9_container = document.getElementById('row9');
    row9_container.innerHTML = "";
    for (let i = 0; i < 15; i++){
        if (board[8][i] instanceof Square && board[8][i].letter === " ") {
            // Skip displaying this image
            leftOffset += pixelSpacing;
        }
         else {
            // Display png image
            let letter = board[8][i].letter.toLowerCase(); // Assuming the letter is in lowercase
            
            row9_container.innerHTML += '<img src="images/' + letter + '.png" alt="Letter ' + letter + '" style="position: absolute; left: ' + leftOffset + 'px; top: 425px; height: 32.25px; width: 32.25px;">';
            leftOffset += pixelSpacing; // Increase the left offset
       }
    }
    leftOffset = left_main;
    const row10_container = document.getElementById('row10');
    row10_container.innerHTML = "";
    for (let i = 0; i < 15; i++){
        if (board[9][i] instanceof Square && board[9][i].letter === " ") {
            // Skip displaying this image
            leftOffset += pixelSpacing;
        }
         else {
            // Display png image
            let letter = board[9][i].letter.toLowerCase(); // Assuming the letter is in lowercase
            
            row10_container.innerHTML += '<img src="images/' + letter + '.png" alt="Letter ' + letter + '" style="position: absolute; left: ' + leftOffset + 'px; top: 458px; height: 32.25px; width: 32.25px;">';
            leftOffset += pixelSpacing; // Increase the left offset
       }
    }
    const row11_container = document.getElementById('row11');
    row11_container.innerHTML = "";
    leftOffset = left_main;
    for (let i = 0; i < 15; i++){
        if (board[10][i] instanceof Square && board[10][i].letter === " ") {
            // Skip displaying this image
            leftOffset += pixelSpacing;
        }
         else {
            // Display png image
            let letter = board[10][i].letter.toLowerCase(); // Assuming the letter is in lowercase
            
            row11_container.innerHTML += '<img src="images/' + letter + '.png" alt="Letter ' + letter + '" style="position: absolute; left: ' + leftOffset + 'px; top: 490px; height: 32.25px; width: 32.25px;">';
            leftOffset += pixelSpacing; // Increase the left offset
       }
    }
    leftOffset = left_main;
    const row12_container = document.getElementById('row12');
    row12_container.innerHTML = "";
    for (let i = 0; i < 15; i++){
        if (board[11][i] instanceof Square && board[11][i].letter === " ") {
            // Skip displaying this image
            leftOffset += pixelSpacing;
        }
         else {
            // Display png image
            let letter = board[11][i].letter.toLowerCase(); // Assuming the letter is in lowercase
            
            row12_container.innerHTML += '<img src="images/' + letter + '.png" alt="Letter ' + letter + '" style="position: absolute; left: ' + leftOffset + 'px; top: 522px; height: 32.25px; width: 32.25px;">';
            leftOffset += pixelSpacing; // Increase the left offset
       }
    }
    const row13_container = document.getElementById('row13');
    row13_container.innerHTML = "";
    leftOffset = left_main;
    for (let i = 0; i < 15; i++){
        if (board[12][i] instanceof Square && board[12][i].letter === " ") {
            // Skip displaying this image
            leftOffset += pixelSpacing;
        }
         else {
            // Display png image
            let letter = board[12][i].letter.toLowerCase(); // Assuming the letter is in lowercase
            
            row13_container.innerHTML += '<img src="images/' + letter + '.png" alt="Letter ' + letter + '" style="position: absolute; left: ' + leftOffset + 'px; top: 555px; height: 32.25px; width: 32.25px;">';
            leftOffset += pixelSpacing; // Increase the left offset
       }
    }
    leftOffset = left_main;
    const row14_container = document.getElementById('row14');
    row14_container.innerHTML = "";
    for (let i = 0; i < 15; i++){
        if (board[13][i] instanceof Square && board[13][i].letter === " ") {
            // Skip displaying this image
            leftOffset += pixelSpacing;
        }
         else {
            // Display png image
            let letter = board[13][i].letter.toLowerCase(); // Assuming the letter is in lowercase
            
            row14_container.innerHTML += '<img src="images/' + letter + '.png" alt="Letter ' + letter + '" style="position: absolute; left: ' + leftOffset + 'px; top: 587px; height: 32.25px; width: 32.25px;">';
            leftOffset += pixelSpacing; // Increase the left offset
       }
    }
    const row15_container = document.getElementById('row15');
    row15_container.innerHTML = "";
    leftOffset = left_main;
    for (let i = 0; i < 15; i++){
        if (board[14][i] instanceof Square && board[14][i].letter === " ") {
            // Skip displaying this image
            leftOffset += pixelSpacing;
        }
         else {
            // Display png image
            let letter = board[14][i].letter.toLowerCase(); // Assuming the letter is in lowercase
            
            row15_container.innerHTML += '<img src="images/' + letter + '.png" alt="Letter ' + letter + '" style="position: absolute; left: ' + leftOffset + 'px; top: 619px; height: 32.25px; width: 32.25px;">';
            leftOffset += pixelSpacing; // Increase the left offset
       }
    }
}
function displayCurrent(){
    const current = document.getElementById('selected-tile');
    current.innerHTML = "";
    if (letter_selected == "blank"){
        letter_selected = ".";
    }
    if (letter_selected == "."){
        current.innerHTML = "No Tile Selected";
    } else{
        current.innerHTML = "Tile Selected:";
        let selected_tile_image = letter_selected.toLowerCase() + ".png";
        current.innerHTML += '<img src="images/' + selected_tile_image + '" alt="Tile Image">';
    }
}
function displayRack(newRack){
    const rackContainer = document.getElementById("rack");
    rackContainer.innerHTML = "";
    for (let i = 0; i < newRack.length; i++){
        let letter = newRack[i].letter;
        if (letter != '?'){
            letter = letter.toLowerCase();
        } else{
            letter = "blank";
        }
        let tile_name = letter + ".png";
        rackContainer.innerHTML += '<img src="images/' + tile_name + '" alt="Tile Image">';
    }
}

function fillPlayerRack(player1, Maverick, bag) {
    while (player1.tiles.length < 7 && bag.length > 0) {
        const randomIndex = Math.floor(Math.random() * bag.length);
        player1.tiles.push(new Tile(bag[randomIndex].letter, bag[randomIndex].value));
        bag.splice(randomIndex, 1); 
    }
    while (Maverick.tiles.length < 7 && bag.length > 0) {
        const randomIndex = Math.floor(Math.random() * bag.length);
        Maverick.tiles.push(new Tile(bag[randomIndex].letter, bag[randomIndex].value));
        bag.splice(randomIndex, 1); 
    }
    // Logic to randomly fill player's rack with tiles
}

function displayNames(player1, maverick){
    const playerName = document.getElementById('score-display-left');
    playerName.innerHTML = 'Player 1<br>';
    const maverickName = document.getElementById('score-display-right');
    maverickName.innerHTML = 'Maverick<br>';
    const title_top = document.getElementById('title');
}
// Function to render the game state

function renderGame(player1, maverick, bag, board, newRack){
    const playerName = document.getElementById('score-display-left');
    playerName.innerHTML = 'Player 1<br>';
    const maverickName = document.getElementById('score-display-right');
    maverickName.innerHTML = 'Maverick<br>';
    const title_top = document.getElementById('title');
    title_top.innerHTML = 'Play Vs. Maverick';
    const game_board = document.getElementById('game-board');
    game_board.innerHTML = '<img src="images/background.png" alt="Background Image">';
    const clear_selection = document.getElementById('clear');
    clear_selection.innerHTML = '<img src="images/clear.png" alt="clear selection">';
    const enter_selection = document.getElementById('enter');
    enter_selection.innerHTML = '<img src="images/enter.png" alt="enter selection">';
    // displayBoard(board);
    displayRack(newRack);
    displayCurrent();
}

function removeTileFromRack(letter, bag) {
    let index = -1;
    for (let i = 0; i < bag.length; i++){
        if (bag[i].letter == letter){
            index = i;
            break;
        }
    }
    bag.splice(index, 1); // remove tile from rack given letter, rack
}

// Function to validate a word
function validateWord(newBoard, board, word_list_trie, tiles) { // step 1: find the partial word and the "end"
    console.log("original board: ");
    displayBoardInternals(newBoard);
    console.log("new board: ");
    displayBoardInternals(board);
    let tile_letters = [];
    for (let i = 0; i < tiles.length; i++){ // make the tile array of letters
        tile_letters.push(tiles[i].letter);
    }
    let anchorCoordinates = findAnchors(board); // make the anchor coordinates
    for (let i = 0; i < anchorCoordinates.length; i++){
        let x = anchorCoordinates[i].x;
        let y = anchorCoordinates[i].y;
        let current_limit = findLimit(board, anchorCoordinates[i].x, anchorCoordinates[i].y, anchorCoordinates);
        leftPart("", word_list_trie.root, current_limit, tile_letters, board, x, y, word_list_trie, true, x, y, 0);
    } // need to score the word in here at some point
    let rotated_board = rotateBoard(board);
    let newAnchorCoordinates = findAnchors(rotated_board);
    for (let i = 0; i < newAnchorCoordinates.length; i++){
        let x = newAnchorCoordinates[i].x;
        let y = newAnchorCoordinates[i].y;
        let current_limit = findLimit(board, newAnchorCoordinates[i].x, newAnchorCoordinates[i].y, newAnchorCoordinates);
        leftPart("", word_list_trie.root, current_limit, tile_letters, rotated_board, x, y, word_list_trie, false, x, y, 0);
    }
    for (let i = 0; i < legalWords.queue.length; i++){
                let isHorizontal = legalWords.queue[i].botMove.isHorizontal;
                let coordinate = legalWords.queue[i].botMove.end;
                let partialWord = legalWords.queue[i].botMove.word;
                if (isHorizontal && coordinate.x - partialWord.length > 0){
                    if (board[coordinate.y][coordinate.x - partialWord.length].letter != " "){ // change word until legal
                        legalWords.queue.splice(i, 1);
                        i--;
                    } 
                } else if (!isHorizontal && coordinate.y  - partialWord.length > 0 ){
                    if (board[coordinate.y - partialWord.length][coordinate.x].letter != " "){ // double check these coordinates
                        legalWords.queue.splice(i, 1);
                        i--;
                    } 
                }
            } // legal words are found properly I think
    // now, build the word 
    let middle = "";
    let earlier = "";
    let later = "";
    let word_is_horizontal = false;
    let word_is_vertical = false;
    let anchorX = -1;
    let anchorY = -1;
    for (let i = 0; i < 15; i++){
        for (let k = 0; k < 15; k++){
            if (board[i][k].letter != newBoard[i][k].letter){ // for the first new tile found
                console.log("new tile @ " + k + ", " + i);
                let x = k;
                let y = i;
                while (x > 0){
                    x--;
                    if (board[i][x].letter != newBoard[i][x].letter){
                        word_is_horizontal = true;
                        anchorX = x;
                        anchorY = i;
                        break;
                    }
                }
                x = k;
                while (x < 14){
                    x++;
                    if (board[i][x].letter != newBoard[i][x].letter){
                        word_is_horizontal = true;
                        anchorX = x;
                        anchorY = i;
                        break;
                    }
                }
                while (y > 0){
                    y--;
                    if (board[y][k].letter != newBoard[y][k].letter){
                        word_is_vertical = true;
                        anchorX = k;
                        anchorY = y;
                        break;
                    }
                }
                y = i;
                while (y < 14){
                    y++;
                    if (board[y][k].letter != newBoard[y][k].letter){
                        word_is_vertical = true;
                        anchorX = k;
                        anchorY = y;
                        break;
                    }
                }
            } else{
                console.log("same letters @ " + k + ", " + i);
            }
        }
    }
        if (word_is_horizontal && word_is_vertical){
            console.log("both vertical and horizontal")
            return false;
        }
        if (!word_is_horizontal && !word_is_vertical){ // like one singular thing prolly
            console.log("neither")
            return true;
        }
        let end_x = -1;
        let end_y = -1;
        if (word_is_horizontal){
            let x = anchorX;
            middle = board[anchorY][anchorX].letter;
            while (x > 0){
                x--;
                if (board[anchorY][x].letter != " "){ // if it's a letter that;s there
                    earlier = board[anchorY][x].letter + earlier;
                } else{
                    break;
                }
            }
            x = anchorX;
            while (x < 14){
                x++;
                if (board[anchorY][x].letter != " "){
                    later = later + board[anchorY][x].letter;
                } else{
                    break;
                }
            }
            end_x = x - 1;
            end_y = anchorY;
        } else{
            let y = anchorY;
            middle = board[anchorY][anchorX].letter;
            while (y > 0){ // going up to the top
                y--;
                if (board[y][anchorX].letter != " "){ // if it's a new letter,
                    earlier = board[y][anchorX].letter + earlier;
                } else{
                    break;
                }
            }
            y = anchorY;
            while (y < 14){
                y++;
                if (board[y][anchorX].letter != " "){
                    later = later + board[y][anchorX].letter;
                } else{
                    break;
                }
            }
            end_y = y - 1;
            end_x = anchorX;
        }
        let final_word = earlier + middle + later;
        console.log("final word played: " );
        for (let i = 0; i < legalWords.queue.length; i++){ //  && legalWords.queue[i].end.x == end_x && legalWords.queue[i].end.y == end_y
            if (legalWords.queue[i].word == final_word || word_list_trie instanceof Trie && word_list_trie.search(final_word)){ // if bot finds it, return true, not using location for now
                legalWords.clear();
                return true;
            }
        }
        legalWords.clear();
        console.log(final_word + " not legal");
        return false;
    }

function displayCrossCheckSet(cross_check_set){
    for (let i = 0; i < 15; i++){
        let row = "";
        for (let k = 0; k < 15; k++){
            if (cross_check_set[i][k].length == 0){
                row += "[]";
            } else{
                row += "["
                for (let y = 0; y < cross_check_set[i][k].length; y++){
                    row = row + cross_check_set[i][k][y];
                }
                row += "]";
            }
        }
        console.log(row);
    }
}

function simpleScoreWord(word){
    const letter_values = {
        "a": 1,
        "b": 3,
        "c": 3,
        "d": 2,
        "e": 1,
        "f": 4,
        "g": 2,
        "h": 4,
        "i": 1,
        "j": 8,
        "k": 5,
        "l": 1,
        "m": 3,
        "n": 1,
        "o": 1,
        "p": 3,
        "q": 10,
        "r": 1,
        "s": 1,
        "t": 1,
        "u": 1,
        "v": 4,
        "w": 4,
        "x": 8,
        "y": 4,
        "z": 10,
        "?": 0
    };
    let score = 0;
    for (let i = 0; i < word.length; i++){
        score += letter_values[word.charAt(i)];
    }
    return score;
}

function newCreateCrossCheckSet(board, word_list_trie){ // there was an old create cross check set but this one worked better, hence the name!!!
    let cross_check_set = [[]];
    for (let i = 0; i < 15; i++){
        cross_check_set[i] = [];
        for (let k = 0; k < 15; k++){
            cross_check_set[i][k] = [];
        }
    }
    let letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    for (let i = 0; i < 15; i++){
        for (let k = 0; k < 15; k++){
            if (board[i][k].letter != " "){
                continue;
            }
            let above = "";
            for (let finder = i - 1; finder > 0; finder--){
                if (board[finder][k].letter == " "){
                    break;
                } else{
                    above += board[finder][k].letter;
                }
            }
            let below = "";
            for (let finder = i + 1; finder < 15; finder++){
                if (board[finder][k].letter == " "){
                    break;
                } else{
                    below += board[finder][k].letter;
                }
            }
            if (("" + above + below).length == 0){
                for (let n = 0; n < 26; n++){
                    cross_check_set[i][k].push(letters[n]);
                }
            } else{
                for (let j = 0; j < 26; j++){
                    let word = "" + above + letters[j] + below;
                    if (word_list_trie instanceof Trie && word_list_trie.search(word)){
                        cross_check_set[i][k].push(letters[j]);
                    }
                }
            }
        }
    }
    return cross_check_set;
}

function containsCoordinate(coordinate, anchorCoordinates){ // code to check if some coordinate array contains a specific coordinate
    let x = coordinate.x;
    let y = coordinate.y;
    for (let i = 0; i < anchorCoordinates.length; i++){
        if (anchorCoordinates[i].x == x && anchorCoordinates[i].y == y){
            return true;
        }
    }
    return false;
}

function findLimit(board, x, y, anchorSquares){ // how many to the left can it go without running into an anchor square or preexisting tile?
    let limit = 0;
    for (let i = x - 1; i > 0; i--){
        let left_coordinate = new Coordinate(i, y); // make new coordinate with current x, and y
        if (containsCoordinate(left_coordinate, anchorSquares)){
            return limit - 1;
        }
        limit++;
    }
    return limit + 1;
}

function legalMove(partialWord, x, y, isHorizontal){ // adds some word to the global array of legal moves
    let coordinate = new Coordinate(x, y);
    let currentMove = new botMove(partialWord, coordinate, isHorizontal);
    legalWords.enqueue(currentMove);
}

function rotateBoard(board) {
    let rotatedArray = [];
    for (let i = 0; i < 15; i++) {
        rotatedArray[i] = [];
        let row = "";
        for (let k = 0; k < 15; k++) {
            rotatedArray[i][k] = board[k][14- i];
            row += rotatedArray[i][k].letter;
        }
    }
    return rotatedArray;
}

function leftPart(partialWord, node, limit, tiles, board, x, y, word_list_trie, isHorizontal, anchorX, anchorY, movement){ // called from just the tiles array of letters, NOT of squares
    extendRight(partialWord, node, tiles, board, x, y, word_list_trie, isHorizontal, anchorX, anchorY, movement, true); // anchor square is y and x of board // starts by extending right to find valid word w/ current left part
    if (limit > 0){
        let cross_check_set = newCreateCrossCheckSet(board, word_list_trie);
    for (let key in node.children) { // iterates through every child
        // Check if the key is present in the tiles array
        if (tiles.includes(key) && !(cross_check_set[y][x - partialWord.length] === undefined) && cross_check_set[y][x - partialWord.length].includes(key)) { // that specific key, in cross check set also
            tiles.splice(tiles.indexOf(key), 1); // remove that letter (at least temporarily)
            let new_node = node.children[key]; // new node, which is that child node
            //if (tiles.length != 0 && x > 0){
                //if (x - partialWord.length - 1 < 1){
                  //  leftPart(partialWord + key, new_node, limit - 1, tiles, board, x, y, word_list_trie, isHorizontal, anchorX, anchorY, movement); // call again, limit is one less and we're one to the left
                    //}
                //} 
                let left_legal = false;
                if (x - partialWord.length - 2 > 1){
                    if (board[y][x - partialWord.length - 2].letter == " "){
                        left_legal = true;
                    }
                } else{
                    left_legal = true;
                }
                if (!(cross_check_set[y][x - partialWord.length - 1] === undefined) && cross_check_set[y][x - partialWord.length - 1].includes(key) && left_legal){
                    leftPart(partialWord + key, new_node, limit - 1, tiles, board, x, y, word_list_trie, isHorizontal, anchorX, anchorY, movement); // call again, limit is one less and we're one to the left
                }
            tiles.push(key); // add back to tiles afterwards
        } 
    }
}
}

function displayBoardInternals(board){
    for (let i = 0; i < 15; i++){
        let row = "";
        for (let k = 0; k < 15; k++){
            row += board[i][k].letter;
        }
        console.log(row);
    }
}

function extendRight(partialWord, node, tiles, board, x, y, word_list_trie, isHorizontal, anchorX, anchorY, movement, firstTime){ // also called with just an array of letters for the tile rack
    let cross_check_set = newCreateCrossCheckSet(board, word_list_trie); // start by making cross check set
    if (y < 15 && x < 15){
        if (board[y][x].letter == " "){ // check if space extended to is vacant of letter vs going through some existing letter
            
            let thing_right = false;
            if (x < 14){
                if (board[y][x + 1].letter != " "){
                    thing_right = true;
                }    
            }
            // make it check left and right, somehow the checks don't work I odn't know
            if (node.isEndOfWord && x >= anchorX + movement && !firstTime && x < anchorX + movement + partialWord.length && !thing_right){ // if that partial word is legal // if his word is legal, add it
                if (isHorizontal){
                    legalMove(partialWord, anchorX + movement - 1, anchorY, isHorizontal); // perform this action to set the best word to legalMove if it's the best one (can also add to global array of possibilitites!)
                }
                else { // needs to be fixed
                    legalMove(partialWord, anchorY, anchorX + movement - 1, isHorizontal); // convert coordinates back
                }
            }
            for (const key in node.children) { // otherwise, for every child of that node // just got rid of cross check set not undefined
                if (tiles.includes(key) && !(cross_check_set[y][x] === undefined) && cross_check_set[y][x].includes(key)){ // if our rack has the key and the cross check set has it (limit not an issue at least yet I hope **)
                    let new_node = node.children[key];
                    tiles.splice(tiles.indexOf(key), 1);
                    if (x < 14 && tiles.length != 0){
                        extendRight(partialWord + key, new_node, tiles, board, x + 1, y, word_list_trie, isHorizontal, anchorX, anchorY, movement + 1, false);
                    }
                    tiles.push(key); // add back the tile
                }
            }
        } else{
            let l = board[y][x].letter; //
            if (!(node.children[l] === undefined)){ // if the letter is filled but it's possible to play through it
                let new_node = node.children[l];
                extendRight(partialWord + l, new_node, tiles, board, x + 1, y, word_list_trie, isHorizontal, anchorX, anchorY, movement + 1, false);
            } // else prune if not there
        }
}
}
// Call the initializeGame function to start the game
initializeGame();
