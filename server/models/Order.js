import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1']
        },
        price: {
          type: Number,
          required: true
        }
      }
    ],
    shippingAddress: {
      streetAddress: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String, required: true },
      phone: { type: String, required: true }
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Razorpay'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending'
    },
    paymentDetails: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending'
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0
    },
    discountPrice: {
      type: Number,
      required: true,
      default: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0
    },
    trackingId: {
      type: String,
      unique: true,
      sparse: true // Allows null/missing values but ensures uniqueness if present
    },
    statusTimestamps: {
      pendingAt: { type: Date, default: Date.now },
      confirmedAt: Date,
      packedAt: Date,
      shippedAt: Date,
      deliveredAt: Date,
      cancelledAt: Date
    }
  },
  {
    timestamps: true
  }
);

// Pre-save to auto-generate a unique tracking code if not present
orderSchema.pre('save', function (next) {
  if (!this.trackingId && this.orderStatus !== 'Pending') {
    this.trackingId = 'TRK' + Math.floor(10000000 + Math.random() * 90000000).toString();
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
