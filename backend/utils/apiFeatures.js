export const getProductFilters = (reqQuery) => {
  let queryStr = { ...reqQuery };
  const removeFields = [
    "page",
    "limit",
    "sort",
    "search",
    "minPrice",
    "maxPrice",
    "size",
    "isCustom",
  ];
  removeFields.forEach((field) => delete queryStr[field]);

  if (!reqQuery.category || reqQuery.category === "") delete queryStr.category;
  if (!reqQuery.subCategory || reqQuery.subCategory === "")
    delete queryStr.subCategory;

  if (reqQuery.category && reqQuery.category.trim() !== "") {
    queryStr.category = reqQuery.category;
  } else {
    delete queryStr.category;
  }

  if (reqQuery.subCategory && reqQuery.subCategory.trim() !== "") {
    queryStr.subCategory = reqQuery.subCategory;
  } else {
    delete queryStr.subCategory;
  }

  if (reqQuery.isCustom === "true") {
    queryStr["customization.isCustomizable"] = true;
  }

  if (reqQuery.size && reqQuery.size !== "") {
    queryStr["sizes.size"] = reqQuery.size;
  }

  if (reqQuery.minPrice || reqQuery.maxPrice) {
    const priceFilter = {};
    if (reqQuery.minPrice) priceFilter.$gte = Number(reqQuery.minPrice);
    if (reqQuery.maxPrice) priceFilter.$lte = Number(reqQuery.maxPrice);
    queryStr.sizes = { $elemMatch: { price: priceFilter } };
  }

  if (reqQuery.search && reqQuery.search.trim() !== "") {
    queryStr.name = { $regex: reqQuery.search.trim(), $options: "i" };
  }

  let sortOption = { createdAt: -1 };
  if (reqQuery.sort === "price_asc") {
    sortOption = { "sizes.price": 1 };
  } else if (reqQuery.sort === "price_desc") {
    sortOption = { "sizes.price": -1 };
  }

  return { queryStr, sortOption };
};

export const getRelatedFilters = (category, subCategory, productId) => {
  let queryStr = {
    //Exclude the current product
    _id: { $ne: productId },

    //MUST match the Category (e.g., Men)
    // AND MUST match the SubCategory (e.g., Tshirt)
    category: category,
    subCategory: subCategory,
  };

  // Sort by newest so the user sees fresh related items
  const sortOption = { createdAt: -1 };

  return { queryStr, sortOption };
};

export const getUpsellFilters = (product, limit = 4) => {
  return {
    queryStr: {
      _id: { $ne: product._id }, // Exclude current
      category: product.category, // Stay in 'Men' or 'Women'

      // OR logic: Show same subCategory (Related)
      // OR show specific "Upsell" categories (Cross-sell)
      $or: [
        { subCategory: product.subCategory }, // People also viewed this type
        { tags: { $in: product.tags } }, // Match by style tags (e.g., 'vintage', 'oversized')
        { subCategory: { $in: ["Jackets", "Pants", "Accessories"] } }, // Suggest an outfit
      ],
    },
    // Sort by price (descending) to show "Premium" items first (Upselling)
    // or by newest
    sortOption: { price: -1, createdAt: -1 },
  };
};
