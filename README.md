# Birthday Reminder Application

A full-stack birthday reminder application built with Spring Boot and React that helps you never forget a friend's birthday again!

## Features

- **User Authentication** - Secure JWT-based authentication with registration and login
- **Birthday Management** - Add, edit, delete, and view all your friends' birthdays
- **Birthday Categories** - Organize birthdays by groups (Family, Friends, Work, College)
- **Email Notifications** - Automated email reminders with configurable notification days (7, 3, 1 days before)
- **Dashboard Analytics** - Visual charts showing birthday distribution by month and category
- **Calendar Export** - Export birthdays to iCal/Google Calendar format
- **CSV Import** - Bulk import birthdays from CSV files
- **Wish Suggestions** - Get personalized birthday wish suggestions with different tones
- **Customizable Settings** - Configure notification preferences and email templates
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.2
- Spring Security + JWT
- Spring Data JPA
- H2 Database (file-based)
- Spring Mail (SMTP)
- Spring Scheduler (Cron jobs)

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Axios
- Recharts (for analytics)
- Lucide React Icons
- React Hot Toast

## Project Structure

```
birthday-reminder/
├── backend/                    # Spring Boot Application
│   ├── src/main/java/
│   │   └── com/birthday/reminder/
│   │       ├── config/         # Security, Mail, Scheduler configs
│   │       ├── controller/     # REST API endpoints
│   │       ├── dto/            # Data Transfer Objects
│   │       ├── entity/         # JPA Entities
│   │       ├── exception/      # Custom exceptions
│   │       ├── repository/     # Spring Data repositories
│   │       ├── scheduler/      # Cron job handlers
│   │       ├── security/       # JWT utilities
│   │       └── service/        # Business logic
│   └── src/main/resources/
│       └── application.yml
├── frontend/                   # React Application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # Auth context
│   │   ├── pages/              # Page components
│   │   └── services/           # API calls
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Java 17 or higher
- Node.js 18 or higher
- Maven 3.6+

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Configure environment variables (create a `.env` file or set them directly):
   ```bash
   # Email Configuration (for Gmail)
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   
   # JWT Secret (use a strong secret in production)
   JWT_SECRET=your-secret-key-at-least-256-bits-long
   ```

   > **Note:** For Gmail, you need to generate an [App Password](https://support.google.com/accounts/answer/185833)

3. Build and run the application:
   ```bash
   mvn spring-boot:run
   ```

   The backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Birthdays
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/birthdays` | Get all birthdays |
| GET | `/api/birthdays/{id}` | Get birthday by ID |
| POST | `/api/birthdays` | Create new birthday |
| PUT | `/api/birthdays/{id}` | Update birthday |
| DELETE | `/api/birthdays/{id}` | Delete birthday |
| GET | `/api/birthdays/upcoming` | Get upcoming birthdays |
| GET | `/api/birthdays/search` | Search birthdays by name |
| GET | `/api/birthdays/analytics` | Get analytics data |
| POST | `/api/birthdays/import` | Import from CSV |
| GET | `/api/birthdays/export/ical` | Export to iCal |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/{id}` | Update category |
| DELETE | `/api/categories/{id}` | Delete category |

### Wishes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wishes/{birthdayId}` | Generate wish suggestions |
| GET | `/api/wishes/tones` | Get available tones |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get notification settings |
| PUT | `/api/settings` | Update notification settings |

## Configuration

### Email Notification Schedule

By default, the birthday notification scheduler runs at 8:00 AM daily. You can modify this in `application.yml`:

```yaml
app:
  scheduler:
    cron: "0 0 8 * * ?"  # Run at 8 AM daily
```

### Notification Days

Users can configure multiple notification days (e.g., 7 days, 3 days, 1 day before) through the Settings page.

### Email Template Variables

Custom email templates support these placeholders:
- `{friendName}` - Friend's name
- `{birthDate}` - Formatted birthday date
- `{age}` - Age they're turning
- `{daysUntil}` - Days until birthday

## Database

The application uses H2 database with file-based storage. The database file is stored at `./data/birthdaydb`. You can access the H2 console at `http://localhost:8080/h2-console` with these credentials:
- JDBC URL: `jdbc:h2:file:./data/birthdaydb`
- Username: `sa`
- Password: (empty)

## License

MIT License
