# FoxSpot 🦊

A modern React Native event discovery and creation app that helps users find and create amazing local events in their community.

## Features

### 🗺️ Interactive Map View
- Beautiful circular markers showing event locations
- Real-time event positioning with custom map styling
- Smooth animations and interactive markers
- Category-based color coding for easy identification

### 📅 Event Discovery
- Browse events by categories (Music, Art, Food, Sports, Tech, Business)
- Search functionality to find specific events
- Filter by event type and location
- Clean, modern card-based event display

### ✨ Event Creation
- Intuitive event creation form with live preview
- Automatic geocoding - just enter address and city
- Image upload for event thumbnails
- Date and time picker integration
- Category selection with visual indicators

### 👤 User Profiles
- Personal profile with event statistics
- Track events joined, created, and saved
- Profile customization options
- User authentication system

### 🎯 Smart Location Features
- Automatic coordinate detection when creating events
- Support for Serbian cities with address suggestions
- Current location detection
- Offline-friendly map caching

## Screenshots

| Welcome | Create Event | Event Discovery | Map View | Profile |
|---------|-------------|-----------------|----------|---------|
| ![Welcome](https://github.com/user-attachments/assets/welcome-screen-url) | ![Create Event](https://github.com/user-attachments/assets/734df58f-6a60-4bd5-8460-db01981abde2) | ![Event Discovery](https://github.com/user-attachments/assets/cd1bbc4c-0e84-44ee-bd85-ca150d94a2f7) | ![Map View](https://github.com/user-attachments/assets/6e468bf5-a5d0-4dca-a2e4-fad8d1a02a43) | ![Profile](https://github.com/user-attachments/assets/192554c6-0347-4b34-b12f-84bf93523361) |

## Tech Stack

- **Frontend**: React Native with Expo
- **Maps**: React Native Maps with custom styling
- **Backend**: Supabase (Authentication, Database, Storage)
- **Navigation**: Expo Router
- **UI Components**: 
  - React Native Elements
  - Expo Vector Icons
  - Linear Gradient
  - Animated API
- **Location Services**: Expo Location
- **Image Handling**: Expo Image Picker
- **Date/Time**: React Native Community DateTimePicker

## Installation

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- React Native development environment
- Android Studio / Xcode for device testing

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/foxspot.git
   cd foxspot
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Create a `.env` file:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   
   Create the following tables in your Supabase database:

   ```sql
   -- Events table
   CREATE TABLE events (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT,
     location TEXT NOT NULL,
     address TEXT NOT NULL,
     lat DECIMAL NOT NULL,
     lng DECIMAL NOT NULL,
     type TEXT NOT NULL,
     date TIMESTAMP WITH TIME ZONE NOT NULL,
     image_url TEXT,
     created_by UUID REFERENCES auth.users(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE events ENABLE ROW LEVEL SECURITY;

   -- Create policies for events
   CREATE POLICY "Events are viewable by everyone" ON events
     FOR SELECT USING (true);

   CREATE POLICY "Users can create events" ON events
     FOR INSERT WITH CHECK (auth.uid() = created_by);

   CREATE POLICY "Users can update own events" ON events
     FOR UPDATE USING (auth.uid() = created_by);
   ```

5. **Start the development server**
   ```bash
   npx expo start
   ```

6. **Run on device/simulator**
   - Install Expo Go app on your mobile device
   - Scan the QR code from the terminal
   - Or press `a` for Android emulator, `i` for iOS simulator

## Key Components

### MapViewWrapper
- Custom map implementation with circular markers
- Real-time event loading from Supabase
- Smooth animations and user interactions
- Category-based styling

### AddEventScreen
- Comprehensive event creation form
- Automatic geocoding integration
- Live preview functionality
- Image upload capabilities

### Event Discovery
- Search and filter functionality
- Category-based browsing
- Clean card-based UI
- Real-time event updates

## Configuration

### Map Styling
The app uses custom dark map styling optimized for event visibility. Colors and themes can be modified in the `darkMapStyle` configuration.

### Categories
Event categories are easily configurable:
```javascript
const categories = ["Music", "Art", "Food", "Sports", "Tech", "Business"];
```

### Geocoding
Uses OpenStreetMap Nominatim API for address geocoding, restricted to Serbia:
- Automatic coordinate detection
- Address suggestions
- Fallback to manual coordinate entry

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@foxspot.app or create an issue in this repository.

## Roadmap

- [ ] Push notifications for event reminders
- [ ] Social features (friends, event sharing)
- [ ] Event check-in with QR codes
- [ ] Advanced filtering (price, distance, time)
- [ ] Event recommendations based on user preferences
- [ ] Multi-language support
- [ ] Dark/light theme toggle

---

Built with ❤️ by the FoxSpot team
