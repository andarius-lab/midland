var $;
$ = jQuery;
$(function () {
	const pagination = new SF.macro.pagination.public($(".blog__posts__container .su__pagination"), ({ page }) => SF.history.set({ page }));

	const refreshBlogPosts = function () {
		const current = SF.history.get();
		const request = {
			search: current.search,
			page: current.page,
		};

		SF.action.post($("#blog_action").val(), request, function (response) {
			pagination.setState(response);
			const truncate_length = 250;
			if (response.count === 0) {
				$(".blog__posts__none").removeClass("sf_hidden");
			}
			SF.proto.build($("#blog__posts__list > .su_prototype"), response.results, function (prototype, data) {
				let tags_prefix;
				prototype.attr("data-id", data.Id);
				prototype.find(".blog__post").attr("href", `${data.Url}`);
				prototype.find(".blog__post__name").text(data.Title);
				if (data.FeaturedImage) {
					prototype.find(".blog__post__image").removeClass("sf_hidden").attr("src", data.FeaturedImage);
				}
				prototype.find(".blog__post__details__date").text(data.PublishedAt);
				let author_string = data.Authors.filter((author) => author.trim().length).join(", ");
				if (author_string) {
					author_string = prototype.find(".blog__post__details__author").data("prefix") + author_string;
					prototype.find(".blog__post__details__divider").removeClass("sf_hidden");
				}
				prototype.find(".blog__post__details__author").text(author_string);
				let description = $.trim(data.Description);
				if (description.length > truncate_length) {
					description = description.substring(0, truncate_length) + "...";
				}
				prototype.find(".blog__post__description").html(description);
				prototype.find(".blog__post__content").html(data.Content);
				tags_prefix = prototype.find(".blog__post__tags").data("prefix");
			});
		});
	};

	SF.history.init({
		page: 1,
		search: "",
	});

	SF.history.register(["page", "search"], refreshBlogPosts);

	$(".blog__posts__none").click(function () {
		const id = $(this).data("id");
		parent.openModal("blog.add", { defaultParentId: id });
	});
});
