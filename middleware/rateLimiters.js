import rateLimit from "express-rate-limit";

/**
 * Global rate limiter - Applied to all routes
 * 100 requests per 15 minutes per IP
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks or specific routes if needed
    return false;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
      retryAfter: req.rateLimit.resetTime
    });
  }
});

/**
 * Auth rate limiter - Stricter for login/register
 * 5 attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  message: "Too many login/register attempts, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many login attempts. Please try again after 15 minutes.",
      retryAfter: req.rateLimit.resetTime
    });
  }
});

/**
 * Product creation rate limiter
 * 10 products per hour per user
 */
export const productCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 product creations per hour
  message: "Product creation limit reached, try again later",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise use IP
    return req.user?.id || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Product creation limit reached. Maximum 10 products per hour.",
      retryAfter: req.rateLimit.resetTime
    });
  }
});

/**
 * Chat message limiter
 * 50 messages per minute
 */
export const chatMessageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50,
  message: "Too many messages, please slow down",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Message rate limit exceeded. Maximum 50 messages per minute.",
      retryAfter: req.rateLimit.resetTime
    });
  }
});

/**
 * Inquiry creation limiter
 * 5 inquiries per hour
 */
export const inquiryCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: "Inquiry creation limit reached",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Inquiry limit reached. Maximum 5 inquiries per hour.",
      retryAfter: req.rateLimit.resetTime
    });
  }
});

/**
 * File upload limiter
 * 5 uploads per minute
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: "Too many uploads, please slow down",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Upload rate limit exceeded. Maximum 5 uploads per minute.",
      retryAfter: req.rateLimit.resetTime
    });
  }
});

/**
 * API endpoint general limiter
 * 30 requests per minute per user
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many API requests",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "API rate limit exceeded. Maximum 30 requests per minute.",
      retryAfter: req.rateLimit.resetTime
    });
  }
});
