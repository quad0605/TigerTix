# TigerTix 


TigerTix is a microservices-based event ticketing system for Clemson University events. The system allows administrators to manage events and tickets while providing a seamless ticket purchasing experience for students and visitors.

## Architecture

### Backend (Microservices)
- **Admin Service** (Port 5001): Event and ticket management
- **Client Service** (Port 6001): Event browsing and ticket purchasing
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
    │   │   ├── EventItem.js
    │   │   ├── EventList.js
    │   │   └── Message.js
    │   ├── App.js
    │   └── index.js
    |   └── index.css
    └── package.json
```


## API Endpoints

### Admin Service (Port 5001)
- `POST /api/admin/events` - Create new event
- Example curl command:
-     curl -i -X POST http://localhost:5001/api/admin/events -H "Content-Type: application/json" -d '{
        "name":  "Clemson vs. Gamecocks",
        "date": "2025-10-13T19:00:00Z",
        "tickets_total": "190"
      }'
- `PUT /api/admin/events/:id` - Update event
- Example curl command:
- `curl -i -X PUT http://localhost:5001/api/admin/events/1 -H "Content-Type: application/json" -d '{
        "name":  "Epic football game",
        "date": "2025-10-13T19:00:00Z",
        "tickets_total": "190"
      }'`

### Client Service (Port 6001)
- `GET /api/events` - Get available events
- Example curl command:
-     'curl -i http://localhost:6001/api/events'
- `POST /api/events/:id/purchase` - Purchase tickets
- Example curl command:
-     'curl -X POST -i http://localhost:6001/api/events/2/purchase'

## Database Schema

The application uses SQLite with the following main tables:
- **events**: Event information (name, date, tickets_total, tickets_sold)


4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
