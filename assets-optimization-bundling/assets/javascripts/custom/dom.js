'use strict';

//--> exporting func
export let dom = ((data_site_attribute, select2_mycommunity_class)=> {

    // --> Look for data attributes containing site module specific to in-apps
    let component = {
        site_component: document.getElementsByTagName('header'),
        modal_component: document.getElementsByClassName('modal-dialog'),
        find_component(){
            let component_index;
            for(component_index of Array.from(component.site_component)) {
                let component_index = component_index.getAttribute(data_site_attribute),
                    modals;
                if(component_index === 'My Community') {
                    document.body.classList.add(`${select2_mycommunity_class}`);
                    for(modals of Array.from(component.modal_component)) {
                        modals.classList.add('t-my-community-modal');
                    }
                }
            }
        }
    },
    component_found = component.find_component();
    
    // --> Expose the obj
    return { component_found }

})('data-site-module', 't-my-community');