var startTime, pauseTime, endTime,
    isStarted, isPaused, interval;

function setDigits(minutes, seconds, milliseconds) {
    document.querySelector('#minutes').innerHTML = minutes;
    document.querySelector('#seconds').innerHTML = seconds;
    document.querySelector('#milliseconds').innerHTML = milliseconds;
}

function setStateBtn(classRemove, classAdd, btnText) {
    var state = document.querySelector('#state');
    state.classList.remove(`btn-${classRemove}`);
    state.classList.add(`btn-${classAdd}`);
    state.innerHTML = btnText;
}

function setDefaults(mode) {
    startTime = 0;
    pauseTime = 0;
    endTime = null;
    isStarted = false;
    isPaused = false;

    clearInterval(interval);

    var state = document.querySelector('#state');
    var reset = document.querySelector('#reset');
    state.removeEventListener('click', onStateChange);
    reset.removeEventListener('click', onReset);
    reset.addEventListener('click', onReset);
    reset.mode = mode;

    document.querySelector('#countdown-min').value = '10';
    document.querySelector('#countdown-sec').value = '00';

    setDigits('00', '00', '00');
    setStateBtn('warning', 'success', 'START');
}

function formatTime(time) {
    var totalMinutes = Math.floor(time / 60000);
    var totalSeconds = Math.floor((time % 60000) / 1000);
    var totalMilliseconds = (time / 1000).toFixed(2);
    var minuteString = (totalMinutes < 10) ? (`0${totalMinutes}`) : totalMinutes;
    var secondString = (totalSeconds < 10) ? (`0${totalSeconds}`) : totalSeconds;
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

function onReset(event) {
    var mode = event.target.mode;
    var result = confirm(`RESET ${mode.toUpperCase()}?`);
    if (result) {
        loadTimer(mode);
    }
}

function onStateChange(event) {
    var mode = event.target.mode;
    if (!isStarted) {
        if (mode === 'stopwatch') {
            startTime = Date.now();
            interval = setInterval(() => isPaused ? null : updateStopwatch(), 1);
        } else if (mode === 'countdown') {
            var minutes = document.querySelector('#countdown-min').value;
            var seconds = document.querySelector('#countdown-sec').value;
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
    document.querySelector(`#${mode}`).style.display = 'block';
    if (mode === 'stopwatch') {
        document.querySelector('#countdown').style.display = 'none';
    } else if (mode === 'countdown') {
        document.querySelector('#stopwatch').style.display = 'none';
    }
    var state = document.querySelector('#state');
    state.addEventListener('click', onStateChange);
    state.mode = mode;
}

function filterInput(event, maxNum) {
    var keyCode = event.which || event.keyCode || 0;
    if (keyCode === 8 || keyCode === 9 || keyCode === 37 || keyCode === 39 || keyCode === 46) {
        return;
    }
    var value = event.target.value;
    var char = String.fromCharCode(keyCode);
    if (!char.match(/^\d*$/) || parseInt(value + char) > maxNum) {
        event.preventDefault();
    }
}

document.addEventListener('DOMContentLoaded', () => {
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
