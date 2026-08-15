import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { imageBase64, inventoryList } = req.body;

  if (!imageBase64 || !inventoryList) {
    return res.status(400).json({ error: 'Missing imageBase64 or inventoryList in request body' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the Vercel server.' });
  }

  // Lấy data base64 thuần
  const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  const mimeType = imageBase64.match(/^data:(image\/(png|jpeg|jpg|webp));base64,/)?.[1] || "image/jpeg";

  const prompt = `
Bạn là một chuyên gia nhận diện hình ảnh bao bì thuốc bảo vệ thực vật và phân bón.
Tôi sẽ cung cấp một bức ảnh và danh sách các vật tư đang có sẵn trong kho.

Danh sách vật tư trong kho (Định dạng: ID - Tên vật tư):
${inventoryList.map(item => `${item.id} - ${item.item_name}`).join('\n')}

Nhiệm vụ của bạn:
1. Đọc và phân tích nhãn mác trên bức ảnh.
2. Đối chiếu với Danh sách vật tư trong kho.
3. Nếu bức ảnh khớp với một loại vật tư trong danh sách, hãy trả về mã ID của vật tư đó trong trường "matchedId".
4. Nếu bức ảnh KHÔNG KHỚP với bất kỳ vật tư nào trong kho, hãy trích xuất các thông tin từ bao bì để tạo mới vật tư, và trả về trong trường "newItem".
   - Tên thuốc (item_name)
   - Phân loại (category: "Phân bón" hoặc "Thuốc BVTV")
   - Hoạt chất chính / Thành phần (active_ingredient)
   - Công ty sản xuất / Nhà cung cấp (supplier)
   - Công dụng (purpose)
   - Thời gian cách ly PHI (phi_days) - Trả về số nguyên, ví dụ: 7, 14. Nếu không thấy ghi, trả về null.

TUYỆT ĐỐI chỉ trả về chuỗi JSON theo đúng định dạng sau, KHÔNG GIẢI THÍCH GÌ THÊM:
{
  "matchedId": "ID nếu tìm thấy, ngược lại là null",
  "newItem": {
    "item_name": "Tên trích xuất",
    "category": "Phân bón hoặc Thuốc BVTV",
    "active_ingredient": "Hoạt chất",
    "supplier": "Công ty sản xuất",
    "purpose": "Công dụng",
    "phi_days": 14
  } // Chỉ có newItem nếu matchedId là null, nếu có matchedId thì newItem là null
}
`;

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash", 
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        },
        {
          text: prompt,
        }
      ],
      config: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    });

    let textResult = response.text.trim();
    const resultObj = JSON.parse(textResult);

    return res.status(200).json(resultObj);
  } catch (error) {
    console.error('Gemini OCR Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
