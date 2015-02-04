/**
 * Javascript code supporting app/View/Helper/WidgetHelper.php
 * 
 * Sets up jqueryUI initialization, etc for objects created by WidgetHelper
 * 
 * @package webroot
 * @subpackage js
 * @access public
 * @author Glase
 * @internal
 * 
 * @copyright (C) Copyright 2013 Spectracom Corporation, All Rights Reserved
 */

/**
 * Initialization at page load
 * 
 * Initializes the jquery ui widgets
 */
$(function() 
{
        
    //$( ".widget-accordion.init" ).accordion();

    //$( ".widget-button.init" ).button();
    $( ".widget-buttonset.init" ).buttonset();
    $( ".widget-tabs.init" ).tabs();
        
    $( ".widget-slider.init" ).slider();
    $( ".widget-progressbar.init" ).progressbar();

    // Hover states on the static widgets
    $( ".widget-icon" ).hover( function() 
    {
        $( this ).addClass( "ui-state-hover" );
    },
    function() 
    {
        $( this ).removeClass( "ui-state-hover" );
    });
    
});
