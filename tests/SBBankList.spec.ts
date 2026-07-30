import { test, expect } from '@playwright/test';
import env from '../config/envi.constants.json';
import * as XLutil from '../utils/excelUtil';
import * as util from '../utils/common';

const apiTest = env.Sandbox;

//Passed the worksheet related to the test to get the data set
const testData: any[] = XLutil.getExcelData('SBBankList');

test.beforeAll(async () => {
  await util.clearTestResults();
});

test.describe('Sandbox - Bank List API Test Suite', { tag: ['@Sandbox', '@Regression', '@BankList'] }, () => {
  for (const data of testData) {
    test(`${data.Description}`, async ({ request }, testInfo) => {

      util.skipIfNotExecutable(data.ExecutionFlag);

      const reqHeaders = {
        'api-key': String(data.IN_HeadAPIKey).trim(),
        'partner-id': String(data.IN_HeadPartnerID).trim(),
        'x-correlation-id': String(data.IN_HeadCorrelationID).trim()
      };

      const params = {
        'channel': String(data.In_Channel).trim()
      };

      const response = await request.get(
        `${apiTest}${data.IN_EndPoint}`,
        {
          headers: reqHeaders,
          params,
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

      util.logRequest(apiTest, data.IN_EndPoint, reqHeaders, params, null);
      util.logResponse(data.ExpectedStatus, response.status(), responseHeaders, responseBody);

      data.OUT_RequestHeaders = JSON.stringify(reqHeaders, null, 2);
      data.OUT_RequestBody = JSON.stringify(responseBody, null, 2);
      data.OUT_ResponseHeaders = JSON.stringify(responseHeaders, null, 2);
      data.OUT_ResponseBody = JSON.stringify(responseBody, null, 2);

      //validation of response code
      expect(String(data.ExpectedStatus).trim()).toContain(String(response.status()).trim());

      await XLutil.generateAndAttachExcelResults('SBBankList', testData, testInfo);
    });
  }
});