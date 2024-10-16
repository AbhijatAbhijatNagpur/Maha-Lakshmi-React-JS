const mongoose = require("mongoose");

const userMasterSchema = new mongoose.Schema(
  {
    coins: { type: Number },
   
  },
  { versionKey: false },
  { timestamps: true }
);

const UserMaster = mongoose.model('UserMaster', userMasterSchema);

module.exports = { UserMaster };
