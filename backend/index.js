require("dotenv").config();

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const { rateLimit } = require("express-rate-limit");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const multer = require("multer");

const isProduction = process.env.NODE_ENV === "production";
const port = process.env.PORT || 5000;
const mongoUri =
  process.env.MONGODB_URI ||
  (isProduction ? "" : "mongodb://127.0.0.1:27017/perfumeshop");
const jwtSecret =
  process.env.JWT_SECRET ||
  (isProduction ? "" : crypto.randomBytes(32).toString("hex"));
const adminEmails = new Set(
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);
const configuredOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS || "").split(","),
]
  .filter(Boolean)
  .map((origin) => origin.trim().replace(/\/$/, ""));
const allowedOrigins = new Set(
  configuredOrigins,
);
const allowAnyOrigin =
  isProduction && !process.env.FRONTEND_URL && !process.env.CORS_ORIGINS;
const isAllowedOrigin = (origin) =>
  Boolean(origin) &&
  (allowAnyOrigin || allowedOrigins.has(origin.trim().replace(/\/$/, "")));
const uploadDirectory = path.resolve(
  process.env.UPLOAD_DIR || path.join(__dirname, "upload", "images"),
);
const authCookieName = "perfume_auth";
const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
const clearAuthCookieOptions = {
  httpOnly: authCookieOptions.httpOnly,
  secure: authCookieOptions.secure,
  sameSite: authCookieOptions.sameSite,
  path: authCookieOptions.path,
};

if (!mongoUri) throw new Error("MONGODB_URI must be configured in production.");
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("Set JWT_SECRET to a random value of at least 32 characters.");
}
if (isProduction && adminEmails.size === 0) {
  throw new Error("Set ADMIN_EMAILS to at least one authorized admin email in production.");
}

fs.mkdirSync(uploadDirectory, { recursive: true });

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", isProduction ? 1 : false);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || isAllowedOrigin(origin));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/images", express.static(uploadDirectory, { dotfiles: "deny" }));
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { errors: "Too many sign-in attempts. Try again later." },
});
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { errors: "Too many account creation attempts. Try again later." },
});

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  image: { type: String, required: true },
  category: { type: String, required: true, enum: ["men", "women", "kid"] },
  new_price: { type: Number, required: true, min: 0 },
  old_price: { type: Number, required: true, min: 0 },
  date: { type: Date, default: Date.now },
  avilable: { type: Boolean, default: true },
});
const userSchema = new mongoose.Schema({
  name: { type: String, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  cartData: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
  date: { type: Date, default: Date.now },
});
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
const Users = mongoose.models.Users || mongoose.model("Users", userSchema);

const validateCredentials = (body = {}, requireName = false) => {
  const { email, password, username } = body;
  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof password !== "string" ||
    password.length < (requireName ? 8 : 1) ||
    Buffer.byteLength(password, "utf8") > 72 ||
    (requireName &&
      (typeof username !== "string" || !username.trim() || username.trim().length > 100))
  ) {
    return false;
  }
  return true;
};

const setAuthCookie = (res, token) => res.cookie(authCookieName, token, authCookieOptions);

const authenticate = async (req, res, next) => {
  const token = req.cookies[authCookieName] || req.get("auth-token");
  if (!token) {
    return res.status(401).json({ errors: "Please sign in to continue." });
  }
  if (
    req.cookies[authCookieName] &&
    !isAllowedOrigin(req.get("origin"))
  ) {
    return res.status(403).json({ errors: "Request origin is not allowed." });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await Users.findById(payload.user?.id).select("_id email");
    if (!user) return res.status(401).json({ errors: "Your session is no longer valid." });
    req.user = user;
    next();
  } catch (error) {
    if (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError") {
      return res.status(401).json({ errors: "Your session is no longer valid." });
    }
    next(error);
  }
};

const requireAdmin = (req, res, next) => {
  if (!adminEmails.has(req.user.email)) {
    return res.status(403).json({ errors: "Administrator access is required." });
  }
  next();
};

const createToken = (user) =>
  jwt.sign({ user: { id: user.id } }, jwtSecret, { expiresIn: "7d" });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => {
    callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    callback(null, allowedTypes.has(file.mimetype));
  },
});

app.get("/", (_req, res) => res.send("Express App is Running"));
app.get("/health", (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "unavailable",
    database: connected ? "connected" : "disconnected",
  });
});

app.get("/allproducts", async (_req, res) => {
  res.json(await Product.find({}).sort({ date: -1 }).lean());
});

app.get("/newcollections", async (_req, res) => {
  const products = await Product.find({}).sort({ date: -1 }).limit(9).lean();
  res.json(products.slice(1));
});

app.get("/popularinwomen", async (_req, res) => {
  res.json(await Product.find({ category: "women" }).sort({ date: -1 }).limit(4).lean());
});

app.post("/signup", signupLimiter, async (req, res) => {
  if (!validateCredentials(req.body, true)) {
    return res.status(400).json({
      success: false,
      errors: "Enter a valid email, a name, and a password of 8 to 72 bytes.",
    });
  }

  const email = req.body.email.trim().toLowerCase();
  if (adminEmails.has(email)) {
    return res.status(403).json({
      success: false,
      errors: "Administrator accounts must be provisioned by the site owner.",
    });
  }
  if (await Users.exists({ email })) {
    return res.status(409).json({ success: false, errors: "An account already exists for that email." });
  }

  const cartData = Object.fromEntries(Array.from({ length: 300 }, (_, id) => [id, 0]));
  const user = await Users.create({
    name: req.body.username.trim(),
    email,
    password: await bcrypt.hash(req.body.password, 12),
    cartData,
  });
  setAuthCookie(res, createToken(user));
  res.status(201).json({ success: true });
});

