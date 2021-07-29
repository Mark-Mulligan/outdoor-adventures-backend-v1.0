exports.testApiConnection = (req, res) => {
  setTimeout(() => {
    res.status(200).json({ message: 'api up and running' });
  }, 5000);
};
