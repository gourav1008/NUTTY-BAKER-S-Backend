import Portfolio from '../models/Portfolio.js';
import Testimonial from '../models/Testimonial.js';
import Contact from '../models/Contact.js';

// @desc    Get dashboard statistics
// @route   GET /api/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
  try {
    // Get counts
    const totalPortfolioItems = await Portfolio.countDocuments({ isActive: true });
    const totalTestimonials = await Testimonial.countDocuments({ isApproved: true });
    const totalContacts = await Contact.countDocuments();
    const newContacts = await Contact.countDocuments({ status: 'new' });

    // Get total views
    const portfolioItems = await Portfolio.find({ isActive: true });
    const totalViews = portfolioItems.reduce((sum, item) => sum + item.views, 0);

    // Get most viewed items
    const mostViewed = await Portfolio.find({ isActive: true })
      .sort({ views: -1 })
      .limit(5)
      .select('title views images category');

    // Get recent contacts
    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email occasionType status createdAt');

    // Get category distribution
    const categoryStats = await Portfolio.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get monthly contact trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyContacts = await Contact.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get testimonial stats
    const testimonialStats = {
      total: await Testimonial.countDocuments(),
      approved: await Testimonial.countDocuments({ isApproved: true }),
      pending: await Testimonial.countDocuments({ isApproved: false }),
      featured: await Testimonial.countDocuments({ featured: true })
    };

    // Calculate average rating
    const ratings = await Testimonial.find({ isApproved: true }).select('rating');
    const averageRating = ratings.length > 0
      ? (ratings.reduce((sum, t) => sum + t.rating, 0) / ratings.length).toFixed(1)
      : 0;

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalPortfolioItems,
          totalTestimonials,
          totalContacts,
          newContacts,
          totalViews,
          averageRating
        },
        mostViewed,
        recentContacts,
        categoryStats,
        monthlyContacts,
        testimonialStats
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get portfolio analytics
// @route   GET /api/stats/portfolio
// @access  Private/Admin
export const getPortfolioAnalytics = async (req, res) => {
  try {
    const totalItems = await Portfolio.countDocuments({ isActive: true });
    const featuredItems = await Portfolio.countDocuments({ featured: true, isActive: true });

    const categoryBreakdown = await Portfolio.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
          avgPrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const priceRanges = await Portfolio.aggregate([
      { $match: { isActive: true } },
      {
        $bucket: {
          groupBy: '$price',
          boundaries: [0, 50, 100, 200, 500, 1000, 10000],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            items: { $push: '$title' }
          }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalItems,
        featuredItems,
        categoryBreakdown,
        priceRanges
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
