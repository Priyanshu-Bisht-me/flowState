// FlowState - Personal Productivity Dashboard
// Main JavaScript Application

class FlowStateApp {
    constructor() {
        // Application state
        this.currentSection = 'dashboard';
        this.currentTheme = 'light';
        
        // Timer state
        this.timerState = {
            isRunning: false,
            timeLeft: 25 * 60, // 25 minutes in seconds
            currentSession: 'focus', // focus, shortBreak, longBreak
            pomodoroCount: 0,
            focusTime: 25,
            shortBreak: 5,
            longBreak: 15,
            timerInterval: null
        };
        
        // Data storage
        this.userData = {
            tasks: [],
            habits: [],
            moodEntries: {},
            achievements: [],
            settings: {}
        };
        
        // Current mood entry
        this.currentMoodEntry = {
            mood: null,
            tags: [],
            notes: '',
            timestamp: null
        };
        
        // Calendar state
        this.calendarDate = new Date();
        
        // Initialize application
        this.initializeApp();
    }

    // Application Initialization
    initializeApp() {
        this.loadUserData();
        this.setupEventListeners();
        this.updateDateTime();
        this.setupMouseTracking();
        this.setupKeyboardShortcuts();
        this.renderDashboard();
        this.renderMoodCalendar();
        this.updateMoodAnalytics();
        this.renderHabits();
        this.renderTasks();
        this.updateTimerDisplay();
        
        // Start real-time updates
        setInterval(() => this.updateDateTime(), 1000);
        
        // Show entrance animation
        this.showEntranceAnimation();
        
        console.log('FlowState initialized successfully! ✨');
    }

