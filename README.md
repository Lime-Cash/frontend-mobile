# Welcome to Lime Cash App

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

3. Tests with cypress

   ```bash
    npm run dev:test
   ```

## How to run the dockerfile

### Build image

```bash
 docker build -t expo-web-app --build-arg EXPO_PUBLIC_API_URL={API_URL_HERE} .
```

### Run dockerfile

```bash
 docker run -p 3000:80 expo-web-app
```
