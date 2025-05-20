# Troubleshooting Guide

## Common Issues and Solutions

### Malayalam Characters Not Displaying Properly

**Symptoms:**
- Malayalam text appears as boxes or question marks
- Incorrect characters are displayed

**Solutions:**
1. Ensure you have Malayalam language support installed on your operating system
2. Install a Malayalam Unicode font like Noto Sans Malayalam or Rachana
3. Try changing the font in Malayala Jalakam to a known good Malayalam font

### Application Crashes on Startup

**Symptoms:**
- Application closes immediately after opening
- Error message appears during startup

**Solutions:**
1. Try restarting your computer
2. Reinstall the application
3. Clear the application data:
   - Windows: `%APPDATA%/MalayalaJalakam`
   - macOS: `~/Library/Application Support/MalayalaJalakam`
   - Linux: `~/.config/MalayalaJalakam`

### Keyboard Layout Not Working

**Symptoms:**
- Typing produces incorrect Malayalam characters
- Some keys don't produce any output

**Solutions:**
1. Verify that the correct keyboard layout is selected in the application
2. Check if your system keyboard layout matches the one selected in the application
3. Restart the application

### Slow Performance

**Symptoms:**
- Typing is laggy
- Application freezes temporarily

**Solutions:**
1. Close other applications to free up system resources
2. Reduce the document size by saving and reopening it
3. Disable any unnecessary features or animations in the application settings

### File Won't Save

**Symptoms:**
- Error message when trying to save
- Changes aren't being saved

**Solutions:**
1. Check if you have write permissions for the destination folder
2. Try saving to a different location
3. Check if the file is read-only
4. Ensure there's enough disk space available

## Common Error Messages

### "File is in Use"
- The file is open in another application
- Close the file in other applications and try again

### "Insufficient Permissions"
- You don't have permission to save to the selected location
- Try saving to a different folder or run the application as administrator

### "File Format Not Supported"
- The file type you're trying to open isn't supported
- Try opening the file in its original application and save it in a compatible format

## Getting Help

If you're still experiencing issues:

1. Check the [FAQ](./faq.md) for additional solutions
2. Search for your issue on the [GitHub Issues](https://github.com/ameenvga/MJoffline/issues) page
3. If you can't find a solution, open a new issue with the following information:
   - Operating System and version
   - Malayala Jalakam version
   - Steps to reproduce the issue
   - Any error messages you received
   - Screenshots if applicable

## Reporting Bugs

To report a bug:
1. Go to the [GitHub Issues](https://github.com/ameenvga/MJoffline/issues) page
2. Click "New Issue"
3. Fill in the bug report template with as much detail as possible

## Known Issues

- On some Linux distributions, the application may require additional font packages
- Certain keyboard shortcuts may conflict with system shortcuts
- Large documents may experience performance issues
