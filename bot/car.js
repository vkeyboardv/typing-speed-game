const fs = require('fs-extra');

const handler = {
  get: (target, name) => {
    return name in target ? target[name] : 'car doesnt exist'
  }
}

const carNames = fs.readJsonSync('data/cars.json');
const p = new Proxy(carNames, handler); // PROXY PATTERN - 

function getCarName() {
  const cIndex = Math.floor(Math.random() * 10); // if '0' -> car doesn't exist

  return p[cIndex];
}

module.exports = getCarName;
