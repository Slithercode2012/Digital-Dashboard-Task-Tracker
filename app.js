// 1. Clock and Greeting Timer
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; 
    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds} ${ampm}`;

    const currentHour = now.getHours();
    let greetingText = "Good evening";
    if (currentHour < 12) greetingText = "Good morning";
    else if (currentHour < 18) greetingText = "Good afternoon";
    document.getElementById('greeting').textContent = greetingText + ", welcome back!";
}
setInterval(updateClock, 1000);
updateClock();
document.getElementById('dateInput').valueAsDate = new Date();

// 2. Interactive Calendar Handler
const defaultCal = "https://calendar.google.com/calendar/embed?src=en.usa%23holiday%40group.v.calendar.google.com&ctz=America%2FNew_York&mode=MONTH&wkst=1&bgcolor=%231a1a1e";
const calendarFrame = document.getElementById('calendarFrame');
const calUrlInput = document.getElementById('calUrlInput');
const settingsModal = document.getElementById('settingsModal');

const savedCal = localStorage.getItem('sharedCalendarLink') || defaultCal;
calendarFrame.src = savedCal;
calUrlInput.value = savedCal;

function toggleModal(show) { settingsModal.style.display = show ? 'flex' : 'none'; }
function saveCalendarLink() {
    const newUrl = calUrlInput.value.trim();
    if (newUrl) {
        localStorage.setItem('sharedCalendarLink', newUrl);
        calendarFrame.src = newUrl;
        toggleModal(false);
    }
}

// 3. Task Management with Native HTML5 Drag and Drop
let savedTasks = JSON.parse(localStorage.getItem('kanbanDashboardTasks')) || [];

function renderTasks() {
    document.querySelectorAll('.kanban-column').forEach(col => {
        const header = col.querySelector('.column-header');
        col.innerHTML = '';
        col.appendChild(header);
    });

    savedTasks.forEach(task => {
        const targetColumn = document.getElementById(task.priority);
        if (targetColumn) {
            const taskEl = document.createElement('div');
            taskEl.className = `task-item ${task.priority}`;
            taskEl.id = task.id;
            taskEl.draggable = true;
            taskEl.addEventListener('dragstart', dragStart);

            let formattedDate = "No date";
            if (task.date) {
                formattedDate = new Date(task.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            }

            taskEl.innerHTML = `
                <div class="task-info">
                    <span class="task-text">${task.text}</span>
                    <span class="task-date">📅 ${formattedDate}</span>
                </div>
                <button class="delete-btn" onclick="deleteTask('${task.id}')">✕</button>
            `;
            targetColumn.appendChild(taskEl);
        }
    });

    localStorage.setItem('kanbanDashboardTasks', JSON.stringify(savedTasks));
}

function addTask() {
    const textInput = document.getElementById('taskInput');
    const dateInput = document.getElementById('dateInput');
    const priorityInput = document.getElementById('priorityInput');

    if (textInput.value.trim() !== '') {
        const newTask = {
            id: 'task_' + Date.now(),
            text: textInput.value.trim(),
            date: dateInput.value,
            priority: priorityInput.value
        };
        savedTasks.push(newTask);
        textInput.value = '';
        renderTasks();
    }
}

function deleteTask(id) {
    savedTasks = savedTasks.filter(t => t.id !== id);
    renderTasks();
}

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
}

function allowDrop(e) {
    e.preventDefault();
    const column = e.target.closest('.kanban-column');
    if (column) column.classList.add('drag-over');
}

function dragLeave(e) {
    const column = e.target.closest('.kanban-column');
    if (column) column.classList.remove('drag-over');
}

function drop(e) {
    e.preventDefault();
    const column = e.target.closest('.kanban-column');
    if (column) {
        column.classList.remove('drag-over');
        const taskId = e.dataTransfer.getData('text/plain');
        const newPriority = column.id;

        const taskObj = savedTasks.find(t => t.id === taskId);
        if (taskObj) {
            taskObj.priority = newPriority;
            renderTasks();
        }
    }
}

document.getElementById('taskInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

renderTasks();
