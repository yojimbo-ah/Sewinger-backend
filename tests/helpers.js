/**
 * Test utilities and helpers
 * There are helpers that are just on the scope of __test__ of each part of the app 
 * and there are helpers that we need on the overall app 
 */

import request from 'supertest';
import User from '../models/User.js';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import Notification from '../models/Notification.js';

const SALT_ROUNDS = 12 ;
const JWT_SECRET = process.env.BCRYPT_CODE || 'topsecretcode';

/**
 * Helper to make API requests in tests
 * @param {Object} app - Express app instance
 * @returns {Object} - Configured supertest agent
 */
export const api = (app) => request(app);

/**
 * Helper to create test data
 */
export const testHelpers = {
  /**
   * Generate a valid JWT token
   */
  generateValidToken: (userData) => {
    const defaultData = {
      email: 'test@example.com',
      userId: 'test_user_id_123',
      firstName: 'Test',
      lastName: 'User',
      power: 'client'
    };
    
    const tokenData = { ...defaultData, ...userData };
    return jwt.sign(tokenData, JWT_SECRET, { expiresIn: '24h' });
  },

  /**
   * Create test user object
   */
  createTestUser: (overrides = {}) => {
    return {
      email: 'test@example.com',
      password: 'TestPassword123!',
      name: 'Test User',
      ...overrides,
    };
  },

  /**
   * Create test product object
   */
  createTestProduct: (overrides = {}) => {
    return {
      name: 'Test Product',
      description: 'A test product',
      price: 100,
      category: 'test-category',
      ...overrides,
    };
  },
};

// this is global function to initialize the users in the database
// this users will be used across the testing files
// they are accessable without imports and reduces duplicate
// code in the testing file

// thay are self explanitory
global.createAccountsTobeUsed = async () => {
  try {
    const hashedPassword = await bcrypt.hash('hello123', SALT_ROUNDS);
    
    // Create notification for each user first
    const adminNotif = await Notification.create({});
    const sellerNotif = await Notification.create({});
    const clientNotif = await Notification.create({});
    
    const userAdmin = new User({
      name : {
        firstName : 'admin' ,
        lastName : 'admin'
      } ,
      email : 'admin@test.com' ,
      password : hashedPassword ,
      power : 'admin' ,
      notification : adminNotif._id
    });
    
    const userSeller = new User({
      name : {
        firstName : 'seller' ,
        lastName : 'seller'
      } ,
      email : 'seller@test.com' ,
      password : hashedPassword ,
      power : 'seller' ,
      notification : sellerNotif._id
    });
    
    const userClient = new User({
      name : {
        firstName : 'client' ,
        lastName : 'client'
      } ,
      email : 'client@test.com' ,
      password : hashedPassword ,
      power : 'client' ,
      notification : clientNotif._id
    });

    await userAdmin.save();
    await userClient.save();
    await userSeller.save();
    
    return {
      admin: userAdmin,
      seller: userSeller,
      client: userClient
    };
  } catch (error) {
    console.error('Error creating test accounts:', error);
    throw error;
  }
};

// Global function to get authenticated token for admin user
global.getAuthCookieAdmin = async () => {
  try {
    const user = await User.findOne({ email: 'admin@test.com' });
    if (!user) {
      throw new Error('Admin user not found. Call createAccountsTobeUsed first.');
    }
    
    const tokenData = {
      email: user.email,
      userId: user._id.toString(),
      firstName: user.name.firstName,
      lastName: user.name.lastName,
      power: user.power,
      profileImage: user.bio?.profileImage || null,
      sentRequest: false
    };
    
    return jwt.sign(tokenData, JWT_SECRET, { expiresIn: '24h' });
  } catch (error) {
    console.error('Error generating admin auth cookie:', error);
    throw error;
  }
};

// Global function to get authenticated token for seller user
global.getAuthCookieSeller = async () => {
  try {
    const user = await User.findOne({ email: 'seller@test.com' });
    if (!user) {
      throw new Error('Seller user not found. Call createAccountsTobeUsed first.');
    }
    
    const tokenData = {
      email: user.email,
      userId: user._id.toString(),
      firstName: user.name.firstName,
      lastName: user.name.lastName,
      power: user.power,
      profileImage: user.bio?.profileImage || null,
      sentRequest: false
    };
    
    return jwt.sign(tokenData, JWT_SECRET, { expiresIn: '24h' });
  } catch (error) {
    console.error('Error generating seller auth cookie:', error);
    throw error;
  }
};

// Global function to get authenticated token for client user
global.getAuthCookieClient = async () => {
  try {
    const user = await User.findOne({ email: 'client@test.com' });
    if (!user) {
      throw new Error('Client user not found. Call createAccountsTobeUsed first.');
    }
    
    const tokenData = {
      email: user.email,
      userId: user._id.toString(),
      firstName: user.name.firstName,
      lastName: user.name.lastName,
      power: user.power,
      profileImage: user.bio?.profileImage || null,
      sentRequest: false
    };
    
    return jwt.sign(tokenData, JWT_SECRET, { expiresIn: '24h' });
  } catch (error) {
    console.error('Error generating client auth cookie:', error);
    throw error;
  }
};


export default { api, testHelpers };
