'use strict';

//--> exporting func
export let grid = ((data_block_view)=> {
    
    //--> List/Grid View
    const triggerLayout = () => triggerGridView(),
          triggerListView = () => $('[data-tab=my-communities]').attr('data-block-view', 'list-view'),
          triggerGridView = () =>  $('[data-tab=my-communities]').attr('data-block-view', 'grid-view'),
          triggerListViewCardAnimationChange = () => $('.c-card__toolbox').removeClass('is-faded-pull-right').addClass('is-faded-pull-up'),
          triggerGridCardAnimationChange = () => $('.c-card__toolbox').removeClass('is-faded-pull-up').addClass('is-faded-pull-right');

    $('.js-list-layout-view').on('click', (e)=>{
        e.preventDefault();
        triggerListView();
        triggerListViewCardAnimationChange();
    });

    $('.js-grid-layout-view').on('click', (e)=>{
        e.preventDefault();
        triggerGridView();
        triggerGridCardAnimationChange()
    });

    return { grid }
})();