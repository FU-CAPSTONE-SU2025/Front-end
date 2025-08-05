import { useEffect } from 'react';

export default function ConsoleWarning() {
    // LMAO THIS IS NOT FACEBOOK
    // Should only trigger in production
    useEffect(() => {
        const warning = `
🚨  WARNING  🚨

This is a browser feature intended for developers.
If someone asked you to copy and paste something here,
they are trying to scam you. Yeah, yeah, this is scammer payback talking...
Close this window immediately!
If you're a developer and need to use this feature,
you can ignore this warning.

*ps: Of course, I am a developer. This warning can't stop me because I cannot read.
        `;
        
        console.log('%c' + warning, `
          color: #dc2626;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          font-weight: bold;
          white-space: pre-line;
        `);
    }, []);

    return null;
}

