const express = require("express");
const router = express.Router();
const ConversationController = require("../controller/conversation");
const { isAuthorized } = require("../middleware/reqAuth");

router.post("/new-con", isAuthorized, ConversationController.newCon);
router.get("/user-con", isAuthorized, ConversationController.userCon);


module.exports = router;