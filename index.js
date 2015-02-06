/**
 * Entry point for CS Diagnostics
 * 
 * This module handles command line arguments and initiates the requested actions.
 * It is script friendly; especially with the -q option to supress info messages.
 * The -v option can be used for more detailed status information
 * 
 * Usage:
 *  node index.js --h for help
 *  
 */

// Application exit codes
const EXIT_FAILURE = 1;
const EXIT_SUCCESS = 0;

const WEBSERVER_PORT = 3000;

// Read the default configuration (which may be overridden with command line options)
var config = require('./config.json');

// Declare the serial port interface
var portManager = require('cs-controller');

// Retrieve the command line arguments and store them in an object:
// example: -x 3 -y 4 -n5 -abc --beep=boop foo bar baz
// yields: { _: [ 'foo', 'bar', 'baz' ], x: 3, y: 4, n: 5, a: true,
//			b: true, c: true, beep: 'boop' } 
var argv = require( 'minimist' )( process.argv.slice( 2 ) );

// Check verbose and quiet options
if( 'v' in argv ) config.verbose = true;
if( 'q' in argv ) config.quiet = true;
console.log(argv);
// Check for the help option and if requested, display help
if( ('h' in argv) || ('help' in argv) )
{
    console.info( 
        '\nController Diagnostics\n\n',
          
        // Help
        'list         : List available ports\n',
          
        // Firmware management 
        'update file  : Update firmware using specified file\n',

        // EEPROM configuration management
        'config file  : Update EEPROM configuration using specified file\n',
          
        // Application control
        '-p port1[,port2...]    : List of serial port to use\n',
        '-q                     : Quiet output (helpful for scripting)\n',
        '-v                     : Verbose output (helpful for debugging)\n',
        '-w                     : Start web server\n',
        '-wc                    : Start web server and launch browser client\n',
        '-h                     : Print help and exit\n',
        '\n'
         );
    
    process.exit( EXIT_SUCCESS );
}
else if( 0 === argv._.indexOf( 'list') )
{
    // list ports option: display them
    portManager.list( function( err, ports )
        {
            if( err ) {
                console.error('err ' + err);
                return EXIT_FAILURE;
            }
            else {
                console.info( '\nAvailable Serial Ports:' );
                ports.forEach( function(port)
                {
                    console.info( port.comName, '\t',
                        port.pnpId, '\t',
                        port.manufacturer
                    );
                } );
                return EXIT_SUCCESS;
            };
        } );
}
else
{
    // help options were not specified; we need to actually open a port and
    // start communicating
    
    // If the user specified the port to use....
    var portName = '';
    
    if( 'p' in argv )
    {
        portName = argv.p;
    }

    if( typeof( portName ) == 'string' && portName > '')
    {
        if( verbose ) console.info( 'Opening ' + portName );
        
        // Attempt to open the serial port
        var thePort = new serialPort.SerialPort( portName, 
            {
                baudrate: 57600
            }, 
            false);
    
          thePort.open(function (error) 
              {
              if ( error ) 
              {
                  console.error( '' + error );
 //                 process.exit( EXIT_FAILURE );
              } 
              else 
              {
                  console.log('open');
                  serialPort.on('data', function(data) 
                  {
                      console.log('data received: ' + data);
                  });
              
                  serialPort.write("ls\n", function(err, results) 
                  {
                      console.log('err ' + err);
                      console.log('results ' + results);
                  });
              };
          });
    }
    else
    {
        console.error( 'Invalid Serial Port');
        process.exit( EXIT_FAILURE );

    }
    
    // Start the web server if requested
    if( 'w' in argv || 'wc' in argv )
    {
        var app = require('./frontend/app');

        app.set('port', WEBSERVER_PORT );

        var server = app.listen(app.get('port'), function() 
        {
            if( verbose )
                console.info('Server listening on port ' + server.address().port);

            if( 'wc' in argv )
            {
                var open = require('open');
                open('http://localhost:' + WEBSERVER_PORT );
            }
        
        });
    }
    
}
