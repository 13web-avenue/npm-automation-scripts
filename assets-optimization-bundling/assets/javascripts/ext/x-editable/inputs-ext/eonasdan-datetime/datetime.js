
/**
Bootstrap-datetimepicker.  
Based on [smalot bootstrap-datetimepicker plugin](https://github.com/smalot/bootstrap-datetimepicker). 
Before usage you should manually include dependent js and css:

    <link href="css/datetimepicker.css" rel="stylesheet" type="text/css"></link> 
    <script src="js/bootstrap-datetimepicker.js"></script>

For **i18n** you should include js file from here: https://github.com/smalot/bootstrap-datetimepicker/tree/master/js/locales
and set `language` option.  

@class datetime
@extends abstractinput
@final
@since 1.4.4
@example
<a href="#" id="last_seen" data-type="datetime" data-pk="1" data-url="/post" title="Select date & time">15/03/2013 12:45</a>
<script>
$(function(){
    $('#last_seen').editable({
        format: 'yyyy-mm-dd hh:ii',    
        viewformat: 'dd/mm/yyyy hh:ii',    
        datetimepicker: {
                weekStart: 1
           }
        }
    });
});
</script>
**/

/*global moment*/

(function ($) {
    "use strict";
    var datetimeMinTimeTicks = 621355968000000000; // (new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)).Ticks;

    var ServerDataTypes = {
        DateTimeIso: "DateTimeIso",
        Tick: "Tick",
        TimeSpan: "TimeSpan"
    };

    var MinViewModes = {
        Year: 0,
        Month: 1,
        Day: 2,
        Hour: 3,
        Minute: 4,
        Second: 5
    };

    var EonasdanDateTime = function (options) {
        this.init('eonasdan-date-time', options, EonasdanDateTime.defaults);
        this.initPicker(options, EonasdanDateTime.defaults);
    };

    $.fn.editableutils.inherit(EonasdanDateTime, $.fn.editabletypes.abstractinput);

    $.extend(EonasdanDateTime.prototype, {
        initPicker: function (options, defaults) {
            //'format' is set directly from settings or data-* attributes

            //try parse datetimepicker config defined as json string in data-datetimepicker
            options.datetimepicker = $.fn.editableutils.tryParseJson(options.datetimepicker, true);

            //overriding datetimepicker config (as by default jQuery extend() is not recursive)
            //since 1.4 datetimepicker internally uses viewformat instead of format. Format is for submit only
            this.options.datetimepicker = $.extend({}, defaults.datetimepicker, options.datetimepicker);
            this.options.datetimepicker.startDateAttributes = this.options.startDateAttributes;
            this.options.datetimepicker.endDateAttributes = this.options.endDateAttributes;
            this.options.datetimepicker.serverDataType = this.options.serverDataType;

            //language
            this.options.language = this.options.language || 'en';

            //store parsed formats
            this.parsedFormat = defaults.format; // this.options.format; //this.dpg.parseFormat(this.options.format, this.options.formatType);
            this.parsedViewFormat = this.options.datetimepicker.format; //this.dpg.parseFormat(this.options.viewformat, this.options.formatType);
            this.options.datetimepicker.showClear = this.options.showClear;
        },
        render: function () {
            //transfer validation data to hidden input
            this.$input.find('input[type="hidden"]').data('val', this.options.val);
            this.$input.find('input[type="hidden"]').data('val-required', this.options.valRequired);
            if (this.options.datetimepicker.range)
                this.$input.empty(); 

            this.$input.mafDatepicker(this.options.datetimepicker); 
            this.$input.closest('div.editable-container').addClass('editable-datetime');
            // //"clear" link
            // if(this.options.clear) {
            //     this.$clear = $('<a href="#"></a>').html(this.options.clear).click($.proxy(function(e){
            //         e.preventDefault();
            //         e.stopPropagation();
            //         this.clear();
            //     }, this));

            //     this.$tpl.parent().append($('<div class="editable-clear">').append(this.$clear));  
            // }
        },

        value2html: function (value, element) {
            var text = value ? this.formatDate(value, this.parsedViewFormat, this.options.language, " - ") : '';
            if (element) {
                EonasdanDateTime.superclass.value2html.call(this, text, element);
            } else {
                return text;
            }
        },

        html2value: function (html) {
            return this.parseDate(html, this.parsedViewFormat);
        },

        value2str: function (value) {
            return value ? this.formatDate(value, this.parsedFormat, this.options.language) : '';
        },

        str2value: function (str) {
            if (this.options.datetimepicker.range === true) {
                var vals = null;
                if (str) {
                    if (Array.isArray(str)) { //don't know why this case happens
                        return str;
                    }
                    vals = [];
                    str.split(";").forEach(function (val) {
                        val = val.trim();
                        if (val) {
                            vals.push(this.parseDate(val, this.parsedFormat));
                        }
                    }, this);
                }

                return vals;
            }
            return this.parseDate(str, this.parsedFormat);
        },

        value2submit: function (value) {
            if (this.options.serverDataType === ServerDataTypes.DateTimeIso) {
                 return this.value2str(value);
            } else if (this.options.serverDataType === ServerDataTypes.Tick) {
                return value ? value.valueOf() * 10000 + datetimeMinTimeTicks : '';
            } 
        },

        value2input: function (value) {
            this.$input.data("DateTimePicker").date(value);
        },

        input2value: function () {
            var result = this.$input.data('DateTimePicker').date();
            if (!result) {
                return null;
            }

            if (this.options.datetimepicker.range === true && result.length > 2) {
                return [result[0], result[result.length - 1]];
            }

            return result;
        },

        activate: function () {
        },

        //    clear: function() {
        //       this.$input.data('DateTimePicker').date(null);
        //       this.$input.find('.active').removeClass('active');
        //       if(!this.options.showbuttons) {
        //          this.$input.closest('form').submit(); 
        //       }          
        //    },
        submitClosestForm: function (e) {
            var $form = $(this).closest('form');
            setTimeout(function () {
                $form.submit();
            }, 200);
        },
        autosubmit: function () {
            var minViewMode = this.getMinViewMode(this.options.datetimepicker.format);
            var listenerClass = '.day';
            if (minViewMode === MinViewModes.Year) { listenerClass = '.year'; }
            if (minViewMode === MinViewModes.Month) { listenerClass = '.month'; }
            if (minViewMode === MinViewModes.Day) { listenerClass = '.day'; }
            if (minViewMode === MinViewModes.Hour) { listenerClass = '.hour'; }
            if (minViewMode === MinViewModes.Minute) { listenerClass = '.minute'; }
            if (minViewMode === MinViewModes.Second) { listenerClass = '.second'; }

            this.$input.on('mouseup', listenerClass + ':not(.disabled)', this.submitClosestForm);
            this.$input.on('mouseup', '[data-action="clear"]', this.submitClosestForm);
        },
        /*
         For incorrect date bootstrap-datetimepicker returns current date that is not suitable
         for datetimefield.
         This function returns null for incorrect date.  
        */
        parseDate: function (str, format) {
            var date = null, formattedBack;
            if (str) {
                date = moment(str, format); //this.dpg.parseDate(str, format, this.options.datetimepicker.language, this.options.formatType);
            }
            return date;
        },
        formatDate: function (value, parsedFormat, language, separator) {
            separator = separator ? separator : ";";
            if (Array.isArray(value)) {
                var strValue = [];
                value.forEach(function (ele) {
                    strValue.push(moment(ele, parsedFormat).format(parsedFormat));
                });
                return strValue.join(separator);
            }
            return moment(value, parsedFormat).format(parsedFormat); //Note: don't care about language yet
        },
        //from dtp core js
        isEnabled: function (granularity) {

            if (typeof granularity !== 'string' || granularity.length > 1) {
                throw new TypeError('isEnabled expects a single character string parameter');
            }
            var actualFormat = this.options.datetimepicker.format;
            switch (granularity) {
                case 'w': 
                    return actualFormat.indexOf('w') !== -1;
                case 'y':
                    return actualFormat.indexOf('Y') !== -1;
                case 'M':
                    return actualFormat.indexOf('M') !== -1;
                case 'd':
                    return actualFormat.toLowerCase().indexOf('d') !== -1;
                case 'h':
                case 'H':
                    return actualFormat.toLowerCase().indexOf('h') !== -1;
                case 'm':
                    return actualFormat.indexOf('m') !== -1;
                case 's':
                    return actualFormat.indexOf('s') !== -1;
                default:
                    return false;
            }
        },
        /**
         * minViewMode {
         * year = 0, month = 1, day = 2, hour = 3, minute = 4, second = 5
         * }
         * **/
        getMinViewMode: function (displayFormat) {
            var minViewMode = 0;
            if (this.isEnabled('y')) { minViewMode = MinViewModes.Year; }
            if (this.isEnabled('M')) { minViewMode = MinViewModes.Month; }
            if (this.isEnabled('d') || this.isEnabled('w')) { minViewMode = MinViewModes.Day; }
            if (this.isEnabled('h')) { minViewMode = MinViewModes.Hour; }
            if (this.isEnabled('m')) { minViewMode = MinViewModes.Minute; }
            if (this.isEnabled('s')) { minViewMode = MinViewModes.Second; }

            return minViewMode;
        }

    });

    EonasdanDateTime.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        /**
        @property tpl 
        @default <div></div>
        **/
        tpl: '<div class="editable-date input-group date editable-input"><input type="hidden" class="datepickerinput" /></div>',
        /**
        @property inputclass 
        @default null
        **/
        inputclass: null,
        /**
        Format used for sending value to server. Also applied when converting date from <code>data-value</code> attribute.<br>
        Possible tokens are: <code>d, dd, m, mm, yy, yyyy, h, i</code>  
        
        @property format 
        @type string
        @default yyyy-mm-dd hh:ii
        **/
        format: 'YYYY-MM-DDTHH:mm:ss',
        formatType: 'standard',
        /**
        Format used for displaying date. Also applied when converting date from element's text on init.   
        If not specified equals to <code>format</code>
        
        @property viewformat 
        @type string
        @default null
        **/
        viewformat: null,
        /**
        Configuration of datetimepicker.
        Full list of options: https://github.com/smalot/bootstrap-datetimepicker

        @property datetimepicker 
        @type object
        @default { }
        **/
        datetimepicker: {
            inline: true,
        },
        /**
        Text shown as clear date button. 
        If <code>false</code> clear button will not be rendered.

        @property clear 
        @type boolean|string
        @default 'x clear'
        **/
        clear: '&times; clear',

        /**
        Attributes for start and end so that they can be parsed to created hidden inputs in date range picker.

        @property startDateAttributes / endDateAttributes
        @type json
        @default null
        **/
        startDateAttributes: null,
        endDateAttributes: null,
        showClear: false,
        /**
        For client to know which data type should be sent to server (TimeSpan, Tick, String, DateTime)

        @property serverDataType 
        @type string
        @default DateTimeIso
        **/
        serverDataType: 'DateTimeIso',
        val: false,
        valRequired: null
    });

    $.fn.editabletypes.eonasdanDateTime = EonasdanDateTime;

}(window.jQuery));