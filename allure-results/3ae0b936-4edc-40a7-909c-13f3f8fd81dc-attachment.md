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
  1   | import * as XLSX from 'xlsx';
  2   | import * as fs from 'fs';
  3   | import { TestInfo } from '@playwright/test';
  4   | 
  5   | const FILE_PATH = './testdata/EBAPI.xlsx';
  6   | 
  7   | //get excel details
  8   | export function getExcelData(sheetName: string) {
  9   |     const workbook = XLSX.readFile(FILE_PATH);
  10  |     const worksheet = workbook.Sheets[sheetName];
  11  | 
  12  |     return XLSX.utils.sheet_to_json(worksheet);
  13  | }
  14  | 
  15  | //create excel for test results
  16  | export async function writeExcelResults(
  17  |     sheetName: string,
  18  |     data: any[],
  19  |     outputFile: string
  20  | ) {
  21  |     fs.mkdirSync('./test-results', { recursive: true });
  22  | 
  23  |     const workbook = XLSX.utils.book_new();
  24  |     const worksheet = XLSX.utils.json_to_sheet(data);
  25  | 
  26  |     XLSX.utils.book_append_sheet(
  27  |         workbook,
  28  |         worksheet,
  29  |         sheetName
  30  |     );
  31  | 
  32  |     // XLSX.writeFile(workbook, outputFile);
> 33  |     const buffer = XLSX.write(workbook, {
      |                         ^ Error: Text length must not exceed 32767 characters
  34  |     type: 'buffer',
  35  |     bookType: 'xlsx'
  36  | });
  37  | 
  38  | fs.writeFileSync(outputFile, buffer);
  39  | }
  40  | 
  41  | //Use to generate an excel based on runtime data and attach to each test
  42  | // export async function generateAndAttachExcelResults(
  43  | //     sheetName: string,
  44  | //     testData: any[],
  45  | //     testInfo: TestInfo
  46  | // ): Promise<void> {
  47  | //     const timestamp = new Date()
  48  | //         .toISOString()
  49  | //         .replace(/[:.]/g, '-');
  50  | 
  51  | //     const outputFile = testInfo.outputPath(
  52  | //         `${sheetName}_Results_${timestamp}.xlsx`
  53  | //     );
  54  | 
  55  | //     const executedRows = testData.filter(
  56  | //         row =>
  57  | //             row.ExecutionFlag
  58  | //                 ?.toString()
  59  | //                 .trim()
  60  | //                 .toUpperCase() === 'Y'
  61  | //     );
  62  | 
  63  | //     await writeExcelResults(
  64  | //         sheetName,
  65  | //         executedRows,
  66  | //         outputFile
  67  | //     );
  68  | 
  69  | //     await testInfo.attach(
  70  | //         `${sheetName}_Results.xlsx`,
  71  | //         {
  72  | //             path: outputFile,
  73  | //             contentType:
  74  | //                 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  75  | //         }
  76  | //     );
  77  | // }
  78  | export async function generateAndAttachExcelResults(
  79  |     sheetName: string,
  80  |     currentRow: any,
  81  |     testInfo: TestInfo
  82  | ): Promise<void> {
  83  | const timestamp = Date.now();
  84  | let outputFile: any="";
  85  | outputFile = testInfo.outputPath(`${sheetName}_${timestamp}.xlsx`);
  86  | 
  87  |     await writeExcelResults(
  88  |         sheetName,
  89  |         [currentRow], // single runtime row
  90  |         outputFile
  91  |     );
  92  | 
  93  |     // await testInfo.attach(
  94  |     //     `${sheetName}_Results.xlsx`,
  95  |     //     {
  96  |     //         path: outputFile,
  97  |     //         contentType:
  98  |     //             'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  99  |     //     }
  100 |     // );
  101 | 
  102 |     await testInfo.attach(
  103 |     `${sheetName}_${timestamp}.xlsx`,
  104 |     {
  105 |         path: outputFile,
  106 |         contentType:
  107 |             'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  108 |     }
  109 | );
  110 | }
  111 | 
  112 | // export async function generateAndAttachExcelResults(
  113 | //   tcId: string,
  114 | //   data: any,
  115 | //   testInfo: TestInfo
  116 | // ) {
  117 | //   const workbook = new ExcelJS.Workbook();
  118 | //   const worksheet = workbook.addWorksheet('Results');
  119 | 
  120 | //   worksheet.addRow(['TC_ID', tcId]);
  121 | //   worksheet.addRow(['Response', data.OUT_ResponseBody]);
  122 | 
  123 | //   const filePath = testInfo.outputPath(
  124 | //     `${tcId}_${Date.now()}.xlsx`
  125 | //   );
  126 | 
  127 | //   await workbook.xlsx.writeFile(filePath);
  128 | 
  129 | //   await testInfo.attach(
  130 | //     `Excel_${tcId}`,
  131 | //     {
  132 | //       path: filePath,
  133 | //       contentType:
```