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
  const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
  const mimeType = imageBase64.match(/^data:(image\/(png|jpeg|jpg));base64,/)?.[1] || "image/jpeg";

  const prompt = `
Bạn là một chuyên gia nhận diện hình ảnh nhãn hiệu bao bì thuốc bảo vệ thực vật và phân bón.
Tôi sẽ cung cấp một bức ảnh và danh sách các vật tư đang có sẵn trong kho.

Danh sách vật tư trong kho (Định dạng: ID - Tên vật tư):
${inventoryList.map(item => `${item.id} - ${item.item_name}`).join('\n')}

Nhiệm vụ của bạn:
1. Đọc và phân tích nhãn mác, chữ viết trên bức ảnh.
2. Đối chiếu với Danh sách vật tư trong kho.
3. Trả về đúng mã ID của vật tư đó, và TUYỆT ĐỐI KHÔNG giải thích gì thêm, KHÔNG in thêm chữ nào khác.
4. Nếu bức ảnh không khớp với bất kỳ loại vật tư nào trong danh sách trên, hãy trả về ĐÚNG MỘT chữ: "NULL".
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: base64Data } }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 20,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    let textResult = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'NULL';
    
    // Xóa các ký tự thừa nếu AI lỡ sinh ra
    textResult = textResult.replace(/['"`]/g, '').trim();

    return res.status(200).json({ matchedId: textResult === 'NULL' ? null : textResult });
  } catch (error) {
    console.error('Gemini OCR Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
