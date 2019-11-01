'use strict';

exports.hash = ()=> {
	const hash_locator = {
		url_bar: ()=> {
			 const url = location.hash,
			 			 url_slice = url.slice(1);
			 return url_slice
		},
		scroll_to: ()=> {
			const scroll_to_partner = document.querySelector('.a-btn--scroll-down');
			if(scroll_to_partner) {
				scroll_to_partner.addEventListener('click', function(e){
					e.preventDefault();
					const target_el = document.querySelector('.l-container--callout'),
								header = $('.l-header').height();
							// target_text = document.querySelector('.l-container--callout .section__title').innerText.toLowerCase().replace(/^(\w+\S+)$/, ' - '),
							// location.hash = '#' + target;
					$('html, body').animate({
				 		scrollTop: $('.l-container--callout').offset().top - header
			 		}, 500);
				});
			}
		}
	}
	return {
	    init: hash_locator.scroll_to
	};
}
