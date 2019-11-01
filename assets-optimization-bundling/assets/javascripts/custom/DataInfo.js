"use strict";

var ClientDataInfo = (function () {
    var cookieName = "PayrollAutomationDataCenter";
    var selectedJquery = ".save-select-employee";
    var currentConfig;
    function getCookie(cname) {
        //var name = cname + "=";
        //var decodedCookie = decodeURIComponent(document.cookie);
        //var ca = decodedCookie.split(';');
        //for (var i = 0; i < ca.length; i++) {
        //    var c = ca[i];
        //    while (c.charAt(0) === ' ') {
        //        c = c.substring(1);
        //    }
        //    if (c.indexOf(name) === 0) {
        //        var value = c.substring(name.length, c.length);
        //        return JSON.parse(value);
        //    }
        //}
        var value = localStorage.getItem(cname);
        return JSON.parse(value);
    }

    function setCookie(cname, cvalue, exdays) {
        var sValue = JSON.stringify(cvalue);
        //var d = new Date();
        //d.setTime(d.getTime() + (1 * 30 * 1000)); //(exdays * 24 * 60 * 60 * 1000));
        //var expires = "expires=" + d.toUTCString();
        //document.cookie = cname + "=" + sValue + ";" + expires + ";path=/";

        localStorage.setItem(cname, sValue);
    }

    var getCurrentConfig = function () {
        var selectObjs = $(selectedJquery);
        var uploadedPayrollId = undefined;
        var selectedValues = [];
        $(selectObjs).each(function () {
            var selectObj = $(this);
            var id = selectObj.attr("id");

            if (uploadedPayrollId === undefined) {
                uploadedPayrollId = id.substring(id.indexOf("-") + 1) + "-" + selectObj.data("payrollId");
            }

            var value = selectObj.val();
            selectedValues.push({ id: id, value: value });
        });

        return { uploadedPayrollId: uploadedPayrollId, selectedValue: selectedValues };
    };

    var saveConfig = function () {
        var myConfig = getCurrentConfig();

        //Get all item except current one
        var config = $.grep(currentConfig, function (e) { return e.uploadedPayrollId !== myConfig.uploadedPayrollId; });
        config.push(myConfig);

        currentConfig = config;
        setCookie(cookieName, currentConfig, 1);
    };

    var getConfig = function () {
        var myConfig = getCurrentConfig();
        var config = $.grep(currentConfig, function (e) { return e.uploadedPayrollId === myConfig.uploadedPayrollId; });
        if (config.length === 1) {
            $(config[0].selectedValue).each(function () {
                $("#" + this.id).val(this.value);
            });
        }
    };

    var inIt = function () {
        currentConfig = getCookie(cookieName);
        if (currentConfig == null)
            currentConfig = getCurrentConfig();
        getConfig();
        $(selectedJquery).change(function () {
            saveConfig();
        });
    }

    return { InIt: inIt, Save: saveConfig, Get: getConfig };
})();