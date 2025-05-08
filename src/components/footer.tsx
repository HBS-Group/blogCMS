import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-700/50 p-6 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start gap-2">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Tech AI Generator. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Powered by <Link target="_blank" href="hbs-group.xyz"> Hyber Business Solution</Link>
          </p>
        </div>
        <div className="flex space-x-6">
          <a 
            href="#" 
            className="text-gray-400 hover:text-emerald-400 transition-colors duration-300"
            aria-label="Terms of Service"
          >
            Terms
          </a>
          <a 
            href="#" 
            className="text-gray-400 hover:text-emerald-400 transition-colors duration-300"
            aria-label="Privacy Policy"
          >
            Privacy
          </a>
          <a 
            href="#" 
            className="text-gray-400 hover:text-emerald-400 transition-colors duration-300"
            aria-label="Contact Us"
          >
            Contact
          </a>
          <a 
            href="https://github.com/your-repo" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-emerald-400 transition-colors duration-300"
            aria-label="GitHub Repository"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}