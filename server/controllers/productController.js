const Product = require('../models/Product');
const Notification = require('../models/Notification');

// @desc    Get all available products (Public)
// @route   GET /api/products
const getPublicProducts = async (req, res) => {
  try {
    const isGallery = req.query.isGallery === 'true';
    const query = { isAvailable: true };
    if (isGallery) {
      query.isGallery = true;
    } else {
      query.isGallery = { $ne: true };
    }
    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all products (Admin)
// @route   GET /api/products/all
const getAllProducts = async (req, res) => {
  try {
    const isGallery = req.query.isGallery === 'true';
    const query = {};
    if (isGallery) {
      query.isGallery = true;
    } else {
      query.isGallery = { $ne: true };
    }
    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product (Admin)
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const { nameEN, nameTe, descriptionEN, descriptionTe, price, weight, quantity, category, isAvailable, isSpecial, isLoved, isGallery, flavour } = req.body;
    let imageUrl = '';
    
    if (req.file) {
      imageUrl = req.file.path;
    }

    const product = new Product({
      nameEN,
      nameTe,
      descriptionEN,
      descriptionTe,
      price: Number(price),
      weight,
      quantity: Number(quantity) || 0,
      category,
      imageUrl,
      isAvailable: isAvailable === 'true' || isAvailable === true,
      isSpecial: isSpecial === 'true' || isSpecial === true,
      isLoved: isLoved === 'true' || isLoved === true,
      isGallery: isGallery === 'true' || isGallery === true,
      flavour,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product (Admin)
// @route   PATCH /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { nameEN, nameTe, descriptionEN, descriptionTe, price, weight, quantity, category, isAvailable, isSpecial, isLoved, isGallery, flavour } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.nameEN = nameEN || product.nameEN;
    product.nameTe = nameTe || product.nameTe;
    product.descriptionEN = descriptionEN || product.descriptionEN;
    product.descriptionTe = descriptionTe || product.descriptionTe;
    if (price) product.price = Number(price);
    if (weight !== undefined) product.weight = weight;
    if (quantity !== undefined) product.quantity = Number(quantity);
    product.category = category || product.category;
    if (isAvailable !== undefined) product.isAvailable = isAvailable === 'true' || isAvailable === true;
    if (isSpecial !== undefined) product.isSpecial = isSpecial === 'true' || isSpecial === true;
    if (isLoved !== undefined) product.isLoved = isLoved === 'true' || isLoved === true;
    if (isGallery !== undefined) product.isGallery = isGallery === 'true' || isGallery === true;
    if (flavour !== undefined) product.flavour = flavour;

    if (req.file) {
      product.imageUrl = req.file.path;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product (Admin)
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle product availability (Admin)
// @route   PATCH /api/products/:id/toggle
const toggleAvailability = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isAvailable = !product.isAvailable;
    await product.save();

    // If marked unavailable, notify admin
    if (!product.isAvailable) {
      const io = req.app.get('io');
      const message = `${product.nameEN} is now Out of Stock. Remember to restock!`;
      
      const notification = await Notification.create({
        userId: req.user.id, // The admin toggling it receives it
        type: 'low_stock',
        message: message,
        actionTab: 'products',
      });

      if (io) {
        io.to('admin_room').emit('new_notification', notification);
      }
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user.id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = {
      user: req.user.id,
      userName: req.user.name || 'Customer',
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;

    // Calculate average rating
    const totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);
    product.averageRating = totalRating / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPublicProducts,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleAvailability,
  addReview,
};
