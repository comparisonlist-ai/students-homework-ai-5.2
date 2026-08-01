// ======================================================
// Students Homework AI
// Version 5.2
// script.js
// Part 1 of 4
// ======================================================

// ------------------------------------------------------
// CONFIG
// ------------------------------------------------------

const CONFIG = {

    APP_NAME: "Students Homework AI",

    VERSION: "5.2",

    FREE_TRIAL_DAYS: 7,

    MAX_FREE_QUESTIONS: 100,

    DEFAULT_LANGUAGE: "English"

};

// ------------------------------------------------------
// APP STATE
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

function $(id) {

    return document.getElementById(id);

}

function hideAllScreens() {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.remove("active");

        });

}

function showScreen(id) {

    hideAllScreens();

    const screen = $(id);

    if (screen) {

        screen.classList.add("active");

    }

}

// ------------------------------------------------------
// SCREEN NAVIGATION
// ------------------------------------------------------

function showWelcome() {

    showScreen("welcomeScreen");

}

function showRegistration() {

    showScreen("registrationScreen");

}

function showLogin() {

    showScreen("loginScreen");

}

function showDashboard() {

    if (App.student && $("studentDisplayName")) {

        $("studentDisplayName").textContent =
            App.student.name;

    }

    showScreen("dashboardScreen");

}

function showSubject(studentClass) {

    App.currentClass =
        studentClass ||
        App.student.studentClass;

    $("selectedClassTitle").textContent =
        App.currentClass;

    showScreen("subjectScreen");

}

function selectSubject(subject) {

    App.currentSubject = subject;

    $("selectedSubject").textContent =
        App.currentClass + " • " + subject;

    showScreen("aiScreen");

}

// ------------------------------------------------------
// SESSION
// ------------------------------------------------------

function saveSession() {

    localStorage.setItem(

        "cbseStudent",

        JSON.stringify(App.student)

    );

    localStorage.setItem(

        "questionCount",

        App.questionCount

    );

}

function loadSession() {

    const student =
        localStorage.getItem("cbseStudent");

    const count =
        localStorage.getItem("questionCount");

    if (student) {

        App.student =
            JSON.parse(student);

    }

    if (count) {

        App.questionCount =
            Number(count);

    }

}

function clearSession() {

    localStorage.removeItem("cbseStudent");

    localStorage.removeItem("questionCount");

    App.student = null;

    App.questionCount = 0;

}

// ------------------------------------------------------
// UTILITIES
// ------------------------------------------------------

function generateStudentId() {

    return "SHAI" +

        Math.floor(

            100000 +

            Math.random() * 900000

        );

}
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

    // ----------------------------------
    // VALIDATION
    // ----------------------------------

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
            "Please enter a valid 10-digit mobile number."
        );

        return;

    }

    // ----------------------------------
    // CHECK EXISTING STUDENT
    // ----------------------------------

    const {

        data: existingStudent,

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

        console.error(checkError);

        alert(
            "Unable to verify student."
        );

        return;

    }

    if (existingStudent) {

        alert(
            "This mobile number is already registered."
        );

        return;

    }

    // ----------------------------------
    // CREATE STUDENT OBJECT
    // ----------------------------------

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

    // ----------------------------------
    // SAVE TO SUPABASE
    // ----------------------------------

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

        console.error(insertError);

        alert(
            "Registration failed."
        );

        return;

    }

    App.questionCount = 0;

    saveSession();

    alert(
        "Registration Successful!"
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
            "Please enter a valid mobile number."
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
// AI HOMEWORK
// ------------------------------------------------------

async function askAI() {

    const question =
        $("questionInput").value.trim();

    if (!question) {

        alert(
            "Please enter your question."
        );

        return;

    }

    $("loadingBox").style.display =
        "block";

    $("answerBox").innerHTML = "";

    try {

        const response =
            await fetch(

                "/api/chat",

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        studentId:
                            App.student.studentId,

                        studentClass:
                            App.currentClass,

                        subject:
                            App.currentSubject,

                        question:
                            question,

                        language:
                            CONFIG.DEFAULT_LANGUAGE

                    })

                }

            );

        const result =
            await response.json();

        $("loadingBox").style.display =
            "none";

        if (!response.ok) {

            throw new Error(

                result.error ||

                "Unable to get AI response."

            );

        }

        $("answerBox").innerHTML =
            result.answer;

        App.questionCount++;

        saveSession();

    }

    catch (error) {

        $("loadingBox").style.display =
            "none";

        console.error(error);

        $("answerBox").innerHTML =

            "<b>Error:</b> " +

            error.message;

    }

}

// ------------------------------------------------------
// LOGOUT
// ------------------------------------------------------

function logoutStudent() {

    clearSession();

    showWelcome();

}

// ------------------------------------------------------
// CLEAR QUESTION
// ------------------------------------------------------

function clearQuestion() {

    $("questionInput").value = "";

    $("answerBox").innerHTML = "";

}

// ------------------------------------------------------
// BACK TO SUBJECTS
// ------------------------------------------------------

function backToSubjects() {

    showSubject(

        App.currentClass

    );

}

// ------------------------------------------------------
// APPLICATION INITIALIZATION
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

            " Initialized"

        );

    }

);

// ------------------------------------------------------
// GLOBAL ERROR HANDLER
// ------------------------------------------------------

window.addEventListener(

    "error",

    event => {

        console.error(

            "Application Error:",

            event.error

        );

    }

);

// ------------------------------------------------------
// UNHANDLED PROMISE REJECTION
// ------------------------------------------------------

window.addEventListener(

    "unhandledrejection",

    event => {

        console.error(

            "Promise Rejection:",

            event.reason

        );

    }

);

// ------------------------------------------------------
// VERSION INFORMATION
// ------------------------------------------------------

console.log(

    "===================================="

);

console.log(

    CONFIG.APP_NAME

);

console.log(

    "Repository Version : " +

    CONFIG.VERSION

);

console.log(

    "Supabase Table : students_5.2"

);

console.log(

    "Ready."

);

console.log(

    "===================================="

// ======================================================
// END OF FILE
// ======================================================
);

