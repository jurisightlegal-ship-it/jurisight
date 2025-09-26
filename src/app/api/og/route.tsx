import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'Jurisight - Legal Knowledge Platform'
    const description = searchParams.get('description') || 'Democratizing access to legal information and empowering the legal community in India'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
            fontFamily: 'Inter, system-ui, sans-serif',
            position: 'relative',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 200, 255, 0.3) 0%, transparent 50%)',
            }}
          />
          
          {/* Content Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px',
              textAlign: 'center',
              maxWidth: '1000px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Logo/Brand - Using text instead of image for reliability */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                }}
              >
                {/* Logo Icon */}
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <div
                    style={{
                      color: 'white',
                      fontSize: '32px',
                      fontWeight: 'bold',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                  >
                    J
                  </div>
                </div>
                
                {/* Brand Name */}
                <div
                  style={{
                    color: 'white',
                    fontSize: '48px',
                    fontWeight: 'bold',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  Jurisight
                </div>
              </div>
            </div>

            {/* Title */}
            <div
              style={{
                color: 'white',
                fontSize: '56px',
                fontWeight: 'bold',
                lineHeight: '1.2',
                marginBottom: '24px',
                textAlign: 'center',
                maxWidth: '900px',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              }}
            >
              {title}
            </div>

            {/* Description */}
            <div
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '24px',
                lineHeight: '1.4',
                marginBottom: '32px',
                textAlign: 'center',
                maxWidth: '800px',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              }}
            >
              {description}
            </div>

            {/* Legal Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 24px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '2px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                marginTop: '20px',
              }}
            >
              <div
                style={{
                  color: '#10b981',
                  fontSize: '18px',
                  fontWeight: '600',
                }}
              >
                ⚖️ Legal Knowledge Platform
              </div>
            </div>
          </div>

          {/* Bottom Accent */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '200px',
              height: '4px',
              background: 'linear-gradient(90deg, #10b981 0%, #059669 50%, #047857 100%)',
              borderRadius: '2px',
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('OG Image generation error:', error)
    return new Response('Failed to generate image', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }
}