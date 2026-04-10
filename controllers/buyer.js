import User from "../models/User.js";
import Order from "../models/Order.js";
import ProductInquiry from "../models/ProductInquiry.js";

export const getBuyerAnalytics = async (req, res) => {
  try {
    const buyerId = req.user.id;

    // Verify user exists
    const buyer = await User.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all buyer's orders
    const orders = await Order.find({ ownerId: buyerId }).sort({ createdAt: -1 });

    // Calculate purchase statistics
    let totalSpent = 0;
    let totalItems = 0;
    const purchasesByMonth = {};
    const productCategories = {};

    orders.forEach(order => {
      totalSpent += order.order.totalPrice;
      order.order.items.forEach(item => {
        totalItems += item.quantity;
      });

      // Group by month
      const month = new Date(order.createdAt).toLocaleString('en-US', { month: 'short', year: 'numeric' });
      purchasesByMonth[month] = (purchasesByMonth[month] || 0) + 1;
    });

    // Get buyer's inquiries
    const inquiries = await ProductInquiry.find({ buyerId }).populate([
      { path: 'productId', select: 'name' },
      { path: 'sellerId', select: 'name.firstName name.lastName' }
    ]);

    const inquiryStats = {
      total: inquiries.length,
      open: inquiries.filter(i => i.status === 'open').length,
      resolved: inquiries.filter(i => i.status === 'resolved').length,
      closed: inquiries.filter(i => i.status === 'closed').length
    };

    // Recent purchases (last 5)
    const recentPurchases = orders.slice(0, 5).map(order => ({
      _id: order._id,
      date: order.createdAt,
      total: order.order.totalPrice,
      itemCount: order.order.items.length,
      items: order.order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.priceWhenBought
      }))
    }));

    // Recent inquiries (last 5)
    const recentInquiries = inquiries.slice(0, 5).map(inquiry => ({
      _id: inquiry._id,
      subject: inquiry.subject,
      productName: inquiry.productId?.name,
      sellerName: `${inquiry.sellerId?.name?.firstName} ${inquiry.sellerId?.name?.lastName}`,
      status: inquiry.status,
      messageCount: inquiry.messages?.length || 0,
      createdAt: inquiry.createdAt
    }));

    res.json({
      success: true,
      analytics: {
        overview: {
          totalOrders: orders.length,
          totalSpent: totalSpent.toFixed(2),
          totalItems,
          averageOrderValue: orders.length > 0 ? (totalSpent / orders.length).toFixed(2) : 0
        },
        inquiries: inquiryStats,
        recentPurchases,
        recentInquiries,
        purchasesTrend: purchasesByMonth
      }
    });
  } catch (error) {
    console.error('Error fetching buyer analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};

export const getBuyerOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const orders = await Order.find({ ownerId: buyerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments({ ownerId: buyerId });

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching buyer orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};
