// Help Center content. Categories each hold a set of Q&A articles rendered
// at /help (index) and /help/[category] (with FAQPage structured data).
// Content authored for QRix (Mission 60).
export type HelpArticle = { q: string; a: string };
export type HelpCategory = {
  slug: string;
  title: string;
  emoji: string;
  blurb: string;
  articles: HelpArticle[];
};

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    "slug": "getting-started",
    "title": "Getting Started",
    "emoji": "🚀",
    "blurb": "How QRix works, what it costs, and why your files never leave your device.",
    "articles": [
      {
        "q": "Is QRix really free to use?",
        "a": "Yes. Every tool on QRix is 100% free with no hidden charges, no usage caps, and no premium tier locked behind a paywall. You can use any of the tools as many times as you like. There is nothing to buy and no trial that expires."
      },
      {
        "q": "Do I need to create an account or sign in?",
        "a": "No signup, login, or email is required to use any tool. Just open the tool you need and start working. Because everything runs in your browser, there's no account for us to create in the first place."
      },
      {
        "q": "Do my files get uploaded to a server?",
        "a": "No. QRix tools process your files entirely on your device, inside your browser. Your images, PDFs, and documents are never uploaded, stored, or sent anywhere. When you close the tab, nothing is left behind on any server."
      },
      {
        "q": "Will there be a watermark on my results?",
        "a": "Never. QRix does not add watermarks, badges, or branding to anything you create or export. Your QR codes, converted images, and edited PDFs come out clean and ready to use."
      },
      {
        "q": "How do I find the right tool for my task?",
        "a": "Use the search bar at the top of any page to look up a tool by name or keyword, or browse the category pages for QR Codes, PDF, Image, AI, Video, and 3D. Each category groups related tools together with a short description of what they do. You can also start typing what you want to do, such as \"compress image\" or \"merge PDF.\""
      },
      {
        "q": "Do I need to install any software or extensions?",
        "a": "No. QRix runs entirely in your web browser, so there's nothing to download or install. Just visit the site and use any tool directly. It works the same on desktop and mobile without an app."
      },
      {
        "q": "What does \"runs on-device\" actually mean?",
        "a": "It means the tool's processing happens using your computer or phone's own resources, right inside the browser tab, rather than on a remote server. Your files stay on your machine the entire time. This is faster for many tasks and keeps your data completely private."
      },
      {
        "q": "Can I use QRix offline?",
        "a": "Once a tool page has fully loaded, most tools continue to work even if your connection drops, because the processing happens locally. You do need an internet connection to first open the site and load the tool. Refreshing the page while offline may not work until you reconnect."
      }
    ]
  },
  {
    "slug": "qr-codes",
    "title": "QR Codes",
    "emoji": "🔳",
    "blurb": "Create, customize, scan, and download QR codes that work anywhere.",
    "articles": [
      {
        "q": "How do I create a QR code?",
        "a": "Open the QR code generator, choose the type of content you want to encode, such as a URL, text, Wi-Fi, or contact card, and enter your details. The QR code updates live in the preview as you type. When it looks right, download it in your preferred format."
      },
      {
        "q": "What is the difference between static and dynamic QR codes?",
        "a": "A static QR code stores your content directly inside the code itself, so it works forever and never depends on a server. A dynamic QR code points to a short link that can be edited or tracked later, but it relies on that link staying active. QRix generates static QR codes, which means they keep working permanently with no account and no expiration."
      },
      {
        "q": "Do QRix QR codes expire?",
        "a": "No. Because QRix creates static QR codes, the content is baked directly into the code and never expires. There is no subscription to keep it alive and no server that could go offline. A QR code you make today will still scan years from now."
      },
      {
        "q": "Can I use QRix QR codes commercially?",
        "a": "Yes. QR codes you generate are yours to use for any purpose, including business cards, product packaging, menus, flyers, and marketing campaigns. There are no licensing fees, attribution requirements, or usage limits. Print them as many times as you need."
      },
      {
        "q": "How does QR code scanning work?",
        "a": "A scanner or phone camera reads the pattern of black and white squares and decodes the information stored inside. Most modern phones scan QR codes directly from the built-in camera app with no extra software. For best results, make sure the code has good contrast and enough quiet space around its edges."
      },
      {
        "q": "Can I customize the colors and add a logo?",
        "a": "Yes. You can change the foreground and background colors and, depending on the tool, add a logo in the center. Keep strong contrast between the code and its background, and avoid covering too much of the pattern, so scanners can still read it reliably. Always test a customized code before printing it at scale."
      },
      {
        "q": "What format and size should I download for printing?",
        "a": "For print, download the SVG format when available, since it's a vector that stays sharp at any size. If you need a raster image, choose PNG at the largest size offered. As a rule, keep printed QR codes at least about one inch across so cameras can focus on them."
      },
      {
        "q": "Why won't my QR code scan?",
        "a": "The most common causes are low contrast between the code and background, inverted colors (light code on dark background), a logo covering too much of the pattern, or printing it too small. Make sure there's a clear margin of empty space around the code. Test with your own phone before distributing it widely."
      },
      {
        "q": "What can I encode in a QR code?",
        "a": "Common options include a website URL, plain text, a Wi-Fi network, an email address, a phone number, an SMS message, and contact details as a vCard. The more data you encode, the denser the pattern becomes, so keep URLs short where possible. A denser code needs to be printed larger to scan reliably."
      }
    ]
  },
  {
    "slug": "pdf-tools",
    "title": "PDF Tools",
    "emoji": "📄",
    "blurb": "Merge, split, compress, convert, and organize PDFs privately in your browser.",
    "articles": [
      {
        "q": "Are my PDFs uploaded when I use these tools?",
        "a": "No. Every PDF tool processes your document locally in your browser, so your files never leave your device. This keeps sensitive documents like contracts, invoices, and IDs completely private. Nothing is uploaded to or stored on any server."
      },
      {
        "q": "How do I merge several PDFs into one?",
        "a": "Open the Merge PDF tool and add the files you want to combine. Drag them into the order you want, then run the merge and download the single combined file. Everything happens on your device, so even large documents stay private."
      },
      {
        "q": "How do I split a PDF or extract specific pages?",
        "a": "Open the Split PDF tool, load your document, and select the page ranges or individual pages you want to separate. You can pull out a single page or break the file into multiple parts. Then download the resulting files directly."
      },
      {
        "q": "Is there a file size limit?",
        "a": "There's no fixed server limit, since processing happens on your own device. The practical ceiling depends on your device's available memory, so very large files, roughly hundreds of megabytes, may be slow on older phones or low-RAM machines. If a big file struggles, try closing other tabs or splitting it into smaller pieces first."
      },
      {
        "q": "Why is the PDF tool running slowly?",
        "a": "Because the work runs on your device, speed depends on your hardware, the file size, and how many pages or images the PDF contains. Large scanned documents and image-heavy files take longer to process than simple text PDFs. Closing other browser tabs and using a desktop browser usually helps."
      },
      {
        "q": "Can I compress a PDF to make it smaller?",
        "a": "Yes. The Compress PDF tool reduces file size by optimizing the images and structure inside your document, which is useful for email attachments and uploads. You can preview the result and download it if the size and quality look right. As with all QRix tools, the file stays on your device throughout."
      },
      {
        "q": "What formats can I convert PDFs to and from?",
        "a": "Depending on the tool, you can convert PDFs to and from common formats like images (JPG, PNG), and assemble images into a PDF. Check the specific tool page for the exact formats it supports. Each conversion runs locally so your content stays private."
      },
      {
        "q": "How do I reorder or rotate pages in a PDF?",
        "a": "Open the organize or rotate tool, load your PDF, and you'll see thumbnails of each page. Drag pages to reorder them or use the rotate control to fix sideways scans. Save and download the updated document when you're done."
      },
      {
        "q": "Will my formatting and fonts stay intact?",
        "a": "For most operations like merging, splitting, and rotating, the original page content is preserved exactly as-is. Conversions between formats may reflow content depending on the target format, so review the result before using it. When in doubt, keep a copy of your original file."
      }
    ]
  },
  {
    "slug": "image-ai-tools",
    "title": "Image & AI Tools",
    "emoji": "🎨",
    "blurb": "Compress, convert, resize, and enhance images with tools that respect your privacy.",
    "articles": [
      {
        "q": "Do image tools upload my photos?",
        "a": "No. Image tools process your pictures locally in your browser, so your photos are never uploaded or stored on a server. This is true whether you're compressing, resizing, or converting. Your images stay entirely on your device."
      },
      {
        "q": "What image formats are supported?",
        "a": "Most tools support common formats like JPG, PNG, and WebP, and many also handle GIF and SVG depending on the task. Each tool page lists the exact input and output formats it accepts. If you need a specific conversion, search for it by name."
      },
      {
        "q": "How do I compress an image without losing quality?",
        "a": "Open the image compressor, add your photo, and adjust the quality setting to balance file size against sharpness. The preview shows the result before you commit, so you can find the right trade-off. When it looks good, download the optimized file."
      },
      {
        "q": "How do AI tools work if nothing is uploaded?",
        "a": "Many AI-style image tasks run directly in your browser using on-device processing. Some advanced AI features may connect to an external processing service, and where that's the case the tool page will tell you clearly before you proceed. When a tool runs fully on-device, your image never leaves your machine."
      },
      {
        "q": "Is there a limit on image size or resolution?",
        "a": "There's no fixed server limit because processing is local, but very large or high-resolution images use more memory and take longer. On older phones or low-RAM computers, extremely large files may be slow or fail. Resizing down first, or using a desktop browser, usually resolves this."
      },
      {
        "q": "How do I resize an image to specific dimensions?",
        "a": "Open the resize tool, load your image, and enter the target width and height in pixels or a percentage. You can usually lock the aspect ratio to avoid stretching. Preview the result and download it when the dimensions are right."
      },
      {
        "q": "How do I download my edited image?",
        "a": "After processing, a download button appears with the result, and clicking it saves the file to your device's downloads folder. On mobile you may be prompted to save it to your photos or files. The output has no watermark and is ready to use immediately."
      },
      {
        "q": "Can I use the images I create commercially?",
        "a": "Images you compress, resize, or convert remain your own, so you can use them for any purpose you have the rights to. QRix adds no watermark and claims no ownership over your output. Just make sure you have the rights to the original image you started with."
      }
    ]
  },
  {
    "slug": "account-privacy",
    "title": "Account & Privacy",
    "emoji": "🔒",
    "blurb": "Why QRix keeps your data private and how browser-based processing protects you.",
    "articles": [
      {
        "q": "How does QRix protect my privacy?",
        "a": "QRix processes your files on your own device inside the browser, so your documents, images, and data are never uploaded or stored on our servers. There's nothing for us to see, sell, or leak because your content never reaches us. This on-device approach is the core of how QRix keeps your work private."
      },
      {
        "q": "Is it safe to use QRix for sensitive documents?",
        "a": "Yes. Because files like contracts, IDs, and financial statements are processed locally and never leave your device, they stay as private as any other file on your computer. Nothing is transmitted to a server during processing. When you close the tab, no copy remains online."
      },
      {
        "q": "Do I need an account to save my work?",
        "a": "No account exists and none is needed. Since processing is local, you simply download your results directly to your device when you're done. There's nothing stored in the cloud to log into or retrieve later."
      },
      {
        "q": "Does QRix track me or use my data for advertising?",
        "a": "QRix does not collect or sell your files or the content you process, because that content never leaves your browser. Any standard analytics used to keep the site running do not include your document contents. Your actual work stays on your device."
      },
      {
        "q": "What happens to my files after I close the tab?",
        "a": "They're gone from the tool, because they were only ever held temporarily in your browser's memory while you worked. Nothing was uploaded, so there's no server copy to delete. Anything you downloaded stays saved on your device as normal."
      },
      {
        "q": "Which browsers does QRix support?",
        "a": "QRix works on modern browsers including Chrome, Edge, Firefox, and Safari, on both desktop and mobile. For the best experience and full tool compatibility, keep your browser updated to a recent version. Older or unsupported browsers may lack the features some tools rely on."
      },
      {
        "q": "Does QRix work on my phone or tablet?",
        "a": "Yes. The tools are responsive and run in your mobile browser, so you can create QR codes, edit PDFs, and process images on the go. Very large files may perform better on a desktop due to memory, but most everyday tasks work fine on mobile. No app install is required."
      },
      {
        "q": "Do you have a privacy policy or terms I can read?",
        "a": "Yes. You can find the privacy policy and terms of service linked in the site footer on every page. They explain in plain language how the on-device model works and what limited information the site itself handles. If anything is unclear, the documents describe how to get in touch."
      }
    ]
  }
];

export const getHelpCategory = (slug: string) => HELP_CATEGORIES.find((c) => c.slug === slug);
