const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermission,
} = require("./../middlewares/authentication");
const categoryController = require("./../controllers/categoryController");

router.get("/get-all", categoryController.getAll);
router.get("/:categoryId", categoryController.getById);
router.post(
  "/create",
  [authenticateUser, authorizePermission("Admin")],
  categoryController.create
);
router.patch(
  "/update/:categoryId",
  [authenticateUser, authorizePermission("Admin")],
  categoryController.update
);
router.delete(
  "/delete/:categoryId",
  [authenticateUser, authorizePermission("Admin")],
  categoryController.destroy
);

module.exports = router;
