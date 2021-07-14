var inputHTML = "";

//Simple proof of concept
var legalTags = {
    "html": [null],
    "body": [BuildBaseScreen],
    "div": [BuildContainer],
    "p": [BuildText, {"fontSize": 16}],
    "h1": [BuildText, {"fontSize": 32}],
    "h2": [BuildText, {"fontSize": 24}],
    "h3": [BuildText, {"fontSize": 18.72}],
    "h4": [BuildText, {"fontSize": 16}],
    "h5": [BuildText, {"fontSize": 13.28}],
    "h6": [BuildText, {"fontSize": 10.72}],
    "button": [BuildButton, {"fontSize": 13.33}],
};

//List of all feasible non finished tags
//     "pre",
//     "small",
//     "span",
//     "strong",
//     "b",
//     "br",
//     "i",
//     "q",
//     "button",
//     "img",
//     "lists",
//     "ul",
//     "li",
//     "ol",
//     "li",
//     "dl",
//     "dt",
//     "script",// (will be required for now as js and css will have to be in document)
//     "style", //(like script above will be required)
//     //Available html tags that can be used using erumi’s ui library
//     "progress", // (using sliders)
//     "textarea",
//     "datalist",// (drop downs)
//     "option",
//     "dialog" //(sub screens / modutil)  

var legalTagString = buildElementString();

var outputString = "";
var outputArr = [];

var outputFunctionString = "";
var outputFunctionArr = [];

var numTextNodes = 0;
var numButtonNodes = 0;

var bodyMargin = 8;

var currentXPos = bodyMargin;
var currentYPos = 0;

function buildElementString() {
    let retString = "";
    Object.keys(legalTags)
    .forEach(function eachKey(key) { 
        retString += key + ", ";
    });
    retString = retString.substring(0, retString.length - 2);
    return retString;
}

function updateHTML() {
    inputHTML = document.getElementById("inputHTML").value;
    var parser = new DOMParser();
    var htmlDoc = parser.parseFromString(inputHTML, "text/html");

    //Gets only legal nodes in html
    htmlDoc.querySelectorAll(legalTagString).forEach(function(node) {
        let parents = getAllParentTags(node);
        if (parents.length != 0) {
            if (parents.every(elem => legalTags[elem.toLowerCase()] != null)) {
                var tagBuild = legalTags[node.tagName.toLowerCase()];
                if (tagBuild[0] != null) {
                    console.log(tagBuild[1]);
                    tagBuild[0](node, tagBuild[1]);
                }
            }
        }
    });
}

function BuildBaseScreen() {
    var tempOutput = `
function ShowHTMLScreen()
        local screen = { Components = {} }
        screen.Name = "HTMLConverted"

        if IsScreenOpen( screen.Name ) then
            return
        end
        OnScreenOpened({ Flag = screen.Name, PersistCombatUI = true })
        FreezePlayerUnit()

        SetConfigOption({ Name = "FreeFormSelectWrapY", Value = false })
        SetConfigOption({ Name = "FreeFormSelectStepDistance", Value = 8 })
        SetConfigOption({ Name = "FreeFormSelectSuccessDistanceStep", Value = 8 })
        SetConfigOption({ Name = "FreeFormSelectRepeatDelay", Value = 0.6 })
        SetConfigOption({ Name = "FreeFormSelectRepeatInterval", Value = 0.1 })
        SetConfigOption({ Name = "FreeFormSelecSearchFromId", Value = 0 })

        PlaySound({ Name = "/SFX/Menu Sounds/ContractorMenuOpen" })
        local components = screen.Components
        
        components.background = CreateScreenComponent({ Name = "rectangle01", Group = "HTML_Menu_Backing" })
        
        SetColor({ Id = components.background.Id, Color = {1, 1, 1, 0} })
        
        BuildElements(screen)

        screen.KeepOpen = true
        thread( HandleWASDInput, screen )
        HandleScreenInput( screen )
    end
    
function BuildElements(screen)
	    local components = screen.Components
    end`;
    var tempFuncOutput = `
function CloseHTMLScreen(screen, button)
        DisableShopGamepadCursor()
        SetConfigOption({ Name = "FreeFormSelectStepDistance", Value = 16 })
        SetConfigOption({ Name = "FreeFormSelectSuccessDistanceStep", Value = 8 })
        SetConfigOption({ Name = "FreeFormSelectRepeatDelay", Value = 0.0 })

        PlaySound({ Name = "/SFX/Menu Sounds/ContractorMenuClose" })
        CloseScreen( GetAllIds( screen.Components ) )

        UnfreezePlayerUnit()
        screen.KeepOpen = false
        OnScreenClosed({ Flag = screen.Name })
    end`
    outputArr = tempOutput.split("\n");
    outputFunctionArr = tempFuncOutput.split("\n");
}

function BuildOutputString() {
    var outputString = outputArr.join("\n");

    var outputFunctionString = outputFunctionArr.join("\n");

    return outputString + outputFunctionString;
}

function BuildContainer(node) {

    console.log("container");
}

