
/*!
 * Copyright (c) 2022 Pan Junjie (junjie-jay.pan@nokia-sbell.com)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

const ExcelJS = require('exceljs');
import { EOL } from "os";


/** {@docCategory ExcelParser} */
export class ExcelParser {

    private _excelFilePath: string | undefined;

    constructor(filePath: string | undefined) {
        this._excelFilePath = filePath;
    }

    public async readExcel() {
        if (!this._excelFilePath) {
            process.stderr.write(`ExcelParser.readExcel: file path is not existing! ${EOL}`);
        }
        // const options = {
        //     sharedStrings: 'emit',
        //     hyperlinks: 'emit',
        //     worksheets: 'emit',
        // };

        // try 1

        const fileName = 'simple.xlsx';

        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('My Sheet');

        ws.getCell('A1').value = 'John Doe';
        ws.getCell('B1').value = 'gardener';
        ws.getCell('C1').value = new Date().toLocaleString();

        const r3 = ws.getRow(3);
        r3.values = [1, 2, 3, 4, 5, 6];

        wb.xlsx
            .writeFile(fileName)
            .then(() => {
                process.stderr.write(`ExcelParser.readExcel: file created ${EOL}`);
            })
            .catch((err: { message: any; }) => {
                process.stderr.write(`ExcelParser.readExcel: err : ${err.message} ${EOL}`);
            });

        // TODO: try 2
        // var workbook = new ExcelJS.Workbook();
        // workbook.creator ="Naveen"; 
        // workbook.modified ="Kumar";

        // workbook.xlsx.readFile(this._excelFilePath).then(function(){
        //     var workSheet =  workbook.getWorksheet("InterpreterInput"); 

        //     workSheet.eachRow({ includeEmpty: true }, function(row: { values: string[]; }, rowNumber: any) {

        //         const currRow = workSheet.getRow(rowNumber); 
        //         //  console.log("User Name :" + currRow.getCell(1).value +", Password :" +currRow.getCell(2).value);
        //         //  console.log("User Name :" + row.values[1] +", Password :" +  row.values[2] ); 
        //          process.stderr.write(`ExcelParser.readExcel: xxx : ${currRow.getCell(1).value} , yyy : ${currRow.getCell(2).value} ${EOL}`);
        //        //  console.log("Row " + rowNumber + " = " + JSON.stringify(row.values));
        //       });
        // })

        // TODO: try 3
        // var workbook = new ExcelJS.Workbook();
        // workbook.xlsx.readFile(this._excelFilePath)
        //     .then(function () {
        //         var worksheet = workbook.getWorksheet('InterpreterInput');
        //         worksheet.eachRow({ includeEmpty: true }, function (row: any[], rowNumber: string) {
        //             console.log("Row " + rowNumber + " = " + JSON.stringify(row.values));
        //             process.stderr.write(`ExcelParser.readExcel: Row ${rowNumber} =  ${JSON.stringify(row.values)} ${EOL}`);
        //         });
        //     });

        // TODO: try 4
        // const workbook = new ExcelJS.stream.xlsx.WorkbookReader(this._excelFilePath, options);
        // for await (const { eventType, value } of workbook.parse()) {
        //     switch (eventType) {
        //         case 'shared-strings':
        //             // value is the shared string
        //             process.stderr.write(`ExcelParser.readExcel: shared-strings, value ${value} ${EOL}`);
        //             break;
        //         case 'worksheet':
        //             // value is the worksheetReader
        //             process.stderr.write(`ExcelParser.readExcel: worksheet, value ${value} ${EOL}`);
        //             break;
        //         case 'hyperlinks':
        //             // value is the hyperlinksReader
        //             process.stderr.write(`ExcelParser.readExcel: hyperlinks, value ${value} ${EOL}`);
        //             break;
        //         default:
        //             process.stderr.write(`ExcelParser.readExcel: default, value ${value} ${EOL}`);
        //     }
        // }

        // TODO: try 5
        // const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(this._excelFilePath, options);
        // workbookReader.read();
        // workbookReader.on('worksheet', (worksheet: { on: (arg0: string, arg1: (row: any) => void) => void; }) => {
        //     worksheet.on('row', row => {
        //         process.stderr.write(`ExcelParser.readExcel: worksheet, row ${row} ${EOL}`);
        //     });
        // });

        // workbookReader.on('shared-strings', () => {
        //     process.stderr.write(`ExcelParser.readExcel: shared-strings${EOL}`);
        // });

        // workbookReader.on('hyperlinks', () => {
        //     process.stderr.write(`ExcelParser.readExcel: hyperlinks${EOL}`);
        // });

        // workbookReader.on('end', () => {
        //     process.stderr.write(`ExcelParser.readExcel: end ${EOL}`);
        // });

        // workbookReader.on('error', (err: any) => {
        //     process.stderr.write(`ExcelParser.readExcel: worksheet, err ${err} ${EOL}`);
        // });
    }


}