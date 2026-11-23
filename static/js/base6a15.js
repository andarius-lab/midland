var $;
$ = jQuery;
window.$su = $;

Array.prototype.unique = function () {
	return this.reduce(function (acc, value) {
		if (!acc.includes(value)) {
			acc.push(value);
		}
		return acc;
	}, []);
};

Array.prototype.merge = function (other) {
	return Array.prototype.push.apply(this, other);
};

//http://stackoverflow.com/a/4026828/375490
Array.prototype.diff = function (a) {
	return this.filter((i) => !(a.indexOf(i) > -1));
};

Function.prototype.delay = function (delay) {
	let timeout = null;
	return (...args) => {
		if (timeout !== null) {
			clearTimeout(timeout);
		}
		var current_timeout = (timeout = setTimeout(() => {
			current_timeout = timeout = null;
			return this(...Array.from(args || []));
		}, delay));
		return function () {
			if (current_timeout !== null) {
				return clearTimeout(current_timeout);
			}
		};
	};
};

Function.prototype.fix = function () {
	let f;
	return (f = (...args) => this(f, ...Array.from(args)));
};

Function.prototype.curry = function (...args) {
	return (...args2) => this(...Array.from(args), ...Array.from(args2));
};

Function.prototype.lazy = function () {
	return (...args) => (args.length === 0 ? this() : this.curry(...Array.from(args || [])).lazy());
};

Function.prototype.unlazy = function () {
	return (...args) => (args.length === 0 ? this() : this(...Array.from(args || []))());
};

Function.prototype.composition = function (func) {
	return (...args) => this(func(...Array.from(args || [])));
};

$(() => SF.init());

var SF = (window.SF = {});

SF.load = {};
SF.load.loaded_prettify = false;
SF.load.prettify = function (callback) {
	if (SF.load.loaded_prettify) {
		callback();
		return;
	}
	SF.load.loaded_prettify = true;
	$("head").append('<link rel="stylesheet" href="third-party/Bootstrap/docs/assets/js/google-code-prettify/prettify.css" type="text/css" />');
	return $.ajax({
		url: "third-party/Bootstrap/docs/assets/js/google-code-prettify/prettify.js",
		dataType: "script",
		async: true,
		cache: true,
		success() {
			return callback();
		},
	});
};

SF.init = function ($selector = null) {
	const has_selector = !!$selector;
	if (!has_selector) {
		$selector = $("html");
	}
	const has_bootstrap = has_selector && $selector.closest(".su_bootstrap_safe").length > 0;

	document.createElement("picture");
	$selector.find("select:not(.no-select2)").each(function () {
		hasNoValue = $(this).find("option[selected]").length == 0;
		if ($(this).attr("data-placeholder") && !$(this).prop("multiple")) {
			const option = hasNoValue ? "<option selected></option>" : "<option></option>";
			$(this).prepend(option);
		}
		$(this).select2({
			theme: "bootstrap",
			width: "100%",
		});
	});

	if ($selector.find("pre.prettyprint, code.prettyprint, xmp.prettyprint").length) {
		SF.load.prettify(() => prettyPrint());
	}

	if ($.fn.tooltip) {
		$selector.find(has_bootstrap ? "a[rel=tooltip]" : ".su_bootstrap_safe a[rel=tooltip]").tooltip({
			live: true,
		});
	}

	if ($.fn.popover) {
		$.fn.popover.Constructor.DEFAULTS = $.extend({}, $.fn.popover.Constructor.DEFAULTS, {
			trigger: "hover",
		});
		$selector.find(has_bootstrap ? "a[rel=popover]" : ".su_bootstrap_safe a[rel=popover]").popover({
			offset: 10,
		});
	}

	if ($.fn.suAjaxForm) {
		$("form.su-base-ajax-form").each(function () {
			return $(this).suAjaxForm();
		});
	}

	if ($.fn.bootstrapSwitch) {
		$(".switch").bootstrapSwitch();
	}

	const syncCheckBox = function () {
		return $(this).parents(".add-on").toggleClass("active", $(this).is(":checked"));
	};
	$selector
		.find(has_bootstrap ? ".add-on :checkbox" : ".su_bootstrap_safe .add-on :checkbox")
		.each(syncCheckBox)
		.click(syncCheckBox);

	$selector.on("blur", ".sf_validate_currency", function () {
		const $this = $(this);
		return $this.val(parseFloat($this.val()).toFixed(2));
	});

	if (typeof filepicker !== "undefined" && filepicker !== null) {
		$selector.find("input[type='filepicker'], input[type='filepicker-dragdrop'], input[type='filepicker-convert']").each(function () {
			return filepicker.constructWidget(this);
		});
	}

	if ($.fn.modal) {
		$.fn.modal.Constructor.prototype.enforceFocus = function () {};
	}

	// Ensure links open in _parent (from <base target="_parent...>)
	$selector.find("a[target='_self']").each(function () {
		return $(this).removeAttr("target");
	});

	if ($("body").hasClass("dashboard")) {
		return $selector.find("#content :input:not([type='hidden'], button):first").focus();
	}
};

