# Architecture Plan

## Technology Stack
- **Frontend (Portfolio)**: React, Vite, Tailwind CSS, Framer Motion
- **Admin Portal**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas, Mongoose

## Folder Structure Design
```text
/
├── backend/          # Node.js/Express API
│   ├── controllers/
│   ├── models/       # Mongoose Schemas
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js
├── frontend/         # Portfolio Application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── utils/
│   └── package.json
├── admin/            # Admin Portal Application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── context/
│   └── package.json
├── docs/             # Project Documentation
├── .env.example
├── .gitignore
└── README.md
```

## API Architecture
- RESTful API design.
- JSON data format.
- Authentication: JWT-based for Admin routes.
- CORS configured to allow requests from the specific Frontend and Admin domains.
