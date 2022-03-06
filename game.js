solution=""

var words = []
fetch("./magyar_szavak.txt").then(
      function(response) {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }
  
        // Examine the text in the response
        response.text().then(function(data) {
          data.split('\n').forEach(element => {
            words.push(element.replace('\r','').toLowerCase());
          });


          solution = words[Math.floor(Math.random()*words.length)];
        });
      }
    )
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    });

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

    if($(".attempt").text().includes(guess))
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
}
  
function onEnter(){
    var guess = $("#guess")[0].value.toLowerCase()
    
    if(validateGuess(guess) == false)
    {
        return;
    }

    clearGuess()

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
  }

function giveUp()
{
  if(confirm("Biztos fel szeretnéd adni?"))
  {
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