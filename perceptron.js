/**The MIT License (MIT)

Copyright (c) <2013>
<Adrián Casimiro Álvarez>
<Javier de Pedro López>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.  **/

/**
 * The perceptron class can adjust the weights to solve de splitting (in two groups)
 * problem.
 */
var PerceptronClass = function Perceptron (idCanvas){
	var Perceptron = {
		//The id of the canvas element
		canvasId: idCanvas,
		//The canvas class that draw in the document canvas
		canvas: false,
		//Default we use 2 as R^2 dimension is the plan
		dimensions: 2,
		//Theta value of the neuron.
		theta : 0,
		//The adjusted weights of the perceptron
		weights : new Array (),
		//The perceptron trainning instance
		perceptronTraining: false,
		/**
		 * Initialize the perceptron object.
		 */
		init : function () {
			//Initialize the perceptron training function
			this.perceptronTraining = new this.classes.PerceptronTraining(
					//Expected outputs for each group
					new Array(-1,1),
					//Neural function
					new this.classes.NeuralFunction( function (perceptronResponse) {
						if(perceptronResponse >= 0) return 1; //Greater or equal to 0 belongs to first group
						else return -1; //Less than 0 belongs to second group
					})
				);
			// Initialize the canvas
			this.canvas = new this.classes.Canvas();
			//On load function
			window.onload = new this.classes.Proxy(this.canvas, this.canvas.onload);
			// Initialize the weights with random values and the pointsets
			for (var i = 0; i < this.dimensions; i++){
				this.weights.push(Math.random() * 2 - 1);
				this.perceptronTraining.trainingSets.push(new this.classes.PointSet());
			}
			//Initialize theta value
			this.theta = Math.random() * 2 - 1;
			
			//Initialize expected outputs
			return this;
		},
		/**
		 * Performs the training process of the neural network.
		 * It is a shortcut fot perceptronTraining.
		 */
		train: function (learningReason, maxIterations) {
			if(learningReason > 1 || learningReason < 0){
				PerceptronHelper.showError("El valor de aprendizaje ha de estar en el intervalo [0,1]");
				return this;
			}
			if(maxIterations <= 0){
				PerceptronHelper.showError("El número máximo de iteraciones ha de ser mayor que 0");
				return this;
			}
			if(this.perceptronTraining.trainingSets == 0){
				PerceptronHelper.showError("No puede haber conjuntos de puntos vacios");
				return this;
			}
			for(var i=0; i<this.perceptronTraining.trainingSets.length; i++){
				if(this.perceptronTraining.trainingSets[i].points.length == 0){
					PerceptronHelper.showError("No puede haber conjuntos de puntos vacios");
					return this;
				}
			}
			PerceptronHelper.cleanError();
			PerceptronHelper.smoothScroll('results');
			var button = document.getElementById("stopButton");
			this.perceptronTraining.train(learningReason, maxIterations);
			return this;
		},
		stopTrain : function (){
			this.queue.clear();
			this.toggleButtons();
		},
		toggleButtons : function () {
			var run = document.getElementById("runButton");
			var stop = document.getElementById("stopButton");
			run.disabled ? run.disabled = false : run.disabled = true;
			stop.disabled ? stop.disabled = false : stop.disabled = true;
		},
		/**
		 * Adds a new point to the training set.
		 * @param point The point to add.
		 * @param trainingSetIndex On which training set it will be added.
		 */
		addPointToTrainingSet : function(point, trainingSetIndex){
			this.perceptronTraining.trainingSets[trainingSetIndex].addPoint(point);
		},
		/**
		 * Removes a new point to the training set.
		 * @param point The point to remove.
		 * @param trainingSetIndex From which training set it will be removed.
		 */
		removePointFromTrainingSet : function(point, trainingSetIndex){
			this.perceptronTraining.trainingSets[trainingSetIndex].removePoint(point);
		},
		/**
		 * Notifies the change of the training values to the user interface and 
		 * whatever interested on it.
		 */
		notify : function(){
			var values = {
				weights : Perceptron.weights.slice(0),
				theta : Perceptron.theta,
				learningReason : Perceptron.perceptronTraining.learningReason,
				currentIteration : Perceptron.perceptronTraining.currentIteration,
				f : function(x) {
					return (this.theta - x * this.weights[0])/this.weights[1];
				}
			};
			Perceptron.queue.add(function(){
				PerceptronHelper.resetResultValues(values.weights[0], values.weights[1], values.theta, values.learningReason, values.currentIteration);
				this.canvas.initScale();
				this.canvas.drawTrainingSet(this.perceptronTraining.trainingSets);
				this.canvas.drawFunction(values);
			}, this);
		},
		queue : {
		    timer: null,
		    queue: [],
		    add: function(fn, context, time) {
		        var setTimer = new Perceptron.classes.Proxy(this, function(time) {
		            this.timer = setTimeout(new Perceptron.classes.Proxy(this, function() {
		                time = this.add();
		                if (this.queue.length) {
		                    setTimer(time);
		                }
		            }), time || 100);
		        });

		        if (fn) {
		            this.queue.push([fn, context, time]);
		            if (this.queue.length == 1) {
		                setTimer(time);
		            }
		            return;
		        }

		        var next = this.queue.shift();
		        if (!next) {
		            return 0;
		        }
		        next[0].call(next[1] || window);
		        return next[2];
		    },
		    clear: function() {
		        clearTimeout(this.queue.timer);
		        this.queue = [];
		    }
		},
		/********************************************
		 * FUNCTION (CLASSES) 
		 ********************************************/
		classes: {
			/**
			 * Neural function that returns true if the value is greater than 0 and false if not.
			 * Implements an strategy pattern to make simpler the function change.
			 * @param neuralFunction A neural function is a function that receives one parameter as the 
			 * perceptron response and returns the value that represents the group that this value
			 * belongs to.
			 * @param return The group of the value returned by the perceptron.
			 */
			NeuralFunction : function (neuralFunction) {
				var that = this;
				this.calculus = neuralFunction;
				this.runCalculus = function (perceptronResponse){
					return this.calculus(perceptronResponse);
				};
			},
			/**
			 * Class that represents a set of points.
			 */
			PointSet : function () {
				this.points = new Array();
				/**
				 * Adds a point to the point set.
				 * @param point The Point to add to the point set.
				 */
				this.addPoint = function (point) {
				    this.points.push(point);
				};
				/**
				 * Removes a point from the point set.
				 * @param point The Point to remove.
				 */
				this.removePoint = function (point) {
					//Get the index
					var index = this.points.indexOf(point);
					if (index != -1){
						this.points.splice(index, 1);
					}
				};
				/**
				 * Check if the set contains a points.
				 * @param point The Point to check if it is in the set
				 */
				this.contains = function (point){
					for(var i = 0; i<this.points.length; i++){
						if(this.points[i].coordinates[0] == point.coordinates[0] && this.points[i].coordinates[1] == point.coordinates[1]){
							return true;
						}
					}
					return false;
				};
			},
			/**
			 * Point class that defines a canvas point.
			 * @param arrayOfCoordinates an array with all the coordinates of a point.
			 * Only 2D coordinates can be expressed in the canvas.
			 */
			Point: function (arrayOfCoordinates) {
				this.length = arrayOfCoordinates.length;
				this.coordinates = arrayOfCoordinates;
			},
			PerceptronTraining : function (expectedOutputs, neuralFunction) {
				//Gamma value that represents the learning reason
				this.learningReason = 1;
				//Max number of iterations
				this.maxIterations = 1000;
				//The training sets
				this.trainingSets = new Array ();
				// Expected output for the training sets
				this.expectedGroupOutputs = expectedOutputs;
				//The neural function
				this.neuralFunction = neuralFunction,
				//The initial iteration is 0
				this.currentIteration = 0;
				//Train the data of the perceptron
				this.train = function (learningReason, maxIterations) {
					//Tooggle the buttons
					Perceptron.toggleButtons();
					//Set input parameters
					this.learningReason = learningReason;
					this.maxIterations = maxIterations;
					//The initial iteration is 0
					this.currentIteration = 0;
					var maxValuesToCheck = 0;
					//Get the max number of points to check
					for (var i = 0; i < this.trainingSets.length; i++){
						maxValuesToCheck += this.trainingSets[i].points.length;
					}
					//Set the current values to the max possible
					var currentValuesToCheck = maxValuesToCheck + 1;
					//Start checking all the values to see if they belong to the correct
					//group
					var position = 0;
					var group = 0;
					var decrementLearningReason = this.learningReason/this.maxIterations;
					Perceptron.notify();
					for (; this.currentIteration < this.maxIterations && currentValuesToCheck > 0; currentValuesToCheck--){
						//Get the training set
						var groupSet = this.trainingSets[group].points;
						//Perform the calculus of the impulse
						var impulse = this.weightOperation(groupSet[position]);
						//Check the output of the neuron to check the group it belongs to
						if (this.expectedGroupOutputs[group] != this.neuralFunction.runCalculus(impulse)){
							//Adjust the neuron weights
							this.adjust(groupSet[position], this.expectedGroupOutputs[group]);
							//Reset the counter
							currentValuesToCheck = maxValuesToCheck + 1;
						}
						//Increment index
						position++;
						this.currentIteration++;
						this.learningReason -= decrementLearningReason;
						//Notify the user interface
						Perceptron.notify();
						if (position >= groupSet.length){
							group = (group + 1) % Perceptron.dimensions;
							position = 0;
						}
					}
					//Add toggle buttons to queue
					Perceptron.queue.add(Perceptron.toggleButtons);
				};
				this.adjust = function (point, expectedOutput) {
					for (var i = 0; i < point.length; i++){
						Perceptron.weights[i] += this.learningReason * expectedOutput * point.coordinates[i];
					}
					Perceptron.theta += this.learningReason * expectedOutput * (-1);
				};
				//Performs the weight operation
				this.weightOperation = function (point) {
					var result = 0;
					for (var i = 0; i < point.length; i++)
						result += point.coordinates[i] * Perceptron.weights[i];
					result += Perceptron.theta * -1;
					return result;
				};
			},
			Proxy : function(object, functionProxy){
				return function(){
					return functionProxy.apply(object, arguments);
				};
			},
			Canvas : function () {
				//The document canvas where we draw
				this.canvas = false; 
				//Instance of 2D canvas that helps to draw
				this.ctx = false ;
				//The width of the canvas element
				this.width = false ;
				//The height of the canvas element
				this.height = false ;
				//Minimum distance between X points
				this.xUnitary = 1;
				//Minimum distance between Y points
				this.yUnitary = 1;
				// Returns the right boundary of the logical viewport
				this.maxX = 10;
				// Returns the left boundary of the logical viewport
				this.minX = -10;
				// Returns the top boundary of the logical viewport
				this.maxY = 0;
				// Returns the bottom boundary of the logical viewport
				this.minY = 0;
				/**
				 * Return the x coordinate to draw in the canvas from the x coordinate in 
				 * the [minX, maxX] set
				 * @param x The coordinate in [minX,maxX] set to draw in the canvas
				 * @return The coordinate x in the canvas to draw
				 */
				this.xRealCoord = function(x) {
					return (x - this.minX) / (this.maxX - this.minX) * this.width ;
				};
				/**
				 * Return the y coordinate to draw in the canvas from the y coordinate in 
				 * the [minY, maxY] set
				 * @param y The coordinate in [minY,maxY] set to draw in the canvas
				 * @return The coordinate y in the canvas to draw
				 */
				this.yRealCoord = function(y) {
					return this.height - (y - this.minY) / (this.maxY - this.minY) * this.height ;
				};
				/**
				 * Clean the canvas
				 */
				this.reset = function () {
					this.ctx.clearRect(0,0,this.width,this.height) ;
				};
				/**
				 * Draw the X and Y axes in the canvas
				 */
				this.drawAxes = function() {
					this.ctx.save() ;
					this.ctx.lineWidth = 2 ;
					// +Y axis
					this.ctx.beginPath() ;
					this.ctx.moveTo(this.xRealCoord(0),this.yRealCoord(0)) ;
					this.ctx.lineTo(this.xRealCoord(0),this.yRealCoord(this.maxY)) ;
					this.ctx.stroke() ;

					// -Y axis
					this.ctx.beginPath() ;
					this.ctx.moveTo(this.xRealCoord(0),this.yRealCoord(0)) ;
					this.ctx.lineTo(this.xRealCoord(0),this.yRealCoord(this.minY)) ;
					this.ctx.stroke() ;

					// Y axis tick marks
					for (var i = 1; (i * this.yUnitary) < this.maxY ; ++i) {
						this.ctx.beginPath() ;
						this.ctx.moveTo(this.xRealCoord(0) - 5,this.yRealCoord(i * this.yUnitary)) ;
						this.ctx.lineTo(this.xRealCoord(0) + 5,this.yRealCoord(i * this.yUnitary)) ;
						this.ctx.stroke() ;  
					}
					
					// -Y axis tick marks
					for (var i = 1; (i * this.yUnitary) > this.minY ; --i) {
						this.ctx.beginPath() ;
						this.ctx.moveTo(this.xRealCoord(0) - 5,this.yRealCoord(i * this.yUnitary)) ;
						this.ctx.lineTo(this.xRealCoord(0) + 5,this.yRealCoord(i * this.yUnitary)) ;
						this.ctx.stroke() ;  
					}  

					// +X axis
					this.ctx.beginPath() ;
					this.ctx.moveTo(this.xRealCoord(0),this.yRealCoord(0)) ;
					this.ctx.lineTo(this.xRealCoord(this.maxX),this.yRealCoord(0)) ;
					this.ctx.stroke() ;

					// -X axis
					this.ctx.beginPath() ;
					this.ctx.moveTo(this.xRealCoord(0),this.yRealCoord(0)) ;
					this.ctx.lineTo(this.xRealCoord(this.minX),this.yRealCoord(0)) ;
					this.ctx.stroke() ;

					// X tick marks
					for (var i = 1; (i * this.xUnitary) < this.maxX ; ++i) {
						this.ctx.beginPath() ;
						this.ctx.moveTo(this.xRealCoord(i * this.xUnitary),this.yRealCoord(0)-5) ;
						this.ctx.lineTo(this.xRealCoord(i * this.xUnitary),this.yRealCoord(0)+5) ;
						this.ctx.stroke() ;  
					}

					// -X tick marks
					for (var i = 1; (i * this.xUnitary) > this.minX ; --i) {
						this.ctx.beginPath() ;
						this.ctx.moveTo(this.xRealCoord(i * this.xUnitary),this.yRealCoord(0)-5) ;
						this.ctx.lineTo(this.xRealCoord(i * this.xUnitary),this.yRealCoord(0)+5) ;
						this.ctx.stroke() ;  
					}
					this.ctx.restore() ;
				};
				/**
				 * Draw the different training sets of points in the canvas.
				 * @param trainingSets Set of at least two sets that is going to be draw in the canvas.
				 */
				this.drawTrainingSet = function (trainingSets) {
					for (var i = 0; i < trainingSets.length; i++){
						for(var j = 0; j < trainingSets[i].points.length; j++){
							this.drawPoint(trainingSets[i].points[j].coordinates[0],trainingSets[i].points[j].coordinates[1], i);
						}
					}
				};
				/**
				 * Draw a point in the canvas
				 * @param x The position in the ordinate axes.
				 * @param y The position in the abscissa axes.
				 * @param set The set where the point belongs.
				 */
				this.drawPoint = function(x, y, set){
					switch (set) {
						case 0: //First set
							this.ctx.fillStyle   = '#00f'; // blue
							this.ctx.beginPath();
							this.ctx.arc(this.xRealCoord(x), this.yRealCoord(y), 2, 0, Math.PI*2, true); 
							this.ctx.closePath();
							this.ctx.fill();
							this.ctx.fillStyle = '#000'; // black
							this.ctx.fillText(('(' + x + ',' + y + ')'), this.xRealCoord(x), this.yRealCoord(y) + 10);
							break;
						case 1: //Second set
							this.ctx.fillStyle = '#f00'; // red
							this.ctx.beginPath();
							this.ctx.arc(this.xRealCoord(x), this.yRealCoord(y), 2, 0, Math.PI*2, true); 
							this.ctx.closePath();
							this.ctx.fill();
							this.ctx.fillStyle = '#000'; // black
							this.ctx.fillText(('(' + x + ',' + y + ')'), this.xRealCoord(x), this.yRealCoord(y) + 10);
							break;
					}
				};
				/**
				 * Draw the function that separate the points in the canvas.
				 * @param context Object that contains the function (context.f(x)).
				 */
				this.drawFunction = function(context) {
					var first = true;
					//Horizontal distance between points
					var XSTEP = (this.maxX-this.minX)/this.width ;
					this.ctx.fillStyle = '#a83f'; // black
					this.ctx.beginPath() ;
					for (var x = this.minX; x <= this.maxX; x += XSTEP) {
						var y = context.f(x) ;
						if (first) {
							this.ctx.moveTo(this.xRealCoord(x),this.yRealCoord(y)) ;
							first = false ;
						} else {
							this.ctx.lineTo(this.xRealCoord(x),this.yRealCoord(y)) ;
						}
					}
					this.ctx.stroke() ;
				};
				/**
				 * Draw the point where the user click
				 * @param canvas The canvas where we draw.
				 * @param e The mouse event that contains the coordinates of the mouse and if it was clicked with the right or the left button.
				 */
				this.mouseClick = function(canvas, e){
					var rect = canvas.getBoundingClientRect();
					var x = Math.round((((e.clientX - rect.left)*(this.maxX - this.minX)/this.width + this.minX)));
					var y = Math.round(-1*(e.clientY -rect.top)*(this.maxY - this.minY)/this.height + this.maxY);
					var point = new Perceptron.classes.Point(new Array(x,y));
					if(!(Perceptron.perceptronTraining.trainingSets[0].contains(point) || Perceptron.perceptronTraining.trainingSets[1].contains(point))){
						switch (e.which) {
						 	case 1: //Left button
								Perceptron.canvas.drawPoint(point.coordinates[0],point.coordinates[1],0);
								Perceptron.addPointToTrainingSet(point,0);
			                    break;
			                case 2: //Middle button
			                    break;
			                case 3://Right button
								Perceptron.canvas.drawPoint(point.coordinates[0],point.coordinates[1],1);
								Perceptron.addPointToTrainingSet(point,1);
			                    break;
			             }
					}
				};
				/**
				 * Instance the canvas when the document is fully charged
				 */
				this.onload = function () {
					this.canvas = document.getElementById(Perceptron.canvasId);
					this.canvas.addEventListener('mousedown', new Perceptron.classes.Proxy(this, function(e) {
						this.mouseClick(this.canvas, e);
					}),false);
					this.canvas.addEventListener('contextmenu', function(e) { //Block right button menu
						e.preventDefault();
						return false;
					}, false);
					this.ctx = this.canvas.getContext('2d');
					Perceptron.notify();
				};
				/**
				 * Initialize all the variables that are needed to draw when the change and redraw the axes.
				 */
				this.initScale = function () {
					this.width = this.canvas.width;
					this.height = this.canvas.height;
					this.maxY = this.maxX * this.height / this.width;
					this.minY = this.minX * this.height / this.width;
					this.reset();
					this.drawAxes();
				};
			}
		}
	//Automatically call init
	}.init();
	return Perceptron;
};

