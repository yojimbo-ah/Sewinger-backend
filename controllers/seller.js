import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import ProductInquiry from "../models/ProductInquiry.js";

const getProductAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    // Verify user is seller/admin
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    if (user.power !== 'seller' && user.power !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get all buyers for this product
    const orders = await Order.find({
      'order.items.itemId': productId
    }).populate('ownerId', 'name email bio.profileImage');

    const buyers = [];
    const uniqueBuyerIds = new Set();
    let totalSales = 0;
    let totalQuantity = 0;

    orders.forEach(order => {
      order.order.items.forEach(item => {
        if (item.itemId.toString() === productId) {
          totalSales += item.priceWhenBought * item.quantity;
          totalQuantity += item.quantity;
          uniqueBuyerIds.add(order.ownerId._id.toString());
          buyers.push({
            buyerId: order.ownerId._id,
            buyerName: order.ownerId.name,
            buyerEmail: order.ownerId.email,
            buyerImage: order.ownerId.bio?.profileImage,
            quantity: item.quantity,
            pricePerUnit: item.priceWhenBought,
            totalPrice: item.priceWhenBought * item.quantity,
            purchaseDate: order.createdAt
          });
        }
      });
    });

    // Get inquiries for this product
    const inquiries = await ProductInquiry.find({
      productId,
      sellerId: userId
    }).populate([
      { path: 'buyerId', select: 'name email bio.profileImage' },
      { path: 'productId', select: 'name' }
    ]);

    const inquiryStats = {
      total: inquiries.length,
      open: inquiries.filter(i => i.status === 'open').length,
      resolved: inquiries.filter(i => i.status === 'resolved').length,
      closed: inquiries.filter(i => i.status === 'closed').length
    };

    res.json({
      success: true,
      analytics: {
        product: {
          id: product._id,
          name: product.name,
          image: product.images?.mainImage,
          price: product.price,
          available: product.availbleItems
        },
        sales: {
          totalRevenue: totalSales,
          totalUnitsSold: totalQuantity,
          totalBuyers: uniqueBuyerIds.size,
          averagePerBuyer: uniqueBuyerIds.size > 0 ? (totalSales / uniqueBuyerIds.size).toFixed(2) : 0
        },
        inquiries: inquiryStats,
        buyers: buyers.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)),
        inquiryDetails: inquiries
      }
    });
  } catch (error) {
    console.error('Error fetching product analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};

const getUsersWhoBoughtMyProduct = async (req , res , next) => {
    const userId = req.user.id ;
    const productId = req.params.productId ;
    
    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(200).json({message : 'Couldnt find user'}) ;
        }

        if (user.power !== 'seller' && user.power !== 'admin') {
            return res.status({message : 'This user is not allowed as admin or seller'}) ;
        }

        const userIds = await Order.distinct('ownerId', {
            'order.items.itemId': productId
        }); 

        const usersPromise = userIds.map(async(userId) => {
            const buyer = await User.findById(userId) ;
            if (!buyer) {
                throw new Error ('Couldnt find the buyer try again later') ;
            }

            return {
                _id : buyer._id ,
                name : buyer.name ,
                bio : buyer.bio ,
                email : buyer.email
            }
        })
        const users = await Promise.all(usersPromise) ;

        console.log(userIds) ;
        return res.status(200).json({users : users}) ;
    } catch (error) {
        console.log(error) ;
        return res.status(500).json({message : 'Iternal server error'}) ;
    }
}

