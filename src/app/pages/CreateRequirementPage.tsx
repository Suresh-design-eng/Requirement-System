import { motion } from 'motion/react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useApp } from '../context/AppContext';
import { ArrowLeft, CheckCircle, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface RequirementFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline: string;
}

export default function CreateRequirementPage() {
  const navigate = useNavigate();
  const { addRequirement, currentUser } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RequirementFormData>();

  const onSubmit = async (data: RequirementFormData) => {
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    addRequirement({
      ...data,
      status: 'pending',
      createdBy: currentUser?.name || 'Unknown'
    });

    setShowSuccess(true);
    setTimeout(() => {
      navigate('/requirements');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card/30">
      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
        {/* Back Button */}
        <Link to="/requirements">
          <motion.button
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Requirements
          </motion.button>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold mb-3">Create Requirement</h1>
          <p className="text-lg text-muted-foreground">
            Add a new requirement to your system
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Requirement Title *
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                placeholder="e.g., Implement User Authentication System"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={6}
                placeholder="Provide detailed information about the requirement..."
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Priority & Deadline Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Priority *
                </label>
                <select
                  {...register('priority', { required: 'Priority is required' })}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                >
                  <option value="">Select priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                {errors.priority && (
                  <p className="text-sm text-destructive mt-1">{errors.priority.message}</p>
                )}
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Deadline *
                </label>
                <input
                  {...register('deadline', { required: 'Deadline is required' })}
                  type="date"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                {errors.deadline && (
                  <p className="text-sm text-destructive mt-1">{errors.deadline.message}</p>
                )}
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Attach Files (Optional)
              </label>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-1">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOC, DOCX up to 10MB
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Link to="/requirements" className="flex-1">
                <button
                  type="button"
                  className="w-full px-6 py-4 bg-muted hover:bg-muted/80 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || showSuccess}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-primary to-accent rounded-xl font-semibold text-white shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : showSuccess ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Created Successfully!
                  </span>
                ) : (
                  'Create Requirement'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Success Animation Overlay */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card rounded-3xl border border-border p-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Success!</h2>
              <p className="text-muted-foreground">Requirement created successfully</p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
