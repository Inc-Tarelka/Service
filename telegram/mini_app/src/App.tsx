import './App.css'

function App() {
  window.Telegram?.WebApp?.ready();

  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;

  return (
    <>
      <h1>Привет, {user?.first_name}</h1>
      <h3>Inc. Tarelka </h3>
      <p>ID: {user?.id}</p>
    </>
  )
}

export default App
