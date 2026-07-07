const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: '' },
  fullName: { type: String, trim: true, default: '' },
  line1: { type: String, trim: true, default: '' },
  line2: { type: String, trim: true, default: '' },
  addressLine: { type: String, trim: true, default: '' },
  locality: { type: String, trim: true, default: '' },
  landmark: { type: String, trim: true, default: '' },
  alternatePhone: { type: String, trim: true, default: '' },
  addressType: { type: String, trim: true, default: 'HOME' },
  city: { type: String, trim: true, default: '' },
  state: { type: String, trim: true, default: '' },
  pincode: { type: String, trim: true, default: '' },
  phone: { type: String, trim: true, default: '' },
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: '' },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false },
  addresses: { type: [addressSchema], default: [] },
  // Optional saved address for the user. Applications can update this when the user provides
  // a delivery address during checkout so future orders default to it.
  address: {
    name: { type: String, trim: true, default: '' },
    fullName: { type: String, trim: true, default: '' },
    line1: { type: String, trim: true, default: '' },
    line2: { type: String, trim: true, default: '' },
    addressLine: { type: String, trim: true, default: '' },
    locality: { type: String, trim: true, default: '' },
    landmark: { type: String, trim: true, default: '' },
    alternatePhone: { type: String, trim: true, default: '' },
    addressType: { type: String, trim: true, default: 'HOME' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    pincode: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
  },
});
const userModule = mongoose.model('User', userSchema);
module.exports = userModule;
