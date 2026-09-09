interface PasswordEyeIconProps {
  visible: boolean;
}

/*
  Eye icon used by the show/hide password
  toggle on the login and register forms.

  `visible` reflects whether the password is
  currently readable, so the icon shows the
  struck-through eye while it is.
*/

export default function PasswordEyeIcon({
  visible,
}: PasswordEyeIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      {visible ? (
        <>
          <path d="M3 3l18 18" />

          <path d="M10.6 10.6a2 2 0 002.8 2.8" />

          <path d="M9.9 5.2A9.6 9.6 0 0112 5c5 0 9 4.5 9 7a11 11 0 01-2.4 3.4" />

          <path d="M6.6 6.6C4.3 8 3 10.2 3 12c0 2.5 4 7 9 7a9.3 9.3 0 004.4-1.1" />
        </>
      ) : (
        <>
          <path d="M3 12c0-2.5 4-7 9-7s9 4.5 9 7-4 7-9 7-9-4.5-9-7z" />

          <circle cx="12" cy="12" r="2.5" />
        </>
      )}
    </svg>
  );
}
