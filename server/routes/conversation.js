const express = require("express");
const router = express.Router();
const ConversationController = require("../controller/conversation");

router.post("/new-con", ConversationController.newCon);
router.get("/user-con", ConversationController.userCon);


module.exports = router;