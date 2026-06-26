const adminMiddleware = (req, res, next) => {
  // BYPASS ADMIN CHECK
  next();
};

module.exports = adminMiddleware;
