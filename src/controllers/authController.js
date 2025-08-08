const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/apiError");
const { apiResponse } = require("../utils/apiResponse");
const prisma = require("../utils/prisma");

const register = async (req, res, next) => {
  const { name, email, password, role, instance } = req.body;

  if (!name || !email || !password || !role || !instance) {
    return next(ApiError.badRequest("Semua data tidak boleh kosong."));
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return next(ApiError.badRequest("Email sudah terdaftar."));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        instance,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        instance: true,
      },
    });

    res.status(201).json(
      apiResponse({
        data: user,
        message: "Pendaftaran berhasil.",
      })
    );
  } catch (error) {
    return next(
      ApiError.internal("Terjadi kesalahan saat mendaftar pengguna.")
    );
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(ApiError.badRequest("Email dan password tidak boleh kosong."));
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return next(ApiError.unauthorized("Email atau password salah."));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(ApiError.unauthorized("Email atau password salah."));
    }

    const payload = {
      id: user.id,
      role: user.role,
      instance: user.instance,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json(
      apiResponse({
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            instance: user.instance,
          },
        },
        message: "Login berhasil.",
      })
    );
  } catch {
    return next(ApiError.internal("Terjadi kesalahan saat login pengguna."));
  }
};

const getUserFromToken = async (req, res, next) => {
  const { id } = req.user;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        instance: true,
      },
    });

    if (!user) {
      return next(ApiError.notFound("Pengguna tidak ditemukan."));
    }

    res.status(200).json(
      apiResponse({
        data: user,
        message: "Pengguna berhasil ditemukan.",
      })
    );
  } catch (error) {
    return next(
      ApiError.internal("Terjadi kesalahan saat mengambil data pengguna.")
    );
  }
};

module.exports = {
  register,
  login,
  getUserFromToken,
};
