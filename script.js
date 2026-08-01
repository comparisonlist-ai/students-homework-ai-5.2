// ======================================================
// Students Homework AI
// Version 5.2
// script.js
// Part 1
// Configuration, App State, Utilities & Navigation
// ======================================================

// ------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------

const CONFIG = {

    APP_NAME:
        "Students Homework AI",

    VERSION:
        "5.2",

    FREE_TRIAL_DAYS:
        7,

    MAX_FREE_QUESTIONS:
        100,

    DEFAULT_LANGUAGE:
        "English"

};

// ------------------------------------------------------
// APPLICATION STATE
// ------------------------------------------------------

const App = {

    student: null,

    currentClass: "",

    currentSubject: "",

    questionCount: 0

};

// ------------------------------------------------------
// DOM HELPERS
// ------------------------------------------------------

const $ = id =>
    document.getElementById(id);

function hideAllScreens() {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.remove(
                "active"
            );

        });

}

function showScreen(id) {

    hideAllScreens();

    const screen = $(id);

    if (screen) {

        screen.classList.add(
            "active"
        );

    }

}

// ------------------------------------------------------
// SCREEN NAVIGATION
// ------------------------------------------------------

function showWelcome() {

    showScreen(
        "welcomeScreen"
    );

}

function showRegistration() {

    showScreen(
        "registrationScreen"
    );

}

function showLogin() {

    showScreen(
        "loginScreen"
    );

}

function showDashboard() {

    if (
        App.student &&
        $("studentDisplayName")
    ) {

        $("studentDisplayName").textContent =
            App.student.name;

    }

    showScreen(
        "dashboardScreen"
    );

}

function showSubject(studentClass) {

    if (studentClass) {

        App.currentClass =
            studentClass;

    }

    if (
        $("selectedClassTitle")
    ) {

        $("selectedClassTitle")
            .textContent =
            App.currentClass;

    }

    showScreen(
        "subjectScreen"
    );

}

function selectSubject(subject) {

    App.currentSubject =
        subject;

    if (
        $("selectedSubject")
    ) {

        $("selectedSubject")
            .textContent =
            App.currentClass +
            " • " +
            subject;

    }

    showScreen(
        "aiScreen"
    );

}

// ------------------------------------------------------
// UTILITY FUNCTIONS
// ------------------------------------------------------

function generateStudentId() {

    return (
        "SHAI" +
        Date.now()
            .toString()
            .slice(-6)
    );

}

function saveSession() {

    localStorage.setItem(

        "cbseStudent",

        JSON.stringify(
            App.student
        )

    );

    localStorage.setItem(

        "questionCount",

        App.questionCount

    );

}

function loadSession() {

    const student =
        localStorage.getItem(
            "cbseStudent"
        );

    const questions =
        localStorage.getItem(
            "questionCount"
        );

    if (student) {

        App.student =
            JSON.parse(student);

    }

    if (questions) {

        App.questionCount =
            parseInt(
                questions
            );

    }

}

function clearSession() {

    localStorage.removeItem(
        "cbseStudent"
    );

    localStorage.removeItem(
        "questionCount"
    );

    App.student = null;

    App.questionCount = 0;

}

// ------------------------------------------------------
// APPLICATION STARTUP
// ------------------------------------------------------

document.addEventListener(

    "DOMContentLoaded",

    () => {

        loadSession();

        if (App.student) {

            showDashboard();

        } else {

            showWelcome();

        }

        console.log(

            CONFIG.APP_NAME +
            " Version " +
            CONFIG.VERSION +
            " Loaded"

        );

    }

);


// ------------------------------------------------------
// REGISTRATION
// ------------------------------------------------------

async function registerStudent() {

    const name =
        $("studentName").value.trim();

    const studentClass =
        $("studentClass").value;

    const mobile =
        $("studentMobile").value.trim();

    const parentMobile =
        $("parentMobile").value.trim();

    const email =
        $("studentEmail").value.trim();

    // ----------------------------
    // Validation
    // ----------------------------

    if (
        !name ||
        !studentClass ||
        !mobile ||
        !email
    ) {

        alert(
            "Please fill all required fields."
        );

        return;

    }

    if (
        !/^\d{10}$/.test(mobile)
    ) {

        alert(
            "Enter a valid 10-digit mobile number."
        );

        return;

    }

    // ----------------------------
    // Check Existing Student
    // ----------------------------

    const {

        data: existing,

        error: checkError

    } = await supabase

        .from("students_5.2")

        .select("student_id")

        .eq(
            "mobile_number",
            mobile
        )

        .maybeSingle();

    if (checkError) {

        console.error(
            checkError
        );

        alert(
            "Unable to verify registration."
        );

        return;

    }

    if (existing) {

        alert(
            "This mobile number is already registered."
        );

        return;

    }

    // ----------------------------
    // Create Student
    // ----------------------------

    const studentId =
        generateStudentId();

    App.student = {

        studentId,

        name,

        studentClass,

        mobile,

        parentMobile,

        email,

        membership:
            "FREE",

        trial:
            true

    };

    // ----------------------------
    // Save to Supabase
    // ----------------------------

    const {

        error: insertError

    } = await supabase

        .from("students_5.2")

        .insert([{

            student_id:
                studentId,

            name:
                name,

            student_class:
                studentClass,

            mobile_number:
                mobile,

            parent_mobile:
                parentMobile || null,

            email:
                email,

            membership:
                "FREE",

            trial:
                true

        }]);

    if (insertError) {

        console.error(
            insertError
        );

        alert(
            "Registration failed."
        );

        return;

    }

    App.questionCount = 0;

    saveSession();

    alert(
        "Registration successful!"
    );

    showDashboard();

}

