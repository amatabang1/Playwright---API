import { test, expect } from '@playwright/test';
import env from '../config/envi.constants.json';
import * as XLutil from '../utils/excelUtil';
import * as util from '../utils/common';

const testBed = env.TestData;
const apiEnvi = env.TestBase;

//Passed the worksheet related to the test to get the data set
const testData: any[] = XLutil.getExcelData(testBed,'PTTAuthAPI');

test.describe('Promote to Test - Auth API Test Suite', { tag: ['@PTTest', '@Regression', '@AuthAPI'] }, () => {
  for (const data of testData) {
    test(`${data.Description}`, async ({ request }, testInfo) => {

      //Check for skip test - Execution Flag
      util.skipIfNotExecutable(data.ExecutionFlag);

      //*****************************API CALL CONSTRUCTOR**************************************** */
      //Constructor for request headers
      const reqHeaders = {
        Accept: String(data.IN_HeadAccept).trim(),
        'client-id': String(data.IN_HeadClientID).trim(),
        'api-key': String(data.IN_HeadAPIKey).trim(),
        'client-secret': String(data.IN_HeadClientSecret).trim(),
        'partner-id': String(data.IN_HeadPartnerID).trim(),
        'Content-Type': String(data.IN_HeadContentType).trim(),
      };
      //Constructor for request body
      const body = {
        accountNumber: String(data.IN_AccountNumber).trim(),
        scope: String(data.IN_Scope).trim(),
      };
      //*****************************API CALL CONSTRUCTOR**************************************** */

      //Trigger the api call for POST
      const response = await request.post(
        `${apiEnvi}${data.IN_EndPoint}`,
        {
          headers: reqHeaders,
          data: JSON.stringify(body),
        }
      );

      //Checker for response type
      let responseBody;
      try {
        responseBody = await response.json();
      } catch {
        responseBody = await response.text();
      }

      //Log API request and response
      util.logRequest(apiEnvi, data.IN_EndPoint, reqHeaders, null, body);
      util.logResponse(data.ExpectedStatus, response.status(), response.headers(), responseBody);

      //Output values into data table
      data.OUT_RequestHeaders = JSON.stringify(reqHeaders, null, 2);
      data.OUT_RequestBody = JSON.stringify(body, null, 2);
      data.OUT_ResponseHeaders = JSON.stringify(response.headers(), null, 2);
      data.OUT_ResponseBody = XLutil.truncateForExcel(JSON.stringify(responseBody, null, 2));

      //Attaching first the generated runtime data table file before assertions
      await XLutil.generateAndAttachExcelResults(data.TC_ID, data, testInfo);

      //Validation of response code
      expect.soft(String(response.status()).trim()).toBe(String(data.ExpectedStatus).trim());

      //Validation of response description if not 200
      if (response.status() !== 200) {
        let actualDescription = "";
        if (responseBody && typeof responseBody === "object" && responseBody.responseDescription) {
          actualDescription = String(responseBody.responseDescription).trim();
        } else {
          const responseText = await response.text();
          const titleMatch = responseText.match(/<title>(.*?)<\/title>/is);
          actualDescription = titleMatch?.[1]?.trim() || "";
        }
        expect.soft(actualDescription).toBe(String(data.ExpectedResponseDescription || "").trim()
        );
      }
    });
  }
});