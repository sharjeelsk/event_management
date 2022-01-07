const express = require("express");
const router = express.Router();
const eventController = require("../controller/event");
const { isAuthorized } = require("../middleware/reqAuth");
const rateLimit = require('express-rate-limit')

const eventLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

router.get("/all-event", eventLimiter ,isAuthorized, eventController.getAllEvent);
router.post("/events-nearme", eventController.eventsNearMe);
router.post("/search-event", eventController.searchEvent);
router.get("/all-event-bids", isAuthorized, eventController.allEventBids);
router.post("/single-event", isAuthorized, eventController.getSingleEvent);
router.get("/user-event", isAuthorized, eventController.getUserEvents);

router.post("/create-event", isAuthorized, eventController.createEvent);
router.post("/update-event", isAuthorized, eventController.updateEvent);
router.post("/delete-event", isAuthorized, eventController.deleteEvent);

router.post("/join-event", isAuthorized, eventController.joinEvent);
router.post("/unsub-event", isAuthorized, eventController.unSubEvent);
router.get("/bided-event", isAuthorized, eventController.getBidedEvent);

module.exports = router;