# Portfolio

Live (static build): https://el-wakil.github.io/my-portfolio/

## Contact Form Email Sending

This repository now includes a PHP handler at `assets/mail.php` that sends a styled HTML email when the contact form is submitted.

### Why you see `405 Not Allowed`

GitHub Pages (and other static hosts) do not execute PHP. When the browser / AJAX tries to POST to `assets/mail.php` on a static host you may get:

```
405 Not Allowed
```

This means the server refused the POST because it only serves static files; the PHP code never ran.

### Run Locally with PHP

Use the built‑in PHP dev server (PHP 8+ recommended):

```bash
php -S localhost:8000
```

Then open: http://localhost:8000/contact.html

### Deploy to Real PHP Hosting

You need one of:

- Shared hosting (cPanel, Namecheap, Bluehost, etc.)
- A VPS (Ubuntu + Nginx/Apache + PHP-FPM)
- A PaaS with PHP runtime (Render, Railway, Heroku legacy via buildpack)

Upload the whole project keeping the same folder structure. Ensure `assets/mail.php` is readable and not blocked by server rules.

### Configure Destination Email

Edit `assets/mail.php` and change:

```php
$to = 'm7.elwakil@gmail.com';
```

to the email address where you want to receive messages.

### Improving Deliverability

Basic `mail()` can land in spam. For production use PHPMailer + SMTP (Gmail App Password, Mailgun, SendGrid, Postmark, etc.).

### (Optional) Using a Third‑Party Form Service (Works on Static Hosting)

If you must stay on GitHub Pages, replace the form action with one of these services:

1. **Formspree**

   - Sign up and get an endpoint like `https://formspree.io/f/xxxxxx`
   - Set form: `<form id="contact-form" action="https://formspree.io/f/xxxxxx" method="POST">`
   - Remove AJAX JSON expectation or adjust success handler.

2. **EmailJS** (Client-side only)

   - Include EmailJS SDK and call `emailjs.send()` in the submit handler instead of POSTing.
   - In this project we've prepared a config-driven integration. Steps:
     1. Sign up at https://www.emailjs.com/
     2. Create an Email Service (e.g. Gmail) and note the Service ID.
     3. Create a Template with variables: `name`, `email`, `subject`, `budget`, `message` (match lower-case keys used in `ajax-form.js`).
     4. Get your Public Key.
     5. Edit `assets/js/contact-config.js` and replace placeholders:
     ```js
     window.EMAIL_JS_CONFIG = {
       publicKey: "YOUR_PUBLIC_KEY",
       serviceId: "YOUR_SERVICE_ID",
       templateId: "YOUR_TEMPLATE_ID",
     };
     ```
     6. Deploy (GitHub Pages is fine). The form will now send via client-side EmailJS.
     7. Optional: In your EmailJS template, adjust styling or wrap variables with text.
   - Security note: Only the public key is exposed (designed by EmailJS). Do not put private API keys here.

3. **Netlify Forms** (if using Netlify)

   - Add attributes: `<form name="contact" data-netlify="true">` and add a hidden input `name="form-name" value="contact"`.

4. **StaticForms / Basin / Formcarry**
   - Similar pattern: change `action` and possibly add a hidden token.

### Adjusting Front-End Script for a Service

If using a third-party that returns plain text instead of JSON, change in `assets/js/ajax-form.js`:

```javascript
dataType: "json";
```

to

```javascript
dataType: "text";
```

and adapt the success callback.

### Common Troubleshooting

| Symptom               | Cause                             | Fix                                       |
| --------------------- | --------------------------------- | ----------------------------------------- |
| 405 Not Allowed       | Static hosting rejecting POST     | Deploy to PHP or use service              |
| 404 mail.php          | Wrong path / not uploaded         | Verify `assets/mail.php` exists on server |
| No email received     | Spam filtering or disabled mail() | Use SMTP via PHPMailer                    |
| Blank fields in email | Form `name` attributes mismatch   | Ensure names match those read in PHP      |

### Front-End Validation & Anti-Spam

The contact form now includes:

- Client-side validation (min lengths, email pattern) inside `assets/js/ajax-form.js`.
- Honeypot field: hidden input named `website`. If filled, submission is treated as success but ignored.
- Inline error styling using `.is-invalid` and `.field-error` classes (styles appended at end of `assets/css/style.css`).

To adjust validation rules, edit the logic block near `// Simple validation helpers` in `ajax-form.js`.

### Styling Success & Error Messages

### EmailJS REST Mode

The project now uses the EmailJS REST API directly instead of the browser SDK to avoid dependency ordering issues. The request payload is posted to:
`https://api.emailjs.com/api/v1.0/email/send`

Data shape (note: include both `public_key` and `user_id` for widest compatibility):

```jsonc
{
  "service_id": "<serviceId>",
  "template_id": "<templateId>",
  "public_key": "<publicKey>",
  "user_id": "<publicKey>",
  "template_params": {
    "name": "...",
    "email": "...",
    "subject": "...",
    "budget": "...",
    "message": "..."
  }
}
```

If you revert to the SDK, re-add the CDN script before `ajax-form.js` and remove the REST fetch logic.

Messages displayed in `.ajax-response` use classes:

- `.success` (green text)
- `.error` (red text)

You can customize their colors in the appended CSS section labeled `Form Validation Enhancements`.

### Security Notes

- Current handler does basic sanitizing with `strip_tags` and validates email format.
- Add rate limiting / CAPTCHA to reduce spam.
- Consider server-side length limits to avoid abuse.

### Roadmap Ideas

- Switch to PHPMailer with authenticated SMTP.
- Add Google reCAPTCHA v3.
- Add success modal animation.
- Log submissions to a JSON file or database.

---

Feel free to open improvements or request enhancements.
