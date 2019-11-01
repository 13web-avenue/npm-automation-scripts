$(document).ready(function () {
        $("input.datepickerinput").attr("readonly", "readonly");
        var oriInputFileContainer;

        $('#uploadedPayrollDetail')
            .on("hidden.bs.modal",
            function () {
                $("#HROTable").html("");
                if ($('.modal:visible').length) //check if any modal is open
                {
                    $('body').addClass('modal-open'); //add class to body
                }
            });

        $('#uploadOption')
            .on("hidden.bs.modal",
            function () {
                $("#uploadOptionContainer").html("");
                if ($('.modal:visible').length) //check if any modal is open
                {
                    $('body').addClass('modal-open'); //add class to body
                }
            });

        $('#notificationModal')
            .on("hidden.bs.modal",
            function () {
                if ($('.modal:visible').length) //check if any modal is open
                {
                    $('body').addClass('modal-open'); //add class to body
                }
            });

        //Upload payroll file
        $("#btnUploadFile")
            .off("click")
            .click(function (e) {
                var spiner = $(e.currentTarget.childNodes[1]);
                var currentEle = $(e.currentTarget);
                var loadingSpiner = $("#loading-indicator");

                if (!$("#frmUpload").valid()) {
                    return false;
                }

                loadingSpiner.show();
                $("#uploadOptionContainer").html("");

                $("#frmUpload")
                    .off("submit")
                    .submit(
                    function (f) {
                        spiner.show();
                        currentEle.attr("disabled", "disabled");
                        var formData = new FormData($(this)[0]);
                        $.when(
                            $.ajax({
                                type: "Post",
                                url: $(this).attr("action"),
                                data: formData,
                                processData: false,
                                contentType: false,
                                error: function () {
                                    $('#uploadedPayrollDetail').modal('hide');
                                    spiner.hide();
                                    currentEle.removeAttr("disabled");
                                    loadingSpiner.hide();
                                    showError("Could not process your request. Contact 911 for more detail.");
                                }
                            })
                        )
                            .done(function (respone) {

                                var legalEntityName = $("select[name='LegalEntityId']").text();
                                loadingSpiner.hide();
                                $("#uploadOptionContainer").html(respone);
                                uploadFileOptionOnChange();
                                registerEventUploadFileOption();

                                oriInputFileContainer = $("#inputFileContainer").clone();

                                $('#uploadOption')
                                    .modal('show',
                                    {
                                        keyboard: false,
                                        backdrop: 'static'
                                    });

                                $("#inputFileContainer").replaceWith(oriInputFileContainer);
                                setInputFileName(document, window);
                                spiner.hide();
                                currentEle.removeAttr("disabled");
                                $("#inputFileContainer").replaceWith(oriInputFileContainer);
                                setInputFileName(document, window);
                            });
                        f.preventDefault();
                        return false;
                    }
                    );
            });

        function registerEventUploadFileOption() {
            //modal upload file option
            $("#btnUploadFileOption")
                .off("click")
                .on("click",
                function (e) {
                    var spiner = $(e.currentTarget.childNodes[1]);
                    var currentEle = $(e.currentTarget);
                    var btnCancel = $("#uploadOption").find("button#btnCancel");

                    if ($("#ExcelFile").val() === "") {
                        showWarning("File is missing.");
                        return false;
                    }

                    spiner.show();
                    currentEle.attr("disabled", "disabled");
                    currentEle.contents().first().replaceWith("File is being uploaded and processed ");
                    btnCancel.attr("data-dismiss", "");

                    var formData = new FormData($("#frmUploadFile")[0]);
                    $.when(
                        $.ajax({
                            type: "Post",
                            url: $("#frmUploadFile").attr("action"),
                            data: formData,
                            processData: false,
                            contentType: false,
                            error: function () {
                                spiner.hide();
                                currentEle.removeAttr("disabled");
                                currentEle.contents().first().replaceWith("Upload ");
                                btnCancel.attr("data-dismiss", "modal");

                                $("#inputFileContainer").replaceWith(oriInputFileContainer);
                                setInputFileName(document, window);
                                showError("Could not process your request. Contact 911 for more detail.");
                            }
                        })
                    )
                        .done(function (respone) {

                            var legalEntityName = $("select[name='LegalEntityId']").text();
                            if (respone.status === "modelInvalid") {
                                showError(respone.message);
                                $("#inputFileContainer").replaceWith(oriInputFileContainer);
                                setInputFileName(document, window);
                                spiner.hide();
                                currentEle.removeAttr("disabled");
                                currentEle.contents().first().replaceWith("Upload ");
                                btnCancel.attr("data-dismiss", "modal");
                                return false;
                            }
                            if (respone.status === "saveFileUnsuccessfully") {
                                showError(respone.message);
                                $("#inputFileContainer").replaceWith(oriInputFileContainer);
                                setInputFileName(document, window);
                                spiner.hide();
                                currentEle.removeAttr("disabled");
                                currentEle.contents().first().replaceWith("Upload ");
                                btnCancel.attr("data-dismiss", "modal");
                                return false;
                            }

                            if (respone.status === "updateUnsuccess") {
                                showError(respone.message.replace('[legalEntityName]', legalEntityName));
                                $("#inputFileContainer").replaceWith(oriInputFileContainer);
                                setInputFileName(document, window);
                                spiner.hide();
                                currentEle.removeAttr("disabled");
                                currentEle.contents().first().replaceWith("Upload ");
                                btnCancel.attr("data-dismiss", "modal");
                                return false;
                            }

                            if (respone.status === "exception") {
                                showError(respone.message.replace('[legalEntityName]', legalEntityName));
                                $("#inputFileContainer").replaceWith(oriInputFileContainer);
                                setInputFileName(document, window);
                                spiner.hide();
                                currentEle.removeAttr("disabled");
                                currentEle.contents().first().replaceWith("Upload ");
                                btnCancel.attr("data-dismiss", "modal");
                                return false;
                            }

                            if (respone.status === "configurationDoesNotExist") {
                                showError(respone.message.replace('[legalEntityName]', legalEntityName));
                                $("#inputFileContainer").replaceWith(oriInputFileContainer);
                                setInputFileName(document, window);
                                spiner.hide();
                                currentEle.removeAttr("disabled");
                                currentEle.contents().first().replaceWith("Upload ");
                                btnCancel.attr("data-dismiss", "modal");
                                return false;
                            }

                            if (respone.status === "allConfigurationIsDisabled") {
                                showError(respone.message);
                                spiner.hide();
                                currentEle.removeAttr("disabled");
                                currentEle.contents().first().replaceWith("Upload ");
                                btnCancel.attr("data-dismiss", "modal");
                                return false;
                            }

                            if (respone.status === "fileStreamEmpty") {
                                showError(respone.message);
                                spiner.hide();
                                currentEle.removeAttr("disabled");
                                currentEle.contents().first().replaceWith("Upload ");
                                btnCancel.attr("data-dismiss", "modal");
                                return false;
                            }

                            if (respone.status === "emptyResult") {
                                showError(respone.message);
                                spiner.hide();
                                currentEle.removeAttr("disabled");
                                currentEle.contents().first().replaceWith("Upload ");
                                btnCancel.attr("data-dismiss", "modal");
                                return false;
                            }

                            if (respone.status === "payrollValidated") {
                                showInfo(respone.message.replace('[legalEntityName]', legalEntityName));
                                $("#inputFileContainer").replaceWith(oriInputFileContainer);
                                setInputFileName(document, window);
                                spiner.hide();
                                currentEle.removeAttr("disabled");
                                currentEle.contents().first().replaceWith("Upload ");
                                btnCancel.attr("data-dismiss", "modal");
                                return false;
                            }

                            if (respone.message === undefined) {
                                $("#HROTable").html(respone);
                                $('#uploadedPayrollDetail')
                                    .modal('show',
                                    {
                                        keyboard: false,
                                        backdrop: 'static'
                                    });

                                $("#inputFileContainer").replaceWith(oriInputFileContainer);
                                setInputFileName(document, window);
                                spiner.hide();
                                currentEle.removeAttr("disabled");
                                payrollOnLoad();
                                $("#li-valid-payroll").click();
                                showSuccess("Your file has been uploaded successfully.");
                                currentEle.contents().first().replaceWith("Upload ");
                                $('#uploadOption').modal("hide");
                                btnCancel.attr("data-dismiss", "modal");
                                return false;
                            }

                            spiner.hide();
                            currentEle.removeAttr("disabled");
                            currentEle.contents().first().replaceWith("Upload ");
                            $("#inputFileContainer").replaceWith(oriInputFileContainer);
                            setInputFileName(document, window);
                            btnCancel.attr("data-dismiss", "modal");
                        });
                });
        }

        var startTime;
        function getParameterByName(name, url) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }

        window.onSuccessArchive = function () {
            MAF.Utils.showSuccess("File has been successfully archived.");
            $('#modal').modal('toggle');
        };
        
        function registerClickEventToViewPayrollDetailLink() {
            $("a.view-payroll-detail")
                .off("click")
                .on("click",
                function (e) {
                    var loadingIndicator = $("#loading-indicator");
                    var $this = $(e.currentTarget);
                    var payrollDetailContainer = $("#payroll-detail");
                    window.UploadedPayrollId = $this.attr("data-uploadedpayrollid");

                    payrollDetailContainer.html("");

                    //show loading indicator
                    loadingIndicator.show();
                    var typeid = $("select[name='AdminParameterType']").val();
                    var data = {
                        LegalEntityId: $this.parent().parent().find("input[name='LegalEntityId']").val(),
                        Date: $this.parent().parent().find("input[name='Date']").val(),
                        UploadedPayrollId: $this.parent().parent().find("input[name='UploadedPayrollId']").val(),
                        PaymentMonth: $this.parent().parent().find("input[name='PaymentMonth']").val(),
                        ExecutionDate: $this.parent().parent().find("input[name='ExecutionDate']").val(),
                        Label: $this.parent().parent().find("input[name='Label']").val(),
                        AdminParameterType: typeid
                    };

                    var postUrl = $this.attr("post-url");
                    window.UploadedPayrollId = data.UploadedPayrollId;

                    startTime = new Date();
                    $("#elapsed-time").text("");
                    setTimeout(displayElapsedTime, 1000);
                    $.when(
                        $.post(postUrl, data)
                            .done(function (res, stat, xhr) {

                                if (res.status != undefined && res.status === "modelInvalid") {
                                    showInfo(res.message);
                                    return false;
                                }
                                if (res.status != undefined && res.status === "invalidPayrolls") {
                                    showInfo(res.message);
                                    return false;
                                }
                                payrollDetailContainer.html(res);
                                LoadPaymentInformation();
                            })
                            .fail(function () {
                                loadingIndicator.hide();
                                payrollDetailContainer.html("");
                                showError("Your request could not process. Contact 911 for support.");
                            })
                    )
                        .done(function () {
                            loadingIndicator.hide();
                            $('[data-toggle="tooltip"]').tooltip();
                            $("#elapsed-time").text("");
                            ClientDataInfo.InIt();
                        });

                });
        }

        window.LoadPaymentInformation = function () {
            $(".configure-parameter-tool-tip").tooltip({ html: true });
            $('.xeditable').editable();
            //disable xeditable if employee was sent
            disableXeditableIfEmployeeWasSent();
            //register event
            onAmountSaveChange();
            onLabelSaveChange();
            onCommentSaveChange();
            validatePaymentInformation();
            confirmationYes();
            onIbanSelectionChange();
            toSendSelectionChange();
            btnShowModalGit();
            btnSendToGit();
            unlockFrozenEmployeeGit();
            payrollOnLoad();
            unLockFrozenEmployeeTrm();
            TableFilter.AddEvent("searchInput");
        }

        window.payrollOnLoad = function () {
            $(".show-employee")
                .off("click")
                .on("click",
                function () {
                    var $this = $(this);
                    var employeeId = $this.data("employeeId");
                    var uploadedPayrollId = $this.data("uploadedpayrollId");
                    var url = $this.data("url");
                    var loadingIndicator = $this.find('.fa-spinner');
                    var dataContainer = $("tr[id='" + employeeId + "-payrollitem-detail']");
                    var data = {
                        employeeId: employeeId,
                        uploadedPayrollId: uploadedPayrollId
                    }

                    loadingIndicator.show();

                    if (dataContainer.html() === "") {
                        $.post(url, data)
                            .done(function (res) {
                                dataContainer.replaceWith(res);
                                $this.find('.fa-caret-right').toggleClass('hidden');
                                $this.find('.fa-caret-down').toggleClass('hidden');
                            })
                            .error(function () {
                                showError("Could not process your request. Contact 911 for support!");
                                return false;
                            })
                            .always(function () {
                                loadingIndicator.hide();
                            });
                    } else {
                        $this.find('.fa-caret-right').toggleClass('hidden');
                        $this.find('.fa-caret-down').toggleClass('hidden');
                        $("tr[data-employee-id='" + employeeId + "']").toggleClass("hidden");
                        loadingIndicator.hide();
                    }
                });
        }

        function btnShowModalGit() {

            $("#btnShowModalGit")
                .off("click")
                .on("click",
                function (e) {
                    var notDisabledCheckboxes = $("input.ma-selector[type='checkbox']");
                    var checkedEmployee = notDisabledCheckboxes.filter(":checked").length;
                    if (checkedEmployee === 0) {
                        showWarning("You have to select employee to send!");
                        return false;
                    }

                    var txtMessage = $("#txtSengGITMessage");
                    var template = txtMessage.data("template").replace("{0}", checkedEmployee);
                    txtMessage.html(template);
                    var gitConfirmationModal = $("#git-confirmation-modal");
                    gitConfirmationModal.modal('show');
                    loadAllDateTimePicker(gitConfirmationModal);
                }
                );
        }

        function btnSendToGit() {
            $("#btnSendToGit")
                .off("click")
                .on("click",
                function () {
                    var $this = $(this);
                    var btnCancel = $this.next();
                    var spiner = $this.find(".fa.fa-spinner");
                    var userAnalyticForm = $("#user-analytic-form");
                    var urlAction = userAnalyticForm.attr("action");
                    var serializedData = userAnalyticForm.serialize();
                    var gitConfirmationModal = $("#git-confirmation-modal");
                    //remove data-dismiss from Cancel button
                    btnCancel.removeAttr("data-dismiss");
                    $this.attr("disabled", "disabled");
                    spiner.show();
                    //Post data
                    $.when(
                        $.post(urlAction, serializedData)
                            .error(function () {
                                btnCancel.attr("data-dismiss", "modal");
                                $this.removeAttr("disabled");
                                spiner.hide();
                                gitConfirmationModal.modal('hide');
                            })
                            .always(function () {
                                btnCancel.attr("data-dismiss", "modal");
                                $this.removeAttr("disabled");
                                spiner.hide();
                                gitConfirmationModal.modal('hide');
                            })
                    )
                        .done(function (res) {
                            spiner.hide();
                            btnCancel.attr("data-dismiss", "modal");
                            $this.removeAttr("disabled");
                            //show message
                            if (res.status === "error") {
                                showError(res.message);
                                gitConfirmationModal.modal('hide');
                                return;
                            }
                            if (res.status === "sendSuccess") {
                                showSuccess(res.message);
                                gitConfirmationModal.modal('hide');
                                //disable all employees have been sent to GIT and update hidden value

                                $.each(res.clientCodes,
                                    function (index, value) {
                                        var _value = value.replace("0", "");
                                        $("input[id='" + _value + "-re-send']").val("false");
                                        $("input[id='" + _value + "-was-sent']").val("true");
                                        $("input[id='" + _value + "-is-checked']").val("false");
                                        $("input[id='" + _value + "-ma-selector']").removeAttr("checked");
                                        $("input[id='" + _value + "-ma-selector']").attr("disabled", "disabled");
                                        $("select[id='" + _value + "-analytical-code']")
                                            .attr("disabled", "disabled");
                                    });

                                return;
                            }
                            if (res.status === "sendUnSuccess") {
                                gitConfirmationModal.modal('hide');
                                showError(res.message);
                                return;
                            }

                        });
                });

        }

        function unlockFrozenEmployeeGit() {
            $("#btnUnlockGit")
                .off("click")
                .on("click",
                function (e) {
                    var $this = $(e.currentTarget);
                    var actionUrl = $this.attr("action-url");
                    var spiner = $($this.children()[1]);

                    $this.attr("disabled", "disabled");
                    spiner.show();

                    $.get(actionUrl)
                        .done(function (res) {
                            if (res.status === "noLockedEmployee") {
                                showInfo(res.message);
                                return;
                            }

                            if (res.status === "exception") {
                                showError(res.message);
                                return;
                            }

                            if (res.length > 0) {

                                $.each(res,
                                    function (index, value) {
                                        var employeeId = value.EmployeeId;
                                        $("input[id='" + employeeId + "-re-send']").val("true");
                                        $("input[id='" + employeeId + "-is-checked']").val("false");
                                        $("input[id='" + employeeId + "-ma-selector']").removeAttr("disabled");
                                        $("select[id='" + employeeId + "-analytical-code']").removeAttr("disabled");

                                    });

                                showSuccess("Locked employees have been UNLOCKED successfully!");
                                return;
                            }
                        })
                        .fail(function () {
                            showErrors("Could not process your request! Contact 911 for support.");
                        })
                        .always(function () {
                            $this.removeAttr("disabled");
                            spiner.hide();
                            toSendSelectionChange();
                        });
                });
        }


        function unLockFrozenEmployeeTrm() {
            $("#btnTrmUnlock")
                .off("click")
                .on("click",
                function (e) {
                    //-----------------------
                    var $this = $(e.currentTarget);
                    var actionUrl = $this.attr("action-url");
                    var spiner = $($this.children()[1]);

                    $this.attr("disabled", "disabled");
                    spiner.show();

                    $.get(actionUrl)
                        .done(function (res) {
                            if (res.status === "noLockedEmployee") {
                                showInfo(res.message);
                                return;
                            }

                            if (res.status === "exception") {
                                showError(res.message);
                                return;
                            }

                            if (res.length > 0) {

                                $.each(res,
                                    function (index, value) {
                                        var employeeId = value.EmployeeId;
                                        $("input[id='" + employeeId + "-ma-selector']").removeAttr("disabled");
                                        $("input[id='" + employeeId + "-re-send']").prop("value", "true");
                                        $("input[id='" + employeeId + "-is-checked']").prop("value", "false");
                                        $("select[id='" + employeeId + "-bank-information']").prop("disabled", "");
                                        $("span[id='" + employeeId + "-amount']").editable("enable");
                                        $("span[data-name='Label'][data-pk='" + employeeId + "']")
                                            .editable("enable");
                                        $("span[data-name='Comment'][data-pk='" + employeeId + "']")
                                            .editable("enable");

                                    });

                                showSuccess("Locked employees have been UNLOCKED successfully!");
                                return;
                            }
                        })
                        .fail(function () {
                            showErrors("Could not process your request! Contact 911 for support.");
                        })
                        .always(function () {
                            $this.removeAttr("disabled");
                            spiner.hide();
                            toSendSelectionChange();
                        });
                });
        }


        $("#btnShowPayroll")
            .off("click")
            .click(function (e) {
                var spiner = $(e.currentTarget.childNodes[1]);
                var currentEle = $(e.currentTarget);
                var loadingIndicator = $("#loading-indicator");

                $("#accountant-list-payrolls").html("");
                $("#payment-list-payrolls").html("");
                $("#accountant-payroll-detail").html("");

                $("#hr-list-payrolls").html("");
                $("#payroll-detail").html("");

                loadingIndicator.hide();

                if (!$("#frmShowpayroll").valid()) {
                    return false;
                }

                spiner.show();
                currentEle.attr("disabled", "disabled");

                var postUrl = $(currentEle).attr("data-url");
                var data = $("#frmShowpayroll").serialize();

                $.when(
                    $.post(postUrl, data)
                        .error(function (errorResponse) {
                            spiner.hide();
                            currentEle.removeAttr("disabled");
                        })
                        .always(function () {
                            spiner.hide();
                            currentEle.removeAttr("disabled");
                        })
                )
                    .done(function (respone) {
                        var legalEntityName = $("select[name='LegalEntityId']").select2('data').text;

                        if (respone.status && respone.status === "payrollNull") {
                            showInfo(respone.message.replace("[legalEntityName]", legalEntityName));
                            return;
                        }
                        $("#accountant-list-payrolls").html(respone);
                        $("#hr-list-payrolls").html(respone);
                        $("#payment-list-payrolls").html(respone);
                        registerClickEventToViewPayrollDetailLink();
                        checkToBeRemovedOnChange();
                        removeUploads();
                        $(".configure-parameter-tool-tip").tooltip({ html: true });

                        spiner.hide();
                        currentEle.removeAttr("disabled");
                    });

                $("#frmShowpayroll")
                    .off("submit")
                    .submit(function (f) {
                        spiner.show();
                        currentEle.attr("disabled", "disabled");
                        var formData = new FormData($(this)[0]);
                        $.ajax({
                            type: "Post",
                            url: $(this).attr("action"),
                            data: formData,
                            processData: false,
                            contentType: false,
                            success: function (respone) {
                                console.log(respone);
                            }
                        });
                        f.preventDefault();
                        return false;
                    });

                e.preventDefault();
                return false;
            });

        window.OnModalSubmit = function (event) {
            var formData = new FormData($(this)[0]);
            var uploadedPayrollId = $("input#UploadedPayrollId").val();
            $.when(
                $.ajax({
                    type: "Post",
                    url: $(this).attr("action"),
                    data: formData,
                    processData: false,
                    contentType: false,
                    error: function (msg) {
                        $('#modal').modal('hide');
                        showError("Your request could not process. Contact 911 for support.");
                    }
                })
            )
                .done(function (respone) {
                    if (respone.status === "error") {
                        $('#modal').modal('hide');
                        showError(respone.message);
                        return;
                    }

                    showSuccess("Payroll Amounts has been validated!");
                    $('#modal').modal('hide');
                    //click to reload payrolls
                    $("#btnShowPayroll").click();
                });
            return false;
        }

        window.OnSendToGitModalSubmit = function (event) {
            var formData = new FormData($(this)[0]);
            var spiner = $($(this)[0]).find("i.fa");
            var sendButton = $($(this)[0]).find("button[type='submit']");
            var closeButton = $($(this)[0]).find("button[type='button']");

            sendButton.attr("disabled", "disabled");
            closeButton.attr("data-dismiss", "");
            spiner.show();

            $.when(
                $.ajax({
                    type: "Post",
                    url: $(this).attr("action"),
                    data: formData,
                    processData: false,
                    contentType: false,
                    error: function (msg) {
                        spiner.hide();
                        sendButton.removeAttr("disabled");
                        $('#modal').modal('hide');
                        showError(msg.message);
                    }
                })
            )
                .done(function (respone) {
                    spiner.hide();
                    sendButton.removeAttr("disabled");

                    if (respone.status === "sendUnSuccess") {
                        closeButton.attr("data-dismiss", "modal");
                        $('#modal').modal('hide');
                        showError(respone.message);
                        return;
                    }


                    if (respone.status === "error") {
                        closeButton.attr("data-dismiss", "modal");
                        $('#modal').modal('hide');
                        showError(respone.message);
                        return;
                    }

                    if (respone.status === "sendSuccess") {
                        //var html = $.parseHTML(respone.operationMessage);
                        closeButton.attr("data-dismiss", "modal");
                        //$("#server-infor").html(html);
                        //$("#server-infor").show();
                        $('#modal').modal('hide');
                        showInfo(respone.message);
                        return;
                    }

                    showSuccess(respone.message);
                    $('#modal').modal('hide');
                });
            return false;
        }


        window.uploadOnLegalEntitySelectionChange = function (e) {
            $(e.delegateTarget).valid();
            $("#HROTable").html("");
        };


        function setInputFileName(document, window) {
            var inputs = document.querySelectorAll('.inputfile');
            Array.prototype.forEach.call(inputs,
                function (input) {
                    var label = input.nextElementSibling,
                        labelVal = label.innerHTML;

                    input.addEventListener('change',
                        function (e) {
                            var fileName = '';
                            if (this.files && this.files.length > 1)
                                fileName = (this.getAttribute('data-multiple-caption') || '')
                                    .replace('{count}', this.files.length);
                            else
                                fileName = e.target.value.split('\\').pop();

                            if (fileName)
                                label.querySelector('span').innerHTML = fileName;
                            else
                                label.innerHTML = labelVal;
                        });

                    // Firefox bug fix
                    input.addEventListener('focus', function () { input.classList.add('has-focus'); });
                    input.addEventListener('blur', function () { input.classList.remove('has-focus'); });
                });
        };

        setInputFileName(document, window);

        function uploadFileOptionOnChange() {
            $("input#replacePayrolls")
                .on("change",
                function (e) {
                    if ($(e.currentTarget).is(":checked")) {
                        $("select#selectUploadedPayrolls").removeAttr("disabled");
                    }
                });

            $("input#addNewPayrolls")
                .on("change",
                function (e) {
                    if ($(e.currentTarget).is(":checked")) {
                        $("select#selectUploadedPayrolls").attr("disabled", "disabled");
                    }
                });

            $("input#replacePayrolls").change();
            $("input#addNewPayrolls").change();
        }

        function onAmountSaveChange() {
            $("span[data-name='Amount']")
                .off("DOMSubtreeModified")
                .on("DOMSubtreeModified",
                function (event) {
                    var nextHiddenInput = $(event.currentTarget).next();
                    nextHiddenInput.val($(event.currentTarget).text());
                });

        }

        function onLabelSaveChange() {
            $("span[data-name='Label']")
                .off("DOMSubtreeModified")
                .on("DOMSubtreeModified",
                function (event) {
                    var nextHiddenInput = $(event.currentTarget).parent().next();
                    nextHiddenInput.val($(event.currentTarget).text());
                });

        }

        function onCommentSaveChange() {
            $("span[data-name='Comment']")
                .off("DOMSubtreeModified")
                .on("DOMSubtreeModified",
                function (event) {
                    var nextHiddenInput = $(event.currentTarget).parent().next();
                    nextHiddenInput.val($(event.currentTarget).text());
                });
        }

        function validatePaymentInformation() {
            $("#validate-payment")
                .off("click")
                .on("click",
                function (e) {
                    //show modal
                    var validateConfirmationModal = $("#validate-confirmation");
                    var divMissingEmployee = validateConfirmationModal.find("div.missing-employee");
                    var divMissingEmployeeName = divMissingEmployee.find("div.missing-employees-name");
                    var faCaret = divMissingEmployee.find("i.fa");
                    var divMissingEmployeeLink = divMissingEmployee.find("a.missing-employee-link");
                    var notDisabledCheckboxes = $("input[type='checkbox'][name='IsChecked']")
                        .filter(":not([disabled='true'], [disabled='disabled'])");

                    if (notDisabledCheckboxes.filter(":checked").length === 0) {
                        showWarning("You have to select payments to send!");
                        return false;
                    }

                    //get missing employees
                    var missingEmployeeNames = "";
                    $.each($("input.mass-checkbox:not(:checked)").parent().parent().next(),
                        function (index, value) {
                            missingEmployeeNames += $(value).text() + ";";
                        });
                    //get missing employees in case employee does not have bank information
                    $.each($(".payment-iban-dropdown"),
                        function (index, ele) {
                            if ($(ele).children().length === 0) {
                                missingEmployeeNames += $(ele).parent().parent().find(".beneficiary").text() + ";";
                            }
                        });

                    //show modal
                    validateConfirmationModal.on('show.bs.modal',
                        function () {
                            divMissingEmployeeName.html("");
                            $.each(missingEmployeeNames.split(";"),
                                function (index, value) {
                                    var html = "<p>" + value + "</p>";
                                    divMissingEmployeeName.append(html);
                                });

                            divMissingEmployeeLink.off("click")
                                .on("click",
                                function () {
                                    if (faCaret.hasClass("fa-caret-right")) {
                                        faCaret.removeClass("fa-caret-right");
                                        faCaret.addClass("fa-caret-down");
                                        divMissingEmployeeName.fadeIn();
                                    } else {
                                        faCaret.removeClass("fa-caret-down");
                                        faCaret.addClass("fa-caret-right");
                                        divMissingEmployeeName.fadeOut();
                                    }
                                });

                        });
                    validateConfirmationModal.modal('show');
                });
        }


        function disableXeditableIfEmployeeWasSent() {
            var employeesWasSent = $("input[name*='WasSent'][value='True']");
            $.each(employeesWasSent,
                function (index, value) {
                    var employeeId = $(value).attr("employee-id");

                    $("span[id='" + employeeId + "-amount']").editable("disable");
                    $("span[data-name='Label'][data-pk='" + employeeId + "']").editable("disable");
                    $("span[data-name='Comment'][data-pk='" + employeeId + "']").editable("disable");
                });
        }


        function confirmationYes() {
            $("#btnYesPaymentInformation")
                .off("click")
                .on("click",
                function (e) {
                    var thisTarget = $(this);
                    var spiner = thisTarget.find(".fa.fa-spinner");
                    var paymentInformationForm = $("#payment-information-table-form");
                    var formData = paymentInformationForm.serialize();
                    var postUrl = paymentInformationForm.attr("post-url");
                    var validateConfirmationModal = $("#validate-confirmation");

                    thisTarget.attr("disabled", "disabled");
                    spiner.show();

                    $.when(
                        $.post(postUrl, formData)
                            .done(function (res) {
                                var status = res.status;
                                var message = res.message;
                                var entryResults = res.entryResult;

                                if (status === "success") {
                                    spiner.hide();
                                    thisTarget.removeAttr("disabled");
                                    showSuccess(message);
                                    validateConfirmationModal.modal("hide");

                                    //loop through entry result to disable appropriate employee
                                    if (entryResults != null && entryResults.length !== 0) {
                                        //get error of entry
                                        $.each(entryResults,
                                            function (index, value) {
                                                if (value.errorCode === 200 || value.errorMessage === null) {
                                                    $("input[id='" + value.employeeId + "-ma-selector']")
                                                        .attr("disabled", "disabled");
                                                    $("input[id='" + value.employeeId + "-ma-selector']")
                                                        .removeAttr("checked");
                                                    $("input[id='" + value.employeeId + "-is-checked']")
                                                        .val("false");
                                                    $("input[id='" + value.employeeId + "-was-sent']").val("true");
                                                    $("select[id='" + value.employeeId + "-bank-information']")
                                                        .attr("disabled", "disabled");
                                                    $("span[id='" + value.employeeId + "-amount']")
                                                        .editable("disable");
                                                    $("span[data-name='Label'][data-pk='" + value.employeeId + "']")
                                                        .editable("disable");
                                                    $("span[data-name='Comment'][data-pk='" +
                                                        value.employeeId +
                                                        "']")
                                                        .editable("disable");
                                                }
                                            });
                                    }

                                    return;
                                }

                                if (status === "error") {
                                    if (message.indexOf("timed out") > 0) {
                                        MAF.Utils.showWarning("Booking to Treasury Management has timed out. Could you check on Treasury?");
                                    } else {
                                        spiner.hide();
                                        thisTarget.removeAttr("disabled");
                                        var summaryErrorMessage = "";
                                        if (entryResults != null && entryResults.length !== 0) {
                                            //get error of entry
                                            $.each(entryResults,
                                                function (index, value) {
                                                    if (value.errorCode === 0 || value.errorCode === 1) {
                                                        summaryErrorMessage += value.errorMessage + "\r\n";
                                                    }
                                                });
                                        }
                                        MAF.Utils.showError(message + "\r\n" + summaryErrorMessage);
                                        validateConfirmationModal.modal("hide");
                                        return;
                                    }
                                }
                            })
                            .fail(function () {
                                spiner.hide();
                                thisTarget.removeAttr("disabled");
                                validateConfirmationModal.modal("hide");
                                showError("Could not process your request.");
                            })
                    )
                        .done(function () {
                            spiner.hide();
                            thisTarget.removeAttr("disabled");
                            validateConfirmationModal.modal("hide");
                        });


                    return false;
                });
        }

        function onIbanSelectionChange() {
            $(".payment-iban-dropdown")
                .change(function (e) {
                    var currentElement = $(e.currentTarget);
                    var selectedValue = currentElement.val();
                    var bankInformationElement = currentElement.parent().parent().find("#hidden-bankInformationId");
                    //update bankInformationId every user select change
                    bankInformationElement.val(selectedValue);
                });
        }


        function toSendSelectionChange() {
            $("input[type=checkbox][name*='IsChecked']")
                .filter(":not([disabled='disabled'], [disabled='true'])")
                .change(function (e) {
                    var currentElement = $(e.currentTarget);
                    var isCheckedHiddenInput = currentElement.next();
                    //set current value to hidden field
                    if (currentElement.is(":checked")) {
                        isCheckedHiddenInput.val("true");
                    } else {
                        isCheckedHiddenInput.val("false");
                    }

                    if ($("input[type=checkbox][name='IsChecked']")
                        .filter(":not([disabled='disabled'], [disabled='true'])")
                        .filter(":checked")
                        .length !==
                        0) {
                        $("button#validate-payment").removeAttr("disabled");
                    } else {
                        $("button#validate-payment").attr("disabled", "disabled");
                    }
                });
        }


        function checkToBeRemovedOnChange() {
            $("input[type='checkbox'][name='chkCheckToBeRemoved']")
                .on("change",
                function () {
                    var $this = $(this);
                    var btnRemoveUpload = $("#btnRemoveUploads");
                    var checkboxesChecked = $("input[type='checkbox'][name='chkCheckToBeRemoved'][data-removable=True]")
                        .filter(":checked");
                    if (checkboxesChecked.length > 0) {
                        btnRemoveUpload.removeAttr("disabled");
                    } else {
                        btnRemoveUpload.attr("disabled", "disabled");
                    }

                    var btnArchivedUpload = $("#btnArchivedUploads");
                    var archivedChecked = $("input[type='checkbox'][name='chkCheckToBeRemoved'][data-archivable=True]").filter(":checked");
                    if (archivedChecked.length > 0) {
                        btnArchivedUpload.show();
                    } else {
                        btnArchivedUpload.hide();
                    }
                });
        }

        function removeUploads() {
            $("#btnRemoveUploads")
                .off("click")
                .on("click",
                function () {
                    var $this = $(this);
                    var url = $this.data("url");
                    var checkboxesChecked = $("input[type='checkbox'][name='chkCheckToBeRemoved'][data-removable=True]")
                        .filter(":checked");
                    if (checkboxesChecked.length === 0) {
                        showWarning("Select upload and hit button again!");
                        return;
                    }

                    var uploadedPayrollIds = new Array();

                    checkboxesChecked.each(function (index, value) {
                        uploadedPayrollIds.push($(value).data("uploadedpayrollId"));
                    });

                    if (confirm("Do you really want to remove selected upload(s)? Be careful with your decision!")
                    ) {
                        $.post(url, $.param({ uploadedPayrollIds: uploadedPayrollIds.join(',') }))
                            .done(function (res) {
                                if (res.Status === "error") {
                                    showError(res.Message);
                                    return;
                                }
                                if (res.Status === "success") {
                                    showSuccess(res.Message);
                                    $("#btnShowPayroll").click();
                                    return;
                                }

                            })
                            .fail(function () {
                                showError("Your request could not process. Contact 911 for support!");
                            });
                    }

                });
        }

        function displayElapsedTime() {
            // later record end time
            var endTime = new Date();

            // time difference in ms
            var timeDiff = endTime - startTime;

            // strip the miliseconds
            timeDiff /= 1000;

            // get seconds
            var seconds = Math.round(timeDiff % 60);

            // remove seconds from the date
            timeDiff = Math.floor(timeDiff / 60);

            // get minutes
            var minutes = Math.round(timeDiff % 60);

            // remove minutes from the date
            timeDiff = Math.floor(timeDiff / 60);

            // get hours
            var hours = Math.round(timeDiff % 24);

            // remove hours from the date
            timeDiff = Math.floor(timeDiff / 24);

            // the rest of timeDiff is number of days
            var days = timeDiff;

            $("#elapsed-time").text(minutes + " : " + seconds);

            setTimeout(displayElapsedTime, 1000);
        }

        //Automatic set legal entity received from Home page
        var legalEntityIdfromHomePage = $("input[name='selected-legal-entity-id']").val();
        if (legalEntityIdfromHomePage !== undefined && legalEntityIdfromHomePage !== "") {
            $("select[name='LegalEntityId']").select2('val', legalEntityIdfromHomePage);
            $("#btnShowPayroll").click();
        }

        $(".legal-entity-status").tooltip();
    });


var TableFilter = (function () {
    var addEnterEvent = function (name) {
        $("input[name='" + name + "']").keyup(function (e) {
            filter(name);
        });
    }

    var filter = function (name) {
        var query = $("input[name='" + name + "']").val().toLowerCase();
        var tr = $(".table-filter tr");
        var employeeId = 0;
        for (var j = 1; j < tr.length - 1; j++) {
            var row = $(tr[j]);
            var value = row.find('[data-search-value!=undefined]').map(function () {
                var element = $(this).data('searchValue');
                if (element === undefined || element === null)
                    return false;
                return element.toLowerCase().indexOf(query) !== -1;
            }).get();

            var found = false;

            for (var i = 0; i < value.length; i++) {
                if (value[i] === true) {
                    found = true;
                    row.show();
                    i = value.length;
                    employeeId = $(row.children().find("div[data-employee-id]")).attr("data-employee-id");
                }
            }

            if (!found && row.data("employeeId") === undefined) {
                employeeId = 0;
            }

            if (!found && (employeeId === 0 || (employeeId !== 0 && row.data("employeeId") != employeeId))) {
                row.hide();
            }
        }
    }
    return {
        Filter: filter, AddEvent: addEnterEvent
    };
})();