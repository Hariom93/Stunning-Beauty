class APIFeatures {
  constructor(query, queryStr) {
    this.query = query; // mongoose query object (e.g. Product.find())
    this.queryStr = queryStr; // request query params (e.g. req.query)
  }

  // Text search on query string keywords
  search() {
    if (this.queryStr.keyword) {
      const keyword = this.queryStr.keyword.trim();
      const searchObj = {
        $or: [
          { title: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
          { tags: { $in: [new RegExp(keyword, 'i')] } }
        ]
      };
      this.query = this.query.find(searchObj);
    }
    return this;
  }

  // Field filtering (price range, ratings, categories, brands)
  filter() {
    const queryCopy = { ...this.queryStr };

    // Removing fields that aren't database properties
    const removeFields = ['keyword', 'sort', 'page', 'limit', 'fields'];
    removeFields.forEach((key) => delete queryCopy[key]);

    // Handle nested filters / range operators (e.g., price[gte]=100)
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

    const parsedQuery = JSON.parse(queryStr);

    // Convert category/brand comma separated strings into array arrays for $in operations
    if (parsedQuery.category && typeof parsedQuery.category === 'string') {
      parsedQuery.category = { $in: parsedQuery.category.split(',') };
    }
    if (parsedQuery.brand && typeof parsedQuery.brand === 'string') {
      parsedQuery.brand = { $in: parsedQuery.brand.split(',') };
    }

    this.query = this.query.find(parsedQuery);
    return this;
  }

  // Sorting results
  sort() {
    if (this.queryStr.sort) {
      // e.g., sort=price,-rating -> 'price -rating'
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // Default sort is newest first
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // Limiting columns/fields returned
  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // Paginating results
  paginate() {
    const page = parseInt(this.queryStr.page, 10) || 1;
    const limit = parseInt(this.queryStr.limit, 10) || 12;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default APIFeatures;
