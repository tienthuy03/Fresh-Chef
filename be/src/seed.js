const { sequelize } = require('./models');
const User = require('./models/User');
const Recipe = require('./models/Recipe');
const Review = require('./models/Review');
const Comment = require('./models/Comment');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    const isForce = process.argv.includes('--force');
    
    // Sync database
    // If --force is passed, it will drop tables and recreate them
    await sequelize.sync({ force: isForce });
    console.log(isForce ? 'Database reset and synced (tables recreated)' : 'Database synced (existing data preserved)');

    // Create sample users if not exists
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
    }

    const existingAdmin2 = await User.findOne({ where: { username: 'Admin' } });
    if (!existingAdmin2) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        email: 'admin2@example.com',
        password: hashedPassword,
        username: 'Admin',
        fullName: 'Admin User'
      });
      console.log('Admin user created: Admin / admin123');
    } else {
      console.log('Admin user (capitalized) already exists, skipping...');
    }

    // Dynamic Seeding of custom users from fe/data
    const fs = require('fs');
    const path = require('path');
    const feDataPath = path.join(__dirname, '../../fe/data');
    if (fs.existsSync(feDataPath)) {
      try {
        const rawData = fs.readFileSync(feDataPath, 'utf8');
        const customUsers = JSON.parse(rawData);
        console.log(`Found ${customUsers.length} custom users in fe/data. Seeding...`);
        for (const u of customUsers) {
          const existing = await User.findOne({ where: { username: u.username } });
          if (!existing) {
            const hashedPassword = await bcrypt.hash(u.password || '123456', 10);
            await User.create({
              username: u.username,
              password: hashedPassword,
              email: u.email || null,
              fullName: u.fullName || ''
            });
            console.log(`Successfully seeded user: ${u.username} (${u.fullName})`);
          } else {
            console.log(`User ${u.username} already exists, skipping...`);
          }
        }
      } catch (e) {
        console.error('Error reading custom users from fe/data:', e);
      }
    }

    // Create sample recipes if table is empty
    const recipeCount = await Recipe.count();
    if (recipeCount === 0) {
      const recipes = [
        {
          title: 'Phở Bò Hà Nội',
          description: 'Món ăn truyền thống nổi tiếng của Việt Nam',
          image_url: 'https://vcdn1-dulich.vnecdn.net/2022/06/03/pho-bo-1-1654245464.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=4G9S9S6S6S6S6S6S6S6S6Q',
          video_url: 'https://www.youtube.com/watch?v=s0LpH26wB1k',
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
          image_url: 'https://statics.vinpearl.com/banh-mi-hoi-an-1_1629270514.jpg',
          video_url: 'https://www.youtube.com/watch?v=3y837Zt23Q0',
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

    // Seed Sample Posts (Reviews) and Comments
    const reviewCount = await Review.count();
    if (reviewCount === 0) {
      console.log('Seeding sample community posts...');
      
      // Fetch users and recipes
      const usersList = await User.findAll();
      const recipesList = await Recipe.findAll();
      
      if (usersList.length > 0 && recipesList.length > 0) {
        // Map users by username for easy lookup
        const userMap = {};
        usersList.forEach(u => {
          userMap[u.username] = u;
        });
        
        // Find some recipes
        const phoBo = recipesList.find(r => r.title.includes('Phở')) || recipesList[0];
        const banhMi = recipesList.find(r => r.title.includes('Bánh mì') || r.title.includes('Bánh Mì')) || recipesList[0];
        const caCom = recipesList.find(r => r.title.includes('Cá') || r.title.includes('cá')) || recipesList[0];
        const suonNuong = recipesList.find(r => r.title.includes('nướng') || r.title.includes('Nướng')) || recipesList[0];
        const che = recipesList.find(r => r.title.includes('Chè') || r.title.includes('chè')) || recipesList[0];
        
        // Create Reviews
        const reviewsData = [
          {
            username: 'nguyenvanan',
            recipe: phoBo,
            content: 'Chiều nay tự tay làm món Phở Bò Hà Nội đãi cả nhà theo công thức chuẩn của app. Nước dùng thơm lừng mùi gừng nướng, thảo quả và hồi. Thịt bò chín tái mềm ngọt ngọt. Cả nhà ai cũng khen ngon hết lời, tự hào quá!',
            rating: 5,
            images: ['https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop'],
            likes: 12
          },
          {
            username: 'tranminhquan',
            recipe: caCom,
            content: 'Công nhận công thức làm món kho tiêu này chuẩn vị quê hương ghê! Cá kho tộ sền sệt, cay nồng mùi tiêu đen, ăn cùng bát cơm trắng nóng hổi giữa trời mưa thì hao cơm vô cùng luôn á cả nhà. Mọi người nhất định phải thử nha!',
            rating: 5,
            images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop'],
            likes: 8
          },
          {
            username: 'lehoangphuc',
            recipe: banhMi,
            content: 'Hôm nay cuối tuần rảnh rỗi mình làm thử món bánh mì Hội An đãi tụi bạn. Vỏ bánh nướng lại giòn rụm, pate béo ngậy, thịt xá xíu đậm đà kết hợp rau thơm tươi rói ngon đỉnh cao luôn! Công thức chuẩn chỉnh dễ làm lắm ạ.',
            rating: 5,
            images: ['https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop'],
            likes: 15
          },
          {
            username: 'phamgiahuy',
            recipe: suonNuong,
            content: 'Món sườn nướng ngũ vị bằng nồi chiên không dầu siêu nhanh cho ngày bận rộn. Sườn ướp thấm vị, nướng chín vàng đều bên ngoài, bên trong thịt vẫn mềm mọng không bị khô xíu nào cả. Đơn giản mà cực đưa cơm!',
            rating: 5,
            images: ['https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop'],
            likes: 6
          },
          {
            username: 'dokhanhlinh',
            recipe: che,
            content: 'Vừa nấu xong nồi chè thanh mát giải nhiệt cho cả nhà trong ngày hè oi bức. Vị ngọt thanh thanh nhẹ nhàng từ đường phèn, hạt sen chín bùi dẻo, củ sen giòn giòn ăn kèm đá lạnh thì tuyệt vời ông mặt trời luôn ạ 🌸',
            rating: 5,
            images: ['https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop'],
            likes: 10
          }
        ];
        
        for (const rd of reviewsData) {
          const author = userMap[rd.username] || usersList[0];
          const review = await Review.create({
            content: rd.content,
            rating: rd.rating,
            images: JSON.stringify(rd.images),
            likes: rd.likes,
            commentsCount: 0,
            UserId: author.id,
            RecipeId: rd.recipe ? rd.recipe.id : recipesList[0].id
          });
          
          // Seed some comments on the posts
          if (rd.username === 'nguyenvanan') {
            const commentUser1 = userMap['dokhanhlinh'] || usersList[0];
            const commentUser2 = userMap['tranminhquan'] || usersList[0];
            
            await Comment.create({
              content: 'Nhìn bát phở hấp dẫn quá anh An ơi! Màu nước lèo trong veo đẹp quá.',
              UserId: commentUser1.id,
              ReviewId: review.id
            });
            await Comment.create({
              content: 'Quá đỉnh luôn bác! Nhìn không khác gì ngoài tiệm phở nổi tiếng cả.',
              UserId: commentUser2.id,
              ReviewId: review.id
            });
            review.commentsCount = 2;
            await review.save();
          } else if (rd.username === 'tranminhquan') {
            const commentUser = userMap['nguyenvanan'] || usersList[0];
            await Comment.create({
              content: 'Nhìn đĩa cá kho tiêu hấp dẫn thế này thì chắc bay sạch nồi cơm rồi bác Quân ơi 😂',
              UserId: commentUser.id,
              ReviewId: review.id
            });
            review.commentsCount = 1;
            await review.save();
          } else if (rd.username === 'lehoangphuc') {
            const commentUser = userMap['phamgiahuy'] || usersList[0];
            await Comment.create({
              content: 'Bánh mì nhìn giòn ngon thế! Bữa nào rủ anh em qua làm bữa tiệc bánh mì đi Phúc.',
              UserId: commentUser.id,
              ReviewId: review.id
            });
            review.commentsCount = 1;
            await review.save();
          }
        }
        console.log('Seeded sample community posts and comments successfully!');
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