SF.proto = {};
SF.proto.build = function (prototype, data_array, closure, replace, reverse) {
	if (replace == null) {
		replace = true;
	}
	if (reverse == null) {
		reverse = false;
	}
	if (!prototype.hasClass("su_prototype")) {
		throw "incorrect prototype";
	}
	if (closure == null) {
		closure = SF.proto.defaultClosure;
	}
	if (replace) {
		prototype.siblings(".__su_prototype_child").remove();
	}
	if (Object.prototype.toString.call(data_array) === "[object Array]") {
		return (() => {
			const result = [];
			for (let value of Array.from(data_array)) {
				const new_prototype = prototype.clone(true);
				closure(new_prototype, value);
				new_prototype.removeClass("su_prototype").addClass("__su_prototype_child");
				if (reverse) {
					result.push(prototype.after(new_prototype));
				} else {
					result.push(prototype.before(new_prototype));
				}
			}
			return result;
		})();
	} else {
		return (() => {
			const result1 = [];
			for (let key in data_array) {
				const value = data_array[key];
				const new_prototype = prototype.clone(true);
				closure(new_prototype, value, key);
				new_prototype.removeClass("su_prototype").addClass("__su_prototype_child");
				if (reverse) {
					result1.push(prototype.after(new_prototype));
				} else {
					result1.push(prototype.before(new_prototype));
				}
			}
			return result1;
		})();
	}
};

SF.proto.defaultClosure = (prototype, data) =>
	(() => {
		const result = [];
		for (let key in data) {
			const value = data[key];
			if (key === "id") {
				prototype.attr("data-id", value);
			}
			const target = $(`.su_prototype_${key}`, prototype);
			if (!target.length) {
				throw `bad data ${key}: ${value}`;
			}
			if (target.get(0).tagName === "img") {
				result.push(target.attr("src", value));
			} else if (target.get(0).tagName === "A") {
				result.push(target.attr("href", target.attr("href") + value));
			} else {
				result.push(target.text(value));
			}
		}
		return result;
	})();

let Cls = (SF.macro = class macro {
	static initClass() {
		this.prototype.state = {};
	}
	constructor(selector, trigger_closure) {
		this.setStateWithTrigger = this.setStateWithTrigger.bind(this);
		if (trigger_closure == null) {
			trigger_closure = function () {};
		}
		this.trigger_closure = trigger_closure;
		if (!selector.hasClass(this.selectorClass())) {
			console.warn(`Bad selector for macro class ${this.selectorClass()}`);
		}
		this.selector = () => selector;
		const subselector_cache = {};
		this.subselector = function (subselector) {
			if (!Array.from(subselector_cache).includes(subselector)) {
				subselector_cache[subselector] = $(subselector, this.selector());
			}
			return subselector_cache[subselector];
		};
	}

	selectorClass() {
		return "su_macro";
	}

	setState(state_) {
		const should_update = JSON.stringify(state_) !== JSON.stringify(this.state);
		if (should_update) {
			this.state = state_;
		}
		return should_update;
	}

	updateState(state_delta) {
		return this.setState($.extend({}, this.state, state_delta));
	}

	setStateWithTrigger(state) {
		if (this.setState(state)) {
			return this.trigger_closure(state);
		}
	}
});
Cls.initClass();

