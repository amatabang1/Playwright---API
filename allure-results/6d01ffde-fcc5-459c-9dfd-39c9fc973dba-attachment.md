# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: SBSendFunds.spec.ts >> Sandbox - SendFunds Test Suite >> TS-EB-SB-PRODUCTS-0008-Verify Successful initiation of a Local funds transfer via Intrabank (EWB to EWB)
- Location: tests\SBSendFunds.spec.ts:18:13

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "404"
Received string:    "200"
```

# Test source

```ts
  16  |     for (const data of testData) {
  17  | 
  18  |         test(`${data.Description}`, async ({ request }, testInfo) => {
  19  | 
  20  |             //Check for skip test - Execution Flag
  21  |             util.skipIfNotExecutable(data.ExecutionFlag);
  22  | 
  23  |             //Generate bearer token
  24  |             const apiContext = await playwrightRequest.newContext();
  25  |             bearerToken = await util.getBearerToken(apiContext, apiEnvi, data.IN_EndPointBearer, data.IN_HeadAccept, data.IN_HeadClientID, data.IN_HeadAPIKey,
  26  |                 data.IN_HeadClientSecret,
  27  |                 data.IN_HeadPartnerID,
  28  |                 data.IN_HeadContentType,
  29  |                 data.IN_SourceAccountNumber,
  30  |                 data.IN_Scope
  31  |             );
  32  |             await apiContext.dispose();
  33  | 
  34  |             if (data.IN_ExpiredToken === null || data.IN_ExpiredToken === undefined) {
  35  |                 tokenToUse = bearerToken;
  36  |             } else {
  37  |                 tokenToUse = data.IN_ExpiredToken;
  38  |             }
  39  |             console.log('Token to use:', tokenToUse);
  40  | 
  41  |             //Constructor for request headers
  42  |             const reqHeaders = {
  43  |                 Authorization: String(tokenToUse).trim(),
  44  |                 'Content-Type': String(data.IN_HeadContentType).trim(),
  45  |                 'api-key': String(data.IN_HeadAPIKey).trim(),
  46  |                 'idempotency-key': String(util.rndValue('Number', 13)).trim(),
  47  |                 'partner-id': String(data.IN_HeadPartnerID).trim(),
  48  |                 'x-correlation-id': String(data.IN_HeadCorrelationID).trim(),
  49  |             };
  50  |             //Constructor for request body
  51  |             const body = {
  52  |                 channel: String(data.IN_Channel).trim(),
  53  | 
  54  |                 sender: {
  55  |                     sourceAccountNumber: String(data.IN_SourceAccountNumber).trim(),
  56  |                     ultimateSenderName: String(data.IN_UltimateSenderName).trim(),
  57  |                 },
  58  | 
  59  |                 beneficiary: {
  60  |                     bankCode: String(data.IN_BankCode).trim(),
  61  |                     targetAccountNumber: String(data.IN_TargetAccountNumber).trim(),
  62  |                     ultimateBeneficiaryName: String(data.IN_UltimateBeneficiaryName).trim(),
  63  |                 },
  64  | 
  65  |                 transfer: {
  66  |                     amount: Number(data.IN_Amount),
  67  |                 },
  68  | 
  69  |                 meta: {
  70  |                     ipAddress: String(data.IN_IPAddress).trim(),
  71  |                     geoLatitude: String(data.IN_GeoLatitude).trim(),
  72  |                     geoLongitude: String(data.IN_GeoLongitude).trim(),
  73  |                     deviceId: String(data.IN_DeviceId).trim(),
  74  |                     userAgent: String(data.IN_UserAgent).trim(),
  75  |                     country: String(data.IN_Country).trim(),
  76  |                     applicationType: String(data.IN_ApplicationType).trim(),
  77  |                     ipCity: String(data.IN_IPCity).trim(),
  78  |                 },
  79  |             };
  80  | 
  81  |             //Trigger the api call for POST
  82  |             const response = await request.post(
  83  |                 `${apiEnvi}${data.IN_EndPoint}`,
  84  |                 {
  85  |                     headers: reqHeaders,
  86  |                     data: body,
  87  |                 }
  88  |             );
  89  | 
  90  |             // const responseHeaders = response.headers();
  91  |             //Checker for response type
  92  |             let responseBody: any;
  93  |             try {
  94  |                 responseBody = await response.json();
  95  |             } catch {
  96  |                 responseBody = await response.text();
  97  |             }
  98  | 
  99  |             //Log requests
  100 |             util.logRequest(apiEnvi, data.IN_EndPoint, reqHeaders, null, body);
  101 |             util.logResponse(data.ExpectedStatus, response.status(), response.headers(), responseBody)
  102 |             util.logTransaction(responseBody.apiTxnId, responseBody.apiTxnRef);
  103 | 
  104 |             //Output values into data table
  105 |             data.OUT_TxnID = responseBody.apiTxnId;
  106 |             data.OUT_TxnRef = responseBody.apiTxnRef;
  107 |             data.OUT_RequestHeaders = JSON.stringify(reqHeaders, null, 2);
  108 |             data.OUT_RequestBody = JSON.stringify(body, null, 2);
  109 |             data.OUT_ResponseHeaders = JSON.stringify(response.headers(), null, 2);
  110 |             data.OUT_ResponseBody = JSON.stringify(responseBody, null, 2);
  111 | 
  112 |             //Attaching first the generated runtime data table file before assertions
  113 |             await XLutil.generateAndAttachExcelResults(data.TC_ID, data, testInfo);
  114 | 
  115 |             //Validation of response code
> 116 |             expect.soft(String(data.ExpectedStatus).trim()).toContain(String(response.status()).trim());
      |                                                             ^ Error: expect(received).toContain(expected) // indexOf
  117 |         });
  118 |     }
  119 | });
```