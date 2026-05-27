const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function fixImages() {
  await mongoose.connect('mongodb://127.0.0.1:27017/premium-news');
  console.log('✅ Connected to MongoDB');

  const Post = mongoose.model('Post', new mongoose.Schema({}, { strict: false }));

  // Collect all full-size images from 2026, 2025 uploads (exclude resized thumbnails)
  const uploadsRoot = path.join(__dirname, '..', 'public', 'uploads');
  const years = ['2026', '2025'];
  const images = [];

  for (const year of years) {
    const yearPath = path.join(uploadsRoot, year);
    if (!fs.existsSync(yearPath)) continue;
    const months = fs.readdirSync(yearPath);
    for (const month of months) {
      const monthPath = path.join(yearPath, month);
      if (!fs.statSync(monthPath).isDirectory()) continue;
      const files = fs.readdirSync(monthPath);
      for (const file of files) {
        // Skip resized thumbnails (e.g. -300x200.)
        if (/\-\d+x\d+\./i.test(file)) continue;
        if (/\.(jpg|jpeg|png|webp|gif)$/i.test(file)) {
          images.push(`/uploads/${year}/${month}/${file}`);
        }
      }
    }
  }

  console.log(`📸 Found ${images.length} real images from backup`);

  // Find all posts with no imageUrl
  const noImagePosts = await Post.find({
    $or: [{ imageUrl: { $exists: false } }, { imageUrl: null }, { imageUrl: '' }]
  }).select('_id title');

  console.log(`🔧 Patching ${noImagePosts.length} posts with no image...`);

  let patched = 0;
  for (let i = 0; i < noImagePosts.length; i++) {
    // Assign images cycling through the pool so each post gets a different one
    const img = images[i % images.length];
    await Post.updateOne({ _id: noImagePosts[i]._id }, { $set: { imageUrl: img } });
    patched++;
  }

  console.log(`\n✅ Done! Patched ${patched} posts with unique backup images.`);
  await mongoose.disconnect();
}

fixImages().catch(console.error);
