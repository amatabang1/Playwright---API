import { test, expect } from '@playwright/test';
import env from '../config/envi.constants.json';
import * as XLutil from '../utils/excelUtil';
import * as util from '../utils/common';

const apiTest = env.TestBase;

// Passed the worksheet related to the test to get the data set
const testData: any[] = XLutil.getExcelData('PTTCheckStatus');

test.describe('Promote to Test - Check Status API Test Suite', { tag: ['@PTTest', '@Regression', '@CheckStatus'] }, () => {
  for (const data of testData) {
    test(`${data.Description}`, async ({ request }, testInfo) => {

      //Check for skip test - Execution Flag
      util.skipIfNotExecutable(data.ExecutionFlag);

      //Constructor for request headers
      const reqHeaders = {
        'api-key': String(data.IN_HeadAPIKey).trim(),
        'partner-id': String(data.IN_HeadPartnerID).trim(),
        'content-type': String(data.IN_HeadContentType).trim(),
      };
      //Constructor for request params
      const params = {
        apiTxnId: String(data.IN_APITxnID).trim(),
        apiTxnRef: String(data.IN_APITxnRef).trim(),
      };

      //Trigger the api call for GET
      const response = await request.get(
        `${apiTest}${data.IN_EndPoint}`, {
        headers: reqHeaders,
        params,
      });

      //Checker for response type
      let responseBody;
      try {
        responseBody = await response.json();
      } catch {
        responseBody = await response.text();
      }

      //Log API request and response
      util.logRequest(apiTest, data.IN_EndPoint, reqHeaders, params, null);
      util.logResponse(data.ExpectedStatus, response.status(), response.headers(), responseBody);

      //Output values into data table
      data.OUT_RequestHeaders = JSON.stringify(reqHeaders, null, 2);
      data.OUT_RequestBody = JSON.stringify(responseBody, null, 2);
      data.OUT_ResponseHeaders = JSON.stringify(response.headers(), null, 2);
      data.OUT_ResponseBody = XLutil.truncateForExcel(JSON.stringify(responseBody, null, 2));

      //attaching first the generated runtime data table file before assertions
      await XLutil.generateAndAttachExcelResults(data.TC_ID, data, testInfo);

      //validation of response code
      expect.soft(String(data.ExpectedStatus).trim()).toContain(String(response.status()).trim());
    });
  }
});