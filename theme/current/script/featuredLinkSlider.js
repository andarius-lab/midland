// tests at /admin/theme/view/script/tests.html

var getSliderState = function( nCards, cardWidth, sliderWidth, left, action ) {
	var doCardsOverflowRight = function( cardsWidth, sliderWidth, left ) {
		return ( cardsWidth + left ) > sliderWidth;
	};
	
	var shouldCenterCard = function( cardWidth, sliderWidth ) {
		return sliderWidth <= ( cardWidth * 3 );
	};
	
	var calculateInitialCenteredLeft = function( cardWidth, sliderWidth ) {
		return ( sliderWidth / 2 ) - ( cardWidth / 2 );
	};
	
	var calculatePageWidth = function( cardWidth, sliderWidth ) {
		return ( shouldCenterCard( cardWidth, sliderWidth ) ) ? cardWidth : sliderWidth;
	};
	
	var calculateMinLeft = function( cardsWidth, sliderWidth ) {
		var visibleCardsWidth = shouldCenterCard( cardWidth, sliderWidth ) ?
			( sliderWidth / 2 ) + ( cardWidth / 2 ) : sliderWidth;

		return visibleCardsWidth - cardsWidth;
	};
	
	var calculateLeftAfterPageRight = function( cardsWidth, sliderWidth, left ) {
		var minLeft = calculateMinLeft( cardsWidth, sliderWidth );
		var pageWidth = calculatePageWidth( cardWidth, sliderWidth );
		
		return Math.max( left - pageWidth, minLeft );
	};
	
	var calculateMaxLeft = function( cardWidth, sliderWidth ) {
		return ( shouldCenterCard( cardWidth, sliderWidth ) ) ?
			calculateInitialCenteredLeft( cardWidth, sliderWidth ) : 0;
	};
	
	var calculateLeftAfterPageLeft = function( cardWidth, cardsWidth, sliderWidth, left ) {
		var maxLeft = calculateMaxLeft( cardWidth, sliderWidth );
		var pageWidth = calculatePageWidth( cardWidth, sliderWidth );
		
		return Math.min( left + pageWidth, maxLeft );
	};
	
	var calculateInitialLeft = function( cardWidth, sliderWidth ) {
		var centeredLeft = calculateInitialCenteredLeft( cardWidth, sliderWidth );
		
		return ( shouldCenterCard( cardWidth, sliderWidth ) ) ? centeredLeft : 0;
	};
	
	var calculateNewLeft = function( cardWidth, cardsWidth, sliderWidth, left, action ) {
		if ( action === "right" ) {
			return calculateLeftAfterPageRight( cardsWidth, sliderWidth, left );
		} else if ( action === "left" ) {
			return calculateLeftAfterPageLeft( cardWidth, cardsWidth, sliderWidth, left );
		} else if ( ! left ) {
			return calculateInitialLeft( cardWidth, sliderWidth );
		} else {
			return left;
		}
	};
	
	var cardsWidth = nCards * cardWidth;
	var newLeft = calculateNewLeft( cardWidth, cardsWidth, sliderWidth, left, action );
	var leftArrow = newLeft < 0;
	var rightArrow = doCardsOverflowRight( cardsWidth, sliderWidth, newLeft );
	
	return {
		leftArrow: leftArrow,
		rightArrow: rightArrow,
		left: newLeft
	};
};

jQuery( document ).ready(function () {
	var initializeCardSlider = function() {
		var slider = jQuery( '.organism-cardSlider' );
		var list = slider.find( 'ul' );
		var cards = slider.find( 'li' );
		var nCards = cards.length;
		
		var updateSlider = function( action ) {
			var cardWidth = cards.outerWidth( true );
			var sliderWidth = slider.width();
			var left = parseInt( list.css( "left" ), 10 );
			
			var newState = getSliderState(
				nCards,
				cardWidth,
				sliderWidth,
				left,
				action
			);
			
			slider.toggleClass( "showLeft", newState.leftArrow );
			slider.toggleClass( "showRight", newState.rightArrow );
			list.animate( {left: newState.left}, 400 );
		};
		
		var pageRight = function( e ) {
			e.preventDefault();
			updateSlider( "right" );
		};
		
		var pageLeft = function( e ) {
			e.preventDefault();
			updateSlider( "left" );
		};
		
		if ( slider.length ) {
			slider.find( 'a.left' ).click( pageLeft );
			slider.find( 'a.right' ).click( pageRight );
			
			jQuery( window ).on( "resize", updateSlider );
			
			updateSlider();
		}
	};
	
	initializeCardSlider();
});