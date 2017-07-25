$(document).ready(function(){


  // readFile = function () {
  //     var reader = new FileReader();
  //     reader.onload = function () {
  //       return  document.getElementById('out').innerHTML = reader.result;
  //     };
  //     // start reading the file. When it is done, calls the onload event defined above.
  //     reader.readAsBinaryString(fileInput.files[0]);
  //     var parsedData = $.csv.toArrays(document.getElementById('out').innerHTML, {onParseValue: $.csv.hooks.castToScalar});
  //     return parsedData;
  // };
  //
  // var fileInput = document.getElementById("csv");
  // fileInput.addEventListener('change', readFile);
   //console.log('gothere');




  var canvas = document.getElementById('canvas');
  var context = canvas.getContext("2d");
  var imagedata = context.getImageData(0, 0, canvas.width, canvas.height);

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    imagedata = context.getImageData(0, 0, canvas.width, canvas.height),
    buffer = imagedata.data;
    for( var y = 0 ; y < imagedata.height; y++ ) {
      for( var x = 0 ; x < imagedata.width; x++ ) {
        setPixel(imagedata, x, y, 0, 9, 3, 33);
      }
    }
    context.putImageData(imagedata, 0, 0);
  }
  window.addEventListener('resize', resizeCanvas, false);
  resizeCanvas();



  function getPixel(imagedata, x, y) {
    var i = (y * imagedata.width + x) * 4;

    return {r: imagedata.data[i], g: imagedata.data[i+1], b: imagedata.data[i+2], a: imagedata.data[i+3]};
  }
  function setPixel(imagedata, x, y, r, g, b, a) {
    var i = (y * imagedata.width + x) * 4;
    imagedata.data[i++] = r;
    imagedata.data[i++] = g;
    imagedata.data[i++] = b;
    imagedata.data[i] = a;
  }



  /*function randomate(){
    for( var y = 0 ; y < imagedata.height; y++ ) {
      for( var x = 0 ; x < imagedata.width; x++ ) {
        // set the colour randomly
        setPixel(imagedata, x, y, 0, 30+Math.random() * 5, 30+Math.random() * 5, Math.floor((Math.random() * 10) + 245));
      }
    }
    context.putImageData(imagedata, 0, 0);
  }*/


  var particles = new Array();

  class Particle {
    constructor(xPos, yPos) {
      this.xPos = Math.floor(Math.random() * canvas.width);
      this.yPos = Math.floor(Math.random() * canvas.height);
      this.xVel = .1-.2*Math.random();
      this.yVel = .1-.2*Math.random();
      this.mass = 1;
      var maxmass =  Math.max.apply(Math,particles.map(function(o){return o.mass;}));
      //console.log(maxmass);
      if(maxmass > 0){
        this.mass = Math.floor(Math.random()* Math.log(maxmass));
        if (this.mass == 0){
          this.mass =1;
        }
      }else{
        this.mass = 3;
      }
    }
    get move(){
      return this.getMovement();
    }
    getMovement(){
      var thisPart = this;
      //console.log(thisPart);
      var sumAccX = 0;
      var sumAccY = 0;
      this.crash = false;
      this.combined = false;
      particles.forEach(function(part, index, particles){
        var shouldCombine = thisPart.isCombine(part);
        if(part == thisPart || !shouldCombine){
          var accX = thisPart.getAccX(part);
          var accY = thisPart.getAccY(part);
          //console.log(accX);
          //console.log(accY);
          thisPart.xVel += accX;
          sumAccX += accX;
          thisPart.yVel += accY;
          sumAccY += accY;
          //console.log(thisPart.yVel);
        }else{
          thisPart.combine(part, index);
          particles.splice(index,1);
        }
      });
      thisPart.xPos += thisPart.xVel;
      thisPart.yPos += thisPart.yVel;
      if(thisPart.xPos < 0 ){
        thisPart.xPos += canvas.width;
      }
      if(thisPart.xPos > canvas.width){
        thisPart.xPos -= canvas.width;
      }
      if(thisPart.yPos < 0 ){
        thisPart.yPos += canvas.height;
      }
      if(thisPart.yPos > canvas.height){
        thisPart.yPos -= canvas.height;
      }
      this.xPos = thisPart.xPos;
      this.yPos = thisPart.yPos;
      this.xVel = thisPart.xVel;
      this.yVel = thisPart.yVel;
      this.acc = Math.sqrt(sumAccX**2+sumAccY**2);
      this.speed = Math.floor(Math.abs(Math.sqrt(this.xVel**2+this.yVel**2)));
      return {xVel:this.xVel, yVel:this.yVel}
    }
    isCombine(part){
      var d = this.getDistance(part);

      var cbrootMass = Math.floor(Math.cbrt(this.mass));
      if(d<5*(cbrootMass) && part != this){

        window.partAudio.woosh(this, part);
        this.isWoosh = true;
      }
      if(d<cbrootMass){
        return true;
      }else{
        return false;
      }

    }
    combine(part){
      var newMass = this.mass + part.mass;
      var newXVel = this.mass*this.xVel + part.mass*part.xVel;
      newXVel = newXVel / newMass;
      var newYVel = this.mass*this.yVel + part.mass*part.yVel;
      newYVel = newYVel / newMass;
      this.mass = newMass;
      this.xVel = newXVel;
      this.yVel = newYVel;
      addPart();
      window.partAudio.crash(this, part);

    }
    getDistance(part){
      var xdiff = this.getDiffX(part);
      var ydiff = this.getDiffY(part);
      //console.log(xdiff);
      //console.log(ydiff);
      return Math.sqrt( xdiff*xdiff + ydiff*ydiff );
    }
    getDiffX(part){
      var xdiff = part.xPos - this.xPos;
    //  console.log(part);
      return xdiff;
    }
    getDiffY(part){
    //  console.log(part);
      var ydiff = part.yPos - this.yPos;
      return ydiff;
    }

    getAccX(part){
      var xdiff = part.xPos - this.xPos;
      var d = this.getDistance(part);
      //console.log(d);
      if(d > 0){
        var xComp = xdiff/d;
        var masscorr = .3*part.mass;
        //console.log(xComp);
        var acc = masscorr/(d*d);
        return xComp*acc;
      } else {
        return 0;
      }
    }
    getAccY(part){
      var ydiff = part.yPos - this.yPos;
      var d = this.getDistance(part);
      // console.log(d);
      if(d > 0){
        var yComp = ydiff/d;
        var masscorr = .3*(part.mass);
      //  console.log(yComp);
        var acc = masscorr/(d*d);
        return yComp*acc;
      } else {
        return 0;
      }
    }

    /*drawParticle(){
      var pixdata = getPixel(imagedata,parseInt(this.xPos), parseInt(this.yPos) );
      setPixel(imagedata, parseInt(this.xPos), parseInt(this.yPos), 0, 255, 155, 255);
      var toSetX = parseInt(this.xPos);
      var toSetY = parseInt(this.yPos);
      var edge = 0;
      for (var c=1; c<=this.mass ; c++){
        var radius = Math.floor(Math.sqrt(c));
        radius = Math.floor((radius+1)/2);
        var greenness = 255/radius;
        var valence = c - ((2*radius-1)**2);
        var edgeLength = (((2*radius+1)**2) - ((2*radius-1)**2)) / 4;
        var edge = Math.floor(valence/edgeLength);

        if(valence == 0){
          toSetX -= 1;
          toSetY +=1;
        }

        if (edge == 0){
          toSetX += 1;
        }
        if (edge == 1){
          toSetY -= 1;
        }
        if (edge == 2){
          toSetX -= 1;
        }
        if (edge == 3 ){
          toSetY += 1;
        }
        console.log(edge, radius, valence, edgeLength, 'X',toSetX, 'Y', toSetY);

        setPixel(imagedata, toSetX, toSetY, 33, greenness, parseInt(greenness/1.5), 200);

      }

      context.putImageData(imagedata, 0, 0);
    }*/
    drawParticle(){
      context.beginPath();
      context.arc(this.xPos,this.yPos,Math.floor(Math.cbrt(this.mass)),0,2*Math.PI);
      var grd=context.createRadialGradient(this.xPos,this.yPos,Math.floor(Math.cbrt(this.mass)),this.xPos+3,this.yPos-3,Math.floor(Math.cbrt(this.mass)));
      grd.addColorStop(0,"rgba("
        +Math.floor((Math.random() * 50) +100)+", "
        +Math.floor((Math.random() * 50) + 200)+", "
        +Math.floor((Math.random() * 50) + 150)+", "
        +Math.floor((Math.random() * 50) + 0)+")");
      grd.addColorStop(.5,"rgba("
        +Math.floor((Math.random() * 50) + 75)+", "
        +Math.floor((Math.random() * 50) + 200)+", "
        +Math.floor((Math.random() * 50) + 150)+", "
        +Math.floor((Math.random() * 50) + 50)+")");
      grd.addColorStop(1,"rgba("
        +Math.floor((Math.random() * 50) +100)+", "
        +Math.floor((Math.random() * 50) + 200)+", "
        +Math.floor((Math.random() * 50) + 150)+", "
        +Math.floor((Math.random() * 50) + 145)+")");
      context.shadowBlur=this.mass;
      context.shadowColor= "rgba("
        +Math.floor((Math.random() * 50) +100)+","
        +Math.floor((Math.random() * 50) + 200)+","
        +Math.floor((Math.random() * 50) + 150)+", "
        +Math.floor((Math.random() * 50) + 45)+")";
      context.fillStyle = grd;
      context.fill();
      partAudio.partNoise(this);
    }


  }




  function addPart(){
    var part = new Particle();
    particles.push(part);
    part.drawParticle();
    return { x:part.xPos, y:part.yPos };

  }




  var zipfit = function(){
    //console.log('clear board');
    for( var y = 0 ; y < imagedata.height; y++ ) {
      for( var x = 0 ; x < imagedata.width; x++ ) {
        setPixel(imagedata, x, y, 0, 9, 3, 33);
      }
    }
    context.putImageData(imagedata, 0, 0);

    //console.log('print particles');
    particles.forEach(function(part){
    //  console.log('position', part.xPos, part.yPos );
        part.move;
    //  console.log('new position', part.xPos, part.yPos );
      //console.log('int position', parseInt(part.xPos), parseInt(part.yPos) );

      part.drawParticle();

    });
  //  debugger;
  }


  function download(text, name, type) {
    var a = document.createElement("a");
    var file = new Blob([text], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
  }



  class PartAudio{

    constructor(){
      // one context per document
        window.AudioContext = new (window.AudioContext || window.webkitAudioContext)();
        window.gainNode = window.AudioContext.createGain();
        window.gainNode.gain.value = 0.001 ;// 10 %
        window.gainNode.connect(window.AudioContext.destination);
        window.gainNode2 = window.AudioContext.createGain();
        window.gainNode2.gain.value = 0.005 ;// 10 %
        window.gainNode2.connect(window.AudioContext.destination);
        this.partOscs = new Array();
        this.on = false;
        this.nodes = new Array();
    }


    partNoise(part){
      if(this.on){
        window.gainNode.gain.value = 0.0001 ;
        var fixedMass = Math.floor(Math.log(part.mass))+3;
        var partSpeed = Math.floor(Math.abs(Math.log(part.xVel**2+part.yVel**2)));
        //console.log(thisAudio);
        var partOsc = window.AudioContext.createOscillator(); // instantiate an oscillator
        partOsc.type = 'sine'; // this is the default - also square, sawtooth, triangle
        partOsc.frequency.value = Math.floor(38400/fixedMass); // Hz
        this.partOscs.push(partOsc);
        partOsc.connect(window.gainNode); // connect it to the destination
        partOsc.start(); // start the oscillator
        partOsc.stop(window.AudioContext.currentTime + .3);
        var partOsc = window.AudioContext.createOscillator(); // instantiate an oscillator
        partOsc.type = 'sine'; // this is the default - also square, sawtooth, triangle
        partOsc.frequency.value = Math.floor(48000/fixedMass); // Hz
        this.partOscs.push(partOsc);
        partOsc.connect(window.gainNode); // connect it to the destination
        partOsc.start(); // start the oscillator
        partOsc.stop(window.AudioContext.currentTime + .3);
        var partOsc = window.AudioContext.createOscillator(); // instantiate an oscillator
        partOsc.type = 'sine'; // this is the default - also square, sawtooth, triangle
        partOsc.frequency.value = Math.floor(32000/fixedMass); // Hz
        this.partOscs.push(partOsc);
        partOsc.connect(window.gainNode); // connect it to the destination
        partOsc.start(); // start the oscillator
        partOsc.stop(window.AudioContext.currentTime + .3);
        window.gainNode.gain.value = 0.001 ;
      }
    }

    startAudio(){
      window.gainNode.gain.value = 0.001 ;// 10 %
      window.gainNode2.gain.value = 0.005 ;// 10 %
      this.on = true;
    }
    stopAudio(){
      window.gainNode.gain.value = 0 ;// 10 %
      window.gainNode2.gain.value = 0 ;// 10 %
      this.partOscs.forEach(function(osc){
          osc.disconnect();
        });
      this.nodes.forEach(function(node){
          node.disconnect();
        });
    }

    crash(part1, part2){
      if(this.on){
        //var vol = .5/(1+(2**-Math.log(part2.speed*part2.mass)));
        window.gainNode2.gain.value = .1;// 10 %
        //console.log(vol);
        var partOsc = window.AudioContext.createOscillator(); // instantiate an oscillator
        var real = new Float32Array(2);
        var imag = new Float32Array(2);
        real[0] = 0;
        imag[0] = .3;
        real[1] = 1;
        imag[1] = .2;


        var wave = window.AudioContext.createPeriodicWave(real, imag, {disableNormalization: true});

        partOsc.setPeriodicWave(wave);
        var size = 10000-Math.floor(8000*2**(-5*2**(-.009*Math.sqrt(part1.mass*part2.mass))));
        partOsc.frequency.value = size; // Hz
        this.partOscs.push(partOsc);
        partOsc.connect(window.gainNode2); // connect it to the destination
        partOsc.start(); // start the oscillator
        //setTimeout( partOsc.stop(), 900 );
        setTimeout( function(){ window.gainNode2.gain.value = 0.01;partOsc.stop(); }, 100);// 10 %

      }
    }
    woosh(part1, part2){
      if(this.on && !part1.isWoosh){
        this.iswoosh = true;

        window.gainNode2.gain.value = 0.05 ;// 10 %
        var bufferSize = 4096;
        var noiseBuffer = window.AudioContext.createBuffer(1, bufferSize, window.AudioContext.sampleRate);
        var output = noiseBuffer.getChannelData(0);
         var lastOut = 0.0;
        for (var i = 1; i < bufferSize; i++) {
          var white = Math.random() * 2 - 1;
           output[i] = (lastOut + (0.02 * white)) / 1.02;
           lastOut = output[i];
           output[i] *= 3.5; // (roughly) compensate for gain
        }
        var brownNoise = window.AudioContext.createBufferSource();
        brownNoise.buffer = noiseBuffer;
        brownNoise.loop = true;
        brownNoise.start(0);
        brownNoise.connect(window.gainNode2);
        this.nodes.push(brownNoise);
        setTimeout( function(){
          window.gainNode2.gain.value = 0.005 ;
          brownNoise.disconnect();
          this.iswoosh = false;
        }, 1 );

      }
    }



  }



  var doaudio = false;
  var zipfoff = true;
  window.partAudio = new PartAudio();
  document.body.onkeyup = function(e){
    if(e.keyCode == 65){
        console.log('hitbutton');
      if(window.partAudio.on){
        if(!zipfoff){
          window.partAudio.startAudio();
        }
        window.partAudio.on = false;
      }else{
        window.partAudio.on = true;
        if(zipfoff){
          window.partAudio.stopAudio();
        }
      }
    }

    if(e.keyCode == 32){
      if(zipfoff){
        window.zipftime = setInterval(zipfit, 3);
        zipfoff = false;
        if(window.partAudio.on){
          window.partAudio.startAudio();
        }
      }else{
        if(window.partAudio.on){
          window.partAudio.stopAudio();
        }
        window.clearInterval(window.zipftime);
        zipfoff = true;

      }
    }

    if(e.keyCode == 78){
      partVal = addPart();
      //console.log(partVal);

    }

    if (e.keyCode == 77){
      particles.forEach(function(part){
        context.font = "12px Arial";
        context.fillStyle= "rgba(0,200,100,100)";
        context.fillText(part.mass,part.xPos-5,part.yPos-12);
      });
    }

    if (e.keyCode == 88){
      particles.splice(particles.indexOf(Math.min.apply(null, particles)), 1);
      //console.log(particles);
    }

    if (e.keyCode == 68){

      function download(text, name, type) {
          var a = document.createElement("a");
          var file = new Blob([text], {type: type});
          a.href = URL.createObjectURL(file);
          a.download = name;
          a.click();
      }
      download(JSON.stringify(particles), 'test.txt', 'text/plain');

    }
  }

});
