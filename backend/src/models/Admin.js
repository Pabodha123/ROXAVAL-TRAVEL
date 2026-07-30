const mongoose = require('mongoose');

/**
 * Extended profile for admin/staff accounts. Permissions array allows
 * fine-grained access control beyond the base admin/superadmin role split.
 */
const adminSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    department: {
      type: String,
      enum: ['operations', 'sales', 'finance', 'content', 'management'],
      default: 'operations',
    },
    permissions: {
      type: [String],
      default: [],
      // e.g. 'manage_packages', 'manage_bookings', 'verify_payments', 'manage_content'
    },
    isSuperAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

adminSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('Admin', adminSchema);
