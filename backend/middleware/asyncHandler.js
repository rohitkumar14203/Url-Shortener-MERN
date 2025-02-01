const asyncHandler = (fn) => (req, res, next) => {
  // Return the Promise to properly handle async errors
  return Promise.resolve(fn(req, res, next)).catch((error) => {
    res.status(error.status || 500).json({ 
      message: error.message || "Server Error"
    });
  });
};

export default asyncHandler;
