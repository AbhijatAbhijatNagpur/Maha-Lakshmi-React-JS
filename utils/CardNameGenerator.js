const { shuffle } = require("./shuffle");

const customCardsGenerator = (deck, genCards) => {
  shuffle(deck);
  let newDeck = [...deck];
  newDeck = newDeck.filter(
    (card) =>
      (card.rank != genCards[0].rank && card.suit != genCards[0].suit) ||
      (card.rank != genCards[1].rank && card.suit != genCards[1].suit) ||
      (card.rank != genCards[2].rank && card.suit != genCards[2].suit)
  );
  console.log("newDeck", newDeck);
  const newGenCards = []

  for (let i = 0; i < 3; i++) {
    const drawCards = newDeck.splice(0, 1);
    newGenCards.push(drawCards[0]);
  }

  return { newGenCards };
};

// CardNameGenerator
const CardNameGenerator = (card) => {
  var createCard;
  if (card?.rank == 11) {
    createCard = `${card.suit}_jack.png`;
  } else if (card?.rank == 12) {
    createCard = `${card.suit}_queen.png`;
  } else if (card?.rank == 13) {
    createCard = `${card.suit}_king.png`;
  } else if (card?.rank == 14) {
    createCard = `${card.suit}_ace.png`;
  } else if (
    card?.rank != 11 ||
    card?.rank != 12 ||
    card?.rank != 13 ||
    card?.rank != 14
  ) {
    createCard = `${card.suit}_${card.rank}.png`;
  }
  return createCard;
};

const GenerateCardsName = (cards) => {
  return cards.map((card) => CardNameGenerator(card));
};

module.exports={CardNameGenerator,GenerateCardsName,customCardsGenerator}