SF.macro.pagination = {};

SF.macro.pagination.public = class basic extends SF.macro {
	constructor(...args) {
		super(...Array.from(args || []));
		this.setState = this.setState.bind(this);
		this.setState({
			page: null,
			page_max: null,
		});
	}

	selectorClass() {
		return "su__pagination";
	}

	setState(state) {
		let page, page_max, selector;
		let enabled, target_page;
		if (!super.setState(({ page, page_max } = state))) {
			return false;
		}

		//next/prev page
		for ({ target_page, selector, enabled } of [
			{ target_page: page - 1, selector: this.subselector(".su__pagination__prev"), enabled: page > 1 },
			{ target_page: page + 1, selector: this.subselector(".su__pagination__next"), enabled: page < page_max },
		]) {
			selector.unbind("click");
			selector.toggleClass("disabled", !enabled);
			if (enabled) {
				((target_page) => {
					return selector.click(() =>
						this.setStateWithTrigger({
							page: target_page,
							page_max,
						})
					);
				})(target_page);
			}
		}

		//page list
		if (page_max === 0) {
			page_max = 1;
		}
		let first_page = 1;
		let last_page = page_max;
		if (page_max > 11) {
			// we can't show all of them
			if (page >= page_max - 5) {
				first_page = page_max - 11;
			} else if (page - 5 > 0) {
				first_page = page - 5;
			} else {
				first_page = 1;
			}
			last_page = page < 6 ? 10 : first_page + 11;
		}
		SF.proto.build(this.subselector(".su_prototype"), __range__(first_page, last_page, true), (prototype, page_) => {
			prototype.text(page_);
			prototype.toggleClass("active", page_ === page);
			return prototype.click(() => {
				return this.setStateWithTrigger({
					page: page_,
					page_max,
				});
			});
		});

		this.selector().toggle(page_max !== 1);
		return true;
	}
};

SF.macro.sortby = class sortby extends SF.macro {
	constructor(...args) {
		super(...Array.from(args || []));
		this.setState = this.setState.bind(this);

		this.subselector(".su__sortby__option").click(({ target }) => {
			const should_ascending = $(target).hasClass("su__sortby__option--desc") || !$(target).hasClass("su__sortby__option--asc");
			const key = $(target).attr("data-key");
			return this.setStateWithTrigger({
				key,
				is_ascending: should_ascending,
			});
		});

		true;
	}

	selectorClass() {
		return "su_macro_sortby";
	}

	setState(state) {
		let is_ascending, key;
		if (!super.setState(({ key, is_ascending } = state))) {
			return false;
		}

		const class_to_add = is_ascending ? "su__sortby__option--asc" : "su__sortby__option--desc";
		this.subselector(".su__sortby__option").removeClass("su__sortby__option--asc su__sortby__option--desc").filter(`[data-key='${key}']`).addClass(class_to_add);
		return true;
	}
};

SF.macro.search = class search extends SF.macro {
	constructor(selector, trigger_closure) {
		super(selector, trigger_closure);
		this.setState = this.setState.bind(this);

		let cancel_closure = null;
		const updateWithValue = (value) => {
			return this.setStateWithTrigger({
				value,
			});
		};

		const delayedUpdateWithValue = updateWithValue.delay(250);
		selector.keyup(function (event_object) {
			//enter, shift, control, option, capslock, 4 arrows, command, command
			if (![13, 16, 17, 18, 20, 37, 38, 39, 40, 91, 93].includes(event_object.which)) {
				return (cancel_closure = delayedUpdateWithValue(selector.val()));
			}
		});

		selector.keydown(function (event_object) {
			if (cancel_closure !== null) {
				cancel_closure();
			}
			if (event_object.which === 13) {
				return updateWithValue(selector.val());
			}
		});

		this.selector()
			.siblings(".su-clear-search")
			.click(function () {
				if (cancel_closure !== null) {
					cancel_closure();
				}
				return updateWithValue("");
			});

		this.setState({
			value: "",
		});
	}

	selectorClass() {
		return "su_macro_search";
	}

	setState(state) {
		let value;
		this.selector()
			.siblings(".su-clear-search")
			.toggle(state.value.length > 0);
		this.selector()
			.siblings(".su-search-icon")
			.toggle(state.value.length === 0);
		if (!super.setState(({ value } = state))) {
			return false;
		}
		this.selector().val(value);
		return true;
	}
};

