const nodemailer = require('nodemailer');

/**
 * How to setup Gmail App Password:
 * 1. Go to your Google Account -> Security.
 * 2. Under "Signing in to Google", enable 2-Step Verification.
 * 3. Search for "App Passwords" in the Security tab search bar.
 * 4. Create a new App Password (select "Other", name it "Bakery App").
 * 5. Copy the 16-character password and set it as GMAIL_APP_PASSWORD in .env.
 */

const createTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return null;
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

const transporter = createTransporter();

const getItemsTableHTML = (items) => {
  let table = `
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <thead>
        <tr style="background-color: #f3f4f6; text-align: left;">
          <th style="padding: 10px; border: 1px solid #e5e7eb;">Item</th>
          <th style="padding: 10px; border: 1px solid #e5e7eb;">Qty</th>
          <th style="padding: 10px; border: 1px solid #e5e7eb;">Price</th>
          <th style="padding: 10px; border: 1px solid #e5e7eb;">Total</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  items.forEach(item => {
    const name = item.nameEN || item.name;
    const lineTotal = item.price * item.qty;
    table += `
      <tr>
        <td style="padding: 10px; border: 1px solid #e5e7eb;">${name}</td>
        <td style="padding: 10px; border: 1px solid #e5e7eb;">${item.qty}</td>
        <td style="padding: 10px; border: 1px solid #e5e7eb;">₹${item.price}</td>
        <td style="padding: 10px; border: 1px solid #e5e7eb;">₹${lineTotal}</td>
      </tr>
    `;
  });
  
  table += `
      </tbody>
    </table>
  `;
  return table;
};

const sendAdminNewOrderEmail = async (order, adminEmail) => {
  try {
    const shortOrderId = order._id.toString().slice(-6).toUpperCase();
    
    // Check if location is available to safely access its properties
    let deliveryInfo = order.deliveryType === 'Delivery' ? 'Delivery' : 'Pickup from shop';
    if (order.deliveryType === 'Delivery' && order.location) {
      deliveryInfo = `Delivery to ${order.location.address || 'Location provided'}`;
    }

    const hasCustomOrGalleryCake = order.items && order.items.some(item => item.isCustomCake || item.isGallery);
    const deliveryFee = order.deliveryType === 'Delivery' ? (hasCustomOrGalleryCake ? 30 : 20) : 0;
    const subtotal = order.totalAmount - deliveryFee;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #F59E0B; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">🎂 New Order Received!</h2>
        </div>
        <div style="padding: 20px;">
          <p><strong>Customer:</strong> ${order.customerInfo.name}</p>
          <p><strong>Mobile:</strong> ${order.customerInfo.mobile}</p>
          ${order.customerInfo.email ? `<p><strong>Email:</strong> ${order.customerInfo.email}</p>` : ''}
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          
          <h3>Order #${shortOrderId}</h3>
          ${getItemsTableHTML(order.items)}
          
          <div style="margin-top: 20px; text-align: right;">
            <p style="margin: 5px 0;">Subtotal: ₹${subtotal}</p>
            ${order.deliveryType === 'Delivery' ? `<p style="margin: 5px 0;">Delivery Fee: ₹${deliveryFee}</p>` : ''}
            <h3 style="margin: 5px 0; color: #111827; font-size: 20px;">Total: ₹${order.totalAmount}</h3>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p><strong>Delivery Info:</strong> ${deliveryInfo}</p>
          <p><strong>Requested Date:</strong> ${new Date(order.requestedDate).toLocaleString()}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod} ${order.paymentMethod === 'Online' ? '(Advance Paid)' : '(Cash on Delivery)'}</p>
        </div>
        <div style="background-color: #111827; color: white; padding: 15px; text-align: center; font-size: 12px;">
          Sri Tirupati Venkatachalapathy Bakery
        </div>
      </div>
    `;

    if (!transporter) {
      console.log('Skipping admin new order email: GMAIL credentials not configured in .env');
      return;
    }

    await transporter.sendMail({
      from: `"Bakery Orders" <${process.env.GMAIL_USER}>`,
      to: adminEmail,
      subject: `🛒 New Order #${shortOrderId} — ₹${order.totalAmount} | Sri Tirupati Venkatachalapathy Bakery`,
      html,
    });
    console.log('Admin new order email sent');
  } catch (error) {
    console.error('Error sending admin new order email:', error);
  }
};

