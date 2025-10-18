// FlowState - Anime-Inspired Productivity Dashboard
// Main JavaScript functionality with 3D animations and mood tracking

class FlowState {
    constructor() {
        this.currentSection = 'dashboard';
        this.timer = null;
        this.timerState = {
            isRunning: false,
            timeLeft: 25 * 60, // 25 minutes in seconds
            currentSession: 'focus', // focus, shortBreak, longBreak
            pomodoroCount: 0,
            focusTime: 25,
            shortBreak: 5,
            longBreak: 15
        };
        this.tasks = [];
        this.habits = [];
        this.moodData = {};
        this.currentMoodEntry = {
            mood: null,
            tags: [],
            notes: '',
            timestamp: null
        };
        this.calendarDate = new Date();
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateDateTime();
        this.setupMouseTracking();
        this.setupKeyboardShortcuts();
        this.renderDashboard();
        this.renderMoodCalendar();
        this.updateMoodAnalytics();
        this.setupTimerGradient();
        
        // Start real-time updates
        setInterval(() => this.updateDateTime(), 1000);
        
        // Show entrance animation
        this.showEntranceAnimation();
    }

    // Data Management
    loadData() {
        try {
            this.tasks = JSON.parse(localStorage.getItem('flowstate_tasks')) || [];
            this.habits = JSON.parse(localStorage.getItem('flowstate_habits')) || [];
            this.moodData = JSON.parse(localStorage.getItem('flowstate_mood')) || {};
            this.timerState = { ...this.timerState, ...JSON.parse(localStorage.getItem('flowstate_timer')) || {} };
        } catch (error) {
            console.error('Error loading data:', error);
            this.showToast('Error loading saved data', 'error');
        }
    }

