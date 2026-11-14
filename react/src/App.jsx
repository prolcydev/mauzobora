import React, { useEffect, useState } from 'react';

export default function App() {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [frameVersion, setFrameVersion] = useState(0);

  useEffect(() => {
    document.title = 'Mauzobora | Shop Management';
  }, []);

  const retry = () => {
    setReady(false);
    setFailed(false);
    setFrameVersion(version => version + 1);
  };

  return (
    <main className="app-frame" aria-label="Mauzobora application">
      {!ready && !failed && (
        <div className="boot-screen" role="status">
          <div className="boot-brand"><span className="brand-symbol">m</span><span>Mauzobora</span></div>
          <span className="boot-spinner" />
          <p>Preparing your workspace</p>
        </div>
      )}
      <iframe
        key={frameVersion}
        id="mauzobora-workspace"
        className="workspace-frame"
        src="/legacy-app.html"
        title="Mauzobora workspace"
        onLoad={() => { setReady(true); setFailed(false); }}
        onError={() => { setReady(false); setFailed(true); }}
        style={failed ? { display: 'none' } : undefined}
        allow="clipboard-read; clipboard-write; microphone"
      />
      {failed && (
        <section className="frame-error" role="alert">
          <div className="error-mark">!</div>
          <h1>We couldn't open your workspace</h1>
          <p>Check your connection and try again.</p>
          <button type="button" onClick={retry}>Try again</button>
        </section>
      )}
    </main>
  );
}
