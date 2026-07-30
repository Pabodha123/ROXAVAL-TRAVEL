/**
 * Chainable query builder used by every "list" controller to provide
 * consistent filtering, searching, sorting, field-selection and pagination.
 *
 * Usage:
 *   const features = new ApiFeatures(Model.find(baseFilter), req.query)
 *     .search(['name', 'description'])
 *     .filter()
 *     .sort()
 *     .limitFields()
 *     .paginate();
 *   const docs = await features.query;
 *   const meta = await features.getMeta(Model, baseFilter);
 */
class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  search(searchableFields = []) {
    if (this.queryString.q && searchableFields.length) {
      const regex = new RegExp(this.queryString.q, 'i');
      this.query = this.query.find({
        $or: searchableFields.map((field) => ({ [field]: regex })),
      });
    }
    return this;
  }

  filter() {
    const excluded = ['page', 'sort', 'limit', 'fields', 'q'];
    const queryObj = { ...this.queryString };
    excluded.forEach((field) => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in|ne)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 20;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    this.pagination = { page, limit };
    return this;
  }

  async getMeta(Model, baseFilter = {}) {
    const total = await Model.countDocuments(baseFilter);
    const { page = 1, limit = 20 } = this.pagination || {};
    return {
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    };
  }
}

module.exports = ApiFeatures;
