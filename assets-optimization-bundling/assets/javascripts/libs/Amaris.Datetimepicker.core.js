//This has been mofied from the core library, please refrain from updating this file from the source on github

/*! version : 4.17.43
 =========================================================
 bootstrap-datetimejs
 https://github.com/Eonasdan/bootstrap-datetimepicker
 Copyright (c) 2015 Jonathan Peterson
 =========================================================
 */
/*
 The MIT License (MIT)

 Copyright (c) 2015 Jonathan Peterson

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */
/*global define:false */
/*global exports:false */
/*global require:false */
/*global jQuery:false */
/*global moment:false */
(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD is used - Register as an anonymous module.
        define(['jquery', 'moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery'), require('moment'));
    } else {
        // Neither AMD nor CommonJS used. Use global variables.
        if (typeof jQuery === 'undefined') {
            throw 'bootstrap-datetimepicker requires jQuery to be loaded first';
        }
        if (typeof moment === 'undefined') {
            throw 'bootstrap-datetimepicker requires Moment.js to be loaded first';
        }
        factory(jQuery, moment);
    }
}(function ($, moment) {
    var isExisting = function(currentDate, lstDates, format) {
        for (var i = 0; i < lstDates.length; i++) {
            if (currentDate.isSame(lstDates[i], format))
                return i;
        }
        return -1;
    };

    'use strict';
    if (!moment) {
        throw new Error('bootstrap-datetimepicker requires Moment.js to be loaded first');
    }

    var ServerDataTypes = {
        DateTimeIso : "DateTimeIso",
        Tick : "Tick",
        TimeSpan : "TimeSpan"
    };

    var MinViewModes = {
        Year : 2,
        Month : 1,
        Day : 0 
    };

    var mafDatepicker = function (element, options) {
        var picker = {},
            date,
            dates = [],
            storedDate,
            viewDate,
            unset = true,
            input,
            hiddenInput,
            component = false,
            widget = false,
            use24Hours,
            minViewModeNumber = MinViewModes.Day,
            actualFormat,
            parseFormats,
            serverFormat,
            startDateAttributes,
            endDateAttributes,
            serverDataType,
            name,
            value,
            datetimeMinTimeTicks = 621355968000000000, // (new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)).Ticks;
            currentViewMode,
            datePickerModes = [
                { 
                    clsName: 'days',
                    navFnc: 'y',
                    navStep: 1
                },
                {
                    clsName: 'months',
                    navFnc: 'y',
                    navStep: 1
                },
                {
                    clsName: 'years',
                    navFnc: 'y',
                    navStep: 10
                },
                {
                    clsName: 'decades',
                    navFnc: 'y',
                    navStep: 100
                }
            ],
            viewModes = ['days', 'months', 'years', 'decades'],
            verticalModes = ['top', 'bottom', 'auto'],
            horizontalModes = ['left', 'right', 'auto'],
            toolbarPlacements = ['default', 'top', 'bottom'],
            keyMap = {
                'up': 38,
                38: 'up',
                'down': 40,
                40: 'down',
                'left': 37,
                37: 'left',
                'right': 39,
                39: 'right',
                'tab': 9,
                9: 'tab',
                'escape': 27,
                27: 'escape',
                'enter': 13,
                13: 'enter',
                'pageUp': 33,
                33: 'pageUp',
                'pageDown': 34,
                34: 'pageDown',
                'shift': 16,
                16: 'shift',
                'control': 17,
                17: 'control',
                'space': 32,
                32: 'space',
                't': 84,
                84: 't',
                'delete': 46,
                46: 'delete'
            },
            keyState = {},
            zoneData = [],

            /********************************************************************************
             *
             * Private functions
             *
             ********************************************************************************/

            hasTimeZone = function () {
                return moment.tz !== undefined && options.timeZone !== undefined && options.timeZone !== null && options.timeZone !== '';
            },

            getMoment = function (d) {
                if (d === undefined || d === null) {

                    if (hiddenInput.val() === "")
                        return moment(); //TODO should this use format? and locale?
                    return moment(hiddenInput.val());
                }

                if (options.serverDataType === ServerDataTypes.DateTimeIso) {
                    if (hasTimeZone()) { // There is a string to parse and a default time zone
                        // parse with the tz function which takes a default time zone if it is not in the format string
                        return moment.tz(d, parseFormats, options.useStrict, options.timeZone);
                    } else {
                        return moment(d, parseFormats, options.useStrict);
                    }
                } else if (options.serverDataType === ServerDataTypes.Tick) {
                    return moment((d - datetimeMinTimeTicks) / 10000);
                }
                return moment();
            },

            isEnabled = function (granularity) {
                if (actualFormat == undefined)
                    return false;
                if (typeof granularity !== 'string' || granularity.length > 1) {
                    throw new TypeError('isEnabled expects a single character string parameter');
                }
                switch (granularity) {
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
                    case 'Z':
                        return actualFormat.toLowerCase().indexOf('z') !== -1;
                    case 'w':
                        return actualFormat.toLowerCase().indexOf('w') !== -1;
                    default:
                        return false;
                }
            },
            hasTime = function () {
                return (isEnabled('h') || isEnabled('m') || isEnabled('s'));
            },

            hasDate = function () {
                return (isEnabled('y') || isEnabled('M') || isEnabled('d'));
            },

            isMonthPicker = function () {
                return (isEnabled('y') && isEnabled('M') && !isEnabled('d'));
            },

            isYearPicker = function () {
                return (isEnabled('y') && !isEnabled('M') && !isEnabled('d'));
            },

            hasWeek = function () {
                return (isEnabled('w'));
            },

            getDatePickerTemplate = function () {
                var headTemplate = $('<thead>')
                    .append($('<tr>')
                        .append($('<th>').addClass('prev').attr('data-action', 'previous')
                            .append($('<span>').addClass(options.icons.previous))
                        )
                        .append($('<th>').addClass('year-name picker-switch').attr('data-action', 'pickerSwitch').attr('colspan', '6'))
                        .append($('<th>').addClass('next').attr('data-action', 'next')
                            .append($('<span>').addClass(options.icons.next))
                        )
                    )
                    /*manju2*/
                    .append($('<tr>')
                        .append($('<th>').addClass('prev').attr('data-action', 'previousMonths')
                            .append($('<span>').addClass(options.icons.previous))
                        )
                        //.append($('<th>').text(date.format(actualFormat)))
                        .append($('<th>').addClass('mthName picker-switch').attr('data-action', 'pickerSwitchMonth').attr('colspan', '6').text(viewDate.format('MMMM')))
                        .append($('<th>').addClass('next').attr('data-action', 'nextMonths')
                            .append($('<span>').addClass(options.icons.next))
                        )
                    )

                    .append($('<tr>')
                        .append($('<th>').addClass('changeDate picker-switch').attr('data-action', 'pickerSwitchDate').attr('colspan', '8').text(date.format('dddd Do')))
                    )
                    ,
                    //manju
                    headTemplate1 = $('<thead>')
                        .append($('<tr>')
                            .append($('<th>').addClass('prev').attr('data-action', 'previous')
                                .append($('<span>').addClass(options.icons.previous))
                            )
                            .append($('<th>').addClass('year-name picker-switch').attr('data-action', 'pickerSwitch').attr('colspan', '6'))
                            .append($('<th>').addClass('next').attr('data-action', 'next')
                                .append($('<span>').addClass(options.icons.next))
                            )
                        )
                    ,
                    //MANJU    
                    headTemplate2 = $('<thead>')
                        .append($('<tr>')
                            .append($('<th>').addClass('prev').attr('data-action', 'previous')
                                .append($('<span>').addClass(options.icons.previous))
                            )
                            .append($('<th>').addClass('year-name picker-switch').attr('data-action', 'pickerSwitch').attr('colspan', '6'))
                            .append($('<th>').addClass('next').attr('data-action', 'next')
                                .append($('<span>').addClass(options.icons.next))
                            )
                        )
                        /*manju2*/
                        .append($('<tr>')
                            .append($('<th>').addClass('mthName picker-switch').attr('data-action', 'pickerSwitchMonth').attr('colspan', '8').text(viewDate.format('MMMM'))).css("background-color", "white")
                        )
                    ,
                    contTemplate = $('<tbody>')
                        .append($('<tr>')
                            .append($('<td>').attr('colspan', '8'))
                        ),
                    //manju
                    footTemplate = $('<tfoot>')
                        .append(
                            !isYearPicker() ?
                            $('<tr>').append($('<th>').addClass('mthName picker-switch').attr('data-action', 'pickerSwitchMonth').attr('colspan', '8').text(viewDate.format('MMMM')))
                            : ''
                        )
                        .append(
                            !(isYearPicker() || isMonthPicker()) ?
                            $('<tr>').append($('<th>').addClass('changeDate picker-switch').attr('data-action', 'pickerSwitchDate').attr('colspan', '8').text(date.format('dddd Do')))
                            : ''
                        )
                    ,
                    //MANJU
                    footTemplate1 = $('<tfoot>')
                        .append(
                            !(isYearPicker() || isMonthPicker()) ?
                            $('<tr>')
                            .append($('<th>').addClass('changeDate picker-switch').attr('data-action', 'pickerSwitchDate').attr('colspan', '8').text(date.format('dddd Do')))
                            : ''
                        );

                return [
                    $('<div>').addClass('datepicker-days')
                        .append($('<table>').addClass('table-condensed')
                            .append(headTemplate.clone())
                            .append($('<tbody>'))
                        ),
                    $('<div>').addClass('datepicker-months')
                        .append($('<table>').addClass('table-condensed')
                            .append(headTemplate2.clone()) //MANJU
                            .append(contTemplate.clone())
                            .append(footTemplate1.clone()) //MANJU
                        ),
                    $('<div>').addClass('datepicker-years')
                        .append($('<table>').addClass('table-condensed')
                            .append(headTemplate1.clone()) //MANJU
                            .append(contTemplate.clone())
                            .append(footTemplate.clone()) //MANJU   
                        ),
                    $('<div>').addClass('datepicker-decades')
                        .append($('<table>').addClass('table-condensed')
                            .append(headTemplate.clone())
                            .append(contTemplate.clone())
                        )
                ];
            },

            getTimePickerMainTemplate = function () {
                var topRow = $('<tr>'),
                    middleRow = $('<tr>'),
                    bottomRow = $('<tr>');

                //fix #1549: if only hour view available then center the span
                //assuming that if no minutes are available then we just want hours
                var style = !isEnabled("m") ? "style=\"text-align: center;\"" : "";

                if (isEnabled('h')) {
                    middleRow.append($('<td ' + style + '>')
                        .append($('<span>').addClass('timepicker-hour').attr({ 'data-time-component': 'hours', 'title': options.tooltips.pickHour }).attr('data-action', 'showHours')));
                }
                if (isEnabled('m')) {
                    if (isEnabled('h')) {
                        middleRow.append($('<td>').addClass('separator').html(':'));
                    }
                    middleRow.append($('<td>')
                        .append($('<span>').addClass('timepicker-minute').attr({ 'data-time-component': 'minutes', 'title': options.tooltips.pickMinute }).attr('data-action', 'showMinutes')));
                }
                if (isEnabled('s')) {
                    if (isEnabled('m')) {
                        topRow.append($('<td>').addClass('separator'));
                        middleRow.append($('<td>').addClass('separator').html(':'));
                        bottomRow.append($('<td>').addClass('separator'));
                    }
                    topRow.append($('<td>')
                        .append($('<a>').attr({ href: '#', tabindex: '-1', 'title': options.tooltips.incrementSecond }).addClass('btn').attr('data-action', 'incrementSeconds')
                            .append($('<span>').addClass(options.icons.up))));
                    middleRow.append($('<td>')
                        .append($('<span>').addClass('timepicker-second').attr({ 'data-time-component': 'seconds', 'title': options.tooltips.pickSecond }).attr('data-action', 'showSeconds')));
                    bottomRow.append($('<td>')
                        .append($('<a>').attr({ href: '#', tabindex: '-1', 'title': options.tooltips.decrementSecond }).addClass('btn').attr('data-action', 'decrementSeconds')
                            .append($('<span>').addClass(options.icons.down))));
                }
                if (isEnabled('Z')) {
                    middleRow.append($('<td ' + style + '>')
                        .append($('<span>').addClass('timepicker-zone').attr({ 'data-time-component': 'zones', 'title': options.tooltips.pickZone }).attr('data-action', 'showZones')));
                }

                if (!use24Hours) {
                    topRow.append($('<td>').addClass('separator'));
                    middleRow.append($('<td>')
                        .append($('<button>').addClass('btn btn-primary').attr({ 'data-action': 'togglePeriod', tabindex: '-1', 'title': options.tooltips.togglePeriod })));
                    bottomRow.append($('<td>').addClass('separator'));
                }

                return $('<div>').addClass('timepicker-picker')
                    .append($('<table>').addClass('table-condensed')
                        .append([topRow, middleRow, bottomRow]));
            },

            getTimePickerTemplate = function () {
                var hoursView = $('<div>').addClass('timepicker-hours')
                    .append($('<table>').addClass('table-condensed')),
                    minutesView = $('<div>').addClass('timepicker-minutes')
                        .append($('<table>').addClass('table-condensed')),
                    secondsView = $('<div>').addClass('timepicker-seconds')
                        .append($('<table>').addClass('table-condensed')),
                    zonesView = $('<div>').addClass('timepicker-zones')
                        .append('<table>').addClass('table-condensed'),
                    ret = [getTimePickerMainTemplate()];

                if (isEnabled('h')) {
                    ret.push(hoursView);
                }
                if (isEnabled('m')) {
                    ret.push(minutesView); 
                }
                if (isEnabled('s')) {
                    ret.push(secondsView);
                }
                if (isEnabled('Z')) {
                    ret.push(zonesView);
                }

                return ret;
            },

            getToolbar = function () {
                var row = [];
                if (options.showTodayButton) {
                    row.push($('<td>').append($('<a>').attr({ 'data-action': 'today', 'title': options.tooltips.today }).append($('<span>').addClass(options.icons.today))));
                }
                if (!options.sideBySide && (hasDate() || hasWeek()) && hasTime()) {
                    row.push($('<td>').append($('<a>').attr({ 'data-action': 'togglePicker', 'title': options.tooltips.selectTime }).append($('<span>').addClass(options.icons.time))));
                }
                if (!hiddenInput.data("val-required") && options.showClear) {
                    input.addClass("dtrequired");
                    
                    row.push($('<td>').append($('<a>').attr({ 'data-action': 'clear', 'title': options.tooltips.clear }).append($('<span>').addClass(options.icons.clear))));
                }
                //if (!options.inline) {
                //    row.push($('<td>').append($('<a>').attr({ 'data-action': 'close', 'title': options.tooltips.close }).append($('<span>').addClass(options.icons.close))));
                //}

                return $('<table>').addClass('table-condensed').append($('<tbody>').append($('<tr>').append(row)));
            },

            getTemplate = function () {
                var template = $('<div>').addClass('bootstrap-datetimepicker-widget dropdown-menu'),
                    dateView = $('<div>').addClass('datepicker').append(getDatePickerTemplate()),
                    timeView = $('<div>').addClass('timepicker').append(getTimePickerTemplate()),
                    content = $('<ul>').addClass('list-unstyled'),
                    toolbar = $('<li>').addClass('picker-switch' + (options.collapse ? ' accordion-toggle' : '')).append(getToolbar());

                if (hasWeek()) {
                    template.addClass('week');
                }
                if (options.inline) {
                    template.removeClass('dropdown-menu');
                }

                if (use24Hours) {
                    template.addClass('usetwentyfour');
                }
                if (isEnabled('s') && !use24Hours) {
                    template.addClass('wider');
                }

                if (options.sideBySide && (hasDate() || hasWeek()) && hasTime()) {
                    template.addClass('timepicker-sbs');
                    if (options.toolbarPlacement === 'top') {
                        template.append(toolbar);
                    }
                    template.append(
                        $('<div>').addClass('row')
                            .append(dateView.addClass('col-md-6'))
                            .append(timeView.addClass('col-md-6'))
                    );
                    if (options.toolbarPlacement === 'bottom') {
                        template.append(toolbar);
                    }
                    return template;
                }

                if (options.toolbarPlacement === 'top') {
                    content.append(toolbar);
                }
                if (hasDate() || hasWeek()) {
                    content.append($('<li>').addClass((options.collapse && hasTime() ? 'collapse in' : '')).append(dateView));
                }
                if (options.toolbarPlacement === 'default') {
                    content.append(toolbar);
                }
                if (hasTime()) {
                    content.append($('<li>').addClass((options.collapse && (hasDate() || hasWeek()) ? 'collapse' : '')).append(timeView));
                }
                if (options.toolbarPlacement === 'bottom') {
                    content.append(toolbar);
                }
                return template.append(content);
            },

            dataToOptions = function () {
                var eData,
                    dataOptions = {};

                if (element.is('input') || options.inline) {
                    eData = element.data();
                } else {
                    eData = element.find('input').data();
                }

                if (eData.dateOptions && eData.dateOptions instanceof Object) {
                    dataOptions = $.extend(true, dataOptions, eData.dateOptions);
                }

                $.each(options, function (key) {
                    var attributeName = 'date' + key.charAt(0).toUpperCase() + key.slice(1);
                    if (eData[attributeName] !== undefined) {
                        dataOptions[key] = eData[attributeName];
                    }
                });
                return dataOptions;
            },

            place = function () {
                var position = (component || element).position(),
                    offset = (component || element).offset(),
                    vertical = options.widgetPositioning.vertical,
                    horizontal = options.widgetPositioning.horizontal,
                    parent;

                if (options.widgetParent) {
                    parent = options.widgetParent.append(widget);
                } else if (element.is('input')) {
                    parent = element.after(widget).parent();
                } else if (options.inline) {
                    parent = element.append(widget);
                    return;
                } else {
                    parent = element;
                    element.children().first().after(widget);
                }

                // Top and bottom logic
                if (vertical === 'auto') {
                    if (offset.top + widget.height() * 1.5 >= $(window).height() + $(window).scrollTop() &&
                        widget.height() + element.outerHeight() < offset.top) {
                        vertical = 'top';
                    } else {
                        vertical = 'bottom';
                    }
                }

                // Left and right logic
                if (horizontal === 'auto') {
                    if (parent.width() < offset.left + widget.outerWidth() / 2 &&
                        offset.left + widget.outerWidth() > $(window).width()) {
                        horizontal = 'right';
                    } else {
                        horizontal = 'left';
                    }
                }

                if (vertical === 'top') {
                    widget.addClass('top').removeClass('bottom');
                } else {
                    widget.addClass('bottom').removeClass('top');
                }

                if (horizontal === 'right') {
                    widget.addClass('pull-right');
                } else {
                    widget.removeClass('pull-right');
                }

                // find the first parent element that has a relative css positioning
                if (parent.css('position') !== 'relative') {
                    parent = parent.parents().filter(function () {
                        return $(this).css('position') === 'relative';
                    }).first();
                }

                if (parent.length === 0) {
                    throw new Error('datetimepicker component should be placed within a relative positioned container');
                }

                widget.css({
                    top: vertical === 'top' ? 'auto' : position.top + element.outerHeight(),
                    bottom: vertical === 'top' ? parent.outerHeight() - (parent === element ? 0 : position.top) : 'auto',
                    left: horizontal === 'left' ? (parent === element ? 0 : position.left) : 'auto',
                    right: horizontal === 'left' ? 'auto' : parent.outerWidth() - element.outerWidth() - (parent === element ? 0 : position.left)
                });
            },

            notifyEvent = function (e) {
                if (e.type === 'dp.change' && ((e.date && e.date.isSame(e.oldDate)) || (!e.date && !e.oldDate))) {
                    return;
                }

                element.trigger(e);
            },

            viewUpdate = function (e) {
                if (e === 'y') {
                    e = 'YYYY';
                }
                notifyEvent({
                    type: 'dp.update',
                    change: e,
                    viewDate: viewDate.clone()
                });
            },

            showMode = function (dir) {
                if (!widget) {
                    return;
                }
                if (dir) {
                    currentViewMode = Math.max(minViewModeNumber, Math.min(3, currentViewMode + dir));
                }
                widget.find('.datepicker > div').hide().filter('.datepicker-' + datePickerModes[currentViewMode].clsName).show();
            },

            fillDow = function () {
                var row = $('<tr>'),
                    currentDate = viewDate.clone().startOf('w').startOf('d');

                row.append($('<th>').addClass('cw').text('#'));

                while (currentDate.isBefore(viewDate.clone().endOf('w'))) {
                    row.append($('<th>').addClass('dow').text(currentDate.format('dd')));
                    currentDate.add(1, 'd');
                }
                widget.find('.datepicker-days thead').append(row);
            },

            isInDisabledDates = function (testDate) {
                return options.disabledDates[testDate.format('YYYY-MM-DD')] === true;
            },

            isInEnabledDates = function (testDate) {
                return options.enabledDates[testDate.format('YYYY-MM-DD')] === true;
            },

            isInDisabledHours = function (testDate) {
                return options.disabledHours[testDate.format('H')] === true;
            },

            isInEnabledHours = function (testDate) {
                return options.enabledHours[testDate.format('H')] === true;
            },

            isValid = function (targetMoment, granularity) {
                if (!targetMoment.isValid()) {
                    return false;
                }
                if (options.disabledDates && granularity === 'd' && isInDisabledDates(targetMoment)) {
                    return false;
                }
                if (options.enabledDates && granularity === 'd' && !isInEnabledDates(targetMoment)) {
                    return false;
                }
                if (options.minDate && targetMoment.isBefore(options.minDate, granularity)) {
                    return false;
                }
                if (options.maxDate && targetMoment.isAfter(options.maxDate, granularity)) {
                    return false;
                }
                // Any options which allows daysOfWeekDisabled option will enable checking valid on this option
                if (options.daysOfWeekDisabled && options.daysOfWeekDisabled.indexOf(targetMoment.day()) !== -1) {
                    return false;
                }
                if (options.disabledHours && (granularity === 'h' || granularity === 'm' || granularity === 's') && isInDisabledHours(targetMoment)) {
                    return false;
                }
                if (options.enabledHours && (granularity === 'h' || granularity === 'm' || granularity === 's') && !isInEnabledHours(targetMoment)) {
                    return false;
                }
                if (options.disabledTimeIntervals && (granularity === 'h' || granularity === 'm' || granularity === 's')) {
                    var found = false;
                    $.each(options.disabledTimeIntervals, function () {
                        if (targetMoment.isBetween(this[0], this[1])) {
                            found = true;
                            return false;
                        }
                    });
                    if (found) {
                        return false;
                    }
                }
                return true;
            },

            fillMonths = function () {
                var spans = [],
                    monthsShort = viewDate.clone().startOf('y').startOf('d');
                while (monthsShort.isSame(viewDate, 'y')) {
                    spans.push($('<span>').attr('data-action', 'selectMonth').addClass('month').text(monthsShort.format('MMM')));
                    monthsShort.add(1, 'M');
                }
                widget.find('.datepicker-months td').empty().append(spans);
            },

            updateMonths = function () {
                var monthsView = widget.find('.datepicker-months'),
                    monthsViewHeader = monthsView.find('th'),
                    months = monthsView.find('tbody').find('span');

                monthsViewHeader.eq(0).find('span').attr('title', options.tooltips.prevYear);
                monthsViewHeader.eq(1).attr('title', options.tooltips.selectYear);
                monthsViewHeader.eq(2).find('span').attr('title', options.tooltips.nextYear);

                monthsView.find('.disabled').removeClass('disabled');

                if (!isValid(viewDate.clone().subtract(1, 'y'), 'y')) {
                    monthsViewHeader.eq(0).addClass('disabled');
                }

                monthsViewHeader.eq(1).text(viewDate.format(options.yearViewHeaderFormat));

                if (!isValid(viewDate.clone().add(1, 'y'), 'y')) {
                    monthsViewHeader.eq(2).addClass('disabled');
                }

                months.removeClass('active');
                if (date.isSame(viewDate, 'y') && !unset) {
                    months.eq(date.month()).addClass('active');
                }

                months.each(function (index) {
                    if (!isValid(viewDate.clone().month(index), 'M')) {
                        $(this).addClass('disabled');
                    }
                });

                /// update active months multi date picker
                if (options.quantity > 1) {
                    var year = parseInt(monthsView.find('th.year-name').text());
                    months = $.unique(dates.filter(function(e){
                        return e.year() == year;
                    }).map(function(e){
                        return e.format('MMM');
                    }));

                    monthsView.find('span.month').each(function(e){
                        $(this).removeClass('active');
                        if ($.inArray($(this).text(), months) != -1)
                            $(this).addClass('active');
                    });
                 } else if (options.range && dates.length > 0){ //for date range picker 
                    var year = parseInt(monthsView.find('th.year-name').text());
                    var startDate = dates[0].format('YYYYMM');
                    var endDate = dates[dates.length-1].format('YYYYMM');

                    monthsView.find('span.month').each(function(e){
                        $(this).removeClass('active').removeClass('range');
                        var _moment = moment().month($(this).text()).year(year).format('YYYYMM');
                        if (startDate == _moment || endDate == _moment)
                            $(this).addClass('active');
                        else if (startDate < _moment && endDate > _moment) 
                            $(this).addClass('range');
                    });
                 }
            },

            updateYears = function () {
                var yearsView = widget.find('.datepicker-years'),
                    yearsViewHeader = yearsView.find('th'),
                    startYear = viewDate.clone().subtract(5, 'y'),
                    endYear = viewDate.clone().add(6, 'y'),
                    html = '';

                yearsViewHeader.eq(0).find('span').attr('title', options.tooltips.prevDecade);
                yearsViewHeader.eq(2).find('span').attr('title', options.tooltips.nextDecade);

                yearsView.find('.disabled').removeClass('disabled');
                //manju
                yearsViewHeader.eq(1).addClass('disabled');

                if (options.minDate && options.minDate.isAfter(startYear, 'y')) {
                    yearsViewHeader.eq(0).addClass('disabled');
                }

                yearsViewHeader.eq(1).text(startYear.year() + '-' + endYear.year());

                if (options.maxDate && options.maxDate.isBefore(endYear, 'y')) {
                    yearsViewHeader.eq(2).addClass('disabled');
                }

                while (!startYear.isAfter(endYear, 'y')) {
                    html += '<span data-action="selectYear" class="year' + (startYear.isSame(date, 'y') && !unset ? ' active' : '') + (!isValid(startYear, 'y') ? ' disabled' : '') + '">' + startYear.year() + '</span>';
                    startYear.add(1, 'y');
                }

                yearsView.find('td').html(html);
                
                 /// update active years multi date picker
                if (options.quantity > 1) {
                    var years = $.unique(dates.map(function(e){
                        return e.year();
                    }));

                    yearsView.find('span.year').each(function(e){
                        $(this).removeClass('active');
                        if ($.inArray(parseInt($(this).text()), years) != -1)
                            $(this).addClass('active');
                    });
                 } else if (options.range && dates.length > 0) { //for date range picker 
                    startYear = dates[0].year();
                    endYear = dates[dates.length - 1].year();

                    yearsView.find('span.year').each(function(e){
                        $(this).removeClass('active').removeClass('range');
                        var year = parseInt($(this).text());
                        if (startYear ==  year || endYear ==  year) {
                            $(this).addClass('active');
                        } else if (startYear < year && endYear > year) {
                            $(this).addClass('range');
                        }
                    });
                 }
            },

            updateDecades = function () {
                var decadesView = widget.find('.datepicker-decades'),
                    decadesViewHeader = decadesView.find('th'),
                    startDecade = moment({ y: viewDate.year() - (viewDate.year() % 100) - 1 }),
                    endDecade = startDecade.clone().add(100, 'y'),
                    startedAt = startDecade.clone(),
                    minDateDecade = false,
                    maxDateDecade = false,
                    endDecadeYear,
                    html = '';

                decadesViewHeader.eq(0).find('span').attr('title', options.tooltips.prevCentury);
                decadesViewHeader.eq(2).find('span').attr('title', options.tooltips.nextCentury);

                decadesView.find('.disabled').removeClass('disabled');

                if (startDecade.isSame(moment({ y: 1900 })) || (options.minDate && options.minDate.isAfter(startDecade, 'y'))) {
                    decadesViewHeader.eq(0).addClass('disabled');
                }

                decadesViewHeader.eq(1).text(startDecade.year() + '-' + endDecade.year());

                if (startDecade.isSame(moment({ y: 2000 })) || (options.maxDate && options.maxDate.isBefore(endDecade, 'y'))) {
                    decadesViewHeader.eq(2).addClass('disabled');
                }

                while (!startDecade.isAfter(endDecade, 'y')) {
                    endDecadeYear = startDecade.year() + 12;
                    minDateDecade = options.minDate && options.minDate.isAfter(startDecade, 'y') && options.minDate.year() <= endDecadeYear;
                    maxDateDecade = options.maxDate && options.maxDate.isAfter(startDecade, 'y') && options.maxDate.year() <= endDecadeYear;
                    html += '<span data-action="selectDecade" class="decade' + (date.isAfter(startDecade) && date.year() <= endDecadeYear ? ' active' : '') +
                        (!isValid(startDecade, 'y') && !minDateDecade && !maxDateDecade ? ' disabled' : '') + '" data-selection="' + (startDecade.year() + 6) + '">' + (startDecade.year() + 1) + '-' + (startDecade.year() + 12) + '</span>';
                    startDecade.add(12, 'y');
                }
                html += '<span></span><span></span><span></span>'; //push the dangling block over, at least this way it's even

                decadesView.find('td').html(html);
                decadesViewHeader.eq(1).text((startedAt.year() + 1) + '-' + (startDecade.year()));
            },

           

            fillDate = function () {
                var daysView = widget.find('.datepicker-days'),
                    daysViewHeader = daysView.find('th'),
                    currentDate,
                    html = [],
                    row,
                    clsName,
                    i;

                if (!(hasDate() || hasWeek())) {
                    return;
                }
                daysViewHeader.eq(0).find('span').attr('title', options.tooltips.previous);
                daysViewHeader.eq(1).attr('title', options.tooltips.selectYear);
                daysViewHeader.eq(2).find('span').attr('title', options.tooltips.next);

                daysViewHeader.eq(3).find('span').attr('title', options.tooltips.prevMonth);
                daysViewHeader.eq(4).attr('title', options.tooltips.selectMonth);
                daysViewHeader.eq(5).find('span').attr('title', options.tooltips.nextMonth);

                daysView.find('.disabled').removeClass('disabled');
                daysViewHeader.eq(1).text(viewDate.format(options.yearViewHeaderFormat));
                daysViewHeader.eq(4).text(viewDate.format(options.monthViewHeaderFormat));

                if (!isValid(viewDate.clone().subtract(1, 'M'), 'M')) {
                    daysViewHeader.eq(0).addClass('disabled');
                }
                if (!isValid(viewDate.clone().add(1, 'M'), 'M')) {
                    daysViewHeader.eq(2).addClass('disabled');
                }

                currentDate = viewDate.clone().startOf('M').startOf('w').startOf('d');

                for (i = 0; i < 42; i++) { //always display 42 days (should show 6 weeks)
                    if (currentDate.weekday() === 0) {
                        row = $('<tr>');

                        row.append('<td class="cw">' + currentDate.isoWeek() + '</td>');

                        html.push(row);
                    }
                    clsName = '';
                    if (currentDate.isBefore(viewDate, 'M')) {
                        clsName += ' old';
                    }
                    if (currentDate.isAfter(viewDate, 'M')) {
                        clsName += ' new';
                    }
                    if (options.range) {
                        var startDt = dates[0];
                        var endDt = dates[dates.length - 1];
                        if (startDt != undefined && (currentDate.isSame(startDt, 'd')) && !unset) {
                            clsName += ' active';
                        } else if (endDt != undefined &&  (currentDate.isSame(endDt, 'd')) && !unset) {
                            clsName += ' active';
                        } else if ((currentDate.isAfter(startDt, 'd')) && (currentDate.isBefore(endDt, 'd')) && !unset) {
                            clsName += ' range';
                        }
                    } else if (options.quantity > 1) {
                        if (isExisting(currentDate, dates, 'd') >= 0 && !unset) {
                            clsName += ' active';
                            if (hasWeek()) {
                                row.addClass('active');
                            }
                        }
                    } else if ((currentDate.isSame(date, 'd')) && !unset) {
                        clsName += ' active';
                        if (hasWeek()) {
                            row.addClass('active');
                        }
                    }
                    if (!isValid(currentDate, 'd')) {
                        clsName += ' disabled';
                    }
                    if (currentDate.isSame(moment(), 'd')) {
                        clsName += ' today';
                    }
                    if (currentDate.day() === 0 || currentDate.day() === 6) {
                        clsName += ' weekend';
                    }
                    row.append('<td data-action="selectDay" data-day="' + currentDate.format('L') + '" class="day' + clsName + '">' + currentDate.date() + '</td>');
                    currentDate.add(1, 'd');
                }

                daysView.find('tbody').empty().append(html);

                updateMonths();

                updateYears();

                updateDecades();

                widget.find("th.year-name").text(viewDate.format(options.yearViewHeaderFormat)); //update for year header
                widget.find("th.mthName").text(viewDate.format(options.monthViewHeaderFormat)); //update for month header
                //widget.find("th.changeDate").html(viewDate.format('dddd Do')); //update for day header
            },

            fillHours = function () {
                var table = widget.find('.timepicker-hours table'),
                    currentHour = viewDate.clone().startOf('d'),
                    html = [],
                    row = $('<tr>');

                if (viewDate.hour() > 11 && !use24Hours) {
                    currentHour.hour(12);
                }
                while (currentHour.isSame(viewDate, 'd') && (use24Hours || (viewDate.hour() < 12 && currentHour.hour() < 12) || viewDate.hour() > 11)) {
                    if (currentHour.hour() % 4 === 0) {
                        row = $('<tr>');
                        html.push(row);
                    }
                    row.append('<td data-action="selectHour" class="hour' + (!isValid(currentHour, 'h') ? ' disabled' : '') + '">' + currentHour.format(use24Hours ? 'HH' : 'hh') + '</td>');
                    currentHour.add(1, 'h');
                }
                table.empty().append(html);
            },

            //manju
            fillMinutes = function () {
                var table = widget.find('.timepicker-minutes table'),
                    currentMinute = viewDate.clone().startOf('h'),
                    html = [],
                    row = $('<tr>'),
                    step = options.stepping,
                    cols = options.stepping === 1 ? 6 : 4;

                while (viewDate.isSame(currentMinute, 'h')) {
                    if (currentMinute.minute() % (step * cols) === 0) {
                        row = $('<tr>');
                        html.push(row);
                    }
                    row.append('<td data-action="selectMinute" class="minute' + (!isValid(currentMinute, 'm') ? ' disabled' : '') + '">' + currentMinute.format('mm') + '</td>');
                    currentMinute.add(step, 'm'); //5
                }
                table.empty().append(html);
            },

            fillSeconds = function () {
                var table = widget.find('.timepicker-seconds table'),
                    currentSecond = viewDate.clone().startOf('m'),
                    html = [],
                    row = $('<tr>');

                while (viewDate.isSame(currentSecond, 'm')) {
                    if (currentSecond.second() % 20 === 0) {
                        row = $('<tr>');
                        html.push(row);
                    }
                    row.append('<td data-action="selectSecond" class="second' + (!isValid(currentSecond, 's') ? ' disabled' : '') + '">' + currentSecond.format('ss') + '</td>');
                    currentSecond.add(5, 's');
                }

                table.empty().append(html);
            },

            fillZones = function () {
                var table = widget.find('.timepicker-zones table'),
                    //zone is in minutes: 420 == +7
                    currentZone = viewDate.clone().format("Z"),
                    html = [],
                    row = $('<tr>');


                $.each(options.zoneData, function (index, value) {
                    row = $('<tr>');
                    row.append('<td data-action="selectZone" class="zone" title="' + value[0] + '">' + value[1] + '</td>');
                    html.push(row);
                });

                table.empty().append(html);
            },

            //ntr02: use viewDate which have the temp data before call setValue
            fillTime = function () {
                var toggle, newDate, timeComponents = widget.find('.timepicker span[data-time-component]');

                if (!use24Hours) {
                    toggle = widget.find('.timepicker [data-action=togglePeriod]');
                    newDate = viewDate.clone().add((date.hours() >= 12) ? -12 : 12, 'h');

                    toggle.text(viewDate.format('A'));

                    if (isValid(newDate, 'h')) {
                        toggle.removeClass('disabled');
                    } else {
                        toggle.addClass('disabled');
                    }
                }

                widget.find("th.changeDate").text(viewDate.format('dddd Do'));
                widget.find("th.mthName").text(viewDate.format('MMMM'));
                timeComponents.filter('[data-time-component="hours"]').text(viewDate.format(use24Hours ? 'HH' : 'hh'));
                timeComponents.filter('[data-time-component="minutes"]').text(viewDate.format('mm'));
                timeComponents.filter('[data-time-component="seconds"]').text(viewDate.format('ss'));
                timeComponents.filter('[data-time-component="zones"]').text(viewDate.format('Z'));

                fillHours();
                fillMinutes();
                fillSeconds();
                fillZones();
            },

            update = function () {
                if (!widget) {
                    return;
                }
                fillDate();
                fillTime();
            },
            updateInputs = function (dt) {
                if (dt == undefined || dt === '') {
                    input.val('');
                    hiddenInput.val('');
                    return;
                }

                var _dt;
                if (hasWeek()){
                    //If the locale assigns Monday as the first day of the week, moment().weekday(0) will be Monday. 
                    //If Sunday is the first day of the week, moment().weekday(0) will be Sunday.
                    _dt = dt.clone().weekday(0); 
                }
                else {
                    _dt = dt;
                }

                if (options.serverDataType === ServerDataTypes.DateTimeIso) {
                    input.val(_dt.format(actualFormat));
                    hiddenInput.val(_dt.format(options.serverFormat));
                } else { //(options.serverDataType === ServerDataTypes.Tick) 
                    input.val(_dt.format(actualFormat));
                    hiddenInput.val(_dt.valueOf() * 10000 + datetimeMinTimeTicks);
                }

                var $form = hiddenInput.closest('form');
                if ($form.length > 0) {
                    hiddenInput.valid();
                }
            },
            updateMultiInputs = function (dts) {
                if (dts == undefined || dts.length === 0) {
                    input.val('');
                    hiddenInput.val('');
                    return;
                }

                var datesInActualFormat = dts.filter(function(e) {
                    return e !== "";
                }).map(function (e) {
                    return e.format(actualFormat);
                }).join("; ");
            
                input.val(datesInActualFormat);

                for (var i = 0; i < dts.length; i ++) {
                    hiddenInput.eq(i).val(dts[i].format(serverFormat));
                }

                for (var i = dts.length; i < options.quantity; i++) {
                    hiddenInput.eq(i).val('');
                }
                
                var $form = hiddenInput.closest('form');
                if ($form.length > 0) {
                    hiddenInput.valid();
                }
            },
            updateRangeInputs = function (dts) {
                if (dts == undefined || dts.length === 0) {
                    input.val('');
                    hiddenInput.each(function () {
                        $(this).val('');
                    });
                    return;
                }

                if (dts.length > 0) {
                    var startDt = dts[0];
                    var endDt = dts[dts.length - 1];

                    if (startDt.isSame(endDt)) {
                        input.val(startDt.format(actualFormat));
                        hiddenInput.eq(0).val(startDt.format(options.serverFormat));
                        hiddenInput.eq(1).val('');
                        return;
                    } 

                    input.val(startDt.format(actualFormat) + " - " + endDt.format(actualFormat));
                    hiddenInput.eq(0).val(startDt.format(options.serverFormat));
                    hiddenInput.eq(1).val(endDt.format(options.serverFormat));
                }

                var $form = hiddenInput.closest('form');
                if ($form.length > 0) {
                    hiddenInput.valid();
                }
            },
            setValue = function (targetMoment) {
                var oldDate = unset ? null : date;

                // case of calling setValue(null or false)
                if (!targetMoment) {
                    unset = true;
                    updateInputs();
                    element.data('date', '');
                    notifyEvent({
                        type: 'dp.change',
                        date: false,
                        oldDate: oldDate
                    });
                    update();
                    return;
                }

                targetMoment = targetMoment.clone().locale(options.locale);

                if (hasTimeZone()) {
                    targetMoment.tz(options.timeZone);
                }

                if (options.stepping !== 1) {
                    targetMoment.minutes((Math.round(targetMoment.minutes() / options.stepping) * options.stepping));
                }

                if (isValid(targetMoment)) {
                    date = targetMoment;
                    viewDate = date.clone();
                    if ((!options.minDate || options.minDate.isSameOrBefore(date)) && (!options.maxDate || options.maxDate.isSameOrAfter(date))) {
                        updateInputs(date);
                    }
                    //manju1
                    //alert(date.format(actualFormat));
                    element.data('date', date.format(actualFormat));
                    unset = false;
                    update();
                } else {
                    if (!options.keepInvalid) {
                        if ((!options.minDate || options.minDate.isBefore(date)) && (!options.maxDate || options.maxDate.isAfter(date))) {
                            updateInputs(unset ? '' : date);
                        }
                    } else {
                        notifyEvent({
                            type: 'dp.change',
                            date: targetMoment,
                            oldDate: oldDate
                        });
                    }
                    notifyEvent({
                        type: 'dp.error',
                        date: targetMoment,
                        oldDate: oldDate
                    });
                }
            },
            setValuesForRange = function (date) {
                if (dates.length === 0 || dates.length > 1) {
                    dates = [date];
                } else {
                    if (date.isSameOrAfter(dates[0]))
                        dates.push(date);
                    else 
                        dates.splice(0, 0, date);
                }
                setValues(dates);
            },

            setValuesForMultiple = function (date, granularity) {
                var _index = isExisting(date, dates, granularity);
                if (_index < 0) {
                    if (dates.length < options.quantity)
                        dates.push(date);
                } else {
                    dates.splice(_index, 1);
                }
                setValues(dates);
            },

            setValues = function (targetMoments) {
               var oldDate = unset ? null : date;

               // case of calling setValue(null or false)
               if (!targetMoments) {
                   unset = true;
                   if (options.range)
                        updateRangeInputs();
                   else 
                        updateMultiInputs();
                   element.data('dates', '[]');
                   dates = [];
                   notifyEvent({
                       type: 'dp.change',
                       date: false,
                       oldDate: oldDate
                   });
                   update();
                   return;
               }
               targetMoments = targetMoments.map(function (e) {
                    return e.clone().locale(options.locale);
               });
               dates = [];
               targetMoments.map(function (e) {
                   if (hasTimeZone()) {
                       e.tz(options.timeZone);
                   }
                   if (options.stepping !== 1) {
                       e.minutes((Math.round(e.minutes() / options.stepping) * options.stepping));
                   }
                   if (isValid(e)) {
                       if ((!options.minDate || options.minDate.isSameOrBefore(e)) && (!options.maxDate || options.maxDate.isSameOrAfter(e))) {
                           dates.push(e); 
                       }
                       unset = false;
                   } else {
                       if (!options.keepInvalid) {
                           if ((!options.minDate || options.minDate.isBefore(date)) && (!options.maxDate || options.maxDate.isAfter(date))) {
                                dates.push(unset ? '' : date);
                           }
                       } else {
                           notifyEvent({
                               type: 'dp.change',
                               date: e,
                               oldDate: oldDate
                           });
                       }
                       notifyEvent({
                           type: 'dp.error',
                           date: e,
                           oldDate: oldDate
                       });
                   }
               });
               update();
               if (options.range)
                    updateRangeInputs(dates);
               else
                    updateMultiInputs(dates);
            },
            /**
             * Hides the widget. Possibly will emit dp.hide
             */
            hide = function () {
                var transitioning = false;
                if (!widget) {
                    return picker;
                }
                // Ignore event if in the middle of a picker transition
                widget.find('.collapse').each(function () {
                    var collapseData = $(this).data('collapse');
                    if (collapseData && collapseData.transitioning) {
                        transitioning = true;
                        return false;
                    }
                    return true;
                });
                if (transitioning) {
                    return picker;
                }
                if (component && component.hasClass('btn')) {
                    component.toggleClass('active');
                }
                widget.hide();

                $(window).off('resize', place);
                widget.off('click', '[data-action]');
                widget.off('mousedown', false);

                widget.remove();
                widget = false;

                notifyEvent({
                    type: 'dp.hide',
                    date: date.clone()
                });

                if (!unset || (storedDate && !storedDate.isSame(date))) {
                    notifyEvent({
                        type: 'dp.change',
                        date: date,
                        oldDate: storedDate
                    });
                }

                input.blur();

                currentViewMode = Math.max(viewModes.indexOf(options.viewMode), minViewModeNumber);
                viewDate = date.clone();

                return picker;
            },

            clear = function () {
                setValues(null);
                setValue(null);
                if (!options.inline && options.quantity === 1) {
                    hide();
                }
            },

            parseInputDate = function (inputDate) {
                if (options.parseInputDate === undefined) {
                    if (!moment.isMoment(inputDate)) {
                        if (Array.isArray(inputDate)) { //handle multiple
                            var inputDates = [];
                            inputDate.forEach(function(ele){
                                inputDates.push(getMoment(ele));
                            });
                            return inputDates;
                        }
                        return getMoment(inputDate);
                    }
                    else {
                        return inputDate;
                    }
                } else {
                    return options.parseInputDate(inputDate);
                }
                //inputDate.locale(options.locale);
            },

            /********************************************************************************
             *
             * Widget UI interaction functions
             *
             ********************************************************************************/
            actions = {
                next: function () {
                    var navFnc = datePickerModes[currentViewMode].navFnc;
                    viewDate.add(datePickerModes[currentViewMode].navStep, navFnc);
                    fillDate();
                    viewUpdate(navFnc);
                },
                //manju
                nextMonths: function () {
                    //navigation in 1 month
                    var navFnc = 'M'; //datePickerModes[1].navFnc;
                    viewDate.add(1, navFnc);
                    fillDate();
                    viewUpdate(navFnc);
                },

                previous: function () {
                    var navFnc = datePickerModes[currentViewMode].navFnc;
                    viewDate.subtract(datePickerModes[currentViewMode].navStep, navFnc);
                    fillDate();
                    viewUpdate(navFnc);
                },

                //manju
                previousMonths: function () {
                    var navFnc = 'M';//datePickerModes[1].navFnc;
                    viewDate.subtract(1, navFnc);
                    fillDate();
                    viewUpdate(navFnc);
                },

                pickerSwitch: function () {
                    //manju
                    widget.find('.timepicker .timepicker-picker').hide();
                    widget.find('.timepicker .timepicker-hours').hide();
                    widget.find('.timepicker .timepicker-minutes').hide();
                    widget.find("div.datepicker-years table tbody").show();
                    widget.find("div.datepicker-months table tbody").show();
                    widget.find("div.datepicker-days table tbody").show();
                    //showMode(1);
                    currentViewMode = 0;
                    /* $("div.datepicker-years table thead tr:nth-child(2) th.prev, div.datepicker-years table thead tr:nth-child(2) th.next , div.datepicker-years table tfoot tr:nth-child(1) th.prev, div.datepicker-years table tfoot tr:nth-child(1) th.next").html("").attr("data-action","");*/
                    widget.find("div.datepicker-years table thead tr th").css("background-color", "white");
                    widget.find("li.picker-switch table tbody tr td").css("background-color", "#eef1f3");
                    showMode(2);
                },

                //manju
                pickerSwitchMonth: function () {
                    widget.find('.timepicker .timepicker-picker').hide();
                    widget.find('.timepicker .timepicker-hours').hide();
                    widget.find('.timepicker .timepicker-minutes').hide();
                    widget.find("div.datepicker-months table tbody").show();
                    widget.find("div.datepicker-days table tbody").show();
                    currentViewMode = 0;
                    widget.find("div.datepicker-months table thead tr:nth-child(2) th.prev, div.datepicker-months table thead tr:nth-child(2) th.next").html("").attr("data-action", "");
                    widget.find("div.datepicker-months table thead tr:nth-child(2) th.prev, div.datepicker-months table thead tr:nth-child(2) th.next , div.datepicker-months table thead tr:nth-child(2) th.mthName").css("background-color", "white");
                    widget.find("li.picker-switch table tbody tr td").css("background-color", "#eef1f3");
                    showMode(1);
                },

                //manju
                pickerSwitchDate: function () {
                    widget.find('.timepicker .timepicker-picker').hide();
                    widget.find('.timepicker .timepicker-hours').hide();
                    widget.find('.timepicker .timepicker-minutes').hide();
                    widget.find("div.datepicker-days table tbody").show();
                    widget.find("div.datepicker-days table thead tr:nth-child(4)").show();
                    currentViewMode = 0;
                    showMode(-1);
                    //implemented after feedback
                    widget.find("div.datepicker-days table thead tr:nth-child(3) th.prev, div.datepicker-days table thead tr:nth-child(3) th.next").html("").attr("data-action", "");
                    widget.find("div.datepicker-days table thead tr:nth-child(3) th").css("background-color", "white");
                    widget.find("li.picker-switch table tbody tr td").css("background-color", "#eef1f3");
                },

                selectMonth: function (e) {
                    var month = $(e.target).closest('tbody').find('span').index($(e.target));
                    viewDate.month(month);
                    //manju
                    widget.find("th.mthName").html(viewDate.format('MMMM'));
                    if (currentViewMode === minViewModeNumber) {
                        setValue(date.clone().year(viewDate.year()).month(viewDate.month()).date(1));
                        if (!options.inline && options.quantity === 1 && !options.range) {
                            hide();
                        }
                    } else {
                        showMode(-1);
                        fillDate();
                    }
                    viewUpdate('M');
                    if ((hasDate() || hasWeek())) {
                        var firstDateOfMonth = date.clone().year(viewDate.year()).month(viewDate.month()).date(1);
                        if (options.range && minViewModeNumber == MinViewModes.Month) {
                            setValuesForRange(firstDateOfMonth);
                        } else if (options.quantity > 1 && minViewModeNumber == MinViewModes.Month) { 
                            setValuesForMultiple(firstDateOfMonth);
                        } else if ((options.range || options.quantity > 1) && minViewModeNumber != MinViewModes.Month ) {
                            setValues(dates);
                        } else { //for casual DateTime Picker
                            setValue(date.clone().year(viewDate.year()).month(viewDate.month()));
                        }
                    }
                },

                selectYear: function (e) {
                    var year = parseInt($(e.target).text(), 10) || 0;
                    viewDate.year(year);
                    var viewModeBeforeChange = currentViewMode;
                    if (currentViewMode === minViewModeNumber) {
                        setValue(date.clone().year(viewDate.year()).month(0).date(1));
                        if (!options.inline && options.quantity === 1 && !options.range) {
                            hide();
                        }
                    } else {
                        showMode(-1);
                        fillDate();
                    }
                    //manju
                    if (widget) {
                        //VMO - widget is false if viewMode set to years
                        widget.find("div.datepicker-months table thead tr:nth-child(2) th.prev, div.datepicker-months table thead tr:nth-child(2) th.next").html("").attr("data-action", "");
                    }
                    viewUpdate('YYYY');
                    if ((hasDate() || hasWeek())) {
                        var firstDateOfYear = date.clone().year(viewDate.year()).month(0).date(1);
                        if (options.range && minViewModeNumber == MinViewModes.Year) {
                            setValuesForRange(firstDateOfYear);
                        } else if (options.quantity > 1 && minViewModeNumber == MinViewModes.Year) { 
                            setValuesForMultiple(firstDateOfYear,'y');
                        } else if ((options.range || options.quantity > 1) && minViewModeNumber != MinViewModes.Year ) {
                            setValues(dates);
                        } else { //for casual DateTime Picker
                            setValue(date.clone().year(viewDate.year()));
                        }
                    }
                },

                selectDecade: function (e) {
                    var year = parseInt($(e.target).data('selection'), 10) || 0;
                    viewDate.year(year);
                    if (currentViewMode === minViewModeNumber) {
                        setValue(date.clone().year(viewDate.year()));
                        if (!options.inline) {
                            hide();
                        }
                    } else {
                        showMode(-1);
                        fillDate();
                    }
                    viewUpdate('YYYY');
                    if ((hasDate() || hasWeek())) {
                        setValue(date.clone().year(viewDate.year()));
                    }
                },

                selectDay: function (e) {
                    var day = viewDate.clone();
                    if ($(e.target).is('.old')) {
                        day.subtract(1, 'M');
                    }
                    if ($(e.target).is('.new')) {
                        day.add(1, 'M');
                    }
                    var _day = day.date(parseInt($(e.target).text(), 10));
                    if (!hasTime()) {
                        if (options.range) { 
                           setValuesForRange(_day)
                        } else if (options.quantity > 1) { 
                            setValuesForMultiple(_day, 'd');
                        } else { //for casual DateTime Picker
                            setValue(_day);
                        }
                    } else {
                        if (options.quantity > 1) { //for MultiDate Picker
                            var _index = isExisting(_day, dates, 'd');
                            if (_index < 0) {
                                if (dates.length < options.quantity) {
                                    viewDate = _day;
                                    actions.togglePicker.call(picker);
                                }
                            } else { //for casual DateTime Picker
                                dates.splice(_index, 1);
                            }
                            update();
                            setValues(dates);
                        } else {
                            viewDate = _day;
                            actions.togglePicker.call(picker);
                            update();
                            setValue(_day);
                        }
                    }

                    viewUpdate();
                    if (!hasTime() && !options.keepOpen && !options.inline && options.quantity === 1 && !options.range) {
                        hide();
                    }

                },

                incrementHours: function () {
                    var newDate = date.clone().add(1, 'h');
                    if (isValid(newDate, 'h')) {
                        setValue(newDate);
                    }
                },

                incrementMinutes: function () {
                    var newDate = date.clone().add(options.stepping, 'm');
                    if (isValid(newDate, 'm')) {
                        setValue(newDate);
                    }
                },

                incrementSeconds: function () {
                    var newDate = date.clone().add(1, 's');
                    if (isValid(newDate, 's')) {
                        setValue(newDate);
                    }
                },

                decrementHours: function () {
                    var newDate = date.clone().subtract(1, 'h');
                    if (isValid(newDate, 'h')) {
                        setValue(newDate);
                    }
                },

                decrementMinutes: function () {
                    var newDate = date.clone().subtract(options.stepping, 'm');
                    if (isValid(newDate, 'm')) {
                        setValue(newDate);
                    }
                },

                decrementSeconds: function () {
                    var newDate = date.clone().subtract(1, 's');
                    if (isValid(newDate, 's')) {
                        setValue(newDate);
                    }
                },

                togglePeriod: function () {
                    setValue(date.clone().add((date.hours() >= 12) ? -12 : 12, 'h'));
                },
                //manju
                togglePicker: function () {
                    widget.find("th.changeDate").trigger("click");
                    widget.find("div.datepicker-days table tbody").hide();
                    widget.find("div.datepicker-months table tbody").hide();
                    widget.find("div.datepicker-years table tbody").hide();
                    widget.find("div.datepicker-days table thead tr:nth-child(4)").hide();
                    widget.find("ul li:nth-child(3)").removeClass("collapse");
                    widget.find('.timepicker .timepicker-picker').show();
                    //manju
                    widget.find("td.hour").filter(function () {
                        return $(this).text() == date.format(use24Hours ? 'HH' : 'hh');
                    }).addClass("active");
                    widget.find(".timepicker-hour").trigger("click");

                    widget.find("td.minute").filter(function () {
                        return $(this).text() == date.format('mm');
                    }).addClass("active");

                    //implemented after feedback
                    widget.find("div.datepicker-days table thead tr:nth-child(3) th.prev").attr('data-action', 'previousDay')
                        .append($('<span>').addClass(options.icons.previous));
                    widget.find("div.datepicker-days table thead tr:nth-child(3) th.next").attr('data-action', 'nextDay')
                        .append($('<span>').addClass(options.icons.next));
                    widget.find("div.datepicker-days table thead tr:nth-child(3) th").css("background-color", "#D0D9DC");
                    widget.find("li.picker-switch table tbody tr td").css("background-color", "#fff");
                },

                showPicker: function () {
                    
                    widget.find('.timepicker > div:not(.timepicker-picker)').hide();
                    widget.find('.timepicker .timepicker-picker').show();
                },
                //manju
                showHours: function () {
                    widget.find('.timepicker .timepicker-picker').show(); //hide
                    widget.find('.timepicker .timepicker-hours').show();
                    widget.find('.timepicker .timepicker-minutes').hide();
                    widget.find('.timepicker .timepicker-seconds').hide();
                    widget.find('.timepicker .timepicker-zones').hide();

                    widget.find('span[data-time-component]').removeClass("active");
                    widget.find('span.timepicker-hour').addClass("active");

                    widget.find("td.hour").filter(function () {
                        return $(this).text() == date.format(use24Hours ? 'HH' : 'hh');
                    }).addClass("active");  //manju
                },
                //manju
                showMinutes: function () {
                    widget.find('.timepicker .timepicker-picker').show(); //hide
                    widget.find('.timepicker .timepicker-hours').hide();
                    widget.find('.timepicker .timepicker-minutes').show();
                    widget.find('.timepicker .timepicker-seconds').hide();
                    widget.find('.timepicker .timepicker-zones').hide();

                    widget.find('span[data-time-component]').removeClass("active");
                    widget.find('span.timepicker-minute').addClass("active");
                    widget.find("td.minute").filter(function () {
                        return $(this).text() == date.format('mm');
                    }).addClass("active");   //manju
                },

                showSeconds: function () {
                    widget.find('.timepicker .timepicker-picker').show(); //hide
                    widget.find('.timepicker .timepicker-hours').hide();
                    widget.find('.timepicker .timepicker-minutes').hide();
                    widget.find('.timepicker .timepicker-seconds').show();
                    widget.find('.timepicker .timepicker-zones').hide();

                    widget.find('span[data-time-component]').removeClass("active");
                    widget.find('span.timepicker-second').addClass("active");
                    widget.find("td.second").filter(function () {
                        return $(this).text() == date.format('ss');
                    }).addClass("active");  //manju
                },

                showZones: function () {
                    widget.find('.timepicker .timepicker-picker').show(); //hide
                    widget.find('.timepicker .timepicker-hours').hide();
                    widget.find('.timepicker .timepicker-minutes').hide();
                    widget.find('.timepicker .timepicker-seconds').hide();
                    widget.find('.timepicker .timepicker-zones').show();

                    widget.find('span[data-time-component]').removeClass("active");
                    widget.find('span.timepicker-zone').addClass("active");

                    widget.find("td.hour").filter(function () {
                        return $(this).text() == date.format(use24Hours ? 'HH' : 'hh');
                    }).addClass("active");  //manju
                },

                selectHour: function (e) {
                    var hour = parseInt($(e.target).text(), 10);

                    if (!use24Hours) {
                        if (date.hours() >= 12) {
                            if (hour !== 12) {
                                hour += 12;
                            }
                        } else {
                            if (hour === 12) {
                                hour = 0;
                            }
                        }
                    }

                    //ntr02: only setValue when this view is the min hour view
                    if (isEnabled('h') && !isEnabled('m') && !isEnabled('s')) {
                        if (options.quantity > 1 && dates.length < options.quantity) { //for MultiDate Picker
                            dates.push(viewDate.clone().hours(hour));
                            setValues(dates);
                            actions.pickerSwitchDate();
                        } else { //for casual DateTime Picker
                            setValue(viewDate.clone().hours(hour));
                            if (!options.keepOpen && !options.inline) {
                                hide();
                            }
                        }
                    } else {
                        viewDate.hours(hour);
                        actions.showPicker.call(picker);
                        actions.showMinutes();
                        fillTime();
                        if (options.quantity === 1) {
                            setValue(viewDate.clone().hours(hour));
                        }
                    }
                    viewUpdate();
                },

                selectMinute: function (e) {
                    var minute = parseInt($(e.target).text(), 10);
                    //ntr02: only setValue when this view is the min hour view
                    if (!isEnabled('s')) {
                        if (options.quantity > 1 && dates.length < options.quantity) { //for MultiDate Picker
                            dates.push(viewDate.clone().minutes(minute));
                            setValues(dates);
                            actions.pickerSwitchDate();
                        } else {  //for casual DateTime Picker
                            setValue(viewDate.clone().minutes(minute));
                            if (!options.keepOpen && !options.inline) {
                                hide();
                            }
                        }
                    } else {
                        viewDate.minutes(minute);
                        actions.showPicker.call(picker);
                        actions.showSeconds();
                        fillTime();
                        if (options.quantity > 1 && dates.length < options.quantity) {
                            setValue(viewDate.clone().minutes(minute));
                        }
                    }
                    viewUpdate();
                },

                selectSecond: function (e) {
                    var second = parseInt($(e.target).text(), 10);
                    setValue(viewDate.clone().seconds(second));
                    actions.showPicker.call(picker);
                    //actions.close();
                    viewUpdate();
                    if (!options.keepOpen && !options.inline) {
                        hide();
                    }
                },

                selectZone: function (e) {
                    var timezone = $(e.target).text();
                    setValue(viewDate.clone().utcOffset(timezone.split(" ")[0], true));
                    actions.showPicker.call(picker);
                    //actions.close();
                    viewUpdate();
                    if (!options.keepOpen && !options.inline) {
                        hide();
                    }
                },

                clear: clear,

                today: function () {
                    var todaysDate = getMoment();
                    if (isValid(todaysDate, 'd')) {
                        setValue(todaysDate);
                    }
                },

                close: hide
            },

            doAction = function (e) {
                if ($(e.currentTarget).is('.disabled')) {
                    return false;
                }
                actions[$(e.currentTarget).data('action')].apply(picker, arguments);
                return false;
            },

            /**
             * Shows the widget. Possibly will emit dp.show and dp.change
             */
            show = function () {
                var currentMoment,
                    useCurrentGranularity = {
                        'year': function (m) {
                            return m.month(0).date(1).hours(0).seconds(0).minutes(0);
                        },
                        'month': function (m) {
                            return m.date(1).hours(0).seconds(0).minutes(0);
                        },
                        'day': function (m) {
                            return m.hours(0).seconds(0).minutes(0);
                        },
                        'hour': function (m) {
                            return m.seconds(0).minutes(0);
                        },
                        'minute': function (m) {
                            return m.seconds(0);
                        }
                    };

                if (input.prop('disabled') || (!options.ignoreReadonly && input.prop('readonly')) || widget) {
                    return picker;
                }
                if (input.val() !== undefined && input.val().trim().length !== 0) {
                    //setValue(parseInputDate(input.val().trim()));
                } else if (unset &&
                    //options.useCurrent &&
                    (options.inline || (input.is('input') && input.val().trim().length === 0)) && options.quantity === 1 && !options.range) {
                    currentMoment = getMoment();
                    //if (typeof options.useCurrent === 'string') {
                    //    currentMoment = useCurrentGranularity[options.useCurrent](currentMoment);
                    //}
                    setValue(currentMoment);
                }
                widget = getTemplate();

                fillDow();
                fillMonths();

                //manju
                widget.find('.timepicker-hours').show(); //hide
                widget.find('span.timepicker-hour').addClass("active");
                widget.find('.timepicker-minutes').hide();
                widget.find('.timepicker-seconds').hide();
                widget.find('.timepicker-zones').hide();

                update();
                showMode();

                $(window).on('resize', place);
                widget.on('click', '[data-action]', doAction); // this handles clicks on the widget
                widget.on('mousedown', false);

                if (component && component.hasClass('btn')) {
                    component.toggleClass('active');
                }
                place();
                widget.show();
                if (options.focusOnShow && !input.is(':focus')) {
                    input.focus();
                }

                notifyEvent({
                    type: 'dp.show'
                });

                picker.storedDate(unset ? null : date);

                if (/Edge\/\d./i.test(navigator.userAgent)) {
                    // This is Microsoft Edge
                    setTimeout(function () {
                        var c = widget.parents('div.popover').attr('class');
                        widget.parents('div.popover').attr('class', c);
                    }, 100);

                }

                return picker;
            },

            /**
             * Shows or hides the widget
             */
            toggle = function () {
                return (widget ? hide() : show());
            },

            keydown = function (e) {
                var handler = null,
                    index,
                    index2,
                    pressedKeys = [],
                    pressedModifiers = {},
                    currentKey = e.which,
                    keyBindKeys,
                    allModifiersPressed,
                    pressed = 'p';

                keyState[currentKey] = pressed;

                for (index in keyState) {
                    if (keyState.hasOwnProperty(index) && keyState[index] === pressed) {
                        pressedKeys.push(index);
                        if (parseInt(index, 10) !== currentKey) {
                            pressedModifiers[index] = true;
                        }
                    }
                }

                for (index in options.keyBinds) {
                    if (options.keyBinds.hasOwnProperty(index) && typeof (options.keyBinds[index]) === 'function') {
                        keyBindKeys = index.split(' ');
                        if (keyBindKeys.length === pressedKeys.length && keyMap[currentKey] === keyBindKeys[keyBindKeys.length - 1]) {
                            allModifiersPressed = true;
                            for (index2 = keyBindKeys.length - 2; index2 >= 0; index2--) {
                                if (!(keyMap[keyBindKeys[index2]] in pressedModifiers)) {
                                    allModifiersPressed = false;
                                    break;
                                }
                            }
                            if (allModifiersPressed) {
                                handler = options.keyBinds[index];
                                break;
                            }
                        }
                    }
                }

                if (handler) {
                    handler.call(picker, widget);
                    e.stopPropagation();
                    e.preventDefault();
                }
            },

            keyup = function (e) {
                keyState[e.which] = 'r';
                e.stopPropagation();
                e.preventDefault();
            },

            change = function (e) {
                var _delimiter = '-';
                if (options.range) _delimiter = ';';

                if (options.range || options.quantity > 1) { 
                    dates = [];
                    var _values = $(e.target).val().trim();
                    if (_values && _values.length > 0) {
                        var _dates = _values.split(';').forEach(function(e){
                            dates.push(parseInputDate(e.trim()));
                        });
                    }
                    setValues(dates);
                } else { //casual dtp
                    var val = $(e.target).val().trim(),
                    parsedDate = val ? parseInputDate(val) : null;
                    setValue(parsedDate);
                }
                
                e.stopImmediatePropagation();
                return false;
            },

            attachDatePickerElementEvents = function () {
                input.on({
                    'change': change,
                    'blur': options.debug ? '' : hide,
                    'keydown': options.keyboardNav ? keydown : '',
                    'keyup': keyup,
                    'focus': options.allowInputToggle ? show : ''
                });

                if (element.is('input')) {
                    input.on({
                        'focus': show
                    });
                } else if (component) {
                    component.on('click', toggle);
                    component.on('mousedown', false);
                }
            },

            detachDatePickerElementEvents = function () {
                input.off({
                    'change': change,
                    'blur': blur,
                    'keydown': keydown,
                    'keyup': keyup,
                    'focus': options.allowInputToggle ? hide : ''
                });

                if (element.is('input')) {
                    input.off({
                        'focus': show
                    });
                } else if (component) {
                    component.off('click', toggle);
                    component.off('mousedown', false);
                }
            },

            indexGivenDates = function (givenDatesArray) {
                // Store given enabledDates and disabledDates as keys.
                // This way we can check their existence in O(1) time instead of looping through whole array.
                // (for example: options.enabledDates['2014-02-27'] === true)
                var givenDatesIndexed = {};
                $.each(givenDatesArray, function () {
                    var dDate = parseInputDate(this);
                    if (dDate.isValid()) {
                        givenDatesIndexed[dDate.format('YYYY-MM-DD')] = true;
                    }
                });
                return (Object.keys(givenDatesIndexed).length) ? givenDatesIndexed : false;
            },

            indexGivenHours = function (givenHoursArray) {
                // Store given enabledHours and disabledHours as keys.
                // This way we can check their existence in O(1) time instead of looping through whole array.
                // (for example: options.enabledHours['2014-02-27'] === true)
                var givenHoursIndexed = {};
                $.each(givenHoursArray, function () {
                    givenHoursIndexed[this] = true;
                });
                return (Object.keys(givenHoursIndexed).length) ? givenHoursIndexed : false;
            },

            initFormatting = function () {
                var format = options.format || 'L LT';

                actualFormat = format.replace(/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, function (formatInput) {
                    var newinput = date.localeData().longDateFormat(formatInput) || formatInput;
                    return newinput.replace(/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, function (formatInput2) { //temp fix for #740
                        return date.localeData().longDateFormat(formatInput2) || formatInput2;
                    });
                });


                parseFormats = options.extraFormats ? options.extraFormats.slice() : [];
                if (parseFormats.indexOf(format) < 0 && parseFormats.indexOf(actualFormat) < 0) {
                    parseFormats.push(actualFormat);
                }

                //TODO: add server-format from hidden input
                if (parseFormats.indexOf(options.serverFormat) < 0) {
                    parseFormats.push(options.serverFormat);
                }

                use24Hours = (actualFormat.toLowerCase().indexOf('a') < 1 && actualFormat.replace(/\[.*?\]/g, '').indexOf('h') < 1);

                if (hasWeek()) {
                    minViewModeNumber = MinViewModes.Day;
                } else {
                    if (isEnabled('y')) {
                        minViewModeNumber = MinViewModes.Year;
                    }
                    if (isEnabled('M')) {
                        minViewModeNumber = MinViewModes.Month;
                    }
                    if (isEnabled('d')) {
                        minViewModeNumber = MinViewModes.Day;
                    }
                }

                currentViewMode = Math.max(minViewModeNumber, currentViewMode);

                if (!unset) {
                    setValue(date);
                }
            };

        buildHiddenInput = function (dict) {
            var $hidden = $("<input/>").attr("type","hidden");
            Object.keys(dict).forEach(function (e) {
                $hidden.attr(e, dict[e]);
            });
            return $hidden;
        };


        /********************************************************************************
         *
         * Public API functions
         * =====================
         *
         * Important: Do not expose direct references to private objects or the options
         * object to the outer world. Always return a clone when returning values or make
         * a clone when setting a private variable.
         *
         ********************************************************************************/
        picker.destroy = function () {
            ///<summary>Destroys the widget and removes all attached event listeners</summary>
            hide();
            detachDatePickerElementEvents();
            element.removeData('DateTimePicker');
            element.removeData('date');
        };

        picker.toggle = toggle;

        picker.show = show;

        picker.hide = hide;

        picker.disable = function () {
            ///<summary>Disables the input element, the component is attached to, by adding a disabled="true" attribute to it.
            ///If the widget was visible before that call it is hidden. Possibly emits dp.hide</summary>
            hide();
            if (component && component.hasClass('btn')) {
                component.addClass('disabled');
            }
            input.prop('disabled', true);
            return picker;
        };

        picker.enable = function () {
            ///<summary>Enables the input element, the component is attached to, by removing disabled attribute from it.</summary>
            if (component && component.hasClass('btn')) {
                component.removeClass('disabled');
            }
            input.prop('disabled', false);
            return picker;
        };

        picker.ignoreReadonly = function (ignoreReadonly) {
            if (arguments.length === 0) {
                return options.ignoreReadonly;
            }
            if (typeof ignoreReadonly !== 'boolean') {
                throw new TypeError('ignoreReadonly () expects a boolean parameter');
            }
            options.ignoreReadonly = ignoreReadonly;
            return picker;
        };

        picker.options = function (newOptions) {
            if (arguments.length === 0) {
                return $.extend(true, {}, options);
            }

            if (!(newOptions instanceof Object)) {
                throw new TypeError('options() options parameter should be an object');
            }
            $.extend(true, options, newOptions);
            $.each(options, function (key, value) {
                if (picker[key] !== undefined) {
                    picker[key](value);
                } else {
                    throw new TypeError('option ' + key + ' is not recognized!');
                }
            });
            return picker;
        };

        picker.date = function (newDate) {
            ///<signature helpKeyword="$.fn.datetimepicker.date">
            ///<summary>Returns the component's model current date, a moment object or null if not set.</summary>
            ///<returns type="Moment">date.clone()</returns>
            ///</signature>
            ///<signature>
            ///<summary>Sets the components model current moment to it. Passing a null value unsets the components model current moment. Parsing of the newDate parameter is made using moment library with the options.format and options.useStrict components configuration.</summary>
            ///<param name="newDate" locid="$.fn.datetimepicker.date_p:newDate">Takes string, Date, moment, null parameter.</param>
            ///</signature>
            if (arguments.length === 0) {
                if (unset) {
                    return null;
                }
                if (options.range || options.quantity > 1) return dates.slice();
                return date.clone(); 
            }

            if (newDate !== null && typeof newDate !== 'string' && !moment.isMoment(newDate) && !(newDate instanceof Date) &&!Array.isArray(newDate)) {
                throw new TypeError('date() parameter must be one of [null, string, moment or Date]');
            }

            if (options.range || options.quantity > 1) {
                setValues(newDate === null ? null : parseInputDate(newDate));
            }
            else {
                setValue(newDate === null ? null : parseInputDate(newDate));
            }
            
            return picker;
        };

        picker.storedDate = function (newDate) {
            if (arguments.length === 0) {
                if (unset || !storedDate) {
                    return null;
                }
                return storedDate.clone();
            }

            if (newDate !== null && typeof newDate !== 'string' && !moment.isMoment(newDate) && !(newDate instanceof Date)) {
                throw new TypeError('date() parameter must be one of [null, string, moment or Date]');
            }
            storedDate = (newDate === null ? null : parseInputDate(newDate));
            return picker;

        }

        picker.format = function (newFormat) {
            if (arguments.length === 0) {
                return options.format;
            }

            if ((typeof newFormat !== 'string') && ((typeof newFormat !== 'boolean') || (newFormat !== false))) {
                throw new TypeError('format() expects a string or boolean:false parameter ' + newFormat);
            }

            if (newFormat !== true && ((newFormat.indexOf("D") > newFormat.indexOf("M") && newFormat.indexOf("M") >= 0)
                || newFormat.indexOf("M") > newFormat.indexOf("Y") && newFormat.indexOf("Y") >= 0)) {
                
                console.warn("Please use only INT formats. Overriding...");

                var tmpFormat = "";
                if (newFormat.indexOf("D") !== -1) {
                    tmpFormat += "DD/";
                }
                if (newFormat.indexOf("M") !== -1) {
                    tmpFormat += "MM/";
                }
                if (newFormat.indexOf("Y") !== -1) {
                    tmpFormat += "YYYY";
                }
                newFormat = tmpFormat.replace(/\/$/m, "");
            }

            options.format = newFormat;
            if (actualFormat) {
                initFormatting(); // reinit formatting
            }
            return picker;
        };

        picker.timeZone = function (newZone) {
            if (arguments.length === 0) {
                return options.timeZone;
            }

            if (typeof newZone !== 'string') {
                throw new TypeError('newZone() expects a string parameter');
            }

            options.timeZone = newZone;

            return picker;
        };

        picker.yearViewHeaderFormat = function (newFormat) {
            if (arguments.length === 0) {
                return options.yearViewHeaderFormat;
            }

            if (typeof newFormat !== 'string') {
                throw new TypeError('yearViewHeaderFormat() expects a string parameter');
            }

            options.yearViewHeaderFormat = newFormat;
            return picker;
        };

        picker.monthViewHeaderFormat = function (newFormat) {
            if (arguments.length === 0) {
                return options.monthViewHeaderFormat;
            }

            if (typeof newFormat !== 'string') {
                throw new TypeError('monthViewHeaderFormat() expects a string parameter');
            }

            options.monthViewHeaderFormat = newFormat;
            return picker;
        };

        picker.extraFormats = function (formats) {
            if (arguments.length === 0) {
                return options.extraFormats;
            }

            if (formats !== false && !(formats instanceof Array)) {
                throw new TypeError('extraFormats() expects an array or false parameter');
            }

            options.extraFormats = formats;
            if (parseFormats) {
                initFormatting(); // reinit formatting
            }
            return picker;
        };

        picker.disabledDates = function (dates) {
            ///<signature helpKeyword="$.fn.datetimepicker.disabledDates">
            ///<summary>Returns an array with the currently set disabled dates on the component.</summary>
            ///<returns type="array">options.disabledDates</returns>
            ///</signature>
            ///<signature>
            ///<summary>Setting this takes precedence over options.minDate, options.maxDate configuration. Also calling this function removes the configuration of
            ///options.enabledDates if such exist.</summary>
            ///<param name="dates" locid="$.fn.datetimepicker.disabledDates_p:dates">Takes an [ string or Date or moment ] of values and allows the user to select only from those days.</param>
            ///</signature>
            if (arguments.length === 0) {
                return (options.disabledDates ? $.extend({}, options.disabledDates) : options.disabledDates);
            }

            if (!dates) {
                options.disabledDates = false;
                update();
                return picker;
            }
            if (!(dates instanceof Array)) {
                throw new TypeError('disabledDates() expects an array parameter');
            }
            options.disabledDates = indexGivenDates(dates);
            options.enabledDates = false;
            update();
            return picker;
        };

        picker.enabledDates = function (dates) {
            ///<signature helpKeyword="$.fn.datetimepicker.enabledDates">
            ///<summary>Returns an array with the currently set enabled dates on the component.</summary>
            ///<returns type="array">options.enabledDates</returns>
            ///</signature>
            ///<signature>
            ///<summary>Setting this takes precedence over options.minDate, options.maxDate configuration. Also calling this function removes the configuration of options.disabledDates if such exist.</summary>
            ///<param name="dates" locid="$.fn.datetimepicker.enabledDates_p:dates">Takes an [ string or Date or moment ] of values and allows the user to select only from those days.</param>
            ///</signature>
            if (arguments.length === 0) {
                return (options.enabledDates ? $.extend({}, options.enabledDates) : options.enabledDates);
            }

            if (!dates) {
                options.enabledDates = false;
                update();
                return picker;
            }
            if (!(dates instanceof Array)) {
                throw new TypeError('enabledDates() expects an array parameter');
            }
            options.enabledDates = indexGivenDates(dates);
            options.disabledDates = false;
            update();
            return picker;
        };

        picker.daysOfWeekDisabled = function (daysOfWeekDisabled) {
            if (arguments.length === 0) {
                return options.daysOfWeekDisabled.splice(0);
            }

            if ((typeof daysOfWeekDisabled === 'boolean') && !daysOfWeekDisabled) {
                options.daysOfWeekDisabled = false;
                update();
                return picker;
            }

            if (!(daysOfWeekDisabled instanceof Array)) {
                throw new TypeError('daysOfWeekDisabled() expects an array parameter');
            }
            options.daysOfWeekDisabled = daysOfWeekDisabled.reduce(function (previousValue, currentValue) {
                currentValue = parseInt(currentValue, 10);
                if (currentValue > 6 || currentValue < 0 || isNaN(currentValue)) {
                    return previousValue;
                }
                if (previousValue.indexOf(currentValue) === -1) {
                    previousValue.push(currentValue);
                }
                return previousValue;
            }, []).sort();
            if (
                //options.useCurrent &&
                !options.keepInvalid) {
                var tries = 0;
                while (!isValid(date, 'd')) {
                    date.add(1, 'd');
                    if (tries === 31) {
                        throw 'Tried 31 times to find a valid date';
                    }
                    tries++;
                }
                setValue(date);
            }
            update();
            return picker;
        };

        picker.maxDate = function (maxDate) {
            if (arguments.length === 0) {
                return options.maxDate ? options.maxDate.clone() : options.maxDate;
            }

            if ((typeof maxDate === 'boolean') && maxDate === false) {
                options.maxDate = false;
                update();
                return picker;
            }

            if (typeof maxDate === 'string') {
                if (maxDate === 'now' || maxDate === 'moment') {
                    maxDate = getMoment();
                }
            }

            var parsedDate = parseInputDate(maxDate);

            if (!parsedDate.isValid()) {
                throw new TypeError('maxDate() Could not parse date parameter: ' + maxDate);
            }
            if (options.minDate && parsedDate.isBefore(options.minDate)) {
                throw new TypeError('maxDate() date parameter is before options.minDate: ' + parsedDate.format(actualFormat));
            }
            options.maxDate = parsedDate;
            if (
                //options.useCurrent &&
                !options.keepInvalid && date.isAfter(maxDate)) {
                picker.clear();
            }
            if (viewDate.isAfter(parsedDate)) {
                viewDate = parsedDate.clone().subtract(options.stepping, 'm');
            }
            update();
            return picker;
        };

        picker.minDate = function (minDate) {
            if (arguments.length === 0) {
                return options.minDate ? options.minDate.clone() : options.minDate;
            }

            if ((typeof minDate === 'boolean') && minDate === false) {
                options.minDate = false;
                update();
                return picker;
            }

            if (typeof minDate === 'string') {
                if (minDate === 'now' || minDate === 'moment') {
                    minDate = getMoment();
                }
            }

            var parsedDate = parseInputDate(minDate);

            if (!parsedDate.isValid()) {
                throw new TypeError('minDate() Could not parse date parameter: ' + minDate);
            }
            if (options.maxDate && parsedDate.isAfter(options.maxDate)) {
                throw new TypeError('minDate() date parameter is after options.maxDate: ' + parsedDate.format(actualFormat));
            }
            options.minDate = parsedDate;
            if (//options.useCurrent && 
                !options.keepInvalid && date.isBefore(minDate)) {
                //setValue(options.minDate);
                //clear the input if set date is invalid
                picker.clear();
            }
            if (viewDate.isBefore(parsedDate)) {
                viewDate = parsedDate.clone().add(options.stepping, 'm');
            }
            update();
            return picker;
        };

        picker.defaultDate = function (defaultDate) {
            ///<signature helpKeyword="$.fn.datetimepicker.defaultDate">
            ///<summary>Returns a moment with the options.defaultDate option configuration or false if not set</summary>
            ///<returns type="Moment">date.clone()</returns>
            ///</signature>
            ///<signature>
            ///<summary>Will set the picker's inital date. If a boolean:false value is passed the options.defaultDate parameter is cleared.</summary>
            ///<param name="defaultDate" locid="$.fn.datetimepicker.defaultDate_p:defaultDate">Takes a string, Date, moment, boolean:false</param>
            ///</signature>
            if (arguments.length === 0) {
                return options.defaultDate ? options.defaultDate.clone() : options.defaultDate;
            }
            if (!defaultDate) {
                options.defaultDate = false;
                return picker;
            }

            if (typeof defaultDate === 'string') {
                if (defaultDate === 'now' || defaultDate === 'moment') {
                    defaultDate = getMoment();
                } else {
                    defaultDate = getMoment(defaultDate);
                }
            }

            var parsedDate = parseInputDate(defaultDate);
            if (!parsedDate.isValid()) {
                throw new TypeError('defaultDate() Could not parse date parameter: ' + defaultDate);
            }
            if (!isValid(parsedDate)) {
                throw new TypeError('defaultDate() date passed is invalid according to component setup validations');
            }

            options.defaultDate = parsedDate;

            if ((options.defaultDate && options.inline) || input.val().trim() === '') {
                setValue(options.defaultDate);
            }
            return picker;
        };

        picker.locale = function (locale) {
            if (arguments.length === 0) {
                return options.locale;
            }

            if (!moment.localeData(locale)) {
                throw new TypeError('locale() locale ' + locale + ' is not loaded from moment locales!');
            }

            options.locale = locale;
            date.locale(options.locale);
            viewDate.locale(options.locale);

            if (actualFormat) {
                initFormatting(); // reinit formatting
            }
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.stepping = function (stepping) {
            if (arguments.length === 0) {
                return options.stepping;
            }

            stepping = parseInt(stepping, 10);
            if (isNaN(stepping) || stepping < 1) {
                stepping = 15;
            }
            options.stepping = stepping;
            return picker;
        };

        //picker.useCurrent = function (useCurrent) {
        //    var useCurrentOptions = ['year', 'month', 'day', 'hour', 'minute'];
        //    if (arguments.length === 0) {
        //        return options.useCurrent;
        //    }

        //    if ((typeof useCurrent !== 'boolean') && (typeof useCurrent !== 'string')) {
        //        throw new TypeError('useCurrent() expects a boolean or string parameter');
        //    }
        //    if (typeof useCurrent === 'string' && useCurrentOptions.indexOf(useCurrent.toLowerCase()) === -1) {
        //        throw new TypeError('useCurrent() expects a string parameter of ' + useCurrentOptions.join(', '));
        //    }
        //    options.useCurrent = useCurrent;
        //    return picker;
        //};

        picker.collapse = function (collapse) {
            if (arguments.length === 0) {
                return options.collapse;
            }

            if (typeof collapse !== 'boolean') {
                throw new TypeError('collapse() expects a boolean parameter');
            }
            if (options.collapse === collapse) {
                return picker;
            }
            options.collapse = collapse;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.icons = function (icons) {
            if (arguments.length === 0) {
                return $.extend({}, options.icons);
            }

            if (!(icons instanceof Object)) {
                throw new TypeError('icons() expects parameter to be an Object');
            }
            $.extend(options.icons, icons);
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.tooltips = function (tooltips) {
            if (arguments.length === 0) {
                return $.extend({}, options.tooltips);
            }

            if (!(tooltips instanceof Object)) {
                throw new TypeError('tooltips() expects parameter to be an Object');
            }
            $.extend(options.tooltips, tooltips);
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.useStrict = function (useStrict) {
            if (arguments.length === 0) {
                return options.useStrict;
            }

            if (typeof useStrict !== 'boolean') {
                throw new TypeError('useStrict() expects a boolean parameter');
            }
            options.useStrict = useStrict;
            return picker;
        };

        picker.sideBySide = function (sideBySide) {
            if (arguments.length === 0) {
                return options.sideBySide;
            }

            if (typeof sideBySide !== 'boolean') {
                throw new TypeError('sideBySide() expects a boolean parameter');
            }
            options.sideBySide = sideBySide;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.viewMode = function (viewMode) {
            if (arguments.length === 0) {
                return options.viewMode;
            }

            if (typeof viewMode !== 'string') {
                throw new TypeError('viewMode() expects a string parameter');
            }

            if (viewModes.indexOf(viewMode) === -1) {
                throw new TypeError('viewMode() parameter must be one of (' + viewModes.join(', ') + ') value');
            }

            options.viewMode = viewMode;
            currentViewMode = Math.max(viewModes.indexOf(viewMode), minViewModeNumber);

            showMode();
            return picker;
        };

        picker.toolbarPlacement = function (toolbarPlacement) {
            if (arguments.length === 0) {
                return options.toolbarPlacement;
            }

            if (typeof toolbarPlacement !== 'string') {
                throw new TypeError('toolbarPlacement() expects a string parameter');
            }
            if (toolbarPlacements.indexOf(toolbarPlacement) === -1) {
                throw new TypeError('toolbarPlacement() parameter must be one of (' + toolbarPlacements.join(', ') + ') value');
            }
            options.toolbarPlacement = toolbarPlacement;

            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.widgetPositioning = function (widgetPositioning) {
            if (arguments.length === 0) {
                return $.extend({}, options.widgetPositioning);
            }

            if (({}).toString.call(widgetPositioning) !== '[object Object]') {
                throw new TypeError('widgetPositioning() expects an object variable');
            }
            if (widgetPositioning.horizontal) {
                if (typeof widgetPositioning.horizontal !== 'string') {
                    throw new TypeError('widgetPositioning() horizontal variable must be a string');
                }
                widgetPositioning.horizontal = widgetPositioning.horizontal.toLowerCase();
                if (horizontalModes.indexOf(widgetPositioning.horizontal) === -1) {
                    throw new TypeError('widgetPositioning() expects horizontal parameter to be one of (' + horizontalModes.join(', ') + ')');
                }
                options.widgetPositioning.horizontal = widgetPositioning.horizontal;
            }
            if (widgetPositioning.vertical) {
                if (typeof widgetPositioning.vertical !== 'string') {
                    throw new TypeError('widgetPositioning() vertical variable must be a string');
                }
                widgetPositioning.vertical = widgetPositioning.vertical.toLowerCase();
                if (verticalModes.indexOf(widgetPositioning.vertical) === -1) {
                    throw new TypeError('widgetPositioning() expects vertical parameter to be one of (' + verticalModes.join(', ') + ')');
                }
                options.widgetPositioning.vertical = widgetPositioning.vertical;
            }
            update();
            return picker;
        };

        picker.showTodayButton = function (showTodayButton) {
            if (arguments.length === 0) {
                return options.showTodayButton;
            }

            if (typeof showTodayButton !== 'boolean') {
                throw new TypeError('showTodayButton() expects a boolean parameter');
            }

            options.showTodayButton = showTodayButton;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.showClear = function () {
            return picker;
        };

        picker.widgetParent = function (widgetParent) {
            if (arguments.length === 0) {
                return options.widgetParent;
            }

            if (typeof widgetParent === 'string') {
                widgetParent = $(widgetParent);
            }

            if (widgetParent !== null && (typeof widgetParent !== 'string' && !(widgetParent instanceof $))) {
                throw new TypeError('widgetParent() expects a string or a jQuery object parameter');
            }

            options.widgetParent = widgetParent;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.value = function (value) {
            if (arguments.length === 0) {
                return options.value;
            }

            if (typeof value !== 'string') {
                throw new TypeError('value() expects a string parameter');
            }

            options.value = value;
            return picker;
        };

        picker.keepOpen = function (keepOpen) {
            if (arguments.length === 0) {
                return options.keepOpen;
            }

            if (typeof keepOpen !== 'boolean') {
                throw new TypeError('keepOpen() expects a boolean parameter');
            }

            options.keepOpen = keepOpen;
            return picker;
        };

        picker.quantity = function (quantity) {
            if (arguments.length === 0) {
                return options.quantity;
            }

            if (typeof quantity !== 'number') {
                throw new TypeError('quantity() expects a number parameter');
            }

            options.quantity = quantity;

            if (options.quantity > 1) {
                var _values = options.value.split(';');
                for(var i=0;i<options.quantity;i++){
                    var _value = '';
                    if (_values[i] && _values[i].trim().length > 0){
                         _value= _values[i].trim();
                        dates.push(parseInputDate(_value));
                    }
                    var attrs = {id:options.name + i, name:options.name + "["  + i + "]", value: _value}
                    element.append(buildHiddenInput(attrs));
                }
                hiddenInput = element.find("input[type=hidden]");
            }
            return picker;
        };

        picker.startDateAttributes = function (startDateAttributes) {
            if (arguments.length === 0) {
                return options.startDateAttributes;
            }

            if (typeof startDateAttributes !== 'object') {
                throw new TypeError('startDateAttributes() expects a string parameter');
            }

            options.startDateAttributes = startDateAttributes;
            if (options.startDateAttributes != null) {
                element.append(buildHiddenInput(options.startDateAttributes));
                dates.push(parseInputDate(options.startDateAttributes.value));
                hiddenInput = element.find("input[type=hidden]");
            }
            return picker;
        };

        picker.endDateAttributes = function (endDateAttributes) {
            if (arguments.length === 0) {
                return options.endDateAttributes;
            }

            if (typeof endDateAttributes !== 'object') {
                throw new TypeError('endDateAttributes() expects a string parameter');
            }

            options.endDateAttributes = endDateAttributes;
            if (options.endDateAttributes != null) {
                element.append(buildHiddenInput(options.endDateAttributes));
                dates.push(parseInputDate(options.endDateAttributes.value));
                hiddenInput = element.find("input[type=hidden]");
            }
            return picker;
        };

        picker.serverDataType = function (serverDataType) {
            if (arguments.length === 0) {
                return options.serverDataType;
            }

            if (typeof serverDataType !== 'string') {
                throw new TypeError('serverDataType() expects a string parameter');
            }

            options.serverDataType = serverDataType;
            return picker;
        };

        picker.serverFormat = function (serverFormat) {
            if (arguments.length === 0) {
                return options.serverFormat;
            }

            if (typeof serverFormat !== 'string') {
                throw new TypeError('serverFormat() expects a string parameter');
            }

            options.serverFormat = serverFormat;
            return picker;
        };

         picker.name = function (name) {
            if (arguments.length === 0) {
                return options.name;
            }

            if (typeof name !== 'string') {
                throw new TypeError('name() expects a string parameter');
            }

            options.name = name;
            return picker;
        };

        picker.range = function (range) {
            if (arguments.length === 0) {
                return options.range;
            }

            if (typeof range !== 'boolean') {
                throw new TypeError('range() expects a number parameter');
            }

            options.range = range;
            return picker;
        };

        picker.focusOnShow = function (focusOnShow) {
            if (arguments.length === 0) {
                return options.focusOnShow;
            }

            if (typeof focusOnShow !== 'boolean') {
                throw new TypeError('focusOnShow() expects a boolean parameter');
            }

            options.focusOnShow = focusOnShow;
            return picker;
        };

        picker.inline = function (inline) {
            if (arguments.length === 0) {
                return options.inline;
            }

            if (typeof inline !== 'boolean') {
                throw new TypeError('inline() expects a boolean parameter');
            }

            options.inline = inline;
            return picker;
        };

        picker.clear = function () {
            clear();
            return picker;
        };

        picker.keyBinds = function (keyBinds) {
            if (arguments.length === 0) {
                return options.keyBinds;
            }

            options.keyBinds = keyBinds;
            return picker;
        };

        picker.getMoment = function (d) {
            return getMoment(d);
        };

        picker.debug = function (debug) {
            if (typeof debug !== 'boolean') {
                throw new TypeError('debug() expects a boolean parameter');
            }

            options.debug = debug;
            return picker;
        };

        picker.allowInputToggle = function (allowInputToggle) {
            if (arguments.length === 0) {
                return options.allowInputToggle;
            }

            if (typeof allowInputToggle !== 'boolean') {
                throw new TypeError('allowInputToggle() expects a boolean parameter');
            }

            options.allowInputToggle = allowInputToggle;
            return picker;
        };

        picker.showClose = function () {
            return options.showClose;
        };

        picker.keepInvalid = function (keepInvalid) {
            if (arguments.length === 0) {
                return options.keepInvalid;
            }

            if (typeof keepInvalid !== 'boolean') {
                throw new TypeError('keepInvalid() expects a boolean parameter');
            }
            options.keepInvalid = keepInvalid;
            return picker;
        };

        picker.datepickerInput = function (datepickerInput) {
            if (arguments.length === 0) {
                return options.datepickerInput;
            }

            if (typeof datepickerInput !== 'string') {
                throw new TypeError('datepickerInput() expects a string parameter');
            }

            options.datepickerInput = datepickerInput;
            return picker;
        };

        picker.parseInputDate = function (parseInputDate) {
            if (arguments.length === 0) {
                return options.parseInputDate;
            }

            if (typeof parseInputDate !== 'function') {
                throw new TypeError('parseInputDate() should be as function');
            }

            options.parseInputDate = parseInputDate;

            return picker;
        };

        picker.disabledTimeIntervals = function (disabledTimeIntervals) {
            ///<signature helpKeyword="$.fn.datetimepicker.disabledTimeIntervals">
            ///<summary>Returns an array with the currently set disabled dates on the component.</summary>
            ///<returns type="array">options.disabledTimeIntervals</returns>
            ///</signature>
            ///<signature>
            ///<summary>Setting this takes precedence over options.minDate, options.maxDate configuration. Also calling this function removes the configuration of
            ///options.enabledDates if such exist.</summary>
            ///<param name="dates" locid="$.fn.datetimepicker.disabledTimeIntervals_p:dates">Takes an [ string or Date or moment ] of values and allows the user to select only from those days.</param>
            ///</signature>
            if (arguments.length === 0) {
                return (options.disabledTimeIntervals ? $.extend({}, options.disabledTimeIntervals) : options.disabledTimeIntervals);
            }

            if (!disabledTimeIntervals) {
                options.disabledTimeIntervals = false;
                update();
                return picker;
            }
            if (!(disabledTimeIntervals instanceof Array)) {
                throw new TypeError('disabledTimeIntervals() expects an array parameter');
            }
            options.disabledTimeIntervals = disabledTimeIntervals;
            update();
            return picker;
        };

        picker.disabledHours = function (hours) {
            ///<signature helpKeyword="$.fn.datetimepicker.disabledHours">
            ///<summary>Returns an array with the currently set disabled hours on the component.</summary>
            ///<returns type="array">options.disabledHours</returns>
            ///</signature>
            ///<signature>
            ///<summary>Setting this takes precedence over options.minDate, options.maxDate configuration. Also calling this function removes the configuration of
            ///options.enabledHours if such exist.</summary>
            ///<param name="hours" locid="$.fn.datetimepicker.disabledHours_p:hours">Takes an [ int ] of values and disallows the user to select only from those hours.</param>
            ///</signature>
            if (arguments.length === 0) {
                return (options.disabledHours ? $.extend({}, options.disabledHours) : options.disabledHours);
            }

            if (!hours) {
                options.disabledHours = false;
                update();
                return picker;
            }
            if (!(hours instanceof Array)) {
                throw new TypeError('disabledHours() expects an array parameter');
            }
            options.disabledHours = indexGivenHours(hours);
            options.enabledHours = false;
            if (
            //options.useCurrent &&
                !options.keepInvalid) {
                var tries = 0;
                while (!isValid(date, 'h')) {
                    date.add(1, 'h');
                    if (tries === 24) {
                        throw 'Tried 24 times to find a valid date';
                    }
                    tries++;
                }
                setValue(date);
            }
            update();
            return picker;
        };

        picker.enabledHours = function (hours) {
            ///<signature helpKeyword="$.fn.datetimepicker.enabledHours">
            ///<summary>Returns an array with the currently set enabled hours on the component.</summary>
            ///<returns type="array">options.enabledHours</returns>
            ///</signature>
            ///<signature>
            ///<summary>Setting this takes precedence over options.minDate, options.maxDate configuration. Also calling this function removes the configuration of options.disabledHours if such exist.</summary>
            ///<param name="hours" locid="$.fn.datetimepicker.enabledHours_p:hours">Takes an [ int ] of values and allows the user to select only from those hours.</param>
            ///</signature>
            if (arguments.length === 0) {
                return (options.enabledHours ? $.extend({}, options.enabledHours) : options.enabledHours);
            }

            if (!hours) {
                options.enabledHours = false;
                update();
                return picker;
            }
            if (!(hours instanceof Array)) {
                throw new TypeError('enabledHours() expects an array parameter');
            }
            options.enabledHours = indexGivenHours(hours);
            options.disabledHours = false;
            if (
                //options.useCurrent &&
                !options.keepInvalid) {
                var tries = 0;
                while (!isValid(date, 'h')) {
                    date.add(1, 'h');
                    if (tries === 24) {
                        throw 'Tried 24 times to find a valid date';
                    }
                    tries++;
                }
                setValue(date);
            }
            update();
            return picker;
        };
        /**
         * Returns the component's model current viewDate, a moment object or null if not set. Passing a null value unsets the components model current moment. Parsing of the newDate parameter is made using moment library with the options.format and options.useStrict components configuration.
         * @param {Takes string, viewDate, moment, null parameter.} newDate
         * @returns {viewDate.clone()}
         */
        picker.viewDate = function (newDate) {
            if (arguments.length === 0) {
                return viewDate.clone();
            }

            if (!newDate) {
                viewDate = date.clone();
                return picker;
            }

            if (typeof newDate !== 'string' && !moment.isMoment(newDate) && !(newDate instanceof Date)) {
                throw new TypeError('viewDate() parameter must be one of [string, moment or Date]');
            }

            viewDate = parseInputDate(newDate);
            viewUpdate();
            return picker;
        };

        picker.control = function () {
            //leave will crash if does not find this property
        };

        /**
         * Get/set keyboard navigation
         * @param {} keyboardNav 
         * @returns {} 
         */
        picker.keyboardNav = function (keyboardNav) {
            if (arguments.length === 0) {
                return options.keyboardNav;
            }

            if (typeof keyboardNav !== 'boolean') {
                throw new TypeError('keyboardNav() expects a boolean parameter');
            }

            options.keyboardNav = keyboardNav;
            return picker;
        };

        picker.placeholder = function (placeholder) {
            if (arguments.length === 0) {
                return options.placeholder;
            }
            if (typeof placeholder !== "string") {
                throw new TypeError("placeholder() expects a string parameter");
            }

            input.attr('placeholder', placeholder);
            options.placeholder = placeholder;
            return picker;
        };

        picker.zoneData = function (data) {
            if (arguments.length === 0) {
                return options.zoneData;
            }
            console.warn("Zone data update not yet implemented.");
            return picker;
        };

        // initializing element and component attributes
        if (element.is('input')) {
            input = element;
            debugger
        } else {
            input = element.find(options.datepickerInput);
            if (input.length === 0) {
                input = element.find('input');
            } else if (!input.is('input')) {
                throw new Error('CSS class "' + options.datepickerInput + '" cannot be applied to non input element');
            }
            hiddenInput = element.find("input[type=hidden]");
        }

        //turn off autocomplete
        input.attr("autocomplete", "off");  

        if (element.hasClass('input-group')) {
            // in case there is more then one 'input-group-addon' Issue #48
            if (element.find('.datepickerbutton').length === 0) {
                component = element.find('.input-group-addon');
            } else {
                component = element.find('.datepickerbutton');
            }
        }

        if (!options.inline && !input.is('input')) {
            throw new Error('Could not initialize DateTimePicker without an input element');
        }

        // Set defaults for date here now instead of in var declaration
        date = getMoment();
        viewDate = date.clone();

        $.extend(true, options, dataToOptions());

        picker.options(options);

        initFormatting();

        attachDatePickerElementEvents();

        if (input.prop('disabled')) {
            picker.disable(); 
        }
        if (input.is('input') && input.val().trim().length !== 0) {
           var parsedDates = [];
           if (options.range || options.quantity > 1) {
                unset = false;
            } else {
                setValue(parseInputDate(hiddenInput.val().trim()));
            }
        }
        else if (options.defaultDate && input.attr('placeholder') === undefined) {
            setValue(options.defaultDate);
        }
        if (options.inline) {
            show();
        }
        return picker;
    };

    /********************************************************************************
     *
     * jQuery plugin constructor and defaults object
     *
     ********************************************************************************/

    /**
    * See (http://jquery.com/).
    * @name jQuery
    * @class
    * See the jQuery Library  (http://jquery.com/) for full details.  This just
    * documents the function and classes that are added to jQuery by this plug-in.
    */
    /**
     * See (http://jquery.com/)
     * @name fn
     * @class
     * See the jQuery Library  (http://jquery.com/) for full details.  This just
     * documents the function and classes that are added to jQuery by this plug-in.
     * @memberOf jQuery
     */
    /**
     * Show comments
     * @class datetimepicker
     * @memberOf jQuery.fn
     */
    $.fn.mafDatepicker = function (options) {
        options = options || {};

        var args = Array.prototype.slice.call(arguments, 1),
            isInstance = true,
            thisMethods = ['destroy', 'hide', 'show', 'toggle'],
            returnValue;

        if (typeof options === 'object') {
            return this.each(function () {
                var $this = $(this);
                if (!$this.data('DateTimePicker')) {
                    // create a private copy of the defaults object
                    options = $.extend(true, {}, $.fn.mafDatepicker.defaults, options);
                    $this.data('DateTimePicker', mafDatepicker($this, options));
                }
            });
        } else if (typeof options === 'string') {
            this.each(function () {
                var $this = $(this),
                    instance = $this.data('DateTimePicker');
                if (!instance) {
                    throw new Error('bootstrap-datetimepicker("' + options + '") method was called on an element that is not using DateTimePicker');
                }

                returnValue = instance[options].apply(instance, args);
                isInstance = returnValue === instance;
            });

            if (isInstance || $.inArray(options, thisMethods) > -1) {
                return this;
            }

            return returnValue;
        }

        throw new TypeError('Invalid arguments for DateTimePicker: ' + options);
    };
    $.fn.mafDatepicker.defaults = {
        timeZone: '',
        format: "DD/MM/YYYY",
        yearViewHeaderFormat: 'YYYY', //default format for YEAR to be displayed in the header of dtp
        monthViewHeaderFormat: 'MMMM', //default format for MONTH to be displayed in the header of dtp
        extraFormats: false,
        stepping: 15,
        minDate: false,
        maxDate: false,
        //useCurrent: true,
        collapse: true,
        locale: moment.locale(),
        defaultDate: false,
        disabledDates: false,
        enabledDates: false,
        icons: {
            time: "fa fa-clock-o",
            date: "fa fa-calendar",
            up: "fa fa-chevron-up",
            down: "fa fa-chevron-down",
            previous: 'fa fa-chevron-left',
            next: 'fa fa-chevron-right',
            today: 'fa fa-bullseye',
            clear: 'fa fa-trash',
            close: 'fa fa-times'
        },
        tooltips: {
            today: 'Go to today',
            clear: 'Clear selection',
            close: 'Close the picker',
            selectMonth: 'Select Month',
            prevMonth: 'Previous Month',
            nextMonth: 'Next Month',
            selectYear: 'Select Year',
            prevYear: 'Previous Year',
            nextYear: 'Next Year',
            selectDecade: 'Select Decade',
            prevDecade: 'Previous Decade',
            nextDecade: 'Next Decade',
            prevCentury: 'Previous Century',
            nextCentury: 'Next Century',
            pickHour: 'Pick Hour',
            pickZone: 'Pick Zone',
            incrementHour: 'Increment Hour',
            decrementHour: 'Decrement Hour',
            pickMinute: 'Pick Minute',
            incrementMinute: 'Increment Minute',
            decrementMinute: 'Decrement Minute',
            pickSecond: 'Pick Second',
            incrementSecond: 'Increment Second',
            decrementSecond: 'Decrement Second',
            togglePeriod: 'Toggle Period',
            selectTime: 'Select Time'
        },
        useStrict: false,
        sideBySide: false,
        daysOfWeekDisabled: false,
        viewMode: 'days',
        toolbarPlacement: 'default',
        showTodayButton: false,
        showClear: false,
        showClose: false,
        widgetPositioning: {
            horizontal: 'auto',
            vertical: 'auto'
        },
        widgetParent: null,
        ignoreReadonly: true,
        keepOpen: false,
        quantity: 1,
        startDateAttributes: null,
        endDateAttributes: null,
        serverDataType: ServerDataTypes.DateTimeIso,
        serverFormat:'',
        name: '',
        value: '',
        range: false,
        focusOnShow: true,
        inline: false,
        keepInvalid: false,
        datepickerInput: '.datepickerinput',
        keyBinds: {
            up: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || this.getMoment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(7, 'd'));
                } else {
                    this.date(d.clone().add(this.stepping(), 'm'));
                }
            },
            down: function (widget) {
                if (!widget) {
                    this.show();
                    return;
                }
                var d = this.date() || this.getMoment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(7, 'd'));
                } else {
                    this.date(d.clone().subtract(this.stepping(), 'm'));
                }
            },
            'control up': function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || this.getMoment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(1, 'y'));
                } else {
                    this.date(d.clone().add(1, 'h'));
                }
            },
            'control down': function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || this.getMoment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(1, 'y'));
                } else {
                    this.date(d.clone().subtract(1, 'h'));
                }
            },
            left: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || this.getMoment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(1, 'd'));
                }
            },
            right: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || this.getMoment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(1, 'd'));
                }
            },
            pageUp: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || this.getMoment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(1, 'M'));
                }
            },
            pageDown: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || this.getMoment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(1, 'M'));
                }
            },
            enter: function () {
                this.hide();
            },
            escape: function () {
                this.hide();
            },
            //tab: function (widget) { //this break the flow of the form. disabling for now
            //    var toggle = widget.find('.picker-switch a[data-action="togglePicker"]');
            //    if(toggle.length > 0) toggle.click();
            //},
            'control space': function (widget) {
                if (!widget) {
                    return;
                }
                if (widget.find('.timepicker').is(':visible')) {
                    widget.find('.btn[data-action="togglePeriod"]').click();
                }
            },
            t: function () {
                this.date(this.getMoment());
            },
            'delete': function () {
                this.clear();
            }
        },
        debug: false,
        allowInputToggle: true,
        disabledTimeIntervals: false,
        disabledHours: false,
        enabledHours: false,
        viewDate: false,
        keyboardNav: false,
        placeholder: "",
        zoneData: [
            ["Dateline Standard Time", "(GMT-12:00) International Date Line West"],
            ["Samoa Standard Time", "(GMT-11:00) Midway Island, Samoa"],
            ["Hawaiian Standard Time", "(GMT-10:00) Hawaii"],
            ["Alaskan Standard Time", "(GMT-09:00) Alaska"],
            ["Pacific Standard Time", "(GMT-08:00) Pacific Time (US and Canada); Tijuana"],
            ["Mountain Standard Time", "(GMT-07:00) Mountain Time (US and Canada)"],
            ["Mexico Standard Time 2", "(GMT-07:00) Chihuahua, La Paz, Mazatlan"],
            ["U.S. Mountain Standard Time", "(GMT-07:00) Arizona"],
            ["Central Standard Time", "(GMT-06:00) Central Time (US and Canada"],
            ["Canada Central Standard Time", "(GMT-06:00) Saskatchewan"],
            ["Mexico Standard Time", "(GMT-06:00) Guadalajara, Mexico City, Monterrey"],
            ["Central America Standard Time", "(GMT-06:00) Central America"],
            ["Eastern Standard Time", "(GMT-05:00) Eastern Time (US and Canada)"],
            ["U.S. Eastern Standard Time", "(GMT-05:00) Indiana (East)"],
            ["S.A. Pacific Standard Time", "(GMT-05:00) Bogota, Lima, Quito"],
            ["Atlantic Standard Time", "(GMT-04:00) Atlantic Time (Canada)"],
            ["S.A. Western Standard Time", "(GMT-04:00) Caracas, La Paz"],
            ["Pacific S.A. Standard Time", "(GMT-04:00) Santiago"],
            ["Newfoundland and Labrador Standard Time", "(GMT-03:30) Newfoundland and Labrador"],
            ["E. South America Standard Time", "(GMT-03:00) Brasilia"],
            ["S.A. Eastern Standard Time", "(GMT-03:00) Buenos Aires, Georgetown"],
            ["Greenland Standard Time", "(GMT-03:00) Greenland"],
            ["Mid-Atlantic Standard Time", "(GMT-02:00) Mid-Atlantic"],
            ["Azores Standard Time", "(GMT-01:00) Azores"],
            ["Cape Verde Standard Time", "(GMT-01:00) Cape Verde Islands"],
            ["GMT Standard Time", "(GMT+00:00) Greenwich Mean Time: Dublin, Edinburgh, Lisbon, London"],
            ["Greenwich Standard Time", "(GMT+00:00) Casablanca, Monrovia"],
            ["Central Europe Standard Time", "(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague"],
            ["Central European Standard Time", "(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb"],
            ["Romance Standard Time", "(GMT+01:00) Brussels, Copenhagen, Madrid, Paris"],
            ["W. Europe Standard Time", "(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna"],
            ["W. Central Africa Standard Time", "(GMT+01:00) West Central Africa"],
            ["E. Europe Standard Time", "(GMT+02:00) Bucharest"],
            ["Egypt Standard Time", "(GMT+02:00) Cairo"],
            ["FLE Standard Time", "(GMT+02:00) Helsinki, Kiev, Riga, Sofia, Tallinn, Vilnius"],
            ["GTB Standard Time", "(GMT+02:00) Athens, Istanbul, Minsk"],
            ["Israel Standard Time", "(GMT+02:00) Jerusalem"],
            ["South Africa Standard Time", "(GMT+02:00) Harare, Pretoria"],
            ["Russian Standard Time", "(GMT+03:00) Moscow, St. Petersburg, Volgograd"],
            ["Arab Standard Time", "(GMT+03:00) Kuwait, Riyadh"],
            ["E. Africa Standard Time", "(GMT+03:00) Nairobi"],
            ["Arabic Standard Time", "(GMT+03:00) Baghdad"], ["Iran Standard Time", "(GMT+03:30) Tehran"],
            ["Arabian Standard Time", "(GMT+04:00) Abu Dhabi, Muscat"],
            ["Caucasus Standard Time", "(GMT+04:00) Baku, Tbilisi, Yerevan"],
            ["Transitional Islamic State of Afghanistan Standard Time", "(GMT+04:30) Kabul"],
            ["Ekaterinburg Standard Time", "(GMT+05:00) Ekaterinburg"],
            ["West Asia Standard Time", "(GMT+05:00) Islamabad, Karachi, Tashkent"],
            ["India Standard Time", "(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi"],
            ["Nepal Standard Time", "(GMT+05:45) Kathmandu"],
            ["Central Asia Standard Time", "(GMT+06:00) Astana, Dhaka"],
            ["Sri Lanka Standard Time", "(GMT+06:00) Sri Jayawardenepura"],
            ["N. Central Asia Standard Time", "(GMT+06:00) Almaty, Novosibirsk"],
            ["Myanmar Standard Time", "(GMT+06:30) Yangon Rangoon"],
            ["S.E. Asia Standard Time", "(GMT+07:00) Bangkok, Hanoi, Jakarta"],
            ["North Asia Standard Time", "(GMT+07:00) Krasnoyarsk"],
            ["China Standard Time", "(GMT+08:00) Beijing, Chongqing, Hong Kong SAR, Urumqi"],
            ["Singapore Standard Time", "(GMT+08:00) Kuala Lumpur, Singapore"],
            ["Taipei Standard Time", "(GMT+08:00) Taipei"],
            ["W. Australia Standard Time", "(GMT+08:00) Perth"],
            ["North Asia East Standard Time", "(GMT+08:00) Irkutsk, Ulaanbaatar"],
            ["Korea Standard Time", "(GMT+09:00) Seoul"],
            ["Tokyo Standard Time", "(GMT+09:00) Osaka, Sapporo, Tokyo"],
            ["Yakutsk Standard Time", "(GMT+09:00) Yakutsk"],
            ["A.U.S. Central Standard Time", "(GMT+09:30) Darwin"],
            ["Cen. Australia Standard Time", "(GMT+09:30) Adelaide"],
            ["A.U.S. Eastern Standard Time", "(GMT+10:00) Canberra, Melbourne, Sydney"],
            ["E. Australia Standard Time", "(GMT+10:00) Brisbane"],
            ["Tasmania Standard Time", "(GMT+10:00) Hobart"],
            ["Vladivostok Standard Time", "(GMT+10:00) Vladivostok"],
            ["West Pacific Standard Time", "(GMT+10:00) Guam, Port Moresby"],
            ["Central Pacific Standard Time", "(GMT+11:00) Magadan, Solomon Islands, New Caledonia"],
            ["Fiji Islands Standard Time", "(GMT+12:00) Fiji Islands, Kamchatka, Marshall Islands"],
            ["New Zealand Standard Time", "(GMT+12:00) Auckland, Wellington"],
            ["Tonga Standard Time", "(GMT+13:00) Nuku'alofa"]]
    };
    if (typeof module !== 'undefined') {
        module.exports = $.fn.mafDatepicker;
    }
}));
