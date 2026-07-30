import { test, APIRequestContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export function skipIfNotExecutable(executionFlag: string): void {
  test.skip(
    String(executionFlag).trim().toUpperCase() !== 'Y',
    `ExecutionFlag is '${executionFlag}'. Test skipped.`
  );
}

/**
 * Generates random data based on type and length.
 *
 * @param dataType - "String" | "Number"
 * @param length - Number of characters/digits
 * @returns Generated value
 */
export function rndValue(dataType: "String" | "Number", length: number):
  string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  switch (dataType) {
    case "String":
      return Array.from({ length }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join("");

    case "Number":
      return Array.from({ length }, () =>
        Math.floor(Math.random() * 10)
      ).join("");

    default:
      throw new Error(`Unsupported data type: ${dataType}`);
  }
}

export function rndIndepotency(charLength: number): string {
  return rndValue("Number", charLength);
}

export async function getBearerToken(
  request: APIRequestContext,
  vEnvi: string,
  vEndPt: string,
  vAccept: string,
  vClientID: string,
  vAPIKey: string,
  vClientSecret: string,
  vPartnerID: string,
  vContentType: string,
  vAcctNum: string,
  vScope: string
): Promise<string> {
  const reqHeaders = {
    accept: vAccept.trim(),
    'client-id': vClientID.trim(),
    'api-key': vAPIKey.trim(),
    'client-secret': vClientSecret.trim(),
    'partner-id': vPartnerID.trim(),
    'Content-Type': vContentType.trim(),
  };

  const requestBody = {
    accountNumber: vAcctNum.trim(),
    scope: vScope.trim(),
  };

  console.log('================ GENERATE BEARER TOKEN ================');
  // console.log('Endpoint:', `${vEnvi}${vEndPt}`);
  // console.log('Headers:', JSON.stringify(reqHeaders, null, 2));
  // console.log('Body:', JSON.stringify(requestBody, null, 2));

  const response = await request.post(`${vEnvi}${vEndPt}`, {
    headers: reqHeaders,
    data: JSON.stringify({
      accountNumber: vAcctNum.trim(),
      scope: vScope.trim(),
    }),
  });

  const responseHeaders = response.headers();

  let responseBody: any;

  try {
    responseBody = await response.json();
  } catch {
    responseBody = await response.text();
  }

  if (!response.ok()) {
    throw new Error(
      `Token request failed. Status: ${response.status()} Response: ${JSON.stringify(responseBody)}`
    );
  }

  const accessToken = responseBody?.accessToken;

  if (!accessToken) {
    throw new Error(
      `access_token not found in response: ${JSON.stringify(responseBody)}`
    );
  }

  console.log('Access Token:', accessToken);

  return accessToken;
}

export function logRequest( apiBaseUrl: any,endpoint: any, headers: any, params: any, body: any) {
  console.log('================ REQUEST ================');
  console.log('Endpoint:', `${apiBaseUrl}${endpoint}`);
  console.log('Headers:', JSON.stringify(headers, null, 2));
  if (params !== null){
    console.log('params:', JSON.stringify(params, null, 2));
  }
  if (body !== null){
    console.log('params:', JSON.stringify(body, null, 2));
  }
}

export function logResponse(expectedStatus: any, response: any, responseHeaders: any, responseBody: any) {
  console.log('================ RESPONSE ================');
  console.log('Expected Status:', expectedStatus);
  console.log('Received Status:', response);
  console.log('Headers:', JSON.stringify(responseHeaders, null, 2));
  console.log('Body:', JSON.stringify(responseBody, null, 2));
}

export function logTransaction(txnID: any, txnRef: any) {
  console.log('================ TRANSACTION ================');
  console.log('Stored TxnID:', txnID);
  console.log('Stored TxnRef:', txnRef);
}

// export function clearTestResults(): void {
//     const resultsDir = path.join(process.cwd(), 'test-results');

//     if (fs.existsSync(resultsDir)) {
//         for (const item of fs.readdirSync(resultsDir)) {
//             fs.rmSync(path.join(resultsDir, item), {
//                 recursive: true,
//                 force: true,
//             });
//         }
//     }

//     console.log(`Cleared contents of: ${resultsDir}`);
    
// }

export function clearTestResults(): void {
    const dirsToClean = [
        'test-results',
        'allure-results',
        'allure-report',
    ];

    for (const dir of dirsToClean) {
        const targetDir = path.join(process.cwd(), dir);

        if (fs.existsSync(targetDir)) {
            for (const item of fs.readdirSync(targetDir)) {
                fs.rmSync(path.join(targetDir, item), {
                    recursive: true,
                    force: true,
                });
            }
        }

        console.log(`Cleared contents of: ${targetDir}`);
    }
}