'use strict';

export let scroll = ((scroll_element)=> {

    // --> Detect below the fold
    let element = {
        the_element: document.querySelector(scroll_element),
        has_scrolled(){
            return element.the_element.scrollHeight - element.the_element.scrollTop === element.the_element.clientHeight     
        }
    }

    // --> Expose the obj
    return { scroll }

})();