app.post("/login", loginLimiter, async (req, res) => {
  if (!validateCredentials(req.body)) {
    return res.status(400).json({ success: false, errors: "Enter a valid email and password." });
  }

  const user = await Users.findOne({ email: req.body.email.trim().toLowerCase() });
  const storedPassword = user?.password || "";
  const isBcryptHash = storedPassword.startsWith("$2");
  const legacyPassword = Buffer.from(storedPassword);
  const submittedPassword = Buffer.from(req.body.password);
  const passwordMatches = user && (isBcryptHash
    ? await bcrypt.compare(req.body.password, storedPassword)
    : legacyPassword.length === submittedPassword.length &&
      crypto.timingSafeEqual(legacyPassword, submittedPassword));

  if (!passwordMatches) {
    return res.status(401).json({ success: false, errors: "Invalid email or password." });
  }

  if (!isBcryptHash) {
    user.password = await bcrypt.hash(req.body.password, 12);
    await user.save();
  }

  setAuthCookie(res, createToken(user));
  res.json({ success: true, isAdmin: adminEmails.has(user.email) });
});

app.post("/logout", (_req, res) => {
  res.clearCookie(authCookieName, clearAuthCookieOptions);
  res.json({ success: true });
});

app.get("/auth/status", authenticate, (req, res) => {
  res.json({ authenticated: true, isAdmin: adminEmails.has(req.user.email) });
});

app.post("/getcart", authenticate, async (req, res) => {
  const user = await Users.findById(req.user.id).select("cartData").lean();
  res.json(user?.cartData || {});
});

app.post("/addtocart", authenticate, async (req, res) => {
  const itemId = Number(req.body.itemId);
  if (!Number.isSafeInteger(itemId) || itemId < 1) {
    return res.status(400).json({ errors: "A valid product ID is required." });
  }
  const [user, product] = await Promise.all([
    Users.findById(req.user.id),
    Product.findOne({ id: itemId, avilable: true }).select("_id"),
  ]);
  if (!user) return res.status(401).json({ errors: "Your session is no longer valid." });
  if (!product) return res.status(404).json({ errors: "Product not found." });
  const cartData = user.cartData || {};
  cartData[itemId] = (Number(cartData[itemId]) || 0) + 1;
  user.cartData = cartData;
  user.markModified("cartData");
  await user.save();
  res.json({ success: true });
});

app.post("/removefromcart", authenticate, async (req, res) => {
  const itemId = Number(req.body.itemId);
  if (!Number.isSafeInteger(itemId) || itemId < 1) {
    return res.status(400).json({ errors: "A valid product ID is required." });
  }
  const user = await Users.findById(req.user.id);
  if (!user) return res.status(401).json({ errors: "Your session is no longer valid." });
  const cartData = user.cartData || {};
  cartData[itemId] = Math.max(0, (Number(cartData[itemId]) || 0) - 1);
  user.cartData = cartData;
  user.markModified("cartData");
  await user.save();
  res.json({ success: true });
});

app.post("/upload", authenticate, requireAdmin, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, errors: "Choose a PNG, JPEG, or WebP image." });
  const apiUrl = (process.env.API_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
  res.json({ success: true, image_url: `${apiUrl}/images/${req.file.filename}` });
});

app.post("/addproduct", authenticate, requireAdmin, async (req, res) => {
  const { name, image, category } = req.body;
  const newPrice = Number(req.body.new_price);
  const oldPrice = Number(req.body.old_price);
  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.trim().length > 200 ||
    typeof image !== "string" ||
    !/^https?:\/\//i.test(image) ||
    !["men", "women", "kid"].includes(category) ||
    !Number.isFinite(newPrice) ||
    !Number.isFinite(oldPrice) ||
    newPrice < 0 ||
    oldPrice < 0
  ) {
    return res.status(400).json({ success: false, errors: "Enter valid product details." });
  }

  const lastProduct = await Product.findOne({}).sort({ id: -1 }).select("id").lean();
  const product = await Product.create({
    id: (lastProduct?.id || 0) + 1,
    name: name.trim(),
    image,
    category,
    new_price: newPrice,
    old_price: oldPrice,
  });
  res.status(201).json({ success: true, name: product.name });
});

app.post("/removeproduct", authenticate, requireAdmin, async (req, res) => {
  const id = Number(req.body.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({ success: false, errors: "A valid product ID is required." });
  }
  const product = await Product.findOneAndDelete({ id });
  if (!product) return res.status(404).json({ success: false, errors: "Product not found." });
  res.json({ success: true, name: product.name });
});

app.use((req, res) => res.status(404).json({ errors: "API route not found." }));
app.use((error, _req, res, _next) => {
  console.error("API request failed:", error.message);
  if (error instanceof multer.MulterError) {
    return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ errors: "Image upload failed." });
  }
  if (error.code === 11000) {
    return res.status(409).json({ errors: "A record with that value already exists." });
  }
  res.status(500).json({ errors: "An unexpected server error occurred." });
});

if (require.main === module) {
  mongoose
    .connect(mongoUri)
    .then(() => {
      console.log("MongoDB connected.");
      app.listen(port, "0.0.0.0", () => console.log(`API listening on port ${port}.`));
    })
    .catch((error) => {
      console.error("Unable to connect to MongoDB:", error.message);
      process.exitCode = 1;
    });
}

module.exports = app;
