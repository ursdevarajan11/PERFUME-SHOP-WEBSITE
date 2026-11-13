require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const mongoUri = process.env.MONGODB_URI;
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const allowedAdmins = new Set(
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
);

if (!mongoUri || !email || !password || !allowedAdmins.has(email)) {
  throw new Error(
    "Set MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, and include ADMIN_EMAIL in ADMIN_EMAILS.",
  );
}
if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
  throw new Error("ADMIN_PASSWORD must be at least 12 and at most 72 UTF-8 bytes.");
}

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  cartData: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
  date: { type: Date, default: Date.now },
});
const Users = mongoose.models.Users || mongoose.model("Users", userSchema);

mongoose
  .connect(mongoUri)
  .then(async () => {
    if (await Users.exists({ email })) {
      throw new Error("An account already exists for ADMIN_EMAIL; no changes were made.");
    }
    await Users.create({
      name: "Shop administrator",
      email,
      password: await bcrypt.hash(password, 12),
      cartData: {},
    });
    console.log(`Administrator account created for ${email}.`);
  })
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
