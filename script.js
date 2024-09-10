// DOM Elements
const elements = {
    monthSelect: document.getElementById('monthSelect'),
    yearSelect: document.getElementById('yearSelect'),
    calendarDays: document.getElementById('calendarDays'),
    eventModal: document.getElementById('eventModal'),
    closeModalBtn: document.querySelector('.close-btn'),
    saveEventBtn: document.getElementById('saveEvent'),
    eventTitleInput: document.getElementById('eventTitle'),
    todayButton: document.getElementById('todayButton'),
    searchInput: document.getElementById('searchInput'),
    prevMonthBtn: document.getElementById('prevMonth'),
    nextMonthBtn: document.getElementById('nextMonth'),
    prevEventBtn: document.getElementById('prevEvent'),
    nextEventBtn: document.getElementById('nextEvent'),
};

// State variables
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let events = {}; // Events stored with dates as keys
let highlightedDates = []; // Dates matching search query
let foundDates = []; // Dates for found events in search
let currentFoundIndex = 0; // Index for navigating found dates

// Load events from local storage
function loadEvents() {
    const storedEvents = localStorage.getItem('events');
    events = storedEvents ? JSON.parse(storedEvents) : {};
}

// Save events to local storage
function saveEvents() {
    localStorage.setItem('events', JSON.stringify(events));
}

// Generate calendar
function generateCalendar(month, year) {
    elements.calendarDays.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Add empty cells for days before the start of the month
    Array.from({ length: firstDay }).forEach(() => {
        elements.calendarDays.appendChild(document.createElement('div'));
    });

    // Create cells for each day of the month
    Array.from({ length: daysInMonth }, (_, day) => day + 1).forEach(day => {
        const dayCell = document.createElement('div');
        const eventDate = `${year}-${month + 1}-${day}`;
        dayCell.textContent = day;
        dayCell.setAttribute('data-date', eventDate);

        // Add event badges if there are events for this day
        (events[eventDate] || []).forEach(event => {
            const eventBadge = document.createElement('span');
            eventBadge.className = 'event-badge';
            eventBadge.textContent = event;
            dayCell.appendChild(eventBadge);
        });

        // Highlight the current day
        if (isCurrentDate(day, month, year)) {
            dayCell.classList.add('current-day');
        }

        // Highlight dates that match the search query
        if (highlightedDates.includes(eventDate)) {
            dayCell.classList.add('highlighted-date');
        }

        // Add click event to open event modal
        dayCell.addEventListener('click', () => openEventModal(eventDate));
        elements.calendarDays.appendChild(dayCell);
    });
}

// Check if the date is the current date
function isCurrentDate(day, month, year) {
    return day === currentDate.getDate() &&
        month === currentDate.getMonth() &&
        year === currentDate.getFullYear();
}

// Open event modal
function openEventModal(date) {
    elements.eventModal.style.display = 'flex';
    elements.saveEventBtn.onclick = () => saveEvent(date);
    openEventDetailsModal(date); // Show event details if they exist
}

// Save event
function saveEvent(date) {
    const eventTitle = elements.eventTitleInput.value.trim();
    if (eventTitle) {
        events[date] = events[date] || [];
        events[date].push(eventTitle);
        saveEvents();
        generateCalendar(currentMonth, currentYear);
        closeModal();
    }
}

// Close event modal
function closeModal() {
    elements.eventModal.style.display = 'none';
    elements.eventTitleInput.value = '';
}

// Populate dropdowns with months and years
function populateDropdowns() {
    populateMonths();
    populateYears();
    elements.monthSelect.value = currentMonth;
    elements.yearSelect.value = currentYear;
}

// Populate month dropdown
function populateMonths() {
    Array.from({ length: 12 }, (_, i) => {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = new Date(0, i).toLocaleString('en', { month: 'long' });
        elements.monthSelect.appendChild(option);
    });
}

// Populate year dropdown
function populateYears() {
    Array.from({ length: 21 }, (_, i) => currentYear - 10 + i).forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        elements.yearSelect.appendChild(option);
    });
}

// Change month and year based on dropdown selection
function changeMonthYear() {
    currentMonth = parseInt(elements.monthSelect.value);
    currentYear = parseInt(elements.yearSelect.value);
    updateCalendar();
}

// Jump to the current date
function jumpToToday() {
    currentMonth = currentDate.getMonth();
    currentYear = currentDate.getFullYear();
    updateCalendar();
}

// Update the calendar
function updateCalendar() {
    elements.monthSelect.value = currentMonth;
    elements.yearSelect.value = currentYear;
    generateCalendar(currentMonth, currentYear);
}

// Search for events
function searchEvents() {
    const searchQuery = elements.searchInput.value.trim().toLowerCase();
    highlightedDates = [];
    foundDates = [];

    if (searchQuery) {
        findMatchingEvents(searchQuery);
        if (foundDates.length > 0) {
            foundDates.sort((a, b) => a - b);
            currentFoundIndex = 0;
            navigateToFoundDate(currentFoundIndex);
        }
    } else {
        updateCalendar();
    }
}

