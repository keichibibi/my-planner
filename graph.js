const weeklyChart =
    document.getElementById("weeklyChart");

const weeklyAverage = document.getElementById("weeklyAverage");

const streak = document.getElementById("streak");

const scheduleChart = document.getElementById("scheduleChart");

const scheduleDetails = document.getElementById("scheduleDetails");

const backButton =
    document.getElementById("backButton");


// ========================
// 今日の日付
// ========================

const today = new Date();


// ========================
// 日付を YYYY-MM-DD にする
// ========================

function formatDate(date) {

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const day =
        String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// ========================
// plannerDataを取得
// ========================

function getAllData() {

    return JSON.parse(
        localStorage.getItem("plannerData")
    ) || {};

}


// ========================
// 過去7日間のデータを取得
// ========================

function getWeeklyData() {

    const allData =
        getAllData();

    const weeklyData = [];


    for (let i = 6; i >= 0; i--) {

        const date =
            new Date(today);

        date.setDate(
            today.getDate() - i
        );


        const dateKey =
            formatDate(date);


        const dayData =
            allData[dateKey];


        let percentage = 0;


        // その日のデータが存在する場合
        if (dayData) {

            const todos =
                dayData.todos || [];

            const notTodos =
                dayData.notTodos || [];


            const allTasks = [
                ...todos,
                ...notTodos
            ];


            // タスクが存在する場合
            if (allTasks.length > 0) {

                const completedTasks =
                    allTasks.filter(function(task) {

                        return task.completed;

                    });


                percentage =
                    Math.round(
                        completedTasks.length /
                        allTasks.length *
                        100
                    );
            }
        }


        weeklyData.push({

            date: date,

            percentage: percentage

        });
    }


    return weeklyData;
}

function getStreak() {
    const allData = getAllData();

    let streakCount = 0;

    for (let i = 0; ; i++) {

        const date = new Date(today);

        date.setDate(
            today.getDate() - i
        );

        const dateKey =
            formatDate(date);

        const dayData =
            allData[dateKey];

        // データが存在しない場合
        if (!dayData) {
            break;
        }

        const todos =
            dayData.todos || [];

        const notTodos =
            dayData.notTodos || [];

        const allTasks = [
            ...todos,
            ...notTodos
        ];

        // タスクが1つもない場合
        if (allTasks.length === 0) {
            break;
        }

        const completedTasks =
            allTasks.filter(function(task) {
                return task.completed;
            });

        // 100%達成ではない場合
        if (
            completedTasks.length !==
            allTasks.length
        ) {
            break;
        }

        streakCount++;
    }

    return streakCount;
}

function getTodaySchedule() {
    const allData = getAllData();

    const todayKey =
        formatDate(today);

    const dayData =
        allData[todayKey];

    if (!dayData) {
        return [];
    }

    const todos =
        dayData.todos || [];

    // 時刻が設定されているToDoだけ取得
    const scheduledTodos =
        todos.filter(function(task) {
            return task.time;
        });

    return scheduledTodos;
}

function getHourlySchedule() {
    const todos =
        getTodaySchedule();

    const hourlyData = {};

    todos.forEach(function(task) {

        const hour =
            Number(task.time.split(":")[0]);

        if (!hourlyData[hour]) {
            hourlyData[hour] = 0;
        }

        hourlyData[hour]++;
    });

    return hourlyData;
}

function displayStreak() {
    const streakCount =
        getStreak();

    streak.innerHTML = `
        <span class="streak-icon">🔥</span>

        <span class="streak-value">
            ${streakCount}
        </span>

        <span class="streak-label">
            DAY STREAK
        </span>
    `;
}


// ========================
// グラフを表示
// ========================

function displayWeeklyChart() {
    const weeklyData = getWeeklyData();

    weeklyChart.innerHTML = "";

    // --------------------
    // 平均達成率を計算
    // --------------------

    const totalPercentage =
        weeklyData.reduce(function(total, item) {
            return total + item.percentage;
        }, 0);

    const averagePercentage =
        Math.round(
            totalPercentage / weeklyData.length
        );

    weeklyAverage.innerHTML = `
        <span class="average-label">
            7 DAYS AVERAGE
        </span>

        <span class="average-value">
            ${averagePercentage}%
        </span>
    `;


    // --------------------
    // グラフを作成
    // --------------------

    weeklyData.forEach(function(item) {

        const column =
            document.createElement("div");

        column.classList.add("chart-column");


        // 今日かどうか判定
        const isToday =
            formatDate(item.date) === formatDate(today);

        if (isToday) {
            column.classList.add("today-column");
        }


        // 数字
        const value =
            document.createElement("span");

        value.classList.add("chart-value");

        value.textContent =
            `${item.percentage}%`;


        // 棒
        const bar =
            document.createElement("div");

        bar.classList.add("chart-bar");


        // 0%でも少しだけ棒を表示
        if (item.percentage === 0) {
            bar.style.height = "4px";
            bar.classList.add("zero-bar");
        } else {
            bar.style.height =
                `${item.percentage}%`;
        }


        // 日付
        const label =
            document.createElement("span");

        label.classList.add("chart-label");

        label.textContent =
            `${item.date.getMonth() + 1}/${item.date.getDate()}`;


        column.appendChild(value);
        column.appendChild(bar);
        column.appendChild(label);

        weeklyChart.appendChild(column);
    });
}

function displayScheduleDetails(hour) {
    const todos =
        getTodaySchedule();

    const tasksAtHour =
        todos.filter(function(task) {
            const taskHour =
                Number(task.time.split(":")[0]);

            return taskHour === hour;
        });

    scheduleDetails.innerHTML = "";

    if (tasksAtHour.length === 0) {
        return;
    }

    const title =
        document.createElement("h3");

    title.textContent =
        `${String(hour).padStart(2, "0")}:00 の予定`;

    scheduleDetails.appendChild(title);


    tasksAtHour
        .sort(function(a, b) {
            return a.time.localeCompare(b.time);
        })
        .forEach(function(task) {

            const taskElement =
                document.createElement("div");

            taskElement.classList.add(
                "schedule-detail-item"
            );


            const time =
                document.createElement("span");

            time.classList.add(
                "schedule-detail-time"
            );

            time.textContent =
                task.time;


            const text =
                document.createElement("span");

            text.classList.add(
                "schedule-detail-text"
            );

            text.textContent =
                task.text;


            taskElement.appendChild(time);
            taskElement.appendChild(text);

            scheduleDetails.appendChild(
                taskElement
            );
        });
}

function displayScheduleChart() {
    const hourlyData =
        getHourlySchedule();

    scheduleChart.innerHTML = "";

    const hours = [];

    for (let hour = 6; hour <= 23; hour++) {
        hours.push(hour);
    }

    hours.forEach(function(hour) {

        const count =
            hourlyData[hour] || 0;

        const column =
            document.createElement("div");

        column.classList.add(
            "schedule-chart-column"
        );


        // 予定数
        const value =
            document.createElement("span");

        value.classList.add(
            "schedule-chart-value"
        );

        value.textContent =
            count;


        // 棒
        const bar =
            document.createElement("div");

        bar.classList.add(
            "schedule-chart-bar"
        );

        bar.classList.add(
            "schedule-clickable"
        );

        bar.addEventListener(
            "click",
            function() {
                displayScheduleDetails(hour);
            }
        );

        // 予定がない時間は最低限の高さ
        if (count === 0) {
            bar.style.height = "4px";
            bar.classList.add(
                "schedule-zero-bar"
            );
        } else {
            bar.style.height =
                `${count * 35}px`;
        }


        // 時刻
        const label =
            document.createElement("span");

        label.classList.add(
            "schedule-chart-label"
        );

        label.textContent =
            `${String(hour).padStart(2, "0")}:00`;


        column.appendChild(value);
        column.appendChild(bar);
        column.appendChild(label);

        scheduleChart.appendChild(column);
    });
}

// ========================
// Daily Schedule
// ========================

function displaySchedule() {

    const scheduleTimeline =
        document.getElementById("scheduleTimeline");

    if (!scheduleTimeline) {
        return;
    }

    scheduleTimeline.innerHTML = "";

    // localStorageからデータ取得
    const allData =
        JSON.parse(
            localStorage.getItem("plannerData")
        ) || {};

    // 今日の日付
    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(today.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(today.getDate())
            .padStart(2, "0");

    const dateKey =
        `${year}-${month}-${day}`;

    const currentData =
        allData[dateKey];

    // データがない場合
    if (!currentData) {
        return;
    }

    // 時間が設定されているToDoだけ取得
    const todos =
        currentData.todos
            .filter(function(task) {

                return task.time;

            })
            .sort(function(a, b) {

                return a.time.localeCompare(b.time);

            });


    todos.forEach(function(task) {

        const item =
            document.createElement("div");

        item.classList.add(
            "schedule-item"
        );


        // 時間
        const time =
            document.createElement("span");

        time.classList.add(
            "schedule-time"
        );

        time.textContent =
            task.time;


        // タスク
        const text =
            document.createElement("span");

        text.classList.add(
            "schedule-text"
        );

        text.textContent =
            task.text;


        item.appendChild(time);

        item.appendChild(text);

        scheduleTimeline.appendChild(item);

    });

}

// ========================
// 戻るボタン
// ========================

backButton.addEventListener(
    "click",
    function() {

        window.location.href =
            "index.html";

    }
);


// ========================
// 最初の表示
// ========================

displayWeeklyChart();
displayStreak();
displayScheduleChart();
displaySchedule();