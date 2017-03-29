	options = {

    particlesNumber: 600,
    initialSize: 3,
    randomSize: true,
    minimumSize:1,
    maximumSize:3,
    moveLimit: 50,
    durationMin: 50,
    durationMax: 300,
    
    // particles color
    red:255,
    green:100,
    blue:255,
    opacity:1,
    randomOpacity: false,
    particleMinimumOpacity:1,
    particleMaximumOpacity:3,
    
    // connections between particles
    drawConnections: false,
    connectionRed:255,
    connectionGreen:255,
    connectionBlue:255,
    connectionOpacity:0.1,
    
    // mouse connections
    mouseGravity:true,
    drawMouseConnections:true,
    mouseInteractionDistance:50,
    mouseConnectionRed:255,
    mouseConnectionGreen:255,
    mouseConnectionBlue:255,
    mouseConnectionOpacity:0.1,
    
    requestFPS: false,
	
	// Use object with property names, to easy identify values in color picker

	backgroundColors: {

    "color1": {positionX:2,positionY:60,color:"9c1f8f"},
    "color2": {positionX:98,positionY:70,color:"000c91"},
    "color3": {positionX:50,positionY:50,color:"ed68ed"},

	}
    
}



function generateParticles(options, id) {


// ----------------------------------------------------
// Handle different instances and global window.particleEngine //
//-----------------------------------------------------
if (typeof window.particleEngine === "undefined") { 

    window.particleEngine = {};
    
} else if (typeof window.particleEngine["animation"+id] !== "undefined") {

    window.cancelAnimationFrame(window.particleEngine["animation"+id]);

}

var requestAnimationFrame = window.requestAnimationFrame || function(callback) {
    window.setTimeout(callback, 1000 / 60);

    };


// ----------------------------------------------------
// Generate canvas element //
//-----------------------------------------------------

var container = document.getElementById(id);
if (container === null) return console.error("Container is Null");


var canvas = document.createElement("canvas");
    canvas.id = "particles_" + id;

container.innerHTML = "";
container.appendChild(canvas);

var ctx = canvas.getContext("2d");

// ----------------------------------------------------
// Define local variables //
//-----------------------------------------------------

var maximumPossibleDistance;
var centerX;
var centerY;
var mousePositionX;
var mousePositionY;
var mouseElement;
var isRunning;

var lines = 0;
var objects = [];

var options = options;



// ----------------------------------------------------
// Init function //
//-----------------------------------------------------
var initAnimation = function(){

    
    canvas.width = container.clientWidth ;
    canvas.height = container.clientHeight ;
    
    maximumPossibleDistance = Math.round(Math.sqrt((canvas.width * canvas.width) + (canvas.height * canvas.height)));  
    
    centerX = Math.floor( canvas.width / 2 );
    centerY = Math.floor( canvas.height / 2 );
    
    objects.length = 0;
    clearCanvas();
    createParticles();

};

window.addEventListener("resize", function(){initAnimation();},false);

// ----------------------------------------------------
// Helper functions //
//-----------------------------------------------------

var getRandomBetween = function(a, b) {
   
    return Math.floor(Math.random() * ( b - a + 1)) + a;

};


var getRandomDecimalBetween = function(a, b) {
   
    var b = b*100;
    var a = a*100;
    
    var randomNumber = getRandomBetween(a, b);
    var finalNumber = randomNumber/100;
    
    return finalNumber;

};



var hitTest = function(object1, object2) {


    if ((object1.positionX < object2.positionX + object2.size) && (object1.positionX + object2.size > object2.positionX) &&
        (object1.positionY < object2.positionY + object2.size) && (object1.positionY > object2.positionY)) {

        return true;


    } else {

        return false;

    }


};

// Get distance between particles by using Pythagorean theorem

var getDistance = function(element1, element2) {


    var difX = Math.round(Math.abs(element1.positionX - element2.positionX));
    var difY = Math.round(Math.abs(element1.positionY - element2.positionY));

    return Math.round(Math.sqrt((difX * difX) + (difY * difY)));


};



// ----------------------------------------------------
// Particle constructor function //
//-----------------------------------------------------
function Particle(positionX, positionY, size, red, green, blue, opacity) {

    this.positionX = positionX;
    this.positionY = positionY;
    this.size = size;

    this.duration = getRandomBetween(options.durationMin, options.durationMax);
    this.limit = options.moveLimit;
    this.timer = 0;

    this.red = red;
    this.green = green;
    this.blue = blue;
    this.opacity = opacity;
    this.initialOpacity = opacity;
    this.sparklingDelay = getRandomBetween(1, 120);


    this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + ",+" + this.opacity + ")";

}

// ----------------------------------------------------
// Mouse Particle constructor function //
//-----------------------------------------------------
function MouseParticle(positionX, positionY, size, red, green, blue, opacity) {

    this.positionX = mousePositionX;
    this.positionY = mousePositionY;
    this.size = size;

    this.red = red;
    this.green = green;
    this.blue = blue;
    this.opacity = opacity;


    this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + ",+" + this.opacity + ")";

}




Particle.prototype.animateTo = function(newX, newY) {

    var duration = this.duration;

    var animatePosition = function(newPosition, currentPosition) {

        if (newPosition > currentPosition) {

            var step = (newPosition - currentPosition) / duration;
            newPosition = currentPosition + step;

        } else {

            var step = (currentPosition - newPosition) / duration;
            newPosition = currentPosition - step;

        }

        return newPosition;

    };

    this.positionX = animatePosition(newX, this.positionX);
    this.positionY = animatePosition(newY, this.positionY);



    // generate new vector

    if (this.timer == this.duration) {

        this.calculateVector();
        this.timer = 0;

    } else {

        this.timer++;

    }


};

Particle.prototype.updateColor = function() {

    this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + ",+" + this.opacity + ")";

};




Particle.prototype.calculateVector = function() {


    var distance;
    var newPosition = {};
    var particle = this;

    var getCoordinates = function() {


        newPosition.positionX = getRandomBetween(0, canvas.width);
        newPosition.positionY = getRandomBetween(0, canvas.height);

        distance = getDistance(particle, newPosition);

    };

    while ((typeof distance === "undefined") || (distance > this.limit)) {

        getCoordinates();

    }


    this.vectorX = newPosition.positionX;
    this.vectorY = newPosition.positionY;


};


Particle.prototype.sparkling = function() {


    var particle = this;
    
    if (particle.sparklingDelay > 0) {
     
        return particle.sparklingDelay--;
  
    }
   
    
    if (particle.opacity > (particle.initialOpacity + 0.3) ) {
        
        particle.sparklingMode = "down";
      
        
    } else if (particle.opacity < (particle.initialOpacity - 0.3)) {
    
        particle.sparklingMode = "up";
       

    }
    
    if (particle.sparklingMode === "down") {
    
        particle.opacity = particle.opacity - 0.01;
    
     
    } else {
    
    
         particle.opacity = particle.opacity + 0.01;
    
    }
    
    particle.updateColor();
    
    
};


Particle.prototype.testInteraction = function() {

    if (!options.drawConnections) return;
    
    var closestElement;
    var distanceToClosestElement = maximumPossibleDistance;

    for (var x = 0; x < objects.length; x++) {

        var testedObject = objects[x];
        var distance = getDistance(this, testedObject);


        if ((distance < distanceToClosestElement) && (testedObject !== this)) {

            distanceToClosestElement = distance;
            closestElement = testedObject;

        }
        
        // Hittest

       /* if (hitTest(this, testedObject)) {

            var winner = true;

            if (this.size > testedObject.size) {

                var objToDelete = testedObject
                var objToSave = this


            } else if (this.size < testedObject.size) {

                var objToDelete = this
                var objToSave = testedObject

            } else {

                winner = false

            }


            if (winner) {

                var index = objects.indexOf(objToDelete)
                objects.splice(index, 1)
                objToSave.size++;



                if (objToSave.opacity <= 1) objToSave.opacity += 0.1;

                objToSave.updateColor();
            }

        }*/
        
        // Hittest end



    }

    if (closestElement) {

        ctx.beginPath();
        ctx.moveTo(this.positionX + this.size / 2, this.positionY + this.size / 2);
        ctx.lineTo(closestElement.positionX + closestElement.size * 0.5, closestElement.positionY + closestElement.size * 0.5);
        ctx.strokeStyle = "rgba(" + options.connectionRed + ","+ options.connectionGreen +","+ options.connectionBlue +"," + options.connectionOpacity + ")";
        ctx.stroke();
        lines++;
    }

};

MouseParticle.prototype.testInteraction = function() {  

    if (options.mouseInteractionDistance === 0) return;
        
    var closestElements = [];
    var distanceToClosestElement = maximumPossibleDistance;

    for (var x = 0; x < objects.length; x++) {

        var testedObject = objects[x];
        var distance = getDistance(this, testedObject);


        if ((distance < options.mouseInteractionDistance) && (testedObject !== this)) {

            
            closestElements.push(objects[x]);

        }
        
    }

    
    for (var x = 0; x < closestElements.length; x++) {
       
       
        if (options.drawMouseConnections) {
        
            var element = closestElements[x];
            ctx.beginPath();
            ctx.moveTo(this.positionX, this.positionY);
            ctx.lineTo(element.positionX + element.size * 0.5, element.positionY + element.size * 0.5);
            ctx.strokeStyle = "rgba(" + options.mouseConnectionRed + ","+ options.mouseConnectionGreen +","+ options.mouseConnectionBlue +"," + options.mouseConnectionOpacity + ")";
            ctx.stroke();
            lines++ ;
        
        }
        
        if (options.mouseGravity) {
            
            closestElements[x].vectorX = this.positionX;
            closestElements[x].vectorY = this.positionY;
        
        }
        
      
       
 
     
    }
   

};

Particle.prototype.updateAnimation = function() {

    this.animateTo(this.vectorX, this.vectorY);
    this.testInteraction();
    this.sparkling();
    ctx.fillStyle = this.color;
    ctx.fillRect(this.positionX, this.positionY, this.size, this.size);

};



MouseParticle.prototype.updateAnimation = function() {
    
    
    this.positionX = mousePositionX;
    this.positionY = mousePositionY;

    this.testInteraction();
    

};


var createParticles = function() {

    // create mouse particle
    mouseElement = new MouseParticle(0, 0, options.initialSize, 255, 255, 255);
   
   
    for (var x = 0; x < options.particlesNumber; x++) {

        var randomX = Math.floor((Math.random() * canvas.width) + 1);
        var randomY = Math.floor((Math.random() * canvas.height) + 1);
        var opacity;
        var size;
        
        
               
        if (options.randomOpacity) {
         
            opacity = getRandomDecimalBetween(options.particleMinimumOpacity,options.particleMaximumOpacity);
         
        } else {
        
            opacity = options.opacity;

        }
        
        
        if (options.randomSize) {
         
            size = getRandomBetween(options.minimumSize,options.maximumSize);
         
        } else {
        
            size = options.initialSize;

        }
        
       

        var particle = new Particle(randomX, randomY, size, options.red, options.green, options.blue, opacity );
        particle.calculateVector();

        objects.push(particle);

    }
    
   

};


var updatePosition = function() {

    for (var x = 0; x < objects.length; x++) {

        objects[x].updateAnimation();

    }
    
    // handle mouse 
    mouseElement.updateAnimation();
    
    
    

};


canvas.onmousemove = function(e){
   
    mousePositionX = e.clientX - container.offsetLeft + window.pageXOffset;
    mousePositionY = e.clientY - container.offsetTop + window.pageYOffset;
    

};

var clearCanvas = function() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);


};

