class DataObject {
  constructor(files) {
    this.fileNames = files;
    this.songData = null;
    this.eventData = null;
    this.songsCrossfilter = null;
    this.eventsCrossfilter = null;
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
        });

        // Clean event data
        dObj.eventData.forEach(d => {
          d.date = new Date(d.date);
        });

        // Construct crossfilters for all data objects for easier and efficient manipulation
        dObj.songsCrossfilter = crossfilter(dObj.songData);
        dObj.eventsCrossfilter = crossfilter(dObj.eventData);

        resolve('initialized');
      });
    });
  }

  // Return the top ten songs of all time by number of plays
  getTopTenSongs() {
    let dObj = this;

    let songNameDimension = dObj.songsCrossfilter.dimension(d => d.song_name);
    let songNameGroup = songNameDimension.group();
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
    let eventDimension = dObj.songsCrossfilter.dimension(d => d.event);
    eventDimension.filter(d => d === eventName);

    let songNameDimension = dObj.songsCrossfilter.dimension(d => d.song_name);
    let songNameGroup = songNameDimension.group();

    // Create a copy of the top ten songs so you don't reference the same array of objects
    // Once you clear the filter below, you'll get weird numbers if you don't do this.
    let ret = [];
    songNameGroup.top(10).forEach(d => {
      if (d.value > 0) ret.push({...d});
    });

    // Clear filters
    eventDimension.filterAll();

    return ret;
  }

  // Return top ten artists of all time by total number of song plays
  getTopTenArtistsByPlays() {
    let dObj = this;

    let artistDimension = dObj.songsCrossfilter.dimension(d => d.song_artist);
    let artistGroup = artistDimension.group();
    return artistGroup.top(10);
  }

  // Return top ten artists of all time by the number of different songs played
  getTopTenArtistsBySongs() {
    // TODO
    return [];
  }

  // Return an object representing the total number of times we've had a band instrument.
  getBandNumbers() {
    return {
      Vocals: 0,
      Acoustic: 0,
      Keys: 0,
      Electric: 0,
      Drums: 0,
      Bass: 0,
      Strings: 0,
      Ukulele: 0,
    }
  }

  // Return the total number of events (i.e. worship sets) played
  getNumberOfEvents() {
    // TODO
    return dObj.eventData.length;
  }

  // Return the total number of different songs ever played
  getNumberOfUniqueSongs() {
    // TODO
    return 0;
  }

  // Return the number of different artists covered
  getNumberOfUniqueArtists() {
    // TODO
    return 0;
  }

  // Return the number of different band members we've ever had at Creo
  getNumberOfBandMembers() {
    // TODO
    return 0;
  }

  // Return the number of times we've had guest worship leaders at Creo
  // This value is hard-coded just because it's easier: we've only had
  // guest worship leaders at Creo since 2017.  We might change this
  // later, but we'll keep it like this for now.
  getNumberOfGuestLeaders() {
    return 3;
  }
}