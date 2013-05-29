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
		weights : new Array(),
		perceptronTraining : {
			//Gamma value that representr the learning reason
			learningReason : 1,
			maxIterations : 100,
			trainingSet : {
				
			},
			train : function(){
				
			}
		},
		init : function (){
			//Do back reference to get the reference to javascript literal object. Now every literal can access it.
			self = this;
			// Initialize the weights with random values
			for (var i = 0; i < self.dimensions; i++){
				self.weights.push(Math.random());
			}
			//Initialize theta value
			theta = Math.random();
			return self;
		},
		train: function(){
			this.perceptronTraining.train();
		},
		/********************************************
		 * FUNCTION (CLASSES) 
		 ********************************************/
		classes: {
			/**
			 * Neural function that returns true if the value is greater than 0 and false if not.
			 * @param neuralFunction A neural function is a function that receives one parameter as the 
			 * perceptron response and returns the value that represents the group that this value
			 * belongs to.
			 * @param return The group of the value returned by the perceptron.
			 */
			NeuralFunction : function (neuralFunction){
				return neuralResponse >= 0;
			},
			/**
			 * Class that represents a set of points.
			 */
			PointSet : function () {
				this.points = new Array();
				/**
				 * Checks if the given point belongs to the point set.
				 * @param point The Point that will be checked.
				 * @return True if the point belongs to the set.
				 */
				this.belongsTo = function(point){
					for (var i = 0; i < this.points.length; i++) {
				        if (this.points[i] === point) {
				            return true;
				        }
				    }
				    return false;
				};
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
var Perceptron = new PerceptronClass();