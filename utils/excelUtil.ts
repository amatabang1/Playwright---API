import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { TestInfo } from '@playwright/test';

// Get Excel data based on file path and sheet name
export function getExcelData(filePath: string, sheetName: string) {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
        throw new Error(
            `Sheet '${sheetName}' not found in workbook '${filePath}'`
        );
    }
    return XLSX.utils.sheet_to_json(worksheet);
}

// Write to excel for excel output
export async function writeExcelResults(
    sheetName: string,
    data: any[],
    outputFile: string
) {
    fs.mkdirSync('./test-results', { recursive: true });

    // Ensure all cell values comply with Excel limits
    const sanitizedData = data.map(row =>
        Object.fromEntries(
            Object.entries(row).map(([key, value]) => [
                key,
                truncateForExcel(value)
            ])
        )
    );

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(sanitizedData);

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        sheetName
    );

    const buffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx'
    });

    fs.writeFileSync(outputFile, buffer);
}

//Use to generate an excel based on runtime data and attach to each test
export async function generateAndAttachExcelResults(
    sheetName: string,
    currentRow: any,
    testInfo: TestInfo
): Promise<void> {
    const timestamp = Date.now();
    let outputFile: any = "";
    outputFile = testInfo.outputPath(`${sheetName}_${timestamp}.xlsx`);

    await writeExcelResults(
        sheetName,
        [currentRow], // single runtime row
        outputFile
    );

    await testInfo.attach(
        `${sheetName}_${timestamp}.xlsx`,
        {
            path: outputFile,
            contentType:
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }
    );
}

// Use to limit the output value to be stored to a single cell in Excel. Limit is 32767
export function truncateForExcel(value: any): string {
    const MAX_EXCEL_CELL_LENGTH = 32767;
    const suffix = '\n[TRUNCATED]';

    if (value === null || value === undefined) {
        return '';
    }

    const str = String(value);

    return str.length > MAX_EXCEL_CELL_LENGTH
        ? str.slice(0, MAX_EXCEL_CELL_LENGTH - suffix.length) + suffix
        : str;
}