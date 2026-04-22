const express = require('express');
const router = express.Router();
const { TransactionalEmailsApi } = require('@getbrevo/brevo');

// ─── Brevo API Client Setup ────────────────────────────────────
function getBrevoClient() {
  const apiInstance = new TransactionalEmailsApi();
  // API key index is typically 0 in the Brevo SDK
  apiInstance.setApiKey(0, process.env.BREVO_API_KEY);
  return apiInstance;
}

// ─── Validation Helper ─────────────────────────────────────────
function validateLeadForm(data) {
  const errors = [];
  if (!data.fname || data.fname.trim().length < 2) errors.push('First name is required (min 2 chars).');
  if (!data.lname || data.lname.trim().length < 2) errors.push('Last name is required (min 2 chars).');
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push('A valid email is required.');
  if (!data.phone || !/^[+\d\s\-()]{7,15}$/.test(data.phone)) errors.push('A valid phone number is required.');
  if (!data.course || data.course.trim() === '') errors.push('Please select a course.');
  return errors;
}

// ─── Admin Notification Email (HTML) ──────────────────────────
function buildAdminEmail(lead) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F0EDE7;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(13,27,62,.1);">
        <!-- Header -->
        <tr>
          <td style="background:#0D1B3E;padding:28px 36px;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-.02em;">
              Soft<span style="color:#F97316;">stacks</span>
            </h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,.6);font-size:13px;">New Demo Booking Received 🎯</p>
          </td>
        </tr>
        <!-- Badge -->
        <tr>
          <td style="padding:28px 36px 0;">
            <div style="display:inline-block;background:#FFF4EE;color:#E8500A;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:5px 14px;border-radius:99px;">
              New Lead
            </div>
            <h2 style="margin:14px 0 6px;color:#0D1B3E;font-size:20px;font-weight:700;">
              ${lead.fname} ${lead.lname} wants to book a Free Demo
            </h2>
            <p style="margin:0;color:#5A637A;font-size:14px;">Submitted on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
          </td>
        </tr>
        <!-- Details Table -->
        <tr>
          <td style="padding:24px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;">
              ${[
                ['👤 Full Name',   `${lead.fname} ${lead.lname}`],
                ['✉️ Email',        `<a href="mailto:${lead.email}" style="color:#E8500A;text-decoration:none;">${lead.email}</a>`],
                ['📞 Phone',        `<a href="tel:${lead.phone}" style="color:#E8500A;text-decoration:none;">${lead.phone}</a>`],
                ['🎓 Course Interest', `<strong style="color:#0D1B3E;">${lead.course}</strong>`],
              ].map(([label, value], i) => `
                <tr style="background:${i % 2 === 0 ? '#F8FAFC' : '#fff'};">
                  <td style="padding:14px 18px;font-size:13px;font-weight:600;color:#5A637A;width:40%;border-bottom:1px solid #E2E8F0;">${label}</td>
                  <td style="padding:14px 18px;font-size:14px;color:#1A1A2E;border-bottom:1px solid #E2E8F0;">${value}</td>
                </tr>
              `).join('')}
            </table>
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td style="padding:0 36px 32px;text-align:center;">
            <a href="mailto:${lead.email}?subject=Your Free Demo at Softstacks is Confirmed!&body=Hi ${lead.fname},%0A%0AThank you for registering..."
               style="display:inline-block;background:#E8500A;color:#fff;text-decoration:none;padding:13px 30px;border-radius:8px;font-weight:700;font-size:15px;">
              Reply to ${lead.fname} →
            </a>
            <p style="margin:14px 0 0;font-size:12px;color:#5A637A;">Respond within 30 minutes as promised on the website.</p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:18px 36px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9CA3AF;">Softstacks Technologies · Srinagar, J&K · info@softstacks.in</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();
}

