const Footer = () => (
  <footer id="contact" className="bg-slate-950 text-gray-500 py-6">
    <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4 gap-4">
      <p className="text-sm">
        © 2025 MatchStudy. Todos los derechos reservados.
      </p>
      <div className="flex gap-4">
        <a href="#" className="hover:text-white transition-colors">
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-label="Facebook" />
        </a>
        <a href="#" className="hover:text-white transition-colors">
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-label="Instagram" />
        </a>
        <a href="#" className="hover:text-white transition-colors">
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-label="Twitter" />
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
