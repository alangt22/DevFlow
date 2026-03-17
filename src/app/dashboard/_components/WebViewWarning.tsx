"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export function WebViewWarning() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isWebView = /LinkedInApp|FBAN|FBAV|Instagram|TikTok|wv|Line/.test(ua);
    if (isWebView) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur">
      <div className="bg-gray-900 text-white p-6 rounded-2xl max-w-sm text-center shadow-xl">
        <h2 className="text-xl font-bold mb-2">⚠️ Abra no navegador</h2>

        <p className="text-sm opacity-90">
          Para sua segurança, o login com Google não funciona dentro do LinkedIn
          ou outros webviews.
          <br />
          Abra este site no Safari ou Chrome.
        </p>

        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success(
              "Link copiado! Abra o Safari/Chrome e cole na barra de endereço.",
            );
          }}
          className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium"
        >
          Copiar link
        </button>
      </div>
    </div>
  );
}
