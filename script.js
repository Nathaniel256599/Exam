// University of Lusaka Exam Invigilator System - Secure JSON Login
// Works with file:// and sandboxed environments

// --- Safe Storage Setup (works even without localStorage) ---
let safeStorage = {
    data: {},
    setItem(key, value) { this.data[key] = String(value); },
    getItem(key) { return this.data[key] || null; },
    removeItem(key) { delete this.data[key]; },
    clear() { this.data = {}; }
};

let isLocalStorageAvailable = false;
try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    isLocalStorageAvailable = true;
} catch (e) {
    console.warn('localStorage unavailable. Using session memory.');
}

const appStorage = isLocalStorageAvailable ? localStorage : safeStorage;

// --- Predefined Invigilator Accounts (JSON format) ---
const INVIGILATORS = [
    { username: "BENI", password: "BCS25168878", fullName:"BENI KUPAKWASHE" },
    { username: "PAUL", password: "BMS25155738", fullName: "BISENGA PAUL" },
    { username: "CHRISTIAN", password: "BCS25133325", fullName: "CHADAMBUKA CHRISTIAN" },
    { username: "SIBUSISO", password: "BIT24228709", fullName: "CHIDARERA SIBUSISO" }
    { username: "ASHELL", password: "BCS25153177", fullName:"CHILUFYA ASHELL" },
    { username: "AMOS", password: "BCS25131582", fullName: "CHINYAMA AMOS" },
    { username: "KONDWANI", password: "BIT25152598", fullName: "GONDWE KONDWANI" },
    { username: "EFTIHIOS", password: "BCS25155885", fullName: "GRIGORAKIS EFTIHIOS" }
    { username: "THUMA", password: "BCS25165336", fullName:"THUMA HAMUKANGANDU" },
    { username: "MUTANGO", password: "BCS25174592", fullName: "KACHUNGU MUTANGO" },
    { username: "FAISAL", password: "BCS25193079", fullName: "KAFUNYA FAISAL" },
    { username: "LIFUNA", password: "BCS25189578", fullName: "KAPULU LIFUNA" }
    { username: "KABASO", password: "BCS25191435", fullName:"KASABO KABASO" },
    { username: "NIZA", password: "BCS25162991", fullName: "KASARO NIZA" },
    { username: "CHRISTIAN", password: "BCS25133325", fullName: "CHADAMBUKA CHRISTIAN" },
    { username: "SIBUSISO", password: "BIT24228709", fullName: "CHIDARERA SIBUSISO" }

];

// --- DOM Elements ---
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
    if (isUserLoggedIn()) {
        if (window.location.pathname.endsWith('index.html')) {
            window.location.href = 'dashboard.html';
        }
    } else {
        if (!window.location.pathname.endsWith('index.html')) {
            window.location.href = 'index.html';
        }
    }
    initPage();

    if (document.getElementById('currentDate')) {
        const now = new Date();
        document.getElementById('currentDate').textContent = now.toLocaleDateString('en-ZM', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }
});

// --- Login Handler ---
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        // Validate against JSON user list
        const user = INVIGILATORS.find(u => u.username === username && u.password === password);

        if (user) {
            // Save session
            appStorage.setItem('isLoggedIn', 'true');
            appStorage.setItem('invigilatorName', user.fullName);
            appStorage.setItem('username', user.username);

            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid username or password. Please try:\n\nUsername: john | Password: john123\nUsername: sarah | Password: sarah123');
        }
    });
}

// --- Utility Functions ---
function isUserLoggedIn() {
    return appStorage.getItem('isLoggedIn') === 'true';
}

function initPage() {
    const currentPage = window.location.pathname.split('/').pop();
    switch (currentPage) {
        case 'dashboard.html': initDashboard(); break;
        case 'schedule.html': initSchedule(); break;
        case 'attendance.html': initAttendance(); break;
        case 'incidents.html': initIncidents(); break;
        case 'reports.html': initReports(); break;
    }
}

