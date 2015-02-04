/**
 * Miscellaneous helper functions
 *
 * @internal
 * @package webroot
 * @subpackage js
 * @access public
 * @author Glase
 *
 * @copyright (C) Copyright 2013 Spectracom Corporation, All Rights Reserved
 */

/**
 * Wait 5 seconds, then polls the unit to see when it starts responding again, then calls the callback
 * 
 * @param function callback the function that is called with either true (unit started responding again) or 
 *        false (no response from unit)
 *        
 * @return null
 */

// Stub out the console (debug object) if the browser doesn't support it
//if (typeof console === "undefined" || typeof console.log === "undefined") 
//{
//     console.log = function() {};
//}

function waitForReboot( callback )
{
        
    setTimeout( function()
    {
        $.ajax(
        {
            url:      "/Tools/versions",
            dataType: 'json',
            timeout:  120000,
            success:  function( data ) 
            {
                // we got a response! assume the unit is alive
                callback( true );
            },
            error: function( jqXHR, textStatus, errorThrown ) 
            {
                callback( false );
            }
       });
 
    }, 5000 );
    
}

/**
 * Show a notification message
 * 
 * @return null
 */
function ShowNotification(html, type)
{
    if( html > '')
    {
        switch( type )
        {
            case 'info': 
            case 'flash': ShowInfo( html ); break;
            case 'success': ShowSuccess( html ); break;
            case 'warning': ShowWarning( html ); break;
            case 'error': ShowError( html ); break;
    
        }
    }
}

/**
 * Show an error message which disappears after a timeout
 * 
 * @return null
 */
function ShowError(html)
{
    Notifications.push( {imagePath: '/img/error.png', text: html, autoDismiss: 30 });
}

/**
 * Show a warning message which disappears after a timeout
 * 
 * @return null
 */
function ShowWarning(html)
{
    Notifications.push( {imagePath: '/img/warning.png', text: html, autoDismiss: 30 });
}

/**
 * Show a info message which disappears after a timeout
 * 
 * @return null
 */
function ShowInfo(html)
{
    Notifications.push( {imagePath: '/img/info.png', text: html, autoDismiss: 15 });
}

/**
 * Show a success message which disappears after a timeout
 * 
 * @return null
 */
function ShowSuccess(html)
{
    Notifications.push( {imagePath: '/img/success.png', text: html, autoDismiss: 15 });
}


/**
 * Default handler for ajax errors
 * 
 * You can define your own error handler in $.ajax if you don't like this one
 * 
 * @return null
 */
$(document).ajaxError( function( event, jqXHR, ajaxSettings, thrownError )
{
    if (jqXHR.status == 0)
    {
        // ignore; this happens for any pending ajax requests when the browser redirects to a new page
        //ShowError('Unable to contact server. Please Check Your Network.');
    } 
    else if (jqXHR.status == 403)
    {
        // not authorized error; ignore; probably means session timed out
    }
    else
    {
        ShowError( jqXHR.status + ": " + thrownError );
    }
});

// ----------------------------------------------------------
// A short snippet for detecting versions of IE in JavaScript
// without resorting to user-agent sniffing
// ----------------------------------------------------------
// If you're not in IE (or IE version is less than 5) then:
//     ie === undefined
// If you're in IE (>=5) then you can determine which version:
//     ie === 7; // IE7
// Thus, to detect IE:
//     if (ie) {}
// And to detect the version:
//     ie === 6 // IE6
//     ie > 7 // IE8, IE9 ...
//     ie < 9 // Anything less than IE9
// ----------------------------------------------------------
// UPDATE: Now using Live NodeList idea from @jdalton
var ie = (function ()
{

    var undef,
        v = 3,
        div = document.createElement('div'),
        all = div.getElementsByTagName('i');

    while (
        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
        all[0]
    );

    return v > 4 ? v : undef;

} ());


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// replace null values with non-breaking space
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function nbsp(s)
{
    if (undefined == s)
        return "&nbsp";
    else
        return s;
}

/**
 * An array which holds all the active AjaxUpdaters
 */
var ajaxUpdaters = [];

/**
 * Define an object that uses ajax to update an element in the page.
 * 
 * Options are:
 *      url: the link that should be polled for content
 *      type: the type of data expected ('json', 'xml', 'html' etc according to jquery $.ajax types)
 *      parser (array, string): function to parse the server's response.
 *      interval: the interval in ms between completion of one update and the start of the next.
 *          an interval of 0 means update only once.
 *      target: if a string, it is the DOM ID of the element to receive HTML content.  If a function,
 *          it is called with the data returned from the server.
 *      
 * The updater will stop updating if the specified DOM target is not found (eg it is unloaded from the page)
 * 
 * @param object options as described above
 * @returns null
 */
