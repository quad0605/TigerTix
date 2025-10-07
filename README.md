# TigerTix 


TigerTix is a microservices-based event ticketing system for Clemson University events. The system allows administrators to manage events and tickets while providing a seamless ticket purchasing experience for students and visitors.

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


4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
