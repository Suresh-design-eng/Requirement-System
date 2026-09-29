export type UserRole = 'admin' | 'user';
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type ApplicationStatus =
  | 'applied'
  | 'in_review'
  | 'shortlisted'
  | 'rejected'
  | 'interview_scheduled'
  | 'accepted';
export type Availability = 'immediate' | 'notice_period';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  skills?: string[];
  experienceYears?: number;
  education?: string;
  location?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  expectedSalary?: string;
  resumeUrl?: string;
  resumeName?: string;
}

export interface Requirement {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  deadline: string;
  createdBy: string;
  createdAt: string;
  attachments?: string[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  adminName: string;
  description: string;
  department: string;
  location: string;
  type: JobType;
  salary: string;
  requirements: string[];
  skills: string[];
  experienceYearsRequired: number;
  postedDate: string;
  deadline: string;
  lat?: number;
  lng?: number;
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: ApplicationStatus;
  appliedDate: string;
  lastUpdatedAt?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  resumeUrl?: string;
  resumeName?: string;
  skills?: string[];
  experienceYears?: number;
  coverLetter?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  expectedSalary?: string;
  availability?: Availability;
  interviewType?: 'online' | 'offline';
  interviewDate?: string;
  interviewLink?: string;
  interviewLocation?: string;
}

export interface JobApplicationInput {
  jobId: string;
  fullName: string;
  email: string;
  phone: string;
  skills: string[];
  experienceYears: number;
  coverLetter: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  expectedSalary?: string;
  availability: Availability;
  resumeFile?: File | null;
}

export interface ResumeAnalysis {
  extractedSkills: string[];
  extractedExperience: string;
  missingSkills: string[];
  improvementTips: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'application' | 'job' | 'profile';
  link?: string;
}

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@requirementsys.com',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    phone: '+1 (555) 120-4567',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    experienceYears: 4,
    education: 'B.Tech in Computer Science',
    location: 'San Francisco, CA',
    portfolioUrl: 'https://portfolio.example.com/john',
    githubUrl: 'https://github.com/johndoe',
    linkedinUrl: 'https://linkedin.com/in/johndoe',
    expectedSalary: '$140,000'
  },
  {
    id: '3',
    name: 'Sarah Smith',
    email: 'sarah@example.com',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    phone: '+1 (555) 778-2211',
    skills: ['Figma', 'UI/UX', 'Design Systems'],
    experienceYears: 3,
    education: 'M.Des in Interaction Design',
    location: 'New York, NY',
    portfolioUrl: 'https://portfolio.example.com/sarah',
    linkedinUrl: 'https://linkedin.com/in/sarahsmith',
    expectedSalary: '$115,000'
  }
];