function AjaxUpdater( options )
{
    // define defaults and use the options variable to override them selectively
    var settings = { url: '', type: 'html', parser: null, interval: 30000, target: ''};
    $.extend( settings, options );
    
    // save the configuration in this object for later reference
    this.url = settings.url;
    this.type = settings.type;
    this.parser = settings.parser;
    this.interval = settings.interval;
    this.target = settings.target;
    
    // start updating!
    this.update();
}

AjaxUpdater.prototype.destroy = function ()
{
}

AjaxUpdater.prototype.update = function ()
{
    // use a local variable in order to properly access the object's data
    var me = this;

    $.ajax(
    {
        url: me.url,
        dataType: me.type,

        success: function( data ) 
        {       
        	// Retrieve name of currently active tab, do this after the data is retrieved cause it may take a while
        	var tabName = $('li[class="active"]').text();
        	
        	//retrieve the current scroll offset to be restored later
        	var scrollOffset = $('div[class="modal-scrollable"]').scrollTop();
        	
            // If there is a parser for the data, use it
            if( 'function' == typeof( me.parser)  )
            {
                data = me.parser( data, me.type );
            }
            
            // Either update the target element, or call the specified callback
            if( 'string' == typeof( me.target) )
            {
                $('#' + me.target).html( data );
            }
            else if( 'function' == typeof( me.target ))
            {
                me.target( data, me.type );
            }
            
            // If using tabs, make sure to keep showing active tab
            if (tabName) 
            {
                $('a[data-toggle="tab"]:contains("'+tabName+'")').tab('show');
            }
            
            if(scrollOffset)
            {
            	$('div[class="modal-scrollable"]').scrollTop(scrollOffset);
            }	
        },

        complete: function( jqXHR, textStatus )
        {
            // set the timer for next update
            if( me.interval > 0 )
            {
                if( ('string' == typeof( me.target) && $('#' + me.target).length == 0 ))
                {
                    // our dom element has been removed, stop updating
                }
                else
                    window.setTimeout( function() {me.update();}, me.interval );
            }
            
        }
      });
        
};

/** 
 * Aid function for ajaxvalidation to decide whether to show the field  
 * 
 * @param string  setting is the ajaxValidation type for the field (true, false, all, invalid, valid, none, etc)
 * @param boolean state is the validity of the field (true for valid)
 *   
 */  
function _showOnlyDecision(setting, state)
{ 
  state = state ? 'valid' : 'invalid'; 
  if (setting == "all" || setting == "true" || setting == state) return true; 
  
  return false; 
}

/**
 * Initializes jquery widgets when they are added to the DOM
 * 
 * This function is called on page load, and when elements are added to the DOM (via AJAX)
 * It finds certain types of elements within the content and binds the necessary handlers to 
 * them.
 *
 */
function _initWidgets( element )
{
    // initializing bootstrap tooltip for form error messages
    //$('.input-error', element).tooltip()
    $('.error-message', element).tooltip()

    // enable popvers on links
    $('[data-toggle=popover]', element).popover();
    
    // initializing the chosen plugin for select boxes
    $(".chzn-select", element).each( function()
    {
        $(this).chosen( $(this).data('chosen'));
    });
    
    // user placeholder plugin for browsers that don't support it natively
    $('input, textarea', element).placeholder();
    
    // Register to handle links that have a class of dialog-static.  We open the modal dialog referenced
    // by the link
    $('a.dialog-static', element).click(function()
    {
        try
        {
            // find the dialog element, open it, and center it on the page
            var dialog = $($(this).attr('href'));
            var width = $('.modal-body', dialog).width();
            dialog.modal().css( 'width', width ).css('margin-left', -(width/2));
        }
        catch(e)
        {
            
        }
        return false;
    });
    

}

/*
 * provided a rules array, this on change event handler will give inputs attributes
 * based off another fields current input value. All input/select/checkbox elements with
 * a class of ajax-validate will have a list of known attributes reset at the beginning of
 * each function call. For an example rules array, see PanelHelper's
 * __getFieldsFromchangeInputAttrByValueArray function.
 * 
 * Can be called using custom javascript, but meant to be used by PanelHelper's addOnChangerules
 * function.
 * 
 * @author - Andrew Mueller
 */