    saveData() {
        try {
            localStorage.setItem('flowstate_tasks', JSON.stringify(this.tasks));
            localStorage.setItem('flowstate_habits', JSON.stringify(this.habits));
            localStorage.setItem('flowstate_mood', JSON.stringify(this.moodData));
            localStorage.setItem('flowstate_timer', JSON.stringify(this.timerState));
        } catch (error) {
            console.error('Error saving data:', error);
            this.showToast('Error saving data', 'error');
        }
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.showSection(section);
            });
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Quick mood selector
        document.querySelectorAll('.quick-mood-selector .mood-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.quickMoodSelect(e.target.dataset.mood);
            });
        });

        // Mood journal
        this.setupMoodJournalListeners();
        
        // Timer
        this.setupTimerListeners();
        
        // Tasks
        this.setupTaskListeners();
        
        // Calendar navigation
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.calendarDate.setMonth(this.calendarDate.getMonth() - 1);
            this.renderMoodCalendar();
        });
        
        document.getElementById('nextMonth').addEventListener('click', () => {
            this.calendarDate.setMonth(this.calendarDate.getMonth() + 1);
            this.renderMoodCalendar();
        });

        // Export mood data
        document.getElementById('exportMoodBtn').addEventListener('click', () => {
            this.exportMoodData();
        });
    }

    setupMoodJournalListeners() {
        // Mood selection
        document.querySelectorAll('.mood-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove previous selection
                document.querySelectorAll('.mood-option').forEach(b => b.classList.remove('selected'));
                // Add selection to clicked button
                e.currentTarget.classList.add('selected');
                this.currentMoodEntry.mood = e.currentTarget.dataset.mood;
                
                // Add success animation
                e.currentTarget.classList.add('success');
                setTimeout(() => e.currentTarget.classList.remove('success'), 600);
            });
        });

        // Tag selection
        document.querySelectorAll('.tag-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tag = e.target.dataset.tag;
                const isSelected = e.target.classList.contains('selected');
                
                if (isSelected) {
                    e.target.classList.remove('selected');
                    this.currentMoodEntry.tags = this.currentMoodEntry.tags.filter(t => t !== tag);
                } else {
                    e.target.classList.add('selected');
                    this.currentMoodEntry.tags.push(tag);
                }
            });
        });

        // Save mood entry
        document.getElementById('saveMoodBtn').addEventListener('click', () => {
            this.saveMoodEntry();
        });

        // Mood notes
        document.getElementById('moodNotes').addEventListener('input', (e) => {
            this.currentMoodEntry.notes = e.target.value;
        });
    }

    setupTimerListeners() {
        document.getElementById('startPauseBtn').addEventListener('click', () => {
            this.toggleTimer();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetTimer();
        });

        document.getElementById('skipBtn').addEventListener('click', () => {
            this.skipTimer();
        });

        document.getElementById('quickStartBtn').addEventListener('click', () => {
            this.toggleTimer();
        });

        // Timer settings
        ['focusTime', 'shortBreak', 'longBreak'].forEach(id => {
            document.getElementById(id).addEventListener('change', (e) => {
                this.timerState[id] = parseInt(e.target.value);
                if (id === 'focusTime' && this.timerState.currentSession === 'focus') {
                    this.timerState.timeLeft = this.timerState.focusTime * 60;
                    this.updateTimerDisplay();
                }
                this.saveData();
            });
        });
    }

    setupTaskListeners() {
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.showTaskInput();
        });

        document.getElementById('saveTaskBtn').addEventListener('click', () => {
            this.saveTask();
        });

        document.getElementById('cancelTaskBtn').addEventListener('click', () => {
            this.hideTaskInput();
        });

        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveTask();
            }
        });
    }

    // Mouse Tracking for 3D Effects
    setupMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            const cards = document.querySelectorAll('.card');
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = (y - centerY) / 10;
                    const rotateY = (centerX - x) / 10;
                    
                    card.style.transform = `translateZ(${this.getCardDepth()}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                    card.classList.add('tilt');
                } else {
                    card.style.transform = '';
                    card.classList.remove('tilt');
                }
            });
        });
    }

    getCardDepth() {
        return getComputedStyle(document.documentElement).getPropertyValue('--card-depth').replace('px', '');
    }

    // Keyboard Shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault();
                        this.showTaskInput();
                        break;
                    case 'm':
                        e.preventDefault();
                        this.showSection('mood');
                        break;
                    case 't':
                        e.preventDefault();
                        this.showSection('timer');
                        break;
                }
            } else if (e.key === ' ' && this.currentSection === 'timer') {
                e.preventDefault();
                this.toggleTimer();
            }
        });
    }

    // Section Management
    showSection(sectionName) {
        // Hide current section
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show new section with animation
        const newSection = document.getElementById(sectionName);
        const navBtn = document.querySelector(`[data-section="${sectionName}"]`);
        
        if (newSection && navBtn) {
            setTimeout(() => {
                newSection.classList.add('active');
                navBtn.classList.add('active');
                this.currentSection = sectionName;
                
                // Section-specific initialization
                if (sectionName === 'mood') {
                    this.initMoodSection();
                } else if (sectionName === 'timer') {
                    this.updateTimerDisplay();
                } else if (sectionName === 'tasks') {
                    this.renderTasks();
                }
            }, 100);
        }
    }

    // Theme Management
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        document.getElementById('themeToggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';
        
        localStorage.setItem('flowstate_theme', newTheme);
        
        // Add theme transition animation
        document.body.style.transition = 'all 0.5s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 500);
    }

    // Date and Time Updates
    updateDateTime() {
        const now = new Date();
        const timeOptions = { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        };
        const dateOptions = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };

        document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-US', timeOptions);
        document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', dateOptions);
    }

    // Mood Journal Functionality
    initMoodSection() {
        this.loadTodaysMood();
        this.updateMoodStreak();
    }

    loadTodaysMood() {
        const today = this.getDateKey(new Date());
        const todaysMood = this.moodData[today];
        
        if (todaysMood) {
            // Load existing mood data
            this.currentMoodEntry = { ...todaysMood };
            
            // Update UI
            document.querySelectorAll('.mood-option').forEach(btn => {
                btn.classList.remove('selected');
                if (btn.dataset.mood === todaysMood.mood) {
                    btn.classList.add('selected');
                }
            });
            
            document.querySelectorAll('.tag-btn').forEach(btn => {
                btn.classList.remove('selected');
                if (todaysMood.tags.includes(btn.dataset.tag)) {
                    btn.classList.add('selected');
                }
            });
            
            document.getElementById('moodNotes').value = todaysMood.notes || '';
        } else {
            // Reset for new entry
            this.currentMoodEntry = {
                mood: null,
                tags: [],
                notes: '',
                timestamp: null
            };
        }
    }

    saveMoodEntry() {
        if (!this.currentMoodEntry.mood) {
            this.showToast('Please select a mood first!', 'error');
            return;
        }

        const today = this.getDateKey(new Date());
        this.currentMoodEntry.timestamp = new Date().toISOString();
        this.currentMoodEntry.notes = document.getElementById('moodNotes').value;
        
        this.moodData[today] = { ...this.currentMoodEntry };
        this.saveData();
        
        // Update UI
        this.renderMoodCalendar();
        this.updateMoodAnalytics();
        this.updateMoodStreak();
        
        // Success animation and notification
        this.showToast('Mood entry saved! ✨', 'success');
        this.createConfetti();
        
        // Update dashboard stats
        this.renderDashboard();
    }

    quickMoodSelect(mood) {
        const today = this.getDateKey(new Date());
        const quickEntry = {
            mood: mood,
            tags: [],
            notes: '',
            timestamp: new Date().toISOString()
        };
        
        this.moodData[today] = quickEntry;
        this.saveData();
        
        // Update UI
        document.querySelectorAll('.quick-mood-selector .mood-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        event.target.classList.add('selected');
        
        this.showToast(`Mood logged: ${this.getMoodEmoji(mood)}`, 'success');
        this.renderDashboard();
    }

    updateMoodStreak() {
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = this.getDateKey(date);
            
            if (this.moodData[dateKey]) {
                streak++;
            } else {
                break;
            }
        }
        
        document.getElementById('moodStreak').textContent = streak;
    }

    renderMoodCalendar() {
        const calendar = document.getElementById('moodCalendar');
        const title = document.getElementById('calendarTitle');
        
        const year = this.calendarDate.getFullYear();
        const month = this.calendarDate.getMonth();
        
        title.textContent = new Date(year, month).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
        
        // Clear calendar
        calendar.innerHTML = '';
        
        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.textContent = day;
            header.style.fontWeight = '600';
            header.style.color = 'var(--text-secondary)';
            header.style.padding = '0.5rem';
            header.style.textAlign = 'center';
            calendar.appendChild(header);
        });
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            calendar.appendChild(emptyDay);
        }
        
        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            const date = new Date(year, month, day);
            const dateKey = this.getDateKey(date);
            const moodEntry = this.moodData[dateKey];
            
            if (moodEntry) {
                dayElement.classList.add('has-mood', `mood-${moodEntry.mood}`);
                dayElement.title = `${this.getMoodEmoji(moodEntry.mood)} ${moodEntry.mood}`;
            }
            
            // Highlight today
            const today = new Date();
            if (date.toDateString() === today.toDateString()) {
                dayElement.style.background = 'var(--primary-color)';
                dayElement.style.color = 'white';
            }
            
            calendar.appendChild(dayElement);
        }
    }

    updateMoodAnalytics() {
        const moods = Object.values(this.moodData);
        
        if (moods.length === 0) {
            document.getElementById('commonMood').textContent = '-';
            document.getElementById('bestDay').textContent = '-';
            document.getElementById('monthlyEntries').textContent = '0';
            return;
        }
        
        // Most common mood
        const moodCounts = {};
        moods.forEach(entry => {
            moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
        });
        
        const commonMood = Object.keys(moodCounts).reduce((a, b) => 
            moodCounts[a] > moodCounts[b] ? a : b
        );
        
        document.getElementById('commonMood').textContent = 
            `${this.getMoodEmoji(commonMood)} ${commonMood}`;
        
        // Best day of week (most positive moods)
        const dayMoods = {};
        const positiveMoods = ['happy', 'calm', 'energized'];
        
        moods.forEach(entry => {
            const date = new Date(entry.timestamp);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            
            if (!dayMoods[dayName]) dayMoods[dayName] = { positive: 0, total: 0 };
            dayMoods[dayName].total++;
            if (positiveMoods.includes(entry.mood)) {
                dayMoods[dayName].positive++;
            }
        });
        
        let bestDay = '-';
        let bestRatio = 0;
        
        Object.keys(dayMoods).forEach(day => {
            const ratio = dayMoods[day].positive / dayMoods[day].total;
            if (ratio > bestRatio) {
                bestRatio = ratio;
                bestDay = day;
            }
        });
        
        document.getElementById('bestDay').textContent = bestDay;
        
        // Monthly entries
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyEntries = moods.filter(entry => {
            const date = new Date(entry.timestamp);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).length;
        
        document.getElementById('monthlyEntries').textContent = monthlyEntries;
    }

    exportMoodData() {
        const dataStr = JSON.stringify(this.moodData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `flowstate-mood-journal-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Mood journal exported! 📄', 'success');
    }

    // Timer Functionality
    setupTimerGradient() {
        // Create SVG gradient for timer
        const svg = document.querySelector('.timer-progress');
        if (svg) {
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            gradient.id = 'timerGradient';
            
            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', '#B4A5F5');
            
            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '100%');
            stop2.setAttribute('stop-color', '#FFB5E8');
            
            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            defs.appendChild(gradient);
            svg.appendChild(defs);
        }
    }

    toggleTimer() {
        if (this.timerState.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        this.timerState.isRunning = true;
        document.getElementById('startPauseBtn').textContent = 'Pause';
        document.getElementById('quickStartBtn').textContent = 'Pause';
        
        this.timer = setInterval(() => {
            this.timerState.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timerState.timeLeft <= 0) {
                this.completeTimer();
            }
        }, 1000);
        
        this.saveData();
        this.showToast('Timer started! Focus time 🎯', 'success');
    }

    pauseTimer() {
        this.timerState.isRunning = false;
        clearInterval(this.timer);
        document.getElementById('startPauseBtn').textContent = 'Start';
        document.getElementById('quickStartBtn').textContent = 'Start';
        this.saveData();
    }

    resetTimer() {
        this.pauseTimer();
        this.timerState.timeLeft = this.timerState.focusTime * 60;
        this.updateTimerDisplay();
        this.saveData();
    }

    skipTimer() {
        this.completeTimer();
    }

    completeTimer() {
        this.pauseTimer();
        
        if (this.timerState.currentSession === 'focus') {
            this.timerState.pomodoroCount++;
            this.updatePomodoroCounter();
            
            // Determine next session
            if (this.timerState.pomodoroCount % 4 === 0) {
                this.timerState.currentSession = 'longBreak';
                this.timerState.timeLeft = this.timerState.longBreak * 60;
                this.showToast('Great work! Time for a long break 🌟', 'success');
            } else {
                this.timerState.currentSession = 'shortBreak';
                this.timerState.timeLeft = this.timerState.shortBreak * 60;
                this.showToast('Pomodoro complete! Take a short break ☕', 'success');
            }
        } else {
            // Break complete, back to focus
            this.timerState.currentSession = 'focus';
            this.timerState.timeLeft = this.timerState.focusTime * 60;
            this.showToast('Break over! Ready to focus? 💪', 'success');
        }
        
        this.updateTimerDisplay();
        this.createConfetti();
        this.saveData();
        
        // Browser notification
        if (Notification.permission === 'granted') {
            new Notification('FlowState Timer', {
                body: this.timerState.currentSession === 'focus' ? 'Break time is over!' : 'Focus session complete!',
                icon: '🍅'
            });
        }
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timerState.timeLeft / 60);
        const seconds = this.timerState.timeLeft % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('timerDisplay').textContent = timeString;
        document.getElementById('quickTimerDisplay').textContent = timeString;
        
        // Update timer label
        const labels = {
            focus: 'Focus Time',
            shortBreak: 'Short Break',
            longBreak: 'Long Break'
        };
        document.getElementById('timerLabel').textContent = labels[this.timerState.currentSession];
        
        // Update progress circle
        const totalTime = this.getTotalTimeForSession();
        const progress = (totalTime - this.timerState.timeLeft) / totalTime;
        const circumference = 2 * Math.PI * 90; // radius = 90
        const offset = circumference - (progress * circumference);
        
        const progressCircle = document.getElementById('timerProgress');
        if (progressCircle) {
            progressCircle.style.strokeDashoffset = offset;
        }
    }

    getTotalTimeForSession() {
        switch (this.timerState.currentSession) {
            case 'focus': return this.timerState.focusTime * 60;
            case 'shortBreak': return this.timerState.shortBreak * 60;
            case 'longBreak': return this.timerState.longBreak * 60;
            default: return this.timerState.focusTime * 60;
        }
    }

    updatePomodoroCounter() {
        const container = document.getElementById('pomodoroCounter');
        if (!container) return;
        
        container.innerHTML = '';
        
        for (let i = 0; i < 8; i++) {
            const dot = document.createElement('div');
            dot.className = 'pomodoro-dot';
            if (i < this.timerState.pomodoroCount) {
                dot.classList.add('completed');
            }
            container.appendChild(dot);
        }
    }

    // Task Management
    showTaskInput() {
        document.getElementById('taskInputContainer').style.display = 'block';
        document.getElementById('taskInput').focus();
    }

    hideTaskInput() {
        document.getElementById('taskInputContainer').style.display = 'none';
        document.getElementById('taskInput').value = '';
    }

    saveTask() {
        const taskText = document.getElementById('taskInput').value.trim();
        const category = document.getElementById('taskCategory').value;
        
        if (!taskText) {
            this.showToast('Please enter a task description', 'error');
            return;
        }
        
        const task = {
            id: Date.now(),
            text: taskText,
            category: category,
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: 'today' // Default to today
        };
        
        this.tasks.push(task);
        this.saveData();
        this.hideTaskInput();
        this.renderTasks();
        this.renderDashboard();
        
        this.showToast('Task added! 📝', 'success');
    }

    renderTasks() {
        const todayContainer = document.getElementById('todayTasks');
        const weekContainer = document.getElementById('weekTasks');
        const completedContainer = document.getElementById('completedTasks');
        
        if (!todayContainer) return;
        
        // Clear containers
        [todayContainer, weekContainer, completedContainer].forEach(container => {
            if (container) container.innerHTML = '';
        });
        
        // Sort tasks
        const todayTasks = this.tasks.filter(task => !task.completed && task.dueDate === 'today');
        const weekTasks = this.tasks.filter(task => !task.completed && task.dueDate === 'week');
        const completedTasks = this.tasks.filter(task => task.completed);
        
        // Render task lists
        this.renderTaskList(todayTasks, todayContainer);
        this.renderTaskList(weekTasks, weekContainer);
        this.renderTaskList(completedTasks, completedContainer);
    }

    renderTaskList(tasks, container) {
        if (!container) return;
        
        if (tasks.length === 0) {
            container.innerHTML = '<div class="empty-state">No tasks here yet</div>';
            return;
        }
        
        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item';
            taskElement.innerHTML = `
                <div class="task-content">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} 
                           onchange="flowState.toggleTask(${task.id})">
                    <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                    <span class="task-category">${task.category}</span>
                </div>
                <button class="task-delete" onclick="flowState.deleteTask(${task.id})">🗑️</button>
            `;
            container.appendChild(taskElement);
        });
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            
            this.saveData();
            this.renderTasks();
            this.renderDashboard();
            
            if (task.completed) {
                this.showToast('Task completed! Great job! 🎉', 'success');
                this.createConfetti();
            }
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveData();
        this.renderTasks();
        this.renderDashboard();
        this.showToast('Task deleted', 'success');
    }

    // Dashboard Updates
    renderDashboard() {
        // Update today's stats
        const today = new Date().toDateString();
        const todayTasks = this.tasks.filter(task => 
            task.completed && new Date(task.completedAt).toDateString() === today
        ).length;
        
        document.getElementById('todayPomodoros').textContent = this.timerState.pomodoroCount;
        document.getElementById('todayTasks').textContent = todayTasks;
        document.getElementById('currentStreak').textContent = this.calculateStreak();
        
        // Update tasks preview
        this.updateTasksPreview();
    }

    updateTasksPreview() {
        const preview = document.getElementById('tasksPreview');
        if (!preview) return;
        
        const todayTasks = this.tasks.filter(task => !task.completed && task.dueDate === 'today').slice(0, 3);
        
        if (todayTasks.length === 0) {
            preview.innerHTML = '<div class="empty-state">No tasks yet. Add some to get started!</div>';
            return;
        }
        
        preview.innerHTML = todayTasks.map(task => `
            <div class="task-preview-item">
                <span class="task-preview-text">${task.text}</span>
                <span class="task-preview-category">${task.category}</span>
            </div>
        `).join('');
    }

    calculateStreak() {
        // Calculate productivity streak (days with completed tasks or pomodoros)
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toDateString();
            
            const hasCompletedTasks = this.tasks.some(task => 
                task.completed && new Date(task.completedAt).toDateString() === dateString
            );
            
            const hasMoodEntry = this.moodData[this.getDateKey(date)];
            
            if (hasCompletedTasks || hasMoodEntry) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    // Utility Functions
    getDateKey(date) {
        return date.toISOString().split('T')[0];
    }

    getMoodEmoji(mood) {
        const emojis = {
            happy: '😊',
            calm: '😌',
            energized: '🔥',
            neutral: '😐',
            tired: '😴',
            sad: '😔',
            stressed: '😰'
        };
        return emojis[mood] || '😐';
    }

    // Animations and Effects
    showEntranceAnimation() {
        document.body.style.opacity = '0';
        document.body.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            document.body.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
            document.body.style.opacity = '1';
            document.body.style.transform = 'translateY(0)';
            
            setTimeout(() => {
                document.body.style.transition = '';
            }, 800);
        }, 100);
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = toast.querySelector('.toast-message');
        const toastIcon = toast.querySelector('.toast-icon');
        
        // Set message and icon based on type
        toastMessage.textContent = message;
        toastIcon.textContent = type === 'success' ? '✨' : type === 'error' ? '⚠️' : 'ℹ️';
        
        // Show toast
        toast.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    createConfetti() {
        const container = document.getElementById('confettiContainer');
        const colors = ['#B4A5F5', '#FFB5E8', '#A8E6CF', '#FFD93D', '#FF6B6B'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            
            container.appendChild(confetti);
            
            // Remove after animation
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 4000);
        }
    }
}

