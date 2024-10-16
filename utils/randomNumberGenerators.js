const randomNumberGenerator1 = () => {
  return Math.ceil(Math.random() * 2);
};
const randomNumberGenerator2 = () => {
    let min=2
    let max=6
  return Math.ceil(Math.random() *(max-min)+1 )+min;
};
const randomGameIdGenerator = () => {
  return Math.floor(Math.random() * Date.now());
};

module.exports={randomNumberGenerator1,randomGameIdGenerator,randomNumberGenerator2}
