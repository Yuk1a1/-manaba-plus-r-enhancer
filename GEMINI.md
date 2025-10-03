# GEMINI.md - manaba+R Enhancer

## Project Overview

This project is a Chrome browser extension called "manaba+R Enhancer". Its purpose is to improve the user experience of the Ritsumeikan University manaba+R learning management system (`ct.ritsumei.ac.jp`).

The extension provides two main features:

1.  **Enhanced Home Page:** It injects a new right-hand column into the manaba+R home page. This column contains:
    *   A list of all unsubmitted assignments (reports, quizzes, surveys) scraped from different pages.
    *   A deadline calendar that visually marks days with assignment due dates.
2.  **Automatic Download Organization:** It automatically sorts files downloaded from manaba into a structured folder hierarchy: `Manaba/[Course Name]/[Original Filename]`.

The project is built with vanilla JavaScript (ES6+) and CSS. It does not use any package managers (like npm or yarn) or build tools.

## Building and Running

There is no build process for this extension. To run or test the extension, you need to load it directly into a Chromium-based browser (like Google Chrome or Microsoft Edge).

1.  Open your browser and navigate to the extensions page (`chrome://extensions` or `edge://extensions`).
2.  Enable "Developer mode" (usually a toggle switch in the top-right corner).
3.  Click the "Load unpacked" button.
4.  Select the folder `C:\Users\ynaka\projects\manabaplusRver3.3\-manaba-plus-r-enhancer` where the `manifest.json` file is located.

The extension should now be installed and active. You can make changes to the code and reload the extension from the extensions page to see them reflected.

## Development Conventions

*   **Code Style:** The code uses standard modern JavaScript.
    *   Function and variable names use `camelCase`.
    *   Functions are documented with JSDoc-style comments explaining their purpose, parameters, and return values.
*   **Dependencies:** Third-party libraries, such as `vanilla-calendar.js`, are included directly in the repository. There is no package manager.
*   **File Structure:**
    *   `manifest.json`: The core configuration file for the Chrome extension. It defines permissions, content scripts, and the background service worker.
    *   `content.js`: This is the main script responsible for all visual changes on the manaba+R pages. It scrapes assignment data, creates the new layout, and initializes the calendar.
    *   `background.js`: This script runs in the background as a service worker. Its sole purpose is to manage the file download process and rename files according to the course name.
    *   `style.css`: Contains all the CSS rules for the new UI elements, including the two-column layout, the assignment list, and calendar popups.
    *   `vanilla-calendar.*`: These files belong to the third-party calendar library.
