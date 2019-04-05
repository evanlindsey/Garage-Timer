var startTime, pauseTime, endTime,
    isStarted, isPaused, interval;

function setDigits(minutes, seconds, milliseconds) {
    $('#minutes').html(minutes);
    $('#seconds').html(seconds);
    $('#milliseconds').html(milliseconds);
}

function setStateBtn(classRemove, classAdd, btnText) {
    var state = $('#state');
    state.removeClass('btn-' + classRemove);
    state.addClass('btn-' + classAdd);
    state.html(btnText);
}

function setDefaults(mode) {
    clearInterval(interval);
    $('body').find('*').each((index, element) => $(element).off('click'));
    $('#reset').click(() => onReset(mode));
    $('#countdown-min').val('');
    $('#countdown-sec').val('');
    startTime = 0;
    pauseTime = 0;
    endTime = null;
    isStarted = false;
    isPaused = false;
    setDigits('00', '00', '00');
    setStateBtn('warning', 'success', 'START');
}

function formatTime(time) {
    var totalMinutes = Math.floor(time / 60000);
    var totalSeconds = Math.floor((time % 60000) / 1000);
    var totalMilliseconds = (time / 1000).toFixed(2);
    var minuteString = (totalMinutes < 10) ? ('0' + totalMinutes) : totalMinutes;
    var secondString = (totalSeconds < 10) ? ('0' + totalSeconds) : totalSeconds;
    var millisecondString = totalMilliseconds.toString().slice(-2);
    setDigits(minuteString, secondString, millisecondString);
}

function updateStopwatch() {
    var totalTime = Date.now() - startTime;
    var totalMinutes = Math.floor(totalTime / 60000);
    if (totalMinutes >= 99) {
        loadTimer('stopwatch');
    }
    formatTime(totalTime);
}

function updateCountdown() {
    var totalTime = endTime - Date.now();
    formatTime(totalTime);
    if (totalTime <= 0) {
        loadTimer('countdown');
    }
}

function onReset(mode) {
    var result = confirm('RESET TIMER?');
    if (result) {
        loadTimer(mode);
    }
}

function onStateChange(mode) {
    if (!isStarted) {
        if (mode === 'stopwatch') {
            startTime = Date.now();
            interval = setInterval(() => isPaused ? null : updateStopwatch(), 1);
        } else if (mode === 'countdown') {
            var minutes = $('#countdown-min').val();
            var seconds = $('#countdown-sec').val();
            if (!minutes || !seconds || (parseInt(minutes) === 0 && parseInt(seconds) === 0)) {
                return;
            }
            endTime = new Date();
            endTime.setMinutes(endTime.getMinutes() + parseInt(minutes));
            endTime.setSeconds(endTime.getSeconds() + parseInt(seconds));
            interval = setInterval(() => isPaused ? null : updateCountdown(), 1);
        }
        isStarted = true;
        setStateBtn('success', 'warning', 'PAUSE');
    } else {
        if (!isPaused) {
            isPaused = true;
            pauseTime = Date.now();
            setStateBtn('warning', 'success', 'RESUME');
        } else {
            if (mode === 'stopwatch') {
                startTime += (Date.now() - pauseTime);
            } else if (mode === 'countdown') {
                endTime -= (pauseTime - Date.now());
            }
            isPaused = false;
            setStateBtn('success', 'warning', 'PAUSE');
        }
    }
}

function loadTimer(mode) {
    setDefaults(mode);
    $('#' + mode).show();
    if (mode === 'stopwatch') {
        $('#countdown').hide();
    } else if (mode === 'countdown') {
        $('#stopwatch').hide();
    }
    $('#state').click(() => onStateChange(mode));
}

function filterInput(event, maxNum) {
    var value = event.target.value;
    if (event.keyCode === 8 || event.keyCode === 9 ||
        event.keyCode === 37 || event.keyCode === 39 || event.keyCode === 46) {
        return;
    }
    var char = String.fromCharCode(event.keyCode);
    if (!char.match(/^\d*$/)) {
        event.preventDefault();
    }
    if (parseInt(value + char) > maxNum) {
        event.preventDefault();
    }
    if (value.length >= maxNum.toString().length) {
        event.preventDefault();
    }
}

$(document).ready(() => {
    const pages = {
        stopwatch: () => loadTimer('stopwatch'),
        countdown: () => loadTimer('countdown'),
    };
    var routes = {
        '/': pages.stopwatch,
        '/stopwatch': pages.stopwatch,
        '/countdown': pages.countdown,
    };
    var router = Router(routes);
    router.init('/');
});
