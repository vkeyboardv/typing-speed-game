const JokeFactory = require('../bot/jokes');
const randomNumberJoke = require('../bot/utils');
const getCarName = require('../bot/car');
const lodash = require('lodash');

class Commentator {
  constructor(data) {
    this.commentatorName = data.generatedCommentatorName;
    this.roomName = data.roomName;
    this.logins = data.loginsInRoom;
    this.megaphone = new Microphone(this.roomName); // FACADE PATTERN (SIMPLE BUT REAL)
    this.headphones = new Headphones(this.roomName); // FACADE PATTERN (SIMPLE BUT REAL)
  }

  sayHi() {
    this.megaphone.turnOn();
    this.headphones.turnOn();

    const sayHelloTo = lodash.partialRight(greet, 'Hello', lodash);
    const greetingMsg = `${sayHelloTo('everyone')}! We are in room "${this.roomName}"! I am commentator-imperator ${this.commentatorName}!`;

    return greetingMsg;
  }

  enableMic() {
    return this.megaphone.turnOn();
  }

  introducePlayers() {
    const players = this.logins;
    let prepareMsg = `Let me introduce you our ${players.length} racers: `;

    for (const player of players) {
      let vehicleName = getCarName(); // <--- PROXY PATTERN IS HERE
      if (vehicleName === 'car doesnt exist') {
        vehicleName = 'bicycle AIST';
      }

      prepareMsg = prepareMsg.concat(player + ' on [' + vehicleName + '], ');
    }

    const introduceMsg = prepareMsg.slice(0, -2).concat('!');

    return introduceMsg;
  }

  sayAlert(login, symbols) {
    const alertMsg = `Racer ${login} is close to finish, ${symbols} symbols left`;

    return alertMsg;
  }

  sayInfo(leaderLogin, symLeftForLeader, looserLogin, symLeftForLooser, diff) {
    const finishMsg = `Leader - ${leaderLogin} (${symLeftForLeader} left), and looser is ${looserLogin} (${symLeftForLooser} left). Difference between them is ${diff}!`;

    return finishMsg;
  }

  sayFinish(table, tableSorted) {
    console.log(table);
    console.log(tableSorted);
    const winner = tableSorted[0];
    const secondPlace = tableSorted[1];
    const thirdPlace = tableSorted[2];

    const winnerScore = table[tableSorted[0]];
    const secondPlaceScore = table[tableSorted[1]];
    const thirdPlaceScore = table[tableSorted[2]];
    const finishMsg = `Racer ${winner} finished with score ${winnerScore}!`;

    if (secondPlace) {
      let parting = finishMsg.concat(` 2nd place - ${secondPlace} (${secondPlaceScore})!`);

      if (thirdPlace) {
        parting = parting.concat(` 3rd - ${thirdPlace} (${thirdPlaceScore})! See you soon! Bye!`);

        return parting;
      }

      parting = parting.concat(' See you soon! Bye!');
      return parting;
    }

    return finishMsg;
  }

  sayJoke() {
    const randomPlayer = Math.floor(Math.random() * (this.logins).length);
    const generatedNumberOfJoke = randomNumberJoke(1)(3); // CURRY (range 1-3)
    const joke = new JokeFactory(generatedNumberOfJoke, {
      login: this.logins[randomPlayer]
    });

    return joke.sayJoke();
  }
}

class Microphone {
  constructor(roomName) {
    this.roomName = roomName;
  }

  turnOn() {
    const msg = `[ROOM #${this.roomName}]: * microphone enabled pshh-pshh *`;
    console.log(`[COMMENTATOR ROOM #${this.roomName}]: Megaphone turned on!`);

    return msg;
  }

  turnOff() {
    console.log(`[COMMENTATOR ROOM #${this.roomName}]: Megaphone turned off!`);
  }
}

class Headphones {
  constructor(roomName) {
    this.roomName = roomName;
  }

  turnOn() {
    console.log(`[COMMENTATOR ROOM #${this.roomName}]: Headphones turned on!`);
  }

  turnOff() {
    console.log(`[COMMENTATOR ROOM #${this.roomName}]: Headphones turned off!`);
  }
}

function greet(greeting, name) {
  return greeting + ' ' + name;
}

module.exports = Commentator;
