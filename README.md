# Softstacks Technologies – Website + Lead Form Backend

A production-ready Node.js/Express project for the Softstacks website.  
When a student submits the demo booking form, **two emails** are sent via **Brevo (formerly Sendinblue)**:

1. 📬 **Admin notification** — you get a rich HTML email with the student's details
2. ✅ **Student confirmation** — the student gets a branded confirmation email

---

## 📁 Project Structure

```
softstacks/
├── public/
│   └── index.html        ← Your full frontend (all CSS/JS included)
├── routes/
│   └── lead.js           ← Form submit API: validation + Brevo emails
├── server.js             ← Express app entry point
├── package.json
├── .env.example          ← Copy this to .env and fill in your credentials
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```
Open `.env` and fill in:
```
BREVO_API_KEY=your_brevo_api_key_here
ADMIN_EMAIL=info@softstacks.in
ADMIN_NAME=Softstacks Admin
FROM_EMAIL=no-reply@softstacks.in
FROM_NAME=Softstacks Technologies
PORT=3000
```

> **How to get your Brevo API key:**
> 1. Go to [app.brevo.com](https://app.brevo.com)
> 2. Click your name → **Account Settings** → **API Keys**
> 3. Click **Generate a new API key**, copy it into `.env`
> 4. Make sure `FROM_EMAIL` is added as a **verified sender** in Brevo (Senders & IP → Senders)

### 3. Start the server
```bash
# Production
npm start

# Development (auto-restarts on file changes)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — your full website is live.

---

## 📧 How the Emails Work

| Trigger | Recipient | Email |
|---|---|---|
| Student submits demo form | **You (admin)** | HTML card with name, email, phone, course + one-click reply button |
| Student submits demo form | **Student** | Branded confirmation with "What happens next" steps + WhatsApp CTA |
| Exit popup email submitted | **You (admin)** | Notification tagged as "Career Guide Download (Popup)" |

---

## 🛡️ Security Features

- **Rate limiting** — max 10 form submissions per IP per 15 minutes (blocks spam bots)
- **Server-side validation** — all fields are re-validated on the backend
- **API key in `.env`** — never committed to git (`.gitignore` covers `.env`)

---

## 🌐 Deploying to a Server

On any Linux VPS (e.g. DigitalOcean, AWS, Hostinger VPS):

```bash
# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone / upload your project, then:
npm install --production

# Use PM2 to keep it running
npm install -g pm2
pm2 start server.js --name softstacks
pm2 save
pm2 startup
```

Point your domain to the server IP and use **Nginx** as a reverse proxy to port 3000.

---

## 🔑 API Endpoint

```
POST /api/lead/submit
Content-Type: application/json

{
  "fname": "Amir",
  "lname": "Khan",
  "email": "amir@email.com",
  "phone": "+91 98765 43210",
  "course": "Full Stack Development"
}
```

**Success response:**
```json
{ "success": true, "message": "Submission received! Check your email for confirmation." }
```

**Error response:**
```json
{ "success": false, "message": "First name is required (min 2 chars)." }
```
