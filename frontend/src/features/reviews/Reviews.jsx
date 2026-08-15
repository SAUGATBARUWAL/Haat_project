import { useEffect, useState } from "react";
import { Star, User } from "lucide-react";
import api from "../../utils/api";
import ReviewForm from "./ReviewForm";

export default function Reviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // LOAD REVIEWS

  useEffect(() => {
    if (!productId) return;

    let cancelled = false;

    setLoading(true);
    setError("");

    api
      .get("/reviews/", {
        params: {
          product: productId,
        },
      })
      .then((res) => {
        if (cancelled) return;

        setReviews(res.data);
      })
      .catch((err) => {
        if (cancelled) return;

        console.error(
          "Failed to load reviews:",
          err.response?.data || err
        );

        setError("Could not load reviews.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  // ==============================
  // CALCULATE AVERAGE
  // ==============================

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, review) => total + Number(review.rating),
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  // ==============================
  // STAR DISPLAY
  // ==============================

  function renderStars(rating, size = 16) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={
              star <= Number(rating)
                ? "text-yellow-400"
                : "text-gray-300"
            }
            fill={
              star <= Number(rating)
                ? "currentColor"
                : "none"
            }
          />
        ))}
      </div>
    );
  }

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <div className="py-6 text-center text-gray-500">
        Loading reviews...
      </div>
    );
  }

  // ==============================
  // ERROR
  // ==============================

  if (error) {
    return (
      <div className="py-6 text-center text-red-500">
        {error}
      </div>
    );
  }

  // ==============================
  // MAIN UI
  // ==============================

  return (
    <section className="mt-8 border-t border-gray-200 pt-6">

      {/* ==============================
          HEADER
      ============================== */}

      <div className="flex items-center justify-between mb-6">

        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Customer Reviews
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            {reviews.length}{" "}
            {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Average rating */}

        <div className="flex items-center gap-3">

          <div className="text-3xl font-bold text-gray-900">
            {averageRating}
          </div>

          <div>
            {renderStars(Number(averageRating), 18)}

            <p className="text-xs text-gray-500 mt-1">
              out of 5
            </p>
          </div>

        </div>
      </div>

      {/* ==============================
          NO REVIEWS
      ============================== */}

      {reviews.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-xl py-10 text-center">

          <Star
            size={32}
            className="mx-auto text-gray-300"
          />

          <p className="mt-3 font-medium text-gray-600">
            No reviews yet
          </p>

          <p className="text-sm text-gray-400 mt-1">
            Be the first customer to review this product.
          </p>

        </div>
      ) : (

        /* ==============================
           REVIEW LIST
        ============================== */

        <div className="space-y-5">

          {reviews.map((review) => (

            <div
              key={review.id}
              className="border-b border-gray-100 pb-5"
            >

              {/* User */}

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <User
                      size={18}
                      className="text-gray-500"
                    />
                  </div>

                  <div>

                    <p className="font-medium text-gray-900">
                      {review.username}
                    </p>

                    <p className="text-xs text-gray-400">
                      {new Date(
                        review.created_at
                      ).toLocaleDateString()}
                    </p>

                  </div>

                </div>

                {/* Rating */}

                {renderStars(review.rating)}

              </div>

              {/* Comment */}

              <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                {review.comment}
              </p>

            </div>

          ))}

        </div>
      )}
      {/* Review Form */}
      <ReviewForm
        productId={productId}
        onReviewCreated={(newReview) => {
          setReviews((currentReviews) => [
            newReview,
            ...currentReviews,
          ]);
        }}
      />
    </section>
  );
}