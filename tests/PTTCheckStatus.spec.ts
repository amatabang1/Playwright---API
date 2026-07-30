import { test, expect } from '@playwright/test';
import env from '../config/envi.constants.json';
import * as XLutil from '../utils/excelUtil';
import * as util from '../utils/common';

const apiTest = env.TestBase;

// Passed the worksheet related to the test to get the data set
const testData: any[] = XLutil.getExcelData('PTTCheckStatus');

test.beforeAll(async () => {
  await util.clearTestResults();
});

test.describe('Promote to Test - Check Status API Test Suite', { tag: ['@PTTest', '@Regression', '@CheckStatus'] }, () => {
  for (const data of testData) {
    test(`${data.Description}`, async ({ request }, testInfo) => {
      util.skipIfNotExecutable(data.ExecutionFlag);

      const reqHeaders = {
        'api-key': String(data.IN_HeadAPIKey).trim(),
        'partner-id': String(data.IN_HeadPartnerID).trim(),
        'content-type': String(data.IN_HeadContentType).trim(),
      };

      const params = {
        apiTxnId: String(data.IN_APITxnID).trim(),
        apiTxnRef: String(data.IN_APITxnRef).trim(),
      };

      const response = await request.get(
        `${apiTest}${data.IN_EndPoint}`, {
        headers: reqHeaders,
        params,
      });

      const responseHeaders = response.headers();

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

      await XLutil.generateAndAttachExcelResults('PTTCheckStatus', testData, testInfo);
    });
  }
});