require 'net/http'

	def gatherdata()
	window.document.getElementById('status').innerHTML += "<br>Populating character data."
	character = (window.document.getElementById('character').innerText.strip)
	realm = (window.document.getElementById('realm').innerText).strip
	server = ((window.document.getElementById('server').innerText).strip).downcase!
	page_list = [0,91,95,96,168,97,155,201,169,81]

	#realm switch to url
	if (server == "eu")
		server = "eu.wowarmory.com"
	else
		server = "www.wowarmory.com"
	end
		#connect to the server and get the pertinent xml files
		page_list.each do |key|
	
			http = Net::HTTP.new(server)
			http.open_timeout = 15
			http.read_timeout = 15
	
			window.document.getElementById('status').innerHTML +=  "<br>Retrieving data from sheet: #{key}";
			xml_data = http.get("/character-achievements.xml?r=#{realm}&n=#{character}&c=#{key}", "User-Agent" => "Mozilla/5.0 Gecko/20070219 Firefox/2.0.0.2", "Accept" => "application/atom+xml,application/xml,text/xml");

			#output the xml to files
			applocation = Titanium.App.appURLToPath('app://');
			file_name = applocation + "temp#{key}.xml";
			tempFile = File.open(file_name, "w")
			if tempFile
				tempFile.syswrite(xml_data.body)
				tempFile.close
			else
				window.document.getElementById('status').innerHTML +=  "<br>Error: Could not open file #{file_name}";
			end
			window.document.getElementById('status').innerHTML += "<br>Done gathering data."
		end
	end
