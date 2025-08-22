import PDFDocument from "pdfkit";

function buildPDF () {
    const doc = new PDFDocument () ;
      res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=example.pdf");

    doc
    .fontSize(25)
    .text('hello world' , 100 , 100)
    doc.end
}