// --- Logout Handler ---
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('logout-btn')) {
        e.preventDefault();
        appStorage.removeItem('isLoggedIn');
        appStorage.removeItem('invigilatorName');
        appStorage.removeItem('username');
        window.location.href = 'index.html';
    }
});

// --- Rest of your existing functionality (dashboard, schedule, etc.) ---
// [All the same functions as before, but using appStorage instead of localStorage]

function initDashboard() {
    const invigilatorName = appStorage.getItem('invigilatorName') || 'Invigilator';
    document.getElementById('invigilatorName').textContent = invigilatorName;

    const exams = getExamData();
    const today = new Date().toISOString().split('T')[0];
    const todayExams = exams.filter(exam => exam.date === today);
    document.getElementById('todayExamsCount').textContent = todayExams.length;

    const attendanceData = JSON.parse(appStorage.getItem('attendanceData') || '[]');
    const incidentData = JSON.parse(appStorage.getItem('incidentData') || '[]');

    document.getElementById('attendanceCount').textContent = attendanceData.length;
    document.getElementById('incidentsCount').textContent = incidentData.length;

    const upcomingExamsList = document.getElementById('upcomingExamsList');
    upcomingExamsList.innerHTML = '';

    if (todayExams.length > 0) {
        todayExams.forEach(exam => {
            const examItem = document.createElement('div');
            examItem.className = 'exam-item';
            examItem.innerHTML = `
                <div class="exam-details">
                    <h4>${exam.courseCode} - ${exam.courseName}</h4>
                    <p>${exam.time} • ${exam.venue}</p>
                </div>
                <div class="exam-status status-upcoming">Upcoming</div>
            `;
            upcomingExamsList.appendChild(examItem);
        });
    } else {
        upcomingExamsList.innerHTML = '<p class="text-center">No exams scheduled for today</p>';
    }
}

function initSchedule() {
    const exams = getExamData();
    const scheduleTableBody = document.getElementById('scheduleTableBody');
    scheduleTableBody.innerHTML = '';

    exams.forEach(exam => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${exam.courseCode}</td>
            <td>${exam.courseName}</td>
            <td>${formatDate(exam.date)}</td>
            <td>${exam.time}</td>
            <td>${exam.venue}</td>
            <td><span class="exam-status status-upcoming">Upcoming</span></td>
        `;
        scheduleTableBody.appendChild(row);
    });

    const dateFilter = document.getElementById('dateFilter');
    dateFilter.addEventListener('change', () => {
        const filterValue = dateFilter.value;
        const rows = scheduleTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const dateCell = row.cells[2];
            const examDate = dateCell.textContent;
            let showRow = true;

            if (filterValue === 'today') {
                const today = new Date().toLocaleDateString('en-ZM');
                showRow = examDate === today;
            } else if (filterValue === 'tomorrow') {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                showRow = examDate === tomorrow.toLocaleDateString('en-ZM');
            }
            row.style.display = showRow ? '' : 'none';
        });
    });
}

function initAttendance() {
    const currentExam = getCurrentExam();
    if (currentExam) {
        document.getElementById('currentExamInfo').textContent =
            `${currentExam.courseCode} - ${currentExam.courseName}`;
    }
    initExamTimer();
    loadStudentList();

    const scanBtn = document.getElementById('scanBtn');
    const studentIdInput = document.getElementById('studentIdInput');
    const scanStatus = document.getElementById('scanStatus');

    scanBtn.addEventListener('click', () => {
        const studentId = studentIdInput.value.trim();
        if (studentId) {
            const student = findStudentById(studentId);
            if (student) {
                scanStatus.textContent = `Student found: ${student.name}`;
                scanStatus.className = 'scan-status scan-success';
                markAttendanceForStudent(studentId, true);
            } else {
                scanStatus.textContent = 'Student ID not found';
                scanStatus.className = 'scan-status scan-error';
            }
            setTimeout(() => {
                scanStatus.style.display = 'none';
                studentIdInput.value = '';
            }, 2000);
        } else {
            scanStatus.textContent = 'Please enter a student ID';
            scanStatus.className = 'scan-status scan-error';
            scanStatus.style.display = 'block';
        }
    });

    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('input[type="checkbox"][id^="student-"]');
    selectAll.addEventListener('change', () => {
        checkboxes.forEach(checkbox => checkbox.checked = selectAll.checked);
    });

    document.getElementById('saveAttendance').addEventListener('click', saveAttendance);
    document.getElementById('exportAttendance').addEventListener('click', exportAttendanceToCSV);
}

function initExamTimer() {
    let seconds = 0;
    let timerInterval = null;
    const timerDisplay = document.getElementById('examTimer');
    const startBtn = document.getElementById('startTimer');
    const pauseBtn = document.getElementById('pauseTimer');
    const resetBtn = document.getElementById('resetTimer');

    function updateTimerDisplay() {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        timerDisplay.textContent =
            `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function startTimer() {
        if (!timerInterval) {
            timerInterval = setInterval(() => {
                seconds++;
                updateTimerDisplay();
            }, 1000);
        }
        startBtn.disabled = true;
        pauseBtn.disabled = false;
    }

    function pauseTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        seconds = 0;
        updateTimerDisplay();
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }

    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    updateTimerDisplay();
}

