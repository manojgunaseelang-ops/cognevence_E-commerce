const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/usermodule');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/well-store';
(async () => {
  const email = (process.argv[2] || '').toLowerCase().trim();
  const password = process.argv[3] || '';
  if (!email || !password) {
    console.error('Usage: node set_admin_email.js <email> <password>');
    process.exit(2);
  }
  try {
    await mongoose.connect(MONGODB_URI);
    let user = await User.findOne({ email });
    const hashed = await bcrypt.hash(password, 10);
    if (user) {
      user.password = hashed;
      user.isAdmin = true;
      await user.save();
      console.log('Updated existing user as admin:', email);
    } else {
      user = new User({ name: 'Admin', email, password: hashed, isAdmin: true });
      await user.save();
      console.log('Created new admin user:', email);
    }
    const u = await User.findOne({ email }).lean();
    console.log({ email: u.email, isAdmin: u.isAdmin, pwdLen: (u.password||'').length });
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
})();
