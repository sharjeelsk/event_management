const express = require("express");
const router = express.Router();
const serviceController = require("../controller/service");
const { isAuthorized } = require("../middleware/reqAuth");
const { isAdmin } = require("../middleware/reqAuthAdmin");

router.get("/all-service", isAuthorized, serviceController.getAllServices);
router.get("/single-service", isAuthorized, serviceController.getSingleService);
router.get("/user-service", isAuthorized, serviceController.getUserService);

router.post("/create-service", isAuthorized, serviceController.createService);
router.post("/update-service", isAuthorized, serviceController.updateService);
router.post("/delete-service", isAuthorized, serviceController.deleteService);

router.post("/admin-createService", isAdmin, serviceController.AdminCreateService);

module.exports = router;