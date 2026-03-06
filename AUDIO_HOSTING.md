# Audio Files Hosting Instructions

## Overview
The WeChat Mini Program now uses a streaming audio system that loads piano samples from the internet on first use and caches them locally. This keeps the app size under 2MB while providing high-quality piano sounds.

## Required Audio Files

You need to host the following 30 MP3 files on a CDN or web server:

### A Notes (8 files)
- A0.mp3, A1.mp3, A2.mp3, A3.mp3, A4.mp3, A5.mp3, A6.mp3, A7.mp3

### C Notes (8 files)
- C1.mp3, C2.mp3, C3.mp3, C4.mp3, C5.mp3, C6.mp3, C7.mp3, C8.mp3

### D♯/E♭ Notes (7 files)
- Ds1.mp3, Ds2.mp3, Ds3.mp3, Ds4.mp3, Ds5.mp3, Ds6.mp3, Ds7.mp3

### F♯/G♭ Notes (7 files)
- Fs1.mp3, Fs2.mp3, Fs3.mp3, Fs4.mp3, Fs5.mp3, Fs6.mp3, Fs7.mp3

## Setup Instructions

### 1. Upload Audio Files
Upload all 30 MP3 files to your web server or CDN in a directory called `audio/`.

### 2. Update Base URL
In `src/hooks/useAudioCache.ts`, update the `AUDIO_BASE_URL` constant:

```typescript
const AUDIO_BASE_URL = 'https://your-cdn.com/audio' // Replace with your actual URL
```

### 3. Enable HTTPS
Make sure your audio files are served over HTTPS, as required by WeChat Mini Programs.

### 4. Test the Setup
- Build and run the mini program
- Play some notes - they should load on first use
- Check that subsequent plays are instant (from cache)

## How It Works

1. **First Play**: Audio files are downloaded from your CDN and cached in the device's local storage
2. **Subsequent Plays**: Loaded instantly from local cache
3. **Fallback**: If download fails, the app uses oscillator sounds
4. **Cache Location**: Files are stored in WeChat's user data directory
5. **Cache Persistence**: Files remain cached until the user clears the app data

## CDN Recommendations

### Free Options
- GitHub Pages (for personal projects)
- Netlify
- Vercel
- Firebase Hosting

### Paid Options
- AWS S3 + CloudFront
- Cloudflare R2
- Alibaba Cloud OSS
- Tencent Cloud COS

## File Organization

```
your-cdn.com/
└── audio/
    ├── A0.mp3, A1.mp3, A2.mp3, A3.mp3, A4.mp3, A5.mp3, A6.mp3, A7.mp3
    ├── C1.mp3, C2.mp3, C3.mp3, C4.mp3, C5.mp3, C6.mp3, C7.mp3, C8.mp3
    ├── Ds1.mp3, Ds2.mp3, Ds3.mp3, Ds4.mp3, Ds5.mp3, Ds6.mp3, Ds7.mp3
    └── Fs1.mp3, Fs2.mp3, Fs3.mp3, Fs4.mp3, Fs5.mp3, Fs6.mp3, Fs7.mp3
```

## Bandwidth Considerations

- Each MP3 file is ~50-120KB
- Total size: ~2.5MB for all files
- Average user loads ~5-10 files per session
- Estimated bandwidth: 500KB-1MB per user per session

## Troubleshooting

### Audio Not Loading
1. Check that `AUDIO_BASE_URL` is correctly set
2. Verify files are accessible via HTTPS
3. Check browser console for network errors

### Slow Loading
1. Use a CDN with edge locations near your users
2. Enable gzip compression on your server
3. Consider using smaller audio files if needed

### Cache Issues
1. Users can clear cache by reinstalling the app
2. Cache is automatically managed by WeChat's storage system
3. No manual cache management required

## Security Notes

- Ensure your server allows cross-origin requests from WeChat domains
- Use HTTPS for all audio files
- Consider adding access control if needed
- Monitor bandwidth usage if using a paid CDN
