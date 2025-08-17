# LULAV Landing Page

A modern landing page for Lulav featuring the Hornbill Medium 3D model viewer.

## Project Structure

```
/
├── index.html                 # Main HTML page
├── assets/                    # Static assets
│   ├── images/               
│   │   └── logo.png          # Company logo
│   ├── models/               
│   │   ├── drone.obj         # Hornbill Medium 3D model
│   │   └── drone.mtl         # Model materials
│   └── data/                 
│       └── cube.json         # Configuration data
├── css/                      
│   └── styles.css            # Main stylesheet
├── js/                       
│   └── script.js             # JavaScript functionality & 3D viewer
├── docs/                     # Documentation
│   ├── README.md             # Original README
│   └── DEPLOYMENT.md         # Deployment instructions
├── .github/                  # GitHub workflows
├── venv/                     # Python virtual environment
└── CNAME                     # Custom domain configuration
```

## Features

- **3D Model Viewer**: Interactive Hornbill Medium model with Three.js
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, professional design inspired by kelasys.com
- **Loading Animation**: Smooth loading indicators
- **Performance Optimized**: Fast loading and rendering

## Development

1. Start a local server:
   ```bash
   python3 -m http.server 8001
   ```

2. Open `http://localhost:8001` in your browser

## Technologies

- **Frontend**: HTML5, CSS3, JavaScript (ES6)
- **3D Graphics**: Three.js r108
- **Model Format**: OBJ/MTL
- **Hosting**: GitHub Pages

## Performance

The website is optimized for production deployment with:
- CDN delivery for Three.js
- Compressed assets
- Browser caching
- Responsive loading

---

Built with ❤️ for LULAV
