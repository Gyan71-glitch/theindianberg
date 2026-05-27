const mongoose = require('mongoose');

async function checkEmptyImages() {
  await mongoose.connect('mongodb://127.0.0.1:27017/premium-news');
  console.log('✅ Connected to MongoDB');

  const Post = mongoose.model('Post', new mongoose.Schema({}, { strict: false }));
  
  const allPosts = await Post.find({});
  let missing = 0;
  
  allPosts.forEach(post => {
    const url = post.get('imageUrl');
    if (!url || url.trim() === '' || url === 'undefined' || url === 'null') {
      missing++;
      console.log(`Missing/Invalid Image: ${post.get('title')} -> "${url}"`);
    }
  });
  
  console.log(`Total missing/invalid images: ${missing}`);
  await mongoose.disconnect();
}

checkEmptyImages().catch(console.error);
