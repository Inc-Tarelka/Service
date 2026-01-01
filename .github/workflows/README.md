# CI/CD Workflows

This directory contains GitHub Actions workflows for automated building and deployment of the Tarelka app.

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

