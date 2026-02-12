import { BrowserRouter, Routes, Route } from "react-router-dom"
import { LandingPage } from "./pages/LandingPage"
import { CreateWrappedPage } from "./pages/CreateWrappedPage"
import { EditorPage } from "./pages/EditorPage"
import { ViewerPage } from "./pages/ViewerPage"
import { Toaster } from "./components/ui/toaster"
import { ErrorBoundary } from "./components/ErrorBoundary"

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/create" element={<CreateWrappedPage />} />
          <Route path="/editor/:slug" element={<EditorPage />} />
          <Route path="/w/:slug" element={
            <ErrorBoundary>
              <ViewerPage />
            </ErrorBoundary>
          } />
          <Route path="/wrapped/:slug" element={
            <ErrorBoundary>
              <ViewerPage />
            </ErrorBoundary>
          } />
          <Route path="/preview/:slug" element={<ViewerPage />} />
          {/* Note: Preview might reuse ViewerPage but with some flags */}
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  )
}

export default App