// Find events matching the search query
function findMatchingEvents(query) {
    Object.entries(events).forEach(([date, eventList]) => {
        if (eventList.some(event => event.toLowerCase().includes(query))) {
            highlightedDates.push(date);
            foundDates.push(new Date(date));
        }
    });
}

// Navigate to a specific found date by index
function navigateToFoundDate(index) {
    if (foundDates.length === 0) return;

    const targetDate = foundDates[index];
    currentMonth = targetDate.getMonth();
    currentYear = targetDate.getFullYear();
    updateCalendar();

    // Format date to match event keys
    const formattedDate = `${currentYear}-${currentMonth + 1}-${targetDate.getDate()}`;
    clearCurrentFoundHighlight();
    highlightCurrentFoundDate(formattedDate);
}

// Clear previous highlighting of the current found date
function clearCurrentFoundHighlight() {
    document.querySelectorAll('.current-found-date').forEach(cell => {
        cell.classList.remove('current-found-date');
    });
}

// Highlight the current found date
function highlightCurrentFoundDate(date) {
    document.querySelectorAll('[data-date]').forEach(cell => {
        if (cell.getAttribute('data-date') === date) {
            cell.classList.add('current-found-date');
        }
    });
}

// Navigate to the previous found date
function goToPrevFoundDate() {
    if (currentFoundIndex > 0) {
        currentFoundIndex--;
        navigateToFoundDate(currentFoundIndex);
    }
}

// Navigate to the next found date
function goToNextFoundDate() {
    if (currentFoundIndex < foundDates.length - 1) {
        currentFoundIndex++;
        navigateToFoundDate(currentFoundIndex);
    }
}

// Go to the previous month
function goToPrevMonth() {
    currentMonth = (currentMonth === 0) ? 11 : currentMonth - 1;
    if (currentMonth === 11) currentYear--;
    updateCalendar();
}

// Go to the next month
function goToNextMonth() {
    currentMonth = (currentMonth === 11) ? 0 : currentMonth + 1;
    if (currentMonth === 0) currentYear++;
    updateCalendar();
}

// DOM Elements for the event details modal
const elementsDetails = {
    eventDetailsModal: document.getElementById('eventDetailsModal'),
    closeDetailsBtn: document.querySelector('.close-details-btn'),
    editEventBtn: document.getElementById('editEvent'),
    deleteEventBtn: document.getElementById('deleteEvent'),
    eventDetailsDiv: document.getElementById('eventDetails'),
};

// State variables for the event details
let selectedEventDate = '';

// Open event details modal
function openEventDetailsModal(date) {
    selectedEventDate = date;
    if (events[date] && events[date].length > 0) {
        elementsDetails.eventDetailsDiv.innerHTML = events[date].map(event => `<p>${event}</p>`).join('');
        elementsDetails.eventDetailsModal.style.display = 'flex';
    }
}

// Close event details modal
function closeEventDetailsModal() {
    elementsDetails.eventDetailsModal.style.display = 'none';
    elementsDetails.eventDetailsDiv.innerHTML = '';
    closeModal();
}

// Edit event
function editEvent() {
    const newTitle = prompt('Enter new event title:', '');
    if (newTitle) {
        const eventIndex = events[selectedEventDate].findIndex(event => event === elementsDetails.eventDetailsDiv.innerText.trim());
        if (eventIndex !== -1) {
            events[selectedEventDate][eventIndex] = newTitle;
            saveEvents();
            generateCalendar(currentMonth, currentYear);
            closeEventDetailsModal();
        }
    }
}

// Delete event
function deleteEvent() {
    const confirmed = confirm('Are you sure you want to delete this event?');
    if (confirmed) {
        events[selectedEventDate] = events[selectedEventDate].filter(event => event !== elementsDetails.eventDetailsDiv.innerText.trim());
        saveEvents();
        generateCalendar(currentMonth, currentYear);
        closeEventDetailsModal();
    }
}

// Initialize the calendar and dropdowns
function initialize() {
    loadEvents();
    populateDropdowns();
    generateCalendar(currentMonth, currentYear);
}

// Event listeners
elements.closeModalBtn.addEventListener('click', closeModal);
elements.monthSelect.addEventListener('change', changeMonthYear);
elements.yearSelect.addEventListener('change', changeMonthYear);
elements.todayButton.addEventListener('click', jumpToToday);
elements.searchInput.addEventListener('input', searchEvents);
elements.prevMonthBtn.addEventListener('click', goToPrevMonth);
elements.nextMonthBtn.addEventListener('click', goToNextMonth);
elements.prevEventBtn.addEventListener('click', goToPrevFoundDate);
elements.nextEventBtn.addEventListener('click', goToNextFoundDate);
elementsDetails.closeDetailsBtn.addEventListener('click', closeEventDetailsModal);
elementsDetails.editEventBtn.addEventListener('click', editEvent);
elementsDetails.deleteEventBtn.addEventListener('click', deleteEvent);

// Initialize calendar on page load
initialize();
