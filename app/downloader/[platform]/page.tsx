import { notFound } from "next/navigation";
import Link from "next/link";
import DownloaderClient from "@/components/DownloaderClient";
import { PLATFORMS } from "@/lib/downloader-platforms";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd, faqLd } from "@/lib/seo";

/* Per-platform SEO landing pages: /downloader/tiktok, /downloader/instagram…
   Each page has a unique title, intro, feature set, HowTo and FAQ — all
   statically generated and registered in the sitemap. */

type Copy = {
  title: string;       // <title> + og
  h1: string;
  desc: string;        // meta description
  intro: string;       // paragraph under the h1
  keywords: string[];
  features: [string, string][];      // [heading, body]
  faqs: { q: string; a: string }[];  // platform-specific (generic ones appended)
  steps: [string, string][];         // HowTo
};

const genericSteps = (name: string): [string, string][] => [
  ["Copy the link", `Open the post in the ${name} app or website, tap Share and copy its link.`],
  ["Paste it into QRix", "Drop the link in the box above — QRix instantly finds every downloadable version."],
  ["Pick a format & save", "Choose video (MP4), audio (MP3) or image and it downloads straight to your device."],
];

const COPY: Record<string, Copy> = {
  tiktok: {
    title: "TikTok Video Downloader — No Watermark, Free HD",
    h1: "TikTok Video Downloader (No Watermark)",
    desc: "Download TikTok videos without a watermark in HD, or save just the sound as MP3. Free, fast, no app, no signup — paste the link and save.",
    intro: "Save any public TikTok video in HD with the watermark removed, keep the original sound as an MP3, or grab the watermarked version if you prefer. Works on phone and computer straight from the browser.",
    keywords: ["tiktok video downloader", "tiktok no watermark", "download tiktok video", "tiktok mp3 download", "save tiktok sound", "tiktok downloader hd"],
    features: [
      ["No watermark", "The HD download removes TikTok's floating logo so your saved video is clean."],
      ["Sound as MP3", "Every video's original sound can be saved separately as an MP3 file."],
      ["HD & SD options", "Pick full HD for quality or SD for a smaller file."],
      ["Phone & computer", "Works in any browser — nothing to install on iPhone, Android or PC."],
    ],
    faqs: [
      { q: "How do I download a TikTok video without the watermark?", a: "Copy the video link from the TikTok share menu, paste it above, and choose “Video · HD (no watermark)”. The file saves as a clean MP4." },
      { q: "Can I save only the TikTok sound?", a: "Yes — pick the Audio tab and save the original sound as MP3. Great for reusing sounds in your own edits." },
      { q: "Do private or friends-only TikToks work?", a: "No. Only public videos can be downloaded — private accounts and restricted posts stay private." },
      { q: "Does it work with vt.tiktok.com short links?", a: "Yes. Short share links (vt.tiktok.com / vm.tiktok.com) are resolved automatically." },
    ],
    steps: [
      ["Copy the TikTok link", "In the TikTok app tap Share → Copy link (works with vt.tiktok.com short links too)."],
      ["Paste it into QRix", "The video preview appears with HD no-watermark, SD and MP3 options."],
      ["Save your format", "Tap the format you want — the download starts instantly with live progress."],
    ],
  },
  instagram: {
    title: "Instagram Downloader — Reels, Videos, Photos & MP3",
    h1: "Instagram Reels & Video Downloader",
    desc: "Download Instagram Reels, videos and photos in HD, or extract the audio as MP3. Free online Instagram downloader — no login, no watermark.",
    intro: "Paste a link to any public Reel, video post or photo and save it in original quality. QRix also extracts the audio track as an MP3 — handy for saving trending sounds.",
    keywords: ["instagram video downloader", "download instagram reels", "instagram photo download", "reels to mp3", "save instagram video", "ig downloader"],
    features: [
      ["Reels in HD", "Reels download in their original resolution as MP4 files."],
      ["Photos too", "Photo posts and carousels save as full-size JPGs."],
      ["Audio as MP3", "Extract a Reel's sound as MP3 in one tap."],
      ["No login needed", "You never sign in — QRix only reads the public post."],
    ],
    faqs: [
      { q: "How do I download an Instagram Reel?", a: "Open the Reel, tap Share → Copy link, paste it above and choose Video · HD. The MP4 saves straight to your device." },
      { q: "Can I download Instagram photos?", a: "Yes — photo posts (including carousels) are supported and save in full resolution." },
      { q: "Can I save the audio from a Reel?", a: "Yes. Switch to the Audio tab and save the soundtrack as an MP3 file." },
      { q: "Do Stories or private accounts work?", a: "Only public posts and Reels are supported. Stories and private-account content can't be accessed." },
    ],
    steps: genericSteps("Instagram"),
  },
  facebook: {
    title: "Facebook Video Downloader — Save FB Videos & Reels in HD",
    h1: "Facebook Video Downloader",
    desc: "Download Facebook videos, Reels and Watch clips as MP4 in HD. Free online FB video downloader — paste the link, pick a quality, save.",
    intro: "Save public Facebook videos, Reels and fb.watch clips as MP4 files in the best available quality — no extension, no login, straight from the browser.",
    keywords: ["facebook video downloader", "download facebook video", "fb video download", "facebook reels download", "fb.watch downloader", "save facebook video"],
    features: [
      ["HD MP4", "Videos save in the highest quality Facebook provides."],
      ["Reels & Watch", "Regular posts, Reels and fb.watch links all work."],
      ["No extension", "Everything runs online — nothing added to your browser."],
      ["Fast streaming", "The file streams through QRix with real progress shown."],
    ],
    faqs: [
      { q: "How do I download a Facebook video?", a: "Copy the video's link (or the fb.watch share link), paste it above and choose Video · HD. It saves as an MP4." },
      { q: "Do fb.watch links work?", a: "Yes — fb.watch short links are fully supported." },
      { q: "Can I download from private groups?", a: "No. Only public videos can be read — private group and friends-only videos stay private." },
      { q: "Why does my video have no sound options?", a: "When Facebook serves a combined file, QRix offers the MP4 with sound included; a separate MP3 appears when an audio track is available." },
    ],
    steps: genericSteps("Facebook"),
  },
  twitter: {
    title: "X (Twitter) Video Downloader — Save Videos & GIFs as MP4",
    h1: "X / Twitter Video Downloader",
    desc: "Download videos and GIFs from X (Twitter) as MP4 in HD. Free online Twitter video downloader — paste the post link and save.",
    intro: "Save any video or GIF from a public X (Twitter) post as an MP4. Short t.co links are resolved automatically, and images in posts can be saved too.",
    keywords: ["twitter video downloader", "x video downloader", "download twitter video", "twitter gif download", "save video from x", "t.co video download"],
    features: [
      ["MP4 in HD", "Videos save in the best quality X provides."],
      ["GIFs as video", "Twitter GIFs are real MP4s — QRix saves them ready to share."],
      ["t.co links OK", "Short t.co share links are resolved automatically."],
      ["Images too", "Photos attached to posts can be saved in full size."],
    ],
    faqs: [
      { q: "How do I download a video from X (Twitter)?", a: "Copy the post's link (the tweet URL), paste it above, and choose Video · HD. The MP4 saves instantly." },
      { q: "Do t.co short links work?", a: "Yes — QRix follows the t.co redirect to the real post automatically." },
      { q: "Can I download GIFs?", a: "Yes. Twitter GIFs are actually MP4 videos and download as such." },
      { q: "Do protected accounts work?", a: "No — only public posts can be downloaded." },
    ],
    steps: genericSteps("X"),
  },
  vk: {
    title: "VK Video Downloader — Save VK Videos & Clips (Скачать видео ВК)",
    h1: "VK Video Downloader",
    desc: "Download VK videos and clips as MP4 — vk.com and vkvideo.ru links supported. Free online VK downloader, no login. Скачать видео ВКонтакте бесплатно.",
    intro: "Save public videos and clips from VK (ВКонтакте) as MP4 files. Both vk.com and vkvideo.ru links are supported — paste the link and pick your quality.",
    keywords: ["vk video downloader", "скачать видео вк", "vk video download", "vkvideo.ru download", "скачать клип вк", "download vk clips"],
    features: [
      ["vk.com & vkvideo.ru", "Both VK video domains are recognised automatically."],
      ["Clips supported", "VK Clips (short vertical videos) download as MP4 too."],
      ["Original quality", "Videos save in the best quality VK provides, up to 1080p."],
      ["No VK login", "QRix reads only public videos — you never sign in."],
    ],
    faqs: [
      { q: "How do I download a VK video?", a: "Copy the video's link from VK (vk.com or vkvideo.ru), paste it above, and choose Video · HD. It saves as MP4." },
      { q: "Are VK Clips supported?", a: "Yes — clip links download the same way as regular videos." },
      { q: "Why does a VK link sometimes fail?", a: "Some VK videos are region-locked or limited to logged-in users; those can't be read. Public videos work." },
      { q: "Can I download VK music?", a: "When a video has a separable audio track an MP3 option appears; VK's music streaming service itself is not supported." },
    ],
    steps: genericSteps("VK"),
  },
  ok: {
    title: "OK.ru Video Downloader — Odnoklassniki Videos as MP4",
    h1: "Odnoklassniki (OK.ru) Video Downloader",
    desc: "Download Odnoklassniki (OK.ru) videos as MP4 in HD — free online OK video downloader. Скачать видео с Одноклассников бесплатно.",
    intro: "Save public videos from Odnoklassniki (OK.ru) as MP4 files in up to 1080p. Paste the video link, pick the quality, and it downloads through QRix with live progress.",
    keywords: ["ok.ru video downloader", "odnoklassniki video download", "скачать видео с одноклассников", "ok ru download", "download ok video"],
    features: [
      ["Up to 1080p", "Videos save in the best quality OK.ru provides."],
      ["Simple links", "Any public ok.ru/video/… link works."],
      ["No account", "You never log in — only public videos are read."],
      ["Live progress", "The download streams with a real percentage bar."],
    ],
    faqs: [
      { q: "How do I download an OK.ru video?", a: "Copy the video's link (ok.ru/video/…), paste it above and choose Video · HD. The MP4 saves to your device." },
      { q: "What quality do I get?", a: "The best the video offers — typically 720p or 1080p for modern uploads." },
      { q: "Do private videos work?", a: "No, only public videos. Videos restricted to friends or groups can't be accessed." },
      { q: "Does it work on a phone?", a: "Yes — QRix runs in any mobile browser with no app to install." },
    ],
    steps: genericSteps("OK.ru"),
  },
  pinterest: {
    title: "Pinterest Downloader — Save Videos, Images & Idea Pins",
    h1: "Pinterest Video & Image Downloader",
    desc: "Download Pinterest videos, images and idea pins in original quality — free online Pinterest downloader. pin.it short links supported.",
    intro: "Save any public pin — video pins as MP4, image pins as full-resolution JPG. Short pin.it share links work automatically, and video pins can also give you an MP3 audio track.",
    keywords: ["pinterest video downloader", "pinterest image download", "download pinterest video", "pin.it downloader", "save pinterest gif", "pinterest downloader hd"],
    features: [
      ["Videos & images", "Video pins save as MP4, image pins as original-size JPG."],
      ["pin.it links", "Short share links resolve automatically."],
      ["Original quality", "Images come in full resolution, not thumbnails."],
      ["Audio track", "Video pins with sound can also be saved as MP3."],
    ],
    faqs: [
      { q: "How do I download a Pinterest video?", a: "Copy the pin's link (or the pin.it share link), paste it above and choose Video · HD. It saves as MP4." },
      { q: "Can I save images in full quality?", a: "Yes — image pins download in their original resolution." },
      { q: "Do pin.it short links work?", a: "Yes, they're resolved automatically to the full pin." },
      { q: "Can I download someone's whole board?", a: "Not yet — QRix downloads one pin at a time." },
    ],
    steps: genericSteps("Pinterest"),
  },
  reddit: {
    title: "Reddit Video Downloader — Save v.redd.it Videos with Sound",
    h1: "Reddit Video Downloader",
    desc: "Download Reddit videos with sound as MP4 — v.redd.it, share links and image posts supported. Free online Reddit downloader.",
    intro: "Reddit stores video and audio separately, which is why simple savers give you silent clips — QRix merges them so your MP4 has sound. Post links, share links (reddit.com/…/s/…) and image posts all work.",
    keywords: ["reddit video downloader", "download reddit video with sound", "v.redd.it download", "save reddit video", "reddit gif download", "reddit downloader mp4"],
    features: [
      ["With sound", "Reddit's separate audio track is merged into your MP4."],
      ["Share links OK", "Mobile share links (…/s/…) and redd.it short links resolve automatically."],
      ["Images & GIFs", "i.redd.it images and GIF posts save in original quality."],
      ["Any subreddit", "Works on any public post — no Reddit account needed."],
    ],
    faqs: [
      { q: "How do I download a Reddit video with sound?", a: "Copy the post's link, paste it above and choose Video · HD. QRix merges Reddit's separate video and audio tracks into one MP4." },
      { q: "Do mobile share links work?", a: "Yes — links like reddit.com/r/…/s/… from the mobile app are resolved to the full post automatically." },
      { q: "Why are some Reddit videos silent elsewhere?", a: "Reddit hosts audio and video as separate streams; downloaders that grab only the video stream lose the sound. QRix fetches both." },
      { q: "Do NSFW or private subreddits work?", a: "Only publicly accessible posts can be read; quarantined and private communities can't." },
    ],
    steps: genericSteps("Reddit"),
  },
  snapchat: {
    title: "Snapchat Video Downloader — Save Spotlight & Public Stories",
    h1: "Snapchat Spotlight Downloader",
    desc: "Download Snapchat Spotlight videos and public stories as MP4 — free online Snapchat downloader, no app needed.",
    intro: "Save Spotlight videos and public Snapchat stories as MP4 files. Copy the share link from the Snapchat app, paste it above, and download in original quality.",
    keywords: ["snapchat video downloader", "snapchat spotlight download", "save snapchat video", "download snapchat story", "snapchat downloader online"],
    features: [
      ["Spotlight videos", "Public Spotlight clips save as MP4 in original quality."],
      ["Public stories", "Story links from public profiles are supported."],
      ["t.snapchat links", "Short share links resolve automatically."],
      ["No app", "Everything runs in the browser on phone or computer."],
    ],
    faqs: [
      { q: "How do I download a Spotlight video?", a: "In Snapchat tap Share → Copy link on the Spotlight video, paste it above and choose Video · HD." },
      { q: "Can I save someone's private snaps?", a: "No. Only public Spotlight videos and public stories can be downloaded." },
      { q: "Do t.snapchat.com links work?", a: "Yes — short share links are resolved automatically." },
      { q: "What format do I get?", a: "MP4 video, ready to watch or repost anywhere." },
    ],
    steps: genericSteps("Snapchat"),
  },
  vimeo: {
    title: "Vimeo Video Downloader — Save HD Videos as MP4",
    h1: "Vimeo Video Downloader",
    desc: "Download public Vimeo videos as MP4 in HD — free online Vimeo downloader with audio extraction to MP3.",
    intro: "Save any public Vimeo video as an MP4 in the best available quality, or extract the soundtrack as MP3. Paste the vimeo.com link and pick your format.",
    keywords: ["vimeo video downloader", "download vimeo video", "vimeo to mp4", "vimeo to mp3", "save vimeo video hd"],
    features: [
      ["HD MP4", "Downloads in the highest quality the video offers."],
      ["MP3 extraction", "Save just the audio track when you need the sound."],
      ["Simple links", "Any public vimeo.com/123456789 link works."],
      ["No account", "No Vimeo login, no QRix signup."],
    ],
    faqs: [
      { q: "How do I download a Vimeo video?", a: "Copy the video's vimeo.com link, paste it above, choose Video · HD and it saves as MP4." },
      { q: "Do password-protected videos work?", a: "No — only public videos can be read. Password-protected and private videos stay private." },
      { q: "Can I get just the audio?", a: "Yes, switch to the Audio tab for an MP3 of the soundtrack." },
      { q: "Is there a length limit?", a: "Very long videos may take a while but stream through with live progress." },
    ],
    steps: genericSteps("Vimeo"),
  },
  soundcloud: {
    title: "SoundCloud to MP3 Downloader — Save Tracks Free",
    h1: "SoundCloud to MP3 Downloader",
    desc: "Download SoundCloud tracks as MP3 files — free online SoundCloud downloader with cover art preview. Paste the track link and save.",
    intro: "Turn any public SoundCloud track into an MP3 you can keep offline. Paste the track's link, see the cover art and artist, and save the audio in one tap.",
    keywords: ["soundcloud to mp3", "soundcloud downloader", "download soundcloud track", "soundcloud mp3 converter", "save soundcloud song"],
    features: [
      ["Straight to MP3", "Tracks save as MP3 files that play anywhere."],
      ["Cover art preview", "See the artwork, title and artist before saving."],
      ["Playlists coming", "Individual tracks now; playlist support is planned."],
      ["No signup", "No SoundCloud login and no QRix account needed."],
    ],
    faqs: [
      { q: "How do I download a SoundCloud track?", a: "Copy the track's link, paste it above and tap Save on the Audio · MP3 row." },
      { q: "What quality is the MP3?", a: "The standard 128 kbps stream SoundCloud serves — the same quality you hear on the site." },
      { q: "Do private tracks or Go+ songs work?", a: "No. Only public, freely streamable tracks can be saved; Go+ exclusive content is protected." },
      { q: "Can I download a whole playlist?", a: "Not yet — paste tracks one at a time for now." },
    ],
    steps: [
      ["Copy the track link", "On SoundCloud tap Share → Copy link on any public track."],
      ["Paste it into QRix", "The track appears with its cover art, title and artist."],
      ["Save the MP3", "Tap Save on the Audio · MP3 row — done."],
    ],
  },
  twitch: {
    title: "Twitch Clip Downloader — Save Clips & Highlights as MP4",
    h1: "Twitch Clip Downloader",
    desc: "Download Twitch clips and highlights as MP4 in source quality — free online Twitch clip downloader.",
    intro: "Save Twitch clips and highlights as MP4 files in source quality. Paste a clips.twitch.tv or twitch.tv link and download in seconds.",
    keywords: ["twitch clip downloader", "download twitch clips", "save twitch clip", "twitch to mp4", "twitch highlight download"],
    features: [
      ["Source quality", "Clips save exactly as they look on Twitch."],
      ["Clips & highlights", "clips.twitch.tv and channel highlight links both work."],
      ["Fast", "Clips are short — downloads usually finish in seconds."],
      ["No login", "No Twitch account connection required."],
    ],
    faqs: [
      { q: "How do I download a Twitch clip?", a: "Copy the clip's link (Share → Copy link), paste it above and choose Video · HD." },
      { q: "Can I download full VODs?", a: "Clips and highlights work best; very long VODs may not be supported." },
      { q: "Do sub-only VODs work?", a: "No — only publicly viewable content can be read." },
      { q: "What format do I get?", a: "MP4, ready for editing or reposting." },
    ],
    steps: genericSteps("Twitch"),
  },
  dailymotion: {
    title: "Dailymotion Video Downloader — Free HD MP4",
    h1: "Dailymotion Video Downloader",
    desc: "Download Dailymotion videos as MP4 in HD — free online downloader, dai.ly short links supported.",
    intro: "Save public Dailymotion videos as MP4 files in up to 1080p. Full links and dai.ly short links are both recognised automatically.",
    keywords: ["dailymotion video downloader", "download dailymotion video", "dai.ly download", "dailymotion to mp4", "save dailymotion video"],
    features: [
      ["Up to 1080p", "Videos save in the best quality available."],
      ["dai.ly links", "Short links resolve automatically."],
      ["MP3 option", "Extract the audio track when available."],
      ["No account", "No login on either side."],
    ],
    faqs: [
      { q: "How do I download a Dailymotion video?", a: "Copy the video link (or dai.ly short link), paste it above and choose Video · HD." },
      { q: "Do age-restricted videos work?", a: "Only publicly viewable videos can be read." },
      { q: "Can I get the audio only?", a: "Yes — an MP3 option appears when the audio track is separable." },
      { q: "Is there a limit?", a: "A fair-use limit of 40 downloads per hour keeps the service fast for everyone." },
    ],
    steps: genericSteps("Dailymotion"),
  },
  threads: {
    title: "Threads Video Downloader — Save Videos & Photos",
    h1: "Threads Video & Photo Downloader",
    desc: "Download videos and photos from Threads posts as MP4 and JPG — free online Threads downloader.",
    intro: "Save videos and photos from any public Threads post. Paste the post link and QRix pulls the media in original quality.",
    keywords: ["threads video downloader", "download threads video", "threads photo download", "save threads video", "threads downloader online"],
    features: [
      ["Videos as MP4", "Post videos save in original quality."],
      ["Photos as JPG", "Images download full-size, including carousels."],
      ["threads.net & .com", "Both Threads domains are recognised."],
      ["No login", "Only public posts are read — no account needed."],
    ],
    faqs: [
      { q: "How do I download a Threads video?", a: "Copy the post's link (Share → Copy link), paste it above and choose Video · HD." },
      { q: "Do photos work too?", a: "Yes — photos and photo carousels save as full-size JPGs." },
      { q: "Do private profiles work?", a: "No, only public posts can be downloaded." },
      { q: "Can I save the audio?", a: "When a video has a separable soundtrack, an MP3 option appears." },
    ],
    steps: genericSteps("Threads"),
  },
  tumblr: {
    title: "Tumblr Video Downloader — Save Videos, GIFs & Photos",
    h1: "Tumblr Video & GIF Downloader",
    desc: "Download Tumblr videos, GIFs and photos in original quality — free online Tumblr downloader.",
    intro: "Save media from any public Tumblr post — videos as MP4, GIFs and photos in their original quality. Just paste the post link.",
    keywords: ["tumblr video downloader", "download tumblr video", "tumblr gif download", "save tumblr photo", "tumblr downloader online"],
    features: [
      ["Videos & GIFs", "Post videos save as MP4; GIFs keep their format."],
      ["Photos full-size", "Photo posts download in original resolution."],
      ["Any blog", "Works with custom blog domains on tumblr.com."],
      ["No account", "Public posts only — no login required."],
    ],
    faqs: [
      { q: "How do I download a Tumblr video?", a: "Copy the post's link, paste it above and choose Video · HD." },
      { q: "Do GIFs stay GIFs?", a: "Yes — GIF posts download in their original format." },
      { q: "Do private or dashboard-only blogs work?", a: "No, only publicly visible posts." },
      { q: "Does it work on mobile?", a: "Yes — everything runs in the browser on any device." },
    ],
    steps: genericSteps("Tumblr"),
  },
  bilibili: {
    title: "Bilibili Video Downloader — Save 哔哩哔哩 Videos as MP4",
    h1: "Bilibili Video Downloader",
    desc: "Download Bilibili videos as MP4 — free online 哔哩哔哩 downloader, b23.tv short links supported.",
    intro: "Save public Bilibili videos as MP4 files. Full bilibili.com links and b23.tv short links both work — paste and download.",
    keywords: ["bilibili video downloader", "download bilibili video", "b23.tv download", "bilibili to mp4", "哔哩哔哩 下载"],
    features: [
      ["MP4 downloads", "Videos save in the best freely available quality."],
      ["b23.tv links", "Short share links resolve automatically."],
      ["Audio option", "Extract the soundtrack as MP3 when available."],
      ["No account", "No Bilibili login needed for public videos."],
    ],
    faqs: [
      { q: "How do I download a Bilibili video?", a: "Copy the video link (or b23.tv share link), paste it above and choose Video · HD." },
      { q: "Do member-only videos work?", a: "No — only publicly viewable videos can be saved." },
      { q: "What about multi-part videos?", a: "The linked part downloads; paste each part's link for the rest." },
      { q: "Can I get just the audio?", a: "Yes, an MP3 option appears when the audio is separable." },
    ],
    steps: genericSteps("Bilibili"),
  },
};

