
require("dotenv").config();

const mongoose = require("mongoose");
const crypto = require("crypto");

const connectDB = require("../src/config/db");

const User = require("../src/models/User");
const Category = require("../src/models/Category");
const Product = require("../src/models/Product");
const Cart = require("../src/models/Cart");
const Order = require("../src/models/Order");
const Payment = require("../src/models/Payment");

const SEED_USER_EMAIL = "seed.customer@shopsphere.local";
const SEED_ORDER_ID = new mongoose.Types.ObjectId(
  "650000000000000000000001"
);
const SEED_PAYMENT_REFERENCE = "SEED-PAYMENT-0001";

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("\nStarting ShopSphere database seeding...\n");

    // 1. Seed categories
    const categoryData = [
      {
        name: "Electronics",
        slug: "electronics",
        description: "Electronic gadgets and accessories",
      },
      {
        name: "Books",
        slug: "books",
        description: "Books and learning materials",
      },
    ];

    const categories = [];

    for (const data of categoryData) {
      let category = await Category.findOne({
        slug: data.slug,
      });

      if (!category) {
        category = await Category.create(data);
        console.log("Created category:", category.name);
      } else {
        console.log("Category already exists:", category.name);
      }

      categories.push(category);
    }

    // 2. Seed products
    const productData = [
      {
        name: "Wireless Headphones",
        description: "Bluetooth wireless headphones",
        price: 1999,
        stock: 25,
        images: [],
        category: categories[0]._id,
      },
      {
        name: "Java Programming Book",
        description: "A beginner-friendly Java programming book",
        price: 599,
        stock: 40,
        images: [],
        category: categories[1]._id,
      },
    ];

    const products = [];

    for (const data of productData) {
      let product = await Product.findOne({
        name: data.name,
      });

      if (!product) {
        product = await Product.create(data);
        console.log("Created product:", product.name);
      } else {
        console.log("Product already exists:", product.name);
      }

      products.push(product);
    }

    // 3. Create a dedicated sample customer
    let user = await User.findOne({
      email: SEED_USER_EMAIL,
    });

    if (!user) {
      // Generate an unusable random credential and store only
      // its scrypt hash. This is not an application login password.
      const randomPassword = crypto.randomBytes(32);
      const salt = crypto.randomBytes(16).toString("hex");

      const passwordHash = crypto.scryptSync(
        randomPassword,
        salt,
        64
      ).toString("hex");

      user = await User.create({
        name: "ShopSphere Seed Customer",
        email: SEED_USER_EMAIL,
        password: `scrypt$${salt}$${passwordHash}`,
        role: "customer",
      });

      console.log("Created sample user:", user.email);
    } else {
      console.log("Sample user already exists:", user.email);
    }

    // 4. Create cart only if one does not already exist
    let cart = await Cart.findOne({
      userId: user._id,
    });

    if (!cart) {
      cart = await Cart.create({
        userId: user._id,
        items: [
          {
            productId: products[0]._id,
            name: products[0].name,
            unitPrice: products[0].price,
            quantity: 1,
          },
          {
            productId: products[1]._id,
            name: products[1].name,
            unitPrice: products[1].price,
            quantity: 1,
          },
        ],
      });

      console.log("Created sample cart:", cart._id);
    } else {
      console.log("Existing cart preserved:", cart._id);
    }

    // 5. Create order with item snapshots
    let order = await Order.findById(SEED_ORDER_ID);

    if (!order) {
      const orderItems = [
        {
          productId: products[0]._id,
          name: products[0].name,
          unitPrice: products[0].price,
          quantity: 1,
        },
        {
          productId: products[1]._id,
          name: products[1].name,
          unitPrice: products[1].price,
          quantity: 1,
        },
      ];

      const totalAmount = orderItems.reduce(
        (total, item) =>
          total + item.unitPrice * item.quantity,
        0
      );

      order = await Order.create({
        _id: SEED_ORDER_ID,
        userId: user._id,
        items: orderItems,
        totalAmount,
        status: "confirmed",
        shippingAddress: {
          fullName: "ShopSphere Seed Customer",
          phone: "0000000000",
          addressLine1: "123 Demo Street",
          city: "Pune",
          state: "Maharashtra",
          postalCode: "411001",
          country: "India",
        },
      });

      console.log("Created sample order:", order._id);
    } else {
      console.log("Existing order preserved:", order._id);
    }

    // 6. Create payment only if it does not already exist
    let payment = await Payment.findOne({
      transactionReference: SEED_PAYMENT_REFERENCE,
    });

    if (!payment) {
      payment = await Payment.create({
        orderId: order._id,
        amount: order.totalAmount,
        provider: "SeedDemo",
        status: "success",
        transactionReference: SEED_PAYMENT_REFERENCE,
        currency: "INR",
      });

      console.log("Created sample payment:", payment._id);
    } else {
      console.log("Existing payment preserved:", payment._id);
    }

    console.log("\n================================");
    console.log("Seed completed successfully!");
    console.log("================================");
    console.log("Categories:", await Category.countDocuments());
    console.log("Products:", await Product.countDocuments());
    console.log("Users:", await User.countDocuments());
    console.log("Carts:", await Cart.countDocuments());
    console.log("Orders:", await Order.countDocuments());
    console.log("Payments:", await Payment.countDocuments());
    console.log("\nExisting records were preserved.");
  } catch (error) {
    console.error("\nSeeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase();
