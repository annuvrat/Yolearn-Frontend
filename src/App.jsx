import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import AuthPanel from "./components/AuthPanel";
import PostOutput from "./components/PostOutput";
import GetOutput from "./components/GetOutput";
import './App.css';
function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) return <AuthPanel />;

  const token = session.access_token;
  const userId = session.user.id;
  return (
    <div className="min-h-screen w-full bg-gray-100 text-gray-800 flex items-center justify-center px-4">
      <div className="w-full max-w-8xl bg-white p-6 rounded-lg shadow space-y-6">
        <h1 className="text-2xl font-bold mb-6 text-center">🧠 AI Output App</h1>

        {session ? (
          <>
            <div className="flex justify-between mb-6">
              <button
                onClick={() => {
                  supabase.auth.signOut();
                  setSession(null);
                }}
                className="text-sm text-white underline bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-4 py-2 rounded-lg font"
              >
                Logout
              </button>
            </div>

            <PostOutput token={session.access_token} />
            <GetOutput
              token={session.access_token}
              userId={session.user.id}
            />
          </>
        ) : (
          <Login onLogin={(session) => setSession(session)} />
        )}
      </div>
    </div>
  );
}
export default App;
