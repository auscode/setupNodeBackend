const Category = require("../models/category");
const { uploadSingleImageToCloudflare } = require("../utils/commonFunction");

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if the category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(409).json({
        status: 409,
        message: "Category already exists",
      });
    }

    // Upload icon to Cloudflare if file is provided
    let iconUrl = null;
    if (req.file) {
      iconUrl = await uploadSingleImageToCloudflare(req.file, "categories");
    }

    // Create and save the new category
    const newCategory = new Category({ name, description, icon: iconUrl });
    await newCategory.save();

    res.status(201).json({
      status: 201,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Server error while creating category",
    });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const categories = await Category.find()
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const totalCategories = await Category.countDocuments();

    res.status(200).json({
      status: 200,
      message:"success",
      data: {
        categories,
        currentPage: page,
        totalPages: Math.ceil(totalCategories / limit),
        totalCategories,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Server error while retrieving categories",
    });
  }
};


// Get a single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        status: 404,
        message: "Category not found",
      });
    }

    res.status(200).json({
      status:200,
      message: "success",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Server error while retrieving category",
    });
  }
};

// Update a category by ID
exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Upload new icon if provided
    let iconUrl = null;
    if (req.file) {
      iconUrl = await uploadSingleImageToCloudflare(req.file, "categories");
    }

    // Update the category fields
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, ...(iconUrl && { icon: iconUrl }) },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        status: 404,
        message: "Category not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Server error while updating category",
    });
  }
};

// Delete a category by ID
exports.deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if (!deletedCategory) {
      return res.status(404).json({
        status: 404,
        message: "Category not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Server error while deleting category",
    });
  }
};
