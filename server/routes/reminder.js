const express = require("express");
const router = express.Router();
const reminderController= require("../controller/reminder");
const { isAuthorized } = require("../middleware/reqAuth");

router.get("/all-reminder", isAuthorized, reminderController.getAllReminder);
router.get("/user-reminder", isAuthorized, reminderController.getUserReminder);

module.exports = router;