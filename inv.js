function addRow() {
  const table = document.getElementById("itemRows");
  const rowCount = table.rows.length;
  const row = table.insertRow();
  row.innerHTML = `
      <td>${rowCount + 1}</td>
      <td><input class="desc"></td>
      <td><input class="hsn"></td>
      <td><input type="number" class="qty" value="1" oninput="updateTotals()"></td>
      <td><input type="number" class="rate" value="0" oninput="updateTotals()"></td>
      <td><input class="per" value="set"></td>
      <td class="amount">0.00</td>
      <td><button onclick="removeRow(this)">X</button></td>
  `;
}

function removeRow(btn) {
  const row = btn.parentNode.parentNode;
  row.parentNode.removeChild(row);
  updateTotals();
}

function updateTotals() {
  const rows = document.querySelectorAll("#itemRows tr");
  let subtotal = 0;
  rows.forEach(row => {
      const qty = parseFloat(row.querySelector(".qty").value) || 0;
      const rate = parseFloat(row.querySelector(".rate").value) || 0;
      const amt = qty * rate;
      row.querySelector(".amount").innerText = amt.toFixed(2);
      subtotal += amt;
  });
  const gstRate = parseFloat(document.getElementById("gstRate").value) || 0;
  const gst = subtotal * gstRate / 100;
  const total = subtotal + gst;

  document.getElementById("tax").innerText = gst.toFixed(2);
  document.getElementById("total").innerText = total.toFixed(2);
  document.getElementById("amountWords").innerText = numToWords(total);
}

function numToWords(amount) {
  const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if ((amount = amount.toString()).length > 9) return 'Overflow';
  let n = ('000000000' + amount).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{3})$/);
  if (!n) return; let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + ' Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + ' Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + ' Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + ' ' : '';
  return str.trim() + ' Only';
}

function generatePDF() {
  const element = document.getElementById('invoice');
  html2pdf().from(element).save('invoice.pdf');
}
