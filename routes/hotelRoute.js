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
router.post(
  "/upload-images",
  [authenticateUser, authorizePermission("Admin", "Hotel")],
  hotelController.uploadImages
);
router.post(
  "/upload-image-featured",
  [authenticateUser, authorizePermission("Admin", "Hotel")],
  hotelController.updateImageFeatured
);
router.post(
  "/upload-logo",
  [authenticateUser, authorizePermission("Admin", "Hotel")],
  hotelController.uploadLogo
);

module.exports = router;