SF.html = {};
SF.html.setEnabledState = (obj, is_enabled) => obj.toggleClass("disabled", !is_enabled);

SF.html.fixUrl = function (url) {
	if (!/^(https?:)?\/\//.test(url)) {
		if (url.substring(0, 1) === "/") {
			url = url.substring(1);
		}
		url = window.SF_BASE_PATH + url;
	}
	return url;
};

SF.html.truncate = function (obj, original_text, truncate_length) {
	if (original_text.length > truncate_length) {
		obj.text(original_text.substring(0, truncate_length) + "...");
		return obj.attr("title", original_text);
	} else {
		return obj.text(original_text);
	}
};

SF.html.reload = function (params = null) {
	if (params) {
		let key, param, value;
		if (params.charAt(0) === "?") {
			params = params.substring(1);
		}
		let query = window.location.search;
		const query_state = {};
		if (query.charAt(0) === "?") {
			query = query.substring(1);
		}
		for (param of Array.from(query.split("&"))) {
			[key, value] = Array.from(param.split("="));
			query_state[key] = value;
		}

		params = params.split("&");
		for (param of Array.from(params)) {
			[key, value] = Array.from(param.split("="));
			if (!(value.length > 0)) {
				throw "param needs a value of format key=value";
			}
			query_state[key] = value;
		}

		params = [];
		for (key in query_state) {
			value = query_state[key];
			params.push(`${key}=${value}`);
		}
		return (window.location.search = "?" + params.join("&"));
	} else {
		return window.location.reload();
	}
};

SF.html.redirect = function (href) {
	window.location.href = SF.html.fixUrl(href);
};

SF.html.toggle;

SF.history = new (function () {
	let should_use_persistent_history = true;
	let is_init = false;
	this.disablePersistentState = () => (should_use_persistent_history = false);

	this.init = function (default_params) {
		this.disablePersistentState = function () {
			if (is_init) {
				throw "history has already been init'ed";
			}
		};

		if (!is_init) {
			let stateChange, updateQuery;
			should_use_persistent_history &= window.History.enabled;

			const registered_params = {};
			let current_query_pieces = {};

			const stateChangeWithNewQueryState = function (query_state) {
				let key, value;
				const unprocessed_query_keys = (() => {
					const result = [];
					for (key in query_state) {
						value = query_state[key];
						if (value !== current_query_pieces[key]) {
							result.push(key);
						}
					}
					return result;
				})().unique();
				current_query_pieces = {};
				for (key in query_state) {
					value = query_state[key];
					current_query_pieces[key] = decodeURIComponent((value + "").replace(/\+/g, "%20"));
				}
				const run_closures = [];
				for (key of Array.from(unprocessed_query_keys)) {
					if (registered_params[key]) {
						for (let current_closure of Array.from(registered_params[key])) {
							if (!Array.from(run_closures).includes(current_closure)) {
								run_closures.push(current_closure);
							}
						}
					}
				}
				return Array.from(run_closures).map((run_closure) => run_closure(current_query_pieces));
			};

			if (should_use_persistent_history) {
				updateQuery = function (param_array) {
					let key, value;
					const function_name = Object.keys(current_query_pieces).length > 0 ? "pushState" : "replaceState";
					window.History[function_name](
						{},
						"",
						`${location.pathname}?` +
							(() => {
								const result = [];
								for (key in param_array) {
									value = param_array[key];
									result.push(`${key}=${encodeURIComponent(value)}`);
								}
								return result;
							})().join("&")
					);
					return parent.history[function_name](
						{},
						"",
						`${location.pathname}?` +
							(() => {
								const result1 = [];
								for (key in param_array) {
									value = param_array[key];
									if (key.substr(0, 1) !== "_") {
										result1.push(`${key}=${encodeURIComponent(value)}`);
									}
								}
								return result1;
							})().join("&")
					);
				};

				stateChange = function () {
					const state = window.History.getState().hash;
					const qindex = state.indexOf("?");
					if (qindex === -1) {
						updateQuery({});
						return;
					}
					const query = state.substr(qindex + 1);
					const query_state = {};
					if (query !== "") {
						for (let query_piece of Array.from(query.split("&"))) {
							const [key, value] = Array.from(query_piece.split("="));
							query_state[key] = value;
						}
					}

					return stateChangeWithNewQueryState(query_state);
				};
			} else {
				updateQuery = (query_state) => stateChangeWithNewQueryState($.extend({}, query_state));
			}

			this.get = () => $.extend({}, current_query_pieces);

			this.getKey = (key) => current_query_pieces[key];

			this.register = function (key_array, closure) {
				const call_obj = {};
				for (let key of Array.from(key_array)) {
					call_obj[key] = current_query_pieces[key];
					if (!registered_params[key]) {
						registered_params[key] = [];
					}
					registered_params[key].push(closure);
				}
				return closure(call_obj);
			};

			this.unregister = (key_array) =>
				(() => {
					const result = [];
					for (let key of Array.from(key_array)) {
						if (registered_params[key]) {
							result.push(delete registered_params[key]);
						} else {
							result.push(undefined);
						}
					}
					return result;
				})();

			this.set = (key_value_map) => updateQuery($.extend({}, current_query_pieces, key_value_map));

			this.unset = function (key) {
				if (!this.isset(key)) {
					throw "bad key " + key;
				}
				const new_query_pieces = $.extend({}, current_query_pieces);
				delete new_query_pieces[key];
				return updateQuery(new_query_pieces);
			};

			this.isset = (key) => current_query_pieces.hasOwnProperty(key);

			if (should_use_persistent_history) {
				$(window).bind("statechange", stateChange);
				stateChange();
			}

			is_init = true;
		} else {
			// already init'd
			this.unregister(Object.keys(default_params));
			this.set($.extend({}, default_params));
		}

		return this.set($.extend({}, default_params, this.get()));
	};
	return this;
})();

