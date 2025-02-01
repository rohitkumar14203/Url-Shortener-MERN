const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    console.error('Error:', error);
    res.status(error.status || 500).json({
      message: error.message || "Server Error",
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

export default asyncHandler;
