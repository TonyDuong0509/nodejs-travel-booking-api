const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermission,
} = require("./../middlewares/authentication");
const hotelController = require("./../controllers/hotelController");

router.get("/get-all", hotelController.getAll);
router.get("/:hotelId", hotelController.getById);

router.post(
  "/edit-profile",
  [authenticateUser, authorizePermission("Admin", "Hotel")],
  hotelController.editProfile
);

module.exports = router;
