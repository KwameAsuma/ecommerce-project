const prisma = require("../config/prisma");

// Submit a new review
exports.submitReview = async (req, res) => {
  try {
    const { merchantId, productId, rating, comment } = req.body;
    const reviewerId = req.user.id;

    if (!merchantId || !rating) {
      return res.status(400).json({ error: "Merchant ID and rating are required." });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5." });
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        reviewerId,
        merchantId: parseInt(merchantId),
        productId: productId ? parseInt(productId) : null,
        rating: parseInt(rating),
        comment,
      },
    });

    // Calculate new trust score for the merchant
    const allReviews = await prisma.review.findMany({
      where: { merchantId: parseInt(merchantId) },
    });

    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allReviews.length;
    
    // Scale 1-5 to 0-100. 5 stars = 100, 4 stars = 80, etc.
    const trustScore = Math.round(averageRating * 20);

    // Update merchant's trustScore
    await prisma.user.update({
      where: { id: parseInt(merchantId) },
      data: { trustScore },
    });

    res.status(201).json({ message: "Review submitted successfully", review, trustScore });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ error: "Failed to submit review" });
  }
};

// Get reviews for a merchant
exports.getMerchantReviews = async (req, res) => {
  try {
    const { merchantId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { merchantId: parseInt(merchantId) },
      include: {
        reviewer: {
          select: { id: true, name: true }
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? parseFloat((totalRating / reviews.length).toFixed(1)) : 0;

    res.status(200).json({ reviews, averageRating, totalCount: reviews.length });
  } catch (error) {
    console.error("Error fetching merchant reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await prisma.review.findMany({
            where: { productId: parseInt(productId) },
            include: {
                reviewer: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = reviews.length > 0 ? parseFloat((totalRating / reviews.length).toFixed(1)) : 0;

        res.status(200).json({ reviews, averageRating, totalCount: reviews.length });
    } catch (error) {
        console.error("Error fetching product reviews:", error);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
};
