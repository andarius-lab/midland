var validators = new Array();

/**
 * To have this validate on a field just add
 * the class sf_validate_required to your input field.
 * optional attributes are message.
 */
validators["sf_validate_required"] = function (object) {
	var message = "This field is required.";
	var my_function = function (event) {
		validators["sf_validate_required"](event.data.my_object);
	};
	object.unbind("keyup.validateEvents");
	object.unbind("click.validateEvents");
	object.unbind("change.validateEvents");
	var hasValue = false;
	var input_type = object.attr("type");
	switch (jQuery(object)[0].tagName) {
		case "SELECT":
			hasValue = jQuery.trim(object.val()) != "";
			object.bind("change.validateEvents", { my_object: object }, my_function);
			break;
		case "TEXTAREA":
			hasValue = jQuery.trim(object.val()) != "";
			break;
		default:
			switch (input_type) {
				case "radio":
				case "checkbox":
					// see if one or more is "checked"
					var input_name = object.attr("name");
					var input_checked = jQuery("input:" + input_type + "[name='" + input_name + "']:checked");
					hasValue = input_checked.length > 0;
					if (!hasValue) {
						// bind 'click' event to all checkbox/radio siblings in case they didn't have the sf_validate_required class added to them.
						jQuery("input:" + input_type + "[name='" + input_name + "']").bind("click.validateEvents", { my_object: object }, my_function);
					}
					break;
				default:
					hasValue = jQuery.trim(object.val()) != "";
			}
	}
	if (hasValue) {
		tryToRemoveError(object, message);
		return true;
	} else {
		object.bind("keyup.validateEvents", { my_object: object }, my_function);
		addError(object, message, true);
		return false;
	}
};

/**
 * To have this validate on a field add the class sf_validate_multiple_email
 * optional attributes are message.
 */
validators["sf_validate_multiple_email"] = function (object) {
	var my_function = function (event) {
		validators["sf_validate_multiple_email"](event.data.my_object);
	};
	object.unbind("keyup.validateEvents");
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	var email = object.val();
	var message = "Please enter a valid E-mail address.";
	if (email == "") {
		//if the email is blank the field has a valid value.
		//multiple_email AND required should be used if the field is required.
		tryToRemoveError(object, message);
		return true;
	} else if (email.search(",") != -1) {
		// multiple email
		var emails = email.split(",");
		var success = false;
		for (var i = 0; i < emails.length; i++) {
			email = jQuery.trim(emails[i]);
			if (email.match(re)) {
				success = true;
			} else {
				success = false;
				break;
			}
		}
		if (success) {
			tryToRemoveError(object, message);
			return true;
		} else {
			object.bind("keyup.validateEvents", { my_object: object }, my_function);
			addError(object, message, true);
			return false;
		}
	} else {
		// single email
		if (email.match(re)) {
			tryToRemoveError(object, message);
			return true;
		} else {
			object.bind("keyup.validateEvents", { my_object: object }, my_function);
			addError(object, message, true);
			return false;
		}
	}
};

validators["sf_validate_email"] = validators["sf_validate_multiple_email"];

