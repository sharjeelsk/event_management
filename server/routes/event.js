const express = require("express");
const router = express.Router();
const eventController = require("../controller/event");
const { isAuthorized } = require("../middleware/reqAuth");

router.get("/all-event", isAuthorized, eventController.getAllEvent);
router.post("/single-event", isAuthorized, eventController.getSingleEvent);
router.get("/user-event", isAuthorized, eventController.getUserEvents);

router.post("/create-event", isAuthorized, eventController.createEvent);
router.post("/update-event", isAuthorized, eventController.updateEvent);
router.post("/delete-event", isAuthorized, eventController.deleteEvent);

router.post("/join-event", isAuthorized, eventController.joinEvent);
router.post("/unsub-event", isAuthorized, eventController.unSubEvent);
router.get("/bided-event", isAuthorized, eventController.getBidedEvent);

module.exports = router;