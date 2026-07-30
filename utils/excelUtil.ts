import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { TestInfo } from '@playwright/test';

const FILE_PATH = './testdata/EBAPI.xlsx';

//get excel details
export function getExcelData(sheetName: string) {
    const workbook = XLSX.readFile(FILE_PATH);
    const worksheet = workbook.Sheets[sheetName];

    return XLSX.utils.sheet_to_json(worksheet);
}

//create excel for test results
export async function writeExcelResults(
    sheetName: string,
    data: any[],
    outputFile: string
) {
    fs.mkdirSync('./test-results', { recursive: true });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        sheetName
    );

    XLSX.writeFile(workbook, outputFile);
}

//Use to generate an excel based on runtime data and attach to each test
export async function generateAndAttachExcelResults(
    sheetName: string,
    testData: any[],
    testInfo: TestInfo
): Promise<void> {
    const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-');

    const outputFile = testInfo.outputPath(
        `${sheetName}_Results_${timestamp}.xlsx`
    );

    const executedRows = testData.filter(
        row =>
            row.ExecutionFlag
                ?.toString()
                .trim()
                .toUpperCase() === 'Y'
    );

    await writeExcelResults(
        sheetName,
        executedRows,
        outputFile
    );

    await testInfo.attach(
        `${sheetName}_Results.xlsx`,
        {
            path: outputFile,
            contentType:
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }
    );
}
