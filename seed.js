require('dotenv').config();
const mongoose = require('mongoose');
const Coupon = require('./models/Coupon');
const connectDB = require('./config/db');

const seedCoupons = async () => {
  await connectDB();
  
  const coupons = [
    { code: 'WELCOME10', name: 'Amazon Gift Card', description: '$10 Amazon Gift Card', requiredCredits: 50, discountValue: '$10' },
    { code: 'UDEMY100', name: 'Udemy Free Course', description: 'Get any course on Udemy for free', requiredCredits: 100, discountValue: '100% Off' },
    { code: 'COFFEE5', name: 'Starbucks Coffee', description: 'Free tall coffee at Starbucks', requiredCredits: 30, discountValue: 'Free Coffee' },
    { code: 'NETFLIX1M', name: 'Netflix Subscription', description: '1 Month Free Netflix Standard Plan', requiredCredits: 150, discountValue: 'Free Month' },
    { code: 'WAFFLE20', name: 'Belgian Waffle', description: 'Flat 20% off on your favorite waffles', requiredCredits: 20, discountValue: '20% Off' },
    { code: 'DOMINOS50', name: 'Dominos Pizza', description: 'Get 50% off up to $5 on any medium pizza', requiredCredits: 40, discountValue: '50% Off' },
    { code: 'KEVENTERSB1G1', name: 'Keventers', description: 'Buy 1 Get 1 Free on Large Shakes', requiredCredits: 35, discountValue: 'B1G1 Free' },
    { code: 'CHAINAGRI10', name: 'Chai Nagri', description: 'Free Kulhad Chai with any snack', requiredCredits: 15, discountValue: 'Free Chai' },
    { code: 'SHEREPUNJAB25', name: 'Sher E Punjab', description: 'Flat 25% off on your total dinner bill', requiredCredits: 60, discountValue: '25% Off' },
    { code: 'MYNTRA500', name: 'Myntra Gift Voucher', description: 'Flat ₹500 off on fashion apparel', requiredCredits: 80, discountValue: '₹500 Off' },
    { code: 'HNM15', name: 'H&M Discount', description: 'Extra 15% off on sale items', requiredCredits: 50, discountValue: '15% Off' },
    { code: 'BARISTA20', name: 'Barista Cafe', description: 'Flat 20% off on all beverages', requiredCredits: 25, discountValue: '20% Off' },
    { code: 'FIRSTCOFFEEFREE', name: 'First Coffee', description: '100% Free Artisan Coffee Cup', requiredCredits: 30, discountValue: 'Free Cup' }
  ];

  for (let c of coupons) {
    const existing = await Coupon.findOne({ code: c.code });
    if (!existing) {
      await Coupon.create(c);
      console.log(`Seeded coupon: ${c.name}`);
    }
  }

  console.log('Seeding done.');
  process.exit();
};

seedCoupons();
