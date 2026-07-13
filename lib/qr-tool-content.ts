// Per-QR-tool FAQ + use-case content, keyed by slug. Kept separate from
// qr-tools-meta.ts so the registry stays lean; merged in at module load.
// Content authored for QRix (Mission 60).
export type QrContent = { faqs: { q: string; a: string }[]; useCases: string[] };

export const QR_CONTENT: Record<string, QrContent> = {
  "url": {
    "faqs": [
      {
        "q": "Does the QR code still work if I change my website later?",
        "a": "The link is encoded directly into the code, so the destination is fixed. If you move the page, generate a new QR code for the new address."
      },
      {
        "q": "Do I need to include https:// in my link?",
        "a": "Yes, include the full address starting with https:// so phones open it reliably. A bare domain like example.com may open as a search on some devices."
      },
      {
        "q": "Is there a limit on how long the URL can be?",
        "a": "Longer links produce denser codes that are harder to scan, so keep URLs short. Trim tracking parameters or use a clean, direct link where possible."
      }
    ],
    "useCases": [
      "Link a product package to its online manual",
      "Send event posters straight to a registration page",
      "Add a scan-to-review link on restaurant receipts",
      "Point business cards to your portfolio site"
    ]
  },
  "text": {
    "faqs": [
      {
        "q": "What happens when someone scans a text QR code?",
        "a": "The phone displays the plain text on screen without opening any app or website. It is ideal for messages, codes, or notes that do not need a link."
      },
      {
        "q": "Does the text need an internet connection to read?",
        "a": "No, the message is stored inside the code itself, so it displays even fully offline. Nothing is fetched from a server."
      },
      {
        "q": "How much text can I fit in one code?",
        "a": "Short text scans best; long passages create a dense code that is slow to read. Keep it to a sentence or two for reliable scanning."
      }
    ],
    "useCases": [
      "Print serial numbers or asset IDs on equipment",
      "Share a WiFi password as readable text",
      "Add care instructions to product tags",
      "Post a short notice on office doors"
    ]
  },
  "email": {
    "faqs": [
      {
        "q": "What does scanning an email QR code do?",
        "a": "It opens the phone's mail app with the recipient, subject, and message already filled in. The person only needs to press send."
      },
      {
        "q": "Can I pre-fill the subject and body?",
        "a": "Yes, you can set the recipient address, subject line, and message text in advance. The sender can edit any field before sending."
      },
      {
        "q": "Does it send the email automatically when scanned?",
        "a": "No, it only drafts the message in the mail app. The person always reviews and sends it manually."
      }
    ],
    "useCases": [
      "Let customers email support with one scan",
      "Collect job applications at a career fair",
      "Add a pre-filled inquiry code to flyers",
      "Request quotes from a printed catalog"
    ]
  },
  "phone": {
    "faqs": [
      {
        "q": "Does scanning start the call automatically?",
        "a": "No, it opens the dialer with your number pre-entered so the person can tap call. This prevents accidental calls."
      },
      {
        "q": "Should I include the country code?",
        "a": "Yes, add the full international number with country code so it works for anyone, anywhere. For example, use +1 for the United States."
      },
      {
        "q": "Will it work on both iPhone and Android?",
        "a": "Yes, any modern phone camera reads it and offers to dial the number. No special app is required."
      }
    ],
    "useCases": [
      "Add a tap-to-call number on real estate signs",
      "Put a booking hotline on service vans",
      "Let event guests reach the front desk fast",
      "Print a support number on product packaging"
    ]
  },
  "sms": {
    "faqs": [
      {
        "q": "What happens when someone scans an SMS QR code?",
        "a": "It opens the messaging app with your number and a pre-written text ready to send. The person just presses send."
      },
      {
        "q": "Can I set the message text in advance?",
        "a": "Yes, you can pre-fill both the recipient number and the message body. This is useful for keywords or opt-in replies."
      },
      {
        "q": "Does the recipient pay for the message?",
        "a": "The person scanning sends the text from their own phone at their normal messaging rate. You do not control their carrier charges."
      }
    ],
    "useCases": [
      "Enable text-to-join for loyalty programs",
      "Collect feedback with a pre-filled keyword",
      "Let guests RSVP by scanning an invitation",
      "Trigger opt-in replies from printed ads"
    ]
  },
  "wifi": {
    "faqs": [
      {
        "q": "How does a WiFi QR code connect people to my network?",
        "a": "It stores the network name, password, and encryption type, so scanning offers to join instantly. Guests connect without typing the password."
      },
      {
        "q": "Which encryption type should I choose?",
        "a": "Pick WPA/WPA2 for most modern routers, or select None for open networks. The setting must match your router exactly to connect."
      },
      {
        "q": "Is my WiFi password safe in the code?",
        "a": "The password is encoded in the QR image, so anyone who scans it can join. Only display it where you trust the people who see it."
      }
    ],
    "useCases": [
      "Display guest WiFi on a cafe table tent",
      "Add hotel room network access to key cards",
      "Post office WiFi in the reception area",
      "Share home WiFi with visitors on a fridge magnet"
    ]
  },
  "whatsapp": {
    "faqs": [
      {
        "q": "What does a WhatsApp QR code do when scanned?",
        "a": "It opens a WhatsApp chat with your number and an optional pre-filled message. The person can start chatting immediately."
      },
      {
        "q": "Do I need WhatsApp Business to use this?",
        "a": "No, it works with any WhatsApp account, personal or business. It simply opens a chat to your number."
      },
      {
        "q": "Can I include a starting message?",
        "a": "Yes, you can pre-fill a greeting so the conversation opens with your text ready to send. The sender can edit it before sending."
      }
    ],
    "useCases": [
      "Let shoppers message your store for orders",
      "Add a chat button to printed menus",
      "Collect support requests from packaging",
      "Start conversations from event booth banners"
    ]
  },
  "telegram": {
    "faqs": [
      {
        "q": "What does scanning a Telegram QR code open?",
        "a": "It opens your Telegram profile, channel, or group so the person can message or join. It uses your public username link."
      },
      {
        "q": "Do I enter my username with the @ symbol?",
        "a": "Enter the username without the @; the tool builds the correct t.me link for you. Make sure the username is public."
      },
      {
        "q": "Can I link to a channel or group instead of my profile?",
        "a": "Yes, use the public username of any channel or group you own. Scanning takes people straight to it."
      }
    ],
    "useCases": [
      "Grow a channel with a scan-to-join poster",
      "Add a support contact to product boxes",
      "Invite event attendees to a group chat",
      "Link community flyers to your Telegram"
    ]
  },
  "instagram": {
    "faqs": [
      {
        "q": "What happens when someone scans my Instagram QR code?",
        "a": "It opens your Instagram profile so they can view your posts and follow you. It links directly to your handle."
      },
      {
        "q": "Do I enter my handle with or without the @?",
        "a": "Enter your handle without the @; the tool creates the correct profile link. Double-check the spelling before downloading."
      },
      {
        "q": "Is this different from the code inside the Instagram app?",
        "a": "This is a standard QR code that any phone camera can read, not just the in-app scanner. It works the same to open your profile."
      }
    ],
    "useCases": [
      "Add a follow-me code to shop windows",
      "Put your handle on event photo backdrops",
      "Grow followers from printed business cards",
      "Link product tags to your brand feed"
    ]
  },
  "facebook": {
    "faqs": [
      {
        "q": "What does a Facebook QR code link to?",
        "a": "It opens your Facebook page or profile so people can view and follow it. Use your page URL or username."
      },
      {
        "q": "Should I paste the page link or the username?",
        "a": "Either works; paste the full page URL or the username, and the tool builds a working link. A full URL is the most reliable."
      },
      {
        "q": "Will it open in the Facebook app or a browser?",
        "a": "It opens in the Facebook app if installed, otherwise in the phone's browser. Both take the person to your page."
      }
    ],
    "useCases": [
      "Drive likes from in-store signage",
      "Add your page to printed flyers",
      "Link event banners to your Facebook",
      "Put a follow code on product packaging"
    ]
  },
  "twitter": {
    "faqs": [
      {
        "q": "What does scanning an X QR code do?",
        "a": "It opens your X (formerly Twitter) profile so people can read and follow you. It links directly to your handle."
      },
      {
        "q": "Do I include the @ in my handle?",
        "a": "Enter your handle without the @; the tool generates the correct profile link. Verify the spelling before you download."
      },
      {
        "q": "Does it still work now that Twitter is X?",
        "a": "Yes, the profile link works under the X domain and opens your account normally. Existing handles are unchanged."
      }
    ],
    "useCases": [
      "Grow followers from conference badges",
      "Add your handle to printed newsletters",
      "Link event stage screens to your profile",
      "Put a follow code on merchandise tags"
    ]
  },
  "youtube": {
    "faqs": [
      {
        "q": "Can I link to a single video or my whole channel?",
        "a": "Yes, paste either a video URL or a channel URL and the code opens that exact page. The link is fixed once generated."
      },
      {
        "q": "Will the video play right after scanning?",
        "a": "It opens the video in the YouTube app or browser, ready to play with a tap. Autoplay depends on the viewer's settings."
      },
      {
        "q": "Do I need to shorten the YouTube link first?",
        "a": "No, standard YouTube links work as-is, though shorter links create a cleaner code. Copy the link directly from the share button."
      }
    ],
    "useCases": [
      "Link packaging to a product demo video",
      "Send poster viewers to a channel trailer",
      "Add a how-to video to instruction manuals",
      "Promote a launch video on event screens"
    ]
  },
  "tiktok": {
    "faqs": [
      {
        "q": "What does a TikTok QR code open?",
        "a": "It opens your TikTok profile so people can watch your videos and follow you. It links to your username."
      },
      {
        "q": "Do I enter my username with the @?",
        "a": "Enter your handle without the @; the tool builds the correct profile link for you. Check the spelling before downloading."
      },
      {
        "q": "Is this the same as the profile code in the TikTok app?",
        "a": "This is a universal QR code readable by any phone camera, not only the in-app scanner. It opens your profile the same way."
      }
    ],
    "useCases": [
      "Add a follow code to retail displays",
      "Grow your account from event flyers",
      "Link product packaging to your videos",
      "Put your handle on merch and stickers"
    ]
  },
  "linkedin": {
    "faqs": [
      {
        "q": "What does scanning a LinkedIn QR code do?",
        "a": "It opens your LinkedIn profile so people can view your experience and connect. Paste your public profile URL."
      },
      {
        "q": "Where do I find my profile URL?",
        "a": "Open your LinkedIn profile and copy the address from the browser or the Contact info section. It usually looks like linkedin.com/in/yourname."
      },
      {
        "q": "Can I use it for a company page too?",
        "a": "Yes, paste a company page URL instead of a personal profile to link there. Any public LinkedIn URL works."
      }
    ],
    "useCases": [
      "Add a connect code to business cards",
      "Network faster at conferences and meetups",
      "Link resumes and portfolios to your profile",
      "Put your profile on speaker slides"
    ]
  },
  "vcard": {
    "faqs": [
      {
        "q": "What information can a vCard QR code hold?",
        "a": "It stores full contact details including name, phone, email, company, title, website, and address. Scanning offers to save it all as one contact."
      },
      {
        "q": "Does the contact save without an internet connection?",
        "a": "Yes, all details are encoded in the QR image, so it saves offline with no server lookup. Nothing is fetched online."
      },
      {
        "q": "Will it update if my phone number changes?",
        "a": "No, the details are fixed inside the code, so generate a new one after any change. Reprint it wherever the old code appears."
      }
    ],
    "useCases": [
      "Print a scan-to-save contact on business cards",
      "Add full details to your email signature",
      "Share contact info at networking events",
      "Put company contacts on trade show booths"
    ]
  },
  "mecard": {
    "faqs": [
      {
        "q": "What's the difference between MeCard and vCard?",
        "a": "MeCard is a more compact contact format, so the QR stays smaller and scans faster, while vCard holds extra fields like job title and address but produces a denser code."
      },
      {
        "q": "Do people need an app to save the contact?",
        "a": "No. Any phone's built-in camera reads the code and offers to add the name, phone, and email straight to Contacts."
      },
      {
        "q": "Can I edit the details after generating the code?",
        "a": "The details are baked into the static image, so changing them means regenerating the code; already-printed codes keep working with the original info."
      }
    ],
    "useCases": [
      "Add your number to a business card or flyer",
      "Let event attendees save your contact instantly",
      "Put a sales rep's details on product packaging",
      "Share contact info on a store window or sign"
    ]
  },
  "event": {
    "faqs": [
      {
        "q": "Which calendars does it work with?",
        "a": "The code uses the standard iCalendar format, so Apple Calendar, Google Calendar, and Outlook all recognize it after a scan."
      },
      {
        "q": "Does scanning add the event automatically?",
        "a": "No, the phone shows the details and asks the user to confirm first, so nothing lands on their calendar without a tap."
      },
      {
        "q": "Can I set a specific time and date?",
        "a": "Yes, enter the start and end times for your event, and include the correct time zone so attendees see the right local time."
      }
    ],
    "useCases": [
      "Print on invitations so guests save the date",
      "Add a conference session to attendees' calendars",
      "Put webinar timing on a promo poster",
      "Share a store's grand-opening date on flyers"
    ]
  },
  "geo": {
    "faqs": [
      {
        "q": "How is this different from the Google Maps code?",
        "a": "This stores raw latitude and longitude, dropping a pin on the exact spot even without an address, whereas the Maps code searches a place name instead."
      },
      {
        "q": "Which map app opens when scanned?",
        "a": "The phone opens its default map app, Apple Maps on iPhone or Google Maps on most Android devices, centered on your coordinates."
      },
      {
        "q": "How do I find my coordinates?",
        "a": "Long-press your location in any map app to reveal its latitude and longitude, then paste those two numbers into the generator."
      }
    ],
    "useCases": [
      "Mark a trailhead or campsite with no address",
      "Pin the exact entrance to a large venue",
      "Guide guests to a remote wedding location",
      "Show drivers a precise drop-off point"
    ]
  },
  "maps": {
    "faqs": [
      {
        "q": "Do scanners need the Google Maps app?",
        "a": "No. If Maps isn't installed, the code opens the location in a mobile browser instead, so anyone can find it."
      },
      {
        "q": "Should I enter an address or a place name?",
        "a": "Either works; a full street address is most precise, but a business name plus the city usually resolves correctly too."
      },
      {
        "q": "Will it give turn-by-turn directions?",
        "a": "Scanning opens the place in Maps, from which the user taps Directions to route from wherever they are."
      }
    ],
    "useCases": [
      "Add directions to your storefront on flyers",
      "Help diners find your restaurant from a menu",
      "Put your office location on a business card",
      "Direct visitors to a booth at a trade show"
    ]
  },
  "paypal": {
    "faqs": [
      {
        "q": "Do I need a PayPal business account?",
        "a": "No, a standard PayPal.me link works for any account; scanning opens your payment page where people enter or confirm the amount."
      },
      {
        "q": "Can I set a fixed amount?",
        "a": "Yes, add an amount to your PayPal.me link and it pre-fills at checkout, though the payer can still adjust it before sending."
      },
      {
        "q": "Is my PayPal login in the code?",
        "a": "No. The code only holds your public PayPal.me username, never your password or account balance."
      }
    ],
    "useCases": [
      "Collect tips at a market stall or gig",
      "Take donations at a charity event",
      "Invoice clients on a printed quote",
      "Sell handmade goods at a craft fair"
    ]
  },
  "bitcoin": {
    "faqs": [
      {
        "q": "What does the code contain?",
        "a": "It holds your Bitcoin address in the standard BIP-21 format, plus an optional amount, so the payer's wallet fills both in automatically."
      },
      {
        "q": "Why use a QR instead of typing the address?",
        "a": "Bitcoin addresses are long and one wrong character sends funds nowhere, so scanning eliminates typos entirely."
      },
      {
        "q": "Can I reuse the same code?",
        "a": "Yes, the address stays valid for repeated payments, though many wallets recommend a fresh address per transaction for privacy."
      }
    ],
    "useCases": [
      "Accept Bitcoin at a physical shop counter",
      "Add a donation address to your website",
      "Receive payment on a freelance invoice",
      "Share your address at a crypto meetup"
    ]
  },
  "crypto": {
    "faqs": [
      {
        "q": "Which coins are supported?",
        "a": "This generator builds payment codes for Ethereum, Litecoin, and Dogecoin using each network's standard URI format."
      },
      {
        "q": "Can one code hold multiple coins?",
        "a": "No, each address belongs to a single network, so generate a separate code for every coin you want to accept."
      },
      {
        "q": "Does the payer need a specific wallet app?",
        "a": "Any wallet that supports the chosen coin can scan the code and pre-fill your address ready to send."
      }
    ],
    "useCases": [
      "Accept Ethereum tips for your content",
      "Take Dogecoin donations on a livestream overlay",
      "Receive Litecoin payments at an event booth",
      "Print your ETH address on merch packaging"
    ]
  },
  "appstore": {
    "faqs": [
      {
        "q": "Can one code point to both iOS and Android?",
        "a": "A single code links to one store; for both platforms, either use a landing page that redirects by device or make one code per store."
      },
      {
        "q": "Does it open the store app directly?",
        "a": "On most phones the code opens the App Store or Google Play straight to your listing, ready to install."
      },
      {
        "q": "What link should I paste?",
        "a": "Use the public listing URL from the App Store or Google Play, the same one you'd share from the store page."
      }
    ],
    "useCases": [
      "Drive installs from a product package insert",
      "Add an install code to event signage",
      "Promote your app on a poster or flyer",
      "Put a download prompt on a receipt"
    ]
  },
  "spotify": {
    "faqs": [
      {
        "q": "Do listeners need a Spotify account?",
        "a": "Anyone can open the link, but full playback requires a Spotify account; free accounts work with ads."
      },
      {
        "q": "What can I link to?",
        "a": "Paste the share link for any track, album, artist, or playlist, and scanning opens it directly in Spotify."
      },
      {
        "q": "Is this the same as a Spotify Code?",
        "a": "No, this is a standard QR readable by any camera, whereas Spotify's own codes only scan inside the Spotify app."
      }
    ],
    "useCases": [
      "Share a wedding playlist on the invitation",
      "Promote a new single on a gig poster",
      "Set the mood with a cafe playlist card",
      "Link fans to your artist page on merch"
    ]
  },
  "zoom": {
    "faqs": [
      {
        "q": "What do I paste in?",
        "a": "Use your Zoom meeting invite link; scanning opens the Zoom app and joins the meeting, prompting for a passcode if you set one."
      },
      {
        "q": "Does it work for recurring meetings?",
        "a": "Yes, a recurring meeting link stays constant, so one code works for every session in the series."
      },
      {
        "q": "Do participants need the Zoom app?",
        "a": "Scanning opens the app if installed, or falls back to joining through the phone's browser."
      }
    ],
    "useCases": [
      "Post a class join code in a lecture hall",
      "Add a webinar link to event slides",
      "Share office hours on a door sign",
      "Put a hybrid-event join code on programs"
    ]
  },
  "skype": {
    "faqs": [
      {
        "q": "What happens when someone scans it?",
        "a": "Their phone opens Skype and starts a call or chat with your username, so they don't need to search for you first."
      },
      {
        "q": "Do they need Skype installed?",
        "a": "Yes, the code uses a Skype link, so the app must be installed for the call to connect."
      },
      {
        "q": "Can it start a video call?",
        "a": "The code opens your Skype contact, and the caller chooses voice or video from there."
      }
    ],
    "useCases": [
      "Add a support-line contact to a help card",
      "Share your handle on an international business card",
      "Let remote clients reach you from a flyer",
      "Put a call code on a conference booth"
    ]
  },
  "facetime": {
    "faqs": [
      {
        "q": "Does this work on Android?",
        "a": "FaceTime is Apple-only, so calls connect on iPhone, iPad, and Mac; Android users can't place FaceTime calls."
      },
      {
        "q": "Should I use a phone number or email?",
        "a": "Either works; use the phone number or Apple ID email that's registered with FaceTime on your device."
      },
      {
        "q": "Can it start a video call?",
        "a": "Yes, the code launches a FaceTime video call by default, and the recipient can switch to audio-only if they prefer."
      }
    ],
    "useCases": [
      "Let Apple-using clients video-call you from a card",
      "Add a face-to-face support option to packaging",
      "Share a personal FaceTime code with family",
      "Put a video-call prompt on a real-estate listing"
    ]
  },
  "pdf": {
    "faqs": [
      {
        "q": "Does the PDF get stored inside the code?",
        "a": "No, the code holds a link to a PDF you host online; upload the file somewhere first, then paste its URL."
      },
      {
        "q": "What if I update the document later?",
        "a": "Keep the same file URL and replace the file at that location, and every printed code will open the new version."
      },
      {
        "q": "Does the reader need a PDF app?",
        "a": "No, phones open PDFs in the built-in browser or viewer, so no extra app is needed."
      }
    ],
    "useCases": [
      "Link a restaurant menu on a table tent",
      "Share a product manual on the packaging",
      "Add an event program to printed signage",
      "Give customers a price list from a flyer"
    ]
  },
  "app": {
    "faqs": [
      {
        "q": "How is this different from the App Store code?",
        "a": "The App Store code points to one store; use this for a single download or landing link that can route users to the right store for their device."
      },
      {
        "q": "What link should I use?",
        "a": "Paste any download URL, such as a smart app link, a direct install page, or a landing page with buttons for each platform."
      },
      {
        "q": "Can I change where it points later?",
        "a": "The code is static and always opens the URL you enter; to redirect it later, point it at a link you control and update the destination there."
      }
    ],
    "useCases": [
      "Send users to your app from print ads",
      "Add an install link to product packaging",
      "Promote your app on event banners",
      "Put a download prompt on a business card"
    ]
  },
  "wifi-guest": {
    "faqs": [
      {
        "q": "How is this different from the standard WiFi code?",
        "a": "It's streamlined for guest networks, focusing on the network name and password so visitors connect fast without extra fields."
      },
      {
        "q": "Do guests need an app to connect?",
        "a": "No, the phone's camera reads the code and offers to join the network automatically, with no password typing."
      },
      {
        "q": "Is my main network password exposed?",
        "a": "Only the guest network details you enter go into the code, so keeping guests on a separate guest SSID protects your primary network."
      }
    ],
    "useCases": [
      "Frame it on a coffee-table card for rentals",
      "Post it by the door at a house party",
      "Put it on the counter at a pop-up shop",
      "Display it in a guest room or waiting area"
    ]
  }
};
