import React from 'react'

// Mobile-first button component with large touch targets
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  icon?: string
  children: React.ReactNode
}

export function Button({ 
  variant = 'primary', 
  size = 'large', 
  fullWidth = false, 
  icon, 
  children, 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseClasses = 'font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 active:scale-95'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-lg',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-lg',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 shadow-lg'
  }
  
  const sizeClasses = {
    small: 'px-4 py-2 text-sm min-h-[44px]',
    medium: 'px-6 py-3 text-base min-h-[48px]',
    large: 'px-8 py-4 text-lg min-h-[56px]'
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      {...props}
    >
      <div className="flex items-center justify-center space-x-2">
        {icon && <span className="text-xl">{icon}</span>}
        <span>{children}</span>
      </div>
    </button>
  )
}

// Card component with mobile-first design
interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'small' | 'medium' | 'large'
}

export function Card({ children, className = '', padding = 'medium' }: CardProps) {
  const paddingClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  }
  
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  )
}

// Status badge component
interface StatusBadgeProps {
  status: 'ON' | 'OFF' | 'pending' | 'approved' | 'rejected' | 'sick' | 'vacation' | 'personal' | 'training' | 'emergency'
  children?: React.ReactNode
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const statusClasses = {
    ON: 'bg-green-100 text-green-800 border-green-200',
    OFF: 'bg-gray-100 text-gray-800 border-gray-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    sick: 'bg-red-100 text-red-800 border-red-200',
    vacation: 'bg-blue-100 text-blue-800 border-blue-200',
    personal: 'bg-purple-100 text-purple-800 border-purple-200',
    training: 'bg-orange-100 text-orange-800 border-orange-200',
    emergency: 'bg-red-100 text-red-800 border-red-200'
  }
  
  const statusLabels = {
    ON: 'ON DUTY',
    OFF: 'OFF DUTY',
    pending: 'WAITING',
    approved: 'APPROVED',
    rejected: 'REJECTED',
    sick: 'SICK LEAVE',
    vacation: 'VACATION',
    personal: 'PERSONAL',
    training: 'TRAINING',
    emergency: 'EMERGENCY'
  }
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${statusClasses[status]}`}>
      {children || statusLabels[status]}
    </span>
  )
}

// Mobile-first input component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Input({ label, error, helperText, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-lg font-bold text-gray-900">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 text-lg border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-600 text-sm font-medium">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-gray-600 text-sm">{helperText}</p>
      )}
    </div>
  )
}

// Mobile-first select component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: Array<{ value: string; label: string }>
}

export function Select({ label, error, helperText, options, className = '', ...props }: SelectProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-lg font-bold text-gray-900">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-3 text-lg border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        } ${className}`}
        {...props}
      >
        <option value="">Choose...</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-600 text-sm font-medium">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-gray-600 text-sm">{helperText}</p>
      )}
    </div>
  )
}

// Mobile-first textarea component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Textarea({ label, error, helperText, className = '', ...props }: TextareaProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-lg font-bold text-gray-900">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-3 text-lg border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 resize-none ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-600 text-sm font-medium">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-gray-600 text-sm">{helperText}</p>
      )}
    </div>
  )
}

// Mobile-first page header
interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: string
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, icon, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        {icon && <span className="text-3xl">{icon}</span>}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 text-lg">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// Mobile-first stats card
interface StatsCardProps {
  title: string
  value: string | number
  icon?: string
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  trend?: 'up' | 'down' | 'neutral'
}

export function StatsCard({ title, value, icon, color = 'blue', trend }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900'
  }
  
  const trendIcons = {
    up: '📈',
    down: '📉',
    neutral: '➡️'
  }
  
  return (
    <Card className={`text-center ${colorClasses[color]}`}>
      <div className="space-y-2">
        {icon && <div className="text-3xl">{icon}</div>}
        <div className="text-3xl font-bold">{value}</div>
        <div className="text-lg font-medium">{title}</div>
        {trend && (
          <div className="text-sm opacity-75">{trendIcons[trend]}</div>
        )}
      </div>
    </Card>
  )
}

// Mobile-first loading spinner
export function LoadingSpinner({ size = 'large' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  }
  
  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 ${sizeClasses[size]}`}></div>
    </div>
  )
}

// Mobile-first empty state
interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && <div className="text-6xl mb-4">{icon}</div>}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 text-lg mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}








