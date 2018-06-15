$(document).ready(function() {

  var isWorkTimerRunning = false;
  var isBreakTimerRunning = false;
  var inWork = false;
  var inBreak = false;

  startWorkTimer();
  startBreakTimer();
  getTimeReport();

  toggleButton('#Break', true);

  $('#Work').click(() => {
    postAction('Work', inWork, () => { 
      inWork = !inWork;
      isWorkTimerRunning = inWork;
      toggleButton('#Break', !inWork);
      if (!inWork) {
        resetWorkTimer();
      }
    });
  });

  $('#Break').click(() => {
    postAction('Break', inBreak, () => { 
      inBreak = !inBreak;
      isWorkTimerRunning = !inBreak;
      isBreakTimerRunning = inBreak;
      toggleButton('#Work', inBreak);
      if (!inBreak) {
        resetBreakTimer();
      }
    });
  });

  function toggleButton(id, disable) {
    $(id).prop('disabled', disable);
  }

  function postAction(entity, inAction, cb) {
    var action = inAction ? 'End' : 'Start';

    $.post(`/${entity}/${action}`, () => {

      //Flip the text, e.g, when start is clicked, change to End
      var actionText = !inAction ? 'End' : 'Start'; 
      $(`#${entity}`).html(`${actionText} ${entity}`);

      //Change button text, green for start, red for end
      var color = !inAction ? 'danger' : 'success'
      $(`#${entity}`).removeClass().addClass(`btn btn-lg btn-${color}`)

      cb();
    });
  }

  var workSeconds = 0;
  var workMinutes = 0;
  var workHours = 0;

  function startWorkTimer() {
    setInterval(() => {
      if (isWorkTimerRunning) {
        workSeconds++;
        if (workSeconds == 60) {
          workSeconds = 0;
          workMinutes++;
        }
        if (workMinutes == 60) {
          workMinutes = 0;
          workHours++;
        }

        $('#work_timer').text(`${timeToString(workHours)}:${timeToString(workMinutes)}:${timeToString(workSeconds)}`) 
      }
    }, 1000);
  }

  function resetWorkTimer() {
    isWorkTimerRunning = false;
    $('#work_timer').text('00:00:00');
    workSeconds = 0;
    workMinutes = 0;
    workHours = 0;
  }

  var breakSeconds = 0;
  var breakMinutes = 0;
  var breakHours = 0;

  function startBreakTimer() {
    setInterval(() => {
      if (isBreakTimerRunning) {
        breakSeconds++;
        if (breakSeconds == 60) {
          breakSeconds = 0;
          breakMinutes++;
        }
        if (breakMinutes == 60) {
          breakMinutes = 0;
          breakHours++;
        }

        $('#break_timer').text(`${timeToString(breakHours)}:${timeToString(breakMinutes)}:${timeToString(breakSeconds)}`) 
      }
    }, 1000);
  }

  function resetBreakTimer() {
    isBreakTimerRunning = false;
    $('#break_timer').text('00:00:00');
    breakSeconds = 0;
    breakMinutes = 0;
    breakHours = 0;
  }

  function timeToString(time) {
    if (time >= 10) {
      return time.toString();
    }
    else {
      return `0${time.toString()}`;
    }
  }

  function getTimeReport() {
    $.get('/timereport', (data) => {
      var htmlList = $('#report ul');
      data.forEach(date => {
        var report = `
          <li class='report'>
            <h3>${date.fullDate}</h3>
            <span>Hours worked: <strong>${date.timeInWork}</strong></span>
            <br>
            <span>Hours in break: <strong>${date.timeInBreak}</strong></span>
          </li>
          `;
          htmlList.append(report);  
      });
    });
  }
});