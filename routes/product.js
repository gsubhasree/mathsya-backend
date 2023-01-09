const express = require("express");
const router = express.Router();
const blockchain = require("../utils/blockchain");

// Create a new product
router.post("/", async (req, res) => {
  const { name, quantity, location, cost } = req.body;
  const user = req.user;

  try {
    const product = await blockchain.addProduct(
      { email: user.email },
      { name, quantity, location, cost }
    );
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Get products owned by the current user
router.get("/owned/", async (req, res) => {
  try {
    const products = (await blockchain.getProductsOfOwner({
      email: req.user.email,
    })).toString();
    const productsJSON = JSON.parse(products);
    res.json(productsJSON);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

// Get products where the current user appears in the history
router.get("/history", async (req, res) => {
  try {
    const products = (await blockchain.getProductOfOwnerHistory({
      email: req.user.email,
    })).toString();
    const productsJSON = JSON.parse(products);
    res.json(productsJSON);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sell a product
router.post("/sell/:productId", async (req, res) => {
  const { productId } = req.params;
  const { location, cost } = req.body;
  try {
    await blockchain.sellProduct(
      { email: req.user.email },
      parseInt(productId),
      { location, cost }
    );
    res.json({ message: "Product sold successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get details of a product by ID
router.get("/:id", async (req, res) => {
  try {
    console.log(req.params.id, typeof req.params.id);
    const product = (await blockchain.getProduct(
      { email: req.user.email },
      parseInt(req.params.id)
    )).toString();
    const productJSON = JSON.parse(product);
    if (!productJSON) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(productJSON);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
