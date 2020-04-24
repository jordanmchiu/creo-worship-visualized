// These are the roles of the band that we keep track of
const bandRoles = ['leader', 'vox', 'acoustic', 'keys', 'electric', 'drums', 'bass', 'strings', 'ukulele'];

class DataObject {
  constructor(files) {
    this.fileNames = files;
    this.songData = null;
    this.eventData = null;
    this.songsCrossfilter = null;
    // this.eventsCrossfilter = null;

    // Set up helper arrays and objects for functions below
    this.bandNumbers = {};
    bandRoles.forEach(role => { this.bandNumbers[role] = 0; });

    this.bandMembers = [];

    this.artistsAndSongs = {};
    this.artistsAndSongsCounts = [];
  }

  // Initialize our data object with the given file names
  // Resolve when done to allow .then() on the top level
  initialize() {
    let dObj = this;

    return new Promise((resolve, reject) => {
      Promise.all([
        d3.csv(dObj.fileNames[0]),
        d3.csv(dObj.fileNames[1])
      ]).then(files => {
        dObj.songData = files[0];
        dObj.eventData = files[1];

        // Merge all the event data into song data for easier manipulation
        dObj.songData = dObj.songData.map((item) => {
          let event = dObj.eventData.find(d => d.date === item.date);
          if (event) { return Object.assign(item, event); }
        });

        // Clean song data
        dObj.songData.forEach(d => {
          d.date = new Date(d.date);
          d.response = (d.response === '1');
          dObj.setupArtistsAndSongs(d);
        });
        dObj.setupArtistsAndSongsCounts();

        // Clean event data
        dObj.eventData.forEach(d => {
          d.date = new Date(d.date);
          dObj.parseBandNumbers(d);
          dObj.checkBandMembers(d);
        });

        // Construct crossfilters for all data objects for easier and efficient manipulation
        dObj.songsCrossfilter = crossfilter(dObj.songData);

        // Set up dimensions for crossfilter once, because setting up dimensions is expensive
        dObj.songNameDimension   = dObj.songsCrossfilter.dimension(d => d.song_name);    
        dObj.artistNameDimension = dObj.songsCrossfilter.dimension(d => d.song_artist);
        dObj.eventDimension      = dObj.songsCrossfilter.dimension(d => d.event);

        // dObj.eventsCrossfilter = crossfilter(dObj.eventData);

        resolve('initialized');
      });
    });
  }

  // Helper method to set up the bandData object
  parseBandNumbers(d) {
    let dObj = this;

    bandRoles.forEach(role => {
      if (d[role] !== '') {
        dObj.bandNumbers[role] = dObj.bandNumbers[role] + 1;
      }
    });
  }

  // For each event, check to see if the band member is accounted for
  checkBandMembers(d) {
    let dObj = this;
    bandRoles.forEach(role => {
      if (d[role] !== '') {
        let people = d[role];
        let peopleArray = people.split('; ');
        peopleArray.forEach(person => {
          if (!dObj.bandMembers.includes(person)) {
            dObj.bandMembers.push(person);
          }
        });
      }
    });
  }

  setupArtistsAndSongs(d) {
    let dObj = this;
    let artist = d.song_artist;
    if (!dObj.artistsAndSongs.hasOwnProperty(artist)) {
      dObj.artistsAndSongs[artist] = [];
    }
    if (!dObj.artistsAndSongs[artist].includes(d.song_name)) {
      dObj.artistsAndSongs[artist].push(d.song_name);
    }
  }

  setupArtistsAndSongsCounts() {
    let dObj = this;
    for (let a of Object.keys(dObj.artistsAndSongs)) {
      dObj.artistsAndSongsCounts.push({
        key: a,
        value: dObj.artistsAndSongs[a].length
      });
    }
    dObj.artistsAndSongsCounts = dObj.artistsAndSongsCounts.sort((a, b) => b.value - a.value);
  }

  // Return the top ten songs of all time by number of plays
  getTopTenSongs() {
    let dObj = this;

    let songNameGroup = dObj.songNameDimension.group();
    return songNameGroup.top(10);
  }

  // Return the top ten songs for the given event
  // eventName is either:
  // - 'exp_nght'
  // - 'ya_worship'
  // - 'camp'
  // - 'creo_monday'
  // - 'creo_friday'
  // If eventName doesn't exist, you'll get an empty array
  getTopTenSongsByEvent(eventName) {
    let dObj = this;

    // Set up a filter by event name
    dObj.eventDimension.filter(d => d === eventName);

    let songNameGroup = dObj.songNameDimension.group();

    // Create a copy of the top ten songs so you don't reference the same array of objects
    // Once you clear the filter below, you'll get weird numbers if you don't do this.
    let ret = [];
    songNameGroup.top(10).forEach(d => {
      if (d.value > 0) ret.push({...d});
    });

    // Clear filters
    dObj.eventDimension.filterAll();

    return ret;
  }

  // Return top ten artists of all time by total number of song plays
  getTopTenArtistsByPlays() {
    let dObj = this;
    let artistGroup = dObj.artistNameDimension.group();
    return artistGroup.top(10);
  }

  // Return top ten artists of all time by the number of different songs played
  // There doesn't seem to be an easy way of doing this with crossfilter,
  // so I've implemented this in a brute-force way with helper functions in the
  // construction and initialization of the data object
  getTopTenArtistsBySongs() {
    let dObj = this;
    return dObj.artistsAndSongsCounts.slice(0, 10);
  }

  // Return an object representing the total number of times we've had a band instrument.
  getBandNumbers() {
    let dObj = this;
    return dObj.bandNumbers;
  }

  // Return the total number of events (i.e. worship sets) played
  getNumberOfEvents() {
    let dObj = this;
    return dObj.eventData.length;
  }

  // Return the total number of different songs ever played
  getNumberOfUniqueSongs() {
    let dObj = this;

    let songNameDimension = dObj.songsCrossfilter.dimension(d => d.song_name);
    let songNameGroup = songNameDimension.group();
    return songNameGroup.all().length;
  }

  // Return the number of different artists covered
  getNumberOfUniqueArtists() {
    let dObj = this;
    let artistNameGroup = dObj.artistNameDimension.group();
    return artistNameGroup.all().length;
  }

  // Return the number of different band members we've ever had at Creo
  getNumberOfBandMembers() {
    let dObj = this;
    return dObj.bandMembers.length - dObj.getNumberOfGuestLeaders();
  }

  // Return the number of times we've had guest worship leaders at Creo
  // This value is hard-coded just because it's easier: we've only had
  // guest worship leaders at Creo since 2017.  We might change this
  // later, but we'll keep it like this for now.
  getNumberOfGuestLeaders() {
    return 3;
  }
}