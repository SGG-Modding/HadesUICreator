var inputHTML = "";

//Simple proof of concept
var legalTags = [
    "html",
    "body",
    "div",
    "p"
];

var tagBuildFunction = {
    "html": null,
    "body": BuildBaseScreen,
    "div": BuildContainer,
    "p": BuildText,
};

//For later, more complex, all feasible ones
// var legalTags = [
//     "html",
//     "head",
//     "body",
//     "div",
//     "p",
//     "pre",
//     "small",
//     "span",
//     "strong",
//     "h1",
//     "h2",
//     "h3",
//     "h4",
//     "h5",
//     "h6",
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
// ];

var legalTagString = buildElementString();

var outputString = "";
var outputArr = [];

var numtextNodes = 0;

var currentXPos = 0;
var currentYPos = 0;

function buildElementString() {
    let retString = "";
    for(var i = 0; i < legalTags.length; i++) {
        retString += legalTags[i] + ", ";
    }
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
            if (parents.every(elem => legalTags.includes(elem.toLowerCase()))) {
                if (tagBuildFunction[node.tagName.toLowerCase()] != null) {
                    tagBuildFunction[node.tagName.toLowerCase()](node);
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
    outputArr = tempOutput.split("\n");
}

function BuildContainer(node) {

    console.log("container");
}

function BuildText(node) {
    //get rid of the end at the end of BuildElements
    outputArr.pop();

    //Calculate width and height

    var fontSize = 25;
    var width, height = calcTextDimensions(fontSize, node.innerText);
    console.log(width, height);

    if (numtextNodes == 0) {
        currentYPos = fontSize;
    }

    var tempOutput = `
        components["textBacking`+numtextNodes+`"] = CreateScreenComponent({ Name = "BlankObstacle", Group = "HTML_Menu", X = ` + currentXPos + `, Y = ` + currentYPos + `})
        CreateTextBox(MergeTables({ Id = components["textBacking`+numtextNodes+`"].Id, Text = "` + node.innerHTML + `",
            FontSize = 25,
            OffsetX = 0, OffsetY = 0,
            Width = 720,
            Color = {0.988, 0.792, 0.247, 1},
            Font = "AlegreyaSansSCBold",
            ShadowBlur = 0, ShadowColor = {0,0,0,1}, ShadowOffset={0, 2},
            Justification = "Left",
        },LocalizationData.SellTraitScripts.ShopButton))`;

    console.log(currentYPos);
    console.log(height);
    currentYPos = parseInt(height + currentYPos); 

    numtextNodes ++;

    var splitOutput = tempOutput.split("\n");

    for (var i = 0; i < splitOutput.length; i++) {
        outputArr.push(splitOutput[i]);
    }

    //Add the end back
    outputArr.push("end");
    BuildOutputString();
    console.log(outputString);
}

function BuildOutputString() {
    outputString = outputArr.join("\n");
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

function calcTextDimensions(fontSize, text) {
    var test = document.createElement("div");
    document.body.appendChild(test);

    test.style = `
    position: absolute;
    visibility: hidden;
    height: auto;
    width: auto;
    white-space: nowrap;
    `
    test.style.fontSize = fontSize;

    test.innerHTML = text;

    var height = (test.clientHeight + 1 + fontSize);
    var width = (test.clientWidth + 1 + fontSize);

    test.remove();

    return width, height;
}

/*
function ShowCuisineScreen(usee)
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
	
	components.ShopBackground = CreateScreenComponent({ Name = "WellShopBackground", Group = "Combat_UI_World" })
	components.ShopBackgroundDim = CreateScreenComponent({ Name = "rectangle01", Group = "Combat_UI_World" })
	
	SetColor({ Id = components.ShopBackgroundDim.Id, Color = {1, 1, 0, 0} })
		
	screen.KeepOpen = true
	thread( HandleWASDInput, screen )
	HandleScreenInput( screen )

end
*/