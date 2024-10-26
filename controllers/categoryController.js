const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./../errors");
const Category = require("./../models/CategoryModel");
const slugify = require("slugify");
const { validateMongoId } = require("./../utils/index");

const create = async (req, res) => {
  const { name } = req.body;
  const slug = slugify(name, { lower: true });
  const category = await Category.create({ name, slug });

  res.status(StatusCodes.CREATED).json({ category });
};

const update = async (req, res) => {
  const { categoryId } = req.params;
  validateMongoId(categoryId);
  const { name } = req.body;
  const slug = slugify(name);
  const category = await Category.findByIdAndUpdate(
    { _id: categoryId },
    { name: name, slug: slug },
    { new: true }
  );

  res.status(StatusCodes.OK).json({ category });
};

const getAll = async (req, res) => {
  const categories = await Category.find();
  res.status(StatusCodes.OK).json({ categories });
};

const getById = async (req, res) => {
  const { categoryId } = req.params;
  validateMongoId(categoryId);
  const category = await Category.findById({ _id: categoryId });
  res.status(StatusCodes.OK).json({ category });
};

const destroy = async (req, res) => {
  const { categoryId } = req.params;
  validateMongoId(categoryId);
  await Category.findByIdAndDelete({ _id: categoryId });
  res.status(StatusCodes.NO_CONTENT).json({ message: "Deleted successfully" });
};

module.exports = { create, update, destroy, getById, getAll };
