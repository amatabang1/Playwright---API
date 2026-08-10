/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });
/**
 * See https://playwright.dev/docs/test-configuration.
 */
const isPipeline =
    !!process.env.BUILD_BUILDID ||      // Azure DevOps
    !!process.env.GITHUB_ACTIONS ||     // GitHub Actions
    !!process.env.JENKINS_URL;          // Jenkins

const tester = isPipeline
    ? 'Pipeline Execution'
    : (
        process.env.USERNAME ||         // Windows
        process.env.USER ||             // Ubuntu/Linux/macOS
        process.env.LOGNAME ||          // Linux fallback
        'Unknown User'
    );

const monocartReporter: [string, any] = [
    'monocart-reporter',
    {
        name: 'STS - Test Execution Report',
        outputFile: './monocart-report/index.html',
        quiet: true,

        metadata: {
            Company: 'EastWest Banking Corporation',
            Framework: 'Playwright API Automation Framework',
            Environment: process.env.TEST_ENV || 'SIT',
            Tester: tester,

            BuildNumber:
                process.env.BUILD_BUILDNUMBER ||
                process.env.GITHUB_RUN_NUMBER ||
                'CI Run',

            Branch:
                process.env.BUILD_SOURCEBRANCHNAME ||
                process.env.GITHUB_REF_NAME ||
                'Unknown',

            NodeVersion: process.version,
            OS: process.platform,
            ExecutionDate: new Date().toLocaleString()
        }
    }
];
    
export default defineConfig({
    testDir: './tests',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['html'],
        ['allure-playwright'],
        ['junit', { outputFile: 'test-results/results.xml' }],
        ['json', { outputFile: 'test-results/playwright-results.json' }],
        ...(isPipeline ? [monocartReporter] : [])
    ],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('')`. */
        // baseURL: 'http://localhost:3000',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
    },
    globalSetup: './global-setup.ts',
    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        // {
        //   name: 'firefox',
        //   use: { ...devices['Desktop Firefox'] },
        // },

        // {
        //   name: 'webkit',
        //   use: { ...devices['Desktop Safari'] },
        // },

        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },

        /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
        // },
        // {
        //   name: 'Google Chrome',
        //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        // },
    ],

    /* Run your local dev server before starting the tests */
    // webServer: {
    //   command: 'npm run start',
    //   url: 'http://localhost:3000',
    //   reuseExistingServer: !process.env.CI,
    // },
});
