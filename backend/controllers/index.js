// Central export for all controllers

const authController = require('./authController');
const itemController = require('./itemController');
const claimController = require('./claimController');

module.exports = {
  authController,
  itemController,
  claimController,
  
  // Auth exports
  ...authController,
  
  // Item exports
  ...itemController,
  
  // Claim exports
  ...claimController,
};
