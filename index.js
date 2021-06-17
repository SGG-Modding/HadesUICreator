var inputHTML = "";

function updateHTML() {
    inputHTML = document.getElementById("inputHTML").value;
    var parser = new DOMParser();
    var htmlDoc = parser.parseFromString(inputHTML, "text/html");
    htmlDoc.querySelectorAll('*').forEach(function(node) {
        console.log(node.tagName);
    });
    console.log(htmlDoc);
}