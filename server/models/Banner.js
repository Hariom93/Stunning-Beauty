import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please enter banner title'],
      trim: true
    },
    subtitle: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      required: [true, 'Please enter banner image URL']
    },
    link: {
      type: String,
      default: '/shop'
    },
    position: {
      type: String,
      enum: ['Hero', 'Promo'],
      default: 'Hero'
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner;
