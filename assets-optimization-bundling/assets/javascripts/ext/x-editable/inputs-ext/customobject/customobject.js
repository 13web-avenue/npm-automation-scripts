/*
@class customobjectsdadsaassd
@extends abstractinput
@final
@example
<a href="#" id="customobject_Id" data-type="custom" data-pk="1">almost awesome</a>
<script>
$(function(){
    $('#customobject_Id').editable({
    });
});
</script>
**/
/*
Custom Object
*/
(function ($) {
    "use strict";

    var CustomObject = function (options) {
        this.init('customobject', options, CustomObject.defaults);
    };
    $.fn.editableutils.inherit(CustomObject, $.fn.editabletypes.abstractinput);
    $.extend(CustomObject.prototype, {
        /**
       Renders input from tpl

       @method render() 
       **/
        render: function () {
            this.$input.html();
            var $template = this.$tpl;
            var $propertyType = this.options.propertyType;
            var $display = this.options.display;
            var $html = Object.keys($propertyType).map(function(e){
                var $clone = $template.clone();
                $clone.find('label').html($display[e]);
                $clone.find('input').prop('name', e);
                let numericTypes = ["Byte", "SByte", "Decimal", "Double", "Single", "Int32", "UInt32", "Int64", "UInt64", "Int16", "UInt16"];
                if($.inArray( $propertyType[e],numericTypes) >= 0)
                    $clone.find('input').prop('type','number');
                return $("<div />").append($clone.html()).html();
            }).join('');
            this.$input.html($html);
        },

        /**
        Default method to show value in element. Can be overwritten by display option.
        
        @method value2html(value, element) 
        **/
        value2html: function (value, element) {
            if (Object.keys(value).filter(function(e){
                return (value[e] != undefined && value[e] != null &&  value[e] != 0 && value[e].length > 0);
            }).length == 0) {
                $(element).empty();
                return;
            }

            var valueInString = Object.keys(value).map(function(e){
                return value[e]
            }).join(', ');

            if ($(element).data('text') != undefined)
                valueInString = $(element).data('text');

            var html = $('<div>').text(valueInString).html();
            $(element).html(html);
        },

        /**
        Gets value from element's html
        
        @method html2value(html) 
        **/
        html2value: function (html) {
            /*
              you may write parsing method to get value by element's html
              e.g. "Moscow, st. Lenina, bld. 15" => {city: "Moscow", street: "Lenina", building: "15"}
              but for complex structures it's not recommended.
              Better set value directly via javascript, e.g. 
              editable({
                  value: {
                      city: "Moscow", 
                      street: "Lenina", 
                      building: "15"
                  }
              });
            */
            return null;
        },

        /**
         Converts value to string. 
         It is used in internal comparing (not for sending to server).
         
         @method value2str(value)  
        **/
        value2str: function (value) {
            var str = '';
            if (value) {
                for (var k in value) {
                    str = str + k + ':' + value[k] + ';';
                }
            }
            return str;
        },

        /*
         Converts string to value. Used for reading value from 'data-value' attribute.
         
         @method str2value(str)  
        */
        str2value: function (str) {
            /*
            this is mainly for parsing value defined in data-value attribute. 
            If you will always set value by javascript, no need to overwrite it
            */
            return str;
        },

        /**
         Sets value of input.
         
         @method value2input(value) 
         @param {mixed} value
        **/
        value2input: function (value) {
            if (!value) {
                return;
            }
            this.$input.find('input').each(function(e){
                 $(this).val(value[$(this).attr('name')]);
            });
        },

        /**
         Returns value of input.
         
         @method input2value() 
        **/
        input2value: function () {
            var obj = {};
            this.$input.find('input').each(function () {
                var name = $(this).attr('name');
                var value = $(this).val();
                obj[name] = value;
            });

            return obj;
        },

        /**
        Activates input: sets focus on the first field.
        
        @method activate() 
       **/
        activate: function () {
            var firstInput =  this.$input.find('input').first();
            if (typeof firstInput != 'undefined')
                firstInput.focus();
        },
    });

    CustomObject.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        /** Template for XEditableCustom Item **/
        tpl: '<div><div class="editable-custom"><label></label><input type="text" class="form-control input-large"></div></div>',

        /** value in JObject format to be parsed and set values on inputs
         * {
            "City": "HCM",
            "HouseNumber": 199,
            "Street": "Dien Bien Phu"
            }
         * **/
        value: null,

        /** display in JObject format to be parsed and set labels on inputs
         * {
            "City": "City",
            "HouseNumber": "House number",
            "Street": "Street"
            }
         * **/
        display:null,
        /** types in JObject format to be parsed and set on inputs
         * {
            "City": "String",
            "HouseNumber": "Int",
            "Street": "String"
            }
         * **/
        propertyType:null,

        /** name is used for binding custom object and send to server
         * data-name="Address"
         * **/
        name: null,

        /** text is used for displaying custom text from ITextable
         * data-name="Address"
         * **/
        text: '',
        
        /** Always show buttons
         * **/
        showbuttons: true
    });

    $.fn.editabletypes.customobject = CustomObject;
}(window.jQuery));