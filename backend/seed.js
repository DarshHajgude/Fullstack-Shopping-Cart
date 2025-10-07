import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config({ path: 'backend/.env' });

// Sample products data
const products = [
  {
    name: "Wireless Headphones",
    description: "High quality wireless headphones",
    price: 2999,
    stock: 10,
    image: "/images/product1.jpg",
  },
  {
    name: "Smart Watch",
    description: "Track your health and notifications",
    price: 1999,
    stock: 15,
    image: "/images/product2.jpg",
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable speaker with amazing sound",
    price: 1499,
    stock: 20,
    image: "/images/product3.jpg",
  },
  {
    name: "Laptop",
    description: "Powerful laptop for all your needs",
    price: 4999,
    stock: 5,
    image: "/images/product4.jpg",
  },
  {
    name: "Gaming Mouse",
    description: "High-performance gaming mouse",
    price: 799,
    stock: 25,
    image: "/images/product1.jpg",
  },
];

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedProducts() {
  try {
    console.log('Seeding products...');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} products`);

    // Log the created products with their IDs
    createdProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ID: ${product._id}`);
    });

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedProducts();
