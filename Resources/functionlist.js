
var Achievementor = {
	
	db: null, // variable for storing the db.
	
	/**
	*	DATABASE RELATED FUNCTIONS
	 */
		
	openDB: function(){
		var character = $('#character')[0].innerHTML;
		var realm = $('#realm')[0].innerHTML;
		var server = $('#server')[0].innerHTML;
		
		try {
			var shortName = 'wowach' +'_'+ character +'_'+ realm +'_'+ server;
			var version = '1.0';
			this.db = openDatabase(shortName, version);
		} catch(e) {
			if (e == INVALID_STATE_ERR) {
				alert("Invalid database version.");
			} else {
				alert("Unknown error "+e+".");
			}
			return false;
		}
		
		//create the table,
		var query = 'CREATE TABLE IF NOT EXISTS Achievements (id INTEGER PRIMARY KEY, categoryid INTEGER NOT NULL, done TEXT NOT NULL, title TEXT NOT NULL, icon TEXT NOT NULL, desc TEXT NOT NULL, posted INTEGER DEFAULT 0, marked INTEGER DEFAULT 0);';
		if (this.db) {
			this.db.transaction(function(transaction){
				transaction.executeSql(query, [], self.nullDataHandler, self.errorHandler);
			});
		}
		return true;
	},

	insertAchievement: function(item){
		//alert("insertAchievement");
		var self = this;
		item = item || { id: '', categoryid: '', done: '', title: '', icon: '', desc: ''};
		//figure out if this record is in the database yet or not
		//var countquery = 'SELECT COUNT(*) AS "count" FROM Achievements WHERE id ="'+item.id+'";' 
		var query = 'Insert OR IGNORE into Achievements (id, categoryId, done, title, icon, desc) values("'+item.id+'","'+item.categoryId+'","'+item.done+'","'+item.title+'","'+item.icon+'","'+item.desc+'");';
		if (this.db) {
			this.db.transaction(function(transaction){
			//transaction.executeSql(query, [], function(){self.checkAndInsert.call(self, item, arguments[0], arguments[1])}, self.errorHandler);
			transaction.executeSql(query, [], self.nullDataHandler, self.errorHandler);
			});
		}
	},

	test: function() {
		alert("test");
	},
	
	nullDataHandler: function(transaction, results){
	},
	
	errorHandler: function(transaction, error){
		alert('Error: '+error.message+' (Code '+error.code+')' + ' Transaction: ' + transaction);
		return false;
	},
	
	
	/**
	 *	GRABBER AND PARSER
	 **/
		
	grab_data: function() {
		var self = this;
		var files = new Array('temp0.xml', 
		'temp155.xml',
		'temp168.xml',
		'temp169.xml',
		'temp201.xml',
		'temp81.xml',
		'temp91.xml',
		'temp95.xml',
		'temp96.xml',
		'temp97.xml');

		this.openDB();
		document.getElementById('status').innerHTML = "Gathering Data...";
		files.forEach(function(file){
		try {
			var file = Titanium.Filesystem.getFileStream(Titanium.App.appURLToPath('app://' + file));
			file.open(Titanium.Filesystem.FILESTREAM_MODE_READ);
			var data = file.read();
			file.close();
		} catch (e) {
			alert("Error: Unable to open xml files.");
		}
		self.parse_data(data);
		});
		//parsing is done, remove xml files
		files.forEach(function(file){
		var filePath = Titanium.App.appURLToPath('app://' + file)
		var filetoremove = Titanium.Filesystem.getFile(filePath);
		filetoremove.deleteFile();
		});
		self.select_all();
	},
	
	parse_data: function(data){
		var self = this;
		this.dblock = 1;
		var dom = new DOMParser().parseFromString(data,"text/xml");
		var entries = dom.getElementsByTagName('achievement');
		entries.forEach = Array.prototype.forEach
		var toreturn = '';

		var status = document.getElementById('status');
		var returns = document.getElementById('returns');
		//alert("Continuing");
		//Open the database corresponding to this character

		entries.forEach(function(entry){
			var data = {
				id: entry.getAttribute('id'),
				done: entry.getAttribute('dateCompleted'),
				title: entry.getAttribute('title'),
				icon: entry.getAttribute('icon'),
				desc: entry.getAttribute('desc'),
				categoryId : entry.getAttribute('categoryId')
			}
			//alert("done: " + data.done);
			if (data.done != null) {
				data.done = data.done.substr(0,10);
				toreturn += '<div class="achievement"><br>ID: ' + data.id + ' Completed on:' + data.done + ' Title:' + data.title +'<br>Description: ' + data.desc +"</div>";
				self.insertAchievement(data);
			}
		});

		if (entries.length == 0) {
			returns.innerHTML = 'Error: Armory returned 0 achievements.';
			status.innerHTML = "Errored out.";
		} else {
			status.innerHTML = "";
		}
	},
	
	/** 
	*   Select all from Database
	*/
	select_all: function(){
		var self = this;
		
		var query = 'SELECT * FROM Achievements ORDER BY categoryId, posted;';
		if (this.db) {
			this.db.transaction(function(transaction){
			transaction.executeSql(query, [], self.selectHandler, self.errorHandler);
			});
		}
	},
	
	selectHandler: function(transaction, results){
		var status = document.getElementById('status');
		var returns = document.getElementById('returns');
		var character = document.getElementById('character');	
		returns.innerHTML = "";
		for(var i = 0; i < results.rows.length; i++)
		{
			var row = results.rows.item(i);
			var id = row['id'];
			var title = row['title'];
			var done = row['done'];
			var posted = row['posted'];

			if(posted == 0)
			{var posted_class = "achievement";}
			else
			{var posted_class = "achievement_old";}
			
			var tempstring = "" + character.innerHTML + " completed <b>" + title + "</b> on " + done;
			var taggedid = '"' + id + '"';
			var divinfo = "<div id='"+id+"' class='"+posted_class+"'>" + tempstring + "<div class='tweet' onClick='tweetme("+taggedid+");'><a href='#'>Tweet</a></div><div class='wowhead'><a href='http://www.wowhead.com/?achievement="+id+"' target='ti:systembrowser'>WoWhead</a></div></div>";
			returns.innerHTML += divinfo;
		}
		status.innerHTML = "";
	}
	
};

