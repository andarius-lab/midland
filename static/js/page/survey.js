var $;
$ = jQuery;
$(function () {
	const $forms = $("form.su__survey:not(.inited)");
	$forms.each(function () {
		const $form = $(this);
		const sitekey = $form.data("grecaptcha-sitekey");
		const initForm = (token) => {
			$form.suAjaxForm({
				submit_button: $form.find(".survey--submit-direct"),
				beforeSubmit(formData) {
					formData.push({
						name: "g-recaptcha-response",
						value: token,
					});
					return true;
				},
				success(data) {
					if (data.redirect_url) {
						top.SF.html.redirect(data.redirect_url);
					} else {
						$form.html(`<b>${data.message}</b>`);
					}
				},
			});
		};
		if (sitekey) {
			grecaptcha.ready(function () {
				grecaptcha.execute(sitekey, { action: "submit" }).then(function (token) {
					initForm(token);
				});
			});
		} else {
			initForm();
		}
		if ($form.find(".survey--charge-element").length) {
			const key = $form.data("stripe-key");
			// Create a Stripe client
			const stripe = Stripe(key);

			// Create an instance of Elements
			const elements = stripe.elements();

			const style = {
				base: {
					color: "#32325d",
					lineHeight: "24px",
					fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
					fontSmoothing: "antialiased",
					fontSize: "16px",
					"::placeholder": {
						color: "#aab7c4",
					},
				},
				invalid: {
					color: "#a94442",
					iconColor: "#a94442",
				},
			};

			// Create an instance of the card Element
			const card = elements.create("card", { style });

			// Add an instance of the card Element into the `card-element` <div>
			card.mount($form.find(".survey--charge-element")[0]);

			// Handle real-time validation errors from the card Element.
			card.addEventListener("change", (event) => setErrorMessage(event.error ? event.error.message : ""));

			const $payment_submit = $form.find(".survey--submit");
			const $card_errors = $("#card-errors");

			var setErrorMessage = function (message) {
				$card_errors.text(message);
				$card_errors.toggle(message !== "");
				$payment_submit.button("reset");
			};

			$payment_submit.click(function (e) {
				stripe.createToken(card).then(function (result) {
					if (result.error) {
						setErrorMessage(result.error.message);
					} else {
						$form.find(".survey--stripe-token").val(result.token.id);
						$form.submit();
					}
				});
				$payment_submit.button("loading");
				e.preventDefault();
			});
		}
		$form.addClass("inited");
	});
});