function changeInputAttrByValue(changeInputAttrByValueArray, modelName, reset)
{
    var knownAttrs = ['disabled', 'readonly', 'checked'];
    //everytime this function is called on change it will reset all select and input elements
    if(reset)
    {
        for(attrIndex in knownAttrs)
        {
            if(attrIndex !== 'remove')
            {
                var attr = knownAttrs[attrIndex];
                $(':input.ajax-validate').removeAttr(attr);
            }
        }
    }
    
    for(var field in changeInputAttrByValueArray)
    {
        var inputId = modelName + capitalizeFirstLetter(toCamelCase(field));
        
        var currValue = $('#' + inputId).val();
        
        var nextTier = changeInputAttrByValueArray[field][currValue];
        var attrsIfLastTier = Object.keys(changeInputAttrByValueArray[field]);

        //if the value doesnt exist then assume that its the last tier but only if the 1st attribute
        //is in the known attr
        if((nextTier === null || typeof(nextTier) === 'undefined') && $.inArray(attrsIfLastTier[0], knownAttrs) >= 0)
        {
            var attrs = Object.keys(changeInputAttrByValueArray[field]);
            for(attrIndex in attrs)
            {
                if(attrIndex !== 'remove')
                {
                    var attr = attrs[attrIndex];
                    var value = changeInputAttrByValueArray[field][attr];
                    
                    $('#' + inputId).attr(attr, value);
                }
            }
        }
        else
        {
            changeInputAttrByValue(nextTier, modelName, false);
        }
    }
}

/*
 * provided a rules array, this on change event handler will hide elements with
 * a given ID based on another fields current input value. All elements
 * within the modal-body with classes inner-well will be shown again at the beginning
 * of each function call. ATTACH A CLASS OF 'reshow' OTHERWISE FOR THE ID TO BE SHOWN
 * AGAIN AT THE BEGINNING OF EACH FUNCTION CALL. For an example rules array, see
 * $this->__getFieldsFromHideIdsByValueArray.
 * 
 * Can be called using custom javascript, but meant to be used by PanelHelper's addOnChangerules
 * function.
 * 
 * @author - Andrew Mueller
 */
function hideIdsByValue(hideIdsByValueArray, modelName, reset)
{
    
    //everytime this function is called on change it will reset all select and input rows
    if(reset)    
        $('.modal-body .inner-well, .reshow').show();
    
    for(var field in hideIdsByValueArray)
    {
        var inputId = modelName + capitalizeFirstLetter(toCamelCase(field));
        
        var currValue = $('#' + inputId).val();
        
        //sometimes the current value wont be filled out, in that case do nothing
        var hideIfLastTier = hideIdsByValueArray[field][currValue];
        if(typeof(hideIfLastTier) === 'undefined')
            hideIfLastTier = undefined;
        else
            hideIfLastTier = hideIdsByValueArray[field][currValue][0];
    
        if(hideIfLastTier !== null &&
                typeof(hideIfLastTier) !== 'undefined' &&
                typeof(hideIfLastTier) !== 'object')
        {
            idsToHide = hideIdsByValueArray[field][currValue];
            
            for(var indexToHide in idsToHide)
            {
                if(indexToHide !== 'remove')
                {
                    idToHide = idsToHide[indexToHide];
                    elementToHide = document.getElementById(idToHide);
                    $(elementToHide).hide();
                }
            }
        }
        else
        {
            hideIdsByValue(hideIdsByValueArray[field][currValue], modelName, false)
        }
    }
}

/*
 * provided a rules array, this on change event handler will limit dropdown
 * selections for 1 field based off another fields current input value. All
 * enumeration must be passed in for all fields in the rules array. They will
 * try to be taken from the view variables, but they still might require to be
 * passed in (example: if the fields dont appear in the schema.)
 * For an example rules array, see $this->__getFieldsFromValidFieldValues.
 * 
 * Can be called using custom javascript, but meant to be used by PanelHelper's addOnChangerules
 * function.
 * 
 * @author - Andrew Mueller
 */
