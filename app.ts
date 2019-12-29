//This is fired when the window loads
window.onload = () => {
    var el = document.getElementById('content'); //grab the DOM (easy peasy, this is JS)
    var greeter = new Greeter(el); //Create an object C# style
    greeter.start(); //call a function C# style
};

class Greeter {
    element: HTMLElement; //our cached variables up here
    span: HTMLElement;
    timerToken: number;

    constructor(element: HTMLElement) { //Take a DOM as a parameter (interesting!)
        this.element = element; //Assign them just like you would in C#
        this.element.innerHTML += "The time is: ";
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this.span.innerText = new Date().toUTCString();
    }

    start() {
        this.timerToken = setInterval(() => this.span.innerHTML = new Date().toUTCString(), 500);
    }

    stop() {
        clearTimeout(this.timerToken);
    }

}

