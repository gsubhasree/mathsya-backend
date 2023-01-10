var express = require("express");
var router = express.Router();

router.post("/getCoordinateClimate", async function (req, res) {
  try {
    const { coordinates } = req.body;
    const { lat, lng } = coordinates;
    console.log(lat, lng);
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${process.env.OPEN_WEATHER_API_KEY}`
    );
    console.log("be response", response);
    const data = await response.json();

    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error getting climate updates" });
  }
});

module.exports = router;
