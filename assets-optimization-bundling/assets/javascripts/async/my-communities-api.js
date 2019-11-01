'use strict';

exports.api = function(ajax_url) {

	const get_communities_api = ()=> {
        
        fetch('/my-community-api',{
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        })
        .then((response) => response.json())
        .then(function(data){
            let card_data = data;

            return card_data.map(function(value) {
                let is_dynamic_content = document.querySelector('.is-dynamic-container .row');
                
                // create moment function to parse date formats 
                const tpl_node =  [
                    '<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 columns">',
                    '<article>',
                    '<div class="card c-card c-card--my-community">',
                    '<div class="c-card__header">',
                    '<h4 class="community-name">'+value.CommunityName+'</h4></div>',
                    '<div class="c-card__content">',
                    '<p class="c-card-text">',
                    '<span class="community-created-date"> Creation date: <em>'+value.CreatedDate+'</em></span>',
                    '<span class="community-created-by"> Created by:<em>'+value.CreatedBy+'</em></span>',
                    '<span class="no-of-people">No of people: <em>'+value.NoOfPeople+'</em></span>',
                    '<span class="shared-with">Shared with:<em>'+value.SharedWith+'</em>',
                    '</div>',
                    '<div class="c-card__footer"></div>',
                    '<div class="c-card__toolbox c-card__toolbox--rating"></div>',
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
        
        return get_communities_api;
	}
	return {
	    init: get_communities_api()
    };
    
}();
