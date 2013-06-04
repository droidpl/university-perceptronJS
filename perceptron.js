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
				this.weights.push(Math.random());
				this.perceptronTraining.trainingSets.push(new this.classes.PointSet());
			}
			//Initialize theta value
			this.theta = Math.random();
			
			//Initialize expected outputs
			return this;
		},
		/**
		 * Performs the training process of the neural network.
		 * It is a shortcut fot perceptronTraining.
		 */
		train: function () {
			
			this.perceptronTraining.train();
			return this;
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
			this.canvas.initScale();
			this.canvas.drawTrainingSet(this.perceptronTraining.trainingSets);
			this.canvas.drawFunction();
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
				this.maxIterations = 100;
				//The training sets
				this.trainingSets = new Array ();
				// Expected output for the training sets
				this.expectedGroupOutputs = expectedOutputs;
				//The neural function
				this.neuralFunction = neuralFunction,
				//Train the data of the perceptron
				this.train = function () {
					//The initial iteration is 0
					var currentIteration = 0;
					var maxValuesToCheck = 0;
					//Get the max number of points to check
					for (var i = 0; i < this.trainingSets.length; i++){
						maxValuesToCheck += this.trainingSets[i].points.length;
					}
					//Set the current values to the max possible
					var currentValuesToCheck = maxValuesToCheck;
					//Start checking all the values to see if they belong to the correct
					//group
					var position = 0;
					var group = 0;
					var decrementLearningReason = this.learningReason/this.maxIterations;
					Perceptron.notify();
					for (; currentIteration < this.maxIterations && currentValuesToCheck > 0; currentValuesToCheck--){
						//Get the training set
						var groupSet = this.trainingSets[group].points;
						//Perform the calculus of the impulse
						var impulse = this.weightOperation(groupSet[position]);
						//Check the output of the neuron to check the group it belongs to
						if (this.expectedGroupOutputs[group] != this.neuralFunction.runCalculus(impulse)){
							//Adjust the neuron weights
							this.adjust(groupSet[position], this.expectedGroupOutputs[group]);
							//Notify the user interface
							Perceptron.notify();
							//Reset the counter
							currentValuesToCheck = maxValuesToCheck;
						}
						//Increment index
						position++;
						if (position >= groupSet.length){
							group = (group + 1) % Perceptron.dimensions;
							position = 0;
							if(group == 0){
								currentIteration++;
								this.learningReason -= decrementLearningReason;
							}
						}
					}
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
				//2D Function with the current weights
				this.f = function(x){
					return (Perceptron.theta - x*Perceptron.weights[0])/Perceptron.weights[1];
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
				// Returns the physical x-coordinate of a logical x-coordinate
				this.xRealCoord = function(x) {
					return (x - this.minX) / (this.maxX - this.minX) * this.width ;
				};
				this.yRealCoord = function(y) {
					return this.height - (y - this.minY) / (this.maxY - this.minY) * this.height ;
				};
				//Reset the canvas
				this.reset = function () {
					this.ctx.clearRect(0,0,this.width,this.height) ;
				};
				//Draw the axes X and Y of the canvas
				this.drawAxes = function() {
					this.reset();
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

					for (var i = 1; (i * this.xUnitary) > this.minX ; --i) {
						this.ctx.beginPath() ;
						this.ctx.moveTo(this.xRealCoord(i * this.xUnitary),this.yRealCoord(0)-5) ;
						this.ctx.lineTo(this.xRealCoord(i * this.xUnitary),this.yRealCoord(0)+5) ;
						this.ctx.stroke() ;  
					}
					this.ctx.restore() ;
				};
				//Draw the training set in the canvas
				this.drawTrainingSet = function (trainingSets) {
					for (var i = 0; i < trainingSets.length; i++){
						for(var j = 0; j < trainingSets[i].points.length; j++){
							this.drawPoint(trainingSets[i].points[j].coordinates[0],trainingSets[i].points[j].coordinates[1], i);
						}
					}
				};
				//Draw point
				this.drawPoint = function(x, y, set){
					switch (set) {
						case 0:
							this.ctx.fillStyle   = '#00f'; // blue
							//this.ctx.fillRect(this.xRealCoord(x), this.yRealCoord(y), 4, 4);
							this.ctx.beginPath();
							this.ctx.arc(this.xRealCoord(x), this.yRealCoord(y), 2, 0, Math.PI*2, true); 
							this.ctx.closePath();
							this.ctx.fill();
							this.ctx.fillStyle = '#000'; // black
							this.ctx.fillText(('(' + x + ',' + y + ')'), this.xRealCoord(x), this.yRealCoord(y) + 10);
							break;
						case 1:
							this.ctx.fillStyle = '#f00'; // red
							//this.ctx.fillRect(this.xRealCoord(x), this.yRealCoord(y), 4, 4);
							this.ctx.beginPath();
							this.ctx.arc(this.xRealCoord(x), this.yRealCoord(y), 2, 0, Math.PI*2, true); 
							this.ctx.closePath();
							this.ctx.fill();
							this.ctx.fillStyle = '#000'; // black
							this.ctx.fillText(('(' + x + ',' + y + ')'), this.xRealCoord(x), this.yRealCoord(y) + 10);
							break;
					}
				};
				//Draw the function in the canvas
				this.drawFunction = function() {
					var first = true;
					//Horizontal distance between points
					var XSTEP = (this.maxX-this.minX)/this.width ;
					this.ctx.fillStyle = '#a83f'; // black
					this.ctx.beginPath() ;
					for (var x = this.minX; x <= this.maxX; x += XSTEP) {
						var y = Perceptron.perceptronTraining.f(x) ;
						if (first) {
							this.ctx.moveTo(this.xRealCoord(x),this.yRealCoord(y)) ;
							first = false ;
						} else {
							this.ctx.lineTo(this.xRealCoord(x),this.yRealCoord(y)) ;
						}
					}
					this.ctx.stroke() ;
				};
				//Mouse click on the canvas
				this.mouseClick = function(canvas, e){
					var rect = canvas.getBoundingClientRect();
					var x = Math.round((((e.clientX - rect.left)*(this.maxX - this.minX)/this.width + this.minX)));
					var y = Math.round(-1*(e.clientY -rect.top)*(this.maxY - this.minY)/this.height + this.maxY);
					var point = new Perceptron.classes.Point(new Array(x,y));
					if(!(Perceptron.perceptronTraining.trainingSets[0].contains(point) || Perceptron.perceptronTraining.trainingSets[1].contains(point))){
						switch (event.which) {
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
				//Initialize the canvas when the document is ready
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
				//Init function
				this.initScale = function () {
					this.width = this.canvas.width;
					this.height = this.canvas.height;
					this.maxY = this.maxX * this.height / this.width;
					this.minY = this.minX * this.height / this.width;
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
		}
	};
};

//Create perceptron var with class perceptron (PerceptronClass contains Perceptron function what is initialized).
var Perceptron = new PerceptronClass("paint-panel");
var PerceptronHelper = new PerceptronHelperClass();
