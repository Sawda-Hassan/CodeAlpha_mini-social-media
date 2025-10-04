const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  profilePic: {
    type: String,
    default: '', // URL or placeholder
  },
  followers: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],
  following: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],
  posts: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
  ],
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Password comparison
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Return public profile info
UserSchema.methods.toProfileJSON = function() {
  return {
    id: this._id,
    username: this.username,
    displayName: this.displayName,
    bio: this.bio,
    profilePic: this.profilePic,
    followersCount: this.followers.length,
    followingCount: this.following.length,
    postsCount: this.posts.length,
  };
};

module.exports = mongoose.model('User', UserSchema);
