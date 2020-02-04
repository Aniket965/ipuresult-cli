#! /usr/bin/env node

// Copyright (c) 2020 aniket965
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


const { resultTxt2json } = require('./lib/resultExtractor');
const fs = require('fs');
const path = require('path')
const PDFParser = require("pdf2json");


const PDF_FILE_LOCATION = process.argv[2];
const OUTPUT_FILE_LOCATION = process.argv[3] || '.';
const RESULT_FILE_NAME = path.join(OUTPUT_FILE_LOCATION, 'result.json');

const pdfParser = new PDFParser(this,1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));

pdfParser.on("pdfParser_dataReady", pdfData => {

    const content = resultTxt2json(pdfParser.getRawTextContent());
    if(content) fs.writeFileSync(RESULT_FILE_NAME,JSON.stringify(content));

});

pdfParser.loadPDF(PDF_FILE_LOCATION);