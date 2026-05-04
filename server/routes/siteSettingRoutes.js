const express = require("express");
const router = express.Router();
const siteSettingController = require("../controllers/siteSettingController");

// PUBLIC route - no auth
router.get("/public-settings", (req, res, next) => siteSettingController.getPublicSettings(req, res, next));

router.get("/", (req, res, next) => siteSettingController.getSettings(req, res, next));
router.post("/contact", (req, res, next) => siteSettingController.submitContactForm(req, res, next));

module.exports = router;
