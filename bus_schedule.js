let nextBusTime;

// 次のバスの時間を見つける関数
function findNextBusTime(schedule, now) {
    let isWeekend = (now.getDay() === 0 || now.getDay() === 6);
    let scheduleForToday = isWeekend ? schedule["weekend"] : schedule["weekday"]["regular"];

    // 7:30〜10:00のとき
    if (!isWeekend && now.getHours() >= 7 && now.getHours() < 10) {
        let irregularSchedule = schedule["weekday"]["irregular"];
        if (now.getHours() === irregularSchedule["start_hour"] && now.getMinutes() >= irregularSchedule["start_minute"] ||
            now.getHours() > irregularSchedule["start_hour"] && now.getHours() < irregularSchedule["end_hour"] ||
            now.getHours() === irregularSchedule["end_hour"] && now.getMinutes() < irregularSchedule["end_minute"]) {
            return "朝7:30〜10:00は、6〜7分おきでシャトルバスを運行しています。";
        }
    }

    let nextBusTime = null;

    for (let timeSlot of scheduleForToday) {
        let hour = timeSlot["hour"];
        for (let minute of timeSlot["minutes"]) {
            let busTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
            if (busTime > now) {
                if (nextBusTime === null || busTime < nextBusTime) {
                    nextBusTime = busTime;
                }
            }
        }
    }

    // If there's no more buses for the day, return null
    if (!nextBusTime && !isWeekend) {
        nextBusTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 7, 30);
    }

    return nextBusTime;
}

// 次のバスまでのカウントダウン時間を計算する関数
function countdownToNextBus(nextBusTime, currentTime) {
    if (typeof nextBusTime === 'string') {
        return nextBusTime;
    }

    let remainingTime = Math.floor((nextBusTime - currentTime) / 1000);

    let remainingMinutes = Math.floor(remainingTime / 60);
    let remainingSeconds = remainingTime % 60;

    return remainingMinutes + "分" + remainingSeconds + "秒後に出発します";
}

// 次のバスまでのカウントダウンを表示
function updateCountdown() {
    let currentTime = new Date();
    let countdown = countdownToNextBus(nextBusTime, currentTime);
    document.getElementById("countdown").innerHTML = countdown;
}