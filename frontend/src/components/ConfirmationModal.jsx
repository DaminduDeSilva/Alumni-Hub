import React, { useEffect } from "react";
import { createPortal } from "react-dom";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity backdrop-blur-md"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-[32px] bg-white text-left shadow-2xl transition-all sm:w-full sm:max-w-lg border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white px-8 pb-8 pt-10">
            <div className="sm:flex sm:items-start text-center sm:text-left">
              {/* Icon Container */}
              <div
                className={`mx-auto flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl sm:mx-0 ${
                  isDangerous ? "bg-red-50 text-red-500" : "bg-primary/5 text-primary"
                }`}
              >
                {isDangerous ? (
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                ) : (
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                )}
              </div>

              {/* Content */}
              <div className="mt-6 sm:ml-6 sm:mt-0">
                <h3 className="text-2xl font-headings font-black leading-6 text-primary tracking-tight">
                  {title}
                </h3>
                <div className="mt-4">
                  <p className="text-sm text-gray-400 font-bold leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="bg-gray-50/50 px-8 py-6 sm:flex sm:flex-row-reverse gap-3">
            <button
              type="button"
              className={`inline-flex w-full justify-center rounded-2xl px-8 py-4 text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 sm:w-auto ${
                isDangerous
                  ? "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20"
                  : "bg-primary text-white hover:bg-primary-light shadow-primary/20"
              }`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-2xl bg-white px-8 py-4 text-xs font-black uppercase tracking-widest text-gray-400 shadow-sm ring-1 ring-inset ring-gray-100 hover:bg-gray-50 transition-all active:scale-95 sm:mt-0 sm:w-auto"
              onClick={onClose}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationModal;
