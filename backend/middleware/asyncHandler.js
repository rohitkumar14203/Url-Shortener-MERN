const asyncHandler = (fn) => (req, res, next) => {
  // Run fn (logOutCurrentUser) safely inside a promise
  Promise.resolve(
    fn(req, res, next).catch((error) => {
      // If fn throws an error, handle it here
      res.status(500).json({ message: error.message });
    })
  );
};

export default asyncHandler;
