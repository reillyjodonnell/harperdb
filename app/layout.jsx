import './styles.css';

export const metadata = {
  title: 'Weather app',
};

export default function Layout({ children }) {
  return (
    <html className="font-sans">
      <body className=" w-full bg-gradient-to-b from-slate-50 to-slate-100">
        <main className="flex-1 mx-auto max-w-3xl  p-4 md:p-8">
          {children}
          <footer className="text-sm font-medium text-slate-500 backdrop-blur-2xl">
            © {new Date().getFullYear()} Weather Chat App
          </footer>
        </main>
      </body>
    </html>
  );
}
