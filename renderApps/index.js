const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  try {
    const apiKey = process.env.RENDER_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API Key לא מוגדר' });
    }

    const response = await fetch('https://api.render.com/v1/services', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`שגיאה: ${response.status}`);
    }

    const data = await response.json();
    
    res.json({
      סה_כ_שירותים: data.length,
      שירותים: data.map(service => ({
        מזהה: service.id,
        שם: service.name,
        סוג: service.type,
        סטטוס: service.suspended ? 'מושהה' : 'פעיל'
      }))
    });

  } catch (error) {
    console.error('שגיאה:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`השרת רץ על פורט ${PORT}`);
});
