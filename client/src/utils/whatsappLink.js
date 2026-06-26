import { SHOP_CONFIG } from '../config/shopConfig';

export const generateWhatsAppLink = ({
  customerName,
  customerMobile,
  items,
  totalAmount,
  deliveryType,
  deliveryAddress,
  requestedDateTime,
  paymentMethod,
  orderId,
}) => {
  let message = `*New Order: ${orderId}*\n\n`;
  message += `*Customer:* ${customerName}\n`;
  message += `*Mobile:* ${customerMobile}\n\n`;
  message += `*Items:*\n`;
  items.forEach((item) => {
    message += `- ${item.nameEN} x ${item.qty} (₹${item.price})\n`;
  });
  message += `\n*Total:* ₹${totalAmount}\n`;
  message += `*Type:* ${deliveryType}\n`;
  if (deliveryType === 'delivery') {
    message += `*Address:* ${deliveryAddress}\n`;
  }
  if (requestedDateTime) {
    message += `*Requested Time:* ${new Date(requestedDateTime).toLocaleString()}\n`;
  }
  message += `*Payment:* ${paymentMethod}\n`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${SHOP_CONFIG.whatsapp}?text=${encodedMessage}`;
};
