const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  // BYPASS AUTH FOR DEMO (Use valid 24-char hex string for ObjectId casting)
  req.user = { id: '111111111111111111111111', role: 'admin' };
  next();
};

module.exports = authMiddleware;
