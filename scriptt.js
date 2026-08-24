/* =================================
   TAB SWITCHING
================================= */

const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

tabs.forEach(tab => {

    tab.addEventListener("click", () => {

        const target = tab.dataset.tab;

        // Remove active from all tabs
        tabs.forEach(item => {
            item.classList.remove("active");
        });

        // Hide all content
        tabContents.forEach(content => {
            content.classList.remove("active");
        });

        // Activate clicked tab
        tab.classList.add("active");

        // Show matching content
        const targetContent = document.getElementById(target);

        if (targetContent) {
            targetContent.classList.add("active");
        }

    });

});


/* =================================
   THEME
================================= */

const themeOptions = document.querySelectorAll(
    'input[name="theme"]'
);

themeOptions.forEach(option => {

    option.addEventListener("change", () => {

        if (option.value === "dark") {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }

    });

});


/* =================================
   SAVE PREFERENCES
================================= */

const saveButton = document.getElementById(
    "savePreferences"
);

saveButton.addEventListener("click", () => {

    const language =
        document.getElementById("language").value;

    const dateFormat =
        document.getElementById("date-format").value;

    const timezone =
        document.getElementById("timezone").value;

    const theme =
        document.querySelector(
            'input[name="theme"]:checked'
        ).value;

    const emailNotification =
        document.getElementById(
            "email-notification"
        ).checked;

    const smsNotification =
        document.getElementById(
            "sms-notification"
        ).checked;


    const preferences = {
        language,
        dateFormat,
        timezone,
        theme,
        emailNotification,
        smsNotification
    };


    // Save locally for now
    localStorage.setItem(
        "userPreferences",
        JSON.stringify(preferences)
    );


    // Button feedback
    saveButton.textContent = "Preferences Saved!";

    setTimeout(() => {
        saveButton.textContent = "Save Preferences";
    }, 2000);

});


/* =================================
   LOAD SAVED PREFERENCES
================================= */

const savedPreferences =
    localStorage.getItem("userPreferences");

if (savedPreferences) {

    const preferences =
        JSON.parse(savedPreferences);


    // Language
    if (preferences.language) {
        document.getElementById(
            "language"
        ).value = preferences.language;
    }


    // Date
    if (preferences.dateFormat) {
        document.getElementById(
            "date-format"
        ).value = preferences.dateFormat;
    }


    // Timezone
    if (preferences.timezone) {
        document.getElementById(
            "timezone"
        ).value = preferences.timezone;
    }


    // Theme
    if (preferences.theme) {

        const themeInput =
            document.querySelector(
                `input[name="theme"][value="${preferences.theme}"]`
            );

        if (themeInput) {
            themeInput.checked = true;
        }

        if (preferences.theme === "dark") {
            document.body.classList.add("dark-mode");
        }

    }


    // Email notification
    document.getElementById(
        "email-notification"
    ).checked = preferences.emailNotification;


    // SMS notification
    document.getElementById(
        "sms-notification"
    ).checked = preferences.smsNotification;

}