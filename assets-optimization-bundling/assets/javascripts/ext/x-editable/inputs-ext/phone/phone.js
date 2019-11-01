/**
phone editable input.

@class phone
@extends abstractinput
@final
**/

(function ($) {
    "use strict";

    var Phone = function (options) {
        this.init('phone', options, Phone.defaults);
        this.options.autotext = 'always';
        this.isoValue = this.options.isoValue;
        this.countryIso2 = this.options.countryIso2;
        this.countryDialCode = this.options.countryDialCode;
        this.needToBeFix = this.options.needToBeFix;
    };

    //inherit from Abstract input
    $.fn.editableutils.inherit(Phone, $.fn.editabletypes.abstractinput);

    $.extend(Phone.prototype, {
        /**
        Renders input from tpl

        @method render() 
        **/
        render: function () {
            this.$input = this.$tpl;
            MAF.Phone.InitTelInput(this.$input.filter('input'));
        },
        getTelInput: function() {
            return this.$input.filter("input");
        },
        html2value: function (html) {
            return null; //we do not use value from display text
        },

        //display text from value
        value2html: function (value, element) {
            if (!value) {
                $(element).empty();
                return;
            }

            var displayHtml = MAF.Phone.getDisplayPhoneTemplate({
                value: value,
                isoValue: this.isoValue,
                countryIso2: this.countryIso2,
                countryDialCode: this.countryDialCode,
                needToBeFix: this.needToBeFix
            });

            $(element).html(displayHtml);
        },

        value2input: function (value) {
            if (!value) {
                return;
            }
            this.getTelInput().val(value);
            if (this.countryIso2) {
                this.getTelInput().intlTelInput("setCountry", this.countryIso2);
            }
        },

        input2value: function () {
            var countryData = this.getTelInput().intlTelInput("getSelectedCountryData");
            this.countryIso2 = countryData.iso2;
            this.countryDialCode = countryData.dialCode;
            this.needToBeFix = false;
            return this.getTelInput().val();
        },

        /**
         Attaches handler to submit form in case of 'showbuttons=false' mode
         
         @method autosubmit() 
        **/
        autosubmit: function () {
            this.$input.keydown(function (e) {
                if (e.which === 13) {
                    if ($(this).intlTelInput("isValidNumber")) {
                        $(this).closest('form').submit();
                    } else {
                        e.preventDefault();
                    }
                }
            });
        }
    });

    Phone.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        tpl: '<input class="form-control" type="tel"></input>' +
            '<br />' +
            '<span class="hide valid-msg" style="color: #00C900;font-style: italic;">Valid number</span>' +
            '<span class="hide error-msg" style="color: red;font-style: italic;">Invalid number</span>',
        isoValue: "",
        countryIso2: "", //vn, us...
        countryDialCode: "", //84, 1...
        needToBeFix: null
    });

    $.fn.editabletypes.phone = Phone;

}(window.jQuery));