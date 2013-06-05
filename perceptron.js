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
 * The perceptron class can adjust the weights to solve the splitting (in two groups)
 * problem.
 * @param idCanvas The identifier of the canvas where we paint.
 * @param queueSpeed The speed of the visualization. It determines how you can see the results.
 */
var PerceptronClass = function Perceptron (idCanvas, queueSpeed){
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
		//The speed used by the function queue
		iterationSpeed : queueSpeed,
		/**
		 * Initialize the perceptron object and all its references.
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
		 * It is a shortcut for perceptronTraining.
		 */
		train: function () {
			PerceptronHelper.cleanError();
			PerceptronHelper.smoothScroll('results');
			this.perceptronTraining.train();
			return this;
		},
		/**
		 * Clears all the elements from the execution queue. It allows us to stop the execution.
		 */
		stopTrain : function (){
			this.queue.clear();
			this.toggleButtons();
		},
		/**
		 * Changes the visibility of the stop and start buttons.
		 */
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
			this.perceptronTraining.trainingSets[trainingSetIndex].remove(point);
		},
		/**
		 * Notifies the change of the training values to the user interface and 
		 * whatever interested on it.
		 * It stores the data in a values var and then it is sent to the perceptron queue to be executed.
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
			//Enqueue the notification
			Perceptron.queue.add(function(){
				PerceptronHelper.resetResultValues(values.weights[0], values.weights[1], values.theta, values.learningReason, values.currentIteration);
				this.canvas.initScale();
				this.canvas.drawTrainingSet(this.perceptronTraining.trainingSets);
				this.canvas.drawFunction(values);
			}, this, this.iterationSpeed);
		},
		/**
		 * Perceptron queue that enques operations to be executed once passed certain amount of time.
		 */
		queue : {
			//Timer instance that waits for the execution.
		    timer: null,
		    //The queue with all the operations (functions)
		    queue: [],
		    /**
		     * This method can be called in two ways. Empty executes something in the queue, but with a function it 
		     * stores it waiting for the next iteration.
		     * @param fn The function to store.
		     * @param context The context on which this function will be called.
		     * @param time The time that this function will rest.
		     * @returns The execution time for this function.
		     */
		    add: function(fn, context, time) {
		    	//Create the timer for this function
		        var setTimer = new Perceptron.classes.Proxy(this, function(time) {
		            this.timer = setTimeout(new Perceptron.classes.Proxy(this, function() {
		            	//Execute the next function
		                time = this.add();
		                //If more functions in queue
		                if (this.queue.length) {
		                	//Add this function to the timer queue
		                    setTimer(time);
		                }
		            }), time || 100);
		        });
		        //Add the function to the queue if it has been passed
		        if (fn) {
		        	//Push into the array
		            this.queue.push([fn, context, time]);
		            //If it is the last set the timer
		            if (this.queue.length == 1) {
		                setTimer(time);
		            }
		            return;
		        }
		        //Shift the element and execute it add() without parameters has been called.
		        var next = this.queue.shift();
		        if (!next) {
		            return 0;
		        }
		        //Call the function with the passed context
		        next[0].call(next[1] || window);
		        //Return timer
		        return next[2];
		    },
		    /**
		     *  Clear all the functions inside the queue. They will not continue executing anymore.
		     */
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
				this.remove = function (point) {
					for (var i = 0; i < this.points.length; i++){
						if (this.points[i].coordinates[0] == point.coordinates[0] && this.points[i].coordinates[1] == point.coordinates[1]){
							this.points.splice(i, 1);
							return true;
						}
					}
				};
				/**
				 * Check if the set contains a given point.
				 * @param point The Point to check if it is in the set
				 */
				this.contains = function (point){
					for (var i = 0; i < this.points.length; i++){
						if (this.points[i].coordinates[0] == point.coordinates[0] && this.points[i].coordinates[1] == point.coordinates[1]){
							return true;
						}
					}
					return false;
				};
			},
			/**
			 * Point class that defines a canvas point.
			 * @param arrayOfCoordinates an array with all the coordinates of a point.
			 * Only 2D coordinates can be expressed in this canvas, but it is prepared to create a 3D canvas.
			 */
			Point: function (arrayOfCoordinates) {
				this.length = arrayOfCoordinates.length;
				this.coordinates = arrayOfCoordinates;
			},
			/**
			 * 
			 * @param expectedOutputs
			 * @param neuralFunction
			 */
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
				/**
				 * Trains the perceptron executing the complete algorithm.
				 */
				this.train = function () {
					//Tooggle the buttons
					Perceptron.toggleButtons();
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
					//Simulated cooling on learning reason
					var decrementLearningReason = this.learningReason/this.maxIterations;
					//Notify first changes
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
						//Decrement learning reason (if < 0 -> = 0)
						this.learningReason -= decrementLearningReason;
						if (this.learningReason < 0) this.learningReason = 0;
						//Notify the user interface each iteration
						Perceptron.notify();
						//Increment index and iteration
						position++;
						this.currentIteration++;
						if (position >= groupSet.length){
							group = (group + 1) % Perceptron.dimensions;
							position = 0;
						}
					}
					//Add toggle buttons to queue
					Perceptron.queue.add(Perceptron.toggleButtons);
				};
				/**
				 * Adjustment operations for weights and theta. This can be considered as the learning function
				 * w1 = w1 + var(w1) -> var(w1) = gamma * d1 * w1
				 * w2 = w2 + var(w2) -> var(w2) = gamma * d2 * w2
				 * theta = theta + var(theta) -> var(theta) = gamma * theta * -1
				 */
				this.adjust = function (point, expectedOutput) {
					for (var i = 0; i < point.length; i++){
						Perceptron.weights[i] += this.learningReason * expectedOutput * point.coordinates[i];
					}
					Perceptron.theta += this.learningReason * expectedOutput * (-1);
				};
				/**
				 * Performs the weight operation: w1*x1 + w2*x2 = theta.
				 * @param point The point with coordinates (x1, x2).
				 * @returns {Number} The result.
				 */
				this.weightOperation = function (point) {
					var result = 0;
					for (var i = 0; i < point.length; i++)
						result += point.coordinates[i] * Perceptron.weights[i];
					result += Perceptron.theta * -1;
					return result;
				};
			},
			/**
			 * Proxy pattern to allow multicontext calls between  different objects.
			 * @param object The object as a context.
			 * @param functionProxy the function that will have object as a context.
			 * @returns {Function} A function with the new context call.
			 */
			Proxy : function(object, functionProxy){
				return function(){
					return functionProxy.apply(object, arguments);
				};
			},
			/**
			 * The canvas class that can be instanced to paint the functions.
			 */
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
					//Get the canvas painting viewport
					var rect = canvas.getBoundingClientRect();
					//Get rounded x and rouded y
					var x = Math.round((((e.clientX - rect.left)*(this.maxX - this.minX)/this.width + this.minX)));
					var y = Math.round(-1*(e.clientY -rect.top)*(this.maxY - this.minY)/this.height + this.maxY);
					var point = new Perceptron.classes.Point(new Array(x,y));
					//If the point is not added
					switch (e.which) {
					 	case 1: //Left button
					 		if(!(Perceptron.perceptronTraining.trainingSets[0].contains(point) || Perceptron.perceptronTraining.trainingSets[1].contains(point))){
						 		//Add to group 0
								Perceptron.canvas.drawPoint(point.coordinates[0],point.coordinates[1],0);
								Perceptron.addPointToTrainingSet(point,0);
					 		}
		                    break;
		                case 2: //Middle button
		                	//Remove from any group
		                	Perceptron.removePointFromTrainingSet(point, 0);
		                	Perceptron.removePointFromTrainingSet(point, 1);
		                	Perceptron.notify();
		                    break;
		                case 3://Right button
		                	if(!(Perceptron.perceptronTraining.trainingSets[0].contains(point) || Perceptron.perceptronTraining.trainingSets[1].contains(point))){
			                	//Add to group 1
								Perceptron.canvas.drawPoint(point.coordinates[0],point.coordinates[1],1);
								Perceptron.addPointToTrainingSet(point,1);
		                	}
		                    break;
		             }
				};
				/**
				 * Instance the canvas when the document is fully charged. It is attached on init to he
				 * window.onload operation.
				 */
				this.onload = function () {
					this.canvas = document.getElementById(Perceptron.canvasId);
					//Prevent default behaviour for click button (right, left and middle).
					this.canvas.addEventListener('mousedown', new Perceptron.classes.Proxy(this, function (event) {
						event.preventDefault();
						this.mouseClick(this.canvas, event);
						return false;
					}),false);
					//Do not show context menu
					this.canvas.addEventListener('contextmenu', function (event) { //Block right button menu
						event.preventDefault();
						return false;
					}, false);
					//Get the context
					this.ctx = this.canvas.getContext('2d');
					//Notify that everything has been loaded.
					Perceptron.notify();
				};
				/**
				 * Initialize all the variables that are needed to draw when the change and redraw the axes.
				 */
				this.initScale = function () {
					//Reset and draw the axis
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

/**
 * Perceptron helper that is used to perform html operations and other stuff related to validation
 * and animations.
 */
var PerceptronHelperClass = function () {
	return {
		/**
		 * Checks the scale of the graphics.
		 * @returns True if no error. On other case, false.
		 */
		checkScale : function(){
			var minX = document.getElementById("minX");
			var maxX = document.getElementById("maxX");
			if (parseInt(minX.value) < parseInt(maxX.value)){
				Perceptron.canvas.minX = parseInt(minX.value);
				Perceptron.canvas.maxX = parseInt(maxX.value);
				Perceptron.notify();
				this.cleanError();
				return true;
			}else{
				this.showError("El valor mínimo del intervalo debe ser mayor que el máximo.");
				return false;
			}
		},
		/**
		 * Shows an error message on the error div in the html.
		 * @param errorMessage The message to show.
		 * @returns none.
		 */
		showError : function (errorMessage) {
			var error = document.getElementById("errorMsg");
			error.innerText = errorMessage;
			error.style.display = "block";
		},
		/**
		 * Cleans the error message on the div on html.
		 * @returns none.
		 */
		cleanError : function () {
			var error = document.getElementById("errorMsg");
			error.innerText = "";
			error.style.display = "none";
		},
		/**
		 * Change the result values in the html setting them to the passed value.
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
		/**
		 * The y axis position of the viewport.
		 * @returns The y position.
		 */
		currentYPosition: function () {
			if (self.pageYOffset)
				 return self.pageYOffset;
			if (document.documentElement && document.documentElement.scrollTop)
				return document.documentElement.scrollTop;
			if (document.body.scrollTop)
				 return document.body.scrollTop;
			return 0;
		},
		/**
		 * Position on the y axis of the element for the smooth scroll function.
		 * @param eID The element.
		 * @returns the value of y.
		 */
		elmYPosition: function(eID) {
			var elm  = document.getElementById(eID);
			var y = elm.offsetTop;
			var node = elm;
			while (node.offsetParent && node.offsetParent != document.body) {
				node = node.offsetParent;
				y += node.offsetTop;
			}
			return y;
		},
		/**
		 * Moves to the element id passed. It is used to see all values.
		 * @param eID element id.
		 * @returns none.
		 */
		smoothScroll: function (eID) {
			//Get current positions
			var startY   = this.currentYPosition();
			var stopY    = this.elmYPosition(eID);
			//Get the distance
			var distance = stopY > startY ? stopY - startY : startY - stopY;
			//Scroll from 0 to top
			if (distance < 100) {
				scrollTo(0, stopY); 
				return;
			}
			//Do smooth scroll y distance is greter than 100.
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
		},
		/**
		 * Executes the perceptron checking if the values are correct.
		 * @returns The perceptron object.
		 */
		run: function () {
			//Get the values
			var learningReason = document.getElementById('learningIndex').value;
			var maxIterations = document.getElementById('iterationNumber').value;
			var speed = document.getElementById('speed').value;
			if (!this.checkScale()){
				return Perceptron;
			}
			//Check value for initial learning reason
			if (learningReason > 1 || learningReason < 0){
				PerceptronHelper.showError("El valor de aprendizaje ha de estar en el intervalo [0,1]");
				return Perceptron;
			}else{
				Perceptron.perceptronTraining.learningReason = learningReason;
			}
			//Check value for num iterations
			if (maxIterations <= 0 || maxIterations > 100000){
				PerceptronHelper.showError("El número máximo de iteraciones ha de ser mayor que 0 y menor que 100000");
				return Perceptron;
			}else{
				Perceptron.perceptronTraining.maxIterations = maxIterations;
			}
			//Check speed value
			if (speed < 1 || speed > 500){
				PerceptronHelper.showError("La velocidad debe estar en milisegundos entre 1 y 500");
				return Perceptron;
			}else{
				Perceptron.iterationSpeed = speed;
			}
			//Check perceptron points is not empty
			for(var i = 0; i < Perceptron.perceptronTraining.trainingSets.length; i++){
				if (Perceptron.perceptronTraining.trainingSets[i].points.length == 0){
					PerceptronHelper.showError("No puede haber conjuntos de puntos vacios");
					return Perceptron;
				}
			}
			Perceptron.train();
		}
	};
};

//Create perceptron var with class perceptron (PerceptronClass contains Perceptron function what is initialized).
var Perceptron = new PerceptronClass("paint-panel", 100);
//Create perceptron helper that helps to check the correct values.
var PerceptronHelper = new PerceptronHelperClass();
