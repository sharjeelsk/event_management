const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin");


router.post("/signUp", adminController.signUp);
router.post("/logIn", adminController.logIn);


module.exports = router;