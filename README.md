# Shop Floor Management System

A comprehensive Node.js + Express backend and React frontend for managing manufacturing shop floor operations. Supports machine monitoring, safety management, order tracking, WhatsApp integration, and AI-powered insights.

## 🌟 Features

### Backend Modules
- ✅ **Machine Management** - Real-time machine status tracking (Running, Idle, Maintenance, Error)
- ✅ **Safety Management** - Safety area monitoring, PPE compliance tracking, incident logging
- ✅ **Order Tracking** - Order status, stage tracking, priority management, ETA tracking
- ✅ **WhatsApp Integration** - Webhook endpoint for receiving worker updates via WhatsApp(future feature)
- ✅ **LLM Integration** - OpenAI-powered AI assistant for generating summaries and insights(future feature)
- ✅ **REST API** - Comprehensive API endpoints for all modules
- ✅ **SQLite Database** - Prisma ORM with automatic migrations
- ✅ **CI/CD Pipelines** - GitHub Actions for automated deployment

### Frontend
- ✅ **Dashboard** - Real-time machine status cards with color-coded indicators
- ✅ **AI Chat Interface** - Interactive chat with OpenAI-powered assistant
- ✅ **Order Management** - Order tracking table with filters and status indicators
- ✅ **Safety Dashboard** - Safety area monitoring and compliance logs
- ✅ **Responsive Design** - Built with React, Vite, and TailwindCSS

## 📁 Project Structure

```
.
├── modules/
│   ├── shop-floor/          # Machine management module
│   │   ├── controller.js
│   │   ├── service.js
│   │   ├── routes.js
│   │   ├── utils.js
│   │   └── model.js
│   ├── safety/              # Safety management module
│   │   ├── controller.js
│   │   ├── service.js
│   │   └── routes.js
│   ├── orders/              # Order tracking module
│   │   ├── controller.js
│   │   ├── service.js
│   │   └── routes.js
│   ├── whatsapp/            # WhatsApp webhook handler
│   │   └── routes.js
│   └── llm/                 # LLM integration module
│       ├── llm.service.js
│       ├── controller.js
│       └── routes.js
├── utils/
│   └── whatsappParser.js    # WhatsApp message parsing utilities
├── database/
│   ├── schema.prisma        # Prisma database schema
│   └── seed.js              # Database seeding script
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   ├── OrderPage.jsx
│   │   │   └── SafetyPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .github/
│   └── workflows/
│       ├── backend-deploy.yml
│       └── frontend-deploy.yml
├── index.js                 # Main server file
├── config.js                # Configuration
├── package.json
└── .env                     # Environment variables
```

## 🚀 Installation

### Backend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   DATABASE_URL=file:./database/shopfloor.db
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN=*
   OPENAI_API_KEY=your_openai_api_key_here
   WHATSAPP_VERIFY_TOKEN=your_verify_token_here
   ```

3. **Initialize database:**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   
   # Seed sample data
   npm run seed
   ```