function tweetme(id)
{
	trim_all();
	var tweetinfo = '#'+id;
	var hiddentweet = document.getElementById("hidden");
	var tweetout = "#WoWHorn " + $(tweetinfo).text().replace('TweetWoWhead', '');
	var date = tweetout.substr(tweetout.length-10, 10);
	var year = date.substr(0, 4);
	var month = date.substr(5, 2);
	var day = date.substr(8, 2);
	var monthname = '';
	switch(month)
	{
	case '01':
		monthname = "Jan.";
	break;    
	case '02':
		monthname = "Feb.";
	break;
	case '03':
		monthname = "Mar.";
	break;    
	case '04':
		monthname = "Apr.";
	break;    
	case '05':
		monthname = "May";
	break;    
	case '06':
		monthname = "June";
	break;    
	case '07':
		monthname = "July";
	break;    
	case '08':
		monthname = "Aug.";
	break;    
	case '09':
		monthname = "Sept.";
	break;    
	case '10':
		monthname = "Oct.";
	break;    
	case '11':
		monthname = "Nov.";
	break;    
	case '12':
		monthname = "Dec.";
	break;    
	}
	
	var friendlydate = monthname + " " + day + ", " + year;
	var finaltweet = tweetout.substr(0, tweetout.length-10) + friendlydate;
	hiddentweet.innerHTML = finaltweet;
	
	t.tweet();
	
}

function trim_all()
{
	$('#character').text(($('#character').text()).rtrim());
	$('#realm').text(($('#realm').text()).rtrim());
	$('#server').text(($('#server').text()).rtrim());
	$('#user').text(($('#user').text()).rtrim());
	$('#pass').text(($('#pass').text()).rtrim());

}

String.prototype.rtrim=function(){
    return this.replace(/\s*$/g,'');
}

$(document).ready(function(){
	$('#check').click(function () {
		trim_all();
		Achievementor.grab_data();
	});
	$('#gatherdata').click(function () {
		trim_all();
		gatherdata();
	});
	
	
});