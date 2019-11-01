'use strict';

export let c_flag = (()=> {

    const formatState = (state)=> {
        if(!state.id){
            return state.text;
        }
        var baseUrl = "/images/icons/flags-sprites";
        var $state = $(
            '<i><img src="' + baseUrl + '/' + state.element.value.toLowerCase() + '.png" class="flag" /> ' + state.text + '</i>'
        );
        return $state
    }

    // --> Expose the obj
    return { c_flag }

})();
