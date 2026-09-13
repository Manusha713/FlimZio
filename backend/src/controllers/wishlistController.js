const prisma = require('../config/db');

// Get all wishlist items
const getWishlist = async (req, res, next) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      orderBy: { addedAt: 'desc' },
    });
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

// Add a movie to wishlist
const addToWishlist = async (req, res, next) => {
  try {
    const { movieId, title, overview, posterUrl, backdropUrl, rating, releaseDate } = req.body;

    if (!movieId || !title) {
      return res.status(400).json({ success: false, message: 'movieId and title are required.' });
    }

    const newItem = await prisma.wishlistItem.upsert({
      where: { movieId: Number(movieId) },
      update: {},
      create: {
        movieId: Number(movieId),
        title,
        overview: overview || '',
        posterUrl: posterUrl || null,
        backdropUrl: backdropUrl || null,
        rating: rating ? Number(rating) : null,
        releaseDate: releaseDate || null,
      },
    });

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    next(error);
  }
};

// Remove a movie from wishlist
const removeFromWishlist = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    await prisma.wishlistItem.delete({
      where: { movieId: Number(movieId) },
    });

    res.json({ success: true, message: 'Movie removed from wishlist successfully.' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Movie not found in wishlist.' });
    }
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};