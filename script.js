// ========================
// HTMLの要素を取得
// ========================
const graphButton = document.getElementById("graphButton");

const dateElement = document.getElementById("date");

const progress =
    document.getElementById("progress");

const progressPercentage =
    document.getElementById("progressPercentage");

const progressBarFill =
    document.getElementById("progressBarFill");

const previousDayButton =
    document.getElementById("previousDayButton");

const nextDayButton =
    document.getElementById("nextDayButton");

const todayButton =
    document.getElementById("todayButton");

const datePicker =
    document.getElementById("datePicker");

const todoInput =
    document.getElementById("todoInput");

const todoTime = 
    document.getElementById("todoTime");

const todoAddButton =
    document.getElementById("todoAddButton");

const todoList =
    document.getElementById("todoList");


const notTodoInput =
    document.getElementById("notTodoInput");

const notTodoAddButton =
    document.getElementById("notTodoAddButton");

const notTodoList =
    document.getElementById("notTodoList");

const scheduleList = document.getElementById("scheduleList");

// ========================
// 今日の日付
// ========================

const today = new Date();

// ========================
// 現在表示している日付
// ========================

// 最初は今日を表示する
let currentDate = new Date(today);


// ========================
// 日付を「YYYY-MM-DD」にする
// ========================

function getDateKey(date) {

    const year = date.getFullYear();

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const day =
        String(date.getDate()).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


// ========================
// 日付を画面に表示
// ========================

function displayDate() {

    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth() + 1;

    const day =
        currentDate.getDate();


    dateElement.textContent =
        `${year}年${month}月${day}日`;

}


// ========================
// localStorageからデータ取得
// ========================

let allData =
    JSON.parse(
        localStorage.getItem("plannerData")
    ) || {};


// ========================
// 現在の日付のデータを取得
// ========================

function getCurrentData() {

    const dateKey =
        getDateKey(currentDate);


    // その日付のデータがなければ作る
    if (!allData[dateKey]) {

        allData[dateKey] = {

            todos: [],

            notTodos: []

        };

    }


    // 古いデータ対策
    if (!allData[dateKey].todos) {

        allData[dateKey].todos = [];

    }


    if (!allData[dateKey].notTodos) {

        allData[dateKey].notTodos = [];

    }


    return allData[dateKey];

}


// ========================
// データを保存
// ========================

function saveData() {

    localStorage.setItem(
        "plannerData",
        JSON.stringify(allData)
    );

}


// ========================
// やることを追加
// ========================

function addTodo() {

    const text =
        todoInput.value.trim();


    if (text === "") {
        return;
    }

    const time =
        todoTime.value;

    const currentData =
        getCurrentData();

    const task = {

        text: text,

        time: time,

        completed: false

    };


    currentData.todos.push(task);


    saveData();

    displayTodos();

    updateProgress();


    todoInput.value = "";

    todoTime.value = "";

}


// ========================
// やらないことを追加
// ========================

function addNotTodo() {

    const text =
        notTodoInput.value.trim();


    if (text === "") {
        return;
    }


    const currentData =
        getCurrentData();


    const task = {

        text: text,

        completed: false

    };


    currentData.notTodos.push(task);


    saveData();

    displayNotTodos();

    updateProgress();


    notTodoInput.value = "";

}


// ========================
// やることを表示
// ========================

function displayTodos() {

    todoList.innerHTML = "";


    const currentData =
        getCurrentData();

    currentData.todos.sort(
        function(a, b) {
          return a.time.localeCompare(b.time);
        }
    );


    currentData.todos.forEach(
        function(task, index) {

            createTaskElement(

                task,

                index,

                todoList,

                currentData.todos,
                "todo"

            );

        }
    );
    displaySchedule();
}


// ========================
// やらないことを表示
// ========================

function displayNotTodos() {

    notTodoList.innerHTML = "";


    const currentData =
        getCurrentData();


    currentData.notTodos.forEach(
        function(task, index) {

            createTaskElement(

                task,

                index,

                notTodoList,

                currentData.notTodos,
                "notTodo"

            );

        }
    );

}

function displaySchedule() {
  const currentData = getCurrentData();

  scheduleList.innerHTML = "";

  const now = new Date();
  const currentHour = now.getHours();

  // 時間が設定されているToDoだけ取得
  const scheduledTodos = currentData.todos.filter(function(task) {
    return task.time;
  });

  // 時間順に並べる
  scheduledTodos.sort(function(a, b) {
    return a.time.localeCompare(b.time);
  });

  // 予定がない場合
  if (scheduledTodos.length === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.classList.add("schedule-empty");
    emptyMessage.textContent = "予定はありません";
    scheduleList.appendChild(emptyMessage);

    return;
  }

  // 時間ごとにまとめる
  const groupedTasks = {};

  scheduledTodos.forEach(function(task) {
    const hour = Number(task.time.split(":")[0]);

    if (!groupedTasks[hour]) {
      groupedTasks[hour] = [];
    }

    groupedTasks[hour].push(task);
  });

  // 時間ごとに表示
  Object.keys(groupedTasks).forEach(function(hour) {

    const scheduleItem = document.createElement("div");
    scheduleItem.classList.add("schedule-item");

    // 現在時刻の時間なら強調
    if (Number(hour) === currentHour) {
      scheduleItem.classList.add("current-hour");
    }

    const time = document.createElement("span");
    time.classList.add("schedule-time");
    time.textContent =
      String(hour).padStart(2, "0") + ":00";

    const taskText = document.createElement("span");
    taskText.classList.add("schedule-task");

    taskText.textContent =
      groupedTasks[hour]
        .map(function(task) {
          return task.time + " " + task.text;
        })
        .join(" / ");

    scheduleItem.appendChild(time);
    scheduleItem.appendChild(taskText);

    scheduleList.appendChild(scheduleItem);
  });
}


// ========================
// タスクのHTMLを作る
// ========================

function createTaskElement(
    task,
    index,
    list,
    data,
    type
) {

    const li =
        document.createElement("li");


    // ========================
    // チェックボックス
    // ========================

    const checkbox =
        document.createElement("input");

    checkbox.type = "checkbox";

    checkbox.checked =
        task.completed;


    // ========================
    // タスクの文字
    // ========================

    const span =
        document.createElement("span");

    if (type === "todo") {
        span.textContent =
            `${task.time} ${task.text}`;
    } else {
        span.textContent =
            task.text;
    }

    // 完了済みなら線を引く
    if (task.completed) {

        span.classList.add("completed");

    }


    // ========================
    // 編集ボタン
    // ========================

    const editButton =
        document.createElement("button");

    editButton.textContent = "編集";

    editButton.classList.add(
        "edit-button"
    );


    // ========================
    // 削除ボタン
    // ========================

    const deleteButton =
        document.createElement("button");

    deleteButton.textContent = "削除";

    deleteButton.classList.add(
        "delete-button"
    );


    // ========================
    // チェックボックス
    // ========================

    checkbox.addEventListener(
        "change",
        function() {

            task.completed =
                checkbox.checked;


            if (task.completed) {

                span.classList.add(
                    "completed"
                );

            } else {

                span.classList.remove(
                    "completed"
                );

            }


            saveData();

            updateProgress();

        }
    );


    // ========================
    // 編集ボタン
    // ========================

    editButton.addEventListener(
        "click",
        function() {
            
            // 時間入力欄を作る
            let timeInput = null;

            if (type === "todo") {

                timeInput =
                    document.createElement("input");
                
                timeInput.type = "time";

                timeInput.value =
                    task.time;
            }
            
            // タスク入力欄を作る
            const textInput =
                document.createElement("input");

            textInput.type = "text";

            textInput.value =
                task.text;


            // 保存ボタンを作る
            const saveButton =
                document.createElement("button");

            saveButton.textContent = "保存";


            // キャンセルボタンを作る
            const cancelButton =
                document.createElement("button");

            cancelButton.textContent = "キャンセル";


            // liの中身を一度消す
            li.innerHTML = "";


            // 編集用の要素を追加
            if (type === "todo") {
                li.appendChild(timeInput);
            }
            
            li.appendChild(textInput);

            li.appendChild(saveButton);

            li.appendChild(cancelButton);


            // ========================
            // 保存
            // ========================

            saveButton.addEventListener(
                "click",
                function() {

                    const newText =
                        textInput.value.trim();


                    if (newText === "") {

                        return;

                    }

                    if (type === "todo") {
                        const newTime = timeInput.value;
                        task.time = newTime;
                        task.text = newText;
                    } else {
                        task.text = newText;
                    }
                    
                    saveData();

                    displayTodos();

                    displayNotTodos();
                }
            );


            // ========================
            // キャンセル
            // ========================

            cancelButton.addEventListener(
                "click",
                function() {

                    displayTodos();

                    displayNotTodos();
                }
            );

        }
    );

    // ========================
    // 削除ボタン
    // ========================

    deleteButton.addEventListener(
        "click",
        function() {

            data.splice(index, 1);

            saveData();

            displayTodos();

            displayNotTodos();

            updateProgress();

        }
    );

    // ========================
    // liに追加
    // ========================

    li.appendChild(checkbox);

    li.appendChild(span);

    li.appendChild(editButton);

    li.appendChild(deleteButton);


    list.appendChild(li);
}


// ========================
// 前の日へ
// ========================

function goToPreviousDay() {

    currentDate.setDate(
        currentDate.getDate() - 1
    );


    displayDate();

    displayTodos();

    displayNotTodos();

    updateProgress();

}


// ========================
// 次の日へ
// ========================

function goToNextDay() {

    currentDate.setDate(
        currentDate.getDate() + 1
    );


    displayDate();

    displayTodos();

    displayNotTodos();

    updateProgress();

}


// ========================
// 今日に戻る
// ========================

function goToToday() {

    currentDate = new Date(today);

    datePicker.value = getDateKey(currentDate);

    displayDate();

    displayTodos();

    displayNotTodos();

}

function updateProgress() {
  const currentData = getCurrentData();

  const allTasks = [
    ...currentData.todos,
    ...currentData.notTodos
  ];

  if (allTasks.length === 0) {
    progressPercentage.textContent = "0%";
    progressBarFill.style.width = "0%";
    return;
  }

  const completedTasks =
    allTasks.filter(function(task) {
      return task.completed;
    });

  const percentage =
    Math.round(
      completedTasks.length /
      allTasks.length *
      100
    );

  progressPercentage.textContent =
    `${percentage}%`;

  progressBarFill.style.width =
    `${percentage}%`;
}

// ========================
// ボタン
// ========================

todoAddButton.addEventListener(
    "click",
    addTodo
);


notTodoAddButton.addEventListener(
    "click",
    addNotTodo
);


previousDayButton.addEventListener(
    "click",
    goToPreviousDay
);


nextDayButton.addEventListener(
    "click",
    goToNextDay
);


todayButton.addEventListener(
    "click",
    goToToday
);

datePicker.addEventListener(
    "change",
    function() {
      
      const selectedDate =
          new Date(datePicker.value + "T00:00:00");
      
      currentDate = selectedDate;

      displayDate();

      displayTodos();

      displayNotTodos();

      updateProgress();
    }
);


// ========================
// Enterキー
// ========================

todoInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            addTodo();

        }

    }
);


notTodoInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            addNotTodo();

        }

    }
);

graphButton.addEventListener("click", function() {
  window.location.href = "graph.html";
});


// ========================
// 最初の表示
// ========================
datePicker.value = getDateKey(currentDate);

displayDate();

displayTodos();

displayNotTodos();

updateProgress();