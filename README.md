# Travel Booking Management System

A modern, responsive frontend application developed with Svelte 5 and Vite for managing travel bookings, tours, and destinations. This project features a comprehensive Admin Dashboard for efficient management of the platform's resources.

## 🚀 Key Features

### 🛠 Admin Dashboard
- **User Management**: View, create, and edit system users (Admin/User roles).
- **Tour Management**: Create and manage tour packages, including details like duration, price, and availability.
- **Destination Management**: Manage travel destinations with images and descriptions.
- **Booking Management**: Track and manage customer bookings, update statuses (Pending, Confirmed, Cancelled, etc.).
- **Payment Management**: Monitor payment transactions and status updates.

### 🔐 Security & Identity
- **Authentication**: Secure login/logout flows using JWT.
- **Role-Based Access**: Dedicated views and protections for Admin vs. regular Users.

## 🛠 Tech Stack

- **Framework**: [Svelte 5](https://svelte.dev/) (using modern Runes syntax)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide Svelte](https://lucide.dev/)
- **API Client**: Custom `ApiClient` wrapper with automatic token handling and interceptors.

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd Frontend-booking
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or the port shown in your terminal).

4.  **Build for production**
    ```bash
    npm run build
    ```

## 📂 Project Structure

```
src/
├── lib/
│   ├── components/
│   │   └── admin/       # Admin specific components (Tabs, Modals)
│   ├── pages/
│   │   └── AdminDashboard.svelte  # Main Admin layout
│   ├── stores/          # Global state management
│   └── api.svelte.ts    # Centralized API client service
├── app.css              # Global styles & Tailwind directives
└── ...
```

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.
