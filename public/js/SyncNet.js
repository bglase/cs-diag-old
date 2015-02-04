/**
 * Application for Network Time Protocol Query display
 * 
 * This file implements a web application that builds an interactive directed
 * graph representing an NTP network. Requires JQuery/UI
 * 
 * @copyright (C) Copyright 2012 Orolia USA Inc, All Rights Reserved
 * @link http://www.orolia.com
 * @package
 */

var labelType, useGradients, nativeTextSupport, animate;

// Declare an array to hold all the network node data
// Start with ourselves and build from there
var nodeData = 
[  
    {  
        "id": "127.0.0.1",
        'name': 'localhost',
        'data' : 
        {
            lastUpdate: new Date()
        },
        'adjacencies': []
    }
    
];


// Declare a queue to keep track of open ajax requests
var ajaxRequestStack = [];
var ajaxRequestLimit = 20;

var  graph;

/**
 * Anonymous function that figures out what sort of canvas support should be used
 * 
 * @param
 * @param
 * @return
 */
(function() 
{
  var ua = navigator.userAgent,
      iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
      textSupport = nativeCanvasSupport 
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
  // I'm setting this based on the fact that ExCanvas provides text support
    // for IE
  // and that as of today iPhone/iPad current text support is lame
  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
  nativeTextSupport = labelType == 'Native';
  useGradients = nativeCanvasSupport;
  animate = !(iStuff || !nativeCanvasSupport);
})();


/**
 * An element that is used to display a status message to the user
 */
var Log = 
{
  elem: false,
  write: function(text)
  {
    if (!this.elem) 
      this.elem = document.getElementById('log');
    this.elem.innerHTML = text;
    this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
  }
};


/**
 * Adds a new data node to the graph.
 * 
 * If the node already exists, it is replaced with the new one.  A timestamp is recorded, so we know
 * when this node was updated.
 * 
 * @param data
 */
function NewNode( data )
{
    // If the node is already in the list, remove it
    $.each( nodeData, function(index, value)
    {
        if( value.id == data.id )
        {
            nodeData.splice( index, 1 );
            return false
        }
        return true;
     });

     data.data.lastUpdate = new Date();
    
     // Add the new node to the list
     nodeData.push( data );
     
     // For each adjacency, if the node is already in
     // the list, don't do anything (it will be polled normally)
     // Otherwise add it to the list
     $.each( data.adjacencies, function(adjindex, adjvalue )
     {
         var nodesFound = $.grep( nodeData, function(element, nodeindex)
         {
             return ( element.id == adjvalue.nodeTo );
         });

         if( 0 == nodesFound.length )
         {
             nodeData.push(
             {  
                 "id": adjvalue.nodeTo,
                 'name': adjvalue.nodeTo,
                 'data' : adjvalue.data,
                 'adjacencies': []
             });
         }
     });
}



/**
 * Initialization, called on document load. Sets up the page and kicks off
 * the updating.
 * 
 * @param
 * @return
 */
