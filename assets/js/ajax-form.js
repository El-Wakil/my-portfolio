$(function () {

	// Get the form.
	var form = $('#contact-form');

	// Get the messages div.
	var formMessages = $('.ajax-response');

	// Set up an event listener for the contact form.
    $(form).submit(function (e) {
		// Stop the browser from submitting the form.
		e.preventDefault();

		// Serialize the form data.
		var formData = $(form).serialize();

		// Button state handling
		var submitBtn = $(form).find('button[type="submit"], .submit-btn').first();
		var originalBtnHtml = submitBtn.html();
		submitBtn.prop('disabled', true).addClass('disabled').html('Sending...');

		// Submit the form using AJAX.
		$.ajax({
			type: 'POST',
			url: $(form).attr('action'),
			data: formData,
			dataType: 'json'
		})
			.done(function (response) {
				// Expecting JSON {status, message}
				if (response.status === 'success') {
					$(formMessages).removeClass('error').addClass('success').text(response.message || 'Message sent.');
					// Clear the form.
					$('#contact-form input,#contact-form textarea').val('');
					$('#contact-form select[name="budget"]').prop('selectedIndex', 0);
				} else {
					$(formMessages).removeClass('success').addClass('error').text(response.message || 'Failed to send message.');
				}
				setTimeout(function () { $(formMessages).empty().removeClass('success error'); }, 5000);
			})
			.fail(function (jqXHR) {
				var msg = 'Oops! An error occurred and your message could not be sent.';
				try {
					var json = JSON.parse(jqXHR.responseText);
					if (json.message) msg = json.message;
				} catch (e) {
					if (jqXHR.responseText) msg = jqXHR.responseText;
				}
				$(formMessages).removeClass('success').addClass('error').text(msg);
				setTimeout(function () { $(formMessages).empty().removeClass('error'); }, 5000);
			})
			.always(function () {
				submitBtn.prop('disabled', false).removeClass('disabled').html(originalBtnHtml);
			});
	});

});