4. **Start the backend server:**
   ```bash
   npm start
   # Or for development with auto-reload
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Create .env file
   echo "VITE_API_URL=http://localhost:3000" > .env
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## 📡 API Endpoints

### Machines

- `GET /machines` - Get all machines
- `GET /machines/:id` - Get single machine
- `POST /machines/update` - Update machine (supports JSON or WhatsApp message format)
- `POST /machines/batch` - Batch update multiple machines
- `GET /machines/status/llm` - Get machine status formatted for LLM
- `GET /machines/health` - Health check

### Safety

- `GET /safety` - Get all safety areas
- `GET /safety/:area` - Get single safety area
- `POST /safety/update` - Update safety area
- `POST /safety/log` - Create safety log entry
- `GET /safety/logs` - Get safety logs (optionally filtered by area)
- `GET /safety/status/llm` - Get safety status formatted for LLM

### Orders

- `GET /orders` - Get all orders
- `GET /orders/:id` - Get single order
- `POST /orders/update` - Update order
- `POST /orders/batch` - Batch update multiple orders
- `GET /orders/status/llm` - Get order status formatted for LLM

### WhatsApp

- `GET /whatsapp/webhook` - Webhook verification (GET)
- `POST /whatsapp/webhook` - Receive WhatsApp messages (POST)
- `POST /whatsapp/test` - Test message parsing

### AI/LLM

- `POST /ai/query` - Process AI query for specific workflow
  ```json
  {
    "workflow": "shopfloor" | "safety" | "orders" | "all",
    "message": "Give me the daily summary"
  }
  ```
- `GET /ai/daily-summary` - Generate daily summary for all workflows

## 💬 WhatsApp Message Formats

Workers can send updates via WhatsApp using these formats:

### Machine Update
```
M03 STATUS=Running OUTPUT=130 OPERATOR=Arun
M01 STATUS=Error ERROR=Overheating detected
M02 STATUS=Idle
```

### Safety Update
```
SAFETY WeldingZone PPE=Helmet,Gloves,Safety Shoes
SAFETY AssemblyZone RISK=High STATUS=Warning
SAFETY PackagingZone PPE=Gloves STATUS=Safe
```

### Order Update
```
ORDER ORD1024 STAGE=Packaging ETA=Nov-18
ORDER ORD1001 STAGE=Production PRIORITY=Urgent
ORDER ORD1002 STAGE=Quality QUANTITY=200
```

## 🧠 LLM Integration

The system integrates with OpenAI API to provide AI-powered insights:

1. **Query specific workflow:**
   ```bash
   curl -X POST http://localhost:3000/ai/query \
     -H "Content-Type: application/json" \
     -d '{
       "workflow": "shopfloor",
       "message": "Give me a summary of machine status"
     }'
   ```

2. **Get daily summary:**
   ```bash
   curl http://localhost:3000/ai/daily-summary
   ```

The LLM service fetches the latest data, builds prompts, and returns formatted insights.

## 🎨 Frontend Pages

### Dashboard
- Real-time machine status cards
- Color-coded status indicators (Running=green, Idle=yellow, Error=red, Maintenance=orange)
- Auto-refresh every 30 seconds

### AI Chat
- Interactive chat interface
- Select workflow (Shop Floor, Safety, Orders, or All)
- Loading animations
- Message history

### Orders
- Order tracking table
- Filter by stage, priority, status
- Status and priority badges

### Safety
- Safety area cards with risk levels
- PPE compliance tracking
- Recent safety logs table

## 🔄 CI/CD Deployment

### Backend (Render)

1. **Set up GitHub Secrets:**
   - `RENDER_DEPLOY_HOOK_URL` - Render deploy hook URL
   - `DATABASE_URL` - Database connection string

2. **Deploy:**
   - Push to `main` branch triggers deployment
   - GitHub Actions installs dependencies, runs tests, and triggers Render deploy hook

### Frontend (Vercel)

1. **Set up GitHub Secrets:**
   - `VERCEL_TOKEN` - Vercel API token
   - `VERCEL_PROJECT_ID` - Vercel project ID
   - `VERCEL_ORG_ID` - Vercel organization ID
   - `VITE_API_URL` - Backend API URL

2. **Deploy:**
   - Push to `main` branch triggers deployment
   - GitHub Actions builds React app and deploys to Vercel

## 🗄️ Database Schema

```prisma
model Machine {
  id            String   @id @default(uuid())
  machine_id    String   @unique
  name          String
  status        String   // Running | Idle | Maintenance | Error
  output        Int      @default(0)
  last_updated  DateTime @default(now())
  error_message String?
  operator      String?
}

model SafetyArea {
  id            String   @id @default(uuid())
  area_name     String   @unique
  zone          String
  ppe_required  String
  risk_level    String   // Low | Medium | High | Critical
  last_inspection DateTime @default(now())
  status        String   // Safe | Warning | Critical | Maintenance
  notes         String?
}

model SafetyLog {
  id            String   @id @default(uuid())
  area_name     String
  zone          String
  ppe_compliance String  // Compliant | NonCompliant | Partial
  incident_type String?
  description   String?
  reported_by   String?
  created_at    DateTime @default(now())
}

model Order {
  id            String   @id @default(uuid())
  order_id      String   @unique
  customer_name String?
  stage         String   // Planning | Production | Quality | Packaging | Shipping | Completed
  priority      String   // Low | Medium | High | Urgent
  quantity      Int      @default(0)
  materials     String?
  eta           String?
  status        String   // Active | OnHold | Completed | Cancelled
  assigned_to   String?
  created_at    DateTime @default(now())
  updated_at    DateTime @default(now())
}
```

## 🧪 Example Usage

### Update machine via API
```bash
curl -X POST http://localhost:3000/machines/update \
  -H "Content-Type: application/json" \
  -d '{
    "machine_id": "M03",
    "status": "Running",
    "output": 150,
    "operator": "John Doe"
  }'
```

### Update via WhatsApp format
```bash
curl -X POST http://localhost:3000/machines/update \
  -H "Content-Type: application/json" \
  -d '{"message": "M03 STATUS=Running OUTPUT=150 OPERATOR=John Doe"}'
```

### Get all orders
```bash
curl http://localhost:3000/orders
```

### Query AI assistant
```bash
curl -X POST http://localhost:3000/ai/query \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": "all",
    "message": "What are the critical issues I should know about?"
  }'
```

## 🛠️ Development

- **View database:** `npm run prisma:studio`
- **Generate Prisma client:** `npm run prisma:generate`
- **Create migration:** `npm run prisma:migrate`
- **Reseed database:** `npm run seed`

## 📝 Environment Variables

### Backend
```env
DATABASE_URL=file:./database/shopfloor.db
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
OPENAI_API_KEY=your_openai_api_key
WHATSAPP_VERIFY_TOKEN=your_verify_token
```

### Frontend
```env
VITE_API_URL=http://localhost:3000
```

## 🐛 Troubleshooting

1. **Database connection issues:**
   - Ensure `DATABASE_URL` is set correctly in `.env`
   - Run `npm run prisma:generate` and `npm run prisma:migrate`

2. **OpenAI API errors:**
   - Verify `OPENAI_API_KEY` is set in `.env`
   - Check API key has sufficient credits

3. **WhatsApp webhook not working:**
   - Verify `WHATSAPP_VERIFY_TOKEN` matches your Meta webhook configuration
   - Ensure webhook URL is accessible publicly (use ngrok for local testing)

## 📄 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
