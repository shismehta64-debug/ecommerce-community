import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Users ───────────────────────────────────────────────

  const adminPassword = await bcrypt.hash('admin123', 12);
  const memberPassword = await bcrypt.hash('member123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@communityconnect.in' },
    update: {},
    create: {
      fullName: 'Rajesh Patel',
      email: 'admin@communityconnect.in',
      phone: '9876543210',
      passwordHash: adminPassword,
      city: 'Surat',
      state: 'Gujarat',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: 'member@communityconnect.in' },
    update: {},
    create: {
      fullName: 'Priya Shah',
      email: 'member@communityconnect.in',
      phone: '9876543211',
      passwordHash: memberPassword,
      city: 'Surat',
      state: 'Gujarat',
      role: 'MEMBER',
      isVerified: true,
    },
  });

  const farmer = await prisma.user.upsert({
    where: { email: 'farmer@communityconnect.in' },
    update: {},
    create: {
      fullName: 'Bhavesh Desai',
      email: 'farmer@communityconnect.in',
      phone: '9876543212',
      passwordHash: memberPassword,
      city: 'Navsari',
      state: 'Gujarat',
      role: 'MEMBER',
      isVerified: true,
    },
  });

  console.log('✅ Users seeded');

  // ─── Industry ────────────────────────────────────────────

  const business1 = await prisma.business.create({
    data: {
      ownerId: admin.id,
      businessName: 'Surat Textile Hub',
      segment: 'TEXTILE',
      description: 'Premium quality textile manufacturing and export. Specializing in silk, cotton, and synthetic fabrics for wholesale and retail markets.',
      city: 'Surat',
      state: 'Gujarat',
      address: 'Ring Road, Textile Market, Surat - 395002',
      contactPhone: '9876543210',
      whatsappNumber: '9876543210',
      contactEmail: 'info@surattextilehub.com',
      isVerified: true,
    },
  });

  await prisma.industryProduct.createMany({
    data: [
      {
        businessId: business1.id,
        name: 'Pure Silk Saree Fabric',
        description: 'High-quality pure silk fabric for saree manufacturing. Available in various colors and patterns.',
        category: 'Silk Fabrics',
        priceRange: '₹500 - ₹2000 per meter',
        unit: 'Meter',
        images: [],
        moq: '100 meters',
      },
      {
        businessId: business1.id,
        name: 'Cotton Polyester Blend',
        description: 'Durable cotton-polyester blend fabric suitable for shirts and kurtas.',
        category: 'Blended Fabrics',
        priceRange: '₹150 - ₹400 per meter',
        unit: 'Meter',
        images: [],
        moq: '200 meters',
      },
    ],
  });

  const business2 = await prisma.business.create({
    data: {
      ownerId: member.id,
      businessName: 'Diamond Star Jewellers',
      segment: 'DIAMOND_JEWELLERY',
      description: 'Expert diamond cutting, polishing and jewellery manufacturing. GIA certified diamonds available.',
      city: 'Surat',
      state: 'Gujarat',
      address: 'Varachha Road, Mini Bazaar, Surat - 395006',
      contactPhone: '9876543211',
      contactEmail: 'diamonds@diamondstar.in',
      isVerified: true,
    },
  });

  await prisma.industryProduct.create({
    data: {
      businessId: business2.id,
      name: 'Round Brilliant Cut Diamond',
      description: 'Premium round brilliant cut diamonds, 0.5 to 2 carat range. VVS1-VS2 clarity.',
      category: 'Cut Diamonds',
      priceRange: '₹25,000 - ₹5,00,000 per carat',
      unit: 'Carat',
      images: [],
      moq: '10 carats',
    },
  });

  console.log('✅ Industry businesses & products seeded');

  // ─── Farmer Produce ──────────────────────────────────────

  await prisma.farmerProduce.createMany({
    data: [
      {
        ownerId: farmer.id,
        cropName: 'Fresh Tomatoes',
        category: 'VEGETABLE',
        pricePerUnit: 30,
        unit: 'KG',
        quantityAvailable: 500,
        harvestDate: new Date('2026-06-28'),
        village: 'Jalalpore',
        city: 'Navsari',
        images: [],
        isOrganic: true,
      },
      {
        ownerId: farmer.id,
        cropName: 'Alphonso Mangoes',
        category: 'FRUIT',
        pricePerUnit: 600,
        unit: 'DOZEN',
        quantityAvailable: 200,
        harvestDate: new Date('2026-05-15'),
        village: 'Gandevi',
        city: 'Navsari',
        images: [],
        isOrganic: false,
      },
      {
        ownerId: admin.id,
        cropName: 'Organic Wheat',
        category: 'GRAIN',
        pricePerUnit: 2800,
        unit: 'QUINTAL',
        quantityAvailable: 50,
        harvestDate: new Date('2026-04-10'),
        village: 'Bardoli',
        city: 'Surat',
        images: [],
        isOrganic: true,
      },
    ],
  });

  console.log('✅ Farmer produce seeded');

  // ─── Women Entrepreneur Products ─────────────────────────

  await prisma.womenProduct.createMany({
    data: [
      {
        ownerId: member.id,
        name: 'Handmade Gujarati Pickle Combo',
        description: 'Authentic homemade pickle combo — Mango, Chilli, and Mixed vegetable. No preservatives, made with traditional recipes.',
        category: 'FOOD_PICKLES',
        price: 350,
        stockQuantity: 100,
        images: [],
      },
      {
        ownerId: member.id,
        name: 'Bandhani Dupatta',
        description: 'Beautiful hand-tied Bandhani dupatta in vibrant colors. Traditional Gujarati craft.',
        category: 'CLOTHING_BOUTIQUE',
        price: 800,
        stockQuantity: 50,
        images: [],
      },
      {
        ownerId: member.id,
        name: 'Handcrafted Wooden Wall Art',
        description: 'Intricately carved wooden wall art featuring traditional Gujarati motifs. Perfect for home decoration.',
        category: 'HOME_DECOR',
        price: 1500,
        stockQuantity: 25,
        images: [],
      },
    ],
  });

  console.log('✅ Women entrepreneur products seeded');

  // ─── Social Work Services ────────────────────────────────

  await prisma.socialService.createMany({
    data: [
      {
        ownerId: admin.id,
        providerType: 'INDIVIDUAL',
        serviceName: 'Free Math & Science Tuition',
        category: 'EDUCATION_TUITION',
        description: 'Free tuition classes for students from Class 8-12 in Mathematics and Science. Evening batches available.',
        schedule: 'Mon-Fri 5:00 PM - 7:00 PM',
        city: 'Surat',
        address: 'Community Hall, Adajan, Surat',
        contactPhone: '9876543210',
      },
      {
        ownerId: member.id,
        providerType: 'NGO',
        serviceName: 'Free Health Checkup Camp',
        category: 'HEALTHCARE_CAMP',
        description: 'Monthly free health checkup camp including blood pressure, sugar, and eye testing. Open to all community members.',
        schedule: 'First Sunday of every month, 9:00 AM - 2:00 PM',
        city: 'Surat',
        address: 'Community Center, Varachha, Surat',
        contactPhone: '9876543211',
      },
      {
        ownerId: farmer.id,
        providerType: 'INDIVIDUAL',
        serviceName: 'Organic Farming Training',
        category: 'SKILL_TRAINING',
        description: 'Free hands-on training in organic farming techniques, composting, and natural pest control for aspiring farmers.',
        schedule: 'Saturdays 8:00 AM - 12:00 PM',
        city: 'Navsari',
        address: 'Agricultural Extension Center, Navsari',
        contactPhone: '9876543212',
      },
    ],
  });

  console.log('✅ Social work services seeded');

  // ─── Families (Social Contacts) ──────────────────────────

  const family1 = await prisma.family.create({
    data: {
      headOfFamilyUserId: admin.id,
      familyName: 'Patel Family',
      nativePlace: 'Bardoli',
      currentCity: 'Surat',
      currentState: 'Gujarat',
      currentAddress: '204, Shreeji Apartment, Adajan, Surat - 395009',
      contactPhone: '9876543210',
      contactEmail: 'admin@communityconnect.in',
      isPublic: true,
    },
  });

  await prisma.familyMember.createMany({
    data: [
      {
        familyId: family1.id,
        fullName: 'Rajesh Patel',
        relation: 'SELF',
        gender: 'MALE',
        dob: new Date('1980-05-15'),
        education: 'B.E. Computer Engineering',
        profession: 'Software Engineer',
        companyName: 'TCS',
        maritalStatus: 'MARRIED',
        bio: 'Head of family, working in IT sector for 20+ years.',
      },
      {
        familyId: family1.id,
        fullName: 'Meena Patel',
        relation: 'SPOUSE',
        gender: 'FEMALE',
        dob: new Date('1983-08-22'),
        education: 'M.A. Gujarati Literature',
        profession: 'Teacher',
        companyName: 'Sarvajanik School',
        maritalStatus: 'MARRIED',
        bio: 'Passionate educator teaching Gujarati literature for 15 years.',
      },
      {
        familyId: family1.id,
        fullName: 'Arjun Patel',
        relation: 'SON',
        gender: 'MALE',
        dob: new Date('2005-01-10'),
        education: 'Class 12 Science',
        profession: 'Student',
        maritalStatus: 'SINGLE',
        bio: 'Aspiring engineer, preparing for JEE.',
      },
    ],
  });

  const family2 = await prisma.family.create({
    data: {
      headOfFamilyUserId: member.id,
      familyName: 'Shah Family',
      nativePlace: 'Ahmedabad',
      currentCity: 'Surat',
      currentState: 'Gujarat',
      currentAddress: '502, Harmony Heights, Vesu, Surat - 395007',
      contactPhone: '9876543211',
      isPublic: true,
    },
  });

  await prisma.familyMember.createMany({
    data: [
      {
        familyId: family2.id,
        fullName: 'Priya Shah',
        relation: 'SELF',
        gender: 'FEMALE',
        dob: new Date('1990-11-03'),
        education: 'MBA Finance',
        profession: 'Business Owner',
        companyName: 'Shah Enterprises',
        maritalStatus: 'MARRIED',
        bio: 'Running a successful home-based business selling traditional handicrafts and pickles.',
      },
      {
        familyId: family2.id,
        fullName: 'Karan Shah',
        relation: 'SPOUSE',
        gender: 'MALE',
        dob: new Date('1988-03-17'),
        education: 'B.Com',
        profession: 'Chartered Accountant',
        companyName: 'Shah & Associates',
        maritalStatus: 'MARRIED',
        bio: 'Chartered Accountant with 12 years of experience.',
      },
    ],
  });

  console.log('✅ Families & members seeded');

  console.log('\n🎉 Database seeding completed!');
  console.log('\n📋 Test credentials:');
  console.log('   Admin: admin@communityconnect.in / admin123');
  console.log('   Member: member@communityconnect.in / member123');
  console.log('   Farmer: farmer@communityconnect.in / member123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
