exports.validateProject = (req, res, next) => {
  const { title, category, description, duration, size, location, client, completionDate } = req.body;

  if (!title || !category || !description || !duration || !size || !location || !client || !completionDate) {
    return res.status(400).json({
      status: 'fail',
      message: 'All required fields must be provided'
    });
  }

  next();
};

exports.validateEnquiry = (req, res, next) => {
  const { name, email, telephone, message, enquiryType } = req.body;

  if (!name || !email || !telephone || !message || !enquiryType) {
    return res.status(400).json({
      status: 'fail',
      message: 'All required fields must be provided'
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide a valid email address'
    });
  }

  next();
};