# Excel Column Splitter Extension

This Chrome extension allows you to split an Excel file (.xlsx) into multiple separate Excel files based on the unique values found in the first column. Each unique value in the first column will result in a new sheet within a new Excel file named after that value.

## Installation

1.  Download or clone this repository to your local machine.
2.  Open Google Chrome and navigate to `chrome://extensions/`.
3.  Enable "Developer mode" using the toggle switch in the top right corner.
4.  Click the "Load unpacked" button that appears.
5.  Select the directory where you downloaded or cloned the extension files.
6.  The extension should now be loaded and visible in your extensions list.

## Usage

1.  Click the extension icon (usually located next to the address bar) to open the popup.
2.  Click the "Choose File" button and select the Excel file (.xlsx) you want to process.
3.  The extension will process the file. Once complete, it will automatically download a ZIP file containing the split Excel files. Each file within the ZIP will be named according to the unique value from the first column of the original file.