const express = require("express");
const router = express.Router();
const userContactController = require("../controller/userContact");
const { isAuthorized } = require("../middleware/reqAuth");


router.get("/all-userContact", isAuthorized, userContactController.getAllUserContact);
router.get("/single-userContact", isAuthorized, userContactController.getSingleUserContact);
router.post("/create-userContact", isAuthorized, userContactController.createUserContact);

router.post("/delete-group", isAuthorized, userContactController.deleteGroup);

module.exports = router;