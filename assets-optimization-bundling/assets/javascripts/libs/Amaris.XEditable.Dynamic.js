/********************************************************************************************\
    Amaris.XEditable.Dynamic v0.6
    ------------------------ ----

    >> For help or new feature request, please contact xmalparty@amaris.com ;-)

    This extension allow users to navigate between simple x-editables in a given table.

    Features:
    -- Arrow KEYS to navigatye
    -- any keys (0-9a-zA-Z) to start edit
    -- ENTER to save and open the next cell (going down)
    -- TAB to save and open the next cell (going right)
    -- DELETE to save a null value

    -- Layout of the table is minimized to feel like Excel
    -- /!\ XEditable will send a Save request even if the data did not change.

    ChangeLog:
    v0.6 : Remove dependency to jQuery-UI by adding key codes
           Allow Dynamics to works with complete tables that have many tbody 
    v0.5 : No more table parsing, default.savenochange = false.
    v0.3 : We do not catch Key events anymore if focus on the Table when CTR key is pressed

\********************************************************************************************/

// Extends UI with KeyCodes. So no need to refer JQuery-UI.
$.ui = $.ui || {};
$.extend($.ui, {
    version: "1.11.4",

    keyCode: {
        BACKSPACE: 8,
        COMMA: 188,
        DELETE: 46,
        DOWN: 40,
        END: 35,
        ENTER: 13,
        ESCAPE: 27,
        HOME: 36,
        LEFT: 37,
        PAGE_DOWN: 34,
        PAGE_UP: 33,
        PERIOD: 190,
        RIGHT: 39,
        SPACE: 32,
        TAB: 9,
        UP: 38
    }
});

// Settings
var dynamicDefaults = {
    MAX_ROW_SPAN: 2, // Can be overriden! =)
    dynamicTable: null,
    dynamicElement: null,
    dynamicIsEdit: false,
    dynamicIsReopenned: 0, // when user goes too fast, we increment it (kind of a FILO process)
    position: { x: 0, y: 0 },
    dynamicCurrentVal: -1
};

