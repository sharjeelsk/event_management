const express = require("express");
const router = express.Router();
const MessageController = require("../controller/message");
const { isAuthorized } = require("../middleware/reqAuth");


router.post("/add-msg", isAuthorized, MessageController.addMsg);
router.get("/get-msg", isAuthorized, MessageController.getMsg);

module.exports = router;