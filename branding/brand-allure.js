// const fs = require('fs');
// const path = require('path');

// const reportDir = path.join(__dirname, '..', 'allure-report');
// const logoSource = path.join(__dirname, 'Eastwest.png');
// const logoTarget = path.join(reportDir, 'Eastwest.png');

// // Copy logo
// fs.copyFileSync(logoSource, logoTarget);

// const indexFile = path.join(reportDir, 'index.html');
// let html = fs.readFileSync(indexFile, 'utf8');

// const brandingScript = `
// <script>
// (function() {

//     const addLogo = () => {

//         if (document.getElementById('eastwest-logo')) {
//             return true;
//         }

//         const titleElement =
//             document.querySelector('.app__title') ||
//             document.querySelector('.report-info__title') ||
//             document.querySelector('h1') ||
//             document.querySelector('h2');

//         if (!titleElement) {
//             return false;
//         }

//         const logo = document.createElement('img');
//         logo.id = 'eastwest-logo';
//         logo.src = './Eastwest.png';
//         logo.alt = 'EastWest Bank';

//         logo.style.height = '40px';
//         logo.style.width = 'auto';
//         logo.style.marginRight = '10px';
//         logo.style.verticalAlign = 'middle';

//         const wrapper = document.createElement('span');
//         wrapper.style.display = 'inline-flex';
//         wrapper.style.alignItems = 'center';

//         titleElement.parentNode.insertBefore(wrapper, titleElement);

//         wrapper.appendChild(logo);
//         wrapper.appendChild(titleElement);

//         console.log('✅ EastWest logo added');

//         return true;
//     };

//     let attempts = 0;

//     const interval = setInterval(() => {
//         attempts++;

//         if (addLogo() || attempts > 30) {
//             clearInterval(interval);
//         }
//     }, 1000);

// })();
// </script>
// `;

// html = html.replace('</body>', brandingScript + '</body>');

// fs.writeFileSync(indexFile, html);

// console.log('✅ EastWest branding applied');

const fs = require('fs');
const path = require('path');

const reportDir = path.join(__dirname, '..', 'allure-report');
const logoSource = path.join(__dirname, 'Eastwest.png');
const logoTarget = path.join(reportDir, 'Eastwest.png');

// Copy logo
fs.copyFileSync(logoSource, logoTarget);

const indexFile = path.join(reportDir, 'index.html');
let html = fs.readFileSync(indexFile, 'utf8');

const customStyles = `
<style>

/* EastWest Theme */

/* Sidebar */
.side-nav {
    background-color: #542785 !important;
}

/* Sidebar text */
.side-nav,
.side-nav *,
.side-nav a,
.side-nav span,
.side-nav div,
.side-nav li {
    color: #d5e04d !important;
}

/* =========================
DARK MODE
========================= */
.theme_dark .side-nav,
body.dark .side-nav,
[data-theme="dark"] .side-nav {
background-color: #B2006F !important;
}

.theme_dark .side-nav,
.theme_dark .side-nav *,
.theme_dark .side-nav a,
.theme_dark .side-nav span,
.theme_dark .side-nav div,
.theme_dark .side-nav li,
body.dark .side-nav,
body.dark .side-nav *,
body.dark .side-nav a,
body.dark .side-nav span,
body.dark .side-nav div,
body.dark .side-nav li,
[data-theme="dark"] .side-nav,
[data-theme="dark"] .side-nav *,
[data-theme="dark"] .side-nav a,
[data-theme="dark"] .side-nav span,
[data-theme="dark"] .side-nav div,
[data-theme="dark"] .side-nav li {
color: #ffffff !important;
}

/* Report title in Light Mode */
h1,
h2 {
color: #542785 !important;
}

/* Report title in Dark Mode */
.theme_dark h1,
.theme_dark h2,
body.dark h1,
body.dark h2,
[data-theme="dark"] h1,
[data-theme="dark"] h2 {
color: #d5e04d !important;
}

/* Also change widget titles in Dark Mode */
.theme_dark .widget__title,
.theme_dark .pane__title,
.theme_dark .report-info__title,
body.dark .widget__title,
body.dark .pane__title,
body.dark .report-info__title,
[data-theme="dark"] .widget__title,
[data-theme="dark"] .pane__title,
[data-theme="dark"] .report-info__title {
color: #d5e04d !important;
}

</style>
`;

const brandingScript = `
<script>
(function () {

    function addLogo() {

        const titleElement =
            document.querySelector('.app__title') ||
            document.querySelector('.report-info__title') ||
            document.querySelector('h1') ||
            document.querySelector('h2');

        if (!titleElement) {
            return;
        }

        // Prevent duplicate logos
        if (titleElement.querySelector('#eastwest-logo')) {
            return;
        }

        const logo = document.createElement('img');
        logo.id = 'eastwest-logo';
        logo.src = './Eastwest.png';
        logo.alt = 'EastWest Bank';

        logo.style.height = '40px';
        logo.style.width = 'auto';
        logo.style.marginRight = '10px';
        logo.style.verticalAlign = 'middle';
        logo.style.display = 'inline-block';

        titleElement.prepend(logo);

        console.log('✅ EastWest logo added');
    }

    // Initial load
    setTimeout(addLogo, 500);

    // Re-add logo whenever Allure rerenders
    const observer = new MutationObserver(() => {
        addLogo();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
    });

})();
</script>
`;

html = html.replace(
    '</body>',
    customStyles + brandingScript + '</body>'
);

fs.writeFileSync(indexFile, html);

console.log('✅ EastWest branding applied');