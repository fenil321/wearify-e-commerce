import React, { useState, useEffect, useContext } from "react";
import { Star, Camera, Trash2, Loader2 } from "lucide-react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";

const ReviewSection = ({ productId }) => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch reviews for this product
  const fetchReviews = async () => {
    try {
      const { data } = await API.get(`/api/reviews/${productId}`);
      setReviews(data.reviews);
    } catch (err) {
      console.error("Error fetching reviews", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error("Please select a star rating");

    const formData = new FormData();
    formData.append("rating", rating);
    formData.append("comment", comment);
    formData.append("productId", productId);
    images.forEach((img) => formData.append("reviewImages", img));

    try {
      setLoading(true);
      await API.post("/api/reviews", formData);
      toast.success("Review submitted! Thank you for your feedback.");
      setComment("");
      setRating(0);
      setImages([]);
      fetchReviews(); // Refresh list
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Only verified buyers can review",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;

    try {
      setLoading(true);
      await API.delete(`/api/reviews/${reviewId}`);
      toast.success("Review deleted successfully");
      fetchReviews(); // Refresh the list after deletion
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-16 border-t border-gray-100 pt-10">
      <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">
        Customer Reviews
      </h2>

      {user ? (
        <form
          onSubmit={handleSubmit}
          className="mb-12 bg-gray-50 p-6 rounded-2xl"
        >
          <p className="text-xs font-black uppercase mb-4">Rate this product</p>
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={24}
                className={`cursor-pointer transition ${rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>

          <textarea
            className="w-full p-4 border border-gray-200 rounded-xl text-sm focus:border-black outline-none transition h-32"
            placeholder="Share your experience with this item..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />

          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-200 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition">
              <Camera size={16} /> Add Photos
              <input
                type="file"
                multiple
                hidden
                accept="image/*"
                onChange={(e) => setImages(Array.from(e.target.files))}
              />
            </label>
            <span className="text-[10px] text-gray-400 font-bold uppercase">
              {images.length} files selected
            </span>
          </div>

          <button
            disabled={loading}
            className="mt-6 bg-black text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              "Submit Review"
            )}
          </button>
        </form>
      ) : (
        <div className="bg-gray-50 p-6 rounded-2xl mb-12 text-center text-xs font-bold text-gray-500 uppercase">
          Please login to leave a review
        </div>
      )}

      {/* Display Reviews */}
      <div className="space-y-8">
        {fetching ? (
          <Loader2 className="animate-spin mx-auto text-gray-300" />
        ) : reviews.length > 0 ? (
          reviews.map((rev) => (
            <div key={rev._id} className="border-b border-gray-50 pb-8">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-black text-sm uppercase">{rev.name}</p>
                  <div className="flex gap-0.5 my-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={
                          i < rev.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-200"
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <p className="text-[10px] text-gray-400 font-bold">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </p>

                  {user &&
                    rev.user &&
                    (user.id?.toString() === rev.user._id?.toString() ||
                      user.role === "admin") && (
                      <button
                        onClick={() => handleDelete(rev._id)}
                        className="text-red-400 hover:text-red-600 transition p-1"
                        title="Delete Review"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {rev.comment}
              </p>

              {/* Review Images */}
              {rev.reviewImages?.length > 0 && (
                <div className="flex gap-2 mt-4">
                  {rev.reviewImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.url}
                      alt="Review"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-100"
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 italic text-sm py-10">
            No reviews yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
