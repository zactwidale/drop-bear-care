interface AccessibleErrorMessageProps {
  id: string;
  message: string;
}

export default function AccessibleErrorMessage({
  id,
  message,
}: AccessibleErrorMessageProps) {
  return (
    <div id={id} aria-live="polite" style={{ display: "none" }}>
      {message}
    </div>
  );
}
