const mongoose = require('mongoose');

async function findPost() {
  await mongoose.connect('mongodb://127.0.0.1:27017/premium-news');
  console.log('✅ Connected to MongoDB');

  const Post = mongoose.model('Post', new mongoose.Schema({}, { strict: false }));
  
  const post = await Post.findOne({ title: { $regex: /Matt Forte/i } });
  console.log(post);
  
  const yankees = await Post.findOne({ title: { $regex: /Yankees May Get a Breather/i } });
  console.log(yankees);

  await mongoose.disconnect();
}

findPost().catch(console.error);
