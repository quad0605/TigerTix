# TigerTix - Princeton Event Ticketing System

TigerTix is a microservices-based event ticketing system for Princeton University events. The system allows administrators to manage events and tickets while providing a seamless ticket purchasing experience for students and visitors.

## Architecture

### Backend (Microservices)
- **Admin Service** (Port 5001): Event and ticket management
- **Client Service** (Port 5002): Event browsing and ticket purchasing
- **Shared Database**: SQLite database shared between services

### Frontend
- React application for the user interface
- Connects to the Client Service for ticket purchasing

## Project Structure

```
TigerTix/
├── backend/
│   ├── shared-db/
│   │   ├── database.sqlite     # SQLite database (auto-generated)
│   │   └── init.sql           # Database schema and sample data
│   ├── admin-service/         # Admin microservice (Port 5001)
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── setup.js
│   │   ├── server.js
│   │   └── package.json
│   ├── client-service/        # Client microservice (Port 5002)
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── server.js
│   │   └── package.json
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── EventList.js
    │   │   ├── TicketSelection.js
    │   │   └── PurchaseConfirmation.js
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. **Install dependencies for all services:**
   ```bash
   cd backend
   npm run install-all
   ```

2. **Initialize the database:**
   ```bash
   npm run setup-db
   ```

3. **Start both services:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev-all
   
   # Or production mode
   npm run start-all
   ```

   **Or start services individually:**
   ```bash
   # Admin Service
   npm run dev-admin    # Development
   npm run start-admin  # Production
   
   # Client Service  
   npm run dev-client   # Development
   npm run start-client # Production
   ```

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the React development server:**
   ```bash
   npm start
   ```

## API Endpoints

### Admin Service (Port 5001)
- `GET /api/admin/events` - Get all events
- `POST /api/admin/events` - Create new event
- `PUT /api/admin/events/:id` - Update event
- `DELETE /api/admin/events/:id` - Delete event
- `POST /api/admin/events/:id/tickets` - Generate tickets for event

### Client Service (Port 5002)
- `GET /api/client/events` - Get available events
- `GET /api/client/events/:id` - Get event details
- `GET /api/client/events/:id/tickets` - Get available tickets
- `POST /api/client/purchase` - Purchase tickets
- `GET /api/client/orders?email=user@email.com` - Get customer orders

## Database Schema

The application uses SQLite with the following main tables:
- **events**: Event information (name, date, venue, pricing)
- **tickets**: Individual ticket records
- **customers**: Customer information
- **orders**: Purchase records

## Development

### Adding New Features

1. **Backend**: Add routes, controllers, and models to the appropriate service
2. **Frontend**: Create new components in `src/components/`
3. **Database**: Update `init.sql` for schema changes

### Testing the Services

You can test the APIs using curl or any API testing tool:

```bash
# Test Admin Service
curl http://localhost:5001/health

# Test Client Service  
curl http://localhost:5002/health

# Get events
curl http://localhost:5002/api/client/events
```

## Deployment

Each service can be deployed independently:
- Admin Service: Handles event management (internal use)
- Client Service: Handles public ticket purchases (public-facing)
- Frontend: React app (can be served statically)

## Environment Variables

- `PORT`: Override default ports (5001 for admin, 5002 for client)
- `NODE_ENV`: Set to 'production' for production mode

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details