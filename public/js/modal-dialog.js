////////////////////////////////////////////////////////////////////////////////
//
// Name:        modal-dialog.js
// Date:        06/28/12
// Purpose:     The purpose of this file is to keep all javascript code that is
//              used for displaying modal dialog windows in one location that
//              can be used by any view that requires a modal dialog.
//
// Description: This file contains the options for each of the different 
//              varieties of dialog windows. this is also where the javascript 
//              onclick listeners are located.
//
//              The onclick listeners wait for an element with a specified class
//              to be clicked and then executes the commands defined in the
//              click functions.
//
// TODO: Attempt to reduce the number of dialog variables down because many of 
//       the dialog boxes are identical.
//
//  Copyright © 2012 Spectracom Corporation  All rights reserved.
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// Global Variables
////////////////////////////////////////////////////////////////////////////////
//var $editSel;
//var $delete;
//var $selError;

// Sets the default speed of the dialog window effects
$(document).ready(function(){

$.fx.speeds._default = 1000;


////////////////////////////////////////////////////////////////////////////////
// Function:    CloseDialog()
// Description: Closes all dialog windows when called, and reloads the page
//              that the modal dialog was called from.
////////////////////////////////////////////////////////////////////////////////
function CloseDialog()
{
    $("#[id*=dialog]").dialog('close');
    location.reload(true);
}

////////////////////////////////////////////////////////////////////////////////
// Variables to hold the different dialog options
////////////////////////////////////////////////////////////////////////////////
$(function ()
{
    $editSel = $("#editSel_dialog").dialog(
    {
        autoOpen: false,
        height: 'auto',
        width: 'auto',
        resizable: true,
        modal: true,
        buttons:
        {
            "Cancel": function()
            {
                $(this).dialog("close");
            }
        }
    });
});

$(function ()
{
    $delete = $("#delSel_dialog").dialog(
    {
        autoOpen: false,
        height: 'auto',
        width: 'auto',
        resizable: true,
        modal: true,
        buttons:
        {
            "Cancel": function()
            {
                $(this).dialog("close");
            }
        }
    });
})

$(function ()
{
    $selError = $("#selError_dialog").dialog(
    {
        autoOpen: false,
        height: 'auto',
        width: 'auto',
        resizable: true,
        modal: true,
        buttons:
        {
            "Ok": function()
            {
                $(this).dialog("close");
            }
        }
    });
})
}); // End $(document).ready()