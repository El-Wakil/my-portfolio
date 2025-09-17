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

3. **Netlify Forms** (if using Netlify)
	- Add attributes: `<form name="contact" data-netlify="true">` and add a hidden input `name="form-name" value="contact"`.

4. **StaticForms / Basin / Formcarry**
	- Similar pattern: change `action` and possibly add a hidden token.

### Adjusting Front-End Script for a Service
If using a third-party that returns plain text instead of JSON, change in `assets/js/ajax-form.js`:
```javascript
dataType: 'json'
```
to
```javascript
dataType: 'text'
```
and adapt the success callback.

### Common Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| 405 Not Allowed | Static hosting rejecting POST | Deploy to PHP or use service |
| 404 mail.php | Wrong path / not uploaded | Verify `assets/mail.php` exists on server |
| No email received | Spam filtering or disabled mail() | Use SMTP via PHPMailer |
| Blank fields in email | Form `name` attributes mismatch | Ensure names match those read in PHP |

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
