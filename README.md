# CampusCrate - Lost & Found Management System

A full-stack web application for managing lost and found items on campus. Users can post items they've lost or found, search for their belongings, and connect with others in the community.

## Features

- **User Authentication**: Secure registration and login with email verification
- **Post Lost Items**: Create listings for items you've lost with images and descriptions
- **Post Found Items**: Report items you've found to help reunite them with owners
- **Search Functionality**: Browse and search through lost and found items
- **Item Claims**: Users can claim found items or respond to lost item posts
- **Admin Dashboard**: Admin portal for managing users, items, and claims
- **Email Notifications**: Automated emails for item matches and claim updates
- **Image Upload**: Support for item images with cloud storage

## Tech Stack

### Frontend
- **React** - UI library
- **Axios** - HTTP client
- **Firebase** - Authentication and storage
- **CSS** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **Nodemailer** - Email service

## Project Structure

```
lfproject/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── utils/        # Utility functions
│   │   └── styles/       # Styling
│   └── package.json
├── backend/              # Express backend server
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   ├── controllers/      # Business logic
│   ├── middleware/       # Express middleware
│   ├── config/          # Configuration files
│   ├── utils/           # Utility functions
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB account or local MongoDB
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shalvi-Rastogi/CampusCrate.git
   cd CampusCrate
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

1. **Backend Setup** (`backend/.env`)
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

2. **Frontend Setup** (`frontend/.env.local`)
   ```
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_FIREBASE_API_KEY=your_firebase_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_domain
   ```

### Running the Application

**Terminal 1 - Start Backend Server**
```bash
cd backend
npm start
```
Server runs on `http://localhost:5000`

**Terminal 2 - Start Frontend Development Server**
```bash
cd frontend
npm start
```
Application opens at `http://localhost:3000`

## Available Scripts

### Backend
- `npm start` - Start the server
- `npm run dev` - Start with nodemon for development

### Frontend
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email address

### Items
- `GET /api/items` - Get all items
- `POST /api/items` - Create new item listing
- `GET /api/items/:id` - Get item details
- `DELETE /api/items/:id` - Delete item

### Claims
- `POST /api/claims` - Create new claim
- `GET /api/claims` - Get user claims
- `PUT /api/claims/:id` - Update claim status

## Features in Detail

### Lost & Found Posting
Users can post lost or found items with:
- Item title and description
- Category (electronics, documents, accessories, etc.)
- Location information
- Photo upload
- Contact details

### Search & Filter
- Search by keywords
- Filter by category and status
- Filter by location
- Sort by date

### Claim Management
- Users can claim found items
- Item owners can respond to claims
- Email notifications for claim updates
- Claim resolution tracking

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Contact

For questions or support, please contact:
- **Email**: support@campuscrate.com
- **GitHub**: [Shalvi-Rastogi](https://github.com/Shalvi-Rastogi)

## Acknowledgments

- React community for amazing tools and libraries
- MongoDB for reliable database solutions
- Firebase for authentication services
- Express.js for robust backend framework

---

**Last Updated**: May 2026
