//This is fired when the window loads
window.onload = function () {
    var el = document.getElementById('content'); //grab the DOM (easy peasy, this is JS)
    var greeter = new Greeter(el); //Create an object C# style
    greeter.start(); //call a function C# style
};
var Greeter = /** @class */ (function () {
    function Greeter(element) {
        this.element = element; //Assign them just like you would in C#
        this.element.innerHTML += "The time is: ";
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this.span.innerText = new Date().toUTCString();
    }
    Greeter.prototype.start = function () {
        var _this = this;
        this.timerToken = setInterval(function () { return _this.span.innerHTML = new Date().toUTCString(); }, 500);
    };
    Greeter.prototype.stop = function () {
        clearTimeout(this.timerToken);
    };
    return Greeter;
}());
//# sourceMappingURL=app.js.map