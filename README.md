# Sales Dashboard Frontend

A modern, responsive sales dashboard built with React, TypeScript, and Tailwind CSS. This frontend application provides a user-friendly interface for managing and analyzing sales data.

## 🚀 Live Demo

Visit the live application: [Sales Dashboard](https://sales-dashboard-frontend-its6.onrender.com/)

## ✨ Features

- 📊 Interactive Analytics Dashboard
  - Sales trends visualization with animated charts
  - Product performance metrics
  - Total sales and average sale calculations
  - Latest sales by product visualization
  - Numbers formatted with commas for better readability (e.g., $10,000.00)

- 📋 Sales Data Management
  - Sortable columns (Product, Amount, Date)
  - Pagination with dynamic page numbers
  - Items per page selection (5, 10, 20, 50)
  - Inline editing of sales records
  - Add/Edit individual sales records

- 📤 Data Import/Export
  - CSV file upload functionality
  - Data export to CSV
  - Bulk data operations

- 🌓 Dark Mode Support
  - System preference detection
  - Manual theme toggle
  - Persistent theme selection
  - Dark mode optimized UI components

## 🛠 Tech Stack

- **Frontend:**
  - React 18
  - TypeScript
  - Redux Toolkit (state management)
  - Tailwind CSS (styling)
  - Recharts (data visualization)
  - Axios (API requests)
  - date-fns (date formatting)

- **Backend:**
  - NestJS
  - PostgreSQL
  - TypeORM
  - RESTful API

## 🚦 Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd sales-dashboard-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   VITE_API_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/         # React components
│   ├── AnalyticsTab/  # Analytics dashboard
│   ├── SalesTableTab/ # Sales data table
│   └── ActionsTab/    # Import/Export actions
├── features/          # Redux slices
│   └── salesSlice.ts  # Sales state management
├── store/            # Redux store configuration
├── context/          # React context providers
└── types/            # TypeScript types
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔑 Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:3000  # Development
VITE_API_URL=https://your-backend-url  # Production
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Recharts](https://recharts.org/) for the charting library
- [Redux Toolkit](https://redux-toolkit.js.org/) for state management
- [NestJS](https://nestjs.com/) for the backend framework
