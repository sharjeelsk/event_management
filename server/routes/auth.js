const express = require("express");
const router = express.Router();
const authController = require("../controller/auth");
// const { loginCheck, isAuth, isAdmin } = require("../middleware/auth");

router.post("/sendOTP", authController.sendOTP);
router.post("/verifyOTP", authController.verifyOTP);

module.exports = router;