function limitSelections(validFieldValues, modelName, enums)
{
    for(var field in validFieldValues)
    {    
        var inputId = modelName + capitalizeFirstLetter(toCamelCase(field));

        //all the values should be denoted by the field name with an 2 appended
        var allValues = enums[field];

        //find out if its the last tier
        var validValuesIfLastTier = validFieldValues[field][0];
        var isLastTier = false;
        if(validValuesIfLastTier !== null &&
                typeof(validValuesIfLastTier) !== 'undefined' &&
                typeof(validValuesIfLastTier) !== 'object')
            isLastTier = true;

        //get the valid values differently depending on whether its the last tier
        if(isLastTier)
            validValues = validFieldValues[field];
        else
            validValues = Object.keys(validFieldValues[field]);

        //before changing the dropdown options, get the value so 
        //that it can be preserved if valid after limiting
        var currValue = $('#' + inputId).val();

        //convert all values to integers for comparison purposes
        var validValuesConverted = validValues.map(function (x) { 
            return parseInt(x, 10); 
        });
        //set the value back after changing the dropdown selections, or 0
        //if it does not exist
        if($.inArray(parseInt(currValue, 10), validValuesConverted) < 0)
            currValue = validValues[0];

        //merge the valid values and all values so that valid values map to a string representation
        validValues = combine(validValues, allValues);
        
        //limit the dropdown selections for the next field
        changeOptions(validValues, inputId);
            
        //set the value back
        $('#'+inputId).val(currValue);
        
        //if this is the last dependent field in the branch, then stop the recursive calls\
        if(!isLastTier)
            limitSelections(validFieldValues[field][currValue], modelName, enums);
    }
}

/*
 * Used as a replacement for cakePHP's Inflector::camelize() function but instead
 * puts a string in camelBack form as opposed to CamelCase.
 * 
 * @author - Andrew Mueller
 */
function toCamelCase(s) {
    // remove all characters that should not be in a variable name
    // as well underscores an numbers from the beginning of the string
    s = s.replace(/([^a-zA-Z0-9_\- ])|^[_0-9]+/g, "");
    // uppercase letters preceeded by a hyphen or a space
    s = s.replace(/([ -_]+)([a-zA-Z0-9])/g, function(a,b,c) {
        return c.toUpperCase();
    });
    // uppercase letters following numbers
    s = s.replace(/([0-9]+)([a-zA-Z])/g, function(a,b,c) {
        return b + c.toUpperCase();
    });
    return s;
}

/*
 * used in conjunction with toCamelCase to change the string from 
 * camelBack form to CamelCase form.
 * 
 * @author - Andrew Mueller
 */
function capitalizeFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/*
 * takes a normal array of values such as [1, 4] and a map
 * such as Object{1:'One', 2:'Two', 3:'Three, 4:'Four'...} and 
 * returns the combined form of Object{1:'One', 4:'Four'}
 * 
 * ***WARNING: If the array has values that the map doesnt have keys for
 * then it may error***
 * 
 * @author - Andrew Mueller
 */
function combine(array1, map1)
{
    if(typeof(map1) === 'undefined')
    {
        return;
    }
    
    var newArray = {};

    for( var index in array1)
    {
        if('function' !== typeof(array1[index]))
        {
            var value = array1[index];
            newArray[value] = map1[value];
        }
    }
    
    return newArray;
}

/*
 * Takes the Id of a select element and a map of options such as
 * Object{1:'One', 4:'Four'} and creates option elements as children
 * for the select element with the given id where the key is the option value
 * and the value is the string representation of the option value.
 * 
 * @author - Andrew Mueller
 */
function changeOptions( options, id)
{
    var selectTag = document.getElementById(id);
    
    var value = selectTag.value;

    if(null !== selectTag)
    {
        selectTag.innerHTML = '';
        for( var item in options)
        {
            if('function' !== typeof(options[item]))
            {
                var option = document.createElement('option');
                option.innerHTML = options[item];
                option.value = item;
                if(item == value)
                	option.selected = 'selected';
                selectTag.appendChild(option);
            }
        }
    }
    
    //updates the chzn plugin elements to match the select element options
    $(selectTag).trigger("liszt:updated");
}


/**
 *  Runs when the page is loaded
 *  
 */
