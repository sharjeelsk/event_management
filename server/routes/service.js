const express = require("express");
const router = express.Router();
const serviceController = require("../controller/service");

router.get("/all-service", serviceController.getAllServices);
router.get("/single-service", serviceController.getSingleService);
router.get("/user-service", serviceController.getUserService);

router.post("/create-service", serviceController.createService);
router.post("/update-service", serviceController.updateService);
router.post("/delete-service", serviceController.deleteService);

module.exports = router;