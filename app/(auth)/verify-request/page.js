 
export default function VerifyRequest() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
          {/* Logo */}
          <div className="flex justify-center">
            
          </div>
  
          {/* Content */}
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Email adresinize bir bağlantı gönderildi.
            </h2>
            <div className="mt-4 text-gray-600">
              <p className="mb-4">
                Bağlantı ile giriş yapabilirsiniz.
              </p>
              <p className="text-sm">
                Eğer görünmezse lütfen spam klasörünüzü kontrol ediniz. Bağlantı 24 saat sonra geçersiz hale gelecektir.
              </p>
            </div>
  
            {/* Email icon */}
            <div className="mt-8 flex justify-center">
              <svg
                className="h-16 w-16 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
  
            {/* Additional instructions */}
            <div className="mt-8 text-sm text-gray-500">
              <p>
                Email adresinize bir bağlantı gönderilmedi mi?{" "}
                <a href="/login" className="text-blue-600 hover:text-blue-800">
                  Tekrar dene
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  