////////////////////////////////////////////////////////////////////////////////
//
// Name:        javascriptFunc.js
// Date:        07/02/12
// Purpose:     The purpose of this file is to store all the javascript
//              functions for all pages that use javascript.
//
// Description: This file contains multiple javascript functions to prevent
//              the files that use them from becoming cluttered with code.
//
//  Copyright © 2012 Spectracom Corporation  All rights reserved.
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// Javascript functions from the file index.ctp from LocalClocks
// Description: These function deal with the checkboxes and posting data to
//              selected actions.
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// Function:    jQuery live funciton
// Description: This is the click event handler for the check box in the
//              table header. Using jQuery, this function will grab all
//              checkboxes and check them or uncheck them.
////////////////////////////////////////////////////////////////////////////////
$('#select_all').live('click', function()
{
    if(false != $(this).is(':checked'))
    {
        $("#[id*=LocalClocks]").each(function()
        {
            $(this).attr('checked', true);
        });
    }
    else
    {
        $("#[id*=LocalClocks]").each(function()
        {
            $(this).attr('checked', false);
        });
    }
});


////////////////////////////////////////////////////////////////////////////////
// Javascript functions from the file edit.ctp, edit_all.ctp, edit_selected.ctp,
// and add.ctp from LocalClocks.
// Description: This function focuses the cursor on the first input field.
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// Function:    jQuery function
// Description: jQuery function to set the input focus on the first input box.
////////////////////////////////////////////////////////////////////////////////
$('#focusMeEdit').focus();


////////////////////////////////////////////////////////////////////////////////
// Javascript functions used in the lcadd.ctp, edit.ctp, edit_all.ctp and
// newlcedit_selected.ctpfile.
// These functions will hide/show select boxes in the form depending on what
// other choices have been selected and if the option is neccessary for
// a particular configuration.
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
//Function:    jQuery live function
//Description: jQuery function to monitor changes to the Time Zone Select input.
//             Depending on the value chosen, the Manul UTC Offset Select input
//             will either remain hidden or be shown to the user.
////////////////////////////////////////////////////////////////////////////////
$('#timeZoneSelect').live('change', function(e)
    {
        var val = $(this).val();

        if(val == 0 || val == -1)
        {
            $('.maunalUtcOffsetSelect').hide();
        }
        else if(val == 1)
        {
            $('.maunalUtcOffsetSelect').show();
        }
});

////////////////////////////////////////////////////////////////////////////////
//Function:    jQuery live function
//Description: jQuery function to monitor changes to the DST Definition Select
//             input. Depending on the value chosen, the Region Select input
//             will either remain hidden or be shown to the user.
////////////////////////////////////////////////////////////////////////////////
$('#dstDefinitionSelect').live('change', function(e)
        {
            var val = $(this).val();

            // If the chosen option is either a predefined region or empty
            // hide the custom dst settings entry
            if(val >= 1 && val <= 3)
            {
                $('.dstSettings').hide();
                $('.timeRef').hide();
            }
            else if(val == -1 || val == 0)
            {
                $('.dstSettings').hide();
                $('.timeRef').show();
            }
            else
            {
                $('.dstSettings').show();
                $('.timeRef').show();
            }
    });


////////////////////////////////////////////////////////////////////////////////
// Javascript functions used in upgradebackup.ctp.
// These functions will hide/show form fields depending on selected inputs.
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
//Function:    jQuery live function
//Description: jQuery function to check if the check box was checked. The file
//             upload and submit buttons will become visible if checked, or
//             they will be hidden if unchecked.
////////////////////////////////////////////////////////////////////////////////
$('#upgradeCheckBox').live('click', function(e)
{
    if(false != $(this).is(':checked'))
    {
        $(".upgradeRow").show();
    }
    else
    {
        $(".upgradeRow").hide();
    }
});

////////////////////////////////////////////////////////////////////////////////
//Function:    javascript onclick function
//Description: onclick function to display the configuration table or hide it. 
////////////////////////////////////////////////////////////////////////////////
function configClick()
{
    $('#configTable').toggle();
}