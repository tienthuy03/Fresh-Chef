const { sequelize } = require('./models');
const User = require('./models/User');
const Recipe = require('./models/Recipe');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    const isForce = process.argv.includes('--force');
    
    // Sync database
    // If --force is passed, it will drop tables and recreate them
    await sequelize.sync({ force: isForce });
    console.log(isForce ? 'Database reset and synced (tables recreated)' : 'Database synced (existing data preserved)');

    // Create a sample user if not exists
    const adminEmail = 'admin@example.com';
    const existingUser = await User.findOne({ where: { email: adminEmail } });
    
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        email: adminEmail,
        password: hashedPassword,
        username: 'admin',
        fullName: 'System Administrator'
      });
      console.log('Sample user created: admin@example.com / password123');
    } else {
      console.log('Admin user already exists, skipping...');
    }

    // Create sample recipes if table is empty
    const recipeCount = await Recipe.count();
    if (recipeCount === 0) {
      const recipes = [
        {
          title: 'Phở Bò Hà Nội',
          description: 'Món ăn truyền thống nổi tiếng của Việt Nam',
          image: 'https://vcdn1-dulich.vnecdn.net/2022/06/03/pho-bo-1-1654245464.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=4G9S9S6S6S6S6S6S6S6S6Q',
          ingredients: JSON.stringify([
            { name: 'Bánh phở', quantity: '500g' },
            { name: 'Thịt bò thăn', quantity: '300g' },
            { name: 'Xương ống bò', quantity: '1kg' },
            { name: 'Gừng', quantity: '1 củ lớn' },
            { name: 'Hành tây', quantity: '2 củ' },
            { name: 'Hoa hồi, quế, thảo quả', quantity: '1 ít' }
          ]),
          steps: JSON.stringify([
            'Ninh xương ống trong 8 tiếng để lấy nước dùng',
            'Nướng gừng và hành tây cho thơm rồi cho vào nồi nước dùng',
            'Thêm gia vị hồi, quế, thảo quả',
            'Chần bánh phở, xếp thịt bò tái lên trên',
            'Chan nước dùng nóng hổi và thưởng thức'
          ]),
          sourceUrl: 'https://cookpad.com/vn/cong-thuc/12345'
        },
        {
          title: 'Bánh Mì Hội An',
          description: 'Bánh mì kẹp đầy đủ topping đặc sản Hội An',
          image: 'https://statics.vinpearl.com/banh-mi-hoi-an-1_1629270514.jpg',
          ingredients: JSON.stringify([
            { name: 'Bánh mì giòn', quantity: '2 ổ' },
            { name: 'Pate gan', quantity: '50g' },
            { name: 'Chả lụa', quantity: '100g' },
            { name: 'Thịt xá xíu', quantity: '100g' },
            { name: 'Dưa chuột, rau thơm', quantity: '1 ít' },
            { name: 'Nước sốt đặc trưng', quantity: '3 muỗng' }
          ]),
          steps: JSON.stringify([
            'Nướng bánh mì cho giòn',
            'Phết pate và bơ vào ruột bánh',
            'Xếp thịt xá xíu, chả lụa vào',
            'Thêm rau dưa và rưới nước sốt đặc trưng'
          ]),
          sourceUrl: 'https://cookpad.com/vn/cong-thuc/67890'
        }
      ];

      await Recipe.bulkCreate(recipes);
      console.log('Sample recipes added');
    } else {
      console.log(`Database already has ${recipeCount} recipes, skipping sample data...`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
