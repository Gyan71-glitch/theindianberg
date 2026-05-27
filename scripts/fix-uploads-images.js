const mongoose = require('mongoose');

const validImages = [
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1200&auto=format&fit=crop"
];

async function fixImages() {
  await mongoose.connect('mongodb://127.0.0.1:27017/premium-news');
  console.log('✅ Connected to MongoDB');

  const Post = mongoose.model('Post', new mongoose.Schema({}, { strict: false }));
  
  const allPosts = await Post.find({});
  let updated = 0;
  
  for (let i = 0; i < allPosts.length; i++) {
    const post = allPosts[i];
    const url = post.get('imageUrl');
    if (!url || url.includes('/uploads/')) {
      const randomImg = validImages[i % validImages.length];
      await Post.updateOne({ _id: post._id }, { $set: { imageUrl: randomImg } });
      updated++;
      console.log(`Fixed image for: ${post.get('title')}`);
    }
  }
  
  console.log(`Total images fixed: ${updated}`);
  await mongoose.disconnect();
}

fixImages().catch(console.error);
