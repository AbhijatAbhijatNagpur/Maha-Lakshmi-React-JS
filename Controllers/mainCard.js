const { WinStatusObj, TeenPattiWebGameHistory } = require("../Constants/constants");
const { TeenPattiWebGameCard } = require("../models/maingame.model");
const { GenerateCardsName, customCardsGenerator } = require("../utils/CardNameGenerator");
const { gameHistoryData } = require("../utils/gameHistoryData");
const {
  checkHandsRanking,
} = require("../utils/handsCheckers");
const {
  randomNumberGenerator1,
  randomGameIdGenerator,
  randomNumberGenerator2,
} = require("../utils/randomNumberGenerators");
const { shuffle } = require("../utils/shuffle");

const cardID = { cardID: null };
let deck = [];
let randomNumber;

const MainGameIdGenerator = async () => {
  const suits = ["hearts", "diamonds", "clubs", "spades"];
  const ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  try {
    deck = [];
    for (const rank of ranks) {
      for (const suit of suits) {
        const card = { rank, suit };
        deck.push(card);
      }
    }
    //shuffle deck
    shuffle(deck);

    const GameId = randomGameIdGenerator();

    let mainGame = new TeenPattiWebGameCard({
      gameid: GameId,
      player1_amount: 0,
      player2_amount: 0,
      total: 0,
      player1Cards: [],
      player2Cards: [],
      winstatus: "",
    });
    let cardCreated = await mainGame.save();
    cardID.cardID = cardCreated._id;
  } catch (error) {
    console.log(error);
  }
};

// gameCardHandler

