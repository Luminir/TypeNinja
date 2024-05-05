// split() the word into arrays, split() at wordspace ' ' 
const words ='They rushed out the door grabbing anything and everything they could think of they might need There was no time to double check to make sure they weren\'t leaving something important behind Everything was thrown into the car and they sped off Thirty minutes later they were safe and that was when it dawned on them that they had forgotten the most important thing of all'.split(' ');
const words2 = 'Her eyebrows were a shade darker than her hair They were thick and almost horizontal emphasizing the depth of her eyes She was rather handsome than beautiful Her face was captivating by reason of a certain frankness of expression and a contradictory subtle play of features Her manner was engaging'.split(' ');
// console.log(words);
// let co = words;
// console.log(co);
const gameTime = 60*1000;
window.timer = null;
window.gameStart = null;

function randomWord(){
    const randomChoice = Math.random();
    let wordy ='';
    if (randomChoice > 0.5)
    {
        wordy = words;
    }
    else{
        wordy = words2;
    }
    const randomNum = Math.ceil(Math.random()*wordy.length);
    return wordy[randomNum - 1]; // 2 hours wasted here, I forgot [-1]
}

function addClass(el,name) {
    el.className += ' '+name;
  }
function removeClass(element, name){
    element.className = element.className.replace(name,'');
}

// put each word : words into a div
function formatWord(word){
    // const w = word.split("");
    return `<div class="word"><span class="letter">${word.split('').join('</span><span class="letter">')}</span></div>`;
    // console.log(word);
}

function playGame() {
    document.getElementById('sentences').innerHTML = '';
    for(let i = 0; i < 200; i++)
    {
        document.getElementById('sentences').innerHTML += formatWord(randomWord());
    }
    addClass(document.querySelector('.word'), 'now');
    addClass(document.querySelector('.letter'), 'now');
    document.getElementById('timer').innerHTML = (gameTime / 1000) + 's';
}

function gameOver(){
    clearInterval(window.timer);
    // if game over, no typing is allowed
    addClass(document.getElementById('game'), 'over');

    // counting correct span === letter
    console.log(`${getWpm()}`)
    document.getElementById('down').innerHTML = `CORRECT WORDS / MIN: ${getWpm()}`;
    document.getElementById('timer').innerHTML = ' TIME\'S UP!'
}

function getWpm(){
    const words = [...document.querySelectorAll('.word')];
    const lastTypedWord = document.querySelector('.word.now');
    const lastTypedWordIndex = words.indexOf(lastTypedWord) + 1;
    const typedWord = words.slice(0, lastTypedWordIndex);
    const correctWord = typedWord.filter(word =>{
        const letters = [...word.children];
        const wrongLetter = letters.filter((letter) =>letter.className.includes('wrong'));
        const correctLetter = letters.filter((letter) => letter.className.includes('correct'));
        return wrongLetter.length === 0 && correctLetter.length === letters.length;
    });
    return correctWord.length;
}