var stopAnimation = function(){


  window.cancelAnimationFrame(window.particleEngine["animation"+id]);
  isRunning = false;

};



// ----------------------------------------------------
// FPS //
//-----------------------------------------------------
var lastCalledTime;
var fps;
var averageFps;
var averageFpsTemp = 0;
var averageFpsCounter = 0;


function requestFps() {

    if (!lastCalledTime) {

        lastCalledTime = Date.now();
        fps = 0;
        return;

    }
    
    

    var delta = (new Date().getTime() - lastCalledTime) / 1000;
    lastCalledTime = Date.now();
    fps = Math.floor(1 / delta);
    
    averageFpsTemp = averageFpsTemp + fps;
    averageFpsCounter++;
    
    if ( averageFpsCounter === 5) {
     
        
        averageFps = Math.floor(averageFpsTemp / 5) ;
        averageFpsCounter = 0;  
        averageFpsTemp = 0; 
    }
    
    if (!averageFps) {
        
        return;
    
    } else if (averageFps < 10) {
          
      // stopAnimation(); 
      // averageFps = undefined; 
      // $("#fpsError").fadeIn();
    
    }
    
    ctx.fillStyle = "#fff";
    ctx.fillText("FPS: " + fps + " lines: " + lines + " Average FPS: " + averageFps , 10, 20);
    lines = 0;
    
    
   
}



// ----------------------------------------------------
// Init! //
//-----------------------------------------------------

var loop = function() {

    clearCanvas();
    updatePosition();

    window.particleEngine["animation"+id] = requestAnimationFrame(loop);
    isRunning = true;
    if (options.requestFPS) requestFps();

};

initAnimation();
loop();



}

generateParticles(options, "animation")

