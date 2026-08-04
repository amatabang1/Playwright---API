import { test, expect } from '@playwright/test';
import env from '../config/envi.constants.json';
import * as XLutil from '../utils/excelUtil';
import * as util from '../utils/common';

const apiTest = env.LiveBase;

//Passed the worksheet related to the test to get the data set
const testData: any[] = XLutil.getExcelData('PTLBankList');

test.describe('Promote To Live - Bank List API Test Suite', { tag: ['@PTLive', '@Regression', '@BankList'] }, () => {
  for (const data of testData) {
    test(`${data.Description}`, async ({ request }, testInfo) => {

      //Check for skip test - Execution Flag
      util.skipIfNotExecutable(data.ExecutionFlag);

      //Constructor for request headers
      const reqHeaders = {
        'api-key': String(data.IN_HeadAPIKey).trim(),
        'partner-id': String(data.IN_HeadPartnerID).trim(),
        'x-correlation-id': String(data.IN_HeadCorrelationID).trim()
      };
      //Constructor for request params
      const params = {
        'channel': String(data.In_Channel).trim()
      };

      //Trigger the api call for GET
      const response = await request.get(
        `${apiTest}${data.IN_EndPoint}`,
        {
          headers: reqHeaders,
          params,
        }
      );

      //Check for response type
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

      //Attaching first the generated runtime data table file before assertions
      await XLutil.generateAndAttachExcelResults(data.TC_ID, data, testInfo);

      //Validation of response code
      expect.soft(String(data.ExpectedStatus).trim()).toContain(String(response.status()).trim());
    });
  }
});