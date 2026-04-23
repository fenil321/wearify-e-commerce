// utils/paginate.js

/**
 * Utility to handle Mongoose pagination
 * @param {Object} model - The Mongoose model to query
 * @param {Object} query - The search/filter criteria
 * @param {Number} page - Current page number
 * @param {Number} limit - Number of items per page
 * @param {String} populate - Fields to populate (optional)
 * @param {Object} sort - Sorting criteria (optional)
 */
export const getPaginatedData = async ({
  model,
  query = {},
  page = 1,
  limit = 10,
  populate = "",
  sort = { createdAt: -1 },
}) => {
  const skip = (page - 1) * limit;

  // Execute query and count total in parallel for better performance
  const [data, totalItems] = await Promise.all([
    model.find(query).populate(populate).sort(sort).skip(skip).limit(limit),
    model.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data,
    pagination: {
      totalItems,
      totalPages,
      currentPage: Number(page),
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};
