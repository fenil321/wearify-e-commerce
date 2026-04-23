// components/Pagination.jsx
const Pagination = ({ page, setPage, totalProducts, limit = 8 }) => {
  const totalPages = Math.ceil(totalProducts / limit);
  const isLastPage = page >= totalPages;

  if (totalProducts === 0) return null;

  return (
    <div className="flex gap-4 items-center justify-center my-10">
      <button
        onClick={() => {
          setPage((prev) => Math.max(prev - 1, 1));
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        disabled={page === 1}
        className="px-4 py-2 bg-gray-200 rounded-lg text-sm font-bold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Prev
      </button>

      <span className="font-semibold text-sm">
        Page {page} of {totalPages || 1}
      </span>

      <button
        onClick={() => {
          setPage((prev) => prev + 1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        disabled={isLastPage}
        className="px-4 py-2 bg-gray-200 rounded-lg text-sm font-bold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