// ─── Student Confirmation Email (HTML) ────────────────────────
function buildStudentEmail(lead) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F0EDE7;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(13,27,62,.1);">
        <!-- Header -->
        <tr>
          <td style="background:#0D1B3E;padding:32px 36px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;">
              Soft<span style="color:#F97316;">stacks</span>
            </h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,.6);font-size:13px;">IT Training Institute · Srinagar, J&K</p>
          </td>
        </tr>
        <!-- Greeting -->
        <tr>
          <td style="padding:36px 36px 0;text-align:center;">
            <div style="font-size:48px;margin-bottom:16px;">🎉</div>
            <h2 style="margin:0 0 10px;color:#0D1B3E;font-size:24px;font-weight:800;">You're All Set, ${lead.fname}!</h2>
            <p style="margin:0;color:#5A637A;font-size:15px;line-height:1.6;max-width:420px;margin:0 auto;">
              Your free demo session request for <strong style="color:#E8500A;">${lead.course}</strong> has been received. Our team will contact you within <strong>30 minutes</strong>.
            </p>
          </td>
        </tr>
        <!-- What to Expect -->
        <tr>
          <td style="padding:28px 36px;">
            <h3 style="color:#0D1B3E;font-size:15px;font-weight:700;margin:0 0 16px;">What happens next?</h3>
            ${[
              ['📞', 'Our trainer calls you within 30 minutes to confirm your slot.'],
              ['🗓️', 'We schedule a 30-minute FREE demo session at your preferred time.'],
              ['🎓', 'Walk away with a personalised career roadmap — zero obligation.'],
              ['🎁', 'Get FREE study material worth ₹2,000 just for attending!'],
            ].map(([icon, text]) => `
              <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:14px;">
                <div style="font-size:20px;line-height:1;flex-shrink:0;">${icon}</div>
                <p style="margin:0;font-size:14px;color:#5A637A;line-height:1.6;">${text}</p>
              </div>
            `).join('')}
          </td>
        </tr>
        <!-- WhatsApp CTA -->
        <tr>
          <td style="padding:0 36px 36px;text-align:center;">
            <p style="margin:0 0 16px;font-size:14px;color:#5A637A;">Want to connect right away?</p>
            <a href="https://wa.me/919999999999?text=Hi%20Softstacks!%20I%20just%20registered%20for%20the%20free%20demo%20for%20${encodeURIComponent(lead.course)}"
               style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:700;font-size:15px;">
              💬 Chat on WhatsApp
            </a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#0D1B3E;padding:22px 36px;text-align:center;">
            <p style="margin:0 0 6px;color:rgba(255,255,255,.5);font-size:12px;">Softstacks Technologies</p>
            <p style="margin:0;color:rgba(255,255,255,.35);font-size:11px;">📍 Srinagar, J&K &nbsp;|&nbsp; 📞 +91 99999 99999 &nbsp;|&nbsp; ✉️ info@softstacks.in</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();
}

// ─── POST /api/lead/submit ─────────────────────────────────────
router.post('/submit', async (req, res) => {
  const { fname, lname, email, phone, course } = req.body;
  const lead = { fname: fname?.trim(), lname: lname?.trim(), email: email?.trim().toLowerCase(), phone: phone?.trim(), course: course?.trim() };

  // Validate
  const errors = validateLeadForm(lead);
  if (errors.length) {
    return res.status(400).json({ success: false, message: errors.join(' ') });
  }

  try {
    const apiInstance = getBrevoClient();

    // 1️⃣  Notify admin
    await apiInstance.sendTransacEmail({
      sender: { name: process.env.FROM_NAME, email: process.env.FROM_EMAIL },
      to: [{ email: process.env.ADMIN_EMAIL, name: process.env.ADMIN_NAME }],
      subject: `🎯 New Demo Booking — ${lead.fname} ${lead.lname} (${lead.course})`,
      htmlContent: buildAdminEmail(lead),
    });

    // 2️⃣  Confirm to student
    await apiInstance.sendTransacEmail({
      sender: { name: process.env.FROM_NAME, email: process.env.FROM_EMAIL },
      to: [{ email: lead.email, name: `${lead.fname} ${lead.lname}` }],
      subject: `🎉 Your Free Demo is Booked, ${lead.fname}! – Softstacks`,
      htmlContent: buildStudentEmail(lead),
    });

    console.log(`✅ Lead submitted: ${lead.fname} ${lead.lname} <${lead.email}> → ${lead.course}`);
    return res.json({ success: true, message: 'Submission received! Check your email for confirmation.' });

  } catch (err) {
    console.error('❌ Brevo error:', err?.response?.body || err.message);
    return res.status(500).json({ success: false, message: 'Server error. Please try WhatsApp or call us directly.' });
  }
});

module.exports = router;
