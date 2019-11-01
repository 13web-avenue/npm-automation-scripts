'use strict';

export let tab = ((list_tabs_link, active_class)=> {

    // Object literal
    let el_tab = {
        
        list: list_tabs_link,
        active_class: active_class,
        get_content(){
            let tab_list = document.querySelectorAll(el_tab.list),
                tabs;
            for(tabs of Array.from(tab_list)) {
                tabs.addEventListener('click', function(e){
                    e.preventDefault();
                    this.classList.add(active_class);
                });
            }
        }
        
    };

    let tabify = el_tab.get_content();

    return { tabify }

})('.list-tabs__link', 'is-tab-active');