const getUserWhoBoughtMyProduct = async (req , res , next) => {
    const userId = req.user.id ;
    const buyerId = req.params.buyerId ;
    const productId = req.params.productId ;

    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'Couldnt find user'}) ;
        }

        const buyer = await User.findById(buyerId) ;
        if (!buyer) {
            return res.status(400).json({message : 'Couldnt find buyer'}) ;
        }

        if (user.power !== 'admin' && user.power !== 'seller') {
            return res.status(400).json({message : 'You are now allowed in this page'}) ;
        }

        const orderUser = await Order.findOne({
            ownerId: buyerId,
            'order.items.itemId': productId  
        });
        let productOrder ;
        orderUser.order.items.forEach((orderItem) => {
            if (orderItem.itemId.toString() === productId) {
                productOrder = orderItem ;
                return true ;
            }
        })

        if (!orderUser) {
            return res.status(400).json({message : 'Couldnt find the user'}) ;
        }

        return res.status(200).json({orderUser : productOrder , buyerDetails : {
            name : buyer.name ,
            _id : buyer._id ,
            email : buyer.email ,
            bio : buyer.bio

        }}) ;

    } catch (error) {
        console.log(error) ;
        return res.status(500).json({message : 'Iternal server error'}) ;
    }

}

const getAllSellerAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Verify user is seller/admin
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    if (user.power !== 'seller' && user.power !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get all seller's products
    const products = await Product.find({ creatorId: userId });

    if (products.length === 0) {
      return res.json({
        success: true,
        analytics: {
          overview: {
            totalProducts: 0,
            totalRevenue: 0,
            totalUnitsSold: 0,
            totalBuyers: 0,
            averageRevenuePerProduct: 0
          },
          inquiries: {
            total: 0,
            open: 0,
            resolved: 0,
            closed: 0
          },
          products: []
        }
      });
    }

    let aggregatedRevenue = 0;
    let aggregatedUnitsSold = 0;
    const allBuyerIds = new Set();
    const productAnalytics = [];
    let totalInquiries = 0;
    let openInquiries = 0;
    let resolvedInquiries = 0;
    let closedInquiries = 0;

    // Process each product
    for (const product of products) {
      // Get orders for this product
      const orders = await Order.find({
        'order.items.itemId': product._id.toString()
      }).populate('ownerId', 'name email bio.profileImage');

      let productRevenue = 0;
      let productUnitsSold = 0;
      const productBuyerIds = new Set();

      orders.forEach(order => {
        order.order.items.forEach(item => {
          if (item.itemId.toString() === product._id.toString()) {
            productRevenue += item.priceWhenBought * item.quantity;
            productUnitsSold += item.quantity;
            productBuyerIds.add(order.ownerId._id.toString());
            allBuyerIds.add(order.ownerId._id.toString());
          }
        });
      });

      // Get inquiries for this product
      const inquiries = await ProductInquiry.find({
        productId: product._id,
        sellerId: userId
      });

      const openCount = inquiries.filter(i => i.status === 'open').length;
      const resolvedCount = inquiries.filter(i => i.status === 'resolved').length;
      const closedCount = inquiries.filter(i => i.status === 'closed').length;

      totalInquiries += inquiries.length;
      openInquiries += openCount;
      resolvedInquiries += resolvedCount;
      closedInquiries += closedCount;

      aggregatedRevenue += productRevenue;
      aggregatedUnitsSold += productUnitsSold;

      productAnalytics.push({
        productId: product._id,
        productName: product.name,
        productPrice: product.price,
        productImage: product.images?.mainImage,
        availableItems: product.availbleItems,
        revenue: productRevenue,
        unitsSold: productUnitsSold,
        buyers: productBuyerIds.size,
        inquiries: inquiries.length
      });
    }

    res.json({
      success: true,
      analytics: {
        overview: {
          totalProducts: products.length,
          totalRevenue: aggregatedRevenue.toFixed(2),
          totalUnitsSold: aggregatedUnitsSold,
          totalBuyers: allBuyerIds.size,
          averageRevenuePerProduct: products.length > 0 ? (aggregatedRevenue / products.length).toFixed(2) : 0
        },
        inquiries: {
          total: totalInquiries,
          open: openInquiries,
          resolved: resolvedInquiries,
          closed: closedInquiries
        },
        products: productAnalytics.sort((a, b) => b.revenue - a.revenue)
      }
    });
  } catch (error) {
    console.error('Error fetching seller analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};

const seller = {
  getProductAnalytics,
  getUsersWhoBoughtMyProduct,
  getUserWhoBoughtMyProduct,
  getAllSellerAnalytics
};
export default seller ;