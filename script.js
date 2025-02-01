// Function to load and parse XML data
function loadXMLData() {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'orders.xml', true); // Ensure orders.xml is correctly hosted
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xhr.responseText, 'application/xml');
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
    } else if (xhr.readyState === 4) {
      console.error('Error loading XML: ', xhr.status, xhr.statusText);
    }
  };
  xhr.send();
}

// Function to show order details when clicking on an order
function showOrderDetails(orderNo) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'orders.xml', true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xhr.responseText, 'application/xml');
      const orders = xmlDoc.getElementsByTagName('order');

      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const currentOrderNo = order.getAttribute('order-no'); // Get order-no attribute

        if (currentOrderNo !== orderNo) continue; // Skip if not matching

        const customerName = order.getElementsByTagName('customer_name')[0]?.textContent || "N/A";
        const orderDate = order.getElementsByTagName('order_date')[0]?.textContent || "N/A";
        const total = parseFloat(order.getElementsByTagName('total')[0]?.textContent || "0.00");
        
        // Extract Customer Details if Available
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

        // Extract the payment provider information
        let paymentProvider = "No Payment Provider Info";
        const customAttribute = order.getElementsByTagName('custom-attribute');
        for (let j = 0; j < customAttribute.length; j++) {
          if (customAttribute[j].getAttribute('attribute-id') === 'paymentProvider') {
            paymentProvider = customAttribute[j].textContent || "Unknown";
            break;
          }
        }

        // Get the items
        const items = order.getElementsByTagName('item');
        let itemsDetails = "<ul>";
        for (let j = 0; j < items.length; j++) {
          const itemName = items[j].getElementsByTagName('name')[0]?.textContent || "Unknown Item";
          const itemQuantity = parseInt(items[j].getElementsByTagName('quantity')[0]?.textContent || "1");
          const itemPrice = parseFloat(items[j].getElementsByTagName('price')[0]?.textContent || "0.00");
          const itemTotal = itemQuantity * itemPrice;

          // Check if there is a discount
          const discountElement = items[j].getElementsByTagName('discount')[0];
          let discountDetails = "";
          if (discountElement) {
            const discountName = discountElement.getElementsByTagName('discount_name')[0]?.textContent || "Unknown Discount";
            const discountPercentage = parseFloat(discountElement.getElementsByTagName('discount_amount')[0]?.textContent.replace('%', '') || "0");
            const discountAmount = (discountPercentage / 100) * itemTotal;
            discountDetails = ` - Discount: ${discountName} (R${discountAmount.toFixed(2)})`;
          }

          itemsDetails += `<li>${itemName} (x${itemQuantity}) - R${itemPrice} each ${discountDetails}</li>`;
        }
        itemsDetails += "</ul>";

        // Show order details in the UI
        document.getElementById('orderDetailsText').innerHTML = `
          <h3>Order ID: ${orderNo}</h3>
          <strong>Customer Name:</strong> ${customerName} <br>
          <strong>Order Date:</strong> ${orderDate} <br>
          <strong>Total Amount:</strong> R${total.toFixed(2)} <br>
          <h4>Customer Details:</h4>
          ${customerDetails}
          <h4>Items:</h4>
          ${itemsDetails}
          <h4>Payment Provider:</h4>
          <strong>Payment Method</strong> ${paymentProvider} <br>
          
        `;
        document.getElementById('orderDetails').style.display = 'block';
        break;
      }
    }
  };
  xhr.send();
}

// Function to close the order details
function closeOrderDetails() {
  document.getElementById('orderDetails').style.display = 'none'; // Hide order details
}

// Load XML Data when the page loads
document.addEventListener('DOMContentLoaded', loadXMLData);
