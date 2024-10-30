const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermission,
} = require("./../middlewares/authentication");
const roomController = require("./../controllers/roomController");

router.get("/get-all/:hotelId", roomController.getAllByHotelId);
router.get("/:roomId", roomController.getById);
router.patch(
  "/:roomId",
  [authenticateUser, authorizePermission("Admin", "Hotel")],
  roomController.update
);
router.delete(
  "/:roomId",
  [authenticateUser, authorizePermission("Admin", "Hotel")],
  roomController.destroy
);
router.post(
  "/create",
  [authenticateUser, authorizePermission("Admin", "Hotel")],
  roomController.create
);
router.post(
  "/upload-images",
  [authenticateUser, authorizePermission("Admin", "Hotel")],
  roomController.uploadImages
);
router.post(
  "/upload-logo",
  [authenticateUser, authorizePermission("Admin", "Hotel")],
  roomController.uploadLogo
);

module.exports = router;