const sendCustomerConfirmationEmail = async (order) => {
  try {
    if (!order.customerInfo || !order.customerInfo.email) return;

    const shortOrderId = order._id.toString().slice(-6).toUpperCase();
    const whatsapp = process.env.VITE_SHOP_WHATSAPP || '910000000000';
    
    let deliveryInfo = order.deliveryType === 'Delivery' ? 'Delivery' : 'Pickup from shop';
    if (order.deliveryType === 'Delivery' && order.location) {
      deliveryInfo = `Delivery to ${order.location.address || 'Location provided'}`;
    }

    const hasCustomOrGalleryCake = order.items && order.items.some(item => item.isCustomCake || item.isGallery);
    const deliveryFee = order.deliveryType === 'Delivery' ? (hasCustomOrGalleryCake ? 30 : 20) : 0;
    const subtotal = order.totalAmount - deliveryFee;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #111827; padding: 20px; text-align: center;">
          <h2 style="color: #F59E0B; margin: 0;">Sri Tirupati Venkatachalapathy Bakery</h2>
        </div>
        <div style="padding: 20px;">
          <p style="font-size: 18px; color: #111827;">Hi <strong>${order.customerInfo.name}</strong>, your order is confirmed! 🎉</p>
          <p><strong>Order ID:</strong> #${shortOrderId}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          
          ${getItemsTableHTML(order.items)}
          
          <div style="margin-top: 20px; text-align: right;">
            <p style="margin: 5px 0;">Subtotal: ₹${subtotal}</p>
            ${order.deliveryType === 'Delivery' ? `<p style="margin: 5px 0;">Delivery Fee: ₹${deliveryFee}</p>` : ''}
            <h3 style="margin: 5px 0; color: #111827; font-size: 20px;">Total: ₹${order.totalAmount}</h3>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p><strong>Delivery Info:</strong> ${deliveryInfo}</p>
          <p><strong>Requested Date:</strong> ${new Date(order.requestedDate).toLocaleString()}</p>
          <p><strong>Payment Status:</strong> ${order.paymentMethod} ${order.paymentMethod === 'Online' ? '(Advance Paid)' : ''}</p>
          
          <p style="margin-top: 20px;">We'll keep you updated as your order progresses.</p>
          <p>For queries, WhatsApp us at <strong>+91 ${whatsapp}</strong></p>
        </div>
        <div style="background-color: #f3f4f6; color: #6b7280; padding: 15px; text-align: center; font-size: 12px;">
          Sri Tirupati Venkatachalapathy Bakery<br/>
          Tirupati, AP
        </div>
      </div>
    `;

    if (!transporter) {
      console.log('Skipping customer confirmation email: GMAIL credentials not configured in .env');
      return;
    }

    await transporter.sendMail({
      from: `"Sri Tirupati Venkatachalapathy Bakery" <${process.env.GMAIL_USER}>`,
      to: order.customerInfo.email,
      subject: `✅ Your order is confirmed — Sri Tirupati Venkatachalapathy Bakery 🎂`,
      html,
    });
    console.log('Customer confirmation email sent');
  } catch (error) {
    console.error('Error sending customer confirmation email:', error);
  }
};

const sendOccasionReminderEmail = async (user, reminder) => {
  try {
    if (!user.email) return;
    const whatsapp = process.env.VITE_SHOP_WHATSAPP || '910000000000';
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #F59E0B; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">Upcoming Occasion Reminder 🎂</h2>
        </div>
        <div style="padding: 30px; text-align: center;">
          <p style="font-size: 18px; color: #111827;">Hi <strong>${user.name}</strong>!</p>
          <p style="font-size: 16px; color: #4b5563; line-height: 1.5;">
            Your occasion <strong>'${reminder.label}'</strong> is coming up on ${reminder.date}. Don't forget to order a special cake! 🍰
          </p>
          
          <a href="${clientUrl}/shop" style="display: inline-block; margin-top: 20px; padding: 15px 30px; background-color: #F59E0B; color: white; text-decoration: none; font-weight: bold; border-radius: 50px; font-size: 16px;">
            Order Now →
          </a>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Or WhatsApp us: <strong>+91 ${whatsapp}</strong>
          </p>
        </div>
        <div style="background-color: #f3f4f6; color: #6b7280; padding: 15px; text-align: center; font-size: 12px;">
          Sri Tirupati Venkatachalapathy Bakery
        </div>
      </div>
    `;

    if (!transporter) {
      console.log('Skipping occasion reminder email: GMAIL credentials not configured in .env');
      return;
    }

    await transporter.sendMail({
      from: `"Sri Tirupati Venkatachalapathy Bakery" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: `🎂 ${reminder.label} is in 2 days! Order your cake today.`,
      html,
    });
    console.log(`Reminder email sent to ${user.email} for ${reminder.label}`);
  } catch (error) {
    console.error('Error sending occasion reminder email:', error);
  }
};

module.exports = {
  sendAdminNewOrderEmail,
  sendCustomerConfirmationEmail,
  sendOccasionReminderEmail,
};
