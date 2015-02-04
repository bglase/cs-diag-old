/**
 * View helpers to generate snippets to insert into pages 
 */

/**
 * A shallow object extender function
 */
var extend = require('util')._extend;


/**
 * Insert a div configured as a modal dialog.
 *
 * activate the dialog using the $('#id').modal() call, or by clicking a link of class
 * 'dialog-static' which causes helper.js to open and center the dialog box.
 *
 * The content should be generated using something like the dialogStart, dialogEnd helper functions
 *
 * @param string id      DOM id for the dialog box
 * @param string content content for the dialog box
 *
 * @return null
 */
framework.helpers.modal = function(id, content)
{
    return '<div class="black-box modal hide fade in" id="' + id + '">' + content + '<div>';
};


/**
 * Inserts the starting tag for a bootstrap grid row
 *
 * @return string
 */
framework.helpers.rowStart = function()
{
    return '<div class="row-fluid">';
};

/**
 * Closes what rowStart began
 *
 * @return string
 */
framework.helpers.rowEnd = function()
{
    return '</div>';
};

/**
 * Builds an HTML anchor tag
 *
 * @param mixed  name    name of the icon; see Bootstrap docs
 * @param string color   the color of the icon (black or white)
 *
 * @access public
 * @return void
 */
framework.helpers.link = function( content, link, options, confirm )
{
    options = options || {};
    options = extend( {}, options);
    
    confirm = confirm || false;
    //@todo options and confirm
    return '<a href="' + link + '">' + content + '</a>';
};

/**
 * Takes the name of an icon and returns the i tag with the appropriately
 * named class. The second param will switch between black and white
 * icon sets.
 *
 * @param mixed  name    name of the icon; see Bootstrap docs
 * @param string color   the color of the icon (black or white)
 *
 * @access public
 * @return void
 */
framework.helpers.icon = function( name, color )
{
    var c = 'icon-' + name;
    
    color = color || 'black';
    if (color === 'white')
    {
        c = c + ' icon-white';
    }
    
    return '<i class="' + c + '"></i>';
};


/**
 * Builds a dropdown menu for inclusion in a box
 *
 * Include an array of strings containing <a> tags or blank string ('') for a divider
 *
 * Options:
 *     icon: the icon for the menu (see icon helper)
 *
 * @param array links   an array of strings containing <a> elements
 * @param array options options for the menu
 *
 * @return string HTML element
 */
framework.helpers.boxDropdownMenu = function( links, options )
{
    options = options || {};
    options = extend( {icon: 'cog'}, options);

    var list = '';

    links.forEach(function(entry) 
    {
        if( entry == '') list = list + '<li class="divider"></li>';
        else list = list + '<li>' + entry + '</li>';
    });

    var icon = '<a class="dropdown-toggle" data-toggle="dropdown">' + framework.helpers.icon( $options['icon'] ) + '</a>';

    return '<span class="pull-right"><span class="options"><div class="btn-group">' + icon
            + '<ul class="dropdown-menu black-box-dropdown dropdown-left">' + list + '</ul></div></span></span>';
};

/**
 * Builds a toolbar icon menu for inclusion in a box helper
 *
 * Include an array of buttons, each array element containing a button definition object:
 *     'icon' -> see icon helper
 *     'link' -> an <a> tag
 *     'confirm' -> string text to display in a confirmation box
 *
 * Options:
 *
 * @param array buttons an array of strings containing <a> elements
 *
 * @return string HTML element
 */
framework.helpers.boxToolbar = function( buttons )
{
    var icons = '';

    buttons.forEach( function( entry )
    {
        // initialize options and confirm in case the caller didn't
        entry = extend( {options:{}, confirm:false }, entry);
        entry.options = extend( entry.options, {escape:false} );

        icons = icons + framework.helpers.link(
            framework.helpers.icon( entry.icon ),
            entry.link,
            entry.options,
            entry.confirm );
    });

    return '<span class="pull-right"><span class="options"><div class="btn-group">' + icons + '</div></span></span>';
};

/**
 * Returns a content box, with title and optional icon
 *
 * You should put this box inside a 'row-fluid' or 'row' div according to bootstrap conventions
 *
 * Options:
 *     'title' = the text for the title bar
 *     'icon' = the icon to put to the left of the title (see $this->icon)
 *     'menu' = dropdown menu in the title bar (from output of $this->boxDropdownMenu or $this->boxToolbar)
 *     'span' => the number of grids spanned by the box (1-12, default is 12)
 *     'type' => 'box' or 'black-box' or 'tabbable black-box' or 'tabbable-box'
 *
 * @param string content HTML to put in the box
 * @param array  options see descriptions
 *
 * @return string HTML element
 */
framework.helpers.box = function( content, options )
{ 
    // Set defaults
    options = options || {};
    options = extend( {title: '', icon: '', span: 12, type: 'black-box tex', menu: ''}, options); 

    var icon = (options.icon > '') ? framework.helpers.icon( options.icon ) + ' ' : '';

    var header = '<div class="tab-header">' + icon + options.title + options.menu + '</div>';
    
    return '<div class="span' + options.span + ' ' + options.type + '">' + header 
        + '<div class="row-fluid">' + content + '</div>';
};
