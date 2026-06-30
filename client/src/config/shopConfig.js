const envWhatsApp = import.meta.env.VITE_SHOP_WHATSAPP || '919876543210';
let cleanWhatsApp = envWhatsApp.replace(/\D/g, '');
if (cleanWhatsApp.length === 10) {
  cleanWhatsApp = '91' + cleanWhatsApp;
}

export const SHOP_CONFIG = {
  name: import.meta.env.VITE_SHOP_NAME || 'Sri Tirupati Venkatachalapathy Bakery',
  lat: parseFloat(import.meta.env.VITE_SHOP_LAT) || 13.6288,
  lng: parseFloat(import.meta.env.VITE_SHOP_LNG) || 79.4192,
  address: import.meta.env.VITE_SHOP_ADDRESS || 'Tirupati, Andhra Pradesh',
  whatsapp: cleanWhatsApp,
  deliveryRadiusKm: 10,
  deliveryFee: 50,
};
