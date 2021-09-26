const express = require("express");
const router = express.Router();
const eventController = require("../controller/event");

router.get("/all-event", eventController.getAllEvent);
router.get("/single-event", eventController.getSingleEvent);
router.get("/user-event", eventController.getUserEvents);

router.post("/create-event", eventController.createEvent);
router.post("/update-event", eventController.updateEvent);
router.post("/delete-event", eventController.deleteEvent);

router.post("/join-event", eventController.joinEvent);

module.exports = router;