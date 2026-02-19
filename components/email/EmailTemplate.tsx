import * as React from 'react';

interface EmailTemplateProps {
    content?: string;
    title?: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
    content,
    title = 'Mindfire Homes Update',
}) => (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f9fafb', padding: '40px 20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            {/* Header */}
            <div style={{ backgroundColor: '#1a1a1a', padding: '24px', textAlign: 'center' }}>
                <h1 style={{ color: '#ffffff', margin: 0, fontSize: '24px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    Mindfire Homes
                </h1>
            </div>

            {/* Body */}
            <div style={{ padding: '32px', color: '#374151', lineHeight: '1.6' }}>
                <h2 style={{ marginTop: 0, color: '#111827', fontSize: '20px' }}>{title}</h2>

                {content ? (
                    <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
                ) : (
                    <p>Hello,</p>
                )}

                <p style={{ marginTop: '24px' }}>
                    Best regards,<br />
                    <strong>The Mindfire Homes Team</strong>
                </p>
            </div>

            {/* Footer */}
            <div style={{ backgroundColor: '#f3f4f6', padding: '20px', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
                <p style={{ margin: 0 }}>
                    © {new Date().getFullYear()} Mindfire Homes. All rights reserved.
                </p>
                <p style={{ margin: '8px 0 0' }}>
                    Real Estate & Investment<br />
                    Beverly Hills, CA 90210
                </p>
            </div>
        </div>
    </div>
);
