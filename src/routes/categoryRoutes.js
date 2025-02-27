const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categoryController");
const clientAuthMiddleware = require("../middlewares/clientAuthMiddleware");
const upload = require("../middlewares/multerMiddleware");

router.post(
  "/categories",
  clientAuthMiddleware,
  upload.single("icon"),
  categoryController.createCategory
);

router.get("/categories", categoryController.getAllCategories);

router.get("/categories/:id", categoryController.getCategoryById);

router.put(
  "/categories/:id",
  clientAuthMiddleware,
  upload.single("icon"),
  categoryController.updateCategory
);

router.delete(
  "/categories/:id",
  clientAuthMiddleware,
  categoryController.deleteCategory
);

module.exports = router;
