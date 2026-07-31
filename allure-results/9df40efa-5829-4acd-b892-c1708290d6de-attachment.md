# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: SBBankList.spec.ts >> Sandbox - Bank List API Test Suite >> TS-EB-SB-PRODUCTS-0090: Send Funds via Local Fund Transfer v1.0 _Get Supported Banks and Wallets API_Verify when the “Transfer Network” (channel) is set to Instapay, the API returns only Financial Institutions that support Instapay transfers
- Location: tests\SBBankList.spec.ts:13:9

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "400"
Received string:    "200"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import env from '../config/envi.constants.json';
  3  | import * as XLutil from '../utils/excelUtil';
  4  | import * as util from '../utils/common';
  5  | 
  6  | const apiTest = env.Sandbox;
  7  | 
  8  | //Passed the worksheet related to the test to get the data set
  9  | const testData: any[] = XLutil.getExcelData('SBBankList');
  10 | 
  11 | test.describe('Sandbox - Bank List API Test Suite', { tag: ['@Sandbox', '@Regression', '@BankList'] }, () => {
  12 |   for (const data of testData) {
  13 |     test(`${data.Description}`, async ({ request }, testInfo) => {
  14 | 
  15 |       util.skipIfNotExecutable(data.ExecutionFlag);
  16 | 
  17 |       const reqHeaders = {
  18 |         'api-key': String(data.IN_HeadAPIKey).trim(),
  19 |         'partner-id': String(data.IN_HeadPartnerID).trim(),
  20 |         'x-correlation-id': String(data.IN_HeadCorrelationID).trim()
  21 |       };
  22 | 
  23 |       const params = {
  24 |         'channel': String(data.In_Channel).trim()
  25 |       };
  26 | 
  27 |       const response = await request.get(
  28 |         `${apiTest}${data.IN_EndPoint}`,
  29 |         {
  30 |           headers: reqHeaders,
  31 |           params,
  32 |         }
  33 |       );
  34 | 
  35 |       const responseHeaders = response.headers();
  36 | 
  37 |       //Use to check the response if it is a json response or http error
  38 |       let responseBody;
  39 |       try {
  40 |         responseBody = await response.json();
  41 |       } catch {
  42 |         responseBody = await response.text();
  43 |       }
  44 | 
  45 |       util.logRequest(apiTest, data.IN_EndPoint, reqHeaders, params, null);
  46 |       util.logResponse(data.ExpectedStatus, response.status(), responseHeaders, responseBody);
  47 | 
  48 |       data.OUT_RequestHeaders = JSON.stringify(reqHeaders, null, 2);
  49 |       data.OUT_RequestBody = JSON.stringify(responseBody, null, 2);
  50 |       data.OUT_ResponseHeaders = JSON.stringify(responseHeaders, null, 2);
  51 |       data.OUT_ResponseBody = JSON.stringify(responseBody, null, 2);
  52 | 
  53 |       //attaching first the file before assertions
  54 |       await XLutil.generateAndAttachExcelResults(data.TC_ID, data, testInfo);
  55 | 
  56 |       //validation of response code
> 57 |       expect(String(data.ExpectedStatus).trim()).toContain(String(response.status()).trim());
     |                                                  ^ Error: expect(received).toContain(expected) // indexOf
  58 |     });
  59 |   }
  60 | });
```