// Initialize FlowState when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Load saved theme
    const savedTheme = localStorage.getItem('flowstate_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('themeToggle').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    
    // Initialize FlowState
    window.flowState = new FlowState();
});

// Global function for section navigation (used by HTML onclick)
function showSection(sectionName) {
    if (window.flowState) {
        window.flowState.showSection(sectionName);
    }
}

// Extend FlowState class with additional methods
FlowState.prototype.addHabit = function() {
        const habitName = prompt('Enter habit name:');
        if (!habitName) return;
        
        const habit = {
            id: Date.now(),
            name: habitName,
            createdAt: new Date().toISOString(),
            completions: {}, // date -> boolean
            streak: 0
        };
        
        this.habits.push(habit);
        this.saveData();
        this.renderHabits();
        this.showToast(`Habit "${habitName}" added! 🎯`, 'success');
    };

FlowState.prototype.renderHabits = function() {
        const container = document.getElementById('habitsGrid');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.habits.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <h3>No habits yet!</h3>
                    <p>Start building positive habits today</p>
                    <button class="btn-primary" onclick="flowState.addHabit()">Add Your First Habit</button>
                </div>
            `;
            return;
        }
        
        this.habits.forEach(habit => {
            const habitCard = document.createElement('div');
            habitCard.className = 'card habit-card';
            
            const streak = this.calculateHabitStreak(habit);
            const todayKey = this.getDateKey(new Date());
            const isCompletedToday = habit.completions[todayKey] || false;
            
            habitCard.innerHTML = `
                <div class="habit-header">
                    <div class="habit-name">${habit.name}</div>
                    <div class="habit-streak">🔥 ${streak}</div>
                </div>
                <div class="habit-progress">
                    <div class="habit-progress-bar">
                        <div class="habit-progress-fill" style="width: ${this.getWeeklyProgress(habit)}%"></div>
                    </div>
                </div>
                <div class="habit-days">
                    ${this.renderHabitDays(habit)}
                </div>
                <div class="habit-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="btn-${isCompletedToday ? 'secondary' : 'primary'}" 
                            onclick="flowState.toggleHabitToday(${habit.id})">
                        ${isCompletedToday ? '✅ Done Today' : '⭕ Mark Complete'}
                    </button>
                    <button class="btn-secondary" onclick="flowState.deleteHabit(${habit.id})" 
                            style="background: #ff4757; color: white;">🗑️</button>
                </div>
            `;
            
            container.appendChild(habitCard);
        });
    };

FlowState.prototype.renderHabitDays = function(habit) {
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const today = new Date();
        let html = '';
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = this.getDateKey(date);
            const isCompleted = habit.completions[dateKey] || false;
            const isToday = i === 0;
            
            html += `
                <div class="habit-day ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''}"
                     onclick="flowState.toggleHabitDay(${habit.id}, '${dateKey}')">
                    ${days[date.getDay()]}
                </div>
            `;
        }
        
        return html;
    };

FlowState.prototype.calculateHabitStreak = function(habit) {
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = this.getDateKey(date);
            
            if (habit.completions[dateKey]) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    };

FlowState.prototype.getWeeklyProgress = function(habit) {
        const today = new Date();
        let completed = 0;
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = this.getDateKey(date);
            
            if (habit.completions[dateKey]) {
                completed++;
            }
        }
        
        return (completed / 7) * 100;
    };

FlowState.prototype.toggleHabitToday = function(habitId) {
        const todayKey = this.getDateKey(new Date());
        this.toggleHabitDay(habitId, todayKey);
    };

FlowState.prototype.toggleHabitDay = function(habitId, dateKey) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;
        
        habit.completions[dateKey] = !habit.completions[dateKey];
        
        if (habit.completions[dateKey]) {
            this.showToast(`Great job! Habit completed! 🎉`, 'success');
            this.createConfetti();
        }
        
        this.saveData();
        this.renderHabits();
        this.renderDashboard();
    };

FlowState.prototype.deleteHabit = function(habitId) {
        if (!confirm('Are you sure you want to delete this habit?')) return;
        
        this.habits = this.habits.filter(h => h.id !== habitId);
        this.saveData();
        this.renderHabits();
        this.showToast('Habit deleted', 'success');
    };

    // Analytics and Insights
FlowState.prototype.renderAnalytics = function() {
        this.renderProductivityChart();
        this.renderTimeBreakdown();
        this.renderAchievements();
    };

FlowState.prototype.renderProductivityChart = function() {
        const container = document.getElementById('productivityChart');
        if (!container) return;
        
        // Simple bar chart representation
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const today = new Date();
        let chartHTML = '<div style="display: flex; align-items: end; gap: 0.5rem; height: 150px; padding: 1rem;">';
        
        days.forEach((day, index) => {
            const date = new Date(today);
            date.setDate(date.getDate() - (6 - index));
            const dateKey = this.getDateKey(date);
            
            // Calculate productivity score for the day
            const completedTasks = this.tasks.filter(task => 
                task.completed && task.completedAt && 
                this.getDateKey(new Date(task.completedAt)) === dateKey
            ).length;
            
            const moodEntry = this.moodData[dateKey];
            const moodScore = moodEntry ? this.getMoodScore(moodEntry.mood) : 0;
            
            const totalScore = (completedTasks * 20) + moodScore;
            const height = Math.min((totalScore / 100) * 120, 120);
            
            chartHTML += `
                <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                    <div style="width: 100%; height: ${height}px; background: var(--gradient-1); 
                                border-radius: 4px; margin-bottom: 0.5rem; 
                                transform: translateZ(2px); transition: all 0.3s ease;"
                         onmouseover="this.style.transform='translateZ(8px) scale(1.05)'"
                         onmouseout="this.style.transform='translateZ(2px) scale(1)'"></div>
                    <span style="font-size: 0.8rem; color: var(--text-secondary);">${day}</span>
                </div>
            `;
        });
        
        chartHTML += '</div>';
        container.innerHTML = chartHTML;
    };

FlowState.prototype.getMoodScore = function(mood) {
        const scores = {
            happy: 40,
            calm: 35,
            energized: 40,
            neutral: 20,
            tired: 10,
            sad: 5,
            stressed: 0
        };
        return scores[mood] || 0;
    };

FlowState.prototype.renderTimeBreakdown = function() {
        const container = document.getElementById('timeBreakdown');
        if (!container) return;
        
        const categories = {
            work: { icon: '💼', time: 0, color: '#B4A5F5' },
            personal: { icon: '🏠', time: 0, color: '#FFB5E8' },
            health: { icon: '💪', time: 0, color: '#A8E6CF' },
            learning: { icon: '📚', time: 0, color: '#FFD93D' }
        };
        
        // Calculate time spent (simplified - based on completed tasks)
        const today = new Date().toDateString();
        this.tasks.forEach(task => {
            if (task.completed && new Date(task.completedAt).toDateString() === today) {
                categories[task.category].time += 25; // Assume 25 minutes per task
            }
        });
        
        // Add pomodoro time
        categories.work.time += this.timerState.pomodoroCount * 25;
        
        let html = '';
        Object.entries(categories).forEach(([category, data]) => {
            const hours = Math.floor(data.time / 60);
            const minutes = data.time % 60;
            const timeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
            
            html += `
                <div class="time-item">
                    <div class="time-category">
                        <span class="time-icon">${data.icon}</span>
                        <span>${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                    </div>
                    <div class="time-duration">${timeString}</div>
                </div>
            `;
        });
        
        container.innerHTML = html || '<div class="empty-state">No time tracked today</div>';
    };

FlowState.prototype.renderAchievements = function() {
        const container = document.getElementById('achievementsGrid');
        if (!container) return;
        
        const achievements = [
            {
                id: 'first_mood',
                name: 'First Mood',
                icon: '🎭',
                condition: () => Object.keys(this.moodData).length >= 1
            },
            {
                id: 'mood_streak_7',
                name: '7 Day Streak',
                icon: '🔥',
                condition: () => this.calculateMoodStreak() >= 7
            },
            {
                id: 'first_pomodoro',
                name: 'First Focus',
                icon: '🍅',
                condition: () => this.timerState.pomodoroCount >= 1
            },
            {
                id: 'pomodoro_master',
                name: 'Focus Master',
                icon: '🎯',
                condition: () => this.timerState.pomodoroCount >= 25
            },
            {
                id: 'task_completer',
                name: 'Task Master',
                icon: '✅',
                condition: () => this.tasks.filter(t => t.completed).length >= 10
            },
            {
                id: 'habit_builder',
                name: 'Habit Builder',
                icon: '🏗️',
                condition: () => this.habits.length >= 3
            }
        ];
        
        let html = '';
        achievements.forEach(achievement => {
            const isUnlocked = achievement.condition();
            html += `
                <div class="achievement-item ${isUnlocked ? 'unlocked' : ''}">
                    <span class="achievement-icon">${achievement.icon}</span>
                    <span class="achievement-name">${achievement.name}</span>
                </div>
            `;
        });
        
        container.innerHTML = html;
    };

FlowState.prototype.calculateMoodStreak = function() {
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = this.getDateKey(date);
            
            if (this.moodData[dateKey]) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    };

    // Enhanced initialization - Override the original init method
FlowState.prototype.initEnhanced = function() {
        this.loadData();
        this.setupEventListeners();
        this.updateDateTime();
        this.setupMouseTracking();
        this.setupKeyboardShortcuts();
        this.renderDashboard();
        this.renderMoodCalendar();
        this.updateMoodAnalytics();
        this.setupTimerGradient();
        this.renderHabits();
        this.renderAnalytics();
        
        // Setup habit tracking button
        const addHabitBtn = document.getElementById('addHabitBtn');
        if (addHabitBtn) {
            addHabitBtn.addEventListener('click', () => this.addHabit());
        }
        
        // Start real-time updates
        setInterval(() => this.updateDateTime(), 1000);
        
        // Show entrance animation
        this.showEntranceAnimation();
        
        // Update analytics when switching to analytics section
        const originalShowSection = this.showSection.bind(this);
        const self = this;
        this.showSection = function(sectionName) {
            originalShowSection(sectionName);
            if (sectionName === 'analytics') {
                setTimeout(() => self.renderAnalytics(), 200);
            }
            if (sectionName === 'habits') {
                setTimeout(() => self.renderHabits(), 200);
            }
        };
    };

// Call the enhanced initialization
FlowState.prototype.init = FlowState.prototype.initEnhanced;

// Additional utility functions for better UX
function createRippleEffect(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple effect to all buttons
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
        if (e.target.matches('button, .btn-primary, .btn-secondary')) {
            createRippleEffect(e.target, e);
        }
    });
});

// Enhanced keyboard navigation
document.addEventListener('keydown', (e) => {
    // ESC to close modals or inputs
    if (e.key === 'Escape') {
        const taskInput = document.getElementById('taskInputContainer');
        if (taskInput && taskInput.style.display !== 'none') {
            window.flowState.hideTaskInput();
        }
    }
    
    // Arrow keys for navigation
    if (e.altKey) {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                // Navigate to previous section
                break;
            case 'ArrowRight':
                e.preventDefault();
                // Navigate to next section
                break;
        }
    }
});// 
Test function to verify FlowState is working
function testFlowState() {
    console.log('FlowState class:', FlowState);
    console.log('FlowState prototype methods:', Object.getOwnPropertyNames(FlowState.prototype));
    return true;
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FlowState, testFlowState };
}