import { test, expect, request as playwrightRequest } from '@playwright/test';
import env from '../config/envi.constants.json';
import * as XLutil from '../utils/excelUtil';
import * as util from '../utils/common';

const apiEnvi = env.TestBase;

// Get test data for specified sheet
const testData: any[] = XLutil.getExcelData('PTTSendFunds');

let bearerToken: string;
let tokenToUse: string;

test.describe('Promote To Test - SendFunds Test Suite', { tag: ['@PTTest', '@Regression', '@SendFunds'] }, () => {

    for (const data of testData) {

        test(`${data.Description}`, async ({ request }, testInfo) => {

            //Check for skip test - Execution Flag
            util.skipIfNotExecutable(data.ExecutionFlag);

            //Generate bearer token
            const apiContext = await playwrightRequest.newContext();
            bearerToken = await util.getBearerToken(apiContext, apiEnvi, data.IN_EndPointBearer, data.IN_HeadAccept, data.IN_HeadClientID, data.IN_HeadAPIKey,
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

            //*****************************API CALL CONSTRUCTOR**************************************** */
            const reqHeaders = {
                Authorization: String(tokenToUse).trim(),
                'Content-Type': String(data.IN_HeadContentType).trim(),
                'api-key': String(data.IN_HeadAPIKey).trim(),
                'idempotency-key': String(util.rndValue('Number', 13)).trim(),
                'partner-id': String(data.IN_HeadPartnerID).trim(),
                'x-correlation-id': String(data.IN_HeadCorrelationID).trim(),
            };
            //Constructor for request body
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
            //*****************************API CALL CONSTRUCTOR**************************************** */

            //Trigger the api call for POST
            const response = await request.post(
                `${apiEnvi}${data.IN_EndPoint}`,
                {
                    headers: reqHeaders,
                    data: body,
                }
            );

            //Checker for response type
            let responseBody: any;
            try {
                responseBody = await response.json();
            } catch {
                responseBody = await response.text();
            }

            //Log API request and response
            util.logRequest(apiEnvi, data.IN_EndPoint, reqHeaders, null, body);
            util.logResponse(data.ExpectedStatus, response.status(), response.headers(), responseBody)
            util.logTransaction(responseBody.apiTxnId, responseBody.apiTxnRef);

            //Output values into data table
            data.OUT_TxnID = responseBody.apiTxnId;
            data.OUT_TxnRef = responseBody.apiTxnRef;
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