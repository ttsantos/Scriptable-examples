// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: magic;
// OGS Notifier
// Sample args for the app
// username is the same as the website;
// game is the id on the link of the game you are currently playing;
// {"username":"ttsantos","game":40471380}



    
if(args.widgetParameter != null) 
{		
let paramConfigJ = JSON.parse(args.widgetParameter)
//console.log(params);
username = paramConfigJ['username'];
game = paramConfigJ['game'];

} else {
  // set default username;
  username = "ttsantos";
  // set default game to check;
  game = 40471380
}

const urlImage = 'https://github.com/online-go/online-go.com/blob/devel/assets/icons/favicon-96x96.png?raw=true';
const imageReq = new Request(urlImage);
var imageLoaded = await imageReq.loadImage();
  

async function loadJSON(url) {
  let req = new Request(url)
  let txt = await req.loadJSON()
  return txt;
}

// userID = ttsantos = 1106035


var id;
var yourMove;
var yourMoveCode = 0;

let result = await loadJSON("https://online-go.com/api/v1/games/"+game)
if(result.players.black.username==username){
  id = result.players.black.id;
}
  else id= result.players.white.id;

if(result.gamedata.clock.current_player==id){
  yourMove = "Your Move!";
  yourMoveCode = 1;
} else {
  yourMove = "Waiting...";
  yourMoveCode = 0;
}

if (config.runsInWidget) {
  // create and show widget
  let widget = createWidget(yourMove);
  Script.setWidget(widget);
  Script.complete();
} else {
  
  if (config.runsWithSiri){
  
  Speech.speak(`${yourMove}`);
  } 
else {
    let alert = new Alert();
    alert.title = 'OGS';
    alert.message = `Current Game: ${yourMove}`;
    alert.presentAlert();
    }
}

function createWidget(yourmove) {
let widget = new ListWidget();

let font1 = Font.boldSystemFont(18)
//let font1 = new Font("Nunito", 18)

let hStack = widget.addStack();
hStack.layoutHorizontally();

let shadow = new Color('#A9A9A9')
let widgetimg = hStack.addImage(imageLoaded);
widgetimg.imageSize = new Size(20, 20);
widgetimg.shadowColor = shadow;
widgetimg.shadowOffset = new Point(5,5);
widgetimg.shadowRadius = 1;
widgetimg.imageOpacity = (0.9);
widgetimg.centerAlignImage();


let preTodoTxt = hStack.addText("  OGS Notifier");
preTodoTxt.textColor = Color.white();
preTodoTxt.textOpacity = 0.8;
preTodoTxt.textSize = 14;
preTodoTxt.centerAlignText();

let spacer1 = widget.addSpacer(10);

let yourmoveTxt = widget.addText(yourmove.toString());
yourmoveTxt.textColor = Color.white();
yourmoveTxt.textOpacity = 0.8;
yourmoveTxt.textSize = 18;
yourmoveTxt.font = font1;
yourmoveTxt.centerAlignText();


if(yourMoveCode == 0){
  yourmoveTxt.textColor = new Color("bbbbbb");
}
else {
  yourmoveTxt.textColor = new Color("3bcc47");
  yourmoveTxt.textSize = 40;
}

let dateTime = new Date();
let hh = dateTime.getUTCHours();
let mm = dateTime.getUTCMinutes();

let dateTimeTxt = widget.addText(hh.toString() + ":" + mm.toString());
dateTimeTxt.textColor = Color.white();
dateTimeTxt.textOpacity = 0.8;
dateTimeTxt.textSize = 8;
dateTimeTxt.font = font1;
dateTimeTxt.centerAlignText();

return widget;

}
