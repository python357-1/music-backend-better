Music backend for music site running at https://music.jordanbc.xyz

API documentation is below, feel free to build a frontend for it

API Documentation:

GET /        information about the backend
example output: 
```
{
    version: "1.0.0",
    release_date: "11/26/2020",
    author: "Jordan Banta-Clark"
}
```

GET /songs        get all songs in the database
example output:
```
[
    {
        _id: ObjectId,
        title: "title",
        artist: "artist",
        album: "album",
        release: "release date",
        source_file: "ObjectId of GridFS Song Object"
    },
    {
        ...
    }
]
```

GET /song/:title        get specific song, by title
example output: 
```
same as the last but without the array and is only one object
```

GET /song/:title/source       get song binary data
example output:
```
(music file)
```

POST /song        upload new song to database, only accepts multipart form data