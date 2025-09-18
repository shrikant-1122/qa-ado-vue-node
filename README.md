# QA ADO Vue Node

A web application for managing and tracking QA metrics in Azure DevOps, built with Vue.js and Node.js.

## Project Structure

```
backend/     # Node.js Express API
frontend/    # Vue.js frontend application
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Azure DevOps account with PAT (Personal Access Token)

### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server
PORT=5050
CORS_ORIGIN=http://localhost:5173

# Azure DevOps
ADO_ORG_URL=https://dev.azure.com/your-org
ADO_DEFAULT_PROJECT=Your Project
ADO_PAT=your-pat-token

# Optional: OpenAI (for chatbot)
OPENAI_API_KEY=
OPENAI_CHAT_MODEL=gpt-4o-mini
```

### Installation

1. Backend Setup:
```bash
cd backend
npm install
npm run dev
```

2. Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```

## API Documentation

API documentation is available via Swagger UI at:
```
http://localhost:5050/api/docs
```

## Available Scripts

Backend:
- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server

Frontend:
- `npm run dev` - Start development server
- `npm run build` - Build for production