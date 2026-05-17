import { useEffect } from 'react'

const setMetaTag = (name, content, attribute = 'name') => {
  let element = document.head.querySelector(`meta[${attribute}="${name}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

export const useDocumentMeta = ({
  title,
  description,
  robots = 'index, follow',
  ogTitle,
  ogDescription,
}) => {
  useEffect(() => {
    if (title) {
      document.title = title
    }

    if (description) {
      setMetaTag('description', description)
    }

    setMetaTag('robots', robots)

    if (ogTitle || title) {
      setMetaTag('og:title', ogTitle || title, 'property')
      setMetaTag('twitter:title', ogTitle || title)
    }

    if (ogDescription || description) {
      const resolvedDescription = ogDescription || description
      setMetaTag('og:description', resolvedDescription, 'property')
      setMetaTag('twitter:description', resolvedDescription)
    }
  }, [description, ogDescription, ogTitle, robots, title])
}
