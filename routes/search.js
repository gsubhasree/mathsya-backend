var express = require("express");
var router = express.Router();

router.post("/search", async function (req, res) {
  try {
    const { search } = req.body;
    console.log(search);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${search}&key=${process.env.REACT_APP_MAPS_API_KEY}`
    );
    const position = await response.json();
    const answer = await fetch(
      `https://nominatim.openstreetmap.org/search.php?q=${search}&polygon_geojson=1&format=json`
    );
    if (answer.status !== 200) {
      throw new Error("Error getting location");
    }
    let polygonCords = await answer.json()
    polygonCords = polygonCords.filter(function (data) {
      return (
        data.geojson.type === "MultiPolygon" || data.geojson.type === "Polygon"
      );
    });
    console.log(position, JSON.stringify(polygonCords[0].geojson.type));
    res.send({ position, polygonCords });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error getting location" });
  }
});

module.exports = router;
