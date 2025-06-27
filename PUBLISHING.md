# Publishing Guide

## Prerequisites

1. **npm account**: Create account at https://www.npmjs.com/
2. **npm login**: Run `npm login` and enter your credentials
3. **Unique package name**: Verify `zephyr-scale-mcp-server` is available

## Publishing Steps

### 1. Verify Package Contents
```bash
npm pack --dry-run
```

This shows exactly what files will be included:
- ✅ `build/index.js` (compiled executable)
- ✅ `src/index.ts` (source code)
- ✅ `README.md` (documentation)
- ✅ `LICENSE` (MIT license)
- ✅ `package.json` (metadata)

### 2. Test Local Installation
```bash
# Test the package locally
npm pack
npm install -g ./zephyr-scale-mcp-server-1.0.0.tgz

# Test the command works
zephyr-scale-mcp --help
```

### 3. Publish to npm
```bash
# First time publishing
npm publish

# For updates (increment version first)
npm version patch  # or minor/major
npm publish
```

## Version Management

```bash
# Patch version (1.0.0 → 1.0.1)
npm version patch

# Minor version (1.0.0 → 1.1.0)
npm version minor

# Major version (1.0.0 → 2.0.0)
npm version major
```

## Pre-publish Checklist

- [ ] Code is tested and working
- [ ] README.md is complete and accurate
- [ ] Version number is appropriate
- [ ] LICENSE file exists
- [ ] Build folder is up to date (`npm run build`)
- [ ] All dependencies are correct
- [ ] Package name is unique on npm

## Post-publish

After publishing, users can install with:
```bash
npm install -g zephyr-scale-mcp-server
```

And use the command:
```bash
zephyr-scale-mcp
```

## Troubleshooting

### Package name taken
If `zephyr-scale-mcp-server` is taken, try:
- `@your-username/zephyr-scale-mcp-server`
- `zephyr-mcp-server`
- `zephyr-scale-mcp`

### Permission errors
```bash
npm login
# Re-enter credentials
```

### Build issues
```bash
npm run clean  # if you add this script
npm run build
