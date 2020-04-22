# Creo Worship Visualized
A data vis project in d3 for Creo Worship.  This is my dev diary!

## Background
This project was started in April 2020 as a personal data visualization project.  Built entirely using JavaScript (d3, crossfilter, graph-scroll), HTML, and CSS, it shows (hopefully) interesting statistics on [Creo Worship](http://www.creopeople.ca/) and the songs and artists we've covered since Fall 2017.

"But wait!"  I hear you ask.  "Why not build an actual API with a proper back-end?"  Well, this was a fairly small project, and I knew that keeping everything in plain JavaScript would probably the easiest thing for me to maintain in the long run.  If I set everything up properly, the only thing that I would need to update were the CSV files representing each event or song played.

This project will be hosted on GitHub Pages when it is complete, likely by late April or early May.

## Foundations
I decided to set up the project purely as an SPA with no back-end because I primarily wanted to play around with the d3 techniques I had learned in a datavis class I took at the University of British Columbia, CPSC 436V.  I knew that I wanted to push myself a bit beyond what we had done before in that class, and I was attracted to the "scrollytelling" approach of examples seen all over the web.  Scrollytelling was an effective way to convey a narrative with minimal interactive burden on the user, and I knew that my target audience (i.e. Creo Worship) would appreciate something they could access on any platform, whether PC or mobile.

I started by sketching out some of the ideas and charts that I wanted to create.  Obviously the fine details were something to be left out of the picture at this point, but the main points of the story were there:

![alt text](dev-diary/Sketches2.JPG "Preliminary sketches")

## Technologies
Next, I had to figure out which technologies I wanted to use for scrollytelling.  After doing some searching, I went with [The Pudding's](https://pudding.cool/process/how-to-implement-scrollytelling/) suggestion of using [`graph-scroll`](https://1wheel.github.io/graph-scroll/) by Adam Pearce.  It's a d3 plugin based on [stack](https://github.com/mbostock/stack) by Mike Bostock, and helps dispatch events as the user scrolls to different sections on the webpage.

Using this template was a bit tricky, though.  For one, the main HTML page of `graph-scroll`'s main example seemed to use class names for IDs and vice versa - there were several elements with the same `container` or `sections` id, while class names were unique.  Secondly, everything was placed into a single file for the provided demo, and I had to separate all the functions of different components into separate classes.  Finally, the demo used d3v4, and I was most familiar with d3v5.

After spending some time tidying up the code and scaffolding the project, I had a very preliminary working outline that I could play around with and use as a base for my visualizations:

![alt text](dev-diary/01-WIP.PNG "The first layout")

For data manipulation, I decided to go with [crossfilter](http://square.github.io/crossfilter/), a JS library used primarily for fast and multidimensional filtering.  While I wasn't necessarily using coordinated views to show my data, I was drawn to the fast and simple API calls that crossfilter provided for filtering and aggregation of tabular data, explained very well by [Animated Data](https://www.animateddata.com/articles/crossfilter/).

## Deriving Data
I had all the necessary technologies.  And before visualizing the data that I wanted, I had to first get and derive the data that I wanted to visualize.  I knew that, at the very least, I wanted to push all the functionality of manipulating and deriving data into its own class, so I pushed that functionality into a separate object that was constructed before the visualizations were set up.  Here's what `main.js` looked like:

```javascript
dataObject = new DataObject([
  './data/creo_worship_data.csv',
  './data/creo_worship_events.csv'
]);

dataObject.initialize().then(msg => {
  setup();
});
```

And the `dataObject` class:
```javascript
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
  ...
}
```

Now all I had to do was create API-like calls to this class to get the data that I wanted for my visualization.  Here's an example of what a method call looked like if I wanted to get the top 10 songs by a given event, say, a YA Worship Night:
```javascript
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
```

Note that in this use of crossfilter, I had to do two things:
1. Copy the results from the array I wanted to return to prevent any reference errors that might come up.
2. Remove the filter on the existing crossfilter by calling `eventDimension.filterAll()` before returning.  Because crossfilter is meant to be used among multiple views, filters remain in place until they are removed.

## Scratchpad
Sources:
- Textures for d3: https://riccardoscalco.it/textures/
- So You Want to Build A Scroller: https://vallandingham.me/scroller.html
- Waypoints (trigger a function when scrolling to an element): http://imakewebthings.com/waypoints/
- Graph-scroll, a d3 plugin: https://1wheel.github.io/graph-scroll/
- Implementing scrollytelling: https://pudding.cool/process/how-to-implement-scrollytelling/

Things to use:
- Font family: Nunito: https://fonts.google.com/specimen/Nunito
- Scrolling library: graph-scroll
- Layouts: bootstrap