window.exampleJsFunctions = {
    showPrompt: function (text) {
        return prompt(text, 'Type your name here');
    },
    displayWelcome: function (welcomeMessage) {
        document.getElementById('welcome').innerText = welcomeMessage;
    },
    returnArrayAsyncJs: function () {
        DotNet.invokeMethodAsync('BlazorSample', 'ReturnArrayAsync')
            .then(data => {
                data.push(4);
                console.log(data);
            });
    },
    sayHello: function (dotnetHelper) {
        return dotnetHelper.invokeMethodAsync('SayHello')
            .then(r => console.log(r));
    },
    selectDOMbyID: function (domID) {
        return document.getElementById(domID);
    },
    setInnerText: function (elementID, text) {
        document.getElementById(elementID).innerText = text;
    },
    getElementChildrenIDs: function (elementID) {
        var el = document.getElementById(elementID);
        var data = [];
        if (el.childNodes == null || el.childNodes.length < 1) { return data; }
        for (var item in el.childNodes){
            data.push(item.id);
        }
        return data;
    },
    getElementData(elementID) {
        var el = document.getElementById(elementID);
        return this.buildElementData(el);
    },
    buildElementData: function (e) {
        if (e == null) { return null;}
        var data = [];
        data.push(e.tagName);
        data.push(e.id);
        return data;
    },
    setDOMInnerText: function (element, text) {
        if (element == null) { console.log("element is null"); }
        element.innerText = text;
    },
    addElementHTML(tagName, parentId, attrKeys, attrValues) {
        var p = document.getElementById(parentId);
        if (p == null) { console.log("could not find element with id " + parentId); p = document; }
        var el = p.createElement(tagName);
        for (i = 0; i < attrKeys.length; ++i) {
            el.setAttribute(attrKeys[i], attrValues[i]);
        }
        p.append(el);
    },
};