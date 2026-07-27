/* The three blog cards the homepage paints — and nothing else.
 *
 * app/page.tsx is one giant "use client" component, so every module it imports is
 * in the homepage's eager bundle however far down the page it renders. LatestPosts
 * sits below the fold and shows three cards, but it reached them through
 * allPostsSorted(), which meant lib/blog — 88 KB of source: 60 posts, each with
 * its full body, its sections and its FAQs — downloaded and parsed on every
 * homepage view to read four fields off the top three.
 *
 * The obvious fix is the one the other three catalogs took (M138): defer the
 * import until something asks for it. It is the wrong fix HERE, and the reason is
 * worth keeping. Those three cards are the only /blog/* links in the homepage's
 * server HTML — the site's entire crawlable path from the root into the blog. A
 * dynamic import keyed on a shortcut, a focus or a viewport intersection removes
 * them from the HTML a crawler reads, because a crawler does not press ⌘K, does
 * not focus a box and does not scroll. That trades an indexing asset for bytes.
 *
 * So the data is inlined instead. Four fields × three posts costs ~300 B and the
 * links stay in the server HTML exactly as they are today, with no skeleton, no
 * intersection observer and no chunk that can fail to arrive.
 *
 * The cost is that this can go stale: append a newer post to lib/blog and these
 * three are silently no longer the latest three. That is what
 * `npm run test:home-posts` is for — it asserts this list against
 * allPostsSorted() and prints the corrected block. Run it when you add a post.
 */

import type { BlogPost } from "@/lib/blog";

/** Exactly the fields LatestPosts paints. Derived from BlogPost so a field that
 *  changes shape over there fails typecheck here rather than rendering wrong. */
export type HomePostCard = Pick<BlogPost, "slug" | "title" | "category" | "readMins">;

/** The three most recent posts by date. Generated — see the note above. */
export const HOME_POSTS: HomePostCard[] = [
  {
    slug: "animated-qr-code-for-stories-reels",
    title: "Animated QR Codes for Instagram Stories, Reels & TikTok (Free)",
    category: "QR Codes",
    readMins: 4,
  },
  {
    slug: "compress-video-online-free",
    title: "How to Compress a Video Online Free (No Watermark, No Upload)",
    category: "Video",
    readMins: 5,
  },
  {
    slug: "make-gif-from-video",
    title: "How to Make a GIF from a Video (Free, Right in Your Browser)",
    category: "Video",
    readMins: 4,
  },
];