validators["sf_validate_url"] = function (object) {
	var message = "Please enter a valid url.";
	var my_function = function (event) {
		validators["sf_validate_url"](event.data.my_object);
	};
	object.unbind("keyup.validateEvents");
	object.unbind("click.validateEvents");
	object.unbind("change.validateEvents");
	//From: https://gist.github.com/HenkPoley/8899766
	var valid_url_regexp = new RegExp(
		"^" +
			// protocol identifier
			"(?:(?:https?|ftp)://)" +
			// user:pass authentication
			"(?:\\S+(?::\\S*)?@)?" +
			"(?:" +
			// IP address exclusion
			// private & local networks
			"(?!10(?:\\.\\d{1,3}){3})" +
			"(?!127(?:\\.\\d{1,3}){3})" +
			"(?!169\\.254(?:\\.\\d{1,3}){2})" +
			"(?!192\\.168(?:\\.\\d{1,3}){2})" +
			"(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
			// IP address dotted notation octets
			// excludes loopback network 0.0.0.0
			// excludes reserved space >= 224.0.0.0
			// excludes network & broacast addresses
			// (first & last IP address of each class)
			"(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
			"(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
			"(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
			"|" +
			// IPv6 RegEx - http://stackoverflow.com/a/17871737/273668
			"\\[(" +
			"([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|" + // 1:2:3:4:5:6:7:8
			"([0-9a-fA-F]{1,4}:){1,7}:|" + // 1::                              1:2:3:4:5:6:7::
			"([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|" + // 1::8             1:2:3:4:5:6::8  1:2:3:4:5:6::8
			"([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|" + // 1::7:8           1:2:3:4:5::7:8  1:2:3:4:5::8
			"([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|" + // 1::6:7:8         1:2:3:4::6:7:8  1:2:3:4::8
			"([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|" + // 1::5:6:7:8       1:2:3::5:6:7:8  1:2:3::8
			"([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|" + // 1::4:5:6:7:8     1:2::4:5:6:7:8  1:2::8
			"[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|" + // 1::3:4:5:6:7:8   1::3:4:5:6:7:8  1::8
			":((:[0-9a-fA-F]{1,4}){1,7}|:)|" + // ::2:3:4:5:6:7:8  ::2:3:4:5:6:7:8 ::8       ::
			"fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|" + // fe80::7:8%eth0   fe80::7:8%1     (link-local IPv6 addresses with zone index)
			"::(ffff(:0{1,4}){0,1}:){0,1}" +
			"((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}" +
			"(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|" + // ::255.255.255.255   ::ffff:255.255.255.255  ::ffff:0:255.255.255.255  (IPv4-mapped IPv6 addresses and IPv4-translated addresses)
			"([0-9a-fA-F]{1,4}:){1,4}:" +
			"((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}" +
			"(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])" + // 2001:db8:3:4::192.0.2.33  64:ff9b::192.0.2.33 (IPv4-Embedded IPv6 Address)
			")\\]" +
			"|" +
			"localhost" +
			"|" +
			// host name
			"(?:xn--[a-z0-9\\-]{1,59}|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?){0,62}[a-z\\u00a1-\\uffff0-9]{1,63}))" +
			// domain name
			"(?:\\.(?:xn--[a-z0-9\\-]{1,59}|(?:[a-z\\u00a1-\\uffff0-9]+-?){0,62}[a-z\\u00a1-\\uffff0-9]{1,63}))*" +
			// TLD identifier
			"(?:\\.(?:xn--[a-z0-9\\-]{1,59}|(?:[a-z\\u00a1-\\uffff]{2,63})))" +
			")" +
			// port number
			"(?::\\d{2,5})?" +
			// resource path
			"(?:/[^\\s]*)?" +
			"$",
		"i"
	);
	if (!object.val() || valid_url_regexp.test(object.val())) {
		tryToRemoveError(object, message);
		return true;
	} else {
		object.bind("keyup.validateEvents", { my_object: object }, my_function);
		addError(object, message, true);
		return false;
	}
};

/**
 * To have this validate on a field add the class sf_validate_fields_equal and
 * add the attribute 'other_field_selector' to the input field.
 * other_field_selector should be a selector to the input field to check
 * against.
 */
validators["sf_validate_fields_equal"] = function (object) {
	var message = "The fields do not match.";
	var my_function = function (event) {
		validators["sf_validate_fields_equal"](event.data.my_object);
	};
	object.unbind("keyup.validateEvents");
	var val1 = object.val();
	var other_selector = object.attr("other_field_selector");
	var val2 = jQuery(other_selector).val();
	if (val1 == val2) {
		tryToRemoveError(object, message);
		return true;
	} else {
		object.bind("keyup.validateEvents", { my_object: object }, my_function);
		addError(object, message, true);
		return false;
	}
};

/**
 * This validator prevents entering a non-decimal number.
 */
validators["sf_validate_decimal"] = function (object) {
	object.keydown(function (e) {
		// Allow: backspace, delete, tab, escape, enter and .
		if (
			jQuery.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
			// Allow: Ctrl+A
			(e.keyCode == 65 && e.ctrlKey === true) ||
			// Allow: home, end, left, right
			(e.keyCode >= 35 && e.keyCode <= 39)
		) {
			// let it happen, don't do anything
			return;
		}
		// Ensure that it is a number and stop the keypress
		if ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
			e.preventDefault();
		}
	});
};

/**
 * This validator prevents entering a non-decimal number.
 */
validators["sf_validate_currency"] = function (object) {
	object.keydown(function (e) {
		// Allow: backspace, delete, tab, escape, enter and .
		if (
			jQuery.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
			// Allow: Ctrl+A
			(e.keyCode == 65 && e.ctrlKey === true) ||
			// Allow: home, end, left, right
			(e.keyCode >= 35 && e.keyCode <= 39)
		) {
			// let it happen, don't do anything
			return;
		}
		// Ensure that it is a number and stop the keypress
		if ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
			e.preventDefault();
		}
	});
};

