// EmailJS configuration placeholder.
// 1. Sign up at https://www.emailjs.com/
// 2. Create a service and template including variables: name, email, subject, budget, message
// 3. Replace the placeholders below with your real IDs.
// 4. NEVER commit secret keys; only public key is used client-side.

window.EMAIL_JS_CONFIG = {
  publicKey: '7e5PFbPHWQJT6dN_N',        // EmailJS public (user) key
  serviceId: 'service_ojzyjal',          // EmailJS service ID
  templateId: 'template_kyja06p',        // EmailJS template ID
  // Additional template params appended automatically (optional)
  extraParams: {
    // reply_to: 'override@example.com',
    // to_name: 'Mohammed',
  },
  // Fallback provider (optional). If EmailJS REST returns 400/401/403/404 it will try this endpoint.
  fallback: {
    enabled: false,
    type: 'formspree',                   // currently only 'formspree' supported
    endpoint: 'https://formspree.io/f/yourFormID'
  }
};
