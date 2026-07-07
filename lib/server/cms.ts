/**
 * Blog CMS backend: categories, tags, drafts, publishing, SEO metadata and
 * featured posts. Seeds itself from the existing static blog (lib/blog.ts) so
 * the admin panel can manage the real catalogue immediately. SERVER ONLY.
 */
import { db, uid, helpers } from "./db";
import type { Post } from "./models";

let seeded = false;
async function ensureSeed() {
  if (seeded || db.posts.count() > 0) { seeded = true; return; }
  seeded = true;
  const { POSTS } = await import("@/lib/blog");
  for (const p of POSTS) {
    db.posts.insert({
      id: uid("post"), slug: p.slug, title: p.title, excerpt: p.description,
      body: null, category: p.category, tags: p.keywords?.slice(0, 6) ?? [],
      status: "published", featured: false, seoTitle: p.title, seoDesc: p.description,
      publishedAt: p.date, createdAt: p.date, updatedAt: p.date,
    });
  }
}

export async function listPosts(opts: { status?: string; category?: string; q?: string } = {}): Promise<Post[]> {
  await ensureSeed();
  let rows = db.posts.all();
  if (opts.status) rows = rows.filter((p) => p.status === opts.status);
  if (opts.category) rows = rows.filter((p) => p.category === opts.category);
  if (opts.q) {
    const q = opts.q.toLowerCase();
    rows = rows.filter((p) => p.title.toLowerCase().includes(q) || p.slug.includes(q));
  }
  return rows;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  await ensureSeed();
  return db.posts.find((p) => p.slug === slug) || null;
}

export async function createPost(data: Partial<Post> & { title: string; slug: string }): Promise<Post> {
  await ensureSeed();
  if (db.posts.find((p) => p.slug === data.slug)) throw new Error("slug_taken");
  const post: Post = {
    id: uid("post"), slug: data.slug, title: data.title, excerpt: data.excerpt ?? null,
    body: data.body ?? null, category: data.category ?? null, tags: data.tags ?? [],
    status: data.status ?? "draft", featured: data.featured ?? false,
    seoTitle: data.seoTitle ?? data.title, seoDesc: data.seoDesc ?? data.excerpt ?? null,
    publishedAt: data.status === "published" ? helpers.now() : null,
    createdAt: helpers.now(), updatedAt: helpers.now(),
  };
  db.posts.insert(post);
  return post;
}

export async function updatePost(id: string, patch: Partial<Post>): Promise<Post | null> {
  await ensureSeed();
  const publishedAt = patch.status === "published" ? helpers.now() : undefined;
  return db.posts.update((p) => p.id === id, { ...patch, ...(publishedAt ? { publishedAt } : {}), updatedAt: helpers.now() }) || null;
}

export async function deletePost(id: string): Promise<boolean> {
  await ensureSeed();
  return db.posts.remove((p) => p.id === id) > 0;
}

export async function categories(): Promise<{ name: string; count: number }[]> {
  await ensureSeed();
  const map = new Map<string, number>();
  for (const p of db.posts.all()) if (p.category) map.set(p.category, (map.get(p.category) || 0) + 1);
  return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}
