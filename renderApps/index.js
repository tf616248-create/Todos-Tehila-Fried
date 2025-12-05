// const express = require('express');
// const app = express();
// const PORT = process.env.PORT || 3000;

// app.get('/', async (req, res) => {
//   try {
//     const apiKey = process.env.RENDER_API_KEY;
    
//     if (!apiKey) {
//       return res.status(500).json({ error: 'API Key לא מוגדר' });
//     }

//     const response = await fetch('https://api.render.com/v1/services', {
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Authorization': `Bearer ${apiKey}`
//       }
//     });

//     if (!response.ok) {
//       throw new Error(`שגיאה: ${response.status}`);
//     }

//     const data = await response.json();
    
//     res.json({
//       סה_כ_שירותים: data.length,
//       שירותים: data.map(service => ({
//         מזהה: service.id,
//         שם: service.name,
//         סוג: service.type,
//         סטטוס: service.suspended ? 'מושהה' : 'פעיל'
//       }))
//     });

//   } catch (error) {
//     console.error('שגיאה:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`השרת רץ על פורט ${PORT}`);
// });
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  try {
    const apiKey = process.env.RENDER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API Key לא מוגדר' });
    }

    // fetch גלובלי מובנה ב-Node >=18
    const response = await fetch('https://api.render.com/v1/services', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`שגיאה ב-Render API: ${response.status}`);
    }

    const data = await response.json();

    // כל service נמצא בתוך item.service
    const filteredServices = data.map(item => {
      const service = item.service;
      return {
        id: service.id,
        name: service.name,
        type: service.type,
        runtime: service.serviceDetails?.env || service.env || 'לא זמין',
        region: service.serviceDetails?.region || service.region || 'לא זמין',
        slug: service.slug || service.name,
        serviceName: service.name,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
        serviceState: service.suspended === 'suspended' ? 'suspended' :
                      service.suspended === 'not_suspended' ? 'active' :
                      service.serviceState || 'active',
        url: service.serviceDetails?.url || 'לא זמין',
        autoDeploy: service.autoDeploy || 'לא זמין',
        branch: service.branch || 'לא זמין'
      };
    });

    // הדפסה קריאה לקונסול
    console.log(JSON.stringify(filteredServices, null, 2));

    res.json({
      total: filteredServices.length,
      services: filteredServices
    });

  } catch (error) {
    console.error('שגיאה:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 השרת רץ על פורט ${PORT}`);
});
