const ProductFilters = ({
  currentCategory,
  sort,
  size,
  subCategory,
  setSort,
  setPage,
  setSize,
  setSubCategory = () => {},
  setMinPrice,
  setMaxPrice,
}) => {
  const subCategoryMap = {
    Men: ["T-Shirt", "Hoodie", "Shirt", "Jeans", "Joggers"],
    Women: ["T-Shirt", "Kurti", "Frock", "Top", "Jeans", "Leggings"],
    Kids: ["T-Shirt", "Shorts", "Frock", "Dress", "Pajamas"],
    Anime: ["T-Shirt", "Hoodie"],
  };

  const formattedCategory = currentCategory
    ? currentCategory.charAt(0).toUpperCase() +
      currentCategory.slice(1).toLowerCase()
    : "";

  const currentOptions = subCategoryMap[formattedCategory] || [];
  // Is any filter currently active?
  const isFilterApplied = sort !== "" || size !== "" || subCategory !== "";
  const handleReset = () => {
    setSort("");
    setPage(1);
    setSize("");
    setSubCategory("");
    setMinPrice("");
    setMaxPrice("");
    // This resets the dropdown visuals to the first option
    document
      .querySelectorAll("select")
      .forEach((select) => (select.value = ""));
  };

  return (
    <div className="flex flex-wrap justify-between items-center mb-10 gap-4">
      <div className="flex flex-wrap gap-3 w-full md:w-auto">
        {/* Sort Dropdown */}
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className="border border-gray-100 px-4 py-2 rounded-lg text-sm font-medium outline-none focus:border-black transition"
        >
          <option value="">Sort By</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>

        <select
          value={subCategory}
          onChange={(e) => {
            setSubCategory(e.target.value);
            setPage(1);
          }}
          className="border border-gray-100 px-4 py-2 rounded-lg text-sm font-medium outline-none focus:border-black transition"
        >
          <option value="">All {"Items"}</option>
          {currentOptions.map((option) => (
            <option key={option} value={option}>
              {option.endsWith("s") ? option : `${option}s`}
            </option>
          ))}
        </select>

        {/* Size Filter */}
        <select
          value={size}
          onChange={(e) => {
            setSize(e.target.value);
            setPage(1);
          }}
          className="border border-gray-100 px-4 py-2 rounded-lg text-sm font-medium outline-none focus:border-black transition"
        >
          <option value="">All Sizes</option>
          {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {isFilterApplied && (
          <button
            onClick={handleReset}
            className="px-4 py-2 text-xs font-black uppercase tracking-widest text-red-600 hover:bg-red-50 rounded-lg transition border border-red-100"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;
