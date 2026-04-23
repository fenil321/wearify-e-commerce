const AdminPagination = ({ currentPage, totalPages, setPage }) => {
  // Don't show if there's only one page or no data
  if (totalPages <= 1) return null;

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex gap-4 items-center justify-center my-10 ">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
      >
        Prev
      </button>

      <span className="font-bold text-xs uppercase tracking-tighter text-gray-500">
        Page <span className="text-black">{currentPage}</span> of {totalPages}
      </span>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
      >
        Next
      </button>
    </div>
  );
};

export default AdminPagination;
