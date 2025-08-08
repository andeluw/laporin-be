const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");
const ApiError = require("../utils/apiError");

const authenticate = async (req, res, next) => {
  const token = req
    .header("Authorization")
    ?.replace("Bearer", "")
    .split(" ")[1];

  if (!token) {
    return next(ApiError.unauthorized("Akses ditolak. Token tidak ditemukan."));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    if (!user) {
      return next(
        ApiError.unauthorized("Akses ditolak. Pengguna tidak ditemukan.")
      );
    }
    req.user = user;
    next();
  } catch (error) {
    return next(ApiError.unauthorized("Akses ditolak. Token tidak valid."));
  }
};

const onlyAllow = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        ApiError.unauthorized("Akses ditolak. Pengguna tidak terautentikasi.")
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden("Akses ditolak. Anda tidak memiliki izin.")
      );
    }
    next();
  };
};

module.exports = {
  authenticate,
  onlyAllow,
};
