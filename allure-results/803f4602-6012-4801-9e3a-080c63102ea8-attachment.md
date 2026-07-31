# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: SBBankList.spec.ts >> Sandbox - Bank List API Test Suite >> TS-EB-SB-PRODUCTS-0100: Send Funds via Local Fund Transfer v1.0_Get Supported Banks and Wallets API_Verify response processsing time of successful GET request of Get Supported Banks and Wallets API
- Location: tests\SBBankList.spec.ts:13:9

# Error details

```
Error: Text length must not exceed 32767 characters
```

# Test source

```ts
  1  | import * as XLSX from 'xlsx';
  2  | import * as fs from 'fs';
  3  | import { TestInfo } from '@playwright/test';
  4  | 
  5  | const FILE_PATH = './testdata/EBAPI.xlsx';
  6  | 
  7  | //get excel details
  8  | export function getExcelData(sheetName: string) {
  9  |     const workbook = XLSX.readFile(FILE_PATH);
  10 |     const worksheet = workbook.Sheets[sheetName];
  11 | 
  12 |     return XLSX.utils.sheet_to_json(worksheet);
  13 | }
  14 | 
  15 | //create excel for test results
  16 | export async function writeExcelResults(
  17 |     sheetName: string,
  18 |     data: any[],
  19 |     outputFile: string
  20 | ) {
  21 |     fs.mkdirSync('./test-results', { recursive: true });
  22 | 
  23 |     const workbook = XLSX.utils.book_new();
  24 |     const worksheet = XLSX.utils.json_to_sheet(data);
  25 | 
  26 |     XLSX.utils.book_append_sheet(
  27 |         workbook,
  28 |         worksheet,
  29 |         sheetName
  30 |     );
  31 | 
  32 |     // XLSX.writeFile(workbook, outputFile);
> 33 |     const buffer = XLSX.write(workbook, {
     |                         ^ Error: Text length must not exceed 32767 characters
  34 |     type: 'buffer',
  35 |     bookType: 'xlsx'
  36 | });
  37 | 
  38 | fs.writeFileSync(outputFile, buffer);
  39 | }
  40 | 
  41 | //Use to generate an excel based on runtime data and attach to each test
  42 | export async function generateAndAttachExcelResults(
  43 |     sheetName: string,
  44 |     currentRow: any,
  45 |     testInfo: TestInfo
  46 | ): Promise<void> {
  47 | const timestamp = Date.now();
  48 | let outputFile: any="";
  49 | outputFile = testInfo.outputPath(`${sheetName}_${timestamp}.xlsx`);
  50 | 
  51 |     await writeExcelResults(
  52 |         sheetName,
  53 |         [currentRow], // single runtime row
  54 |         outputFile
  55 |     );
  56 | 
  57 |     await testInfo.attach(
  58 |     `${sheetName}_${timestamp}.xlsx`,
  59 |     {
  60 |         path: outputFile,
  61 |         contentType:
  62 |             'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  63 |     }
  64 | );
  65 | }
```