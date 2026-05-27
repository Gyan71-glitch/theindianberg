import Link from "next/link";
import Image from "next/image";
import { getPostsBySection, getUniqueTags } from "@/lib/posts";
import { ArrowRight, Play, Eye, Flame } from "lucide-react";
import { AdBanner } from "@/components/ads/AdBanner";
import { StockTicker } from "@/components/layout/StockTicker";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch all sections in parallel
  const [
    newsFlash,
    mainFeed,
    featured,
    opinions,
    ledger,
    visual,
    politics,
    style
  ] = await Promise.all([
    getPostsBySection('news_flash'),
    getPostsBySection('main_feed'),
    getPostsBySection('featured'),
    getPostsBySection('opinions'),
    getPostsBySection('ledger'),
    getPostsBySection('visual'),
    getPostsBySection('politics'),
    getPostsBySection('style')
  ]);

  const hero = mainFeed[0];
  const centerStories = mainFeed.slice(1, 4);
  const sideStories = mainFeed.slice(4, 11);
  const ledgerStories = ledger.slice(0, 4);

  // High-reliability fallback images (IDs that are guaranteed to be up)
  const STABLE_IMG = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="w-full bg-white dark:bg-black font-sans pb-20 selection:bg-red-100 selection:text-red-900">

      {/* 1. NEWS FLASH (RED TICKER) */}
      {newsFlash.length > 0 && (
        <div className="bg-[#B00000] text-white py-2 lg:py-2.5 overflow-hidden border-b border-red-900 group mb-2 lg:mb-4">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 grid grid-cols-[auto_1fr] items-center gap-0">
            {/* 1. Static Label Area */}
            <div className="relative z-30 bg-[#B00000] pr-4 lg:pr-6 flex items-center">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-white text-[#B00000] rounded-sm shadow-md flex-shrink-0">
                <span className="relative flex h-1.5 w-1.5 lg:h-2 lg:w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 lg:h-2 lg:w-2 bg-red-600"></span>
                </span>
                <span className="text-[9px] lg:text-[11px] font-black uppercase tracking-[0.2em]">Live</span>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-4 lg:w-6 bg-gradient-to-r from-[#B00000] to-transparent"></div>
            </div>

            {/* 2. Marquee Clipping Area */}
            <div className="overflow-hidden relative flex items-center h-full">
              <div className="flex gap-12 lg:gap-16 animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused]">
                {[...newsFlash, ...newsFlash].map((post: any, i: number) => (
                  <Link key={i} href={`/article/${post._id}`} className="text-[12px] lg:text-[13px] font-bold hover:underline underline-offset-4 decoration-1">
                    {post.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}


      <main className="max-w-[1600px] mx-auto px-4 md:px-8 pt-4 lg:pt-6">
        <AdBanner type="leaderboard" className="mb-8 lg:mb-12" />

        {/* 2. MAIN EDITORIAL GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 border-b border-zinc-200 dark:border-zinc-800 pb-12 lg:pb-16">

          {/* LEFT: LATEST (Clean, minimalist list) */}
          <div className="lg:col-span-3 space-y-8 lg:space-y-10 order-2 lg:order-1 lg:border-r lg:border-zinc-100 dark:lg:border-zinc-900 lg:pr-8">
            <div className="flex items-center justify-between border-b border-black dark:border-white pb-2 mb-6">
              <h3 className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-100">Latest Coverage</h3>
            </div>
            {sideStories.map((post: any, i: number) => (
              <article key={i} className="group pb-6 lg:pb-8 border-b border-zinc-50 dark:border-zinc-900 last:border-0 last:pb-0 flex flex-row lg:flex-col gap-4">
                <Link href={`/article/${post._id}`} className="flex-1">
                  <span className="text-[9px] lg:text-[10px] font-bold uppercase text-red-700 dark:text-red-500 tracking-widest mb-1 lg:mb-2 block">{(post.tag || "Archive").replace(/_/g, ' ')}</span>
                  <h4 className="font-serif font-bold text-[16px] lg:text-[18px] leading-[1.2] lg:leading-[1.15] tracking-tight group-hover:text-zinc-500 transition-colors mb-2">
                    {post.title}
                  </h4>
                </Link>
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-full lg:aspect-[3/2] overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex-shrink-0">
                  <Image
                    src={post.imageUrl || STABLE_IMG}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 80px, (max-width: 1024px) 100px, 300px"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </article>
            ))}
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 px-0 lg:px-2">
            {hero && (
              <article className="group mb-12 lg:mb-16 border-b border-zinc-200 dark:border-zinc-800 pb-8 lg:pb-12">
                <Link href={`/article/${hero._id}`}>
                  <div className="relative aspect-[16/10] mb-6 lg:mb-8 overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-sm">
                    <Image
                      src={hero.imageUrl || STABLE_IMG}
                      alt={hero.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      priority
                    />
                  </div>
                  <h2 className="font-serif text-[32px] sm:text-[44px] md:text-[62px] font-black leading-[1] md:leading-[0.9] tracking-tighter mb-4 lg:mb-6 group-hover:text-red-700 transition-colors decoration-red-700 hover:underline underline-offset-[10px]">
                    {hero.title}
                  </h2>
                  <p className="font-serif italic text-lg md:text-xl lg:text-[24px] text-zinc-700 dark:text-zinc-300 mb-6 lg:mb-8 leading-snug md:leading-[1.2] max-w-[95%]">
                    {hero.excerpt || hero.description}
                  </p>
                  <div className="flex items-center gap-4 text-[12px] font-bold uppercase tracking-widest text-zinc-400 border-t border-zinc-100 dark:border-zinc-900 pt-4">
                    <span className="text-zinc-900 dark:text-zinc-100">By {hero.author || "The Indianberg Staff"}</span>
                    <span>•</span>
                    <span className="italic">{hero.timeAgo || "Updated moments ago"}</span>
                  </div>
                </Link>
              </article>
            )}

            {centerStories.map((story: any, i: number) => (
              <article key={i} className="group pt-8 lg:pt-10 border-t-2 border-black dark:border-white flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-6 lg:gap-8 mb-8 lg:mb-10 last:mb-0">
                <div className="flex-1">
                  <Link href={`/article/${story._id}`}>
                    <div className="relative aspect-[4/3] mb-4 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                      <Image
                        src={story.imageUrl || STABLE_IMG}
                        alt={story.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h3 className="font-serif font-black text-[22px] lg:text-[24px] leading-[1.1] mb-3 group-hover:text-red-700 transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-[14px] lg:text-[15px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-4">
                      {story.excerpt || story.description}
                    </p>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* RIGHT: OPINIONS (Editorial board style) */}
          <div className="lg:col-span-3 space-y-8 order-3 lg:border-l lg:border-zinc-100 dark:lg:border-zinc-900 lg:pl-8">
            <div className="flex items-center justify-between border-b-2 border-red-700 pb-2 mb-6 lg:mb-8">
              <h3 className="text-[11px] lg:text-[12px] font-black uppercase tracking-[0.2em] text-red-700">Opinions</h3>
            </div>
            {opinions.slice(0, 15).map((post: any, i: number) => (
              <article key={i} className="group border-b border-zinc-100 dark:border-zinc-900 pb-5 lg:pb-6 last:border-0 flex items-start gap-4 lg:gap-5">
                <div className="flex-1">
                  <Link href={`/article/${post._id}`}>
                    <div className="mb-2 text-[10px] lg:text-[11px] font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest border-l-2 border-red-600 pl-2">
                      {post.author || "Editorial Board"}
                    </div>
                    <h4 className="font-serif font-bold text-[17px] lg:text-[18px] leading-[1.2] group-hover:text-red-700 transition-colors tracking-tight">
                      {post.title}
                    </h4>
                  </Link>
                </div>
                {/* Author Portrait */}
                <div className="relative w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex-shrink-0 grayscale group-hover:grayscale-0 transition-all">
                  <Image
                    src={post.authorImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author || "EB")}&background=random`}
                    alt={post.author || "Author"}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* In-Feed Ad */}
        <AdBanner type="in-feed" className="py-8 lg:py-12 border-y border-zinc-100 dark:border-zinc-900" />

        {/* 4. MULTI-SECTION GRID (Ledger & Style) */}
        <section className="py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 border-b border-zinc-200 dark:border-zinc-800">

          {/* Ledger Section (Left) */}
          <div className="lg:col-span-8">
            <h3 className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest mb-6 lg:mb-8 border-b border-black dark:border-white pb-1 inline-block">The Business Ledger</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {ledgerStories.map((post: any, i: number) => (
                <article key={i} className="flex gap-4 lg:gap-5 group border-b border-zinc-100 dark:border-zinc-900 pb-5 lg:pb-6 last:border-0 last:pb-0">
                  <div className="relative w-24 h-16 lg:w-28 lg:h-20 overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex-shrink-0">
                    <Image
                      src={post.imageUrl || STABLE_IMG}
                      alt={post.title}
                      fill
                      sizes="120px"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex-1">
                    <Link href={`/article/${post._id}`}>
                      <h4 className="font-serif font-bold text-[16px] lg:text-[17px] leading-snug group-hover:text-red-700 transition-colors mb-2">
                        {post.title}
                      </h4>
                    </Link>
                    <p className="text-[12px] lg:text-[13px] text-zinc-500 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Style Section (Right) */}
          <div className="lg:col-span-4 lg:pl-8 lg:border-l lg:border-zinc-100 dark:lg:border-zinc-900">
            <h3 className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest mb-6 lg:mb-8 border-b border-black dark:border-white pb-1 inline-block">The Style Section</h3>
            <div className="space-y-8 lg:space-y-10">
              {style.slice(0, 3).map((post: any, i: number) => (
                <article key={i} className="group">
                  <div className="relative aspect-[16/9] mb-4 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    <Image src={post.imageUrl || STABLE_IMG} alt={post.title} fill sizes="(max-width: 1024px) 100vw, 400px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <Link href={`/article/${post._id}`}>
                    <h4 className="font-serif font-black text-[18px] lg:text-[20px] leading-tight group-hover:text-red-700 transition-colors tracking-tight">
                      {post.title}
                    </h4>
                  </Link>
                  <p className="mt-2 text-[12px] lg:text-[13px] text-zinc-500 leading-relaxed line-clamp-2">{post.excerpt}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 5. POLITICS & MORE TOP STORIES */}
        <section className="py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 border-b border-zinc-200 dark:border-zinc-800">
          <div className="lg:col-span-8">
            <h3 className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest mb-6 lg:mb-8 border-b border-black dark:border-white pb-1 inline-block">Policy & Politics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {politics.slice(0, 6).map((post: any, i: number) => (
                <article key={i} className="group border-b border-zinc-100 dark:border-zinc-900 pb-5 last:border-0 flex gap-4">
                  <div className="flex-1">
                    <Link href={`/article/${post._id}`}>
                      <h4 className="font-serif font-black text-[16px] lg:text-[17px] leading-tight group-hover:text-red-700 transition-colors tracking-tight">
                        {post.title}
                      </h4>
                    </Link>
                    <div className="mt-2 text-[9px] lg:text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{post.timeAgo}</div>
                  </div>
                  <div className="relative w-16 h-16 lg:w-20 lg:h-20 overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex-shrink-0">
                    <Image
                      src={post.imageUrl || STABLE_IMG}
                      alt={post.title}
                      fill
                      sizes="80px"
                      className="object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 lg:pl-8 lg:border-l lg:border-zinc-100 dark:lg:border-zinc-900 mt-8 lg:mt-0">
            <div className="bg-zinc-50 dark:bg-zinc-950 p-6 border border-zinc-100 dark:border-zinc-900 rounded-sm">
              <h4 className="text-lg font-serif font-black mb-3">The Briefing</h4>
              <p className="text-[12px] lg:text-[13px] text-zinc-500 mb-5 leading-relaxed">The only intelligence briefing you need to start your day. Delivered at 6 AM.</p>
              <div className="flex flex-col gap-2">
                <input type="email" placeholder="Email address" className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-red-700 transition-colors" />
                <button className="bg-black dark:bg-white text-white dark:text-black py-2.5 text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:bg-red-700 hover:text-white transition-all">Sign Up</button>
              </div>
            </div>
          </div>
        </section>

        {/* 6. MORE TOP STORIES (WP Style Footer List) */}
        <section className="py-12 lg:py-16">
          <div className="flex items-center gap-3 mb-8 lg:mb-10">
            <div className="w-1.5 h-5 lg:h-6 bg-black dark:bg-white" />
            <h3 className="text-[12px] lg:text-[14px] font-black uppercase tracking-[0.2em]">More Top Stories</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10 lg:gap-y-12">
            {[...ledger, ...politics, ...style].slice(4, 12).map((post: any, i: number) => (
              <article key={i} className="group flex flex-col">
                <div className="relative aspect-[3/2] mb-4 lg:mb-5 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                  <Image src={post.imageUrl || STABLE_IMG} alt={post.title} fill sizes="(max-width: 768px) 100vw, 300px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <Link href={`/article/${post._id}`}>
                  <h4 className="font-serif font-bold text-[17px] lg:text-[18px] leading-tight group-hover:text-red-700 transition-colors mb-2 lg:mb-3">
                    {post.title}
                  </h4>
                </Link>
                <p className="text-[12px] lg:text-[13px] text-zinc-500 line-clamp-3 leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-900 text-[9px] lg:text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  {(post.tag || "World").replace(/_/g, ' ')} • {post.timeAgo || "Updated"}
                </div>
              </article>
            ))}
          </div>
          <div className="mt-12 lg:mt-16 flex justify-center">
            <button className="border-2 border-black dark:border-white px-8 lg:px-10 py-3 text-[10px] lg:text-[11px] font-black uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
              Load More Stories
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}