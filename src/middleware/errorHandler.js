// Xatoliklarni boshqarish middleware'i
module.exports = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: "Bu ma'lumot allaqachon mavjud" });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Serverda kutilmagan xatolik yuz berdi',
  });
};