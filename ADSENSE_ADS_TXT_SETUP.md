# Ads.txt Implementation for Google AdSense

This document outlines the ads.txt implementation for Jurisight to enable Google AdSense approval.

## Publisher Information

- **Publisher ID**: `pub-5234388962916973`
- **Google Certification Authority ID**: `f08c47fec0942fa0`
- **Domain**: `jurisight.in`

## Files Created

### 1. `/public/ads.txt`
```
google.com, pub-5234388962916973, DIRECT, f08c47fec0942fa0
```

**Format Explanation:**
- `google.com` - The advertising system domain
- `pub-5234388962916973` - Your AdSense publisher ID
- `DIRECT` - Relationship type (DIRECT means you directly control this inventory)
- `f08c47fec0942fa0` - Google's certification authority ID

### 2. `/public/robots.txt` (Updated)
Added explicit allowance for ads.txt file:
```
Allow: /ads.txt
```

### 3. `/scripts/verify-ads-txt.js`
Verification script to test ads.txt accessibility and content validation.

## Implementation Steps

### ✅ Completed
1. Created ads.txt file with correct publisher ID
2. Updated robots.txt to allow ads.txt access
3. Created verification script
4. Documented implementation

### 🔄 Next Steps
1. **Deploy to Production**
   ```bash
   # Deploy your website to make ads.txt accessible at:
   # https://jurisight.in/ads.txt
   ```

2. **Verify Accessibility**
   ```bash
   # Run the verification script
   node scripts/verify-ads-txt.js
   
   # Or manually check:
   curl https://jurisight.in/ads.txt
   ```

3. **Google AdSense Submission**
   - Submit your website for AdSense approval
   - Google will automatically detect and validate your ads.txt file
   - Monitor your AdSense dashboard for ads.txt status

## Verification Checklist

- [ ] ads.txt file is accessible at `https://jurisight.in/ads.txt`
- [ ] File returns HTTP 200 status code
- [ ] Content-Type is `text/plain`
- [ ] File contains correct publisher ID: `pub-5234388962916973`
- [ ] File contains correct Google certification ID: `f08c47fec0942fa0`
- [ ] File format follows ads.txt specification
- [ ] robots.txt allows access to ads.txt
- [ ] No caching issues preventing Google from reading the file

## Testing Commands

### Local Testing
```bash
# Test local development server
curl http://localhost:3000/ads.txt

# Run verification script
node scripts/verify-ads-txt.js
```

### Production Testing
```bash
# Test production site
curl https://jurisight.in/ads.txt

# Check with different tools
curl -I https://jurisight.in/ads.txt  # Check headers
wget https://jurisight.in/ads.txt     # Download file
```

## Troubleshooting

### Common Issues

1. **404 Error**
   - Ensure ads.txt is in `/public/` directory
   - Check file permissions
   - Verify deployment includes the file

2. **Wrong Content-Type**
   - Ensure server serves .txt files with `text/plain`
   - Check server configuration

3. **Caching Issues**
   - Clear CDN cache if using one
   - Wait for cache expiration
   - Use cache-busting techniques

4. **Format Errors**
   - Ensure no extra spaces or characters
   - Verify comma separation
   - Check line endings (should be Unix-style)

### Validation Tools

- [Google Ads.txt Validator](https://support.google.com/adsense/answer/12171244)
- [Ads.txt Validator](https://www.ads.txt-validator.com/)
- [IAB Ads.txt Validator](https://iabtechlab.com/ads-txt/)

## Google AdSense Requirements

According to [Google's ads.txt guidance](https://support.google.com/adsense/answer/12171244):

1. **File Location**: Must be at root domain (`/ads.txt`)
2. **Accessibility**: Must be publicly accessible
3. **Format**: Must follow ads.txt specification
4. **Content**: Must contain valid publisher ID
5. **Certification**: Must include Google's certification authority ID

## Security Considerations

- ads.txt files are publicly readable
- Only include legitimate advertising partners
- Regularly audit and update the file
- Monitor for unauthorized additions
- Use HTTPS to serve the file

## Monitoring

After implementation, monitor:

1. **AdSense Dashboard**: Check ads.txt status
2. **Google Search Console**: Monitor for crawl errors
3. **Analytics**: Track ad performance
4. **Revenue**: Monitor AdSense earnings

## Support

For issues with ads.txt implementation:

1. Check Google AdSense Help Center
2. Review ads.txt specification
3. Use validation tools
4. Contact AdSense support if needed

---

**Last Updated**: December 2024  
**Status**: Ready for deployment and AdSense submission
