import * as util from './utils/common';

export default async function globalSetup() {
    console.log('Clearing test results...');

    await util.clearTestResults();

    console.log('Test results cleared.');
}