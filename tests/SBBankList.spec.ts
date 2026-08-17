import { test, expect } from '@playwright/test';
import env from '../config/envi.constants.json';
import * as XLutil from '../utils/excelUtil';
import * as util from '../utils/common';

const testBed = env.TestData;
const apiEnvi = env.Sandbox;

//Passed the worksheet related to the test to get the data set
const testData: any[] = XLutil.getExcelData(testBed,'SBBankList');

test.describe('Sandbox - Bank List API Test Suite', { tag: ['@Sandbox', '@Regression', '@BankList'] }, () => {
  for (const data of testData) {
    test(`${data.Description}`, async ({ request }, testInfo) => {
      testInfo.annotations.push({
        type: 'AzureTestCase',
        description: String(data.TC_ID)
      });

      //Check for skip test - Execution Flag
      util.skipIfNotExecutable(data.ExecutionFlag);

      //*****************************API CALL CONSTRUCTOR**************************************** */
      //Constructor for request headers
      const reqHeaders = {
        'api-key': String(data.IN_HeadAPIKey).trim(),
        'partner-id': String(data.IN_HeadPartnerID).trim(),
        'x-correlation-id': String(data.IN_HeadCorrelationID).trim()
      };
      //Constructor for request params
      const params = {
        ...(data?.IN_ParamChannel != null && {
          channel: String(data.IN_ParamChannel).trim(),
        })
      };
      //*****************************API CALL CONSTRUCTOR**************************************** */

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
      data.OUT_RequestBody = JSON.stringify(params, null, 2);
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