$(function () {
	// Diagnostics: check EmailJS availability early
	if (!window.EMAIL_JS_CONFIG) {
		console.warn('[Contact Form] EMAIL_JS_CONFIG not found. Form will fall back to action or show message.');
	} else {
		var cfg = window.EMAIL_JS_CONFIG;
		['publicKey','serviceId','templateId'].forEach(function(k){
			if(!cfg[k] || /YOUR_/i.test(cfg[k])) {
				console.warn('[Contact Form] EmailJS config value for', k, 'looks like a placeholder.');
			}
		});
		if (!window.emailjs) {
			console.warn('[Contact Form] emailjs SDK not loaded yet when ajax-form.js ran. Check script order.');
		}
	}

	// Get the form.
	var form = $('#contact-form');

	// Get the messages div.
	var formMessages = $('.ajax-response');

	// Set up an event listener for the contact form.
    $(form).submit(function (e) {
		// Stop the browser from submitting the form.
		e.preventDefault();

		// Button state handling
		var submitBtn = $(form).find('button[type="submit"], .submit-btn').first();
		var originalBtnHtml = submitBtn.html();
		submitBtn.prop('disabled', true).addClass('disabled').html('Sending...');

		// Simple validation helpers
		function invalidate($el, message) {
			$el.addClass('is-invalid');
			var err = $('<div class="field-error"></div>').text(message);
			$el.parent().find('.field-error').remove();
			$el.after(err);
		}
		function clearInvalid() {
			$(form).find('.is-invalid').removeClass('is-invalid');
			$(form).find('.field-error').remove();
		}
		clearInvalid();

		var nameEl = $(form).find('[name="name"]');
		var emailEl = $(form).find('[name="email"]');
		var subjectEl = $(form).find('[name="subject"]');
		var budgetEl = $(form).find('[name="Budget"]');
		var messageEl = $(form).find('[name="message"]');

		var valid = true;
		var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
		if (nameEl.val().trim().length < 2) { invalidate(nameEl, 'Name too short'); valid = false; }
		if (!emailRegex.test(emailEl.val().trim())) { invalidate(emailEl, 'Invalid email'); valid = false; }
		if (subjectEl.val().trim().length < 3) { invalidate(subjectEl, 'Subject too short'); valid = false; }
		if (budgetEl.val().trim() && budgetEl.val().length > 40) { invalidate(budgetEl, 'Budget value too long'); valid = false; }
		if (messageEl.val().trim().length < 5) { invalidate(messageEl, 'Message too short'); valid = false; }

		// Honeypot detection
		var honeypot = $(form).find('[name="website"]').val();
		if (honeypot) {
			// Act like success to confuse bots
			$(formMessages).removeClass('error').addClass('success').text('Message sent successfully.');
			setTimeout(function () { $(formMessages).empty().removeClass('success'); }, 4000);
			submitBtn.prop('disabled', false).removeClass('disabled').html(originalBtnHtml);
			return; // stop processing
		}

		if (!valid) {
			$(formMessages).removeClass('success').addClass('error').text('Please correct the highlighted fields.');
			submitBtn.prop('disabled', false).removeClass('disabled').html(originalBtnHtml);
			return;
		}

		// Collect values
		var payload = {
			name: $(form).find('[name="name"]').val(),
			email: $(form).find('[name="email"]').val(),
			subject: $(form).find('[name="subject"]').val(),
			budget: $(form).find('[name="Budget"]').val(),
			message: $(form).find('[name="message"]').val()
		};

		var emailCfg = window.EMAIL_JS_CONFIG || null;
		var attempts = 0;
		function trySendWithEmailJS() {
			var canUseEmailJS = emailCfg && emailCfg.publicKey && emailCfg.serviceId && emailCfg.templateId;
			if (!canUseEmailJS) {
				console.warn('[Contact Form] EmailJS REST missing config; falling back.');
				fallbackToAction();
				return;
			}
			// REST API endpoint
			var url = 'https://api.emailjs.com/api/v1.0/email/send';
			var body = {
				service_id: emailCfg.serviceId,
				template_id: emailCfg.templateId,
				public_key: emailCfg.publicKey,
				template_params: payload
			};
			fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			})
			.then(function(res){
				if(!res.ok) throw new Error('Status '+res.status);
				return res.text();
			})
			.then(function(){
				$(formMessages).removeClass('error').addClass('success').text('Message sent successfully.');
				$('#contact-form input,#contact-form textarea').val('');
				setTimeout(function () { $(formMessages).empty().removeClass('success'); }, 5000);
			})
			.catch(function(err){
				console.error('[Contact Form] EmailJS REST error:', err);
				$(formMessages).removeClass('success').addClass('error').text('Failed to send (REST): ' + err.message);
				setTimeout(function () { $(formMessages).empty().removeClass('error'); }, 7000);
			})
			.finally(function(){
				submitBtn.prop('disabled', false).removeClass('disabled').html(originalBtnHtml);
			});
		}
		function fallbackToAction() {
			// Fallback: attempt legacy AJAX POST if action exists
			var action = $(form).attr('action');
			if (!action) {
				$(formMessages).removeClass('success').addClass('error').text('No email service configured. Please configure EmailJS or set a form action.');
				submitBtn.prop('disabled', false).removeClass('disabled').html(originalBtnHtml);
				return;
			}
			var formData = $(form).serialize();
			$.ajax({
				type: 'POST',
				url: action,
				data: formData,
				dataType: 'json'
			}).done(function (response) {
				if (response.status === 'success') {
					$(formMessages).removeClass('error').addClass('success').text(response.message || 'Message sent.');
					$('#contact-form input,#contact-form textarea').val('');
				} else {
					$(formMessages).removeClass('success').addClass('error').text(response.message || 'Failed to send message.');
				}
				setTimeout(function () { $(formMessages).empty().removeClass('success error'); }, 5000);
			}).fail(function (jqXHR) {
				var msg = 'Oops! An error occurred and your message could not be sent.';
				if (jqXHR.status === 405) {
					msg = 'Backend not allowed (405). Configure EmailJS or deploy with PHP.';
				}
				$(formMessages).removeClass('success').addClass('error').text(msg);
				setTimeout(function () { $(formMessages).empty().removeClass('error'); }, 7000);
			}).always(function () {
				submitBtn.prop('disabled', false).removeClass('disabled').html(originalBtnHtml);
			});
		}
		// Start REST send
		trySendWithEmailJS();
		return;
	});

});