function Init()
{
    var infovis = document.getElementById('infovis');
    var w = infovis.offsetWidth - 50, h = infovis.offsetHeight - 50;
    
    // Create the Infovis graph object
    graph = new $jit.Hypertree(
 //           graph = new $jit.ST(
    {
        'injectInto': 'infovis',
        width: w,
        height: h,
        
        //Create a background canvas for painting concentric circles.
        'background': 
        {
            'CanvasStyles': 
            {
                'strokeStyle': '#555',
                'shadowBlur': 50,
                'shadowColor': '#ccc'
            }
        },
        
        // Animation defaults:
        duration: 1000,  
        fps: 30,  
        transition: $jit.Trans.Quart.easeInOut,  
        
        // Navigation (zoom/pan operations)
        Navigation: 
        {  
            enable: true,  
            panning: 'avoid nodes',  
            zooming: 20  
        },
        
        // Tooltip settings
        Tips: 
        {  
            enable: true,  
            type: 'HTML',  
            offsetX: 10,  
            offsetY: 10,  
            onShow: function(tip, node) 
            {  
              tip.innerHTML = node.name;  
            } 
        },
        
        // Set default Node attributes.
        Node: 
        {
            color: '#404040',
            overridable:true,
            type: 'circle',
            dim: 20
        },

        // Set default Edge (line) attributes.
        Edge: 
        {
            overridable:true,
            color: '#404040',
            lineWidth:1.5
        },
        
        // Set default Label attributes.  Most styling via CSS node class
        Label: 
        {  
            type: 'HTML',  
            size: 11,  
            color: '#ccc' 
        },

        // Method called before a node is plotted
        onBeforePlotNode: function( node )
        {
            // Color of the node is green if it is on and synced to something
            var stratum = node.data.stratum;
            if( 16 == stratum )
                node.setData('color', '#F00');
            else if( "" == stratum )
                node.setData('color', '#555');
            else
                node.setData('color', '#0F0');
            
            // if it is the local host, make it a star
            if( '127.0.0.1' == node.id )
                node.setData('type', 'star');

        },
        
        //This method is called right before plotting an
        //edge. This method is useful for adding individual
        //styles to edges.
        onBeforePlotLine: function(adj)
        {
            adj.data.$lineWidth = 1;
            adj.data.$type = 'line';
            switch( adj.data.status )
            {
                case 'selected':
                    adj.data.$lineWidth = 3;
                    adj.data.$color = '#0F0'; 
                    adj.data.$type = 'arrow'; 
                    break;
                    
                case 'valid':
                    adj.data.$color = '#00F'; 
                    break;
                    
                case 'invalid':
                    adj.data.$color = '#F00'; 
                    break;
                    
                case 'unknown':
                default:
                    adj.data.$color = '#555'; 
                    break;
            }
            //Set random lineWidth for edges.
            if (!adj.data.$lineWidth) 
                adj.data.$lineWidth = Math.random() * 7 + 1;
        },
 
        // Called when a node is selected. Display details pane
        onBeforeCompute: function(node)
        {
            Log.write("centering " + node.name + "...");
            //Add the details view
            UpdateClockStatus( node );
            UpdatePeersStatus( node );
           // $jit.id('node-details').innerHTML = BuildDetailsElement( node );
        },
        
        // Add the node's name into the label
        // Called once when label is created
        onCreateLabel: function( domElement, node )
        {
            domElement.innerHTML = node.name;
            // Center the graph on a node when its label is clicked
            domElement.onclick = function()
            {  
                graph.onClick(node.id, { onComplete: function() { Log.write("centering done"); } } );
            };  
        },

        // Change the node's style based on its position.
        // This method is called each time a label is rendered/positioned
        // during an animation.  As a node gets 
        // further away, the text gets smaller and darker
        onPlaceLabel: function(domElement, node)
        {
            var style = domElement.style;
            style.display = '';
            style.cursor = 'pointer';
            style.color = "#808080"
            if (node._depth <= 1) 
            {
                style.fontSize = "0.8em";
             } 
            else if(node._depth == 2)
            {
                style.fontSize = "0.7em";
            } 
            else if(node._depth == 3)
            {
                style.fontSize = "0.6em";
            }
            else 
            {
                style.display = 'none';
            }

            var left = parseInt(style.left);
            var w = domElement.offsetWidth;
            style.left = (left - w / 2) + 'px';
        }
    });
	
    // load initial data.
    graph.loadJSON( nodeData );

    //compute node positions and layout  
//    graph.compute();  
    //optional: make a translation of the tree  
//    graph.geom.translate(new $jit.Complex(-200, 0), "current");  
    //emulate a click on the root node.  
//    graph.onClick(graph.root);    

    // end

//    setInterval( RefreshNodeData, 120000 );
    // just build a couple of levels
    setTimeout( RefreshNodeData, 10000 );
    setTimeout( RefreshNodeData, 30000 );
    RefreshNodeData();


}


function RefreshNodeData( )
{
    for(var  i = 0; i< Math.min(20, nodeData.length); i++)
    {
        var request = $.ajax(
        {
            url: '/SyncNet/ntpnode?host=' + nodeData[i].id,
            dataType: 'json',
            cache: false,
            success: function( data, textStatus, jqXHR )
            {
                NewNode( data );
                graph.op.morph(nodeData, {
               // graph.op.sum(data, {  
                type: 'fade:con',  
                duration: 1500  
              });  
            
            },
            error: function( jqXHR, textStatus, errorThrown)
            {
              //  alert( textStatus );
            }
            ,complete: function(jqXHR, textStatus)
            {
                
            }
        });
    }
}


/**
 * Builds HTML content with details for the selected node
 * 
 * @param node: the node object that has been selected
 * @return: string containing valid HTML
 */
function BuildDetailsElement( node )
{
    //This is done by collecting the information (stored in the data property) 
    //for all the nodes adjacent to the centered node.
 
    var html = "<h4>" + node.name + "</h4>"

    // Include the key status attributes for the selected node
    html += "<div class='accordion'>"
    html += "<h3><a href='#'>Status</a></h3>"
    html += "<div><ul>";

    html += "<li>" + node.id + "</li>";
    html += "<li>" + node.data.stratum + "</li>";
    html += "<li>" + node.data.rootdelay + "</li>";
    
    html += "</ul></div>";

    // list the peers
    html += "<h3><a href='#'>Connections</a></h3>"
    html += "<div><ul>";

    node.eachAdjacency(function(adj)
    {
        var child = adj.nodeTo;
        if (child.data) 
        {
            html += "<li>" + child.name + "</div></li>";
        }
    });
    html += "</ul></div>";

    html += "</div>";  // end the accordion
    return html;
}

/*
function RefreshNodeData( )
{
    while( ajaxRequestStack.length < ajaxRequestLimit 
            && (next = ))
    {
        
        ajaxRequestStack.push(
            $.ajax({
                url: '/Ntpq/node?host=' + host,
                dataType: 'json',
                cache: false,
                success: function( data, textStatus, jqXHR )
                {
                    NewNode( data );
                },
                complete: function(jqXHR, textStatus)
                {
                    
                }
              });
            );
    }
var ajaxRequestStack = [];
var ajaxRequestLimit = 20;

}
*/




