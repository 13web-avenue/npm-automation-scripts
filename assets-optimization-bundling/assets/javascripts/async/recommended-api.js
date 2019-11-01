'use strict';

exports.api = function(ajax_url) {

	const get_recommended_api = ()=> {
        
        fetch('/recommended-api',{
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        })
        .then((response) => response.json())
        .then(function(data){
            let card_data = data;

            return card_data.map(function(value) {
                let is_dynamic_content = document.querySelector('.is-dynamic-container .row');
                const tpl_node =  [
                    '<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 columns">',
                    '<article>',
                    '<div class="card c-card c-card--recommended">',
                    '<div class="c-card__header">',
                    '<h4 class="candidate-fullname">'+value.CandidateFullName+'</h4></div>',
                    '<div class="c-card__content">',
                    '<p class="c-card-text">',
                    '<span class="info-experience"> Experience: <em>'+value.Experience+'</em></span>',
                    '<span class="info-expertise"> Expertise:<em>'+value.Expertise+'</em></span>',
                    '<span class="info-skills"> Skills:<em>'+value.Skills+'</em></span>',
                    '<span class="info-location"> Location:<em>'+value.Location+'</em></span>',
                    '<span class="info-availability">Availability: <em>'+value.Availability+'</em></span></p>',
                    '</div>',
                    '<div class="c-card__footer"></div>',
                    '<div class="c-card__toolbox c-card__toolbox--info"></div>',
                    '<div class="c-card__toolbox c-card__toolbox--ua is-faded-pull-right">',
                    '<div class="a-btn"><a class="a-link-share" href="#" title="Share this candidate"><i class="fa fa-user-plus" aria-hidden="true"></i></a></div>',
                    '<hr class="b-vertical-seperator">',
                    '<div class="a-btn"><a class="a-link-delete" href="#" title="Remove this candidate"><i class="fa fa-times" aria-hidden="true"></i></a></div></div></div></article></div>',
                ].join('');

                $(is_dynamic_content).prepend(tpl_node);
                
            })
        })
        .catch(function(){
            console.log('failed to fetch data')
        })    
        
        return get_recommended_api;
	}
	return {
	    init: get_recommended_api()
    };
    
}();
