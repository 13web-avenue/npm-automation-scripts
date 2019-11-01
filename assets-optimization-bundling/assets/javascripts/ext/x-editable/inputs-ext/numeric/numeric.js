/**
Numeric editable input.

@class numeric
@extends abstractinput
@final
@example
<a href="#" id="address" data-type="numeric" data-pk="1">awesome</a>
<script>
$(function(){
    $('#address').editable({
        url: '/post',
        title: 'Enter number',
        value: 10
        }
    });
});
</script>
**/
/*
Numeric
*/
(function ($) {
    "use strict";

    var Numeric = function (options) {
        this.init('numeric', options, Numeric.defaults);
    };
    $.fn.editableutils.inherit(Numeric, $.fn.editabletypes.text);
    $.extend(Numeric.prototype, {
        render: function () {
            Numeric.superclass.render.call(this);
            this.setAttr('min');
            this.setAttr('max');
            this.setAttr('step');
            this.setAttr('numberFormat');
        },
        postrender: function () {
            if (this.$clear) {
                //increase right ffset  for up/down arrows
                this.$clear.css({ right: 24 });
                /*
                //can position clear button only here, when form is shown and height can be calculated
                var h = this.$input.outerHeight(true) || 20,
                    delta = (h - this.$clear.height()) / 2;
                
                //add 12px to offset right for up/down arrows    
                this.$clear.css({top: delta, right: delta + 16});
                */
            }
        },
        /**
        Converts value for submitting to server. Result can be string or object.
        @method value2submit(value) 
        @param {mixed} value
        @returns {mixed}
        **/
        value2submit: function (value) {
            return {value: value, format : this.$input.attr('numberFormat')}
        },
        value2html: function (value, element) {
            var valueInString = value;
            if (valueInString != "" && $(element).data('text') != undefined)
                valueInString = $(element).data('text');

            $(element).html(valueInString);
        }
    });
    Numeric.defaults = $.extend({}, $.fn.editabletypes.text.defaults, {
        tpl: '<input type="number">',
        inputclass: 'form-control input-mini',
        min: null,
        max: null,
        step: null,
        numberFormat: null,
        text: '',
    });
    $.fn.editabletypes.numeric = Numeric;
}(window.jQuery));