const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');

const router = express.Router();

// Local smart fallback answers for kitchen emergencies
const FALLBACK_ANSWERS = [
  {
    keywords: ['mặn', 'muối', 'nước mắm'],
    answer: "👨‍🍳 *Cứu món bị mặn:*\n1. **Dùng khoai tây:** Cắt lát một củ khoai tây sống thả vào nồi canh/kho trong 10 phút. Khoai tây sẽ hút bớt muối thừa cực tốt.\n2. **Dùng axit tự nhiên:** Thêm vài giọt nước cốt chanh hoặc giấm gạo để trung hòa vị mặn.\n3. **Dùng đường/mật ong:** Thêm một chút chất ngọt để giảm độ gắt của muối.\n4. **Thêm nước:** Nếu là món súp/canh, có thể thêm nước dùng nhạt và đun sôi lại."
  },
  {
    keywords: ['cay', 'ớt', 'tiêu'],
    answer: "👨‍🍳 *Cứu món bị quá cay:*\n1. **Thêm vị chua:** Vắt thêm nước cốt chanh, tắc (quất) hoặc giấm. Axit tự nhiên giúp giảm nhiệt vị cay rất nhanh.\n2. **Thêm chất béo:** Thêm chút nước cốt dừa, bơ hoặc sữa tươi (với các món cà ri, súp). Chất béo làm tan capsaicin trong ớt.\n3. **Thêm đường/mật ong:** Vị ngọt nhẹ sẽ át bớt cảm giác cay nóng trên lưỡi.\n4. **Bổ sung rau củ:** Thêm cà rốt, khoai tây hoặc củ cải đun cùng để hút bớt chất cay."
  },
  {
    keywords: ['cháy', 'khét', 'dính nồi'],
    answer: "👨‍🍳 *Cứu món bị cháy khét:*\n1. **Tắt bếp ngay:** Ngừng đun để khói cháy không thấm sâu vào đồ ăn.\n2. **Chuyển nồi:** Múc phần thức ăn lành lặn phía trên sang một chiếc nồi mới sạch sẽ. Tuyệt đối **không cạo** phần bị cháy ở đáy nồi.\n3. **Khử mùi khét:** Phi thơm hành, tỏi, hoặc thêm nước sốt đậm đà (như sốt cà chua, sốt tiêu đen) vào phần ăn mới đun lại để át mùi khét.\n4. **Dùng khăn ẩm:** Đặt một chiếc khăn ẩm lên nắp nồi mới đun để hút bớt mùi ám."
  },
  {
    keywords: ['ngọt', 'đường'],
    answer: "👨‍🍳 *Cứu món bị quá ngọt:*\n1. **Tăng vị chua:** Thêm nước cốt chanh hoặc giấm táo giúp cân bằng độ ngọt gắt.\n2. **Tăng vị mặn:** Thêm một chút muối hoặc nước mắm từ từ từng chút một để kéo vị ngọt xuống.\n3. **Pha loãng:** Thêm nước lọc hoặc nước dùng không nêm nếm vào đun sôi lại."
  },
  {
    keywords: ['thay thế', 'thay bằng', 'thay thế nguyên liệu'],
    answer: "👨‍🍳 *Mẹo thay thế nguyên liệu phổ biến trong bếp:*\n* **Thay Bột năng:** Sử dụng bột ngô (bột bắp) hoặc bột sắn dây tỷ lệ 1:1.\n* **Thay Nước cốt dừa:** Dùng sữa tươi nguyên kem trộn với một chút bơ nhạt.\n* **Thay Giấm:** Dùng chanh, quất hoặc giấm táo tỷ lệ tương đương.\n* **Thay Hành tây:** Dùng hành tím hoặc phần đầu hành lá phi thơm."
  },
  {
    keywords: ['dầu', 'mỡ', 'ngấy', 'béo'],
    answer: "👨‍🍳 *Cứu món bị quá nhiều dầu mỡ (ngấy):*\n1. **Dùng đá lạnh:** Thả vài viên đá lạnh to vào nồi canh/súp đang sôi lăn tăn, dùng vá vớt thật nhanh. Dầu mỡ gặp lạnh đông lại sẽ bám chặt vào viên đá!\n2. **Dùng giấy thấm dầu:** Đặt nhẹ tờ giấy thấm dầu ẩm lên bề mặt nước dùng để hút váng mỡ.\n3. **Dùng lòng trắng trứng:** Cho lòng trắng trứng đánh nhẹ vào nồi súp đun sôi, lòng trắng đông lại sẽ hút sạch cặn bẩn và váng mỡ thừa, sau đó vớt bỏ đi."
  },
  {
    keywords: ['chua', 'chanh', 'giấm', 'tắc', 'quất'],
    answer: "👨‍🍳 *Cứu món bị chua quá:*\n1. **Dùng chất ngọt:** Thêm chút đường, mật ong hoặc nước mía để làm dịu vị chua gắt.\n2. **Dùng chất béo:** Thêm dầu ăn, bơ hoặc nước cốt dừa đối với các món canh/kho để giảm bớt độ chua trên lưỡi.\n3. **Dùng bột baking soda:** Thêm một lượng cực nhỏ baking soda (khoảng 1/4 thìa cà phê) để trung hòa axit tự nhiên của món canh/súp."
  },
  {
    keywords: ['đắng', 'khổ qua', 'mật'],
    answer: "👨‍🍳 *Xử lý món bị đắng quá:*\n1. **Thêm vị ngọt & mặn:** Một chút đường kết hợp một xíu muối sẽ đánh lừa vị giác giúp át đi vị đắng gắt.\n2. **Dùng chất béo:** Thêm bơ, sữa hoặc kem tươi sẽ giúp bao bọc lưỡi và giảm cảm nhận vị đắng.\n3. **Dùng gia vị thơm:** Tăng cường tỏi phi, hành phi, hoặc rau thơm đậm đà để lấn át mùi đắng."
  },
  {
    keywords: ['tanh', 'cá', 'hải sản', 'thịt bò'],
    answer: "👨‍🍳 *Khử mùi tanh cho thực phẩm:*\n1. **Ngâm nước vo gạo / muối:** Ngâm cá trong nước vo gạo hoặc nước muối loãng 10 phút trước khi chế biến.\n2. **Dùng gừng & rượu:** Rửa cá/thịt với một chút rượu trắng và gừng đập dập giúp bay sạch mùi tanh khó chịu.\n3. **Dùng thảo mộc thơm:** Sử dụng sả, lá chanh, hoặc thì là khi hấp/luộc để khử hoàn toàn mùi tanh hải sản."
  },
  {
    keywords: ['rã đông', 'đông đá', 'đông lạnh', 'tủ đông'],
    answer: "👨‍🍳 *Mẹo rã đông thực phẩm siêu tốc & an toàn:*\n1. **Dùng nước ấm và muối:** Pha nước ấm khoảng 40 độ kèm một thìa muối, ngâm thịt trong túi kín. Rã đông nhanh và giữ thịt tươi ngon.\n2. **Dùng hai nồi nhôm:** Úp ngược một chiếc nồi nhôm, đặt miếng thịt lên đáy nồi, rồi đặt chiếc nồi nhôm thứ hai chứa nước nóng lên trên thịt. Nhôm dẫn nhiệt cực nhanh giúp rã đông trong 10 phút!\n3. **Dùng lò vi sóng:** Chọn chế độ rã đông chuyên dụng và chế biến ngay lập tức sau khi rã đông để tránh vi khuẩn."
  },
  {
    keywords: ['luộc trứng', 'trứng luộc', 'lòng đào'],
    answer: "👨‍🍳 *Bí quyết luộc trứng hoàn hảo (Tính từ khi nước sôi):*\n1. **Trứng lòng đào chảy (Soft boiled):** Luộc đúng **5-6 phút**, vớt ra ngâm nước đá lạnh ngay.\n2. **Trứng dẻo, lòng đỏ sền sệt (Medium boiled):** Luộc đúng **7-8 phút**.\n3. **Trứng chín hoàn toàn (Hard boiled):** Luộc từ **10-12 phút**.\n* **Mẹo bóc vỏ dễ dàng:** Thêm chút muối hoặc giấm vào nước luộc trứng!"
  },
  {
    keywords: ['bảo quản', 'héo', 'tươi lâu', 'rau úa'],
    answer: "👨‍🍳 *Mẹo giữ rau củ tươi lâu & hồi sinh rau héo:*\n1. **Hồi sinh rau héo:** Ngâm rau vào thau nước đá lạnh pha thêm 1 thìa đường trong 15-20 phút, rau sẽ hút nước và giòn tươi trở lại.\n2. **Bảo quản rau thơm:** Rửa sạch, để ráo hoàn toàn, bọc trong khăn giấy ẩm rồi cho vào túi zip kín trữ tủ lạnh.\n3. **Bảo quản hành tỏi:** Để nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp và tuyệt đối **không** cho vào túi nilon bị bịt kín."
  },
  {
    keywords: ['cơm', 'nhão', 'khô', 'sống'],
    answer: "👨‍🍳 *Mẹo chữa cơm bị nhão hoặc bị sống (khô):*\n1. **Chữa cơm nhão:** Đặt vài lát bánh mì gối (sandwich) lên bề mặt cơm rồi đậy nắp lại đun tiếp 5 phút. Bánh mì sẽ hút sạch hơi nước dư thừa cực tốt!\n2. **Chữa cơm bị sống/khô:** Xới tơi cơm, rưới đều khoảng 1-2 thìa canh rượu trắng lên rồi đậy nắp đun lửa nhỏ nhất 5-10 phút. Hơi rượu bay đi sẽ làm cơm chín mềm mà không hề ám mùi rượu."
  },
  {
    keywords: ['rau luộc', 'xanh', 'thâm'],
    answer: "👨‍🍳 *Mẹo luộc rau xanh mướt, giòn ngọt:*\n1. **Đợi nước thật sôi:** Chỉ cho rau vào khi nước đã sôi sùng sục và đun lửa lớn không đậy nắp.\n2. **Thêm muối & dầu ăn:** Thêm 1 thìa muối (giúp giữ màu xanh) và vài giọt dầu ăn (tạo độ bóng bẩy) vào nước luộc.\n3. **Sốc nhiệt nước đá:** Vớt rau ra thả ngay vào thau nước đá lạnh 2 phút trước khi bày ra đĩa. Rau sẽ cực kỳ xanh và giòn tan!"
  },
  {
    keywords: ['đục', 'nước dùng', 'nước lèo', 'trong'],
    answer: "👨‍🍳 *Mẹo xử lý nước dùng bị đục:*\n1. **Dùng lòng trắng trứng:** Cho một lòng trắng trứng đánh nhẹ vào nồi nước dùng âm ấm, đun sôi lăn tăn. Lòng trắng đông lại sẽ hút sạch mọi cặn đục, sau đó bạn chỉ cần vớt bỏ lòng trắng đi.\n2. **Dùng nấm đông cô / hành tây:** Cho vài lát nấm đông cô hoặc hành tây nướng cháy xém vào đun cùng, chúng giúp hút cặn và làm nước thơm trong vắt.\n3. **Lọc qua khăn:** Dùng một tấm vải xô/khăn lọc sạch mỏng để lọc nước dùng qua nồi khác."
  },
  {
    keywords: ['luộc gà', 'gà luộc', 'da giòn'],
    answer: "👨‍🍳 *Bí quyết luộc gà vàng giòn, không nứt da:*\n1. **Luộc từ nước lạnh:** Cho gà vào luộc ngay từ khi nước còn lạnh, thêm vài lát gừng và hành củ đập dập.\n2. **Đun lửa nhỏ:** Khi nước sôi, hạ nhỏ lửa đun lăn tăn 15-20 phút, sau đó tắt bếp và ngâm gà trong nồi thêm 15 phút.\n3. **Tắm đá & xoa nghệ:** Vớt gà ra ngâm ngay vào thau nước đá lạnh 5 phút để da giòn dai. Sau đó vớt ra để ráo, xoa đều một chút mỡ gà trộn nước cốt nghệ để da vàng óng căng bóng!"
  },
  {
    keywords: ['xào', 'nước', 'nhão'],
    answer: "👨‍🍳 *Mẹo xào rau củ giòn ngon, không bị ra nước:*\n1. **Xào lửa cực lớn:** Đun chảo thật nóng, cho dầu ăn vào phi thơm tỏi rồi xào nhanh tay với lửa lớn nhất có thể.\n2. **Ráo nước hoàn toàn:** Đảm bảo rau củ sau khi rửa phải để thật ráo nước trước khi cho vào chảo xào.\n3. **Nêm gia vị cuối cùng:** Chỉ nêm muối/nước mắm vào **phút cuối cùng** trước khi tắt bếp. Nêm muối quá sớm sẽ khiến rau bị ra nước và dai nhách."
  },
  {
    keywords: ['phi hành', 'phi tỏi', 'giòn'],
    answer: "👨‍🍳 *Cách phi hành tỏi giòn rụm, vàng đều không đắng:*\n1. **Thái đều tay:** Thái lát hành/tỏi thật đều nhau để khi phi chín đều cùng lúc.\n2. **Dùng lượng dầu vừa đủ:** Dầu ăn phải ngập mặt hành/tỏi phi.\n3. **Tắt bếp trước khi vàng:** Khi thấy hành/tỏi bắt đầu chuyển sang màu vàng nhạt, hãy **tắt bếp ngay lập tức** và vớt ra rây lọc. Sức nóng của dầu dư sẽ tiếp tục làm hành tỏi chín vàng rụm đẹp mắt mà không bị cháy đắng."
  },
  {
    keywords: ['sốt', 'vón cục', 'loãng'],
    answer: "👨‍🍳 *Cách xử lý nước sốt bị loãng hoặc vón cục:*\n1. **Sốt bị loãng:** Hòa tan 1 thìa bột ngô hoặc bột năng với chút nước lạnh, rưới từ từ vào sốt đang sôi lăn tăn và khuấy đều đến khi đạt độ sánh mong muốn.\n2. **Sốt bị vón cục:** Tắt bếp, đổ sốt qua một chiếc rây lọc để loại bỏ cục vón, hoặc dùng máy xay cầm tay xay mịn trực tiếp trong nồi."
  },
  {
    keywords: ['bảo quản thịt', 'trữ đông', 'thịt tươi'],
    answer: "👨‍🍳 *Mẹo bảo quản thịt tươi ngon trong tủ lạnh:*\n1. **Chia nhỏ khẩu phần:** Chia thịt thành từng miếng vừa đủ cho một bữa ăn trước khi cấp đông. Tuyệt đối **không tái cấp đông** thịt đã rã đông.\n2. **Bọc thật kín:** Dùng màng bọc thực phẩm bọc sát bề mặt thịt hoặc hút chân không để tránh thịt bị cháy lạnh (freezer burn) và khô cứng.\n3. **Ghi ngày tháng:** Dán nhãn ngày cấp đông. Thịt lợn/bò sống có thể trữ đông an toàn từ 4-6 tháng."
  }
];

