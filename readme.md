# 🌸 FlowState - Your Personal Productivity Sanctuary

A beautiful anime-inspired productivity dashboard and time tracker built with pure HTML, CSS, and JavaScript. FlowState combines elegant 3D animations, comprehensive mood tracking, and powerful productivity tools in a soothing, engaging interface.

![FlowState Preview](https://via.placeholder.com/800x400/B4A5F5/FFFFFF?text=FlowState+Dashboard)

## ✨ Features

### 🎭 Mood Tracking & Journal
- **Daily Mood Logging**: Track your emotional state with anime-style emoji faces
- **Comprehensive Journal**: Add detailed notes, tags, and context to your mood entries
- **Visual Calendar**: See your mood patterns with a color-coded calendar view
- **Analytics & Insights**: Discover your emotional patterns and best days
- **Streak Tracking**: Build consistency with mood journaling streaks
- **Data Export**: Export your mood journal as JSON for backup or analysis

### ⏰ Focus Timer (Pomodoro Technique)
- **3D Animated Timer**: Beautiful circular progress with smooth animations
- **Customizable Sessions**: Adjust focus time, short breaks, and long breaks
- **Visual Progress**: Track daily pomodoros with animated counters
- **Browser Notifications**: Get notified when sessions complete
- **Focus Mode**: Blur background elements during focus sessions

### 📝 Task Management
- **Drag & Drop Interface**: Organize tasks across Today, This Week, and Completed
- **Category System**: Organize tasks by Work, Personal, Health, and Learning
- **Quick Add**: Keyboard shortcuts for rapid task creation
- **Progress Tracking**: Visual feedback for completed tasks
- **Smart Organization**: Automatic task sorting and filtering

### 🔥 Habit Tracking
- **Streak Visualization**: See your habit streaks with flame animations
- **Weekly Progress**: Track habits across 7-day periods
- **Achievement System**: Unlock rewards for consistency
- **Visual Feedback**: 3D animations for habit completion

### 📊 Analytics Dashboard
- **Productivity Insights**: Weekly productivity charts and trends
- **Time Breakdown**: Visual representation of time spent by category
- **Achievement Gallery**: Unlock and display productivity milestones
- **Progress Summaries**: Daily, weekly, and monthly overviews

## 🎨 Design Features

### Anime-Inspired Aesthetics
- **Soft Pastel Colors**: Soothing purple, pink, and mint color palette
- **Rounded Elements**: Gentle curves throughout the interface
- **Cute Mascot**: Animated sparkle character for guidance
- **Glassmorphism**: Frosted glass effects with backdrop blur
- **Gradient Animations**: Slowly shifting color gradients

### 3D Animations & Effects
- **Floating Cards**: CSS 3D transforms with `translateZ()` and perspective
- **Mouse Tracking**: Cards tilt based on cursor position
- **Parallax Scrolling**: Multiple depth layers for immersion
- **Bounce Animations**: Satisfying cubic-bezier easing functions
- **Particle Effects**: Floating background elements
- **Morphing Blobs**: Animated background shapes

### Interactive Elements
- **Ripple Effects**: Button press animations
- **Success Celebrations**: Confetti animations for achievements
- **Smooth Transitions**: Page changes with fade/slide effects
- **Hover Feedback**: 3D tilt and glow effects
- **Loading States**: Elegant loading animations

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional dependencies required!

### Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/flowstate.git
   cd flowstate
   ```

2. **Open in browser**
   ```bash
   # Simply open index.html in your browser
   # Or use a local server:
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

3. **Start using FlowState!**
   - Begin by logging your current mood
   - Add some tasks for today
   - Start a focus session
   - Explore the beautiful animations

## 🎯 Usage Guide

### Mood Journal
1. **Daily Check-in**: Click on your current mood from the emoji selector
2. **Add Context**: Select relevant tags (work, family, health, etc.)
3. **Write Notes**: Add detailed thoughts about your day
4. **Save Entry**: Your mood is automatically timestamped and saved
5. **View History**: Check the calendar to see your mood patterns

### Focus Timer
1. **Set Duration**: Customize focus time (default: 25 minutes)
2. **Start Session**: Click the beautiful 3D timer to begin
3. **Stay Focused**: Watch the circular progress animation
4. **Take Breaks**: Automatic short/long break suggestions
5. **Track Progress**: See your daily pomodoro count grow

### Task Management
1. **Add Tasks**: Use the "+" button or Ctrl+N shortcut
2. **Categorize**: Choose from Work, Personal, Health, or Learning
3. **Complete Tasks**: Check off items to see satisfying animations
4. **Organize**: Tasks automatically sort into Today, Week, and Completed

### Keyboard Shortcuts
- `Ctrl/Cmd + N`: Add new task
- `Ctrl/Cmd + M`: Open mood journal
- `Ctrl/Cmd + T`: Open timer
- `Space`: Start/pause timer (when on timer page)

## 🎨 Customization

### Color Themes
FlowState includes both light and dark themes. Toggle between them using the moon/sun icon in the navigation.

### Personalization
- **Timer Settings**: Adjust focus and break durations
- **Categories**: Modify task categories in the code
- **Animations**: Reduce motion in accessibility settings
- **Data Export**: Backup your mood journal and tasks

## 🛠 Technical Details

### Architecture
- **Pure Vanilla JS**: No frameworks, just clean JavaScript
- **CSS Grid & Flexbox**: Responsive layout system
- **Local Storage**: All data persists in your browser
- **Progressive Enhancement**: Works without JavaScript for basic functionality

### 3D Animation Techniques
```css
/* 3D Transform Setup */
.card {
    transform-style: preserve-3d;
    perspective: 1000px;
    transform: translateZ(0);
}

/* Mouse Tracking Tilt */
.card:hover {
    transform: translateZ(20px) rotateX(5deg) rotateY(10deg);
}

/* Floating Animation */
@keyframes float {
    0%, 100% { transform: translateY(0) translateZ(0); }
    50% { transform: translateY(-10px) translateZ(10px); }
}
```

### Performance Optimizations
- **CSS Transforms**: Hardware-accelerated animations
- **Efficient Selectors**: Optimized CSS for smooth performance
- **Lazy Loading**: Components load as needed
- **Memory Management**: Proper cleanup of intervals and listeners

## 🌟 Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## 📱 Mobile Responsive

FlowState is fully responsive and works beautifully on:
- 📱 Mobile phones (320px+)
- 📱 Tablets (768px+)
- 💻 Laptops (1024px+)
- 🖥️ Desktop (1200px+)

## 🔒 Privacy & Data

- **Local Storage Only**: All data stays on your device
- **No Tracking**: No analytics or external requests
- **Offline Capable**: Works without internet connection
- **Export Options**: Download your data anytime

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style
- Add comments for complex animations
- Test on multiple browsers
- Ensure accessibility compliance
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Anime Community**: For inspiration on beautiful UI design
- **Pomodoro Technique**: Francesco Cirillo for the productivity method
- **CSS Animation Community**: For amazing 3D transform techniques
- **Open Source**: All the developers who make the web beautiful

## 📞 Support

Having issues? We're here to help!

- 🐛 **Bug Reports**: [Open an issue](https://github.com/yourusername/flowstate/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/yourusername/flowstate/discussions)
- 📧 **Email**: support@flowstate.app
- 💬 **Discord**: Join our community server

---

<div align="center">

**Made with 💜 for productivity enthusiasts**

[⭐ Star this repo](https://github.com/yourusername/flowstate) • [🐛 Report Bug](https://github.com/yourusername/flowstate/issues) • [💡 Request Feature](https://github.com/yourusername/flowstate/issues)

</div>