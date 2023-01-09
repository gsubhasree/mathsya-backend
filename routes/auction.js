const express = require("express");
const router = express.Router();
const Auction = require("../models/Auction");
const blockchain = require("../utils/blockchain");

// Create an auction for a particular product
router.post("/:productId", async (req, res) => {
  const { productId } = req.params;
  const { minPrice } = req.body;

  try {
    const product = JSON.parse(
      (
        await blockchain.getProduct(
          { email: req.user.email },
          parseInt(productId)
        )
      ).toString()
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.owner.email !== req.user.email) {
      return res
        .status(403)
        .json({ message: "You are not the owner of this product" });
    }
    await blockchain.putProductInAuction(
      { email: req.user.email },
      parseInt(productId)
    );
    const auction = new Auction({
      product: product.id,
      minPrice,
    });
    await auction.save();
    res.json(auction);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Place a bid on an auction
router.post("/bid/:productId", async (req, res) => {
  const { productId } = req.params;
  const { bidAmount, location } = req.body;
  const user = req.user;

  try {
    const auction = await Auction.findOne({ product: productId }).populate(
      "bids.bidder"
    );
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }
    auction.bids.push({ bidder: user, bidAmount, location });
    await auction.save();
    res.json(auction);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Close an auction and update the product and its history
router.post("/close/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    const auction = await Auction.findOne({ product: productId }).populate(
      "bids.bidder"
    );
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    const winningBid = Math.max(...auction.bids.map((bid) => bid.bidAmount));
    const winner = auction.bids.find((bid) => bid.bidAmount === winningBid);

    // Update the product
    await blockchain.transferProduct(
      { email: winner.bidder.email },
      parseInt(auction.product),
      {
        location: winner.location,
        cost: winningBid,
      }
    );

    await auction.delete();

    res.json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Products in auction whose owner is not the current user
router.get("/", async (req, res) => {
  try {
    const products = JSON.parse(
      (
        await blockchain.getProductsInAuction({
          email: req.user.email,
        })
      ).toString()
    );
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
