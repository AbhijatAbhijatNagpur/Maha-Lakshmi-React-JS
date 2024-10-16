const isTrail = (cards) => {
  return cards[0].rank === cards[1].rank && cards[1].rank === cards[2].rank;
};

function isPureSequence(cards) {
  const sortedRanks = cards.map((card) => card.rank).sort((a,b)=>a-b);
  return (
    sortedRanks[2] - sortedRanks[1] === 1 &&
    sortedRanks[1] - sortedRanks[0] === 1 &&
    cards[0].suit === cards[1].suit &&
    cards[1].suit === cards[2].suit
  );
}

function isSequence(cards) {
  const sortedRanks = cards.map((card) => card.rank).sort((a,b)=>a-b);
  return (
    sortedRanks[2] - sortedRanks[1] === 1 &&
    sortedRanks[1] - sortedRanks[0] === 1
  );
}

function isColor(cards) {
  return cards[0].suit === cards[1].suit && cards[1].suit === cards[2].suit;
}

function isPair(cards) {
  return (
    cards[0].rank === cards[1].rank ||
    cards[1].rank === cards[2].rank ||
    cards[0].rank === cards[2].rank
  );
}


const checkHandsRanking = (cards) => {
  if (isTrail(cards)) {
    return 5; // Trail
  } else if (isPureSequence(cards)) {
    return 4; // pure Sequence
  } else if (isSequence(cards)) {
    return 3; // Sequence
  } else if (isColor(cards)) {
    return 2; //color
  } else if (isPair(cards)) {
    return 1; // Pair
  } else {
    return 0; // High cards
  }
};

module.exports={isTrail,isPureSequence,isSequence,isColor,isPair,checkHandsRanking}