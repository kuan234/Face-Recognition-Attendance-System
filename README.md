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

1. Before to run and backend server, make sure you have install XAMPP and upgrade/downgrade the xampp mariadb version to 10.6.

2. Go to Xampp PhpMyAdmin, Create the database 'face_recognition_system' and import the sql.file

3. Open terminal and move to 'FYP2-Backend', install the package needs.

  ```bash
  pip install -r requirements.txt   
  ```

  ```bash
  pip manage.py runserver 0.0.0.0:8000   
  ```



## How to Change Mariadb version
1. Shutdown or Quit your XAMPP server from Xampp control panel.
2. Download the **ZIP version** of MariaDB
3. Rename the xampp/mysql folder to mysql_old.
4. Unzip or Extract the contents of the MariaDB ZlP file into your XAMPp folder.
5. Rename the MariaDB folder, called something like mariadb-5.5.37-win32, to mysql.
6. Rename xampp/mysql/data to data_ old.
7. Copy the xampp/mysql_old/data folder to xampp/mysql/.
8. Copy the xampp/mysql_old/backup folder to xampp/mysql/
9. Copy the xampp/mysql old/scripts folder to xampp/mysql/.
10. Copy mysql_uninstallservice.bat and mysql_installservice.bat from xampp/mysql_old/ intoxampp/mysql/.
11. Copy xampp/mysql_old/bin/my.ini into xampp/mysql/bin.
12. Edit xampp/mysql/bin/my.ini using a text editor like Notepad. Find skip-federated and add# in front (to the left) of it to comment out the line if it exists, Save and exit the editor.
13. Start-up XAMPP.

Note lf you can't get mysql to start from Xampp control panel. Add this 'skip-grant-tablesstatement anywhere in xampp/mysql/bin/my.ini file14 :Run xampp/mysql/bin/mysql upgrade.exe.15 : Shutdown and restart MariaDB (MySQL).If still mysql is not started then follow below Note steps(!lmportant)

Note :mysgl error log file: c:xamppmysql\binmysqld.exe: unknown variableinnodb _additional_mem_pool_size=2M' like please remove or commented this statement in my.ifile in this path xampp/mysql/bin/my.ini file

- [Mariadb download link](https://mariadb.org/download/?t=mariadb&o=true&p=mariadb&r=10.2.10&os=windows&cpu=x86_64&pkg=msi&mirror=archive)
