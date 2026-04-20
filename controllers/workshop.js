import Workshop from "../models/Workshop.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import { getIO } from "../socket.js";
import { createNotification } from "../service/notificationService.js";

/**
 * GET all workshops with filtering and pagination
 * Query params:
 * - search: search in title, description
 * - category: filter by category
 * - priceFilter: 'free', 'paid', or 'all'
 * - page: page number (default 1)
 * - limit: results per page (default 12)
 */
const getWorkshops = async (req, res, next) => {
  try {
    const { search, category, priceFilter, page = 1, limit = 12 } = req.query;
    
    // Build filter object
    let filter = { valid: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (priceFilter === 'free') {
      filter.price = 0;
    } else if (priceFilter === 'paid') {
      filter.price = { $gt: 0 };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch workshops
    let workshops = await Workshop.find(filter)
      .populate('instructor.userId')
      .populate('createdBy')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Transform instructor data and remove userId
    workshops = workshops.map(workshop => {
      const workshopObj = workshop.toObject();
      if (workshopObj.instructor?.userId) {
        const user = workshopObj.instructor.userId;
        workshopObj.instructor = {
          _id: user._id,
          name: `${user.name?.firstName || ''} ${user.name?.lastName || ''}`.trim(),
          avatar: user.bio?.profileImage || null,
          bio: null
        };
      }
      if (workshopObj.createdBy) {
        workshopObj.createdBy = {
          _id: workshopObj.createdBy._id,
          name: `${workshopObj.createdBy.name?.firstName || ''} ${workshopObj.createdBy.name?.lastName || ''}`.trim(),
          avatar: workshopObj.createdBy.bio?.profileImage || null
        };
      }
      return workshopObj;
    });

    // Get total count for pagination
    const total = await Workshop.countDocuments(filter);

    res.json({
      workshops,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET single workshop by ID or slug
 */
const getWorkshopDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Try to find by _id or slug
    let workshop = await Workshop.findOne({
      $or: [
        { _id: id },
        { slug: id }
      ],
      valid: true
    })
      .populate('instructor.userId')
      .populate('createdBy')
      .populate('applications.userId');

    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    // Convert to plain object and transform instructor data
    const workshopObj = workshop.toObject();
    if (workshopObj.instructor?.userId) {
      const user = workshopObj.instructor.userId;
      workshopObj.instructor = {
        _id: user._id,
        name: `${user.name?.firstName || ''} ${user.name?.lastName || ''}`.trim(),
        avatar: user.bio?.profileImage || null,
        bio: null,
        email: user.email
      };
    }
    if (workshopObj.createdBy) {
      workshopObj.createdBy = {
        _id: workshopObj.createdBy._id,
        name: `${workshopObj.createdBy.name?.firstName || ''} ${workshopObj.createdBy.name?.lastName || ''}`.trim(),
        avatar: workshopObj.createdBy.bio?.profileImage || null
      };
    }
    if (workshopObj.applications) {
      workshopObj.applications = workshopObj.applications.map(app => ({
        ...app,
        userId: {
          _id: app.userId._id,
          name: `${app.userId.name?.firstName || ''} ${app.userId.name?.lastName || ''}`.trim(),
          avatar: app.userId.bio?.profileImage || null,
          email: app.userId.email
        }
      }));
    }

    res.json(workshopObj);
  } catch (error) {
    next(error);
  }
};

/**
 * CREATE new workshop (seller/instructor only)
 */
const createWorkshop = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      title,
      slug,
      category,
      tags,
      description,
      content,
      gallery,
      location,
      schedule,
      price,
      capacity,
      resources,
      agenda,
      applicationRequired
    } = req.body;

    // Validate required fields
    if (!title || !slug || !description || !schedule?.startDate || !schedule?.endDate) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, slug, description, schedule' 
      });
    }

    // Check if slug is unique
    const existingSlug = await Workshop.findOne({ slug });
    if (existingSlug) {
      return res.status(400).json({ message: 'Slug already exists' });
    }

    // Get instructor details from user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create workshop
    const workshop = new Workshop({
      title,
      slug,
      category,
      tags: tags || [],
      description,
      content,
      gallery: gallery || [],
      location,
      schedule,
      price: price || 0,
      capacity: capacity || { maxSeats: null, seatsTaken: 0 },
      resources: resources || [],
      agenda: agenda || [],
      instructor: {
        name: `${user.name.firstName} ${user.name.lastName}`,
        bio: null,
        avatar: user.bio?.profileImage || null,
        userId: userId
      },
      applicationRequired: applicationRequired || false,
      createdBy: userId,
      valid: false,  // Requires admin validation
      validationStatus: 'pending'
    });

    await workshop.save();

    // Populate and return
    await workshop.populate('instructor.userId');
    await workshop.populate('createdBy');

    // Transform instructor data and remove userId
    const workshopObj = workshop.toObject();
    if (workshopObj.instructor?.userId) {
      const user = workshopObj.instructor.userId;
      workshopObj.instructor = {
        _id: user._id,
        name: `${user.name?.firstName || ''} ${user.name?.lastName || ''}`.trim(),
        avatar: user.bio?.profileImage || null,
        bio: null
      };
    }
    if (workshopObj.createdBy) {
      workshopObj.createdBy = {
        _id: workshopObj.createdBy._id,
        name: `${workshopObj.createdBy.name?.firstName || ''} ${workshopObj.createdBy.name?.lastName || ''}`.trim(),
        avatar: workshopObj.createdBy.bio?.profileImage || null
      };
    }

    // Create notification for workshop created
    const io = getIO();
    await createNotification(
      io,
      userId,
      'workshop_created',
      {
        userId: userId,
        name: `${user.name.firstName} ${user.name.lastName}`,
        avatar: user.bio?.profileImage || null
      },
      {
        workshopId: workshop._id,
        workshopTitle: workshop.title,
        status: 'awaiting_admin_review'
      }
    );

    res.status(201).json({
      message: 'Workshop created successfully',
      workshop: workshopObj
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE workshop (owner only)
 */
const updateWorkshop = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    // Find workshop
    const workshop = await Workshop.findById(id);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    // Check authorization
    if (workshop.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this workshop' });
    }

    // Don't allow slug changes if already published
    if (updates.slug && updates.slug !== workshop.slug) {
      const existingSlug = await Workshop.findOne({ slug: updates.slug });
      if (existingSlug) {
        return res.status(400).json({ message: 'Slug already exists' });
      }
    }

    // Update allowed fields
    const allowedUpdates = [
      'title', 'slug', 'category', 'tags', 'description', 'content',
      'gallery', 'location', 'schedule', 'price', 'capacity',
      'resources', 'agenda', 'applicationRequired'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        workshop[field] = updates[field];
      }
    });

    workshop.lastModifiedBy = userId;
    await workshop.save();

    await workshop.populate('instructor.userId');
    await workshop.populate('createdBy');

    // Transform instructor data and remove userId
    const workshopObj = workshop.toObject();
    if (workshopObj.instructor?.userId) {
      const user = workshopObj.instructor.userId;
      workshopObj.instructor = {
        _id: user._id,
        name: `${user.name?.firstName || ''} ${user.name?.lastName || ''}`.trim(),
        avatar: user.bio?.profileImage || null,
        bio: null
      };
    }
    if (workshopObj.createdBy) {
      workshopObj.createdBy = {
        _id: workshopObj.createdBy._id,
        name: `${workshopObj.createdBy.name?.firstName || ''} ${workshopObj.createdBy.name?.lastName || ''}`.trim(),
        avatar: workshopObj.createdBy.bio?.profileImage || null
      };
    }

    res.json({
      message: 'Workshop updated successfully',
      workshop: workshopObj
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE workshop (owner only)
 */
const deleteWorkshop = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const workshop = await Workshop.findById(id);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    // Check authorization
    if (workshop.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this workshop' });
    }

    // Soft delete - mark as invalid
    workshop.valid = false;
    await workshop.save();

    res.json({
      message: 'Workshop deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * APPLY for workshop (user only)
 */
const applyForWorkshop = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { motivation } = req.body;

    const workshop = await Workshop.findById(id);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    // Check if already applied
    const existingApp = workshop.applications.find(
      app => app.userId.toString() === userId.toString()
    );

    if (existingApp) {
      return res.status(400).json({ 
        message: 'You have already applied for this workshop' 
      });
    }

    // Check capacity
    if (workshop.capacity.maxSeats && 
        workshop.capacity.seatsTaken >= workshop.capacity.maxSeats) {
      return res.status(400).json({ message: 'Workshop is full' });
    }

    // Check if application required
    if (workshop.applicationRequired) {
      workshop.applications.push({
        userId,
        status: 'pending',
        motivation: motivation || null,
        submittedAt: new Date()
      });
    } else {
      // Auto-accepted if no application required
      workshop.applications.push({
        userId,
        status: 'accepted',
        motivation: motivation || null,
        submittedAt: new Date()
      });
      workshop.capacity.seatsTaken += 1;
    }

    await workshop.save();

    res.json({
      message: workshop.applicationRequired 
        ? 'Application submitted successfully' 
        : 'Successfully enrolled in workshop',
      application: workshop.applications[workshop.applications.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * RESPOND to application (workshop owner only)
 */
const respondToApplication = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id, appId } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        message: 'Status must be either "accepted" or "rejected"' 
      });
    }

    const workshop = await Workshop.findById(id);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    // Check authorization
    if (workshop.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Find application
    const application = workshop.applications.id(appId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const previousStatus = application.status;
    application.status = status;

    // Update seat count
    if (status === 'accepted' && previousStatus !== 'accepted') {
      workshop.capacity.seatsTaken += 1;
    } else if (status === 'rejected' && previousStatus === 'accepted') {
      workshop.capacity.seatsTaken = Math.max(0, workshop.capacity.seatsTaken - 1);
    }

    await workshop.save();

    res.json({
      message: `Application ${status}`,
      application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CANCEL user enrollment (user only)
 */
const cancelEnrollment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const workshop = await Workshop.findById(id);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    const application = workshop.applications.find(
      app => app.userId.toString() === userId.toString()
    );

    if (!application) {
      return res.status(404).json({ message: 'You have not enrolled in this workshop' });
    }

    if (application.status === 'accepted') {
      workshop.capacity.seatsTaken = Math.max(0, workshop.capacity.seatsTaken - 1);
    }

    workshop.applications = workshop.applications.filter(
      app => app.userId.toString() !== userId.toString()
    );

    await workshop.save();

    res.json({
      message: 'Successfully cancelled enrollment'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET workshops by seller (seller dashboard)
 */
const getSellerWorkshops = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const workshops = await Workshop.find({ createdBy: userId })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('applications.userId', 'name avatar email');

    const total = await Workshop.countDocuments({ createdBy: userId });

    res.json({
      workshops,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET pending workshops (admin only)
 */
const getPendingWorkshops = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let workshops = await Workshop.find({ validationStatus: 'pending' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy')
      .populate('instructor.userId');

    // Transform instructor and createdBy data
    workshops = workshops.map(workshop => {
      const workshopObj = workshop.toObject();
      if (workshopObj.instructor?.userId) {
        const user = workshopObj.instructor.userId;
        workshopObj.instructor = {
          _id: user._id,
          name: `${user.name?.firstName || ''} ${user.name?.lastName || ''}`.trim(),
          avatar: user.bio?.profileImage || null,
          bio: null
        };
      }
      if (workshopObj.createdBy) {
        workshopObj.createdBy = {
          _id: workshopObj.createdBy._id,
          name: `${workshopObj.createdBy.name?.firstName || ''} ${workshopObj.createdBy.name?.lastName || ''}`.trim(),
          avatar: workshopObj.createdBy.bio?.profileImage || null,
          email: workshopObj.createdBy.email
        };
      }
      return workshopObj;
    });

    const total = await Workshop.countDocuments({ validationStatus: 'pending' });

    res.json({
      workshops,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * APPROVE or REJECT workshop (admin only)
 */
const validateWorkshop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        message: 'Status must be either "approved" or "rejected"' 
      });
    }

    const workshop = await Workshop.findById(id);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    if (workshop.validationStatus !== 'pending') {
      return res.status(400).json({ 
        message: 'Workshop is not pending validation' 
      });
    }

    workshop.validationStatus = status;
    if (status === 'approved') {
      workshop.valid = true;
      workshop.rejectionReason = null;
    } else {
      workshop.valid = false;
      workshop.rejectionReason = rejectionReason || 'Rejected by admin';
    }

    await workshop.save();

    // Send notification to workshop creator
    const io = getIO();
    const notificationType = status === 'approved' ? 'workshop_approved' : 'workshop_rejected';
    await createNotification(
      io,
      workshop.createdBy,
      notificationType,
      {
        userId: req.user.id,
        name: 'Admin',
        avatar: null
      },
      {
        workshopId: workshop._id,
        workshopTitle: workshop.title,
        reason: rejectionReason || null
      }
    );

    res.json({
      message: `Workshop ${status}`,
      workshop
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getWorkshops,
  getWorkshopDetail,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  applyForWorkshop,
  respondToApplication,
  cancelEnrollment,
  getSellerWorkshops,
  getPendingWorkshops,
  validateWorkshop
};