// ------------------------------------------------------
// LOGIN
// ------------------------------------------------------

async function loginStudent() {

    const mobile =
        $("loginMobile").value.trim();

    if (
        !/^\d{10}$/.test(mobile)
    ) {

        alert(
            "Enter a valid 10-digit mobile number."
        );

        return;

    }

    const {

        data,

        error

    } = await supabase

        .from("students_5.2")

        .select("*")

        .eq(
            "mobile_number",
            mobile
        )

        .maybeSingle();

    if (error) {

        console.error(error);

        alert(
            "Login failed."
        );

        return;

    }

    if (!data) {

        alert(
            "Student not found."
        );

        return;

    }

    App.student = {

        studentId:
            data.student_id,

        name:
            data.name,

        studentClass:
            data.student_class,

        mobile:
            data.mobile_number,

        parentMobile:
            data.parent_mobile,

        email:
            data.email,

        membership:
            data.membership,

        trial:
            data.trial

    };

    saveSession();

    showDashboard();

}

// ------------------------------------------------------
// DASHBOARD
// ------------------------------------------------------

function logoutStudent() {

    clearSession();

    showWelcome();

}

function updateStudentInfo() {

    if (
        App.student &&
        $("studentDisplayName")
    ) {

        $("studentDisplayName").textContent =
            App.student.name;

    }

    if (
        $("selectedClassTitle")
    ) {

        $("selectedClassTitle").textContent =
            App.currentClass ||
            App.student.studentClass;

    }

}

function showDashboard() {

    updateStudentInfo();

    showScreen(
        "dashboardScreen"
    );

}

// ------------------------------------------------------
// SUBJECT SELECTION
// ------------------------------------------------------

function showSubject(studentClass) {

    if (studentClass) {

        App.currentClass =
            studentClass;

    } else if (
        App.student
    ) {

        App.currentClass =
            App.student.studentClass;

    }

    if (
        $("selectedClassTitle")
    ) {

        $("selectedClassTitle").textContent =
            App.currentClass;

    }

    showScreen(
        "subjectScreen"
    );

}

function selectSubject(subject) {

    App.currentSubject =
        subject;

    if (
        $("selectedSubject")
    ) {

        $("selectedSubject").textContent =

            App.currentClass +
            " • " +
            subject;

    }

    showScreen(
        "aiScreen"
    );

}


// ------------------------------------------------------
// LOGIN
// ------------------------------------------------------

async function loginStudent() {

    const mobile =
        $("loginMobile").value.trim();

    if (
        !/^\d{10}$/.test(mobile)
    ) {

        alert(
            "Enter a valid 10-digit mobile number."
        );

        return;

    }

    const {

        data,

        error

    } = await supabase

        .from("students_5.2")

        .select("*")

        .eq(
            "mobile_number",
            mobile
        )

        .maybeSingle();

    if (error) {

        console.error(error);

        alert(
            "Login failed."
        );

        return;

    }

    if (!data) {

        alert(
            "Student not found."
        );

        return;

    }

    App.student = {

        studentId:
            data.student_id,

        name:
            data.name,

        studentClass:
            data.student_class,

        mobile:
            data.mobile_number,

        parentMobile:
            data.parent_mobile,

        email:
            data.email,

        membership:
            data.membership,

        trial:
            data.trial

    };

    saveSession();

    showDashboard();

}

// ------------------------------------------------------
// DASHBOARD
// ------------------------------------------------------

function logoutStudent() {

    clearSession();

    showWelcome();

}

function updateStudentInfo() {

    if (
        App.student &&
        $("studentDisplayName")
    ) {

        $("studentDisplayName").textContent =
            App.student.name;

    }

    if (
        $("selectedClassTitle")
    ) {

        $("selectedClassTitle").textContent =
            App.currentClass ||
            App.student.studentClass;

    }

}

function showDashboard() {

    updateStudentInfo();

    showScreen(
        "dashboardScreen"
    );

}

// ------------------------------------------------------
// SUBJECT SELECTION
// ------------------------------------------------------

function showSubject(studentClass) {

    if (studentClass) {

        App.currentClass =
            studentClass;

    } else if (
        App.student
    ) {

        App.currentClass =
            App.student.studentClass;

    }

    if (
        $("selectedClassTitle")
    ) {

        $("selectedClassTitle").textContent =
            App.currentClass;

    }

    showScreen(
        "subjectScreen"
    );

}

function selectSubject(subject) {

    App.currentSubject =
        subject;

    if (
        $("selectedSubject")
    ) {

        $("selectedSubject").textContent =

            App.currentClass +
            " • " +
            subject;

    }

    showScreen(
        "aiScreen"
    );

}
