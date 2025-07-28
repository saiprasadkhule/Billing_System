function addRow() {
    const table = document.querySelector("#items tbody");
    const rowCount = table.rows.length + 1;

    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${rowCount}</td>
        <td><input type="text" class="desc"></td>
        <td><input type="text" class="hsn"></td>
        <td><input type="number" class="qty" value="1" oninput="updateTotals()"></td>
        <td><input type="number" class="rate" value="0" oninput="updateTotals()"></td>
        <td><input type="text" class="per" value="pcs"></td>
        <td class="amount">0.00</td>
        <td><button class="remove-btn" onclick="removeRow(this)">X</button></td>
    `;
    table.appendChild(row);
}

function removeRow(btn) {
    btn.closest("tr").remove();
    updateTotals();
}

function updateTotals() {
    let rows = document.querySelectorAll("#items tbody tr");
    let total = 0;
    let valid = true;

    rows.forEach(row => {
        let qtyInput = row.querySelector(".qty");
        let rateInput = row.querySelector(".rate");

        let qty = parseFloat(qtyInput.value) || 0;
        let rate = parseFloat(rateInput.value) || 0;

        // Validation
        if (qty < 0) {
            alert("Quantity cannot be negative.");
            qtyInput.value = 0;
            qty = 0;
            valid = false;
        }

        if (rate < 0) {
            alert("Rate cannot be negative.");
            rateInput.value = 0;
            rate = 0;
            valid = false;
        }

        let amount = qty * rate;
        row.querySelector(".amount").innerText = amount.toFixed(2);
        total += amount;
    });

    if (!valid) return;

    let gstRate = parseFloat(document.getElementById("gstRate").value) || 0;
    let tax = (total * gstRate) / 100;
    let grandTotal = total + tax;

    document.getElementById("total").innerText = "₹" + total.toFixed(2);
    document.getElementById("tax").innerText = "₹" + tax.toFixed(2);
    document.getElementById("grandTotal").innerText = "₹" + grandTotal.toFixed(2);

    document.getElementById("amountWords").innerText =
     convertNumberToWords(grandTotal) + " Only";
}


function generatePDF() {
    const invoiceNo = document.getElementById("invoiceNo").value;
    const invoiceDate = document.getElementById("invoiceDate").value;
    const deliveryNote = document.getElementById("deliveryNote").value;
    const paymentTerms = document.getElementById("paymentTerms").value;
    const companyDetails = document.getElementById("companyDetails").value;
    const companyGST = document.getElementById("companyGST").value;
    const consignee = document.getElementById("consignee").value;
    const consigneeGST = document.getElementById("consigneeGST").value;
    const buyer = document.getElementById("buyer").value;
    const buyerGST = document.getElementById("buyerGST").value;
    const gstRate = parseFloat(document.getElementById("gstRate").value) || 0;

    let rows = [];
    let total = 0;

    document.querySelectorAll("#items tbody tr").forEach((tr, index) => {
        const desc = tr.querySelector(".desc").value;
        const hsn = tr.querySelector(".hsn").value;
        const qty = parseFloat(tr.querySelector(".qty").value) || 0;
        const rate = parseFloat(tr.querySelector(".rate").value) || 0;
        const per = tr.querySelector(".per").value;
        const amount = qty * rate;
        total += amount;

        rows.push([
            { text: (index + 1).toString(), alignment: 'center' },
            { text: desc },
            { text: hsn },
            { text: qty.toString(), alignment: 'right' },
            { text: rate.toFixed(2), alignment: 'right' },
            { text: per },
            { text: amount.toFixed(2), alignment: 'right' }
        ]);
    });

    const tax = (total * gstRate) / 100;
    const grandTotal = total + tax;

    const docDefinition = {
        content: [
          { text: 'TAX INVOICE', style: 'header', alignment: 'center' },
      
          {
            style: 'tableBox',
            table: {
              widths: ['*', '*'],
              body: [
                [
                  {
                    stack: [
                      { text: 'Your Company Name', bold: true },
                      companyDetails,
                      `GSTIN: ${companyGST}`
                    ]
                  },
                  {
                    stack: [
                      `Invoice No: ${invoiceNo}`,
                      `Date: ${invoiceDate}`,
                      `Delivery Note: ${deliveryNote}`,
                      `Mode/Terms of Payment: ${paymentTerms}`
                    ]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => 'black',
              vLineColor: () => 'black'
            }
          },
      
          {
            style: 'tableBox',
            table: {
              widths: ['*', '*'],
              body: [
                [
                  {
                    stack: [
                      { text: 'Consignee (Ship to):', bold: true },
                      consignee,
                      `GSTIN: ${consigneeGST}`
                    ]
                  },
                  {
                    stack: [
                      { text: 'Buyer (Bill to):', bold: true },
                      buyer,
                      `GSTIN: ${buyerGST}`
                    ]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => 'black',
              vLineColor: () => 'black'
            },
            margin: [0, 10, 0, 10]
          },
      
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', 'auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'Sl No', bold: true },
                  { text: 'Description', bold: true },
                  { text: 'HSN/SAC', bold: true },
                  { text: 'Qty', bold: true },
                  { text: 'Rate', bold: true },
                  { text: 'Per', bold: true },
                  { text: 'Amount', bold: true }
                ],
                ...rows
              ]
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => 'black',
              vLineColor: () => 'black'
            },
            margin: [0, 10, 0, 10]
          },
      
          {
            alignment: 'right',
            table: {
              widths: ['*', 'auto'],
              body: [
                ['GST Rate (%)', `${gstRate}%`],
                ['Subtotal', `₹${total.toFixed(2)}`],
                [`IGST (${gstRate}%)`, `₹${tax.toFixed(2)}`],
                [{ text: 'Grand Total', bold: true }, { text: `₹${grandTotal.toFixed(2)}`, bold: true }]
              ]
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => 'black',
              vLineColor: () => 'black'
            },
            margin: [0, 10, 0, 10]
          },
      
          {
            text: `${convertNumberToWords(Math.round(grandTotal))} Only`,
            margin: [0, 5, 0, 5],
            bold: true
          },
      
          {
            text: 'Declaration:',
            bold: true,
            margin: [0, 5, 0, 0]
          },
          {
            text: 'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.',
            style: 'small'
          }
        ],
        styles: {
          header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
          small: { fontSize: 9, italics: true },
          tableBox: { margin: [0, 10, 0, 0] }
        },
        defaultStyle: {
          fontSize: 10
        }
      };
      
      

    pdfMake.createPdf(docDefinition).download(`Invoice_${invoiceNo}.pdf`);
}

function convertNumberToWords(num) {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
               'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 
               'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function convert(n) {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
        if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
        if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
        if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
        return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
    }

    const [rupees, paise] = num.toFixed(2).split('.');
    let result = '';
    if (parseInt(rupees) > 0) {
        result += convert(parseInt(rupees)) + ' Rupees';
    }
    if (parseInt(paise) > 0) {
        result += (result ? ' and ' : '') + convert(parseInt(paise)) + ' Paise';
    }
    return result || 'Zero';
}

