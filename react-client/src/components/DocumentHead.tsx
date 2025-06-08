import { useEffect } from 'react'

interface DocumentHeadProps {
  title?: string
  description?: string
  keywords?: string
}

/**
 * קומפוננט לניהול מטא-דאטה של הדף
 * תחליף מודרני ל-react-helmet-async
 */
export const DocumentHead: React.FC<DocumentHeadProps> = ({ 
  title, 
  description, 
  keywords 
}) => {
  useEffect(() => {
    // עדכון כותרת הדף
    if (title) {
      document.title = title
    }

    // עדכון תיאור הדף
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]')
      if (!metaDesc) {
        metaDesc = document.createElement('meta')
        metaDesc.setAttribute('name', 'description')
        document.head.appendChild(metaDesc)
      }
      metaDesc.setAttribute('content', description)
    }

    // עדכון מילות מפתח
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', keywords)
    }
  }, [title, description, keywords])

  return null // לא מרנדר כלום - רק מעדכן meta tags
}