var express = require("express");
var router = express.Router();

router.post("/predict", async function (req, res) {
  try {
    console.log(req.body);
    const response = await fetch(`http://127.0.0.1:5007/predictjson`, {
      method: "POST",
      body: JSON.stringify(req.body.formValues),
    });
    const data = await response.json();
    console.log(data)

    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error getting climate updates" });
  }
});

module.exports = router;
