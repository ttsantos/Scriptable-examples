// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: futbol; share-sheet-inputs: plain-text;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: user-md;

// The LeagueId  you use to track your league - default 11769 
// Go to https://fantasy.premierleague.com/leagues and click the league you want;
// It will open a new link and the number is the leagueId
var leagueId = 11769;

// The teamId you use to identify your specific team points - 2699654; 446373
// Go to https://fantasy.premierleague.com and click points;
// New link has the first number as your team id;
var teamId = 2699654; 

// default parameters: {"leagueId":11769,"teamId":2699654}

if(args.widgetParameter != null) 
{		
let paramConfigJ = JSON.parse(args.widgetParameter)
//console.log(params);
leagueId = paramConfigJ['leagueId'];
teamId = paramConfigJ['teamId'];

}

//initial call for standings;
const url = `https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings/`;
const req = new Request(url);
const result = await req.loadJSON();


// populate background
//const urlImage = 'https://i.ibb.co/59t5X8H/FPL-Statement-Lead-2.png';
const urlImage = 'https://github.com/ttsantos/Scriptable-examples/blob/main/FPL-Statement-Lead-2-2.png?raw=true';
const imageReq = new Request(urlImage);
var imageLoaded = await imageReq.loadImage();


// generic functions to retrieve FPL Data
function findFPLData(data, idToLookFor) {
    var categoryArray = data.standings.results;
    for (var i = 0; i < categoryArray.length; i++) {
        if (categoryArray[i].entry == idToLookFor) {
            return(categoryArray[i]);
        }
    }
}

// generic function to retrieve specific rank
function findFPLDataByRank(data, rankToLookFor) {
    var categoryArray = data.standings.results;
    for (var i = 0; i < categoryArray.length; i++) {
        if (categoryArray[i].rank == rankToLookFor) {
            return(categoryArray[i]);
        }
    }
}

// added data
var differencePointsFromFirst = -(findFPLDataByRank(result,1).total - findFPLData(result,teamId).total);
var rankIncreased = findFPLData(result,teamId).rank < findFPLData(result,teamId).last_rank ? true : false ;

//populate data in Widget

if (config.runsInWidget) {
  // create and show widget
  let colour = rankIncreased ? '#41cb86' : '#33C6FF';
  let widget = createWidget(findFPLData(result,teamId).entry_name, "Total Rank", findFPLData(result,teamId).rank , "GW Points", findFPLData(result,teamId).event_total, differencePointsFromFirst ,colour);
  Script.setWidget(widget);
  Script.complete();
} else {
  
if (config.runsWithSiri){
  
  Speech.speak(`Today you are ranked as ${findFPLData(result,teamId).rank} and last gameweek you got ${findFPLData(result,teamId).event_total} points.`);
  } 
else {
    let alert = new Alert();
    alert.title = 'Today';
    alert.message = `Today you are ranked as ${findFPLData(result,teamId).rank} and last gameweek you got ${findFPLData(result,teamId).event_total} points.`;
    alert.presentAlert();
    }
}

function createWidget(teamName, preRead, read, preTodo, todos, pointsDifference, color) {
let widget = new ListWidget();
widget.backgroundImage = imageLoaded;

let teamNameTxt = widget.addText(teamName.toString());
teamNameTxt.textColor = Color.white();
teamNameTxt.textOpacity = 0.8;
teamNameTxt.textSize = 18;

let spacer1 = widget.addSpacer();

let preTodoTxt = widget.addText(preTodo.toString());
preTodoTxt.textColor = Color.white();
preTodoTxt.textOpacity = 0.8;
preTodoTxt.textSize = 14;
let titleTxtTodo = widget.addText(todos.toString() );
titleTxtTodo.textColor = Color.white();
titleTxtTodo.textSize = 23;

let spacer = widget.addSpacer();

let preReadTxt = widget.addText(preRead.toString());
preReadTxt.textColor = Color.white();
preReadTxt.textOpacity = 0.8;
preReadTxt.textSize = 14;
let readTxt = widget.addText(read.toString() + ' (' + pointsDifference.toString()+ ' pts)');
readTxt.textColor = Color.white();
readTxt.textSize = 23;

return widget;
}