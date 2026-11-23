jQuery( document ).ready(function() {
	var initializeMagicLine = function() {
		var $nav = jQuery( ".organism-navbar" ),
			$topLevelList = $nav.find( ".module-themeNavigation__nav > ul" ),
			$activeLink = $nav.find( ".module-themeNavigation-topLevelLink.active, .module-themeNavigation-topLevelLink:has( .active )" );
		
		var updateLine = function( left, width, display ) {
			$magicLine.css({
				left: left,
				width: width,
				display: display
			});
		};
		
		var moveLineToItem = function( item ) {
			var $el = jQuery( item ),
				position = $el.position(),
				shouldDisplay = position.top === 0,
				display = ( shouldDisplay ) ? "block" : "none";
			
			updateLine(
				position.left,
				$el.width(),
				display
			);
		};
		
		var resetLine = function() {
			moveLineToItem( $activeLink );
		};
		
		$nav.removeClass( "no-js" );

		$nav.append( "<div class='magic-line'></div>" );
		
		var $magicLine = jQuery( ".magic-line" );
		
		resetLine();
		
		jQuery( $topLevelList ).find( "> li" ).hover(function() {
			moveLineToItem( this );
		}, resetLine );
		
		jQuery( $topLevelList ).find( "> li > a" ).click(function() {
			moveLineToItem( jQuery( this ).parent() );
			$magicLine = null;
		});
		
		jQuery( window ).on( "load", resetLine );
		jQuery( window ).on( "resize", resetLine );
	};
	
	initializeMagicLine();
});