/**
 * This validator prevents entering a non-numbers.
 */
validators["sf_validate_minmax"] = function (object) {
	var min = parseInt(object.attr("min"));
	var max = parseInt(object.attr("max"));
	var too_low_message = "Please enter a number greater than or equal to " + min;
	var too_high_message = "Please enter a number less than or equal to " + max;
	value = object.val();
	var my_function = function (event) {
		validators["sf_validate_minmax"](event.data.my_object);
	};
	if (min && value < min) {
		object.bind("keyup.validateEvents", { my_object: object }, my_function);
		tryToRemoveError(object, too_high_message);
		addError(object, too_low_message, true);
		return false;
	} else if (max && value > max) {
		object.bind("keyup.validateEvents", { my_object: object }, my_function);
		tryToRemoveError(object, too_low_message);
		addError(object, too_high_message, true);
		return false;
	} else {
		tryToRemoveError(object, too_high_message);
		tryToRemoveError(object, too_low_message);
		return true;
	}
};

validators["sf_validate_integer"] = function (object) {
	object.keydown(function (e) {
		// Allow: backspace, delete, tab, escape, and enter
		if (
			jQuery.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
			// Allow: Ctrl+A
			(e.keyCode == 65 && e.ctrlKey === true) ||
			// Allow: home, end, left, right
			(e.keyCode >= 35 && e.keyCode <= 39)
		) {
			// let it happen, don't do anything
			return;
		}
		// Ensure that it is a number and stop the keypress
		if ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
			e.preventDefault();
		}
	});
};

validators["sf_validate_phone"] = function (object) {
	var message = "Please enter a valid phone number.";
	var my_function = function (event) {
		validators["sf_validate_phone"](event.data.my_object);
	};
	object.unbind("keyup.validateEvents");
	var value = object.val();
	var numeric_value = value.replace(/[^0-9]/g, "");
	if (!value || numeric_value.length > 5) {
		tryToRemoveError(object, message);
		return true;
	} else {
		object.bind("keyup.validateEvents", { my_object: object }, my_function);
		addError(object, message, true);
		return false;
	}
};

function addError(object, message, disable_submit) {
	if (disable_submit) object.closest("form").find("input:submit").addClass("btn-warning");

	object.trigger("hasError");

	addTabError(object);

	/* Add message to div */
	var message_div;
	message_div = object.closest("div.form-group, .su__form__group").addClass("has-error").find(".help-block, .su__input__help");
	if (message_div.text() == "") message_div.show().text(message);
}

function addTabError(object) {
	/* Find which tab this error is on */
	var tab_id;
	tab_id = object.closest("div.tab-pane").attr("id");

	/* Go to the tab where the error resides */
	if (tab_id) {
		var link = jQuery("a[href='#" + tab_id + "'], a[href='/#" + tab_id + "']");
		link.tab("show");
		link.find(".su-tab-error-icon").remove();
		link
			.addClass("tab-error")
			.append(
				' <span class="su-tab-error-icon"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1792 1792" class="icon" data-identifier="fa-times-circle"><path d="M1277 1122q0-26-19-45l-181-181 181-181q19-19 19-45 0-27-19-46l-90-90q-19-19-46-19-26 0-45 19L896 715 715 534q-19-19-45-19-27 0-46 19l-90 90q-19 19-19 46 0 26 19 45l181 181-181 181q-19 19-19 45 0 27 19 46l90 90q19 19 46 19 26 0 45-19l181-181 181 181q19 19 45 19 27 0 46-19l90-90q19-19 19-46zm387-226q0 209-103 385.5T1281.5 1561 896 1664t-385.5-103T231 1281.5 128 896t103-385.5T510.5 231 896 128t385.5 103T1561 510.5 1664 896z"/></svg></span>'
			);
	}
}

function tryToRemoveError(object, default_message) {
	var message_div = object.closest("div.form-group, .su__form__group").removeClass("has-error").find(".help-block, .su__input__help");
	if (message_div.text() == default_message) message_div.hide().text("");

	tryToEnableSubmit(object);
	tryToRemoveTabError(object);
}

