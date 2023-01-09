const mongoose = require("mongoose");

const AuctionSchema = new mongoose.Schema({
  product: {
    type: Number,
    required: true,
    unique: true,
  },
  minPrice: {
    type: Number,
    required: true,
  },
  bids: [
    {
      bidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
      },
      bidAmount: {
        type: Number,
        required: true,
      },
      location: {
        type: String,
        required: true,
      },
    },
  ],
});

const Auction = mongoose.model("Auction", AuctionSchema);

module.exports = Auction;
