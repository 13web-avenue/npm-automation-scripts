'use strict';
 

exports.floating_label = (function(floating_index){

    const floating = (floating_index)=> {

        const float_el = floating_index;

        $(float_el).focusin(function(){
            $(this).parents('.floating-label').addClass('has-value');
        });

        $(float_el).blur(function(){
            if(!$(this).val().length > 0) {
                $(this).parents('.floating-label').removeClass('has-value');
            }
        });
        return floating;
    }
    return { floating() }
})();


  
  