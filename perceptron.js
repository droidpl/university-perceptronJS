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
			canvas.reset();
			canvas.DrawAxes();
			canvas.drawTrainingSet(this.perceptronTraining.trainingSets);
			canvas.DrawFunction();
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
				//Store the parent
				var parent = this;
				//Gamma variable
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
					for (var i = 0; i < parent.trainingSets.length; i++){
						maxValuesToCheck += parent.trainingSets[i].length;
					}
					//Set the current values to the max possible
					var currentValuesToCheck = maxValuesToCheck;
					//Start checking all the values to see if they belong to the correct
					//group
					var position = 0;
					var group = 0;
					for (; currentIteration < parent.maxIterations && currentValuesToCheck > 0; currentValuesToCheck--){
						//Get the training set
						var groupSet = parent.trainingSets[group];
						//Perform the calculus of the impulse
						var impulse = parent.weightOperation(groupSet[position]);
						//Check the output of the neuron to check the group it belongs to
						if (! parent.expectedGroupOutputs[group] == parent.neuralFunction.runCalculus(impulse)){
							//Adjust the neuron weights
							parent.adjust(groupSet[position], parent.expectedGroupOutputs[group]);
							//Notify the user interface
							Perceptron.notify();
							//Reset the counter
							currentValuesToCheck = maxValuesToCheck;
						}
						//Increment index
						position++;
						if (position >= parent.trainingSets.length()){
							group = (group + 1) % Perceptron.dimensions;
							position = 0;
						}
					}
				};
				this.adjust = function (point, expectedOutput) {
					for (var i = 0; i < point.length; i++){
						Perceptron.weights[i] += Perceptron.weights[i] * expectedOutput * point.coordinates[i];
					}
					Perceptron.theta += Perceptron.theta * expectedOutput * (-1);
				};
				//Performs the weight operation
				this.weightOperation = function (point) {
					var result = 0;
					for (var i = 0; i < point.length; i++)
						result += point.coordinates[i] * Perceptron.weights[i];
					reuslt += Perceptron.theta * -1;
					return result;
				};
			},
			Canvas : function () {
				//The document canvas where we draw
				var Canvas = false; 
				//Instance of 2D canvas that helps to draw
				var Ctx = false ;
				//The width of the canvas element
				var width = false ;
				//The height of the canvas element
				var height = false ;
				//Minimum distance between X points
				var XUnitary = 1;
				//Minimum distance between Y points
				var YUnitary = 1;
				// Returns the right boundary of the logical viewport
				this.MaxX = function() {
					return 10 ;
				};
				// Returns the left boundary of the logical viewport
				this.MinX = function() {
					return -10 ;
				};
				// Returns the top boundary of the logical viewport
				this.MaxY = function() {
					return this.MaxX() * this.height / this.width;
				};
				// Returns the bottom boundary of the logical viewport
				this.MinY = function() {
					return this.MinX() * this.height / this.width;
				};
				// Returns the physical x-coordinate of a logical x-coordinate
				this.XRealCoord = function(x) {
					return (x - this.MinX()) / (this.MaxX() - this.MinX()) * this.width ;
				};
				// Returns the physical y-coordinate of a logical y-coordinate
				this.YRealCoord = function(y) {
					return this.height - (y - this.MinY()) / (this.MaxY() - this.MinY()) * this.height ;
				};
				// Returns the logical x-coordinate of a physical x-coordinate a mouse click
				this.XLogicalCoord = function(x) {
					var canvas = Perceptron.canvas.Canvas;
//					var stylePaddingLeft = parseInt(window.getComputedStyle(canvas)['paddingLeft'], 10) || 0;
//					var styleBorderLeft = parseInt(window.getComputedStyle(canvas)['borderLeftWidth'], 10) || 0;
					var html = document.body.parentNode;
					var htmlLeft = html.offsetLeft;
					var offsetX = 0;
//					if (canvas.offsetParent != undefined) {
//				        do {
//				            offsetX += canvas.offsetLeft;
//				        } while ((canvas = canvas.offsetParent));
//				    }
					return x*(this.MaxX() - this.MinX())/this.width + this.MaxX() - (offsetX /* + stylePaddingLeft + styleBorderLeft*/ + htmlLeft);
				};
				// Returns the logical y-coordinate of a physical y-coordinate of a mouse click
				this.YLogicalCoord = function(y) {
					var canvas = Perceptron.canvas.Canvas;
//					var stylePaddingTop = parseInt(window.getComputedStyle(canvas)['paddingTop'], 10) || 0;
//					var styleBorderTop = parseInt(window.getComputedStyle(canvas)['borderTopWidth'], 10) || 0;
					var html = document.body.parentNode;
					var htmlTop = html.offsetTop;
					var offsetY = 0;
//					if (canvas.offsetParent !== undefined) {
//				        do {
//				            offsetY += canvas.offsetTop;
//				        } while ((canvas = canvas.offsetParent));
//				    }
					return (y - this.height)*(this.MaxY() - this.MinY())/this.height + this.MinY() - (offsetY/* + stylePaddingTop + styleBorderTop */+ htmlTop);
				};
				//Reset the canvas
				this.reset = function () {
					this.Ctx.clearRect(0,0,this.width,this.height) ;
				};
				//Draw the axes X and Y of the canvas
				this.DrawAxes = function() {
					this.Ctx.save() ;
					this.Ctx.lineWidth = 2 ;
					// +Y axis
					this.Ctx.beginPath() ;
					this.Ctx.moveTo(this.XRealCoord(0),this.YRealCoord(0)) ;
					this.Ctx.lineTo(this.XRealCoord(0),this.YRealCoord(this.MaxY())) ;
					this.Ctx.stroke() ;

					// -Y axis
					this.Ctx.beginPath() ;
					this.Ctx.moveTo(this.XRealCoord(0),this.YRealCoord(0)) ;
					this.Ctx.lineTo(this.XRealCoord(0),this.YRealCoord(this.MinY())) ;
					this.Ctx.stroke() ;

					// Y axis tick marks
					for (var i = 1; (i * this.YUnitary) < this.MaxY() ; ++i) {
						this.Ctx.beginPath() ;
						this.Ctx.moveTo(this.XRealCoord(0) - 5,this.YRealCoord(i * this.YUnitary)) ;
						this.Ctx.lineTo(this.XRealCoord(0) + 5,this.YRealCoord(i * this.YUnitary)) ;
						this.Ctx.stroke() ;  
					}

					for (var i = 1; (i * this.YUnitary) > this.MinY() ; --i) {
						this.Ctx.beginPath() ;
						this.Ctx.moveTo(this.XRealCoord(0) - 5,this.YRealCoord(i * this.YUnitary)) ;
						this.Ctx.lineTo(this.XRealCoord(0) + 5,this.YRealCoord(i * this.YUnitary)) ;
						this.Ctx.stroke() ;  
					}  

					// +X axis
					this.Ctx.beginPath() ;
					this.Ctx.moveTo(this.XRealCoord(0),this.YRealCoord(0)) ;
					this.Ctx.lineTo(this.XRealCoord(this.MaxX()),this.YRealCoord(0)) ;
					this.Ctx.stroke() ;

					// -X axis
					this.Ctx.beginPath() ;
					this.Ctx.moveTo(this.XRealCoord(0),this.YRealCoord(0)) ;
					this.Ctx.lineTo(this.XRealCoord(this.MinX()),this.YRealCoord(0)) ;
					this.Ctx.stroke() ;

					// X tick marks
					for (var i = 1; (i * this.XUnitary) < this.MaxX() ; ++i) {
						this.Ctx.beginPath() ;
						this.Ctx.moveTo(this.XRealCoord(i * this.XUnitary),this.YRealCoord(0)-5) ;
						this.Ctx.lineTo(this.XRealCoord(i * this.XUnitary),this.YRealCoord(0)+5) ;
						this.Ctx.stroke() ;  
					}

					for (var i = 1; (i * this.XUnitary) > this.MinX() ; --i) {
						this.Ctx.beginPath() ;
						this.Ctx.moveTo(this.XRealCoord(i * this.XUnitary),this.YRealCoord(0)-5) ;
						this.Ctx.lineTo(this.XRealCoord(i * this.XUnitary),this.YRealCoord(0)+5) ;
						this.Ctx.stroke() ;  
					}
					this.Ctx.restore() ;
				};
				//Draw the training set in the canvas
				this.drawTrainingSet = function (trainingSets) {
					for(var i=0; i<trainigSets.length; i++){
						drawPoint(trainigSets[i][0],trainigSets[i][1]);
					}
				};
				//Draw point
				this.drawPoint = function(x,y,set){
					switch (set) {
						case 0:
							this.Ctx.fillStyle   = '#00f'; // blue
							this.Ctx.fillRect(this.XRealCoord(x), this.YRealCoord(y), 2, 2);
							this.Ctx.fillStyle = '#000'; // black
							this.Ctx.fillText((x + ',' + y), this.XRealCoord(x), this.YRealCoord(y) + 10);
							break;
						case 1:
							this.Ctx.fillStyle = '#f00'; // red
							this.Ctx.fillRect(this.XRealCoord(x), this.YRealCoord(y), 2, 2);
							this.Ctx.fillStyle = '#000'; // black
							this.Ctx.fillText((x + ',' + y), this.XRealCoord(x), this.YRealCoord(y) + 10);
							break;
					}
				};
				//Draw the function in the canvas
				this.DrawFunction = function() {
					var first = true;
					//Horizontal distance between points
					var XSTEP = (this.MaxX()-this.MinX())/this.width ;
					
					this.Ctx.beginPath() ;
					for (var x = this.MinX(); x <= this.MaxX(); x += XSTEP) {
						var y = Perceptron.perceptronTraining.weightOperation(x) ;
						if (first) {
							this.Ctx.moveTo(this.XRealCoord(x),this.YRealCoord(y)) ;
							first = false ;
						} else {
							this.Ctx.lineTo(this.XRealCoord(x),this.YRealCoord(y)) ;
						}
					}
					this.Ctx.stroke() ;
				};
				//Mouse click on the canvas
				this.mouseClick = function(canvas,e){
					var rect = canvas.getBoundingClientRect();
					var myx = Math.round(((e.clientX - rect.left)*(Perceptron.canvas.MaxX())/canvas.width) + ((e.clientX - rect.left)*(Perceptron.canvas.MaxX())/canvas.width) );
					var myy = Math.round(-1*(e.clientY -rect.top)*Perceptron.canvas.MaxY()/canvas.height + Perceptron.canvas.MaxY());
					var point = new Perceptron.classes.Point({
						 x:myx,
						 y:myy
					 });
					alert(point.coordinates.x + "    " + point.coordinates.y);
					 switch (event.which) {
					 	case 1: //Left button
							Perceptron.canvas.drawPoint(point.coordinates.x,point.coordinates.y,0);
							Perceptron.addPointToTrainingSet(point,0);
		                    break;
		                case 2: //Middle button
		                    break;
		                case 3://Right button
							Perceptron.canvas.drawPoint(point.coordinates.x,point.coordinates.y,1);
							Perceptron.addPointToTrainingSet(point,1);
		                    break;
		             }
				};
				//Initialize the canvas when the document is ready
				window.onload = function (){
					var canvas = Perceptron.canvas.Canvas;
					canvas = document.getElementById(Perceptron.canvasId);
					canvas.addEventListener('mousedown',  function(e) {
						Perceptron.canvas.mouseClick(canvas,e);
					},false);
					canvas.addEventListener('contextmenu', function(e) { //Block right button menu
						e.preventDefault();
						return false;
					}, false);
					Perceptron.canvas.Ctx = canvas.getContext('2d');
					Perceptron.canvas.width = canvas.width;
					Perceptron.canvas.height = canvas.height;
					Perceptron.canvas.DrawAxes();
				};
			}
		}
	//Automatically call init
	}.init();
	return Perceptron;
};

//Create perceptron var with class perceptron (PerceptronClass contains Perceptron function what is initialized).
var Perceptron = new PerceptronClass("paint-panel").train();