export const mockRequirements: Requirement[] = [
  {
    id: '1',
    title: 'Implement User Authentication System',
    description: 'Build a secure authentication system with JWT tokens, password hashing, and role-based access control.',
    priority: 'urgent',
    status: 'in_progress',
    deadline: '2026-04-30',
    createdBy: 'Admin User',
    createdAt: '2026-04-01'
  },
  {
    id: '2',
    title: 'Database Migration to PostgreSQL',
    description: 'Migrate existing MySQL database to PostgreSQL for better performance and scalability.',
    priority: 'high',
    status: 'pending',
    deadline: '2026-05-15',
    createdBy: 'Admin User',
    createdAt: '2026-04-05'
  },
  {
    id: '3',
    title: 'Mobile App UI Redesign',
    description: 'Redesign the mobile application interface to match new branding guidelines.',
    priority: 'medium',
    status: 'completed',
    deadline: '2026-04-10',
    createdBy: 'Admin User',
    createdAt: '2026-03-20'
  },
  {
    id: '4',
    title: 'API Documentation Update',
    description: 'Update API documentation with latest endpoints and examples.',
    priority: 'low',
    status: 'pending',
    deadline: '2026-05-01',
    createdBy: 'Admin User',
    createdAt: '2026-04-08'
  }
];

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Full Stack Developer',
    company: 'RequirementSys Labs',
    adminName: 'Admin User',
    description: 'We are looking for an experienced full stack developer to join our engineering team and build candidate-facing hiring workflows.',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'full-time',
    salary: '$120,000 - $180,000',
    requirements: [
      '5+ years of experience with React and Node.js',
      'Strong understanding of TypeScript',
      'Experience with cloud platforms (AWS/GCP)',
      'Excellent communication skills'
    ],
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    experienceYearsRequired: 5,
    postedDate: '2026-04-01',
    deadline: '2026-05-01',
    lat: 37.7749,
    lng: -122.4194
  },
  {
    id: '2',
    title: 'UX/UI Designer',
    company: 'RequirementSys Labs',
    adminName: 'Admin User',
    description: 'Join our design team to create beautiful and intuitive user experiences for the next generation of hiring tools.',
    department: 'Design',
    location: 'New York, NY',
    type: 'full-time',
    salary: '$90,000 - $130,000',
    requirements: [
      '3+ years of UI/UX design experience',
      'Proficiency in Figma and Adobe Creative Suite',
      'Strong portfolio demonstrating design thinking',
      'Understanding of modern design principles'
    ],
    skills: ['Figma', 'UI/UX', 'Design Systems', 'Research'],
    experienceYearsRequired: 3,
    postedDate: '2026-04-05',
    deadline: '2026-04-30',
    lat: 40.7128,
    lng: -74.006
  },
  {
    id: '3',
    title: 'DevOps Engineer',
    company: 'CloudScale Ops',
    adminName: 'Admin User',
    description: 'Help us build and maintain scalable infrastructure for our applications and shipping pipelines.',
    department: 'Operations',
    location: 'Austin, TX',
    type: 'full-time',
    salary: '$110,000 - $160,000',
    requirements: [
      'Experience with Kubernetes and Docker',
      'Strong knowledge of CI/CD pipelines',
      'Familiarity with monitoring tools',
      'Scripting skills (Python, Bash)'
    ],
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'Python'],
    experienceYearsRequired: 4,
    postedDate: '2026-04-08',
    deadline: '2026-05-10',
    lat: 30.2672,
    lng: -97.7431
  },
  {
    id: '4',
    title: 'Product Manager',
    company: 'RequirementSys Labs',
    adminName: 'Admin User',
    description: 'Lead product strategy and roadmap for our flagship SaaS platform while partnering closely with design and engineering.',
    department: 'Product',
    location: 'Seattle, WA',
    type: 'full-time',
    salary: '$130,000 - $170,000',
    requirements: [
      '4+ years of product management experience',
      'Strong analytical and problem-solving skills',
      'Experience with agile methodologies',
      'Excellent stakeholder management'
    ],
    skills: ['Product Strategy', 'Analytics', 'Agile', 'Stakeholder Management'],
    experienceYearsRequired: 4,
    postedDate: '2026-04-10',
    deadline: '2026-05-15',
    lat: 47.6062,
    lng: -122.3321
  },
  {
    id: '5',
    title: 'Frontend Engineering Intern',
    company: 'RequirementSys Labs',
    adminName: 'Admin User',
    description: 'Launch your frontend career by working on production React features with guidance from senior engineers.',
    department: 'Engineering',
    location: 'Remote',
    type: 'internship',
    salary: '$2,000 / month stipend',
    requirements: [
      'Strong fundamentals in HTML, CSS, and JavaScript',
      'Exposure to React projects or coursework',
      'Curiosity, ownership, and willingness to learn',
      'Availability for a 6 month internship'
    ],
    skills: ['React', 'JavaScript', 'CSS', 'HTML'],
    experienceYearsRequired: 0,
    postedDate: '2026-04-12',
    deadline: '2026-05-25'
  }
];

export const mockApplications: Application[] = [
  {
    id: '1',
    jobId: '1',
    userId: '2',
    status: 'interview_scheduled',
    appliedDate: '2026-04-12',
    lastUpdatedAt: '2026-04-14T10:00:00',
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 120-4567',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    experienceYears: 4,
    coverLetter: 'I would love to contribute to the team and help scale the hiring platform.',
    portfolioUrl: 'https://portfolio.example.com/john',
    githubUrl: 'https://github.com/johndoe',
    linkedinUrl: 'https://linkedin.com/in/johndoe',
    expectedSalary: '$140,000',
    availability: 'notice_period',
    resumeName: 'John_Doe_Resume.pdf',
    interviewType: 'online',
    interviewDate: '2026-04-20T10:00:00',
    interviewLink: 'https://zoom.us/j/123456789'
  },
  {
    id: '2',
    jobId: '3',
    userId: '2',
    status: 'in_review',
    appliedDate: '2026-04-11',
    lastUpdatedAt: '2026-04-13T08:30:00',
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 120-4567',
    skills: ['AWS', 'Docker', 'Python'],
    experienceYears: 4,
    coverLetter: 'My background in automation and infrastructure makes me a strong fit for this role.',
    githubUrl: 'https://github.com/johndoe',
    linkedinUrl: 'https://linkedin.com/in/johndoe',
    expectedSalary: '$145,000',
    availability: 'immediate',
    resumeName: 'John_Doe_Resume.pdf'
  }
];
