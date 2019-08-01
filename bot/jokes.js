class JokeFactory { // FACTORY PATTERN
  constructor(type, props) {
    if (type === 1)
      return new IronicJoke(props);
    if (type === 2)
      return new AnecdotalJoke(props);
    if (type === 3)
      return new CharacterJoke(props);
  }
}

class IronicJoke {
  constructor(props) {
    this.login = props.login;
  }

  sayJoke() {
    const joke = `${this.login}, if you smacked a kid in the face with a bottle of johnsons no more tears, would it create beautiful irony?`;

    return joke;
  }
};

class AnecdotalJoke {
  constructor(props) {
    this.login = props.login;
  }

  sayJoke() {
    const joke = `${this.login}, did you know that dolphins are so smart that within a few weeks of captivity, they can train people to stand on the very edge of the pool and throw them fish?`;

    return joke;
  }
};

class CharacterJoke {
  constructor(props) {
    this.login = props.login;
  }

  sayJoke() {
    const joke = `${this.login}, during World War II, my grandpa single-handedly killed 30 German pilots. He was the crappiest mechanic the Luftwaffe ever hired.`;

    return joke;
  }
};

module.exports = JokeFactory;
