# Structura

Structura is a simple app to help users track daily tasks they want to build habits on and spend more time with. It's a tool to help users fill up their days with productive and meaningful activities.

## Tech Stack

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [Firebase](https://firebase.google.com/)
- [TypeScript](https://www.typescriptlang.org/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/):  
  `npm install -g expo-cli`

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/structura.git
   cd structura
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up environment variables:  
   Copy `.env.example` to `.env` and fill in the required values.

4. Start the app:
   ```sh
   npx expo start
   ```

## Project Structure

- `app/` - Main application code (screens, navigation)
- `components/` - Reusable UI components
- `contexts/` - React context providers (Auth, Progress)
- `constants/` - Static data (daily items, exercises)
- `utils/` - Utility functions (date, firebase, etc.)
- `themes/` - Theme and styling

## Environment Variables

Create a `.env` file in the root directory with the following:

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

## Scripts

- `npm start` - Start the Expo development server
- `npm run lint` - Run ESLint
- `npm run reset-project` - Reset the project to a blank state

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your branch and open a Pull Request

## License

[MIT](LICENSE)