function tryToEnableSubmit(object) {
	var num_of_errors = 0;
	num_of_errors = object
		.closest("form")
		.find(".has-error")
		.find("input, select, textarea")
		.filter(function () {
			var obj_class = jQuery(this).attr("class");
			return obj_class != undefined ? obj_class.match(/sf_validate_*/) : false;
		}).length;
	//	num_of_errors = num_of_errors.length;
	if (num_of_errors == 0) object.closest("form").find("input:submit").removeClass("btn-warning");
	else if (num_of_errors < 0) alert("Error in code. Number of errors is: " + num_of_errors);
}

function tryToRemoveTabError(object) {
	var num_of_errors = object
		.closest(".tab-pane")
		.find(".error")
		.find(":input")
		.filter(function () {
			var obj_class = jQuery(this).attr("class");
			return obj_class != undefined ? obj_class.match(/sf_validate_*/) : false;
		}).length;
	if (num_of_errors == 0) {
		var tab_id = object.closest("div.tab-pane").attr("id");
		if (tab_id) {
			var link = jQuery("a[href='#" + tab_id + "'], a[href='/#" + tab_id + "']");
			link.removeClass("tab-error");
			link.find(".su-tab-error-icon").remove();
		}
	}
}

function validate(selector_obj, types) {
	if (types.indexOf("sf_validate_conditional") !== -1) {
		validators["sf_validate_conditional"](selector_obj);
		var index = types.indexOf("sf_validate_conditional");
		types.splice(index, 1);
	}
	["sf_validate_decimal", "sf_validate_integer"].forEach(function (classname) {
		if (types.indexOf(classname) !== -1) {
			validators[classname](selector_obj);
			var index = types.indexOf(classname);
			types.splice(index, 1);
		}
	});

	if (selector_obj.hasClass("no-blur-validation")) return;
	selector_obj.bind("blur.validateEvents", function () {
		for (var i = 0; i < types.length; i++) {
			var did_validate = validators[types[i]](selector_obj);

			if (did_validate === false) return false;
		}
		return did_validate;
	});
	/*
	 * Now add a validate to the submit button.
	 */
	//	selector_obj.closest( "form" ).bind( "submit", function(){
	//		for( var i = 0; i < types.length; i++ ){
	//			var did_validate = validators[types[i]]( selector_obj );
	//
	//			if( did_validate === false )
	//				return false;
	//		}
	//		return did_validate;
	//	});
}

function doesValidate(object) {
	if (object == null) {
		object = jQuery("form");
	}
	var is_valid = true;
	object.each(function () {
		jQuery(this)
			.find("input, select, textarea")
			.each(function () {
				if (jQuery(this).parents(".su_prototype").length) return;
				var class_list = jQuery(this).attr("class");
				if (class_list != undefined) {
					class_list = class_list.split(/\s+/);
					var classes_accepted = new Array();
					var inc = 0;
					for (var i = 0; i < class_list.length; i++) {
						if (class_list[i] in validators) {
							classes_accepted[inc++] = class_list[i];
						}
					}
					if (classes_accepted.length > 0) {
						for (var k = 0; k < classes_accepted.length; k++) {
							var did_validate = validators[classes_accepted[k]](jQuery(this));
							if (did_validate === false) {
								is_valid = false;
								break;
							}
						}
					}
				}
			});
	});
	return is_valid;
}

function doesSelectorValidate(selector) {
	return doesValidate(jQuery(selector));
}

function scrollToFirstError(object) {
	var offset = object.offset();
	var modal_content = object.parents(".modal-content");
	var modal_center = object.parents(".modal.center");
	if (modal_content.length || modal_center.length) {
		var modal = modal_center.length ? modal_center : modal_content;
		modal.animate({ scrollTop: offset.top - 150 }, "slow");
	} else {
		window.scroll(0, offset.top - 150);
	}
}

jQuery(document).ready(function () {
	jQuery("form").each(function () {
		jQuery(this)
			.find("input, select, textarea")
			.each(function () {
				var class_list = jQuery(this).attr("class");
				if (class_list != undefined) {
					class_list = class_list.split(/\s+/);
					var classes_accepted = new Array();
					var inc = 0;
					for (var i = 0; i < class_list.length; i++) {
						if (class_list[i] in validators) {
							classes_accepted[inc++] = class_list[i];
						}
					}
					if (classes_accepted.length > 0) validate(jQuery(this), classes_accepted);
				}
			});

		jQuery(this).bind("submit", function () {
			var is_valid = doesValidate(jQuery(this));
			if (!is_valid) {
				scrollToFirstError(jQuery(this));
			}
			return is_valid;
		});
	});
});
