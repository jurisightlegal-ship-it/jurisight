import Script from 'next/script'

interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'Article' | 'BreadcrumbList'
  data: any
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case 'Organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Jurisight',
          description: 'Legal Knowledge Platform democratizing access to legal information and empowering the legal community in India',
          url: process.env.NEXT_PUBLIC_SITE_URL || 'https://jurisight.in',
          logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jurisight.in'}/Jurisight.png`,
          sameAs: [
            'https://twitter.com/jurisight',
            'https://linkedin.com/company/jurisight',
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            email: 'contact@jurisight.in',
          },
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'IN',
          },
          ...data,
        }
      
      case 'WebSite':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Jurisight',
          description: 'Legal Knowledge Platform democratizing access to legal information and empowering the legal community in India',
          url: process.env.NEXT_PUBLIC_SITE_URL || 'https://jurisight.in',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jurisight.in'}/articles?query={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Jurisight',
            logo: {
              '@type': 'ImageObject',
              url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jurisight.in'}/Jurisight.png`,
            },
          },
          ...data,
        }
      
      case 'Article':
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          ...data,
        }
      
      case 'BreadcrumbList':
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: data,
        }
      
      default:
        return data
    }
  }

  return (
    <Script
      id={`structured-data-${type.toLowerCase()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData()),
      }}
    />
  )
}

// Predefined structured data for common use cases
export function HomepageStructuredData() {
  return (
    <>
      <StructuredData
        type="Organization"
        data={{
          foundingDate: '2024',
          founder: {
            '@type': 'Person',
            name: 'Jurisight Team',
          },
          areaServed: {
            '@type': 'Country',
            name: 'India',
          },
          serviceType: 'Legal Information Platform',
          knowsAbout: [
            'Supreme Court Judgements',
            'High Court Rulings',
            'Legal Analysis',
            'Indian Law',
            'Legal Education',
            'Jurisprudence',
          ],
        }}
      />
      <StructuredData
        type="WebSite"
        data={{
          inLanguage: 'en-IN',
          copyrightYear: new Date().getFullYear(),
          dateCreated: '2024-01-01',
          dateModified: new Date().toISOString().split('T')[0],
        }}
      />
    </>
  )
}
