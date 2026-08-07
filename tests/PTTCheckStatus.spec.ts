import { test, expect } from '@playwright/test';
import env from '../config/envi.constants.json';
import * as XLutil from '../utils/excelUtil';
import * as util from '../utils/common';

const apiEnv = env.TestBase;

// Passed the worksheet related to the test to get the data set
const testData: any[] = XLutil.getExcelData('PTTCheckStatus');

test.describe('Promote to Test - Check Status API Test Suite', { tag: ['@PTTest', '@Regression', '@CheckStatus'] }, () => {
  for (const data of testData) {
    test(`${data.Description}`, async ({ request }, testInfo) => {

      //Check for skip test - Execution Flag
      util.skipIfNotExecutable(data.ExecutionFlag);

      //*****************************API CALL CONSTRUCTOR**************************************** */
      //Constructor for request headers
      const reqHeaders = {
        'api-key': String(data.IN_HeadAPIKey).trim(),
        'partner-id': String(data.IN_HeadPartnerID).trim(),
        'content-type': String(data.IN_HeadContentType).trim(),
      };
      //Constructor for request params
      const params = {
        ...(data?.IN_ParamAPITxnID != null && {
          apiTxnId: String(data.IN_ParamAPITxnID).trim(),
        }),
        ...(data?.IN_ParamAPITxnRef != null && {
          apiTxnRef: String(data.IN_ParamAPITxnRef).trim(),
        }),
        ...(data?.IN_ParamIdempotencyKey != null && {
          idempotencyKey: String(data.IN_ParamIdempotencyKey).trim(),
        }),
      };
      //*****************************API CALL CONSTRUCTOR**************************************** */

      //Trigger the api call for GET
      const response = await request.get(
        `${apiEnv}${data.IN_EndPoint}`, {
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
      util.logRequest(apiEnv, data.IN_EndPoint, reqHeaders, params, null);
      util.logResponse(data.ExpectedStatus, response.status(), response.headers(), responseBody);

      //Output values into data table
      data.OUT_RequestHeaders = JSON.stringify(reqHeaders, null, 2);
      data.OUT_RequestBody = JSON.stringify(params, null, 2);
      data.OUT_ResponseHeaders = JSON.stringify(response.headers(), null, 2);
      data.OUT_ResponseBody = XLutil.truncateForExcel(JSON.stringify(responseBody, null, 2));

      //attaching first the generated runtime data table file before assertions
      await XLutil.generateAndAttachExcelResults(data.TC_ID, data, testInfo);

      //validation of response code
      expect.soft(String(data.ExpectedStatus).trim()).toContain(String(response.status()).trim());
    });
  }
});