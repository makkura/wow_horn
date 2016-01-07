require 'net/http'

class Tweet
    def initialize(window)
        @window = window
    end

	def userinfo
		@username = @window.document.getElementById('user').innerHTML
		@password =	@window.document.getElementById('pass').value
	end
	
	def tweet
		status = @window.document.getElementById('hidden').innerHTML
		userinfo
		update_status(status)
	end
    def update_status(status, format='xml')
        return "Message size must been less than 160 characters." if status.length > 160       
        return "Message must have something in it..." if status.length < 1
   
        api_url = 'http://twitter.com/statuses/update.' + format
        url = URI.parse(api_url)
        req = Net::HTTP::Post.new(url.path)
        req.basic_auth(@username, @password)
        req.set_form_data({ 'status'=> status }, ';')
        res = Net::HTTP.new(url.host, url.port).start {|http| http.request(req) }
        return_status(res)
    end
   
    def return_status(res)
        case res
        when Net::HTTPSuccess
            @window.document.getElementById('status').innerHTML = "Successfully Updated."
			@window.document.getElementById('hidden').innerHTML = "Success";
		when Net::HTTPInternalServerError
            @window.document.getElementById('status').innerHTML = "Server Error: Try Again Shortly."
			@window.document.getElementById('hidden').innerHTML = "Fail";
		else
            @window.document.getElementById('status').innerHTML = "Unknown Error #{res}: #{res.inspect}. Please Twitter User Info."
			@window.document.getElementById('hidden').innerHTML = "Fail";
		end
		return true
    end
end

t = Tweet.new(window)
send(:t=, t);