$(document).ready(function ()
{
    // jquery has touchstart enabled by default, but it messes up bs-dropdowns
    $("html, body").off("touchstart");

    // Initialize any widgets in the page
    _initWidgets( $(document) );
    
    // Catch blur (loss of focus) events on ajax-validated input elements,  We send the value(s) to the 
    // server for validation in this case.
    // By attaching to the body, we catch events even for elements that are inserted into the DOM (like
    // in a modal ajax form)
    $('body').on( 'blur', '.ajax-validate', function()
    {
        var fields = $(this).data('validate');
        var data = {};
        
        // Get all the fields that are supposed to be sent to the server
        $.each( fields.include, function( i, e)
        {
            if( 'undefined' == typeof( data[ e.model] )) data[ e.model ] = {};
            data[e.model][e.field] = $('#' + e.formFieldName).val();
        });
        
        // Send the request to the server
        $.ajax(
        {
            url: '/Utilities/validateField/' + fields.model + '/' + fields.field, 
            data: { fields: data },
            dataType: "json",
            type: "get",
            dataExpression: true,
            
            success: function( data ) 
            {
                // data is like this: {"message":["Please enter a number between 1 and 30"],"icon":"exclamation.png","style":"ajax_error","valid":false} 
                // Find the enclosing div
                var div = $('#div' + fields.formFieldName );
                
                div.removeClass( 'error' )
                
                // find the error message div
                var msgDiv = $('.help-block', div);
                msgDiv.html('');
       
                // see if we are supposed to show the message
                if( _showOnlyDecision( fields.show, data.valid ))
                { 
                    //create the warning icon and put it in front of the error message
                    var icon = document.createElement('i'); 
                    icon.setAttribute("class", data.icon); 
                    msgDiv.append(icon);
                 
                    msgDiv.append(' ' + data.message.join('<br>'));
                    //for ( var i = 0; i < res.message.length; ++i )
                    //{
                    //     div.appendChild(document.createTextNode(res.message[i]));
                    //     div.appendChild(document.createElement("br"));
                    //}
                    
                    div.addClass( data.style );
                    //div.setAttribute('class', res.style + " ajax_return"); 
                 
                    msgDiv.fadeIn(); 
                   
                    //now change class of the input element itself 
                    //if you do this you have to remove the class when the error is cleared...
                   // $('#'+localField).addClass(res.style); 
                } 
                else
                { 
                    msgDiv.fadeOut(); 
                } 
            }, 
            error: function( jqXHR, textStatus, errorThrown ) 
            {
            }
        });
 
    });

    // Register to handle links that have a class of dialog-link.  We want to open them in a dialog box instead
    // of redirecting the whole page there.
    //  This function catches clicks on any <a> elements with class 'dialog-link'.
    //  When such an object is clicked, its contents are loaded via ajax, using the href of the link.  
    //  Then, the dialog is opened. 
    $('body').on( 'click', 'a.dialog-link', function()
    {
        try
        {
            // cleanup, just in case a previous modal left a mess (it shouldn't)
            $('#dialog-link-overlay').remove();
            $('#dialog-link-wait-icon').remove();
            $('#ajax-dialog').remove();
            $('.modal-scrollable').remove();
       
            // create an overlay on the page to make the dialog modal
            var overlay = $("<div id='dialog-link-overlay' class='modal-backdrop fade in'></div>").appendTo( $("body") );
            
            // and a 'loading' icon centered on the page
            var icon = $("<div id='dialog-link-wait-icon' class='dialog-load-icon'></div>").appendTo( $("body") );
            icon.css("top", ($(window).height() - icon.height())/ 2 + $(window).scrollTop() + "px");
            icon.css("left", ($(window).width() - icon.width()) / 2 + $(window).scrollLeft() + "px");

            // And a DIV to hold the dialog (initially hidden)
            var dialog = $("<div id='ajax-dialog' class='black-box modal hide fade in'></div>").appendTo( $('body'));

            // Set up event handlers that fire when the modal is shown and hidden
            dialog.on('show', function () 
            {
                icon.remove();
            });

            dialog.on('shown', function () 
            {
                $('input:text:visible:first', this).focus();
            });
            
            dialog.on('hidden', function () 
            {
                $('#dialog-link-overlay').remove();
                $('#ajax-dialog').remove();
            });

            // asynchronous call to load the HTML into the dialog
            $.ajax(
            {
                url: $(this).attr('href'), 
                data: { dialog: 'ajax-dialog' },    // include this so the dialog can do things like close itself
                dataType: "html",
                type: "get",

               success: function( data ) 
               {
                   // we received something from the server. make the dialog visible (we have our own backdrop)
                  dialog.html(data);
                  
                  // Handle any jquery widgets that are in the HTML we just loaded
                  _initWidgets( dialog );

                  //initialize modal dialog centered and offset from the top by 1%
                  dialog.modal({ backdrop: false}).css('margin-top', 0).css('top', '1%');                  

                },
                error: function( jqXHR, textStatus, errorThrown ) 
                {
                    // An error occured when asking the server for content
                    if (jqXHR.status == 403)
                    {
                        // unauthorized status; usually this means the user's session has timed out.
                        // reloading the page should show the login dialog.  This could also happen
                        // if there is a bug where a dialog is configured to show an action that is
                        // forbidden for the current user.  
                        window.location.reload();
                    }

                    $('#dialog-link-overlay').remove();
                    $('#dialog-link-wait-icon').remove();
                    $('#ajax-dialog').remove();
                }
            });
        }
        catch( e )
        {
            // try to cleanup
            $('#dialog-link-overlay').remove();
            $('#dialog-link-wait-icon').remove();
            $('#ajax-dialog').remove();

            ShowError( "helper.js dialog-link error: " + e.message );
        }
        
        // prevent normal browser click handling
        return false;
    });
    
    // Register to handle links that post data to an action.  post-link buttons work in one
    // of the following ways, which is controlled by the data-link attribute:
    //     1) if a target element (id) is included, the result of the post action will update
    //        that element on the page.
    //     2) if the data attribute is included, the contents of that attribute will be posted,
    //        Otherwise, the nearest form will be serialized and used for the post data.
    //
    //  An overlay/AJAX wait icon is used, on the form or the button depending on the type of submission.
    $('body').on( 'click', 'a.post-link', function()
    {
        link = $(this).data('link');

        if( 'undefined' != typeof( link.confirm ))
        {
            // if user presses cancel, jump out early
            if( !confirm( link.confirm ))
                return false;
        }

        if( 'undefined' == typeof( link.data ))
        {
            var form = $(this).closest('form');

            // insert the name of the button that was pressed into the form so the server can see it
            $(form).find('input[name="data[button]"]').val( $(this).attr('name'));
            
            // trigger the submit action on the closest form element
            form.submit();
        }
        else
        {
            // data was included with the button, submit that
            var overlay = $("<div id='dialog-link-overlay' class='modal-backdrop fade in'></div>").appendTo( $(this) );
            
            $.ajax(
            {
                url: $(this).attr('href'), 
                data: {data: link.data },
                dataType: "json",
                type: "post",

                success: function( data ) 
                {
                   // we received something from the server. make the dialog visible (we have our own backdrop)
                  //dialog.html(data);
                  
                  // Handle any jquery widgets that are in the HTML we just loaded
                  //_initWidgets( dialog );

                  // Set the width of the dialog to match the content, and center it
                  //var width = $('.modal-body', dialog).width();
                  //dialog.modal({ backdrop: false }).css( 'width', width ).css('margin-left', -(width/2));
                },
                error: function( jqXHR, textStatus, errorThrown ) 
                {
                    if( jqXHR.status != 0 )
                        ShowError( jqXHR.status + ": " + errorThrown );
                    
                    // An error occured when asking the server for content
                    if (jqXHR.status == 403)
                    {
                        // unauthorized status; usually this means the user's session has timed out.
                        // reloading the page should show the login dialog.  This could also happen
                        // if there is a bug where a dialog is configured to show an action that is
                        // forbidden for the current user.  
                        window.location.reload();
                    }

                },
                complete: function()
                {
                    $('#dialog-link-overlay').remove();
                }
            });
        
        }
        
        // don't let normal click handling happen
        return false;
    });
    
    // Catch all form submissions (triggered by button, or 'enter' key, or via javascript.
    // If the form has a data-target attribute, the form is submitted via ajax, and the response
    // is inserted into the element identified by data-target.  Otherwise, a normal browser submit happens
    // the function returns TRUE if the browser submit should proceed; false if it should not
    $('body').on( 'submit', 'form', function(e) 
    {
        // black overlay for the form
        var $this = $(this);
        $("<div />", { 
            'class' : 'modal-backdrop fade in'
        }).appendTo( this );
        
        // wait icon
        $('<div />', {
            'class': 'form-submit-icon'
        }).appendTo(this)
        
        // hide the action bar on the form.  makes the form look like it jumps
        //$this.find('.form-actions').hide();

        // if the response is targeted, submit it via ajax; otherwise let the browser submit it
        if( 'undefined' != typeof( $this.attr('data-target')))
        {
            e.preventDefault();
    
            // submit the form
            $.ajax({
                type: $this.attr('method') || 'get',
                url: $this.attr('action') || window.location,
                data: $this.serialize(),
                success: function( data )
                {
                    var target = $this.attr('data-target');
                    if( "undefined" == typeof( target ))
                    {
                        // replace the whole document with this one
                        $('body').html(data);
                    }
                    else
                    {
                        $($this.attr('data-target')).html( data );
                    }
                    
                },
                error: function( jqXHR, textStatus, thrownError ) 
                {
                    if( jqXHR.status != 0 )
                        ShowError( jqXHR.status + ": " + thrownError );
                },
                complete: function(response) 
                {
                    $this.find('.form-submit-icon').remove();
                    $this.find('.modal-backdrop').remove();
                    //$this.find('.form-actions').show();
                }
            });
        }
    });

});



