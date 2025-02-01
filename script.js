// Function to load and parse the XML file
function loadXMLData() {
  const fileInput = document.getElementById('xmlFileInput');
  const file = fileInput.files[0];
  
  if (!file) {
    alert("Please select a file first.");
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(event) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(event.target.result, 'application/xml');
    const orders = xmlDoc.getElementsByTagName('order');
    const tableBody = document.querySelector('#ordersTable tbody');
    tableBody.innerHTML = ''; // Clear previous content

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const orderNo = order.getAttribute('order-no'); // Get order-no attribute

      if (!orderNo) continue; // Skip if order-no is missing

      const customerName = order.getElementsByTagName('customer_name')[0]?.textContent || "N/A";
      const orderDate = order.getElementsByTagName('order_date')[0]?.textContent || "N/A";
      const total = order.getElementsByTagName('total')[0]?.textContent || "0.00";
      
      // Get delivery status if available
      const statusElement = order.getElementsByTagName('status')[0];
      const deliveryStatus = statusElement ? statusElement.getElementsByTagName('delivery')[0]?.textContent : 'No Info';

      const row = document.createElement('tr');
      row.innerHTML = `<td><a href="#" onclick="showOrderDetails('${orderNo}')">${orderNo}</a></td>
                       <td>${customerName}</td>
                       <td>${orderDate}</td>
                       <td>R${total}</td>
                       <td>${deliveryStatus}</td>`;
      tableBody.appendChild(row);
    }
  };

  reader.onerror = function() {
    alert('Error reading file.');
  };

  reader.readAsText(file); // Read the XML file as text
}

// Function to show order details when clicking on an order
function showOrderDetails(orderNo) {
  const fileInput = document.getElementById('xmlFileInput');
  const file = fileInput.files[0];

  if (!file) {
    alert("Please upload a file first.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(event.target.result, 'application/xml');
    const orders = xmlDoc.getElementsByTagName('order');

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const currentOrderNo = order.getAttribute('order-no');

      if (currentOrderNo !== orderNo) continue;

      const customerName = order.getElementsByTagName('customer_name')[0]?.textContent || "N/A";
      const orderDate = order.getElementsByTagName('order_date')[0]?.textContent || "N/A";
      const total = parseFloat(order.getElementsByTagName('total')[0]?.textContent || "0.00");

      let customerDetails = "N/A";
      const customer = order.getElementsByTagName('customer')[0];
      if (customer) {
        const customerEmail = customer.getElementsByTagName('customer-email')[0]?.textContent || "No Email";
        const billingAddress = customer.getElementsByTagName('billing-address')[0];
        if (billingAddress) {
          const firstName = billingAddress.getElementsByTagName('first-name')[0]?.textContent || "";
          const lastName = billingAddress.getElementsByTagName('last-name')[0]?.textContent || "";
          const address1 = billingAddress.getElementsByTagName('address1')[0]?.textContent || "";
          const city = billingAddress.getElementsByTagName('city')[0]?.textContent || "";
          const postalCode = billingAddress.getElementsByTagName('postal-code')[0]?.textContent || "";
          const phone = billingAddress.getElementsByTagName('phone')[0]?.textContent || "";

          customerDetails = `
            <strong>Name:</strong> ${firstName} ${lastName} <br>
            <strong>Email:</strong> ${customerEmail} <br>
            <strong>Address:</strong> ${address1}, ${city}, ${postalCode} <br>
            <strong>Phone:</strong> ${phone} <br>
          `;
        }
      }

      let itemsDetails = "<ul>";
      const items = order.getElementsByTagName('item');
      for (let j = 0; j < items.length; j++) {
        const itemName = items[j].getElementsByTagName('name')[0]?.textContent || "Unknown Item";
        const itemQuantity = parseInt(items[j].getElementsByTagName('quantity')[0]?.textContent || "1");
        const itemPrice = parseFloat(items[j].getElementsByTagName('price')[0]?.textContent || "0.00");
        const itemTotal = itemQuantity * itemPrice;
        itemsDetails += `<li>${itemName} (x${itemQuantity}) - R${itemPrice} each</li>`;
      }
      itemsDetails += "</ul>";

      document.getElementById('orderDetailsText').innerHTML = `
        <h3>Order ID: ${orderNo}</h3>
        <strong>Customer Name:</strong> ${customerName} <br>
        <strong>Order Date:</strong> ${orderDate} <br>
        <strong>Total Amount:</strong> R${total.toFixed(2)} <br>
        <h4>Customer Details:</h4>
        ${customerDetails}
        <h4>Items:</h4>
        ${itemsDetails}
      `;
      document.getElementById('orderDetails').style.display = 'block';
      break;
    }
  };

  reader.readAsText(file); // Read the XML file as text
}

// Function to close the order details
function closeOrderDetails() {
  document.getElementById('orderDetails').style.display = 'none';
}
