const path = require('path');
const express = require('express');
const fs = require('fs-extra');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bodyParser = require('body-parser');
const config = require('config');
const cors = require('cors');
const morgan = require('morgan');
const users = require('./users');

// ROUTES
const indexRouter = require('./routes/index.js');
const loginRouter = require('./routes/login.js');
const gameRouter = require('./routes/game.js');
const dataRouter = require('./routes/data.js');

require('./passport.config');

// PORT
server.listen(3000);

app.use(morgan('dev'));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(bodyParser.json());

// USING ROUTES
app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/game', gameRouter);
app.use('/data', dataRouter);

// SOCKET.IO
const maxPlayersInGame = 5;
let lobbyQueue = [];
let gameTimer = null;
let timer = 0;
let activeGame = 0;

function getRandomText() {
  return fs.readJson('./data/data.json')
    .then(textArray => {
      const rIndex = Math.floor(Math.random() * textArray.length);
      return textArray[rIndex];
    })
}

const broadcastActivePlayers = (message, data) => {
  const activePlayers = lobbyQueue.slice(0, maxPlayersInGame);
  activePlayers.forEach(({ socket }) => {
    socket.emit(message, data);
  })
}

async function startGame(players) {
  activeGame++;
  const roomName = `game${activeGame}`;
  const text = await getRandomText();
  const table = players.reduce((prev, player) => {
    return {
      ...prev,
      [player.login]: 0
    }
  }, {});

  players.forEach(({ socket }) => {
    socket.join(roomName);
    socket.room = roomName;
  });

  io.to(roomName).emit('text', text);

  players.forEach(({ socket }) => {
    socket.on('symbolsEntered', (symbols) => {
      table[socket.userData.login] = symbols;
      io.to(roomName).emit('someoneEntered', { table });

      if (symbols === text.length) {
        io.to(roomName).emit('finish', { table, winner: socket.userData.login });

        players.forEach(({ socket }) => {
          socket.leave(roomName);
          socket.room = null;
          // addPlayerToQueue(socket);
        });
      }
    });
  });
}

function startGameTimer() {
  if (gameTimer === null && lobbyQueue.length > 0) {
    timer = 5;
    gameTimer = setInterval(() => {
      broadcastActivePlayers('gameStartTime', timer);
      console.log('[LOBBY]: Game starts in:', timer);
      timer--;
      if (timer === -1) {
        broadcastActivePlayers('startGame', {});
        startGame(lobbyQueue.slice(0, maxPlayersInGame));
        lobbyQueue = lobbyQueue.slice(maxPlayersInGame);
        clearInterval(gameTimer);
        gameTimer = null;
        startGameTimer();
      }
    }, 1000);
  }
}

function addPlayerToQueue(socket) {
  if (lobbyQueue.find((user) => user.login == socket.userData.login) == null) {
    lobbyQueue.push({
      login: socket.userData.login,
      socket
    });
  } else { // WE CAN'T PLAY FROM 1 ACCOUNT IN TWO+ WINDOWS
    socket.disconnect();
    return;
  }
}

io.on('connection', function (socket) {
  const token = socket.handshake.query.token;
  const userData = jwt.decode(token);
  socket.userData = userData;

  addPlayerToQueue(socket);
  console.log(`[LOBBY]: ${userData.login} connected.`)

  io.emit('getConnectionsCount', lobbyQueue.length);
  startGameTimer();

  socket.on('disconnect', function () {
    lobbyQueue = lobbyQueue.filter(user => user.login != userData.login);

    if (lobbyQueue.length === 0 && gameTimer !== null) {
      clearInterval(gameTimer);
      gameTimer = null;
    }

    console.log(`[LOBBY]: ${userData.login} disconnected.`);

    if (socket.room) {
      io.to(socket.room).emit('player:disconnect', { login: userData.login });
    }
  });
});
