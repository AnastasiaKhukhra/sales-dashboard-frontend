# Sales Dashboard Frontend

A modern, responsive sales dashboard built with React, TypeScript, and Tailwind CSS. This frontend application provides a user-friendly interface for managing and analyzing sales data.

## Features

- 📊 Interactive Analytics Dashboard
  - Sales trends visualization with animated charts
  - Product performance metrics
  - Revenue statistics
  - Latest sales by product visualization
- 📋 Sales Data Table
  - Sortable columns (Product, Amount, Date)
  - Pagination with page numbers
  - Inline editing
  - Add/Edit sales records
  - Items per page selection (5, 10, 20, 50)
- 📤 Data Management
  - CSV file upload
  - Data export functionality
- 🌓 Dark Mode Support
  - System preference detection
  - Manual theme toggle
  - Persistent theme selection
  - Dark mode optimized UI components

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Redux Toolkit
- Recharts (for data visualization)
- Vite
- date-fns (for date formatting)

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd sales-dashboard-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   VITE_API_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/         # React components
│   ├── AnalyticsTab.tsx
│   ├── SalesTableTab.tsx
│   └── ActionsTab.tsx
├── context/           # React context providers
│   └── ThemeContext.tsx
├── features/          # Redux slices and features
│   └── salesSlice.ts
├── store/            # Redux store configuration
│   └── store.ts
├── types/            # TypeScript type definitions
├── App.tsx           # Main application component
└── main.tsx          # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
