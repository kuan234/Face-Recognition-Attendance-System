# Welcome to Face-Recognition-Attendance-System

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

Firstly, Clone this repo by using --git clone

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).



## FYP2-Backend

1. Before to run and backend server, make sure you have install XAMPP and downgrade the database version.

2. Go to Xampp PhpMyAdmin, Create the database 'face_recognition_system' and import the sql.file

3. Open terminal and move to 'FYP2-Backend', install the package needs.

  ```bash
  pip install -r requirements.txt   
  ```

  ```bash
  pip manage.py runserver 0.0.0.0:8000   
  ```
