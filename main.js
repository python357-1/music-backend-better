const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')

const port = process.env.PORT || 5001;

mongoose.connect('mongodb://localhost/musicdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

let gfs;
mongoose.connection.once('open', () => {
    gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.collection('songs')
})

let storage = new GridFsStorage({
    url: "mongodb://localhost/musicdb",
    file: (req, file) => {
        return new Promise(
            (resolve, reject) => {
                const fileInfo = {
                    filename: file.originalname,
                    bucketName: "songs"
                }
                resolve(fileInfo)
            }
        )
    }
})

const upload = multer({ storage })

const Schema = mongoose.Schema;

const SongSchema = new Schema({
    title: String,
    artist: String,
    album: String,
    release: String,
    source_file: String
})

const Song = mongoose.model('SongData', SongSchema)

const app = express();

app.get('/', (req, res) => {
    res.json({
        routes: [
            "GET /: this route, dummy",
            "GET /songs: get all songs",
            "GET /song/:title: get specific song by title",
            "GET /song/:title/source: get song audio file",
            "POST /song: upload new song to database using multipart form data"
        ]
    })
})
        

app.get('/songs/', (req, res) => {
    Song.find((err, songs) => {
        if (songs.length > 0) {
            res.json({err: "no songs found!"})
        }
        res.json(songs)
    })
})

app.post('/song', upload.single('source_file'), (req, res) => {
    let song = new Song({
        title: req.body.title.toLowerCase(),
        artist: req.body.artist.toLowerCase(),
        album: req.body.album.toLowerCase(),
        release: req.body.release.toLowerCase(),
        source_file: req.file.id,
    })
    song.save()
    res.json({ success: "success"})
})

app.get('/song/:title', (req, res) => {
    Song.findOne({ title: req.params.title}, (err, song) => {
        if (song == null) {
            res.json({err: "no song found"})
        } else {
            res.json(song)
        }
    })
})

app.get("/song/:title/source", (req, res) => {
    Song.findOne({ title: req.params.title }, (err, song) => {
        if (song == null) {
            res.json({err: "no song found"})
        } else {
            let readstream = gfs.createReadStream({ _id: song.source_file });
            readstream.pipe(res) 
        }
    })
})

app.listen(port, () => console.log(`listening on ${port}`))