const express = require("express");
const router = express.Router();
const MessageController = require("../controller/message");


router.post("/add-msg", MessageController.addMsg);
router.get("/get-msg", MessageController.getMsg);

module.exports = router;