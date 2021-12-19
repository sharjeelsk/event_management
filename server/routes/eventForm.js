const express = require("express");
const eventController = require("../controller/event");
const router = express.Router();
const eventFormController = require("../controller/eventForm");
const { isAuthorized } = require("../middleware/reqAuth");

router.post("/get-eventForm", isAuthorized, eventFormController.getEventForm);
router.post("/create-eventForm", isAuthorized, eventFormController.postEventForm);
router.post("/event-feedbacks", isAuthorized, eventFormController.eventFeedbacks);

module.exports = router;