SF.action = {};
SF.action.handle = (success_closure, error_closure, finally_closure) =>
	function (data) {
		if (!data.success) {
			if (error_closure) {
				error_closure(data.error);
			} else {
				if (data.error != null) {
					alert(`${data.error.type}: ${data.error.message}`);
				}
			}
		} else {
			if (success_closure) {
				success_closure(data);
			}
		}
		if (finally_closure) {
			finally_closure(data);
		}
	};
SF.action.get = (action, action_data, success_closure, error_closure) =>
	$.ajax({
		type: "GET",
		url: action,
		data: action_data,
		success: SF.action.handle(success_closure, error_closure),
		dataType: "json",
	});
SF.action.post = (action, action_data, success_closure, error_closure) =>
	$.ajax({
		type: "POST",
		url: action,
		data: action_data,
		success: SF.action.handle(success_closure, error_closure),
		dataType: "json",
	});

SF.bootstrap = {};
SF.bootstrap.alert = {};
SF.bootstrap.alert.basic = function (message, type) {
	if (type == null) {
		type = "danger";
	}
	const possible_types = ["danger", "warning", "success", "info"];
	if (!Array.from(possible_types).includes(type)) {
		throw `${type} not a valid type. Possible types are ${possible_types}`;
	}
	if (message.html) {
		message = message.html();
	}
	//attribute "data-alert" from twitter/bootstrap gives a nice close animation automatically
	const element = $(`<div class='alert alert-dismissable alert-${type} fade in'><button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button><span>${message}</span></div>`);
	return element;
};

let cache_dirty_key_list = [];
const cache_closure_list = {};
let cache_closure_args = {};
SF.cache = {};
SF.cache.dirty = function (key, arg = null) {
	if (!Array.from(cache_dirty_key_list).includes(key)) {
		cache_dirty_key_list.push(key);
	}
	if (arg) {
		if (cache_closure_args[key] == null) {
			cache_closure_args[key] = [];
		}
		cache_closure_args[key] = arg;
	}
	return null;
};

