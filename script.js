function addRow() {
  let table = document.getElementById("itemsTable").getElementsByTagName('tbody')[0];
  let rowCount = table.rows.length + 1;
  let row = table.insertRow();
  row.innerHTML = `
      <td>${rowCount}</td>
      <td><div contenteditable="true" class="editable"></div></td>
      <td><div contenteditable="true" class="editable"></div></td>
      <td><input type="number" value="1" oninput="calculateTotals()"></td>
      <td><input type="number" value="0" oninput="calculateTotals()"></td>
      <td><div contenteditable="true" class="editable"></div></td>
      <td><input class="amount" readonly></td>
      <td><button class="action-btn delete-btn" onclick="deleteRow(this)">−</button></td>
  `;
}

function deleteRow(btn) {
  let row = btn.parentNode.parentNode;
  row.parentNode.removeChild(row);
  updateSerialNumbers();
  calculateTotals();
}

function updateSerialNumbers() {
  let table = document.getElementById("itemsTable").getElementsByTagName('tbody')[0];
  for (let i = 0; i < table.rows.length; i++) {
      table.rows[i].cells[0].innerText = i + 1;
  }
}
function calculateTotals() {
  let table = document.getElementById("itemsTable").getElementsByTagName('tbody')[0];
  let subtotal = 0;

  for (let i = 0; i < table.rows.length; i++) {
      let qty = parseFloat(table.rows[i].cells[3].querySelector("input").value) || 0;
      let rate = parseFloat(table.rows[i].cells[4].querySelector("input").value) || 0;
      let amount = qty * rate;
      table.rows[i].cells[6].querySelector("input").value = 
      amount.toLocaleString("en-IN", {minimumFractionDigits: 2, maximumFractionDigits: 2});
      subtotal += amount;
  }

  let total = subtotal;

  // ✅ Check if CGST row exists
  if (document.getElementById("cgst")) {
      let cgst = subtotal * 0.09;
      document.getElementById("cgst").value = 
          cgst.toLocaleString("en-IN", {minimumFractionDigits: 2, maximumFractionDigits: 2});
      total += cgst;
  }

  // ✅ Check if SGST row exists
  if (document.getElementById("sgst")) {
    let sgst = subtotal * 0.09;
    document.getElementById("sgst").value = 
        sgst.toLocaleString("en-IN", {minimumFractionDigits: 2, maximumFractionDigits: 2});
    total += sgst;
  }

  // ✅ Check if IGST row exists
  if (document.getElementById("igst")) {
    let igst = subtotal * 0.18;
    document.getElementById("igst").value = 
        igst.toLocaleString("en-IN", {minimumFractionDigits: 2, maximumFractionDigits: 2});
    total += igst;
  }

  document.getElementById("totalAmount").value = 
    total.toLocaleString("en-IN", {minimumFractionDigits: 2, maximumFractionDigits: 2});

  // Update amount in words
  document.getElementById("amount-words").innerHTML =
      "<b>Amount Chargeable (in words):</b> " + convertAmountToWords(total);
}


function convertAmountToWords(amount) {
  if (isNaN(amount)) return "Zero Only";

  let [rupees, paise] = amount.toFixed(2).split(".");
  rupees = parseInt(rupees, 10);
  paise = parseInt(paise, 10);

  let words = "";

  if (rupees > 0) {
    words += numberToWordsIndian(rupees) + " Rupees";
  }
  if (paise > 0) {
    // ✅ Fix paise leading zero issue
    words += (words ? " and " : "") + numberToWordsIndian(paise) + " Paise";
  }

  return words ? words + " Only" : "Zero Only";
}

function removeTaxRow(rowId) {
  let row = document.getElementById(rowId);
  if (row) {
    row.remove();
    calculateTotals(); // recalc after removal
  }
}


// ✅ Works for both large numbers and small paise
function numberToWordsIndian(num) {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';
  if (num.toString().length > 9) return 'Overflow';

  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';

  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + ' Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + ' Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + ' Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + ' Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim();
}


function generatePDF() {
    calculateTotals();

    let invoiceClone = document.getElementById("invoice").cloneNode(true);

    // Ensure invoice expands but not cropped
    invoiceClone.style.width = "100%";
    invoiceClone.style.maxWidth = "100%";
    invoiceClone.style.margin = "0 auto";
    invoiceClone.style.padding = "10px";
    invoiceClone.style.boxSizing = "border-box"; 

    // Remove action buttons and column from items table
    invoiceClone.querySelectorAll(".action-btn").forEach(btn => btn.remove());
    invoiceClone.querySelectorAll("#itemsTable th:last-child, #itemsTable td:last-child").forEach(cell => {
        cell.remove();
    });

    // 🔥 Remove GST action column too
    invoiceClone.querySelectorAll("#gstTable td:last-child").forEach(cell => {
        cell.remove();
    });

    const opt = {
        margin: [5,5,5,5],
        filename: 'invoice.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, logging: false, scrollY: 0, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a3', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(invoiceClone).toPdf().get('pdf').then(function (pdf) {
        const pageCount = pdf.internal.getNumberOfPages();
        pdf.setFontSize(10);
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.text(`Page ${i} of ${pageCount}`,
                pdf.internal.pageSize.getWidth() - 30,
                pdf.internal.pageSize.getHeight() - 5
            );
        }
    }).save();
}




// Initial calculation
calculateTotals();
