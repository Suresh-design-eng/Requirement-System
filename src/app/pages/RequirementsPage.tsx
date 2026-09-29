import { motion } from 'motion/react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router';
import { Search, Filter, Plus, Eye, Trash } from 'lucide-react';

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

export default function RequirementsPage() {
  const { requirements, deleteRequirement, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card/30">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12"
        >
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3">Requirements</h1>
            <p className="text-lg text-muted-foreground">
              Manage and track all your requirements in one place
            </p>
          </div>

          <Link to="/create-requirement">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-xl font-semibold text-white shadow-lg shadow-primary/25"
            >
              <Plus className="w-5 h-5" />
              Create Requirement
            </motion.button>
          </Link>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search requirements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-12 pr-8 py-3 rounded-xl bg-card border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </motion.div>

        {/* Requirements Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-6 py-4 font-semibold text-sm">Title</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Priority</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Status</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Deadline</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Created By</th>
                  <th className="text-right px-6 py-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequirements.map((req, index) => (
                  <motion.tr
                    key={req.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border last:border-0 hover:bg-accent/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link to={`/requirements/${req.id}`}>
                        <div className="font-medium hover:text-primary transition-colors cursor-pointer">
                          {req.title}
                        </div>
                        <div className="text-sm text-muted-foreground truncate max-w-md">
                          {req.description}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize ${priorityColors[req.priority]}`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize border ${statusColors[req.status]}`}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(req.deadline).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">{req.createdBy}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/requirements/${req.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4 text-primary" />
                          </motion.button>
                        </Link>
                        {currentUser?.role === 'admin' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteRequirement(req.id)}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash className="w-4 h-4 text-destructive" />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRequirements.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No requirements found</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
