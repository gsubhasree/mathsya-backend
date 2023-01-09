var express = require("express");
var router = express.Router();

router.post("/search", async function (req, res) {
  try {
    const { search } = req.body;
    console.log(search);
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${search}&key=${process.env.REACT_APP_MAPS_API_KEY}`);
    const data = await response.json();
    res.send(data);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Error getting location" });    
    }
});



module.exports = router;