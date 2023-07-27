let nextBusTime;
let nextNextBusTime;
let nextNextNextBusTime;

function nextBusTimeText() {
    // 現在日時を取得
    let now = new Date();

    // 次のバスの時間を見つける
    nextBusTime = findNextBusTime(schedule, now);
    if (nextBusTime) {
        return "次のバス：" + nextBusTime.toLocaleTimeString("ja-JP", {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    return "今日のバスの運行は終了しました。次のバスは明日の7:30です。";
}

function nextNextBusTimeText() {
    // 次のバスの時間を基に次の次のバスの時間を見つける
    nextNextBusTime = findNextBusTime(schedule, new Date(nextBusTime.getTime() + 60000)); // 次のバスの時間を1分進めて次の次のバスを見つける
    nextNextNextBusTime = findNextBusTime(schedule, new Date(nextNextBusTime.getTime() + 60000)); // さらに次のバス
    let timeText = "後続：";
    if (nextNextBusTime) {
        timeText = timeText + nextNextBusTime.toLocaleTimeString("ja-JP", {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    if (nextNextNextBusTime) {
        timeText = timeText + ", " + nextNextNextBusTime.toLocaleTimeString("ja-JP", {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    if (nextNextBusTime || nextNextNextBusTime) {
        return timeText;
    }

    return "";
}

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

    // バスが出発したら、次のバスの時間と次の次のバスの時間を更新
    if (nextBusTime < currentTime) {
        document.getElementById("next-bus").innerHTML = nextBusTimeText();
        document.getElementById("next-next-bus").innerHTML = nextNextBusTimeText();
        countdown = countdownToNextBus(nextBusTime, new Date());  // 新しい "nextBusTime" に基づいてカウントダウンを更新
    }

    document.getElementById("countdown").innerHTML = countdown;
}

// テーブルを作成する
function generateScheduleTable(tableId, scheduleForDay, isWeekdayTable) {
    let table = document.getElementById(tableId);
    let tbody = document.createElement('tbody');

    // テーブルのヘッダーを作成
    let header = document.createElement('tr');
    header.innerHTML = `<th style="background-color: rgb(204, 193, 217);">時間</th>
                        <th style="background-color: rgb(204, 193, 217);">${tableId === 'weekday-table' ? '平日' : '週末'}</th>`;
    tbody.appendChild(header);

    // 現在の時間と曜日を取得
    let currentDate = new Date();
    let currentHour = currentDate.getHours();
    let currentDay = currentDate.getDay();

    // 現在の日付が平日であるかどうかをチェック
    let isWeekday = currentDay >= 1 && currentDay <= 5;

    // 7時から20時までの各時間帯に対して
    for (let hour = 7; hour <= 20; hour++) {
        let row = document.createElement('tr');

        // 現在の時間と行の時間が一致し、かつ現在が平日で、かつテーブルが平日のテーブルの場合、行にクラスを追加
        if (hour === currentHour && isWeekday && isWeekdayTable) {
            row.classList.add('is-selected');
        }

        // 時間帯のセルを作成
        let timeCell = document.createElement('th');
        timeCell.textContent = hour;
        row.appendChild(timeCell);

        // スケジュールのセルを作成
        let scheduleCell = document.createElement('td');
        scheduleCell.innerHTML = generateScheduleCellContent(scheduleForDay, hour);
        row.appendChild(scheduleCell);

        tbody.appendChild(row);
    }

    table.appendChild(tbody);
}

// スケジュールのセルの内容を作成する
function generateScheduleCellContent(scheduleForDay, hour) {
    let content = "";
    for (let timeSlot of scheduleForDay) {
        if (timeSlot.hour === hour) {
            content = timeSlot.minutes.join("　");
            if (hour === 7) {
                content += "　7:30-9:55 6～7分間隔運行 ";
            }
        }
    }
    return content;
}
