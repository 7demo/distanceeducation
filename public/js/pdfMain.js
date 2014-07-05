var pdfUrl = 'release/images/pdf.pdf';
var pdfPage = null;
var nums = 1;
var totalNum = null;
//
// Fetch the PDF document from the URL using promises
//
//$('#pdf').attr('width',$('#pdfWrap').width());
//$('#pdf').attr('height',$('#pdfWrap').height());



function pdfShow(pdfUrl){
    PDFJS.getDocument(pdfUrl).then(function(pdf) {
        // Using promise to fetch the page
        pdfPage = pdf;
        totalNum = pdfPage.pdfInfo.numPages;
        pdf.getPage(nums).then(function(page) {
        var scale = 1.5;
        var viewport = page.getViewport(scale);

        //
        // Prepare canvas using PDF page dimensions
        //
        var canvas = document.getElementById('pdf');
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        //
        // Render PDF page into canvas context
        //
        var renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        page.render(renderContext);
      });
    });
    console.log(nums);
};
// $('#pdfPre').click(function(){
//     nums--;
//     pdfShow(pdfUrl);
// })

// $('#pdfNext').click(function(){
//     nums++;
//     pdfShow(pdfUrl);
// });

