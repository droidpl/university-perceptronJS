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
		//TODO set the canvas Id.
		//The id of the canvas element
		canvasId: idCanvas,
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
			//TODO Implement here the UI interface changes because the values are not the same.
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
			}
		}
	//Automatically call init
	}.init();
	return Perceptron;
};

//Create perceptron var with class perceptron (PerceptronClass contains Perceptron function what is initialized).
var Perceptron = new PerceptronClass("myCanvas").train();