/**
 * Creates an object that displays a google map
 * 
 * Attempts to display a map according to the position given or the user's input.
 * 
 * @param string id  the DOM element into which the map should be injected
 * @param object options may contain 
 *      position (object) containing latitude, longitude, and altitude where the map should be
 *          initially centered.
 *      allow_edit (boolean) whether a movable pin will be displayed which lets the user
 *          identify a new position.
 * 
 */
function Map( id, options )
{
    // use defaults for options not specified
    this.options = $.extend({}, { allow_edit: false }, options );
    
    // save for later use
    this.options = options;
    this.divId = id;
    this.map = null;
    
    // if we were not able to load the API from Google, the google variable will be undefined
    if( typeof( google ) != "undefined" )
    {
        this.geocoder1 = new google.maps.Geocoder();// Finds Lat/Lon from given address
        this.geocoder2 = new google.maps.ElevationService(); //Finds address from given Lat/Lon */
        this.elevator = new google.maps.ElevationService();
        
        // If an initial position was passed in, use it.  Otherwise show the whole world
        if( typeof( this.options.position ) != "undefined")
        {
            this.latLon = new google.maps.LatLng( this.options.position.latitude, this.options.position.longitude );
            this.initialZoom = 16;
        }
        else
        {
            this.latLon = new google.maps.LatLng( 0,0 );
            this.initialZoom = 1;
        }
        
        // get the time to kick things off
        this.update();
        
    }
    

    
}


