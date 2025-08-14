"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass'
  hover?: boolean
  children: React.ReactNode
}

export function Card({ 
  variant = 'default', 
  hover = false, 
  className, 
  children, 
  ...props 
}: CardProps) {
  const variants = {
    default: 'bg-white shadow-sm border border-secondary-200/50',
    elevated: 'bg-white shadow-lg border border-secondary-200/50',
    outlined: 'bg-white border-2 border-secondary-200',
    glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -4, scale: 1.02 } : undefined}
      className={clsx(
        'rounded-xl transition-all duration-300',
        variants[variant],
        hover && 'hover:shadow-xl hover:shadow-primary-500/10',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('px-6 py-4 border-b border-secondary-200/50', className)} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('px-6 py-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('px-6 py-4 border-t border-secondary-200/50', className)} {...props}>
      {children}
    </div>
  )
}
