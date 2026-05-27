import mysql from 'mysql2/promise';
import mongoose from 'mongoose';
import Post from '../src/models/Post';

// Map WordPress categories -> new section enums
const CATEGORY_MAP: Record<string, string> = {
  'news':          'news_flash',
  'politics':      'politics',
  'business':      'ledger',
  'economy':       'ledger',
  'blockchain':    'ledger',
  'crypto news':   'ledger',
  'entertainment': 'style',
  'travel':        'style',
  'health':        'style',
  'education':     'featured',
  'science':       'featured',
  'technology':    'featured',
  'sports':        'main_feed',
};

function mapCategory(categories: string[]): string {
  for (const cat of categories) {
    const lower = cat.toLowerCase();
    if (CATEGORY_MAP[lower]) return CATEGORY_MAP[lower];
  }
  return 'main_feed'; // fallback
}

async function migrate() {
  // ----- Connect to MongoDB -----
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/premium-news';
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB:', MONGODB_URI);

  // ----- Connect to MySQL -----
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'indianberg_old',
  });
  console.log('✅ Connected to MySQL: indianberg_old');

  // ----- Fetch all published posts -----
  const [posts] = await connection.execute<any[]>(`
    SELECT 
      p.id, 
      p.post_title, 
      p.post_date, 
      p.post_content, 
      p.post_excerpt,
      u.display_name AS author
    FROM wp_posts p
    LEFT JOIN wp_users u ON u.ID = p.post_author
    WHERE p.post_type = 'post' AND p.post_status = 'publish'
    ORDER BY p.post_date DESC
  `);

  console.log(`\n📰 Found ${posts.length} published posts to migrate.\n`);

  let migrated = 0;
  let skipped = 0;

  for (const post of posts) {
    try {
      // --- Strip HTML for text fields ---
      const stripped = (post.post_content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const excerpt = post.post_excerpt?.trim()
        ? post.post_excerpt.replace(/<[^>]+>/g, '').trim()
        : stripped.substring(0, 200) + '...';
      const description = stripped.substring(0, 800) + (stripped.length > 800 ? '...' : '');

      // --- Fetch categories for this post ---
      const [cats] = await connection.execute<any[]>(`
        SELECT t.name 
        FROM wp_terms t
        JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
        JOIN wp_term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
        WHERE tr.object_id = ? AND tt.taxonomy = 'category'
      `, [post.id]);
      const categoryNames = cats.map((c: any) => c.name);
      const section = mapCategory(categoryNames) as any;

      // --- Fetch featured image ---
      const [meta] = await connection.execute<any[]>(`
        SELECT m2.meta_value AS file_path
        FROM wp_postmeta m1
        JOIN wp_postmeta m2 ON m1.meta_value = m2.post_id
        WHERE m1.post_id = ?
          AND m1.meta_key = '_thumbnail_id'
          AND m2.meta_key = '_wp_attached_file'
        LIMIT 1
      `, [post.id]);
      const imageUrl = meta.length > 0 ? '/uploads/' + meta[0].file_path : undefined;

      // --- Fetch tags for the tag field ---
      const [tags] = await connection.execute<any[]>(`
        SELECT t.name 
        FROM wp_terms t
        JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
        JOIN wp_term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
        WHERE tr.object_id = ? AND tt.taxonomy = 'post_tag'
        LIMIT 1
      `, [post.id]);
      const tag = tags.length > 0 ? tags[0].name : (categoryNames[0] || 'General');

      // --- Create and save post ---
      await Post.create({
        title: post.post_title,
        section,
        excerpt,
        description,
        author: post.author || 'The Indianberg',
        imageUrl,
        tag,
        isLive: true,
        createdAt: new Date(post.post_date),
        updatedAt: new Date(post.post_date),
      });

      migrated++;
      if (migrated % 10 === 0) {
        process.stdout.write(`  Migrated ${migrated}/${posts.length}...\r`);
      }
    } catch (e: any) {
      console.error(`\n❌ Failed post id=${post.id} "${post.post_title}": ${e.message}`);
      skipped++;
    }
  }

  console.log(`\n\n🎉 Migration complete!`);
  console.log(`   ✅ Migrated: ${migrated}`);
  console.log(`   ⚠️  Skipped:  ${skipped}`);

  await connection.end();
  await mongoose.disconnect();
}

migrate().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
