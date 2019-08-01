var socket;

window.onload = () => {

  const jwt = localStorage.getItem('jwt');
  if (!jwt) {
    location.replace('/login');
  } else {
    // LOGOUT BUTTON
    const logoutBtn = document.querySelector('#localstorage-clear');

    logoutBtn.addEventListener('click', ev => {
      window.localStorage.clear();
      location.replace('/login');
    });

    // SOCKET.IO
    socket = io.connect('http://localhost:3000', {
      query: {
        token: localStorage.getItem('jwt')
      }
    });

    socket.on('getConnectionsCount', function (total) {
      totalUsersCount = total;
      $('#user').empty();
      $('#user').append('<b>' + totalUsersCount + '</b>');
    });

    socket.on('gameStartTime', function (time) {
      $('#to-seconds').html('<b>' + time + ' sec' + '</b>');
    });

    socket.on('text', function (text) {
      startGame(text);

      const scoreboard = document.querySelector('#results-table');
      const timerToStart = document.querySelector('#timer-to-start');
      const commentator = document.querySelector('#commentator');
      scoreboard.style.display = 'block';
      timerToStart.style.display = 'none';
      commentator.style.display = 'flex';
      $('#header').html('Game');

      window.addEventListener('keypress', keyPressListener);
      window.addEventListener('keydown', keyDownListener)

      let counter = 0; // counter of entered symbols
      let wrongCounter = 0; // counter of wrong symbols

      const arraySpans = document.querySelectorAll('.span-waiting');

      arraySpans[0].classList.add('span-next');

      // KEY PRESS LISTENER
      function keyPressListener(event) {
        const inputSymbol = getChar(event);

        if ((inputSymbol === splitedData[counter]) && (wrongCounter === 0)) {
          arraySpans[counter].classList.remove('span-waiting', 'span-wrong', 'span-next');
          arraySpans[counter].classList.add('span-correct');

          if (counter <= arraySpans.length - 2) {
            arraySpans[counter + 1].classList.add('span-next');
          }

          counter++;
        } else {
          arraySpans[counter].classList.remove('span-waiting');
          arraySpans[counter].classList.add('span-wrong');
          wrongCounter++;
          counter++;
        }

        if ((counter === arraySpans.length)
          && arraySpans[arraySpans.length - 1].classList.contains('span-correct')) {
          window.removeEventListener('keypress', keyPressListener);
          window.removeEventListener('keydown', keyDownListener);
          console.log('[FRONTEND]: Game over');
        }

        const correctCounter = counter - wrongCounter; // counter of correct symbols

        socket.emit('symbolsEntered', correctCounter);
      }

      // PRESSING BACKSPACE
      function keyDownListener(event) {
        if (event.keyCode == 8 && wrongCounter !== 0) {
          counter--;
          wrongCounter--;
          arraySpans[counter].classList.remove('span-wrong');
          arraySpans[counter].classList.add('span-waiting');
        }

        return null;
      }

      // GET CHAR FROM KEY LISTENER
      function getChar(event) {
        if (event.which == null) {
          if (event.keyCode < 32) return null;
          return String.fromCharCode(event.keyCode)
        }

        if (event.which != 0 && event.charCode != 0) {
          if (event.which < 32) return null;
          return String.fromCharCode(event.which);
        }

        return null;
      }

    });

    // SPLITING TEXT
    const dataText = document.querySelector('.text-data');
    let splitedData = [];

    function startGame(data) {
      splitedData = data.split('');

      for (const letter of splitedData) {
        const letterSpan = document.createElement('span');
        letterSpan.innerHTML = letter;
        letterSpan.classList.add('span-waiting');

        dataText.append(letterSpan);
      }

      return null;
    }

    socket.on('someoneEntered', function ({ table }) {
      const players = Object.keys(table);
      const tableText = players.map(player => `<tr><td id="${player}">${player}</td><td>${table[player]}</td></tr>`).join('');
      $('#table').html(tableText);

    });

    // COMMENTATOR MESSAGES
    socket.on('commentatorEnableMic', function ({ commentatorEnableMic }) {
      $('#phrase').html('<i>' + commentatorEnableMic + '</i>');
    });

    socket.on('commentatorGreeting', function ({ commentatorGreeting }) {
      $('#phrase').html(commentatorGreeting);
    });

    socket.on('commentatorIntroduce', function ({ commentatorIntroduce }) {
      $('#phrase').html(commentatorIntroduce);
    });

    socket.on('commentatorsJoke', function ({ commentatorsJoke }) {
      $('#phrase').html(commentatorsJoke);
    });

    socket.on('commentatorAlert', function ({ commentatorAlert }) {
      $('#phrase').html(commentatorAlert);
    });

    socket.on('commentatorInfo', function ({ commentatorInfo }) {
      $('#phrase').html(commentatorInfo);
    });

    socket.on('commentatorFinish', function ({ commentatorFinish }) {
      $('#phrase').html('<b>' + commentatorFinish + '</b>');
    });

    /////

    socket.on('player:disconnect', function ({ login }) {
      const player = document.querySelector(`#${login}`);
      player.classList.add('disconnected');
      console.log('Player', login, 'left from current room.');
    });
  }
}
