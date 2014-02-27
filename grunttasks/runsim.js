'use strict';

var _ = require('underscore');
var DEBUG = false;

module.exports = function(grunt) {
    

    /*
    * Run simulation
    */ 
    grunt.registerMultiTask('runsim', 'Runs simulation', function() {
        
        var numPrisoners = 23;
        
        // cheap & dirty enum constants
        var UP = 0;
        var DOWN = 1;
        
        function SwitchesFunc() {
            var switch_1 = Math.floor((Math.random()*2));
            var switch_2 = Math.floor((Math.random()*2));
            
            return {
                switch1Position: function() {
                    return switch_1;
                },
                flipSwitch1Up: function() {
                    switch_1 = UP;
                },
                flipSwitch1Down: function() {
                    switch_1 = DOWN;
                },
                toggleSwitch2: function() {
                    // just flip the switch...
                    if (switch_2 == UP) {
                        switch_2 = DOWN;
                    }
                    else {
                        switch_2 = UP;
                    }
                }
            }
        }
        var switches=SwitchesFunc();
        
        var done=false;
        
        
        function ReaderFunc( ) {
    
            var tripcount = 0
            var flipcount=1; // remember to count yourself :)
            var iFlippedUpLastTime=false;
    
            return {
                visit: function() {
                    DEBUG && console.log(" + I'm the reader and this visit number: " + tripcount)

                    tripcount++;
                    
                    // sanity check
                    if (iFlippedUpLastTime && switches.switch1Position() == DOWN) {
                        throw new Error("Someone can't remember their instructions");
                    }
                    
                    if (tripcount == 1) {
                        DEBUG && console.log(" + First trip in, flipping switch DOWN")
                        switches.flipSwitch1Down();
                        iFlippedUpLastTime=false;
                    }
                    else if (switches.switch1Position() == DOWN) {
                        DEBUG && console.log(" + Never saw the switch move down to up, flipping switch UP")
                        switches.flipSwitch1Up();
                        iFlippedUpLastTime=true;
                    }
                    else if (switches.switch1Position() == UP) {
                        if (iFlippedUpLastTime) {
                            DEBUG && console.log(" + Switch is up but I flipped it myself," +
                                " flipping switch DOWN");
                        }
                        else {
                            DEBUG && console.log(" + I saw the switch move down to up (and it wasn't me)," +
                                " flipping switch DOWN");
                                flipcount++;
                                console.log("reader count: " + flipcount + " of " + numPrisoners);
                            }
                            switches.flipSwitch1Down();
                            iFlippedUpLastTime=false;
                        }
                        if (flipcount == numPrisoners) {
                            done=true;
                        }
                },
                tripcount: function() {
                    return tripcount;
                },
            }
        }

        function DroneFunc( ) {
    
            var iFlippedSwitchOnce=false;
            var tripcount = 0
            var sawSwitch1Move=false;
            
            // this is always qualified by tripcount before we check it
            var lastSwitch1Position;
    
            return {
                visit: function() {
                    DEBUG && console.log(" + I'm a drone")

                    tripcount++;
                    
                    if (iFlippedSwitchOnce) {
                        DEBUG && console.log(" + I flipped the switch once, toggled switch 2")
                        switches.toggleSwitch2();
                    }
                    else {
                        if (tripcount == 1) {
                            lastSwitch1Position = switches.switch1Position();
                            DEBUG && console.log(" + First trip, toggled switch 2")
                        }
                        else if (!sawSwitch1Move) {
                            DEBUG && console.log(" + Haven't seen switch 1 move yet")
                            if (lastSwitch1Position != switches.switch1Position()) {
                                DEBUG && console.log(" + Oh, wait, yes I did")
                                sawSwitch1Move = true;
                            }
                        }
                        
                        if (sawSwitch1Move) {
                            // at this point, we've seen the switch move, but we've never flipped it ourselves
                            if (switches.switch1Position() == DOWN) {
                                DEBUG && console.log(" + switch 1 was down, flipping UP");
                                switches.flipSwitch1Up();
                                iFlippedSwitchOnce=true;
                            }
                            else {
                                DEBUG && console.log(" + switch  1 was up, toggling switch 2");
                                switches.toggleSwitch2()
                            }
                            
                        }
                    }

                },
                tripcount: function() {
                    return tripcount;
                },
            }
        }
        
        try {
            console.log("Starting...");
            var prisoner = new Array();
        
            prisoner[0] = ReaderFunc();
            for (var i=1; i<numPrisoners; i++) {
                prisoner[i] = DroneFunc();
            }

            while (!done) {
                var i=Math.floor((Math.random()*numPrisoners));
                DEBUG && console.log("Prisoner " + i + " is about to take a visit");
                prisoner[i].visit();
            }
            
            console.log("Let's see how we did...");
            var zeroCount=0;
            var totalCount=0;
            for (var i=0; i<numPrisoners; i++) {
                console.log("Prisoner " + i + ": " + prisoner[i].tripcount())
                if (prisoner[i].tripcount() == 0) {
                    zeroCount++;
                }
                totalCount += prisoner[i].tripcount();
            }
            console.log( totalCount + " total trips");
            if (zeroCount > 0) {
                console.log( zeroCount + " prisoners never visited, send in the alligators!");
            }
            else {
                console.log("Everyone visited, release the prisoners!");
            }
        }
        catch( err ) {
            console.log("Someone screwed up: Send in the alligators: " + err )
        }
                    
    });
   
};


