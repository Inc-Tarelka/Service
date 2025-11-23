# CI/CD Workflows

This directory contains GitHub Actions workflows for automated building and deployment of the Tarelka app.

## Workflows

### 1. `android.yml` - Android CI/CD
Builds and deploys Android APK on every commit.

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main`

**Outputs:**
- Debug APK artifact
- Release APK artifact
- Automated GitHub Release (on main branch)

**Requirements:**
- None (uses GitHub-hosted runners)

---

### 2. `ios.yml` - iOS CI/CD
Builds iOS app framework and creates archives.

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main`

**Outputs:**
- iOS Framework (XCFramework)
- iOS Build artifacts
- Automated GitHub Release (on main branch)

**Requirements:**
- Update `iosApp/exportOptions.plist` with your Team ID
- Add signing certificates to GitHub Secrets (for production builds)

**GitHub Secrets needed for production:**
```
CERTIFICATES_P12: Base64 encoded .p12 certificate
CERTIFICATES_PASSWORD: Password for certificate
PROVISIONING_PROFILE: Base64 encoded provisioning profile
KEYCHAIN_PASSWORD: Temporary keychain password
```

---

### 3. `build-all.yml` - Multi-Platform Build
Comprehensive workflow that builds all platform targets.

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main`
- Excludes markdown and gitignore changes

**Jobs:**
1. **Android** - Builds Debug APK
2. **iOS** - Builds iOS Framework and Simulator app
3. **Desktop** - Builds JVM desktop application
4. **Web** - Builds JS and WebAssembly distributions
5. **Create Release** - Creates GitHub Release with all artifacts (main branch only)

**Outputs:**
- Android APK
- iOS Framework
- Desktop App (DMG/MSI/DEB)
- Web Distribution (JS/Wasm)

---

## Artifacts Retention

All artifacts are retained for:
- Debug builds: 14 days
- Release builds: 30 days

---

## Setup Instructions

### For Android:
No additional setup required. Workflows will work out of the box.

### For iOS:
1. Update `iosApp/exportOptions.plist`:
   - Replace `YOUR_TEAM_ID` with your Apple Developer Team ID
   - Replace `YOUR_PROVISIONING_PROFILE_NAME` with your profile name

2. For signed releases, add these secrets to your GitHub repository:
   ```bash
   # Export your certificate
   security find-identity -v -p codesigning
   
   # Create base64 encoded certificate
   base64 -i Certificates.p12 | pbcopy
   
   # Create base64 encoded provisioning profile
   base64 -i profile.mobileprovision | pbcopy
   ```

3. Add secrets in GitHub:
   - Go to Settings → Secrets and variables → Actions
   - Add the required secrets

### For Desktop:
Works out of the box. Customize distribution formats in `composeApp/build.gradle.kts`:
```kotlin
targetFormats(TargetFormat.Dmg, TargetFormat.Msi, TargetFormat.Deb)
```

---

## Customization

### Change trigger branches:
```yaml
on:
  push:
    branches: [ main, your-branch ]
```

### Add manual triggers:
```yaml
on:
  workflow_dispatch:
```

### Change artifact retention:
```yaml
- uses: actions/upload-artifact@v4
  with:
    retention-days: 7  # Change this value
```

---

## Troubleshooting

### iOS build fails
- Ensure Xcode version is compatible (using `latest-stable`)
- Check signing configuration
- Verify Team ID and provisioning profiles

### Android build fails
- Check JDK version (currently using 17)
- Verify Gradle wrapper permissions
- Review build logs for dependency issues

### Artifacts not uploading
- Check path specifications in workflow
- Ensure build actually produces output files
- Review GitHub Actions logs

---

## Monitoring

View workflow runs:
- Go to **Actions** tab in GitHub repository
- Click on specific workflow to see details
- Download artifacts from successful runs
- View logs for debugging failed runs

---

## Best Practices

1. **Test locally first**: Run `./gradlew build` before pushing
2. **Use draft releases**: Set `draft: true` for manual review
3. **Tag releases**: Use semantic versioning (v1.0.0)
4. **Secure secrets**: Never commit certificates or keys
5. **Monitor costs**: macOS runners are expensive, use sparingly

---

## Next Steps

Consider adding:
- Unit tests execution
- Code quality checks (ktlint, detekt)
- Firebase App Distribution
- TestFlight/Google Play deployment
- Slack/Discord notifications
- Coverage reports

