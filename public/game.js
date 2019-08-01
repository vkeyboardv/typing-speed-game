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
      scoreboard.style.display = 'block';
      timerToStart.style.display = 'none';
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
          console.log('Game over');
          const winner = document.querySelector('#winner');
          winner.style.display = 'block';
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

    socket.on('someoneEntered', function ({ table }) { // украсить результаты
      const players = Object.keys(table);
      const tableText = players.map(player => `<tr><td id="${player}">${player}</td><td>${table[player]}</td></tr>`).join('');
      $('#table').html(tableText);

    });

    socket.on('finish', function ({ winner }) {
      $('#winner-name').html(winner);
    });

    socket.on('player:disconnect', function ({ login }) {
      const player = document.querySelector(`#${login}`);
      player.classList.add('disconnected');
      console.log('Player', login, 'left from current room.');
    });

    socket.on('startGame', function () {
      console.log('Game started!');
    });
  }
}
