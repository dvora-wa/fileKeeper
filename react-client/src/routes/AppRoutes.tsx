import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  FilesPage,
  FolderPage,
  ProfilePage,
  NotFoundPage
} from '../pages'
import { useAuth } from '../hooks'
import { ProtectedRoute } from '../components/auth'
import { MainLayout } from '../components/layout'

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/auth/login"
        element={
          <ProtectedRoute requireAuth={false}>
            <LoginPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/auth/register"
        element={
          <ProtectedRoute requireAuth={false}>
            <RegisterPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="files" element={<FilesPage />} />
        <Route path="files/:folderId" element={<FilesPage />} />
        <Route path="folders" element={<FolderPage />} />
        <Route path="folders/:folderId" element={<FolderPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

// import React from 'react'
// import { Routes, Route, Navigate } from 'react-router-dom'
// import {
//   LoginPage,
//   RegisterPage,
//   DashboardPage,
//   FilesPage,
//   FolderPage,
//   ProfilePage,
//   NotFoundPage
// } from '../pages'
// import { useAuth } from '../hooks'
// import { ProtectedRoute } from '../components/auth'
// import { MainLayout } from '../components/layout'

// export const AppRoutes: React.FC = () => {
//   const { isAuthenticated, isLoading } = useAuth()

//   // Debug logs
//   console.log('AppRoutes - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated)

//   // זמני: אם הטעינה לוקחת יותר מ-5 שניות, תמשיך בכל מקרה
//   const [forceRender, setForceRender] = React.useState(false)
  
//   React.useEffect(() => {
//     const timer = setTimeout(() => {
//       console.log('Forcing render after 5 seconds timeout')
//       setForceRender(true)
//     }, 5000)
    
//     return () => clearTimeout(timer)
//   }, [])

//   if (isLoading && !forceRender) {
//     console.log('AppRoutes - Showing loading spinner')
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//         <p className="ml-4">טוען... (אם זה לוקח יותר מ-5 שניות, יש בעיה ב-useAuth)</p>
//       </div>
//     )
//   }

//   console.log('AppRoutes - Rendering routes')

//   return (
//     <div>
//       <div style={{background: 'red', color: 'white', padding: '10px'}}>
//         Debug: isAuthenticated = {String(isAuthenticated)}, current path = {window.location.pathname}
//       </div>
      
//       <Routes>
//         {/* Public Routes */}
//         <Route
//           path="/auth/login"
//           element={
//             <ProtectedRoute requireAuth={false}>
//               <LoginPage />
//             </ProtectedRoute>
//           }
//         />
        
//         <Route
//           path="/auth/register"
//           element={
//             <ProtectedRoute requireAuth={false}>
//               <RegisterPage />
//             </ProtectedRoute>
//           }
//         />

//         {/* Protected Routes */}
//         <Route
//           path="/"
//           element={
//             <ProtectedRoute>
//               <MainLayout />
//             </ProtectedRoute>
//           }
//         >
//           <Route index element={<Navigate to="/dashboard" replace />} />
//           <Route path="dashboard" element={<DashboardPage />} />
//           <Route path="files" element={<FilesPage />} />
//           <Route path="files/:folderId" element={<FilesPage />} />
//           <Route path="folders" element={<FolderPage />} />
//           <Route path="folders/:folderId" element={<FolderPage />} />
//           <Route path="profile" element={<ProfilePage />} />
//         </Route>

//         {/* Catch all */}
//         <Route path="*" element={<NotFoundPage />} />
//       </Routes>
//     </div>
//   )
// }