const GENERIC_FAQS = [
  { q: "Is this downloader free?", a: "Yes — completely free, no signup, no watermark added, and no software to install." },
  { q: "Is it legal to download?", a: "Downloading for personal offline use of content you have rights to is generally fine. Don't re-upload other people's work without permission — QRix hosts no media and only passes files through." },
];

export function generateStaticParams() {
  return PLATFORMS.map((p) => ({ platform: p.id }));
}

/* Params outside the registry must 404, not render an empty 200 page. */
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const copy = COPY[platform];
  if (!copy) return {};
  return pageMeta({
    title: copy.title,
    description: copy.desc,
    path: `/downloader/${platform}`,
    keywords: copy.keywords,
    languages: { en: `/downloader/${platform}`, ru: `/ru/downloader/${platform}`, uz: `/uz/downloader/${platform}`, "x-default": `/downloader/${platform}` },
  });
}

export default async function PlatformDownloaderPage({ params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const p = PLATFORMS.find((x) => x.id === platform);
  const copy = COPY[platform];
  if (!p || !copy) notFound();

  const faqs = [...copy.faqs, ...GENERIC_FAQS];
  const others = PLATFORMS.filter((x) => x.id !== platform);

  return (
    <>
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd(copy.title, copy.desc, `/downloader/${platform}`),
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Downloader", path: "/downloader" }, { name: p.name, path: `/downloader/${platform}` }]),
          faqLd(faqs),
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: `How to download from ${p.name}`,
            step: copy.steps.map(([name, text], i) => ({ "@type": "HowToStep", position: i + 1, name, text })),
          },
        ])} />

      <main className="max-w-3xl mx-auto px-5 lg:px-8 pt-10 lg:pt-16 pb-24">
        <nav className="text-[12px] mb-4" style={{ color: "var(--text-faint)" }}>
          <Link href="/" className="hover:underline">Home</Link> <span className="mx-1">›</span>
          <Link href="/downloader" className="hover:underline">Downloader</Link> <span className="mx-1">›</span> {p.name}
        </nav>

        <header className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 block shrink-0" aria-hidden dangerouslySetInnerHTML={{ __html: p.svg }} />
            <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
              {copy.h1}
            </h1>
          </div>
          <p className="text-[14.5px]" style={{ color: "var(--text-muted)" }}>{copy.intro}</p>
        </header>

        <DownloaderClient placeholder={`Paste a ${p.name} link…`} />

        {/* how to */}
        <section className="mt-12">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>How to download from {p.name}</h2>
          <ol className="space-y-3">
            {copy.steps.map(([h, body], i) => (
              <li key={h} className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold text-white" style={{ background: "var(--grad-primary)" }}>{i + 1}</span>
                <div><b style={{ color: "var(--text)" }}>{h}.</b> <span style={{ color: "var(--text-muted)" }}>{body}</span></div>
              </li>
            ))}
          </ol>
        </section>

        {/* features */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>Why QRix for {p.name}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {copy.features.map(([h, body]) => (
              <div key={h} className="qx-card p-4">
                <h3 className="font-bold text-[14px] mb-1" style={{ color: "var(--text)" }}>{h}</h3>
                <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* faq */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>Frequently asked questions</h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="qx-card p-4">
                <summary className="font-bold text-[14px] cursor-pointer" style={{ color: "var(--text)" }}>{f.q}</summary>
                <p className="mt-2 text-[13.5px]" style={{ color: "var(--text-muted)" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* other platforms */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>Download from other platforms</h2>
          <div className="flex flex-wrap gap-2.5">
            {others.map((o) => (
              <Link key={o.id} href={`/downloader/${o.id}`}
                className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full text-[12.5px] font-semibold transition-colors hover:opacity-80"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                <span className="w-5 h-5 block" aria-hidden dangerouslySetInnerHTML={{ __html: o.svg }} /> {o.name}
              </Link>
            ))}
            <Link href="/downloader" className="inline-flex items-center px-3 py-1.5 rounded-full text-[12.5px] font-bold"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-hover)", color: "var(--primary-bright)" }}>
              All platforms →
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
