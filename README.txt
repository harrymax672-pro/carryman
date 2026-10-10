CarryMan+ website

FILES
index.html        main page
css/style.css     design
js/script.js      booking, UPI, WhatsApp, helper dashboard
images/hero.jpg   home top photo
images/upi-qr.jpg UPI QR code

GO LIVE
1. Hosting panel (Hostinger / GoDaddy / cPanel): open File Manager > public_html, upload ALL files keeping the folders, so index.html sits in public_html.
2. Free option: drag and drop this folder on netlify.com/drop, or upload to GitHub Pages / Vercel.
3. Point your domain to the host.

EDIT
- WhatsApp number, UPI ID, password hash: top of js/script.js (WA, UPI, PW_HASH)
- Prices: PR and EXT in js/script.js
- QR code: replace images/upi-qr.jpg
Note: helper password is checked in the browser only. Orders are saved per browser and also sent to WhatsApp.
