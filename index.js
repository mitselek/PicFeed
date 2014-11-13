var app = require('http').createServer(handler)
var io = require('socket.io')(app)
var fs = require('fs')

var path 	= require("path")

app.listen(8080)

console.log ( "\n===================================")

__MEDIA_DIR = 'photolibrary/'

function handler (req, res) {
  fs.readFile('index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500)
      return res.end('Error loading index.html')
    }
    res.writeHead(200)
    res.end(data)
  })
}


io.sockets.on('connection', function(socket) {
    console.log('socket')
    socket.on('listening', function() {
	    console.log('listening')
		fs.watch(__MEDIA_DIR, function (event, filename) {
			console.log('event is: ' + event)
			if (filename) {
				filename = path.join(__MEDIA_DIR, filename)
				if (!fs.existsSync(filename))
					return
				if (!fs.statSync(filename).isFile())
					return
				if (path.extname(filename) === '')
					return

				socket.volatile.emit('news', filename)
				console.log('filename provided: ' + filename)
			} else {
				console.log('filename not provided')
			}
		})
    })
})

function getLatestFile() {
	fs.readdir(__MEDIA_DIR, function(err, files) {
	    if (err) {
	        throw err
	    }
	    files = files.map(function (file) {
	        return path.join(__MEDIA_DIR, file)
	    }).filter(function (file) {
	        return fs.statSync(file).isFile()
	    }).filter(function (file) {
	        return path.extname(file) !== ''
		}).map(function (file) {
			stats = fs.statSync(file)
		    var statted_file =  {"mtime": stats.mtime.getTime(), "file": file}
		    return statted_file
	    }).sort(function(a, b) {
	    	return a.mtime < b.mtime
	    })
		return files[0].file
	})
}
