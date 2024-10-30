const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./../errors");
const Category = require("./../models/CategoryModel");
const slugify = require("slugify");
const { queryHelper } = require("./../utils/index");

const create = async (req, res) => {
  const { name } = req.body;
  const slug = slugify(name, { lower: true });
  const category = await Category.create({ name, slug });

  res.status(StatusCodes.CREATED).json({ category });
};

const update = async (req, res) => {
  const { categoryId } = req.params;
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
  const {
    models: categories,
    total,
    page,
    limit,
  } = await queryHelper(
    req,
    Category,
    null,
    null,
    "-_id -createdAt -updatedAt"
  );

  if (!categories || categories.length === 0) {
    throw new CustomAPIError.NotFoundError("Does not have any category");
  }

  res.status(StatusCodes.OK).json({ total, page, limit, categories });
};

const getById = async (req, res) => {
  const { categoryId } = req.params;
  const category = await Category.findById({ _id: categoryId });
  res.status(StatusCodes.OK).json({ category });
};

const destroy = async (req, res) => {
  const { categoryId } = req.params;
  await Category.findByIdAndDelete({ _id: categoryId });
  res.status(StatusCodes.NO_CONTENT).json({ message: "Deleted successfully" });
};

module.exports = { create, update, destroy, getById, getAll };
