// DOMの取得
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const categorySelect = document.getElementById("category-select");
const dueDateInput = document.getElementById("due-date");
const taskList = document.getElementById("task-list");

// ローカルストレージからデータを読み込む
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// タスクを画面に表示
function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.category}` + (task.completed ? " completed" : "");
    
    li.innerHTML = `
      <input type="checkbox" ${task.completed ? "checked" : ""} data-index="${index}" class="check-btn" />
      <div class="task-info">
        <strong>${task.title}</strong><br />
        🏷 ${task.category}　📅 ${task.dueDate || "未設定"}
      </div>
      <div class="task-buttons">
        <button class="delete-btn" data-index="${index}">削除</button>
      </div>
    `;
    taskList.appendChild(li);
  });

  // 件数や達成率も更新
  updateStats();
}


// タスクをローカルストレージに保存
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// タスク追加時の処理
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = taskInput.value.trim();
  const category = categorySelect.value;
  const dueDate = dueDateInput.value;

  if (!title) return;

  const newTask = {
    title,
    category,
    dueDate,
    completed: false
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  taskForm.reset(); // フォームを空に
});

// 削除・チェック切り替え（イベント委任）
taskList.addEventListener("click", (e) => {
  const index = e.target.dataset.index;

  if (e.target.classList.contains("delete-btn")) {
    tasks.splice(index, 1);
  }

  if (e.target.classList.contains("check-btn")) {
    tasks[index].completed = e.target.checked;
  }

  saveTasks();
  renderTasks();
});

// 最初に読み込み
renderTasks();

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const stats = document.getElementById("task-stats");
  stats.textContent = `全体: ${total}件 / 完了: ${completed}件（${percent}%）`;
}
