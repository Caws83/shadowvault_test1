# Folder Rename Instructions

## Current vs New Name

**Current:** `MARSWAP_PLATFORM`  
**New:** `SHADOWVAULT_PROTOCOL` (or `SHADOWVAULT_PLATFORM`)

## When to Rename

✅ **After** you've tested the application locally and verified everything works  
✅ **Before** committing to version control (if using Git)  
✅ **Optional** - The folder name doesn't affect functionality

## How to Rename

### Windows (PowerShell)
```powershell
# Navigate to parent directory
cd ..

# Rename folder
Rename-Item -Path "MARSWAP_PLATFORM" -NewName "SHADOWVAULT_PROTOCOL"
```

### Mac/Linux
```bash
# Navigate to parent directory
cd ..

# Rename folder
mv MARSWAP_PLATFORM SHADOWVAULT_PROTOCOL
```

### Using File Explorer (Windows)
1. Right-click on `MARSWAP_PLATFORM` folder
2. Select "Rename"
3. Type `SHADOWVAULT_PROTOCOL`
4. Press Enter

### Using Finder (Mac)
1. Right-click on `MARSWAP_PLATFORM` folder
2. Select "Rename"
3. Type `SHADOWVAULT_PROTOCOL`
4. Press Enter

## After Renaming

1. ✅ Update your IDE/editor workspace path if needed
2. ✅ Update any shortcuts or aliases
3. ✅ Update any documentation that references the old path
4. ✅ Test that the app still runs: `cd FRONTEND/MAINDEX && npm run start`

## Note

The folder name is purely cosmetic - it doesn't affect:
- Code functionality
- Build process
- Dependencies
- Configuration files

You can rename it anytime, or keep the old name if you prefer.