function loadStudentList() {
    const students = getStudentData();
    const tableBody = document.getElementById('attendanceTableBody');
    tableBody.innerHTML = '';

    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" id="student-${student.id}" data-student-id="${student.id}"></td>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>
                <select class="status-select" data-student-id="${student.id}">
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                </select>
            </td>
        `;
        tableBody.appendChild(row);
    });

    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const studentId = e.target.dataset.studentId;
            const status = e.target.value;
            updateStudentStatus(studentId, status);
        });
    });
}

function markAttendanceForStudent(studentId, isPresent) {
    const checkbox = document.querySelector(`input[data-student-id="${studentId}"]`);
    if (checkbox) checkbox.checked = isPresent;

    const statusSelect = document.querySelector(`select[data-student-id="${studentId}"]`);
    if (statusSelect) statusSelect.value = isPresent ? 'present' : 'absent';
}

function updateStudentStatus(studentId, status) {
    let attendanceData = JSON.parse(appStorage.getItem('attendanceData') || '[]');
    const examId = getCurrentExam().id;
    let record = attendanceData.find(r => r.examId === examId && r.studentId === studentId);

    if (!record) {
        record = { examId, studentId, status, timestamp: new Date().toISOString() };
        attendanceData.push(record);
    } else {
        record.status = status;
        record.timestamp = new Date().toISOString();
    }

    appStorage.setItem('attendanceData', JSON.stringify(attendanceData));
}

function saveAttendance() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][id^="student-"]:checked');
    const examId = getCurrentExam().id;
    let attendanceData = JSON.parse(appStorage.getItem('attendanceData') || '[]');

    checkboxes.forEach(checkbox => {
        const studentId = checkbox.dataset.studentId;
        const statusSelect = document.querySelector(`select[data-student-id="${studentId}"]`);
        const status = statusSelect ? statusSelect.value : 'present';

        const existingIndex = attendanceData.findIndex(r => r.examId === examId && r.studentId === studentId);
        if (existingIndex === -1) {
            attendanceData.push({ examId, studentId, status, timestamp: new Date().toISOString() });
        } else {
            attendanceData[existingIndex].status = status;
            attendanceData[existingIndex].timestamp = new Date().toISOString();
        }
    });

    appStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    alert('Attendance saved successfully!');
}

function exportAttendanceToCSV() {
    const attendanceData = JSON.parse(appStorage.getItem('attendanceData') || '[]');
    const exam = getCurrentExam();

    if (attendanceData.length === 0) {
        alert('No attendance data to export');
        return;
    }

    let csvContent = 'text/csv;charset=utf-8,';
    csvContent += 'Student ID,Student Name,Status,Timestamp\n';

    attendanceData.forEach(record => {
        const student = getStudentData().find(s => s.id === record.studentId);
        if (student) {
            csvContent += `"${record.studentId}","${student.name}","${record.status}","${record.timestamp}"\n`;
        }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_${exam.courseCode}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function initIncidents() {
    const currentExam = getCurrentExam();
    if (currentExam) {
        document.getElementById('incidentExamInfo').textContent =
            `${currentExam.courseCode} - ${currentExam.courseName}`;
    }

    document.getElementById('incidentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const incidentData = {
            examId: currentExam.id,
            type: document.getElementById('incidentType').value,
            severity: document.getElementById('incidentSeverity').value,
            studentId: document.getElementById('studentId').value || null,
            description: document.getElementById('incidentDescription').value,
            time: document.getElementById('incidentTime').value,
            timestamp: new Date().toISOString()
        };

        let incidents = JSON.parse(appStorage.getItem('incidentData') || '[]');
        incidents.push(incidentData);
        appStorage.setItem('incidentData', JSON.stringify(incidents));

        document.getElementById('incidentForm').reset();
        alert('Incident reported successfully!');
        displayReportedIncidents();
    });

    displayReportedIncidents();
}

function displayReportedIncidents() {
    const incidentsList = document.getElementById('reportedIncidentsList');
    const incidents = JSON.parse(appStorage.getItem('incidentData') || '[]');
    const currentExamId = getCurrentExam().id;
    const examIncidents = incidents.filter(incident => incident.examId === currentExamId);

    incidentsList.innerHTML = '';
    if (examIncidents.length === 0) {
        incidentsList.innerHTML = '<p class="text-center">No incidents reported for this exam</p>';
        return;
    }

    examIncidents.forEach(incident => {
        const incidentItem = document.createElement('div');
        incidentItem.className = 'incident-item';
        const studentInfo = incident.studentId ? `<p><strong>Student ID:</strong> ${incident.studentId}</p>` : '';
        incidentItem.innerHTML = `
            <div class="incident-header">
                <div class="incident-type">${incident.type.charAt(0).toUpperCase() + incident.type.slice(1)}</div>
                <div class="incident-severity severity-${incident.severity}">${incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}</div>
            </div>
            <div class="incident-details">
                ${studentInfo}
                <p><strong>Description:</strong> ${incident.description}</p>
                <p><strong>Time:</strong> ${incident.time}</p>
                <p><strong>Reported:</strong> ${new Date(incident.timestamp).toLocaleString()}</p>
            </div>
        `;
        incidentsList.appendChild(incidentItem);
    });
}

function initReports() {
    document.getElementById('generateReport').addEventListener('click', () => {
        const type = document.getElementById('reportType').value;
        generateReport(type, document.getElementById('reportContainer'));
    });

    document.getElementById('exportReport').addEventListener('click', () => {
        alert('Report exported as PDF (simulated)');
    });

    generateReport('summary', document.getElementById('reportContainer'));
}

function generateReport(type, container) {
    container.innerHTML = '';
    if (type === 'summary') generateSummaryReport(container);
    else if (type === 'attendance') generateAttendanceReport(container);
    else if (type === 'incidents') generateIncidentReport(container);
}

function generateSummaryReport(container) {
    const exams = getExamData();
    const attendanceData = JSON.parse(appStorage.getItem('attendanceData') || '[]');
    const incidentData = JSON.parse(appStorage.getItem('incidentData') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const todayExams = exams.filter(exam => exam.date === today);

    container.innerHTML = `
        <div class="report-header">
            <h2>Exam Summary Report</h2>
            <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
        <div class="report-summary">
            <div class="summary-item"><h3>Total Exams Today</h3><p>${todayExams.length}</p></div>
            <div class="summary-item"><h3>Attendance Records</h3><p>${attendanceData.length}</p></div>
            <div class="summary-item"><h3>Incidents Reported</h3><p>${incidentData.length}</p></div>
        </div>
        <h3>Today's Exams</h3>
        <div class="report-table-container">
            <table class="report-table">
                <thead><tr><th>Course</th><th>Time</th><th>Venue</th><th>Students</th></tr></thead>
                <tbody>${todayExams.map(exam => `
                    <tr>
                        <td>${exam.courseCode} - ${exam.courseName}</td>
                        <td>${exam.time}</td>
                        <td>${exam.venue}</td>
                        <td>${getStudentData().length}</td>
                    </tr>
                `).join('')}</tbody>
            </table>
        </div>
    `;
}

function generateAttendanceReport(container) {
    const attendanceData = JSON.parse(appStorage.getItem('attendanceData') || '[]');
    const students = getStudentData();
    container.innerHTML = `
        <div class="report-header"><h2>Attendance Report</h2><p>Generated on: ${new Date().toLocaleString()}</p></div>
        <div class="report-table-container">
            <table class="report-table">
                <thead><tr><th>Student ID</th><th>Student Name</th><th>Status</th><th>Timestamp</th></tr></thead>
                <tbody>${attendanceData.map(record => {
        const student = students.find(s => s.id === record.studentId);
        return `<tr><td>${record.studentId}</td><td>${student ? student.name : 'Unknown'}</td><td>${record.status.charAt(0).toUpperCase() + record.status.slice(1)}</td><td>${new Date(record.timestamp).toLocaleString()}</td></tr>`;
    }).join('')}</tbody>
            </table>
        </div>
    `;
}

function generateIncidentReport(container) {
    const incidentData = JSON.parse(appStorage.getItem('incidentData') || '[]');
    const exams = getExamData();
    container.innerHTML = `
        <div class="report-header"><h2>Incident Report</h2><p>Generated on: ${new Date().toLocaleString()}</p></div>
        <div class="report-table-container">
            <table class="report-table">
                <thead><tr><th>Exam</th><th>Type</th><th>Severity</th><th>Student ID</th><th>Description</th><th>Time</th></tr></thead>
                <tbody>${incidentData.map(incident => {
        const exam = exams.find(e => e.id === incident.examId);
        return `<tr><td>${exam ? exam.courseCode : 'Unknown'}</td><td>${incident.type.charAt(0).toUpperCase() + incident.type.slice(1)}</td><td>${incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}</td><td>${incident.studentId || 'N/A'}</td><td>${incident.description}</td><td>${incident.time}</td></tr>`;
    }).join('')}</tbody>
            </table>
        </div>
    `;
}

// --- Helper Functions ---
function getExamData() {
    return [
        { id: 1, courseCode: 'CS101', courseName: 'Introduction to Computer Science', date: new Date().toISOString().split('T')[0], time: '09:00 - 11:00', venue: 'Main Hall A' },
        { id: 2, courseCode: 'MATH201', courseName: 'Calculus II', date: new Date().toISOString().split('T')[0], time: '13:00 - 15:00', venue: 'Science Building B' },
        { id: 3, courseCode: 'ENG102', courseName: 'Academic Writing', date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], time: '10:00 - 12:00', venue: 'Humanities Block C' }
    ];
}

function getCurrentExam() {
    const exams = getExamData();
    const today = new Date().toISOString().split('T')[0];
    return exams.find(exam => exam.date === today) || exams[0];
}

function getStudentData() {
    return [
        { id: 'BCS25168878', name: 'BENI KUPAKWASHE' },
        { id: '2023002', name: 'Sarah Johnson' },
        { id: '2023003', name: 'Michael Brown' },
        { id: '2023004', name: 'Emily Davis' },
        { id: '2023005', name: 'David Wilson' },
        { id: '2023006', name: 'Jessica Taylor' },
        { id: '2023007', name: 'Christopher Anderson' },
        { id: '2023008', name: 'Amanda Thomas' },
        { id: '2023009', name: 'Matthew Jackson' },
        { id: '2023010', name: 'Elizabeth White' }
    ];
}

function findStudentById(id) {
    return getStudentData().find(student => student.id === id);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-ZM');
}
