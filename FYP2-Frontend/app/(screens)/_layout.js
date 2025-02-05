import { Stack } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useEffect } from "react";

export default function Layout() {
  useEffect(() => {
      setTimeout(() => {
      setStatusBarStyle("light");
    }, 0);
  }, []);
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{title:"Admin Dashboard", headerShown: true, headerBackVisible:false }} />
      <Stack.Screen name="user_dashboard" options={{title:"User Dashboard", headerShown: true, headerBackVisible:false }} />
      <Stack.Screen name="camera" options={{ title:'Verify...', headerShown: true }} />
      <Stack.Screen name="userlist" options={{ title:'User List', headerShown: true, headerBackVisible:false }} />
      <Stack.Screen name="attendance" options={{ title:'Attendance Log', headerShown: true, headerBackVisible:false }} />
      <Stack.Screen name="attendance_admin" options={{ title:'Attendance Log', headerShown: true, headerBackVisible:false }} />
      <Stack.Screen name="monthly_attendance_admin" options={{ title:'Monthly Attendance', headerShown: true, headerBackVisible:false }} />
      <Stack.Screen name="monthly_record_admin" options={{ title:'Monthly Record', headerShown: true, headerBackVisible:true }} />
      <Stack.Screen name="updateTimes" options={{ title:'Update Times', headerShown: true, headerBackVisible:false }} />
      <Stack.Screen name="forgotpassword" options={{ title:'Forgot Password', headerShown: true }} />
      <Stack.Screen name="editprofile" options={{ title:'Edit Profile', headerShown: true, headerBackVisible:false }} />
      <Stack.Screen name="user_editprofile" options={{ title:'Edit Profile', headerShown: false, headerBackVisible:false }} />
      <Stack.Screen name="generateReport" options={{ title:'Generate Report', headerShown: false, headerBackVisible:false }} />
    </Stack>
  );
}
