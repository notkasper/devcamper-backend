module.exports = (model, populate) => async (req, res, next) => {
  const reqQuery = { ...req.query };

  // fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];
  // loop over removeFields and delete them from the query
  removeFields.forEach(param => delete reqQuery[param]);

  let queryString = JSON.stringify(reqQuery);
  queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b()/g, match => `$${match}`);
  let query = model.find(JSON.parse(queryString));
  if (req.query.select) {
    const fields = req.query.select.replace(',', ' ');
    query = query.select(fields);
  }
  if (req.query.sort) {
    const sortBy = req.query.sort.replace(',', '');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }
  // pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();
  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  const results = await query;

  // Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  };

  next();
};
