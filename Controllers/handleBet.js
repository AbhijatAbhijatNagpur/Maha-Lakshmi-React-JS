const { BetTypeObj, WinStatusObj } = require("../Constants/constants");
const {
  TeenPattiWebPlayerBet,
} = require("../models/TeenPattiWeb.GameBet.model");
const { UserMaster } = require("../models/gameuser.model");
const { TeenPattiWebGameCard } = require("../models/maingame.model");

const handlebet = (userId, socket) => {
  socket.on("bet", async (data) => {
    const { betType, coins, cardId } = data;
    // console.log("betData", cardId);
    try {
      const user = await UserMaster.findOne({ _id: userId });
      if (!user) {
        console.log({ msg: "user not found" });
        return;
      }
      if (user.coins <= 0 || coins <= 0 || user.coins - coins < 0) {
        console.log({ msg: "insufficient balance" });
        socket.emit("noBet", { msg: "Insufficient Balance" });
        return;
      }
      if (!cardId) {
        console.log({ msg: "cardId required" });
        return;
      }
      const gameCard = await TeenPattiWebGameCard.findById(cardId);
      if (!gameCard) {
        console.log({ msg: "gameCard not found" });
        return;
      }
      let userbet = await TeenPattiWebPlayerBet.findOne({ userId });
      if (!userbet) {
        userbet = new TeenPattiWebPlayerBet({
          userId: userId,
          game_id: gameCard._id,
        });
      }
      switch (betType) {
        case BetTypeObj.PLAYER1:
          userbet.teenPattiWebPlayer1bet.betCoins += parseInt(coins);
          gameCard.player1_amount += parseInt(coins);
          break;

        case BetTypeObj.PLAYER2:
          userbet.teenPattiWebPlayer2bet.betCoins += parseInt(coins);
          gameCard.player2_amount += parseInt(coins);
          break;

        case BetTypeObj.PAIRPLUS1:
          userbet.pairPlus1bet.betCoins += parseInt(coins);
          gameCard.pairPlus1_amount += parseInt(coins);
          break;

        case BetTypeObj.PAIRPLUS2:
          userbet.pairPlus2bet.betCoins += parseInt(coins);
          gameCard.pairPlus2_amount += parseInt(coins);
          break;

        default:
          break;
      }
      if (
        betType == BetTypeObj.PLAYER1 ||
        betType == BetTypeObj.PLAYER2 ||
        betType == BetTypeObj.PAIRPLUS1 ||
        betType == BetTypeObj.PAIRPLUS2
      ) {
        user.coins -= parseInt(coins);
      }

      // add main card id to user ref

      userbet.game_id = gameCard._id;
      gameCard.total = gameCard.player2_amount + gameCard.player1_amount;

      await gameCard.save();
      await user.save();
      await userbet.save();
      socket.emit("userDetails", { user });
    } catch (error) {
      console.log({ msg: "error in bet section", error: error.message });
    }
  });
};

// -------------->>>
// bet win functions
// -------------->>>
const TeenPattiWebBetWinHnadlers = (gameId) => {
  const handleUserCoins = async (gameBetType, gameId) => {
    try {
      const users = await TeenPattiWebPlayerBet.find({
        game_id: gameId,
      }).populate("userId");
      
      if (users.length <= 0) {
        console.log({ msg: "user not found" });
        return;
      }
      
      for (const user of users) {
        const gameBetCoins =
        gameBetType == "teenPattiWebPlayer1bet"
        ? user.teenPattiWebPlayer1bet.betCoins
        : user.teenPattiWebPlayer2bet.betCoins;
        
        // const updatedCoins = user.coins + gameBetCoins * 1.98;
        const updatedCoins = (user.userId.coins + gameBetCoins * 1.98).toFixed(2);
        
        console.log("mainUser",updatedCoins);
        // Update the coins field in the user document
        await UserMaster.updateOne(
          { _id: user.userId._id },
          {
            $set: {
              coins: updatedCoins,
            },
          }
        );
        user.teenPattiWebPlayer1bet.betCoins = 0;
        user.teenPattiWebPlayer2bet.betCoins = 0;

        await user.save();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const mainbetWinHandler = async (gameId) => {
    try {
      const gameCard = await TeenPattiWebGameCard.findById(gameId);
      if (gameCard.winstatus == WinStatusObj.PLAYER1) {
        handleUserCoins("teenPattiWebPlayer1bet", gameId);
      } else if (gameCard.winstatus == WinStatusObj.PLAYER2) {
        handleUserCoins("teenPattiWebPlayer2bet", gameId);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // -------------------->>>>
  // pair Plus bet Win functions
  // -------------------->>>>

  const handlePairPlusBaitUserCoins = async (
    gameBetType,
    gameId,
    multiplier
  ) => {
    try {
      const users = await TeenPattiWebPlayerBet.find({
        game_id: gameId,
      }).populate("userId");
      if (users.length > 0) {

        for (const user of users) {

          if (multiplier > 0) {
            const updatedCoins = (user.userId.coins +user[gameBetType].betCoins * multiplier).toFixed(2);
              // Update the coins field in the user document
              console.log("pairUser",updatedCoins);
            await UserMaster.updateOne(
              { _id: user.userId._id },
              {
                $set: {
                  coins: updatedCoins,
                },
              }
            );
          }
          user[gameBetType].betCoins = 0;

          await user.save();
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  };
  //--------->

  const pairPlusbetWinHandler = async (gameId) => {
    try {
      const gameCard = await TeenPattiWebGameCard.findById(gameId);

      // async written here for reason dont remove it
      const pairPlus1CoinsUpdate = async () => {
        if (gameCard.player1CardsRanking > 0) {
          await handlePairPlusBaitUserCoins(
            "pairPlus1bet",
            gameId,
            2
          );
        } else {
          await handlePairPlusBaitUserCoins(
            "pairPlus1bet",
            gameId,
            0
          );
        }
      };

      // async written here for reason dont remove it
      const pairPlus2CoinsUpdate = async () => {
        if (gameCard.player2CardsRanking > 0) {
          await handlePairPlusBaitUserCoins(
            "pairPlus2bet",
            gameId,
            2
          );
        } else {
          await handlePairPlusBaitUserCoins(
            "pairPlus2bet",
            gameId,
            0
          );
        }
      };
      //  function executing here
      pairPlus1CoinsUpdate().then(() => pairPlus2CoinsUpdate());
    } catch (error) {
      throw new Error(error);
    }
  };
  mainbetWinHandler(gameId).then(() => pairPlusbetWinHandler(gameId));
};
 
// functions executing here

module.exports = { handlebet, TeenPattiWebBetWinHnadlers };