/**
 * Destructor 
 * 
 */
Map.prototype.destroy = function ()
{
    
};


/**
 * update 
 * 
 */
Map.prototype.update = function ()
{
    var connected = true;

 
    /*
    // Determines if Google Maps are accessible. If they are it loads the maps, else
    // it sets connected to false so that elements on the position page can be disabled.
    if(window.google && window.google.load)
    {
        google.load("maps","3.8", {other_params: "sensor=false"})
        connected = true;
    }
    else
    {
        connected = false;
    }
    */

    var marker;     // Marker for user changeble position
    
    var init = 0;   // counts if intialize function has already been called.
    var infoWindow; // info window to display when position is applied

    // If Google Maps are available intialize the map and other Google services
    if(connected)
    {
        this.updatePosition(this.latLon);
        
        var myOptions = 
        {
            center: this.latLon,
            zoom: this.initialZoom,
            noClear: false,
            mapTypeId: google.maps.MapTypeId.HYBRID,
            disableDefaultUI: false
        };
        
        this.map = new google.maps.Map(
                document.getElementById(this.divId), myOptions);

        infoWindow =  new google.maps.InfoWindow({
            maxWidth: 250
        });
        
        
        marker = new google.maps.Marker({
            map: this.map,
            position: this.latLon,
            draggable: (this.options.allow_edit)? true: false
        });

        /*recvMarker = new StyledMarker({
              styleIcon:new 
              StyledIcon(StyledIconTypes.MARKER,{color:"00ff00"}),
              position:latLon,map:map,animation: google.maps.Animation.DROP,title: "Current Position"
        });*/

        init++;

        google.maps.event.addListener( marker, 'drag', function()
        {
            this.updatePosition( marker.getPosition() );
        });

        google.maps.event.addListener( marker, 'dragend', function()
        {
            //getElevation(marker.getPosition());
            this.updatePosition(marker.getPosition() );
        });

        google.maps.event.addListener( this.map, 'click', function()
        {
            infoWindow.close();
        });
 
    }
    // Disables buttons and text entry if maps are not available
    else
    {
        $('#'+this.divId).html( "Maps Not Available Internet Connection Required" );
      }
};





