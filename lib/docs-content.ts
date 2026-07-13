// User-facing product documentation (distinct from the /developers API docs).
// Rendered at /docs (index) and /docs/[slug] (with TechArticle structured data).
// Content authored for QRix (Mission 60).
export type DocSection = { h: string; p: string[] };
export type DocPage = {
  slug: string;
  title: string;
  emoji: string;
  summary: string;
  sections: DocSection[];
};

export const DOC_PAGES: DocPage[] = [
  {
    "slug": "introduction",
    "title": "Introduction to QRix",
    "emoji": "📘",
    "summary": "QRix is a free suite of roughly 187 browser tools for QR codes, PDFs, images, AI, video, and 3D that run entirely on your device.",
    "sections": [
      {
        "h": "What QRix is",
        "p": [
          "QRix is a collection of practical creation and conversion tools that run in your web browser. It brings together roughly 187 tools across six areas — QR codes, PDFs, images, AI, video, and 3D — plus extras like a barcode studio, a link-in-bio builder, and bulk QR generation.",
          "Every tool is free to use, adds no watermark to your output, and requires no account to get started. You open a page, work with your file, and download the result. There is no trial timer, no export cap, and no upsell blocking the download button.",
          "The defining trait is where the work happens. For the browser tools, your files are processed on your own device — they are never uploaded to a server. This is explained in detail in How it works, and it is the reason QRix can be both free and private at the same time."
        ]
      },
      {
        "h": "The categories at a glance",
        "p": [
          "QR Codes cover more than 30 data types, including website links, WiFi logins, contact cards, email, phone, and social profiles, along with a scanner, a bulk generator, a poster maker, and an animated QR maker for stories and reels.",
          "PDF Tools offer 21 utilities to merge, split, compress, convert, rotate, crop, reorder, extract text from, and OCR your documents. Image Tools provide 72 utilities to convert formats, compress, resize, crop, and apply edits and effects.",
          "AI Tools include 28 features such as background removal, upscaling, image generation, transcription, and translation. Video Tools offer 30 utilities to convert, compress, trim, crop, and extract audio, and the 3D category turns a single photo into a downloadable 3D model."
        ]
      },
      {
        "h": "Who it is for",
        "p": [
          "QRix is built for a wide range of people. Marketers and small-business owners use it to make QR codes for menus, packaging, and campaigns without paying a monthly subscription for a single feature.",
          "Designers and content creators use the image and video tools to convert and optimize assets quickly, without installing desktop software or sending client files to an unknown server.",
          "Developers and technical users get accurate, predictable output — real PNG and SVG files, standards-compliant PDFs, and clean media containers — plus a separate developer API portal at /developers for programmatic access."
        ]
      },
      {
        "h": "What makes it different",
        "p": [
          "Most free online tools upload your file to a server, process it there, and often stamp a watermark or gate the download behind a signup. QRix inverts that model: the tool code runs in your browser, so the file stays with you.",
          "That design has real consequences. There is nothing to leak from a server you never touched, no queue to wait in, and no file-size ceiling imposed by an upload limit — the practical limit is your own device's memory.",
          "A small set of AI features are the deliberate exception, since tasks like image generation need models that cannot run in a browser tab. Those are clearly labeled and covered in AI and video tools, so you always know when something leaves your device."
        ]
      },
      {
        "h": "Getting started",
        "p": [
          "Pick a tool from the navigation or search for what you need, such as \"jpg to pdf\" or \"compress image.\" Each tool has its own page with a short explanation and the controls it needs.",
          "Add your input — drop a file onto the page, type a link, or paste text — adjust any settings, and run it. The result appears in the browser, ready to preview and download.",
          "Nothing is saved to your account unless you choose to sign in and use the optional features like favorites and history, which are stored locally in your browser by default. You can start using any browser tool immediately, with no setup."
        ]
      }
    ]
  },
  {
    "slug": "how-it-works",
    "title": "How QRix works: the on-device model",
    "emoji": "⚙️",
    "summary": "QRix tools run inside your browser tab using standard web technologies, so your files are read, processed, and saved locally without ever being uploaded.",
    "sections": [
      {
        "h": "Everything happens in your browser tab",
        "p": [
          "When you open a QRix tool, your browser downloads a small program — the tool's code — the same way it downloads the text and images of any web page. From that point on, the work runs on your computer or phone, inside the browser tab.",
          "When you add a file, the browser reads it into memory on your device. It is not sent anywhere. The tool transforms that in-memory data and hands you the result as a downloadable file. The round trip from input to output happens without a network request carrying your content.",
          "This is different from the typical online converter, where your file is uploaded to a server, processed remotely, and downloaded back. With QRix browser tools there is no upload step, so there is no server-side copy of your file to worry about."
        ]
      },
      {
        "h": "The web platform does the work",
        "p": [
          "Modern browsers include a powerful set of built-in capabilities, and QRix builds on them directly. The File API reads the files you drop in. The Canvas API draws, resizes, crops, recolors, and re-encodes images pixel by pixel — it is the engine behind most of the image and QR rendering.",
          "For video, the browser's MediaRecorder captures frames from a canvas into a real video file, producing MP4 (H.264) where the browser supports it and WebM as a fallback. For audio and animation, dedicated encoders run in the same tab. None of these steps involve a server.",
          "Heavy work is moved off the main thread using Web Workers so the page stays responsive, and the Web Crypto API handles any cryptographic operations locally. These are open web standards implemented by the browser itself, not custom uploads dressed up as local features."
        ]
      },
      {
        "h": "WebAssembly for the heavy jobs",
        "p": [
          "Some tasks are too demanding for ordinary browser scripting — reading text out of a scanned document, or manipulating the internal structure of a PDF. For these, QRix uses WebAssembly, a technology that lets compiled, near-native-speed programs run safely inside the browser sandbox.",
          "Optical character recognition, which turns a picture of text into selectable text, runs as a WebAssembly module (Tesseract) entirely on your device. PDF reading and editing use in-browser PDF engines that parse and rewrite the document locally.",
          "Because WebAssembly runs in the same sandbox as the rest of the page, these engines get speed without getting access to your machine. They see only the file you handed the tool, and only for as long as the tab is open."
        ]
      },
      {
        "h": "Why nothing uploads",
        "p": [
          "The data path is simple and worth understanding. You select a file; the browser's File API loads its bytes into the tab's memory. The tool works on those bytes using Canvas, WebAssembly, or another web API. The finished bytes are wrapped in a local Blob and offered to you as a download.",
          "At no point in that path is there a step that transmits your file to QRix. The tool has everything it needs — the code and your file — already present in the browser. Sending the file out would add latency and risk for no benefit.",
          "You can verify this yourself. Open your browser's developer tools, watch the Network tab, and run a tool: you will see the page and its code load, but not your file being sent. You can even disconnect from the internet after the page loads and most tools keep working."
        ]
      },
      {
        "h": "The deliberate exceptions",
        "p": [
          "A few features genuinely cannot run in a browser tab, chiefly the neural AI tasks such as generating an image from a prompt or producing a 3D model from a photo. These require large machine-learning models that live on cloud servers.",
          "For those specific tools, and only when you run them, the input you provide is sent to an AI provider, processed, and the result returned. QRix labels these clearly and describes them in AI and video tools, so the boundary between on-device and cloud is never hidden.",
          "Everything else — QR generation, PDF editing, image conversion, video encoding, OCR — stays on your device. When in doubt, the rule of thumb is that anything working with a file you already have runs locally, while anything that invents new content from a model uses the cloud."
        ]
      }
    ]
  },
  {
    "slug": "qr-codes-explained",
    "title": "QR codes explained",
    "emoji": "🔳",
    "summary": "A practical guide to how QR codes store data, the difference between static and dynamic codes, error correction, file formats, and sizing codes that scan reliably.",
    "sections": [
      {
        "h": "What a QR code stores",
        "p": [
          "A QR code is a two-dimensional barcode: a grid of black and white squares that encodes data a camera can read. The data can be almost anything short — most commonly a website link, but also plain text, a WiFi login, a phone number, an email, an SMS, or a contact card.",
          "The type of data determines what happens when someone scans it. A URL code opens a browser; a WiFi code offers to join a network; a contact card offers to save a new contact. QRix has a dedicated generator for each of these types, so the code is formatted correctly for the action you want.",
          "More data means a denser grid with more squares, called modules. A short link produces a clean, sparse pattern that scans easily; a long link or a large block of text produces a dense pattern that needs more size and print quality to stay readable."
        ]
      },
      {
        "h": "Static versus dynamic codes",
        "p": [
          "A static QR code contains the destination directly. If it encodes https://example.com, that address is baked into the pattern. It works forever, offline, with no dependency on any service — but you cannot change where it points after it is printed.",
          "A dynamic QR code instead encodes a short redirect link that forwards to your real destination. Because the pattern only holds the redirect, you can change the final destination later, and you can measure how many times it was scanned. The trade-off is that it depends on the redirect service staying online.",
          "Choose static when the destination is permanent and you want zero dependencies — a WiFi password, a phone number, a link you will never change. Choose dynamic when you expect the destination to change or you need scan analytics, such as a campaign or a printed poster you want to repurpose."
        ]
      },
      {
        "h": "Error correction",
        "p": [
          "QR codes have a built-in ability to be read even when partially damaged, dirty, or covered — this is error correction. The standard defines four levels: L recovers about 7 percent of the code, M about 15 percent, Q about 25 percent, and H about 30 percent.",
          "Higher error correction adds redundancy, which makes the grid denser for the same data. The main practical reason to raise the level is to place a logo in the center: the code can lose the covered area and still scan, as long as the logo stays within the recoverable percentage.",
          "For most uses, M is a sound default that balances density and resilience. Use H when you are adding a logo or printing in a harsh environment where the code may get scuffed. Use L only when you need the sparsest possible pattern and the code will live somewhere clean and protected."
        ]
      },
      {
        "h": "PNG versus SVG",
        "p": [
          "QRix exports QR codes as PNG and SVG, and the difference matters. A PNG is a raster image — a fixed grid of pixels. It is universally supported and ideal when you know the final size, such as a web graphic or a social post. Enlarge it too far, though, and the edges soften.",
          "An SVG is a vector image — the code is described as shapes, so it stays perfectly crisp at any size. This is the format to use for print, large-format signage, or anything a designer will scale, because it never blurs and typically has a smaller file size for a simple pattern.",
          "As a rule, hand an SVG to a print shop or a design tool, and use a PNG when you need a ready-to-drop image at a known resolution. Both encode the identical QR data, so they scan the same; the choice is purely about how the image will be sized and reproduced."
        ]
      },
      {
        "h": "Sizing for print",
        "p": [
          "A QR code needs a quiet zone — an empty margin around the pattern, ideally about four modules wide — so the scanner can find its edges. Never crop tight to the squares or place busy artwork right up against them.",
          "Physical size should follow scan distance. A common guideline is a roughly ten-to-one ratio: for every ten units of distance a scanner will be from the code, the code should be about one unit wide. A poster read from ten feet away wants a code around a foot across; a business card read at a few inches can use a code under an inch.",
          "Keep strong contrast — dark pattern on a light background is the safe choice, and inverting it can break some scanners. For print, export vector SVG or a high-resolution PNG, verify the code with a real phone before mass production, and avoid stretching it out of its square proportions."
        ]
      }
    ]
  },
  {
    "slug": "pdf-tools-guide",
    "title": "PDF tools guide",
    "emoji": "📄",
    "summary": "QRix includes 21 PDF tools to merge, split, compress, convert, organize, and extract text from documents, all running privately in your browser.",
    "sections": [
      {
        "h": "The toolkit at a glance",
        "p": [
          "The PDF category covers the everyday document jobs that usually require desktop software or an upload to a stranger's server. You can combine files, break them apart, shrink them, convert to and from images, reorganize pages, and pull text out — 21 tools in total.",
          "Each tool is single-purpose and focused, so the controls stay simple. You add your PDF, set the one or two options that matter, and download the result. There is no account gate and no watermark stamped onto your pages.",
          "Because these are contracts, resumes, invoices, and other sensitive documents, the fact that everything runs on your device is the point. Your file is read into the browser, edited locally, and saved back — it never leaves your computer."
        ]
      },
      {
        "h": "Convert between PDF and images",
        "p": [
          "A large share of PDF work is really format conversion. QRix converts images into a PDF — for example turning a set of JPGs into a single document — and converts PDF pages the other way into image files such as PNG, which is handy for embedding a page into a slide or a web page.",
          "The image-to-PDF direction assembles your pictures into ordered pages at the size you choose. The PDF-to-image direction renders each page faithfully using an in-browser PDF engine, so the output matches how the page actually looks, including fonts and layout.",
          "These conversions are lossless in the sense that they do not phone home. The rendering happens with the same PDF technology browsers use to display documents, running locally in your tab."
        ]
      },
      {
        "h": "Organize and edit pages",
        "p": [
          "When a document is structurally wrong rather than mislabeled, the organizing tools fix it. Merge stitches several PDFs into one in the order you set. Split pulls a range of pages into a new file or breaks a document into pieces.",
          "Reorder rearranges pages by dragging them into the sequence you want. Rotate fixes pages that were scanned sideways or upside down. Crop trims away margins or unwanted edges, and page-removal tools drop pages you do not need.",
          "All of these rewrite the PDF's internal structure directly on your device using an in-browser PDF library, preserving the original text and vector content rather than flattening the page to an image. The result is a real, editable PDF, not a screenshot of one."
        ]
      },
      {
        "h": "Read and extract",
        "p": [
          "Sometimes you need the words, not the document. The PDF-to-text tool extracts the selectable text from a PDF so you can copy it into another program, and it works locally without sending the file anywhere.",
          "For scanned documents — pages that are really images of text with no selectable characters — the OCR tool uses on-device optical character recognition to read the letters out of the picture. This runs as a WebAssembly module in your browser, so even a confidential scan stays private.",
          "Extracted text is a starting point for search, editing, or repurposing content. Accuracy depends on the source: clean digital PDFs extract perfectly, while low-resolution or skewed scans are harder, as they would be for any OCR engine."
        ]
      },
      {
        "h": "Everything stays on your device",
        "p": [
          "The PDF tools are built on established in-browser document engines — one library for reading and rendering pages, another for editing and writing them, and a WebAssembly OCR engine for scans. None of them require a server round trip.",
          "This matters most for exactly the files people are nervous about uploading: signed agreements, financial statements, medical records, and identity documents. With QRix there is no upload, so there is no remote copy and nothing to be retained or exposed.",
          "If you want to confirm it, watch your browser's network activity while you run a PDF tool. The page and its engine load once; after that, your document is processed entirely in the tab, and the download is generated locally."
        ]
      }
    ]
  },
  {
    "slug": "image-tools-guide",
    "title": "Image tools guide",
    "emoji": "🖼️",
    "summary": "A studio of 72 on-device image tools for converting formats, compressing, resizing, cropping, editing, and applying effects using your browser's Canvas engine.",
    "sections": [
      {
        "h": "A full image studio",
        "p": [
          "The image category is the largest in QRix, with 72 tools organized around the jobs people actually do: converting between formats, reducing file size, resizing and cropping, making edits, and applying effects and filters.",
          "The tools share a consistent interface — drop an image in, adjust the settings that matter for that task, and download the result. Many accept several images at once for batch work, and there is a single search and category filter so you can find the right tool quickly.",
          "All of it runs in the browser using the Canvas API, the same technology that powers image editing across the modern web. Your pictures are decoded, transformed, and re-encoded on your device, never uploaded."
        ]
      },
      {
        "h": "Format conversion",
        "p": [
          "Converting between image formats is the most common task, and the choice of format is really a choice about trade-offs. PNG preserves every pixel exactly and supports transparency, which makes it ideal for logos, screenshots, and graphics with sharp edges.",
          "JPG uses lossy compression that produces small files for photographs, at the cost of discarding some detail. WebP and AVIF are modern formats that generally beat both, delivering smaller files at similar quality, and QRix can convert to and from them so you can modernize assets for the web.",
          "Because each conversion decodes the source and re-encodes it locally, you control the trade-off directly. Convert a photo to JPG or WebP to shrink it for a website; convert a graphic to PNG to keep crisp edges and transparency; convert to AVIF when you want the smallest modern-browser-friendly file."
        ]
      },
      {
        "h": "Compression and resizing",
        "p": [
          "Compression and resizing are the fastest ways to make an image lighter. Compression re-encodes the image at a lower quality setting, trading detail you may not notice for a much smaller file — the right lever when the dimensions are fine but the file is too heavy for email or the web.",
          "Resizing changes the pixel dimensions themselves. Shrinking a 6000-pixel-wide camera photo to 1600 pixels for a blog post cuts the file dramatically because there is simply less image to store. Cropping removes area you do not need and reframes the subject.",
          "QRix gives you direct control over quality and dimensions and previews the result, so you can find the point where the file is small enough but still looks right. Since the work is local, you can experiment freely without re-uploading between attempts."
        ]
      },
      {
        "h": "Editing and effects",
        "p": [
          "Beyond format and size, the studio includes editing tools — adjusting brightness, contrast, and color; rotating and flipping; adding borders or rounding corners — and a range of effects and filters for a particular look.",
          "These operate on the pixels through the Canvas engine, applying the transformation and re-encoding the image on the spot. Because there is no upload-process-download cycle, edits feel immediate, and you can chain tools by running the output of one through another.",
          "The effect tools are creative rather than corrective — grayscale, duotone, blur, and similar treatments — useful for thumbnails, social graphics, and quick stylizing without opening heavyweight software."
        ]
      },
      {
        "h": "On-device and metadata-aware",
        "p": [
          "Every image tool processes your picture in the browser. This is a privacy feature as much as a performance one: personal photos, product shots, and design files never touch a server, so there is no remote copy to manage.",
          "It is also worth knowing what happens to metadata. Photos carry hidden EXIF data — camera model, timestamps, and sometimes GPS coordinates. Re-encoding an image through a Canvas-based tool typically drops that embedded data, which is usually what you want before posting a photo publicly.",
          "If you specifically need to inspect or strip metadata, or preserve it, keep that in mind when choosing a tool. As with the rest of QRix, you can confirm the local-only behavior by watching your browser's network tab while a tool runs."
        ]
      }
    ]
  },
  {
    "slug": "ai-and-video-tools",
    "title": "AI and video tools",
    "emoji": "🎬",
    "summary": "Video tools run entirely on your device, while neural AI features route to the cloud and use a monthly credit allowance — here is exactly where the line falls.",
    "sections": [
      {
        "h": "Two kinds of processing",
        "p": [
          "QRix draws a clear line between two kinds of work. On-device processing, which covers all the video tools and most everyday tasks, runs in your browser with no upload. Cloud processing, which covers the neural AI features, sends your input to an AI model running on a server.",
          "The distinction is not arbitrary. Trimming a video, converting a format, or removing a background with classic techniques can be done with code running in your tab. Generating a brand-new image from a text prompt, or reconstructing a 3D model from a single photo, requires large machine-learning models that cannot fit or run in a browser.",
          "Knowing which side a tool sits on tells you what to expect: on-device tools are instant, free, and private; cloud tools take a little longer, use credits, and involve sending your input to a provider. QRix labels the cloud tools so the choice is always informed."
        ]
      },
      {
        "h": "Video tools run on your device",
        "p": [
          "All 30 video tools run locally. They convert between formats, compress footage, trim and cut clips, crop the frame, extract audio, turn a video into a GIF, and turn a GIF or an audio file into a video — without uploading your footage.",
          "The engine behind this is the browser itself. Frames are processed on a canvas and captured with the browser's MediaRecorder into a real video file, producing MP4 with H.264 on browsers that support it and falling back to WebM elsewhere. GIF creation uses a dedicated in-browser encoder.",
          "Because video files are large, keeping the work local is a practical win as well as a privacy one: there is no slow upload of a hundred-megabyte clip and no server-side storage of it. The limit on what you can process is your device's memory, not an upload cap."
        ]
      },
      {
        "h": "AI tools and the cloud",
        "p": [
          "The 28 AI tools include image generation, background removal, upscaling, restoration and enhancement, transcription, translation, and more. Several of the simpler ones — such as OCR — run on-device, but the generative and neural-heavy features route to cloud AI providers.",
          "QRix runs these through an internal AI manager that connects to a chain of providers and prefers free-tier services first, falling back automatically if one is unavailable. From your side this is invisible: you submit your input, the task is routed, and the result comes back.",
          "When an AI provider or model is not yet configured, the tool still presents a complete, working interface with an on-device preview where possible, so the feature is never a dead end. The moment cloud access is enabled, the same tool switches to full neural processing with no change to how you use it."
        ]
      },
      {
        "h": "How credits work",
        "p": [
          "Cloud AI tasks draw on a credit balance, because the underlying providers charge for compute. Every plan includes a monthly allowance: the free plan comes with 60 credits per month, Pro with 1,000, Business with 5,000, and Enterprise with a custom amount.",
          "Different tasks cost different amounts of credits depending on how heavy they are. The image-to-3D tool, for instance, gives you a few free generations and then costs credits per model. On-device tools — all the video tools, QR, PDF, and image work — never consume credits, because they do not use the cloud.",
          "This keeps the platform genuinely free for the vast majority of everyday tasks, while a credit system covers the real cost of the small number of features that depend on external AI compute. You always know before running a cloud task that it is a cloud task."
        ]
      },
      {
        "h": "What we send and what we do not",
        "p": [
          "For an on-device video or AI tool, nothing about your file leaves the browser — the same local model as the rest of QRix. For a cloud AI tool, only the specific input you submit for that run — a prompt, an image, or a photo — is sent to the AI provider to produce the result.",
          "QRix does not send your file anywhere in the background, does not batch-upload your library, and does not use your inputs for anything beyond returning the result you asked for. The cloud call happens only when you press run on a cloud-labeled tool.",
          "If privacy for a particular file is paramount, prefer the on-device tool for the job when one exists — for example, use the local video and image tools freely, and reserve the cloud AI features for the creative tasks that genuinely need them."
        ]
      }
    ]
  },
  {
    "slug": "privacy-and-security",
    "title": "Privacy and security",
    "emoji": "🔒",
    "summary": "QRix processes your files on your device, sets strong browser security headers, and stores only the minimal account and usage data needed to run the service.",
    "sections": [
      {
        "h": "Your files stay on your device",
        "p": [
          "The foundation of QRix privacy is architectural, not a promise: the browser tools have no upload step. Your file is read into the browser tab, processed there with web technologies, and saved back locally, as described in How it works.",
          "This means there is no server-side copy of your document, photo, or video to be stored, leaked, subpoenaed, or breached. The safest data is data that was never collected, and for on-device tools QRix never collects the file at all.",
          "You do not have to take this on faith. Open your browser's developer tools, watch the Network tab, and run any browser tool — you will see the tool's code load, but not your file being transmitted. Many tools even keep working after you go offline."
        ]
      },
      {
        "h": "What we store",
        "p": [
          "QRix stores as little as possible. If you choose to create an account for the optional cloud features, that involves your email and the settings tied to your account. Browsing the site and using the browser tools does not require an account at all.",
          "Convenience features like favorites, recent tools, and history are kept in your browser's local storage by default, on your own device, not on a central server. You can clear them at any time through your browser, and they do not follow you to another machine unless you deliberately sync them.",
          "For product analytics, QRix records coarse, non-identifying signals — such as country, device category, browser, and referrer — to understand usage. Sensitive or personal data is never placed in URLs or query strings, so it does not end up in logs or referrer headers."
        ]
      },
      {
        "h": "Security headers",
        "p": [
          "QRix sets a strong set of HTTP security headers on its pages. Strict-Transport-Security (HSTS) with a two-year max-age, includeSubDomains, and preload forces browsers to always connect over encrypted HTTPS, protecting against downgrade and interception.",
          "X-Frame-Options set to SAMEORIGIN and a Content-Security-Policy of frame-ancestors 'self' prevent other sites from embedding QRix in a hidden frame, which defeats clickjacking. X-Content-Type-Options set to nosniff stops browsers from misinterpreting file types.",
          "Referrer-Policy is set to strict-origin-when-cross-origin so full page addresses are not leaked to other sites, and a Permissions-Policy restricts powerful features — camera is allowed only for QRix's own scanner, while microphone, geolocation, and browsing-topics are switched off. QRix also omits the X-Powered-By header so it does not advertise its stack."
        ]
      },
      {
        "h": "The cloud AI exception",
        "p": [
          "The one place data intentionally leaves your device is the cloud AI features, and only when you run one. In that case the specific input you submit — a prompt or an image — is sent to an AI provider to generate the result, then returned to you.",
          "This is the deliberate exception described in AI and video tools, made necessary because generative models cannot run in a browser. QRix labels these tools clearly so you always know when a task uses the cloud rather than staying local.",
          "QRix does not repurpose these inputs, does not upload your files in the background, and does not send anything to a cloud provider for the on-device tools. If a file must never leave your machine, use an on-device tool for that job — one exists for nearly every non-generative task."
        ]
      },
      {
        "h": "Your controls",
        "p": [
          "Because most of QRix runs locally and requires no account, you are in control by default. There is no signup wall to use the browser tools, no watermark on your output, and no export limit pushing you toward a paid plan.",
          "Local data — favorites, history, and preferences — lives in your browser and can be cleared whenever you like. Account data, if you create an account, is limited to what the optional features need to function.",
          "In short, QRix is built so that the private path is also the default path. For everyday QR, PDF, image, and video work, your data simply never leaves your device, and the few cloud features that do are clearly marked and entirely opt-in."
        ]
      }
    ]
  }
];

export const getDocPage = (slug: string) => DOC_PAGES.find((d) => d.slug === slug);
