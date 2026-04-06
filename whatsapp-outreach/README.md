# The Potter's Hub — WhatsApp + SMS Outreach

A simple, free outreach system for The Potter's Hub church admin panel.
Send personalized WhatsApp and SMS messages to your members — welcome notes,
absence follow-ups, birthday greetings, and church-wide broadcasts.

## What it does

- ✅ **WhatsApp** — uses your existing WhatsApp account via QR code (free, no API costs)
- ✅ **SMS** — sends through your Android phone using the SMS Gateway app (also free)
- ✅ **5 message templates** — welcome, absence, birthday, broadcast, custom
- ✅ **Bulk broadcasts** — with smart 2–4 second delays to avoid blocks
- ✅ **CSV import** — drop in a list of members and send to everyone
- ✅ **Live status & logs** — see exactly who got the message in real time

---

## Quick Start (for non-developers)

### 1. Install Node.js
Download from https://nodejs.org (pick the LTS version) and install it.

### 2. Open this folder in a terminal
- **Windows:** Right-click the folder → "Open in Terminal"
- **Mac:** Right-click → "New Terminal at Folder"

### 3. Install dependencies (one-time)
```bash
npm install
```
This will take 1–3 minutes.

### 4. Start the server
```bash
node server.js
```
You should see:
```
============================================================
  The Potter's Hub — Outreach Server
============================================================
  Server:       http://localhost:3001
  WhatsApp:     INITIALIZING
  SMS Gateway:  http://192.168.1.100:8080
============================================================
```

### 5. Open the admin panel in your browser
The `WhatsAppPanel.jsx` component is designed to drop into your existing
React admin app. Once mounted, it will automatically connect to the server
on `http://localhost:3001`.

### 6. Scan the WhatsApp QR code
- A QR code will appear in the panel
- On your phone: WhatsApp → **Settings → Linked Devices → Link a Device**
- Scan the QR code on your screen
- Wait until the status turns green and says **READY**

### 7. (Optional) Set up SMS
1. Install the **SMS Gateway** Android app:
   https://github.com/capcom6/android-sms-gateway
2. Open the app, start the local server, note the IP address it shows
   (e.g. `192.168.1.105:8080`)
3. Create a `.env` file in this folder (copy `.env.example`) and update:
   ```
   SMS_GATEWAY_URL=http://192.168.1.105:8080
   SMS_GATEWAY_USER=sms
   SMS_GATEWAY_PASS=sms
   ```
4. Restart the server (`Ctrl+C` then `node server.js` again)

---

## Using the React Component

Drop `WhatsAppPanel.jsx` into your React admin app and import it:

```jsx
import WhatsAppPanel from "./WhatsAppPanel";

export default function AdminCommunicationsPage() {
  return <WhatsAppPanel />;
}
```

No props are required. It connects to `http://localhost:3001` by default —
edit the `API_BASE` constant at the top of the file if you need a different URL.

---

## API Endpoints

All endpoints live at `http://localhost:3001/api`

| Method | Path                | Purpose                                |
|--------|---------------------|----------------------------------------|
| GET    | `/status`           | WhatsApp + SMS connection state        |
| POST   | `/preview`          | Render a template for preview          |
| POST   | `/send`             | Single WhatsApp message                |
| POST   | `/sms`              | Single SMS message                     |
| POST   | `/broadcast`        | Bulk WhatsApp to a list of recipients  |
| POST   | `/sms-broadcast`    | Bulk SMS to a list of recipients       |
| GET    | `/log`              | Recent send activity                   |

### Example: send a single WhatsApp message

```bash
curl -X POST http://localhost:3001/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "08012345678",
    "name": "Brother Tunde",
    "type": "welcome"
  }'
```

### Example: bulk birthday broadcast

```bash
curl -X POST http://localhost:3001/api/broadcast \
  -H "Content-Type: application/json" \
  -d '{
    "type": "birthday",
    "recipients": [
      { "name": "Sister Grace", "phone": "08011111111" },
      { "name": "Brother Femi", "phone": "08022222222" }
    ]
  }'
```

---

## Message Types

| Type        | When to use it                                      |
|-------------|-----------------------------------------------------|
| `welcome`   | First-time visitor / new convert                    |
| `absence`   | Member who hasn't been to church recently           |
| `birthday`  | Birthday greeting                                   |
| `broadcast` | Generic church-wide announcement                    |
| `custom`    | Free-form message (use `{name}` for personalization)|

All templates are written in warm, Nigerian-English tone and mention
**The Potter's Hub** by name.

---

## CSV Import Format

Your CSV file should have a `name` column and a `phone` column:

```csv
name,phone
Brother Tunde,08012345678
Sister Grace,08023456789
Pastor Femi,+2348034567890
```

Phone numbers can be in any common format — the server normalizes them
automatically (handles `0...`, `234...`, `+234...`, with or without spaces/dashes).

---

## Troubleshooting

**WhatsApp QR keeps refreshing**
The session expired. Just scan the new code that appears.

**WhatsApp says "READY" but messages fail**
Make sure the recipient's phone number actually has WhatsApp.
Test with your own number first.

**SMS Gateway shows "Offline"**
- Make sure the Android SMS Gateway app is running on your phone
- Make sure your phone and computer are on the **same WiFi network**
- Check the IP and port in your `.env` file matches what the app shows
- Try opening `http://YOUR_PHONE_IP:8080/health` in your browser

**Bulk broadcast got blocked**
WhatsApp limits unsolicited bulk sends. The 2–4 second delay helps but
isn't a guarantee. For very large lists, send in smaller batches and
make sure recipients are people who actually know your church.

**"Cannot find module 'whatsapp-web.js'"**
Run `npm install` again from inside this folder.

---

## File Structure

```
whatsapp-outreach/
├── server.js              # Express + Socket.io backend
├── WhatsAppPanel.jsx      # React component for the admin panel
├── package.json           # Dependencies
├── .env.example           # Config template (copy to .env)
├── README.md              # This file
└── .wa-session/           # WhatsApp session (auto-created, do not delete)
```

---

## Privacy Note

- Your WhatsApp session lives on **your computer only** (in `.wa-session/`)
- SMS goes through **your Android phone only** — nothing goes to a third-party
- No member data is sent anywhere except to WhatsApp/your SMS gateway
- The member list is stored in your browser's `localStorage`

— Built with ❤️ for The Potter's Hub
