import { motion } from 'motion/react';
import { useParams, Link, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Calendar, User, Flag, Clock, CheckCircle, Edit, Trash } from 'lucide-react';

const statusColors = {
  pending: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  in_progress: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20'
};

const priorityColors = {
  low: 'bg-gray-500/10 text-gray-500',
  medium: 'bg-blue-500/10 text-blue-500',
  high: 'bg-orange-500/10 text-orange-500',
  urgent: 'bg-red-500/10 text-red-500'
};

export default function RequirementDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requirements, updateRequirement, deleteRequirement, currentUser } = useApp();

  const requirement = requirements.find(r => r.id === id);

  if (!requirement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Requirement not found</h2>
          <Link to="/requirements">
            <button className="px-6 py-3 bg-primary text-white rounded-xl">
              Back to Requirements
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const handleStatusChange = (newStatus: typeof requirement.status) => {
    updateRequirement(requirement.id, { status: newStatus });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this requirement?')) {
      deleteRequirement(requirement.id);
      navigate('/requirements');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card/30">
      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12">
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
          className="bg-card rounded-2xl border border-border p-8 mb-6"
        >
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize ${priorityColors[requirement.priority]}`}>
                  {requirement.priority}
                </span>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize border ${statusColors[requirement.status]}`}>
                  {requirement.status.replace('_', ' ')}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">{requirement.title}</h1>
              <p className="text-lg text-muted-foreground">{requirement.description}</p>
            </div>

            {currentUser?.role === 'admin' && (
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  className="p-3 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl transition-colors"
                >
                  <Trash className="w-5 h-5" />
                </motion.button>
              </div>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Deadline</p>
                <p className="font-medium">{new Date(requirement.deadline).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Created By</p>
                <p className="font-medium">{requirement.createdBy}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Created On</p>
                <p className="font-medium">{new Date(requirement.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Flag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Priority</p>
                <p className="font-medium capitalize">{requirement.priority}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Status Update Section */}
        {currentUser?.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border border-border p-8 mb-6"
          >
            <h2 className="text-xl font-semibold mb-6">Update Status</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {(['pending', 'in_progress', 'completed', 'rejected'] as const).map((status) => (
                <motion.button
                  key={status}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleStatusChange(status)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    requirement.status === status
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className={`w-5 h-5 ${requirement.status === status ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-medium capitalize">{status.replace('_', ' ')}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Additional Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border p-8"
        >
          <h2 className="text-xl font-semibold mb-6">Additional Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Full Description</h3>
              <p className="leading-relaxed">{requirement.description}</p>
            </div>
            {requirement.attachments && requirement.attachments.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Attachments</h3>
                <div className="flex flex-wrap gap-2">
                  {requirement.attachments.map((attachment, index) => (
                    <div key={index} className="px-4 py-2 bg-muted rounded-lg text-sm">
                      {attachment}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