const gameCardHandler = async (gameCardId) => {
  let flag = true;
  try {
    if (deck.length > 0) {
      let side1Cards = [];
      let side2Cards = [];

      const mainGameCard = await TeenPattiWebGameCard.findById(gameCardId);

      if (!mainGameCard) {
        console.log({ msg: "mainGame not found" });
      }

      for (let i = 0; i < 3; i++) {
        const drawcards = deck.splice(0, 2);

        side1Cards.push(drawcards[0]);
        side2Cards.push(drawcards[1]);
      }


      let side1cardsRanking = checkHandsRanking(side1Cards);
      let side2cardsRanking = checkHandsRanking(side2Cards);
     
      // cards changing according to bet logic
     
      while (flag == true) {
        const lowbet = Math.min(
          mainGameCard.player1_amount,
          mainGameCard.player2_amount
        );
        const maxPairbet = Math.max(
          mainGameCard.pairPlus1_amount,
          mainGameCard.pairPlus2_amount
        );
        if (side1cardsRanking > 0 && side2cardsRanking > 0) {
          if (
            lowbet * 1.98 +
              mainGameCard.pairPlus1_amount * 2 +
              mainGameCard.pairPlus2_amount * 2 >=
            mainGameCard.total
          ) {
            const { genSide1Cards, genSide2Cards } = cardsGenerator(deck);
            side1Cards = [...genSide1Cards];
            side2Cards = [...genSide2Cards];

            side1cardsRanking = checkHandsRanking(side1Cards);
            side2cardsRanking = checkHandsRanking(side2Cards);
          } else if (
            lowbet * 1.98 +
              mainGameCard.pairPlus1_amount * 2 +
              mainGameCard.pairPlus2_amount * 2 <
            mainGameCard.total
          ) {
            flag = false;
            break;
          } else {
            flag = false;
            break;
          }
        } else if (side1cardsRanking > 0) {
          if (lowbet * 1.98 + maxPairbet * 2 >= mainGameCard.total) {
            const { newGenCards } = customCardsGenerator(deck, side2Cards);
            side1Cards = [...newGenCards];
            side1cardsRanking = checkHandsRanking(side1Cards);
            break;
          } else if (lowbet * 1.98 + maxPairbet * 2 < mainGameCard.total) {
            flag = false;
            break;
          } else {
            flag = false;
            break;
          }
        } else if (side2cardsRanking > 0) {
          if (lowbet * 1.98 + maxPairbet * 2 >= mainGameCard.total) {
            const { newGenCards } = customCardsGenerator(deck, side1Cards);
            side2Cards = [...newGenCards];
            side2cardsRanking = checkHandsRanking(side2Cards);
            break;
          } else if (lowbet * 1.98 + maxPairbet * 2 < mainGameCard.total) {
            flag = false;
            break;
          } else {
            flag = false;
            break;
          }
        } else if (side1cardsRanking <= 0 && side2cardsRanking <= 0) {
          flag = false;
          break;
        }
      }

      let side1CardsNames = GenerateCardsName(side1Cards);
      let side2CardsNames = GenerateCardsName(side2Cards);
  
      if (side1cardsRanking > side2cardsRanking) {
        //higher ranking of side1cards
        if (mainGameCard.player1_amount < mainGameCard.player2_amount) {
          mainGameCard.player1Cards = side1CardsNames; //winner cards with less bet amount
          mainGameCard.player2Cards = side2CardsNames;
          mainGameCard.winstatus = WinStatusObj.PLAYER1;
        } else if (mainGameCard.player2_amount < mainGameCard.player1_amount) {
          mainGameCard.player2Cards = side1CardsNames; //winner cards with less bet amount
          mainGameCard.player1Cards = side2CardsNames;
          mainGameCard.winstatus = WinStatusObj.PLAYER2;
        } else if (mainGameCard.player1_amount == mainGameCard.player2_amount) {
          randomNumber = randomNumberGenerator1();
          if (randomNumber == 1) {
            mainGameCard.player1Cards = side1CardsNames; //winner cards with less bet amount
            mainGameCard.player2Cards = side2CardsNames;
            mainGameCard.winstatus = WinStatusObj.PLAYER1;
          } else if (randomNumber == 2) {
            mainGameCard.player2Cards = side1CardsNames; //winner cards with less bet amount
            mainGameCard.player1Cards = side2CardsNames;
            mainGameCard.winstatus = WinStatusObj.PLAYER2;
          }
        }
      } else if (side2cardsRanking > side1cardsRanking) {
        //higher ranking of side2cards
        if (mainGameCard.player1_amount < mainGameCard.player2_amount) {
          mainGameCard.player1Cards = side2CardsNames; //winner cards with less bet amount
          mainGameCard.player2Cards = side1CardsNames;
          mainGameCard.winstatus = WinStatusObj.PLAYER1;
        } else if (mainGameCard.player2_amount < mainGameCard.player1_amount) {
          mainGameCard.player2Cards = side2CardsNames; //winner cards with less bet amount
          mainGameCard.player1Cards = side1CardsNames;
          mainGameCard.winstatus = WinStatusObj.PLAYER2;
        } else if (mainGameCard.player1_amount == mainGameCard.player2_amount) {
          randomNumber = randomNumberGenerator1();
          if (randomNumber == 1) {
            mainGameCard.player1Cards = side2CardsNames; //winner cards with less bet amount
            mainGameCard.player2Cards = side1CardsNames;
            mainGameCard.winstatus = WinStatusObj.PLAYER1;
          } else if (randomNumber == 2) {
            mainGameCard.player2Cards = side2CardsNames; //winner cards with less bet amount
            mainGameCard.player1Cards = side1CardsNames;
            mainGameCard.winstatus = WinStatusObj.PLAYER2;
          }
        }
      } else if (side2cardsRanking == side1cardsRanking) {
        let side1HighestCardRank = 0;
        let side2HighestCardRank = 0;

        let sortedSide1cards = side1Cards
          .map((card) => card.rank)
          .sort((a, b) => b - a);
        let sortedSide2cards = side2Cards
          .map((card) => card.rank)
          .sort((a, b) => b - a);

    
        for (let i = 0; i < 3; i++) {
          if (sortedSide1cards[i] > sortedSide2cards[i]) {
            side1HighestCardRank += 1;
            break;
          } else if (sortedSide2cards[i] > sortedSide1cards[i]) {
            side2HighestCardRank += 1;
            break;
          }
        }

        if (side1HighestCardRank > side2HighestCardRank) {
          if (mainGameCard.player1_amount < mainGameCard.player2_amount) {
            mainGameCard.player1Cards = side1CardsNames; //winner cards with less bet amount
            mainGameCard.player2Cards = side2CardsNames;
            mainGameCard.winstatus = WinStatusObj.PLAYER1;
          } else if (
            mainGameCard.player2_amount < mainGameCard.player1_amount
          ) {
            mainGameCard.player2Cards = side1CardsNames; //winner cards with less bet amount
            mainGameCard.player1Cards = side2CardsNames;
            mainGameCard.winstatus = WinStatusObj.PLAYER2;
          } else if (
            mainGameCard.player1_amount == mainGameCard.player2_amount
          ) {
            randomNumber = randomNumberGenerator1();
            if (randomNumber == 1) {
              mainGameCard.player1Cards = side1CardsNames; //winner cards with less bet amount
              mainGameCard.player2Cards = side2CardsNames;
              mainGameCard.winstatus = WinStatusObj.PLAYER1;
            } else if (randomNumber == 2) {
              mainGameCard.player2Cards = side1CardsNames; //winner cards with less bet amount
              mainGameCard.player1Cards = side2CardsNames;
              mainGameCard.winstatus = WinStatusObj.PLAYER2;
            }
          }
        } else if (side2HighestCardRank > side1HighestCardRank) {
          if (mainGameCard.player1_amount < mainGameCard.player2_amount) {
            mainGameCard.player1Cards = side2CardsNames; //winner cards with less bet amount
            mainGameCard.player2Cards = side1CardsNames;
            mainGameCard.winstatus = WinStatusObj.PLAYER1;
          } else if (
            mainGameCard.player2_amount < mainGameCard.player1_amount
          ) {
            mainGameCard.player2Cards = side2CardsNames; //winner cards with less bet amount
            mainGameCard.player1Cards = side1CardsNames;
            mainGameCard.winstatus = WinStatusObj.PLAYER2;
          } else if (
            mainGameCard.player1_amount == mainGameCard.player2_amount
          ) {
            randomNumber = randomNumberGenerator1();
            if (randomNumber == 1) {
              mainGameCard.player1Cards = side2CardsNames; //winner cards with less bet amount
              mainGameCard.player2Cards = side1CardsNames;
              mainGameCard.winstatus = WinStatusObj.PLAYER1;
            } else if (randomNumber == 2) {
              mainGameCard.player2Cards = side2CardsNames; //winner cards with less bet amount
              mainGameCard.player1Cards = side1CardsNames;
              mainGameCard.winstatus = WinStatusObj.PLAYER2;
            }
          }
        } else if (side1HighestCardRank == side2HighestCardRank) {
          //hidden or rare case
          randomNumber = randomNumberGenerator2();
          sortedSide1cards[0].rank == 14
            ? (side2Cards[0].rank = randomNumber)
            : (side1Cards[0].rank = 14);
          side1CardsNames = GenerateCardsName(side1Cards);
          side2CardsNames = GenerateCardsName(side2Cards);
          if (mainGameCard.player1_amount < mainGameCard.player2_amount) {
            mainGameCard.player1Cards = side1CardsNames; //winner cards with less bet amount
            mainGameCard.player2Cards = side2CardsNames;
            mainGameCard.winstatus = WinStatusObj.PLAYER1;
          } else if (
            mainGameCard.player2_amount < mainGameCard.player1_amount
          ) {
            mainGameCard.player2Cards = side1CardsNames; //winner cards with less bet amount
            mainGameCard.player1Cards = side2CardsNames;
            mainGameCard.winstatus = WinStatusObj.PLAYER2;
          } else if (
            mainGameCard.player1_amount == mainGameCard.player2_amount
          ) {
            randomNumber = randomNumberGenerator1();
            if (randomNumber == 1) {
              mainGameCard.player1Cards = side1CardsNames; //winner cards with less bet amount
              mainGameCard.player2Cards = side2CardsNames;
              mainGameCard.winstatus = WinStatusObj.PLAYER1;
            } else if (randomNumber == 2) {
              mainGameCard.player2Cards = side1CardsNames; //winner cards with less bet amount
              mainGameCard.player1Cards = side2CardsNames;
              mainGameCard.winstatus = WinStatusObj.PLAYER2;
            }
          }
        }
      }

     // for setting card ranking

      if (
        mainGameCard.player1Cards[0] == side1CardsNames[0] &&
        mainGameCard.player1Cards[1] == side1CardsNames[1] &&
        mainGameCard.player1Cards[2] == side1CardsNames[2]
      ) {
        mainGameCard.player1CardsRanking=side1cardsRanking
        mainGameCard.player2CardsRanking=side2cardsRanking
      }else{
        mainGameCard.player1CardsRanking=side2cardsRanking
        mainGameCard.player2CardsRanking=side1cardsRanking
      }
      //game history logic
      let winValue =
        mainGameCard.winstatus == WinStatusObj.PLAYER1 ? "P1" : "P2";
      gameHistoryData(winValue, TeenPattiWebGameHistory);

      await mainGameCard.save();
      console.log("maincard", mainGameCard);
      // })
    }
  } catch (error) {
    console.log({ msg: "error in gamehandlerfunction-", error: error });
  }
};


module.exports = { MainGameIdGenerator, gameCardHandler, cardID };
