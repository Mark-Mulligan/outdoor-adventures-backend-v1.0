require('dotenv').config();
exports.testApiConnection = (req, res) => {
  res.status(200).json({ message: 'api up and running' });
};

exports.googleMapsKey = (req, res) => {
  res.status(200).json({ data: process.env.GOOGLE_MAPS_API_KEY });
};
