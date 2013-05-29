/**The MIT License (MIT)

Copyright (c) <2013>
<AdriÃ¡n Casimiro Ã�lvarez>
<Javier de Pedro LÃ³pez>

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
*  Perceptron class
*/
function Perceptron (theta, weights, maxIteration, neuralFunction) {
    this.theta = theta;
    this.weights = weights;
    this.maxIteration = maxIteration;
    this.neuralFunction = neuralFunction;
}

Perceptron.prototype.neuralIteration = function () {

};

/**
* Training class
*/
function Training(gamma, trainingSet) {
    this.gamma = gamma;
    this.trainingSet = trainingSet;
}

Training.prototype.train = function () {

};

/**
* TrainingSet class
*/
function TrainingSet () {

}

/**
 * PointSet class
 */
function PointSet () {
    this.points = new Array();
}

PointSet.prototype.addPoint = function (point) {
    this.points.push(point);
};

/**
 * Point class
 */
function Point(x, y){
    this.x = x;
    this.y = y;
}