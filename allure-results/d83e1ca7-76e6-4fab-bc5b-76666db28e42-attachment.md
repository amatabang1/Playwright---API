# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PTTSendFunds.spec.ts >> Promote To Test - SendFunds Test Suite >> TS-EB-SB-PRODUCTS-0008-Verify Successful initiation of a Local funds transfer via Intrabank (EWB to EWB)
- Location: tests\PTTSendFunds.spec.ts:22:13

# Error details

```
Error: apiRequestContext.post: getaddrinfo ENOTFOUND proxy-apim-external-test.eastwestbanker.com
Call log:
  - → POST https://proxy-apim-external-test.eastwestbanker.com/test/auth/token/v1/generate
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.7922.34 Safari/537.36
    - accept: application/json
    - accept-encoding: gzip,deflate,br
    - client-id: 3TaenF9h5d9FCEEIZRVPc4AxdFggPaxA
    - api-key: K6y28Ks1TyrwjONU0PatZ6BhOWfTAuHo
    - client-secret: wE4n0CYiVOdJ9m8EfKuMhxm0m4kOaUOr
    - partner-id: 263677df68
    - Content-Type: application/json
    - content-length: 62

```

# Test source

```ts
  1   | import { test, APIRequestContext } from '@playwright/test';
  2   | import fs from 'fs';
  3   | import path from 'path';
  4   | 
  5   | export function skipIfNotExecutable(executionFlag: string): void {
  6   |   test.skip(
  7   |     String(executionFlag).trim().toUpperCase() !== 'Y',
  8   |     `ExecutionFlag is '${executionFlag}'. Test skipped.`
  9   |   );
  10  | }
  11  | 
  12  | /**
  13  |  * Generates random data based on type and length.
  14  |  *
  15  |  * @param dataType - "String" | "Number"
  16  |  * @param length - Number of characters/digits
  17  |  * @returns Generated value
  18  |  */
  19  | export function rndValue(dataType: "String" | "Number", length: number):
  20  |   string {
  21  |   const chars =
  22  |     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  23  | 
  24  |   switch (dataType) {
  25  |     case "String":
  26  |       return Array.from({ length }, () =>
  27  |         chars.charAt(Math.floor(Math.random() * chars.length))
  28  |       ).join("");
  29  | 
  30  |     case "Number":
  31  |       return Array.from({ length }, () =>
  32  |         Math.floor(Math.random() * 10)
  33  |       ).join("");
  34  | 
  35  |     default:
  36  |       throw new Error(`Unsupported data type: ${dataType}`);
  37  |   }
  38  | }
  39  | 
  40  | export function rndIndepotency(charLength: number): string {
  41  |   return rndValue("Number", charLength);
  42  | }
  43  | 
  44  | export async function getBearerToken(
  45  |   request: APIRequestContext,
  46  |   vEnvi: string,
  47  |   vEndPt: string,
  48  |   vAccept: string,
  49  |   vClientID: string,
  50  |   vAPIKey: string,
  51  |   vClientSecret: string,
  52  |   vPartnerID: string,
  53  |   vContentType: string,
  54  |   vAcctNum: string,
  55  |   vScope: string
  56  | ): Promise<string> {
  57  |   const reqHeaders = {
  58  |     accept: vAccept.trim(),
  59  |     'client-id': vClientID.trim(),
  60  |     'api-key': vAPIKey.trim(),
  61  |     'client-secret': vClientSecret.trim(),
  62  |     'partner-id': vPartnerID.trim(),
  63  |     'Content-Type': vContentType.trim(),
  64  |   };
  65  | 
  66  |   const requestBody = {
  67  |     accountNumber: vAcctNum.trim(),
  68  |     scope: vScope.trim(),
  69  |   };
  70  | 
  71  |   console.log('================ GENERATE BEARER TOKEN ================');
  72  |   // console.log('Endpoint:', `${vEnvi}${vEndPt}`);
  73  |   // console.log('Headers:', JSON.stringify(reqHeaders, null, 2));
  74  |   // console.log('Body:', JSON.stringify(requestBody, null, 2));
  75  | 
> 76  |   const response = await request.post(`${vEnvi}${vEndPt}`, {
      |                                  ^ Error: apiRequestContext.post: getaddrinfo ENOTFOUND proxy-apim-external-test.eastwestbanker.com
  77  |     headers: reqHeaders,
  78  |     data: JSON.stringify({
  79  |       accountNumber: vAcctNum.trim(),
  80  |       scope: vScope.trim(),
  81  |     }),
  82  |   });
  83  | 
  84  |   const responseHeaders = response.headers();
  85  | 
  86  |   let responseBody: any;
  87  | 
  88  |   try {
  89  |     responseBody = await response.json();
  90  |   } catch {
  91  |     responseBody = await response.text();
  92  |   }
  93  | 
  94  |   if (!response.ok()) {
  95  |     throw new Error(
  96  |       `Token request failed. Status: ${response.status()} Response: ${JSON.stringify(responseBody)}`
  97  |     );
  98  |   }
  99  | 
  100 |   const accessToken = responseBody?.accessToken;
  101 | 
  102 |   if (!accessToken) {
  103 |     throw new Error(
  104 |       `access_token not found in response: ${JSON.stringify(responseBody)}`
  105 |     );
  106 |   }
  107 | 
  108 |   console.log('Access Token:', accessToken);
  109 | 
  110 |   return accessToken;
  111 | }
  112 | 
  113 | export function logRequest( apiBaseUrl: any,endpoint: any, headers: any, params: any, body: any) {
  114 |   console.log('================ REQUEST ================');
  115 |   console.log('Endpoint:', `${apiBaseUrl}${endpoint}`);
  116 |   console.log('Headers:', JSON.stringify(headers, null, 2));
  117 |   if (params !== null){
  118 |     console.log('params:', JSON.stringify(params, null, 2));
  119 |   }
  120 |   if (body !== null){
  121 |     console.log('params:', JSON.stringify(body, null, 2));
  122 |   }
  123 | }
  124 | 
  125 | export function logResponse(expectedStatus: any, response: any, responseHeaders: any, responseBody: any) {
  126 |   console.log('================ RESPONSE ================');
  127 |   console.log('Expected Status:', expectedStatus);
  128 |   console.log('Received Status:', response);
  129 |   console.log('Headers:', JSON.stringify(responseHeaders, null, 2));
  130 |   console.log('Body:', JSON.stringify(responseBody, null, 2));
  131 | }
  132 | 
  133 | export function logTransaction(txnID: any, txnRef: any) {
  134 |   console.log('================ TRANSACTION ================');
  135 |   console.log('Stored TxnID:', txnID);
  136 |   console.log('Stored TxnRef:', txnRef);
  137 | }
  138 | 
  139 | // export function clearTestResults(): void {
  140 | //     const resultsDir = path.join(process.cwd(), 'test-results');
  141 | 
  142 | //     if (fs.existsSync(resultsDir)) {
  143 | //         for (const item of fs.readdirSync(resultsDir)) {
  144 | //             fs.rmSync(path.join(resultsDir, item), {
  145 | //                 recursive: true,
  146 | //                 force: true,
  147 | //             });
  148 | //         }
  149 | //     }
  150 | 
  151 | //     console.log(`Cleared contents of: ${resultsDir}`);
  152 |     
  153 | // }
  154 | 
  155 | export function clearTestResults(): void {
  156 |     const dirsToClean = [
  157 |         'test-results',
  158 |         'allure-results',
  159 |         'allure-report',
  160 |     ];
  161 | 
  162 |     for (const dir of dirsToClean) {
  163 |         const targetDir = path.join(process.cwd(), dir);
  164 | 
  165 |         if (fs.existsSync(targetDir)) {
  166 |             for (const item of fs.readdirSync(targetDir)) {
  167 |                 fs.rmSync(path.join(targetDir, item), {
  168 |                     recursive: true,
  169 |                     force: true,
  170 |                 });
  171 |             }
  172 |         }
  173 | 
  174 |         console.log(`Cleared contents of: ${targetDir}`);
  175 |     }
  176 | }
```