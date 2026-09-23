const envWhatsApp = import.meta.env.VITE_SHOP_WHATSAPP || '919876543210';
let cleanWhatsApp = envWhatsApp.replace(/\D/g, '');
if (cleanWhatsApp.length === 10) {
  cleanWhatsApp = '91' + cleanWhatsApp;
}

export const SHOP_CONFIG = {
  name: import.meta.env.VITE_SHOP_NAME || 'Sri Tirupati Venkatachalapathy Bakery',
  lat: parseFloat(import.meta.env.VITE_SHOP_LAT) || 17.2852909,
  lng: parseFloat(import.meta.env.VITE_SHOP_LNG) || 82.105785,
  address: import.meta.env.VITE_SHOP_ADDRESS || 'Tirupati, Andhra Pradesh',
  whatsapp: cleanWhatsApp,
  deliveryRadiusKm: 10,
  deliveryFee: 50,
};
