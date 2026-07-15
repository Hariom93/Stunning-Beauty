import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please enter address label (e.g. Home, Office)'],
      default: 'Home',
      trim: true
    },
    streetAddress: {
      type: String,
      required: [true, 'Please enter street address'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'Please enter city'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'Please enter state'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Please enter country'],
      default: 'India',
      trim: true
    },
    zipCode: {
      type: String,
      required: [true, 'Please enter zip/postal code'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Please enter contact number'],
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// If isDefault is set to true, reset other user addresses default flags to false
addressSchema.pre('save', async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

const Address = mongoose.model('Address', addressSchema);

export default Address;
