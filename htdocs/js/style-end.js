
$(function(){
	var owl = $('.owl-carousel');
	owl.owlCarousel({
		dots: false,
//		mouseDrag: false,
		startPosition: 2,
		responsive: {
			0: {
				items: 5
			},
			375: {
				items: 6
			},
			568: {
				items: 7
			},
			667: {
				items: 8
			}
//			736: {
//				items: 8
//			}
		},
		onInitialized: initial, // When the plugin has initialized.
	})
	function initial(){
		owl.trigger('next.owl.carousel', [600])
		owl.trigger('next.owl.carousel', [600])
	}
});


// グロナビの高さを揃える
$(function(){
	$(".gnav a").coladjust({
		adjust: false
	});
});