(function ($) {
    $.fn.extend({
        // START
        // Parsing the table to add data-x & data-y
        dynamic: function () {
            dynamicTable = $(this);
            var rowSpanCells = []; // f[x] = y -- indicates the number of rowSpan left of a given X.

            var rowIndex = 1;
            $(this).children('tbody').children('tr').each(function () {
                var colIndex = 1;

                // Navigate all the lines
                $(this).children('td').each(function () {

                    // Tabindex
                    $(this).attr('tabindex', 1);

                    // EVENTS
                    // Initiate events
                    //
                    if ($(this).data('dynamic') == null || $(this).data('dynamic') != false) {
                        // Mouse Events
                        $(this).click(function () {
                            dynamicDefaults.dynamicElement = $(this);
                            dynamicDefaults.position = $().dynamicGetCellLocation($(this));
                        });
                        $(this).dblclick($().dynamicOnKeyPress);

                        // Keyboard events
                        $(this).keydown($().dynamicOnKeyDown);
                        $(this).keypress($().dynamicOnKeyPress);

                        // XEditable events shown/hideen
                        var editable = $(this).children('.editable');
                        if (editable.length > 0) {
                            $(this).addClass('canEdit');
                            editable.on('shown', $().dynamicShown);
                            editable.on('hidden', $().dynamicHidden);
                        }
                    }
                });

                rowIndex++;
            });
        },

        dynamicGetCellLocation: function (cell) {

            var cols = cell.closest("tr:visible").children("td:visible").index(cell);
            var rows = cell.closest("tbody").children("tr:visible").index(cell.closest("tr"));

            var coltemp = cols;
            var rowtemp = rows;

            cell.prevAll("td").each(function () {
                cols += ($(this).attr("colspan")) ? parseInt($(this).attr("colspan")) - 1 : 0;
            });

            cell.parent("tr").prevAll("tr").each(function () {
                //get row index for search cells
                var rowindex = cell.closest("tbody").children("tr").index($(this));
                // assign the row to a variable for later use
                var row = $(this);
                row.children("td").each(function () {
                    // fetch all cells of this row
                    var colindex = row.children("td").index($(this));
                    //check if this cell comes before our cell
                    if (cell.offset().left > $(this).offset().left) {
                        // check if it has both rowspan and colspan, because the single ones are handled before
                        var colspn = parseInt($(this).attr("colspan"));
                        var rowspn = parseInt($(this).attr("rowspan"));
                        if (colspn && rowspn && rowindex + rowspn > rows)
                            cols += colspn;
                        else if (rowspn && rowindex + rowspn > rows)
                            cols += 1;
                    }

                });
            });

            return { x: cols, y: rows }
        },


        dynamicGetCellFromLocation: function (position, tbody) {
            // Y = top offset
            var row = tbody.children("tr:visible").eq(position.y)

            // X = left offset
            var offsetx = $().dynamicGetOffsetX(position, tbody);

            return row.children("td").eq(position.x - offsetx);
        },

        dynamicGetOffsetX: function (position, tbody) {
            var startY = position.y - dynamicDefaults.MAX_ROW_SPAN;
            if (startY < 0) {
                startY = 0;
            }
            var offsetx = 0;
            for (startY; startY < position.y; startY++) {
                var prevRow = tbody.children("tr:visible").eq(startY);

                // For each TD on the left of the current location 
                // inside the previous row
                // we check the ROW SPAN
                prevRow.children("td:lt(" + position.x + ")").each(function () {

                    // We check if the previous cell is spanned on the current row.
                    // if yes, for ho much rows?
                    offsetx += ($(this).attr('rowspan') && parseInt($(this).attr('rowspan')) > position.y - startY)
                        ? ($(this).attr('colspan'))
                            ? parseInt($(this).attr('colspan'))
                            : 1
                        : 0;

                    // Todo: exit loop if td:lt(x - offsetx) ! because X is higher than the real final value.
                });
            }
            return offsetx;
        },

        dynamicShown: function (e, editable) {
            dynamicDefaults.dynamicIsEdit = true;
            if (dynamicDefaults.dynamicCurrentVal != -1) {
                var input = editable.input.$input.get(0);
                input.value = dynamicDefaults.dynamicCurrentVal;

                dynamicDefaults.dynamicCurrentVal = -1;
            }
        },

        dynamicHidden: function (e) { // e, editable
            if (dynamicDefaults.dynamicIsReopenned > 0) {
                dynamicDefaults.dynamicIsReopenned = dynamicDefaults.dynamicIsReopenned - 1;
                return;
            }
            dynamicDefaults.dynamicIsEdit = false;
            dynamicDefaults.dynamicCurrentVal = -1;

            $(e.target).parent().focus();
        },

        dynamicOnKeyPress: function (e) {
            // ignore when is editing
            if (e == null || dynamicDefaults.dynamicIsEdit) {
                return;
            }

            // Open Editable on DbClick
            if (e.type == 'dblclick' || e.which == $.ui.keyCode.ENTER) {
                $().dynamicStartEdit($(this).find('.editable').first());
            }
        },

        dynamicOnKeyDown: function (e) {
            var editable;
            if (e == null || e.currentTarget == null) {
                return;
            }
            else if (dynamicDefaults.dynamicIsEdit) {
                if (e.which == $.ui.keyCode.TAB || e.which == $.ui.keyCode.ENTER) {
                    e.preventDefault();

                    // Explain that we will still Edit another object after hidden this on!
                    // USED in dynamicHidden function.
                    dynamicDefaults.dynamicIsReopenned = dynamicDefaults.dynamicIsReopenned + 1;
                    editable = $(this).find('.editable');
                    editable.next('span.editable-container').find('form.editableform').submit(); // save the new value

                    if (e.shiftKey) {
                        if (e.which == $.ui.keyCode.TAB) {
                            $().dynamicGoLeft($(this), true); // Open the next Editable on the Right
                        }
                        else if (e.which == $.ui.keyCode.ENTER) {
                            $().dynamicGoUp($(this), true); // Open the Editable on next row
                        }
                    }
                    else {
                        if (e.which == $.ui.keyCode.TAB) {
                            $().dynamicGoRight($(this), true); // Open the next Editable on the Right
                        } else if (e.which == $.ui.keyCode.ENTER) {
                            $().dynamicGoDown($(this), true); // Open the Editable on next row
                        }
                    }


                }
                return;
            }

            // Arrow in table when NO editable is open.
            switch (e.which) {
                case $.ui.keyCode.DELETE:
                    var existEditable = $(this).find('.editable');
                    existEditable.dynamicStartEdit(existEditable, '');
                    existEditable.next('span.editable-container').find('form.editableform').submit();
                    e.preventDefault();
                    return;
                case $.ui.keyCode.RIGHT:
                    $().dynamicGoRight($(this));
                    e.preventDefault();
                    return;
                case $.ui.keyCode.LEFT:
                    $().dynamicGoLeft($(this));
                    e.preventDefault();
                    return;
                case $.ui.keyCode.UP:
                    $().dynamicGoUp($(this));
                    e.preventDefault();
                    return;
                case $.ui.keyCode.DOWN:
                    $().dynamicGoDown($(this));
                    e.preventDefault();
                    return;
            }

            // Catch all numbers / letters
            if (!e.ctrlKey) { // NO action when CTR key is pressed.
                if (// 0-9
                    (e.keyCode >= 48 && e.keyCode <= 57)
                        ||
                    // Numpad 0-9
                        (e.keyCode >= 96 && e.keyCode <= 105)
                        ||
                    // a-zA-Z
                        (e.keyCode >= 65 && e.keyCode <= 90)) {

                    var newValue = String.fromCharCode(e.keyCode);

                    // Numpad not managed by String.fromCharCode -_-
                    if (e.keyCode >= 96 && e.keyCode <= 105) {
                        newValue = e.keyCode - 96;
                    }

                    if (newValue || newValue == 0) {
                        e.preventDefault();
                        var currentEditable = $(this).find('.editable');
                        if (e.ctrlKey || e.altKey) {
                            currentEditable = currentEditable.last();
                        } else {
                            currentEditable = currentEditable.first();
                        }

                        // Show XEdtiable
                        $().dynamicStartEdit(currentEditable.last(), newValue);
                    }
                }
            }

        },

        dynamicGoRight: function (currentCell, openNext) {
            dynamicDefaults.position = $().dynamicGetCellLocation(currentCell);
            dynamicDefaults.position.x += 1;

            // If fail, we cancel
            if (!$().dynamicTryFocus(openNext)) {
                dynamicDefaults.position.x -= 1;
                $().dynamicTryFocus(openNext);
            }
        },

        dynamicGoDown: function (currentCell, openNext) {
            dynamicDefaults.position = $().dynamicGetCellLocation(currentCell);
            dynamicDefaults.position.y += 1;

            // If fail, we cancel
            if (!$().dynamicTryFocus(openNext)) {
                dynamicDefaults.position.y -= 1;
                $().dynamicTryFocus(openNext);
            }
        },

        dynamicGoLeft: function (currentCell, openNext) {
            dynamicDefaults.position = $().dynamicGetCellLocation(currentCell);
            dynamicDefaults.position.x -= 1;

            // If fail, we cancel
            if (!$().dynamicTryFocus(openNext)) {
                dynamicDefaults.position.x += 1;
                $().dynamicTryFocus(openNext);
            }
        },

        dynamicGoUp: function (currentCell, openNext) {
            dynamicDefaults.position = $().dynamicGetCellLocation(currentCell);
            dynamicDefaults.position.y -= 1;

            // If fail, we cancel
            if (!$().dynamicTryFocus(openNext)) {
                dynamicDefaults.position.y += 1;
                $().dynamicTryFocus(openNext);
            }
        },

        // Try to open the Editable element.
        dynamicTryFocus: function (openNext) {
            var element = $().dynamicGetCellFromLocation(dynamicDefaults.position, dynamicDefaults.dynamicElement.closest('tbody'));
            if (element == null)
                return false;
            dynamicDefaults.dynamicElement = element;
            element.focus();
            if (openNext) {
                var editables = element.children('.editable');
                if (editables.length > 0) {
                    editables.editable('show');
                    editables.parent().find('input').select();
                } else {
                    // Notify we are finally not in edit mode because not
                    // editable found!
                    dynamicDefaults.dynamicIsEdit = false;
                }
            }
            return true;
        },

        dynamicStartEdit: function (element, newValue) {
            // First we need to open the XEdtable to show the input
            if (newValue != null) {
                dynamicDefaults.dynamicCurrentVal = newValue;
            } else {
                dynamicDefaults.dynamicCurrentVal = -1;
            }

            element.editable('show');
        }
    });
})(jQuery);
$(function () {
    $('table[data-dynamic]').dynamic();
});