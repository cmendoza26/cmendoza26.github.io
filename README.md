# Global Time App
## Features
- **Live Time Display** - Shows current time for selected city, updated every second
- **City Dropdown** - Select from 50+ world cities
- **Timezone Accuracy** - Uses native `Intl.DateTimeFormat` API for accurate timezone handling
- **Play/Pause Controls** - Pause and resume time updates
- **Multi-City Management** - Add/remove multiple cities, view all times simultaneously
- **Dark/Light Theme Toggle** - Persistent theme preference saved in browser
## Project Structure

```
cmendoza26.github.io/
├── index.html              # Main HTML with all UI sections
├── css/
│   ├── styles.css          # Base styles, layout, components
│   └── theme.css           # Light/dark theme CSS variables
├── js/
│   ├── app.js              # Core application logic (all phases)
│   ├── cities.js           # City data with timezone & coordinates
│   └── map.js              # Map integration (currently unused)
└── README.md               # This file
```