////////////////////////////////////////////////////////////////////////////////
//Function Name: updatePosition()
//Description:   Updates the Latitude and Longitude text fields
//               Latitude and Longitude that was obtained from the Google 
//               Geocoder.
//
//               The Latitude and Longitude values are converted into Degree 
//               Minutes Seconds form.
////////////////////////////////////////////////////////////////////////////////
Map.prototype.updatePosition = function (latLon)
{  
    var laDeg;
    var loDeg;
    
    if (latLon.lat()>0)
    {
        laDeg=Math.floor(latLon.lat());
    }
    else
    {
        laDeg=Math.ceil(latLon.lat());
    }

    if (latLon.lng()>0)
    {
        loDeg=Math.floor(latLon.lng());
    }
    else
    {
        loDeg=Math.ceil(latLon.lng());
    }

    var laMin=Math.abs((latLon.lat()-laDeg)*60);
    var laSec=(laMin-(Math.floor(laMin)))*60;

    var loMin=Math.abs((latLon.lng()-loDeg)*60);
    var loSec=(loMin-(Math.floor(loMin)))*60;

    var lonStr = loDeg + "&deg" + " " + Math.floor(loMin) + "'" + " " + loSec.toPrecision(5) + "\"";
    var latStr = laDeg + "&deg" + " " + Math.floor(laMin) + "'" + " " + laSec.toPrecision(5) + "\"";

    //document.getElementById('Lon').innerHTML = lonStr;
    //document.getElementById('Lat').innerHTML = latStr;
    
    this.getElevation(latLon);

};

////////////////////////////////////////////////////////////////////////////////
//Function Name: findLatLon()
//Description:   Takes the user entered address and gets the latitude and 
//           longitude for that address. Calls updatePosition, and 
//           getElevation to display new location and elevation on web page
////////////////////////////////////////////////////////////////////////////////
Map.prototype.findLatLon = function ( address )
{
    if( this.map === null ) return;
    
    try
    {
        geocoder1.geocode( { 'address': address}, function(results, status) 
        {
            if (status == google.maps.GeocoderStatus.OK) 
            {
                this.map.setZoom(16);
                this.map.setCenter(results[0].geometry.location);
                this.marker.setPosition(results[0].geometry.location);
                this.updatePosition(marker.getPosition());
                this.getElevation(marker.getPosition());
            } 
            else 
            {
                alert("Geocode was not successful: " + status);
            }
        });
    }
    catch( e )
    {
        
    }
};


////////////////////////////////////////////////////////////////////////////////
// Function Name: getElevation()
// Description:   Takes in a latitude and longitude, and gets the elevation
//                 for that location from the Google Elevation service.
//             
//                 If an elevation modifier is specified in the spinner button
//                 next to the altitude on the web page then it is added in to
//                 the elevation.
////////////////////////////////////////////////////////////////////////////////   
Map.prototype.getElevation = function (latLon)
{
    if( this.map === null ) return;
   
    var location = [];
    location.push(latLon);

    var elevationRequest = { 'locations':location };

    this.elevator.getElevationForLocations(elevationRequest, function(results,status) 
    {
        if (status == google.maps.ElevationStatus.OK) 
        {
            // retrieve first result
            if (results[0])
            {
                //var eleMod = document.getElementById('spin').value;
                ele = results[0].elevation;
          //      document.getElementById('altitude').innerHTML = 
           //               (parseFloat(ele)).toFixed(3) + "m"; //(eleMod * 3)).toFixed(3) + "m";
            }
            else
            {
                alert("No Elevation Found");
            }
        }
        else
        {
            alert("Elevation service failed: " + status);
        }
    });
 };

 
 /**
  * Submits a request to the REST API and handles the response
  * 
  * Options are similar to those passed to jquery $.ajax:
  *     url: the link to the REST action
  *     type: POST/GET/DELETE
  *     data: the data to be sent with the request
  *     success: a function(response) definition to be executed when the request is successful
  *     error: a function definition to be executed when the request fails
  *     complete: a function that is executed after either success or error
  *     dataType: 'json', 'jsonp', 'xml'
  * 
  * @param object options as described above
  *
  * @returns null
  */
function restRequest( options )
{
    // define defaults and use the options variable to override them selectively
    var settings = 
    { 
        url: '', 
        type: 'post', 
        data: {}, 
        success: function(data) {}, 
        error: function( jqXHR, textStatus, errorThrown )
        {
            Notifications.push( { text: errorThrown + ': ' + textStatus, autoDismiss: 30 });
        },
        dataType: 'json'
    };
 
    $.extend( settings, options );
    
    if( 'undefined' != typeof( settings.confirm ))
    {
        // if user presses cancel, jump out early
        if( !confirm( settings.confirm ))
            return false;
    }

    $.ajax( settings );
    
    return true;
}

