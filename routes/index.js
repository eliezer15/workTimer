var express = require('express');
var fs = require('fs');
var moment = require('moment');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/work/start', (req, res, next) => {
  writeToFile('WORK START', (err) => {
    if (err) {
      throw err;
    }
  });
  res.status(200).send();
});

router.post('/work/end', (req, res, next) => {
  writeToFile('WORK END', (err) => {
    if (err) {
      throw err;
    }
  });
  res.status(200).send();
});

router.post('/break/start', (req, res) => {
  writeToFile('BREAK START', (err) => {
    if (err) {
      throw err;
    }
  });
  res.status(200).send();
});

router.post('/break/end', (req, res) => {
  writeToFile('BREAK END', (err) => {
    if (err) {
      throw err;
    }
  });
  res.status(200).send();
});

router.get('/timereport', (req, res) => {
  getTotalTimes((events) =>{
    res.status(200).send(events);
  });
});

function writeToFile(message, handleErr) {
  var currentTime = moment().local();
  var stamp = `${currentTime.toISOString(true)} ${message}\n`;
  fs.writeFile('studyTimer.txt', stamp, { flag: 'a'}, handleErr);
}
/* Returns a dict of dates to json objects containing the total time worked
 * and total time in break for each day we have a log for
 */
function getTotalTimes(cb) {
  fs.readFile('studyTimer.txt', 'utf8', (err, data) => {
    var times = {};
    var timelogs = data.split("\n");
    var events = getTotalTimePerEvent(timelogs);

    var eventsPerDate = {};
    events.forEach(event => {
      if (!(event.date in eventsPerDate)) {
        eventsPerDate[event.date] = [];
      }
      eventsPerDate[event.date].push(event);
    });

    var totalTimes = [];
    for (var date in eventsPerDate) {
      var events = eventsPerDate[date];
      var timeInWork = 0;
      var timeInBreak = 0;

      events.forEach(event => {
        if (event.activity === 'WORK') {
          timeInWork += event.durationInSeconds;
        } else {
          timeInBreak += event.durationInSeconds;
        }
      });

      timeInWork = timeInWork - timeInBreak;
      totalTimes.push({
        fullDate: events[0].fullDate,
        timeInWork: secondsToFullTimeFormat(timeInWork),
        timeInBreak: secondsToFullTimeFormat(timeInBreak)
      });
    }

    cb(totalTimes);
  });
}
/* Convert a number of seconds to HH:mm:ss format */
function secondsToFullTimeFormat(totalSeconds) {
  var leftoverSeconds = totalSeconds % 60;
  var minutes = Math.floor(totalSeconds/60);
  var leftoverMinutes = minutes % 60;
  var hours = Math.floor(minutes/60);

  return `${toTwoDigit(hours)}:${toTwoDigit(leftoverMinutes)}:${toTwoDigit(leftoverSeconds)}`;
}

function toTwoDigit(number) {
  if (number < 10) {
    return `0${number}`
  } else {
    return number;
  }
}

function getTotalTimePerEvent(timelogs) {
  events = [];
  var currentWorkStartTime = null;
  var currentBreakStartTime = null;

  timelogs.forEach(log => {
    var parts = log.split(" ");
    if (parts[2] === 'START') {
      var date = moment(parts[0]);
      if (parts[1] === 'WORK') {
        currentWorkStartTime = date;
      } else {
        currentBreakStartTime = date;
      }
    }

    if (parts[2] === 'END') {
      var endTime = moment(parts[0]);

      var startTime = parts[1] === 'WORK' ? currentWorkStartTime : currentBreakStartTime;
      var duration = endTime.diff(startTime, 'seconds');
      
      events.push({
        date: startTime.format('MM-DD-YYYY'),
        fullDate: startTime.format('dddd, MMMM Do'),
        activity: parts[1],
        durationInSeconds: duration 
      });
    }
  });

  return events;
}


module.exports = router;
