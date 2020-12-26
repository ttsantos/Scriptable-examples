// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: futbol; share-sheet-inputs: plain-text;

var varLeagueId = 11769;
var varEntryId = 2699654;
var varEntryIdLeader = 0;

const urlImage = 'https://i.ibb.co/59t5X8H/FPL-Statement-Lead-2.png';
const imageReq = new Request(urlImage);
var imageLoaded = await imageReq.loadImage();

// Forces signing on a number, returned as a string
function getNumber(theNumber)
{
    if(theNumber > 0){
        return "+" + theNumber;
    } else{
        return theNumber.toString();
    }
}

if(args.widgetParameter != null) 
{		
  let paramConfigJ = JSON.parse(args.widgetParameter)
  varLeagueId = paramConfigJ['leagueId'];
  varEntryId = paramConfigJ['teamId'];

}

//get all standings
const url_1 = `https://fantasy.premierleague.com/api/leagues-classic/${varLeagueId}/standings/`;
const req_1 = new Request(url_1);
const result_1 = await req_1.loadJSON(); 

//initial call to get gameweek points with leagueId

const url_2 = `https://fantasy.premierleague.com/api/entry/${varEntryId}/`;
const req_2 = new Request(url_2);
const result_2 = await req_2.loadJSON();

var currentGameWeek = result_2.current_event;
console.log(currentGameWeek);
var liveData = await getLiveData(currentGameWeek);

//initial call for picks with entryId and currentEvent;
async function getTeamPicks(teamId){
  var url_3 = `https://fantasy.premierleague.com/api/entry/${teamId}/event/${currentGameWeek}/picks/`;
  var req_3 = new Request(url_3);
  var result_3 = await req_3.loadJSON();
  return result_3;
}

// get live data for current GameWeek
async function getLiveData(){
  const url_4 = `https://fantasy.premierleague.com/api/event/${currentGameWeek}/live/`;
  const req_4 = new Request(url_4);
  const result_4 = await req_4.loadJSON();
  return result_4;
}

// get live points by elementId (Player)
function getLivePoints(dataArray, elementId){
  var array_temp = dataArray;
  for (var i=0; i < array_temp.elements.length ; i++){
   if(array_temp.elements[i].id == elementId){
    return array_temp.elements[i].stats.total_points;
    } 
  }
}

// get total live points by teamId
async function getTotalLivePoints(teamId){
  var totalPoints = 0;
  var dataTP = null;
  dataTP = await getTeamPicks(teamId);
  
  for (var i=0; i < dataTP.picks.length; i++){
    var temp = getLivePoints(liveData, dataTP.picks[i].element);
    totalPoints = totalPoints + temp * dataTP.picks[i].multiplier;
    totalPoints = totalPoints + dataTP.entry_history.event_transfers_cost;
  }
  return totalPoints;
}

// get #1 Points to check difference
async function getLeagueLiveLeaderPoints(){
  
  var array_temp = result_1.standings.results;
  var teamTopPoints = 0;
  var teamTopPointsIncludingOtherGW = 0;
  var teamLeaderIncludingOtherGW = 0;
  for (var i=0; i < array_temp.length ; i++){
    var teamToGetValues = array_temp[i].entry;
    var TotalPointsTeam = 0;
    var TotalPointsTeam = await getTotalLivePoints(teamToGetValues);
    var TotalPointsIncludingLive = 0;
    var TotalPointsIncludingLive = await getTotalPoints(teamToGetValues);
    console.log('#2: Team:' + teamToGetValues + ', Live Points: ' + TotalPointsTeam + ', Total Points: ' + TotalPointsIncludingLive);
    if(TotalPointsTeam > teamTopPoints){
      teamTopPoints = TotalPointsTeam;
    }
    if(TotalPointsIncludingLive > teamTopPointsIncludingOtherGW){
      teamTopPointsIncludingOtherGW = TotalPointsIncludingLive;
      teamLeaderIncludingOtherGW = teamToGetValues;
    }
    varEntryIdLeader = teamLeaderIncludingOtherGW;
  }
  return teamTopPoints;
}

async function getTotalPoints(teamId){
  var isUpdated = result_1.standings.results[0].event_total;
  if(isUpdated == 0){
    var liveScore = await getTotalLivePoints(teamId);
    return findFPLData(result_1,teamId).total + liveScore;
  }
  else return findFPLData(result_1,teamId).total + findFPLData(result_1,teamId).event_total;
}


// generic functions to retrieve FPL Data
function findFPLData(data, idToLookFor) {
    var categoryArray = data.standings.results;
    for (var i = 0; i < categoryArray.length; i++) {
        if (categoryArray[i].entry == idToLookFor) {
            return(categoryArray[i]);
        }
    }
}

var topScoreGW = await getLeagueLiveLeaderPoints();
var myScore = await getTotalLivePoints(varEntryId);
//var myScoreTotal = await getTotalPoints(varEntryId);
var differencePointsFromFirst = myScore - topScoreGW;
console.log('topGW:' + topScoreGW + ', my team:'+ myScore + ', diff:' + differencePointsFromFirst);

var totalPointsLeader = await getTotalPoints(varEntryIdLeader);
var MyTotalPoints = await getTotalPoints(varEntryId);
var differencePointsFromFirstAll = totalPointsLeader - MyTotalPoints;
console.log('topPointsLeader:' + totalPointsLeader + ', my team:'+ MyTotalPoints + ', diff:' + differencePointsFromFirstAll);


// Widget Configuration;

if (config.runsInWidget) {
  // create and show widget
  let widget = createWidget(findFPLData(result_1,varEntryId).entry_name, "League Leader:", totalPointsLeader , "GW Live Points", myScore, differencePointsFromFirst, differencePointsFromFirstAll);
  Script.setWidget(widget);
  Script.complete();
} else {
  
if (config.runsWithSiri){
  
  Speech.speak(`Live updates gives you ${myScore} points and a difference from the first on this gameweek of ${differencePointsFromFirst} points.`);
  } 
else {
    let alert = new Alert();
    alert.title = 'Today';
    alert.message = `Live updates gives you ${myScore} points and a difference from the first on this gameweek of ${differencePointsFromFirst} points.`;
    alert.presentAlert();
    }
}

function createWidget(teamName, RankLabel, read, preTodo, todos, pointsDifference, pointsDifferenceAll) {
  let widget = new ListWidget();
  //populate background
  
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
  let titleTxtTodo = widget.addText(todos.toString() + ' (' + getNumber(pointsDifference) + ' pts)');
  titleTxtTodo.textColor = Color.white();
  titleTxtTodo.textSize = 23;

  let spacer = widget.addSpacer();

  let RankLabelTxt = widget.addText(RankLabel.toString());
  RankLabelTxt.textColor = Color.white();
  RankLabelTxt.textOpacity = 0.8;
  RankLabelTxt.textSize = 14;
  let readTxt = widget.addText(read.toString() + ' (' + getNumber(pointsDifferenceAll) + ' pts)');
  readTxt.textColor = Color.white();
  readTxt.textSize = 23;

return widget;
}

