const express = require("express");
const { getAnimeSeries } = require("../controllers/animeSeriesController");

const router = express.Router();
router.get("/", getAnimeSeries);

module.exports = router;