/**
 * @swagger
 * /api/ai-assistant/chat:
 *   post:
 *     summary: Chat with AI Sous Chef (or local culinary engine fallback)
 *     tags: [AIAssistant]
 *     security:
 *       - bearerAuth: []
 */
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, recipeContext } = req.body;
    if (!message) {
      return res.status(400).json({ Success: false, Message: 'Message is required' });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    const cleanMsg = message.toLowerCase();

    // Context description helper
    const recipeCtxText = recipeContext 
      ? `Người dùng đang xem và nấu công thức: "${recipeContext.title}" với nguyên liệu gồm: [${recipeContext.ingredients}]. `
      : '';

    // If Gemini Key is present, call Gemini API
    if (API_KEY) {
      try {
        const systemPrompt = `Bạn là "Chef AI", trợ lý đầu bếp ảo cực kỳ chuyên nghiệp và thân thiện của ứng dụng nấu ăn Fresh Chef. 
        Nhiệm vụ của bạn là giải đáp tất cả thắc mắc của người dùng về nêm nếm gia vị, giải cứu các món ăn bị tai nạn bếp núc (mặn, ngọt, cay, cháy khét...) hoặc tư vấn nguyên liệu thay thế một cách hữu ích, chính xác và dễ áp dụng nhất.
        ${recipeCtxText}
        Hãy trả lời bằng Tiếng Việt, sử dụng các icon đầu bếp sinh động, giọng điệu vui vẻ, ấm áp và luôn ngắn gọn, súc tích (khoảng 3-4 gạch đầu dòng trực quan).`;

        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: `${systemPrompt}\n\nNgười dùng hỏi: "${message}"`
                  }
                ]
              }
            ]
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );

        const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiText) {
          return res.json({
            Success: true,
            Data: aiText,
            Source: 'Gemini AI'
          });
        }
      } catch (geminiError) {
        console.error('Gemini API call failed, falling back to local engine:', geminiError.message);
      }
    }

    // Fallback: Smart Local Culinary Engine
    let answerText = "";
    
    // Check keywords
    const matched = FALLBACK_ANSWERS.find(item => 
      item.keywords.some(kw => cleanMsg.includes(kw))
    );

    if (matched) {
      answerText = matched.answer;
      if (recipeContext) {
        answerText = `👨‍🍳 *Chef AI xin ý kiến cho món "${recipeContext.title}":*\n\n${answerText}`;
      }
    } else {
      answerText = `👨‍🍳 Chào bạn! Mình là Chef AI - trợ lý đầu bếp ảo của bạn.\n\nCâu hỏi *" ${message} "* của bạn rất hay\n\n👉 **Mẹo nhỏ từ Chef:** Khi nấu ăn, hãy luôn khống chế nhiệt độ ở mức vừa phải, thêm các gia vị cốt lõi như muối/nước mắm từ từ từng chút một và nếm lại sau mỗi 5 phút để tránh các sự cố nấu nướng nhé! Chúc bạn có một bữa ăn ngon miệng! ✨`;
    }

    res.json({
      Success: true,
      Data: answerText,
      Source: 'Local Culinary Engine'
    });

  } catch (err) {
    console.error('AI Assistant server error:', err);
    res.status(500).json({ Success: false, Message: 'Server error' });
  }
});

module.exports = router; // Trigger nodemon restart to load GEMINI_API_KEY from .env
