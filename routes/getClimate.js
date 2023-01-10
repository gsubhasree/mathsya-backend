var express = require("express");
var router = express.Router();

router.post("/getClimate", async function (req, res) {
  try {
    const { location } = req.body;
    console.log(location);
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPEN_WEATHER_API_KEY}`);
    const data = await response.json();

    res.send(data);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Error getting climate updates" });    
    }
});



module.exports = router;