    // Data Management
    loadUserData() {
        try {
            const savedTasks = localStorage.getItem('flowstate_tasks');
            const savedHabits = localStorage.getItem('flowstate_habits');
            const savedMoodEntries = localStorage.getItem('flowstate_mood_entries');
            const savedTimerState = localStorage.getItem('flowstate_timer_state');
            const savedTheme = localStorage.getItem('flowstate_theme');
            
            if (savedTasks) this.userData.tasks = JSON.parse(savedTasks);
            if (savedHabits) this.userData.habits = JSON.parse(savedHabits);
            if (savedMoodEntries) this.userData.moodEntries = JSON.parse(savedMoodEntries);
            if (savedTimerState) {
                const timerData = JSON.parse(savedTimerState);
                this.timerState = { ...this.timerState, ...timerData };
            }
            if (savedTheme) {
                this.currentTheme = savedTheme;
                document.documentElement.setAttribute('data-theme', savedTheme);
                document.getElementById('themeToggleButton').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showToast('Error loading saved data', 'error');
        }
    }

    saveUserData() {
        try {
            localStorage.setItem('flowstate_tasks', JSON.stringify(this.userData.tasks));
            localStorage.setItem('flowstate_habits', JSON.stringify(this.userData.habits));
            localStorage.setItem('flowstate_mood_entries', JSON.stringify(this.userData.moodEntries));
            localStorage.setItem('flowstate_timer_state', JSON.stringify(this.timerState));
            localStorage.setItem('flowstate_theme', this.currentTheme);
        } catch (error) {
            console.error('Error saving user data:', error);
            this.showToast('Error saving data', 'error');
        }
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Theme toggle
        document.getElementById('themeToggleButton').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Quick mood selector
        document.querySelectorAll('.mood-quick-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.quickMoodSelect(e.target.dataset.mood);
            });
        });

        // Mood journal
        this.setupMoodJournalListeners();
        
        // Timer
        this.setupTimerListeners();
        
        // Tasks
        this.setupTaskListeners();
        
        // Habits
        this.setupHabitListeners();
    }

    setupMoodJournalListeners() {
        // Mood selection
        document.querySelectorAll('.mood-option-button').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.mood-option-button').forEach(b => b.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this.currentMoodEntry.mood = e.currentTarget.dataset.mood;
                
                // Add success animation
                e.currentTarget.classList.add('success');
                setTimeout(() => e.currentTarget.classList.remove('success'), 600);
            });
        });

        // Tag selection
        document.querySelectorAll('.mood-tag-button').forEach(button => {
            button.addEventListener('click', (e) => {
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
        document.getElementById('saveMoodEntryButton').addEventListener('click', () => {
            this.saveMoodEntry();
        });

        // Mood notes
        document.getElementById('moodJournalTextarea').addEventListener('input', (e) => {
            this.currentMoodEntry.notes = e.target.value;
        });

        // Calendar navigation
        document.getElementById('previousMonthButton').addEventListener('click', () => {
            this.calendarDate.setMonth(this.calendarDate.getMonth() - 1);
            this.renderMoodCalendar();
        });
        
        document.getElementById('nextMonthButton').addEventListener('click', () => {
            this.calendarDate.setMonth(this.calendarDate.getMonth() + 1);
            this.renderMoodCalendar();
        });

        // Export mood data
        document.getElementById('exportMoodDataButton').addEventListener('click', () => {
            this.exportMoodData();
        });
    }

    setupTimerListeners() {
        document.getElementById('startPauseTimerButton').addEventListener('click', () => {
            this.toggleTimer();
        });

        document.getElementById('resetTimerButton').addEventListener('click', () => {
            this.resetTimer();
        });

        document.getElementById('skipTimerButton').addEventListener('click', () => {
            this.skipTimer();
        });

        document.getElementById('quickPomodoroStartButton').addEventListener('click', () => {
            this.toggleTimer();
        });

        // Timer settings
        ['focusTimeInput', 'shortBreakInput', 'longBreakInput'].forEach(id => {
            document.getElementById(id).addEventListener('change', (e) => {
                const setting = id.replace('Input', '').replace('Time', 'Time');
                this.timerState[setting] = parseInt(e.target.value);
                if (setting === 'focusTime' && this.timerState.currentSession === 'focus') {
                    this.timerState.timeLeft = this.timerState.focusTime * 60;
                    this.updateTimerDisplay();
                }
                this.saveUserData();
            });
        });
    }

    setupTaskListeners() {
        document.getElementById('addNewTaskButton').addEventListener('click', () => {
            this.showTaskInput();
        });

        document.getElementById('saveNewTaskButton').addEventListener('click', () => {
            this.saveNewTask();
        });

        document.getElementById('cancelNewTaskButton').addEventListener('click', () => {
            this.hideTaskInput();
        });

        document.getElementById('newTaskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveNewTask();
            }
        });
    }

    setupHabitListeners() {
        document.getElementById('addNewHabitButton').addEventListener('click', () => {
            this.showHabitModal();
        });

        document.getElementById('saveNewHabitButton').addEventListener('click', () => {
            this.saveNewHabit();
        });

        document.getElementById('cancelNewHabitButton').addEventListener('click', () => {
            this.hideHabitModal();
        });

        document.getElementById('newHabitNameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveNewHabit();
            }
        });

        // Modal overlay click to close
        document.getElementById('habitModalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideHabitModal();
            }
        });
    }    //
 Mouse Tracking for 3D Effects
    setupMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            const cards = document.querySelectorAll('.dashboard-card, .mood-card, .analytics-card');
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = (y - centerY) / 10;
                    const rotateY = (centerX - x) / 10;
                    
                    card.style.transform = `translateZ(20px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                    card.classList.add('tilt');
                } else {
                    card.style.transform = '';
                    card.classList.remove('tilt');
                }
            });
        });
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
                        this.navigateToSection('mood-journal');
                        break;
                    case 't':
                        e.preventDefault();
                        this.navigateToSection('pomodoro-timer');
                        break;
                }
            } else if (e.key === ' ' && this.currentSection === 'pomodoro-timer') {
                e.preventDefault();
                this.toggleTimer();
            }
        });
    }

    // Navigation
    navigateToSection(sectionName) {
        // Hide current section
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Update navigation
        document.querySelectorAll('.nav-button').forEach(btn => {
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
                if (sectionName === 'mood-journal') {
                    this.initMoodSection();
                } else if (sectionName === 'pomodoro-timer') {
                    this.updateTimerDisplay();
                } else if (sectionName === 'task-manager') {
                    this.renderTasks();
                } else if (sectionName === 'habit-tracker') {
                    this.renderHabits();
                } else if (sectionName === 'analytics-dashboard') {
                    this.renderAnalytics();
                }
            }, 100);
        }
    }

    // Theme Management
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        document.getElementById('themeToggleButton').textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
        
        this.saveUserData();
        
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

        const timeElement = document.getElementById('currentTimeDisplay');
        const dateElement = document.getElementById('currentDateDisplay');
        
        if (timeElement) timeElement.textContent = now.toLocaleTimeString('en-US', timeOptions);
        if (dateElement) dateElement.textContent = now.toLocaleDateString('en-US', dateOptions);
    }

    // Mood Journal Functionality
    initMoodSection() {
        this.loadTodaysMood();
        this.updateMoodStreak();
    }

    loadTodaysMood() {
        const today = this.getDateKey(new Date());
        const todaysMood = this.userData.moodEntries[today];
        
        if (todaysMood) {
            // Load existing mood data
            this.currentMoodEntry = { ...todaysMood };
            
            // Update UI
            document.querySelectorAll('.mood-option-button').forEach(btn => {
                btn.classList.remove('selected');
                if (btn.dataset.mood === todaysMood.mood) {
                    btn.classList.add('selected');
                }
            });
            
            document.querySelectorAll('.mood-tag-button').forEach(btn => {
                btn.classList.remove('selected');
                if (todaysMood.tags.includes(btn.dataset.tag)) {
                    btn.classList.add('selected');
                }
            });
            
            const textarea = document.getElementById('moodJournalTextarea');
            if (textarea) textarea.value = todaysMood.notes || '';
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
        const textarea = document.getElementById('moodJournalTextarea');
        if (textarea) this.currentMoodEntry.notes = textarea.value;
        
        this.userData.moodEntries[today] = { ...this.currentMoodEntry };
        this.saveUserData();
        
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
        
        this.userData.moodEntries[today] = quickEntry;
        this.saveUserData();
        
        // Update UI
        document.querySelectorAll('.mood-quick-button').forEach(btn => {
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
            
            if (this.userData.moodEntries[dateKey]) {
                streak++;
            } else {
                break;
            }
        }
        
        const streakElement = document.getElementById('moodStreakCounter');
        if (streakElement) streakElement.textContent = streak;
        
        const dashboardStreakElement = document.getElementById('moodJournalStreak');
        if (dashboardStreakElement) dashboardStreakElement.textContent = streak;
    }

    renderMoodCalendar() {
        const calendar = document.getElementById('moodCalendarGrid');
        const title = document.getElementById('calendarMonthYear');
        
        if (!calendar || !title) return;
        
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
            header.className = 'calendar-day-header';
            calendar.appendChild(header);
        });
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day-empty';
            calendar.appendChild(emptyDay);
        }
        
        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            const date = new Date(year, month, day);
            const dateKey = this.getDateKey(date);
            const moodEntry = this.userData.moodEntries[dateKey];
            
            if (moodEntry) {
                dayElement.classList.add('has-mood', `mood-${moodEntry.mood}`);
                dayElement.title = `${this.getMoodEmoji(moodEntry.mood)} ${moodEntry.mood}`;
            }
            
            // Highlight today
            const today = new Date();
            if (date.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }
            
            calendar.appendChild(dayElement);
        }
    }

    updateMoodAnalytics() {
        const moods = Object.values(this.userData.moodEntries);
        
        if (moods.length === 0) {
            document.getElementById('mostCommonMood').textContent = '-';
            document.getElementById('bestDayOfWeek').textContent = '-';
            document.getElementById('monthlyMoodEntries').textContent = '0';
            document.getElementById('averageWeeklyMood').textContent = '-';
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
        
        document.getElementById('mostCommonMood').textContent = 
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
        
        document.getElementById('bestDayOfWeek').textContent = bestDay;
        
        // Monthly entries
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyEntries = moods.filter(entry => {
            const date = new Date(entry.timestamp);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).length;
        
        document.getElementById('monthlyMoodEntries').textContent = monthlyEntries;
    }

    exportMoodData() {
        const dataStr = JSON.stringify(this.userData.moodEntries, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `flowstate-mood-journal-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Mood journal exported! 📄', 'success');
    }    //
 Timer Functionality
    toggleTimer() {
        if (this.timerState.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        this.timerState.isRunning = true;
        document.getElementById('startPauseTimerButton').textContent = 'Pause';
        document.getElementById('quickPomodoroStartButton').textContent = 'Pause';
        
        this.timerState.timerInterval = setInterval(() => {
            this.timerState.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timerState.timeLeft <= 0) {
                this.completeTimer();
            }
        }, 1000);
        
        this.saveUserData();
        this.showToast('Timer started! Focus time 🎯', 'success');
    }

    pauseTimer() {
        this.timerState.isRunning = false;
        clearInterval(this.timerState.timerInterval);
        document.getElementById('startPauseTimerButton').textContent = 'Start';
        document.getElementById('quickPomodoroStartButton').textContent = 'Start Focus';
        this.saveUserData();
    }

    resetTimer() {
        this.pauseTimer();
        this.timerState.timeLeft = this.timerState.focusTime * 60;
        this.updateTimerDisplay();
        this.saveUserData();
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
        this.saveUserData();
        
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
        
        const mainTimerDisplay = document.getElementById('mainTimerDisplay');
        const quickTimerText = document.getElementById('quickTimerText');
        
        if (mainTimerDisplay) mainTimerDisplay.textContent = timeString;
        if (quickTimerText) quickTimerText.textContent = timeString;
        
        // Update timer label
        const labels = {
            focus: 'Focus Time',
            shortBreak: 'Short Break',
            longBreak: 'Long Break'
        };
        const timerLabel = document.getElementById('timerSessionLabel');
        if (timerLabel) timerLabel.textContent = labels[this.timerState.currentSession];
        
        // Update progress circle
        const totalTime = this.getTotalTimeForSession();
        const progress = (totalTime - this.timerState.timeLeft) / totalTime;
        const circumference = 2 * Math.PI * 90; // radius = 90
        const offset = circumference - (progress * circumference);
        
        const progressCircle = document.getElementById('timerProgressCircle');
        if (progressCircle) {
            progressCircle.style.strokeDasharray = circumference;
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
        const container = document.getElementById('pomodoroDotsContainer');
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
        
        // Update dashboard
        const dashboardCount = document.getElementById('todayPomodoroCount');
        if (dashboardCount) dashboardCount.textContent = this.timerState.pomodoroCount;
    }

    // Task Management
    showTaskInput() {
        const taskForm = document.getElementById('taskInputForm');
        if (taskForm) {
            taskForm.style.display = 'block';
            document.getElementById('newTaskInput').focus();
        }
    }

    hideTaskInput() {
        const taskForm = document.getElementById('taskInputForm');
        if (taskForm) {
            taskForm.style.display = 'none';
            document.getElementById('newTaskInput').value = '';
        }
    }

    saveNewTask() {
        const taskInput = document.getElementById('newTaskInput');
        const categorySelect = document.getElementById('taskCategorySelect');
        const prioritySelect = document.getElementById('taskPrioritySelect');
        
        if (!taskInput || !taskInput.value.trim()) {
            this.showToast('Please enter a task description', 'error');
            return;
        }
        
        const newTask = {
            id: Date.now(),
            text: taskInput.value.trim(),
            category: categorySelect.value,
            priority: prioritySelect.value,
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: 'today' // Default to today
        };
        
        this.userData.tasks.push(newTask);
        this.saveUserData();
        this.hideTaskInput();
        this.renderTasks();
        this.renderDashboard();
        
        this.showToast('Task added! 📝', 'success');
    }

    renderTasks() {
        const todayContainer = document.getElementById('todayTasksList');
        const weekContainer = document.getElementById('weekTasksList');
        const completedContainer = document.getElementById('completedTasksList');
        
        if (!todayContainer) return;
        
        // Clear containers
        [todayContainer, weekContainer, completedContainer].forEach(container => {
            if (container) container.innerHTML = '';
        });
        
        // Sort tasks
        const todayTasks = this.userData.tasks.filter(task => !task.completed && task.dueDate === 'today');
        const weekTasks = this.userData.tasks.filter(task => !task.completed && task.dueDate === 'week');
        const completedTasks = this.userData.tasks.filter(task => task.completed);
        
        // Render task lists
        this.renderTaskList(todayTasks, todayContainer);
        this.renderTaskList(weekTasks, weekContainer);
        this.renderTaskList(completedTasks, completedContainer);
        
        // Update dashboard preview
        this.updateTasksPreview();
    }

    renderTaskList(tasks, container) {
        if (!container) return;
        
        if (tasks.length === 0) {
            container.innerHTML = '<div class="empty-state-message">No tasks here yet</div>';
            return;
        }
        
        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item';
            taskElement.innerHTML = `
                <div class="task-content">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} 
                           onchange="flowStateApp.toggleTask(${task.id})">
                    <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                    <span class="task-category ${task.category}">${this.getCategoryIcon(task.category)} ${task.category}</span>
                    <span class="task-priority ${task.priority}">${this.getPriorityIcon(task.priority)}</span>
                </div>
                <button class="task-delete-button" onclick="flowStateApp.deleteTask(${task.id})">🗑️</button>
            `;
            container.appendChild(taskElement);
        });
    }

    toggleTask(taskId) {
        const task = this.userData.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            
            this.saveUserData();
            this.renderTasks();
            this.renderDashboard();
            
            if (task.completed) {
                this.showToast('Task completed! Great job! 🎉', 'success');
                this.createConfetti();
            }
        }
    }

    deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;
        
        this.userData.tasks = this.userData.tasks.filter(t => t.id !== taskId);
        this.saveUserData();
        this.renderTasks();
        this.renderDashboard();
        this.showToast('Task deleted', 'success');
    }

    updateTasksPreview() {
        const preview = document.getElementById('todayTasksPreview');
        if (!preview) return;
        
        const todayTasks = this.userData.tasks.filter(task => !task.completed && task.dueDate === 'today').slice(0, 3);
        
        if (todayTasks.length === 0) {
            preview.innerHTML = '<div class="empty-state-message">No tasks for today. Add some to get started!</div>';
            return;
        }
        
        preview.innerHTML = todayTasks.map(task => `
            <div class="task-preview-item">
                <span class="task-preview-text">${task.text}</span>
                <span class="task-preview-category ${task.category}">${this.getCategoryIcon(task.category)}</span>
            </div>
        `).join('');
    }

    getCategoryIcon(category) {
        const icons = {
            work: '💼',
            personal: '🏠',
            health: '💪',
            learning: '📚',
            creative: '🎨'
        };
        return icons[category] || '📝';
    }

    getPriorityIcon(priority) {
        const icons = {
            low: '🟢',
            medium: '🟡',
            high: '🔴'
        };
        return icons[priority] || '🟡';
    } 
   // Habit Management
    showHabitModal() {
        const modal = document.getElementById('habitModalOverlay');
        if (modal) {
            modal.style.display = 'flex';
            document.getElementById('newHabitNameInput').focus();
        }
    }

    hideHabitModal() {
        const modal = document.getElementById('habitModalOverlay');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('newHabitNameInput').value = '';
        }
    }

    saveNewHabit() {
        const habitInput = document.getElementById('newHabitNameInput');
        
        if (!habitInput || !habitInput.value.trim()) {
            this.showToast('Please enter a habit name', 'error');
            return;
        }
        
        const newHabit = {
            id: Date.now(),
            name: habitInput.value.trim(),
            createdAt: new Date().toISOString(),
            completions: {}, // date -> boolean
            streak: 0
        };
        
        this.userData.habits.push(newHabit);
        this.saveUserData();
        this.hideHabitModal();
        this.renderHabits();
        
        this.showToast(`Habit "${newHabit.name}" added! 🎯`, 'success');
    }

    renderHabits() {
        const container = document.getElementById('habitsGridContainer');
        if (!container) return;
        
        if (this.userData.habits.length === 0) {
            container.innerHTML = `
                <div class="empty-state-message">
                    <h3>No habits yet!</h3>
                    <p>Start building positive habits today</p>
                    <button class="primary-button" onclick="flowStateApp.showHabitModal()">Add Your First Habit</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '<div class="habits-grid"></div>';
        const habitsGrid = container.querySelector('.habits-grid');
        
        this.userData.habits.forEach(habit => {
            const habitCard = document.createElement('div');
            habitCard.className = 'habit-card';
            
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
                <div class="habit-actions">
                    <button class="primary-button ${isCompletedToday ? 'completed' : ''}" 
                            onclick="flowStateApp.toggleHabitToday(${habit.id})">
                        ${isCompletedToday ? '✅ Done Today' : '⭕ Mark Complete'}
                    </button>
                    <button class="secondary-button delete-habit" onclick="flowStateApp.deleteHabit(${habit.id})">
                        🗑️
                    </button>
                </div>
            `;
            
            habitsGrid.appendChild(habitCard);
        });
        
        // Update habits preview
        this.updateHabitsPreview();
    }

    renderHabitDays(habit) {
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
                     onclick="flowStateApp.toggleHabitDay(${habit.id}, '${dateKey}')">
                    ${days[date.getDay()]}
                </div>
            `;
        }
        
        return html;
    }

    calculateHabitStreak(habit) {
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
    }

    getWeeklyProgress(habit) {
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
    }

    toggleHabitToday(habitId) {
        const todayKey = this.getDateKey(new Date());
        this.toggleHabitDay(habitId, todayKey);
    }

    toggleHabitDay(habitId, dateKey) {
        const habit = this.userData.habits.find(h => h.id === habitId);
        if (!habit) return;
        
        habit.completions[dateKey] = !habit.completions[dateKey];
        
        if (habit.completions[dateKey]) {
            this.showToast(`Great job! Habit completed! 🎉`, 'success');
            this.createConfetti();
        }
        
        this.saveUserData();
        this.renderHabits();
        this.renderDashboard();
    }

    deleteHabit(habitId) {
        if (!confirm('Are you sure you want to delete this habit?')) return;
        
        this.userData.habits = this.userData.habits.filter(h => h.id !== habitId);
        this.saveUserData();
        this.renderHabits();
        this.showToast('Habit deleted', 'success');
    }

    updateHabitsPreview() {
        const preview = document.getElementById('todayHabitsPreview');
        if (!preview) return;
        
        if (this.userData.habits.length === 0) {
            preview.innerHTML = '<div class="empty-state-message">No habits tracked yet. Start building good habits!</div>';
            return;
        }
        
        const todayKey = this.getDateKey(new Date());
        const habitsPreview = this.userData.habits.slice(0, 3).map(habit => {
            const isCompleted = habit.completions[todayKey] || false;
            return `
                <div class="habit-preview-item ${isCompleted ? 'completed' : ''}">
                    <span class="habit-preview-name">${habit.name}</span>
                    <span class="habit-preview-status">${isCompleted ? '✅' : '⭕'}</span>
                </div>
            `;
        }).join('');
        
        preview.innerHTML = habitsPreview;
    }

    // Dashboard Updates
    renderDashboard() {
        // Update today's stats
        const today = new Date().toDateString();
        const todayTasks = this.userData.tasks.filter(task => 
            task.completed && task.completedAt && new Date(task.completedAt).toDateString() === today
        ).length;
        
        const pomodoroElement = document.getElementById('todayPomodoroCount');
        const tasksElement = document.getElementById('todayTasksCompleted');
        const streakElement = document.getElementById('currentProductivityStreak');
        
        if (pomodoroElement) pomodoroElement.textContent = this.timerState.pomodoroCount;
        if (tasksElement) tasksElement.textContent = todayTasks;
        if (streakElement) streakElement.textContent = this.calculateProductivityStreak();
        
        // Update previews
        this.updateTasksPreview();
        this.updateHabitsPreview();
        this.updateMoodStreak();
        this.updatePomodoroCounter();
    }

    calculateProductivityStreak() {
        // Calculate productivity streak (days with completed tasks or pomodoros or mood entries)
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toDateString();
            const dateKey = this.getDateKey(date);
            
            const hasCompletedTasks = this.userData.tasks.some(task => 
                task.completed && task.completedAt && 
                new Date(task.completedAt).toDateString() === dateString
            );
            
            const hasMoodEntry = this.userData.moodEntries[dateKey];
            const hasHabitCompletion = this.userData.habits.some(habit => habit.completions[dateKey]);
            
            if (hasCompletedTasks || hasMoodEntry || hasHabitCompletion) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    // Analytics
    renderAnalytics() {
        this.renderProductivityChart();
        this.renderTimeBreakdown();
        this.renderAchievements();
        this.renderMoodTrends();
        this.renderHabitProgress();
        this.renderFocusSessionsStats();
    }

    renderProductivityChart() {
        const container = document.getElementById('productivityChartContainer');
        if (!container) return;
        
        // Simple bar chart representation
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const today = new Date();
        let chartHTML = '<div class="productivity-chart">';
        
        days.forEach((day, index) => {
            const date = new Date(today);
            date.setDate(date.getDate() - (6 - index));
            const dateKey = this.getDateKey(date);
            
            // Calculate productivity score for the day
            const completedTasks = this.userData.tasks.filter(task => 
                task.completed && task.completedAt && 
                this.getDateKey(new Date(task.completedAt)) === dateKey
            ).length;
            
            const moodEntry = this.userData.moodEntries[dateKey];
            const moodScore = moodEntry ? this.getMoodScore(moodEntry.mood) : 0;
            
            const habitCompletions = this.userData.habits.filter(habit => habit.completions[dateKey]).length;
            
            const totalScore = (completedTasks * 20) + moodScore + (habitCompletions * 10);
            const height = Math.min((totalScore / 100) * 120, 120);
            
            chartHTML += `
                <div class="chart-bar">
                    <div class="bar-fill" style="height: ${height}px;" title="${day}: ${totalScore} points"></div>
                    <div class="bar-label">${day}</div>
                </div>
            `;
        });
        
        chartHTML += '</div>';
        container.innerHTML = chartHTML;
    }

    getMoodScore(mood) {
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
    }

    renderTimeBreakdown() {
        const container = document.getElementById('timeBreakdownList');
        if (!container) return;
        
        const categories = {
            work: { icon: '💼', time: 0, color: '#B4A5F5' },
            personal: { icon: '🏠', time: 0, color: '#FFB5E8' },
            health: { icon: '💪', time: 0, color: '#A8E6CF' },
            learning: { icon: '📚', time: 0, color: '#FFD93D' },
            creative: { icon: '🎨', time: 0, color: '#FF6B6B' }
        };
        
        // Calculate time spent (simplified - based on completed tasks)
        const today = new Date().toDateString();
        this.userData.tasks.forEach(task => {
            if (task.completed && task.completedAt && new Date(task.completedAt).toDateString() === today) {
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
                <div class="time-breakdown-item">
                    <div class="time-category">
                        <span class="time-icon">${data.icon}</span>
                        <span class="time-name">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                    </div>
                    <div class="time-duration">${timeString}</div>
                </div>
            `;
        });
        
        container.innerHTML = html || '<div class="empty-state-message">No time tracked today</div>';
    }

    renderAchievements() {
        const container = document.getElementById('achievementsGrid');
        if (!container) return;
        
        const achievements = [
            {
                id: 'first_mood',
                name: 'First Mood',
                icon: '🎭',
                description: 'Log your first mood',
                condition: () => Object.keys(this.userData.moodEntries).length >= 1
            },
            {
                id: 'mood_streak_7',
                name: '7 Day Streak',
                icon: '🔥',
                description: '7 consecutive days of mood logging',
                condition: () => this.calculateMoodStreak() >= 7
            },
            {
                id: 'first_pomodoro',
                name: 'First Focus',
                icon: '🍅',
                description: 'Complete your first pomodoro',
                condition: () => this.timerState.pomodoroCount >= 1
            },
            {
                id: 'pomodoro_master',
                name: 'Focus Master',
                icon: '🎯',
                description: 'Complete 25 pomodoros',
                condition: () => this.timerState.pomodoroCount >= 25
            },
            {
                id: 'task_completer',
                name: 'Task Master',
                icon: '✅',
                description: 'Complete 10 tasks',
                condition: () => this.userData.tasks.filter(t => t.completed).length >= 10
            },
            {
                id: 'habit_builder',
                name: 'Habit Builder',
                icon: '🏗️',
                description: 'Create 3 habits',
                condition: () => this.userData.habits.length >= 3
            }
        ];
        
        let html = '';
        achievements.forEach(achievement => {
            const isUnlocked = achievement.condition();
            html += `
                <div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    calculateMoodStreak() {
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = this.getDateKey(date);
            
            if (this.userData.moodEntries[dateKey]) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    renderMoodTrends() {
        const container = document.getElementById('moodTrendsChart');
        if (!container) return;
        
        container.innerHTML = '<div class="mood-trends-placeholder">Mood trends visualization coming soon!</div>';
    }

    renderHabitProgress() {
        const container = document.getElementById('habitProgressOverview');
        if (!container) return;
        
        if (this.userData.habits.length === 0) {
            container.innerHTML = '<div class="empty-state-message">No habits to track yet</div>';
            return;
        }
        
        let html = '';
        this.userData.habits.forEach(habit => {
            const streak = this.calculateHabitStreak(habit);
            const progress = this.getWeeklyProgress(habit);
            
            html += `
                <div class="habit-progress-item">
                    <div class="habit-progress-name">${habit.name}</div>
                    <div class="habit-progress-stats">
                        <span class="habit-streak">🔥 ${streak}</span>
                        <span class="habit-weekly">${Math.round(progress)}% this week</span>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    renderFocusSessionsStats() {
        const container = document.getElementById('focusSessionsStats');
        if (!container) return;
        
        const totalMinutes = this.timerState.pomodoroCount * 25;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        container.innerHTML = `
            <div class="focus-stats-grid">
                <div class="focus-stat-item">
                    <div class="focus-stat-number">${this.timerState.pomodoroCount}</div>
                    <div class="focus-stat-label">Sessions Today</div>
                </div>
                <div class="focus-stat-item">
                    <div class="focus-stat-number">${hours}h ${minutes}m</div>
                    <div class="focus-stat-label">Total Focus Time</div>
                </div>
            </div>
        `;
    }    // Ut
ility Functions
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
        const toast = document.getElementById('toastNotification');
        const toastMessage = document.getElementById('toastMessage');
        const toastIcon = document.getElementById('toastIcon');
        
        if (!toast || !toastMessage || !toastIcon) return;
        
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
        if (!container) return;
        
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

// Global Functions for HTML onclick handlers
function navigateToSection(sectionName) {
    if (window.flowStateApp) {
        window.flowStateApp.navigateToSection(sectionName);
    }
}

// Initialize FlowState when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Initialize FlowState Application
    window.flowStateApp = new FlowStateApp();
    
    console.log('FlowState Application Ready! 🌸');
});

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
    ripple.classList.add('ripple-effect');
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple effect to all buttons
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
        if (e.target.matches('button, .primary-button, .secondary-button, .timer-button')) {
            createRippleEffect(e.target, e);
        }
    });
});

// Enhanced keyboard navigation
document.addEventListener('keydown', (e) => {
    // ESC to close modals or inputs
    if (e.key === 'Escape') {
        const taskInput = document.getElementById('taskInputForm');
        const habitModal = document.getElementById('habitModalOverlay');
        
        if (taskInput && taskInput.style.display !== 'none') {
            window.flowStateApp.hideTaskInput();
        }
        
        if (habitModal && habitModal.style.display === 'flex') {
            window.flowStateApp.hideHabitModal();
        }
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FlowStateApp };
}