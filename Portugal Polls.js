// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: braille;
//getLatestPolls from europeanElects
async function loadText(url) {
  let req = new Request(url)
  let txt = await req.loadString()
  return txt;
}

async function getCSV() {
  let rawFeed = await loadText("https://filipvanlaenen.github.io/eopaod/pt.csv");
  //console.log(rawFeed);  
  return rawFeed.split('\n');
}

var csv = await getCSV();
var headers = csv[0];
split_headers = headers.split(',');
var results = csv[1];
// split_results = results.split(',');
split_results = results.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);

//check results - debug
for(var i = 0; i < split_headers.length; i++){
console.log('i:' + i + ' ' +  split_headers[i] + ' : '  + split_results[i]);
}

function parseStringNA(string){
  hasPercentage = string.includes('%');
  if(!hasPercentage)
    return "n.a."
  else return string;
}

if (config.runsInWidget) {
  let widget = createWidget(split_results)
  Script.setWidget(widget)
  Script.complete()
}

function createWidget(poll) {
  let date = new Date(Date.parse(poll[3]));
  let df = new DateFormatter();
  df.useShortDateStyle();
  //df.useShortTimeStyle();
  let strDate = df.string(date);
  
  let w = new ListWidget();
  
  // Set gradient background 
  let startColor = new Color("000859"); 
  let endColor = new Color("#004e92"); 
  let gradient = new LinearGradient(); 
  gradient.colors = [startColor, endColor];
  gradient.locations = [0.5,0.0];
  w.backgroundGradient = gradient;
  
  let countryTxt = w.addText('🇵🇹 Polls');
  countryTxt.textColor = Color.white();
  countryTxt.font = new Font("AvenirNext-DemiBold", 14);
  countryTxt.lineLimit = 2;
  countryTxt.textOpacity = 0.8;
  countryTxt.leftAlignText();
  
  w.addSpacer();
  
  let authorsTxt = w.addText("PSD: " + parseStringNA(poll[9]) + " PS: " + parseStringNA(poll[10]) + " BE: " + parseStringNA(poll[11]) + "  CDS/PP: " + parseStringNA(poll[12]) + " CDU: " + parseStringNA(poll[13]) + " PAN: " + parseStringNA(poll[14]) + "LIVRE: " + parseStringNA(poll[15]) + " IL: " + parseStringNA(poll[16]) + " AL: " + parseStringNA(poll[17]) + " CH: " + parseStringNA(poll[18]) + " Other: " + parseStringNA(poll[19]));
  authorsTxt.textColor = Color.white();
  
  authorsTxt.font = new Font("AvenirNext-DemiBold", 13);
  
  w.addSpacer();
  
  let dateTxt = w.addText(strDate + ' - ' + poll[0] + ' (' + poll[5] + ' resp.)');
  dateTxt.textColor = Color.white();
  dateTxt.textOpacity = 0.8;
  dateTxt.font = new Font("AvenirNext-DemiBold", 11);
  dateTxt.lineLimit = 2;
  dateTxt.leftAlignText();
  
  w.presentMedium();
  
  return w;
}