//#region Text 
function BuildText(node, args) {
    //get rid of the end at the end of BuildElements
    outputArr.pop();

    //Calculate width and height

    var fontSize = args["fontSize"];
    var width, height = calcTextDimensions(fontSize, node.innerText);

    if (numTextNodes == 0) {
        currentYPos = fontSize;
    }

    var tempOutput = `
        components["textBacking`+numTextNodes+`"] = CreateScreenComponent({ Name = "BlankObstacle", Group = "HTML_Menu", X = ` + currentXPos + `, Y = ` + currentYPos + `})
        CreateTextBox(MergeTables({ Id = components["textBacking`+numTextNodes+`"].Id, Text = "` + node.innerText + `",
            FontSize = ` + fontSize + `,
            OffsetX = 0, OffsetY = 0,
            Width = 720,
            Color = {0.988, 0.792, 0.247, 1},
            Font = "AlegreyaSansSCBold",
            ShadowBlur = 0, ShadowColor = {0,0,0,1}, ShadowOffset={0, 2},
            Justification = "Left",
        },LocalizationData.SellTraitScripts.ShopButton))`;

    currentYPos = parseInt(height + currentYPos); 

    numTextNodes ++;

    var splitOutput = tempOutput.split("\n");

    for (var i = 0; i < splitOutput.length; i++) {
        outputArr.push(splitOutput[i]);
    }

    //Add the end back
    outputArr.push("end");

    console.log(BuildOutputString());
}

function getAllParentTags(node) {
    var a = node.parentNode
    var els = [];
    while (a) {
        els.unshift(a.tagName);
        a = a.parentNode;
    }
    els.shift();
    return els;
}

function calcTextDimensions(fontSize, text, fontFamily) {
    var test = document.createElement("div");
    document.body.appendChild(test);

    if (fontFamily == null) {
        fontFamily = "Times New Roman";
    }

    test.style = `
    position: absolute;
    visibility: hidden;
    height: auto;
    width: auto;
    white-space: nowrap;
    font-family: ` + fontFamily + `;
    `
    test.style.fontSize = fontSize;

    test.innerHTML = text;

    var height = (test.clientHeight + 1 + fontSize);
    var width = (test.clientWidth + 1 + fontSize);

    test.remove();

    return width, height;
}

//#endregion

//#region Interactable

function BuildButton(node, args) {
    //get rid of the end at the end of BuildElements
    outputArr.pop();

    var fontSize = args["fontSize"];
    var width = calcButtonTextDimensions(fontSize, node.innerText)[0];
    var height = calcButtonTextDimensions(fontSize, node.innerText)[1];

    console.log(width, height);

    //BoonSlot1 dimensions 873 x 207
    var xScale = parseInt(width) / 873;
    var yScale = parseInt(height) / 207;

    currentXPos = bodyMargin + width / 2;

    //Dimensions / 2 + (average of lr padding - 1)
    var offsetX = parseInt(calcTextDimensions(fontSize, node.innerText, "Arial")) / 2 + (6 - 1);

    var tempOutput = `
        components["button` + numButtonNodes + `"] = CreateScreenComponent({ Name = "BoonSlot1", Group = "HTML_Menu", Scale = 1, X = ` + currentXPos + `, Y = ` + currentYPos + ` });
        SetScaleX({ Id = components["button` + numButtonNodes + `"].Id, Fraction = ` + xScale + `})
        SetScaleY({ Id = components["button` + numButtonNodes + `"].Id, Fraction = ` + yScale + `})
        CreateTextBox({Id = components["button` + numButtonNodes + `"].Id, Text = "` + node.innerText + `",
            FontSize = ` + fontSize + `,
            OffsetX = -` + offsetX + `, OffsetY = 0,
            Width = 720,
            Color = {0.988, 0.792, 0.247, 1},
            Font = "AlegreyaSansSCBold",
            ShadowBlur = 0, ShadowColor = {0,0,0,1}, ShadowOffset={0, 2},
            Justification = "Left",
        })`;

    //build blank function for button click (complete js to lua interpreter may be impossible, at least for scope of project. But simple version may be later)
    if (node.getAttribute("onclick") != null) {
        var functionOutput = `
function button` + numButtonNodes + `Func(screen, button)
        DebugPrint({Text = "button` + numButtonNodes + `Func not implemented"})
end`

        var splitFuncOutput = functionOutput.split("\n");
        for (var i = 0; i < splitFuncOutput.length; i++) {
            outputFunctionArr.push(splitFuncOutput[i]);
        }

        //Add the on pressed call to the button
        tempOutput +=`
        components["button` + numButtonNodes + `"].OnPressedFunctionName = "button` + numButtonNodes + `Func"`;
    }

    numButtonNodes ++;

    currentXPos = bodyMargin;
    currentYPos += 21;

    var splitOutput = tempOutput.split("\n");
    for (var i = 0; i < splitOutput.length; i++) {
        outputArr.push(splitOutput[i]);
    }

    //Add the end back
    outputArr.push("end");

    console.log(BuildOutputString());
}

function calcButtonTextDimensions(fontSize, text, fontFamily) {
    var test = document.createElement("button");
    document.body.appendChild(test);

    if (fontFamily == null) {
        fontFamily = "Arial";
    }

    test.style = `
    position: absolute;
    visibility: hidden;
    font-family: ` + fontFamily + `;
    `
    test.style.fontSize = fontSize;

    test.innerHTML = text;

    var height = test.offsetHeight;
    var width = test.offsetWidth;

    console.log(width, height)

    test.remove();

    return [width, height];
}

//#endregion