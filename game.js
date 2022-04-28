solution=""

var words = []
var attempts = []
var startTime = null;

var dailies = []

var firstDay = new Date(2022,3,28)
var dayIndex;


const DEBUG = false;
const isMobile = navigator.userAgentData.mobile;

var finish_time;
var time;
var seconds;
var minutes;
var guessCount;

fetch("./magyar_szavak.txt").then(
      function(response) {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }
  
        response.text().then(function(data) {
          data.split('\n').forEach(element => {
            words.push(element.replace('\r','').toLowerCase());
          });

          loadDailies();
        });
      }
    )
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    });

function loadDailies()
{
  fetch('./titkos.txt').then(
    function(response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
          response.status);
        return;
      }
      response.text().then(function(data) {
        
        dailies = decodeURIComponent(escape(window.atob( data))).split('\n')
        
        updateSolution()
      });
    }
  )
}

function updateSolution()
{
  dayIndex = Math.floor((new Date() - firstDay) / (1000 * 60 * 60 * 24)); 

  if(dayIndex >= 0 && dayIndex < dailies.length)
  {
    solution = dailies[dayIndex];
  }
  else
  {
    solution = words[Math.floor(Math.random()*words.length)];
  }

  if(DEBUG)
  {
    console.log("Ez lett a solution: " + solution)
  }

}

function createWordElement(word)
{
    return $("<p></p>").addClass("attempt").text(word).hide().fadeIn(0).animate({fontSize: '1.2rem'}, 300);
}

function compareWords(word1, word2)
{
    if(word1.localeCompare(word2) == 0)
    {
      return 0;
    }
    if(words.indexOf(word1) > words.indexOf(word2))
    {
      return 1;
    }

    return -1;
}

function addToWordList(word, listName) {

    var element = $(listName).children().first()
    while(element.is('p'))
    {
        if(compareWords(word, element.text()) > 0)
        {
            element = element.next()
        }
        else
        {
            element.before(createWordElement(word))
            break;
        }
    }

    if(!element.is('p'))
    {
        $(listName).append(createWordElement(word))
    }
}

function setErrorMessage(message)
{
  $("#error").slideDown(250);
  $("#error_message").text(message);
}

function clearErrorMessage(message)
{
  $("#error_message").text("");
  $("#error").fadeOut();
}


function validateGuess(guess)
{
    guess = guess.toLowerCase()
    if(guess.length < 1)
    {
        setErrorMessage("Írj be valamit ember")
        return false;
    }

    if(!words.includes(guess) && !guess.localeCompare(solution) == 0)
    {
        setErrorMessage("Ez nem egy szó (vagy csak nem szerepel a listában)")
        return false;
    }
    
    if(attempts.includes(guess))
    {
      setErrorMessage("Ezt már írtad")
      return false;
    }

    clearErrorMessage();
    return true;
}

function clearGuess()
{
    $("#guess")[0].value = ""
}

function victory()
{
    $("#player").hide(500)
    $("#victory").slideDown()
    $("#solution").text(solution)

    guessCount = attempts.length.toString();
    $("#guess_count").text(guessCount);

    finish_time = Date.now();
    time = finish_time - startTime;
    seconds = Math.floor(time / 1000)
    minutes = Math.floor(seconds / 60)
    seconds -= minutes * 60;

    $("#time").text(minutes.toString()+"m"+seconds.toString()+"s");

}

function getTimeEmoji(minutes)
{
  if(minutes < 1)
  {
    return '🤯'
  }
  else if(minutes < 2)
  {
    return '😎'
  }
  else if(minutes < 3)
  {
    return '🥰'
  }
  else if(minutes < 5)
  {
    return '😍'
  }
  else if(minutes < 10)
  {
    return '🤔'
  }
  else
  {
    return '😬'
  }
}

function getGuessEmoji(guesses)
{
  if(guesses < 3)
  {
    return '🚀'
  }
  else if(guesses < 10)
  {
    return '🚅'
  }
  else if(guesses < 20)
  {
    return '🚲'
  }
  else
  {
    return '🐌'
  }
}

function copyToClipboard()
{
  message = `Találóska ${dayIndex + 1}. nap 🌞
Meglett ${guessCount} tippből ${getGuessEmoji(guessCount)} ${minutes}p ${seconds}mp alatt ${getTimeEmoji(minutes)}
https://hunisan.github.io/talaloska/`


  navigator.clipboard.writeText(message);
  $("#copyPopup").fadeIn(500).delay().fadeOut(1000)

  if(isMobile)
  {
    navigator.share({
      text: message
    })
  }
}

function setStartTime()
{
  startTime = Date.now();
}
  
function restyle(){
  var element = $("#before").children().last();
  var count = $("#before").children().length;
  var i = 0;
  while(element.is("p"))
  {
    element.css({opacity: 1 - i / (count+1)})
    element = element.prev()
    i++;
  }
  element = $("#after").children().first();
  count = $("#after").children().length;
  i = 0;
  while(element.is("p"))
  {
    element.css({opacity: 1 - i / (count+1)})
    element = element.next()
    i++;
  }
}
function onEnter(){
    var guess = $("#guess")[0].value.toLowerCase()
    
    if(validateGuess(guess) == false)
    {
        return;
    }

    if(startTime == null)
    {
      setStartTime();
    }
    clearGuess()

    attempts.push(guess)

    var comparison = compareWords(guess, solution)

    if(comparison == 0)
    {
      victory()
    }
    else if(comparison == -1)
    {
      addToWordList(guess, "#before")
    }
    else
    {
      addToWordList(guess, "#after")
    }

    restyle()
  }

function giveUp()
{
  if(confirm("Biztos fel szeretnéd adni?"))
  {
    clearErrorMessage()
    $("#player").hide(500)
    $("#loss").slideDown()
    $('#failsolution').text(solution)
  }
}

$(document).ready(function(){
    $("#send").click(onEnter);
    $("#giveuplink").click(giveUp);
    $("#guess").on("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
          // Cancel the default action, if needed
          event.preventDefault();
          // Trigger the button element with a click
          onEnter()
        }
      });
  });