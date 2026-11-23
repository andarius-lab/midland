var $;
$ = jQuery;
$(function () {
	const more_details_label = $("#calendar").data("more-details-label");
	const page_url = $("#calendar").data("page-url");
	const $calendar = $("#calendar");
	const view_map = {
		month: "month",
		week: "agendaWeek",
		day: "agendaDay",
		list: "listMonth",
	};
	const default_view = view_map[$calendar.data("default-view")];
	$calendar.fullCalendar({
		defaultView: default_view,
		events: $calendar.data("action"),
		firstDay: 0,
		header: {
			left: "prev,next today",
			center: "title",
			right: "month,agendaWeek,agendaDay,listMonth",
		},
		eventLimit: true,
		contentHeight: window.innerWidth < 500 ? 600 : "auto",
		eventRender(event, element) {
			if (event.type === "sunset") {
				return;
			}
			tippy(element[0], {
				content: `<h4 class="su__event__popup__title">${event.title}</h4>` + event_content(event),
				allowHTML: true,
				interactive: true,
				trigger: "click",
				theme: "light",
				appendTo: () => document.body,
			});
		},
	});

	const date = $("#calendar").data("date");
	if (date) {
		$calendar.fullCalendar("gotoDate", date);
	}

	const format_dates = function (start, end, allDay) {
		const start_moment = start;
		const start_date = start_moment.format("MMM D, YYYY");
		const start_time = start_moment.format("h:mmA");

		const end_moment = end || start_moment;
		const end_date = end_moment.format("MMM D, YYYY");
		const end_time = end_moment.format("h:mmA");

		const format = allDay ? "MMM D, YYYY" : "MMM D, YYYY h:mmA";
		let formatted_date = start_moment.format(format);
		if (allDay && end) {
			const all_day_end_moment = end_moment.subtract(1, "days");
			if (start_date !== all_day_end_moment.format("MMM D, YYYY")) {
				formatted_date += " - <br/>" + all_day_end_moment.format(format);
			}
		} else if (end && start_date === end_date) {
			formatted_date += " - " + end_time;
		} else if (end) {
			formatted_date += " - <br/>" + end_moment.format(format);
		}
		return formatted_date;
	};

	var event_content = function (event) {
		let content = format_dates(event.start, event.end, event.allDay);
		if (event.recurrenceDescription) {
			content += `<div class='su__event__popup__recurrence'>${event.recurrenceDescription.trim()}</div>`;
		}
		if (event.details) {
			content += `<div class='su__event__popup__details'>${event.details.trim()}</div>`;
		}
		if (event.location) {
			content += `<iframe class='su__event__popup__map' src='https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(event.location)}&zoom=17&key=AIzaSyC0XiUPly6Q2nFRmdqdSCmbn-t7WT1F674'></iframe>`;
		}
		return (content += `<div class='clearfix su__event__popup__more'><a href='${event.detailsUrl}' target='${event.detailsUrlTarget}'>${more_details_label} &raquo;</a></div>`);
	};
});
