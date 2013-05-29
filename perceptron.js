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


var PerceptronClass = function Perceptron (){
	return {
		//Literal object self reference
		self: false,
		//Default we use 2 as R^2 dimension is the plan
		dimensions: 2,
		//Theta value of the neuron.
		theta : 0,
		weights : new Array (),
		perceptronTraining : {
			//Gamma value that represents the learning reason
			learningReason : 1,
			maxIterations : 100,
			trainingSets : new Array (),
			expectedGroupOutputs :new Array(),
			neuralFunction : false,
			train : function () {
				//The initial iteration is 0
				var currentIteration = 0;
				var maxValuesToCheck = 0;
				//Get the max number of points to check
				for (var i = 0; i < self.perceptronTraining.trainingSets.length; i++){
					maxValuesToCheck += self.perceptronTraining.trainingSets[i].length;
				}
				//Set the current values to the max possible
				var currentValuesToCheck = maxValuesToCheck;
				//Start checking all the values to see if they belong to the correct
				//group
				var position = 0;
				var group = 0;
				for (; currentIteration < self.perceptronTraining.maxIterations && currentValuesToCheck > 0; currentValuesToCheck--){
					//Get the training set
					var groupSet = self.perceptronTraining.trainingSets[group];
					//Perform the calculus of the impulse
					var impulse = self.perceptronTraining.weightOperation(groupSet[position]);
					//Check the output of the neuron to check the group it belongs to
					if (! self.perceptronTraining.expectedGroupOutputs[group] == self.perceptronTraining.neuralFunction.runCalculus(impulse)){
						//Adjust the neuron weights
						self.perceptronTraining.adjust(groupSet[position] ,self.perceptronTraining.expectedGroupOutputs[group]);
						//Notify the user interface
						self.notify();
						//Reset the counter
						currentValuesToCheck = maxValuesToCheck;
					}
					//Increment index
					position++;
					if (position >= self.perceptronTraining.trainingSets.length()){
						group = (group + 1) % self.dimensions;
						position = 0;
					}
				}
			},
			adjust : function (point, expectedOutput) {
				self.weights[0] += self.weights[0] * expectedOutput * point.x;
				self.weights[1] += self.weights[1] * expectedOutput * point.y;
				self.theta += self.theta * expectedOutput * (-1);
			},
			weightOperation : function (point) {
				return point.x * self.weights[0] + point.y * self.weights[1] + self.theta * -1;
			}
		},
		/**
		 * Initialize the perceptron object.
		 */
		init : function () {
			//Do back reference to get the reference to javascript literal object. Now every literal can access it.
			self = this;
			// Initialize the weights with random values and the pointsets
			for (var i = 0; i < self.dimensions; i++){
				self.weights.push(Math.random());
				self.perceptronTraining.trainingSets.push(new self.classes.PointSet());
			}
			//Initialize theta value
			theta = Math.random();
			//Initialize neural function
			self.perceptronTraining.neuralFunction = new self.classes.NeuralFunction( function (perceptronResponse) {
				if(perceptronResponse >= 0) return 1; //Greater or equal to 0 belongs to first group
				else return -1; //Less than 0 belongs to second group
			});
			//Initialize expected group outputs
			self.perceptronTraining.expectedGroupOutputs.push(-1);
			self.perceptronTraining.expectedGroupOutputs.push(1);
			//Initialize expected outputs
			return self;
		},
		/**
		 * Performs the training process of the neural network.
		 * It is a shortcut fot perceptronTraining.
		 */
		train: function () {
			self.perceptronTraining.train();
		},
		/**
		 * Adds a new point to the training set.
		 * @param point The point to add.
		 * @param trainingSetIndex On which training set it will be added.
		 */
		addPointToTrainingSet : function(point, trainingSetIndex){
			self.perceptronTraining.trainingSets[trainingSetIndex].addPoint(point);
		},
		/**
		 * Removes a new point to the training set.
		 * @param point The point to remove.
		 * @param trainingSetIndex From which training set it will be removed.
		 */
		removePointFromTrainingSet : function(point, trainingSetIndex){
			self.perceptronTraining.trainingSets[trainingSetIndex].removePoint(point);
		},
		/**
		 * Notifies the change of the training values to the user interface and 
		 * whatever interested on it.
		 */
		notify : function(){
			//TODO Implement here the UI interface changes the values are not the same.
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
			PointSet : function (expectedNeuralOutput) {
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
			 * @param x The x value for the canvas.
			 * @param y The y value on the canvas.
			 */
			Point: function (x, y) {
				this.x = x;
				this.y = y;
			}
		}
	//Automatically call init
	}.init();
};

//Create perceptron var with class perceptron (PerceptronClass contains Perceptron function what is initialized).
var Perceptron = new PerceptronClass().train();