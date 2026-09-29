import { Link } from 'react-router'
import { motion } from 'motion/react'
import { ArrowLeft, SearchX } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-background to-card/30 flex items-center">
      <div className="max-w-3xl mx-auto px-6 lg:px-12 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-3xl p-10 lg:p-14"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <SearchX className="w-10 h-10 text-primary" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
            404
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Page not found</h1>
          <p className="text-lg text-muted-foreground mb-8">
            The page you requested does not exist or may have been moved.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent font-semibold text-white shadow-lg shadow-primary/25"
            >
              Go Home
            </Link>
            <Link
              to="/jobs"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-card border border-border font-semibold hover:bg-accent/5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Browse Jobs
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
