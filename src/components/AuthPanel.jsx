// src/components/AuthPanel.jsx
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../lib/supabase";

export default function AuthPanel() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Left Side Text */}
      <div className="hidden lg:flex flex-col justify-center px-12 w-1/2">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Learn with <span className="text-emerald-500">YoLearn</span>
        </h1>
        <p className="text-xl text-gray-600">
          Unlock your potential with our interactive learning platform.
        </p>
      </div>

      {/* Centered Auth Box */}
      <div className="flex items-center justify-center w-full lg:w-1/2">
        <div className="p-8 bg-white rounded-xl shadow-lg w-full max-w-md border border-gray-100">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold text-gray-800">YoLearn.ai</h2>
            <p className="text-gray-500 mt-1">Sign in with your email</p>
          </div>
          
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#10b981',
                    brandAccent: '#059669',
                    brandButtonText: 'white',
                  },
                },
              },
              className: {
                button: 'w-full !bg-emerald-500 hover:!bg-emerald-600 !text-white !font-medium !rounded-md !py-2.5 !transition-colors',
                input: '!rounded-md !py-2.5 !border-gray-300 focus:!border-emerald-500 focus:!ring-emerald-500 !text-gray-700',
                label: '!text-gray-700 !mb-1.5 !text-sm',
                container: '!w-full',
                divider: '!hidden',
              },
            }}
            theme="default"
            providers={[]}
            onlyThirdPartyProviders={false}
          />
        </div>
      </div>
    </div>
  );
}