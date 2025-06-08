import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Home } from 'lucide-react'
import type { BreadcrumbItem } from '../../types'

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  return (
    <nav className={`flex items-center gap-1 text-sm ${className}`}>
      <Link
        to="/dashboard"
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home size={16} />
        <span>בית</span>
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <ChevronLeft size={16} className="text-muted-foreground" />
          
          {index === items.length - 1 ? (
            <span className="font-medium text-foreground">{item.name}</span>
          ) : (
            <Link
              to={item.path}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}


