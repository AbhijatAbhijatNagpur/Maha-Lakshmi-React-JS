const mongoose = require("mongoose");

const TeenPattiWebCardSchema = new mongoose.Schema(
  {
    gameid: { type: Number, default: null },
    player1_amount: { type: Number, default: 0 },
    player2_amount: { type: Number, default: 0 },
    pairPlus1_amount: { type: Number, default: 0 },
    pairPlus2_amount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    player1Cards: { type: Array, default: [] },
    player2Cards: { type: Array, default: [] },
    player1CardsRanking: { type: String, default: null },
    player2CardsRanking: { type: String, default: null },
    winstatus: { type: String, default: null },
  },
  { versionKey: false },
  { timestamps: true }
);

const TeenPattiWebGameCard = mongoose.model(
  "TeenPattiWebGameCard",
  TeenPattiWebCardSchema
);

module.exports = { TeenPattiWebGameCard };
