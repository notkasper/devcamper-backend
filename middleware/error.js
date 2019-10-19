module.exports = (error, req, res, next) => {
  console.error(error.stack.red);
  res.status(500).json({ success: false, error: error.message });
};
