import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    description: {
        type: String,
        trim: true,
        maxLength: 500
    },
    category: {
        type: String,
        enum: [
            "Electronics & Tech",
            "Clothing & Fashion", 
            "Home & Garden",
            "Automotive & Vehicle Parts",
            "Books & Media",
            "Sports & Recreation",
            "Health & Beauty",
            "Toys & Games",
            "Art & Crafts",
            "Kitchen & Dining",
            "Office Supplies",
            "Jewelry & Accessories",
            "Musical Instruments",
            "Pet Supplies",
            "Tools & Hardware",
            "Other"
        ]
    },
    keywords: [{
        type: String,
        trim: true
    }],
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: true
    },
    mobile: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^[\+]?[1-9][\d]{0,15}$/.test(v);
            },
            message: "Mobile number is not valid"
        }
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        pincode: String
    },
    logo: {
        type: String,
        default: ""
    },
    banner: {
        type: String,
        default: ""
    },    status: {
        type: String,
        enum: ["active", "inactive", "pending", "suspended", "dormant", "archived"],
        default: "active"
    },
    dormancyReason: {
        type: String,
        default: ""
    },
    dormancyDate: {
        type: Date
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    totalProducts: {
        type: Number,
        default: 0
    },
    socialLinks: {
        website: String,
        facebook: String,
        instagram: String,
        twitter: String
    },
    operatingHours: {
        monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        sunday: { open: String, close: String, isOpen: { type: Boolean, default: false } }
    },
    verified: {
        type: Boolean,
        default: false
    },
    featured: {
        type: Boolean,
        default: false
    }
}, { 
    timestamps: true 
});

// Index for search functionality
shopSchema.index({ name: 'text', description: 'text', keywords: 'text' });
shopSchema.index({ category: 1 });
shopSchema.index({ status: 1 });
shopSchema.index({ rating: -1 });

const ShopModel = mongoose.model("shop", shopSchema);

export default ShopModel;
