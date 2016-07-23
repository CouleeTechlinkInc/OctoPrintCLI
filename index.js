  var blessed = require('blessed');
  var contrib = require('blessed-contrib');
  var request = require("request");
  var screen = blessed.screen();
  var grid = new contrib.grid({rows: 12, cols: 12, screen: screen});


var progressBar = grid.set(0, 0, 2, 3, contrib.gauge, {label: 'Progress Bar', percent: 0 });
var tempLine = grid.set(0, 8, 3, 4, contrib.line, 
  { style: 
    { line: "red"
    , text: "white"
    , baseline: "black"}
  , label: 'Temp'
  , maxY: 250 , showLegend : false } );


var table =  grid.set( 0 , 3, 4, 3, contrib.table, 
  { keys: true
  , fg: 'green'
  , label: 'Status'
  , columnSpacing: 1
  , columnWidth: [24, 10, 10]})

function secondsToTime( seconds ){
	var H = Math.floor( seconds / 60 / 60 );
	seconds = seconds % ( 60 * 60 );
	var M = Math.floor( seconds / 60 );
	var seconds = seconds % 60;
	
	var returnTime = "";
	if( H > 9 ){
		returnTime = H + ":";
	} else {
		returnTime = "0" + H + ":";
	}
	if( M > 9 ){
		returnTime += M + ":";
	} else {
		returnTime += "0" + M + ":";
	}
	if( seconds > 9 ){
		returnTime += seconds;
	} else {
		returnTime += "0" + seconds;
	}
	return returnTime;

}
function updateProgress(){
request({
    url: 'http://172.29.1.211/api/job?apikey=D2FC2BFCA1F54610B370D2774C80822E',
    json: true
  } , function( e , response , body ){
	progressBar.setData( parseFloat( (body.progress.completion / 100).toFixed( 4 ) )  )
	var data = [];
	data.push( [ "File Name" , "Filename" ] );
	data.push( [ "Est Time" , secondsToTime( body.job.estimatedPrintTime ) ] );
	
	table.setData( { headers : ["Name" , "Value" ] , data : data } );
	screen.render();
  });
}
function updateTemps(){
  request({
    url: 'http://172.29.1.211/api/printer?apikey=D2FC2BFCA1F54610B370D2774C80822E&history=true&limit=100',
    json: true
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
	var lineData = {
		"title" : "",
		"style" : { line : 'red' },
		"x" : [],
		"y" : []
	};
	var i = 0;
	var targetData = {
		"title" : "",
		"style" : { line : 'yellow' },
		"x" : [],
		"y" : []
	}
	body.temperature.history.forEach( function( hist ){
		lineData.x.push( i ); 
		targetData.x.push( i );
		i++;
		lineData.y.push( hist.tool0.actual );
		targetData.y.push( hist.tool0.target );
	});
	tempLine.setData( [ lineData , targetData] );	
//        bar.setData({titles: ["HotEnd" ], data: [ body.temperature.tool0.actual ]});
	screen.render();
    }
  });
}
setInterval( function(){
	updateTemps();
	updateProgress();
	} , 3000 );
updateTemps();
updateProgress();
screen.render();



