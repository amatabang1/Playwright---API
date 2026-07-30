import { test, expect } from '@playwright/test';
import env from '../config/envi.constants.json';
import * as XLutil from '../utils/excelUtil';
import * as util from '../utils/common';

const apiTest = env.TestBase;

//Passed the worksheet related to the test to get the data set
const testData: any[] = XLutil.getExcelData('PTTAuthAPI');

test.beforeAll(async () => {
  await util.clearTestResults();
});

test.describe('Promote to Test - Auth API Test Suite', { tag: ['@PTTest', '@Regression', '@AuthAPI'] }, () => {
  for (const data of testData) {
    test(`${data.Description}`, async ({ request }, testInfo) => {

      util.skipIfNotExecutable(data.ExecutionFlag);

      const reqHeaders = {
        Accept: String(data.IN_HeadAccept).trim(),
        'client-id': String(data.IN_HeadClientID).trim(),
        'api-key': String(data.IN_HeadAPIKey).trim(),
        'client-secret': String(data.IN_HeadClientSecret).trim(),
        'partner-id': String(data.IN_HeadPartnerID).trim(),
        'Content-Type': String(data.IN_HeadContentType).trim(),
      };

      const body = {
        accountNumber: String(data.IN_AccountNumber).trim(),
        scope: String(data.IN_Scope).trim(),
      };

      //Trigger the api call for POST
      const response = await request.post(
        `${apiTest}${data.IN_EndPoint}`,
        {
          headers: reqHeaders,
          form: body,
        }
      );

      const responseHeaders = response.headers();

      //Use to check the response if it is a json response or http error
      let responseBody;
      try {
        responseBody = await response.json();
      } catch {
        responseBody = await response.text();
      }

      util.logRequest(apiTest, data.IN_EndPoint, reqHeaders, null, body);
      util.logResponse(data.ExpectedStatus, response.status(), responseHeaders, responseBody);

      data.OUT_RequestHeaders = JSON.stringify(reqHeaders, null, 2);
      data.OUT_RequestBody = JSON.stringify(body, null, 2);
      data.OUT_ResponseHeaders = JSON.stringify(responseHeaders, null, 2);
      data.OUT_ResponseBody = JSON.stringify(responseBody, null, 2);

      expect(String(data.ExpectedStatus).trim()).toContain(String(response.status()).trim());

      await XLutil.generateAndAttachExcelResults('PTTAuthAPI', testData, testInfo);
    });
  }
});