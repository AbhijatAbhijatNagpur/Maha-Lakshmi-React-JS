const mongoose = require("mongoose");

const gameBetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId,ref: "UserMaster",default: null },
    game_id: { type: mongoose.Schema.Types.ObjectId, ref: "TeenPattiWebGameCard",default:null },
    teenPattiWebPlayer1bet: {
      betCoins: { type: Number, default: 0 },
    },
    teenPattiWebPlayer2bet: {
      betCoins: { type: Number, default: 0 },
    },
    pairPlus1bet: {
      betCoins: { type: Number, default: 0 },
    },
    pairPlus2bet: {
      betCoins: { type: Number, default: 0 },
    },
  },
  { versionKey: false },
  { timestamps: true }
);

const TeenPattiWebPlayerBet = mongoose.model('TeenPattiWebPlayerBet', gameBetSchema);

module.exports = { TeenPattiWebPlayerBet };
