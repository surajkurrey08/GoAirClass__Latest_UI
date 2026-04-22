const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

try {
    const doc = new PDFDocument();
    const outputPath = path.join(__dirname, 'test.pdf');
    doc.pipe(fs.createWriteStream(outputPath));
    doc.text('PDFKit Test');
    doc.end();
    console.log('✅ PDFKit is working. Created test.pdf');
} catch (err) {
    console.error('❌ PDFKit failed:', err);
}