document.getElementById('game').addEventListener('keyup', ev =>{
    // console.log(ev); //the key we typed down will store in "key"
    const key = ev.key;
    const currentWord = document.querySelector('.word.now');
    const currentLetter = document.querySelector('.letter.now');

    //if we "do NOT have a current letter" then we need to add an empty space
    const expectingLetter = currentLetter?.innerHTML || ' ';
    //console.log(key,letterTyped);
    console.log({key, expectingLetter});

    // check if our input is a letter (length of letter is 1, not a space( like this " ")
    const isLetter = key.length === 1 && key !== ' ';

    //check if our input is a space
    const isSpace = key === ' ';

    // if game is over, "no typing" check
    if(document.querySelector('#game.over'))
    {
        return;
    }

    // check the timer
    if(!window.timer && isLetter || !window.timer && isSpace) // if time === NULL and first letter typed then start the TIMER || backspace also have timer on
    {
        // alert('TIMER set now')
        window.timer = setInterval(() =>{
            if(!window.gameStart)
            {
                window.gameStart = (new Date()).getTime();
            }
            const currentTime = (new Date()).getTime();
            const milisecondPassed = currentTime - window.gameStart;
            const secondPassed = Math.round(milisecondPassed / 1000); // We wanna see second not milisec
            const secondLeft = (gameTime / 1000) - secondPassed;
            document.getElementById('timer').innerHTML = secondLeft + 's';
            if (secondLeft <= 0) // prevent time from going negative
            {
                gameOver();
                return;
            }
            
        }, 1000) // after 1-mili-sec = 1s
    }

    // check if we enter a letter
    if(isLetter)
    {   // check the current letter div class
        if(currentLetter)
        {   // check if key we enter = expecting key
           if(key === expectingLetter)
            {
                // alert('right');
                addClass(currentLetter, 'correct');
            }
            else
            {
                addClass(currentLetter, 'wrong');
                // alert('wrong');
            };
            // done, we will remove that property and pass to the next letter to be 'current'
            removeClass(currentLetter, 'now');
            
            // check if there is a current letter
            if(currentLetter.nextSibling)
            {
                addClass(currentLetter.nextSibling, 'now');
            }
        }
        else // when we at last  letter "...rewf f.." : a need for space or else we CAN press any key without 'wrong' and that is wrong
        {
            const wrongLetter = document.createElement('span');
            wrongLetter.innerHTML = key;
            wrongLetter.className = 'letter wrong extra'; // tell computer that this is STILL a part of the game, but an EXTRA
            currentWord.appendChild(wrongLetter); // append wrong input to the game
        }
    }

    //check if we enter a space
    if(isSpace)
    {
        if(expectingLetter !== ' ')
        {
            // select all the letter that are NOT --> turn into an array
            const letterToInvalid = [...document.querySelectorAll('.word.now .letter:not(.correct)')];
            letterToInvalid.forEach((letter) => {
                addClass(letter, 'wrong');
            });
        }
        removeClass(currentWord, 'now');
        addClass(currentWord.nextSibling, 'now');

        //check if we have the next letter is current or not
        if(currentLetter)
        {
            removeClass(currentLetter, 'now');
        }
        addClass(currentWord.nextSibling.firstChild, 'now');
    }

    // check for backspace
    //put this before cursor part
    const isBackSpace = key === 'Backspace';
    const isFirstLetter = currentLetter === currentWord.firstChild;
    if (isBackSpace)
    {   // at "my [|]name is" the cursor '|'
        if(currentLetter && isFirstLetter)
        {
            // move backward when we have backspace to DELETE the wrong input
            // ==> remove current word, make previous word current
            removeClass(currentWord, 'now');
            addClass(currentWord.previousSibling, 'now');
            // ==> now make previous letter current after we delete the current letter
            removeClass(currentLetter, 'now');
            addClass(currentWord.previousSibling.lastChild,'now');
            removeClass(currentWord.previousSibling.lastChild, 'wrong');
            removeClass(currentWord.previousSibling.lastChild, 'correct');
        }
        if(currentLetter && !isFirstLetter) // at "my n|a|m|e is" the cursor '|' between 1st and last letter
        {
            removeClass(currentLetter, 'now');
            addClass(currentLetter.previousSibling, 'now');
            removeClass(currentLetter.previousSibling, 'correct');
            removeClass(currentLetter.previousSibling, 'wrong');

        }
        if (!currentLetter)
        {
            addClass(currentWord.lastChild, 'now');
            removeClass(currentWord.lastChild, 'wrong');
            removeClass(currentWord.lastChild, 'correct');
        }   
    }

    // auto move down as we type
    if(currentWord.getBoundingClientRect().top > 230)
    {
        // alert('move');
        const sentences = document.getElementById('sentences');
        const marginy = parseInt(sentences.style.marginTop || '0px');
        // const marginy = parseInt(words.style.marginTop ? marginTop : '0px');
        sentences.style.marginTop = (marginy - 35) + 'px'; 
        // EXPLAIN: if it null (always at the start) -> 0-35px
        // if it moves, its NOT('0px') -> 0-35 -35px;
        // continues: 0-35 -35 -35px
    }

    //move customed cursor to next letter
    const nextLetter = document.querySelector('.letter.now');
    const cursor = document.getElementById('cursor');
    const nextWord = document.querySelector('.word.now')
    // if(nextLetter)
    // {
    //     // cursor.style.top = nextLetter.getBoundingClientRect().top + 'px';
    //     cursor.style.left = nextLetter.getBoundingClientRect().left + 'px';
    // } else{ // we do not have current letter at the end of WORD so check for NEXT WORD!
    //     // cursor.style.top = nextWord.getBoundingClientRect().top + 'px';
    //     cursor.style.left = nextWord.getBoundingClientRect().left + 'px';
    // }
    // ALMOST same with above codes but less BUGS
    cursor.style.top =(nextLetter || nextWord).getBoundingClientRect().top + 'px';
    cursor.style.left = (nextLetter || nextWord).getBoundingClientRect()[nextLetter ? 'left' : 'right'] + 'px';

});

document.getElementById('buttons').addEventListener('click', () =>
{
    gameOver();
    playGame();
})

playGame();