const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('../config/env');

/**
 * Base user account used for authentication. Customer and Admin profiles
 * reference this via `user` (1:1) so auth concerns stay separate from
 * role-specific profile data.
 */
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: [true, 'Full name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: { type: String, trim: true },
    password: { type: String, required: [true, 'Password is required'], minlength: 8, select: false },
    role: { type: String, enum: ['customer', 'admin', 'superadmin'], default: 'customer' },
    avatar: { type: String, default: '' },
    active: { type: Boolean, default: true, select: false },
    emailVerified: { type: Boolean, default: false },
    passwordChangedAt: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    // `select: false` above only stops these fields from being fetched by a
    // fresh query — it does nothing once a document is already loaded in
    // memory (e.g. right after User.create(), or after login's explicit
    // .select('+password') for the comparePassword check). Without this
    // transform, res.json(user) would serialize the bcrypt hash straight to
    // the client on every register/login response.
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.passwordChangedAt;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, env.BCRYPT_SALT_ROUNDS);
  if (!this.isNew) this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.changedPasswordAfter = function changedPasswordAfter(jwtTimestamp) {
  if (!this.passwordChangedAt) return false;
  const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
  return jwtTimestamp < changedTimestamp;
};

userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
