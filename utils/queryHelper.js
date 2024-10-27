const queryHelper = async (
  req,
  Model,
  filterField,
  filterCondition = {},
  selectedFields = null,
  populateOptions = []
) => {
  const page = parseInt(req.query.page) - 1 || 0;
  const limit = parseInt(req.query.limit) || 5;
  const search = req.query.search || "";
  let sort = req.query.sort || "-createdAt";
  let roomType = req.query.roomType || "All";

  const fieldOptions = [
    "Standard",
    "Mid-range",
    "Luxury",
    "Family-friendly",
    "Business",
  ];

  roomType = roomType === "All" ? fieldOptions : req.query.roomType.split(",");
  sort = req.query.sort ? req.query.sort.split(",") : [sort];
  let sortBy = { [sort[0]]: sort[1] ? sort[1] : "asc" };

  const searchField = req.query.searchField || "name";

  let queryOptions = {
    ...(search && searchField
      ? {
          [searchField]: isNaN(search)
            ? { $regex: search, $options: "i" }
            : Number(search),
        }
      : {}),
    ...filterCondition,
  };

  if (filterField && roomType) {
    queryOptions[filterField] = { $in: roomType };
  }

  let query = Model.find(queryOptions)
    .sort(sortBy)
    .skip(page * limit)
    .limit(limit);

  if (selectedFields) query = query.select(selectedFields);
  if (populateOptions) {
    populateOptions.forEach((option) => query.populate(option));
  }

  const models = await query;
  const total = await Model.countDocuments(queryOptions);

  return { models, total, page: page + 1, limit };
};

module.exports = queryHelper;
