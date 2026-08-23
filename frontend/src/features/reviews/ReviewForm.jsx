import { useState } from "react";
import { Star } from "lucide-react";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function ReviewForm({ productId, onReviewCreated }) {
  const { profile } = useAuth();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Only customers should be able to review
  if (!profile || profile.role !== "customer") {
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Validate rating
    if (rating < 1) {
      setError("Please select a rating.");
      return;
    }

    // Validate comment
    if (!comment.trim()) {
      setError("Please write a comment.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post("/reviews/", {product: productId,rating: rating,comment: comment.trim(),});

      console.log("REVIEW CREATED:", res.data);

      setSuccess("Your review has been submitted!");

      // Reset form
      setRating(0);
      setHoverRating(0);
      setComment("");

      // Tell Reviews.jsx that a new review was created
      if (onReviewCreated) {onReviewCreated(res.data);}
    } catch (err) {
      console.error(
        "CREATE REVIEW ERROR:",
        err.response?.data || err
      );

      const data = err.response?.data;

      if (data?.non_field_errors?.[0]) {
        setError(data.non_field_errors[0]);
      } else if (data?.detail) {
        setError(data.detail);
      } else if (data?.rating?.[0]) {
        setError(data.rating[0]);
      } else if (data?.comment?.[0]) {
        setError(data.comment[0]);
      } else {
        setError("Could not submit your review.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6 border border-gray-200 rounded-xl p-5 bg-gray-50">

      <h4 className="text-lg font-semibold text-gray-900">
        Write a Review
      </h4>

      {/* ================= RATING ================= */}

      <div className="mt-4">

        <p className="text-sm font-medium text-gray-700 mb-2">
          Your Rating
        </p>

        <div className="flex items-center gap-1">

          {[1, 2, 3, 4, 5].map((star) => (

            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1"
              aria-label={`Rate ${star} stars`}
            >
              <Star
                size={26}
                className={
                  star <= (hoverRating || rating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }
                fill={
                  star <= (hoverRating || rating)
                    ? "currentColor"
                    : "none"
                }
              />
            </button>

          ))}

          {rating > 0 && (
            <span className="text-sm text-gray-500 ml-2">
              {rating}/5
            </span>
          )}

        </div>
      </div>

      {/* ================= COMMENT ================= */}

      <div className="mt-4">

        <label
          htmlFor={`review-comment-${productId}`}
          className="text-sm font-medium text-gray-700"
        >
          Your Comment
        </label>

        <textarea
          id={`review-comment-${productId}`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
          className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none"
          disabled={submitting}
        />

      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* ================= SUCCESS ================= */}

      {success && (
        <p className="mt-3 text-sm text-green-600">
          {success}
        </p>
      )}

      {/* ================= SUBMIT ================= */}

      <button
        type="submit"
        disabled={submitting}
        onClick={handleSubmit}
        className="mt-4 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>

    </div>
  );
}