var PerceptronHelperClass = function () {
	return {
		checkScale : function(){
			var minX = document.getElementById("minX");
			var maxX = document.getElementById("maxX");
			if (parseInt(minX.value) < parseInt(maxX.value)){
				Perceptron.canvas.minX = parseInt(minX.value);
				Perceptron.canvas.maxX = parseInt(maxX.value);
				Perceptron.notify();
				this.cleanError();
			}else{
				this.showError("El valor mínimo del intervalo debe ser mayor que el máximo.");
			}
		},
		showError : function (errorMessage) {
			var error = document.getElementById("errorMsg");
			error.innerText = errorMessage;
			error.style.display = "block";
		},
		cleanError : function () {
			var error = document.getElementById("errorMsg");
			error.innerText = "";
			error.style.display = "none";
		},
		/**
		 * Change the result values in the html.
		 * @param omega1 The weight of the first input. 
		 * @param omega2 The weight of the second input.
		 * @param theta The θ of the neurone
		 * @param gamma The conversion factor that is being cooling
		 * @param currentIteration The actual iteration.
		 */
		resetResultValues : function(omega1, omega2, theta, gamma, currentIteration){
			document.getElementById("omega1").innerText = omega1;
			document.getElementById("omega2").innerText = omega2;
			document.getElementById("theta").innerText = theta;
			document.getElementById("gamma").innerText = gamma;
			document.getElementById("iteration").innerText = currentIteration;
		},
		currentYPosition: function() {
			if (self.pageYOffset)
				 return self.pageYOffset;
			if (document.documentElement && document.documentElement.scrollTop)
				return document.documentElement.scrollTop;
			if (document.body.scrollTop)
				 return document.body.scrollTop;
			return 0;
		},
		elmYPosition: function(eID) {
			var elm  = document.getElementById(eID);
			var y    = elm.offsetTop;
			var node = elm;
			while (node.offsetParent && node.offsetParent != document.body) {
				node = node.offsetParent;
				y   += node.offsetTop;
			} return y;
		},
		smoothScroll: function(eID) {
			var startY   = this.currentYPosition();
			var stopY    = this.elmYPosition(eID);
			var distance = stopY > startY ? stopY - startY : startY - stopY;
			if (distance < 100) {
				scrollTo(0, stopY); return;
			}
			var speed = Math.round(distance / 100);
			if (speed >= 20) speed = 20;
			var step  = Math.round(distance / 25);
			var leapY = stopY > startY ? startY + step : startY - step;
			var timer = 0;
			if (stopY > startY) {
				for ( var i=startY; i<stopY; i+=step ) {
					setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
					leapY += step; if (leapY > stopY) leapY = stopY; timer++;
				} return;
			}
			for ( var i=startY; i>stopY; i-=step ) {
				setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
				leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
			}
		}
	};
};

//Create perceptron var with class perceptron (PerceptronClass contains Perceptron function what is initialized).
var Perceptron = new PerceptronClass("paint-panel");
var PerceptronHelper = new PerceptronHelperClass();