SF.cache.registerHandle = function (key, closure) {
	if (cache_closure_list[key] == null) {
		cache_closure_list[key] = [];
	}
	cache_closure_list[key].push(closure);
	return null;
};
SF.cache.unregisterHandles = function (key) {
	cache_closure_list[key] = [];
	return null;
};
SF.cache.refresh = function () {
	for (let key of Array.from(cache_dirty_key_list)) {
		if (cache_closure_list[key] != null) {
			for (let cache_closure of Array.from(cache_closure_list[key])) {
				if (cache_closure_args[key] != null) {
					cache_closure(cache_closure_args[key]);
				} else {
					cache_closure();
				}
			}
		}
	}
	cache_dirty_key_list = [];
	cache_closure_args = {};
	return null;
};

window.CKEDITOR_BASEPATH = SF.html.fixUrl("/third-party/CKEditor/");

SF.cache.unregisterHandles("su-update-users");
SF.cache.registerHandle("su-update-users", (user) =>
	SF.action.post("action/admin/user/all/get", {}, (response) =>
		$(".su-users-select").each(function () {
			const $child = $(this);
			const selected_user_ids = [];
			$child.find(":selected").each(function () {
				return selected_user_ids.push(parseInt($(this).val()));
			});
			$child.empty().append(new Option());
			for (let child of Array.from(response.users)) {
				const selected = $.inArray(child.Id, selected_user_ids) > -1 || user.Id === child.Id;
				$child.append(new Option(child.FirstName + " " + child.LastName, child.Id, selected, selected));
			}
			return $child.trigger("change");
		})
	)
);

SF.form = {};
SF.form.throwError = function ($form, message, clear_existing_errors) {
	if (clear_existing_errors == null) {
		clear_existing_errors = true;
	}
	const block = SF.bootstrap.alert.basic(message, "danger");
	if (!$form.find(".form-error-container").length) {
		$form.append($("<div class='form-error-container'></div>"));
	}
	const $container = $(".form-error-container");
	if (clear_existing_errors) {
		$container.empty();
	}
	$container.append(block);
	const $modal_content = $form.closest(".modal-content");
	if ($modal_content.length) {
		return $modal_content.animate({ scrollTop: $modal_content[0].scrollHeight }, "slow");
	}
};
function __guard__(value, transform) {
	return typeof value !== "undefined" && value !== null ? transform(value) : undefined;
}
function __range__(left, right, inclusive) {
	let range = [];
	let ascending = left < right;
	let end = !inclusive ? right : ascending ? right + 1 : right - 1;
	for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
		range.push(i);
	}
	return range;
}

SF.buildFormData = (formData, data, parentKey) => {
	if (data && typeof data === "object" && !(data instanceof Date) && !(data instanceof File)) {
		Object.keys(data).forEach((key) => {
			SF.buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
		});
	} else {
		const value = data == null ? "" : data;
		formData.append(parentKey, value);
	}
};

SF.link = {};
SF.link.parse = function (url) {
	const location = document.createElement("a");
	location.href = url;
	return location;
};

SF.link.makeRelative = function (url) {
	const DOMAIN_TEST = new RegExp("^(?:https?:)?(?://)?" + window.location.hostname);
	const matches = url.match(DOMAIN_TEST);
	if (matches) {
		url = url.substr(matches[0].length);
	}
	return url;
};

SF.link.makeRelativeIfInternal = function (url) {
	const location = SF.link.parse(url);
	const relative_url = SF.link.makeRelative(url);
	const new_url = relative_url && window.location.hostname === location.hostname ? relative_url : url;
	return new_url;
};

SF.link.targetForUrl = function (url) {
	// Email
	if (url.indexOf("@") !== -1) {
		return "";
	}

	// Remove domain
	url = SF.link.makeRelative(url);

	// Home page becomes /
	if (!url) {
		url = "/";
	}
	const RELATIVE_URI = /^(?:\/(?:[^\/\.]|$)+|[^\/\.:]+(?:\/|$))/;
	const is_file = url.match(/^\/file\//) !== null;
	if (!is_file && RELATIVE_URI.test(url)) {
		return "";
	} else {
		return "_blank";
	}
};
