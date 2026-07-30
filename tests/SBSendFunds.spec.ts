import { test, expect, request as playwrightRequest } from '@playwright/test';
import env from '../config/envi.constants.json';
import * as XLutil from '../utils/excelUtil';
import * as util from '../utils/common';

const apiTest = env.Sandbox;

// Worksheet name
const testData: any[] = XLutil.getExcelData('SBSendFunds');

let bearerToken: string;
let tokenToUse: string;

test.beforeAll(async () => {
    await util.clearTestResults();
});

test.describe('Sandbox - SendFunds Test Suite', {tag: ['@Sandbox', '@Regression', '@SendFunds']},() => {
    
    for (const data of testData) {

        test(`${data.Description}`, async ({ request }, testInfo) => {

            //Use for generating 1 bearer token to be used for all test runs
            util.skipIfNotExecutable(data.ExecutionFlag);

            const apiContext = await playwrightRequest.newContext();

            bearerToken = await util.getBearerToken(apiContext, apiTest, data.IN_EndPointBearer, data.IN_HeadAccept, data.IN_HeadClientID, data.IN_HeadAPIKey,
                data.IN_HeadClientSecret,
                data.IN_HeadPartnerID,
                data.IN_HeadContentType,
                data.IN_SourceAccountNumber,
                data.IN_Scope
            );

            await apiContext.dispose();

            if (data.IN_ExpiredToken === null || data.IN_ExpiredToken === undefined) {
                tokenToUse = bearerToken;
            } else {
                tokenToUse = data.IN_ExpiredToken;
            }
            console.log('Token to use:', tokenToUse);

            const reqHeaders = {
                Authorization: String(tokenToUse).trim(),
                'Content-Type': String(data.IN_HeadContentType).trim(),
                'api-key': String(data.IN_HeadAPIKey).trim(),
                'idempotency-key': String(util.rndValue('Number', 13)).trim(),
                'partner-id': String(data.IN_HeadPartnerID).trim(),
                'x-correlation-id': String(data.IN_HeadCorrelationID).trim(),
            };

            const body = {
                channel: String(data.IN_Channel).trim(),

                sender: {
                    sourceAccountNumber: String(data.IN_SourceAccountNumber).trim(),
                    ultimateSenderName: String(data.IN_UltimateSenderName).trim(),
                },

                beneficiary: {
                    bankCode: String(data.IN_BankCode).trim(),
                    targetAccountNumber: String(data.IN_TargetAccountNumber).trim(),
                    ultimateBeneficiaryName: String(data.IN_UltimateBeneficiaryName).trim(),
                },

                transfer: {
                    amount: Number(data.IN_Amount),
                },

                meta: {
                    ipAddress: String(data.IN_IPAddress).trim(),
                    geoLatitude: String(data.IN_GeoLatitude).trim(),
                    geoLongitude: String(data.IN_GeoLongitude).trim(),
                    deviceId: String(data.IN_DeviceId).trim(),
                    userAgent: String(data.IN_UserAgent).trim(),
                    country: String(data.IN_Country).trim(),
                    applicationType: String(data.IN_ApplicationType).trim(),
                    ipCity: String(data.IN_IPCity).trim(),
                },
            };

            //Trigger the api call for POST
            const response = await request.post(
                `${apiTest}${data.IN_EndPoint}`,
                {
                    headers: reqHeaders,
                    data: body,
                }
            );

            const responseHeaders = response.headers();
            let responseBody: any;
            try {
                responseBody = await response.json();
            } catch {
                responseBody = await response.text();
            }

            util.logRequest(apiTest, data.IN_EndPoint, reqHeaders, null, body);
            util.logResponse(data.ExpectedStatus, response.status(), responseHeaders, responseBody)
            util.logTransaction(responseBody.apiTxnId, responseBody.apiTxnRef);

            data.OUT_TxnID = responseBody.apiTxnId;
            data.OUT_TxnRef = responseBody.apiTxnRef;
            data.OUT_RequestHeaders = JSON.stringify(reqHeaders, null, 2);
            data.OUT_RequestBody = JSON.stringify(body, null, 2);
            data.OUT_ResponseHeaders = JSON.stringify(responseHeaders, null, 2);
            data.OUT_ResponseBody = JSON.stringify(responseBody, null, 2);

            //validation of response code
            expect.soft(String(data.ExpectedStatus).trim()).toContain(String(response.status()).trim());

            await XLutil.generateAndAttachExcelResults('SBSendFunds', testData, testInfo);
        });
    }

});

