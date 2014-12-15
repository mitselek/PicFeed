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
    res.writeHead(200, {'Content-Type':'text/html'})
    res.end(data)
  })
}


io.sockets.on('connection', function(socket) {
    console.log('socket')
    socket.on('listening', function() {
	    console.log('listening')
	    // console.log(getLatestFile())
	    getLatestFile(null, function(filename) {
	    	console.log(filename)
			socket.volatile.emit('news', filename)
	    })
		fs.watch(__MEDIA_DIR, function (event, filename) {
			if (filename) {
			    getLatestFile(null, function(filename) {
					socket.volatile.emit('news', filename)
			    })
			} else {
				console.log('filename not provided')
			}
		})
    })
})

function getLatestFile(err, callback) {
    if (err) {
        throw err
    }
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
		    return {"mtime": stats.mtime.getTime(), "file": file}
	    }).sort(function(a, b) {
	    	return b.mtime - a.mtime
	    })
		// console.log('files')
		// console.log(files)
		callback(files[0].file)
	})
}

getLatestFile(null, console.log)