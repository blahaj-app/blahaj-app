const toRegionalIndicators = (str: string) =>
  String.fromCodePoint(...[...str.toUpperCase()].map((char) => char.charCodeAt(0) + 127397));

export default toRegionalIndicators;
